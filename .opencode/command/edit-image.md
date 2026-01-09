---
description: Edit image with natural language instructions
argument-hint: "<image-path> <edit-instruction> [--hd] [--preserve-size] [--compare]"
agent: vision
model: proxypal/gemini-3-pro-image-preview
---

# Edit Image: $ARGUMENTS

Edit an existing image using natural language instructions.

## Parse Arguments

Extract from `$ARGUMENTS`:

| Argument          | Required | Description                    |
| ----------------- | -------- | ------------------------------ |
| Image path        | Yes      | Path to source image           |
| Edit instruction  | Yes      | Natural language edit request  |
| `--hd`            | No       | Higher quality output (slower) |
| `--preserve-size` | No       | Maintain original dimensions   |
| `--compare`       | No       | Output before/after comparison |

---

## Edit Types & What Works

### Works Well

| Edit Type                  | Example                                   | Success Rate |
| -------------------------- | ----------------------------------------- | ------------ |
| **Background removal**     | "remove the background"                   | High         |
| **Background replacement** | "replace background with beach sunset"    | High         |
| **Color changes**          | "change the shirt to blue"                | High         |
| **Style transfer**         | "make it look like a watercolor painting" | High         |
| **Add elements**           | "add a hat to the person"                 | Medium-High  |
| **Remove objects**         | "remove the car from the image"           | Medium-High  |
| **Lighting adjustments**   | "make it look like golden hour"           | High         |
| **Extend canvas**          | "extend the image to the right"           | Medium       |

### Works Poorly (Set Expectations)

| Edit Type                       | Why It's Hard                  | Alternative             |
| ------------------------------- | ------------------------------ | ----------------------- |
| **Text changes**                | AI struggles with precise text | Use image editor        |
| **Face/hand details**           | Often distorts                 | Mask specific region    |
| **Precise positioning**         | "Move object 50px left"        | Use coordinates in mask |
| **Multiple simultaneous edits** | Conflicts                      | Do one edit at a time   |
| **Preserving fine details**     | May blur/change                | Use `--preserve-size`   |

---

## Process

1. **Load** the source image from path
2. **Analyze** the original (note key features to preserve)
3. **Interpret** the edit instruction
4. **Apply** the edit, preserving unaffected areas
5. **Save** with versioning to track iterations
6. **Compare** if `--compare` flag set

---

## Common Edit Patterns

### Background Operations

```bash
# Remove background (transparent)
/edit-image photo.jpg remove the background

# Replace background
/edit-image photo.jpg replace background with a modern office

# Extend/outpaint
/edit-image landscape.jpg extend the sky upward
```

### Color & Style

```bash
# Color change
/edit-image product.jpg change the product color to red

# Style transfer
/edit-image photo.jpg convert to anime style

# Mood change
/edit-image scene.jpg make it look like nighttime with city lights
```

### Object Manipulation

```bash
# Add object
/edit-image room.jpg add a plant in the corner

# Remove object
/edit-image street.jpg remove the person on the left

# Replace object
/edit-image desk.jpg replace the laptop with a typewriter
```

### Enhancement

```bash
# Lighting
/edit-image portrait.jpg add dramatic studio lighting

# Quality
/edit-image old-photo.jpg enhance and sharpen, remove grain --hd

# Composition
/edit-image product.jpg add subtle shadow underneath
```

---

## Output

### Standard Output

```markdown
## Edit Complete

**Source:** `path/to/original.jpg`
**Edit:** "remove the background"
**Output:** `.opencode/memory/design/edited/original-v1-bg-removed.png`

### Original Analysis

- Dimensions: 1920x1080
- Key elements: Person in center, office background
- Preserved: Person, clothing, pose

### Edit Applied

- Background detected and removed
- Edges refined with feathering
- Output format: PNG (transparent)

### Refinements Available

- "Soften the edges more"
- "Keep the shadow underneath"
- "Make background white instead of transparent"
```

### Comparison Output (--compare)

```markdown
## Before/After Comparison

| Aspect     | Before       | After       |
| ---------- | ------------ | ----------- |
| Background | Office scene | Transparent |
| Subject    | Unchanged    | Unchanged   |
| Dimensions | 1920x1080    | 1920x1080   |
| File size  | 450KB        | 380KB       |

**Visual diff:** Key changes highlighted in output
```

---

## Version History

Edits are saved with version tracking:

```
.opencode/memory/design/edited/
├── photo-v1-bg-removed.png      # First edit
├── photo-v2-color-change.png    # Second edit
├── photo-v3-add-shadow.png      # Third edit
└── photo-history.json           # Edit history
```

**History file:**

```json
{
  "source": "photo.jpg",
  "edits": [
    { "v": 1, "instruction": "remove background", "timestamp": "..." },
    { "v": 2, "instruction": "change shirt to blue", "timestamp": "..." }
  ]
}
```

To revert: Reference previous version as source.

---

## Tips for Better Results

1. **Be specific**: "Add a red baseball cap" > "add a hat"
2. **One edit at a time**: Chain simple edits for complex changes
3. **Describe what to keep**: "Change background but keep the shadow"
4. **Use style references**: "Make it look like a Pixar movie"
5. **Specify format needs**: "Remove background, keep as PNG with transparency"

---

## Limitations

- **Text editing**: AI cannot reliably modify or add text
- **Precise geometry**: Exact pixel-level positioning not supported
- **Faces**: May alter facial features unintentionally
- **Hands**: Often produces artifacts
- **Multiple subjects**: May struggle to isolate specific elements
- **Brand logos**: May distort or refuse (safety filters)

For precise edits, consider: Photoshop, GIMP, or Figma.

---

## Examples

```bash
# Basic edit
/edit-image screenshot.png remove the background

# High quality with comparison
/edit-image product.jpg enhance lighting and add reflection --hd --compare

# Preserve dimensions
/edit-image banner.png change the color scheme to dark mode --preserve-size

# Style transfer
/edit-image photo.jpg convert to oil painting style --hd
```

---

## Related Commands

| Need               | Command           |
| ------------------ | ----------------- |
| Generate new image | `/generate-image` |
| Analyze image      | `/analyze-mockup` |
| Restore old photo  | `/restore-image`  |
| Create icon        | `/generate-icon`  |
