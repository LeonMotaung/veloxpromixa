#!/usr/bin/env python3
"""
Velox Proxima (VP) — Developer CLI
====================================
Commands:
  velox compile  <model.vp>            Compile a .vp blueprint and print graph summary
  velox run      <model.vp>            Compile + execute training
  velox visualize <model.vp>           Compile + render DOT graph (requires graphviz)
  velox lint     <model.vp>            Validate without running (dry-run)

Usage examples:
  python -m velox compile mnist.vp
  python -m velox run mnist.vp --verbose
  python -m velox visualize mnist.vp --output graph.png
"""

import argparse
import logging
import sys
import os

# Allow running from inside the velox package directory
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from velox.dsl.lexer import Lexer
from velox.dsl.parser import Parser
from velox.compiler.graph_builder import compile_ast
from velox.compiler.types import CompilerError


def _parse_and_compile(filepath: str, verbose: bool = False):
    """Shared helper — read .vp file → ComputationalGraph."""
    if not os.path.isfile(filepath):
        print(f"[VP CLI] ✗ File not found: {filepath!r}", file=sys.stderr)
        sys.exit(1)
    if not filepath.endswith(".vp"):
        print(f"[VP CLI] ⚠  Warning: expected a .vp file, got {filepath!r}")

    with open(filepath, "r", encoding="utf-8") as fh:
        source = fh.read()

    try:
        lexer  = Lexer(source)
        tokens = lexer.tokenize()
        parser = Parser(tokens)
        ast    = parser.parse()
        graph  = compile_ast(ast, verbose=verbose)
        return graph
    except CompilerError as exc:
        print(f"\n{exc}", file=sys.stderr)
        sys.exit(1)
    except Exception as exc:
        print(f"\n[VP CLI] Unexpected error: {exc}", file=sys.stderr)
        if verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)


# ── Commands ──────────────────────────────────────────────────────────────────

def cmd_compile(args):
    graph = _parse_and_compile(args.file, verbose=args.verbose)
    print("\n" + "═" * 68)
    print("  VELOX PROXIMA — Compilation SUCCESSFUL ✓")
    print("═" * 68)
    print(graph.summary())


def cmd_lint(args):
    graph = _parse_and_compile(args.file, verbose=args.verbose)
    active = [n for n in graph.nodes if not n.eliminated]
    print(f"\n[VP Lint] ✓ {args.file!r} is valid — {len(active)} active nodes, "
          f"0 errors.")


def cmd_run(args):
    graph = _parse_and_compile(args.file, verbose=args.verbose)
    print("\n" + "═" * 68)
    print("  VELOX PROXIMA — Launching Training Engine")
    print("═" * 68)
    print(graph.summary())
    print()
    try:
        from velox.engine.executor import Executor
        executor = Executor(graph)
        executor.run()
    except ImportError:
        print("[VP CLI] ✗ Engine executor not found. Ensure velox.engine is installed.")
        sys.exit(1)
    except Exception as exc:
        print(f"[VP CLI] Training failed: {exc}", file=sys.stderr)
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)


def cmd_visualize(args):
    graph = _parse_and_compile(args.file, verbose=args.verbose)
    dot_src = graph.to_dot()

    dot_file  = args.output or (os.path.splitext(args.file)[0] + ".dot")
    png_file  = dot_file.replace(".dot", ".png")

    with open(dot_file, "w", encoding="utf-8") as fh:
        fh.write(dot_src)
    print(f"[VP Visualize] DOT written → {dot_file}")

    # Try to render with graphviz
    try:
        import subprocess
        result = subprocess.run(
            ["dot", "-Tpng", dot_file, "-o", png_file],
            capture_output=True, text=True
        )
        if result.returncode == 0:
            print(f"[VP Visualize] PNG rendered → {png_file}")
        else:
            print(f"[VP Visualize] ⚠  Graphviz render failed: {result.stderr.strip()}")
            print(f"  Install Graphviz: https://graphviz.org/download/")
    except FileNotFoundError:
        print(f"[VP Visualize] ⚠  Graphviz not found. Install from https://graphviz.org")
        print(f"  DOT source saved to {dot_file!r} — render manually.")


# ── CLI entry ─────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        prog="velox",
        description="Velox Proxima — Zero-Boilerplate ML Compiler CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python -m velox compile  model.vp --verbose
  python -m velox run      model.vp
  python -m velox visualize model.vp --output arch.png
  python -m velox lint     model.vp
        """
    )

    sub = parser.add_subparsers(title="commands", dest="command")
    sub.required = True

    # ── compile ──────────────────────────────────────────────────────────────
    p_compile = sub.add_parser("compile", help="Compile a .vp blueprint")
    p_compile.add_argument("file",    help="Path to .vp blueprint file")
    p_compile.add_argument("--verbose", action="store_true",
                           help="Enable debug-level compiler logging")
    p_compile.set_defaults(func=cmd_compile)

    # ── run ──────────────────────────────────────────────────────────────────
    p_run = sub.add_parser("run", help="Compile and train a .vp model")
    p_run.add_argument("file",        help="Path to .vp blueprint file")
    p_run.add_argument("--verbose",   action="store_true")
    p_run.set_defaults(func=cmd_run)

    # ── visualize ────────────────────────────────────────────────────────────
    p_vis = sub.add_parser("visualize", help="Render architecture as PNG")
    p_vis.add_argument("file",         help="Path to .vp blueprint file")
    p_vis.add_argument("--output",     default=None,
                       help="Output .dot / .png path (default: <model>.dot)")
    p_vis.add_argument("--verbose",    action="store_true")
    p_vis.set_defaults(func=cmd_visualize)

    # ── lint ─────────────────────────────────────────────────────────────────
    p_lint = sub.add_parser("lint", help="Validate without running")
    p_lint.add_argument("file",        help="Path to .vp blueprint file")
    p_lint.add_argument("--verbose",   action="store_true")
    p_lint.set_defaults(func=cmd_lint)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
