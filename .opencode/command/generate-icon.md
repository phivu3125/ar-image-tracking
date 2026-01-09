---
description: Generate app icons in multiple sizes with platform optimization
argument-hint: "<description> [--platform=<ios|android|web|all>] [--style=<style>] [--shape=<shape>] [--color=<hex>] [--dark]"
agent: vision
model: proxypal/gemini-3-pro-image-preview
---

# Generate Icon: $ARGUMENTS

Generate app icons optimized for different platforms and sizes.

## Parse Arguments

| Argument     | Default  | Options                           |
| ------------ | -------- | --------------------------------- |
| Description  | required | What the icon should depict       |
| `--platform` | all      | ios, android, web, all            |
| `--style`    | minimal  | See style presets below           |
| `--shape`    | squircle | square, rounded, squircle, circle |
| `--color`    | none     | Brand color hex (e.g., `#0066CC`) |
| `--bg`       | solid    | solid, gradient, transparent      |
| `--dark`     | false    | Generate dark mode variant        |

---

## Style Presets

| Style           | Description                            | Best For                   |
| --------------- | -------------------------------------- | -------------------------- |
| `minimal`       | Simple shapes, 1-2 colors, clean lines | Professional, utility apps |
| `flat`          | Solid colors, no shadows, 2D           | Modern, clean aesthetic    |
| `3d`            | Depth, gradients, subtle shadows       | Games, premium apps        |
| `glassmorphism` | Frosted glass effect, transparency     | Modern iOS, premium        |
| `neumorphism`   | Soft shadows, raised/pressed effect    | Unique, tactile feel       |
| `gradient`      | Bold color gradients                   | Social, creative apps      |
| `outlined`      | Line art, stroke-based                 | Technical, developer tools |
| `duotone`       | Two-color design                       | Bold, striking             |
| `isometric`     | 3D isometric view                      | Productivity, games        |
| `cartoon`       | Playful, illustrated style             | Kids, casual games         |

---

## Shape Options

| Shape      | Platform Default | Description                           |
| ---------- | ---------------- | ------------------------------------- |
| `squircle` | iOS              | Superellipse (Apple's rounded square) |
| `circle`   | Android (some)   | Perfect circle                        |
| `rounded`  | Android          | Rounded corners (customizable radius) |
| `square`   | Web favicon      | Sharp corners                         |

**Note:** Generate at highest resolution; platforms apply their own masks.

---

## Platform Sizes

### iOS

| Size      | Usage      |
| --------- | ---------- |
| 1024x1024 | App Store  |
| 180x180   | iPhone @3x |
| 120x120   | iPhone @2x |
| 167x167   | iPad Pro   |
| 152x152   | iPad @2x   |
| 76x76     | iPad @1x   |

**Output:** `AppIcon.appiconset/` with `Contents.json`

### Android

| Size    | Density    | Usage         |
| ------- | ---------- | ------------- |
| 512x512 | Play Store | Store listing |
| 192x192 | xxxhdpi    | Launcher      |
| 144x144 | xxhdpi     | Launcher      |
| 96x96   | xhdpi      | Launcher      |
| 72x72   | hdpi       | Launcher      |
| 48x48   | mdpi       | Launcher      |

**Adaptive Icons (Android 8+):**

```
res/
├── mipmap-anydpi-v26/
│   └── ic_launcher.xml      # References layers
├── drawable/
│   ├── ic_launcher_foreground.xml  # 108dp, icon centered in 72dp
│   └── ic_launcher_background.xml  # Solid color or gradient
```

### Web

| File                       | Size                | Usage              |
| -------------------------- | ------------------- | ------------------ |
| favicon.ico                | 16x16, 32x32, 48x48 | Browser tab        |
| favicon-16x16.png          | 16x16               | Small favicon      |
| favicon-32x32.png          | 32x32               | Standard favicon   |
| apple-touch-icon.png       | 180x180             | iOS bookmark       |
| android-chrome-192x192.png | 192x192             | Android PWA        |
| android-chrome-512x512.png | 512x512             | Android PWA splash |

**Output:** `site.webmanifest` included

---

## Brand Color Integration

Use `--color` to specify brand colors:

```bash
/generate-icon cloud storage app --color=#0066CC --style=minimal
```

The AI will:

- Use specified color as primary
- Generate complementary accents
- Ensure contrast for visibility

**Multiple colors:**

```bash
/generate-icon social app --color=#FF5722,#4CAF50 --style=gradient
```

---

## Dark Mode Variants

Use `--dark` to generate both light and dark variants:

```bash
/generate-icon productivity app --dark
```

**Output:**

```
icons/
├── icon-light.png       # Light mode (default)
├── icon-dark.png        # Dark mode variant
└── icon-tinted.png      # iOS tinted icon (optional)
```

**iOS Tinted Icons (iOS 18+):**

- Monochrome version for tinted appearance
- Automatically adapts to user's chosen tint color

---

## Icon Design Principles

### Do

- **Simple shape**: Recognizable at 16x16
- **Single focal point**: One main element
- **Bold colors**: Stand out on any wallpaper
- **Unique silhouette**: Distinguishable from other apps
- **Consistent style**: Match your app's aesthetic

### Don't

- **Text**: Illegible at small sizes (except single letter logos)
- **Photos**: Don't scale well
- **Too much detail**: Lost at small sizes
- **Thin lines**: Disappear at low resolution
- **Similar to system icons**: Avoid confusion

### The Squint Test

If you squint at your icon and can still identify it, it's good.

---

## Examples

### Utility/Productivity

```bash
# Cloud storage
/generate-icon cloud with upward arrow, simple --style=minimal --color=#2196F3 --platform=all

# Notes app
/generate-icon pencil on notepad, clean lines --style=flat --color=#FFC107

# Calculator
/generate-icon calculator with equals sign --style=outlined --color=#607D8B
```

### Social/Creative

```bash
# Social app
/generate-icon chat bubble with heart --style=gradient --color=#E91E63,#9C27B0

# Photo editor
/generate-icon camera lens with rainbow gradient --style=glassmorphism

# Music app
/generate-icon musical note, vibrant --style=3d --color=#1DB954
```

### Games

```bash
# Casual game
/generate-icon smiling star character --style=cartoon --color=#FFEB3B

# Strategy game
/generate-icon shield with sword --style=3d --color=#8B4513

# Puzzle game
/generate-icon interlocking puzzle pieces --style=isometric --color=#00BCD4
```

### Developer Tools

```bash
# Code editor
/generate-icon angle brackets with cursor --style=outlined --color=#21252B

# Terminal
/generate-icon command prompt symbol --style=minimal --color=#282C34 --dark

# API tool
/generate-icon connected nodes --style=duotone --color=#6200EE
```

---

## Output Structure

```
.opencode/memory/design/icons/[app-name]/
├── ios/
│   └── AppIcon.appiconset/
│       ├── Contents.json
│       ├── icon-1024.png
│       ├── icon-180.png
│       └── ...
├── android/
│   ├── play-store-512.png
│   ├── res/
│   │   ├── mipmap-xxxhdpi/
│   │   ├── mipmap-xxhdpi/
│   │   └── ...
│   └── adaptive/
│       ├── foreground.png
│       └── background.png
├── web/
│   ├── favicon.ico
│   ├── favicon-32x32.png
│   ├── apple-touch-icon.png
│   └── site.webmanifest
├── master-1024.png          # Source file
└── dark/                    # If --dark specified
    ├── master-1024.png
    └── ...
```

---

## Limitations

| Limitation             | Workaround                                       |
| ---------------------- | ------------------------------------------------ |
| Text rendering         | Use single letter or add text in post-processing |
| Exact brand logos      | Provide reference image with `/edit-image`       |
| Complex illustrations  | Generate simplified version, refine manually     |
| Precise color matching | Specify exact hex with `--color`                 |

---

## Related Commands

| Need                  | Command             |
| --------------------- | ------------------- |
| Edit generated icon   | `/edit-image`       |
| Generate full image   | `/generate-image`   |
| Create pattern        | `/generate-pattern` |
| Analyze existing icon | `/analyze-mockup`   |
