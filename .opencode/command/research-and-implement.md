---
description: Research and implement in one workflow
argument-hint: "<bead-id> [--quick] [--tdd]"
agent: build
---

# Research & Implement: $ARGUMENTS

End-to-end workflow: research → plan → implement → verify.

Use this for features with unknowns. For simple changes, use `/fix` or `/implement` directly.

## Phase 1: Context

!`bd show $ARGUMENTS`
!`cat .beads/artifacts/$ARGUMENTS/spec.md`

If no spec exists: "Run `/create $ARGUMENTS` first."

## Phase 2: Research

Define what you need to learn:

```
Questions:
1. [Key question]
2. [Key question]
3. [Key question]
```

Research using:

```typescript
// Codebase patterns
ast - grep({ pattern: "<pattern>" });
grep({ pattern: "<pattern>", include: "*.ts" });

// External docs
context7_resolve_library_id({ libraryName: "<lib>", query: "<question>" });

// Real examples
codesearch({ query: "<pattern>", tokensNum: 5000 });
```

Synthesize:

```
Findings:
• [Key insight 1]
• [Key insight 2]

Recommended approach: [summary]
```

Save to `.beads/artifacts/$ARGUMENTS/research.md`.

## Phase 3: Plan

Create implementation plan:

```markdown
# Plan: $ARGUMENTS

## Approach

[1-2 sentences]

## Steps

1. [Step] - verify: `[command]`
2. [Step] - verify: `[command]`
3. [Step] - verify: `[command]`

## Files

- `src/foo.ts` - [change]
- `src/bar.ts` - [change]
```

Save to `.beads/artifacts/$ARGUMENTS/plan.md`.

## Phase 4: Implement

Mark in progress:

```bash
bd update $ARGUMENTS --status in_progress
```

If `--tdd` flag:

```
For each component:
1. RED: Write failing test
2. GREEN: Write minimal code to pass
3. REFACTOR: Clean up
```

Otherwise, implement step by step from plan. Checkpoint after significant progress:

```bash
git commit -m "WIP: $ARGUMENTS - [step]"
```

## Phase 5: Verify

Run all gates:

```bash
npm test
npm run type-check
npm run lint
```

Verify against research requirements and plan steps.

## Phase 6: Complete

```bash
git add -A
git commit -m "$ARGUMENTS: [summary]"
```

```bash
bd sync
```

```
Done: $ARGUMENTS

Research: .beads/artifacts/$ARGUMENTS/research.md
Plan: .beads/artifacts/$ARGUMENTS/plan.md
Changes: [files]
Tests: Pass

Next: /finish $ARGUMENTS
```

## Quick Mode (--quick)

For smaller tasks:

1. Minimal research (5 min max)
2. No formal plan document
3. Direct implementation
4. Verify and commit

Time budget: 30 minutes. If exceeding, convert to full workflow.
