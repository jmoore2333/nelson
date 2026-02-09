# Mission Patterns

Pre-built patterns for common mission types. Use these as starting points when drafting battle plans.

## Codebase Refactoring

Large-scale rename, restructure, or architectural change across many files.

**Recommended mode:** `agent-team`
**Team size:** 1 admiral + 3-5 captains
**Typical station tier:** Station 1 (Caution)

Battle plan skeleton:

1. **Survey** — One captain maps all affected files, symbols, and call sites. Produces a manifest of changes.
   - Dependencies: none.
2. **Execute changes** — Captains split the manifest by directory or module. Each captain owns a non-overlapping set of files.
   - Dependencies: Survey.
3. **Validate** — One captain runs the full test suite, type checker, and linter across the changed codebase.
   - Dependencies: all Execute tasks.
4. **Reconcile** — Admiral reviews validation output, resolves conflicts, and merges.
   - Dependencies: Validate.

Common pitfalls:

- Splitting file ownership too finely, causing merge conflicts between captains.
- Skipping the survey step and discovering missed references late in execution.
- Renaming public API surfaces without checking downstream consumers outside the repo.

## Feature Build

New feature spanning multiple layers such as API, frontend, database, and tests.

**Recommended mode:** `agent-team`
**Team size:** 1 admiral + 3-4 captains
**Typical station tier:** Station 1 (Caution)

Battle plan skeleton:

1. **Define contracts** — One captain writes interface definitions, API schemas, or type signatures that all layers depend on.
   - Dependencies: none.
2. **Implement layers** — Captains work in parallel on their assigned layer (backend, frontend, data, etc.), each owning distinct files.
   - Dependencies: Define contracts.
3. **Integration test** — One captain writes and runs integration tests that exercise the full path.
   - Dependencies: all Implement tasks.
4. **Polish** — Admiral reviews, addresses edge cases, and finalises documentation.
   - Dependencies: Integration test.

Common pitfalls:

- Starting layer implementation before contracts are agreed, leading to rework.
- Assigning overlapping files to multiple captains (especially shared types or config).
- Neglecting error paths and only testing the happy course.

## Bug Hunt

Diagnosing and fixing an unknown issue across a system.

**Recommended mode:** `subagents`
**Team size:** 1 admiral + 2-3 captains
**Typical station tier:** Station 0 (Patrol) for investigation, Station 1 (Caution) for the fix

Battle plan skeleton:

1. **Reproduce** — One captain isolates and documents reliable reproduction steps.
   - Dependencies: none.
2. **Scout** — Captains investigate in parallel, each assigned a different hypothesis or subsystem. Report findings to admiral.
   - Dependencies: Reproduce.
3. **Fix and verify** — The captain whose hypothesis proved correct implements the fix and provides validation evidence.
   - Dependencies: Scout.

Common pitfalls:

- Multiple captains editing the same files during investigation, causing conflicts.
- Jumping to a fix before the root cause is confirmed.
- Fixing the symptom rather than the underlying fault.

## Migration

Moving from one technology, version, framework, or API to another.

**Recommended mode:** `agent-team`
**Team size:** 1 admiral + 4-6 captains + 1 red-cell navigator
**Typical station tier:** Station 2 (Action)

Battle plan skeleton:

1. **Audit** — One captain catalogues all usages of the old technology and produces a migration manifest.
   - Dependencies: none.
2. **Migrate in batches** — Captains split the manifest into non-overlapping batches by module or directory. Each batch is migrated and tested independently.
   - Dependencies: Audit.
3. **Red-cell review** — Navigator challenges migration completeness, checks for missed call sites, and validates rollback readiness.
   - Dependencies: all Migrate tasks.
4. **Cut over** — Admiral confirms all batches pass, removes old dependencies, and runs final validation.
   - Dependencies: Red-cell review.

Common pitfalls:

- Migrating everything in one pass instead of batching, making rollback difficult.
- Failing to account for runtime differences between old and new technology.
- Dropping the old dependency before confirming all transitive consumers have been migrated.

## Test Suite Overhaul

Adding, reorganising, or significantly expanding test coverage across a codebase.

**Recommended mode:** `subagents`
**Team size:** 1 admiral + 3-5 captains
**Typical station tier:** Station 0 (Patrol)

Battle plan skeleton:

1. **Coverage audit** — One captain analyses existing coverage and identifies gaps. Produces a prioritised list of modules needing tests.
   - Dependencies: none.
2. **Write tests** — Captains work in parallel, each assigned a distinct module or directory. Each produces test files that run independently.
   - Dependencies: Coverage audit.
3. **Validate suite** — One captain runs the full suite, checks for flaky tests, and confirms coverage targets are met.
   - Dependencies: all Write tasks.

Common pitfalls:

- Writing tests that depend on execution order or shared mutable state.
- Testing implementation details rather than behaviour, making tests brittle to refactoring.
- Assigning the same test file to multiple captains.
