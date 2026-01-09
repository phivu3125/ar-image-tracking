---
description: Import GitHub issue as tracked bead
argument-hint: "<issue-number>"
agent: build
---

# Issue: $ARGUMENTS

You're importing a GitHub issue into beads for tracking.

## Check For Duplicates

!`bd list --status=all | grep -i "[keywords from issue]"`

If similar bead exists, link to it instead of creating duplicate.

## Fetch The Issue

!`gh issue view $ARGUMENTS --json title,body,labels,state`

Extract:

- **Title** - issue title
- **Labels** - for type/priority mapping
- **Body** - problem description, reproduction steps

## Map Labels

| GitHub Label         | Bead Type | Priority |
| -------------------- | --------- | -------- |
| bug                  | bug       | 1        |
| feature, enhancement | feature   | 2        |
| critical, blocker    | -         | 0        |
| low, backlog         | -         | 4        |

## Create The Bead

```bash
bd create "[issue title]" -t [type] -p [priority]
```

## Create Spec

Write `.beads/artifacts/<bead-id>/spec.md`:

```markdown
# [Issue Title]

**Bead:** <bead-id>
**GitHub:** #$ARGUMENTS
**Created:** [date]

## Goal

[What we're fixing/building from issue body]

## Reproduction

[Steps from issue if bug]

## Success Criteria

- [ ] [From issue acceptance criteria]
  - Verify: `[command]`
- [ ] No regression
  - Verify: `npm test`

## Constraints

[From issue if any]
```

## Comment On GitHub

```bash
gh issue comment $ARGUMENTS --body "Tracking: \`<bead-id>\`

Estimate: [S/M/L]
Next: [/implement or /research]"
```

## Sync

```bash
bd sync
```

## Output

```
Imported: #$ARGUMENTS

Bead: <bead-id>
Type: [bug/feature/task]
Priority: [0-4]
Spec: .beads/artifacts/<bead-id>/spec.md

Next:
- S/M estimate: /implement <bead-id>
- L estimate: /research <bead-id>
- XL: Decompose first
```
