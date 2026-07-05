import * as THREE from 'three'

// Import GLSL strings using Vite's ?raw syntax
import refractionVertex from '../../shaders/LensRefraction.glsl?raw'
import chromaticHelper from '../../shaders/Chromatic.glsl?raw'
import blurRevealFragment from '../../shaders/BlurReveal.glsl?raw'

export const createLensMaterial = (marqueeSharpTexture) => {
  const composedFragment = chromaticHelper + '\n' + blurRevealFragment

  return new THREE.ShaderMaterial({
    uniforms: {
      uMarqueeSharp: { value: marqueeSharpTexture },
      uTime: { value: 0 },
      uMouse: { value: [0, 0] },
      uResolution: { value: [window.innerWidth, window.innerHeight] },
      uMagnification: { value: 0.85 }, // Slight zoom magnification inside the lens
      uIOR: { value: 1.18 }, // Index of refraction
      uDispersion: { value: 0.015 }, // Chromatic dispersion amount
    },
    vertexShader: refractionVertex,
    fragmentShader: composedFragment,
    transparent: true,
    depthWrite: true,
  })
}
