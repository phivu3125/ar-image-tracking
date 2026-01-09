---
description: WCAG accessibility audit
argument-hint: "<image-or-component-path> [level: A|AA|AAA]"
agent: vision
model: proxypal/gemini-3-flash-preview
subtask: true
---

# Accessibility Check: $ARGUMENTS

## Phase 1: Load Context

**Load skills:**

````typescript
skill({ name: "beads" });            // Session protocol
skill({ name: "accessibility-audit" });

```typescript
skill({ name: "accessibility-audit" });
````

**Check for bead context:**

!`bd show $ARGUMENTS` # If bead ID provided

Parse path and WCAG level from `$ARGUMENTS` (default: AA).

## Phase 2: Estimate Complexity

| Signals                        | Estimate | Approach        |
| ------------------------------ | -------- | --------------- |
| Single component, few elements | S (~10)  | Quick audit     |
| Page with multiple components  | M (~30)  | Full audit      |
| Complex app, multiple pages    | L (~100) | Comprehensive   |
| Design system audit            | XL       | Systematic scan |

## Phase 3: Determine Input Type

- **Image/screenshot**: Visual accessibility analysis (Phase 4)
- **Component path**: Code accessibility patterns (Phase 5)
- **URL**: Run automated + visual analysis (Phase 4 + 5)

## Phase 4: Visual Analysis

### Color & Contrast

| Check                    | WCAG Ref    | Requirement                  |
| ------------------------ | ----------- | ---------------------------- |
| Text contrast            | 1.4.3 (AA)  | 4.5:1 normal, 3:1 large text |
| UI component contrast    | 1.4.11 (AA) | 3:1 against adjacent colors  |
| Focus indicator contrast | 1.4.11 (AA) | 3:1 contrast                 |
| Color-only information   | 1.4.1 (A)   | Don't rely on color alone    |

### Touch & Interaction

| Check             | WCAG Ref    | Requirement                |
| ----------------- | ----------- | -------------------------- |
| Touch target size | 2.5.5 (AAA) | ≥44x44px (≥24x24 for AA)   |
| Target spacing    | 2.5.8 (AA)  | Adequate spacing between   |
| Pointer gestures  | 2.5.1 (A)   | Single pointer alternative |

### Visual Structure

| Check             | WCAG Ref    | Requirement                   |
| ----------------- | ----------- | ----------------------------- |
| Heading hierarchy | 1.3.1 (A)   | Logical heading order         |
| Reading order     | 1.3.2 (A)   | Meaningful sequence           |
| Text spacing      | 1.4.12 (AA) | Adjustable without loss       |
| Reflow            | 1.4.10 (AA) | No horizontal scroll at 320px |

### Motion & Animation

| Check                   | WCAG Ref    | Requirement                     |
| ----------------------- | ----------- | ------------------------------- |
| Motion from interaction | 2.3.3 (AAA) | Can be disabled                 |
| Reduced motion          | 2.3.3       | Respects prefers-reduced-motion |
| Auto-playing media      | 1.4.2 (A)   | Pause/stop/hide controls        |
| Flashing content        | 2.3.1 (A)   | No more than 3 flashes/second   |

## Phase 5: Code Analysis

### Automated Testing

Run axe-core or Lighthouse:

```bash
# Using Lighthouse
npx lighthouse <url> --only-categories=accessibility --output=json

# Using axe-core in tests
npm install -D @axe-core/playwright  # or jest-axe
```

```typescript
// Playwright + axe example
import { injectAxe, checkA11y } from "@axe-core/playwright";

await injectAxe(page);
await checkA11y(page);
```

### Semantic HTML Checks

```typescript
// Find images without alt text
ast - grep({ pattern: "<img $$$>" }); // Check for alt attribute

// Find click handlers on non-interactive elements
ast - grep({ pattern: "<div onClick={$$$}>" });
ast - grep({ pattern: "<span onClick={$$$}>" });

// Find form inputs without labels
ast - grep({ pattern: "<input $$$>" }); // Check for id + matching label
```

### ARIA Pattern Checks

!`grep -r "role=" --include="*.tsx" --include="*.jsx" | head -20`

| Pattern         | Required ARIA                              |
| --------------- | ------------------------------------------ |
| Modal dialog    | role="dialog", aria-modal, aria-labelledby |
| Dropdown menu   | role="menu", aria-expanded, aria-haspopup  |
| Tab panel       | role="tablist/tab/tabpanel", aria-selected |
| Accordion       | aria-expanded, aria-controls               |
| Alert           | role="alert", aria-live="assertive"        |
| Toast           | role="status", aria-live="polite"          |
| Loading spinner | aria-busy, aria-live                       |

### Focus Management

| Check               | Requirement                         |
| ------------------- | ----------------------------------- |
| Focus visible       | All interactive elements show focus |
| Focus order         | Logical tab sequence                |
| Focus trap (modals) | Focus contained within modal        |
| Focus restoration   | Focus returns after modal closes    |
| Skip links          | Skip to main content available      |

!`grep -r ":focus" --include="*.css" | head -10`
!`grep -r "focus:" --include="*.tsx" | head -10` // Tailwind

## Phase 6: Keyboard Navigation Testing

Test manually or with Playwright:

```typescript
skill({ name: "playwright" });
skill_mcp({
  skill_name: "playwright",
  tool_name: "browser_press_key",
  arguments: '{"key": "Tab"}',
});
```

| Action     | Expected Behavior                        |
| ---------- | ---------------------------------------- |
| Tab        | Moves to next interactive element        |
| Shift+Tab  | Moves to previous element                |
| Enter      | Activates buttons, links                 |
| Space      | Toggles checkboxes, activates buttons    |
| Arrow keys | Navigate within components (tabs, menus) |
| Escape     | Closes modals, dropdowns                 |

```
Keyboard Navigation:
━━━━━━━━━━━━━━━━━━━━

- Tab order: [logical/broken at X]
- Focus visible: [all/missing on X]
- Enter/Space: [working/broken on X]
- Escape: [working/not implemented]
- Skip link: [present/missing]
```

## Phase 7: Screen Reader Guidance

For manual testing, suggest:

| Platform | Screen Reader | Command to Start         |
| -------- | ------------- | ------------------------ |
| macOS    | VoiceOver     | Cmd + F5                 |
| Windows  | NVDA          | Ctrl + Alt + N           |
| Windows  | Narrator      | Win + Ctrl + Enter       |
| iOS      | VoiceOver     | Settings > Accessibility |
| Android  | TalkBack      | Settings > Accessibility |

**Key things to verify:**

- [ ] All content is announced
- [ ] Images have meaningful alt text
- [ ] Form fields announce labels
- [ ] Error messages are announced
- [ ] Dynamic content updates are announced (aria-live)

## Phase 8: Generate Report

````markdown
## Accessibility Audit: [Component/Page]

**WCAG Level:** [A/AA/AAA]
**Automated Score:** [Lighthouse score if available]

### Summary

| Category       | Critical | Major | Minor | Passed |
| -------------- | -------- | ----- | ----- | ------ |
| Perceivable    | [N]      | [N]   | [N]   | [N]    |
| Operable       | [N]      | [N]   | [N]   | [N]    |
| Understandable | [N]      | [N]   | [N]   | [N]    |
| Robust         | [N]      | [N]   | [N]   | [N]    |

### Critical Issues (Must Fix)

#### [Issue Title]

- **WCAG:** [criterion number and name]
- **Location:** [file:line or element description]
- **Problem:** [description]
- **Fix:**

```[language]
[code fix]
```
````

### Major Issues

[Same format]

### Minor Issues

[Same format]

### Passed Checks

- Color contrast: [ratio] meets [level]
- Touch targets: [size] meets requirement
- Heading structure: Logical hierarchy
- Keyboard navigation: All elements reachable
- Focus indicators: Visible on all elements

````

## Phase 9: Create Observation

If patterns discovered:

```typescript
observation({
  type: "pattern",
  title: "A11y pattern: [name]",
  content: `
## Pattern
[Description of accessibility pattern]

## Implementation
\`\`\`tsx
[Accessible code example]
\`\`\`

## Common Mistakes
- [What to avoid]
  `,
  concepts: "accessibility, wcag, [specific area]",
  bead_id: "<bead-id>",
});
````

## Phase 10: Verify Fixes

After fixes applied, re-run checks:

```bash
npx lighthouse <url> --only-categories=accessibility
```

```
Verification:
━━━━━━━━━━━━━

Before: [N] issues
After: [N] issues
Resolved: [N]

Remaining:
- [Any outstanding issues]
```

## Phase 11: Sync

```bash
bd sync
```

## Output

```
Accessibility Audit Complete: $ARGUMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WCAG Level: [AA]
Estimate: [S/M/L]

Results:
- Critical: [N]
- Major: [N]
- Minor: [N]
- Passed: [N]

Automated Score: [N]/100 (Lighthouse)

Key Fixes Needed:
1. [Most critical issue]
2. [Second issue]
3. [Third issue]

Report: .beads/artifacts/<bead-id>/a11y-audit.md (if bead)
```

**Next steps:**

```
Fix issues:
  /fix-ui <bead-id>   # Fix visual issues
  /fix <bead-id>      # Fix code issues

After fixing:
  /accessibility-check <path>   # Re-run audit
```
