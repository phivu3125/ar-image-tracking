# AR Image Tracking

Web-based AR image tracking using MindAR.js and Next.js. Point your camera at a target image to see 3D content overlay.

## Demo

🚀 **Live Demo:** [Coming soon - Deploy to Vercel]

## Features

- 📱 **Cross-platform** - Works on mobile and desktop browsers
- 🎯 **Image Tracking** - Track custom images using MindAR.js
- 🧊 **3D Models** - Display GLB/GLTF models on tracked images
- ⚡ **Next.js 16** - Built with App Router and Turbopack
- 🎨 **Tailwind CSS** - Modern styling

## Tech Stack

- [Next.js 16](https://nextjs.org/) - React framework
- [MindAR.js](https://hiukim.github.io/mind-ar-js-doc/) - AR image tracking library
- [three.js](https://threejs.org/) - 3D rendering
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/ar-image-tracking.git
cd ar-image-tracking

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing on Mobile

AR requires HTTPS for camera access. Options:

1. **Deploy to Vercel** (recommended)
2. **Use ngrok:** `ngrok http 3000`
3. **Local SSL:** `npx local-ssl-proxy --source 3443 --target 3000`

## Usage

### 1. Create Target Image

1. Go to [MindAR Image Compiler](https://hiukim.github.io/mind-ar-js-doc/tools/compile)
2. Upload your target image (poster, logo, card, etc.)
3. Click "Start" to compile
4. Download the `.mind` file
5. Place it in `public/targets/targets.mind`

### 2. Add 3D Model (Optional)

Place your GLB/GLTF model in `public/models/model.glb`

If no model is provided, a green cube will be displayed as fallback.

### 3. Test AR

1. Open the app on your device
2. Click "Start AR Experience"
3. Allow camera access
4. Point camera at your target image
5. See 3D content appear!

## Project Structure

```
ar-image-tracking/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   └── ar/
│   │       └── page.tsx     # AR experience
│   ├── components/
│   │   └── ARViewer.tsx     # MindAR + three.js component
│   ├── types/
│   │   └── mind-ar.d.ts     # TypeScript declarations
│   └── polyfills/
│       └── empty.js         # Node.js polyfills for browser
├── public/
│   ├── targets/
│   │   └── targets.mind     # Compiled target image
│   └── models/
│       └── model.glb        # 3D model (optional)
└── next.config.ts           # Next.js + Turbopack config
```

## Configuration

### Target Image Requirements

For best tracking results:
- High contrast patterns
- Unique, non-repetitive features
- Minimum 300x300 pixels
- Avoid reflective or transparent surfaces

### Supported 3D Formats

- `.glb` - Binary glTF (recommended)
- `.gltf` - JSON-based glTF

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/ar-image-tracking)

Or manually:

```bash
npm install -g vercel
vercel
```

## Sample Target

The project includes a sample target file. To test:

1. Open this image on another screen: [MindAR Sample Card](https://hiukim.github.io/mind-ar-js/samples/assets/card-example/card.png)
2. Point your camera at it
3. See the 3D cube appear!

## License

MIT

## Credits

- [MindAR.js](https://github.com/hiukim/mind-ar-js) by hiukim
- [three.js](https://github.com/mrdoob/three.js)
