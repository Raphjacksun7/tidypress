"""Real install e2e: pip install wrapper + packed docsmint tarball + subprocess init/build."""

from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[3]
CLI_PACKAGE = REPO_ROOT / "packages" / "cli"


def _run(cmd: list[str], *, cwd: Path, env: dict[str, str] | None = None) -> subprocess.CompletedProcess[str]:
    merged = {**os.environ, **(env or {})}
    return subprocess.run(
        cmd,
        cwd=cwd,
        env=merged,
        check=True,
        capture_output=True,
        text=True,
    )


@pytest.fixture(scope="module")
def docsmint_tarball() -> Path:
    subprocess.run(
        ["pnpm", "--filter", "@docsmint/config", "build"],
        cwd=REPO_ROOT,
        check=True,
    )
    pack_dir = Path(tempfile.mkdtemp(prefix="docsmint-pack-"))
    _run(["npm", "pack", "--pack-destination", str(pack_dir)], cwd=CLI_PACKAGE)
    tarballs = sorted(pack_dir.glob("docsmint-*.tgz"))
    assert tarballs, "npm pack did not produce docsmint tarball"
    return tarballs[-1]


def test_python_entrypoint_init_and_build_lab(docsmint_tarball: Path) -> None:
    with tempfile.TemporaryDirectory(prefix="docsmint-py-e2e-") as tmp:
        root = Path(tmp)
        install_root = root / "project"
        install_root.mkdir()
        _run(["npm", "init", "-y"], cwd=install_root)
        _run(["npm", "install", str(docsmint_tarball)], cwd=install_root)

        cli_js = install_root / "node_modules" / "docsmint" / "bin" / "docsmint.js"
        assert cli_js.is_file()

        venv_dir = root / "venv"
        _run([sys.executable, "-m", "venv", str(venv_dir)], cwd=root)
        pip = venv_dir / "bin" / "pip"
        docsmint_bin = venv_dir / "bin" / "docsmint"
        _run([str(pip), "install", "-e", f"{REPO_ROOT / 'wrappers' / 'python'}[dev]"], cwd=root)

        cli_env = {
            "DOCSMINT_CLI_JS": str(cli_js),
            "CI": "true",
            "DOCSMINT_JSON_LOGS": "1",
        }
        site = install_root / "site"
        site.mkdir()
        _run([str(docsmint_bin), "init", "--preset", "lab"], cwd=site, env=cli_env)
        docs = site / "docs"
        assert (docs / "docsmint.config.ts").is_file()

        _run([str(docsmint_bin), "build", "--sync"], cwd=site, env=cli_env)
        build = docs / "build"
        assert (build / "index.html").is_file()
        assert (build / "writing" / "rss.xml").is_file()
        assert (build / "projects" / "index.html").is_file()
        assert (build / "pagefind" / "pagefind.js").is_file()
