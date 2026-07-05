import React, { useRef, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import GlassesModel from './GlassesModel'
import Marquee from '../Marquee/Marquee'

const VARIANTS = ['obsidian', 'titanium_edge', 'crystal_heritage', 'aurum_prestige']

function GlassCarousel({
  activeIndex,
  prevIndex,
  direction, // 'next' or 'prev'
  isTransitioning,
  setIsTransitioning,
  marqueeSharpTexture,
  setSharpTexture,
  isReady,
  onHoverGlassesState,
  cameraZRef,
  cameraXOffsetRef,
  cameraYOffsetRef,
  onTextUpdate,
  lensHovered,
  onHoverLens,
  scrollProgress
}) {
  const currentGroupRef = useRef()
  const incomingGroupRef = useRef()
  const sweepLightRef = useRef()
  const { camera } = useThree()
  
  // Local state to keep track of variants during transition
  const [currentVariant, setCurrentVariant] = useState(VARIANTS[activeIndex])
  const [incomingVariant, setIncomingVariant] = useState(VARIANTS[activeIndex])

  // Triggers GSAP transition timeline whenever activeIndex updates
  useEffect(() => {
    if (!isReady || prevIndex === activeIndex) return

    setIsTransitioning(true)
    
    // Set variant representations
    setCurrentVariant(VARIANTS[prevIndex])
    setIncomingVariant(VARIANTS[activeIndex])

    const tl = gsap.timeline({
      onComplete: () => {
        // Finalize transition
        setCurrentVariant(VARIANTS[activeIndex])
        setIsTransitioning(false)
        
        // Reset coordinate groups instantly
        if (currentGroupRef.current) {
          currentGroupRef.current.position.set(0, 0, 0)
          currentGroupRef.current.rotation.set(0, 0, 0)
          currentGroupRef.current.scale.set(1.0, 1.0, 1.0)
        }
        if (incomingGroupRef.current) {
          incomingGroupRef.current.position.set(direction === 'next' ? 4 : -4, 0, -1)
          incomingGroupRef.current.scale.set(0.3, 0.3, 0.3)
        }
      }
    })

    // Cinematic camera pan, zoom and dolly sequence using rig refs
    // Current product rotates slightly (Step 1)
    tl.to(currentGroupRef.current.rotation, {
      y: direction === 'next' ? -0.35 : 0.35,
      x: direction === 'next' ? 0.08 : -0.08,
      duration: 0.45,
      ease: 'power2.out'
    }, 0)

    // Camera moves & lighting changes in parallel (Step 2 & 3)
    if (cameraZRef && cameraXOffsetRef && cameraYOffsetRef) {
      const panDirection = direction === 'next' ? -0.6 : 0.6
      tl.to(cameraXOffsetRef, { current: panDirection, duration: 0.6, ease: 'power2.inOut' }, 0.2)
      tl.to(cameraYOffsetRef, { current: 0.15, duration: 0.6, ease: 'power2.inOut' }, 0.2)
      tl.to(cameraZRef, { current: 5.1, duration: 0.6, ease: 'power2.inOut' }, 0.2)
    }

    // Current product exits (Step 4)
    tl.to(currentGroupRef.current.position, {
      x: direction === 'next' ? -4.5 : 4.5,
      z: -1.8,
      duration: 0.6,
      ease: 'power3.in'
    }, 0.4)
    tl.to(currentGroupRef.current.scale, {
      x: 0.3, y: 0.3, z: 0.3,
      duration: 0.6,
      ease: 'power3.in'
    }, 0.4)

    // Next product enters (Step 5)
    if (incomingGroupRef.current) {
      incomingGroupRef.current.position.set(direction === 'next' ? 4.5 : -4.5, 0, -1.8)
      incomingGroupRef.current.scale.set(0.3, 0.3, 0.3)
      incomingGroupRef.current.rotation.set(direction === 'next' ? -0.08 : 0.08, direction === 'next' ? 0.6 : -0.6, 0)
    }

    tl.to(incomingGroupRef.current.position, {
      x: 0,
      z: 0,
      duration: 0.75,
      ease: 'power3.out'
    }, 0.8)
    tl.to(incomingGroupRef.current.rotation, {
      x: 0,
      y: 0,
      z: 0,
      duration: 0.75,
      ease: 'power3.out'
    }, 0.8)
    tl.to(incomingGroupRef.current.scale, {
      x: 1.0, y: 1.0, z: 1.0,
      duration: 0.75,
      ease: 'power3.out'
    }, 0.8)

    // Sweep reflection sweep (Step 6)
    if (sweepLightRef.current) {
      tl.fromTo(sweepLightRef.current,
        { intensity: 0 },
        { intensity: 1.8, duration: 0.3, ease: 'power2.in' },
        0.9
      )
      tl.to(sweepLightRef.current.position, {
        x: direction === 'next' ? 3.5 : -3.5,
        duration: 0.8,
        ease: 'power2.inOut'
      }, 0.9)
      tl.to(sweepLightRef.current, {
        intensity: 0.0,
        duration: 0.4,
        ease: 'power2.out'
      }, 1.2)
    }

    // Headline, price, description update callback (Step 7)
    tl.call(() => {
      if (onTextUpdate) {
        onTextUpdate(activeIndex)
      }
    }, null, 0.95)

    // Camera settles (Step 8)
    if (cameraZRef && cameraXOffsetRef && cameraYOffsetRef) {
      tl.to(cameraXOffsetRef, { current: 0.0, duration: 0.6, ease: 'power2.out' }, 1.3)
      tl.to(cameraYOffsetRef, { current: 0.0, duration: 0.6, ease: 'power2.out' }, 1.3)
      tl.to(cameraZRef, { current: 5.0, duration: 0.6, ease: 'power2.out' }, 1.3)
    }

  }, [activeIndex, prevIndex, direction, isReady, setIsTransitioning, camera, cameraZRef, cameraXOffsetRef, cameraYOffsetRef, onTextUpdate])

  // Trigger hover reflection sweep when right lens is hovered
  useEffect(() => {
    if (lensHovered === 'right' && sweepLightRef.current) {
      // Reset position to start sweep
      sweepLightRef.current.position.set(-3.5, 0.5, 1.2)
      sweepLightRef.current.intensity = 0.0

      const tl = gsap.timeline()
      tl.to(sweepLightRef.current, {
        intensity: 2.5,
        duration: 0.15,
        ease: 'power2.in'
      })
      tl.to(sweepLightRef.current.position, {
        x: 3.5,
        duration: 0.5,
        ease: 'power1.inOut'
      }, 0)
      tl.to(sweepLightRef.current, {
        intensity: 0.0,
        duration: 0.35,
        ease: 'power2.out'
      }, 0.15)
    }
  }, [lensHovered])

  // Mouse vector interpolation target values
  const mouseTargetRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseTargetRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseTargetRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Floating breathing and pointer tracking loop
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    // Constant slow float: position.y (0 -> 4px -> 0 equivalent to ~0.02 units)
    const floatAmplitude = 0.02
    const floatFrequency = (2 * Math.PI) / 8.0 // 8s loop duration
    const idleY = Math.sin(time * floatFrequency) * floatAmplitude

    // Rotation float: Y-rotation -1 to +1 deg (~0.0175 rad)
    const rotAmplitude = 0.0175
    const rotFrequency = (2 * Math.PI) / 8.0 // 8s loop duration
    const idleRotY = Math.sin(time * rotFrequency) * rotAmplitude

    // Pointer limit tracking (max 5 deg = 0.087 rad)
    const maxMouseRotX = 0.087
    const maxMouseRotY = 0.087
    const targetRotX = mouseTargetRef.current.y * maxMouseRotX
    const targetRotY = mouseTargetRef.current.x * maxMouseRotY

    // Apply smooth tracking to active group
    if (currentGroupRef.current && !isTransitioning) {
      currentGroupRef.current.rotation.x = THREE.MathUtils.lerp(currentGroupRef.current.rotation.x, targetRotX, 0.06)
      
      // Add scroll progress rotation: rotate up to 180 degrees (Math.PI) as user scrolls
      const scrollRotY = (scrollProgress || 0) * Math.PI
      currentGroupRef.current.rotation.y = THREE.MathUtils.lerp(currentGroupRef.current.rotation.y, targetRotY + idleRotY + scrollRotY, 0.06)
      
      currentGroupRef.current.position.y = THREE.MathUtils.lerp(currentGroupRef.current.position.y, idleY + 0.55, 0.06)
      
      // Zoom closer slightly by scaling as user scrolls: scale goes from 1.0 to 1.15
      const zoomScale = 1.0 + (scrollProgress || 0) * 0.15
      currentGroupRef.current.scale.set(zoomScale, zoomScale, zoomScale)
    }
  })

  return (
    <group 
      dispose={null}
      onPointerOver={() => onHoverGlassesState('glasses')}
      onPointerOut={() => onHoverGlassesState('hero')}
    >
      {/* Sweep reflection point light */}
      {isReady && (
        <pointLight
          ref={sweepLightRef}
          position={[-4.0, 1.0, 1.5]}
          intensity={0.0}
          color="#FFFFFF"
          distance={5}
          decay={2}
        />
      )}

      {/* Primary active glasses group */}
      <group ref={currentGroupRef}>
        <GlassesModel
          variant={currentVariant}
          marqueeSharpTexture={marqueeSharpTexture}
          isReady={isReady}
          lensHovered={lensHovered}
          onHoverLens={onHoverLens}
        />
        <Marquee
          onTextureCreated={setSharpTexture}
          hoverState={null}
          isReady={isReady}
          lensHovered={lensHovered}
          scrollProgress={scrollProgress}
        />
      </group>

      {/* Secondary incoming glasses group (only visible or active during slide transition) */}
      <group ref={incomingGroupRef} position={[4.0, 0, -1.0]} scale={[0.4, 0.4, 0.4]}>
        {isTransitioning && (
          <GlassesModel
            variant={incomingVariant}
            marqueeSharpTexture={marqueeSharpTexture}
            isReady={isReady}
            lensHovered={lensHovered}
            onHoverLens={onHoverLens}
          />
        )}
      </group>
    </group>
  )
}

export default GlassCarousel
export { VARIANTS }
