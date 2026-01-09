"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function ARViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mindarRef = useRef<MindARThree | null>(null);
  const isStartedRef = useRef(false); // Track if AR started successfully
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initAR = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      const mindarThree = new MindARThree({
        container: containerRef.current,
        imageTargetSrc: "/targets/targets.mind",
        uiLoading: "no",
        uiScanning: "no",
        uiError: "no",
      });

      mindarRef.current = mindarThree;

      const { renderer, scene, camera } = mindarThree;
      const anchor = mindarThree.addAnchor(0);

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(0, 1, 1);
      scene.add(directionalLight);

      // Try to load GLB model, fallback to simple geometry
      const loader = new GLTFLoader();
      let cube: THREE.Mesh | null = null;

      try {
        const gltf = await loader.loadAsync("/models/model.glb");
        gltf.scene.scale.set(0.01, 0.01, 0.01);
        gltf.scene.position.set(0, 0, 0);
        anchor.group.add(gltf.scene);
      } catch {
        // Fallback: create a simple 3D cube
        console.log("No model found, using fallback cube");
        const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const material = new THREE.MeshStandardMaterial({
          color: 0x00ff00,
          metalness: 0.5,
          roughness: 0.5,
        });
        cube = new THREE.Mesh(geometry, material);
        cube.position.set(0, 0.15, 0);
        anchor.group.add(cube);
      }

      // Start AR
      await mindarThree.start();
      isStartedRef.current = true; // Mark as successfully started
      setIsLoading(false);

      // Render loop with optional cube animation
      renderer.setAnimationLoop(() => {
        if (cube) {
          cube.rotation.y += 0.01;
        }
        renderer.render(scene, camera);
      });
    } catch (err) {
      console.error("AR initialization error:", err);
      setError(err instanceof Error ? err.message : "Failed to initialize AR");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAR();

    return () => {
      // Safely cleanup - only stop if AR was started successfully
      if (mindarRef.current) {
        try {
          mindarRef.current.renderer.setAnimationLoop(null);
          if (isStartedRef.current) {
            mindarRef.current.stop();
          }
        } catch (err) {
          console.warn("AR cleanup error (safe to ignore):", err);
        }
      }
    };
  }, [initAR]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">AR Error</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen">
      <div ref={containerRef} className="w-full h-full" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4" />
            <p>Loading AR Experience...</p>
            <p className="text-sm text-gray-400 mt-2">
              Please allow camera access
            </p>
          </div>
        </div>
      )}

      {/* Back button */}
      <a
        href="/"
        className="absolute top-4 left-4 px-4 py-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition z-10"
      >
        ← Back
      </a>

      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-4 right-4 p-4 bg-black/50 text-white rounded-lg text-center z-10">
        <p>Point your camera at the target image</p>
      </div>
    </div>
  );
}
