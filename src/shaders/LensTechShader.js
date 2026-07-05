export const LensTechShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: [0.2, 0.4, 1.0] }, // Color signature of the layer
    uSheenStrength: { value: 0.5 },
    uLayerIndex: { value: 0.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uSheenStrength;
    uniform float uLayerIndex;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;

    // Iridescent spectrum approximation
    vec3 spectralColor(float w) {
      // Input w represents wavelength, map it to RGB channels
      vec3 color = vec3(0.0);
      color.r = smoothstep(0.4, 0.6, w) * (1.0 - smoothstep(0.7, 0.8, w));
      color.g = smoothstep(0.2, 0.5, w) * (1.0 - smoothstep(0.6, 0.7, w));
      color.b = smoothstep(0.0, 0.3, w) * (1.0 - smoothstep(0.4, 0.5, w));
      return color;
    }

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
      // Fresnel effect
      float ndotv = max(dot(normal, viewDir), 0.0);
      float fresnel = pow(1.0 - ndotv, 4.0);
      
      // Create iridescent sheen based on fresnel and coordinate position
      float wave = sin(vWorldPosition.x * 2.0 + vWorldPosition.y * 2.0 + uTime * 1.5 + uLayerIndex * 2.0) * 0.5 + 0.5;
      float wavelength = mix(0.1, 0.9, fract(ndotv * 1.8 + wave * 0.3));
      vec3 iridescence = spectralColor(wavelength) * uSheenStrength;
      
      // Combine base layer signature color and iridescent sheen
      vec3 baseColor = mix(uColor, iridescence, 0.4);
      
      // Volumetric sweep reflection line
      float sweep = smoothstep(0.1, 0.12, abs(sin(vUv.y * 3.14 - uTime * 0.6 + uLayerIndex * 0.5)));
      float sweepReflection = (1.0 - sweep) * 0.3;
      
      // Final compositing
      vec3 finalRGB = baseColor + vec3(sweepReflection) + vec3(fresnel * 0.5);
      
      // Adjust alpha transparency: edges are more visible (Fresnel), scanning sweep glows
      float alpha = mix(0.12, 0.75, fresnel) + sweepReflection * 0.5;
      
      // Soft circular mask to blend the lens smoothly
      float distFromCenter = length(vUv - vec2(0.5));
      float circleMask = 1.0 - smoothstep(0.43, 0.5, distFromCenter);
      
      gl_FragColor = vec4(finalRGB, alpha * circleMask);
    }
  `
}
