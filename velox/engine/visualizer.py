import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
from typing import List, Dict

class LivePlotter:
    """Non-blocking interactive plotter for Velox Proxima."""
    
    def __init__(self, dataset_name: str, targets: List[str]):
        self.dataset_name = dataset_name
        self.targets = [t.lower() for t in targets]
        self.history: List[Dict] = []
        
        # Initialize the figure
        plt.ion()  # interactive mode ON
        n_plots = sum(1 for t in self.targets if t in ("loss", "accuracy", "lr"))
        if n_plots == 0: n_plots = 1
        
        self.fig, self.axes = plt.subplots(1, n_plots, figsize=(5 * n_plots, 4))
        if n_plots == 1: self.axes = [self.axes]
        
        self.colors = {"loss": "#E63946", "accuracy": "#457B9D", "lr": "#2A9D8F"}
        self.fig.suptitle(f"Velox Proxima — Live Training [{dataset_name.upper()}]", 
                         fontsize=14, fontweight="bold")
        plt.tight_layout(rect=[0, 0.03, 1, 0.95])
        
    def __call__(self, epoch: int, loss: float, acc: float, lr: float = 0.0):
        """Callback function for the executor."""
        self.history.append({"epoch": epoch, "loss": loss, "acc": acc, "lr": lr})
        self.update()

    def update(self):
        if not self.history: return
        
        epochs = [r["epoch"] for r in self.history]
        ax_idx = 0
        
        if "loss" in self.targets:
            ax = self.axes[ax_idx]; ax_idx += 1
            ax.clear()
            vals = [r["loss"] for r in self.history]
            ax.plot(epochs, vals, color=self.colors["loss"], lw=2, marker="o", ms=4)
            ax.set_title("Loss", fontsize=12)
            ax.grid(True, alpha=0.3)
            ax.set_xlabel("Epoch")
            
        if "accuracy" in self.targets:
            ax = self.axes[ax_idx]; ax_idx += 1
            ax.clear()
            vals = [r["acc"] for r in self.history]
            ax.plot(epochs, vals, color=self.colors["accuracy"], lw=2, marker="s", ms=4)
            ax.set_title("Accuracy (%)", fontsize=12)
            ax.set_ylim(0, 105)
            ax.grid(True, alpha=0.3)
            ax.set_xlabel("Epoch")

        if "lr" in self.targets:
            ax = self.axes[ax_idx]; ax_idx += 1
            ax.clear()
            vals = [r.get("lr", 0) for r in self.history]
            ax.plot(epochs, vals, color=self.colors["lr"], lw=2, marker="^", ms=4)
            ax.set_title("Learning Rate", fontsize=12)
            ax.grid(True, alpha=0.3)
            ax.set_xlabel("Epoch")

        plt.pause(0.01) # trigger drawing
        self.fig.canvas.draw()
        self.fig.canvas.flush_events()

    def finalize(self):
        plt.ioff() # interactive mode OFF
        plt.show()
