"""
Velox Proxima (VP) — Command Line Interface

Usage:
    vp run model.vp
    vp run model.vp --epochs 20 --verbose
    vp parse model.vp
    vp compile model.vp
    vp version
"""

import argparse
import sys
from pathlib import Path


def cmd_run(args):
    from velox.runtime import VeloxRuntime
    rt = VeloxRuntime(verbose=not args.quiet)

    # Override epochs/batch if provided via CLI
    source = Path(args.file).read_text(encoding="utf-8")

    overrides = []
    if args.epochs:
        overrides.append(f"epochs {args.epochs}")
    if args.batch_size:
        overrides.append(f"batch_size {args.batch_size}")
    if args.optimizer:
        lr_str = f" lr={args.lr}" if args.lr else ""
        overrides.append(f"optimizer {args.optimizer}{lr_str}")
    if overrides:
        source = source.rstrip() + "\n" + "\n".join(overrides) + "\n"

    results = rt.run_source(source)
    print(f"\n[VP] Final Test Accuracy: {results['test_accuracy']:.2f}%")


def cmd_parse(args):
    from velox.dsl.parser import parse
    source = Path(args.file).read_text(encoding="utf-8")
    ast = parse(source)
    print("[VP] AST:")
    print(ast)


def cmd_compile(args):
    from velox.dsl.parser import parse
    from velox.compiler.graph_builder import compile_ast
    from velox.optimizer.optimizer import optimize
    source = Path(args.file).read_text(encoding="utf-8")
    ast = parse(source)
    graph = optimize(compile_ast(ast))
    print("[VP] Optimised Computational Graph:")
    print(graph.summary())


def cmd_version(_args):
    from velox.runtime import VP_VERSION
    print(f"Velox Proxima v{VP_VERSION}")


def main():
    parser = argparse.ArgumentParser(
        prog="vp",
        description="Velox Proxima — Declarative AI Language & Runtime",
    )
    sub = parser.add_subparsers(dest="command")

    # run
    p_run = sub.add_parser("run", help="Run a .vp file")
    p_run.add_argument("file", help="Path to the .vp source file")
    p_run.add_argument("--epochs",     type=int,   default=None)
    p_run.add_argument("--batch-size", type=int,   default=None, dest="batch_size")
    p_run.add_argument("--optimizer",  type=str,   default=None)
    p_run.add_argument("--lr",         type=float, default=None)
    p_run.add_argument("--quiet",      action="store_true")

    # parse
    p_parse = sub.add_parser("parse", help="Parse a .vp file and print the AST")
    p_parse.add_argument("file")

    # compile
    p_compile = sub.add_parser("compile", help="Compile and optimise a .vp file")
    p_compile.add_argument("file")

    # version
    sub.add_parser("version", help="Print VP version")

    args = parser.parse_args()

    dispatch = {
        "run":     cmd_run,
        "parse":   cmd_parse,
        "compile": cmd_compile,
        "version": cmd_version,
    }

    if args.command not in dispatch:
        parser.print_help()
        sys.exit(1)

    dispatch[args.command](args)


if __name__ == "__main__":
    main()
