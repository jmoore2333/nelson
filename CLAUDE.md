# Nelson

Nelson is a Claude Code skill for coordinating agent work using Royal Navy terminology. It provides a six-step operational framework: Sailing Orders, Form the Squadron, Battle Plan, Quarterdeck Rhythm, Action Stations, and Stand Down.

## Project structure

```
.claude/skills/nelson/
  SKILL.md              — Main entrypoint (what Claude reads)
  references/           — Supporting docs loaded on demand
    action-stations.md  — Risk tier definitions (Station 0–3)
    admiralty-templates.md — Reusable templates (orders, plans, logs)
    squadron-composition.md — Mode selection & team sizing rules
  agents/               — Agent interface definitions
demos/                  — Example applications built with Nelson
```

## No build system

This is a documentation-driven skill with zero runtime dependencies. There is no package manager, no build step, and no test suite.

## Testing changes

Install the skill locally and run a mission to verify:

```bash
# Project-level
mkdir -p .claude/skills
cp -r .claude/skills/nelson <target-project>/.claude/skills/nelson

# Then in Claude Code, invoke: /nelson
```

## Code style

- Keep instructions simple and clear
- Follow the existing Royal Navy tone and terminology
- Markdown for all documentation; YAML for agent interfaces
- The battleships demo (`demos/battleships/index.html`) uses vanilla HTML/CSS/JS with no dependencies

## Git workflow

- Branch from `main`
- Commit messages: imperative mood, concise summary line
- Open a PR for review

## Environment

`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` must be set to enable the `agent-team` execution mode (configured in `.claude/settings.local.json`).
