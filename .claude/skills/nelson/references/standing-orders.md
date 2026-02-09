# Standing Orders

Known anti-patterns that undermine mission effectiveness. Consult this list during battle planning and quarterdeck reviews. Each entry names the violation, describes what goes wrong, and prescribes the remedy.

## 1. Becalmed Fleet

**Description:** Creating an agent team for work that is mostly linear and sequential.

**Symptoms:**
- Captains idle waiting on a single predecessor task.
- Token budget burns on coordination overhead with no parallel throughput gain.
- Tasks form a long chain with no independent branches.

**Remedy:** Use `single-session` mode. Only form a squadron when at least two tasks can run concurrently.

**Doctrine violated:** Form The Squadron — select the simplest mode that fits the mission.

## 2. Split Keel

**Description:** Assigning the same file to multiple captains, causing merge conflicts and duplicated work.

**Symptoms:**
- Captains overwrite each other's changes.
- Frequent merge conflicts on the same artifact.
- Admiral spends coordination time reconciling divergent edits.

**Remedy:** Assign exclusive file ownership in the battle plan. If two tasks must touch the same file, serialize them or split the file into independent modules first.

**Doctrine violated:** Draft Battle Plan — assign file ownership when implementation touches code.

## 3. Press-Ganged Navigator

**Description:** Using the red-cell navigator as a general-purpose task runner instead of an adversarial reviewer.

**Symptoms:**
- Red cell is assigned implementation tickets rather than review gates.
- Quality challenges stop appearing in quarterdeck reports.
- Verification evidence comes from the same agent that wrote the code.

**Remedy:** Keep the red-cell navigator exclusively on review, challenge, and validation duties. Never assign implementation tasks to the navigator.

**Doctrine violated:** Set Action Stations — require verification evidence from a non-author agent.

## 4. Crew Without Canvas

**Description:** Adding agents without reducing the critical path length of the mission.

**Symptoms:**
- More captains are active but the mission does not finish sooner.
- Coordination messages increase while throughput stays flat.
- Token budget inflates with no improvement in mission metric.

**Remedy:** Before adding an agent, identify the specific critical-path task it will parallelize. If no such task exists, do not add the agent.

**Doctrine violated:** Admiralty Doctrine — optimize for mission throughput, not equal work distribution.

## 5. Admiral at the Helm

**Description:** The admiral performs implementation work instead of coordinating the squadron.

**Symptoms:**
- Admiral writes code, edits files, or runs tests directly.
- Captains sit idle waiting for direction while admiral is heads-down.
- Quarterdeck rhythm breaks because admiral is unavailable for checkpoint reviews.
- Blockers accumulate without resolution.

**Remedy:** Admiral must delegate all implementation to captains and stay focused on coordination: issuing orders, tracking dependencies, resolving blockers, and running checkpoints.

**Doctrine violated:** Run Quarterdeck Rhythm — keep admiral focused on coordination and unblock actions.

## 6. Unclassified Engagement

**Description:** Executing tasks without first classifying them through the action stations framework.

**Symptoms:**
- Tasks proceed without stated risk tier or required controls.
- No rollback notes, verification evidence, or red-cell review where warranted.
- High-risk changes ship with the same controls as routine patches.
- Incidents occur that proper classification would have prevented.

**Remedy:** Classify every task against the station tiers in `references/action-stations.md` before execution begins. Apply the minimum required controls for the assigned tier.

**Doctrine violated:** Set Action Stations — apply station tier before execution.

## 7. Drifting Anchorage

**Description:** Allowing tasks to expand scope beyond the original sailing orders without re-scoping.

**Symptoms:**
- Captains add features or refactors not in the battle plan.
- Mission metric is no longer connected to active work.
- Token and time budgets overrun without corresponding mission progress.

**Remedy:** When scope drift is detected during a quarterdeck checkpoint, re-scope the task or split it. Work that falls outside the sailing orders must be deferred or explicitly added with admiral approval.

**Doctrine violated:** Run Quarterdeck Rhythm — re-scope early when a task drifts from mission metric.
