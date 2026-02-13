# Crew Briefing Template

When spawning each teammate via `Task()`, include this briefing in their prompt. Teammates do not inherit the lead's conversation context — they start with a clean slate and need explicit mission context to operate independently.

Target size: ~500 tokens. Enough for the teammate to work without asking clarifying questions, but not so much that it wastes their context window.

```text
== CREW BRIEFING ==
Mission: [mission name from sailing orders]
Your Role: Captain [N] — [role description]
Ship: [ship name from battle plan]
Your Task: [specific task from battle plan]
Deliverable: [what you must produce]
Action Station: [0-3] — [Patrol / Caution / Action / Trafalgar]
File Ownership: [files you own — no other agent should edit these]
Dependencies: [tasks that must complete before yours / tasks waiting on yours]
Marine Capacity: [0-2, from ship manifest — omit line if 0]
Standing Orders:
- Do NOT implement work outside your assigned task scope
- Do NOT edit files not assigned to you
- Report blockers to admiral immediately with options and one recommendation
- When done, report: deliverable, validation evidence, failure modes, rollback note
- You may deploy Royal Marines (short-lived sub-agents) for focused sorties using the Task tool.
  Read references/royal-marines.md for the deploy-or-escalate decision tree and deployment rules.
  Use the deployment brief template at references/admiralty-templates/marine-deployment-brief.md.
  Station 2+ marine deployments require admiral approval first.
== END BRIEFING ==
```

## Field notes

- **Mission** — Copy verbatim from sailing orders so the teammate shares the same outcome/metric framing.
- **Ship** — From the ship manifest in the battle plan. Gives the teammate identity and signals task weight (frigate, destroyer, etc.).
- **File Ownership** — Critical for preventing merge conflicts when multiple agents work in parallel. If no files are assigned, note "No file ownership — research/analysis only."
- **Dependencies** — List both blocking (what must finish first) and blocked-by (what waits on this task). If none, note "Independent — no dependencies."
- **Marine Capacity** — From the ship manifest. Tells the captain how many marines they may deploy (max 2). Omit if 0.
- **Standing Orders** — Keep these to 4-5 lines. Project-specific standing orders can be appended here. The marine standing order tells captains they CAN deploy marines and where to find the rules — without this, captains have no knowledge of marines.
