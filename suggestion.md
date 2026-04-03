# Velox Proxima — Suggested Improvements

- **Metrics & Observability**
  - Instrument `/api/train` and `/api/predict` with request counts, latency, error rates; export Prometheus/JSON.
  - Persist per-epoch metrics to the runs JSON (loss, acc, time per epoch) and surface in the dashboard chart.
  - Track upload-to-train conversion and training success rate; add simple health endpoint for frontend.

- **Data & Training UX**
  - Validate CSV schema on upload; show inferred feature/target types and row counts before training.
  - Support train/validation split ratio in DSL (e.g., `eval on 0.2`) and stratified split for classification.
  - Allow class-balance summary and label distribution preview in UI.

- **DSL & Compiler**
  - Add `dropout p=0.3` and activation keywords (`relu`, `tanh`, `gelu`) as first-class DSL statements.
  - Support `optimizer sgd lr=0.01 momentum=0.9` with validation of numeric params.
  - Add a `save mymodel` directive that names artifacts and shows download link in the dashboard.
  - Provide better parser errors: echo offending line/snippet and hint expected tokens.

- **Execution Engine**
  - Add early stopping and learning-rate scheduling (step/cosine) configured via DSL.
  - Compute basic evaluation metrics automatically (accuracy/F1 for classification, RMSE/MAE for regression) and store in runs.
  - Use deterministic seeds and log them; expose device info (CPU/CUDA) in run metadata.

- **Frontend**
  - Upload feedback: progress bar, file size/type validation, and success toast.
  - Run list: filter by status, search by job_id, and show key metrics inline (loss, acc, time).
  - Prediction panel: auto-fill feature template derived from dataset schema; show softmax probabilities table.
  - Theme polish: loading skeletons for charts/tables; handle empty states gracefully.

- **APIs & Integrations**
  - Add `/api/runs/{job_id}/download` to fetch artifacts (model.pt, run.json).
  - Webhook/callback URL on train start/finish for automation.
  - Simple API key auth via environment variable for deployed environments.

- **Reliability & Ops**
  - Graceful job queue with status persistence (e.g., SQLite) so runs survive restarts.
  - Structured logging (JSON) with log levels; rotate logs under `logs/`.
  - Basic tests: unit tests for lexer/parser, integration test hitting `/api/train` with a tiny CSV.

- **Documentation**
  - Add quickstart notebook showing CSV → upload → train → predict round-trip.
  - Document DSL grammar with examples for classification, regression, and vision.
  - Provide troubleshooting guide: common parser errors, CSV formatting issues, missing deps.
