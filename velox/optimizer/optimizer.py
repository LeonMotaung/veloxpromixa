"""
Velox Proxima (VP) - Optimizer
Layer 3: Optimization Layer

Applies a pipeline of graph transformation passes to improve
performance before execution.

Passes implemented:
  1. OperatorFusionPass  - fuse consecutive Linear+ReLU into a single node
  2. MemoryOptPass       - tag redundant nodes for in-place ops
  3. LazyEvalPass        - mark nodes whose output can be deferred
  4. AutoBatchingPass    - suggest optimal batch size based on device memory
  5. LeonIdentityPass    - applies P_{t+1} stabilization curve to lr schedule

Leon Identity stabilization formula (from the VP spec):

    P_{t+1} = P_t + γ · (1 - 1/ESI) · (P_∞ - P_t) + ε_t

Where:
    P_t   = current parameter state (learning rate)
    γ     = convergence damping factor (default 0.1)
    P_∞   = target steady-state value
    ESI   = Equilibrium Stability Index (ratio of gradient norm to baseline)
    ε_t   = stochastic noise term
"""

import math
import random
from typing import List
from ..compiler.graph import ComputationalGraph, GraphNode, NodeType


# -- Base Pass --------------------------------------------------------------

class OptimizationPass:
    name: str = "base"

    def run(self, graph: ComputationalGraph) -> ComputationalGraph:
        raise NotImplementedError


# -- Pass 1: Operator Fusion ------------------------------------------------

class OperatorFusionPass(OptimizationPass):
    """
    Fuse consecutive Linear -> Activation into a single 'LinAct' node.
    This eliminates intermediate tensor allocations.
    """
    name = "operator_fusion"

    _FUSEABLE_PAIRS = {
        (NodeType.LINEAR, NodeType.ACTIVATION),
        (NodeType.CONV2D, NodeType.ACTIVATION),
    }

    def run(self, graph: ComputationalGraph) -> ComputationalGraph:
        nodes = graph.nodes
        i = 0
        while i < len(nodes) - 1:
            a, b = nodes[i], nodes[i + 1]
            if (a.node_type, b.node_type) in self._FUSEABLE_PAIRS:
                # Merge activation info into the linear node
                a.metadata["fused_activation"] = b.metadata.get("fn", "relu")
                a.fused_with = b.id
                b.metadata["fused_into"] = a.id
            i += 1
        return graph


# -- Pass 2: Memory Optimisation --------------------------------------------

class MemoryOptPass(OptimizationPass):
    """
    Tag Dropout and BatchNorm nodes for in-place operation,
    and estimate peak memory footprint.
    """
    name = "memory_opt"

    def run(self, graph: ComputationalGraph) -> ComputationalGraph:
        for node in graph.nodes:
            if node.node_type in (NodeType.DROPOUT, NodeType.BATCHNORM):
                node.metadata["inplace"] = True
        # Annotate graph with theoretical memory estimate (bytes, fp32)
        peak = 0
        for node in graph.nodes:
            if node.out_features:
                peak = max(peak, node.out_features * graph.batch_size * 4)
        graph._metadata = getattr(graph, "_metadata", {})
        graph._metadata["peak_memory_bytes"] = peak
        return graph


# -- Pass 3: Lazy Evaluation ------------------------------------------------

class LazyEvalPass(OptimizationPass):
    """
    Mark activations that immediately follow fused nodes as lazy
    (they will not be materialized as separate ops).
    """
    name = "lazy_eval"

    def run(self, graph: ComputationalGraph) -> ComputationalGraph:
        for node in graph.nodes:
            if node.metadata.get("fused_into"):
                node.lazy = True
        return graph


# -- Pass 4: Auto-Batching --------------------------------------------------

class AutoBatchingPass(OptimizationPass):
    """
    Suggest an optimal batch size based on device VRAM.
    Does NOT modify graph.batch_size (advisory only - recorded in metadata).
    """
    name = "auto_batching"

    VRAM_PRESETS = {
        "cpu":    4 * 1024**3,   # ~4 GB
        "cuda":   8 * 1024**3,   # ~8 GB typical
        "mps":    8 * 1024**3,
    }

    def run(self, graph: ComputationalGraph) -> ComputationalGraph:
        meta = getattr(graph, "_metadata", {})
        peak = meta.get("peak_memory_bytes", graph.batch_size * 1024)
        vram = self.VRAM_PRESETS.get(
            getattr(graph, "_device", "cpu"), 4 * 1024**3
        )
        largest_layer = max(
            (n.out_features or 1 for n in graph.nodes), default=1
        )
        optimal = max(1, vram // (largest_layer * 4 * 10))
        optimal = min(optimal, 2048)
        # Snap to power of 2
        optimal = 2 ** int(math.log2(optimal))
        meta["suggested_batch_size"] = optimal
        graph._metadata = meta
        return graph


# -- Pass 5: Leon Identity Stabilization -----------------------------------

class LeonIdentityPass(OptimizationPass):
    """
    Applies the Leon Identity formula to pre-compute a stable learning
    rate schedule and store it on the graph for the execution engine.

        P_{t+1} = P_t + γ·(1 - 1/ESI)·(P_∞ - P_t) + ε_t

    The resulting schedule is stored at graph._lr_schedule as a list
    of (epoch, lr) tuples.
    """
    name = "leon_identity"

    def __init__(self, gamma: float = 0.1, esi: float = 3.0, noise_scale: float = 1e-5):
        self.gamma = gamma
        self.esi = esi
        self.noise_scale = noise_scale

    def run(self, graph: ComputationalGraph) -> ComputationalGraph:
        lr0 = float(graph.optimizer_hparams.get("lr", 1e-3))
        p_inf = lr0 * 0.01          # steady-state target = 1% of initial
        p_t = lr0
        schedule = [(0, round(p_t, 8))]

        for t in range(1, graph.epochs + 1):
            eps_t = random.gauss(0, self.noise_scale)
            delta = self.gamma * (1 - 1.0 / self.esi) * (p_inf - p_t) + eps_t
            p_t = max(1e-8, p_t + delta)
            schedule.append((t, round(p_t, 8)))

        graph._lr_schedule = schedule
        meta = getattr(graph, "_metadata", {})
        meta["leon_identity_applied"] = True
        meta["lr_schedule_preview"] = schedule[:5]
        graph._metadata = meta
        return graph


# -- Optimizer pipeline -----------------------------------------------------

DEFAULT_PASSES: List[OptimizationPass] = [
    OperatorFusionPass(),
    MemoryOptPass(),
    LazyEvalPass(),
    AutoBatchingPass(),
    LeonIdentityPass(),
]


class GraphOptimizer:
    """Runs the full optimization pipeline over a ComputationalGraph."""

    def __init__(self, passes: List[OptimizationPass] = None):
        self.passes = passes if passes is not None else DEFAULT_PASSES

    def optimize(self, graph: ComputationalGraph) -> ComputationalGraph:
        for p in self.passes:
            graph = p.run(graph)
        return graph


def optimize(graph: ComputationalGraph) -> ComputationalGraph:
    """Apply the default optimization pipeline."""
    return GraphOptimizer().optimize(graph)
