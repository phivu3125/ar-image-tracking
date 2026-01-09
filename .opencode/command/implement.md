---
description: Implement a bead - load context, delegate research, make changes, verify
argument-hint: "<bead-id> [--parallel]"
agent: build
---

# Implement: $ARGUMENTS

You're implementing a tracked task. Stay focused, delegate research, verify as you go, hand off if you hit limits.

## Parse Arguments

| Argument     | Default  | Description                               |
| ------------ | -------- | ----------------------------------------- |
| `<bead-id>`  | required | The bead to implement                     |
| `--parallel` | false    | Run aggressive parallel subagent research |

## First: Load Skills & Context

```typescript
skill({ name: "beads" });
skill({ name: "test-driven-development" });
skill({ name: "verification-before-completion" });
```

Get the task details and check hierarchy:

```bash
bd show $ARGUMENTS
bd dep tree $ARGUMENTS 2>/dev/null || echo "No dependencies"
bd list --status=in_progress  # See what else is active
```

Check for messages from other agents:

```typescript
bd - inbox({ n: 5, unread: true });
```

## Check Hierarchy Position

Identify where this task sits:

| Type      | Action                                      |
| --------- | ------------------------------------------- |
| `epic`    | Don't implement directly - work on subtasks |
| `task`    | May implement or delegate to subtasks       |
| `subtask` | Implement directly - this is leaf work      |

**If this is an epic with subtasks:**

```bash
bd ready --json | grep -q "$ARGUMENTS"
```

→ Work on ready subtasks instead: `/implement <subtask-id>`

## Git State Check

```bash
git status --porcelain
git branch --show-current
```

If dirty, ask whether to stash, commit, or continue.

Create a branch if not already on one for this task:

```bash
git checkout -b $ARGUMENTS 2>/dev/null || echo "Already on branch"
```

Mark the task in progress (if not already):

```bash
bd update $ARGUMENTS --status in_progress
```

## Load Artifacts

Check what context exists:

```bash
ls .beads/artifacts/$ARGUMENTS/ 2>/dev/null || echo "No artifacts"
```

| Found         | Action                               |
| ------------- | ------------------------------------ |
| `plan.md`     | Follow it step by step               |
| `spec.md`     | Implement directly from requirements |
| `research.md` | Use findings to guide implementation |
| Nothing       | Work from bead description           |

Check for previous session work:

```typescript
search_session({ query: "$ARGUMENTS" });
read_session({ session_reference: "last" });
```

## Load Related Memory (Semantic Search)

First, get a quick codebase overview:

```typescript
// Quick overview of relevant directories
repo-map({ path: "src", format: "compact", maxDepth: 3 });
```

Then search for relevant patterns and learnings:

```typescript
// Find similar past work
memory -
  search({
    query: "[task description from bead]",
    mode: "semantic",
    limit: 3,
  });

// Find related gotchas and patterns
memory -
  search({
    query: "[technology/domain keywords]",
    mode: "semantic",
    type: "observation",
    limit: 3,
  });
```

**Review findings before implementation.** Past observations may contain:

- Gotchas to avoid (save debugging time)
- Patterns that worked well (reuse them)
- Decisions already made (don't re-decide)

If memory search fails (Ollama not running), continue without it.

## Parallel Subagent Research (if --parallel or complex task)

**Delegation Pattern: Fire and Continue**

For complex tasks, launch research subagents in parallel before diving into code:

```typescript
// Codebase patterns - find similar implementations
Task({
  subagent_type: "explore",
  prompt: `For implementing $ARGUMENTS, find:
    1. Similar patterns in this codebase (grep/ast-grep)
    2. Related test files and testing patterns
    3. Configuration or setup requirements
    Return: File paths, code patterns, test approach`,
  description: "Explore patterns for implementation",
});

// External best practices - library docs
Task({
  subagent_type: "scout",
  prompt: `Research best practices for $ARGUMENTS:
    1. Official documentation for libraries involved
    2. Common implementation patterns (Context7, GitHub)
    3. Known pitfalls or gotchas
    Return: Code examples, API usage, warnings`,
  description: "Scout external docs",
});

// Continue working immediately - don't wait for results
```

**Subagent Rules:**
| Agent | Use For | Can Do | Cannot Do |
| -------- | ------------------------------ | ---------------- | ---------------- |
| `explore`| Codebase search, patterns | Read, grep, glob | Edit, bd sync |
| `scout` | External docs, best practices | Fetch, search | Edit, bd sync |
| `review` | Code review, debugging | Read, analyze | Edit, bd sync |
| `planner`| Architecture, decomposition | Read, plan | Edit, bd sync |

**You (build agent) are the leader:**

- Subagents return results to you
- Only you modify files and update beads
- Integrate subagent findings into your implementation

## Estimate Your Budget

Look at the task complexity and set limits:

| Size   | Tool Calls | Scope                               |
| ------ | ---------- | ----------------------------------- |
| Small  | ~10        | Simple change, one file, clear path |
| Medium | ~30        | Multiple files, some exploration    |
| Large  | ~100       | Cross-cutting, needs checkpoints    |
| XL     | Stop       | Decompose into subtasks first       |

**If XL detected:**

```
This task is too large for a single session.
Recommend: /plan $ARGUMENTS --create-beads
```

If you hit 80% of budget without finishing, create a handoff. Don't push past limits.

## Lock Files Before Editing

For shared files or multi-agent coordination:

```typescript
bd - reserve({ paths: ["src/file-to-edit.ts"], ttl: 600 });
```

Release after completing edits:

```typescript
bd - release({ paths: ["src/file-to-edit.ts"] });
```

## Do The Work

Detect project type and know your verification commands:

```bash
ls package.json Cargo.toml pyproject.toml go.mod Makefile 2>/dev/null
```

| Project | Test Command    | Lint Command                        |
| ------- | --------------- | ----------------------------------- |
| Node/TS | `npm test`      | `npm run lint && npm run typecheck` |
| Rust    | `cargo test`    | `cargo clippy -- -D warnings`       |
| Python  | `pytest`        | `ruff check . && mypy .`            |
| Go      | `go test ./...` | `golangci-lint run`                 |

**Rules while implementing:**

1. **Read before edit.** Always.
2. **Run verification** after each logical change
3. **Delegate when stuck**: If blocked on understanding, launch `@explore` or `@scout`
4. **Checkpoint** after significant progress: `git commit -m "WIP: $ARGUMENTS - [step]"`
5. **Create child beads** for discovered subtasks:
   ```bash
   bd create "Discovered: [subtask]" -t subtask -p 2
   bd dep add <new-id> $ARGUMENTS --type blocks
   ```

**Progress tracking** - every 10 tool calls:

- Am I on track?
- Should I checkpoint?
- Am I approaching budget?
- Need to delegate research?

## Subtask Coordination (if parent task)

If implementing a task with subtasks:

```bash
# Check which subtasks are ready
bd ready --json | jq '.[] | select(.parent == "$ARGUMENTS")'

# Work on ready subtasks in order
# When subtask done:
bd close <subtask-id> --reason "Completed: description"

# Check if parent can close
bd dep tree $ARGUMENTS
```

**Pattern: Complete subtasks before parent**

## Before Claiming Done

Verify against success criteria in the spec:

```bash
cat .beads/artifacts/$ARGUMENTS/spec.md | grep -A 20 "Success Criteria" || \
cat .beads/artifacts/$ARGUMENTS/spec.md | grep -A 20 "Acceptance Criteria"
```

Run each verification command. All must pass. No exceptions.

Run the full test suite one more time:

```bash
# Whatever your project uses
npm test && npm run typecheck
```

## Complete

If all gates pass, show what was done:

```bash
git add -A
git status
git diff --cached --stat
```

**Present to user:**

```
Implementation Complete: $ARGUMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Type: [epic/task/subtask]
Tests: Pass ✓
Changes: [files modified]

Subtasks: [N completed / M total] (if applicable)

Would you like me to:
1. Commit these changes
2. Show full diff first
3. Skip commit (I'll review manually)
```

**Wait for user confirmation before committing.**

If user confirms:

```bash
git commit -m "$ARGUMENTS: [summary]"
bd sync
```

Suggest next step based on hierarchy:

| Situation            | Next Command                |
| -------------------- | --------------------------- |
| Subtask done         | `/implement <next-subtask>` |
| All subtasks done    | `/finish <parent-task>`     |
| Task done, no parent | `/finish $ARGUMENTS`        |
| Need PR              | `/pr $ARGUMENTS`            |

```
Next: [recommended command]
```

If gates fail, fix them. Don't proceed with broken code.

## If You Can't Finish

Hit budget limit or context getting too large? Create a handoff:

```
/handoff $ARGUMENTS "Stopped at [step]. Next: [what to do]"
```

Then start a fresh session. Don't grind past diminishing returns.

## Release File Locks

Before ending session:

```typescript
bd - release({ _: true }); // List and release all locks
```
