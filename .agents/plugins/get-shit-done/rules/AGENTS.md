# GSD (Get Shit Done) Operational Rules

When operating in this codebase, adhere strictly to the GSD execution discipline:

1. **State-Driven Workflow**:
   - Check `.planning/STATE.md` at the start of any complex request to align with project milestones.
   - If `.planning/` files need updating following a completed milestone, update `STATE.md` promptly.

2. **No Context Drift**:
   - Focus exclusively on the requested task. Do not rewrite working modules or introduce unrelated dependencies.
   - Keep diffs minimal, clean, and tested.

3. **Continuous Verification**:
   - After modifying backend or frontend code, verify with `npm test` and `npm run build`.
   - Never consider a task finished until compilation exits with code 0.

4. **Atomic Git Commits**:
   - Commit logically grouped changes with clear semantic commit messages (`feat: ...`, `fix: ...`, `docs: ...`).
