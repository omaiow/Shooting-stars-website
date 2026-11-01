/**
 * Small, dependency-free camera + projection helpers for the CRT frame.
 *
 * The camera orbits a target point: yaw (around Y) and pitch (around X),
 * at a distance. Its rotation is R = Ry(yaw) · Rx(-pitch), which makes the
 * camera's local -Z axis point at the target (three.js convention).
 */

export type Vec3 = { x: number; y: number; z: number };
export type Vec2 = { x: number; y: number };

export interface CameraPose {
  position: Vec3;
  /** three.js Euler angles in radians, XYZ order (what SPEObject.rotation uses) */
  euler: Vec3;
  /** Columns of the rotation matrix: camera right, up, back (local X, Y, Z) */
  right: Vec3;
  up: Vec3;
  back: Vec3;
}

export function orbitPose(target: Vec3, distance: number, yaw: number, pitch: number): CameraPose {
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  // Rx(-pitch): cos(-p) = cp, sin(-p) = -sp
  const ca = cp, sa = -sp;

  // R = Ry · Rx, written out (row-major m[row][col])
  const m11 = cy, m12 = sy * sa, m13 = sy * ca;
  const m21 = 0, m22 = ca, m23 = -sa;
  const m31 = -sy, m32 = cy * sa, m33 = cy * ca;

  const back = { x: m13, y: m23, z: m33 };
  const position = {
    x: target.x + back.x * distance,
    y: target.y + back.y * distance,
    z: target.z + back.z * distance,
  };

  // Decompose into XYZ Euler (same formula as three.js setFromRotationMatrix)
  const ey = Math.asin(Math.max(-1, Math.min(1, m13)));
  let ex: number, ez: number;
  if (Math.abs(m13) < 0.9999999) {
    ex = Math.atan2(-m23, m33);
    ez = Math.atan2(-m12, m11);
  } else {
    ex = Math.atan2(m32, m22);
    ez = 0;
  }

  return {
    position,
    euler: { x: ex, y: ey, z: ez },
    right: { x: m11, y: m21, z: m31 },
    up: { x: m12, y: m22, z: m32 },
    back,
  };
}

/** Project a world point to canvas pixels for a perspective camera. */
export function project(
  p: Vec3,
  cam: CameraPose,
  fovDeg: number,
  width: number,
  height: number,
): Vec2 {
  const d = { x: p.x - cam.position.x, y: p.y - cam.position.y, z: p.z - cam.position.z };
  const vx = d.x * cam.right.x + d.y * cam.right.y + d.z * cam.right.z;
  const vy = d.x * cam.up.x + d.y * cam.up.y + d.z * cam.up.z;
  const vz = d.x * cam.back.x + d.y * cam.back.y + d.z * cam.back.z;
  const t = Math.tan((fovDeg * Math.PI) / 360);
  const aspect = width / height;
  const depth = Math.max(-vz, 1e-3);
  const nx = vx / depth / (t * aspect);
  const ny = vy / depth / t;
  return { x: ((nx + 1) / 2) * width, y: ((1 - ny) / 2) * height };
}

/** 3×3 homography (row-major) mapping the w×h rectangle onto quad p0..p3 (TL, TR, BR, BL). */
export function rectToQuad(w: number, h: number, q: [Vec2, Vec2, Vec2, Vec2]): number[] {
  const [p0, p1, p2, p3] = q;
  const dx1 = p1.x - p2.x, dx2 = p3.x - p2.x, dx3 = p0.x - p1.x + p2.x - p3.x;
  const dy1 = p1.y - p2.y, dy2 = p3.y - p2.y, dy3 = p0.y - p1.y + p2.y - p3.y;
  const den = dx1 * dy2 - dx2 * dy1 || 1e-9;
  const g = (dx3 * dy2 - dx2 * dy3) / den;
  const hh = (dx1 * dy3 - dx3 * dy1) / den;
  const a = p1.x - p0.x + g * p1.x;
  const b = p3.x - p0.x + hh * p3.x;
  const c = p0.x;
  const d = p1.y - p0.y + g * p1.y;
  const e = p3.y - p0.y + hh * p3.y;
  const f = p0.y;
  return [a / w, b / h, c, d / w, e / h, f, g / w, hh / h, 1];
}

/** CSS matrix3d() string for a 3×3 homography. */
export function toMatrix3d(m: number[]): string {
  const [m00, m01, m02, m10, m11, m12, m20, m21, m22] = m;
  return `matrix3d(${m00},${m10},0,${m20},${m01},${m11},0,${m21},0,0,1,0,${m02},${m12},0,${m22})`;
}

/** Map a canvas pixel back into the rectangle's local coordinates. */
export function unproject(m: number[], p: Vec2): Vec2 {
  const [a, b, c, d, e, f, g, h, i] = m;
  // inverse of 3×3
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const D = -(b * i - c * h), E = a * i - c * g, F = -(a * h - b * g);
  const G = b * f - c * e, H = -(a * f - c * d), I = a * e - b * d;
  const det = a * A + b * B + c * C || 1e-9;
  const x = (A * p.x + D * p.y + G) / det;
  const y = (B * p.x + E * p.y + H) / det;
  const w = (C * p.x + F * p.y + I) / det;
  return { x: x / w, y: y / w };
}
