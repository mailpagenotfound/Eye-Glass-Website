import React, { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'

// Custom GPU blur shader for the background marquee plane
const BlurMarqueeShader = {
  uniforms: {
    uTexture: { value: null },
    uBlurStrength: { value: 0.0058 }, // 12px blur at 2048px canvas width
    uBrightness: { value: 0.5 },
    uOpacity: { value: 0.18 }, // 18% opacity for rich text contrast outside lens
    uTime: { value: 0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    uniform float uBlurStrength;
    uniform float uBrightness;
    uniform float uOpacity;
    uniform float uTime;
    varying vec2 vUv;

    void main() {
      // 9-tap blur filter for clean defocus effect
      vec4 sum = vec4(0.0);
      float step = 0.015; // Increased blur step for heavy atmosphere blur
      
      // Speed of marquee scroll (one loop every 45 seconds: 1/45 = 0.0222)
      float speed = 0.0222; 
      vec2 scrolledUv = vec2(fract(vUv.x - uTime * speed), vUv.y);

      sum += texture2D(uTexture, scrolledUv + vec2(-step, -step)) * 0.09;
      sum += texture2D(uTexture, scrolledUv + vec2(0.0, -step)) * 0.12;
      sum += texture2D(uTexture, scrolledUv + vec2(step, -step)) * 0.09;
      
      sum += texture2D(uTexture, scrolledUv + vec2(-step, 0.0)) * 0.12;
      sum += texture2D(uTexture, scrolledUv + vec2(0.0, 0.0)) * 0.16;
      sum += texture2D(uTexture, scrolledUv + vec2(step, 0.0)) * 0.12;
      
      sum += texture2D(uTexture, scrolledUv + vec2(-step, step)) * 0.09;
      sum += texture2D(uTexture, scrolledUv + vec2(0.0, step)) * 0.12;
      sum += texture2D(uTexture, scrolledUv + vec2(step, step)) * 0.09;

      // Since the canvas texture has a white background (1.0) and black text (0.0):
      // sum.r will be 1.0 for the background, and 0.0 for the text.
      // Reduce opacity of background text to 10% to make it a subtle atmosphere
      vec3 textColor = vec3(1.0, 1.0, 1.0);
      float opacity = (1.0 - sum.r) * uOpacity;
      gl_FragColor = vec4(textColor, opacity);
    }
  `
}

function Marquee({ onTextureCreated, hoverState, isReady, lensHovered, scrollProgress }) {
  const canvasRef = useRef(null)
  const textureRef = useRef(null)
  const materialRef = useRef(null)

  // High resolution offscreen canvas for luxury typography
  const canvasWidth = 4096
  const canvasHeight = 1024

  // Initialize offscreen canvas and texture
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    canvasRef.current = canvas

    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Style text: prominent typography, thin weight, wide letter spacing
    ctx.fillStyle = '#000000'
    ctx.font = '200 100px Outfit, Inter, sans-serif'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.letterSpacing = '18px' // Clean, spacious lettering

    ctx.fillText('VISION IS PRECIOUS', canvasWidth / 2, canvasHeight / 2)

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    textureRef.current = texture

    if (onTextureCreated) {
      onTextureCreated(texture)
    }

    if (materialRef.current) {
      materialRef.current.uniforms.uTexture.value = texture
    }

    return () => {
      texture.dispose()
    }
  }, [onTextureCreated])

  // Update uniforms in render loop for continuous scrolling marquee
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime()
    }
  })

  // Hover blur logic: when right lens is hovered, remove blur on background text
  useEffect(() => {
    if (!materialRef.current) return
    const targetBlur = (lensHovered === 'right') ? 0.0 : 0.0058

    gsap.to(materialRef.current.uniforms.uBlurStrength, {
      value: targetBlur,
      duration: 0.6,
      ease: 'power2.out',
      overwrite: 'auto'
    })
  }, [lensHovered])

  // Fade out backdrop text on scroll
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uOpacity.value = 0.18 * Math.max(0.0, 1.0 - (scrollProgress || 0) * 1.8)
    }
  }, [scrollProgress])

  const blurMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(BlurMarqueeShader.uniforms),
      vertexShader: BlurMarqueeShader.vertexShader,
      fragmentShader: BlurMarqueeShader.fragmentShader,
      transparent: true,
      depthWrite: false,
      fog: false,
    })
  }, [])

  // Sync texture on load
  useEffect(() => {
    if (materialRef.current && textureRef.current) {
      materialRef.current.uniforms.uTexture.value = textureRef.current
    }
  }, [blurMaterial])

  return (
    <mesh position={[0, 0, -4.0]}>
      <planeGeometry args={[16, 9]} />
      <primitive ref={materialRef} object={blurMaterial} attach="material" />
    </mesh>
  )
}

export default Marquee
