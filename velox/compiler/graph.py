"""
Velox Proxima (VP) — Computational Graph
Layer 2: Compiler Layer

Defines the intermediate representation: G = (V, E)
  V = computational nodes (layers)
  E = data flow edges
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from enum import Enum, auto
import uuid


class NodeType(Enum):
    INPUT   = auto()
    LINEAR  = auto()    # Dense
    CONV2D  = auto()
    LSTM    = auto()
    DROPOUT = auto()
    BATCHNORM = auto()
    ACTIVATION = auto()
    ATTENTION = auto()
    MAXPOOL2D = auto()
    OUTPUT  = auto()




LAYER_TYPE_MAP = {
    "Dense":     NodeType.LINEAR,
    "Linear":    NodeType.LINEAR,
    "Conv2D":    NodeType.CONV2D,
    "Conv":      NodeType.CONV2D,
    "LSTM":      NodeType.LSTM,
    "Dropout":   NodeType.DROPOUT,
    "BatchNorm": NodeType.BATCHNORM,
    "Attention": NodeType.ATTENTION,
    "MaxPool2D": NodeType.MAXPOOL2D,
    "MaxPool":   NodeType.MAXPOOL2D,



    "ReLU":      NodeType.ACTIVATION,
    "LeakyReLU": NodeType.ACTIVATION,
    "ELU":       NodeType.ACTIVATION,
    "Sigmoid":   NodeType.ACTIVATION,
    "Softmax":   NodeType.ACTIVATION,
    "Tanh":      NodeType.ACTIVATION,

}


@dataclass
class GraphNode:
    """A single vertex V in the computational graph G = (V, E)."""
    id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    node_type: NodeType = NodeType.LINEAR
    layer_type: str = ""            # original string (e.g. "Dense")
    params: List[Any] = field(default_factory=list)
    infer: bool = False             # True if dimension must be inferred
    in_features: Optional[int] = None
    out_features: Optional[int] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    # Optimization flags (set by Optimization Layer)
    fused_with: Optional[str] = None   # ID of node this is fused into
    lazy: bool = False

    def __repr__(self):
        infer_tag = "[?]" if self.infer else ""
        return (
            f"GraphNode({self.id} | {self.layer_type}{infer_tag} "
            f"in={self.in_features} out={self.out_features})"
        )


@dataclass
class GraphEdge:
    """A directed data-flow edge E in the computational graph G = (V, E)."""
    src: str    # source GraphNode.id
    dst: str    # destination GraphNode.id
    shape: Optional[tuple] = None   # tensor shape flowing through this edge


@dataclass
class ComputationalGraph:
    """
    The full intermediate representation G = (V, E).

    Attributes
    ----------
    nodes   : ordered list of GraphNode (topological order)
    edges   : list of directed GraphEdges
    dataset : dataset name (e.g. 'mnist')
    optimizer_name : e.g. 'adam'
    optimizer_hparams : {'lr': 0.001, ...}
    epochs  : int
    batch_size : int
    loss    : str
    save_path  : path to save model weights (None = don't save)
    plot_targets : list of metrics to plot, e.g. ['loss', 'accuracy']
    plot_save_path : path to save plot image (None = show interactively)
    eval_split : 'test' | 'train' | None
    """
    nodes: List[GraphNode] = field(default_factory=list)
    edges: List[GraphEdge] = field(default_factory=list)
    dataset: str = "mnist"
    optimizer_name: str = "adam"
    optimizer_hparams: Dict[str, float] = field(default_factory=lambda: {"lr": 1e-3})
    epochs: int = 10
    batch_size: int = 32
    loss: str = "cross_entropy"
    save_path: Optional[str] = None
    plot_targets: List[str] = field(default_factory=list)
    plot_save_path: Optional[str] = None
    live_plot: bool = False
    eval_split: Optional[str] = None


    # ---------- helpers ----------

    def add_node(self, node: GraphNode) -> GraphNode:
        self.nodes.append(node)
        return node

    def add_edge(self, src_id: str, dst_id: str, shape=None):
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

    def summary(self) -> str:
        lines = [
            f"ComputationalGraph  nodes={len(self.nodes)}  edges={len(self.edges)}",
            f"  dataset={self.dataset}  optimizer={self.optimizer_name}"
            f"  epochs={self.epochs}  batch={self.batch_size}",
            "  " + "-" * 56,
        ]
        for n in self.nodes:
            lines.append(f"  {n}")
        for e in self.edges:
            lines.append(f"  edge {e.src} --> {e.dst}")
        return "\n".join(lines)
