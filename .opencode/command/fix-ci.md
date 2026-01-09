---
description: Fix CI failures
argument-hint: "<run-id or url>"
agent: build
---

# Fix CI: $ARGUMENTS

CI failures are P0 bugs. Fix fast.

## Get The Logs

!`gh run view $ARGUMENTS --log-failed`

List recent failures:

!`gh run list --status=failure --limit=5`

## Extract The Error

!`gh run view $ARGUMENTS --json jobs --jq '.jobs[] | select(.conclusion=="failure")'`

!`gh run view $ARGUMENTS --log > /tmp/ci-log.txt && grep -i "error\|failed" /tmp/ci-log.txt | head -30`

Identify:

- **Job** that failed
- **Step** in that job
- **Error message** exact text

## Common Patterns

| Pattern        | Symptoms                | Fix                                |
| -------------- | ----------------------- | ---------------------------------- |
| Dependency     | "module not found"      | `rm -rf node_modules && npm ci`    |
| Environment    | Works locally, fails CI | Check Node version, env vars       |
| Type error     | "tsc" failed            | `npm run type-check` locally first |
| Lint error     | ESLint failed           | `npm run lint -- --fix`            |
| Test flaky     | Intermittent            | Add retries, fix race condition    |
| Secret missing | "secret not found"      | Check repo settings                |

## Reproduce Locally

```bash
npm ci
npm run build
npm test
npm run lint
```

If passes locally but fails in CI, check environment differences.

## Fix And Verify

Make the fix. Verify locally:

```bash
npm run build && npm test && npm run lint && npm run type-check
```

## Push And Watch

!`gh run watch`

## If Still Failing

Iterate:

1. Fetch new logs
2. Identify remaining error
3. Fix and push again
4. Max 3 iterations, then escalate

If fix makes things worse:

```bash
git revert HEAD
git push
```

## Document

If it's a recurring issue:

```typescript
observation({
  type: "bugfix",
  title: "CI: [issue]",
  content: "Root cause: [what]\nFix: [how]\nPrevention: [future]",
});
```

## Sync

```bash
bd sync
```

## Output

```
CI Fixed: $ARGUMENTS

Root cause: [brief]
Changes: [files]

New run: [url]
Status: Passed ✓
```
