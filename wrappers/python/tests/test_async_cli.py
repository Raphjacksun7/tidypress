import asyncio
from pathlib import Path

import pytest

from docsmint.async_cli import run_cli_async, strip_cli_mode_flags


def test_strip_cli_mode_flags_defaults_build_to_streaming() -> None:
    argv, streaming = strip_cli_mode_flags(["build"])
    assert argv == ["build"]
    assert streaming is True


def test_strip_cli_mode_flags_sync_disables_streaming() -> None:
    argv, streaming = strip_cli_mode_flags(["build", "--sync"])
    assert argv == ["build"]
    assert streaming is False


def test_run_cli_async_invokes_node(monkeypatch: pytest.MonkeyPatch) -> None:
    calls: list[list[str]] = []

    class FakeProcess:
        def __init__(self) -> None:
            self.returncode = 0

        async def wait(self) -> int:
            return 0

    async def fake_exec(*cmd: str) -> FakeProcess:
        calls.append(list(cmd))
        return FakeProcess()

    monkeypatch.setenv("DOCSMINT_USE_NPX", "0")
    monkeypatch.setattr(
        "docsmint.async_cli.resolve_runtime",
        lambda: type("Paths", (), {"node": "node", "cli_js": Path("/tmp/docsmint.js"), "cli_exe": None})(),
    )
    monkeypatch.setattr("docsmint.async_cli.asyncio.create_subprocess_exec", fake_exec)

    code = asyncio.run(run_cli_async(["build"]))
    assert code == 0
    assert calls == [["node", "/tmp/docsmint.js", "build"]]
