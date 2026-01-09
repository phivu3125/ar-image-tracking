---
description: Fix UI issues with visual verification
argument-hint: "<issue or bead-id> [--a11y]"
agent: build
---

# Fix UI: $ARGUMENTS

Fix visual issues. Capture before/after, verify responsiveness.

## Load Context

!`bd show $ARGUMENTS`
!`cat .beads/artifacts/$ARGUMENTS/spec.md 2>/dev/null`

## Capture Before State

Take screenshot before changes. Save to `.beads/artifacts/$ARGUMENTS/before.png`.

```typescript
skill({ name: "playwright" });
skill_mcp({
  skill_name: "playwright",
  tool_name: "browser_screenshot",
  arguments: '{"name": "before-fix"}',
});
```

## Analyze

Delegate to @vision:

```typescript
task({
  subagent_type: "vision",
  description: "Analyze UI issue",
  prompt:
    "Analyze UI issue: $ARGUMENTS\n\nIdentify:\n- The visual problem\n- Affected components\n- Suggested fix approach",
});
```

## Check Design System

!`grep -r "var(--" src/styles/ | head -10`
!`grep -r "theme\." src/components/ | head -10`

Use existing tokens, not hardcoded values:

- ✅ Existing color tokens
- ✅ Existing spacing scale
- ✅ Existing typography scale
- ❌ Hardcoded colors/px values

## Avoid AI Slop

| Avoid                      | Use Instead             |
| -------------------------- | ----------------------- |
| Inter/system-ui everywhere | Distinctive fonts       |
| Purple/blue gradients      | Project color palette   |
| Flat backgrounds           | Subtle depth/texture    |
| Generic rounded corners    | Consistent radius scale |

## Implement Fix

1. Identify affected files
2. Make minimal CSS/component changes
3. Use design tokens
4. Test in browser

## Capture After State

Save to `.beads/artifacts/$ARGUMENTS/after.png`.

## Verify

**Visual:** Compare before/after screenshots

**Responsive:** Test at 375px, 768px, 1280px

**A11y (if --a11y):**

- Color contrast (4.5:1 for text)
- Keyboard navigation
- Focus states visible

**Tests:**

```bash
npm test -- --grep "component-name"
```

## Commit

```bash
git add <files>
git commit -m "fix(ui): [description]"

bd sync
```

## Output

```
UI Fixed: $ARGUMENTS

Before: .beads/artifacts/$ARGUMENTS/before.png
After: .beads/artifacts/$ARGUMENTS/after.png

Verification:
- Visual: ✓
- Responsive: ✓
- A11y: [✓/⚠️]
- Tests: ✓

Design tokens: Used ✓
AI slop: None ✓
```
