// three ships without type declarations, and @types/three pulls in half a dozen more packages
// (rapier, tween, webxr, webgpu types…). The Gunpla viewer is small, so it goes untyped.
declare module 'three';
declare module 'three/addons/*';
