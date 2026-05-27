from pathlib import Path

import pytest

from tidypress.errors import TidyPressError
from tidypress.yaml_config import bridge_command_args, discover_yaml_config, load_yaml_config


def test_discover_yaml_config_walks_parents(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    root = tmp_path / "repo"
    nested = root / "docs" / "notes"
    nested.mkdir(parents=True)
    (root / "tidypress.yaml").write_text("python:\n  convert:\n    input: notes.ipynb\n", encoding="utf-8")
    monkeypatch.chdir(nested)
    assert discover_yaml_config() == root / "tidypress.yaml"


def test_load_yaml_config_returns_empty_when_missing(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    monkeypatch.chdir(tmp_path)
    path, config = load_yaml_config()
    assert path is None
    assert config == {}


def test_load_yaml_config_rejects_non_mapping_root(tmp_path: Path) -> None:
    config_file = tmp_path / "tidypress.yaml"
    config_file.write_text("- one\n- two\n", encoding="utf-8")
    with pytest.raises(TidyPressError, match="Expected YAML mapping"):
        load_yaml_config(config_path=config_file)


def test_bridge_command_args_maps_scalars_and_booleans() -> None:
    bridged = bridge_command_args(
        {"python": {"convert": {"input_path": "analysis.ipynb", "watch": True, "dry_run": False}}},
        "convert",
    )
    assert bridged == ["--input-path", "analysis.ipynb", "--watch"]


def test_bridge_command_args_ignores_unknown_sections() -> None:
    assert bridge_command_args({"config": {"convert": {"input": "x"}}}, "convert") == []
