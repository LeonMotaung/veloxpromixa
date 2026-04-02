# GEMINI PHASE 2: Core Capabilities & Language

Velox Proxima allows you to define complex neural networks in a language that reads like a recipe.

### 🧠 Supported Layer Types
*   **Conv2D**: High-performance spatial feature extraction with automatic shape inference.
*   **MaxPool2D**: Downsampling for translation-invariant vision features.
*   **BatchNorm**: Normalization layers that stabilize deep gradients.
*   **Dropout**: Neural regularization to prevent overfitting.
*   **Dense**: Traditional fully-connected layers.
*   **Attention**: Multi-head sequence awareness for Transformer-style models.
*   **Activation**: Sigmoid, Tanh, Softmax, and ReLU.

### 📦 Dataset Sieve
Support for on-the-fly training without manual data loading:
*   `mnist`, `fashion_mnist`, `cifar10` (Vision presets)
*   `iris`, `housing` (Traditional ML presets)
*   `*.csv` (Custom user-uploaded datasets — **Universal Sieve**)

### 📈 Smart Directives
*   `plot live`: Streams real-time convergence data to the Dashboard.
*   `eval on test`: Performs high-precision validation on separate data holdouts.
*   `save model.pt`: One-line persistence of model weights.

---
*Created for Leon Motaung | v0.2.0*
