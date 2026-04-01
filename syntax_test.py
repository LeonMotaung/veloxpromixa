from velox.dsl.parser import parse
from velox.compiler.graph_builder import compile_ast
from velox.optimizer.optimizer import optimize

src = """
layer Dense (128)
layer Dense (?)
layer Dense (64)
train on mnist
optimizer adam lr=0.001
epochs 10
batch_size 64
loss cross_entropy
save models/mnist_10ep.pt
plot all to plots/mnist_curves.png
eval on test
"""

print("=== PARSE ===")
ast = parse(src)
print(f"  layers : {len(ast.layers)}")
print(f"  save   : {ast.save}")
print(f"  plot   : {ast.plot}")
print(f"  eval   : {ast.eval}")

print("\n=== COMPILE ===")
graph = compile_ast(ast)
print(f"  nodes      : {len(graph.nodes)}")
print(f"  save_path  : {graph.save_path}")
print(f"  plot_targets: {graph.plot_targets}")
print(f"  plot_save  : {graph.plot_save_path}")
print(f"  eval_split : {graph.eval_split}")
for n in graph.nodes:
    inf = " [?->inferred]" if n.metadata.get("inferred") else ""
    print(f"  {n.layer_type:12s}  in={n.in_features:<6}  out={n.out_features}{inf}")

print("\nSYNTAX_OK")
