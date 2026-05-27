from pathlib import Path
from types import SimpleNamespace

import pytest

from tidypress.errors import TidyPressError
from tidypress.runtime import RuntimePaths, _ensure_node, _parse_node_version, run_cli


def test_parse_node_version() -> None:
    assert _parse_node_version("v22.12.1") == (22, 12, 1)


def test_parse_node_version_without_v_prefix() -> None:
    assert _parse_node_version("22.12.0") == (22, 12, 0)


def test_parse_node_version_rejects_invalid_values() -> None:
    with pytest.raises(TidyPressError, match="Could not parse Node version"):
        _parse_node_version("node-lts")


def test_run_cli_uses_node_with_resolved_cli_js(monkeypatch: pytest.MonkeyPatch) -> None:
    commands: list[list[str]] = []

    monkeypatch.setenv("TIDYPRESS_USE_NPX", "0")
    monkeypatch.setattr(
        "tidypress.runtime.resolve_runtime",
        lambda: RuntimePaths(node="node", cli_js=Path("/tmp/tidypress.js"), cli_exe="tidypress"),
    )
    monkeypatch.setattr(
        "tidypress.runtime.subprocess.run",
        lambda cmd, check=False: commands.append(cmd) or SimpleNamespace(returncode=0),
    )

    code = run_cli(["build"])

    assert code == 0
    assert commands == [["node", "/tmp/tidypress.js", "build"]]


def test_run_cli_ignores_python_wrapper_executable(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    wrapper = tmp_path / "tidypress"
    wrapper.write_text("#!/usr/bin/env python3\nfrom tidypress.cli import main\n", encoding="utf-8")

    monkeypatch.setenv("TIDYPRESS_USE_NPX", "0")
    monkeypatch.setattr(
        "tidypress.runtime.resolve_runtime",
        lambda: RuntimePaths(node="node", cli_js=None, cli_exe=str(wrapper)),
    )

    with pytest.raises(TidyPressError, match="tidypress CLI not found"):
        run_cli(["build"])


def test_run_cli_uses_npx_only_when_opted_in(monkeypatch: pytest.MonkeyPatch) -> None:
    commands: list[list[str]] = []

    monkeypatch.setenv("TIDYPRESS_USE_NPX", "1")
    monkeypatch.setattr("tidypress.runtime.shutil.which", lambda name: "/usr/bin/npx" if name == "npx" else None)
    monkeypatch.setattr(
        "tidypress.runtime.subprocess.run",
        lambda cmd, check=False: commands.append(cmd) or SimpleNamespace(returncode=0),
    )

    code = run_cli(["dev"])

    assert code == 0
    assert commands == [["/usr/bin/npx", "tidypress", "dev"]]


def test_run_cli_uses_cli_executable_when_not_python_wrapper(monkeypatch: pytest.MonkeyPatch) -> None:
    commands: list[list[str]] = []

    monkeypatch.setenv("TIDYPRESS_USE_NPX", "0")
    monkeypatch.setattr(
        "tidypress.runtime.resolve_runtime",
        lambda: RuntimePaths(node="node", cli_js=None, cli_exe="/usr/bin/tidypress"),
    )
    monkeypatch.setattr("tidypress.runtime._is_python_wrapper_executable", lambda _path: False)
    monkeypatch.setattr(
        "tidypress.runtime.subprocess.run",
        lambda cmd, check=False: commands.append(cmd) or SimpleNamespace(returncode=0),
    )

    code = run_cli(["preview"])

    assert code == 0
    assert commands == [["/usr/bin/tidypress", "preview"]]


def test_run_cli_requires_npx_when_opted_in(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("TIDYPRESS_USE_NPX", "1")
    monkeypatch.setattr("tidypress.runtime.shutil.which", lambda _name: None)

    with pytest.raises(TidyPressError, match="npx not found"):
        run_cli(["build"])


def test_ensure_node_rejects_invalid_override(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("TIDYPRESS_NODE", "/tmp/missing-node-bin")

    with pytest.raises(TidyPressError, match="TIDYPRESS_NODE not found"):
        _ensure_node()
