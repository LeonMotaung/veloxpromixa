import uuid
import threading
from typing import Dict, List, Optional
from fastapi import FastAPI, BackgroundTasks, HTTPException, UploadFile, File
from pydantic import BaseModel
from pathlib import Path
import json
import time

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


@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """Upload a data file to the data/ directory."""
    allowed = ('.csv', '.json', '.pt', '.pth', '.txt', '.npz')
    if not file.filename.lower().endswith(allowed):
        raise HTTPException(status_code=400, detail=f"File type not allowed. Use: {allowed}")

    
    upload_dir = Path("data")
    upload_dir.mkdir(exist_ok=True)
    
    file_path = upload_dir / file.filename
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
        
    return {"filename": file.filename, "path": str(file_path)}


def train_worker(job_id: str, source: str):
    """Background thread for training a VP model."""
    try:
        jobs[job_id]["status"] = "training"
        jobs[job_id]["results"] = {"history": []}
        
        def update_progress(epoch, loss, acc):
            jobs[job_id]["results"]["history"].append({
                "epoch": epoch,
                "loss": loss,
                "acc": acc
            })

        rt = VeloxRuntime(verbose=False)
        results = rt.run_source(source, callback=update_progress)
        
        jobs[job_id]["status"] = "completed"
        # Merge final results
        jobs[job_id]["results"].update({
            "test_accuracy": results.get("test_accuracy"),
            "total_time": results.get("total_time")
        })
        
        # If the model was saved, track it for predictions
        models[job_id] = results.get("model")
        
        # --- Persistent Registry (Zoo) ---
        run_data = {
            "job_id": job_id,
            "status": "completed",
            "source": jobs[job_id]["source"],
            "results": jobs[job_id]["results"],
            "timestamp": time.time()
        }
        Path("runs").mkdir(exist_ok=True)
        with open(f"runs/{job_id}.json", "w") as f:
            json.dump(run_data, f, indent=2)
        
        if results.get("model"):
            import torch
            Path("models").mkdir(exist_ok=True)
            torch.save(results["model"].state_dict(), f"models/{job_id}.pt")

    except Exception as e:
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)


@app.get("/api/runs")
async def list_runs():
    """List all past training jobs from the registry."""
    path = Path("runs")
    if not path.exists(): return []
    runs = []
    for f in path.glob("*.json"):
        try:
            with open(f, "r") as rfile:
                runs.append(json.load(rfile))
        except: continue
    return sorted(runs, key=lambda x: x.get('timestamp', 0), reverse=True)


@app.post("/api/train")
async def start_training(vp: VPSource):
    """Start a training job from VP source code."""
    job_id = vp.job_id or str(uuid.uuid4())[:8]
    if job_id in jobs:
        raise HTTPException(status_code=400, detail="Job ID already exists.")
    
    jobs[job_id] = {"status": "queued", "source": vp.source}
    
    thread = threading.Thread(target=train_worker, args=(job_id, vp.source))
    thread.start()
    
    return {"job_id": job_id, "status": "queued"}


@app.get("/api/train/{job_id}")
async def get_training_status(job_id: str):
    """Get the live status/results of a training job."""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found.")
    return jobs[job_id]


@app.post("/api/predict/{job_id}")
async def predict(job_id: str, features: List[float]):
    """Perform inference using a trained model (auto-loads from registry if needed)."""
    import torch
    global models
    
    # 1. Lazy-load model if not in memory
    if job_id not in models:
        try:
            # Load metadata
            with open(f"runs/{job_id}.json", "r") as f:
                run_data = json.load(f)
            
            # Compile architecture from original source
            rt = VeloxRuntime(verbose=False)
            results = rt.run_source(run_data["source"])
            model = results["model"]
            
            # Load weights
            model.load_state_dict(torch.load(f"models/{job_id}.pt"))
            models[job_id] = model
        except Exception as e:
            raise HTTPException(status_code=404, detail=f"Model not found or could not be re-instantiated: {e}")

    model = models[job_id]
    model.eval()
    
    try:
        x = torch.tensor([features], dtype=torch.float32)
        device = next(model.parameters()).device
        x = x.to(device)
        
        with torch.no_grad():
            out = model(x)
            prediction = out.argmax(dim=1).item() if out.shape[-1] > 1 else out.item()
            
        return {
            "job_id": job_id,
            "prediction": prediction,
            "raw_output": out.tolist(),
            "source": "Registry (Zoo)"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")


@app.get("/api/docs/all")
async def get_all_docs():
    import os
    docs = {}
    doc_dir = "docs"
    if os.path.exists(doc_dir):
        for f in os.listdir(doc_dir):
            if f.endswith(".md"):
                name = f.replace(".md", "")
                with open(os.path.join(doc_dir, f), "r", encoding="utf-8") as r:
                    docs[name] = r.read()
    return docs

@app.get("/api/docs/{name}")
async def get_docs(name: str):
    import os
    path = os.path.join("docs", f"{name}.md")
    if not os.path.exists(path):
        return {"error": "Not found"}
    with open(path, "r", encoding="utf-8") as f:
        return {"content": f.read()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)