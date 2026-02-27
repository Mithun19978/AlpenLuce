// Global JSX intrinsic extension for React Three Fiber
// Allows lowercase Three.js tags: mesh, boxGeometry, meshStandardMaterial, etc.
declare namespace JSX {
  interface IntrinsicElements {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [elemName: string]: any;
  }
}
