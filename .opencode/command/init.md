---
description: Initialize project for AI-assisted development (creates AGENTS.md + memory files)
argument-hint: "[--deep] [--skip-questions]"
agent: planner
subtask: true
---

# Init: $ARGUMENTS

One command to onboard a project. Creates project-root AGENTS.md and populates memory files.

## Options

- `--deep`: Comprehensive research (~100+ tool calls). Git history, patterns, contributors, subsystem detection.
- `--skip-questions`: Skip upfront questions, infer from git config.

Default: Standard research (~20-50 tool calls).

## Phase 1: Upfront Questions

Unless `--skip-questions`, ask in one message:

1. **Identity**: "Which git contributor are you?" (show top 5 from !`git shortlog -sn --all | head -5`)
2. **Communication**: "Terse or detailed responses?"
3. **Workflow**: "Auto-commit or ask-first?"
4. **Rules**: "Any rules I should always follow?"
5. **Beads**: "Use beads for task tracking? (y/n)"

If skipped, infer identity from `git config user.name` and `git config user.email`.

## Phase 2: Detect Project

### Always Check

- `package.json`, `go.mod`, `pyproject.toml`, `Cargo.toml` - tech stack WITH VERSIONS
- `README.md` - project description
- `.github/workflows/`, `.gitlab-ci.yml` - CI/CD
- `Makefile`, `justfile` - build commands
- Existing rules: `.cursor/rules/`, `.cursorrules`, `.github/copilot-instructions.md`
- Top-level directories - identify structure

### Validate Commands

!`npm run build 2>&1 | head -5` # Check for errors
!`npm test -- --help 2>&1 | head -3` # Verify test syntax

### With --deep

!`git shortlog -sn --all | head -10` # contributors
!`git log --format="%s" -50` # commit conventions
!`git branch -a` # branching strategy

- Source file analysis for patterns
- Identify subsystems needing nested AGENTS.md

## Phase 3: Create Project-Root AGENTS.md

Create `./AGENTS.md` - **TARGET: <60 lines** (max 150 lines).

Research shows: Frontier LLMs reliably follow ~150-200 instructions. More = degraded quality across ALL instructions.

```markdown
# [Project Name]

## Tech Stack

- [Language] [version] with [framework] [version]
- [Key dependencies with versions]
- [Build tool]: [tool name]

## File Structure
```

src/ # Source code
tests/ # Test files  
docs/ # Documentation
scripts/ # Build/deploy scripts

````

## Commands

**Build**: `[detected command]`
**Test**: `[detected command]` (single test: `[syntax]`)
**Lint**: `[detected command]`
**Dev**: `[detected command]`

## Code Examples

Good pattern (from your codebase):

```[language]
[Actual code snippet showing preferred style - 5-10 lines]
````

## Testing

- Tests live in: `[path]`
- Run single test: `[command]`
- Verify changes: `[command]`

## Boundaries

✅ **Always**: Run lint before commit, include tests for new features
⚠️ **Ask first**: Schema changes, new dependencies, file deletions
🚫 **Never**: Commit secrets, modify vendor/, force push main, skip tests

## Gotchas

- [Known issue or edge case]
- [Thing that will waste 2+ hours if forgotten]

````

**Key principles:**
- Examples > Explanations (LLMs are in-context learners)
- Pointers > Copies ("See docs/architecture.md" not inline everything)
- If AGENTS.md exists, improve it - don't overwrite blindly

## Phase 4: Detect Subsystems (--deep only)

For projects with distinct subsystems, identify candidates for nested AGENTS.md:

!`find . -type d \( -name "src" -o -name "packages" -o -name "apps" \) | head -10`

Suggest nested AGENTS.md for:

- `packages/*/` in monorepos
- `src/` vs `tests/` if patterns differ significantly
- `frontend/` vs `backend/` directories

Output suggestion:

```
Detected subsystems that may benefit from nested AGENTS.md:
- packages/api/ - API server patterns
- packages/web/ - Frontend patterns
- tests/ - Testing conventions

Create nested AGENTS.md files? (y/n)
```

## Phase 5: Populate Memory Files

### .opencode/memory/user.md

```markdown
---
purpose: User identity, preferences, communication style
updated: [today]
---

# User Profile

## Identity

- Name: [from git/questions]
- Git contributor: [email/username]

## Preferences

- Communication: [terse/detailed]
- Workflow: [auto-commit/ask-first]

## Rules

[from Phase 1]
```

### .opencode/memory/project/commands.md

```markdown
---
purpose: Build, test, lint, deploy commands
updated: [today]
---

# Commands

## Build

`[detected and validated]`

## Test

`[detected]`
Single test: `[syntax with example]`

## Lint

`[detected]`

## Dev Server

`[detected]`
```

### .opencode/memory/project/architecture.md

```markdown
---
purpose: Key modules, directory structure
updated: [today]
---

# Architecture

## Structure

[detected directory layout with purpose annotations]

## Key Modules

[identified entry points, core modules, their responsibilities]

## Data Flow

[how data moves through the system - if detectable]
```

### With --deep, also create:

- `project/conventions.md` - from git log analysis
- `project/gotchas.md` - from bug-fix patterns in history

## Phase 6: Initialize Beads (if requested)

If user said yes to beads:

```bash
bd init  # or equivalent initialization
```

Create `.beads/` directory structure for task tracking.

## Phase 7: Reflection

Before finishing, verify:

1. [ ] AGENTS.md is <60 lines (or has good reason to be longer)?
2. [ ] Commands were validated and actually work?
3. [ ] Boundaries section includes Never rules?
4. [ ] At least one code example from actual codebase?
5. [ ] Memory files created with accurate info?

Fix any issues found.

## Phase 8: Summary

Report:

```
Initialization Complete
━━━━━━━━━━━━━━━━━━━━━━━

Files created:
- ./AGENTS.md ([N] lines)
- .opencode/memory/user.md
- .opencode/memory/project/commands.md
- .opencode/memory/project/architecture.md
[- .beads/ (if initialized)]

Tech stack: [detected]
Commands validated: [yes/no]

Suggested next steps:
1. Review AGENTS.md and adjust boundaries
2. Run /review-codebase to check conventions
3. [If --deep suggested subsystems] Create nested AGENTS.md files
```

## File Locations

```
./AGENTS.md                              # Project-specific rules (created, <60 lines)
.opencode/AGENTS.md                      # Global rules (untouched)
.opencode/memory/user.md                 # User preferences (created)
.opencode/memory/project/commands.md     # Build commands (created)
.opencode/memory/project/architecture.md # Structure (created)
.opencode/memory/project/conventions.md  # Patterns (--deep only)
.opencode/memory/project/gotchas.md      # Warnings (--deep only)
[packages/*/AGENTS.md]                   # Subsystem rules (--deep, if requested)
```

## Anti-Patterns to Avoid

- ❌ Vague instructions: "Be helpful" or "Write good code"
- ❌ Detailed style rules (use linters instead)
- ❌ Every possible command (context bloat)
- ❌ Auto-generated content without review
- ❌ Code snippets that go stale (use pointers)
````
