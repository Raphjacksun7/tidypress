import pytest

from docsmint.errors import DocsMintError
from docsmint.router import is_node_command, run_python_stub


def test_is_node_command_for_core_cli() -> None:
    assert is_node_command(["build"]) is True
    assert is_node_command(["--help"]) is True
    assert is_node_command(["import", "devto", "https://dev.to/u/s"]) is True
    assert is_node_command(["migrate-sections"]) is True
    assert is_node_command(["add-version", "v2"]) is True


def test_is_node_command_rejects_python_only_commands() -> None:
    assert is_node_command(["convert"]) is False
    assert is_node_command(["extract-docs"]) is False


def test_is_node_command_defaults_true_for_empty_args() -> None:
    assert is_node_command([]) is True


def test_python_stub_for_unimplemented_command() -> None:
    with pytest.raises(DocsMintError, match="Missing notebook input path"):
        run_python_stub(["convert"])


def test_python_stub_raises_when_config_flag_missing_value() -> None:
    with pytest.raises(DocsMintError, match="Missing value for --config"):
        run_python_stub(["convert", "--config"])


def test_python_stub_merges_yaml_bridged_args(monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]) -> None:
    monkeypatch.setattr(
        "docsmint.router.load_yaml_config",
        lambda config_path=None: (None, {"python": {"convert": {"input": "notes.ipynb", "watch": True}}}),
    )
    monkeypatch.setattr("docsmint.router.convert_notebook", lambda _options: "docs/post.mdx")
    code = run_python_stub(["convert", "--output", "docs/post.mdx"])
    stdout = capsys.readouterr().out
    assert code == 0
    assert "Converted notebook to docs/post.mdx" in stdout


def test_python_stub_for_unknown_command() -> None:
    assert run_python_stub(["unknown"]) == 2


def test_python_stub_without_args_returns_success() -> None:
    assert run_python_stub([]) == 0
