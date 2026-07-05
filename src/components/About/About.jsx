import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Eyeglass from '../Eyeglass/Eyeglass'

import { useInView } from '../../hooks/useInView'

gsap.registerPlugin(ScrollTrigger)

// R3F scene inside the About Section for close-up highlights
function AboutScene({ progress }) {
  const groupRef = useRef()

  // Slowly rotate and shift position based on scroll progress
  useFrame((state) => {
    if (!groupRef.current) return
    const time = state.clock.getElapsedTime()
    
    // As progress goes 0 -> 1, rotate the glass to show different facets
    const baseRotY = Math.PI * 0.5 * progress // Rotate 90 deg
    const baseRotX = Math.PI * 0.1 * progress // Rotate slightly down
    const basePosZ = progress * 0.8 // Zoom closer

    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, baseRotY + Math.sin(time * 0.5) * 0.05, 0.1)
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, baseRotX + Math.cos(time * 0.5) * 0.02, 0.1)
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, basePosZ, 0.1)
    
    // Float breathing
    groupRef.current.position.y = Math.sin(time) * 0.04
  })

  return (
    <group ref={groupRef} position={[0.6, 0, 0]} scale={[0.95, 0.95, 0.95]}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 4]} intensity={2.0} castShadow />
      <spotLight position={[-4, 4, -2]} intensity={2.5} color="#D7B46A" />
      <Environment preset="studio" />
      <Eyeglass color="black" />
    </group>
  )
}

function About() {
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

  // Callouts data and coordinates (mapped in CSS/DOM overlays)
  const callouts = [
    {
      id: 'acetate',
      title: 'Premium Acetate',
      desc: 'Japanese hand-polished cellulose acetate for high-luster finish.',
      targetX: '53%',
      targetY: '48%',
      cardStyle: { left: '-280px', top: '-110px' },
      linePath: 'M -40,-75 L -15,-75 L 0,0',
      showAt: [0.05, 0.4],
      side: 'left'
    },
    {
      id: 'titanium',
      title: 'Titanium Hinge',
      desc: 'Engineered multi-barrel titanium hinges for robust flexibility.',
      targetX: '75%',
      targetY: '46%',
      cardStyle: { left: '40px', top: '-110px' },
      linePath: 'M 40,-75 L 15,-75 L 0,0',
      showAt: [0.3, 0.65],
      side: 'right'
    },
    {
      id: 'polarized',
      title: 'Polarized Lenses',
      desc: 'Precision optical transmission with glare-filtering layers.',
      targetX: '48%',
      targetY: '52%',
      cardStyle: { left: '-280px', top: '40px' },
      linePath: 'M -40,75 L -15,75 L 0,0',
      showAt: [0.55, 0.85],
      side: 'left'
    },
    {
      id: 'protection',
      title: 'UV Protection',
      desc: '100% block against UVA/UVB wavelengths up to 400nm.',
      targetX: '65%',
      targetY: '54%',
      cardStyle: { left: '40px', top: '40px' },
      linePath: 'M 40,75 L 15,75 L 0,0',
      showAt: [0.75, 1.0],
      side: 'right'
    }
  ]

  useEffect(() => {
    const section = containerNode
    if (!section) return

    // Scroll trigger setup to pin the container and evaluate progress
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=2000',
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        setScrollProgress(self.progress)
      }
    })

    // Refresh triggers to compute offset positions accurately
    ScrollTrigger.refresh()

    return () => {
      trigger.kill()
    }
  }, [containerNode])

  // Check if a callout should be active based on current scroll position
  const isCalloutActive = (showAt) => {
    return scrollProgress >= showAt[0] && scrollProgress <= showAt[1]
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
      id="collection"
      style={{
        height: '100vh',
        width: '100vw',
        position: 'relative',
        backgroundColor: '#0A0A0A',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}
    >
      <div 
        className="container"
        style={{
          width: '100%',
          height: '100%',
          display: 'grid',
          gridTemplateColumns: '400px 1fr',
          alignItems: 'center',
          position: 'relative',
          zIndex: 3,
          boxSizing: 'border-box'
        }}
      >
        {/* Left Column: Narrative texts with smooth parallax drift */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '30px', 
          pointerEvents: 'none',
          ...getParallaxStyle(scrollProgress)
        }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D7B46A' }}>
            THE COLLECTION
          </span>
          <h2 className="h-medium" style={{ margin: 0, fontWeight: 100, color: '#FFF' }}>
            CRAFTED WITH PRECISION
          </h2>
          <p className="p-editorial" style={{ margin: 0, color: '#C8C8C8' }}>
            Every curve and contour is engineered for structural equilibrium and extreme facial symmetry. Bridging Apple's hardware simplicity, Gentle Monster's avant-garde eyewear frames, and Porsche Design's high-octane engineering.
          </p>
          <div style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 200, color: '#D7B46A' }}>0.01mm</h3>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FFF', opacity: 0.5, marginTop: '5px' }}>
                Hinge Tolerances
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 200, color: '#D7B46A' }}>100%</h3>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FFF', opacity: 0.5, marginTop: '5px' }}>
                UV block
              </p>
            </div>
          </div>
        </div>

        {/* Center/Right Column: 3D Close up Model with overlays */}
        <div style={{ 
          position: 'relative', 
          height: '100%', 
          width: '100%',
          opacity: 1
        }}>
          {inView ? (
            <Canvas 
              dpr={[1, 2]} 
              camera={{ position: [0, 0, 5.0], fov: 40 }} 
              gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            >
              <AboutScene progress={scrollProgress} />
            </Canvas>
          ) : (
            <div style={{ width: '100%', height: '100%', backgroundColor: '#0A0A0A' }} />
          )}

          {/* Render the callouts on top of WebGL */}
          {callouts.map((callout) => {
            const active = isCalloutActive(callout.showAt)
            return (
              <div
                key={callout.id}
                style={{
                  position: 'absolute',
                  top: callout.targetY,
                  left: callout.targetX,
                  opacity: active ? 1 : 0,
                  transform: `translateY(${active ? 0 : 20}px)`,
                  transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  zIndex: 10,
                  pointerEvents: 'none'
                }}
              >
                {/* Connecting SVG Line */}
                <svg
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '1px',
                    height: '1px',
                    overflow: 'visible'
                  }}
                >
                  <path
                    d={callout.linePath}
                    fill="none"
                    stroke="#D7B46A"
                    strokeWidth="1.5"
                    strokeDasharray={active ? '0' : '400'}
                    style={{
                      transition: 'stroke-dasharray 1s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  />
                  <circle
                    cx="0"
                    cy="0"
                    r="4"
                    fill="#D7B46A"
                    style={{
                      opacity: active ? 1 : 0,
                      transition: 'opacity 0.4s'
                    }}
                  />
                </svg>

                {/* Callout Info box */}
                <div 
                  className="glass-panel" 
                  style={{ 
                    position: 'absolute',
                    ...callout.cardStyle,
                    width: '240px',
                    padding: '16px 20px', 
                    borderLeft: callout.side === 'left' ? '3px solid #D7B46A' : 'none',
                    borderRight: callout.side === 'right' ? '3px solid #D7B46A' : 'none',
                    backgroundColor: 'rgba(5, 5, 5, 0.85)',
                    pointerEvents: 'all'
                  }}
                >
                  <h4 style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '0.85rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#FFF',
                    marginBottom: '5px'
                  }}>
                    {callout.title}
                  </h4>
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.75rem',
                    lineHeight: '1.4',
                    color: '#C8C8C8',
                    margin: 0
                  }}>
                    {callout.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default React.memo(About)
