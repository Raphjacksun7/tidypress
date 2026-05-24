"""YAML config bridge for Python-native commands."""

from __future__ import annotations

from collections.abc import Mapping
from pathlib import Path
from typing import Any

from docsmint.errors import DocsMintError
from docsmint.schema_validation import validate_docsmint_yaml

try:
    import yaml
except ModuleNotFoundError as exc:  # pragma: no cover - guarded by package dependency
    raise RuntimeError("PyYAML is required for docsmint YAML config support.") from exc

CONFIG_FILENAMES = ("docsmint.yaml", "docsmint.yml")


def _normalize_flag_name(name: str) -> str:
    return name.strip().replace("_", "-")


def discover_yaml_config(start_dir: Path | None = None) -> Path | None:
    """Find a docsmint YAML config by walking from cwd to root."""
    cursor = (start_dir or Path.cwd()).resolve()
    for directory in [cursor, *cursor.parents]:
        for file_name in CONFIG_FILENAMES:
            candidate = directory / file_name
            if candidate.is_file():
                return candidate
    return None


def load_yaml_config(config_path: Path | str | None = None) -> tuple[Path | None, dict[str, Any]]:
    """Load YAML config as a dictionary for Python command bridging."""
    resolved = Path(config_path).expanduser().resolve() if config_path else discover_yaml_config()
    if resolved is None:
        return None, {}
    if not resolved.is_file():
        raise DocsMintError(f"Config file not found: {resolved}", code="CONFIG_NOT_FOUND")

    text = resolved.read_text(encoding="utf-8")
    try:
        parsed = yaml.safe_load(text)
    except yaml.YAMLError as exc:
        raise DocsMintError(
            f"Invalid YAML config: {resolved}",
            code="CONFIG_INVALID_YAML",
            hint=str(exc),
        ) from exc

    if parsed is None:
        return resolved, {}
    if not isinstance(parsed, dict):
        raise DocsMintError(
            f"Expected YAML mapping at root: {resolved}",
            code="CONFIG_INVALID_SHAPE",
            hint="The root of docsmint.yaml must be an object/map.",
        )
    validate_docsmint_yaml(parsed)
    return resolved, parsed


def _mapping_to_flags(values: Mapping[str, Any]) -> list[str]:
    args: list[str] = []
    for key, value in values.items():
        flag = f"--{_normalize_flag_name(key)}"
        if isinstance(value, bool):
            if value:
                args.append(flag)
            continue
        if value is None:
            continue
        args.extend([flag, str(value)])
    return args


def bridge_command_args(config: Mapping[str, Any], command: str) -> list[str]:
    """Generate CLI flags from a `python` YAML section."""
    python_config = config.get("python")
    if not isinstance(python_config, Mapping):
        return []

    command_config = python_config.get(command)
    if not isinstance(command_config, Mapping):
        return []

    return _mapping_to_flags(command_config)
