"use client";

import dynamic from "next/dynamic";

// Dynamic import with SSR disabled - MindAR requires browser APIs
const ARViewer = dynamic(() => import("@/components/ARViewer"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4" />
        <p>Loading AR Module...</p>
      </div>
    </div>
  ),
});

export default function ARPage() {
  return <ARViewer />;
}
