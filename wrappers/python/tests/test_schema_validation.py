from pathlib import Path

import pytest

from tidypress.errors import TidyPressError
from tidypress.schema_validation import validate_tidypress_yaml
from tidypress.yaml_config import load_yaml_config


def test_validate_tidypress_yaml_rejects_unknown_keys() -> None:
    with pytest.raises(TidyPressError, match="schema validation"):
        validate_tidypress_yaml({"unknown": True})


def test_load_yaml_config_validates_against_shared_schema(tmp_path: Path) -> None:
    config_file = tmp_path / "tidypress.yaml"
    config_file.write_text(
        "python:\n  convert:\n    input_path: notes.ipynb\n    watch: true\n",
        encoding="utf-8",
    )
    path, config = load_yaml_config(config_path=config_file)
    assert path == config_file
    assert config["python"]["convert"]["input_path"] == "notes.ipynb"


def test_load_yaml_config_rejects_invalid_schema(tmp_path: Path) -> None:
    config_file = tmp_path / "tidypress.yaml"
    config_file.write_text("python:\n  convert:\n    lang: py\n", encoding="utf-8")
    with pytest.raises(TidyPressError, match="schema validation"):
        load_yaml_config(config_path=config_file)
