import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-8">MindAR.js + Next.js Demo</h1>
      <p className="text-lg mb-8 text-center max-w-2xl">
        AR Image Tracking demo using MindAR.js with three.js integration.
        Point your camera at the target image to see 3D content overlay.
      </p>
      
      <div className="flex gap-4">
        <Link
          href="/ar"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Start AR Experience
        </Link>
      </div>

      <div className="mt-12 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg max-w-md">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Click "Start AR Experience"</li>
          <li>Allow camera access when prompted</li>
          <li>Point camera at the target image</li>
          <li>See 3D model appear on the image!</li>
        </ol>
      </div>
    </main>
  );
}
