# Velox Proxima API Reference [Dev]

The Velox API allows you to integrate your AI models with external tools like WhatsApp, Discord, or Enterprise Dashboards.

### [NETWORK] Base URL
`http://localhost:8000`

### [DATA] 1. Uploading Datasets
**POST `/upload`**
-   **Content-Type**: `multipart/form-data`
-   **Body**: `file: [Your CSV/JSON]`
-   **Response**: `{"filename": "...", "path": "..."}`

### [CORE] 2. Starting a Job
**POST `/train`**
-   **Body**: 
    ```json
    { "source": "layer Dense (10)\ntrain on mnist...", "job_id": "test_001" }
    ```
-   **Response**: `{"job_id": "test_001", "status": "queued"}`

### [REGISTRY] 3. Model Zoo (History)
**GET `/runs`**
-   **Response**: Returns an array of every training run saved in the Zoo.

### [INFER] 4. Universal Predictor
**POST `/predict/{job_id}`**
-   **Body**: `{"features": [1.1, 2.2, ...]}`
-   **Response**: 
    ```json
    { "job_id": "test_001", "prediction": 0, "source": "Registry (Zoo)" }
    ```
-   **Note**: This endpoint auto-loads models from disk if they aren't in memory.

---
*v0.2.1 Proxima • Infrastructure Mastery*
