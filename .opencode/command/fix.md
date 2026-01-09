---
description: Debug and fix an issue
argument-hint: "<issue or bead-id> [--quick]"
agent: build
---

# Fix: $ARGUMENTS

You're debugging and fixing an issue. Understand before you fix.

## Load Context

If `$ARGUMENTS` is a bead ID:

!`bd show $ARGUMENTS`
!`cat .beads/artifacts/$ARGUMENTS/spec.md 2>/dev/null`

## Parse The Error

Extract from the issue:

- **Error message** - exact text
- **Stack trace** - file:line references
- **Reproduction** - steps to trigger
- **Expected vs Actual** - what should happen vs what happens

## Estimate Complexity

- **S** (~10 calls): Error points to exact line, obvious fix
- **M** (~30 calls): Clear reproduction, known area
- **L** (~100 calls): Intermittent, multiple files, needs investigation
- **XL**: Should be decomposed or researched first

If `--quick` flag: Skip deep analysis, fix directly.

## Quick Fix (S or --quick)

1. Go to error location
2. Identify obvious cause
3. Make minimal fix
4. Run targeted test
5. Commit

## Systematic Debug (M/L)

Load the debugging skill:

```typescript
skill({ name: "systematic-debugging" });
```

**Phase 1: Root Cause (NO fixes yet)**

Read error location. Trace data flow backward. Check recent changes:

!`git log -p --since="1 week ago" -- <file>`

Form a hypothesis. Write it down before fixing anything.

**Phase 2: Reproduce**

Write a failing test that reproduces the bug:

```bash
npm test -- --grep "<bug-related>"
```

Verify it fails for the right reason.

**Phase 3: Fix**

Make the fix. Verify test passes. Run full suite:

```bash
npm test
npm run type-check
```

## Rollback Strategy

Before making changes:

```bash
git stash  # or note current commit
```

If fix makes things worse:

```bash
git checkout -- <file>
```

## Document Root Cause

Create observation:

```typescript
observation({
  type: "bugfix",
  title: "[brief description]",
  content: "Root cause: [what]\nFix: [how]\nPrevention: [future]",
  bead_id: "$ARGUMENTS",
});
```

If it's a gotcha worth remembering, update `project/gotchas.md`.

## Complete

If all verifications pass:

```bash
git add <files>
git status
git diff --cached --stat
```

**Present to user:**

```
Fix Complete: $ARGUMENTS
━━━━━━━━━━━━━━━━━━━━━━━

Root cause: [brief]
Changes: [files]
Tests: Pass ✓

Would you like me to:
1. Commit these changes
2. Show full diff first
3. Skip commit (I'll review manually)
```

**Wait for user confirmation before committing.**

If user confirms:

```bash
git commit -m "fix: [description]

Root cause: [brief]
$ARGUMENTS"

bd sync
```

## Output

```
Fixed: $ARGUMENTS

Root cause: [brief]
Changes: [files]
Tests: Pass

Next:
- /finish $ARGUMENTS  # Close the bead
- /pr $ARGUMENTS      # Create PR
```
