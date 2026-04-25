"""Python interface for the DocsMint Node.js CLI."""

from __future__ import annotations

from pathlib import Path
import shutil
import subprocess
import sys


def main() -> None:
    """Delegate the command to the Node.js CLI via npx."""
    node = shutil.which("node")
    if not node:
        print("DocsMint requires Node.js. Install it from https://nodejs.org")
        sys.exit(1)

    local_cli = Path(__file__).resolve().parents[3] / "packages" / "cli" / "bin" / "docsmint.js"
    if local_cli.exists():
        completed = subprocess.run([node, str(local_cli), *sys.argv[1:]], check=False)
        sys.exit(completed.returncode)

    completed = subprocess.run(["npx", "docsmint", *sys.argv[1:]], check=False)
    sys.exit(completed.returncode)


if __name__ == "__main__":
    main()
