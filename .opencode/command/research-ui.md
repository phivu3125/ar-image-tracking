---
description: Research UI/UX patterns, design systems, and component implementations
argument-hint: "<topic-or-path> [bead-id] [--audit] [--compare]"
agent: vision
model: proxypal/gemini-3-flash-preview
subtask: true
---

# Research UI: $ARGUMENTS

Comprehensive UI/UX research across codebase patterns, design systems, and external best practices.

## Load Research Skill

```typescript
skill({ name: "ui-ux-research" });
```

## Phase 1: Parse Research Target

### Input Types

```typescript
const input = "$ARGUMENTS";

const parseTarget = (input: string) => {
  // File/directory path
  if (input.includes("/") || input.startsWith("src")) {
    return { type: "codebase", path: input };
  }

  // Bead reference
  if (input.startsWith("bd-")) {
    return { type: "bead", id: input };
  }

  // Topic keywords
  const topics = [
    "design-system",
    "components",
    "typography",
    "colors",
    "spacing",
    "animations",
    "accessibility",
    "responsive",
    "dark-mode",
    "forms",
    "tables",
    "navigation",
    "modals",
  ];

  if (topics.some((t) => input.includes(t))) {
    return { type: "topic", name: input };
  }

  // Default: treat as general topic
  return { type: "topic", name: input };
};
```

## Phase 2: Codebase UI Analysis

### If Path Provided

```typescript
// Find all UI-related files in path
glob({ pattern: `${path}/**/*.{tsx,jsx,css,scss,vue,svelte}` });

// Analyze component structure
lsp_lsp_document_symbols({ filePath: mainComponentFile });

// Search for styling patterns
ast_grep({ pattern: "className={$$$}", path });
ast_grep({ pattern: "style={{$$$}}", path });
```

### Component Inventory

```
COMPONENT INVENTORY: [path]
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Components Found: [count]

Component          │ Props │ Variants │ Tests │ Docs
───────────────────┼───────┼──────────┼───────┼──────
Button             │ 8     │ 4        │ ✓     │ ✓
Card               │ 5     │ 2        │ ✓     │ ✗
Modal              │ 12    │ 3        │ ✗     │ ✗
Input              │ 15    │ 5        │ ✓     │ ✓

Patterns Detected:
- Styling: [Tailwind/CSS Modules/Styled Components/etc.]
- Variants: [CVA/clsx/manual classes]
- Icons: [Lucide/Heroicons/custom]
- Animations: [Framer Motion/CSS/none]
```

### Design Token Analysis

```typescript
// Find design tokens
grep({ pattern: "colors\\.|spacing\\.|fontSize", include: "*.{ts,js,css}" });

// Check for Tailwind config
read({ filePath: "tailwind.config.js" });
read({ filePath: "tailwind.config.ts" });

// Check for CSS variables
grep({ pattern: "--[a-z]+-", include: "*.css" });
```

```
DESIGN TOKENS
━━━━━━━━━━━━━

Source: [tailwind.config.ts / CSS variables / theme.ts]

Colors:
├── Primary:    #3B82F6 (blue-500)
├── Secondary:  #6B7280 (gray-500)
├── Accent:     #10B981 (emerald-500)
├── Error:      #EF4444 (red-500)
└── Background: #FFFFFF / #0F172A (dark)

Spacing Scale:
├── xs: 4px   (0.25rem)
├── sm: 8px   (0.5rem)
├── md: 16px  (1rem)
├── lg: 24px  (1.5rem)
└── xl: 32px  (2rem)

Typography:
├── Font: Inter, system-ui
├── Sizes: 12px - 48px (7 steps)
└── Weights: 400, 500, 600, 700

Breakpoints:
├── sm: 640px
├── md: 768px
├── lg: 1024px
└── xl: 1280px
```

## Phase 3: Topic-Based Research

### Design System Topics

| Topic           | Research Focus                                           |
| --------------- | -------------------------------------------------------- |
| `design-system` | Overall architecture, token structure, component library |
| `components`    | Component inventory, prop patterns, composition          |
| `typography`    | Font stacks, scale, line heights, responsive sizing      |
| `colors`        | Palette, semantic colors, dark mode support              |
| `spacing`       | Scale consistency, component spacing patterns            |
| `animations`    | Motion patterns, timing, accessibility concerns          |
| `accessibility` | ARIA usage, keyboard nav, color contrast                 |
| `responsive`    | Breakpoints, mobile-first patterns, fluid sizing         |
| `dark-mode`     | Color inversion, theme switching, persistence            |
| `forms`         | Input patterns, validation, error states                 |
| `tables`        | Data display, sorting, pagination, responsive            |
| `navigation`    | Menu patterns, routing, breadcrumbs, mobile nav          |
| `modals`        | Dialog patterns, focus trap, animations, stacking        |

### Research Approach by Topic

```typescript
const researchApproach = {
  "design-system": async () => {
    // Find theme/config files
    glob({ pattern: "**/theme.{ts,js}" });
    glob({ pattern: "**/design-tokens.{ts,js}" });
    glob({ pattern: "**/tailwind.config.*" });

    // Analyze token usage
    grep({ pattern: "theme\\.", include: "*.tsx" });
  },

  accessibility: async () => {
    // Find ARIA usage
    grep({ pattern: "aria-", include: "*.tsx" });
    grep({ pattern: "role=", include: "*.tsx" });

    // Check for focus management
    grep({ pattern: "tabIndex|focus\\(\\)", include: "*.tsx" });

    // Run accessibility skill
    skill({ name: "accessibility-audit" });
  },

  "dark-mode": async () => {
    // Find dark mode patterns
    grep({ pattern: "dark:|dark-mode|isDark", include: "*.{tsx,css}" });

    // Check for theme context
    grep({ pattern: "ThemeProvider|useTheme", include: "*.tsx" });
  },
};
```

## Phase 4: External Research

### Best Practices Lookup

```typescript
// Design system documentation
context7_resolve_library_id({
  libraryName: "shadcn/ui",
  query: "[specific UI pattern]",
});

// Real-world implementations
gh_grep_searchGitHub({
  query: "[pattern to find]",
  language: ["TypeScript", "TSX"],
  path: "components/",
});
```

### Research Sources

```
EXTERNAL SOURCES
━━━━━━━━━━━━━━━━

1. Component Libraries
   - shadcn/ui (Radix-based, Tailwind)
   - Chakra UI (accessible, themeable)
   - Material UI (design system)
   - Ant Design (enterprise)

2. Design Systems
   - Tailwind CSS (utility-first)
   - Open Props (CSS custom properties)
   - Radix Primitives (unstyled, accessible)

3. Pattern Libraries
   - Patterns.dev (React patterns)
   - Component Gallery (real implementations)
   - Storybook showcase
```

## Phase 5: Comparison Mode (--compare)

Compare two UI implementations:

```bash
/research-ui src/components/Button --compare packages/ui/Button
```

```
COMPARISON: Button Components
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                    │ src/components │ packages/ui
────────────────────┼────────────────┼─────────────
Props               │ 8              │ 12
Variants            │ 4              │ 6
Accessibility       │ Partial        │ Full
Dark Mode           │ ✗              │ ✓
Animation           │ CSS            │ Framer Motion
Bundle Size         │ 2.1kb          │ 3.4kb
Test Coverage       │ 45%            │ 92%

Key Differences:
1. packages/ui has better a11y (full ARIA support)
2. packages/ui supports more variants
3. src/components is lighter but less complete

Recommendation:
Consider migrating to packages/ui for consistency,
or backport a11y patterns to src/components.
```

## Phase 6: Audit Mode (--audit)

Comprehensive UI audit:

```bash
/research-ui --audit
```

```
UI AUDIT REPORT
━━━━━━━━━━━━━━━

CONSISTENCY SCORE: 72/100

Issues Found:

🔴 CRITICAL (3)
├── Hardcoded colors in 12 files (bypassing theme)
├── Missing dark mode support in Modal component
└── No focus indicators on custom buttons

🟡 WARNING (7)
├── Inconsistent spacing: mix of px and rem
├── Typography: 3 different font stacks detected
├── Z-index: no consistent scale (values: 1-9999)
├── Animation timing varies (0.2s to 0.5s)
├── Border radius: 4 values used (2px, 4px, 8px, 12px)
├── Icon sizes not standardized
└── Form inputs have different heights

🟢 GOOD PRACTICES (5)
├── Consistent primary color usage
├── Semantic color naming
├── Responsive breakpoints aligned
├── Component folder structure
└── Prop naming conventions

RECOMMENDATIONS:
1. Create border-radius scale: sm, md, lg
2. Standardize animation timing: fast(150ms), normal(250ms), slow(400ms)
3. Add dark mode to remaining 8 components
4. Create z-index scale in theme config
```

## Phase 7: Generate Research Report

### Report Structure

```markdown
# UI Research: $ARGUMENTS

## Executive Summary

[1-2 sentence overview]

## Current State

### Component Analysis

[What exists, patterns used]

### Design Token Status

[Token coverage, consistency]

### Gaps Identified

[Missing pieces, inconsistencies]

## Research Findings

### Codebase Patterns

[What was discovered in the code]

### External Best Practices

[What industry does]

### Recommendations

[Actionable suggestions]

## Implementation Guidance

### Quick Wins

- [Low effort, high impact changes]

### Medium Term

- [Larger improvements]

### Long Term

- [Architectural changes]

## Code Examples

### Pattern to Adopt

\`\`\`tsx
// Recommended pattern based on research
\`\`\`

### Anti-Pattern to Avoid

\`\`\`tsx
// Pattern found in codebase that should be refactored
\`\`\`

## Next Steps

1. [Immediate action]
2. [Follow-up task]
3. [Future consideration]
```

### Save Research

```typescript
if (beadId) {
  // Save to bead artifacts
  write({
    filePath: `.beads/artifacts/${beadId}/ui-research.md`,
    content: researchReport,
  });
} else {
  // Save to memory
  write({
    filePath: `.opencode/memory/design/research/${topic}-${timestamp}.md`,
    content: researchReport,
  });
}
```

## Examples

```bash
/research-ui src/components          # Analyze component directory
/research-ui typography              # Research typography patterns
/research-ui dark-mode bd-theme01    # Research for specific bead
/research-ui --audit                 # Full UI consistency audit
/research-ui Button --compare        # Compare implementations
/research-ui forms accessibility     # Focused topic research
```

## Integration

After research, common next steps:

```
NEXT STEPS
━━━━━━━━━━

Based on your research, consider:

/design-audit          # Formal audit with scoring
/accessibility-check   # A11y focused review
/implement bd-xxx      # Implement findings
/plan bd-xxx           # Create implementation plan

Or create new tasks:
/create "Fix typography inconsistencies"
/create "Add dark mode to Modal component"
```

## Output Formats

### Concise (default)

Key findings + recommendations in ~50 lines

### Detailed (--verbose)

Full analysis with all code examples

### JSON (--json)

Structured output for tooling:

```json
{
  "topic": "design-system",
  "components": [],
  "tokens": {},
  "issues": [],
  "recommendations": []
}
```
