---
description: Audit design system from screenshots or codebase
argument-hint: "<screenshots-path|codebase|both> [output: tokens|report|both] [--quick|--deep]"
agent: vision
model: proxypal/gemini-3-pro-preview
subtask: true
---

# Design Audit: $ARGUMENTS

## Load Beads Skill

```typescript
skill({ name: "beads" });
```

## Phase 1: Source Detection & File Discovery

Parse `$ARGUMENTS`:

| Input            | Action                                     |
| ---------------- | ------------------------------------------ |
| Screenshots path | Analyze images for visual inventory        |
| `codebase`       | Search code for design tokens and patterns |
| `both`           | Screenshots + codebase, then compare       |

**Output format** (default: `both`):

- `tokens` - Design tokens JSON only
- `report` - Markdown audit report only
- `both` - Full audit with tokens and report

**Depth** (default: `--deep`):

- `--quick` - Top-level scan, major issues only (~5-10 min)
- `--deep` - Comprehensive audit with all categories (~20-30 min)

---

## Phase 2: File Discovery (for codebase audit)

Search for design-related files:

```typescript
glob({ pattern: "**/tailwind.config.{js,ts,mjs}" });
glob({ pattern: "**/globals.css" });
glob({ pattern: "**/variables.css" });
glob({ pattern: "**/tokens.{json,js,ts}" });
glob({ pattern: "**/theme.{js,ts}" });
glob({ pattern: "**/*.css.ts" }); // vanilla-extract, etc.

glob({ pattern: "**/components/**/*.{tsx,jsx,vue}" });
```

**Detect design system in use:**

| Pattern Found                | System           |
| ---------------------------- | ---------------- |
| `@shadcn/ui` in package.json | shadcn/ui        |
| `@mui/material`              | Material UI      |
| `@radix-ui/*`                | Radix Primitives |
| `@chakra-ui/*`               | Chakra UI        |
| Tailwind config only         | Custom Tailwind  |
| CSS variables only           | Custom system    |

---

## Phase 3: Token Extraction

skill({ name: "design-system-audit" })

### For Screenshots

Analyze all images and extract:

```
1. COLOR PALETTE
   - Primary colors (brand)
   - Secondary colors
   - Neutral/gray scale (should be 8-12 shades)
   - Semantic colors (success, warning, error, info)
   - Accent colors

2. TYPOGRAPHY SCALE
   - Font families (sans, serif, mono)
   - Heading sizes (H1-H6)
   - Body text sizes (xs, sm, base, lg, xl)
   - Font weights used
   - Line heights

3. SPACING PATTERNS
   - Base unit (typically 4px or 8px)
   - Common padding values
   - Common margin values
   - Gap patterns

4. BORDER & SHADOW
   - Border radius values
   - Border widths
   - Shadow definitions

5. COMPONENT VARIANTS
   - Button styles (primary, secondary, outline, ghost)
   - Input field styles
   - Card variations
```

### For Codebase

Search for hardcoded values using ast-grep and grep:

```typescript
ast - grep({ pattern: 'color: "#$HEX"' });
ast - grep({ pattern: 'background: "#$HEX"' });
grep({ pattern: "#[0-9a-fA-F]{3,8}", include: "*.{css,scss,tsx,jsx}" });
grep({ pattern: "rgb\\(", include: "*.{css,scss,tsx,jsx}" });
grep({ pattern: "hsl\\(", include: "*.{css,scss,tsx,jsx}" });

grep({ pattern: "[0-9]+px", include: "*.{css,scss,tsx,jsx}" });
grep({ pattern: "[0-9]+rem", include: "*.{css,scss,tsx,jsx}" });

grep({ pattern: "font-size:", include: "*.css" });
grep({ pattern: "fontSize:", include: "*.{tsx,jsx}" });

ast - grep({ pattern: 'className="$$$"' }); // then analyze for arbitrary values like [16px]
```

---

## Phase 4: Consistency Analysis

Compare findings and identify issues:

### Consistency Score Calculation

```
Score = 100 - (penalties)

Penalties:
- Each one-off color: -2 points (max -20)
- Each duplicate/similar color (ΔE < 5): -1 point (max -10)
- Missing semantic token: -3 points (max -15)
- Inconsistent spacing (not on base grid): -1 point (max -10)
- Typography not in scale: -2 points (max -10)
- Hardcoded values in components: -1 point per 5 instances (max -15)
- No dark mode support: -10 points
- Missing focus states: -10 points

Score interpretation:
90-100: Excellent - Well-maintained design system
70-89: Good - Minor inconsistencies
50-69: Fair - Needs attention
<50: Poor - Significant design debt
```

### Issue Categories

| Category              | Check For                                     |
| --------------------- | --------------------------------------------- |
| **Duplicates**        | Colors within ΔE < 5, similar spacing values  |
| **One-offs**          | Values used only once, not in token file      |
| **Missing Semantics** | Using primitives where semantic tokens needed |
| **Hardcoded**         | Values in components instead of tokens        |
| **Naming**            | Inconsistent naming conventions               |
| **Accessibility**     | Contrast ratios, focus states                 |

---

## Phase 5: Theme Analysis

### Light/Dark Mode Coverage

| Token        | Light Value | Dark Value | Status  |
| ------------ | ----------- | ---------- | ------- |
| --background | #FFFFFF     | #0A0A0A    | Covered |
| --foreground | #0A0A0A     | #FAFAFA    | Covered |
| --primary    | #0066CC     | #3B82F6    | Covered |
| --muted      | #F3F4F6     | ???        | MISSING |

### Semantic Token Completeness

```markdown
## Required Semantic Tokens

### Colors

- [x] background (default, muted, subtle)
- [x] foreground (default, muted, subtle)
- [x] primary (default, hover, active)
- [x] secondary
- [ ] accent (MISSING)
- [x] destructive/error
- [x] success
- [ ] warning (MISSING)
- [x] border
- [x] ring/focus

### Typography

- [x] font-sans
- [x] font-mono
- [ ] font-serif (optional)

### Spacing

- [x] Base unit defined
- [x] Scale follows pattern (4, 8, 12, 16, 24, 32, 48, 64)

### Borders

- [x] radius scale (sm, md, lg, full)
- [x] border-width (default)
```

---

## Phase 6: Audit Report Output

### Summary Dashboard

| Metric                | Value      | Target | Status |
| --------------------- | ---------- | ------ | ------ |
| Unique colors         | 47         | < 30   | Over   |
| Color duplicates      | 8          | 0      | Issue  |
| Spacing values        | 12         | 8-12   | OK     |
| Typography variants   | 9          | 6-10   | OK     |
| One-off values        | 23         | 0      | Issue  |
| Dark mode coverage    | 85%        | 100%   | Issue  |
| **Consistency Score** | **72/100** | > 80   | Fair   |

### Findings by Category

#### Colors (High Priority)

| Severity | Issue                 | Location   | Recommendation                 |
| -------- | --------------------- | ---------- | ------------------------------ |
| Critical | 8 duplicate blues     | Various    | Consolidate to --primary scale |
| Warning  | 15 one-off grays      | Components | Create --gray scale            |
| Info     | No semantic "warning" | Theme      | Add --warning token            |

#### Typography (Medium Priority)

| Severity | Issue                    | Location            | Recommendation          |
| -------- | ------------------------ | ------------------- | ----------------------- |
| Warning  | 3 undefined sizes        | Card.tsx, Modal.tsx | Add to typography scale |
| Info     | Inconsistent line-height | Body text           | Standardize to 1.5      |

#### Spacing (Low Priority)

| Severity | Issue                | Location         | Recommendation       |
| -------- | -------------------- | ---------------- | -------------------- |
| Info     | 5 values not on grid | Padding in cards | Round to nearest 4px |

### Priority Actions

#### High Priority (Fix This Week)

1. Consolidate 8 duplicate blue colors → single `--primary` scale
2. Add dark mode values for 5 missing tokens
3. Create `--warning` semantic token

#### Medium Priority (Fix This Sprint)

1. Replace 15 one-off grays with `--gray` scale
2. Add missing typography sizes to scale

#### Low Priority (Design Debt)

1. Round spacing values to base-4 grid
2. Document token naming conventions

---

## Phase 7: Token Export

### Design Tokens JSON

```json
{
  "color": {
    "primitive": {
      "blue": {
        "50": "#EFF6FF",
        "100": "#DBEAFE",
        "200": "#BFDBFE",
        "300": "#93C5FD",
        "400": "#60A5FA",
        "500": "#3B82F6",
        "600": "#2563EB",
        "700": "#1D4ED8",
        "800": "#1E40AF",
        "900": "#1E3A8A"
      },
      "gray": {
        "50": "#F9FAFB",
        "100": "#F3F4F6",
        "200": "#E5E7EB",
        "300": "#D1D5DB",
        "400": "#9CA3AF",
        "500": "#6B7280",
        "600": "#4B5563",
        "700": "#374151",
        "800": "#1F2937",
        "900": "#111827"
      }
    },
    "semantic": {
      "background": {
        "DEFAULT": "{color.primitive.white}",
        "muted": "{color.primitive.gray.100}"
      },
      "foreground": {
        "DEFAULT": "{color.primitive.gray.900}",
        "muted": "{color.primitive.gray.500}"
      },
      "primary": {
        "DEFAULT": "{color.primitive.blue.600}",
        "hover": "{color.primitive.blue.700}"
      },
      "destructive": { "DEFAULT": "#EF4444", "hover": "#DC2626" },
      "success": { "DEFAULT": "#10B981", "hover": "#059669" },
      "warning": { "DEFAULT": "#F59E0B", "hover": "#D97706" },
      "border": "{color.primitive.gray.200}",
      "ring": "{color.primitive.blue.500}"
    }
  },
  "spacing": {
    "0": "0",
    "1": "0.25rem",
    "2": "0.5rem",
    "3": "0.75rem",
    "4": "1rem",
    "5": "1.25rem",
    "6": "1.5rem",
    "8": "2rem",
    "10": "2.5rem",
    "12": "3rem",
    "16": "4rem",
    "20": "5rem"
  },
  "typography": {
    "fontFamily": {
      "sans": "Inter, system-ui, sans-serif",
      "mono": "JetBrains Mono, monospace"
    },
    "fontSize": {
      "xs": ["0.75rem", { "lineHeight": "1rem" }],
      "sm": ["0.875rem", { "lineHeight": "1.25rem" }],
      "base": ["1rem", { "lineHeight": "1.5rem" }],
      "lg": ["1.125rem", { "lineHeight": "1.75rem" }],
      "xl": ["1.25rem", { "lineHeight": "1.75rem" }],
      "2xl": ["1.5rem", { "lineHeight": "2rem" }],
      "3xl": ["1.875rem", { "lineHeight": "2.25rem" }],
      "4xl": ["2.25rem", { "lineHeight": "2.5rem" }]
    }
  },
  "borderRadius": {
    "none": "0",
    "sm": "0.125rem",
    "DEFAULT": "0.25rem",
    "md": "0.375rem",
    "lg": "0.5rem",
    "xl": "0.75rem",
    "2xl": "1rem",
    "full": "9999px"
  },
  "shadow": {
    "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "DEFAULT": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    "md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)"
  }
}
```

### CSS Variables Output

```css
:root {
  /* Primitives */
  --color-blue-500: #3b82f6;
  --color-blue-600: #2563eb;
  --color-gray-100: #f3f4f6;
  --color-gray-900: #111827;

  /* Semantics */
  --background: #ffffff;
  --foreground: #111827;
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
  --muted: #f3f4f6;
  --muted-foreground: #6b7280;
  --border: #e5e7eb;
  --ring: #3b82f6;

  /* Typography */
  --font-sans: Inter, system-ui, sans-serif;
  --font-mono: JetBrains Mono, monospace;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  /* Radius */
  --radius-sm: 0.125rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
}

.dark {
  --background: #0a0a0a;
  --foreground: #fafafa;
  --muted: #262626;
  --muted-foreground: #a3a3a3;
  --border: #262626;
}
```

---

## Phase 8: Create Tracking Issues

For high-priority findings:

```bash
bd create "[Design] Consolidate duplicate blue colors" -t task -p 1
bd create "[Design] Add missing dark mode tokens" -t task -p 1
```

---

## Storage

Save outputs to:

- **Tokens**: `.opencode/memory/design/tokens/[project]-tokens.json`
- **Report**: `.opencode/memory/design/audits/[date]-audit.md`
- **CSS**: `.opencode/memory/design/tokens/[project]-variables.css`

---

## Examples

```bash
# Audit from screenshots
/design-audit designs/screens/ --deep

# Audit codebase only
/design-audit codebase tokens

# Full audit with comparison
/design-audit both report --deep

# Quick consistency check
/design-audit codebase --quick
```

---

## Follow-up Commands

| Finding                  | Command                                      |
| ------------------------ | -------------------------------------------- |
| Need to implement tokens | `/design src/styles/tokens.css`              |
| Fix specific component   | `/fix-ui src/components/Button.tsx`          |
| Accessibility issues     | `/accessibility-check`                       |
| Compare to mockup        | `/analyze-mockup designs/spec.png --compare` |

---

## Related Skills

| Need                   | Skill                 |
| ---------------------- | --------------------- |
| Aesthetic improvements | `frontend-aesthetics` |
| Implement from mockup  | `mockup-to-code`      |
| Accessibility audit    | `accessibility-audit` |
| Visual analysis        | `visual-analysis`     |
