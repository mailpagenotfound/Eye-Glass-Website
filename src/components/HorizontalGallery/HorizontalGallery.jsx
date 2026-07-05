import React, { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Eyeglass from '../Eyeglass/Eyeglass'

gsap.registerPlugin(ScrollTrigger)

// R3F scene inside each product gallery slide
function GalleryScene({ colorVariant, isHovered }) {
  const modelRef = useRef()

  useFrame((state) => {
    if (!modelRef.current) return
    const time = state.clock.getElapsedTime()

    // Base floating animation
    let targetY = Math.sin(time * 0.7) * 0.05
    let targetScale = 0.85
    let targetRotY = time * 0.15 // Slow auto-spin

    // Hover response: lift, scale, and rotate slightly
    if (isHovered) {
      targetY += 0.15
      targetScale = 0.95
      targetRotY += 0.3 // Speed up rotation or shift
    }

    modelRef.current.position.y = THREE.MathUtils.lerp(modelRef.current.position.y, targetY, 0.08)
    modelRef.current.scale.setScalar(THREE.MathUtils.lerp(modelRef.current.scale.x, targetScale, 0.08))
    modelRef.current.rotation.y = THREE.MathUtils.lerp(modelRef.current.rotation.y, targetRotY, 0.05)
    modelRef.current.rotation.x = THREE.MathUtils.lerp(modelRef.current.rotation.x, isHovered ? 0.2 : 0.0, 0.08)
  })

  return (
    <group ref={modelRef} position={[2.1, 0, 0]}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 2]} intensity={1.5} castShadow />
      <spotLight position={[0, 4, -4]} intensity={2.5} color="#D7B46A" />
      <Environment preset="studio" />
      <Eyeglass color={colorVariant} />
    </group>
  )
}

function HorizontalGallery() {
  const scrollRef = useRef(null)
  const pinRef = useRef(null)
  
  // Track hovered state for each of the 4 slides
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)

  const items = [
    {
      id: 'stealth',
      title: 'STEALTH BLACK',
      desc: 'Deep polished acetate meets gunmetal titanium. Classic dark silhouette for absolute mystique.',
      color: 'black',
      tag: '01 / NOIR'
    },
    {
      id: 'gold',
      title: 'LUXURY GOLD',
      desc: 'Champagne gold accents and premium metal bridge framing. High-fashion luxury statement.',
      color: 'gold',
      tag: '02 / AURUM'
    },
    {
      id: 'silver',
      title: 'MERCURY SILVER',
      desc: 'Polished chrome lines and cold metal finish. Industrial precision designed for modern visionaries.',
      color: 'silver',
      tag: '03 / ARGENTUM'
    },
    {
      id: 'cobalt',
      title: 'COBALT BLUE',
      desc: 'Translucent blue structural frames that capture reflections. Artistic, expressive, and unforgettable.',
      color: 'blue',
      tag: '04 / CYANO'
    }
  ]

  useEffect(() => {
    const scrollContainer = scrollRef.current
    const pinContainer = pinRef.current
    if (!scrollContainer || !pinContainer) return

    // Scroll trigger to translate the container horizontally on vertical scroll
    const trigger = ScrollTrigger.create({
      trigger: pinContainer,
      start: 'top top',
      end: '+=3000',
      pin: true,
      scrub: 1, // Smooth scrolling transition
      animation: gsap.to(scrollContainer, {
        x: '-300vw', // Scroll 3 viewports horizontally
        ease: 'none'
      }),
      onUpdate: (self) => {
        const index = Math.round(self.progress * 3)
        setActiveSlideIndex(index)
      }
    })

    return () => {
      trigger.kill()
    }
  }, [])

  return (
    <div ref={pinRef} id="showcase" style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      
      {/* Horizontal Flex container */}
      <div 
        ref={scrollRef} 
        className="horizontal-scroll-container"
        style={{
          display: 'flex',
          width: '400vw',
          height: '100vh',
          backgroundColor: 'var(--bg-secondary)'
        }}
      >
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="horizontal-slide"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{
              width: '100vw',
              height: '100vh',
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              alignItems: 'center',
              padding: '0 8%',
              boxSizing: 'border-box',
              position: 'relative',
              backgroundColor: 'var(--bg-primary)' // Unified backdrop
            }}
          >
            {/* Left side: Editorial Layout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 5 }}>
              <span style={{ 
                fontFamily: 'Outfit, sans-serif',
                fontSize: '0.8rem',
                letterSpacing: '0.3em',
                color: '#D7B46A',
                fontWeight: 300
              }}>
                {item.tag}
              </span>
              <h2 
                className="h-large" 
                style={{ 
                  margin: 0, 
                  fontSize: 'clamp(2.5rem, 5vw, 5.5rem)',
                  lineHeight: '1.0',
                  color: hoveredIndex === idx ? '#D7B46A' : 'var(--text-primary)',
                  transition: 'color 0.4s ease'
                }}
              >
                {item.title}
              </h2>
              <p className="p-editorial" style={{ margin: 0, maxWidth: '450px' }}>
                {item.desc}
              </p>
              
              <div style={{ marginTop: '20px' }}>
                <a href="#viewer" className="btn-luxury">
                  CUSTOMIZE NOW
                </a>
              </div>
            </div>

            {/* Right side: 3D model canvas (Absolute coverage to avoid clipping) */}
            <div 
              style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 2,
                pointerEvents: 'none'
              }}
            >
              {/* Subtle hover sweep light layer on DOM */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 2,
                  pointerEvents: 'none',
                  background: 'radial-gradient(circle at 72% 50%, rgba(215, 180, 106, 0.08) 0%, transparent 70%)',
                  opacity: hoveredIndex === idx ? 1 : 0,
                  transition: 'opacity 0.6s ease'
                }}
              />

              {activeSlideIndex === idx || Math.abs(activeSlideIndex - idx) <= 1 ? (
                <Canvas 
                  dpr={[1, 2]}
                  camera={{ position: [0, 0, 5.0], fov: 40 }} 
                  gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                  style={{ pointerEvents: 'auto' }}
                >
                  <GalleryScene 
                    colorVariant={item.color} 
                    isHovered={hoveredIndex === idx} 
                  />
                </Canvas>
              ) : (
                <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--bg-primary)' }} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default React.memo(HorizontalGallery)
