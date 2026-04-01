"""
Velox Proxima (VP) — Abstract Syntax Tree Node Definitions
Layer 1: Syntax Layer
"""

from dataclasses import dataclass, field
from typing import Optional, List, Union


@dataclass
class ASTNode:
    """Base AST node."""
    line: int = 0


@dataclass
class LayerNode(ASTNode):
    """Represents a single layer declaration.

    Examples:
        layer Dense (128)
        layer Dense (?)
        layer Conv2D (64, 3)
        layer Dropout (0.5)
        layer LSTM (256)
        layer BatchNorm ()
    """
    layer_type: str = ""
    params: List[Union[int, float, str]] = field(default_factory=list)
    infer: bool = False           # True when '?' is present


@dataclass
class TrainNode(ASTNode):
    """Represents a train directive.

    Examples:
        train on mnist
        train on cifar10
        train on iris
    """
    dataset: str = ""


@dataclass
class OptimizerNode(ASTNode):
    """Represents an optimizer specification.

    Examples:
        optimizer adam lr=0.001
        optimizer sgd lr=0.01 momentum=0.9
    """
    name: str = "adam"
    hyperparams: dict = field(default_factory=dict)


@dataclass
class EpochsNode(ASTNode):
    """Represents the epoch count directive.

    Example:
        epochs 20
    """
    count: int = 10


@dataclass
class BatchSizeNode(ASTNode):
    """Represents the batch size directive.

    Example:
        batch_size 32
    """
    size: int = 32


@dataclass
class LossNode(ASTNode):
    """Represents the loss function directive.

    Examples:
        loss cross_entropy
        loss mse
    """
    name: str = "cross_entropy"


@dataclass
class SaveNode(ASTNode):
    """Represents a model save directive.

    Examples:
        save model.pt
        save weights/mnist.pt
    """
    path: str = "model.pt"


@dataclass
class PlotNode(ASTNode):
    """Represents a plot directive.

    Examples:
        plot loss
        plot accuracy
        plot all
    """
    targets: List[str] = field(default_factory=lambda: ["loss", "accuracy"])
    save_path: Optional[str] = None   # if set, save to file instead of showing
    live: bool = False               # if True, show live charts during training



@dataclass
class EvalNode(ASTNode):
    """Represents an eval directive.

    Examples:
        eval on test
        eval on train
    """
    split: str = "test"


@dataclass
class AttentionNode(ASTNode):
    """Represents an Attention layer.
    
    Examples:
        layer Attention (8, 512)
        layer Attention (heads=8)
    """
    heads: int = 8
    dim: Optional[int] = None # if None, use inferred feature dim

@dataclass
class ModelNode(ASTNode):
    """Root AST node — represents an entire VP program."""
    layers: List[LayerNode] = field(default_factory=list)
    train: Optional[TrainNode] = None
    optimizer: Optional[OptimizerNode] = None
    epochs: Optional[EpochsNode] = None
    batch_size: Optional[BatchSizeNode] = None
    loss: Optional[LossNode] = None
    save: Optional[SaveNode] = None
    plot: Optional[PlotNode] = None
    eval: Optional[EvalNode] = None

    def __repr__(self):
        lines = ["ModelNode("]
        for layer in self.layers:
            lines.append(f"  {layer}")
        if self.train:
            lines.append(f"  {self.train}")
        if self.optimizer:
            lines.append(f"  {self.optimizer}")
        if self.epochs:
            lines.append(f"  {self.epochs}")
        if self.save:
            lines.append(f"  {self.save}")
        if self.plot:
            lines.append(f"  {self.plot}")
        if self.eval:
            lines.append(f"  {self.eval}")
        lines.append(")")
        return "\n".join(lines)

