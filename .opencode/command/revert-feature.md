---
description: Smart git-aware revert for a bead/feature with safety checks
argument-hint: "<bead-id> [--phase=N] [--task=N] [--soft] [--dry-run] [--interactive]"
agent: build
model: proxypal/gemini-3-flash-preview
---

# Revert Feature: $ARGUMENTS

**Load skills:**

```typescript
skill({ name: "beads" }); // Session protocol
skill({ name: "verification-before-completion" });
```

Intelligently revert changes for a bead with comprehensive safety checks.

## Parse Arguments

| Argument               | Default  | Description                       |
| ---------------------- | -------- | --------------------------------- |
| Bead ID                | required | Feature to revert                 |
| `--phase=N`            | all      | Revert only specific phase        |
| `--task=N`             | all      | Revert only specific task         |
| `--soft`               | false    | Stage reverts without committing  |
| `--dry-run`            | false    | Preview changes without executing |
| `--interactive`        | false    | Choose which commits to revert    |
| `--include-migrations` | false    | Also revert database migrations   |

---

## Phase 1: Pre-Revert Checklist

Before any action, verify:

!`git status --short`
!`gh run list --limit 1`
!`git branch --show-current`

### Safety Gates

| Check              | Pass                   | Action if Fail             |
| ------------------ | ---------------------- | -------------------------- |
| Clean working tree | No uncommitted changes | Stash or commit first      |
| CI passing         | Latest run succeeded   | Warn, confirm continue     |
| Not on main/master | On feature branch      | Require `--force` for main |
| Bead exists        | `bd show` returns data | Abort with error           |

---

## Phase 2: Analyze Bead History

!`bd show [bead-id]`

!`git log --oneline --all --grep="[bead-id]"`
!`git log --name-only --grep="[bead-id]" --pretty=format:""`
!`git log --shortstat --grep="[bead-id]"`

### Impact Report

```
Revert Analysis: [bead-id]
━━━━━━━━━━━━━━━━━━━━━━━━━━

Bead: [title]
Status: [in_progress/closed]
Created: [date]

Commits found: 5
├── abc1234 feat: add login form (Phase 1)
├── def5678 feat: add validation (Phase 1)
├── ghi9012 feat: JWT tokens (Phase 2)
├── jkl3456 test: add auth tests (Phase 3)
└── mno7890 docs: update README (Phase 3)

Files affected: 12
├── src/auth/login.ts (created)
├── src/auth/jwt.ts (created)
├── src/api/routes.ts (modified)
├── tests/auth.test.ts (created)
└── ... 8 more files

Lines: +456 / -23
```

---

## Phase 3: Check Downstream Impact

Before reverting, check what depends on this:

!`bd list --status all --limit 50`

# Filter for beads that depend on this one

!`grep -r "from './auth/" src/ --include="*.ts"`
!`git log --oneline --all -- src/auth/ | grep -v "[bead-id]"`

### Downstream Report

```
Downstream Impact Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━

Dependent beads:
⚠ bd-xyz789: "User dashboard" imports from src/auth/
⚠ bd-uvw456: "Profile page" uses JWT utilities

Other code referencing these files:
- src/api/middleware.ts:15 imports { verifyToken }
- src/pages/profile.tsx:8 imports { useAuth }

Database migrations:
- 001_create_users.sql (would need revert)
- 002_add_sessions.sql (would need revert)

Feature flags:
- AUTH_ENABLED flag in production

CAUTION: Reverting may break dependent features.
Proceed? (yes/abort/revert-cascade)
```

---

## Phase 4: Determine Revert Scope

| Scope       | Flag            | What Gets Reverted               |
| ----------- | --------------- | -------------------------------- |
| Full        | (default)       | All commits for bead             |
| Phase       | `--phase=N`     | Only commits tagged with phase N |
| Task        | `--task=N`      | Only commits for specific task   |
| Interactive | `--interactive` | User selects commits             |

### Interactive Mode

```
Select commits to revert:
━━━━━━━━━━━━━━━━━━━━━━━━

[x] abc1234 feat: add login form
[x] def5678 feat: add validation
[ ] ghi9012 feat: JWT tokens (skip - needed by other features)
[x] jkl3456 test: add auth tests
[ ] mno7890 docs: update README (skip - harmless)

Selected: 3 commits
Press Enter to continue, or 'a' to abort
```

---

## Phase 5: Create Backup

Before reverting, create safety backup:

```bash
# Create backup branch
git branch backup/[bead-id]-pre-revert

# Or stash current state
git stash push -m "pre-revert-[bead-id]"
```

```
Backup Created
━━━━━━━━━━━━━━

Branch: backup/[bead-id]-pre-revert
Commit: [current-sha]

To undo this revert later:
  git checkout backup/[bead-id]-pre-revert
  git cherry-pick [reverted-commits]
```

---

## Phase 6: Handle Database Migrations

If `--include-migrations` or migrations detected:

!`git log --name-only --grep="[bead-id]" -- "**/migrations/**"`

### Migration Revert Strategy

| Scenario                       | Action                         |
| ------------------------------ | ------------------------------ |
| Migrations not yet run in prod | Safe to delete migration files |
| Migrations run in prod         | Need down migration            |
| No down migration exists       | Manual intervention required   |

```bash
# Run down migrations (if applicable)
npm run migrate:down -- --to=[pre-feature-version]
# or
python manage.py migrate [app] [previous_migration]
```

**CAUTION:** Database reverts can cause data loss. Always backup first.

---

## Phase 7: Handle Feature Flags

If feature is behind a flag:

```bash
# Disable feature flag first
# This prevents errors while code is being reverted

# Example: Update feature flag config
echo "AUTH_ENABLED=false" >> .env
```

### Feature Flag Checklist

- [ ] Disable flag in development
- [ ] Disable flag in staging
- [ ] Disable flag in production
- [ ] THEN revert code

---

## Phase 8: Execute Revert

### Dry Run (--dry-run)

```bash
# Show what WOULD be reverted
git revert --no-commit [commits...] --dry-run 2>&1 || \
git diff [oldest-commit]^..[newest-commit] --stat
```

```
DRY RUN - No changes made
━━━━━━━━━━━━━━━━━━━━━━━━━

Would revert:
├── abc1234 feat: add login form
├── def5678 feat: add validation
└── jkl3456 test: add auth tests

Files that would be modified:
├── src/auth/login.ts (deleted)
├── src/api/routes.ts (restored to previous)
└── tests/auth.test.ts (deleted)

Run without --dry-run to execute.
```

### Soft Revert (--soft)

```bash
git revert --no-commit [commits...]
# Changes staged but not committed
```

### Hard Revert (default)

```bash
git revert --no-commit [commits...]
git commit -m "revert([bead-id]): [scope description]

Reverts commits: [list]
Reason: [user-provided or default]

Backup branch: backup/[bead-id]-pre-revert"
```

---

## Phase 9: Handle Conflicts

If conflicts occur:

```
Conflicts Detected
━━━━━━━━━━━━━━━━━━

Conflicting files:
├── src/api/routes.ts
└── src/config/index.ts

Options:
1. Abort revert (git revert --abort)
2. Resolve manually and continue
3. Accept theirs (keep current)
4. Accept ours (use reverted)

Select option (1/2/3/4):
```

### Conflict Resolution Guidance

```bash
# To abort
git revert --abort

# To resolve manually
# Edit conflicting files, then:
git add [resolved-files]
git revert --continue

# To accept one side
git checkout --theirs [file]  # Keep current
git checkout --ours [file]    # Use reverted
```

---

## Phase 10: Update Bead Status

```bash
bd-msg --subj "Reverted: [bead-id]" --body "Feature reverted at [timestamp]\nReason: [reason]\nBackup: backup/[bead-id]-pre-revert" --to "all" --importance normal
```

---

## Output

```
Revert Complete: [bead-id]
━━━━━━━━━━━━━━━━━━━━━━━━━━

Commits reverted: 3
Files restored: 8
Lines removed: +456 / -23 → net -433

Revert commit: [new-sha]
Backup branch: backup/[bead-id]-pre-revert

Bead status: Updated to 'open'

To undo this revert:
  git revert [new-sha]
  # or
  git cherry-pick [original-commits]

Next steps:
├── Verify app works: npm test
├── Check dependent features
└── Re-implement if needed: /implement [bead-id]
```

---

## Undo the Revert

If the revert was wrong:

```bash
# Option 1: Revert the revert
git revert [revert-commit-sha]

# Option 2: Cherry-pick original commits
git cherry-pick [original-commits...]

# Option 3: Restore from backup branch
git checkout backup/[bead-id]-pre-revert -- .
git commit -m "restore: [bead-id] from backup"
```

---

## Related Commands

| Need                 | Command                |
| -------------------- | ---------------------- |
| View bead history    | `bd show [bead-id]`    |
| Re-implement feature | `/implement [bead-id]` |
| Check status         | `/status [bead-id]`    |
| Create new feature   | `/new-feature`         |
