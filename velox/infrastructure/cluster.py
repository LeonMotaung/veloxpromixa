"""
Velox Proxima (VP) — Infrastructure Layer
Layer 5: Infrastructure Layer

Handles cluster management, auto-scaling, fault tolerance,
and Kubernetes-style orchestration stubs.
"""

import os
import time
import threading
from typing import List, Dict, Optional
from dataclasses import dataclass, field


@dataclass
class ClusterNode:
    """Represents a single compute node in the VP cluster."""
    node_id: str
    device: str = "cpu"
    vram_gb: float = 0.0
    utilization: float = 0.0
    status: str = "idle"   # idle | active | fault


@dataclass
class Cluster:
    """
    Represents a VP compute cluster.

    In production this would interface with Kubernetes / SLURM.
    Here it models the local device topology.
    """
    name: str = "cluster_a"
    nodes: List[ClusterNode] = field(default_factory=list)
    _stop: threading.Event = field(default_factory=threading.Event, repr=False)
    _monitor_thread: Optional[threading.Thread] = field(default=None, repr=False)

    def __post_init__(self):
        self._stop = threading.Event()
        self._monitor_thread = None

    # ------------------------------------------------------------------ #
    # Initialization                                                       #
    # ------------------------------------------------------------------ #

    @classmethod
    def from_device_manager(cls, dm, name: str = "cluster_a") -> "Cluster":
        """Build a Cluster from the DeviceManager's detected hardware."""
        cluster = cls(name=name)
        for i, dev_name in enumerate(dm.device_names):
            node = ClusterNode(
                node_id=f"{dm.device}:{i}",
                device=dm.device,
                vram_gb=8.0 if dm.is_gpu else 0.0,
            )
            cluster.nodes.append(node)
        return cluster

    # ------------------------------------------------------------------ #
    # Auto-scaling                                                         #
    # ------------------------------------------------------------------ #

    def scale_up(self, n: int = 1):
        """Simulate adding n new nodes (for demo / distributed mock)."""
        existing = len(self.nodes)
        for i in range(n):
            node = ClusterNode(
                node_id=f"virtual:{existing + i}",
                device="cpu",
                status="idle",
            )
            self.nodes.append(node)
        print(f"[VP] Cluster '{self.name}' scaled up to {len(self.nodes)} node(s).")

    def scale_down(self, n: int = 1):
        """Simulate removing n nodes."""
        removable = [node for node in self.nodes if node.status == "idle"]
        for node in removable[:n]:
            self.nodes.remove(node)
        print(f"[VP] Cluster '{self.name}' scaled down to {len(self.nodes)} node(s).")

    # ------------------------------------------------------------------ #
    # Fault tolerance                                                      #
    # ------------------------------------------------------------------ #

    def check_health(self) -> Dict[str, str]:
        """Return a health report for all nodes."""
        report = {}
        for node in self.nodes:
            if node.utilization > 0.95:
                node.status = "overloaded"
            report[node.node_id] = node.status
        return report

    def restart_faulted(self):
        """Attempt to restart any faulted nodes."""
        for node in self.nodes:
            if node.status == "fault":
                node.status = "idle"
                print(f"[VP] Node {node.node_id} recovered from fault.")

    # ------------------------------------------------------------------ #
    # Monitoring                                                           #
    # ------------------------------------------------------------------ #

    def start_monitoring(self, interval: float = 5.0):
        """Start a background thread that prints cluster health."""
        self._stop.clear()

        def _loop():
            while not self._stop.is_set():
                health = self.check_health()
                active = sum(1 for s in health.values() if s == "active")
                print(
                    f"[VP] Cluster '{self.name}'  "
                    f"nodes={len(self.nodes)}  active={active}  "
                    f"health={health}"
                )
                self._stop.wait(interval)

        self._monitor_thread = threading.Thread(target=_loop, daemon=True)
        self._monitor_thread.start()

    def stop_monitoring(self):
        self._stop.set()

    # ------------------------------------------------------------------ #
    # Summary                                                              #
    # ------------------------------------------------------------------ #

    def banner(self) -> str:
        gpu_nodes = [n for n in self.nodes if n.device in ("cuda", "mps")]
        return (
            f"[VP] Grid {self.name!r} initialized: "
            f"{len(self.nodes)} node(s), "
            f"{len(gpu_nodes)} GPU(s) detected."
        )
