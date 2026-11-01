// The CRT scene, exported from Spline (Export → Code → React).
// VITE_CRT_SCENE_URL in a .env file overrides it; set it to an empty string to
// turn the CRT frame off entirely.
const DEFAULT_SCENE_URL = 'https://prod.spline.design/wRMF0apehyFgD0cP/scene.splinecode';
export const CRT_SCENE_URL: string =
  (import.meta.env.VITE_CRT_SCENE_URL as string | undefined) ?? DEFAULT_SCENE_URL;

/**
 * True when the visitor should get the CRT frame: a configured scene, a
 * screen big enough to read a site inside a monitor, and not already inside it.
 * Add ?crt to force it on, ?screen to get the plain site.
 */
export function shouldUseCrtFrame(): boolean {
  if (typeof window === 'undefined') return false;
  if (!CRT_SCENE_URL) return false;
  const params = new URLSearchParams(window.location.search);
  if (params.has('screen')) return false;
  if (window.self !== window.top) return false;
  if (params.has('crt')) return true;
  const bigEnough = window.matchMedia('(min-width: 1024px) and (min-height: 600px)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  return bigEnough && finePointer;
}

/**
 * The CRT scene is exported for WebGPU. Resolves false when the browser can't
 * give us a WebGPU adapter (older browsers, or a crashed / blocked GPU), so
 * the site can drop back to the plain version instead of an empty frame.
 */
export async function crtGpuAvailable(): Promise<boolean> {
  try {
    const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<unknown> } }).gpu;
    if (!gpu) return false;
    return (await gpu.requestAdapter()) != null;
  } catch {
    return false;
  }
}
