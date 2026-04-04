# 🚀 Velox Proxima (VP)

**Compile-time safe machine learning.**

Write ML models with 5x less code, eliminate tensor shape errors, and deploy faster with a compiler-driven pipeline.

---

## ⚡ Why Velox Proxima?

Modern ML development is powerful — but fragile. With frameworks like PyTorch and TensorFlow, developers often encounter:

*   ❌ **Runtime tensor shape errors** (often after hours of training)
*   ❌ **Complex, verbose model code** (boilerplate overhead)
*   ❌ **The "Silent Fail" problem** (shape mismatches that don't crash but ruin training)
*   ❌ **Manual architecture tuning** (guessing hidden layer sizes)

**Velox Proxima solves this at compile time.**

## ✅ What You Get

*   🧠 **Compile-time shape validation** — no runtime surprises.
*   ⚡ **Automatic architecture inference (?)** — use the Leon Identity (geometric mean) to auto-fill layer dimensions.
*   🔧 **Graph-level optimizations** — operator fusion (e.g. Linear + ReLU) and no-op elimination.
*   📦 **High-Fidelity DSL** — a declarative syntax that strips away 90% of structural MLOps boilerplate.
*   🌍 **Edge-ready export pipeline** — Native support for ONNX, TFLite, and WASM.

## 🔥 Quick Example

```vp
# model.vp
layer Dense (128)
layer ReLU ()
layer Dense (?)
layer Dense (10)
layer Softmax ()

train on "mnist"
optimizer adamw lr=0.001
epochs 5
```

### 🔹 Compiler Output

```text
[VP Compiler] Starting compilation…
[VP Compiler] Dataset = 'mnist'
[VP Compiler] Built node 0: Dense → TensorShape(64, 784)
[VP Compiler] Layer 2 (Dense) ← inferred dim = 32 (geometric mean of 128 and 10)
[VP Optimizer] ⚡ Performance Hint — Dense(10): consider 8 for kernel efficiency
[VP Optimizer] Fused Dense+Softmax → node 606e9bb3 (activation=softmax)
[VP Compiler] Compilation SUCCESSFUL ✓
```

## 🚀 Quick Start

### Option 1: Run with Docker (Recommended)
```bash
git clone https://github.com/LeonMotaung/velox
cd velox
docker-compose up
```

### Option 2: Local Install
```bash
pip install -e .
velox run examples/mnist.vp
```

## 🧠 How It Works

Velox Proxima is built as a modular compiler pipeline inspired by systems like LLVM.

**DSL → AST → Graph IR → Optimization → Execution**

1.  **DSL Parser**: Converts `.vp` blueprints into an Abstract Syntax Tree (AST).
2.  **Graph Builder**: Lowers the AST into the **ComputationalGraph IR**.
3.  **Shape Inference Engine**: Resolves unknown dimensions (`?`) and propagates rank-4 tensors.
4.  **Validation Pass**: Enforces strict compile-time checks (no silent fallbacks).
5.  **Optimizer**: Fuses operators and applies performance hints.
6.  **Execution Engine**: Routes the optimized graph to the PyTorch-based training worker.

## 🧱 Core Features

### 🧠 TensorShape System
A production-grade shape system supporting:
*   **Dense**: `(batch, features)`
*   **Conv2D**: `(batch, channels, height, width)`
*   **LSTM**: `(batch, seq_len, hidden)`
*   **Attention**: `(batch, seq_len, dim)`
*   **Symbolic Dims**: Supports `N`, `D`, `T` placeholders for dynamic resizing.

### ⚡ Constraint-Based Inference
Unknown dimensions (`?`) are automatically resolved using:
*   Forward/Backward shape propagation.
*   **The Leon Identity**: Geometric mean snapped to power-of-2 for optimal hardware utilization.

### 🔍 Strict Validation
Errors are caught before a single tensor is allocated:
*   ❌ `ShapeMismatchError`: Layer 3 expected `(64, 128)` but got `(64, 32)`.
*   ❌ `InvalidLayerOrderError`: Missing `Flatten()` between Conv2D and Dense.
*   ❌ `MissingParameterError`: Required kernel size absent.

## 📊 Performance & Optimization
*   **Operator Fusion**: Automatically fuses Linear/Conv nodes with Activations.
*   **Memory Efficiency**: Graph pruning eliminates dead-end nodes.
*   **Structured Logging**: Detailed shape tracing per layer in `DEBUG` mode.

## 🖥 CLI Usage
```bash
# Compile and print architectural summary
velox compile model.vp

# Compile and start local training
velox run model.vp

# Validate model syntax and shapes (dry-run)
velox lint model.vp

# Render architecture as a PDF/PNG (requires Graphviz)
velox visualize model.vp --output model.png
```

## 📂 Project Structure
```text
velox/
├── compiler/       # Compiler IR, Shapes, & Logic
├── dsl/            # Lexer, Parser, & AST
├── engine/         # Training & Execution (PyTorch)
├── infrastructure/ # Deployment & Orchestration
├── optimizer/      # Graph fusion & Optimization
├── __main__.py     # CLI Entry Point
└── requirements.txt
examples/           # Sample .vp blueprints
frontend/           # React dashboard for visual monitoring
```

## 🛣 Roadmap
- [x] Full Compiler + Shape System
- [X] Constraint-based inference
- [X] Operator Fusion (IR level)
- [X] Developer CLI
- [ ] Direct C++ / CUDA Export
- [ ] Full ONNX/TFLite Backend
- [ ] Multi-GPU Partitioning

## 🤝 Contributing
Join us in building the future of safe machine learning. 
*   **Star** the repo to show support.
*   **Contribute** new layer types to the IR.
*   **Feedback** is always welcome via Issues.

## 📜 License
Licensed under the Apache 2.0 License.

---
Built by **DeWet Technologies** | Metacognitive Infrastructure for the AI Era.
