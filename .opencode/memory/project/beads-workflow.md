---
purpose: Complete beads workflow mapping for OpenCodeKit commands
updated: 2025-01-08
---

# Beads Workflow Best Practices

Based on Steve Yegge's best practices and official beads documentation.

## Core Principles

| Principle                | Why                              | How                                  |
| ------------------------ | -------------------------------- | ------------------------------------ |
| One task per session     | Fresh context prevents confusion | Restart after `bd close`             |
| Plan outside beads first | Better planning tools exist      | Use `/brainstorm` → `/plan` → import |
| File lots of issues      | Track any work >2 minutes        | `bd create` liberally                |
| "Land the plane" = PUSH  | `bd sync` means git push         | Always verify push succeeded         |
| Keep DB small            | Performance degrades >500 issues | `bd cleanup --days 7` weekly         |

## Hierarchy Model: Epic → Task → Subtask

### Hierarchy Levels

```
Epic (feature-level)
├── Task 1 (domain or phase)
│   ├── Subtask 1.1 (atomic work unit)
│   └── Subtask 1.2
├── Task 2 (blocked by Task 1)
│   └── Subtask 2.1
└── Task 3 (blocked by Task 2)
```

| Level   | Scope        | Duration   | Agent Work                            |
| ------- | ------------ | ---------- | ------------------------------------- |
| Epic    | Full feature | Days-weeks | Coordinate, delegate, not implement   |
| Task    | Domain/phase | Hours-day  | May implement or delegate to subtasks |
| Subtask | Atomic unit  | 30min-2hrs | Implement directly                    |

### Size Estimation

| Size | Tool Calls | Hierarchy Level    | Session Scope     |
| ---- | ---------- | ------------------ | ----------------- |
| S    | ~10        | Subtask            | Quick fix         |
| M    | ~30        | Task               | Single session    |
| L    | ~100       | Task with subtasks | Single session    |
| XL   | 100+       | Epic required      | Multiple sessions |

### Creating Hierarchy

```bash
# Create epic
bd create "User Authentication" -t epic -p 2
# Returns: bd-epic

# Create tasks with dependencies
bd create "Setup database schema" -t task -p 2
bd dep add bd-xxx1 bd-epic

bd create "Implement API endpoints" -t task -p 2
bd dep add bd-xxx2 bd-epic
bd dep add bd-xxx2 bd-xxx1 --type blocks  # Sequential

# Create subtasks for complex tasks
bd create "POST /api/users endpoint" -t subtask -p 2
bd dep add bd-xxx2.1 bd-xxx2

bd create "GET /api/users/:id endpoint" -t subtask -p 2
bd dep add bd-xxx2.2 bd-xxx2
bd dep add bd-xxx2.2 bd-xxx2.1 --type blocks  # Sequential subtasks

# Verify hierarchy
bd dep tree bd-epic
```

## Git Worktree Integration

### When to Use Worktrees

| Scenario                     | Use Worktree | Why                        |
| ---------------------------- | ------------ | -------------------------- |
| Epic-level work              | ✅ Yes       | Multi-session isolation    |
| Parallel feature development | ✅ Yes       | No context switching       |
| Long-running experiments     | ✅ Yes       | Keep main workspace clean  |
| Single task (S/M)            | ❌ No        | Branch is sufficient       |
| Hotfix/quick-build           | ❌ No        | Overkill for small changes |

### Worktree Setup

```bash
# Verify .gitignore
grep -q "^\.worktrees/$" .gitignore || echo ".worktrees/" >> .gitignore

# Create worktree for feature
git worktree add .worktrees/bd-xxx -b feature/auth

# Navigate and setup
cd .worktrees/bd-xxx
npm install  # or project-specific setup

# Verify clean baseline
npm test
```

### Beads + Worktree Architecture

```
main-repo/
├── .beads/              ← Shared database (all worktrees use this)
├── .worktrees/
│   ├── feature-a/       ← Worktree 1
│   │   └── (working copy)
│   └── feature-b/       ← Worktree 2
│       └── (working copy)
└── src/                 ← Main working copy
```

**Key insight:** `.beads/` is shared. All worktrees access the same database.

### Worktree Daemon Behavior

| Mode        | Configuration                          | Use When                 |
| ----------- | -------------------------------------- | ------------------------ |
| Default     | Daemon auto-disabled in worktrees      | Most cases               |
| Sync branch | `bd config set sync-branch beads-sync` | Full daemon in worktrees |
| External DB | `export BEADS_DIR=~/project/.beads`    | Complete separation      |
| Sandbox     | `bd --sandbox` or `BEADS_NO_DAEMON=1`  | Claude Code, containers  |

### Worktree Cleanup

```bash
# When feature complete
cd /main-repo
git worktree remove .worktrees/feature-a

# Or force if dirty
git worktree remove --force .worktrees/feature-a

# Clean orphaned worktrees
git worktree prune
```

## Subagent Delegation Patterns

### Agent Hierarchy

```
Leader Agents (touch beads, sync, coordinate)
├── build   - Primary implementation agent
└── rush    - Fast-track implementation agent

Subagents (read-only, stateless workers)
├── explore - Codebase search, patterns
├── scout   - External docs, best practices
├── planner - Architecture, decomposition
├── review  - Code review, debugging
└── vision  - UI/UX, visual analysis
```

### Delegation Rules

| Agent     | Can Do                     | Cannot Do              |
| --------- | -------------------------- | ---------------------- |
| `build`   | All beads ops, `bd sync`   | -                      |
| `rush`    | All beads ops, `bd sync`   | -                      |
| `explore` | Read, grep, glob, ast-grep | Edit, write, `bd sync` |
| `scout`   | Fetch, search, Context7    | Edit, write, `bd sync` |
| `planner` | Read, create artifacts     | Edit files, `bd sync`  |
| `review`  | Read, analyze, suggest     | Edit files, `bd sync`  |
| `vision`  | Analyze images, mockups    | All beads operations   |

### Parallel Research Pattern

Fire subagents in parallel, continue working immediately:

```typescript
// Launch both - don't wait
Task({
  subagent_type: "explore",
  prompt: `Find codebase patterns for [task]:
    - Similar implementations
    - Test patterns
    - Affected files
    Return: File paths, patterns, test approach`,
  description: "Explore codebase",
});

Task({
  subagent_type: "scout",
  prompt: `Research best practices for [task]:
    - Official documentation
    - Common patterns
    - Pitfalls to avoid
    Return: Examples, warnings, recommendations`,
  description: "Scout external docs",
});

// Continue working immediately
// Collect results when needed
```

### When to Delegate

| Situation                | Delegate To | Why                        |
| ------------------------ | ----------- | -------------------------- |
| Need codebase patterns   | `@explore`  | Fast grep/glob/ast-grep    |
| Need library docs        | `@scout`    | Context7, GitHub patterns  |
| Complex planning         | `@planner`  | Structured decomposition   |
| Code review before merge | `@review`   | Fresh eyes, evidence-based |
| UI/mockup analysis       | `@vision`   | Visual expertise           |
| Stuck on implementation  | `@explore`  | Fresh search perspective   |

## Maintenance Schedule

| Task         | Frequency      | Command               | Why                                    |
| ------------ | -------------- | --------------------- | -------------------------------------- |
| Health check | Weekly         | `bd doctor --fix`     | Repairs orphaned issues, sync problems |
| Cleanup      | Every few days | `bd cleanup --days 7` | Keep DB under 200-500 issues           |
| Upgrade      | Weekly         | `bd upgrade`          | Latest features and fixes              |
| Git hooks    | Once per repo  | `bd hooks install`    | Auto-sync on commit/merge/checkout     |

## Command Configuration Best Practices

Based on [OpenCode Command Docs](https://opencode.ai/docs/commands/).

### Frontmatter Options

```yaml
---
description: Short description shown in TUI command list
argument-hint: "<required> [optional] [--flag]"
agent: build | planner | scout | explore | review | vision
subtask: true # Run as subagent (doesn't pollute primary context)
model: gemini-2.5-pro # Override default model
---
```

### Prompt Syntax

| Syntax       | Purpose                  | Example                       |
| ------------ | ------------------------ | ----------------------------- |
| `$ARGUMENTS` | All arguments as string  | `/fix $ARGUMENTS`             |
| `$1`, `$2`   | Positional arguments     | `/start $1` → `/start bd-abc` |
| `!`command`` | Inject shell output      | `!`git status``               |
| `@filepath`  | Include file content     | `@src/config.ts`              |
| `$SELECTION` | Current editor selection | For IDE integrations          |

### When to Use `subtask: true`

**Use subtask for research/analysis** - prevents context pollution in primary agent:

| Command Type             | `subtask: true`? | Why                                  |
| ------------------------ | ---------------- | ------------------------------------ |
| Research/exploration     | ✅ Yes           | Heavy reads, doesn't need to persist |
| Code review/analysis     | ✅ Yes           | Analysis output, not implementation  |
| UI/UX analysis           | ✅ Yes           | Design feedback, not code changes    |
| Status/dashboard         | ✅ Yes           | Read-only information gathering      |
| Implementation           | ❌ No            | Needs full context for edits         |
| Lifecycle (start/finish) | ❌ No            | Coordinates state, needs persistence |
| Generation (artifacts)   | ❌ No            | Creates files that need tracking     |

### Commands by Category

#### Research Commands (`subtask: true`)

```
/research, /analyze-project, /review-codebase, /brainstorm,
/status, /summarize, /init, /ui-review, /accessibility-check,
/analyze-mockup, /design-audit, /research-ui, /design
```

#### Lifecycle Commands (NO subtask)

```
/triage, /start, /create, /new-feature, /issue, /plan,
/implement, /commit, /finish, /handoff, /resume, /pr, /fix
```

#### Generation Commands (NO subtask)

```
/generate-image, /generate-icon, /generate-diagram,
/generate-pattern, /generate-storyboard, /edit-image, /restore-image
```

#### Utility Commands (NO subtask)

```
/quick-build, /fix-ci, /fix-types, /fix-ui,
/revert-feature, /integration-test, /skill-create, /skill-optimize
```

## Command → Beads Mapping

### Lifecycle Commands (Touch Beads)

| Command                      | Agent   | Beads Operations                                       | When to Use                 |
| ---------------------------- | ------- | ------------------------------------------------------ | --------------------------- |
| `/triage`                    | build   | `bd doctor`, `bd list`, `bd ready`, `bd cleanup`       | Start of day, find work     |
| `/triage --quick`            | build   | `bd ready`, `bd list --status=in_progress`             | Fast check, what's next     |
| `/start <id>`                | build   | `bd update --status in_progress`, `bd hooks install`   | Claim a task                |
| `/start <id> --worktree`     | build   | + Create git worktree                                  | Isolated feature work       |
| `/start <id> --research`     | build   | + Parallel subagent research                           | Complex task preparation    |
| `/create`                    | build   | `bd create`, `bd sync`                                 | Create new tracked task     |
| `/new-feature`               | planner | `bd create` (epic + subtasks), `bd dep add`, `bd sync` | Complex feature with phases |
| `/new-feature --worktree`    | planner | + Create git worktree for epic                         | Isolated feature branch     |
| `/issue <num>`               | build   | `bd create`, `bd sync`, `gh issue comment`             | Import GitHub issue         |
| `/plan <id>`                 | planner | `bd create` (subtasks), `bd dep add`, `bd sync`        | Break down task             |
| `/plan <id> --create-beads`  | planner | Create child beads after planning                      | Auto-hierarchy creation     |
| `/implement <id>`            | build   | `bd update --status in_progress`, `bd sync`            | Do the work                 |
| `/implement <id> --parallel` | build   | + Aggressive subagent research                         | Complex implementation      |
| `/commit [id]`               | build   | `bd sync` (if bead-id provided)                        | Commit with traceability    |
| `/finish <id>`               | build   | `bd close`, `bd sync`                                  | Complete task (asks first)  |
| `/handoff <id>`              | build   | `bd sync`                                              | Pause work, save context    |
| `/resume <id>`               | build   | `bd update --status in_progress`                       | Continue previous work      |
| `/pr <id>`                   | build   | `bd-msg`, `bd sync`                                    | Create pull request         |
| `/fix`                       | build   | `bd sync` (after user confirms commit)                 | Fix bugs with tracking      |
| `/status`                    | explore | `bd status`, `bd list`, `bd-inbox`, `bd-release`       | Dashboard view              |

### Research Commands (Read-Only Beads)

| Command            | Agent   | Beads Operations      | Notes                      |
| ------------------ | ------- | --------------------- | -------------------------- |
| `/research <id>`   | scout   | `bd show` (read-only) | NO `bd sync` - subagent    |
| `/brainstorm`      | planner | None                  | Pure planning, no tracking |
| `/analyze-project` | explore | None                  | Codebase exploration       |
| `/summarize`       | explore | None                  | Session/code summary       |
| `/review-codebase` | review  | None                  | Code review                |

### Non-Beads Commands

| Command                | Agent   | Purpose                        |
| ---------------------- | ------- | ------------------------------ |
| `/quick-build`         | build   | Trivial fixes, no bead created |
| `/design`              | planner | Architecture design            |
| `/ui-review`           | vision  | UI/UX analysis                 |
| `/accessibility-check` | vision  | A11y audit                     |
| `/fix-ci`              | build   | CI pipeline fixes              |
| `/fix-types`           | build   | TypeScript errors              |

## Workflow Patterns

### Pattern 1: Standard Task (S/M size)

```
/triage --quick          # Find ready work
/start bd-xxx            # Claim task, create branch
/implement bd-xxx        # Do the work
/finish bd-xxx           # Verify, commit (asks first), close
/pr bd-xxx               # Create PR (asks first)
```

### Pattern 2: Complex Feature with Worktree (L/XL size)

```
/triage                        # Full triage with health check
/new-feature "Feature" --worktree  # Creates epic + subtasks + worktree
cd .worktrees/bd-epic          # Enter worktree
/start bd-xxx.1                # Start first task
/implement bd-xxx.1            # Implement
/finish bd-xxx.1               # Complete task
/start bd-xxx.2                # Next task (now unblocked)
/implement bd-xxx.2            # Continue...
/finish bd-xxx.2               # Complete
...
/finish bd-epic                # Close epic when all tasks done
git worktree remove .worktrees/bd-epic  # Cleanup worktree
```

### Pattern 3: Research-First with Subagent Delegation

```
/create "Complex task"         # Create bead with spec
/start bd-xxx --research       # Claim + parallel subagent research
/plan bd-xxx --create-beads    # Design with auto-hierarchy
/implement bd-xxx.1            # Implement first subtask
/finish bd-xxx.1               # Complete subtask
/implement bd-xxx.2 --parallel # Next subtask with research
/finish bd-xxx.2               # Complete subtask
/finish bd-xxx                 # Close parent task
```

### Pattern 4: Bug Fix

```
/issue 123               # Import GitHub issue as bead
/start bd-xxx            # Claim
/fix bd-xxx              # Diagnose + fix (asks before commit)
/finish bd-xxx           # Verify + close
/pr bd-xxx               # Create PR
```

### Pattern 5: Session Handoff

```
/implement bd-xxx        # Working on task...
# Context getting large or end of day
/handoff bd-xxx          # Save progress, creates handoff.md
# New session
/resume bd-xxx           # Load context, continue
```

### Pattern 6: Trivial Fix (No Bead)

```
/quick-build "fix typo"  # Single file, <30 min, commits directly
```

### Pattern 7: Epic with Parallel Workstreams

```
/new-feature "Big Feature" --worktree
# Creates: bd-epic with bd-xxx1, bd-xxx2, bd-xxx3

# Agent 1 (main worktree)
/start bd-xxx1 --worktree
/implement bd-xxx1
/finish bd-xxx1

# Agent 2 (separate worktree - if independent)
/start bd-xxx2 --worktree
/implement bd-xxx2
/finish bd-xxx2

# Merge when all complete
/finish bd-epic
```

## Agent Boundaries

### Leader Agents (Touch Beads)

| Agent   | Can Do                          | Cannot Do |
| ------- | ------------------------------- | --------- |
| `build` | All beads operations, `bd sync` | -         |
| `rush`  | All beads operations, `bd sync` | -         |

### Subagents (Read-Only Beads)

| Agent     | Can Do                                 | Cannot Do             |
| --------- | -------------------------------------- | --------------------- |
| `planner` | `bd show`, `bd list`, create artifacts | `bd sync`, `bd close` |
| `scout`   | `bd show` (read context)               | Any writes            |
| `explore` | `bd show`, `bd list`                   | Any writes            |
| `review`  | `bd show`                              | Any writes            |
| `vision`  | None                                   | All beads operations  |

## File Locking (Multi-Agent)

```typescript
// Before editing shared files
bd - reserve({ paths: ["src/auth.ts"], ttl: 600 });

// Do work...

// After completing edits
bd - release({ paths: ["src/auth.ts"] });

// Check active locks
bd - release({ _: true }); // No paths = list locks
```

## Commit Message Format

Always include bead ID for traceability:

```
feat(auth): add token refresh (bd-a1b2c3)

Implement automatic token refresh when access token expires.

Closes: bd-a1b2c3
```

## Session End Checklist

1. [ ] All work committed
2. [ ] `bd sync` run (pushes to git)
3. [ ] If incomplete: `/handoff <id>` created
4. [ ] If complete: `/finish <id>` run
5. [ ] No stale file locks (`bd-release({ _: true })`)
6. [ ] Worktrees cleaned up (if used)

## Troubleshooting

| Problem                      | Solution                                            |
| ---------------------------- | --------------------------------------------------- |
| "bd command not found"       | `npm install -g beads-village`                      |
| Orphaned issues              | `bd doctor --fix`                                   |
| DB too large                 | `bd cleanup --days 3`                               |
| Sync conflicts               | `bd sync --force` (careful!)                        |
| Stale handoff                | Check if rebase needed before `/resume`             |
| Task not in `bd ready`       | Check blockers: `bd show <id>`                      |
| "Branch already checked out" | `rm -rf .git/beads-worktrees && git worktree prune` |
| Daemon issues in worktree    | `bd config set sync-branch beads-sync`              |
| Sandbox environment          | `bd --sandbox` or `BEADS_NO_DAEMON=1`               |

## Anti-Patterns

| Don't                                  | Why                   | Do Instead                       |
| -------------------------------------- | --------------------- | -------------------------------- |
| Skip `bd sync` at session end          | Changes won't persist | Always sync before stopping      |
| Create beads for trivial fixes         | DB bloat              | Use `/quick-build`               |
| Work on blocked tasks                  | Wastes time           | Use `bd ready` to find unblocked |
| Subagents running `bd sync`            | Coordination issues   | Only leader agents sync          |
| Force through complex with quick-build | Technical debt        | Proper `/create` workflow        |
| Ignore `bd doctor` warnings            | Corruption risk       | Fix issues promptly              |
| Skip worktree for XL features          | Merge conflicts       | Use `--worktree` flag            |
| Implement epic directly                | Too large             | Work on subtasks instead         |
| Wait for subagent results              | Blocks progress       | Fire parallel, continue working  |
