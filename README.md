<div align="center">
  <img src="frontend/public/images/onblack.png" alt="Velox Proxima Logo" width="120" />
  <h1>⚡ VELOX PROXIMA ⚡</h1>
  <p><b>The High-Performance AI Declarative Engine & Inference Hub</b></p>
  <p><i>Standardizing neural geometry for the next generation of edge-native agents.</i></p>
</div>

---

## [SYSTEM] The Core Philosophy [SYSTEM]

Velox Proxima (VP) is a zero-boilerplate, industrial-grade AI ecosystem. It replaces thousands of lines of manual PyTorch/TensorFlow code with a single, high-fidelity **Declarative Blueprint**. By solving neural geometry at the compiler level (L2), Velox ensures that your architectures are mathematically optimal and ready for production inference in milliseconds.

---

## [INFRA] Key Features [INFRA]

*   **Declarative DSL**: Write human-readable `.vp` Blueprints. No manual shape tracking or dimension management required.
*   **Universal Sieve**: Seamlessly train on any dataset (MNIST, CIFAR, CSV, or custom JSON) with auto-normalization.
*   **Persistent Model Zoo**: Every training run is automatically versioned, weight-serialized, and stored in the Registry for instant recall.
*   **Dual-Theme Dashboard**: A premium React monitoring hub with real-time convergence streaming and one-click inference.
*   **Deterministic Compiler**: Built-in symbolic shape inference (?) that automatically solves your network grid geometry.

---

## [DEPLOY] Installation & Quick Start [DEPLOY]

### 1. One-Liner (Universal Installer)
Run this command in your terminal to install the engine, its dependencies, and the dashboard ecosystem:
```powershell
powershell -c "irm https://veloxproxima.ai/install.ps1 | iex"
```

### 2. Manual Environment Setup
```bash
git clone https://github.com/LeonMotaung/veloxpromixa
pip install -r requirements.txt
```

### 3. Launch the Hub
```bash
# Start the Inference API
python api.py

# Launch the Dashboard (Port 3004)
cd frontend && npm run dev
```

---

## [GUIDE] The Velox Blueprint Language [GUIDE]

Example of a SOTA Transformer-Vision model in Velox DSL:
```vp
# High-precision vision blueprint
layer Conv2D (64, 3)     # 64 filters, 3x3 kernel
layer MaxPool2D (2)      # Downsampling logic
layer BatchNorm ()       # Stability normalization
layer Attention (8, ?)   # 8-head symbolic attention
layer Dense (10)         # 10-class output head

train on cifar10         # Automatic dataset fetch
optimizer adam lr=0.001  # Leon Identity optimization
epochs 10                # Training depth
loss cross_entropy       # Objective function
```

---

## [STRUCTURE] The 5-Layer Pipeline [STRUCTURE]

1.  **L1: Lexical Layer** - Tokenization of the Velox DSL.
2.  **L2: Compiler Layer** - Symbolic shape solving and graph construction.
3.  **L3: Optimization Layer** - Weight initialization and Leon Identity stabilization.
4.  **L4: Execution Layer** - High-speed PyTorch backend with AMP support.
5.  **L5: Interface Layer** - FastAPI REST Server + React Proxima Dashboard.

---

## [TRUST] Contributors & Project Info [TRUST]

*   **Lead Architect**: Leon Motaung
*   **Status**: v0.2.1 Proxima Stable
*   **Affiliation**: Independent Project (Privacy-First)

*Formerly known as Proxima. Developed with soul for the global AI community.*
