"""Configuration-driven provider selection.

Business services depend on provider ports, never concrete sandbox adapters.
Adding a live provider should require registering an adapter here, not changing
circle/payment/identity domain logic.
"""
import os

from .providers import (
    SandboxIdentity,
    SandboxNotifications,
    SandboxPayments,
    UnconfiguredProvider,
)


def _provider_name(kind: str, sandbox: bool) -> str:
    default = "sandbox" if sandbox else "unconfigured"
    return os.getenv(f"AJO_{kind.upper()}_PROVIDER", default).strip().lower()


class ProviderRegistry:
    def __init__(self, *, sandbox: bool):
        self.sandbox = sandbox

    def payments(self):
        name = _provider_name("payment", self.sandbox)
        if name == "sandbox":
            if not self.sandbox:
                raise RuntimeError("Sandbox payment provider is disabled outside sandbox mode")
            return SandboxPayments()
        if name == "unconfigured":
            return UnconfiguredProvider()
        raise RuntimeError(f"Unknown payment provider: {name}")

    def identity(self):
        name = _provider_name("identity", self.sandbox)
        if name == "sandbox":
            if not self.sandbox:
                raise RuntimeError("Sandbox identity provider is disabled outside sandbox mode")
            return SandboxIdentity()
        if name == "unconfigured":
            return UnconfiguredProvider()
        raise RuntimeError(f"Unknown identity provider: {name}")

    def notifications(self):
        name = _provider_name("notification", self.sandbox)
        if name == "sandbox":
            if not self.sandbox:
                raise RuntimeError("Sandbox notification provider is disabled outside sandbox mode")
            return SandboxNotifications()
        if name == "unconfigured":
            return UnconfiguredProvider()
        raise RuntimeError(f"Unknown notification provider: {name}")
