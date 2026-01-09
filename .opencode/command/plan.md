---
description: Create implementation plan for a bead with subtask hierarchy
argument-hint: "<bead-id> [--create-beads] [--parallel]"
agent: planner
---

# Plan: $ARGUMENTS

You're creating an implementation plan with proper Epic → Task → Subtask hierarchy and subagent research.

## Parse Arguments

| Argument         | Default  | Description                               |
| ---------------- | -------- | ----------------------------------------- |
| `<bead-id>`      | required | The bead to plan                          |
| `--create-beads` | false    | Create child beads after planning         |
| `--parallel`     | false    | Run aggressive parallel subagent research |

## Load Skills & Context

```typescript
skill({ name: "beads" });
```

```bash
bd show $ARGUMENTS
```

Check for existing artifacts:

```bash
cat .beads/artifacts/$ARGUMENTS/spec.md 2>/dev/null || echo "No spec found"
cat .beads/artifacts/$ARGUMENTS/research.md 2>/dev/null || echo "No research found"
```

**If spec.md missing:** "Run `/create $ARGUMENTS` first to create a specification."

**If complexity > M and no research:** "Consider `/research $ARGUMENTS` first for better planning."

## Check Memory First (Semantic Search)

Before subagent research, check what we already know:

```typescript
// Find similar past plans
memory -
  search({
    query: "[bead title/description]",
    mode: "semantic",
    type: "bead",
    limit: 3,
  });

// Find related patterns and decisions
memory -
  search({
    query: "[domain keywords]",
    mode: "semantic",
    type: "observation",
    limit: 3,
  });
```

Review findings for:

- Similar plans that worked well (reuse structure)
- Patterns and decisions already made
- Gotchas to avoid in planning

If memory search fails (Ollama not running), continue to subagent research.

---

## Phase 1: Parallel Subagent Research

Gather context before designing. Fire both in parallel:

```typescript
// Codebase patterns
Task({
  subagent_type: "explore",
  prompt: `For planning $ARGUMENTS, research the codebase:
    1. Find similar implementations or patterns
    2. Identify affected files and their structure
    3. Find related tests and testing patterns
    4. Check for potential conflicts with in-progress work
    Return: File paths, code patterns, test approach, conflicts`,
  description: "Explore codebase for planning",
});

// External best practices
Task({
  subagent_type: "scout",
  prompt: `Research implementation approaches for $ARGUMENTS:
    1. Best practices from official documentation
    2. Common patterns in open source projects
    3. Pitfalls and anti-patterns to avoid
    Return: Recommendations, code examples, warnings`,
  description: "Scout best practices for planning",
});
```

**Continue working while subagents research.**

---

## Phase 2: Analyze for Decomposition

Determine the right level of granularity.

### Hierarchy Decision Tree

```
Is this work...
├── Single domain, 2-3 files, ~50 tool calls?
│   └── Keep as single bead → Skip to "Generate Design Options"
│
├── Crosses domains (frontend + backend)?
│   └── Create task per domain
│
├── Has natural phases (setup → implement → test)?
│   └── Create task per phase
│
├── Could benefit from parallel agents?
│   └── Create independent tasks
│
└── Would take multiple sessions?
    └── Create epic with task breakdown
```

### Size Estimation Guide

| Size | Tool Calls | Duration  | Hierarchy Level |
| ---- | ---------- | --------- | --------------- |
| S    | ~10        | 30 min    | Subtask         |
| M    | ~30        | 1-2 hours | Task            |
| L    | ~100       | 4-8 hours | Task (or Epic)  |
| XL   | 100+       | Days      | Epic required   |

**If XL detected:** "This requires epic-level decomposition. Creating subtasks is mandatory."

---

## Phase 3: Generate Design Options

Present 2-3 implementation approaches:

```markdown
## Design Options for $ARGUMENTS

### Option A: [Name]

**Approach:** [1-2 sentences]

**Changes:**

- `src/foo.ts` - [what]
- `src/bar.ts` - [what]

**Pros:** [list]
**Cons:** [list]
**Effort:** [S/M/L] (~N tool calls)

---

### Option B: [Name]

**Approach:** [1-2 sentences]

**Changes:**

- `src/different.ts` - [what]

**Pros:** [list]
**Cons:** [list]
**Effort:** [S/M/L] (~N tool calls)

---

### Recommendation

Option [X] because [reason].

Decomposition: [Single bead | X tasks | X tasks with subtasks]
```

Save to `.beads/artifacts/$ARGUMENTS/design.md`.

**STOP. Wait for user to pick an option.**

---

## Phase 4: Create Task Hierarchy

After user approval, design the hierarchy.

### For Single Bead (S/M size)

Skip hierarchy, go directly to plan.md.

### For Multi-Task Work (L/XL size)

Design the decomposition:

```markdown
## Task Breakdown

### Task 1: [Foundation/Setup] [S]

**Domain:** [backend/frontend/infra]
**Blocked by:** None
**Work:**

- [Specific deliverable]
- [Specific deliverable]

### Task 2: [Core Implementation] [M]

**Domain:** [backend/frontend/infra]
**Blocked by:** Task 1
**Work:**

- [Specific deliverable]

**Subtasks (if complex):**

- 2.1: [Atomic unit of work] [S]
- 2.2: [Atomic unit of work] [S] → blocked by 2.1

### Task 3: [Integration/Testing] [S]

**Domain:** [testing]
**Blocked by:** Task 2
**Work:**

- [Specific deliverable]
```

---

## Phase 5: Create Child Beads (if --create-beads)

With user approval or `--create-beads` flag:

```bash
# Get parent bead ID
PARENT=$ARGUMENTS

# Task 1 (no blockers - starts immediately)
bd create "[Task 1 title]" -t task -p 2
# Capture: bd-xxx1

# Link to parent
bd dep add bd-xxx1 $PARENT

# Task 2 (blocked by Task 1)
bd create "[Task 2 title]" -t task -p 2
# Capture: bd-xxx2

bd dep add bd-xxx2 $PARENT
bd dep add bd-xxx2 bd-xxx1 --type blocks

# Task 3 (blocked by Task 2)
bd create "[Task 3 title]" -t task -p 2
# Capture: bd-xxx3

bd dep add bd-xxx3 $PARENT
bd dep add bd-xxx3 bd-xxx2 --type blocks
```

### Create Subtasks (for complex tasks)

```bash
# For Task 2, create subtasks:
bd create "[Subtask 2.1 title]" -t subtask -p 2
# Capture: bd-xxx2.1

bd dep add bd-xxx2.1 bd-xxx2

bd create "[Subtask 2.2 title]" -t subtask -p 2
# Capture: bd-xxx2.2

bd dep add bd-xxx2.2 bd-xxx2
bd dep add bd-xxx2.2 bd-xxx2.1 --type blocks  # Sequential dependency
```

### Verify Hierarchy

```bash
bd dep tree $ARGUMENTS
```

---

## Phase 6: Create Plan Document

Write `.beads/artifacts/$ARGUMENTS/plan.md`:

```markdown
# Implementation Plan: [Title]

**Bead:** $ARGUMENTS
**Approach:** [Selected option]
**Total estimate:** ~N tool calls ([X-Y hours])

## Hierarchy
```

$ARGUMENTS (Epic/Task)
├── bd-xxx1: [Title] [S] ← READY
├── bd-xxx2: [Title] [M] → blocked by bd-xxx1
│ ├── bd-xxx2.1: [Subtask] [S]
│ └── bd-xxx2.2: [Subtask] [S] → blocked by bd-xxx2.1
└── bd-xxx3: [Title] [S] → blocked by bd-xxx2

```

---

## Task 1: [Title] [S]

**Bead:** bd-xxx1
**Estimate:** ~10 tool calls (30 min)
**Blocked by:** None

**Files:**
- `src/foo.ts`

**Changes:**
- [ ] [Specific change with detail]
- [ ] [Specific change with detail]

**Verify:** `npm test -- foo.test.ts`

---

## Task 2: [Title] [M]

**Bead:** bd-xxx2
**Estimate:** ~30 tool calls (1-2 hours)
**Blocked by:** Task 1

**Subtasks:**

### 2.1: [Subtask Title] [S]

**Bead:** bd-xxx2.1
**Files:** `src/bar.ts`
**Changes:**
- [ ] [Specific change]

**Verify:** `npm test -- bar.test.ts`

### 2.2: [Subtask Title] [S]

**Bead:** bd-xxx2.2
**Blocked by:** 2.1
**Files:** `src/baz.ts`
**Changes:**
- [ ] [Specific change]

**Verify:** `npm test -- baz.test.ts`

---

## Task 3: [Title] [S]

**Bead:** bd-xxx3
**Estimate:** ~10 tool calls (30 min)
**Blocked by:** Task 2

**Files:**
- `tests/integration/`

**Changes:**
- [ ] [Specific change]

**Verify:** `npm run test:integration`

---

## Final Verification

- [ ] All acceptance criteria from spec.md met
- [ ] Full test suite: `npm test`
- [ ] Type check: `npm run typecheck`
- [ ] Lint: `npm run lint`

## Rollback Plan

If issues detected after deployment:
1. [Rollback step 1]
2. [Rollback step 2]
```

---

## Phase 7: Sync and Report

```bash
bd sync
```

### Output (without child beads)

```
Plan Complete: $ARGUMENTS
━━━━━━━━━━━━━━━━━━━━━━━━

Approach: [Selected option]
Tasks: 1 (single bead)
Estimate: ~N tool calls

Artifacts:
├── .beads/artifacts/$ARGUMENTS/design.md
└── .beads/artifacts/$ARGUMENTS/plan.md

Next: /implement $ARGUMENTS
```

### Output (with child beads)

```
Plan Complete: $ARGUMENTS (Epic)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Approach: [Selected option]
Total estimate: ~N tool calls ([X-Y hours])

Hierarchy:
├── bd-xxx1: [Title] [S] ← READY
├── bd-xxx2: [Title] [M] → blocked by bd-xxx1
│   ├── bd-xxx2.1: [Subtask] [S]
│   └── bd-xxx2.2: [Subtask] [S]
└── bd-xxx3: [Title] [S] → blocked by bd-xxx2

Artifacts:
├── .beads/artifacts/$ARGUMENTS/design.md
└── .beads/artifacts/$ARGUMENTS/plan.md

Ready to start: bd-xxx1

Next: /start bd-xxx1
```

---

## Subagent Delegation Summary

| Phase              | Subagent   | Purpose                              |
| ------------------ | ---------- | ------------------------------------ |
| Research           | `@explore` | Find codebase patterns               |
| Research           | `@scout`   | Find best practices                  |
| Design options     | None       | Planner creates                      |
| Hierarchy creation | None       | Planner uses `bd` CLI                |
| Implementation     | `@build`   | Delegated via `/start`, `/implement` |

**Key Rule:** Planner is read-only. Creates structure and artifacts. Build agent executes.

---

## Related Commands

| Need                 | Command                  |
| -------------------- | ------------------------ |
| Create spec first    | `/create <bead-id>`      |
| Research before plan | `/research <bead-id>`    |
| Start first task     | `/start <first-task-id>` |
| View hierarchy       | `bd dep tree <bead-id>`  |
| Import external plan | `/import-plan`           |
