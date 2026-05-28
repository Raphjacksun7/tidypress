from pathlib import Path

import pytest

from tidypress.errors import TidyPressError
from tidypress.python_commands import (
    convert_notebook,
    extract_docs,
    parse_convert_args,
    parse_extract_args,
)


def test_convert_notebook_writes_mdx(tmp_path: Path) -> None:
    notebook = tmp_path / "analysis.ipynb"
    notebook.write_text(
        """
{
  "metadata": { "title": "Notebook Title", "language_info": { "name": "python" } },
  "cells": [
    { "cell_type": "markdown", "source": ["# Intro\\n", "Hello world\\n"] },
    { "cell_type": "code", "source": ["print('hi')\\n"], "outputs": [{ "text": ["hi\\n"] }] }
  ]
}
""".strip(),
        encoding="utf-8",
    )
    output = tmp_path / "site" / "src" / "content" / "docs" / "analysis.mdx"
    options = parse_convert_args([str(notebook), "--output", str(output)])
    convert_notebook(options)
    rendered = output.read_text(encoding="utf-8")
    assert "title: Notebook Title" in rendered
    assert "```python" in rendered
    assert "```text" in rendered


def test_convert_notebook_supports_png_outputs(tmp_path: Path) -> None:
    notebook = tmp_path / "plot.ipynb"
    notebook.write_text(
        """
{
  "metadata": { "language_info": { "name": "python" } },
  "cells": [
    {
      "cell_type": "code",
      "source": ["# chart\\n"],
      "outputs": [
        {
          "output_type": "display_data",
          "data": { "image/png": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=" }
        }
      ]
    }
  ]
}
""".strip(),
        encoding="utf-8",
    )
    output = tmp_path / "site" / "src" / "content" / "docs" / "plot.mdx"
    convert_notebook(parse_convert_args([str(notebook), "--output", str(output)]))

    rendered = output.read_text(encoding="utf-8")
    assets_dir = output.parent / "plot_assets"
    assert "![Notebook output 1-1](plot_assets/cell-1-output-1.png)" in rendered
    assert (assets_dir / "cell-1-output-1.png").is_file()


def test_parse_convert_args_accepts_bridged_aliases(tmp_path: Path) -> None:
    notebook = tmp_path / "analysis.ipynb"
    notebook.write_text("{\"cells\": [], \"metadata\": {}}", encoding="utf-8")
    output = tmp_path / "out.mdx"

    options = parse_convert_args(["--input-path", str(notebook), "--output-path", str(output), "--watch"])

    assert options.input_path == notebook.resolve()
    assert options.output_path == output.resolve()
    assert options.watch is True


def test_convert_notebook_rejects_invalid_png_output(tmp_path: Path) -> None:
    notebook = tmp_path / "broken-image.ipynb"
    notebook.write_text(
        """
{
  "metadata": { "language_info": { "name": "python" } },
  "cells": [
    {
      "cell_type": "code",
      "source": ["print('x')\\n"],
      "outputs": [
        {
          "output_type": "display_data",
          "data": { "image/png": "%%%not-base64%%%" }
        }
      ]
    }
  ]
}
""".strip(),
        encoding="utf-8",
    )
    output = tmp_path / "site" / "src" / "content" / "docs" / "broken-image.mdx"
    options = parse_convert_args([str(notebook), "--output", str(output)])

    with pytest.raises(TidyPressError, match="Notebook output image is not valid base64"):
        convert_notebook(options)


def test_extract_docs_for_python(tmp_path: Path) -> None:
    source = tmp_path / "src"
    source.mkdir()
    (source / "api.py").write_text(
        '''
def meaning():
    """Return meaning of life."""
    return 42
'''.strip(),
        encoding="utf-8",
    )
    output = tmp_path / "site" / "src" / "content" / "docs" / "api" / "py.md"
    options = parse_extract_args([str(source), "--lang", "py", "--output", str(output)])
    extract_docs(options)
    rendered = output.read_text(encoding="utf-8")
    assert "API Reference" in rendered
    assert "Return meaning of life." in rendered


def test_extract_docs_for_typescript(tmp_path: Path) -> None:
    source = tmp_path / "src"
    source.mkdir()
    (source / "api.ts").write_text(
        """
/**
 * Return greeting text.
 */
export function greet(name: string) {
  return `hello ${name}`;
}
""".strip(),
        encoding="utf-8",
    )
    output = tmp_path / "site" / "src" / "content" / "docs" / "api" / "ts.md"
    options = parse_extract_args([str(source), "--lang", "ts", "--output", str(output)])
    extract_docs(options)
    rendered = output.read_text(encoding="utf-8")
    assert "API Reference" in rendered
    assert "`api.ts:greet`" in rendered
    assert "Return greeting text." in rendered


def test_extract_docs_for_go(tmp_path: Path) -> None:
    source = tmp_path / "src"
    source.mkdir()
    (source / "api.go").write_text(
        """
package api

// Sum adds two integers.
// It returns the result.
func Sum(a int, b int) int {
    return a + b
}
""".strip(),
        encoding="utf-8",
    )
    output = tmp_path / "site" / "src" / "content" / "docs" / "api" / "go.md"
    options = parse_extract_args([str(source), "--lang", "go", "--output", str(output)])
    extract_docs(options)
    rendered = output.read_text(encoding="utf-8")
    assert "API Reference" in rendered
    assert "`api.go:Sum`" in rendered
    assert "Sum adds two integers." in rendered
    assert "It returns the result." in rendered
