---
description: Create handoff for next session - save progress and context
argument-hint: "<bead-id> [instructions]"
agent: build
---

# Handoff: $ARGUMENTS

You're pausing work on a task. Save state so the next session can pick up cleanly.

## Why Handoff?

- Context window getting full
- Hit budget limit
- Blocked on something external
- End of work session
- Switching to different task

Don't grind past diminishing returns. A clean handoff beats degraded output.

## Gather State

Get current task status:

!`bd show $ARGUMENTS`

Get git state:

!`git remote get-url origin 2>/dev/null || echo "No remote"`
!`git branch --show-current`
!`git rev-parse --short HEAD`
!`git status --porcelain`

Check what artifacts exist:

!`ls .beads/artifacts/$ARGUMENTS/ 2>/dev/null || echo "No artifacts yet"`

## Commit Work In Progress

If you have uncommitted changes, commit them:

```bash
git add -A
git commit -m "WIP: $ARGUMENTS - [where you stopped]"
```

Don't leave uncommitted work. The next session needs a clean starting point.

## Record Key Learnings (Before Handoff)

If you discovered important patterns or gotchas during this session:

```typescript
observation({
  type: "learning", // or "pattern", "decision", "warning"
  title: "[concise, searchable title]",
  content: "[what you learned - specific and actionable]",
  bead_id: "$ARGUMENTS",
  files: "[affected files]",
  concepts: "[keywords for semantic search]",
});
```

**This auto-embeds** into the vector store. The next `/resume` will find it.

## Create The Handoff

```bash
mkdir -p .beads/artifacts/$ARGUMENTS/handoffs
```

Write `.beads/artifacts/$ARGUMENTS/handoffs/$(date +%Y%m%d-%H%M).md`:

```markdown
# Handoff: $ARGUMENTS

**Created:** [timestamp]
**Branch:** [branch]
**Commit:** [hash]

## Progress

What's done:

- [completed step]
- [completed step]

What's in progress:

- [current step] - stopped here because [reason]

What's remaining:

- [next step]
- [future step]

## Context

Key files touched:

- `src/foo.ts` - [what was changed]
- `src/bar.ts` - [what was changed]

Decisions made:

- [decision]: [why]

## Blockers

[If any blockers, list them. Otherwise "None"]

## Resume Instructions

1. [First thing to do]
2. [Second thing to do]
3. [Third thing to do]

Start next session with: `/resume $ARGUMENTS`
```

## Sync State

```bash
bd sync
```

This commits the handoff and pushes to remote.

## Output

```
Handoff: $ARGUMENTS

Branch: [branch]
Commit: [hash]
Progress: [X]% complete
Saved: .beads/artifacts/$ARGUMENTS/handoffs/[timestamp].md

Next session: /resume $ARGUMENTS
```

## Record Learnings (If Any)

If you discovered something worth remembering:

```typescript
observation({
  type: "learning",
  title: "[what you learned]",
  content: "[details]",
  bead_id: "$ARGUMENTS",
});
```

Start fresh session for best performance. Context accumulation degrades output quality.
