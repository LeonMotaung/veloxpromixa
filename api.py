import uuid
import threading
import os
from typing import Dict, List, Optional
from fastapi import FastAPI, BackgroundTasks, HTTPException, UploadFile, File, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse, JSONResponse
import stripe
from pydantic import BaseModel
from pathlib import Path
import json
import time
from openai import OpenAI

from velox.runtime import VeloxRuntime

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Velox Proxima API — Model Serving & Training")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, you've to restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Global state for training jobs and loaded models
jobs: Dict[str, dict] = {}
models: Dict[str, dict] = {}


def _load_env_file():
    """
    Minimal .env loader (no external dependency).
    Looks for a .env file in the project root and injects vars if not already set.
    """
    env_path = Path(".env")
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, val = line.split("=", 1)
        key = key.strip()
        val = val.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = val


_load_env_file()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

# Rehydrate past runs into memory (status only) so endpoints remain useful after restart.
def _rehydrate_jobs():
    runs_dir = Path("runs")
    if not runs_dir.exists():
        return
    for f in runs_dir.glob("*.json"):
        try:
            with open(f, "r") as rfile:
                data = json.load(rfile)
                jobs[data["job_id"]] = {
                    "status": data.get("status", "completed"),
                    "source": data.get("source", ""),
                    "results": data.get("results", {})
                }
        except Exception:
            continue

_rehydrate_jobs()


class VPSource(BaseModel):
    source: str
    job_id: Optional[str] = None


class ChatRequest(BaseModel):
    prompt: str
    model: str = "gpt-4o-mini"
    temperature: float = 0.3
    max_tokens: int = 400


@app.get("/")
def read_root():
    return {
        "status": "online",
        "engine": "Velox Proxima v0.1.0",
        "message": "Declarative AI Engine Serving Layer active."
    }

@app.post("/api/chatgpt")
async def chatgpt(req: ChatRequest):
    if not openai_client:
        raise HTTPException(status_code=400, detail="OPENAI_API_KEY not set on server")
    try:
        resp = openai_client.chat.completions.create(
            model=req.model,
            messages=[{"role": "user", "content": req.prompt}],
            temperature=req.temperature,
            max_tokens=req.max_tokens,
            stream=False,
        )
        reply = resp.choices[0].message.content
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """Upload a data file to the data/ directory and return a quick schema summary."""
    allowed = ('.csv', '.json', '.pt', '.pth', '.txt', '.npz')
    if not file.filename.lower().endswith(allowed):
        raise HTTPException(status_code=400, detail=f"File type not allowed. Use: {allowed}")

    
    upload_dir = Path("data")
    upload_dir.mkdir(exist_ok=True)
    
    file_path = upload_dir / file.filename
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    summary = {"rows": None, "columns": [], "target": None, "numeric_features": 0, "non_numeric_features": 0}

    # [INDUSTRIAL SIEVE] Pre-clean data at the Edge before saving to Vault
    if file_path.suffix.lower() == '.csv':
        try:
            import pandas as pd
            import numpy as np
            # Read fresh upload
            df = pd.read_csv(file_path)
            
            # 1. Clean Headers
            df.columns = df.columns.str.strip()
            
            # 2. Isolate Target Space
            target_col = df.columns[-1]
            target_data = df[target_col]
            X_df = df.drop(columns=[target_col])
            
            # 3. Numeric Sieve: Fill missing with Median
            numeric_cols = X_df.select_dtypes(include=[np.number]).columns
            if not numeric_cols.empty:
                X_df[numeric_cols] = X_df[numeric_cols].fillna(X_df[numeric_cols].median())
            
            # 4. Syntactic Sieve: Encode remaining categorical features & fill blanks
            cat_cols = X_df.select_dtypes(exclude=[np.number]).columns
            for c in cat_cols:
                X_df[c] = X_df[c].fillna(X_df[c].mode()[0] if not X_df[c].mode().empty else 'Unknown')
                # Autonomously convert strings to integers for neural compatibility
                X_df[c] = X_df[c].astype('category').cat.codes
                
            # 5. Reconstruct Graph Matrix
            df_clean = pd.concat([X_df, target_data], axis=1).dropna(subset=[target_col])

            summary["rows"] = len(df_clean)
            summary["columns"] = list(df_clean.columns)
            summary["target"] = target_col
            summary["numeric_features"] = len(X_df.columns)
            summary["non_numeric_features"] = len(cat_cols)

            # Overwrite original upload with the Densified Matrix
            df_clean.to_csv(file_path, index=False)
            print(f"[VP] Sieve Complete: {file.filename} normalized to dense numeric matrix.")
        except Exception as e:
            print(f"[VP] Vault Upload Cleaning Warn: {e}")
        
    return {"filename": file.filename, "path": str(file_path), "summary": summary}


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
        # Merge final results including serialized Graph IR
        graph_data = results.get("graph").serialize() if results.get("graph") else None
        jobs[job_id]["results"].update({
            "test_accuracy": results.get("test_accuracy"),
            "test_rmse": results.get("test_rmse"),
            "test_mae": results.get("test_mae"),
            "total_time": results.get("total_time"),
            "graph_ir": graph_data
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
        import traceback
        traceback.print_exc()


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


@app.get("/api/runs/{job_id}/download")
async def download_run(job_id: str, artifact: str = "run"):
    """
    Download run artifacts:
      - artifact=run  -> runs/{job_id}.json
      - artifact=model -> models/{job_id}.pt
    """
    if artifact not in ("run", "model"):
        raise HTTPException(status_code=400, detail="artifact must be 'run' or 'model'")

    base = Path("runs" if artifact == "run" else "models")
    ext = ".json" if artifact == "run" else ".pt"
    path = base / f"{job_id}{ext}"
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"{artifact} not found for job {job_id}")
    media_type = "application/json" if artifact == "run" else "application/octet-stream"
    return FileResponse(path, media_type=media_type, filename=path.name)


@app.get("/api/datasets")
async def list_datasets():
    """List available datasets (CSV files) under data/ with quick schema metadata."""
    data_dir = Path("data")
    if not data_dir.exists():
        return []

    datasets = []
    for f in data_dir.glob("*.csv"):
        meta = {
            "rows": None,
            "num_features": None,
            "target_type": None,
            "num_classes": None,
        }
        try:
            import pandas as pd
            import numpy as np
            df = pd.read_csv(f, nrows=500)  # quick peek
            if not df.empty:
                target_col = df.columns[-1]
                X_df = df.drop(columns=[target_col]).select_dtypes(include=[np.number])
                meta["rows"] = len(df)
                meta["num_features"] = len(X_df.columns)
                target = df[target_col]
                is_numeric = np.issubdtype(target.dtype, np.number)
                is_regr = is_numeric and not np.all(target == target.astype(int))
                if is_regr:
                    meta["target_type"] = "regression"
                    meta["num_classes"] = 1
                else:
                    meta["target_type"] = "classification"
                    meta["num_classes"] = int(target.nunique())
        except Exception:
            meta["target_type"] = "unknown"

        datasets.append({
            "name": f.name,
            "size": f.stat().st_size,
            "modified": f.stat().st_mtime,
            **meta
        })
    return sorted(datasets, key=lambda x: x["name"])


@app.post("/api/train")
async def start_training(vp: VPSource, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Start a training job from VP source code."""
    if credentials.credentials != os.getenv("API_KEY", "proxima-key-2026"):
        raise HTTPException(status_code=401, detail="Invalid authorization token")
        
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
async def predict(job_id: str, features: List[float], credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Perform inference using a trained model (auto-loads from registry if needed)."""
    if credentials.credentials != os.getenv("API_KEY", "proxima-key-2026"):
        raise HTTPException(status_code=401, detail="Invalid authorization token")
        
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

@app.post("/api/deploy/{job_id}")
async def deploy(job_id: str):
    """
    Provide an instant deploy descriptor for a trained model.
    This surfaces the predict endpoint, method, and example cURL so users can ship fast.
    """
    run_path = Path(f"runs/{job_id}.json")
    if job_id not in jobs and not run_path.exists():
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found. Train a model first.")

    predict_url = f"/api/predict/{job_id}"
    example_curl = f'''curl -X POST http://localhost:8000{predict_url} \\
  -H "Content-Type: application/json" \\
  -d "[0.1, 0.2, 0.3]"'''
    return {
        "job_id": job_id,
        "endpoint": predict_url,
        "method": "POST",
        "body": "[<feature1>, <feature2>, ...]",
        "example_curl": example_curl,
        "notes": "Send a JSON array of numeric features. No auth applied; front a gateway for prod.",
        "run_exists": run_path.exists(),
        "model_exists": Path(f'models/{job_id}.pt').exists()
    }

@app.get("/api/health/{job_id}")
async def health(job_id: str):
    """
    Lightweight health/meta check for a trained job.
    Returns status and whether model artifacts exist.
    """
    run_path = Path(f"runs/{job_id}.json")
    model_path = Path(f"models/{job_id}.pt")
    status = jobs.get(job_id, {}).get("status", "unknown")
    if status == "unknown" and run_path.exists():
        status = "completed"
    return {
        "job_id": job_id,
        "status": status,
        "run_exists": run_path.exists(),
        "model_exists": model_path.exists()
    }


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

@app.post("/api/subscribe")
async def create_subscription(plan: str, token: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Stripe integration setup for premium tiers."""
    if credentials.credentials != os.getenv("API_KEY", "proxima-key-2026"):
        raise HTTPException(status_code=401, detail="Invalid authorization token")
        
    if not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe configuration missing on server")
        
    try:
        customer = stripe.Customer.create(source=token, email="subscriber@velox.local")
        subscription = stripe.Subscription.create(
            customer=customer.id,
            items=[{"plan": plan}],
        )
        return {"status": "success", "subscription_id": subscription.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
