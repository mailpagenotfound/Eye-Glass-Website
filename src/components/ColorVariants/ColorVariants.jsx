import React, { useState, useRef, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import Eyeglass from '../Eyeglass/Eyeglass'
import { useInView } from '../../hooks/useInView'

// Rig to slowly spin the color variants glass model
function ColorSceneRig({ activeColor }) {
  const meshRef = useRef()

  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.getElapsedTime()
    // Soft continuous float and slow rotation
    meshRef.current.rotation.y = time * 0.18
    meshRef.current.position.y = Math.sin(time * 0.8) * 0.05
  })

  return (
    <group ref={meshRef} position={[-1.8, 0, 0]} scale={[0.92, 0.92, 0.92]}>
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 5, 3]} intensity={1.8} />
      <spotLight position={[0, 4, -4]} intensity={2.5} color="#D7B46A" />
      <Environment preset="studio" />
      <Eyeglass 
        color={activeColor} 
        shape={activeColor === 'gold' || activeColor === 'green' ? 'round' : activeColor === 'silver' ? 'rectangular' : 'square'} 
      />
    </group>
  )
}

function ColorVariants() {
  const [inViewRef, inView] = useInView()
  const [activeColor, setActiveColor] = useState('black')

  const colorways = [
    {
      id: 'black',
      name: 'OBSIDIAN NOIR',
      hex: '#0d0d0d',
      desc: 'High-gloss organic acetate in a deep void black, framed with gunmetal hardware and grey lenses. An understated luxury icon.',
      accentColor: '#FFFFFF'
    },
    {
      id: 'gold',
      name: 'AURUM GOLD',
      hex: '#D7B46A',
      desc: 'Deep black temples meet pure 24k gold vacuum-plated titanium hinges and bridge. Paired with warm champagne tinted lenses.',
      accentColor: '#D7B46A'
    },
    {
      id: 'silver',
      name: 'MERCURY SILVER',
      hex: '#E0E0E0',
      desc: 'Brushed spacecraft-grade silver details paired with smoke grey frame compound. Designed for cool and architectural lines.',
      accentColor: '#A0A0A0'
    },
    {
      id: 'blue',
      name: 'COBALT GLASS',
      hex: '#3b82f6',
      desc: 'Semi-transparent deep blue frame material that glows in direct light, fitted with chrome hinges and crystal blue-cut protective lenses.',
      accentColor: '#3b82f6'
    },
    {
      id: 'green',
      name: 'EMERALD JELLY',
      hex: '#10b981',
      desc: 'Translucent forest green organic acetate, finished with golden metal details and warm green UV protection lenses.',
      accentColor: '#10b981'
    }
  ]

  const activeData = colorways.find((c) => c.id === activeColor) || colorways[0]

  return (
    <section
      ref={inViewRef}
      id="variants"
      style={{
        height: '100vh',
        width: '100vw',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
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
          gridTemplateColumns: '1fr 1fr',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}
      >
        {/* Left Side: 3D Color Viewer (Absolute coverage to avoid clipping) */}
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
          {inView ? (
            <Canvas 
              dpr={[1, 2]}
              camera={{ position: [0, 0, 5.0], fov: 40 }} 
              gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
              style={{ pointerEvents: 'auto' }}
            >
              <ColorSceneRig activeColor={activeColor} />
            </Canvas>
          ) : (
            <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--bg-primary)' }} />
          )}
        </div>

        {/* Dummy spacing cell to keep grid alignment */}
        <div style={{ pointerEvents: 'none' }} />

        {/* Right Side: Customize Interface */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', paddingLeft: '40px', zIndex: 5, position: 'relative' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D7B46A' }}>
            ACETATE & TITANIUM
          </span>
          
          <h2 className="h-medium" style={{ margin: 0, fontWeight: 100 }}>
            CURATED SPECTRUM
          </h2>

          {/* Color description Card */}
          <div 
            className="glass-panel" 
            style={{ 
              padding: '24px 30px', 
              borderLeft: `3px solid ${activeData.accentColor}`,
              transition: 'all 0.4s ease',
              minHeight: '160px',
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid rgba(0,0,0,0.08)'
            }}
          >
            <h3 style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '1rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--text-primary)',
              marginBottom: '10px'
            }}>
              {activeData.name}
            </h3>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.85rem',
              lineHeight: '1.6',
              color: 'var(--text-secondary)',
              margin: 0
            }}>
              {activeData.desc}
            </p>
          </div>

          {/* Color buttons triggers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '0.7rem', letterSpacing: '0.1em', opacity: 0.5, textTransform: 'uppercase' }}>
              SELECT MATERIAL COLORWAY
            </span>
            <div style={{ display: 'flex', gap: '20px' }}>
              {colorways.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveColor(c.id)}
                  aria-label={`Switch colorway to ${c.name}`}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: c.hex,
                    border: activeColor === c.id ? '2px solid #D7B46A' : '2px solid rgba(0,0,0,0.15)',
                    transform: activeColor === c.id ? 'scale(1.2)' : 'scale(1.0)',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: activeColor === c.id ? '0 0 15px rgba(215, 180, 106, 0.4)' : 'none'
                  }}
                  className="color-btn"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          #variants .container {
            grid-template-columns: 1fr !important;
            grid-template-rows: 1fr auto !important;
            padding: 80px 20px !important;
          }
          #variants {
            height: auto !important;
            min-height: 100vh !important;
          }
          #variants .container > div {
            padding-left: 0 !important;
          }
        }
      `}</style>
    </section>
  )
}

export default ColorVariants
