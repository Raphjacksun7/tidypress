from pathlib import Path
from types import SimpleNamespace

import pytest

from docsmint.errors import DocsMintError
from docsmint.runtime import RuntimePaths, _ensure_node, _parse_node_version, run_cli


def test_parse_node_version() -> None:
    assert _parse_node_version("v22.12.1") == (22, 12, 1)


def test_parse_node_version_without_v_prefix() -> None:
    assert _parse_node_version("22.12.0") == (22, 12, 0)


def test_parse_node_version_rejects_invalid_values() -> None:
    with pytest.raises(DocsMintError, match="Could not parse Node version"):
        _parse_node_version("node-lts")


def test_run_cli_uses_node_with_resolved_cli_js(monkeypatch: pytest.MonkeyPatch) -> None:
    commands: list[list[str]] = []

    monkeypatch.setenv("DOCSMINT_USE_NPX", "0")
    monkeypatch.setattr(
        "docsmint.runtime.resolve_runtime",
        lambda: RuntimePaths(node="node", cli_js=Path("/tmp/docsmint.js"), cli_exe="docsmint"),
    )
    monkeypatch.setattr(
        "docsmint.runtime.subprocess.run",
        lambda cmd, check=False: commands.append(cmd) or SimpleNamespace(returncode=0),
    )

    code = run_cli(["build"])

    assert code == 0
    assert commands == [["node", "/tmp/docsmint.js", "build"]]


def test_run_cli_ignores_python_wrapper_executable(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    wrapper = tmp_path / "docsmint"
    wrapper.write_text("#!/usr/bin/env python3\nfrom docsmint.cli import main\n", encoding="utf-8")

    monkeypatch.setenv("DOCSMINT_USE_NPX", "0")
    monkeypatch.setattr(
        "docsmint.runtime.resolve_runtime",
        lambda: RuntimePaths(node="node", cli_js=None, cli_exe=str(wrapper)),
    )

    with pytest.raises(DocsMintError, match="docsmint CLI not found"):
        run_cli(["build"])


def test_run_cli_uses_npx_only_when_opted_in(monkeypatch: pytest.MonkeyPatch) -> None:
    commands: list[list[str]] = []

    monkeypatch.setenv("DOCSMINT_USE_NPX", "1")
    monkeypatch.setattr("docsmint.runtime.shutil.which", lambda name: "/usr/bin/npx" if name == "npx" else None)
    monkeypatch.setattr(
        "docsmint.runtime.subprocess.run",
        lambda cmd, check=False: commands.append(cmd) or SimpleNamespace(returncode=0),
    )

    code = run_cli(["dev"])

    assert code == 0
    assert commands == [["/usr/bin/npx", "docsmint", "dev"]]


def test_run_cli_uses_cli_executable_when_not_python_wrapper(monkeypatch: pytest.MonkeyPatch) -> None:
    commands: list[list[str]] = []

    monkeypatch.setenv("DOCSMINT_USE_NPX", "0")
    monkeypatch.setattr(
        "docsmint.runtime.resolve_runtime",
        lambda: RuntimePaths(node="node", cli_js=None, cli_exe="/usr/bin/docsmint"),
    )
    monkeypatch.setattr("docsmint.runtime._is_python_wrapper_executable", lambda _path: False)
    monkeypatch.setattr(
        "docsmint.runtime.subprocess.run",
        lambda cmd, check=False: commands.append(cmd) or SimpleNamespace(returncode=0),
    )

    code = run_cli(["preview"])

    assert code == 0
    assert commands == [["/usr/bin/docsmint", "preview"]]


def test_run_cli_requires_npx_when_opted_in(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("DOCSMINT_USE_NPX", "1")
    monkeypatch.setattr("docsmint.runtime.shutil.which", lambda _name: None)

    with pytest.raises(DocsMintError, match="npx not found"):
        run_cli(["build"])


def test_ensure_node_rejects_invalid_override(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("DOCSMINT_NODE", "/tmp/missing-node-bin")

    with pytest.raises(DocsMintError, match="DOCSMINT_NODE not found"):
        _ensure_node()
