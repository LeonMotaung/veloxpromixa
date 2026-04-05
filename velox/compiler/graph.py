"""
Velox Proxima (VP) - Computational Graph IR
Layer 2: Compiler Layer

Upgraded to use the full TensorShape system and strict node metadata.
Includes topological sort, validation pass, and optimization passes.
"""

from __future__ import annotations

import uuid
import logging
from collections import deque
from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Any, Dict, List, Optional, Tuple

from .types import (
    TensorShape, CompilerError, ShapeMismatchError,
    InvalidLayerOrderError, Symbolic,
)

logger = logging.getLogger("velox.compiler.graph")


# -- Node type taxonomy -------------------------------------------------------

class NodeType(Enum):
    INPUT      = auto()
    LINEAR     = auto()   # Dense / Linear
    CONV2D     = auto()
    LSTM       = auto()
    DROPOUT    = auto()
    BATCHNORM  = auto()
    ACTIVATION = auto()
    ATTENTION  = auto()
    MAXPOOL2D  = auto()
    FLATTEN    = auto()
    OUTPUT     = auto()


LAYER_TYPE_MAP: Dict[str, NodeType] = {
    # Dense family
    "Dense":     NodeType.LINEAR,
    "Linear":    NodeType.LINEAR,
    # Conv family
    "Conv2D":    NodeType.CONV2D,
    "Conv":      NodeType.CONV2D,
    # Recurrent
    "LSTM":      NodeType.LSTM,
    # Regularisation
    "Dropout":   NodeType.DROPOUT,
    "BatchNorm": NodeType.BATCHNORM,
    # Pooling
    "MaxPool2D": NodeType.MAXPOOL2D,
    "MaxPool":   NodeType.MAXPOOL2D,
    # Attention
    "Attention": NodeType.ATTENTION,
    # Reshape
    "Flatten":   NodeType.FLATTEN,
    # Activations
    "ReLU":      NodeType.ACTIVATION,
    "LeakyReLU": NodeType.ACTIVATION,
    "ELU":       NodeType.ACTIVATION,
    "Sigmoid":   NodeType.ACTIVATION,
    "Softmax":   NodeType.ACTIVATION,
    "Tanh":      NodeType.ACTIVATION,
    "GELU":      NodeType.ACTIVATION,
    "SiLU":      NodeType.ACTIVATION,
}

# Passthrough node types - output shape equals input shape
PASSTHROUGH_TYPES = {
    NodeType.DROPOUT,
    NodeType.BATCHNORM,
    NodeType.ACTIVATION,
}

# Architecturally invalid transitions (prev_type -> curr_type)
INVALID_TRANSITIONS: Dict[NodeType, Dict[NodeType, str]] = {
    NodeType.CONV2D: {
        NodeType.LINEAR: (
            "A Dense layer cannot follow Conv2D without a Flatten layer. "
            "Add 'layer Flatten ()' between them."
        ),
    },
    NodeType.MAXPOOL2D: {
        NodeType.LINEAR: (
            "A Dense layer cannot follow MaxPool2D without a Flatten layer. "
            "Add 'layer Flatten ()' between them."
        ),
    },
}


# -- Graph Node ---------------------------------------------------------------

@dataclass
class GraphNode:
    """A single vertex V in the computational graph G = (V, E)."""
    id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])

    node_type: NodeType = NodeType.LINEAR
    layer_type: str = ""
    params: List[Any] = field(default_factory=list)
    infer: bool = False

    # Full shape descriptors (replaces scalar in_features / out_features)
    input_shape: Optional[TensorShape] = None
    output_shape: Optional[TensorShape] = None

    # Backwards-compat scalars - derived from shapes
    @property
    def in_features(self) -> Optional[int]:
        if self.input_shape is None:
            return None
        d = self.input_shape.feature_dim()
        return d if isinstance(d, int) else None

    @property
    def out_features(self) -> Optional[int]:
        if self.output_shape is None:
            return None
        d = self.output_shape.feature_dim()
        return d if isinstance(d, int) else None

    # Optimisation flags
    fused_with: Optional[str] = None
    eliminated: bool = False

    metadata: Dict[str, Any] = field(default_factory=dict)

    def __repr__(self) -> str:
        inf_tag = "[?]" if self.infer else ""
        return (
            f"GraphNode({self.id} | {self.layer_type}{inf_tag} "
            f"in={self.input_shape} -> out={self.output_shape})"
        )

    def serialize(self) -> Dict[str, Any]:
        """Convert node to a dictionary for frontend JSON serialization."""
        return {
            "id": self.id,
            "type": self.node_type.name,
            "layer": self.layer_type,
            "params": [str(p) for p in self.params],
            "input_shape": str(self.input_shape) if self.input_shape else None,
            "output_shape": str(self.output_shape) if self.output_shape else None,
            "infer": self.infer,
            "fused_with": self.fused_with,
            "eliminated": self.eliminated,
            "metadata": self.metadata
        }


# -- Graph Edge ---------------------------------------------------------------

@dataclass
class GraphEdge:
    """A directed data-flow edge E in G = (V, E)."""
    src: str
    dst: str
    shape: Optional[TensorShape] = None


# -- Computational Graph -------------------------------------------------------

@dataclass
class ComputationalGraph:
    """
    Full IR - G = (V, E).

    Responsibilities:
      - Stores ordered node list (topological).
      - Stores edges (data-flow).
      - Exposes graph-level metadata (dataset, optimizer, etc.).
      - Provides validation, optimization, and export passes.
    """

    nodes: List[GraphNode] = field(default_factory=list)
    edges: List[GraphEdge] = field(default_factory=list)

    # Training config
    dataset: str = "mnist"
    dataset_target_col: Optional[str] = None
    optimizer_name: str = "adam"
    optimizer_hparams: Dict[str, float] = field(default_factory=lambda: {"lr": 1e-3})
    epochs: int = 10
    batch_size: int = 32
    loss: str = "cross_entropy"

    # IO config
    save_path: Optional[str] = None
    plot_targets: List[str] = field(default_factory=list)
    plot_save_path: Optional[str] = None
    live_plot: bool = False
    eval_split: Optional[str] = None

    # -- Mutation helpers -----------------------------------------------------

    def add_node(self, node: GraphNode) -> GraphNode:
        self.nodes.append(node)
        return node

    def add_edge(self, src_id: str, dst_id: str,
                 shape: Optional[TensorShape] = None) -> None:
        self.edges.append(GraphEdge(src=src_id, dst=dst_id, shape=shape))

    def node_by_id(self, nid: str) -> Optional[GraphNode]:
        for n in self.nodes:
            if n.id == nid:
                return n
        return None

    def predecessors(self, node: GraphNode) -> List[GraphNode]:
        pred_ids = {e.src for e in self.edges if e.dst == node.id}
        return [n for n in self.nodes if n.id in pred_ids]

    def successors(self, node: GraphNode) -> List[GraphNode]:
        succ_ids = {e.dst for e in self.edges if e.src == node.id}
        return [n for n in self.nodes if n.id in succ_ids]

    # -- Topological sort -----------------------------------------------------

    def topological_sort(self) -> List[GraphNode]:
        """
        Kahn's algorithm - returns nodes in dependency order.
        Raises CompilerError on cycles (should never occur in VP, but defensive).
        """
        in_degree: Dict[str, int] = {n.id: 0 for n in self.nodes}
        for e in self.edges:
            in_degree[e.dst] += 1

        queue: deque[GraphNode] = deque(
            n for n in self.nodes if in_degree[n.id] == 0
        )
        sorted_nodes: List[GraphNode] = []

        while queue:
            node = queue.popleft()
            sorted_nodes.append(node)
            for succ in self.successors(node):
                in_degree[succ.id] -= 1
                if in_degree[succ.id] == 0:
                    queue.append(succ)

        if len(sorted_nodes) != len(self.nodes):
            raise CompilerError(
                "[VP Compiler] Cycle detected in computational graph. "
                "Velox Proxima only supports acyclic (feed-forward) architectures."
            )
        return sorted_nodes

    # -- Validation pass ------------------------------------------------------

    def validate(self) -> None:
        """
        Full compile-time graph validation.
        Raises descriptive errors - zero silent fallbacks.
        """
        logger.debug("[VP Compiler] Running validation pass...")
        active = [n for n in self.nodes if not n.eliminated]

        for i, node in enumerate(active):
            self._validate_layer_order(i, active)
            self._validate_shapes(i, node)

        logger.debug(f"[VP Compiler] Validation passed ({len(active)} active nodes).")

    def _validate_layer_order(self, i: int, nodes: List[GraphNode]) -> None:
        if i == 0:
            return
        prev = nodes[i - 1]
        curr = nodes[i]
        bad_transitions = INVALID_TRANSITIONS.get(prev.node_type, {})
        if curr.node_type in bad_transitions:
            raise InvalidLayerOrderError(
                i, prev.layer_type, curr.layer_type,
                hint=bad_transitions[curr.node_type],
            )

    def _validate_shapes(self, i: int, node: GraphNode) -> None:
        if node.input_shape is None or node.output_shape is None:
            return  # Not yet inferred - skip until after inference pass
        # Dense: rank must be 2
        if node.node_type == NodeType.LINEAR:
            if node.input_shape.rank != 2:
                raise ShapeMismatchError(
                    i, node.layer_type,
                    expected=TensorShape((Symbolic("batch"), Symbolic("features"))),
                    got=node.input_shape,
                )

    # -- Optimization passes --------------------------------------------------

    def optimize(self) -> None:
        """Apply all optimization passes in order."""
        logger.debug("[VP Compiler] Running optimization passes...")
        self._fuse_linear_activation()
        self._eliminate_noop_layers()
        logger.debug(f"[VP Compiler] Optimization done. "
                     f"{sum(1 for n in self.nodes if n.eliminated)} nodes eliminated.")

    def _fuse_linear_activation(self) -> None:
        """
        Operator Fusion Pass - Linear + Activation -> single fused node.
        Sets node.fused_with to mark the absorbed activation.
        """
        active = [n for n in self.nodes if not n.eliminated]
        for i in range(len(active) - 1):
            curr = active[i]
            nxt = active[i + 1]
            if (curr.node_type == NodeType.LINEAR
                    and nxt.node_type == NodeType.ACTIVATION):
                fn = nxt.metadata.get("fn", "relu")
                curr.metadata["fused_activation"] = fn
                curr.fused_with = nxt.id
                nxt.eliminated = True
                logger.debug(
                    f"[VP Optimizer] Fused {curr.layer_type}+{nxt.layer_type} "
                    f"-> node {curr.id} (activation={fn})"
                )

    def _eliminate_noop_layers(self) -> None:
        """
        Remove BatchNorm layers with zero output variance potential,
        or any explicitly marked no-op layers.
        """
        for node in self.nodes:
            if node.node_type == NodeType.BATCHNORM:
                if node.metadata.get("noop", False):
                    node.eliminated = True
                    logger.debug(f"[VP Optimizer] Eliminated no-op BatchNorm {node.id}")

    # -- Export stubs ---------------------------------------------------------

    def to_onnx(self) -> bytes:
        """Export graph to ONNX format (stub - requires onnx library)."""
        raise NotImplementedError(
            "[VP Export] ONNX export requires: pip install velox-onnx-backend"
        )

    def to_tflite(self) -> bytes:
        """Export graph to TFLite FlatBuffer (stub)."""
        raise NotImplementedError(
            "[VP Export] TFLite export requires: pip install velox-tflite-backend"
        )

    def to_wasm(self) -> bytes:
        """Export graph to WebAssembly binary (stub)."""
        raise NotImplementedError(
            "[VP Export] WASM export requires: pip install velox-wasm-backend"
        )

    def to_dot(self) -> str:
        """
        Export graph as Graphviz DOT notation for visualization.
        """
        lines = ["digraph VeloxProxima {"]
        lines.append('  graph [rankdir=TB fontname="Inter" bgcolor="#0d0d0d"]')
        lines.append('  node  [shape=box style="filled,rounded" '
                     'fillcolor="#1a1a2e" fontcolor="#e0e0e0" color="#7c3aed"]')
        lines.append('  edge  [color="#7c3aed" fontcolor="#aaa"]')

        for node in self.nodes:
            if node.eliminated:
                continue
            inf_tag = " [?->inferred]" if node.infer else ""
            fused   = f"\\n[!] fused={node.metadata.get('fused_activation', '')}" \
                      if node.fused_with else ""
            in_s    = str(node.input_shape) if node.input_shape else "?"
            out_s   = str(node.output_shape) if node.output_shape else "?"
            label   = (f"{node.layer_type}{inf_tag}\\n"
                       f"in: {in_s}\\nout: {out_s}{fused}")
            lines.append(f'  "{node.id}" [label="{label}"]')

        for edge in self.edges:
            src_node = self.node_by_id(edge.src)
            dst_node = self.node_by_id(edge.dst)
            if src_node and src_node.eliminated:
                continue
            shape_label = str(edge.shape) if edge.shape else ""
            lines.append(f'  "{edge.src}" -> "{edge.dst}" [label="{shape_label}"]')

        lines.append("}")
        return "\n".join(lines)

    def serialize(self) -> Dict[str, Any]:
        """Convert full graph to a dictionary for the React visualizer."""
        return {
            "dataset": self.dataset,
            "optimizer": self.optimizer_name,
            "epochs": self.epochs,
            "batch_size": self.batch_size,
            "loss": self.loss,
            "nodes": [n.serialize() for n in self.nodes],
            "edges": [
                {
                    "src": e.src,
                    "dst": e.dst,
                    "shape": str(e.shape) if e.shape else None
                }
                for e in self.edges
            ]
        }

    # -- Summary --------------------------------------------------------------

    def summary(self) -> str:
        lines = [
            f"ComputationalGraph  nodes={len(self.nodes)}  edges={len(self.edges)}",
            f"  dataset={self.dataset}  optimizer={self.optimizer_name}"
            f"  lr={self.optimizer_hparams.get('lr')}  epochs={self.epochs}"
            f"  batch={self.batch_size}  loss={self.loss}",
            "  " + "-" * 64,
        ]
        for n in self.nodes:
            elim = " [ELIMINATED]" if n.eliminated else ""
            fused = f" [!]fused({n.metadata.get('fused_activation','')})" if n.fused_with else ""
            lines.append(f"  {n}{elim}{fused}")
        lines.append("  " + "-" * 64)
        for e in self.edges:
            src = self.node_by_id(e.src)
            if src and src.eliminated:
                continue
            lines.append(f"  {e.src} -->> {e.dst}  {e.shape or ''}")
        return "\n".join(lines)
