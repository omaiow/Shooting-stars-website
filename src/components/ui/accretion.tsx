import type React from "react"
import { forwardRef } from "react"
import { Shader } from "react-shaders"
import { cn } from "@/lib/utils"

export interface AccretionShadersProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Animation and rotation speed
   * @default 1.0
   */
  speed?: number

  /**
   * Matter flow and refraction intensity
   * @default 1.0
   */
  turbulence?: number

  /**
   * 3D perspective and disk thickness
   * @default 1.0
   */
  depth?: number

  /**
   * Overall intensity multiplier
   * @default 1.0
   */
  brightness?: number

  /**
   * Color spectrum cycling rate
   * @default 1.0
   */
  colorShift?: number
}

const fragmentShader = `
uniform float u_speed;
uniform float u_turbulence;
uniform float u_depth;
uniform float u_brightness;
uniform float u_colorShift;

// Tanh approximation for tone mapping
vec4 tanhApprox(vec4 x) {
    vec4 x2 = x * x;
    return x * (3.0 + x2) / (3.0 + 3.0 * x2);
}

void mainImage(out vec4 O, vec2 I)
{
    float z = 0.0, d, i = 0.0;
    O = vec4(0.0);

    for(float step = 0.0; step < 20.0; step++) {
        i = step;

        // Sample point from ray direction
        vec3 p = z * normalize(vec3(I + I, 0) - iResolution.xyx) + 0.1 * u_depth;

        // Polar coordinates and transformations
        p = vec3(atan(p.y / 0.2, p.x) * 2.0, p.z / 3.0, length(p.xy) - 5.0 - z * 0.2);

        // Apply turbulence and refraction effect
        for(float turb = 0.0; turb < 7.0; turb++) {
            p += sin(p.yzx * (turb + 1.0) + iTime * u_speed + 0.3 * i * u_turbulence) / (turb + 1.0);
        }

        // Distance to cylinder and waves with refraction
        d = length(vec4(0.4 * cos(p) - 0.4, p.z));
        z += d;

        // Coloring and brightness
        vec4 color = (1.0 + cos(p.x + i * 0.4 + z + vec4(6, 1, 2, 0) * u_colorShift)) / d;
        O += color * u_brightness;
    }

    // Tanh tonemap
    O = tanhApprox(O * O / 400.0);
}
`

export const AccretionShaders = forwardRef<HTMLDivElement, AccretionShadersProps>(
  (
    {
      className,
      speed = 1.0,
      turbulence = 1.0,
      depth = 1.0,
      brightness = 1.0,
      colorShift = 1.0,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn("w-full h-full", className)} ref={ref} {...(props as any)}>
        <Shader
          fs={fragmentShader}
          style={{ width: "100%", height: "100%" } as CSSStyleDeclaration}
          uniforms={{
            u_speed: { type: "1f", value: speed },
            u_turbulence: { type: "1f", value: turbulence },
            u_depth: { type: "1f", value: depth },
            u_brightness: { type: "1f", value: brightness },
            u_colorShift: { type: "1f", value: colorShift },
          }}
        />
      </div>
    )
  },
)

AccretionShaders.displayName = "AccretionShaders"

export default AccretionShaders
