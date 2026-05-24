"""Async subprocess wrapper for long-running Node CLI commands."""

from __future__ import annotations

import asyncio
import os
import shutil
from typing import Sequence

from docsmint.errors import DocsMintError
from docsmint.runtime import STREAM_COMMANDS, _is_python_wrapper_executable, resolve_runtime

ASYNC_FLAG = "--async"
SYNC_FLAG = "--sync"


def strip_cli_mode_flags(argv: list[str]) -> tuple[list[str], bool]:
    """Return argv without mode flags and whether streaming async mode is requested."""
    cleaned: list[str] = []
    use_streaming = False
    force_sync = False

    for token in argv:
        if token == ASYNC_FLAG:
            use_streaming = True
            continue
        if token == SYNC_FLAG:
            force_sync = True
            continue
        cleaned.append(token)

    if cleaned and cleaned[0] in STREAM_COMMANDS and not force_sync:
        use_streaming = True

    return cleaned, use_streaming


async def run_cli_async(argv: Sequence[str]) -> int:
    """Run the Node CLI in a subprocess with inherited stdout/stderr (live output)."""
    if os.environ.get("DOCSMINT_USE_NPX") == "1":
        npx = shutil.which("npx")
        if not npx:
            raise DocsMintError("npx not found.", code="NPX_MISSING")
        process = await asyncio.create_subprocess_exec(npx, "docsmint", *argv)
        return await process.wait()

    paths = resolve_runtime()

    if paths.cli_exe and not paths.cli_js and not _is_python_wrapper_executable(paths.cli_exe):
        process = await asyncio.create_subprocess_exec(paths.cli_exe, *argv)
        return await process.wait()

    if paths.cli_js:
        process = await asyncio.create_subprocess_exec(paths.node, str(paths.cli_js), *argv)
        return await process.wait()

    raise DocsMintError(
        "docsmint CLI not found.",
        code="CLI_NOT_FOUND",
        hint=(
            "Install the Node CLI: npm install -g docsmint "
            "or set DOCSMINT_CLI_JS to packages/cli/bin/docsmint.js"
        ),
    )
