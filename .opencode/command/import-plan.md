---
description: Import external plan into Beads - create epics and issues with dependencies
argument-hint: "<plan-file.md> [--prefix=<epic-prefix>] [--dry-run] [--force]"
agent: build
---

# Import Plan

**Load skills:**

```typescript
skill({ name: "beads" }); // For hierarchy and dependencies
skill({ name: "executing-plans" }); // For plan execution
```

Import a markdown plan into Beads epics and issues. Follows Steve Yegge's "plan outside, import inside" pattern.

## Parse Arguments

| Argument    | Default  | Description                        |
| ----------- | -------- | ---------------------------------- |
| Plan file   | required | Path to markdown plan              |
| `--prefix`  | none     | Prefix for epic titles             |
| `--dry-run` | false    | Preview without creating beads     |
| `--force`   | false    | Import even if duplicates detected |

---

## Phase 1: Load Plan

Read the plan file:

```typescript
read({ filePath: "$ARGUMENTS" });
```

If file not found: "Plan file not found. Provide path to markdown plan."

---

## Phase 2: Duplicate Detection

Before importing, check for existing beads with similar titles:

!`bd list --status all --limit 50`

Compare plan titles against existing beads:

```
Duplicate Check:
━━━━━━━━━━━━━━━━

⚠ Potential duplicates found:
- "User Authentication" similar to existing bd-abc123: "Auth System"
- "Create login form" similar to existing bd-def456: "Login Form Component"

Options:
1. Skip duplicates (import only new items)
2. Force import (create duplicates)
3. Cancel import

Select option (1/2/3):
```

If `--force` flag set, skip this check and import everything.

---

## Phase 3: Analyze Structure

Parse the plan for:

- **Epics**: Top-level sections (## headers)
- **Issues**: Sub-sections or task lists (### headers, - [ ] items)
- **Dependencies**: References between sections, "after X", "requires Y"
- **Estimates**: Size markers (S, M, L, XL, or time estimates)
- **Tags**: Hashtags or category markers (#frontend, #backend, etc.)

Report:

```
Plan Analysis: [filename]
━━━━━━━━━━━━━━━━━━━━━━━━

Epics found: [count]
Issues found: [count]
Dependencies: [count]
Estimated effort: [total hours/points]

Structure:
├── [Epic 1 title] ([issue count] issues, [estimate])
│   ├── [Issue 1] [S] #frontend
│   └── [Issue 2] [M] #backend → depends on Issue 1
├── [Epic 2 title] ([issue count] issues, [estimate])
│   └── [Issue 1] [L] → depends on [Epic 1/Issue 2]
└── ...

Proceed with import? (yes/modify/cancel)
```

**STOP and wait for approval** (unless `--dry-run`, then just show preview).

---

## Phase 4: Create Epics

For each epic (top-level section):

```bash
bd create "[prefix][Epic title]" -t epic -p 2
```

Store epic IDs for dependency linking.

**Progress feedback:**

```
Creating epics... [1/3] ████░░░░░░ User Authentication
Creating epics... [2/3] ██████░░░░ Dashboard
Creating epics... [3/3] ██████████ Settings ✓
```

---

## Phase 5: Create Issues

For each issue under an epic:

```bash
bd create "[Issue title]" -t <inferred-type> -p <inferred-priority>
# Then: bd dep add <issue-id> <epic-id>
```

### Type Inference

| Content Pattern                   | Type    |
| --------------------------------- | ------- |
| "fix", "bug", "error", "broken"   | bug     |
| "test", "spec", "coverage"        | task    |
| "refactor", "cleanup", "optimize" | task    |
| "docs", "document", "readme"      | docs    |
| Default                           | feature |

### Priority Inference

| Marker                                | Priority |
| ------------------------------------- | -------- |
| "critical", "urgent", "blocker", "P0" | 0        |
| "important", "high", "P1"             | 1        |
| Default                               | 2        |
| "low", "nice to have", "P3"           | 3        |
| "backlog", "someday", "P4"            | 4        |

### Estimation Inference

| Marker              | Meaning        | Suggested Hours |
| ------------------- | -------------- | --------------- |
| XS, "trivial"       | Extra small    | 1-2 hours       |
| S, "small"          | Small          | 2-4 hours       |
| M, "medium"         | Medium         | 4-8 hours       |
| L, "large"          | Large          | 1-2 days        |
| XL, "extra large"   | Extra large    | 3-5 days        |
| "[N]h", "[N] hours" | Explicit hours | N hours         |
| "[N]d", "[N] days"  | Explicit days  | N \* 8 hours    |

### Tag Inference

Detect from content and extract:

- `#frontend`, `#backend`, `#devops`, `#design`
- `@assignee` patterns
- `[component-name]` references

---

## Phase 6: Link Dependencies

For issues with dependencies, use the `deps` parameter:

```bash
bd create "[title]" -t task -p 2
bd dep add <issue-id> <blocking-issue-id>
```

### Dependency Patterns

| Pattern                     | Interpretation         |
| --------------------------- | ---------------------- |
| "after [X]"                 | X blocks this          |
| "requires [Y]"              | Y blocks this          |
| "depends on [Z]"            | Z blocks this          |
| "before [W]"                | This blocks W          |
| "blocked by [V]"            | V blocks this          |
| Numbered steps (1, 2, 3...) | Sequential blocking    |
| Indented sub-items          | Parent blocks children |

---

## Phase 7: Rollback on Failure

If any creation fails, offer rollback:

```
❌ Error creating issue "Setup database"
   Reason: [error message]

Created so far:
- bd-abc123: Epic: User Auth
- bd-def456: Issue: Login form

Options:
1. Rollback (delete created beads)
2. Continue (skip failed, proceed with rest)
3. Abort (keep created, stop here)

Select option (1/2/3):
```

Rollback implementation:

```bash
# Delete in reverse order
bd update bd-def456 --status cancelled
bd update bd-abc123 --status cancelled
```

---

## Phase 8: Review Pass

After import, review for quality:

```
Import complete. Running review pass...
```

For each epic, verify:

- Title is clear and actionable
- Description captures intent
- Issues are properly scoped
- Dependencies make sense
- Estimates are reasonable

Suggest improvements:

```
Review Suggestions:
━━━━━━━━━━━━━━━━━━

- bd-abc123: Title vague → "Implement Auth" → "Implement JWT Authentication"
- bd-def456: Missing estimate → Suggest: M (4-8 hours)
- bd-ghi789: Circular dependency detected with bd-jkl012

Apply suggestions? (yes/no/select)
```

---

## Phase 9: Polish (Optional)

If user approves suggestions, update the beads:

```bash
bd update bd-abc123 --title "Implement JWT Authentication"
```

Iterate up to 5 times if user requests more refinement.

---

## Output

```
Plan Imported: [filename]
━━━━━━━━━━━━━━━━━━━━━━━

Summary:
├── Epics: [count]
├── Issues: [count]
├── Dependencies: [count]
├── Estimated effort: [total]
└── Duplicates skipped: [count]

Created:
├── bd-epic-001: User Authentication
│   ├── bd-task-001: Create login form [S] #frontend
│   └── bd-task-002: Implement JWT tokens [M] #backend → blocked by bd-task-001
├── bd-epic-002: Dashboard
│   └── bd-task-003: Dashboard layout [M] #frontend
└── ...

Next Steps:
├── View ready tasks: bd list --status ready
├── Start first task: /implement bd-task-001
└── View dependencies: bd dep tree <id>
```

---

## Dry Run Mode

With `--dry-run`, show what WOULD be created without creating anything:

```bash
/import-plan docs/feature-plan.md --dry-run
```

Output:

```
DRY RUN - No beads will be created
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Would create:
├── [EPIC] User Authentication (pri: 2)
│   ├── [feature] Create login form (pri: 2, est: S) #frontend
│   └── [feature] Implement JWT tokens (pri: 2, est: M) #backend
│       └── depends on: Create login form
├── [EPIC] Dashboard (pri: 2)
│   └── [feature] Dashboard layout (pri: 2, est: M) #frontend
└── ...

Total: 2 epics, 3 issues, 1 dependency

Run without --dry-run to create beads.
```

---

## Example Plan Format

The command accepts plans in this format:

```markdown
# Project: [Name]

## Epic: User Authentication

Implement secure user authentication system.

### Issue: Create login form [S] #frontend

- Build login form component
- Add validation
- Connect to auth API

### Issue: Implement JWT tokens [M] #backend

After: Create login form
Priority: high

- Generate tokens on login
- Validate tokens on requests
- Handle token refresh

## Epic: Dashboard

### Issue: Dashboard layout [M] #frontend

- Create responsive grid
- Add navigation sidebar
```

---

## Supported Plan Formats

| Format              | Detection       | Notes                   |
| ------------------- | --------------- | ----------------------- |
| Markdown (## / ###) | `.md` extension | Primary format          |
| Task lists (- [ ])  | Checkbox syntax | Converted to issues     |
| Numbered lists      | 1. 2. 3.        | Sequential dependencies |

---

## Related Commands

| Need                     | Command                |
| ------------------------ | ---------------------- |
| Create plan from scratch | `/plan`                |
| Execute imported plan    | `/implement <bead-id>` |
| View plan status         | `/status`              |
| Create single bead       | `bd create`            |
