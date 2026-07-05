// Chromatic dispersion and spectral aberration sampler function
vec3 sampleChromatic(sampler2D tex, vec2 uv, vec2 refractionOffset, float dispersion) {
  // Disperse channels: red, green, and blue are shifted by different ratios of the refraction offset
  float r = texture2D(tex, uv + refractionOffset * (1.0 + dispersion * 1.5)).r;
  float g = texture2D(tex, uv + refractionOffset).g;
  float b = texture2D(tex, uv + refractionOffset * (1.0 - dispersion * 1.5)).b;
  
  return vec3(r, g, b);
}
