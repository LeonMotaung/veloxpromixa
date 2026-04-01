"""
Velox Proxima (VP) — Main Runtime
Orchestrates all 5 architectural layers:

    VP Source Code
        ↓  [Layer 1] Syntax Layer    — Lexer + Parser → AST
        ↓  [Layer 2] Compiler Layer  — AST → ComputationalGraph G=(V,E)
        ↓  [Layer 3] Optimizer       — Graph transformations
        ↓  [Layer 4] Execution Engine — PyTorch model training
        ↓  [Layer 5] Infrastructure  — Cluster management
"""

import time
from typing import Optional, Callable, Union
from pathlib import Path

from .dsl.parser import parse
from .compiler.graph_builder import compile_ast
from .optimizer.optimizer import optimize
from .engine.device_manager import DeviceManager
from .engine.executor import Executor
from .infrastructure.cluster import Cluster


VP_VERSION = "0.1.0"

BANNER = f"""
╔══════════════════════════════════════════════════════╗
║          Velox Proxima  v{VP_VERSION}                       ║
║    Declarative AI Language & Runtime System          ║
║    Zero-Boilerplate ML  ·  Autonomous Scaling        ║
╚══════════════════════════════════════════════════════╝
"""


class VeloxRuntime:
    """
    The VP Runtime — single entry point for the full pipeline.

    Usage
    -----
        rt = VeloxRuntime()
        results = rt.run_source('''
            layer Dense (128)
            layer Dense (?)
            layer Dense (64)
            train on mnist
            epochs 5
        ''')

    Or from a file:
        results = rt.run_file("model.vp")
    """

    def __init__(self, verbose: bool = True):
        self.verbose = verbose
        self._dm = DeviceManager()

    def _log(self, msg: str):
        if self.verbose:
            print(msg)

    # ------------------------------------------------------------------ #
    # Public API                                                           #
    # ------------------------------------------------------------------ #

    def run_source(
        self,
        source: str,
        callback: Optional[Callable] = None,
    ) -> dict:
        """Run VP source code through the full pipeline."""
        return self._pipeline(source, callback)

    def run_file(
        self,
        path: Union[str, Path],
        callback: Optional[Callable] = None,
    ) -> dict:
        """Load a .vp file and run it through the full pipeline."""
        path = Path(path)
        if not path.exists():
            raise FileNotFoundError(f"[VP] File not found: {path}")
        source = path.read_text(encoding="utf-8")
        self._log(f"[VP] Loaded: {path.name}")
        return self._pipeline(source, callback)

    def parse_only(self, source: str):
        """Return the AST without compiling or executing."""
        return parse(source)

    def compile_only(self, source: str):
        """Return the optimised ComputationalGraph without executing."""
        ast = parse(source)
        graph = compile_ast(ast)
        graph = optimize(graph)
        return graph

    # ------------------------------------------------------------------ #
    # Internal pipeline                                                    #
    # ------------------------------------------------------------------ #

    def _pipeline(self, source: str, callback) -> dict:
        if self.verbose:
            print(BANNER)

        t0 = time.time()

        # ── Layer 1: Syntax
        self._log("[VP] [1/5] Syntax Layer — lexing & parsing ...")
        ast = parse(source)
        self._log(f"      → {len(ast.layers)} layer(s) parsed")

        # ── Layer 2: Compiler
        self._log("[VP] [2/5] Compiler Layer — building computational graph ...")
        graph = compile_ast(ast)
        self._log(f"      → Graph G=({len(graph.nodes)} nodes, {len(graph.edges)} edges)")

        # Print shape-inferred nodes
        for node in graph.nodes:
            tag = "  [?→inferred]" if node.metadata.get("inferred") else ""
            self._log(
                f"         {node.layer_type:12s}  "
                f"in={node.in_features:<6}  out={node.out_features}{tag}"
            )

        # ── Layer 3: Optimizer
        self._log("[VP] [3/5] Optimization Layer — applying transforms ...")
        graph._device = self._dm.device
        graph = optimize(graph)
        meta = getattr(graph, "_metadata", {})
        if meta.get("leon_identity_applied"):
            preview = meta.get("lr_schedule_preview", [])
            self._log(f"      → Leon Identity: LR schedule computed ({len(getattr(graph, '_lr_schedule', []))} steps)")
        fused = sum(1 for n in graph.nodes if n.metadata.get("fused_activation"))
        self._log(f"      → Operator fusion: {fused} pair(s) fused")
        peak_mb = meta.get("peak_memory_bytes", 0) / 1024**2
        self._log(f"      → Peak memory estimate: {peak_mb:.1f} MB")

        # ── Layer 5: Infrastructure (init cluster before execution)
        self._log("[VP] [4/5] Infrastructure Layer — initialising cluster ...")
        cluster = Cluster.from_device_manager(self._dm)
        self._log(f"      {cluster.banner()}")

        # ── Layer 4: Execution
        self._log("[VP] [5/5] Execution Engine — training model ...")
        executor = Executor(graph, verbose=self.verbose)
        results = executor.run(callback=callback)

        total = time.time() - t0
        self._log(f"\n[VP] Pipeline complete in {total:.1f}s. Equilibrium stable.")

        return {
            "ast": ast,
            "graph": graph,
            "cluster": cluster,
            **results,
        }
