declare module "mind-ar/dist/mindar-image-three.prod.js" {
  import * as THREE from "three";

  interface MindARThreeConfig {
    container: HTMLElement;
    imageTargetSrc: string;
    maxTrack?: number;
    uiLoading?: "yes" | "no";
    uiScanning?: "yes" | "no";
    uiError?: "yes" | "no";
    filterMinCF?: number;
    filterBeta?: number;
    warmupTolerance?: number;
    missTolerance?: number;
  }

  interface Anchor {
    group: THREE.Group;
    targetIndex: number;
    onTargetFound: () => void;
    onTargetLost: () => void;
  }

  export class MindARThree {
    constructor(config: MindARThreeConfig);

    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    cssRenderer: unknown;
    cssScene: THREE.Scene;

    addAnchor(targetIndex: number): Anchor;
    addCSSAnchor(targetIndex: number): Anchor;
    start(): Promise<void>;
    stop(): void;
    switchCamera(): void;
  }
}

declare module "mind-ar/dist/mindar-image-aframe.prod.js" {
  // A-Frame version - exports are attached to AFRAME global
}

declare module "mind-ar/dist/mindar-face-three.prod.js" {
  import * as THREE from "three";

  interface MindARFaceConfig {
    container: HTMLElement;
  }

  interface FaceAnchor {
    group: THREE.Group;
    onTargetFound: () => void;
    onTargetLost: () => void;
  }

  export class MindARThree {
    constructor(config: MindARFaceConfig);

    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;

    addFaceAnchor(anchorIndex: number): FaceAnchor;
    start(): Promise<void>;
    stop(): void;
  }
}
