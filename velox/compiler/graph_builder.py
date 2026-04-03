"""
Velox Proxima (VP) — Graph Builder
Layer 2: Compiler Layer

Walks the AST produced by the Parser and emits a ComputationalGraph.
Also performs Shape Inference for '?' parameters.
"""

from typing import Optional, Dict, Tuple
from ..dsl.ast_nodes import (
    ModelNode, LayerNode, TrainNode, OptimizerNode,
    EpochsNode, BatchSizeNode, LossNode,
    SaveNode, PlotNode, EvalNode,
)
from .graph import (
    ComputationalGraph, GraphNode, NodeType, LAYER_TYPE_MAP,
)

# ── Dataset metadata ────────────────────────────────────────────────────────
# Maps dataset name → (input_features, num_classes, input_shape)
DATASET_REGISTRY: Dict[str, Tuple[int, int, tuple]] = {
    "mnist":   (784,  10, (1, 28, 28)),
    "cifar10": (3072, 10, (3, 32, 32)),
    "iris":    (4,    3,  (4,)),
    "fashion_mnist": (784, 10, (1, 28, 28)),
    "housing":       (8,    1,  (8,)),
    "house_pricing": (8,    1,  (8,)),
}


# Default activation to insert after Dense/Conv layers
DEFAULT_ACTIVATION = "relu"


class CompilerError(Exception):
    pass


class GraphBuilder:
    """
    Transforms a ModelNode AST into a ComputationalGraph.

    Shape Inference (?)
    -------------------
    When a layer is marked `infer=True`, the builder chooses a dimension
    that is the geometric mean of the preceding and succeeding known
    dimensions, rounded to the nearest power of 2.
    """

    def __init__(self, ast: ModelNode):
        self.ast = ast
        self.graph = ComputationalGraph()

    # ------------------------------------------------------------------ #
    # Public entry point                                                   #
    # ------------------------------------------------------------------ #

    def build(self) -> ComputationalGraph:
        self._apply_train()
        self._apply_optimizer()
        self._apply_epochs()
        self._apply_batch_size()
        self._apply_loss()
        self._apply_save()
        self._apply_plot()
        self._apply_eval()
        self._build_nodes()
        self._shape_inference()
        self._wire_edges()
        return self.graph

    # ------------------------------------------------------------------ #
    # Config extraction                                                    #
    # ------------------------------------------------------------------ #

    def _apply_train(self):
        if self.ast.train:
            ds = self.ast.train.dataset.lower()
            self.graph.dataset = ds
        else:
            self.graph.dataset = "mnist"

    def _apply_optimizer(self):
        if self.ast.optimizer:
            self.graph.optimizer_name = self.ast.optimizer.name.lower()
            self.graph.optimizer_hparams = self.ast.optimizer.hyperparams
        else:
            self.graph.optimizer_name = "adam"
            self.graph.optimizer_hparams = {"lr": 1e-3}

    def _apply_epochs(self):
        if self.ast.epochs:
            self.graph.epochs = self.ast.epochs.count

    def _apply_batch_size(self):
        if self.ast.batch_size:
            self.graph.batch_size = self.ast.batch_size.size

    def _apply_loss(self):
        if self.ast.loss:
            self.graph.loss = self.ast.loss.name.lower()

    def _apply_save(self):
        if self.ast.save:
            self.graph.save_path = self.ast.save.path

    def _apply_plot(self):
        if self.ast.plot:
            self.graph.plot_targets = self.ast.plot.targets
            self.graph.plot_save_path = self.ast.plot.save_path
            self.graph.live_plot = self.ast.plot.live



    def _apply_eval(self):
        if self.ast.eval:
            self.graph.eval_split = self.ast.eval.split

    # ------------------------------------------------------------------ #
    # Node construction                                                    #
    # ------------------------------------------------------------------ #

    def _build_nodes(self):
        for layer in self.ast.layers:
            ntype = LAYER_TYPE_MAP.get(layer.layer_type, NodeType.LINEAR)
            params = list(layer.params)

            node = GraphNode(
                node_type=ntype,
                layer_type=layer.layer_type,
                params=params,
                infer=layer.infer,
            )

            # Param-driven metadata should be set regardless of infer status
            if params:
                if ntype == NodeType.DROPOUT:
                    node.metadata["p"] = float(params[0])
                elif ntype == NodeType.ATTENTION:
                    node.metadata["heads"] = int(params[0])
                    if len(params) > 1 and params[1] is not None:
                        node.metadata["dim"] = int(params[1])
                elif ntype == NodeType.MAXPOOL2D:
                    node.metadata["kernel_size"] = int(params[0]) if params[0] is not None else 2
                elif ntype == NodeType.ACTIVATION:
                    node.metadata["fn"] = layer.layer_type.lower()

            # Pre-assign known output features from params (only when not infer)
            if not layer.infer and params:
                if ntype in (NodeType.LINEAR,):
                    node.out_features = int(params[0])
                elif ntype == NodeType.CONV2D and len(params) >= 1:
                    node.out_features = int(params[0])   # num filters
                elif ntype == NodeType.LSTM:
                    node.out_features = int(params[0])



            self.graph.add_node(node)

    # ------------------------------------------------------------------ #
    # Shape inference for '?' operator                                    #
    # ------------------------------------------------------------------ #

    def _shape_inference(self):
        """
        Two-pass inference:
          Forward pass  — propagate in_features from dataset input size.
          Backward pass — fill '?' out_features using geometric mean.
        """
        ds_name = self.graph.dataset
        import os
        
        # 1. Check Registry
        if ds_name in DATASET_REGISTRY:
             input_size, num_classes, _ = DATASET_REGISTRY[ds_name]
        else:
             # 2. Check Filepath (with fallback to data/)
             valid_path = None
             paths_to_check = [ds_name, os.path.join("data", ds_name)]
             for p in paths_to_check:
                 if os.path.exists(p) and p.lower().endswith(".csv"):
                     valid_path = p
                     break
             
             if valid_path:
                 try:
                     import pandas as pd
                     import numpy as np
                     df = pd.read_csv(valid_path, nrows=5) # peek
                     target_col = df.columns[-1]
                     X_df = df.drop(columns=[target_col]).select_dtypes(include=[np.number])
                     input_size = len(X_df.columns)
                     
                     # Determine classes (peek target column)
                     target = pd.read_csv(valid_path, usecols=[df.columns[-1]]).iloc[:,0].values
                     # Check if numeric vs symbolic
                     is_numeric = np.issubdtype(target.dtype, np.number)
                     if not is_numeric:
                          is_regr = False
                     else:
                          # If integers, it's classes. If floats, it's regr.
                          is_regr = not np.all(target == target.astype(int))
                     
                     num_classes = 1 if is_regr else len(np.unique(target))
                     self.graph.dataset = valid_path # Update to full path for Executor
                 except Exception as e:
                     print(f"[VP] Shape Inference Warning: CSV probe failed ({e}). Defaulting to MNIST.")
                     input_size, num_classes, _ = DATASET_REGISTRY.get("mnist")
             else:
                 # Default fallback
                 self._log(f"      ! Dataset {ds_name!r} not found. Defaulting to MNIST geometry.")
                 input_size, num_classes, _ = DATASET_REGISTRY.get("mnist")


        nodes = self.graph.nodes

        # Forward pass: assign in_features
        prev_out = input_size
        for node in nodes:
            node.in_features = prev_out
            if node.out_features is not None:
                prev_out = node.out_features
            elif node.node_type in (NodeType.DROPOUT, NodeType.BATCHNORM, NodeType.ACTIVATION, NodeType.ATTENTION, NodeType.MAXPOOL2D):
                node.out_features = prev_out  # pass-through


            # '?' nodes deferred to backward pass

        # Backward pass: resolve '?' out_features
        # Find first known size AFTER each infer node
        for i, node in enumerate(nodes):
            if not node.infer:
                continue
            # Look ahead for next known out_features
            next_out = num_classes
            for j in range(i + 1, len(nodes)):
                if nodes[j].out_features is not None and not nodes[j].infer:
                    next_out = nodes[j].out_features
                    break

            prev_out_i = node.in_features or input_size
            inferred = self._geometric_mean_pow2(prev_out_i, next_out)
            node.out_features = inferred
            node.metadata["inferred"] = True
            node.metadata["inferred_from"] = (prev_out_i, next_out)

        # Re-run forward pass so in_features are consistent after inference
        prev_out = input_size
        for node in nodes:
            node.in_features = prev_out
            if node.out_features is not None:
                prev_out = node.out_features

    @staticmethod
    def _geometric_mean_pow2(a: int, b: int) -> int:
        """Return geometric mean of a and b, snapped to nearest power of 2."""
        import math
        gm = math.sqrt(a * b)
        if gm < 1:
            return 1
        log2 = math.log2(gm)
        lo = 2 ** int(log2)
        hi = lo * 2
        return hi if (hi - gm) < (gm - lo) else lo

    # ------------------------------------------------------------------ #
    # Edge wiring (sequential graph)                                       #
    # ------------------------------------------------------------------ #

    def _wire_edges(self):
        nodes = self.graph.nodes
        for i in range(len(nodes) - 1):
            src = nodes[i]
            dst = nodes[i + 1]
            shape = (self.graph.batch_size, src.out_features) if src.out_features else None
            self.graph.add_edge(src.id, dst.id, shape=shape)


# ------------------------------------------------------------------ #
# Convenience shortcut                                                 #
# ------------------------------------------------------------------ #

def compile_ast(ast: ModelNode) -> ComputationalGraph:
    """Build a ComputationalGraph from a parsed ModelNode."""
    return GraphBuilder(ast).build()
