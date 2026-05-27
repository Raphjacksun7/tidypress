from tidypress.help_text import format_init_help, format_init_preset_lines, should_print_python_help


def test_should_print_python_help_for_init() -> None:
    assert should_print_python_help(["init", "--help"]) is True
    assert should_print_python_help(["--help"]) is True
    assert should_print_python_help(["build"]) is False


def test_format_init_help_lists_presets() -> None:
    text = format_init_help()
    assert "tidypress init" in text
    assert "lab" in text
    assert "blog" in text
    assert "persona" in text


def test_format_init_preset_lines_includes_default() -> None:
    lines = format_init_preset_lines()
    joined = "\n".join(lines)
    assert "lab" in joined
    assert "default" in joined
