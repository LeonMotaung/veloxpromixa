"""
Velox Proxima (VP) — Device Manager
Layer 4: Execution Engine

Detects available compute hardware and returns the best device.
Supports CPU, CUDA (NVIDIA GPU), and MPS (Apple Silicon).
"""

import sys
from typing import Optional


class DeviceManager:
    """
    Detects and manages compute hardware.

    Priority: CUDA > MPS > CPU
    """

    def __init__(self):
        self._device: Optional[str] = None
        self._device_count: int = 0
        self._device_names: list = []
        self._detect()

    def _detect(self):
        try:
            import torch
            if torch.cuda.is_available():
                self._device = "cuda"
                self._device_count = torch.cuda.device_count()
                self._device_names = [
                    torch.cuda.get_device_name(i)
                    for i in range(self._device_count)
                ]
            elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
                self._device = "mps"
                self._device_count = 1
                self._device_names = ["Apple MPS"]
            else:
                self._device = "cpu"
                self._device_count = 1
                import multiprocessing
                self._device_names = [
                    f"CPU ({multiprocessing.cpu_count()} cores)"
                ]
        except ImportError:
            self._device = "cpu"
            self._device_count = 1
            self._device_names = ["CPU (PyTorch not available)"]

    # ------------------------------------------------------------------ #
    # Properties                                                           #
    # ------------------------------------------------------------------ #

    @property
    def device(self) -> str:
        return self._device

    @property
    def device_count(self) -> int:
        return self._device_count

    @property
    def device_names(self) -> list:
        return self._device_names

    @property
    def is_gpu(self) -> bool:
        return self._device in ("cuda", "mps")

    def banner(self) -> str:
        names = ", ".join(self._device_names)
        return (
            f"[VP] Device Manager: {self._device.upper()} "
            f"| {self._device_count} device(s) detected — {names}"
        )

    def torch_device(self):
        """Return a torch.device object for the selected device."""
        try:
            import torch
            return torch.device(self._device)
        except ImportError:
            return None
