# Velox Proxima - Core Engine & ML Architecture
**Assignee:** Leon Motaung (Lead Architect)

## 1. DSL & Compiler Development
*   **Activation Keywords:** Implement native DSL support for `dropout p=0.3` and activation functions like `relu`, `tanh`, and `gelu`.
*   **Optimizer Tuning:** Extend the parser to gracefully handle hyperparameter declarations, such as `optimizer sgd lr=0.01 momentum=0.9`. Ensure robust validation of numeric parameters.
*   **Custom Directives:** Add a `save [model_name]` directive within the DSL to label artifacts distinctly, aiding automated linking in the dashboard.
*   **Error Handling:** Refine parser error mechanisms to echo the offending line/snippet to the user and hint at expected tokens to improve developer experience.

## 2. Execution Engine Upgrades
*   **Advanced Control Flow:** Implement early stopping based on validation loss, and introduce learning-rate scheduling (e.g., step variations or cosine annealing) configurable via the DSL.
*   **Evaluation Metrics:** Automatically compute basic evaluation metrics (accuracy / F1 score for classification, RMSE / MAE for regression) and persist these in the runtime data.
*   **Determinism:** Introduce deterministic seeding capabilities. Ensure seeds are captured and logged alongside device constraints (CPU/CUDA) in run metadata.
*   **Train/Validation Split:** Formally introduce the split ratio in DSL syntax (e.g., `eval on 0.2`) allowing transparent evaluation. Add stratified split capabilities where applicable.
