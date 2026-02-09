# Damage Control

Procedures for recovering from failures, resuming interrupted missions, and escalating when the squadron cannot resolve a situation independently.

## Man Overboard: Stuck Agent Replacement

Use when an agent is unresponsive, looping, or producing no useful output.

1. Admiral identifies the stuck agent and its assigned task.
2. Admiral records the agent's last known progress and any partial outputs.
3. Admiral issues a shutdown request to the stuck agent.
4. Admiral spawns a replacement agent with the same role.
5. Admiral briefs the replacement with: task definition, dependencies, partial outputs, and known blockers.
6. Replacement agent resumes from the last verified checkpoint, not from scratch.
7. Admiral updates the battle plan to reflect the new assignment.

## Session Resumption: Picking Up Mid-Mission

Use when a session is interrupted (context limit, crash, timeout) and work must continue.

1. Read the most recent quarterdeck report to establish last known state.
2. List all tasks and their statuses: `pending`, `in_progress`, `completed`.
3. For each `in_progress` task, verify partial outputs against the task deliverable.
4. Discard any unverified or incomplete outputs that cannot be confirmed correct.
5. Re-issue sailing orders with the original mission outcome and updated scope reflecting completed work.
6. Re-form the squadron at the minimum size needed for remaining tasks.
7. Resume quarterdeck rhythm from the next scheduled checkpoint.

## Partial Rollback: Reverting Without Losing Progress

Use when a completed task is found to be faulty but other completed tasks are sound.

1. Admiral identifies the faulty task and its downstream dependents.
2. Admiral marks the faulty task as `in_progress` and all dependents as `pending`.
3. If the faulty task produced code changes, revert those changes using version control.
4. If the faulty task produced non-code artifacts, archive them with a `reverted` label.
5. Re-assign the faulty task to the original owner or a replacement agent.
6. Agent re-executes the task from its original definition with the failure mode documented as a constraint.
7. Once the re-executed task is verified, unblock and resume dependent tasks.

## Scuttle and Re-Form: Mission Abort

Use when the mission cannot succeed under current conditions and continuing wastes budget.

Triggers:
- Budget (token or time) is exhausted with critical tasks still pending.
- Mission outcome is no longer achievable due to discovered constraints.
- Admiral determines that remaining risk exceeds acceptable threshold.

Procedure:

1. Admiral halts all in-progress work immediately.
2. Each agent saves current partial outputs and documents their last known state.
3. Admiral produces an abort log using the Captain's Log Template with:
   - Reason for abort.
   - Tasks completed and their outputs.
   - Tasks abandoned and their partial state.
   - Conditions required before re-attempting the mission.
4. Admiral issues shutdown requests to all agents.
5. Admiral presents the abort log to the human (Admiralty) with a recommendation: retry with new constraints, descope, or abandon.

## Escalation: Chain of Command

Escalation flows upward: Captain to Admiral to Admiralty (human).

### Escalation Triggers

| Trigger | First Action |
| --- | --- |
| Ambiguous requirement or acceptance criteria | Captain pauses and requests clarification from admiral |
| Agent disagreement on approach | Admiral decides; if uncertain, escalates to Admiralty |
| Scope creep detected (task expanding beyond original definition) | Admiral re-scopes or escalates to Admiralty for approval |
| Unexpected dependency on out-of-scope system | Admiral pauses dependent work and escalates to Admiralty |
| Station 2+ risk discovered mid-task | Admiral elevates the action station and applies required controls |
| Budget approaching limit with critical work remaining | Admiral escalates to Admiralty with options: extend budget, descope, or abort |

### Escalation Procedure

1. The agent encountering the issue pauses work on the affected task.
2. Agent reports to admiral with: issue summary, options considered, and one recommendation.
3. Admiral evaluates whether the issue can be resolved within current authority:
   - If yes: admiral decides and documents the rationale.
   - If no: admiral escalates to Admiralty (human) with a summary and recommendation.
4. Admiralty provides direction.
5. Admiral communicates the decision to the affected agent and updates the battle plan.
6. Agent resumes work under the new direction.

### Authority Boundaries

- **Captain**: Can resolve issues within their own task scope. Must escalate anything affecting other tasks, shared resources, or mission scope.
- **Admiral**: Can re-assign tasks, replace agents, adjust timelines, elevate action stations, and descope within the original sailing orders. Must escalate scope changes, budget extensions, and abort decisions.
- **Admiralty (human)**: Final authority on scope, budget, and abort. All irreversible or high-blast-radius decisions require Admiralty confirmation.
