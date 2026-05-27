"""Python CLI help text (init preset hints shared with @tidypress/config)."""

from __future__ import annotations

import json
from pathlib import Path

_INIT_PRESETS_FILE = "init-presets.json"


def _load_init_presets() -> dict:
    bundled = Path(__file__).resolve().parent / "schemas" / _INIT_PRESETS_FILE
    if bundled.is_file():
        return json.loads(bundled.read_text(encoding="utf-8"))

    cursor = Path.cwd().resolve()
    for directory in [cursor, *cursor.parents]:
        for parts in (
            ("node_modules", "@tidypress", "config", "src", "schemas", _INIT_PRESETS_FILE),
            (
                "node_modules",
                "tidypress",
                "node_modules",
                "@tidypress",
                "config",
                "src",
                "schemas",
                _INIT_PRESETS_FILE,
            ),
        ):
            candidate = directory.joinpath(*parts)
            if candidate.is_file():
                return json.loads(candidate.read_text(encoding="utf-8"))
    return {"defaultPreset": "lab", "aliases": {"default": "lab"}, "presets": []}


def format_init_preset_lines() -> list[str]:
    data = _load_init_presets()
    lines = ["Init presets (--preset <name>):"]
    default_name = data.get("defaultPreset", "lab")
    aliases = data.get("aliases") or {}
    alias_names = sorted({name for name, target in aliases.items() if target == default_name})
    if alias_names:
        lines.append(f"  default: {', '.join(alias_names)} (same as {default_name})")

    for preset in data.get("presets") or []:
        name = preset.get("name", "")
        summary = preset.get("summary", "")
        marker = " (default)" if name == default_name else ""
        lines.append(f"  {name}{marker}")
        if summary:
            lines.append(f"      {summary}")
    return lines


def format_init_help() -> str:
    preset_lines = format_init_preset_lines()
    return "\n".join(
        [
            "tidypress init [--preset <name>]",
            "",
            "Scaffold docs/ in the current directory.",
            "",
            *preset_lines,
            "",
            "Examples:",
            "  tidypress init",
            "  tidypress init --preset blog",
            "  tidypress init --preset persona",
            "",
            "Site commands run through the Node.js CLI (Node 22.12+ required).",
        ],
    )


def format_root_help() -> str:
    preset_lines = format_init_preset_lines()
    return "\n".join(
        [
            "tidypress <command> [options]  (Python wrapper)",
            "",
            "Node-backed commands:",
            "  init, dev, build, preview, clean, deploy, context, import,",
            "  doctor, migrate-sections, add-version, domain, release-check",
            "",
            "Python-native commands:",
            "  convert <notebook.ipynb>   Notebook to MDX",
            "  extract-docs <path>      API notes from source comments",
            "",
            *preset_lines,
            "",
            "Long-running commands:",
            "  build and deploy stream output live (async subprocess).",
            "  Pass --sync to wait without streaming (same as legacy behavior).",
            "",
            "YAML bridge: tidypress.yaml / tidypress.yml (see tidypress convert --help)",
            "",
            "Run tidypress init --help for init-only details.",
        ],
    )


def should_print_python_help(argv: list[str]) -> bool:
    if not argv:
        return True
    if argv[0] in {"--help", "-h", "help"}:
        return True
    return argv[0] == "init" and any(token in {"--help", "-h"} for token in argv[1:])


def print_python_help(argv: list[str]) -> None:
    if argv and argv[0] == "init" and any(token in {"--help", "-h"} for token in argv[1:]):
        print(format_init_help())
        return
    print(format_root_help())
