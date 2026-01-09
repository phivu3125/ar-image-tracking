---
description: Generate seamless patterns and textures
argument-hint: "<description> [--type=<type>] [--style=<style>] [--colors=<palette>] [--density=<level>] [--size=<px>]"
agent: vision
model: proxypal/gemini-3-pro-image-preview
---

# Generate Pattern: $ARGUMENTS

Generate seamless, tileable patterns and textures.

## Parse Arguments

| Argument        | Default   | Options                               |
| --------------- | --------- | ------------------------------------- |
| Description     | required  | What the pattern depicts              |
| `--type`        | geometric | geometric, organic, abstract, texture |
| `--style`       | none      | See style presets below               |
| `--colors`      | auto      | Hex colors or preset name             |
| `--density`     | medium    | sparse, medium, dense                 |
| `--size`        | 512       | 256, 512, 1024, 2048                  |
| `--repeat`      | tile      | tile, mirror, half-drop, brick        |
| `--format`      | png       | png, svg, both                        |
| `--transparent` | false     | Transparent background                |

---

## Pattern Types

| Type        | Description                                     | Best For                      |
| ----------- | ----------------------------------------------- | ----------------------------- |
| `geometric` | Shapes, grids, lines, polygons                  | Modern UI, tech, corporate    |
| `organic`   | Nature-inspired, flowing, irregular             | Wellness, eco, natural brands |
| `abstract`  | Artistic, experimental, non-representational    | Creative, bold designs        |
| `texture`   | Material surfaces (wood, marble, fabric, paper) | Backgrounds, realism          |

---

## Style Presets

| Style          | Description                    | Characteristics                     |
| -------------- | ------------------------------ | ----------------------------------- |
| `art-deco`     | 1920s geometric elegance       | Gold, black, symmetry, fan shapes   |
| `memphis`      | 1980s bold & playful           | Bright colors, squiggles, dots      |
| `scandinavian` | Nordic minimalism              | Muted colors, simple shapes, nature |
| `japanese`     | Traditional Japanese motifs    | Waves, clouds, cherry blossoms      |
| `moroccan`     | Islamic geometric patterns     | Intricate tiles, symmetry           |
| `terrazzo`     | Speckled stone aggregate       | Colorful chips on neutral base      |
| `botanical`    | Plant and floral elements      | Leaves, flowers, vines              |
| `retro`        | Mid-century modern             | Atomic age, boomerangs, starbursts  |
| `tribal`       | Ethnic and indigenous patterns | Bold lines, earth tones             |
| `digital`      | Tech/circuit inspired          | Lines, nodes, grid patterns         |
| `watercolor`   | Soft, painterly texture        | Bleeding edges, wash effects        |
| `noise`        | Grain and static textures      | Film grain, static, subtle texture  |

---

## Color Palette Presets

Use `--colors=<preset>` or specify hex values:

| Preset    | Colors                    | Mood                  |
| --------- | ------------------------- | --------------------- |
| `mono`    | Single color + variations | Clean, minimal        |
| `duotone` | Two contrasting colors    | Bold, striking        |
| `earth`   | Browns, greens, tans      | Natural, organic      |
| `ocean`   | Blues, teals, white       | Calm, professional    |
| `sunset`  | Orange, pink, purple      | Warm, vibrant         |
| `forest`  | Greens, browns, gold      | Earthy, grounded      |
| `pastel`  | Soft, muted colors        | Gentle, friendly      |
| `neon`    | Bright, saturated colors  | Energetic, bold       |
| `neutral` | Grays, beige, white       | Sophisticated, subtle |
| `jewel`   | Deep, rich colors         | Luxurious, premium    |

**Custom colors:**

```bash
--colors=#FF5722,#4CAF50,#2196F3
```

---

## Density Levels

| Density  | Description                 | Use Case                     |
| -------- | --------------------------- | ---------------------------- |
| `sparse` | Few elements, lots of space | Subtle backgrounds, overlays |
| `medium` | Balanced coverage           | General purpose              |
| `dense`  | Tightly packed elements     | Bold statements, textures    |

---

## Repeat Modes

| Mode        | Description               | Visual           |
| ----------- | ------------------------- | ---------------- |
| `tile`      | Direct repeat in grid     | ▢▢▢ / ▢▢▢ / ▢▢▢  |
| `mirror`    | Flip alternating tiles    | ▢◻▢ / ◻▢◻ / ▢◻▢  |
| `half-drop` | Offset by half vertically | ▢▢▢ / ·▢▢ / ▢▢▢  |
| `brick`     | Offset like brickwork     | ▢▢▢ / ·▢▢▢ / ▢▢▢ |

---

## Use Cases

### UI Backgrounds

```bash
# Subtle hero background
/generate-pattern soft gradient noise --type=texture --density=sparse --colors=neutral --transparent

# Card pattern overlay
/generate-pattern geometric grid --style=digital --density=sparse --colors=#0066CC --transparent
```

### Print & Packaging

```bash
# Gift wrap
/generate-pattern festive geometric shapes --style=memphis --colors=pastel --size=2048

# Fabric print
/generate-pattern botanical leaves --style=scandinavian --colors=forest --repeat=half-drop
```

### Branding

```bash
# Corporate pattern
/generate-pattern subtle diagonal lines --type=geometric --colors=#1a1a1a --density=sparse

# Playful brand pattern
/generate-pattern abstract shapes and dots --style=memphis --colors=neon
```

### Textures

```bash
# Paper texture
/generate-pattern subtle paper grain --type=texture --colors=#FAFAFA --density=medium

# Marble surface
/generate-pattern marble veins --type=texture --colors=#FFFFFF,#CCCCCC,#999999 --size=1024

# Wood grain
/generate-pattern oak wood grain --type=texture --colors=earth
```

---

## Examples by Style

```bash
# Art Deco
/generate-pattern fan shapes and gold lines --style=art-deco --colors=#1a1a1a,#D4AF37

# Japanese
/generate-pattern waves and clouds --style=japanese --colors=ocean

# Terrazzo
/generate-pattern colorful stone chips --style=terrazzo --colors=pastel --size=1024

# Moroccan
/generate-pattern intricate tile pattern --style=moroccan --colors=jewel

# Scandinavian
/generate-pattern simple leaf shapes --style=scandinavian --colors=#2D4739,#F5F5DC
```

---

## Output

### File Structure

```
.opencode/memory/design/patterns/[name]/
├── pattern-512.png           # Main pattern tile
├── pattern-512.svg           # Vector version (if --format=svg)
├── pattern-preview.png       # 3x3 tiled preview
├── pattern-dark.png          # Dark variant (if applicable)
└── usage.css                 # CSS snippet
```

### CSS Snippet

```css
/* Generated pattern usage */
.pattern-background {
  background-image: url("pattern-512.png");
  background-repeat: repeat;
  background-size: 128px 128px; /* Adjust for desired scale */
}

/* With overlay for text readability */
.pattern-overlay {
  background:
    linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)),
    url("pattern-512.png");
  background-repeat: repeat;
}

/* CSS-only alternative (if simple enough) */
.pattern-css {
  background: repeating-linear-gradient(
    45deg,
    #f0f0f0,
    #f0f0f0 10px,
    #ffffff 10px,
    #ffffff 20px
  );
}
```

---

## Requirements

- **Seamless tiling**: Must repeat perfectly in all directions
- **Edge matching**: No visible seams when tiled
- **Consistent density**: Even distribution across tile
- **Color accuracy**: Match specified palette exactly

---

## Tips for Better Patterns

1. **Be specific**: "Geometric triangles" > "shapes"
2. **Reference styles**: "Like William Morris wallpaper"
3. **Specify scale**: "Large-scale floral" vs "micro pattern"
4. **Consider use**: "For dark text overlay" guides contrast
5. **Test at scale**: Preview at intended display size

---

## Limitations

| Limitation              | Workaround                                  |
| ----------------------- | ------------------------------------------- |
| Complex illustrations   | Use simpler, repeated motifs                |
| Photorealistic textures | Use `--type=texture` with specific material |
| Exact brand assets      | Provide reference, use as base              |
| Perfect symmetry        | May need manual adjustment                  |
| Text in patterns        | Add text in post-processing                 |

---

## Related Commands

| Need           | Command           |
| -------------- | ----------------- |
| Generate image | `/generate-image` |
| Edit pattern   | `/edit-image`     |
| Create icon    | `/generate-icon`  |
| Analyze design | `/analyze-mockup` |
