---
description: Create and submit pull request with bead traceability
argument-hint: "<bead-id> [--draft] [--wait]"
agent: build
---

# Pull Request

**Load skills:**

```typescript
skill({ name: "beads" }); // Session protocol
skill({ name: "verification-before-completion" });
```

## Options

- `--draft`: Create as draft PR (for WIP or early feedback)
- `--wait`: Wait for CI checks to pass after creation

## Phase 1: Pre-PR Verification

Before creating PR, run verification gates:

```
!`git status --porcelain`  # Check for uncommitted changes
```

If uncommitted changes exist, ask: "Commit these changes first?"

Run project gates:

```
!`npm run build 2>&1 | tail -5`
!`npm test 2>&1 | tail -10`
!`npm run lint 2>&1 | tail -5`
```

```
Pre-PR Gates:
━━━━━━━━━━━━━

Build: [✓/✗]
Tests: [✓/✗]
Lint:  [✓/✗]
```

**If any gate fails: STOP.**

```
Cannot create PR: [gate] failed.

Fix errors first, then run /pr again.
```

## Phase 2: Check for Conflicts

```
!`git fetch origin main`
!`git merge-base --is-ancestor origin/main HEAD || git diff origin/main...HEAD --name-only`
```

Check for merge conflicts:

```
!`git merge --no-commit --no-ff origin/main 2>&1 || true`
!`git merge --abort 2>/dev/null || true`
```

If conflicts detected:

```
⚠️  Merge conflicts detected with main:
- [file1]
- [file2]

Resolve conflicts before creating PR:
  git fetch origin main
  git rebase origin/main
  # Fix conflicts, then /pr again
```

## Phase 3: Gather Context

**Current state:**

```
!`git branch --show-current`
!`git diff main...HEAD --stat`
!`git log main...HEAD --oneline`
```

**Load bead context (if provided):**

```
!`bd show $ARGUMENTS`
```

**Load artifacts:**

```
!`ls .beads/artifacts/<bead-id>/ 2>/dev/null`
!`cat .beads/artifacts/<bead-id>/spec.md 2>/dev/null | head -30`
!`cat .beads/artifacts/<bead-id>/review.md 2>/dev/null | head -30`
```

Extract from artifacts:

- **Goal** from spec.md
- **Changes Made** from review.md
- **Estimation Accuracy** from review.md
- **Success Criteria** verification

## Phase 4: Review Before Push

Show what will be pushed:

```bash
git log origin/$(git branch --show-current)..HEAD --oneline 2>/dev/null || git log --oneline -5
git diff --stat origin/$(git branch --show-current)..HEAD 2>/dev/null || git diff --stat HEAD~3..HEAD
```

**Present to user:**

```
Ready to Push & Create PR
━━━━━━━━━━━━━━━━━━━━━━━━━

Branch: [current branch]
Commits: [N commits ahead of origin]

Would you like me to:
1. Push and create PR
2. Push and create draft PR
3. Show full diff first
4. Skip (I'll push manually)
```

**Wait for user confirmation before proceeding.**

If user confirms, push:

```bash
git push -u origin $(git branch --show-current)
```

## Phase 5: Create PR

Generate PR content from context:

```bash
gh pr create --title "<title>" --body "$(cat <<'EOF'  # Keep as instructional (multi-line)
## Summary

[1-2 sentence description of what this PR does and why]

## Changes

| File | Change |
| ---- | ------ |
| `src/foo.ts` | [description] |
| `src/bar.ts` | [description] |

## Testing

**Automated:**
- All tests pass ✓
- Lint passes ✓
- Type check passes ✓

**Manual verification:**
- [ ] [How to test manually]

## Screenshots

[If UI changes, include before/after screenshots]

## Estimation

| Metric | Value |
| ------ | ----- |
| Estimated | [S/M/L] (~N calls) |
| Actual | N calls |
| Accuracy | [+/-N%] |

## Checklist

- [x] Tests added/updated
- [x] All gates pass
- [ ] Docs updated (if applicable)
- [ ] Breaking changes documented (if any)

## Artifacts

- [spec.md](.beads/artifacts/<bead-id>/spec.md)
- [review.md](.beads/artifacts/<bead-id>/review.md)
[- research.md, plan.md, adr.md if they exist]

## Bead Reference

Closes: <bead-id>
EOF
)"
```

**For draft PRs (--draft):**

```bash
gh pr create --draft --title "<title>" --body "..."  # Keep as-is (instructional)
```

## Phase 6: Wait for CI (if --wait)

```
!`gh pr checks --watch`
```

Report CI status:

```
CI Status:
━━━━━━━━━━

- build: [✓/✗/pending]
- test: [✓/✗/pending]
- lint: [✓/✗/pending]

[If all pass] CI passed ✓
[If any fail] CI failed: [which check]
```

## Phase 7: Update Bead & Sync

```bash
bd-msg --subj "PR created" --body "PR: <pr-url>\nStatus: [ready/draft]\nCI: [passing/pending]" --to "all" --importance normal
bd sync
```

## Output

```
PR Created: <bead-id>
━━━━━━━━━━━━━━━━━━━━

URL: <pr-url>
Status: [Ready for Review / Draft]
Branch: <branch> → main

Pre-PR Gates: All passed ✓
Conflicts: None ✓
[CI: Passed ✓ (if --wait)]

Artifacts linked:
- spec.md ✓
- review.md ✓
[- research.md, plan.md, adr.md]
```

**Next steps:**

```
━━━━━━━━━━━━━━━━━━━━

Request review:
  gh pr edit <pr-number> --add-reviewer <username>

Check CI:
  gh pr checks

Merge when approved:
  gh pr merge --squash
```

**If draft PR:**

```
Draft PR created. When ready:
  gh pr ready
```
