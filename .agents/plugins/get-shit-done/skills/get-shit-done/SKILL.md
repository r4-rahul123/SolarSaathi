---
name: get-shit-done
description: >-
  Get Shit Done (GSD): Spec-driven development, phase-by-phase planning, state persistence,
  and context engineering framework. Use when organizing complex engineering tasks, creating
  roadmaps, tracking requirements, executing phased features, and preventing context rot.
---

# Get Shit Done (GSD) Framework

GSD is an autonomous meta-prompting and context engineering system that eliminates "context rot" by decomposing projects into structured, verifiable phases backed by persistent state files in `.planning/`.

---

## The GSD Execution Loop

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   1. RESEARCH   │ ───►  │    2. PLAN      │ ───►  │   3. EXECUTE    │ ───►  │   4. VERIFY     │
│   Explore Code  │       │  Create Tasks   │       │  Atomic Diffs   │       │ Tests & Commits │
└─────────────────┘       └─────────────────┘       └─────────────────┘       └─────────────────┘
         ▲                                                                             │
         └───────────────────────── Update .planning/STATE.md ◄────────────────────────┘
```

---

## 1. Persistent State Hierarchy (`.planning/`)

Maintain these 4 core markdown artifacts at the project root:

1. **`PROJECT.md`**: Core vision, user personas, architecture stack, constraints, and non-negotiables.
2. **`REQUIREMENTS.md`**: Functional checklist, validation criteria, and edge cases.
3. **`ROADMAP.md`**: Milestone phases, dependencies, definition of done, and timeline.
4. **`STATE.md`**: Real-time scratchpad containing:
   - Current active phase
   - Completed checklist items
   - Decisions log & architectural trade-offs
   - Blockers & immediate next actions

---

## 2. Core Workflows & Commands

### Command: `/gsd/init`
Initialize the `.planning/` directory for an existing or new project:
1. Scan the repository structure and dependencies.
2. Create `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, and `STATE.md`.
3. Set the initial phase and status.

### Command: `/gsd/plan-phase`
Break down the active roadmap phase into atomic, executable task steps:
1. Identify all files to create or modify.
2. Define verification checks for each task (tests, build, visual check).
3. Append the task checklist into `STATE.md`.

### Command: `/gsd/execute`
Execute tasks one by one in focused turns:
1. Read `STATE.md` to identify the next pending task.
2. Implement the change cleanly with zero unintended diffs.
3. Verify immediately (`npm test`, build check, runtime log).
4. Commit atomically: `git commit -m "feat(scope): ..."` or `fix(scope): ...`.
5. Mark the task complete `[x]` in `STATE.md`.

### Command: `/gsd/verify`
Run all end-to-end tests, linters, and type checkers before closing a phase:
- Zero TypeScript / lint errors.
- All test suites passing.
- Update `STATE.md` and transition to the next roadmap milestone.

---

## 3. Context Protection Rules (GSD Guardrails)

- **Atomic Changes**: Never edit more than 2-3 related files in a single pass without compiling.
- **State as Ground Truth**: When context compacts, always read `.planning/STATE.md` first to resume work seamlessly.
- **Verification First**: Never report a feature as done without running tests or build verification commands.
