export const LensShader = {
  uniforms: {
    uMarqueeSharp: { value: null },
    uTime: { value: 0 },
    uMouse: { value: [0, 0] },
    uResolution: { value: [window.innerWidth, window.innerHeight] },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec4 vScreenPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      
      vScreenPosition = projectionMatrix * mvPosition;
      gl_Position = vScreenPosition;
    }
  `,
  fragmentShader: `
    uniform sampler2D uMarqueeSharp;
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uResolution;

    varying vec2 vUv;
    varying vec4 vScreenPosition;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      // 1. Calculate screen space coordinates [0, 1]
      vec2 screenUv = vScreenPosition.xy / vScreenPosition.w * 0.5 + 0.5;
      
      // 2. Compute refraction offset using lens normals
      // The lens shape curves and warps light
      vec3 normal = normalize(vNormal);
      vec2 refractionOffset = normal.xy * 0.04;
      
      // 3. Magnification effect (zoom in slightly by scaling from center)
      vec2 center = vec2(0.5, 0.5);
      vec2 distToCenter = screenUv - center;
      vec2 magnifiedUv = center + distToCenter * 0.88; // < 1.0 zooms in
      
      // Combine magnification and refraction
      vec2 finalUv = magnifiedUv + refractionOffset;
      
      // 4. Chromatic Aberration (separate RGB channels by shifting UV coordinates)
      float dispersion = 0.012;
      float r = texture2D(uMarqueeSharp, finalUv + vec2(dispersion, 0.0)).r;
      float g = texture2D(uMarqueeSharp, finalUv).g;
      float b = texture2D(uMarqueeSharp, finalUv - vec2(dispersion, 0.0)).b;
      
      vec3 marqueeColor = vec3(r, g, b);
      
      // 5. Enhance Brightness and Contrast inside the lens
      // Brightness boost
      marqueeColor *= 1.4;
      // Contrast adjustment
      marqueeColor = (marqueeColor - 0.5) * 1.25 + 0.5;
      
      // 6. Fresnel glass reflection
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
      
      // Add subtle glass highlight and reflection tint
      vec3 glassReflection = vec3(0.9, 0.95, 1.0) * (fresnel * 0.28 + 0.05);
      
      // 7. Combine results
      vec3 finalColor = mix(marqueeColor, glassReflection, 0.15 + fresnel * 0.2);
      
      // High-performance soft inner shading (vignette) on the lens edge
      float lensEdge = 1.0 - smoothstep(0.44, 0.5, length(vUv - vec2(0.5)));
      finalColor *= (lensEdge * 0.35 + 0.65);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
}
