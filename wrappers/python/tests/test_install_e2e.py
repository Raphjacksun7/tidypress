"""Real install e2e: pip install wrapper + packed tidypress tarball + subprocess init/build."""

from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

import pytest

from tidypress.publish_root import resolve_publish_root

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
def tidypress_tarball() -> Path:
    subprocess.run(
        ["pnpm", "--filter", "@tidypress/config", "build"],
        cwd=REPO_ROOT,
        check=True,
    )
    pack_dir = Path(tempfile.mkdtemp(prefix="tidypress-pack-"))
    _run(["npm", "pack", "--pack-destination", str(pack_dir)], cwd=CLI_PACKAGE)
    tarballs = sorted(pack_dir.glob("tidypress-*.tgz"))
    assert tarballs, "npm pack did not produce tidypress tarball"
    return tarballs[-1]


def test_python_entrypoint_init_and_build_lab(tidypress_tarball: Path) -> None:
    with tempfile.TemporaryDirectory(prefix="tidypress-py-e2e-") as tmp:
        root = Path(tmp)
        install_root = root / "project"
        install_root.mkdir()
        # Match packages/cli install-e2e: install tarball in an empty dir (no package.json).
        _run(["npm", "install", str(tidypress_tarball)], cwd=install_root)

        cli_js = install_root / "node_modules" / "tidypress" / "bin" / "tidypress.js"
        assert cli_js.is_file()

        venv_dir = root / "venv"
        _run([sys.executable, "-m", "venv", str(venv_dir)], cwd=root)
        pip = venv_dir / "bin" / "pip"
        tidypress_bin = venv_dir / "bin" / "tidypress"
        _run([str(pip), "install", "-e", f"{REPO_ROOT / 'wrappers' / 'python'}[dev]"], cwd=root)

        cli_env = {
            "TIDYPRESS_CLI_JS": str(cli_js),
            "CI": "true",
            "TIDYPRESS_JSON_LOGS": "1",
        }
        site = install_root / "site"
        site.mkdir()
        _run([str(tidypress_bin), "init", "--preset", "lab"], cwd=site, env=cli_env)
        publish = resolve_publish_root(site)
        assert (publish / "tidypress.config.ts").is_file()

        _run([str(tidypress_bin), "build", "--sync"], cwd=site, env=cli_env)
        build = publish / "build"
        assert (build / "index.html").is_file()
        assert (build / "writing" / "rss.xml").is_file()
        assert (build / "projects" / "index.html").is_file()
        assert (build / "pagefind" / "pagefind.js").is_file()
