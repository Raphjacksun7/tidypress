from pathlib import Path

import pytest

from tidypress.publish_root import resolve_publish_root


def test_resolve_publish_root_finds_site(tmp_path: Path) -> None:
    site = tmp_path / "site"
    site.mkdir()
    (site / "tidypress.config.ts").write_text("export default {}", encoding="utf-8")
    assert resolve_publish_root(tmp_path) == site


def test_resolve_publish_root_finds_project_root(tmp_path: Path) -> None:
    (tmp_path / "tidypress.config.ts").write_text("export default {}", encoding="utf-8")
    assert resolve_publish_root(tmp_path) == tmp_path


def test_resolve_publish_root_finds_custom_folder(tmp_path: Path) -> None:
    web = tmp_path / "web"
    web.mkdir()
    (web / "tidypress.config.ts").write_text("export default {}", encoding="utf-8")
    assert resolve_publish_root(tmp_path) == web


def test_resolve_publish_root_honors_env(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    custom = tmp_path / "publish"
    custom.mkdir()
    (custom / "tidypress.config.ts").write_text("export default {}", encoding="utf-8")
    monkeypatch.setenv("TIDYPRESS_PUBLISH_ROOT", "publish")
    assert resolve_publish_root(tmp_path) == custom


def test_resolve_publish_root_raises_when_ambiguous(tmp_path: Path) -> None:
    for name in ("alpha", "beta"):
        folder = tmp_path / name
        folder.mkdir()
        (folder / "tidypress.config.ts").write_text("export default {}", encoding="utf-8")

    with pytest.raises(ValueError, match="Multiple publish roots"):
        resolve_publish_root(tmp_path)
