---
description: Create a new feature with discovery, spec, plan, and sub-tasks
argument-hint: "<feature-name> [--priority=<0-4>] [--type=<type>] [--worktree] [--quick]"
agent: planner
---

# New Feature: $ARGUMENTS

Create a complete feature track with Epic → Task → Subtask hierarchy, proper worktree isolation, and subagent delegation.

## Load Skills

```typescript
skill({ name: "beads" });
skill({ name: "brainstorming" });
```

## Parse Arguments

| Argument     | Default  | Options                              |
| ------------ | -------- | ------------------------------------ |
| Feature name | required | Descriptive name                     |
| `--priority` | 2        | 0 (critical) to 4 (backlog)          |
| `--type`     | feature  | feature, bug, refactor, chore        |
| `--worktree` | false    | Create git worktree for isolation    |
| `--quick`    | false    | Skip brainstorming, use minimal spec |

---

## Hierarchy Model

```
Epic (feature-level)
├── Task 1 (domain or phase)
│   ├── Subtask 1.1 (atomic work unit)
│   └── Subtask 1.2
├── Task 2 (blocked by Task 1)
│   └── Subtask 2.1
└── Task 3 (blocked by Task 2)
```

| Level   | Scope        | Typical Duration | Agent Work                |
| ------- | ------------ | ---------------- | ------------------------- |
| Epic    | Full feature | Days-weeks       | Coordinate, not implement |
| Task    | Domain/phase | Hours-day        | May implement or delegate |
| Subtask | Atomic unit  | 30min-2hrs       | Implement directly        |

---

## Phase 1: Context Gathering

Before creating anything, understand the landscape.

### Parallel Subagent Research

```typescript
// Fire both in parallel - planner is read-only
Task({
  subagent_type: "explore",
  prompt: `Research codebase for "${$ARGUMENTS}":
    1. Find similar implementations or patterns
    2. Identify likely affected directories
    3. Find existing tests in related areas
    4. Check for related beads (open or closed)
    Return: File paths, patterns, test locations, related beads`,
  description: "Explore codebase for feature",
});

Task({
  subagent_type: "scout",
  prompt: `Research best practices for "${$ARGUMENTS}":
    1. Industry patterns for this type of feature
    2. Library/framework recommendations
    3. Common pitfalls to avoid
    Return: Recommendations, code examples, warnings`,
  description: "Scout best practices",
});
```

### Check Existing Work

```bash
bd list --status all --limit 20 | grep -i "[relevant-terms]"
git log --oneline -10 -- src/[relevant-path]/
```

**Report:**

```
Context Analysis
━━━━━━━━━━━━━━━━

Related beads:
- bd-abc123: "User auth system" (closed)
- bd-def456: "Session management" (in_progress)

Codebase signals:
- Similar patterns in: src/auth/, src/api/
- Test patterns: src/__tests__/*.test.ts
- Recent activity: 3 commits this week

External research:
- [Key findings from scout]
```

---

## Phase 2: Brainstorming (unless --quick)

Before filling templates, explore the problem space.

### Discovery Questions

Ask the user (or infer from context):

1. **Problem**: What specific problem are we solving?
2. **Users**: Who benefits from this feature?
3. **Success**: How will we know it's working?
4. **Alternatives**: What other approaches exist?
5. **Risks**: What could go wrong?
6. **Dependencies**: What does this need to work?
7. **Scope**: What's explicitly NOT included?

### Present Options

```
Brainstorming: [Feature Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Problem understood:
[Summarize the core problem]

Considered approaches:
1. [Approach A] - Pros: [...] Cons: [...]
2. [Approach B] - Pros: [...] Cons: [...]
3. [Approach C] - Pros: [...] Cons: [...]

Recommended approach: [X]
Rationale: [Why this approach]

Key risks identified:
- [Risk 1]: Mitigation: [...]
- [Risk 2]: Mitigation: [...]

Proceed with spec? (yes/modify/explore-more)
```

**STOP and wait for approval** before proceeding.

---

## Phase 3: Create Epic Bead

```bash
bd create "[Feature Name]" -t epic -p [priority]
```

Capture the bead ID (e.g., `bd-a1b2c3`) for artifact creation.

```bash
mkdir -p .beads/artifacts/[bead-id]
```

---

## Phase 4: Create Specification

Write `.beads/artifacts/[bead-id]/spec.md`:

```markdown
# [Feature Name] Specification

## Overview

[1-2 paragraph summary of the feature]

## Problem Statement

**Current state:** [What exists now / what's broken]
**Desired state:** [What we want to achieve]
**Gap:** [The specific problem to solve]

## User Stories

- As a [user type], I want [goal], so that [benefit]
- As a [user type], I want [goal], so that [benefit]

## Acceptance Criteria

Must-have (P0):

- [ ] [Criterion 1]
- [ ] [Criterion 2]

Should-have (P1):

- [ ] [Criterion 3]

Nice-to-have (P2):

- [ ] [Criterion 4]

## Technical Design

### Approach

[Chosen approach from brainstorming]

### Architecture Changes

- [Component 1]: [Change description]
- [Component 2]: [Change description]

### Files Affected

| File      | Change         |
| --------- | -------------- |
| `src/...` | [What changes] |

### Dependencies

- External: [APIs, services, libraries]
- Internal: [Other features, beads]

## Estimation

| Size       | Effort      | Confidence        |
| ---------- | ----------- | ----------------- |
| [S/M/L/XL] | [X-Y hours] | [High/Medium/Low] |

## Risks

| Risk     | Likelihood | Impact | Mitigation      |
| -------- | ---------- | ------ | --------------- |
| [Risk 1] | Medium     | High   | [How to handle] |

## Out of Scope

- [Thing 1]
- [Thing 2]

## Success Metrics

- [ ] [Metric 1]: [Target]
- [ ] [Metric 2]: [Target]
```

---

## Phase 5: Create Task Breakdown

Decompose epic into tasks, tasks into subtasks.

### Decomposition Rules

| Signal                                        | Create Separate Task |
| --------------------------------------------- | -------------------- |
| Different domain (frontend vs backend)        | Yes                  |
| Natural phase boundary                        | Yes                  |
| Could be done in parallel by different agents | Yes                  |
| Strong dependency chain                       | Yes, with blockers   |
| Same file, same concern                       | No - keep together   |

### Task Creation with Dependencies

```bash
# Phase 1: Foundation (no blockers - starts immediately)
bd create "Setup database schema" -t task -p 2
# Returns: bd-xxx1

# Phase 2: Core (blocked by Phase 1)
bd create "Implement core API endpoints" -t task -p 2
bd dep add bd-xxx2 bd-xxx1 --type blocks
# Returns: bd-xxx2

# Phase 3: Frontend (blocked by Phase 2)
bd create "Build UI components" -t task -p 2
bd dep add bd-xxx3 bd-xxx2 --type blocks
# Returns: bd-xxx3

# Phase 4: Integration (blocked by Phase 3)
bd create "Integration and E2E tests" -t task -p 2
bd dep add bd-xxx4 bd-xxx3 --type blocks
# Returns: bd-xxx4

# Link all tasks to epic
bd dep add bd-xxx1 [epic-id]
bd dep add bd-xxx2 [epic-id]
bd dep add bd-xxx3 [epic-id]
bd dep add bd-xxx4 [epic-id]
```

### Subtask Creation (for complex tasks)

```bash
# For Task 2 (API endpoints), create subtasks:
bd create "POST /api/users endpoint" -t subtask -p 2
bd dep add bd-xxx2.1 bd-xxx2

bd create "GET /api/users/:id endpoint" -t subtask -p 2
bd dep add bd-xxx2.2 bd-xxx2
bd dep add bd-xxx2.2 bd-xxx2.1 --type blocks  # Sequential if needed
```

### Verify Hierarchy

```bash
bd dep tree [epic-id]
```

Expected output:

```
bd-epic: [Feature Name]
├── bd-xxx1: Setup database schema ← READY
├── bd-xxx2: Implement core API (blocked by bd-xxx1)
│   ├── bd-xxx2.1: POST /api/users
│   └── bd-xxx2.2: GET /api/users/:id (blocked by bd-xxx2.1)
├── bd-xxx3: Build UI components (blocked by bd-xxx2)
└── bd-xxx4: Integration tests (blocked by bd-xxx3)
```

---

## Phase 6: Create Implementation Plan

Write `.beads/artifacts/[bead-id]/plan.md`:

```markdown
# [Feature Name] Implementation Plan

**Epic:** [bead-id]
**Estimated effort:** [X-Y hours total]
**Approach:** [Selected from brainstorming]

## Task 1: [Title] [S/M]

**Bead:** bd-xxx1
**Estimate:** 2-4 hours
**Blocked by:** None (start immediately)

Work:

- [ ] [Specific task]
- [ ] [Specific task]

Verify: `[command to verify]`

---

## Task 2: [Title] [M]

**Bead:** bd-xxx2  
**Estimate:** 4-6 hours
**Blocked by:** Task 1

Subtasks:

- bd-xxx2.1: [Subtask title]
- bd-xxx2.2: [Subtask title]

Work:

- [ ] [Specific task]

Verify: `[command to verify]`

---

[Continue for all tasks...]

## Verification Checklist

- [ ] All acceptance criteria met
- [ ] Tests pass: `npm test`
- [ ] Types check: `npm run typecheck`
- [ ] Lint clean: `npm run lint`

## Rollback Plan

If issues detected:

1. [Step 1]
2. [Step 2]
```

---

## Phase 7: Worktree Setup (if --worktree)

For epic-level work, create an isolated workspace:

```typescript
skill({ name: "using-git-worktrees" });
```

```bash
# Ensure .gitignore has worktree directory
grep -q "^\.worktrees/$" .gitignore || echo ".worktrees/" >> .gitignore

# Create worktree for the epic
git worktree add .worktrees/[epic-id] -b feature/[feature-name]

# Setup in worktree
cd .worktrees/[epic-id]
npm install  # or appropriate setup

# Verify clean baseline
npm test
```

**Worktree + Beads Integration:**

- `.beads/` database is shared (main repo)
- All `bd` commands work normally
- Commits go to the feature branch
- Merge back to main when epic complete

---

## Phase 8: Sync and Report

```bash
bd sync
```

**Output:**

```
Feature Created: [Feature Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Epic: [bead-id]
Priority: P[X]
Estimated effort: [X-Y hours]

Artifacts:
├── .beads/artifacts/[bead-id]/spec.md
└── .beads/artifacts/[bead-id]/plan.md

Hierarchy:
├── [task-id-1]: [Title] [S] ← READY
├── [task-id-2]: [Title] [M] → blocked by task-1
│   ├── [subtask-2.1]: [Title]
│   └── [subtask-2.2]: [Title]
├── [task-id-3]: [Title] [M] → blocked by task-2
└── [task-id-4]: [Title] [S] → blocked by task-3

Workspace: [main | worktree: .worktrees/[epic-id]]

Next Steps:
├── Start first task: /start [task-id-1]
├── View ready work: bd ready
└── View full tree: bd dep tree [epic-id]
```

---

## Quick Mode (--quick)

Skip brainstorming, minimal spec:

- No discovery questions
- Single-paragraph spec
- Flat task list (no subtasks)
- No worktree

Use for: Small features, bug fixes, well-understood work.

---

## Subagent Delegation Summary

| Phase              | Subagent   | Purpose                    |
| ------------------ | ---------- | -------------------------- |
| Context gathering  | `@explore` | Find codebase patterns     |
| Context gathering  | `@scout`   | Research best practices    |
| Brainstorming      | None       | Interactive with user      |
| Spec/Plan creation | None       | Planner writes artifacts   |
| Implementation     | `@build`   | `/start` then `/implement` |

**Key Rule:** Planner creates structure, Build executes work. Subagents research, leaders act.

---

## Related Commands

| Need                 | Command                     |
| -------------------- | --------------------------- |
| Start first task     | `/start <task-id>`          |
| View feature status  | `bd dep tree <epic-id>`     |
| Import external plan | `/import-plan`              |
| Complete feature     | `/finish <epic-id>`         |
| Abandon feature      | `/revert-feature <epic-id>` |
