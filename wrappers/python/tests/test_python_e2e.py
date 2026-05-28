import json
import os
from pathlib import Path
import subprocess
import sys


PYTHON_WRAPPER_ROOT = Path(__file__).resolve().parents[1]


def _run_python_cli(args: list[str], cwd: Path, path_value: str = "") -> subprocess.CompletedProcess[str]:
    env = os.environ.copy()
    env["PYTHONPATH"] = str(PYTHON_WRAPPER_ROOT)
    env["PATH"] = path_value
    return subprocess.run(
        [sys.executable, "-m", "tidypress.cli", *args],
        cwd=cwd,
        env=env,
        text=True,
        capture_output=True,
        check=False,
    )


def test_convert_command_runs_without_node_or_npx(tmp_path: Path) -> None:
    notebook = tmp_path / "analysis.ipynb"
    notebook.write_text(
        json.dumps(
            {
                "metadata": {"title": "Independent Convert", "language_info": {"name": "python"}},
                "cells": [
                    {"cell_type": "markdown", "source": ["# Intro\n", "No Node needed\n"]},
                    {"cell_type": "code", "source": ["print('ok')\n"], "outputs": [{"text": ["ok\n"]}]},
                ],
            }
        ),
        encoding="utf-8",
    )
    output = tmp_path / "site" / "src" / "content" / "docs" / "analysis.mdx"

    proc = _run_python_cli(["convert", str(notebook), "--output", str(output)], cwd=tmp_path, path_value="")

    assert proc.returncode == 0, proc.stderr
    assert output.is_file()
    rendered = output.read_text(encoding="utf-8")
    assert "Independent Convert" in rendered
    assert "No Node needed" in rendered
    assert "```python" in rendered


def test_extract_docs_runs_without_node_or_npx(tmp_path: Path) -> None:
    source_dir = tmp_path / "src"
    source_dir.mkdir()
    (source_dir / "api.py").write_text(
        """
def greeting(name: str) -> str:
    \"\"\"Return a greeting.\"\"\"
    return f"hello {name}"
""".strip(),
        encoding="utf-8",
    )
    output = tmp_path / "site" / "src" / "content" / "docs" / "api" / "py.md"

    proc = _run_python_cli(
        ["extract-docs", str(source_dir), "--lang", "py", "--output", str(output)],
        cwd=tmp_path,
        path_value="",
    )

    assert proc.returncode == 0, proc.stderr
    assert output.is_file()
    rendered = output.read_text(encoding="utf-8")
    assert "API Reference" in rendered
    assert "Return a greeting." in rendered


def test_node_command_requires_node_runtime(tmp_path: Path) -> None:
    proc = _run_python_cli(["build"], cwd=tmp_path, path_value="")

    assert proc.returncode == 1
    assert "Node.js not found." in proc.stderr
