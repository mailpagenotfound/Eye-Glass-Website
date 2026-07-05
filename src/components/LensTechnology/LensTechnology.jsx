import React, { useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { LensTechShader } from '../../shaders/LensTechShader'

import { useInView } from '../../hooks/useInView'
import { useCallback } from 'react'

gsap.registerPlugin(ScrollTrigger)

// Single lens layer mesh using the custom iridescent scanning shader
function TechLensLayer({ index, progress, color, sheenStrength }) {
  const meshRef = useRef()

  // Create a separate shader material instance for each layer to allow distinct uniforms
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(LensTechShader.uniforms),
      vertexShader: LensTechShader.vertexShader,
      fragmentShader: LensTechShader.fragmentShader,
      transparent: true,
      depthWrite: false, // Transparent overlay layering
      blending: THREE.AdditiveBlending,
    })
  }, [])

  // Initialize static uniforms
  useEffect(() => {
    shaderMaterial.uniforms.uColor.value = new THREE.Color(color)
    shaderMaterial.uniforms.uSheenStrength.value = sheenStrength
    shaderMaterial.uniforms.uLayerIndex.value = index
  }, [color, sheenStrength, index, shaderMaterial])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    shaderMaterial.uniforms.uTime.value = time

    if (meshRef.current) {
      // Stack separation logic along the Z-axis
      // As progress goes 0 -> 1, separate them by 0.65 units
      const baseZ = (index - 2) * 0.75 * progress
      meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, baseZ, 0.1)

      // Add soft individual floating rotations
      meshRef.current.rotation.y = Math.sin(time * 0.5 + index) * 0.05
      meshRef.current.rotation.x = Math.cos(time * 0.4 + index) * 0.03
    }
  })

  return (
    <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[1.5, 1.5, 0.015, 64]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  )
}

// Rig to control overall group rotation and camera dolly through the lenses
function TechSceneRig({ progress, layers }) {
  const groupRef = useRef()

  useFrame((state) => {
    if (!groupRef.current) return
    const time = state.clock.getElapsedTime()

    // Slow rotate group
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y, 
      -0.45 + progress * 0.9, // Rotate from angled to front/side angle
      0.1
    )

    // Dolly camera inside the lens stack when progress is high
    // Zoom from z=4 to z=0.5 (goes inside the first few layers!)
    const targetCamZ = 4.2 - progress * 2.8
    const targetCamY = progress * 0.15
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetCamZ, 0.1)
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetCamY, 0.1)
    state.camera.lookAt(0, 0, 0)
  })

  return (
    <group ref={groupRef}>
      {layers.map((layer, idx) => (
        <TechLensLayer
          key={layer.name}
          index={idx}
          progress={progress}
          color={layer.color}
          sheenStrength={layer.sheen}
        />
      ))}
    </group>
  )
}

function LensTechnology() {
  const [containerNode, setContainerNode] = useState(null)
  const containerRef = useRef(null)
  const [inViewRef, inView] = useInView()
  const [scrollProgress, setScrollProgress] = useState(0)

  const setRefs = useCallback((node) => {
    if (node) {
      containerRef.current = node
      setContainerNode(node)
    }
    inViewRef.current = node
  }, [inViewRef])

  // Technical data for the 5 layers, including colors and side positions for labels
  const layers = useMemo(() => [
    {
      name: '1. Nano Coating',
      color: '#ff69b4', // Pink sheen
      sheen: 0.6,
      desc: 'Hydrophobic and anti-smudge shield repelling moisture, oils, and fingerprints.',
      side: 'left',
      activeRange: [0.15, 0.45]
    },
    {
      name: '2. Blue Light Shield',
      color: '#3b82f6', // Cobalt blue
      sheen: 0.8,
      desc: 'Precision HEV filter absorbing high-energy screen frequencies (400-450nm).',
      side: 'right',
      activeRange: [0.35, 0.65]
    },
    {
      name: '3. Polarized Core',
      color: '#10b981', // Emerald green
      sheen: 0.5,
      desc: 'Micro-grid polarization core filtering horizontal light waves to eliminate glare.',
      side: 'left',
      activeRange: [0.5, 0.8]
    },
    {
      name: '4. UV 400 Protection',
      color: '#f59e0b', // Amber gold
      sheen: 0.7,
      desc: 'Electromagnetic block absorbing 100% of UVA and UVB solar radiation.',
      side: 'right',
      activeRange: [0.65, 0.95]
    },
    {
      name: '5. Scratch Barrier',
      color: '#FFFFFF', // High-reflection white
      sheen: 0.3,
      desc: 'Diamond-hard carbon polymer layer preventing micro-abrasions from contact.',
      side: 'left',
      activeRange: [0.8, 1.0]
    }
  ], [])

  useEffect(() => {
    const container = containerNode
    if (!container) return

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: '+=2000',
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        setScrollProgress(self.progress)
      }
    })

    // Recalculate pinning locations immediately once Canvas renders
    ScrollTrigger.refresh()

    return () => {
      trigger.kill()
    }
  }, [containerNode])

  // Check if a layer label should fade in based on current scroll position
  const isLabelActive = (range) => {
    return scrollProgress >= range[0] && scrollProgress <= range[1]
  }

  // Calculate parallax offset for elegant editorial transitions
  const getParallaxStyle = (progress) => {
    const yOffset = (0.5 - progress) * -85 
    return {
      transform: `translateY(${yOffset}px)`,
      transition: 'transform 0.1s ease-out'
    }
  }

  return (
    <section
      ref={setRefs}
      id="lens-tech"
      style={{
        height: '100vh',
        width: '100vw',
        position: 'relative',
        backgroundColor: '#0F0F0F',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}
    >
      {/* 3D WebGL Canvas containing the lens stack */}
      <div 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          zIndex: 2,
          opacity: 1
        }}
      >
        {inView ? (
          <Canvas 
            dpr={[1, 2]} 
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} 
            camera={{ position: [0, 0, 4.2], fov: 45 }}
          >
            <directionalLight position={[2, 4, 3]} intensity={1.5} />
            <pointLight position={[-3, -3, -2]} intensity={0.5} />
            <Environment preset="studio" />
            <TechSceneRig progress={scrollProgress} layers={layers} />
          </Canvas>
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: '#0F0F0F' }} />
        )}
      </div>

      {/* HTML Overlays - Title & Description */}
      <div
        className="container"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px 0',
          pointerEvents: 'none',
          ...getParallaxStyle(scrollProgress)
        }}
      >
        {/* Top Header */}
        <div style={{ maxWidth: '400px' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D7B46A' }}>
            OPTICS
          </span>
          <h2 className="h-medium" style={{ margin: '5px 0 0 0', fontWeight: 100, color: '#FFFFFF' }}>
            LENS TECHNOLOGY
          </h2>
        </div>

        {/* Dynamic Side Labels */}
        <div style={{ position: 'relative', width: '100%', height: '60%' }}>
          {layers.map((layer, idx) => {
            const active = isLabelActive(layer.activeRange)
            const isLeft = layer.side === 'left'

            return (
              <div
                key={layer.name}
                style={{
                  position: 'absolute',
                  top: `${15 + idx * 16}%`,
                  left: isLeft ? '0' : 'auto',
                  right: isLeft ? 'auto' : '0',
                  width: '320px',
                  opacity: active ? 1 : 0,
                  transform: `translateX(${active ? 0 : (isLeft ? -30 : 30)}px)`,
                  transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  pointerEvents: 'all'
                }}
              >
                <div 
                  className="glass-panel" 
                  style={{ 
                    padding: '16px 20px', 
                    backgroundColor: 'rgba(5, 5, 5, 0.85)',
                    borderLeft: isLeft ? '3px solid #D7B46A' : 'none',
                    borderRight: !isLeft ? '3px solid #D7B46A' : 'none',
                  }}
                >
                  <h4 style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '0.85rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: layer.color,
                    marginBottom: '5px'
                  }}>
                    {layer.name}
                  </h4>
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.75rem',
                    lineHeight: '1.5',
                    color: '#C8C8C8',
                    margin: 0
                  }}>
                    {layer.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom indicator */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: '0.7rem', letterSpacing: '0.15em', opacity: 0.4, color: '#FFFFFF' }}>
            CAMERA DOLLEYS THROUGH THE LENSES ON SCROLL
          </span>
        </div>
      </div>
    </section>
  )
}

export default React.memo(LensTechnology)
