"""
Velox Proxima Compiler — Public API
"""
from .types import (
    TensorShape,
    Symbolic,
    CompilerError,
    ShapeMismatchError,
    MissingParameterError,
    InvalidLayerOrderError,
    DatasetError,
    InferenceError,
    geometric_mean_pow2,
    suggest_power_of_2,
)
from .graph import (
    ComputationalGraph,
    GraphNode,
    GraphEdge,
    NodeType,
    LAYER_TYPE_MAP,
)
from .graph_builder import compile_ast, GraphBuilder

__all__ = [
    "TensorShape", "Symbolic",
    "CompilerError", "ShapeMismatchError", "MissingParameterError",
    "InvalidLayerOrderError", "DatasetError", "InferenceError",
    "ComputationalGraph", "GraphNode", "GraphEdge",
    "NodeType", "LAYER_TYPE_MAP",
    "compile_ast", "GraphBuilder",
]
