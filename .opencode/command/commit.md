---
description: Commit with verification and optional bead traceability
argument-hint: "[bead-id] [--amend]"
agent: build
---

# Commit

**Load skills:**

```typescript
skill({ name: "beads" }); // Session protocol
skill({ name: "verification-before-completion" });
```

## Options

- `--amend`: Amend the last commit (only if not pushed and you created it)

## Phase 1: Check Git State

!`git status --porcelain`
!`git diff --stat`
!`git diff --cached --stat`

Report:

```
Git State:
━━━━━━━━━━

Staged:
- [file1] (modified)
- [file2] (new)

Unstaged:
- [file3] (modified)

Untracked:
- [file4]
```

If nothing staged: "No changes staged. Run `git add <files>` first."

## Phase 2: Run Verification Gates

Detect project type and run gates:

!`ls package.json Cargo.toml pyproject.toml go.mod Makefile 2>/dev/null`

| Project | Test Command    | Lint Command                         |
| ------- | --------------- | ------------------------------------ |
| Node.js | `npm test`      | `npm run lint && npm run type-check` |
| Rust    | `cargo test`    | `cargo clippy -- -D warnings`        |
| Python  | `pytest`        | `ruff check . && mypy .`             |
| Go      | `go test ./...` | `golangci-lint run`                  |

```
Verification:
━━━━━━━━━━━━━

Tests: [✓/✗/skipped]
Lint:  [✓/✗/skipped]
Types: [✓/✗/skipped]
```

**If any gate fails:**

```
Cannot commit: [gate] failed.

Fix errors or use `git commit --no-verify` (not recommended).
```

## Phase 3: Analyze Changes for Message

!`git diff --cached --stat`
!`git diff --cached`

Determine:

- **Type**: What kind of change is this?
- **Scope**: Which module/component changed?
- **Summary**: What does this change do?

### Commit Type Guide

| Type       | When to Use                             | Example                            |
| ---------- | --------------------------------------- | ---------------------------------- |
| `feat`     | New feature for user                    | `feat(auth): add OAuth login`      |
| `fix`      | Bug fix                                 | `fix(api): handle null response`   |
| `refactor` | Code change (no new feature or fix)     | `refactor(utils): simplify parser` |
| `docs`     | Documentation only                      | `docs: update API reference`       |
| `test`     | Adding or updating tests                | `test(auth): add login tests`      |
| `chore`    | Maintenance, deps, tooling              | `chore: update dependencies`       |
| `style`    | Formatting, whitespace (no code change) | `style: fix indentation`           |
| `perf`     | Performance improvement                 | `perf(db): add query caching`      |
| `ci`       | CI/CD changes                           | `ci: add deploy workflow`          |

### Scope Detection

Auto-detect scope from changed files:

| Changed Files           | Suggested Scope |
| ----------------------- | --------------- |
| `src/auth/*`            | auth            |
| `src/api/*`             | api             |
| `src/components/*`      | ui              |
| `tests/*`               | test            |
| `docs/*`                | docs            |
| Multiple unrelated dirs | (omit scope)    |

## Phase 4: Generate Commit Message

Propose message based on analysis:

```
Proposed Commit:
━━━━━━━━━━━━━━━━

<type>(<scope>): <summary>

[body - what and why, not how]

[footer - bead reference, breaking changes]
```

**Example with bead:**

```
feat(auth): add token refresh mechanism

Implement automatic token refresh when access token expires.
Tokens are stored in secure session storage.

bd-a1b2c3: OAuth implementation
```

**Example with breaking change:**

```
feat(api)!: change response format

BREAKING CHANGE: API responses now use camelCase instead of snake_case.
Migration guide: https://...
```

Ask user:

```
Use this message? (yes/edit/cancel)
```

## Phase 5: Execute Commit

```bash
git commit -m "<message>"
```

**If pre-commit hook fails:**

```
Pre-commit hook failed:
━━━━━━━━━━━━━━━━━━━━━━━

[hook output]

Options:
1. Fix issues and retry: /commit [bead-id]
2. Skip hook (not recommended): git commit --no-verify -m "..."
```

**Do NOT use --amend** unless:

1. User explicitly requested `--amend`
2. You created the HEAD commit in this session
3. Commit has NOT been pushed to remote

## Phase 6: Sync (for multi-agent)

If bead ID was provided:

```bash
bd sync
```

## Output

```
Committed: [short-hash]
━━━━━━━━━━━━━━━━━━━━━━━

Message: <type>(<scope>): <summary>
Files: [N] changed
Bead: <bead-id> (if provided)

Verification: All gates passed ✓
```

**Next steps:**

```
Continue working:
  [make more changes]
  /commit [bead-id]

Ready to finish:
  /finish <bead-id>

Create PR:
  /pr <bead-id>
```

## Amend Workflow (--amend)

**Safety checks before amend:**

!`git log -1 --format='%H %s'` # What we're amending
!`git status` # Check if pushed

```
Amend Safety Check:
━━━━━━━━━━━━━━━━━━━

HEAD commit: [hash] [message]
Pushed to remote: [yes/no]
Created by you: [yes/no]
```

**If pushed or not created by you: STOP.**

```
Cannot amend: Commit already pushed or not created by you.

Use a new commit instead:
  git add <files>
  /commit [bead-id]
```

**If safe to amend:**

```bash
git add <files>
git commit --amend -m "<updated message>"
```
