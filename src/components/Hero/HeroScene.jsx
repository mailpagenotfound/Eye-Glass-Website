import React, { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, Noise, DepthOfField } from '@react-three/postprocessing'
import * as THREE from 'three'
import gsap from 'gsap'
import Marquee from '../Marquee/Marquee'
import GlassCarousel, { VARIANTS } from '../GlassCarousel/GlassCarousel'
import { useIsMobile } from '../../hooks/useIsMobile'

const CAMERA_PRESETS = [
  { z: 4.4, xOffset: 0.0, yOffset: 0.0, rotationY: -0.15, rotationX: 0.04, lookAtX: 0.0, lookAtY: 0.0 }, // Obsidian Noir: straight-on luxury view
  { z: 4.6, xOffset: -0.25, yOffset: 0.12, rotationY: 0.18, rotationX: -0.05, lookAtX: -0.25, lookAtY: 0.12 }, // Titanium Edge: minimal industrial profile
  { z: 5.0, xOffset: 0.0, yOffset: 0.0, rotationY: 0.0, rotationX: 0.0, lookAtX: 0.0, lookAtY: 0.0 }, // Crystal Heritage: centered luxury exhibition view
  { z: 4.5, xOffset: 0.0, yOffset: 0.18, rotationY: 0.12, rotationX: -0.06, lookAtX: 0.0, lookAtY: 0.18 } // Aurum Prestige: warm cinematic perspective
]

const CONTRAST_SETTINGS = [
  {
    spotColor: '#FFEAA7', // Warm ivory studio lighting
    ambientIntensity: 0.5,
    directionalIntensity: 2.2,
    spotIntensity: 4.5,
    fogColor: '#0A0A0A'
  },
  {
    spotColor: '#81ECEC', // Cool grey HDR environment
    ambientIntensity: 0.35,
    directionalIntensity: 2.6,
    spotIntensity: 3.8,
    fogColor: '#0B0F19'
  },
  {
    spotColor: '#FFFFFF', // Frosted premium white lighting
    ambientIntensity: 0.6,
    directionalIntensity: 1.8,
    spotIntensity: 4.5,
    fogColor: '#0F0F10'
  },
  {
    spotColor: '#E17055', // Warm cinematic amber lighting
    ambientIntensity: 0.4,
    directionalIntensity: 2.4,
    spotIntensity: 5.0,
    fogColor: '#0F0A05'
  }
]

// 1. Camera Breathing, Dolly, and Rotation Rig
function CameraRig({ cameraZRef, cameraXOffsetRef, cameraYOffsetRef, activeIndex, isReady, scrollProgress = 0 }) {
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    // Smooth handheld breathing sways
    const breatheX = Math.sin(time * 0.42) * 0.03
    const breatheY = Math.cos(time * 0.42) * 0.02
    const breatheZ = Math.sin(time * 0.22) * 0.04

    const preset = CAMERA_PRESETS[activeIndex] || CAMERA_PRESETS[0]

    // Target position combines preset offsets, breathing drift, and GSAP slide panning coordinates
    const targetX = preset.xOffset + breatheX + (cameraXOffsetRef?.current || 0.0)
    const targetY = preset.yOffset + breatheY + (cameraYOffsetRef?.current || 0.0)
    
    // We add difference of (cameraZRef.current - 5.0) to follow opening sequence zooms
    // And dolly in by 0.65 units as scroll progress goes 0 -> 1
    const targetZ = preset.z + breatheZ + ((cameraZRef?.current || 5.0) - 5.0) - scrollProgress * 0.65

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.05)
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.05)
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.05)

    // Smoothly pan camera lookAt coordinates
    const lookX = THREE.MathUtils.lerp(0.0, preset.lookAtX, 0.05)
    const lookY = THREE.MathUtils.lerp(0.0, preset.lookAtY, 0.05)
    state.camera.lookAt(lookX, lookY, 0)
  })
  return null
}

// 2. Mouse spotlight follower for dynamic glass reflection sweeps
function PointerReflectionLight() {
  const lightRef = useRef()

  useFrame((state) => {
    if (!lightRef.current) return
    lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, state.pointer.x * 2.8, 0.06)
    lightRef.current.position.y = THREE.MathUtils.lerp(lightRef.current.position.y, state.pointer.y * 1.8, 0.06)
  })

  return (
    <pointLight
      ref={lightRef}
      position={[0, 0, 2.0]}
      intensity={0.35}
      color="#FFFFFF"
      distance={5}
      decay={2}
    />
  )
}

function HeroScene({
  activeIndex,
  prevIndex,
  direction,
  isTransitioning,
  setIsTransitioning,
  hoverState,
  onHoverGlassesState,
  isReady,
  onTimelineComplete,
  onTextUpdate,
  lensHovered,
  onHoverLens,
  scrollProgress
}) {
  const isMobile = useIsMobile()
  const [sharpTexture, setSharpTexture] = useState(null)
  const [fogColor, setFogColor] = useState('#0A0A0A')

  // Camera distance state (dollying-in on page load from 7.5 to 4.3)
  const cameraZRef = useRef(7.5)
  const cameraXOffsetRef = useRef(0.0)
  const cameraYOffsetRef = useRef(0.0)
  
  // Lights
  const ambientLightRef = useRef()
  const directionalLightRef = useRef()
  const spotLightRef = useRef()
  const fillLightRef = useRef()

  // Opening staggered timeline sequence
  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        onTimelineComplete()
      }
    })

    // 1.0s: Camera zooms/focuses reveal (Z 7.5 -> 5.0)
    tl.to(cameraZRef, {
      current: 5.0,
      duration: 1.5,
      ease: 'power3.out'
    }, 1.0)

    // 1.5s: Studio Lights turn on
    tl.to([
      ambientLightRef,
      directionalLightRef,
      spotLightRef,
      fillLightRef
    ], {
      onUpdate: function () {
        const progress = this.progress()
        const setting = CONTRAST_SETTINGS[activeIndex] || CONTRAST_SETTINGS[0]
        if (ambientLightRef.current) ambientLightRef.current.intensity = setting.ambientIntensity * progress
        if (directionalLightRef.current) directionalLightRef.current.intensity = setting.directionalIntensity * progress
        if (spotLightRef.current) spotLightRef.current.intensity = setting.spotIntensity * progress
        if (fillLightRef.current) fillLightRef.current.intensity = 0.6 * progress
      },
      duration: 1.2,
      ease: 'power2.inOut'
    }, 1.3)

  }, [onTimelineComplete])

  // Transition Between Products: Dynamic lighting and reflections color change
  useEffect(() => {
    if (!isReady || !spotLightRef.current) return

    const setting = CONTRAST_SETTINGS[activeIndex] || CONTRAST_SETTINGS[0]
    setFogColor(setting.fogColor)

    // Animate spotlight color and intensities to match active preset settings
    gsap.to(spotLightRef.current.color, {
      r: new THREE.Color(setting.spotColor).r,
      g: new THREE.Color(setting.spotColor).g,
      b: new THREE.Color(setting.spotColor).b,
      duration: 1.2,
      ease: 'power2.out'
    })

    gsap.to(spotLightRef.current, {
      intensity: setting.spotIntensity,
      duration: 1.2,
      ease: 'power2.out'
    })

    gsap.to(ambientLightRef.current, {
      intensity: setting.ambientIntensity,
      duration: 1.2,
      ease: 'power2.out'
    })

    gsap.to(directionalLightRef.current, {
      intensity: setting.directionalIntensity,
      duration: 1.2,
      ease: 'power2.out'
    })

  }, [activeIndex, isReady])

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0, 7.5], fov: 45 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
        zIndex: 2,
        opacity: Math.max(0, 1.0 - (scrollProgress || 0) * 1.5),
        transition: 'opacity 0.15s ease-out'
      }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.shadowMap.type = THREE.PCFSoftShadowMap
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.0
      }}
    >
      {/* Lights structure */}
      <ambientLight ref={ambientLightRef} intensity={0} />
      
      <directionalLight
        ref={directionalLightRef}
        position={[4, 6, 3]}
        intensity={0}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />

      <spotLight
        ref={spotLightRef}
        position={[0, 4, -4]}
        intensity={0}
        angle={0.65}
        penumbra={1.0}
        color="#D7B46A" // Base gold rim
      />

      <pointLight ref={fillLightRef} position={[-4, -2, 2]} intensity={0} color="#FFFFFF" />

      {/* Mouse pointer highlight sweep */}
      {isReady && <PointerReflectionLight />}

      {/* Environment preset reflections */}
      <Environment preset="studio" />
      <fog attach="fog" args={[fogColor, 3, 10]} />

      {/* 3D Eyeglass Carousel center piece */}
      <GlassCarousel
        activeIndex={activeIndex}
        prevIndex={prevIndex}
        direction={direction}
        isTransitioning={isTransitioning}
        setIsTransitioning={setIsTransitioning}
        marqueeSharpTexture={sharpTexture}
        setSharpTexture={setSharpTexture}
        isReady={isReady}
        onHoverGlassesState={onHoverGlassesState}
        cameraZRef={cameraZRef}
        cameraXOffsetRef={cameraXOffsetRef}
        cameraYOffsetRef={cameraYOffsetRef}
        onTextUpdate={onTextUpdate}
        lensHovered={lensHovered}
        onHoverLens={onHoverLens}
        scrollProgress={scrollProgress}
      />

      {/* Handheld breathing camera control */}
      <CameraRig 
        cameraZRef={cameraZRef} 
        cameraXOffsetRef={cameraXOffsetRef} 
        cameraYOffsetRef={cameraYOffsetRef} 
        activeIndex={activeIndex} 
        isReady={isReady} 
        scrollProgress={scrollProgress}
      />

      {/* Post Processing Passes */}
      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0.8} intensity={0.4} />
        <Vignette offset={0.55} darkness={0.65} />
        {!isMobile && <Noise opacity={0.015} />}
        {!isMobile && <DepthOfField focusDistance={3.0} focalLength={0.045} bokehScale={1.5} />}
      </EffectComposer>
    </Canvas>
  )
}

export default HeroScene
