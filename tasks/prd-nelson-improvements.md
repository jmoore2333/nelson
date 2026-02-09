# PRD: Nelson Skill Improvements

## Introduction

Nelson is a Claude Code skill for coordinating agent work using Royal Navy terminology. The core framework (six-step operational workflow, action stations, squadron composition, admiralty templates) is solid and production-tested. This PRD targets a focused improvement pass on **hardening the skill for power users**: error recovery, edge-case handling, clearer guardrails, and documenting known failure modes. All improvements must remain faithful to the Royal Navy metaphor and reinforce — not dilute — the existing doctrine.

## Goals

- Strengthen Nelson's reliability when missions go wrong (stuck agents, interrupted sessions, ambiguous risk tiers)
- Document known failure modes and anti-patterns so Admirals don't repeat mistakes
- Keep the Royal Navy tone consistent and immersive across all new material
- Ensure all improvements are documentation-only — zero runtime dependencies

## User Stories

### US-001: Add error recovery and resumption guidance
**Description:** As an Admiral running a complex mission, I want documented runbooks for when agents get stuck, sessions are interrupted, or a mission needs to be rolled back, so I can recover without starting over.

**Acceptance Criteria:**
- [ ] New reference document `references/damage-control.md` created
- [ ] Covers at least: stuck agent replacement, session resumption after interruption, partial rollback procedures, mission abort protocol
- [ ] Each procedure is a human-executed runbook with numbered steps an Admiral can follow in a live session
- [ ] Uses Royal Navy terminology consistently (e.g. "damage control", "man overboard", "scuttle and re-form")
- [ ] SKILL.md updated to reference the new document at Step 4 (Quarterdeck Rhythm)
- [ ] Includes escalation procedures: defines triggers (ambiguous risk, agent disagreement, scope creep, unexpected dependency), actions (pause, consult, elevate station, abort task), and chain-of-command flow (Captain → Admiral → Admiralty)

### US-002: Add a risk classification decision tree to Action Stations
**Description:** As an Admiral, I want a clear decision tree for classifying tasks into Station 0–3 so I don't waste time deliberating on risk tiers.

**Acceptance Criteria:**
- [ ] `references/action-stations.md` updated with a decision tree using numbered questions (not Mermaid diagrams — must render in plain text)
- [ ] Decision tree covers: reversibility, blast radius, user visibility, security sensitivity, data loss potential
- [ ] Each leaf node maps to a specific Station tier
- [ ] Includes 2–3 concrete examples per tier (e.g. "Renaming an internal variable → Station 0", "Modifying auth middleware → Station 2")

### US-003: Add mission patterns library
**Description:** As an Admiral, I want documented patterns for common mission types so I can quickly select the right squadron composition and battle plan structure for my situation.

**Acceptance Criteria:**
- [ ] New reference document `references/mission-patterns.md` created
- [ ] Covers at least 4 mission patterns for common agentic coordination scenarios (patterns are speculative — the implementer should research common multi-agent workflows and map them to Nelson's framework)
- [ ] Each pattern includes: recommended mode, team size, typical station tier, battle plan skeleton, common pitfalls
- [ ] Uses Royal Navy terminology consistently
- [ ] SKILL.md Step 2 (Form the Squadron) references this document

### US-004: Consolidate anti-patterns into a standalone reference
**Description:** As an Admiral, I want a single authoritative list of common mistakes and anti-patterns so I can avoid repeating known failures.

**Acceptance Criteria:**
- [ ] New reference document `references/standing-orders.md` created
- [ ] Existing anti-patterns from `squadron-composition.md` (lines 36–42) migrated into the new document; original section replaced with a cross-reference
- [ ] Documents at least 6 anti-patterns with: name, description, symptoms, remedy
- [ ] Each anti-pattern tied to the doctrinal principle it violates
- [ ] SKILL.md Admiralty Doctrine section references the new document

### US-005: Update README and CLAUDE.md for new reference documents
**Description:** As a contributor, I want the project documentation to accurately reflect the new reference documents so cross-references are consistent.

**Acceptance Criteria:**
- [ ] README.md updated to reflect new reference documents
- [ ] CLAUDE.md project structure updated to reflect new reference documents
- [ ] All cross-references between documents are consistent

## Functional Requirements

- FR-1: Create `references/damage-control.md` with error recovery, resumption, escalation, and abort procedures
- FR-2: Create `references/mission-patterns.md` with at least 4 documented mission archetypes
- FR-3: Create `references/standing-orders.md` with at least 6 documented anti-patterns; migrate existing anti-patterns from `squadron-composition.md`
- FR-4: Update `references/action-stations.md` with risk classification decision tree (numbered-questions format)
- FR-5: Update SKILL.md to reference all new documents at appropriate workflow steps
- FR-6: Update README.md and CLAUDE.md to reflect new reference documents

## Non-Goals

- No new application demos (Battleships is sufficient)
- No changes to the `agents/` directory (kept as-is, not expanded)
- No runtime code, build systems, or dependencies
- No automated testing framework (manual verification via installation)
- No changes to `references/squadron-composition.md` beyond the anti-pattern migration in US-004
- `references/admiralty-templates.md` may be extended with new templates required by damage-control or standing-orders procedures, but existing templates must not be modified

## Technical Considerations

- All deliverables are Markdown files — no tooling changes required
- SKILL.md references load on demand; new reference docs must follow the same `{references/filename.md}` pattern used by existing references
- Royal Navy terminology must be consistent — review existing glossary usage before introducing new terms
- Keep individual reference documents focused; prefer multiple small files over one large file
- Decision trees and procedures must render correctly in plain text (no Mermaid, no HTML)

## Success Metrics

- Each new or updated reference document passes an adversarial review (conducted in a separate session) checking for completeness, internal consistency, and cross-reference integrity
- The decision tree produces a definitive Station tier for all 8–12 examples included in the document
- No orphaned cross-references between documents
