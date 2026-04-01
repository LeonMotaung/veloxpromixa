# Velox Proxima (VP)

> A high-level declarative language and runtime system for machine learning.

```
layer Dense (128)
layer Dense (?)
layer Dense (64)
train on mnist
```

That's all you need to train a neural network. No PyTorch boilerplate, no tensor shapes, no device configuration.

---

## Architecture

| Layer | Component | Description |
|-------|-----------|-------------|
| 1 | **Syntax Layer** | Lexer + Parser → AST |
| 2 | **Compiler Layer** | AST → Computational Graph G=(V, E) |
| 3 | **Optimization Layer** | Operator fusion, memory opt, Leon Identity LR scheduling |
| 4 | **Execution Engine** | PyTorch model training on CPU/GPU/MPS |
| 5 | **Infrastructure Layer** | Cluster management, auto-scaling, fault tolerance |

---

## Quick Start

### Install
```bash
pip install torch torchvision
pip install -e .
```

### Write a `.vp` file
```
# my_model.vp
layer Dense (256)
layer Dense (?)        # <-- auto-inferred dimension
layer Dense (64)
train on mnist
optimizer adam lr=0.001
epochs 10
batch_size 32
```

### Run
```bash
python vp.py run examples/mnist_dense.vp
# or with CLI overrides:
python vp.py run examples/mnist_dense.vp --epochs 20 --lr 0.0005
```

### Inspect
```bash
python vp.py parse   examples/mnist_dense.vp    # print AST
python vp.py compile examples/mnist_dense.vp    # print optimised graph
python vp.py version
```

---

## VP Language Reference

### Layers
```
layer Dense (units)          # Fully-connected layer
layer Dense (?)              # Auto-infer dimension
layer Dropout (rate)         # Dropout regularization
layer BatchNorm ()           # Batch normalization
layer LSTM (hidden_size)     # Recurrent layer
layer Conv2D (filters, size) # Convolutional layer
layer ReLU ()                # Activation (standalone)
layer Sigmoid ()
layer Tanh ()
```

### Training Config
```
train on <dataset>           # mnist | cifar10 | iris | fashion_mnist
optimizer <name> lr=<f>      # adam | sgd | rmsprop | adagrad
epochs <n>
batch_size <n>
loss <name>                  # cross_entropy | mse | bce
```

### Shape Inference Operator `?`
When `?` is used, VP automatically computes the optimal layer dimension
using the **geometric mean** of the preceding and succeeding known dimensions,
snapped to the nearest power of 2.

```
layer Dense (512)      # in=784, out=512
layer Dense (?)        # inferred: geometric_mean(512, 64) ≈ 181 → 128
layer Dense (64)
```

---

## Leon Identity Stabilization

VP uses the **Leon Identity** formula to compute a stable learning rate schedule:

```
P_{t+1} = P_t + γ · (1 - 1/ESI) · (P_∞ - P_t) + ε_t
```

This prevents training divergence and smoothly decays the LR toward equilibrium.

---

## Examples

| File | Dataset | Description |
|------|---------|-------------|
| `examples/mnist_dense.vp` | MNIST | 3-layer dense with shape inference |
| `examples/iris.vp` | Iris | Tiny classifier, SGD optimizer |
| `examples/cifar10.vp` | CIFAR-10 | Deep network with Dropout |

---

## Python API

```python
from velox.runtime import VeloxRuntime

rt = VeloxRuntime()
results = rt.run_source("""
    layer Dense (128)
    layer Dense (?)
    layer Dense (64)
    train on mnist
    epochs 5
""")

print(results["test_accuracy"])
print(results["history"])       # per-epoch loss/acc
print(results["graph"].summary())
```
