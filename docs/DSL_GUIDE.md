# Velox Proxima DSL Syntax Guide [Guide]

The Velox DSL is designed for **total neural clarity**. No more manual shape management, no more boilerplate.

### [REFERENCE] Directives Reference

| Directive | Syntax | Effect |
| :--- | :--- | :--- |
| `layer` | `layer [Type] ([Params])` | Appends a layer to the computational graph. |
| `train on` | `train on [Dataset]` | Loads a dataset. Supports `mnist`, `fashion_mnist`, `cifar10`, `iris`, `housing`, or a file path like `data/mydata.csv`. |
| `optimizer` | `optimizer [Name] lr=[Value]` | Selects an optimizer (Adam, SGD, RMSprop, Adagrad) and sets the Learning Rate. |
| `epochs` | `epochs [Number]` | Number of training iterations. |
| `batch_size`| `batch_size [Number]`| Size of each training batch. |
| `loss` | `loss [Name]` | Criterion function (cross_entropy, mse, bce, l1). |

---

### [REFERENCE] Layer Reference

#### 1. Convolutional Layer
*   `layer Conv2D (filters, kernel_size)`
*   *Example*: `layer Conv2D (64, 3)` creates 64 filters of 3x3 size.

#### 2. MaxPool Layer
*   `layer MaxPool2D (pool_size)`
*   *Example*: `layer MaxPool2D (2)` reduces spatial dimensions by 50%.

#### 3. Attention Layer (God-Tier)
*   `layer Attention (heads, embed_dim)`
*   *Example*: `layer Attention (8, ?)` creates an 8-head multi-head attention block with automatic embedding detection.

#### 4. Recurrent Layer
*   `layer LSTM (hidden_size)`
*   *Example*: `layer LSTM (128)` creates a sequence-aware memory block.

---

### [PRO TIP] Symbolic "?" Injection
You can use `?` in any layer where the dimension is hard to calculate. For example, after an `Attention` layer, you can use:
```vp
layer Dense (?)
```
The Velox Compiler (L2) will automatically solve the geometry of your model grid for you.

---
*v0.2.1 Proxima • Zero-Boilerplate Intelligence*
