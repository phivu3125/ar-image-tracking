---
description: UI/UX visual design with aesthetic direction and code output
argument-hint: "<component|page|system|'review'> [topic] [--direction:<aesthetic>] [--quick|--deep]"
agent: vision
subtask: true
---

# Design: $ARGUMENTS

## Load Beads Skill

```typescript
skill({ name: "beads" });
```

## Phase 1: Context Discovery

Parse `$ARGUMENTS` to determine design task:

| Task Type          | Description                    | Output Focus                |
| ------------------ | ------------------------------ | --------------------------- |
| `component <name>` | Design a specific component    | Component spec + code       |
| `page <name>`      | Design a page layout           | Layout structure + sections |
| `system`           | Create/extend design system    | Tokens + guidelines         |
| `review <path>`    | Review existing UI for quality | Findings + recommendations  |

**Depth** (default: `--deep`):

- `--quick` - High-level direction + key decisions only (~5 min)
- `--deep` - Full design spec with code output (~15-20 min)

### Detect Existing Design System

```typescript
glob({ pattern: "**/tailwind.config.{js,ts,mjs}" });
glob({ pattern: "**/globals.css" });
glob({ pattern: "**/components.json" }); // shadcn

// Read existing styles
read({ filePath: "tailwind.config.js" });
read({ filePath: "src/styles/globals.css" });
```

**Identify component library:**

| File/Pattern Found                   | Library          |
| ------------------------------------ | ---------------- |
| `components.json` with shadcn schema | shadcn/ui        |
| `@mui/material` in package.json      | Material UI      |
| `@chakra-ui/*`                       | Chakra UI        |
| `@radix-ui/*` only                   | Radix Primitives |
| None detected                        | Custom system    |

---

## Phase 2: Aesthetic Direction (DECISION GATE)

skill({ name: "frontend-aesthetics" })

**BEFORE any design work, you MUST state:**

1. **Aesthetic direction** — Which style(s)?
2. **Why** — How does it fit the context/brand?

### Available Directions

Pick ONE (or combine 2 max):

| Direction            | Character                                       | Best For                           |
| -------------------- | ----------------------------------------------- | ---------------------------------- |
| **Neo-Brutalist**    | Raw textures, bold type, harsh contrasts        | Developer tools, creative agencies |
| **Soft Minimalism**  | Muted palettes, generous whitespace             | SaaS, productivity apps            |
| **Retro-Futuristic** | CRT effects, scan lines, neon                   | Gaming, entertainment              |
| **Editorial**        | Dynamic grids, mixed media, bold type           | Magazines, portfolios              |
| **Glass Morphism**   | Translucent layers, backdrop blur, depth        | Dashboards, modern apps            |
| **Dark Academia**    | Rich textures, serif type, scholarly            | Education, libraries               |
| **Swiss Design**     | Grid systems, sans-serif, functional            | Enterprise, documentation          |
| **Art Deco**         | Geometric patterns, gold accents, luxury        | Finance, premium products          |
| **Y2K Revival**      | Gradients, metallics, early-web nostalgia       | Youth brands, creative             |
| **Organic/Natural**  | Flowing shapes, nature palettes, paper textures | Wellness, sustainability           |

**Override with flag:** `--direction:neo-brutalist` or `--direction:soft-minimalism+swiss`

### Direction Declaration

```markdown
## Aesthetic Direction

**Selected:** [Direction name(s)]

**Rationale:** [1-2 sentences explaining why this fits]

**Key characteristics I will apply:**

- [Specific element 1]
- [Specific element 2]
- [Specific element 3]
```

---

## Phase 3: Typography Specification

### Font Selection

**Recommended fonts by context:**

| Context         | Primary                                         | Secondary            |
| --------------- | ----------------------------------------------- | -------------------- |
| Code/Tech       | JetBrains Mono, Fira Code, Space Mono           | Inter, IBM Plex Sans |
| Editorial       | Playfair Display, Crimson Pro, Instrument Serif | Source Sans 3        |
| Display/Bold    | Bebas Neue, Oswald, Archivo Black               | Work Sans            |
| Technical/Clean | IBM Plex, Source Sans 3, Work Sans              | JetBrains Mono       |
| Distinctive     | Bricolage Grotesque, Syne, Outfit               | Space Grotesk        |

**AVOID without purpose:** Inter, Roboto, Arial, system fonts

### Type Scale

```css
/* Type scale - adjust base for your design */
:root {
  --font-sans: "Outfit", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  /* Scale: 1.25 ratio (Major Third) */
  --text-xs: 0.64rem; /* 10px */
  --text-sm: 0.8rem; /* 13px */
  --text-base: 1rem; /* 16px */
  --text-lg: 1.25rem; /* 20px */
  --text-xl: 1.563rem; /* 25px */
  --text-2xl: 1.953rem; /* 31px */
  --text-3xl: 2.441rem; /* 39px */
  --text-4xl: 3.052rem; /* 49px */

  /* Line heights */
  --leading-tight: 1.1;
  --leading-snug: 1.3;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

  /* Font weights - use extremes */
  --font-light: 200;
  --font-normal: 400;
  --font-bold: 700;
  --font-black: 900;
}
```

### Pairing Rules

- **High contrast = interesting**: Display + monospace, serif + geometric sans
- **Use weight extremes**: 200/300 vs 800/900, NOT 400 vs 600
- **Limit to 2 families**: One for headings, one for body

---

## Phase 4: Color Specification

### Color Palette Structure

```css
:root {
  /* Primitives - raw color values */
  --color-slate-50: #f8fafc;
  --color-slate-100: #f1f5f9;
  --color-slate-200: #e2e8f0;
  --color-slate-300: #cbd5e1;
  --color-slate-400: #94a3b8;
  --color-slate-500: #64748b;
  --color-slate-600: #475569;
  --color-slate-700: #334155;
  --color-slate-800: #1e293b;
  --color-slate-900: #0f172a;
  --color-slate-950: #020617;

  /* Brand color (pick ONE dominant) */
  --color-brand: #2563eb;
  --color-brand-light: #3b82f6;
  --color-brand-dark: #1d4ed8;

  /* Accent (sharp contrast to brand) */
  --color-accent: #f59e0b;

  /* Semantic - light mode */
  --background: var(--color-slate-50);
  --foreground: var(--color-slate-900);
  --muted: var(--color-slate-100);
  --muted-foreground: var(--color-slate-500);
  --primary: var(--color-brand);
  --primary-foreground: white;
  --secondary: var(--color-slate-100);
  --secondary-foreground: var(--color-slate-900);
  --accent: var(--color-accent);
  --accent-foreground: var(--color-slate-900);
  --destructive: #ef4444;
  --destructive-foreground: white;
  --success: #10b981;
  --warning: #f59e0b;
  --border: var(--color-slate-200);
  --ring: var(--color-brand);
}

.dark {
  --background: var(--color-slate-950);
  --foreground: var(--color-slate-50);
  --muted: var(--color-slate-800);
  --muted-foreground: var(--color-slate-400);
  --secondary: var(--color-slate-800);
  --secondary-foreground: var(--color-slate-50);
  --border: var(--color-slate-800);
}
```

### Color Anti-Patterns (NEVER DO)

| Anti-Pattern                      | Why It's Bad               | Do Instead                              |
| --------------------------------- | -------------------------- | --------------------------------------- |
| Purple/blue gradient backgrounds  | Overused AI slop signature | Solid colors or subtle texture          |
| `#6366F1` or `#667eea` as primary | Generic "Tailwind indigo"  | Choose distinctive brand color          |
| Flat white `#FFFFFF` backgrounds  | Harsh, sterile             | Use warm white `#FAFAF9` or subtle gray |
| Rainbow gradients                 | Overwhelming, no hierarchy | Limited palette with one accent         |
| Too many colors (>6 semantic)     | Confusion, inconsistency   | Stick to primary + accent + neutrals    |

---

## Phase 5: Spacing & Layout

### Spacing Scale

```css
:root {
  /* Base unit: 4px (or 0.25rem) */
  --space-0: 0;
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem; /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem; /* 48px */
  --space-16: 4rem; /* 64px */
  --space-20: 5rem; /* 80px */
  --space-24: 6rem; /* 96px */
}
```

### Layout Patterns

```css
/* Container */
.container {
  width: 100%;
  max-width: 1280px;
  margin-inline: auto;
  padding-inline: var(--space-4);
}

@media (min-width: 640px) {
  .container {
    padding-inline: var(--space-6);
  }
}

@media (min-width: 1024px) {
  .container {
    padding-inline: var(--space-8);
  }
}

/* Section spacing */
.section {
  padding-block: var(--space-16);
}

@media (min-width: 768px) {
  .section {
    padding-block: var(--space-24);
  }
}
```

### Responsive Breakpoints

| Breakpoint | Width  | Typical Use      |
| ---------- | ------ | ---------------- |
| `sm`       | 640px  | Mobile landscape |
| `md`       | 768px  | Tablets          |
| `lg`       | 1024px | Small laptops    |
| `xl`       | 1280px | Desktops         |
| `2xl`      | 1536px | Large screens    |

---

## Phase 6: Component Patterns

### For Component Design Tasks

**Component Specification Template:**

```markdown
## Component: [Name]

### Purpose

[What problem does this solve?]

### Variants

| Variant     | Use Case           | Visual Difference |
| ----------- | ------------------ | ----------------- |
| default     | Standard usage     | Base styling      |
| primary     | Primary action     | Brand color fill  |
| secondary   | Secondary action   | Muted background  |
| outline     | Tertiary action    | Border only       |
| ghost       | Minimal prominence | No border/bg      |
| destructive | Dangerous action   | Red/warning color |

### Sizes

| Size | Padding   | Font Size | Min Height |
| ---- | --------- | --------- | ---------- |
| sm   | 8px 12px  | 14px      | 32px       |
| md   | 10px 16px | 14px      | 40px       |
| lg   | 12px 24px | 16px      | 48px       |

### States

- Default
- Hover (subtle lightening/darkening)
- Focus (ring outline)
- Active (pressed state)
- Disabled (reduced opacity, no pointer)
- Loading (spinner, disabled interaction)

### Accessibility

- Keyboard: [Tab, Enter, Space behavior]
- ARIA: [Required attributes]
- Focus: [Visible ring, logical order]
- Contrast: [Minimum 4.5:1 for text]
```

### Code Output (shadcn/Tailwind pattern)

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-input bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
```

---

## Phase 7: Animation Approach

### Recommended: Orchestrated Entrance

One coordinated animation beats scattered effects:

```css
@keyframes revealUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero > * {
  animation: revealUp 600ms cubic-bezier(0.19, 1, 0.22, 1) both;
}

.hero > *:nth-child(1) {
  animation-delay: 0ms;
}
.hero > *:nth-child(2) {
  animation-delay: 80ms;
}
.hero > *:nth-child(3) {
  animation-delay: 160ms;
}
.hero > *:nth-child(4) {
  animation-delay: 240ms;
}
```

### Micro-interactions

```css
/* Subtle hover lift */
.card {
  transition:
    transform 200ms ease,
    box-shadow 200ms ease;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px -4px rgb(0 0 0 / 0.1);
}

/* Button press */
.button:active {
  transform: scale(0.98);
}

/* Focus ring */
.interactive:focus-visible {
  outline: none;
  ring: 2px solid var(--ring);
  ring-offset: 2px;
}
```

---

## Phase 8: AI Slop Check (MANDATORY)

Before finalizing, verify design does NOT have ALL of these together:

### AI Slop Signature (NEVER do all together)

| Element                                     | Check           |
| ------------------------------------------- | --------------- |
| Purple/blue gradient background             | [ ] NOT present |
| Inter or system fonts only                  | [ ] NOT present |
| Centered hero with generic subheading       | [ ] NOT present |
| 3-column feature cards with icons           | [ ] NOT present |
| 16px rounded corners on everything          | [ ] NOT present |
| Drop shadows on all cards                   | [ ] NOT present |
| "Modern, clean, simple" as only descriptors | [ ] NOT present |

**Rule:** Having 1-2 is fine. Having 5+ = AI slop. Redesign.

### Quality Checklist

- [ ] Clear aesthetic point of view? (Can you name it?)
- [ ] Avoids AI slop signature?
- [ ] Would someone remember this tomorrow?
- [ ] Responsive design considered?
- [ ] Accessible (contrast, focus, keyboard)?
- [ ] Dark mode supported?
- [ ] Performance-friendly (minimal JS animations)?

---

## Phase 9: Output Format

### For Component Design

```markdown
## Component Design: [Name]

### Aesthetic Direction

[Direction + rationale]

### Specification

[Variants, sizes, states table]

### Code

[Full component code with cva/cn pattern]

### Usage Examples

[3-4 usage examples]

### Accessibility Notes

[Keyboard, ARIA, contrast requirements]
```

### For Page Design

```markdown
## Page Design: [Name]

### Aesthetic Direction

[Direction + rationale]

### Layout Structure

[ASCII diagram or section breakdown]

### Sections

1. [Section name] - [Purpose] - [Key elements]
2. ...

### Responsive Behavior

[How layout changes at breakpoints]

### Code Structure

[Component composition, layout CSS]
```

### For System Design

```markdown
## Design System: [Name]

### Aesthetic Direction

[Direction + rationale]

### Tokens

[Full CSS variables: colors, typography, spacing]

### Component Guidelines

[Patterns to follow, anti-patterns to avoid]

### Tailwind Config

[Full tailwind.config.js extension]
```

---

## Phase 10: Storage & Follow-up

### Save to Memory

**Quick design:** Output inline, no save needed
**Full design:** Save to `.opencode/memory/design/specs/[YYYY-MM-DD]-[topic].md`

### Create Implementation Tasks

For component/page designs:

```bash
bd create "Implement [component/page] design" -t task -p 2
```

### Bead Integration

If bead exists in `$ARGUMENTS`, design within `.beads/artifacts/<bead-id>/spec.md` constraints.

---

## Examples

```bash
# Design a component
/design component button --direction:neo-brutalist

# Design a page
/design page landing --direction:soft-minimalism+swiss --deep

# Create/extend design system
/design system --direction:editorial

# Review existing UI
/design review src/components/ --quick

# Quick design recommendation
/design component modal --quick
```

---

## Related Commands

| Need                  | Command                |
| --------------------- | ---------------------- |
| Audit existing system | `/design-audit`        |
| Analyze mockup        | `/analyze-mockup`      |
| Implement design      | `/implement`           |
| Check accessibility   | `/accessibility-check` |
| Fix UI issues         | `/fix-ui`              |
