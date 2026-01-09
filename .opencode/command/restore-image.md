---
description: Restore, enhance, upscale, or improve image quality using AI
argument-hint: "<image-path> [mode: enhance|upscale|restore|denoise|colorize]"
agent: vision
model: proxypal/gemini-3-pro-image-preview
---

# Restore Image: $ARGUMENTS

Use AI to restore, enhance, or improve image quality.

## Phase 1: Parse Input

```typescript
const input = "$ARGUMENTS";

const parseInput = (input: string) => {
  const parts = input.split(" ");
  const imagePath = parts[0];
  const mode = parts[1] || "enhance";

  const validModes = [
    "enhance",
    "upscale",
    "restore",
    "denoise",
    "colorize",
    "sharpen",
    "deblur",
  ];

  if (!validModes.includes(mode)) {
    console.warn(`Unknown mode: ${mode}. Using 'enhance' as default.`);
    return { imagePath, mode: "enhance" };
  }

  return { imagePath, mode };
};
```

## Phase 2: Analyze Source Image

### Load and Examine

```typescript
read({ filePath: imagePath }); // Load image for analysis
```

### Quality Assessment

```
IMAGE ANALYSIS: [filename]
━━━━━━━━━━━━━━━━━━━━━━━━━━

Format:     [PNG/JPG/WEBP/etc.]
Dimensions: [width] × [height] px
File Size:  [size] KB
Color Depth: [8/16/24/32] bit
Color Space: [sRGB/Adobe RGB/etc.]

QUALITY METRICS
───────────────
Overall Quality:    [1-10 score]
Sharpness:          [Low/Medium/High]
Noise Level:        [None/Low/Medium/High]
Compression:        [None/Low/Medium/Heavy]
Dynamic Range:      [Narrow/Normal/Wide]

DETECTED ISSUES
───────────────
[✓/✗] JPEG artifacts
[✓/✗] Noise (ISO grain)
[✓/✗] Motion blur
[✓/✗] Low resolution
[✓/✗] Color degradation
[✓/✗] Overexposure/Underexposure
[✓/✗] Scratches/Damage (for old photos)
```

## Phase 3: Select Restoration Mode

### Mode Capabilities

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       RESTORATION MODES                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ENHANCE                                                                │
│  ├── Improves overall quality                                          │
│  ├── Adjusts brightness, contrast, saturation                          │
│  ├── Sharpens details                                                  │
│  └── Best for: Photos that need general improvement                    │
│                                                                         │
│  UPSCALE                                                                │
│  ├── Increases resolution (2x or 4x)                                   │
│  ├── Preserves details using AI                                        │
│  ├── Adds realistic detail in enlargement                              │
│  └── Best for: Small images that need to be larger                     │
│                                                                         │
│  RESTORE                                                                │
│  ├── Removes artifacts and damage                                      │
│  ├── Fixes compression issues                                          │
│  ├── Repairs scratches and tears                                       │
│  └── Best for: Old or damaged photos                                   │
│                                                                         │
│  DENOISE                                                                │
│  ├── Removes noise while preserving detail                             │
│  ├── Handles ISO grain and sensor noise                                │
│  ├── Smooths backgrounds while keeping edges                           │
│  └── Best for: Low-light or high-ISO photos                            │
│                                                                         │
│  COLORIZE                                                               │
│  ├── Adds realistic color to B&W images                                │
│  ├── Uses AI to predict appropriate colors                             │
│  ├── Preserves original detail and texture                             │
│  └── Best for: Historical or B&W photos                                │
│                                                                         │
│  SHARPEN                                                                │
│  ├── Enhances edge definition                                          │
│  ├── Brings out fine details                                           │
│  ├── Avoids over-sharpening halos                                      │
│  └── Best for: Slightly soft images                                    │
│                                                                         │
│  DEBLUR                                                                 │
│  ├── Removes motion blur                                               │
│  ├── Corrects camera shake                                             │
│  ├── Recovers lost detail                                              │
│  └── Best for: Blurry photos from movement                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Auto-Mode Selection

If mode not specified or set to "auto":

```typescript
const suggestMode = (analysis: ImageAnalysis) => {
  if (analysis.hasJpegArtifacts || analysis.hasDamage) return "restore";
  if (analysis.noiseLevel === "high") return "denoise";
  if (analysis.isBlurry) return "deblur";
  if (analysis.isSmall && analysis.needsEnlargement) return "upscale";
  if (analysis.isBlackAndWhite) return "colorize";
  if (analysis.isSoft) return "sharpen";
  return "enhance"; // Default
};
```

## Phase 4: Apply Restoration

### Restoration Parameters

```typescript
const restorationParams = {
  enhance: {
    sharpness: 1.2, // Slight sharpening
    contrast: 1.1, // Slight contrast boost
    saturation: 1.05, // Subtle saturation
    clarity: 1.15, // Midtone contrast
  },
  upscale: {
    factor: 2, // 2x or 4x
    model: "real-esrgan", // AI upscaling model
    denoise: 0.3, // Light denoising
  },
  restore: {
    removeArtifacts: true,
    repairDamage: true,
    enhanceColors: true,
  },
  denoise: {
    strength: 0.5, // 0-1, higher = more aggressive
    preserveDetail: true,
  },
  colorize: {
    saturation: 0.8, // Avoid over-saturation
    style: "natural", // natural, vivid, vintage
  },
};
```

### Execute Restoration

```
APPLYING RESTORATION
━━━━━━━━━━━━━━━━━━━━

Mode: [selected mode]
Input: [original filename]

Processing Steps:
[1/4] Analyzing image content...
[2/4] Applying AI restoration...
[3/4] Optimizing output...
[4/4] Saving result...

⏳ Estimated time: [X seconds]
```

## Phase 5: Output and Comparison

### Save Restored Image

```typescript
const outputPath = `.opencode/memory/design/restored/${filename}-${mode}-${timestamp}.png`;

write({
  filePath: outputPath,
  content: restoredImageData,
});
```

### Generate Comparison

```
RESTORATION COMPLETE
━━━━━━━━━━━━━━━━━━━━

                    Before          After
────────────────────────────────────────────
Dimensions          800×600         1600×1200
File Size           45 KB           189 KB
Sharpness           Low             High
Noise Level         High            Low
Quality Score       4/10            8/10


CHANGES APPLIED
───────────────
✓ Resolution increased 2x
✓ Noise reduced by ~70%
✓ Sharpness enhanced
✓ JPEG artifacts removed
✓ Color vibrancy improved

OUTPUT
──────
Path: [outputPath]
Format: PNG (lossless)

Preview: [Image displayed if in vision-capable context]
```

## Phase 6: Version Management

### Track Restoration History

```typescript
const historyEntry = {
  original: imagePath,
  restored: outputPath,
  mode: mode,
  timestamp: new Date().toISOString(),
  parameters: restorationParams[mode],
  qualityBefore: analysis.overallScore,
  qualityAfter: restoredAnalysis.overallScore,
};

// Append to history
const historyPath = `.opencode/memory/design/restored/history.json`;
```

### History Format

```json
{
  "restorations": [
    {
      "id": "restore-001",
      "original": "photos/old-family.jpg",
      "outputs": [
        {
          "mode": "restore",
          "path": "restored/old-family-restore-1.png",
          "timestamp": "2024-01-15T10:30:00Z"
        },
        {
          "mode": "colorize",
          "path": "restored/old-family-colorize-1.png",
          "timestamp": "2024-01-15T10:35:00Z"
        }
      ]
    }
  ]
}
```

## Examples

```bash
/restore-image photo.jpg              # Auto-detect best mode
/restore-image photo.jpg enhance      # General enhancement
/restore-image photo.jpg upscale      # 2x resolution increase
/restore-image old-photo.jpg restore  # Fix damage and artifacts
/restore-image noisy.jpg denoise      # Remove noise
/restore-image bw-photo.jpg colorize  # Add color to B&W
/restore-image soft.jpg sharpen       # Increase sharpness
/restore-image blurry.jpg deblur      # Remove motion blur
```

## Batch Processing

For multiple images:

```bash
/restore-image "photos/*.jpg" enhance
```

```
BATCH RESTORATION
━━━━━━━━━━━━━━━━━

Found: 12 images
Mode: enhance

Progress:
[████████░░░░░░░░░░░░] 8/12

Results:
✓ photo-001.jpg → enhanced (6/10 → 8/10)
✓ photo-002.jpg → enhanced (5/10 → 7/10)
✓ photo-003.jpg → enhanced (4/10 → 8/10)
⚠ photo-004.jpg → skipped (already high quality)
...

Summary:
- Processed: 11/12
- Skipped: 1 (already optimized)
- Avg improvement: +2.3 quality points
```

## Quality Presets

### Conservative (preserve original character)

```typescript
{
  sharpness: 1.05,
  denoise: 0.2,
  preserveGrain: true
}
```

### Balanced (recommended default)

```typescript
{
  sharpness: 1.2,
  denoise: 0.4,
  preserveGrain: false
}
```

### Aggressive (maximum enhancement)

```typescript
{
  sharpness: 1.5,
  denoise: 0.7,
  contrast: 1.2
}
```

## Error Handling

```
[If unsupported format:]
ERROR: Format not supported: .tiff

Supported formats:
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- BMP (.bmp)

Convert first: /edit-image photo.tiff --convert png


[If image too large:]
WARNING: Image is very large (8000×6000)

Options:
1. Process at reduced size (faster, ~30 sec)
2. Process at full size (slower, ~2 min)
3. Cancel

[If restoration fails:]
ERROR: Restoration failed

Possible causes:
- Image is corrupted
- Insufficient contrast for analysis
- Format incompatibility

Try:
- Different mode: /restore-image photo.jpg restore
- Manual enhancement: /edit-image photo.jpg
```

## Output Options

### Format Selection

```bash
/restore-image photo.jpg enhance --format webp   # Output as WebP
/restore-image photo.jpg upscale --format png    # Output as PNG (lossless)
```

### Quality Settings

```bash
/restore-image photo.jpg enhance --quality 90    # JPEG quality 90%
/restore-image photo.jpg upscale --factor 4      # 4x upscale
```

## Limitations

```
CURRENT LIMITATIONS
━━━━━━━━━━━━━━━━━━━

- Maximum input size: 4096×4096 px
- Maximum upscale: 4x
- Colorization may not match historical accuracy
- Heavy blur may not be fully recoverable
- Severely damaged images may need manual editing

For best results:
- Start with highest quality source available
- Use mode matching the specific issue
- Review output and iterate if needed
```
