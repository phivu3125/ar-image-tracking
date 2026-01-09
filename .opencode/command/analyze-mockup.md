---
description: Analyze UI mockup or screenshot with structured output
argument-hint: "<image-path> [focus: layout|colors|components|typography|a11y|all] [--quick|--deep] [--compare <file>]"
agent: vision
model: proxypal/gemini-3-flash-preview
subtask: true
---

# Analyze Mockup: $ARGUMENTS

## Load Beads Skill

```typescript
skill({ name: "beads" });
```

## Phase 1: Parse Arguments

Extract from `$ARGUMENTS`:

| Argument   | Default  | Options                                                       |
| ---------- | -------- | ------------------------------------------------------------- |
| Image path | required | File path or URL                                              |
| Focus      | `all`    | `layout`, `colors`, `components`, `typography`, `a11y`, `all` |
| Depth      | `--deep` | `--quick` (2-3 min), `--deep` (10-15 min)                     |
| Compare    | none     | `--compare <existing-file.tsx>` for diff analysis             |

Load the image and determine analysis scope.

## Phase 2: Structured Analysis

skill({ name: "visual-analysis" })

Run analysis based on focus area. Each section has specific output format.

---

### Colors Analysis

**Extract:**

```json
{
  "primary": {
    "hex": "#0066CC",
    "usage": "buttons, links",
    "percentage": "15%"
  },
  "secondary": {
    "hex": "#6B7280",
    "usage": "text, borders",
    "percentage": "25%"
  },
  "background": {
    "hex": "#FFFFFF",
    "usage": "page background",
    "percentage": "50%"
  },
  "accent": { "hex": "#10B981", "usage": "success states", "percentage": "5%" },
  "error": { "hex": "#EF4444", "usage": "error states", "percentage": "2%" },
  "neutral": ["#F3F4F6", "#E5E7EB", "#D1D5DB", "#9CA3AF"]
}
```

**Accessibility Check:**
| Combination | Contrast Ratio | WCAG AA | WCAG AAA |
|-------------|----------------|---------|----------|
| primary on background | 4.5:1 | Pass | Fail |
| text on background | 7.2:1 | Pass | Pass |

**CSS Output:**

```css
:root {
  --color-primary: #0066cc;
  --color-primary-hover: #0052a3;
  --color-secondary: #6b7280;
  --color-background: #ffffff;
  --color-surface: #f3f4f6;
  --color-accent: #10b981;
  --color-error: #ef4444;
}
```

**Tailwind Output:**

```js
// tailwind.config.js
colors: {
  primary: { DEFAULT: '#0066CC', hover: '#0052A3' },
  secondary: '#6B7280',
  accent: '#10B981',
  error: '#EF4444',
}
```

---

### Layout Analysis

**Grid System:**

- Type: [12-column grid | Flexbox | CSS Grid | Mixed]
- Container max-width: [e.g., 1280px]
- Gutters: [e.g., 24px]
- Margins: [e.g., 16px mobile, 32px desktop]

**Section Breakdown:**

```
┌─────────────────────────────────────┐
│ Header (h-16, sticky)               │
├─────────────────────────────────────┤
│ Hero (h-96, flex center)            │
├─────────────────────────────────────┤
│ Content (grid cols-3, gap-6)        │
│ ┌─────┐ ┌─────┐ ┌─────┐            │
│ │Card │ │Card │ │Card │            │
│ └─────┘ └─────┘ └─────┘            │
├─────────────────────────────────────┤
│ Footer (py-8)                       │
└─────────────────────────────────────┘
```

**Responsive Breakpoints:**
| Breakpoint | Layout Change |
|------------|---------------|
| < 640px (sm) | Stack to single column, hide sidebar |
| < 1024px (lg) | 2-column grid, collapsible nav |
| >= 1280px (xl) | Full 3-column layout |

**CSS Structure:**

```css
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}
@media (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

---

### Components Analysis

**Component Inventory:**

| Component | Library Match | Variants                    | Complexity | Priority |
| --------- | ------------- | --------------------------- | ---------- | -------- |
| Button    | shadcn/Button | primary, secondary, outline | S          | High     |
| Card      | shadcn/Card   | default, hover, selected    | M          | High     |
| Input     | shadcn/Input  | default, error, disabled    | S          | Medium   |
| Modal     | Radix Dialog  | -                           | M          | Low      |
| Dropdown  | shadcn/Select | -                           | M          | Medium   |

**Component Details (for each):**

```markdown
## Component: [Name]

**Library:** shadcn/ui, MUI, Radix, custom
**Variants:** primary | secondary | outline
**States:** default, hover, focus, active, disabled
**Props Interface:**

- variant: 'primary' | 'secondary' | 'outline'
- size: 'sm' | 'md' | 'lg'
- disabled?: boolean

**Accessibility:**

- Focus ring visible
- ARIA labels needed
- Keyboard: Enter/Space to activate
```

---

### Typography Analysis

**Font Stack:**

```css
--font-sans: "Inter", system-ui, -apple-system, sans-serif;
--font-mono: "JetBrains Mono", monospace;
```

**Type Scale:**
| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| h1 | 2.5rem (40px) | 700 | 1.2 | -0.02em |
| h2 | 2rem (32px) | 600 | 1.25 | -0.01em |
| h3 | 1.5rem (24px) | 600 | 1.3 | 0 |
| body | 1rem (16px) | 400 | 1.5 | 0 |
| small | 0.875rem (14px) | 400 | 1.4 | 0 |
| caption | 0.75rem (12px) | 500 | 1.3 | 0.02em |

**CSS Output:**

```css
:root {
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 2rem;
  --font-size-4xl: 2.5rem;

  --line-height-tight: 1.2;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}
```

---

### Accessibility Analysis (a11y)

**Color Contrast:**
| Element | Foreground | Background | Ratio | Status |
|---------|------------|------------|-------|--------|
| Body text | #1F2937 | #FFFFFF | 14.7:1 | AAA Pass |
| Link | #0066CC | #FFFFFF | 4.5:1 | AA Pass |
| Button text | #FFFFFF | #0066CC | 4.5:1 | AA Pass |
| Muted text | #9CA3AF | #FFFFFF | 2.9:1 | FAIL |

**Touch Targets:**

- Minimum size check: 44x44px for mobile
- [ ] Buttons meet minimum
- [ ] Links have adequate padding
- [ ] Icons have tap area

**Focus States:**

- [ ] Visible focus ring on interactive elements
- [ ] Focus order logical (left-right, top-bottom)
- [ ] Skip links present (if applicable)

**Issues Found:**
| Severity | Issue | Location | Fix |
|----------|-------|----------|-----|
| Critical | Low contrast muted text | Body paragraphs | Change to #6B7280 |
| Warning | Small touch target | Icon buttons | Add 8px padding |
| Info | No focus ring | Cards | Add focus-visible ring |

---

## Phase 3: Design Token Export

Consolidate all findings into ready-to-use code:

**Complete CSS Variables:**

```css
:root {
  /* Colors */
  --color-primary: #0066cc;
  --color-secondary: #6b7280;
  --color-background: #ffffff;
  --color-surface: #f3f4f6;
  --color-accent: #10b981;
  --color-error: #ef4444;

  /* Typography */
  --font-sans: "Inter", system-ui, sans-serif;
  --font-size-base: 1rem;
  --line-height-base: 1.5;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  /* Borders */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

**Tailwind Config Extension:**

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        /* extracted colors */
      },
      fontFamily: { sans: ["Inter", ...defaultTheme.fontFamily.sans] },
      spacing: {
        /* if custom */
      },
      borderRadius: {
        /* if custom */
      },
    },
  },
};
```

---

## Phase 4: Comparison Mode (if --compare)

When `--compare <existing-file>` is provided:

skill({ name: "mockup-to-code" })

**Diff Analysis:**
| Aspect | Mockup | Implementation | Delta |
|--------|--------|----------------|-------|
| Primary color | #0066CC | #0066CC | Match |
| Button radius | 8px | 4px | +4px needed |
| Card shadow | shadow-md | shadow-sm | Increase shadow |
| Heading size | 40px | 36px | +4px needed |

**Priority Fixes:**

1. [High] Button border-radius: change `rounded` to `rounded-lg`
2. [Medium] Card shadow: change `shadow-sm` to `shadow-md`
3. [Low] Heading font-size: increase from 2.25rem to 2.5rem

---

## Phase 5: Implementation Plan

**Component Build Order (dependency-aware):**

1. Design tokens (CSS variables) - no dependencies
2. Typography components (Text, Heading) - depends on tokens
3. Button - depends on tokens
4. Card - depends on tokens
5. Form inputs - depends on tokens, Button
6. Page layouts - depends on all above

**Create Implementation Tasks:**

```bash
bd create "Implement design tokens from mockup" -t task -p 1
bd create "Implement [ComponentName] component" -t task -p 2
```

**Suggested Follow-up Commands:**

- `/design src/styles/tokens.css` - Create token file from extracted values
- `/implement bd-<token-task>` - Implement the design tokens
- `/fix-ui src/components/Button.tsx --compare mockup.png` - Fix component to match

---

## Quick Mode (--quick)

When `--quick` is specified, output only:

1. **Summary** (2-3 sentences)
2. **Color palette** (hex values only, no CSS)
3. **Component list** (names and library matches)
4. **Top 3 accessibility issues**
5. **Suggested next command**

Skip: detailed breakdowns, CSS output, typography scale, comparison mode.

---

## Examples

```bash
# Full analysis of a mockup
/analyze-mockup designs/homepage.png

# Quick color extraction
/analyze-mockup designs/button.png colors --quick

# Deep layout analysis
/analyze-mockup designs/dashboard.png layout --deep

# Compare implementation to mockup
/analyze-mockup designs/card.png components --compare src/components/Card.tsx

# Accessibility audit
/analyze-mockup designs/form.png a11y
```

---

## Output Storage

Save analysis to `.opencode/memory/design/analysis/[mockup-name].md` for future reference.

## Related Commands

| Need                         | Command                   |
| ---------------------------- | ------------------------- |
| Implement the design         | `/design` or `/implement` |
| Audit existing design system | `/design-audit`           |
| Fix UI to match mockup       | `/fix-ui --compare`       |
| Check accessibility          | `/accessibility-check`    |
