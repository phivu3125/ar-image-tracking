---
type: decision
created: 2026-01-09T04:37:20.607Z
confidence: high
valid_until: null
superseded_by: null
files: ["spec.md"]
---

# 🎯 A-Frame vs React Three Fiber (R3F) for WebXR/AR Image Tracking

🟢 **Confidence:** high

## Research Summary

Based on comprehensive research for the AR image tracking project with Next.js, here's the comparison:

### A-Frame
**Architecture**: HTML-based declarative framework built on Three.js
**WebXR/AR Support**: Native, first-class with AR.js integration
**AR Capabilities**: 
- Image tracking (NFT)
- Marker tracking
- Location-based AR
- Built-in AR components

**Strengths for this project**:
1. AR.js integration is mature and battle-tested
2. Declarative HTML approach (simpler for AR scenes)
3. Extensive AR-specific ecosystem
4. Lower barrier to entry for AR development
5. Direct WebXR support out of the box

**Weaknesses**:
1. Less React-native (uses custom elements)
2. Harder to integrate with React state management
3. More limited ecosystem compared to React
4. Performance tuning requires Three.js knowledge anyway

### React Three Fiber (R3F)
**Architecture**: React renderer for Three.js
**WebXR/AR Support**: Via @react-three/xr library (addon)
**AR Capabilities**: WebXR-based, requires additional libraries for image tracking

**Strengths**:
1. Native React integration
2. Huge ecosystem (@react-three/drei, etc.)
3. Modern React patterns (hooks, state management)
4. Better TypeScript support
5. Easier to integrate with Next.js app structure

**Weaknesses for this project**:
1. AR image tracking not as mature as AR.js
2. Requires combining multiple libraries (@react-three/xr, custom tracking)
3. More complex setup for AR scenarios
4. WebXR API is lower-level

### Recommendation: **A-Frame + AR.js**

**Why**:
1. **Proven AR solution**: AR.js with A-Frame is specifically designed for web AR
2. **Image tracking ready**: NFT (Natural Feature Tracking) works out of the box
3. **Lower complexity**: For AR use cases, A-Frame's declarative approach is simpler
4. **Better documentation**: AR.js docs are comprehensive for AR scenarios
5. **Mobile performance**: Optimized for mobile AR scenarios

**Next.js Integration**:
```tsx
// pages/ar.tsx
import { useEffect } from 'react'

export default function ARPage() {
  useEffect(() => {
    // Load A-Frame scripts dynamically
    const aframeScript = document.createElement('script')
    aframeScript.src = 'https://aframe.io/releases/1.6.0/aframe.min.js'
    document.body.appendChild(aframeScript)
    
    const arScript = document.createElement('script')
    arScript.src = 'https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar-nft.js'
    document.body.appendChild(arScript)
  }, [])
  
  return (
    <div dangerouslySetInnerHTML={{
      __html: `
        <a-scene embedded arjs>
          <a-nft type="nft" url="/markers/mymarker">
            <a-entity gltf-model="/models/model.gltf"></a-entity>
          </a-nft>
          <a-entity camera></a-entity>
        </a-scene>
      `
    }} />
  )
}
```

**When to choose R3F instead**:
- Building complex 3D app with AR as secondary feature
- Need deep React ecosystem integration
- Team has strong React/Three.js experience but no AR experience
- Building for WebXR headsets primarily (not mobile AR)

### For the current project (mobile AR image tracking):
**Use A-Frame + AR.js** - it's the path of least resistance with proven results for this exact use case.
