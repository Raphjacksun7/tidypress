"""Validate docsmint.yaml using the shared JSON Schema from @docsmint/config."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

from docsmint.errors import DocsMintError

try:
    import jsonschema
    from jsonschema import Draft202012Validator
except ModuleNotFoundError as exc:  # pragma: no cover
    raise RuntimeError("jsonschema is required for docsmint YAML validation.") from exc

_SCHEMA_FILE = "docsmint-yaml.schema.json"


def _bundled_schema_path() -> Path:
    return Path(__file__).resolve().parent / "schemas" / _SCHEMA_FILE


def _resolve_schema_from_node_modules() -> Path | None:
    cursor = Path.cwd().resolve()
    for directory in [cursor, *cursor.parents]:
        for parts in (
            ("node_modules", "@docsmint", "config", "src", "schemas", _SCHEMA_FILE),
            (
                "node_modules",
                "docsmint",
                "node_modules",
                "@docsmint",
                "config",
                "src",
                "schemas",
                _SCHEMA_FILE,
            ),
        ):
            candidate = directory.joinpath(*parts)
            if candidate.is_file():
                return candidate
    return None


def resolve_yaml_schema_path() -> Path:
    override = os.environ.get("DOCSMINT_YAML_SCHEMA")
    if override:
        path = Path(override).expanduser().resolve()
        if not path.is_file():
            raise DocsMintError(f"DOCSMINT_YAML_SCHEMA not found: {path}", code="SCHEMA_NOT_FOUND")
        return path

    from_node = _resolve_schema_from_node_modules()
    if from_node:
        return from_node

    bundled = _bundled_schema_path()
    if bundled.is_file():
        return bundled

    raise DocsMintError(
        "Shared docsmint.yaml schema not found.",
        code="SCHEMA_NOT_FOUND",
        hint="Install docsmint from npm or use the bundled Python package.",
    )


def load_yaml_schema() -> dict[str, Any]:
    return json.loads(resolve_yaml_schema_path().read_text(encoding="utf-8"))


def validate_docsmint_yaml(document: Any) -> None:
    """Raise DocsMintError when the document violates the shared schema."""
    schema = load_yaml_schema()
    validator = Draft202012Validator(schema)
    errors = sorted(validator.iter_errors(document), key=lambda err: list(err.absolute_path))
    if not errors:
        return

    lines: list[str] = []
    for error in errors[:8]:
        location = ".".join(str(part) for part in error.absolute_path) or "(root)"
        lines.append(f"- {location}: {error.message}")
    if len(errors) > 8:
        lines.append(f"- …and {len(errors) - 8} more")

    raise DocsMintError(
        "docsmint.yaml failed schema validation.",
        code="CONFIG_SCHEMA_INVALID",
        hint="\n".join(lines),
    )
