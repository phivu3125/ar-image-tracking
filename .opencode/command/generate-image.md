---
description: Generate images using Gemini image models
argument-hint: "<prompt> [--style=<style>] [--aspect=<ratio>] [--size=<size>] [--count=<n>] [--pro]"
agent: vision
model: proxypal/gemini-3-pro-image-preview
---

# Generate Image: $ARGUMENTS

Generate images based on natural language prompts.

## Parse Arguments

| Argument   | Default  | Options                          |
| ---------- | -------- | -------------------------------- |
| Prompt     | required | Natural language description     |
| `--style`  | none     | See style presets below          |
| `--aspect` | 1:1      | 1:1, 16:9, 9:16, 4:3, 3:4        |
| `--size`   | default  | default, hd, 2k                  |
| `--count`  | 1        | 1-4 variations                   |
| `--pro`    | false    | Use Pro model for higher quality |
| `--png`    | false    | Output PNG instead of JPEG       |

---

## Style Presets

Use `--style=<name>` to apply consistent aesthetics:

| Style            | Description                            | Best For                    |
| ---------------- | -------------------------------------- | --------------------------- |
| `photorealistic` | High-detail photography                | Products, portraits, scenes |
| `cinematic`      | Movie-quality lighting, depth of field | Drama, atmosphere           |
| `illustration`   | Clean vector-style artwork             | Icons, diagrams, UI         |
| `watercolor`     | Soft, painterly textures               | Art, backgrounds            |
| `anime`          | Japanese animation style               | Characters, scenes          |
| `3d-render`      | CGI/Blender-style render               | Products, architecture      |
| `sketch`         | Pencil/charcoal drawing                | Concepts, wireframes        |
| `pixel-art`      | Retro 8-bit/16-bit style               | Games, nostalgia            |
| `oil-painting`   | Classical art texture                  | Portraits, landscapes       |
| `minimalist`     | Simple shapes, flat colors             | Logos, icons                |
| `isometric`      | 3D isometric view                      | Diagrams, games             |
| `vintage`        | Aged, retro photograph look            | Nostalgia, branding         |

---

## Aspect Ratios

| Ratio  | Dimensions         | Use Case                               |
| ------ | ------------------ | -------------------------------------- |
| `1:1`  | Square             | Social media, avatars, icons           |
| `16:9` | Landscape wide     | Hero images, banners, video thumbnails |
| `9:16` | Portrait tall      | Mobile, stories, vertical content      |
| `4:3`  | Landscape standard | Presentations, traditional photos      |
| `3:4`  | Portrait standard  | Portraits, product photos              |

---

## Prompt Engineering

### Good Prompt Structure

```
[Subject] + [Action/Pose] + [Environment] + [Style] + [Lighting] + [Quality modifiers]
```

**Example:**

```
A golden retriever playing fetch in a sunny park,
soft afternoon light, shallow depth of field,
professional photography, 8k, highly detailed
```

### Quality Modifiers (add to any prompt)

| Modifier                   | Effect                   |
| -------------------------- | ------------------------ |
| "highly detailed"          | Increases fine detail    |
| "8k" / "4k"                | Suggests high resolution |
| "professional photography" | Photorealistic quality   |
| "sharp focus"              | Crisp subject            |
| "soft lighting"            | Gentle, flattering light |
| "dramatic lighting"        | High contrast, mood      |
| "shallow depth of field"   | Blurred background       |
| "studio lighting"          | Clean, even light        |

### Negative Prompts

Include what to avoid in your prompt:

```
A modern logo design, clean lines, minimalist,
avoid: text, watermarks, busy backgrounds, gradients
```

Common exclusions:

- "no text" / "avoid text"
- "no watermarks"
- "no people"
- "avoid clutter"
- "no blurry elements"

---

## Examples by Category

### Product Photography

```bash
# Product shot
/generate-image A sleek wireless headphone on white background, studio lighting, product photography --style=photorealistic --aspect=4:3

# Lifestyle product
/generate-image Coffee mug on wooden desk with morning light, cozy atmosphere, shallow depth of field --style=cinematic --aspect=16:9
```

### UI/Design Assets

```bash
# Icon
/generate-image A simple cloud upload icon, flat design, blue and white --style=minimalist --aspect=1:1

# Illustration
/generate-image Team collaboration illustration, people working together, modern flat style --style=illustration --aspect=16:9

# Pattern
/generate-image Seamless geometric pattern, navy and gold, art deco style --style=minimalist --aspect=1:1
```

### Marketing/Social

```bash
# Hero image
/generate-image Futuristic city skyline at sunset, cyberpunk aesthetic, neon lights --style=cinematic --aspect=16:9 --pro

# Social media
/generate-image Abstract gradient background, purple and blue, smooth waves --style=minimalist --aspect=1:1

# Story format
/generate-image Mountain landscape with hiker, adventure theme, dramatic sky --style=photorealistic --aspect=9:16
```

### Concept Art

```bash
# Character
/generate-image Fantasy warrior character, detailed armor, dynamic pose --style=illustration --aspect=3:4 --pro

# Environment
/generate-image Abandoned space station interior, sci-fi, atmospheric lighting --style=cinematic --aspect=16:9

# Creature
/generate-image Friendly dragon mascot, cute, approachable, cartoon style --style=illustration --aspect=1:1
```

---

## Batch Generation

Use `--count` to generate variations:

```bash
# Generate 4 variations
/generate-image Modern logo concepts for a tech startup --style=minimalist --count=4
```

Output:

```
Generated 4 images:
├── tech-logo-v1.png
├── tech-logo-v2.png
├── tech-logo-v3.png
└── tech-logo-v4.png
```

---

## Output

### Standard Output

```markdown
## Image Generated

**Prompt:** "A golden retriever in a sunny park"
**Style:** photorealistic
**Aspect:** 16:9
**Size:** HD
**Output:** `.opencode/memory/design/images/golden-retriever-park-001.jpg`

### Generation Details

- Model: gemini-3-pro-image-preview
- Enhanced prompt: [show the full prompt used]
- Generation time: 4.2s

### Refinements

- "Make the dog larger in frame"
- "Add more vibrant colors"
- "Change to sunset lighting"
```

---

## Limitations

| Limitation         | Details                              |
| ------------------ | ------------------------------------ |
| **Text in images** | AI struggles to render readable text |
| **Specific faces** | Cannot generate real people          |
| **Hands/fingers**  | Often produces artifacts             |
| **Exact counts**   | "5 birds" may show 4 or 6            |
| **Brand logos**    | May refuse or distort                |
| **Complex scenes** | Many elements = inconsistency        |
| **Precise layout** | Spatial positioning is approximate   |

### Tips to Avoid Issues

- Don't request text - add it in post-processing
- Keep subject count low (1-3 main elements)
- Be specific about what's important
- Use style presets for consistency
- Generate multiple variations, pick best

---

## Storage

Images saved to: `.opencode/memory/design/images/`

Filename pattern: `[subject]-[style]-[timestamp].{jpg|png}`

---

## Related Commands

| Need                | Command             |
| ------------------- | ------------------- |
| Edit existing image | `/edit-image`       |
| Generate icon       | `/generate-icon`    |
| Generate diagram    | `/generate-diagram` |
| Analyze image       | `/analyze-mockup`   |
| Create pattern      | `/generate-pattern` |
