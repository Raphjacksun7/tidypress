"""Shared error type for the Python wrapper."""

from __future__ import annotations


class DocsMintError(Exception):
    """User-facing wrapper error with optional code and hint."""

    def __init__(self, message: str, code: str = "DOCSMINT_ERROR", hint: str | None = None) -> None:
        super().__init__(message)
        self.code = code
        self.hint = hint

    def format_user_message(self) -> str:
        if not self.hint:
            return str(self)
        return f"{self}\nHint: {self.hint}"
