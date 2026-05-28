"""PyPI registry e2e: pip install published tidypress, init + build (Node CLI via npm in workspace)."""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

from tidypress.publish_root import resolve_publish_root

REPO_ROOT = Path(__file__).resolve().parents[3]
CACHE_ROOT = REPO_ROOT / ".cache" / "registry-e2e"


def _registry_version() -> str:
    override = os.environ.get("TIDYPRESS_REGISTRY_E2E_VERSION", "").strip()
    if override:
        return override.lstrip("v")
    proc = subprocess.run(
        ["npm", "view", "tidypress", "version"],
        check=True,
        capture_output=True,
        text=True,
    )
    return proc.stdout.strip()


def _run(cmd: list[str], *, cwd: Path, env: dict[str, str] | None = None) -> None:
    subprocess.run(
        cmd,
        cwd=cwd,
        env={**os.environ, **(env or {})},
        check=True,
        capture_output=True,
        text=True,
    )


def test_pypi_registry_install_init_build_lab() -> None:
    version = _registry_version()
    workspace = CACHE_ROOT / f"pip-pytest-{version.replace('.', '_')}"
    if workspace.exists():
        import shutil

        shutil.rmtree(workspace)
    workspace.mkdir(parents=True)

    _run(["npm", "init", "-y"], cwd=workspace)
    _run(["npm", "install", f"tidypress@{version}"], cwd=workspace)

    cli_js = workspace / "node_modules" / "tidypress" / "bin" / "tidypress.js"
    assert cli_js.is_file()

    venv_dir = workspace / ".venv"
    _run([sys.executable, "-m", "venv", str(venv_dir)], cwd=workspace)
    pip = venv_dir / "bin" / "pip"
    tidypress_bin = venv_dir / "bin" / "tidypress"
    _run([str(pip), "install", "--upgrade", "pip"], cwd=workspace)
    _run([str(pip), "install", f"tidypress=={version}"], cwd=workspace)

    cli_env = {
        "TIDYPRESS_CLI_JS": str(cli_js),
        "CI": "true",
        "TIDYPRESS_JSON_LOGS": "1",
    }
    site = workspace / "site"
    site.mkdir()
    _run([str(tidypress_bin), "--version"], cwd=site, env=cli_env)
    _run(
        [
            str(tidypress_bin),
            "init",
            "--preset",
            "lab",
            "--site-url",
            "https://registry-e2e.example",
        ],
        cwd=site,
        env=cli_env,
    )
    _run([str(tidypress_bin), "build"], cwd=site, env=cli_env)

    publish = resolve_publish_root(site)
    assert (publish / "tidypress.config.ts").is_file()
    build = publish / "build"
    assert (build / "index.html").is_file()
    assert (build / "llms.txt").is_file()
    assert (build / "sitemap-index.xml").is_file()
    assert (build / "pagefind" / "pagefind.js").is_file()
    assert not (build / "docs" / "index.html").exists()
