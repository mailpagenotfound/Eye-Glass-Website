import React, { useState, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { Camera, RefreshCcw, Maximize, Play, Pause, Camera as SnapIcon, Sun, Layout } from 'lucide-react'
import Eyeglass from '../Eyeglass/Eyeglass'

function Viewer() {
  const viewerRef = useRef(null)
  const controlsRef = useRef(null)
  const glRef = useRef(null)
  const [inView, setInView] = useState(false)

  // Customizer States
  const [color, setColor] = useState('black')
  const [shape, setShape] = useState('square')
  const [hdr, setHdr] = useState('studio')
  const [bgColor, setBgColor] = useState('#F9F9F9')
  const [autoRotate, setAutoRotate] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const el = viewerRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting)
    }, { rootMargin: '150px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Reset Camera action
  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
  }

  // Fullscreen action
  const handleFullscreen = () => {
    const container = viewerRef.current
    if (!container) return

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch((err) => {
        console.error(`Error entering fullscreen: ${err.message}`)
      })
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false))
    }
  }

  // Capture Canvas Screenshot
  const handleScreenshot = () => {
    const gl = glRef.current
    if (!gl) return

    // Ensure tone mapping matches and preserveDrawingBuffer captures the frame
    const dataUrl = gl.domElement.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `eyewear-custom-${color}-${hdr}.png`
    link.href = dataUrl
    link.click()
  }

  // Handle ESC or close fullscreen updates
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  return (
    <section
      ref={viewerRef}
      id="viewer"
      style={{
        height: '100vh',
        width: '100vw',
        backgroundColor: bgColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: isFullscreen ? '40px' : '80px 40px 40px 40px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        transition: 'background-color 0.5s ease',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}
    >
      {/* 1. TOP HEADER PANEL */}
      <div 
        style={{ 
          width: '100%', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          zIndex: 10,
          pointerEvents: 'none'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D7B46A' }}>
            STUDIO MODE
          </span>
          <h2 className="h-small" style={{ margin: '5px 0 0 0', fontWeight: 300, color: '#000000' }}>
            INTERACTIVE VIEWER
          </h2>
        </div>

        {/* Action utility bar */}
        <div style={{ display: 'flex', gap: '15px', pointerEvents: 'all' }}>
          <button
            onClick={handleReset}
            className="btn-luxury"
            title="Reset Camera View"
            style={{ padding: '10px 18px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RefreshCcw size={14} /> RESET
          </button>
          
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`btn-luxury ${autoRotate ? 'btn-luxury-active' : ''}`}
            title="Toggle Auto Rotation"
            style={{ padding: '10px 18px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {autoRotate ? <Pause size={14} /> : <Play size={14} />} SPIN
          </button>
          
          <button
            onClick={handleScreenshot}
            className="btn-luxury"
            title="Capture Screenshot"
            style={{ padding: '10px 18px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <SnapIcon size={14} /> SNAPSHOT
          </button>

          <button
            onClick={handleFullscreen}
            className="btn-luxury"
            title="Toggle Fullscreen"
            style={{ padding: '10px 18px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Maximize size={14} />
          </button>
        </div>
      </div>

      {/* 2. MAIN 3D CANVAS AREA */}
      <div 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          zIndex: 2 
        }}
      >
        {inView ? (
          <Canvas
            shadows
            dpr={[1, 2]}
            camera={{ position: [0, 0, 3.2], fov: 45 }}
            gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' }}
            onCreated={({ gl }) => {
              glRef.current = gl
              gl.shadowMap.type = THREE.PCFSoftShadowMap
            }}
          >
            {/* Studio Lights */}
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 10, 5]} intensity={1.8} castShadow />
            <spotLight position={[-4, 4, -4]} intensity={2.0} color="#D7B46A" />
            
            {/* Environment dynamic mapping */}
            <Environment preset={hdr} />
            
            {/* 3D Eyeglass customizer node */}
            <Eyeglass color={color} shape={shape} isViewer={true} />

            {/* User controls (Rotate, Zoom, Pan) */}
            <OrbitControls
              ref={controlsRef}
              makeDefault
              enableDamping
              dampingFactor={0.05}
              minDistance={1.8}
              maxDistance={8}
              autoRotate={autoRotate}
              autoRotateSpeed={1.8}
            />
          </Canvas>
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: bgColor }} />
        )}
      </div>

      {/* 3. BOTTOM CONTROL PANEL */}
      <div 
        style={{ 
          width: '100%', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '20px', 
          zIndex: 10,
          pointerEvents: 'none'
        }}
        className="customizer-bottom-panel"
      >
        {/* Choose Color Panel */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '20px 24px', 
            pointerEvents: 'all', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px', 
            backgroundColor: 'rgba(255, 255, 255, 0.45)', 
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.6)', 
            borderRadius: '20px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.03)'
          }}
        >
          <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.15em', opacity: 0.85, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', color: '#000000' }}>
            <Layout size={12} /> FRAME TINT
          </span>
          <div style={{ display: 'flex', gap: '12px' }}>
            {['black', 'gold', 'silver', 'blue', 'green'].map((clr) => (
              <button
                key={clr}
                onClick={() => setColor(clr)}
                aria-label={`Select frame color ${clr}`}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: clr === 'black' ? '#111111' : clr === 'gold' ? '#D7B46A' : clr === 'silver' ? '#DDDDDD' : clr === 'blue' ? '#3B82F6' : '#10B981',
                  border: color === clr ? '2.5px solid #000000' : '1px solid rgba(0,0,0,0.15)',
                  cursor: 'pointer',
                  transform: color === clr ? 'scale(1.18)' : 'scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: color === clr ? '0 4px 12px rgba(0,0,0,0.12)' : 'none'
                }}
              />
            ))}
          </div>
        </div>

        {/* Frame Shape Panel */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '20px 24px', 
            pointerEvents: 'all', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px', 
            backgroundColor: 'rgba(255, 255, 255, 0.45)', 
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.6)', 
            borderRadius: '20px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.03)'
          }}
        >
          <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.15em', opacity: 0.85, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', color: '#000000' }}>
            <Layout size={12} /> SHAPE SYMMETRY
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['round', 'rectangular', 'square'].map((sh) => (
              <button
                key={sh}
                onClick={() => setShape(sh)}
                style={{
                  padding: '8px 14px',
                  fontSize: '0.68rem',
                  fontFamily: 'Outfit, sans-serif',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  border: shape === sh ? '1px solid #000000' : '1px solid rgba(0,0,0,0.08)',
                  background: shape === sh ? '#000000' : 'rgba(255, 255, 255, 0.3)',
                  color: shape === sh ? '#FFFFFF' : '#000000',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {sh}
              </button>
            ))}
          </div>
        </div>

        {/* Reflection Map Panel */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '20px 24px', 
            pointerEvents: 'all', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px', 
            backgroundColor: 'rgba(255, 255, 255, 0.45)', 
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.6)', 
            borderRadius: '20px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.03)'
          }}
        >
          <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.15em', opacity: 0.85, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', color: '#000000' }}>
            <Sun size={12} /> HDR ENVIRONMENT
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['studio', 'city', 'sunset', 'warehouse'].map((h) => (
              <button
                key={h}
                onClick={() => setHdr(h)}
                style={{
                  padding: '8px 12px',
                  fontSize: '0.68rem',
                  fontFamily: 'Outfit, sans-serif',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  border: hdr === h ? '1px solid #000000' : '1px solid rgba(0,0,0,0.08)',
                  background: hdr === h ? '#000000' : 'rgba(255, 255, 255, 0.3)',
                  color: hdr === h ? '#FFFFFF' : '#000000',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* Studio Background Panel */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '20px 24px', 
            pointerEvents: 'all', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px', 
            backgroundColor: 'rgba(255, 255, 255, 0.45)', 
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.6)', 
            borderRadius: '20px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.03)'
          }}
        >
          <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.68rem', fontWeight: 500, letterSpacing: '0.15em', opacity: 0.85, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', color: '#000000' }}>
            <Sun size={12} /> BACKDROP TONE
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { label: 'Gallery', value: '#F9F9F9' },
              { label: 'Studio', value: '#EAEAEA' },
              { label: 'Chalk', value: '#DCDCDC' },
            ].map((bg) => (
              <button
                key={bg.value}
                onClick={() => setBgColor(bg.value)}
                style={{
                  padding: '8px 14px',
                  fontSize: '0.68rem',
                  fontFamily: 'Outfit, sans-serif',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  border: bgColor === bg.value ? '1px solid #000000' : '1px solid rgba(0,0,0,0.08)',
                  background: bgColor === bg.value ? '#000000' : 'rgba(255, 255, 255, 0.3)',
                  color: bgColor === bg.value ? '#FFFFFF' : '#000000',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {bg.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .customizer-bottom-panel {
            grid-template-columns: 1fr !important;
            gap: 15px !important;
          }
          #viewer {
            height: auto !important;
            min-height: 100vh !important;
            padding: 80px 20px 20px 20px !important;
          }
        }
      `}</style>
    </section>
  )
}

export default Viewer
