# Documentation

Русская версия этого файла: [`README.ru.md`](./README.ru.md).

Documentation lives here, split by language:

- `docs/en/` — English documents
- `docs/ru/` — Russian mirror (same filenames, translated content)

Start from **[`docs/en/index.md`](./en/index.md)** (or **[`docs/ru/index.md`](./ru/index.md)**) for
the documentation map, or go straight to [Getting Started](./en/getting-started.md) to run the lab.

## Conventions

- **Documentation goes in `docs/en/` and `docs/ru/` as mirrored pairs** (same filename in both).
  Update both in the same change.
- `README.md` and `LICENSE` stay in the repository root (GitHub landing conventions); the root
  `README.md` / `README.ru.md` pair follows the root's `FOO.md` / `FOO.ru.md` suffix convention.
- Documents are organized by **topic** — detection modules, scenario model, platform and policy.
  Internal delivery phases are planning vocabulary and belong in [`ROADMAP.md`](../ROADMAP.md), not in
  document titles.
- Some legacy documents still live in the repository root (`ARCHITECTURE.md`,
  `EVALUATION-OUTPUTS.md`, `SCENARIO-DYNAMICS.md`, `BROWSER-COMPATIBILITY.md`, `I18N.md`, …). They may
  be migrated into `docs/` incrementally; until then they remain the source of truth in root, and
  editing one means keeping its `FOO.md` / `FOO.ru.md` pair in sync.
