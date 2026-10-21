import { useEffect, useRef } from 'react';

const VERTEX_SHADER = `
  attribute vec2 a_position;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  uniform vec2 u_resolution;
  uniform float u_time;

  float hash21(vec2 point) {
    vec3 point3 = fract(vec3(point.xyx) * 0.1031);
    point3 += dot(point3, point3.yzx + 33.33);
    return fract((point3.x + point3.y) * point3.z);
  }

  float triadChannel(float x, float center) {
    float phase = mod(x, 3.0);
    float distanceToCenter = abs(phase - center);
    distanceToCenter = min(distanceToCenter, 3.0 - distanceToCenter);
    return exp(-distanceToCenter * distanceToCenter * 5.5);
  }

  void main() {
    vec2 pixel = gl_FragCoord.xy;
    vec2 uv = pixel / u_resolution;
    vec2 centered = uv * 2.0 - 1.0;
    float radiusSquared = dot(centered, centered);

    vec2 warped = centered * (1.0 + 0.035 * radiusSquared);
    vec2 crtPixel = (warped * 0.5 + 0.5) * u_resolution;

    float rollCenter = mix(-0.12, 1.12, fract(u_time / 12.0));
    float rollDistance = abs(uv.y - rollCenter);
    float rollBand = 1.0 - smoothstep(0.0, 0.11, rollDistance);
    float scanPhase = ((crtPixel.y + u_time * 3.0) / 5.0) * 6.28318530718;
    float scanline = pow(0.5 + 0.5 * sin(scanPhase), 1.8);
    float shade = 1.0 - 0.1 * scanline;
    shade = min(1.0, shade + rollBand * 0.035);

    float edgeAmount = clamp(length(centered) / 1.41421356, 0.0, 1.0);
    float split = 0.65 * edgeAmount;
    vec3 grille = vec3(
      0.95 + 0.05 * triadChannel(crtPixel.x + split, 0.5),
      0.95 + 0.05 * triadChannel(crtPixel.x, 1.5),
      0.95 + 0.05 * triadChannel(crtPixel.x - split, 2.5)
    );

    float frame = floor(u_time * 30.0);
    float grain = hash21(floor(pixel) + vec2(frame * 17.0, frame * 31.0));
    vec3 color = vec3(shade) * grille;
    color += (grain - 0.5) * 0.035;
    color *= 1.0 - 0.035 * smoothstep(0.28, 1.65, radiusSquared);

    gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
  }
`;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Unable to create CRT screen shader.');

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? 'Unknown shader error.';
    gl.deleteShader(shader);
    throw new Error(message);
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  let fragmentShader: WebGLShader;

  try {
    fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  } catch (error) {
    gl.deleteShader(vertexShader);
    throw error;
  }

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    throw new Error('Unable to create CRT screen shader program.');
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? 'Unknown program error.';
    gl.deleteProgram(program);
    throw new Error(message);
  }

  return program;
}

export function CrtScreenEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      stencil: false,
    });

    if (!gl) {
      console.error('CRT screen effect could not initialize WebGL.');
      canvas.hidden = true;
      return;
    }

    let program: WebGLProgram;
    try {
      program = createProgram(gl);
    } catch (error) {
      console.error('CRT screen shader failed to initialize.', error);
      canvas.hidden = true;
      return;
    }

    const positionBuffer = gl.createBuffer();
    if (!positionBuffer) {
      console.error('CRT screen effect could not allocate its position buffer.');
      gl.deleteProgram(program);
      canvas.hidden = true;
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const reducedMotionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );

    let reducedMotion = reducedMotionQuery.matches;
    let animationFrame = 0;
    let previousTime = performance.now();
    let elapsed = 0;

    const resizeCanvas = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(window.innerWidth * pixelRatio));
      const height = Math.max(1, Math.round(window.innerHeight * pixelRatio));

      if (canvas.width === width && canvas.height === height) return;
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    };

    const draw = (now: number) => {
      resizeCanvas();

      const delta = Math.min(Math.max((now - previousTime) / 1000, 0), 0.1);
      previousTime = now;
      if (!reducedMotion) elapsed += delta;

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, reducedMotion ? 0 : elapsed);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrame = window.requestAnimationFrame(draw);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(animationFrame);
        return;
      }

      previousTime = performance.now();
      animationFrame = window.requestAnimationFrame(draw);
    };

    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
    };

    resizeCanvas();
    animationFrame = window.requestAnimationFrame(draw);
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      reducedMotionQuery.removeEventListener(
        'change',
        handleReducedMotionChange,
      );
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="crt-screen-effect"
      aria-hidden="true"
    />
  );
}
