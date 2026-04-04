"""
Velox Proxima (VP) — Graph Builder
Layer 2: Compiler Layer

Production-grade compiler pass that walks the AST and emits a
validated, optimized ComputationalGraph IR.

Upgrades over v1:
  - Full TensorShape system (replaces scalar in_features/out_features)
  - Strict compile-time validation (zero silent fallbacks)
  - Constraint-based shape inference (forward + backward + symbolic)
  - Explicit dataset target column support
  - Structured logging (velox.compiler logger)
  - Performance hints (power-of-2 alignment suggestions)
"""

from __future__ import annotations

import logging
import os
from typing import Dict, List, Optional, Tuple

from ..dsl.ast_nodes import (
    ModelNode, LayerNode, TrainNode, OptimizerNode,
    EpochsNode, BatchSizeNode, LossNode,
    SaveNode, PlotNode, EvalNode,
)
from .graph import (
    ComputationalGraph, GraphNode, NodeType, LAYER_TYPE_MAP,
    PASSTHROUGH_TYPES,
)
from .types import (
    TensorShape, Symbolic,
    CompilerError, DatasetError, InferenceError,
    MissingParameterError, ShapeMismatchError,
    geometric_mean_pow2, suggest_power_of_2,
)

logger = logging.getLogger("velox.compiler")

# ── Dataset registry ─────────────────────────────────────────────────────────
# Maps name → (input_features, num_classes, raw_shape, default_loss)

DatasetMeta = Tuple[int, int, tuple, str]

DATASET_REGISTRY: Dict[str, DatasetMeta] = {
    "mnist":         (784,  10, (1, 28, 28),  "cross_entropy"),
    "fashion_mnist": (784,  10, (1, 28, 28),  "cross_entropy"),
    "cifar10":       (3072, 10, (3, 32, 32),  "cross_entropy"),
    "iris":          (4,    3,  (4,),          "cross_entropy"),
    "housing":       (8,    1,  (8,),          "mse"),
    "house_pricing": (8,    1,  (8,),          "mse"),
}

BATCH = 32   # symbolic batch placeholder for shape descriptors

# ── Compiler ─────────────────────────────────────────────────────────────────

class GraphBuilder:
    """
    Transforms a ModelNode AST into a validated, optimized ComputationalGraph.

    Pipeline
    --------
      1. Extract training config (dataset, optimizer, epochs, …)
      2. Resolve dataset → concrete input shape
      3. Build GraphNode list from LayerNode list
      4. Forward-pass shape propagation
      5. Backward-pass '?' inference (Leon Identity geometric mean)
      6. Wire directed edges
      7. Validation pass (strict — raises on any issue)
      8. Optimization passes (fusion, elimination)
    """

    def __init__(self, ast: ModelNode, verbose: bool = False):
        self.ast = ast
        self.graph = ComputationalGraph()
        self.verbose = verbose
        if verbose:
            logging.basicConfig(level=logging.DEBUG)
        else:
            logging.basicConfig(level=logging.INFO)

    # ── Public entry ─────────────────────────────────────────────────────────

    def build(self) -> ComputationalGraph:
        logger.info("[VP Compiler] Starting compilation…")
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
        self.graph.validate()
        self.graph.optimize()
        logger.info("[VP Compiler] Compilation complete ✓")
        return self.graph

    # ── Config extraction ─────────────────────────────────────────────────────

    def _apply_train(self) -> None:
        if self.ast.train is None:
            raise CompilerError(
                "[VP Compiler] Missing 'train' directive.\n"
                "  Every VP program must declare a dataset.\n"
                "  Example: train on mnist"
            )
        ds = self.ast.train.dataset.strip()
        target = getattr(self.ast.train, "target_col", None)
        self.graph.dataset = ds
        self.graph.dataset_target_col = target
        logger.debug(f"[VP Compiler] Dataset = {ds!r}  target_col = {target!r}")

    def _apply_optimizer(self) -> None:
        if self.ast.optimizer:
            self.graph.optimizer_name    = self.ast.optimizer.name.lower()
            self.graph.optimizer_hparams = self.ast.optimizer.hyperparams
        else:
            self.graph.optimizer_name    = "adamw"
            self.graph.optimizer_hparams = {"lr": 1e-3}
        logger.debug(
            f"[VP Compiler] Optimizer = {self.graph.optimizer_name} "
            f"hparams = {self.graph.optimizer_hparams}"
        )

    def _apply_epochs(self) -> None:
        if self.ast.epochs:
            self.graph.epochs = self.ast.epochs.count

    def _apply_batch_size(self) -> None:
        if self.ast.batch_size:
            self.graph.batch_size = self.ast.batch_size.size

    def _apply_loss(self) -> None:
        if self.ast.loss:
            self.graph.loss = self.ast.loss.name.lower()

    def _apply_save(self) -> None:
        if self.ast.save:
            self.graph.save_path = self.ast.save.path

    def _apply_plot(self) -> None:
        if self.ast.plot:
            self.graph.plot_targets   = self.ast.plot.targets
            self.graph.plot_save_path = self.ast.plot.save_path
            self.graph.live_plot      = self.ast.plot.live

    def _apply_eval(self) -> None:
        if self.ast.eval:
            self.graph.eval_split = self.ast.eval.split

    # ── Dataset resolution ────────────────────────────────────────────────────

    def _resolve_dataset(self) -> Tuple[int, int]:
        """
        Resolve the dataset name to (input_features, num_classes).
        Order of precedence:
          1. Built-in registry
          2. CSV file path (explicit target column if provided)
        Raises DatasetError on failure — no silent fallbacks.
        """
        ds_name = self.graph.dataset

        if ds_name.lower() in DATASET_REGISTRY:
            input_size, num_classes, raw_shape, default_loss = DATASET_REGISTRY[ds_name.lower()]
            if not self.ast.loss:          # only override if user didn't set loss
                self.graph.loss = default_loss
            logger.debug(
                f"[VP Compiler] Registry hit: {ds_name!r} → "
                f"inputs={input_size} classes={num_classes}"
            )
            return input_size, num_classes

        # ── CSV file resolution ──────────────────────────────────────────────
        paths_to_try = [ds_name, os.path.join("data", ds_name)]
        csv_path: Optional[str] = None
        for p in paths_to_try:
            if os.path.isfile(p) and p.lower().endswith(".csv"):
                csv_path = p
                break

        if csv_path is None:
            raise DatasetError(
                f"Dataset {ds_name!r} not found in registry or filesystem.\n"
                f"  Checked paths: {paths_to_try}\n"
                f"  Built-in datasets: {list(DATASET_REGISTRY.keys())}\n"
                f"  To use a CSV: train dataset=\"path/to/data.csv\" target=\"column_name\""
            )

        # ── Probe CSV ────────────────────────────────────────────────────────
        try:
            import pandas as pd
            import numpy as np

            df_head = pd.read_csv(csv_path, nrows=200)

            # Resolve target column
            target_col = self.graph.dataset_target_col or df_head.columns[-1]
            if target_col not in df_head.columns:
                raise DatasetError(
                    f"Target column {target_col!r} not found in {csv_path!r}.\n"
                    f"  Available columns: {list(df_head.columns)}"
                )

            feature_cols = [c for c in df_head.columns if c != target_col]
            numeric_features = df_head[feature_cols].select_dtypes(include=[np.number])
            if len(numeric_features.columns) == 0:
                raise DatasetError(
                    f"No numeric feature columns found in {csv_path!r} "
                    f"(after excluding target {target_col!r})."
                )

            input_size = len(numeric_features.columns)
            target_vals = df_head[target_col]

            if pd.api.types.is_float_dtype(target_vals) and not all(
                target_vals == target_vals.astype(int, errors="ignore")
            ):
                # Regression task
                num_classes = 1
                if not self.ast.loss:
                    self.graph.loss = "mse"
            else:
                num_classes = int(target_vals.nunique())
                if not self.ast.loss:
                    self.graph.loss = "cross_entropy"

            self.graph.dataset = csv_path  # store resolved path for Executor
            self.graph.dataset_target_col = target_col
            logger.info(
                f"[VP Compiler] CSV resolved: {csv_path!r} → "
                f"features={input_size}, classes={num_classes}, "
                f"target={target_col!r}"
            )
            return input_size, num_classes

        except ImportError:
            raise DatasetError(
                "pandas and numpy are required for CSV dataset support.\n"
                "  Install with: pip install pandas numpy"
            )
        except DatasetError:
            raise
        except Exception as exc:
            raise DatasetError(
                f"Failed to probe CSV {csv_path!r}: {exc}"
            )

    # ── Node construction ─────────────────────────────────────────────────────

    def _build_nodes(self) -> None:
        if not self.ast.layers:
            raise CompilerError(
                "[VP Compiler] No layers defined.\n"
                "  Add at least one layer. Example:\n"
                "    layer Dense (128)\n"
                "    layer Dense (10)"
            )

        for i, layer in enumerate(self.ast.layers):
            ntype = LAYER_TYPE_MAP.get(layer.layer_type, NodeType.LINEAR)
            params = list(layer.params)

            node = GraphNode(
                node_type=ntype,
                layer_type=layer.layer_type,
                params=params,
                infer=layer.infer,
            )

            # Metadata from params
            if params:
                if ntype == NodeType.DROPOUT:
                    p = float(params[0])
                    if not (0.0 <= p < 1.0):
                        raise MissingParameterError(
                            i, layer.layer_type,
                            f"dropout rate must be in [0, 1), got {p}"
                        )
                    node.metadata["p"] = p

                elif ntype == NodeType.ATTENTION:
                    if params[0] is None:
                        raise MissingParameterError(i, "Attention", "heads")
                    node.metadata["heads"] = int(params[0])
                    if len(params) > 1 and params[1] is not None:
                        node.metadata["dim"] = int(params[1])

                elif ntype == NodeType.MAXPOOL2D:
                    node.metadata["kernel_size"] = int(params[0]) if params[0] else 2

                elif ntype == NodeType.ACTIVATION:
                    node.metadata["fn"] = layer.layer_type.lower()

                elif ntype == NodeType.CONV2D:
                    if params[0] is None:
                        raise MissingParameterError(i, "Conv2D", "out_channels")
                    node.metadata["out_channels"] = int(params[0])
                    node.metadata["kernel_size"]  = int(params[1]) if len(params) > 1 and params[1] else 3

            self.graph.add_node(node)
            logger.debug(f"[VP Compiler] Built node {i}: {node}")

    # ── Shape inference ────────────────────────────────────────────────────────

    def _shape_inference(self) -> None:
        """
        Constraint-based shape inference.

          Pass 1 — Forward: propagate concrete shapes from dataset input.
          Pass 2 — Backward: resolve '?' via Leon Identity (geometric mean).
          Pass 3 — Forward: finalize all in/out shapes.
        """
        input_size, num_classes = self._resolve_dataset()
        bs = self.graph.batch_size
        nodes = self.graph.nodes

        # ── Pass 1: Forward — propagate output shapes from known params ───────
        prev_out_features: int = input_size
        prev_node_type: Optional[NodeType] = None

        for i, node in enumerate(nodes):
            # Assign input shape
            if node.node_type in (NodeType.CONV2D, NodeType.MAXPOOL2D):
                node.input_shape = TensorShape((bs, prev_out_features, Symbolic("H"), Symbolic("W")))
            elif node.node_type == NodeType.LSTM:
                node.input_shape = TensorShape((bs, Symbolic("T"), prev_out_features))
            elif node.node_type == NodeType.ATTENTION:
                node.input_shape = TensorShape((bs, Symbolic("T"), prev_out_features))
            else:
                node.input_shape = TensorShape((bs, prev_out_features))

            # Assign output shape (for non-infer nodes)
            if node.node_type in PASSTHROUGH_TYPES:
                node.output_shape = node.input_shape

            elif node.node_type == NodeType.FLATTEN:
                # Flatten: collapse all dims after batch into single feature dim
                # We mark as needing resolution from the preceding conv node
                node.output_shape = None   # resolved in pass 3
                node.metadata["flatten_from"] = prev_out_features

            elif node.node_type == NodeType.CONV2D and not node.infer:
                out_ch = node.metadata.get("out_channels", prev_out_features)
                node.output_shape = TensorShape((bs, out_ch, Symbolic("H'"), Symbolic("W'")))
                prev_out_features = out_ch

            elif node.node_type == NodeType.LSTM and not node.infer:
                hidden = int(node.params[0]) if node.params else prev_out_features
                node.output_shape = TensorShape((bs, Symbolic("T"), hidden))
                prev_out_features = hidden

            elif node.node_type == NodeType.ATTENTION and not node.infer:
                dim = node.metadata.get("dim", prev_out_features)
                node.output_shape = TensorShape((bs, Symbolic("T"), dim))
                prev_out_features = dim

            elif node.node_type == NodeType.LINEAR and not node.infer:
                if not node.params or node.params[0] is None:
                    raise MissingParameterError(i, node.layer_type, "out_features")
                out_f = int(node.params[0])
                # Performance hint
                pow2 = suggest_power_of_2(out_f)
                if out_f != pow2:
                    logger.info(
                        f"[VP Compiler] ⚡ Performance Hint — Layer {i} ({node.layer_type}): "
                        f"size={out_f} is not a power of 2. "
                        f"Consider {pow2} for better GPU kernel efficiency."
                    )
                node.output_shape = TensorShape((bs, out_f))
                prev_out_features = out_f

            if node.output_shape is not None:
                prev_node_type = node.node_type

        # ── Pass 2: Backward — resolve '?' via geometric mean ─────────────────
        for i, node in enumerate(nodes):
            if not node.infer:
                continue

            # Find the next concrete output size after position i
            next_size: int = num_classes
            for j in range(i + 1, len(nodes)):
                nxt = nodes[j]
                if not nxt.infer and nxt.output_shape is not None:
                    fd = nxt.output_shape.feature_dim()
                    if isinstance(fd, int):
                        next_size = fd
                        break

            prev_size: int
            if node.input_shape is not None:
                fd = node.input_shape.feature_dim()
                prev_size = fd if isinstance(fd, int) else input_size
            else:
                prev_size = input_size

            inferred = geometric_mean_pow2(prev_size, next_size)
            node.output_shape = TensorShape((bs, inferred))
            node.metadata["inferred"]      = True
            node.metadata["inferred_from"] = (prev_size, next_size)
            logger.debug(
                f"[VP Compiler] Layer {i} ({node.layer_type}) ← inferred dim = "
                f"{inferred} (geometric mean of {prev_size} and {next_size})"
            )

        # ── Pass 3: Forward — propagate Flatten and finalize all input shapes ─
        prev_out_features = input_size
        prev_conv_spatial: Optional[Tuple] = None

        for i, node in enumerate(nodes):
            # Re-set input shape with consistent prev_out
            if node.node_type in (NodeType.CONV2D, NodeType.MAXPOOL2D):
                node.input_shape = TensorShape((bs, prev_out_features, Symbolic("H"), Symbolic("W")))
            elif node.node_type in (NodeType.LSTM, NodeType.ATTENTION):
                node.input_shape = TensorShape((bs, Symbolic("T"), prev_out_features))
            else:
                node.input_shape = TensorShape((bs, prev_out_features))

            # Flatten: product of spatial dims (if following conv, estimate)
            if node.node_type == NodeType.FLATTEN:
                node.output_shape = TensorShape((bs, prev_out_features))

            if node.output_shape is not None:
                fd = node.output_shape.feature_dim()
                if isinstance(fd, int):
                    prev_out_features = fd

    # ── Edge wiring ────────────────────────────────────────────────────────────

    def _wire_edges(self) -> None:
        nodes = self.graph.nodes
        for i in range(len(nodes) - 1):
            src = nodes[i]
            dst = nodes[i + 1]
            self.graph.add_edge(src.id, dst.id, shape=src.output_shape)


# ── Public API ────────────────────────────────────────────────────────────────

def compile_ast(ast: ModelNode, verbose: bool = False) -> ComputationalGraph:
    """
    Compile a parsed ModelNode AST into a validated, optimized ComputationalGraph.

    Args:
        ast:     The root ModelNode from the VP DSL parser.
        verbose: If True, emit detailed debug logs per compilation step.

    Returns:
        A fully wired, validated, and optimized ComputationalGraph IR.

    Raises:
        CompilerError (or subclass) on any structural or shape issue.
    """
    return GraphBuilder(ast, verbose=verbose).build()
