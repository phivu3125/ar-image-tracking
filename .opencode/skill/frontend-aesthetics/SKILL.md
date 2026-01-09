---
name: frontend-aesthetics
description: Use when building landing pages, dashboards, forms, or any frontend generation task where you need to prevent generic "AI slop" and create distinctive, intentional designs
---

# Frontend Aesthetics Skill

Prevent generic "AI slop" frontends. Create distinctive, intentional designs.

## When to Use

- Building landing pages, dashboards, forms, components
- Any frontend generation task
- Reviewing UI for visual quality

## Decision Gate (Do First)

Before writing code, state:

1. **Aesthetic direction** — Which style?
2. **Why** — How does it fit the context?

## Aesthetic Directions

Pick ONE (or combine 2):

| Direction        | Character                                       |
| ---------------- | ----------------------------------------------- |
| Neo-Brutalist    | Raw textures, bold type, harsh contrasts        |
| Soft Minimalism  | Muted palettes, generous whitespace             |
| Retro-Futuristic | CRT effects, scan lines, neon                   |
| Editorial        | Dynamic grids, mixed media, bold type           |
| Glass Morphism   | Translucent layers, backdrop blur, depth        |
| Dark Academia    | Rich textures, serif type, scholarly            |
| Swiss Design     | Grid systems, sans-serif, functional            |
| Art Deco         | Geometric patterns, gold accents, luxury        |
| Y2K Revival      | Gradients, metallics, early-web nostalgia       |
| Organic/Natural  | Flowing shapes, nature palettes, paper textures |

## Typography

**Good choices:**

- Code/Tech: JetBrains Mono, Fira Code, Space Mono
- Editorial: Playfair Display, Crimson Pro, Instrument Serif
- Display: Bebas Neue, Oswald, Archivo Black
- Technical: IBM Plex, Source Sans 3, Work Sans
- Distinctive: Bricolage Grotesque, Syne, Outfit

**Avoid:** Inter, Roboto, Arial, system fonts without purpose

**Pairing:** High contrast = interesting. Display + monospace, serif + geometric sans.

**Weight:** Use extremes (100/200 vs 800/900), not middle (400 vs 600).

## Color Anti-Patterns

**Avoid:**

- Purple/blue gradient backgrounds
- #6366F1 or #667eea as primary
- Flat white backgrounds

**Do:**

- Commit to cohesive theme
- Use CSS variables
- Dominant colors with sharp accents

## Animation Pattern

One orchestrated entrance beats scattered effects:

```css
@keyframes revealUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
}

.hero > * {
  animation: revealUp 800ms cubic-bezier(0.19, 1, 0.22, 1) both;
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
```

## AI Slop Signature (Never Do ALL Together)

- Purple/blue gradient backgrounds
- Inter or system fonts
- Centered hero with subheading
- 3-column feature cards with icons
- Rounded corners on everything (16px)
- Drop shadows on all cards
- "Modern, clean, simple" as only descriptors

## Quality Check

Before delivery:

- [ ] Clear aesthetic point of view?
- [ ] Avoids ALL items in the AI slop list?
- [ ] Would someone remember this tomorrow?
- [ ] Responsive, accessible, performs well?

## Storage

Save design decisions to `.opencode/memory/design/aesthetics/`
