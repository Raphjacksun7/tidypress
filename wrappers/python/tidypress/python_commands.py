"""Python-native command implementations for notebooks and API extraction."""

from __future__ import annotations

import argparse
import ast
import base64
import binascii
from dataclasses import dataclass
from datetime import datetime, timezone
import json
from pathlib import Path
import re
from typing import Any

from tidypress.errors import TidyPressError


@dataclass(frozen=True)
class ConvertOptions:
    input_path: Path
    output_path: Path
    watch: bool = False


@dataclass(frozen=True)
class ExtractOptions:
    source_path: Path
    language: str
    output_path: Path


def _docs_root(cwd: Path) -> Path:
    docs = cwd / "docs"
    return docs if docs.is_dir() else cwd


def parse_convert_args(args: list[str], cwd: Path | None = None) -> ConvertOptions:
    parser = argparse.ArgumentParser(add_help=False, prog="tidypress convert")
    parser.add_argument("input_path", nargs="?")
    parser.add_argument("--input", "--input-path", dest="input_flag")
    parser.add_argument("--output", "--output-path", dest="output_path")
    parser.add_argument("--watch", action="store_true")
    namespace, unknown = parser.parse_known_args(args)
    if unknown:
        raise TidyPressError(
            f"Unknown convert options: {' '.join(unknown)}",
            code="CONVERT_ARGS",
            hint="Use tidypress convert <file.ipynb> [--output <file.mdx>]",
        )

    raw_input = namespace.input_path or namespace.input_flag
    if not raw_input:
        raise TidyPressError(
            "Missing notebook input path.",
            code="CONVERT_ARGS",
            hint="Use tidypress convert <file.ipynb>.",
        )

    source = Path(raw_input).expanduser().resolve()
    if source.suffix.lower() != ".ipynb":
        raise TidyPressError(
            f"Expected .ipynb notebook input, got: {source}",
            code="CONVERT_ARGS",
        )

    working_dir = (cwd or Path.cwd()).resolve()
    default_output = _docs_root(working_dir) / "src" / "content" / "docs" / f"{source.stem}.mdx"
    output = Path(namespace.output_path).expanduser().resolve() if namespace.output_path else default_output
    return ConvertOptions(input_path=source, output_path=output, watch=namespace.watch)


def parse_extract_args(args: list[str], cwd: Path | None = None) -> ExtractOptions:
    parser = argparse.ArgumentParser(add_help=False, prog="tidypress extract-docs")
    parser.add_argument("source", nargs="?")
    parser.add_argument("--source", dest="source_flag")
    parser.add_argument("--lang", default="py")
    parser.add_argument("--output")
    namespace, unknown = parser.parse_known_args(args)
    if unknown:
        raise TidyPressError(
            f"Unknown extract-docs options: {' '.join(unknown)}",
            code="EXTRACT_ARGS",
            hint="Use tidypress extract-docs <path> [--lang py|ts|go]",
        )

    raw_source = namespace.source or namespace.source_flag
    if not raw_source:
        raise TidyPressError(
            "Missing source directory for extract-docs.",
            code="EXTRACT_ARGS",
            hint="Use tidypress extract-docs src/",
        )
    source = Path(raw_source).expanduser().resolve()
    language = str(namespace.lang).strip().lower()
    if language not in {"py", "ts", "go"}:
        raise TidyPressError("Unsupported language for extract-docs.", code="EXTRACT_ARGS", hint="Use --lang py, ts, or go.")
    working_dir = (cwd or Path.cwd()).resolve()
    default_output = _docs_root(working_dir) / "src" / "content" / "docs" / "api" / f"{language}.md"
    output = Path(namespace.output).expanduser().resolve() if namespace.output else default_output
    return ExtractOptions(source_path=source, language=language, output_path=output)


def convert_notebook(options: ConvertOptions) -> Path:
    if not options.input_path.is_file():
        raise TidyPressError(f"Notebook not found: {options.input_path}", code="CONVERT_INPUT_MISSING")

    try:
        notebook = json.loads(options.input_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise TidyPressError(
            f"Notebook is not valid JSON: {options.input_path}",
            code="CONVERT_INPUT_INVALID",
            hint=str(exc),
        ) from exc

    cells = notebook.get("cells", [])
    metadata = notebook.get("metadata", {})
    language = metadata.get("language_info", {}).get("name", "python")
    title = metadata.get("title") or options.input_path.stem.replace("-", " ").title()
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    parts: list[str] = [
        "---",
        f"title: {title}",
        f"date: {now}",
        f"sourceNotebook: {options.input_path.name}",
        "---",
        "",
    ]
    assets_dir = options.output_path.parent / f"{options.output_path.stem}_assets"
    for idx, cell in enumerate(cells):
        parts.extend(_render_notebook_cell(cell, language, idx, assets_dir, options.output_path))

    options.output_path.parent.mkdir(parents=True, exist_ok=True)
    options.output_path.write_text("\n".join(parts).rstrip() + "\n", encoding="utf-8")
    return options.output_path


def _as_text(value: Any) -> str:
    if isinstance(value, list):
        return "".join(str(part) for part in value)
    return str(value or "")


def _render_notebook_cell(cell: dict[str, Any], language: str, cell_index: int, assets_dir: Path, output_path: Path) -> list[str]:
    cell_type = cell.get("cell_type", "")
    source = _as_text(cell.get("source"))
    if cell_type == "markdown":
        content = source.strip("\n")
        return [content, ""] if content else []
    if cell_type != "code":
        return []

    lines: list[str] = [f"```{language}", source.rstrip(), "```", ""]
    for output_index, output in enumerate(cell.get("outputs", [])):
        lines.extend(_render_code_output(output, cell_index, output_index, assets_dir, output_path))
    return lines


def _render_code_output(
    output: dict[str, Any],
    cell_index: int,
    output_index: int,
    assets_dir: Path,
    output_path: Path,
) -> list[str]:
    output_type = str(output.get("output_type", ""))
    if output_type == "error":
        traceback = output.get("traceback")
        trace_text = _as_text(traceback).strip()
        if not trace_text:
            ename = _as_text(output.get("ename")).strip()
            evalue = _as_text(output.get("evalue")).strip()
            trace_text = " ".join(part for part in [ename, evalue] if part).strip()
        if trace_text:
            return ["```text", trace_text, "```", ""]
        return []

    data = output.get("data")
    if isinstance(data, dict):
        text_data = _as_text(data.get("text/plain")).strip()
        if text_data:
            return ["```text", text_data, "```", ""]

        image_data = data.get("image/png")
        if isinstance(image_data, str) and image_data.strip():
            assets_dir.mkdir(parents=True, exist_ok=True)
            image_name = f"cell-{cell_index + 1}-output-{output_index + 1}.png"
            image_path = assets_dir / image_name
            try:
                image_path.write_bytes(base64.b64decode(image_data, validate=True))
            except (ValueError, binascii.Error) as exc:
                raise TidyPressError(
                    f"Notebook output image is not valid base64 in cell {cell_index + 1}.",
                    code="CONVERT_OUTPUT_INVALID",
                    hint=str(exc),
                ) from exc
            relative = image_path.relative_to(output_path.parent).as_posix()
            return [f"![Notebook output {cell_index + 1}-{output_index + 1}]({relative})", ""]

    text_output = _as_text(output.get("text")).strip()
    if text_output:
        return ["```text", text_output, "```", ""]

    return []


def extract_docs(options: ExtractOptions) -> Path:
    if not options.source_path.exists():
        raise TidyPressError(f"Source path not found: {options.source_path}", code="EXTRACT_SOURCE_MISSING")

    if options.language == "py":
        docs = _extract_python_docs(options.source_path)
    elif options.language == "ts":
        docs = _extract_typescript_docs(options.source_path)
    else:
        docs = _extract_go_docs(options.source_path)

    options.output_path.parent.mkdir(parents=True, exist_ok=True)
    if not docs:
        docs = ["No API doc comments found."]
    output = "# API Reference\n\n" + "\n\n".join(docs) + "\n"
    options.output_path.write_text(output, encoding="utf-8")
    return options.output_path


def _extract_python_docs(root: Path) -> list[str]:
    docs: list[str] = []
    for file in root.rglob("*.py"):
        try:
            module = ast.parse(file.read_text(encoding="utf-8"))
        except SyntaxError:
            continue
        relative = file.relative_to(root)
        for node in module.body:
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                doc = ast.get_docstring(node)
                if not doc:
                    continue
                docs.append(f"## `{relative}:{node.name}`\n\n{doc}")
    return docs


def _extract_typescript_docs(root: Path) -> list[str]:
    docs: list[str] = []
    pattern = re.compile(r"/\*\*(.*?)\*/\s*(?:export\s+)?(?:async\s+)?(?:function|class|const)\s+([A-Za-z0-9_]+)", re.DOTALL)
    for ext in ("*.ts", "*.tsx", "*.js", "*.jsx"):
        for file in root.rglob(ext):
            content = file.read_text(encoding="utf-8", errors="ignore")
            relative = file.relative_to(root)
            for match in pattern.finditer(content):
                comment = re.sub(r"^\s*\*\s?", "", match.group(1), flags=re.MULTILINE).strip()
                if not comment:
                    continue
                symbol = match.group(2)
                docs.append(f"## `{relative}:{symbol}`\n\n{comment}")
    return docs


def _extract_go_docs(root: Path) -> list[str]:
    docs: list[str] = []
    pattern = re.compile(r"(?P<comments>(?://.*\n)+)\s*func\s+(?P<name>[A-Za-z0-9_]+)\s*\(")
    for file in root.rglob("*.go"):
        content = file.read_text(encoding="utf-8", errors="ignore")
        relative = file.relative_to(root)
        for match in pattern.finditer(content):
            raw_comments = match.group("comments")
            comment = "\n".join(line.removeprefix("//").strip() for line in raw_comments.strip().splitlines()).strip()
            if not comment:
                continue
            docs.append(f"## `{relative}:{match.group('name')}`\n\n{comment}")
    return docs
