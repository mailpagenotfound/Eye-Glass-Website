uniform sampler2D uMarqueeSharp;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uMagnification;
uniform float uIOR;
uniform float uDispersion;

// Lens-specific blur strength
uniform float uBlurStrength;

// Curated variant colors passed from JS
uniform vec3 uLensColor;
uniform vec3 uLensGlowColor;
uniform float uLensOpacity;

varying vec2 vUv;
varying vec3 vLocalPosition;
varying vec3 vLocalNormal;
varying vec3 vViewPosition;

uniform vec3 uLocalCameraPos; // Camera position projected in the glasses group space

// Prototypes chromatic function from Chromatic.glsl
vec3 sampleChromatic(sampler2D tex, vec2 uv, vec2 refractionOffset, float dispersion);

// Blurred chromatic aberration sampler inside the lens
vec3 sampleBlurredChromatic(sampler2D tex, vec2 uv, vec2 refractionOffset, float dispersion, float blurStrength) {
  if (blurStrength <= 0.0001) {
    return sampleChromatic(tex, uv, refractionOffset, dispersion);
  }
  
  vec3 sum = vec3(0.0);
  float step = blurStrength;

  sum += sampleChromatic(tex, uv + vec2(-step, -step), refractionOffset, dispersion) * 0.09;
  sum += sampleChromatic(tex, uv + vec2(0.0, -step), refractionOffset, dispersion) * 0.12;
  sum += sampleChromatic(tex, uv + vec2(step, -step), refractionOffset, dispersion) * 0.09;
  
  sum += sampleChromatic(tex, uv + vec2(-step, 0.0), refractionOffset, dispersion) * 0.12;
  sum += sampleChromatic(tex, uv + vec2(0.0, 0.0), refractionOffset, dispersion) * 0.16;
  sum += sampleChromatic(tex, uv + vec2(step, 0.0), refractionOffset, dispersion) * 0.12;
  
  sum += sampleChromatic(tex, uv + vec2(-step, step), refractionOffset, dispersion) * 0.09;
  sum += sampleChromatic(tex, uv + vec2(0.0, step), refractionOffset, dispersion) * 0.12;
  sum += sampleChromatic(tex, uv + vec2(step, step), refractionOffset, dispersion) * 0.09;

  return sum;
}

void main() {
  vec3 normal = normalize(vLocalNormal);
  
  // 1. Ray direction in local coordinates
  vec3 rayDir = normalize(vLocalPosition - uLocalCameraPos);
  
  // 2. Refract the ray in local space
  vec3 refractedDir = refract(rayDir, normal, 1.0 / uIOR);
  if (length(refractedDir) == 0.0) refractedDir = rayDir;
  
  // 3. Intersect refracted ray with local backdrop marquee plane at local z = -4.0
  float planeZ = -4.0;
  float t = (planeZ - vLocalPosition.z) / refractedDir.z;
  vec3 intersectPoint = vLocalPosition + t * refractedDir;
  
  // 4. Map intersection point to local UV coordinates of 16x9 plane centered at (0,0)
  float marqueeWidth = 16.0;
  float marqueeHeight = 9.0;
  vec2 planeUv = vec2(intersectPoint.x / marqueeWidth + 0.5, intersectPoint.y / marqueeHeight + 0.5);
  
  // 5. Apply magnification relative to the local straight intersection point
  vec2 straightUv = vec2(vLocalPosition.x / marqueeWidth + 0.5, vLocalPosition.y / marqueeHeight + 0.5);
  vec2 distToLensCenter = planeUv - straightUv;
  vec2 magnifiedUv = straightUv + distToLensCenter * uMagnification;
  
  // 6. Scroll text horizontally at loop speed 0.0222 (one complete loop every 45s)
  float marqueeSpeed = 0.0222;
  vec2 scrolledMagnifiedUv = vec2(fract(magnifiedUv.x - uTime * marqueeSpeed), magnifiedUv.y);
  
  // 7. Sample the texture using the blurred chromatic aberration logic
  vec2 refractionOffset = normal.xy * (uIOR - 1.0) * 0.25;
  vec3 rawMarquee = sampleBlurredChromatic(uMarqueeSharp, scrolledMagnifiedUv, refractionOffset, uDispersion, uBlurStrength);
  
  // Compute a text presence mask (1.0 where white text is present, 0.0 for background)
  vec3 textMaskColor = vec3(1.0) - rawMarquee;
  float textMask = clamp(textMaskColor.r + textMaskColor.g + textMaskColor.b, 0.0, 1.0);
  
  // Blend a dark luxury glass base with the variant's lens color tint
  vec3 glassBaseColor = mix(vec3(0.04, 0.04, 0.04), uLensColor, uLensOpacity);
  
  // Mix in the white text at full opacity
  vec3 marqueeColor = mix(glassBaseColor, uLensColor * 1.6, textMask);
  
  // 8. Fresnel glass reflections (using local Z normal)
  vec3 viewDir = normalize(vViewPosition);
  float fresnel = pow(1.0 - max(dot(vec3(0.0, 0.0, 1.0), viewDir), 0.0), 3.0);
  vec3 glassReflection = vec3(0.9, 0.95, 1.0) * (fresnel * 0.35 + 0.04);
  
  // Mix in reflections
  vec3 finalColor = mix(marqueeColor, glassReflection, 0.15 + fresnel * 0.25);
  
  // 9. Add subtle outline glow on the lens border based on uLensGlowColor
  float dist = length(vUv - vec2(0.5));
  float edgeGlow = smoothstep(0.45, 0.48, dist) * (1.0 - smoothstep(0.48, 0.5, dist));
  finalColor += uLensGlowColor * edgeGlow * 1.5;
  
  // 10. Soft inner vignette edge shadow
  float lensEdge = 1.0 - smoothstep(0.45, 0.5, dist);
  finalColor *= (lensEdge * 0.3 + 0.7);
  
  // 11. Output with alpha blending (88% opaque glass blocks blurred text behind, 100% opaque text remains sharp)
  gl_FragColor = vec4(finalColor, mix(0.88, 1.0, textMask));
}
