"""Command routing between Node-backed and Python-native paths."""

from __future__ import annotations

from typing import Sequence

from tidypress.errors import TidyPressError
from tidypress.python_commands import (
    convert_notebook,
    extract_docs,
    parse_convert_args,
    parse_extract_args,
)
from tidypress.yaml_config import bridge_command_args, load_yaml_config

NODE_COMMANDS = {
    "init",
    "dev",
    "build",
    "preview",
    "clean",
    "deploy",
    "doctor",
    "release-check",
    "migrate-sections",
    "domain",
    "import",
    "add-version",
    "editor",
    "export",
    "ai",
}

PYTHON_COMMANDS = {"convert", "extract-docs"}


def is_node_command(argv: Sequence[str]) -> bool:
    """Return True when command should execute through the Node CLI."""
    if not argv:
        return True

    command = argv[0]
    if command in {"help", "--help", "-h", "--version", "-v"}:
        return True

    return command in NODE_COMMANDS


def _extract_config_path(argv: Sequence[str]) -> tuple[str | None, list[str]]:
    config_path: str | None = None
    cleaned: list[str] = []
    i = 0
    while i < len(argv):
        token = argv[i]
        if token == "--config":
            if i + 1 >= len(argv):
                raise TidyPressError(
                    "Missing value for --config",
                    code="CONFIG_ARG_MISSING",
                    hint="Pass a YAML file path after --config.",
                )
            config_path = argv[i + 1]
            i += 2
            continue
        if token.startswith("--config="):
            config_path = token.split("=", 1)[1]
            i += 1
            continue
        cleaned.append(token)
        i += 1
    return config_path, cleaned


def run_python_stub(argv: Sequence[str]) -> int:
    """Execute Python-native commands."""
    if not argv:
        return 0

    command = argv[0]
    if command in PYTHON_COMMANDS:
        config_path, passthrough = _extract_config_path(list(argv[1:]))
        _, config = load_yaml_config(config_path=config_path)
        bridged_args = bridge_command_args(config, command)
        merged_args = [*bridged_args, *passthrough]
        if command == "convert":
            options = parse_convert_args(merged_args)
            output = convert_notebook(options)
            print(f"Converted notebook to {output}")
            return 0
        if command == "extract-docs":
            options = parse_extract_args(merged_args)
            output = extract_docs(options)
            print(f"Extracted API docs to {output}")
            return 0

    print(f"Unknown Python wrapper command: {command}")
    return 2
