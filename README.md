# Pramaan — KSP Datathon 2026

Read `docs/` before writing or planning any code — in this order:

1. `docs/solution-breakdown.md` — concept, differentiation, drawbacks, winning strategy, scaling
2. `docs/technical-roadmap.md` — stack, algorithms, engineering practices
3. `docs/sdlc-best-practices.md` — methodology, testing, deployment
4. `docs/remaining-build-prompts.md` — the task-by-task build sequence, current task first

`prototype/` contains working, tested Python modules: entity resolution, case-twin matching, and RBAC, each with a passing test file. These are ground truth for this project's logic — read the actual file contents, not just the filenames. Integrate them into the real Catalyst project structure. Do not redesign, replace, or "clean up" the logic inside them without checking first — each one already found and fixed a real bug or was validated against an exhaustive test suite, and that history isn't visible from the filename alone.

`schema/data_store_schema.sql` is the Data Store schema. `CasePersonLink` references `canonical_id`, never a raw `person_id` — a deliberate constraint, not an oversight.

This is a **Zoho Catalyst project** — Python runtime, India Data Center. Catalyst is the mandated sponsor platform for this datathon, not a generic backend service. Any plan that doesn't include `catalyst.json`, a Function folder structure, and actual Catalyst CLI commands is building the wrong thing, regardless of how clean the code looks.
