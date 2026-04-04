"""
Velox Proxima (VP) — Type System
Layer 2: Compiler Layer

Defines the unified tensor shape system used across the entire compiler.
Replaces all loose in_features / out_features scalar usages with
structured TensorShape objects, supporting symbolic and concrete dims.
"""

from __future__ import annotations
import math
from typing import Tuple, Optional, Union


# ── Symbolic dimension sentinel ─────────────────────────────────────────────

class Symbolic:
    """Represents an unknown / symbolic tensor dimension (e.g. N, D)."""

    def __init__(self, name: str):
        self.name = name

    def __repr__(self) -> str:
        return self.name

    def __eq__(self, other: object) -> bool:
        return isinstance(other, Symbolic) and self.name == other.name

    def __hash__(self):
        return hash(("__symbolic__", self.name))


# ── TensorShape ──────────────────────────────────────────────────────────────

Dim = Union[int, Symbolic]


class TensorShape:
    """
    A production-grade tensor shape descriptor.

    Supports:
      - Concrete shapes:  TensorShape((batch, features))
      - Symbolic shapes:  TensorShape((Symbolic('N'), Symbolic('D')))
      - Mixed:            TensorShape((32, Symbolic('D'), 512))

    Examples by layer type:
      Dense          : (batch, features)
      Conv2D         : (batch, channels, height, width)
      LSTM           : (batch, seq_len, hidden_size)
      Attention      : (batch, seq_len, dim)
    """

    def __init__(self, dims: Tuple[Dim, ...], symbolic: bool = False):
        if not isinstance(dims, tuple):
            raise TypeError(f"TensorShape dims must be a tuple, got {type(dims).__name__}")
        self.dims = dims
        self.symbolic = symbolic or any(isinstance(d, Symbolic) for d in dims)

    # ── Rank helpers ────────────────────────────────────────────────────────

    @property
    def rank(self) -> int:
        return len(self.dims)

    @property
    def is_fully_concrete(self) -> bool:
        return all(isinstance(d, int) for d in self.dims)

    def __getitem__(self, idx: int) -> Dim:
        return self.dims[idx]

    def __len__(self) -> int:
        return len(self.dims)

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, TensorShape):
            return False
        return self.dims == other.dims

    def __repr__(self) -> str:
        inner = ", ".join(str(d) for d in self.dims)
        return f"TensorShape({inner})"

    # ── Factory helpers ──────────────────────────────────────────────────────

    @classmethod
    def scalar(cls) -> "TensorShape":
        return cls((1,))

    @classmethod
    def dense(cls, batch: Dim, features: Dim) -> "TensorShape":
        return cls((batch, features))

    @classmethod
    def conv(cls, batch: Dim, channels: Dim, height: Dim, width: Dim) -> "TensorShape":
        return cls((batch, channels, height, width))

    @classmethod
    def lstm(cls, batch: Dim, seq_len: Dim, hidden: Dim) -> "TensorShape":
        return cls((batch, seq_len, hidden))

    @classmethod
    def attention(cls, batch: Dim, seq_len: Dim, dim: Dim) -> "TensorShape":
        return cls((batch, seq_len, dim))

    # ── Compatibility checks ─────────────────────────────────────────────────

    def is_compatible_with(self, other: "TensorShape") -> bool:
        """Returns True if this shape can feed into a layer expecting `other`."""
        if self.rank != other.rank:
            return False
        for a, b in zip(self.dims, other.dims):
            if isinstance(a, Symbolic) or isinstance(b, Symbolic):
                continue          # symbolic dims always compatible
            if a != b:
                return False
        return True

    def feature_dim(self) -> Optional[Dim]:
        """Returns the inner-most (last) feature dimension."""
        if self.rank == 0:
            return None
        return self.dims[-1]


# ── CompilerError hierarchy ──────────────────────────────────────────────────

class CompilerError(Exception):
    """Base class for all Velox Proxima compile-time errors."""
    pass


class ShapeMismatchError(CompilerError):
    """Raised when layer input/output shapes are incompatible."""

    def __init__(self, layer_idx: int, layer_type: str,
                 expected: TensorShape, got: TensorShape):
        msg = (
            f"\n[VP Compiler] Shape Mismatch at Layer {layer_idx} ({layer_type})\n"
            f"  Expected input: {expected}\n"
            f"  Got:            {got}\n"
            f"  Hint: Ensure a Flatten layer precedes Dense after Conv2D."
        )
        super().__init__(msg)
        self.layer_idx = layer_idx
        self.layer_type = layer_type


class MissingParameterError(CompilerError):
    """Raised when a required layer parameter is absent."""

    def __init__(self, layer_idx: int, layer_type: str, param: str):
        msg = (
            f"\n[VP Compiler] Missing Required Parameter at Layer {layer_idx} ({layer_type})\n"
            f"  Parameter '{param}' is required but was not provided.\n"
            f"  Example: layer {layer_type} ({param}=128)"
        )
        super().__init__(msg)


class InvalidLayerOrderError(CompilerError):
    """Raised when layer sequencing is architecturally invalid."""

    def __init__(self, layer_idx: int, prev_type: str, curr_type: str, hint: str = ""):
        msg = (
            f"\n[VP Compiler] Invalid Layer Order at Layer {layer_idx}\n"
            f"  Cannot place '{curr_type}' directly after '{prev_type}'.\n"
            f"  {hint}"
        )
        super().__init__(msg)


class DatasetError(CompilerError):
    """Raised on invalid dataset references or incompatible target columns."""

    def __init__(self, reason: str):
        super().__init__(f"\n[VP Compiler] Dataset Error: {reason}")


class InferenceError(CompilerError):
    """Raised when symbolic shape inference cannot be resolved."""

    def __init__(self, layer_idx: int, layer_type: str, reason: str):
        msg = (
            f"\n[VP Compiler] Shape Inference Failed at Layer {layer_idx} ({layer_type})\n"
            f"  {reason}"
        )
        super().__init__(msg)


# ── Shape utilities ──────────────────────────────────────────────────────────

def geometric_mean_pow2(a: int, b: int) -> int:
    """Return geometric mean of a and b, snapped to nearest power of 2.
    
    This is the 'Leon Identity' used for '?' dimension inference.
    """
    if a <= 0 or b <= 0:
        raise InferenceError(-1, "?", f"Cannot infer geometric mean of non-positive values: ({a}, {b})")
    gm = math.sqrt(a * b)
    if gm < 1:
        return 1
    log2 = math.log2(gm)
    lo = 2 ** int(log2)
    hi = lo * 2
    result = hi if (hi - gm) < (gm - lo) else lo
    # Emit a performance hint if not power-of-2 aligned (it already is, but document intent)
    return max(1, result)


def suggest_power_of_2(n: int) -> int:
    """Return the nearest power of 2 to n (performance hint for GPU kernels)."""
    if n <= 0:
        return 1
    lower = 2 ** math.floor(math.log2(n))
    upper = lower * 2
    return upper if (upper - n) < (n - lower) else lower
