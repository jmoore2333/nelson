# Nelson

<p align="center">
  <img src="1024px-Young_Nelson-min.jpg" alt="Captain Horatio Nelson" width="500">
  <br>
  <em>Captain Horatio Nelson — John Francis Rigaud, 1781. Image: Wikimedia Commons</em>
</p>

A Claude Code skill for coordinating agent work based on the Royal Navy. It provides structured sailing orders, battle plans, action stations, and a captain's log to manage complex tasks — from single-session work through to parallel subagent squadrons.

## What it does




https://github.com/user-attachments/assets/2468679d-39f5-4efb-9d93-43d43eee8907




Nelson gives Claude a six-step operational framework for tackling complex missions:

1. **Sailing Orders** — Define the outcome, success metric, constraints, and stop criteria
2. **Form the Squadron** — Choose an execution mode (single-session, subagents, or agent team) and size the team
3. **Battle Plan** — Split the mission into independent tasks with owners, dependencies, and file ownership
4. **Quarterdeck Rhythm** — Run checkpoints to track progress, identify blockers, and manage budget
5. **Action Stations** — Classify tasks by risk tier and enforce verification before marking complete
6. **Stand Down** — Produce a captain's log with decisions, artifacts, validation evidence, and follow-ups

## Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI installed and authenticated

## Installation

### Prompt-based (recommended)

Open Claude Code and say:

```
Install skills from https://github.com/harrymunro/nelson
```

Claude will clone the repo, copy the skill into your project's `.claude/skills/` directory, and clean up. To install it globally across all projects, ask Claude to install it to `~/.claude/skills/` instead.

### Manual

Clone the repo and copy the skill directory yourself:

```bash
# Project-level (recommended for teams)
git clone https://github.com/harrymunro/nelson.git /tmp/nelson
mkdir -p .claude/skills
cp -r /tmp/nelson/.claude/skills/nelson .claude/skills/nelson
rm -rf /tmp/nelson

# Or user-level (personal, all projects)
cp -r /tmp/nelson/.claude/skills/nelson ~/.claude/skills/nelson
```

Then commit `.claude/skills/nelson/` to version control so your team can use it.

### Verify installation

Open Claude Code and ask:

```
What skills are available?
```

You should see `nelson` listed. You can also invoke it directly:

```
/nelson
```

## Usage

### Let Claude invoke it automatically

Claude reads the skill description and loads it when your request matches — for example, when you ask for coordinated parallel work or structured mission execution. Just describe your task:

```
I need to refactor the authentication system. The work spans the API layer,
the frontend, and the test suite. Use nelson to coordinate this.
```

### Invoke it directly

Use the slash command with your mission brief:

```
/nelson Migrate the payment processing module from Stripe v2 to v3
```

### Provide structured sailing orders

For maximum control, provide your own sailing orders:

```
/nelson

Sailing orders:
- Outcome: All API endpoints return consistent error responses
- Success metric: Zero test failures, all error responses match the schema
- Deadline: This session

Constraints:
- Token/time budget: Stay under 50k tokens
- Forbidden actions: Do not modify the database schema

Scope:
- In scope: src/api/ and tests/api/
- Out of scope: Frontend error handling
```

## How it works

<p align="center">
  <img src="HMP_RNM_1973_76-001.jpg" alt="HMS Victory anchored off the Isle of Wight" width="700">
  <br>
  <em>HMS Victory anchored off the Isle of Wight — John Wilson Carmichael (1799–1868), National Museum of the Royal Navy, Portsmouth</em>
</p>

### Execution modes

The skill selects one of three execution modes based on your mission:

| Mode | When to use | How it works |
|------|------------|--------------|
| `single-session` | Sequential tasks, low complexity, heavy same-file editing | Claude works through tasks in order within one session |
| `subagents` | Parallel tasks where workers only report back to the coordinator | Claude spawns [subagents](https://code.claude.com/docs/en/sub-agents) that work independently and return results |
| `agent-team` | Parallel tasks where workers need to coordinate with each other | Claude creates an [agent team](https://code.claude.com/docs/en/agent-teams) with direct teammate-to-teammate communication |

### Team composition

Teams follow a simple hierarchy:

- **Admiral** — Coordinates the mission, delegates tasks, resolves blockers, produces the final synthesis. There is always exactly one.
- **Captains** — Own individual tasks and their deliverables. Typically 2-7 per mission.
- **Red-cell navigator** — Challenges assumptions, validates outputs, and checks rollback readiness. Added for medium/high risk work.

Team size scales with mission complexity. The skill caps at 10 total agents to keep coordination overhead manageable.

### Action stations (risk tiers)

Every task is classified into a risk tier before execution. Higher tiers require more controls:

| Station | Name | When | Required controls |
|---------|------|------|-------------------|
| 0 | Patrol | Low blast radius, easy rollback | Basic validation, rollback step |
| 1 | Caution | User-visible changes, moderate impact | Independent review, negative test, rollback note |
| 2 | Action | Security/compliance/data integrity implications | Red-cell review, failure-mode checklist, go/no-go checkpoint |
| 3 | Trafalgar | Irreversible actions, regulated/safety-sensitive | Minimal scope, human confirmation, two-step verification, contingency plan |

Tasks at Station 1 and above also run a **failure-mode checklist**:

- What could fail in production?
- How would we detect it quickly?
- What is the fastest safe rollback?
- What dependency could invalidate this plan?
- What assumption is least certain?

### Templates

The skill includes structured templates for consistent output across missions:

- **Sailing Orders** — Mission definition with outcome, constraints, scope, and stop criteria
- **Battle Plan** — Task breakdown with owners, dependencies, threat tiers, and validation requirements
- **Quarterdeck Report** — Checkpoint status with progress, blockers, budget tracking, and risk updates
- **Red-Cell Review** — Adversarial review with challenge summary, checks, and recommendation
- **Captain's Log** — Final report with delivered artifacts, decisions, validation evidence, and follow-ups

## Skill file structure

```
.claude/skills/nelson/
├── SKILL.md                                  # Main skill instructions (entrypoint)
├── agents/
│   └── openai.yaml                           # OpenAI agent interface definition
└── references/
    ├── action-stations.md                    # Risk tier definitions and controls
    ├── admiralty-templates.md                # Reusable templates for all phases
    ├── damage-control.md                     # Error recovery and escalation procedures
    ├── mission-patterns.md                   # Pre-built patterns for common mission types
    ├── squadron-composition.md              # Mode selection and team sizing rules
    └── standing-orders.md                    # Anti-patterns and standing orders
```

- `SKILL.md` is the entrypoint that Claude reads when the skill is invoked. It defines the six-step workflow and references the supporting files.
- Files in `references/` contain detailed guidance that Claude loads on demand — they are not all loaded into context at once.

## Customisation

### Modify templates

Edit the templates in `references/admiralty-templates.md` to match your team's reporting style. The templates use plain text format — adjust fields, add sections, or remove what you don't need.

### Adjust risk tiers

Edit `references/action-stations.md` to change what controls are required at each station level. For example, you might require red-cell review at Station 1 instead of Station 2 for a security-sensitive project.

### Change team sizing

Edit `references/squadron-composition.md` to adjust the decision matrix or default team sizes.

## Compatibility notes

- **Subagents** are a stable Claude Code feature and work out of the box.
- **Agent teams** are experimental and disabled by default. To use the `agent-team` execution mode, enable agent teams by adding `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` to your environment or [settings.json](https://code.claude.com/docs/en/settings):

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

Without this setting, Claude will use `single-session` or `subagents` mode instead.

## Disclaimer

This project is not associated with, endorsed by, or affiliated with the British Royal Navy or the UK Ministry of Defence. All Royal Navy terminology and references are used purely as a creative framework for organising software development tasks.

## License

MIT — see [LICENSE](LICENSE) for details.
