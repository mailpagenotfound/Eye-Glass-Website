import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import Eyeglass from '../Eyeglass/Eyeglass'

// Controller to render multiple small floating eyeglasses in the background of the footer
function FloatingFooterGlasses() {
  const g1Ref = useRef()
  const g2Ref = useRef()

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    // Animate first floating glass (left side)
    if (g1Ref.current) {
      g1Ref.current.position.y = Math.sin(time * 0.9) * 0.15 + 0.2
      g1Ref.current.rotation.y = time * 0.25
      g1Ref.current.rotation.x = Math.cos(time * 0.4) * 0.1
    }

    // Animate second floating glass (right side)
    if (g2Ref.current) {
      g2Ref.current.position.y = Math.cos(time * 0.8) * 0.12 - 0.2
      g2Ref.current.rotation.y = -time * 0.2
      g2Ref.current.rotation.x = Math.sin(time * 0.5) * 0.08
    }
  })

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 3, 2]} intensity={1.5} />
      <Environment preset="studio" />

      {/* Glass 1 (Left, scaled down) */}
      <group ref={g1Ref} position={[-2.4, 0.2, 0]} scale={[0.45, 0.45, 0.45]}>
        <Eyeglass color="gold" />
      </group>

      {/* Glass 2 (Right, scaled down) */}
      <group ref={g2Ref} position={[2.4, -0.2, 0]} scale={[0.42, 0.42, 0.42]}>
        <Eyeglass color="blue" />
      </group>
    </>
  )
}

function Footer() {
  const handleScrollToTop = (e) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer
      style={{
        backgroundColor: '#0A0A0A',
        width: '100vw',
        padding: '100px 40px 40px 40px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}
    >
      {/* 3D background layer with tiny floating glasses */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      >
        <Canvas 
          dpr={[1, 2]} 
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} 
          camera={{ position: [0, 0, 3], fov: 45 }}
        >
          <FloatingFooterGlasses />
        </Canvas>
      </div>

      <div 
        className="container"
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '80px',
          width: '100%'
        }}
      >
        {/* Massive Typography Hero Text */}
        <div style={{ textAlign: 'center', width: '100%', pointerEvents: 'none' }}>
          <h2
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 'clamp(4.2rem, 11vw, 11.5rem)',
              fontWeight: 100,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              lineHeight: '0.9',
              color: '#FFFFFF',
              margin: 0,
              opacity: 0.95
            }}
          >
            SEE DIFFERENTLY
          </h2>
        </div>

        {/* Bottom copyright details and links */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            paddingTop: '40px',
            flexWrap: 'wrap',
            gap: '20px'
          }}
          className="footer-bottom-grid"
        >
          {/* Copyright details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D7B46A' }}>
              COLLABORATION BRIEF
            </span>
            <span style={{ fontSize: '0.75rem', color: '#C8C8C8', fontWeight: 300 }}>
              © 2026 GENTLE MONSTER × APPLE × PD. ALL RIGHTS RESERVED.
            </span>
          </div>

          {/* Minimal Links */}
          <div style={{ display: 'flex', gap: '30px' }} className="footer-links">
            <a
              href="#"
              onClick={handleScrollToTop}
              style={{
                color: '#C8C8C8',
                fontSize: '0.75rem',
                textDecoration: 'none',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                transition: 'color 0.3s'
              }}
              onMouseEnter={(e) => (e.target.style.color = '#D7B46A')}
              onMouseLeave={(e) => (e.target.style.color = '#C8C8C8')}
            >
              BACK TO TOP
            </a>
            <a
              href="#collection"
              style={{
                color: '#C8C8C8',
                fontSize: '0.75rem',
                textDecoration: 'none',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                transition: 'color 0.3s'
              }}
              onMouseEnter={(e) => (e.target.style.color = '#D7B46A')}
              onMouseLeave={(e) => (e.target.style.color = '#C8C8C8')}
            >
              COLLECTION
            </a>
            <a
              href="#viewer"
              style={{
                color: '#C8C8C8',
                fontSize: '0.75rem',
                textDecoration: 'none',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                transition: 'color 0.3s'
              }}
              onMouseEnter={(e) => (e.target.style.color = '#D7B46A')}
              onMouseLeave={(e) => (e.target.style.color = '#C8C8C8')}
            >
              CUSTOMIZER
            </a>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .footer-bottom-grid {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 30px !important;
          }
          .footer-links {
            width: 100% !important;
            justify-content: space-between !important;
          }
        }
      `}</style>
    </footer>
  )
}

export default Footer
