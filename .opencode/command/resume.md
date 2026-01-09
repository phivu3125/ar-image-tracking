---
description: Resume work on a bead from previous session
argument-hint: "<bead-id>"
agent: build
---

# Resume: $ARGUMENTS

You're picking up where a previous session left off. Recover context, verify state, continue work.

## Load Skills

```typescript
skill({ name: "beads" });
```

## Verify The Task Exists

!`bd show $ARGUMENTS`

If not found, check `bd list --status=all`. Maybe it was closed, or you have the wrong ID.

## Check Git State

!`git branch --show-current`
!`git rev-parse --short HEAD`
!`git status --porcelain`

If you're not on the right branch:

```bash
git checkout $ARGUMENTS 2>/dev/null || git checkout feature/$ARGUMENTS
```

If there are uncommitted changes, decide: stash, commit, or discard.

## Find The Handoff

!`ls -t .beads/artifacts/$ARGUMENTS/handoffs/ 2>/dev/null | head -1`

If a handoff exists, read it:

!`cat .beads/artifacts/$ARGUMENTS/handoffs/[latest].md`

The handoff tells you:

- What was completed
- Where work stopped
- What to do next
- Any blockers

## Load Previous Session Context

Search for related work:

```typescript
search_session({ query: "$ARGUMENTS" });
list_sessions({ project: "current", limit: 5 });
```

Load the most recent relevant session:

```typescript
read_session({ session_reference: "last", project: "current" });
```

Extract from session:

- Files modified
- Decisions made
- Where work stopped
- Problems encountered

## Load Related Memory (Semantic Search)

Search for relevant observations and past work:

```typescript
// Find observations related to this bead
memory -
  search({
    query: "$ARGUMENTS [bead title/description]",
    mode: "semantic",
    type: "observation",
    limit: 5,
  });

// Find similar past work
memory -
  search({
    query: "[bead description keywords]",
    mode: "semantic",
    limit: 3,
  });
```

**Review findings** - past observations may contain:

- Gotchas discovered during previous sessions
- Decisions already made
- Patterns that worked

If memory search fails (Ollama not running), continue without it.

## Load Artifacts

Read all available context:

!`cat .beads/artifacts/$ARGUMENTS/spec.md 2>/dev/null`
!`cat .beads/artifacts/$ARGUMENTS/plan.md 2>/dev/null`
!`cat .beads/artifacts/$ARGUMENTS/research.md 2>/dev/null`

## Check For Stale Context

If handoff is more than 3 days old, things may have changed:

!`git log --oneline -10` # What happened since?
!`git diff [handoff-commit]..HEAD --stat` # What files changed?

If significant changes occurred on main, consider rebasing:

```bash
git fetch origin
git rebase origin/main
```

## Report Status

```
Resuming: $ARGUMENTS

Branch: [branch]
Commit: [hash]
Handoff: [date] ([age])

Progress:
- [x] [completed]
- [x] [completed]
- [ ] [in progress] <- resume here
- [ ] [remaining]

Next: [from handoff resume instructions]
```

## Continue Work

Mark in progress if not already:

```bash
bd update $ARGUMENTS --status in_progress
```

Then continue with implementation:

```
/implement $ARGUMENTS
```

Or if you need to re-plan:

```
/plan $ARGUMENTS
```

## If Context Is Too Stale

If more than a week old or significant changes happened:

1. Re-read key files to refresh understanding
2. Check if the approach in plan.md is still valid
3. Consider running `/research $ARGUMENTS` again if external factors changed

Don't blindly follow an outdated plan. Verify it still makes sense.
