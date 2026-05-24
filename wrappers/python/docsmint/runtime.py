"""Resolve Node.js and the docsmint CLI for the Python entrypoint."""

from __future__ import annotations

from dataclasses import dataclass
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys

from docsmint.errors import DocsMintError

MIN_NODE = (22, 12)

STREAM_COMMANDS = frozenset({"build", "deploy"})


@dataclass(frozen=True)
class RuntimePaths:
    node: str
    cli_js: Path | None
    cli_exe: str | None


def _is_python_wrapper_executable(path: str) -> bool:
    """Detect setuptools-style Python entrypoint shims to avoid recursion."""
    try:
        script = Path(path).read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return False
    return "docsmint.cli" in script or "docsmint.runtime" in script


def _parse_node_version(raw: str) -> tuple[int, int, int]:
    match = re.match(r"v?(\d+)\.(\d+)\.(\d+)", raw.strip())
    if not match:
        raise DocsMintError(
            f"Could not parse Node version: {raw}",
            code="NODE_VERSION",
            hint="Install Node.js 22.12+ from https://nodejs.org",
        )
    return int(match[1]), int(match[2]), int(match[3])


def _ensure_node() -> str:
    node_override = os.environ.get("DOCSMINT_NODE")
    if node_override:
        override_path = Path(node_override).expanduser()
        if override_path.is_file():
            node = str(override_path.resolve())
        else:
            resolved = shutil.which(node_override)
            if not resolved:
                raise DocsMintError(
                    f"DOCSMINT_NODE not found: {node_override}",
                    code="NODE_MISSING",
                    hint="Set DOCSMINT_NODE to a valid Node.js 22.12+ binary path.",
                )
            node = resolved
    else:
        node = shutil.which("node")
    if not node:
        raise DocsMintError(
            "Node.js not found.",
            code="NODE_MISSING",
            hint="Install Node.js 22.12+ from https://nodejs.org",
        )
    try:
        proc = subprocess.run(
            [node, "-v"],
            capture_output=True,
            text=True,
            check=False,
        )
    except OSError as exc:
        raise DocsMintError(
            f"Failed to execute Node.js binary: {node}",
            code="NODE_MISSING",
            hint=str(exc),
        ) from exc
    version_text = (proc.stdout or proc.stderr or "").strip()
    major, minor, patch = _parse_node_version(version_text)
    if (major, minor, patch) < MIN_NODE:
        raise DocsMintError(
            f"Node {version_text} is too old (need >= 22.12.0).",
            code="NODE_VERSION",
            hint="Upgrade Node.js from https://nodejs.org",
        )
    return node


def _monorepo_cli() -> Path | None:
    here = Path(__file__).resolve()
    for parent in here.parents:
        candidate = parent / "packages" / "cli" / "bin" / "docsmint.js"
        if candidate.is_file():
            return candidate
    return None


def _walk_project_cli() -> Path | None:
    cwd = Path.cwd()
    for directory in [cwd, *cwd.parents]:
        nm = directory / "node_modules" / "docsmint" / "bin" / "docsmint.js"
        if nm.is_file():
            return nm
        local = directory / "packages" / "cli" / "bin" / "docsmint.js"
        if local.is_file():
            return local
    return None


def _resolve_cli_js() -> Path | None:
    override = os.environ.get("DOCSMINT_CLI_JS")
    if override:
        path = Path(override).expanduser().resolve()
        if not path.is_file():
            raise DocsMintError(
                f"DOCSMINT_CLI_JS not found: {path}",
                code="CLI_NOT_FOUND",
            )
        return path

    monorepo = _monorepo_cli()
    if monorepo:
        return monorepo

    walked = _walk_project_cli()
    if walked:
        return walked

    return None


def resolve_runtime() -> RuntimePaths:
    node = _ensure_node()
    cli_js = _resolve_cli_js()
    cli_exe = shutil.which("docsmint")
    return RuntimePaths(node=node, cli_js=cli_js, cli_exe=cli_exe)


def run_cli(argv: list[str]) -> int:
    if os.environ.get("DOCSMINT_USE_NPX") == "1":
        npx = shutil.which("npx")
        if not npx:
            raise DocsMintError("npx not found.", code="NPX_MISSING")
        proc = subprocess.run([npx, "docsmint", *argv], check=False)
        return proc.returncode

    paths = resolve_runtime()

    if paths.cli_exe and not paths.cli_js and not _is_python_wrapper_executable(paths.cli_exe):
        proc = subprocess.run([paths.cli_exe, *argv], check=False)
        return proc.returncode

    if paths.cli_js:
        proc = subprocess.run([paths.node, str(paths.cli_js), *argv], check=False)
        return proc.returncode

    raise DocsMintError(
        "docsmint CLI not found.",
        code="CLI_NOT_FOUND",
        hint=(
            "Install the Node CLI: npm install -g docsmint "
            "or set DOCSMINT_CLI_JS to packages/cli/bin/docsmint.js"
        ),
    )


def main_entry() -> None:
    import asyncio

    from docsmint.async_cli import run_cli_async, strip_cli_mode_flags
    from docsmint.help_text import print_python_help, should_print_python_help
    from docsmint.router import is_node_command, run_python_stub

    argv = sys.argv[1:]
    try:
        if should_print_python_help(argv):
            print_python_help(argv)
            sys.exit(0)

        if not is_node_command(argv):
            code = run_python_stub(argv)
        else:
            node_argv, use_streaming = strip_cli_mode_flags(argv)
            if use_streaming:
                code = asyncio.run(run_cli_async(node_argv))
            else:
                code = run_cli(node_argv)
    except DocsMintError as err:
        print(err.format_user_message(), file=sys.stderr)
        sys.exit(1)
    sys.exit(code)
