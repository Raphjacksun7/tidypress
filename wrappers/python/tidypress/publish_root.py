"""Resolve TidyPress publish root (site/ by default)."""

from __future__ import annotations

import os
from pathlib import Path

DEFAULT_PUBLISH_ROOT_DIR = "site"
CONFIG_FILENAMES = ("tidypress.config.ts", "tidypress.config.js")
SKIP_SCAN_DIRS = frozenset(
    {
        "node_modules",
        ".git",
        "build",
        "dist",
        ".cache",
        ".turbo",
        ".next",
        "coverage",
    }
)


def _config_exists_at(directory: Path) -> bool:
    return any((directory / name).is_file() for name in CONFIG_FILENAMES)


def _discover_child_publish_roots(project_root: Path) -> list[Path]:
    matches: list[Path] = []
    try:
        entries = list(project_root.iterdir())
    except OSError:
        return matches

    for entry in entries:
        if not entry.is_dir():
            continue
        if entry.name.startswith(".") or entry.name in SKIP_SCAN_DIRS:
            continue
        if _config_exists_at(entry):
            matches.append(entry)
    return sorted(matches)


def resolve_publish_root(cwd: Path) -> Path:
    """Return publish root: env override, cwd, site/, or a discovered child folder."""
    root = cwd.resolve()

    env_override = os.environ.get("TIDYPRESS_PUBLISH_ROOT", "").strip()
    if env_override:
        from_env = Path(env_override).expanduser()
        if not from_env.is_absolute():
            from_env = (root / from_env).resolve()
        if _config_exists_at(from_env):
            return from_env
        raise ValueError(
            f"TIDYPRESS_PUBLISH_ROOT does not contain tidypress.config.ts (or .js): {from_env}"
        )

    for candidate in (root, root / DEFAULT_PUBLISH_ROOT_DIR):
        if _config_exists_at(candidate):
            return candidate

    discovered = _discover_child_publish_roots(root)
    if len(discovered) == 1:
        return discovered[0]
    if len(discovered) > 1:
        names = ", ".join(path.name for path in discovered)
        raise ValueError(
            f"Multiple publish roots found under {root}: {names}. "
            "cd into one publish root or set TIDYPRESS_PUBLISH_ROOT."
        )

    return root / DEFAULT_PUBLISH_ROOT_DIR
