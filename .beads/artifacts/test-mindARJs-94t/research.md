# Research: AR JS Frameworks

**Bead:** test-mindARJs-94t
**Completed:** 2026-01-09
**Depth:** Thorough

## Decision

**Chosen: MindAR.js + three.js (pure)**

## Candidates Evaluated

| Framework                | Image Tracking | Marker Tracking | Next.js | Verdict    |
| ------------------------ | -------------- | --------------- | ------- | ---------- |
| MindAR.js + A-Frame      | ✅             | ❌              | ⚠️      | Not chosen |
| MindAR.js + three.js     | ✅             | ❌              | ✅      | **CHOSEN** |
| MindAR.js + R3F          | ✅             | ❌              | ⚠️      | Not chosen |
| AR.js + A-Frame          | ✅ (NFT)       | ✅              | ⚠️      | Backup     |

## Why MindAR.js + three.js?

1. **Best Next.js integration** - No DOM conflicts with React
2. **Smaller bundle** - ~200KB vs ~700KB (A-Frame version)
3. **Better performance** - Fewer abstraction layers
4. **Full control** - Direct three.js API access
5. **R3F not needed** - MindAR manages its own renderer/camera

## Why NOT R3F?

- MindAR manages its own renderer, camera, and render loop
- Coordinating two rendering systems adds complexity
- No official MindAR + R3F integration exists
- Pure three.js is sufficient for this use case

## Why NOT A-Frame?

- DOM manipulation conflicts with React
- Harder to integrate with Next.js App Router
- Larger bundle size
- Less control over three.js internals

## Critical Limitation

**MindAR does NOT support marker tracking (Hiro, Aruco, Barcode)**

Only supports:
- Image tracking (custom images compiled to `.mind` files)
- Face tracking

If marker tracking needed → use AR.js instead

## Implementation Notes

### Dependencies
```bash
npm install mind-ar three
npm install -D @types/three
```

### Key Pattern
```tsx
// Must use dynamic import with ssr: false
import dynamic from 'next/dynamic';

const ARViewer = dynamic(() => import('./ARViewer'), { ssr: false });
```

### Image Compilation Required
Target images must be compiled to `.mind` files using:
https://hiukim.github.io/mind-ar-js-doc/tools/compile

## Sources

- MindAR.js Docs: https://hiukim.github.io/mind-ar-js-doc/
- MindAR React Example: https://github.com/hiukim/mind-ar-js-react
- AR.js Docs: https://ar-js-org.github.io/AR.js-Docs/
