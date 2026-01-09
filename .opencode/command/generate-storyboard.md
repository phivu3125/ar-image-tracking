---
description: Generate sequential images for visual storytelling
argument-hint: "<story-description> [--frames=<N>] [--style=<style>] [--aspect=<ratio>] [--layout=<layout>]"
agent: vision
model: proxypal/gemini-3-pro-image-preview
---

# Generate Storyboard: $ARGUMENTS

Generate a sequence of images telling a visual story with consistent characters and settings.

## Parse Arguments

| Argument          | Default  | Options                          |
| ----------------- | -------- | -------------------------------- |
| Story description | required | Narrative or script to visualize |
| `--frames`        | 4        | 3-12 frames                      |
| `--style`         | sketch   | See style presets below          |
| `--aspect`        | 16:9     | 16:9, 4:3, 1:1, 9:16             |
| `--layout`        | grid     | grid, strip, single              |
| `--captions`      | true     | Include scene descriptions       |
| `--timing`        | false    | Add duration annotations         |

---

## Style Presets

| Style        | Description                               | Best For                           |
| ------------ | ----------------------------------------- | ---------------------------------- |
| `sketch`     | Hand-drawn, rough lines, quick            | Pre-production, drafts             |
| `comic`      | Bold lines, panels, dynamic               | Marketing, entertainment           |
| `realistic`  | Photo-realistic rendering                 | Film pre-viz, client presentations |
| `animation`  | Clean lines, flat colors                  | Animated content planning          |
| `noir`       | High contrast, shadows, dramatic          | Thriller, drama                    |
| `watercolor` | Soft, artistic, painterly                 | Emotional narratives               |
| `minimalist` | Simple shapes, icons                      | UX flows, explainers               |
| `cinematic`  | Widescreen, film grain, dramatic lighting | Video production                   |
| `children`   | Bright colors, friendly, rounded          | Kids content                       |
| `technical`  | Clean, annotated, precise                 | Product demos, tutorials           |

---

## Aspect Ratios

| Ratio    | Dimensions  | Use Case                         |
| -------- | ----------- | -------------------------------- |
| `16:9`   | Widescreen  | Video, YouTube, presentations    |
| `4:3`    | Traditional | Classic film, some presentations |
| `1:1`    | Square      | Social media, Instagram          |
| `9:16`   | Vertical    | TikTok, Stories, Reels           |
| `2.35:1` | Anamorphic  | Cinematic widescreen             |

---

## Shot Types

Specify shot types in your description for precise framing:

| Shot                | Description                          | Emotional Effect            |
| ------------------- | ------------------------------------ | --------------------------- |
| `wide/establishing` | Full environment, tiny figures       | Context, scale, isolation   |
| `medium`            | Waist up, some environment           | Conversation, action        |
| `close-up`          | Face or object fills frame           | Emotion, detail, importance |
| `extreme close-up`  | Eyes, hands, small detail            | Intensity, intimacy         |
| `over-shoulder`     | Behind one character, facing another | Dialogue, connection        |
| `bird's eye`        | Directly above                       | Overview, vulnerability     |
| `low angle`         | Looking up at subject                | Power, dominance            |
| `high angle`        | Looking down at subject              | Weakness, submission        |
| `POV`               | Character's viewpoint                | Immersion, subjectivity     |

**Example prompt with shots:**

```
Frame 1: Wide shot - City skyline at sunset, small figure on rooftop
Frame 2: Medium shot - Character turns, looking worried
Frame 3: Close-up - Phone screen showing message
Frame 4: Over-shoulder - Character reading, city blurred behind
```

---

## Panel Layouts

| Layout     | Description                | Frames              |
| ---------- | -------------------------- | ------------------- |
| `grid`     | Even grid arrangement      | Any (auto-arranges) |
| `strip`    | Single horizontal row      | 3-6 frames          |
| `vertical` | Single vertical column     | 3-6 frames          |
| `featured` | One large + smaller panels | 4-6 frames          |
| `single`   | Individual images only     | Any                 |

---

## Use Cases

### Video Production

```bash
# Commercial storyboard
/generate-storyboard Product unboxing: hands open box, reveal product, show features, happy customer using it --frames=6 --style=cinematic --aspect=16:9

# Music video
/generate-storyboard Singer in empty warehouse, dancing, memories flash, reunites with loved one --frames=8 --style=noir --timing
```

### UX/Product Flows

```bash
# User journey
/generate-storyboard User discovers app, signs up, completes first task, shares achievement --frames=4 --style=minimalist --aspect=1:1

# Feature explainer
/generate-storyboard Problem: messy desk. Solution: our app. Result: organized life --frames=3 --style=technical
```

### Marketing/Social

```bash
# Social campaign
/generate-storyboard Day in the life with our coffee: morning routine, commute, work meeting, evening relaxation --frames=4 --style=watercolor --aspect=9:16

# Brand story
/generate-storyboard Founder's journey: garage startup, first customer, team growth, today's success --frames=6 --style=sketch
```

### Animation Planning

```bash
# Character animation
/generate-storyboard Character walks in, sees something surprising, reacts with joy, celebrates --frames=4 --style=animation

# Explainer video
/generate-storyboard Complex data enters system, gets processed, outputs simple insights --frames=5 --style=minimalist
```

---

## Maintaining Consistency

### Character Consistency

Include character details in your prompt:

```
Main character: Young woman, short black hair, red jacket, determined expression
Setting: Rainy city at night, neon signs, wet streets
```

### Consistency Tips

1. **Define characters first**: Age, hair, clothing, distinguishing features
2. **Establish setting**: Time of day, weather, key environmental elements
3. **Maintain color palette**: Specify dominant colors to carry through
4. **Reference previous frames**: "Same character from frame 1..."
5. **Use consistent lighting**: Define light source direction

---

## Transitions & Timing

Use `--timing` to add duration annotations:

| Transition | Symbol | Description          |
| ---------- | ------ | -------------------- | --------------- |
| Cut        | `→`    | Instant switch       |
| Fade       | `~>`   | Gradual transition   |
| Dissolve   | `<~>`  | Blend between frames |
| Wipe       | `      | >`                   | Edge transition |

**Example output with timing:**

```
Frame 1 (3s) → Frame 2 (2s) ~> Frame 3 (4s) → Frame 4 (2s)
```

---

## Captions & Dialogue

Include dialogue or narration:

```bash
/generate-storyboard Scene: coffee shop meeting
Frame 1: "Two old friends spot each other" - wide shot, recognition
Frame 2: "They haven't seen each other in years" - medium, approaching
Frame 3: "Warm embrace" - close-up, emotional hug
Frame 4: "Just like old times" - sitting, laughing, coffee cups
```

---

## Output

### File Structure

```
.opencode/memory/design/storyboards/[story-name]/
├── frames/
│   ├── 01-establishing.png
│   ├── 02-introduction.png
│   ├── 03-conflict.png
│   └── 04-resolution.png
├── storyboard-sheet.png      # Combined layout
├── storyboard-sheet.pdf      # Print-ready
└── script.md                 # Scene descriptions + timing
```

### Script Output

```markdown
# Storyboard: [Story Name]

## Frame 1 - Establishing Shot

**Duration:** 3 seconds
**Shot:** Wide
**Description:** City skyline at sunset, small figure visible on rooftop
**Audio:** Ambient city sounds, distant traffic
**Transition:** Cut to →

## Frame 2 - Introduction

**Duration:** 2 seconds
**Shot:** Medium
**Description:** Character turns, worried expression
**Dialogue:** (thinking) "Where is she?"
**Transition:** Fade to ~>
```

---

## Limitations

| Limitation                    | Workaround                                                 |
| ----------------------------- | ---------------------------------------------------------- |
| Perfect character consistency | Include detailed character description; may need touch-ups |
| Exact pose matching           | Describe poses clearly; use reference terms                |
| Complex action sequences      | Break into more frames                                     |
| Text/dialogue in image        | Add text in post-processing                                |
| Specific brand elements       | Describe style, add logos later                            |

---

## Related Commands

| Need                  | Command             |
| --------------------- | ------------------- |
| Generate single image | `/generate-image`   |
| Edit a frame          | `/edit-image`       |
| Create diagram        | `/generate-diagram` |
| Analyze reference     | `/analyze-mockup`   |
