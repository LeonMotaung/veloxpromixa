import uuid
import threading
from typing import Dict, List, Optional
from fastapi import FastAPI, BackgroundTasks, HTTPException, UploadFile, File
from pydantic import BaseModel
from pathlib import Path

from velox.runtime import VeloxRuntime

app = FastAPI(title="Velox Proxima API — Model Serving & Training")

# Global state for training jobs and loaded models
jobs: Dict[str, dict] = {}
models: Dict[str, dict] = {}


class VPSource(BaseModel):
    source: str
    job_id: Optional[str] = None


@app.get("/")
def read_root():
    return {
        "status": "online",
        "engine": "Velox Proxima v0.1.0",
        "message": "Declarative AI Engine Serving Layer active."
    }


def train_worker(job_id: str, source: str):
    """Background thread for training a VP model."""
    try:
        jobs[job_id]["status"] = "training"
        rt = VeloxRuntime(verbose=False)
        results = rt.run_source(source)
        
        jobs[job_id]["status"] = "completed"
        jobs[job_id]["results"] = {
            "test_accuracy": results.get("test_accuracy"),
            "total_time": results.get("total_time"),
            "history": results.get("history")
        }
        
        # If the model was saved, track it for predictions
        # Note: In a production system, we'd load the weight file here.
        # For now, we store the in-memory model object.
        models[job_id] = results.get("model")
        
    except Exception as e:
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)


@app.post("/train")
async def start_training(vp: VPSource):
    """Start a training job from VP source code."""
    job_id = vp.job_id or str(uuid.uuid4())[:8]
    if job_id in jobs:
        raise HTTPException(status_code=400, detail="Job ID already exists.")
    
    jobs[job_id] = {"status": "queued", "source": vp.source}
    
    thread = threading.Thread(target=train_worker, args=(job_id, vp.source))
    thread.start()
    
    return {"job_id": job_id, "status": "queued"}


@app.get("/train/{job_id}")
async def get_training_status(job_id: str):
    """Get the live status/results of a training job."""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found.")
    return jobs[job_id]


@app.post("/predict/{job_id}")
async def predict(job_id: str, features: List[float]):
    """Perform inference using a trained model."""
    if job_id not in models:
        raise HTTPException(status_code=404, detail="Model not loaded or job not completed.")
    
    import torch
    model = models[job_id]
    model.eval()
    
    try:
        x = torch.tensor([features], dtype=torch.float32)
        # Handle device if GPU available
        device = next(model.parameters()).device
        x = x.to(device)
        
        with torch.no_grad():
            out = model(x)
            prediction = out.argmax(dim=1).item() if out.shape[-1] > 1 else out.item()
            
        return {
            "job_id": job_id,
            "prediction": prediction,
            "raw_output": out.tolist()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
