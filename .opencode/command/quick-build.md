---
description: Quick build for trivial tasks with fast verification
argument-hint: "<task-description> [--no-test] [--no-commit]"
agent: build
---

# Quick Build: $ARGUMENTS

Fast path for trivial tasks. Skip ceremony, keep safety.

## Parse Arguments

| Argument         | Default  | Description                   |
| ---------------- | -------- | ----------------------------- |
| Task description | required | What to fix/change            |
| `--no-test`      | false    | Skip test run (use sparingly) |
| `--no-commit`    | false    | Make changes but don't commit |

---

## Qualification Check

**This task qualifies for quick-build if ALL are true:**

| Criterion                | Check                                | If False          |
| ------------------------ | ------------------------------------ | ----------------- |
| Single file change       | 1 file modified                      | Use `/create`     |
| No new dependencies      | No package.json/requirements changes | Use `/create`     |
| No database changes      | No migrations, schema changes        | Use `/create`     |
| No security implications | No auth, secrets, permissions        | Use `/create`     |
| Under 30 minutes         | Estimate < 30 min                    | Use `/create`     |
| Clear scope              | Know exactly what to change          | Use `/brainstorm` |
| Low risk                 | Won't break critical paths           | Use `/create`     |

**Examples that qualify:**

- Fix typo in UI text
- Update a constant value
- Fix off-by-one error
- Add missing null check
- Update documentation
- Rename a variable
- Fix CSS styling issue

**Examples that DON'T qualify:**

- Add new API endpoint (multiple files)
- Change authentication logic (security)
- Update database schema (DB changes)
- Add new npm package (dependencies)
- Refactor a module (scope unclear)

---

## Workflow

### Step 1: Verify Scope (30 seconds)

!`grep -r "[search-term]" src/ --include="*.{ts,tsx}" -l | head -5`

If more than 1 file: **STOP** → Use `/create $ARGUMENTS` instead.

### Step 2: Backup Current State

```bash
# Stash any existing changes
git stash push -m "pre-quickbuild-$(date +%s)" 2>/dev/null || true
```

!`git rev-parse HEAD`

### Step 3: Make the Change

```bash
# Read the file
read [file-path]

# Make minimal, focused edit
edit [file-path] [oldString] [newString]
```

**Edit guidelines:**

- Change only what's necessary
- Add comment if non-obvious
- Don't refactor adjacent code
- Don't fix unrelated issues

### Step 4: Verify (unless --no-test)

```bash
# Type check
npm run type-check || tsc --noEmit

# Run relevant tests
npm test -- --testPathPattern="[related-test]" --passWithNoTests

# Lint check
npm run lint -- [file-path]
```

**All checks must pass before committing.**

### Step 5: Commit (unless --no-commit)

```bash
git add [file-path]
git commit -m "fix: [concise description]

Quick-build: [task description]"
```

**Commit message format:**

- `fix:` for bug fixes
- `chore:` for maintenance
- `docs:` for documentation
- `style:` for formatting

---

## Escape Hatch

If during work you realize it's more complex:

```
⚠ Complexity detected:
- Multiple files need changes
- Found related issues that need fixing
- Discovered missing test coverage

Escaping to structured workflow...
```

**Action:**

1. Revert uncommitted changes: `git checkout -- .`
2. Create proper bead: `/create $ARGUMENTS`
3. Continue with full workflow

**Don't force a complex change through quick-build.**

---

## Time Budget

| Task Type      | Max Time | Example                      |
| -------------- | -------- | ---------------------------- |
| Typo/text fix  | 5 min    | Fix spelling in button label |
| Config change  | 10 min   | Update timeout value         |
| Simple bug fix | 15 min   | Fix null check               |
| Style fix      | 10 min   | Fix CSS alignment            |
| Doc update     | 15 min   | Update README section        |

**If approaching 30 minutes: STOP and escalate to /create.**

---

## Output

```
Quick Build Complete
━━━━━━━━━━━━━━━━━━━━

Task: [description]
File: [path]
Time: [X minutes]

Changes:
- [summary of change]

Verification:
✓ Type check passed
✓ Tests passed (3 specs)
✓ Lint passed

Commit: [sha] "fix: [message]"

Done. No bead created (trivial task).
```

---

## Rollback

If the quick fix causes issues:

```bash
# Revert the commit
git revert HEAD --no-edit

# Or reset to before
git reset --hard HEAD~1
```

---

## Examples

```bash
# Fix a typo
/quick-build fix typo in login button text

# Update a constant
/quick-build change MAX_RETRIES from 3 to 5

# Fix null check
/quick-build add null check in getUserName function

# CSS fix
/quick-build fix button alignment in header

# Skip tests for doc-only change
/quick-build update README installation instructions --no-test
```

---

## Anti-Patterns

| Don't                       | Why                | Do Instead            |
| --------------------------- | ------------------ | --------------------- |
| Quick-build multiple files  | Scope creep        | Use `/create`         |
| Skip tests for code changes | Risk of regression | Always verify         |
| Fix "one more thing"        | Scope creep        | Separate quick-build  |
| Force complex through       | Technical debt     | Escalate to `/create` |
| Quick-build without reading | May miss context   | Read file first       |

---

## Related Commands

| Need            | Command                     |
| --------------- | --------------------------- |
| Structured task | `/create` then `/implement` |
| Just exploring  | Read files directly         |
| Multiple fixes  | `/create` with sub-tasks    |
| Need planning   | `/new-feature`              |
