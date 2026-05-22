# 004. Python runtime independence

Date: 2026-05-21
Status: proposed

## Context

The current Python wrapper has relied on a subprocess bridge that can fall back to `npx docsmint`.
This is fragile and conflicts with the project constitution requirement that Python distribution should
work without defaulting to `npx`.

The strategy and task roadmap prioritize Python distribution/tooling in Tasks 02 and 07.

## Decision

Adopt a strict Python runtime policy:

1. `pip install` path is the default for Python users.
2. Python command routing is implemented via real Python modules (`router`, `runtime`, `yaml_config`).
3. Any Node invocation must go through an explicit runtime resolver with deterministic behavior.
4. `npx` is never the default execution path.
5. Runtime resolution behavior is covered by pytest.

## Consequences

- Python UX becomes testable and predictable.
- The wrapper remains aligned with Node/Astro rendering boundaries.
- Additional runtime bootstrap code is required, but risk is reduced.
- Tasks 02 and 07 become merge blockers for release quality.
