from velox.dsl.parser import parse
from velox.compiler.graph_builder import compile_ast
from velox.optimizer.optimizer import optimize

src = """
layer Dense (128)
layer Dense (?)
layer Dense (64)
train on mnist
optimizer adam lr=0.001
epochs 5
batch_size 32
loss cross_entropy
"""

print("=== PARSE ===")
ast = parse(src)
print(ast)

print()
print("=== COMPILE ===")
graph = compile_ast(ast)
print(graph.summary())

print()
print("=== OPTIMIZE ===")
graph = optimize(graph)
meta = getattr(graph, "_metadata", {})
lr_sched = getattr(graph, "_lr_schedule", [])
print("Leon Identity applied:", meta.get("leon_identity_applied"))
print("LR schedule (first 5):", lr_sched[:5])
peak_kb = meta.get("peak_memory_bytes", 0) / 1024
print(f"Peak memory: {peak_kb:.1f} KB")
print()
print("All layers after optimization:")
for n in graph.nodes:
    fused = n.metadata.get("fused_activation", "-")
    print(f"  {n}  fused_act={fused}  lazy={n.lazy}")
