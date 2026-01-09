---
description: Review UI/UX design for quality, aesthetics, and best practices
argument-hint: "<image-or-component-path> [--bead=<id>] [--responsive] [--dark-mode]"
agent: vision
model: proxypal/gemini-3-pro-preview
subtask: true
---

# UI Review: $ARGUMENTS

Comprehensive UI/UX review with structured scoring and actionable feedback.

## Load Skills

```typescript
skill({ name: "beads" }); // Session protocol
```

```typescript
skill({ name: "frontend-aesthetics" });
skill({ name: "visual-analysis" });
skill({ name: "accessibility-audit" });
```

## Parse Arguments

| Argument       | Default  | Description                          |
| -------------- | -------- | ------------------------------------ |
| Path           | required | Image, screenshot, or component file |
| `--bead`       | none     | Link findings to bead                |
| `--responsive` | false    | Include responsive breakpoint review |
| `--dark-mode`  | false    | Include dark mode review             |
| `--compare`    | none     | Compare against design spec          |

---

## Review Categories

### 1. Typography (Weight: 15%)

| Check           | Pass                                    | Fail                                |
| --------------- | --------------------------------------- | ----------------------------------- |
| Font purpose    | Intentional choice for brand/context    | Generic Inter/Roboto without reason |
| Hierarchy       | Clear H1 > H2 > H3 > body scale         | Flat, unclear importance            |
| Readability     | Appropriate size, line-height, contrast | Too small, cramped, low contrast    |
| Weight contrast | Uses extremes (300 vs 700)              | Muddy middle weights (400 vs 500)   |
| Pairing         | Harmonious combination                  | Clashing or too similar             |

**Scoring:**

- 10: Distinctive, intentional, excellent hierarchy
- 7-9: Good choices, minor issues
- 4-6: Generic but functional
- 1-3: Poor readability or choices

### 2. Color (Weight: 15%)

| Check            | Pass                                  | Fail                         |
| ---------------- | ------------------------------------- | ---------------------------- |
| Palette cohesion | Unified, intentional palette          | Random or clashing colors    |
| Brand alignment  | Colors support brand identity         | Generic or off-brand         |
| Contrast         | WCAG AA minimum (4.5:1 text)          | Insufficient contrast        |
| Semantic usage   | Consistent meaning (red=error)        | Confusing color meaning      |
| No AI slop       | Avoids purple/blue gradients, #667eea | Generic AI-generated palette |

**Scoring:**

- 10: Distinctive, accessible, cohesive
- 7-9: Good palette, minor issues
- 4-6: Functional but generic
- 1-3: Accessibility failures or AI slop

### 3. Layout & Spacing (Weight: 20%)

| Check               | Pass                           | Fail                    |
| ------------------- | ------------------------------ | ----------------------- |
| Visual hierarchy    | Clear content priority         | Everything same weight  |
| Spacing consistency | Uses spacing scale (4/8/16/24) | Random pixel values     |
| Alignment           | Elements properly aligned      | Misaligned or sloppy    |
| White space         | Breathing room, not cramped    | Too dense or too sparse |
| Grid system         | Consistent column structure    | Arbitrary positioning   |

**Scoring:**

- 10: Professional, balanced, rhythmic
- 7-9: Good structure, minor inconsistencies
- 4-6: Functional but lacks polish
- 1-3: Chaotic or broken layout

### 4. Interactive States (Weight: 15%)

| State          | Required      | Check                              |
| -------------- | ------------- | ---------------------------------- |
| Default        | Yes           | Clear, inviting appearance         |
| Hover          | Yes           | Visible change, not jarring        |
| Focus          | Yes           | Clear ring/outline for keyboard    |
| Active/Pressed | Recommended   | Feedback on click                  |
| Disabled       | If applicable | Obviously inactive, not just faded |
| Loading        | If applicable | Clear loading indication           |

**Scoring:**

- 10: All states polished, consistent
- 7-9: Most states covered, minor gaps
- 4-6: Basic states only
- 1-3: Missing critical states (focus)

### 5. Accessibility (Weight: 20%)

| Check          | Pass                               | Fail                      |
| -------------- | ---------------------------------- | ------------------------- |
| Color contrast | 4.5:1 text, 3:1 UI                 | Below WCAG AA             |
| Focus visible  | Clear focus indicator              | Hidden or invisible focus |
| Touch targets  | 44x44px minimum                    | Too small to tap          |
| Alt text       | Images have descriptions           | Missing alt attributes    |
| Keyboard nav   | All interactive elements reachable | Keyboard traps or gaps    |
| Screen reader  | Logical reading order              | Confusing or broken       |

**Scoring:**

- 10: WCAG AAA compliant
- 7-9: WCAG AA compliant, minor issues
- 4-6: Some accessibility, gaps remain
- 1-3: Significant barriers

### 6. Visual Polish (Weight: 15%)

| Check               | Pass                     | Fail                       |
| ------------------- | ------------------------ | -------------------------- |
| Consistency         | Same patterns throughout | Inconsistent styling       |
| Attention to detail | Pixel-perfect alignment  | Sloppy edges, misalignment |
| Motion/animation    | Purposeful, smooth       | Jarring or excessive       |
| Depth/shadow        | Consistent shadow system | Random or heavy shadows    |
| Icons               | Consistent style, size   | Mixed icon sets            |

**Scoring:**

- 10: Exceptional craft and attention
- 7-9: Professional, polished
- 4-6: Acceptable, room for improvement
- 1-3: Unpolished, inconsistent

---

## Anti-Patterns to Flag

| Anti-Pattern                      | Severity | Why It's Bad             |
| --------------------------------- | -------- | ------------------------ |
| Purple/blue gradient backgrounds  | Warning  | AI slop signature        |
| 3-column feature cards with icons | Warning  | Overused, generic        |
| Excessive rounded corners (16px+) | Info     | Trendy but often misused |
| Glassmorphism without purpose     | Warning  | Style over function      |
| Generic stock illustrations       | Warning  | Lacks personality        |
| Drop shadows on everything        | Info     | Visual noise             |
| Flat white (#FFFFFF) backgrounds  | Info     | Harsh, sterile           |

---

## Responsive Review (--responsive)

Check at each breakpoint:

| Breakpoint | Width   | Check                                |
| ---------- | ------- | ------------------------------------ |
| Mobile     | 375px   | Touch targets, stacking, readability |
| Tablet     | 768px   | Layout adaptation, spacing           |
| Desktop    | 1280px  | Full layout, hover states            |
| Wide       | 1536px+ | Content doesn't stretch awkwardly    |

**Common responsive issues:**

- Text too small on mobile
- Horizontal scroll
- Touch targets too close
- Images not responsive
- Hidden content on mobile

---

## Dark Mode Review (--dark-mode)

| Check                | Pass                     | Fail                     |
| -------------------- | ------------------------ | ------------------------ |
| Contrast maintained  | Text readable on dark bg | Washed out or too bright |
| Colors adapted       | Not just inverted        | Jarring or ugly colors   |
| Images appropriate   | Dark-compatible images   | Light images on dark bg  |
| Shadows adjusted     | Softer or removed        | Heavy shadows on dark    |
| Focus states visible | Clear on dark background | Invisible focus ring     |

---

## Output Format

### Review Scorecard

```
UI Review: [Component/Screen Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Category Scores:
├── Typography:      8/10  ████████░░
├── Color:           6/10  ██████░░░░  ⚠ Issues
├── Layout:          9/10  █████████░
├── Interactive:     7/10  ███████░░░
├── Accessibility:   5/10  █████░░░░░  ⚠ Critical
└── Visual Polish:   8/10  ████████░░

Overall Score: 7.2/10 (Good, needs work)

Grade: B
```

### Findings by Severity

```
Critical (Must Fix):
━━━━━━━━━━━━━━━━━━━

1. [A11Y] Focus states invisible on buttons
   Location: All primary buttons
   Impact: Keyboard users cannot navigate
   Fix: Add `focus-visible:ring-2 focus-visible:ring-primary`

2. [A11Y] Color contrast 2.8:1 on muted text
   Location: Footer links, captions
   Impact: WCAG AA failure
   Fix: Change from #9CA3AF to #6B7280

Warning (Should Fix):
━━━━━━━━━━━━━━━━━━━━

3. [COLOR] Purple-blue gradient detected
   Location: Hero background
   Impact: AI slop aesthetic
   Fix: Consider solid color or subtle texture

4. [LAYOUT] Inconsistent spacing
   Location: Card grid gaps
   Impact: Visual rhythm broken
   Fix: Standardize to 24px gap

Info (Nice to Have):
━━━━━━━━━━━━━━━━━━━

5. [TYPOGRAPHY] Could use more weight contrast
   Location: Section headings
   Suggestion: Try font-bold (700) instead of semibold (600)
```

### Code Fixes

```tsx
// Before: Invisible focus
<button className="bg-primary text-white">
  Submit
</button>

// After: Visible focus
<button className="bg-primary text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
  Submit
</button>
```

---

## Bead Integration

If `--bead=<id>` provided:

```bash
# Create issues for critical findings
bd create "[UI] Fix invisible focus states" -t bug -p 1

# Then link to parent bead
bd dep add <task-id> <bead-id>
```

---

## Examples

```bash
# Review a screenshot
/ui-review designs/homepage.png

# Review with responsive check
/ui-review src/components/Card.tsx --responsive

# Review and link to bead
/ui-review screenshots/dashboard.png --bead=bd-feature-123

# Full review with dark mode
/ui-review app/page.tsx --responsive --dark-mode

# Compare to design spec
/ui-review screenshots/current.png --compare designs/mockup.png
```

---

## Related Commands

| Need                | Command                |
| ------------------- | ---------------------- |
| Analyze mockup      | `/analyze-mockup`      |
| Fix UI issues       | `/fix-ui`              |
| Accessibility audit | `/accessibility-check` |
| Design from scratch | `/design`              |
| Audit design system | `/design-audit`        |
