# GEMINI PHASE 3: SaaS & Cloud Infrastructure

Velox Proxima is no longer just a standalone tool—it is now a full **AI serving platform**.

### 🌐 The REST API Layer (`api.py`)
Built on **FastAPI**, this layer exposes the runtime through high-performance HTTP endpoints.

| Endpoint | Method | Function |
| :--- | :--- | :--- |
| `/upload` | `POST` | Universal file receiver for datasets, weights, and configs. |
| `/train` | `POST` | Asynchronous training worker. Returns a Job ID instantly. |
| `/train/{id}` | `GET` | Real-time streaming status. Used by the Dashboard for live charts. |
| `/predict/{id}` | `POST` | **Production Inferer**. Submit raw features, get back the labels. |

### 🏙️ The Dashboard (`frontend/`)
A premium, browser-based command center:
*   **Vite + React** architecture for maximum speed.
*   **Glow-Panel UI**: Dark mode visuals with real-time SVG charting.
*   **Prototyping Sandbox**: A place to test inference immediately after training.
*   **Modular Blueprint Editor**: Full control over your models without leaving the web.

### 🏛️ Operational Infrastructure
*   **AMP (Automatic Mixed Precision)**: Maximizes output on 2GB VRAM hardware.
*   **Unified Requirements**: One-line environment setup (`pip install -r requirements.txt`).
*   **CORS Ready**: Configured to work on cloud clusters.

---
*Created for Leon Motaung | v0.2.0*
