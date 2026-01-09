---
description: Review code for quality, security, and compliance
argument-hint: "[path|bead-id|pr-number|'all'] [--quick|--thorough]"
agent: review
subtask: true
---

# Review: $ARGUMENTS

## Load Beads Skill

```typescript
skill({ name: "beads" });
```

## Phase 1: Determine Scope

Parse `$ARGUMENTS` to determine what to review:

| Input                    | Scope                  | How to Get Code                             |
| ------------------------ | ---------------------- | ------------------------------------------- |
| File/directory path      | That path only         | `read` or `glob` + `read`                   |
| Bead ID (e.g., `bd-123`) | Implementation vs spec | `bd show` then `git diff` from spec         |
| PR number (e.g., `#45`)  | PR changes             | `gh pr diff 45`                             |
| `all` or empty           | Recent changes         | `git diff main...HEAD` or `git diff HEAD~5` |

If bead exists, load spec from `.beads/artifacts/$ID/spec.md` and review against constraints.

## Phase 2: Automated Analysis

Run these checks first (batch for speed):

```typescript
// Type/lint errors
lsp_lsp_diagnostics(); // for each changed file
```

!`npm run type-check || tsc --noEmit`
!`npm run lint || true`

```typescript
// Anti-pattern detection with ast-grep
ast - grep({ pattern: "console.log($$$)" }); // Debug statements
ast - grep({ pattern: "any" }); // TypeScript any
grep({ pattern: "TODO|FIXME|HACK|XXX" });
ast - grep({ pattern: 'password = "$$$"' }); // Hardcoded secrets
```

!`npm test || pytest || cargo test`

Collect all automated findings before manual review.

## Phase 3: Manual Review Categories

```typescript
skill({ name: "requesting-code-review" });
```

Review each category with specific focus:

### Security

- Authentication/authorization checks on all endpoints
- Input validation and sanitization
- No secrets in code (API keys, passwords, tokens)
- SQL/command injection prevention
- XSS prevention (output encoding)

### Performance

- N+1 query patterns
- Unbounded loops or recursion
- Missing pagination on large datasets
- Expensive operations in hot paths
- Missing caching where appropriate

### Maintainability

- Cyclomatic complexity (functions > 10 branches)
- DRY violations (duplicated logic)
- Dead code or unreachable branches
- Naming clarity (can you understand without comments?)
- Single Responsibility violations

### Error Handling

- All async operations have error handling
- Errors are logged with context
- User-facing errors are sanitized (no stack traces)
- Graceful degradation where appropriate

### Testing

- Test coverage on new/changed code
- Tests verify behavior, not implementation
- Edge cases covered (empty, null, boundary)
- No excessive mocking (tests actually test something)

### Type Safety (TypeScript/typed languages)

- No `any` types without justification
- Proper null/undefined handling
- Generic types used appropriately
- Return types explicit on public APIs

## Phase 4: Create Tracking Issues

For each Critical or Important finding:

```bash
bd create "[Review] <brief issue description>" -t bug -p 1
```

Skip creating beads for Minor issues (just report them).

## Phase 5: Output Format

### Summary

| Metric             | Value   |
| ------------------ | ------- |
| Files reviewed     | X       |
| Lines changed      | +X / -Y |
| Critical issues    | X       |
| Important issues   | X       |
| Minor issues       | X       |
| Automated findings | X       |

### Automated Findings

```
[LSP] src/auth.ts:45 - Type 'string' is not assignable to type 'User'
[AST] src/utils.ts:12 - console.log detected
[GREP] src/config.ts:8 - TODO: implement rate limiting
```

### Manual Findings

#### Critical (Must Fix Before Merge)

| File:Line        | Issue                                | Category | Fix                            |
| ---------------- | ------------------------------------ | -------- | ------------------------------ |
| `src/auth.ts:45` | Missing auth check on admin endpoint | Security | Add `requireAuth()` middleware |

#### Important (Should Fix)

| File:Line      | Issue                  | Category    | Fix                          |
| -------------- | ---------------------- | ----------- | ---------------------------- |
| `src/db.ts:89` | N+1 query in user list | Performance | Use `include` or batch query |

#### Minor (Nice to Have)

| File:Line         | Issue                    | Category        | Fix                         |
| ----------------- | ------------------------ | --------------- | --------------------------- |
| `src/utils.ts:12` | Console.log left in code | Maintainability | Remove or use proper logger |

### Strengths

- [What's done well - be specific with file:line]

### Recommendations

- [Improvements beyond immediate fixes]

### Verdict

**Ready to merge:** Yes | No | With Fixes

**Reasoning:** [1-2 sentences explaining the decision]

**Beads created:** [List bead IDs for Critical/Important findings, or "None"]

---

## Depth Levels

**--quick** (~5-10 min): Automated checks + skim changed files, focus on Critical only
**--thorough** (default, ~15-30 min): Full automated + manual review of all categories
**--security**: Focus only on security category with deeper analysis

## Examples

```bash
# Review a specific file
/review-codebase src/auth/login.ts

# Review against a bead spec
/review-codebase bd-feature-auth

# Review a PR
/review-codebase #45

# Quick review of recent changes
/review-codebase all --quick

# Security-focused review
/review-codebase src/api/ --security
```

## Anti-Patterns (Don't Do This)

- "LGTM" without actually reviewing
- Marking style issues as Critical
- Reviewing code you didn't read
- Vague feedback ("improve error handling" - WHERE? HOW?)
- Skipping automated checks "to save time"
- Not creating beads for real issues (they get forgotten)
