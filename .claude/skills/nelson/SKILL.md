---
name: nelson
description: Command a Royal Navy agent squadron from sailing orders through execution and stand-down. Use when work can be parallelized, requires tight coordination, or needs explicit action-station controls, quality gates, and a final captain's log.
---

# Nelson

Execute this workflow for the user's mission.

## 1. Issue Sailing Orders

- Write one sentence for `outcome`, `metric`, and `deadline`.
- Set constraints: token budget, reliability floor, compliance rules, and forbidden actions.
- Define what is out of scope.
- Define stop criteria and required handoff artifacts.

Use `references/admiralty-templates.md` when the user does not provide structure.

## 2. Form The Squadron

- Select one mode:
- `single-session`: Use for sequential tasks, low complexity, or heavy same-file editing.
- `subagents`: Use for parallel scouting or isolated tasks that report only to admiral.
- `agent-team`: Use when independent agents must coordinate with each other directly.
- Set team size from mission complexity:
- Default to `1 admiral + 3-6 captains`.
- Add `1 red-cell navigator` for medium/high threat work.
- Do not exceed 10 total agents.

Use `references/squadron-composition.md` for selection rules.
Consult `references/standing-orders.md` before forming the squadron.

## 3. Draft Battle Plan

- Split mission into independent tasks with clear deliverables.
- Assign owner for each task and explicit dependencies.
- Assign file ownership when implementation touches code.
- Keep one task in progress per agent unless the mission explicitly requires multitasking.

Use `references/admiralty-templates.md` for the battle plan template.
Consult `references/standing-orders.md` when assigning files or if scope is unclear.

## 4. Run Quarterdeck Rhythm

- Keep admiral focused on coordination and unblock actions.
- Run checkpoints at fixed cadence (for example every 15-30 minutes):
- Update progress by task state: `pending`, `in_progress`, `completed`.
- Identify blockers and choose a concrete next action.
- Track burn against token/time budget.
- Re-scope early when a task drifts from mission metric.
- When a mission encounters difficulties, consult `references/damage-control.md` for recovery and escalation procedures.

Use `references/admiralty-templates.md` for the quarterdeck report template.
Consult `references/standing-orders.md` if admiral is doing implementation or tasks are drifting from scope.

## 5. Set Action Stations

- Apply station tier from `references/action-stations.md`.
- Require verification evidence before marking tasks complete:
- Test or validation output.
- Failure modes and rollback notes.
- Red-cell review for medium+ station tiers.
- Trigger quality checks on:
- Task completion.
- Agent idle with unverified outputs.
- Before final synthesis.

Consult `references/standing-orders.md` if tasks lack a tier or red-cell is assigned implementation work.

## 6. Stand Down And Log Action

- Stop or archive agent sessions.
- Produce captain's log:
- Decisions and rationale.
- Diffs or artifacts.
- Validation evidence.
- Open risks and follow-ups.
- Record reusable patterns and failure modes for future missions.

Use `references/admiralty-templates.md` for the captain's log template.

## Admiralty Doctrine

- Optimize for mission throughput, not equal work distribution.
- Prefer replacing stalled agents over waiting on undefined blockers.
- Keep coordination messages targeted and concise.
- Escalate uncertainty early with options and one recommendation.