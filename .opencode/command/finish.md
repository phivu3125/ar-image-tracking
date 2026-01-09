---
description: Finish a bead - verify, commit, close
argument-hint: "<bead-id>"
agent: build
---

# Finish: $ARGUMENTS

You're closing out a task. This is the quality gate. No shortcuts.

## Load Skills

```typescript
skill({ name: "beads" });
skill({ name: "verification-before-completion" });
```

## Verify The Task Exists

```
!`bd show $ARGUMENTS`
```

If not found, stop. Check `bd list --status=all` for the correct ID.

## Run All Gates

Detect your project type and run everything:

```
!`ls package.json Cargo.toml pyproject.toml go.mod Makefile 2>/dev/null`
```

**Node/TypeScript:**

```bash
npm run build 2>/dev/null || true
npm test
npm run lint 2>/dev/null || true
npm run type-check 2>/dev/null || true
```

**Rust:**

```bash
cargo build
cargo test
cargo clippy -- -D warnings
```

**Python:**

```bash
pytest
ruff check .
mypy . 2>/dev/null || true
```

**Go:**

```bash
go build ./...
go test ./...
golangci-lint run
```

If ANY gate fails, stop. Fix it first. Don't close broken work.

## Verify Success Criteria

Read the spec and check each criterion:

```
!`cat .beads/artifacts/$ARGUMENTS/spec.md`
```

For each success criterion listed, run its verification. All must pass. If something's missing, go back and implement it.

## Review Changes (Ask Before Commit)

Show what would be committed:

```bash
git add -A
git status
git diff --cached --stat
```

**Present the changes to the user:**

```
Ready to Commit
━━━━━━━━━━━━━━

Files changed:
[list from git status]

Summary: $ARGUMENTS - [what was done]

Would you like me to:
1. Commit these changes
2. Show full diff first
3. Skip commit (I'll review manually)
```

**Wait for user confirmation before proceeding.**

If user confirms commit:

```bash
git commit -m "$ARGUMENTS: [what was done]

- [change 1]
- [change 2]

Closes: $ARGUMENTS"
```

## Close The Task (Ask First)

**Ask the user:**

```
Close bead $ARGUMENTS?
- Yes, close it
- No, keep it open for now
```

If user confirms:

```bash
bd close $ARGUMENTS --reason "Completed: [1-line summary]"
```

## Create Review (Optional But Recommended)

If this was non-trivial work, document what happened:

```bash
mkdir -p .beads/artifacts/$ARGUMENTS
```

Write `.beads/artifacts/$ARGUMENTS/review.md`:

```markdown
# Review: $ARGUMENTS

**Completed:** [date]

## What Changed

- [file]: [what and why]

## What Worked

- [thing that went smoothly]

## What Was Hard

- [challenge and how you solved it]

## Lessons

- [anything worth remembering]
```

## Record Learnings

If you discovered patterns, gotchas, or decisions worth remembering:

```typescript
observation({
  type: "learning", // or "pattern", "bugfix", "decision", "warning"
  title: "[concise, searchable title]",
  content: "[what you learned - be specific and actionable]",
  bead_id: "$ARGUMENTS",
  files: "[affected files, comma-separated]",
  concepts: "[keywords for semantic search]",
});
```

**This auto-embeds into the vector store** for future semantic search. Future `/start` and `/implement` commands will find this learning.

**When to create observations:**

- Discovered a non-obvious gotcha
- Made a significant architectural decision
- Found a pattern worth reusing
- Hit a bug that others might hit

**Skip observations for:**

- Routine implementations
- Well-documented patterns
- Trivial fixes

## Output

```
Closed: $ARGUMENTS

Gates: All passed
Commit: [hash]
Branch: [branch]

Next:
- /pr $ARGUMENTS  # Create pull request
- Or merge directly: git checkout main && git merge $ARGUMENTS
```

## If Work Is Incomplete

Don't close incomplete work. Instead:

```
/handoff $ARGUMENTS "Stopped at [step]. Remaining: [what's left]"
```

Then start fresh session and `/resume $ARGUMENTS` later.
