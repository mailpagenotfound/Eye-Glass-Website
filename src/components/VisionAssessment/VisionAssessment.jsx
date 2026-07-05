import React, { useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, Check } from 'lucide-react'
import Eyeglass from '../Eyeglass/Eyeglass'
import VisionTestModal from './VisionTestModal'
import { useInView } from '../../hooks/useInView'

gsap.registerPlugin(ScrollTrigger)

function FloatingGlasses() {
  const meshRef = useRef()
  
  useFrame((state) => {
    if (!meshRef.current) return
    const time = state.clock.getElapsedTime()
    // Slow breathing drift and soft rotation
    meshRef.current.position.y = Math.sin(time * 0.7) * 0.06
    meshRef.current.rotation.y = Math.sin(time * 0.3) * 0.15
    meshRef.current.rotation.x = Math.cos(time * 0.25) * 0.04
  })

  return (
    <group ref={meshRef} position={[0, -0.05, 0]} scale={[1.05, 1.05, 1.05]}>
      <Eyeglass color="black" shape="square" />
    </group>
  )
}

const lerp = (a, b, t) => a + (b - a) * t

function VisionCameraRig({ isZooming }) {
  useFrame((state) => {
    const targetZ = isZooming ? 0.65 : 2.6
    const targetX = isZooming ? -0.38 : 0.0
    const targetY = isZooming ? -0.05 : 0.0

    state.camera.position.x = lerp(state.camera.position.x, targetX, 0.07)
    state.camera.position.y = lerp(state.camera.position.y, targetY, 0.07)
    state.camera.position.z = lerp(state.camera.position.z, targetZ, 0.07)
    state.camera.lookAt(isZooming ? -0.38 : 0, 0, 0)
  })
  return null
}

function VisionAssessment() {
  const [inViewRef, inView] = useInView()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isZooming, setIsZooming] = useState(false)
  const textRef = useRef(null)

  const handleStartTest = () => {
    setIsZooming(true)
    
    // Hide surrounding text content
    gsap.to([textRef.current, '.assessment-callout'], {
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.inOut',
      onComplete: () => {
        setIsModalOpen(true)
      }
    })
  }

  useEffect(() => {
    if (!inView) return
    const textEl = textRef.current
    if (!textEl) return

    const elements = textEl.querySelectorAll('.animate-fade')
    gsap.fromTo(elements,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1.0,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: textEl,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    )
  }, [inView])

  const features = [
    'Distance Vision',
    'Near Vision',
    'Astigmatism',
    'Color Vision',
    'Contrast Sensitivity',
    'Personalized Lens Suggestions'
  ]

  return (
    <section
      ref={inViewRef}
      id="vision-assessment-section"
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#0F0F0F',
        display: 'flex',
        alignItems: 'center',
        padding: '120px 0',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}
    >
      <div
        className="container"
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '80px',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}
      >
        {/* Left Column: 3D Eyeglass Viewer & Assessment Callout */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
          }}
        >
          {/* Three.js Viewer Container */}
          <div
            style={{
              position: 'relative',
              height: '420px',
              width: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
              borderRadius: '8px',
              border: '1px solid rgba(0, 0, 0, 0.04)',
              marginBottom: '35px',
              overflow: 'hidden'
            }}
          >
              {inView ? (
                <Canvas 
                  dpr={[1, 2]} 
                  camera={{ position: [0, 0, 2.6], fov: 45 }} 
                  gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                >
                  <ambientLight intensity={0.45} />
                  <directionalLight position={[3, 5, 4]} intensity={1.8} />
                  <spotLight position={[-4, 4, -4]} intensity={1.5} color="#D7B46A" />
                  <Environment preset="studio" />
                  <FloatingGlasses />
                  <VisionCameraRig isZooming={isZooming} />
                </Canvas>
              ) : (
                <div style={{ width: '100%', height: '100%', backgroundColor: '#0F0F0F' }} />
              )}
              
              {/* Subtle overlay gradient */}
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle at center, transparent 30%, rgba(249,249,249,0.5) 100%)',
                  pointerEvents: 'none'
                }}
            />
          </div>

          {/* Assessment Callout Text */}
          <div className="assessment-callout" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: '#D7B46A', fontWeight: 500, textTransform: 'uppercase' }}>
              VISION ASSESSMENT
            </span>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#C8C8C8', margin: 0, opacity: 0.8 }}>
              Discover how clearly you see in under 2 minutes.
            </p>
            
            {/* Start Eye Test Button */}
            <button
              onClick={handleStartTest}
              className="btn-luxury-outline"
              style={{
                marginTop: '25px',
                padding: '14px 32px',
                backgroundColor: 'transparent',
                border: '1px solid #D7B46A',
                color: '#D7B46A',
                fontFamily: 'Outfit, sans-serif',
                fontSize: '0.85rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                borderRadius: '0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
            >
              Start Eye Test 
              <ArrowRight size={14} className="arrow-icon" style={{ transition: 'transform 0.3s ease' }} />
            </button>
          </div>
        </div>

        {/* Right Column: Editorial details & feature cards */}
        <div ref={textRef} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <span className="animate-fade" style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D7B46A' }}>
            PERSONALIZED VISION
          </span>
          
          <h2 className="h-large animate-fade" style={{ margin: 0, fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1.1, fontWeight: 100, color: '#FFF' }}>
            CHECK YOUR<br />VISION ONLINE
          </h2>

          <p className="p-editorial animate-fade" style={{ margin: 0, color: '#C8C8C8' }}>
            Experience a guided vision assessment designed to help you understand your eyesight. Test distance vision, near vision, contrast sensitivity, astigmatism, and color perception using a beautifully crafted interactive experience.
          </p>

          {/* Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px 25px',
              marginTop: '15px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              paddingTop: '30px'
            }}
          >
            {features.map((feat, idx) => (
              <div
                key={feat}
                className="animate-fade"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', border: '1px solid rgba(215, 180, 106, 0.4)', color: '#D7B46A' }}>
                  <Check size={10} strokeWidth={3} />
                </div>
                <span style={{ fontSize: '0.8rem', fontFamily: 'Outfit, sans-serif', letterSpacing: '0.05em', color: '#FFF', opacity: 0.9 }}>
                  {feat}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Styled hover effects & mobile responsive adjustments */}
      <style>{`
        .btn-luxury-outline:hover {
          background-color: rgba(215, 180, 106, 0.08) !important;
          box-shadow: 0 0 15px rgba(215, 180, 106, 0.2) !important;
          transform: translateY(-2px) !important;
        }
        .btn-luxury-outline:hover .arrow-icon {
          transform: translateX(4px) !important;
        }
        @media (max-width: 900px) {
          #vision-assessment-section .container {
            grid-template-columns: 1fr !important;
            gap: 50px !important;
          }
          #vision-assessment-section {
            padding: 80px 0 !important;
          }
        }
      `}</style>

      {isModalOpen && (
        <VisionTestModal 
          isOpen={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false)
            setIsZooming(false)
            // Fade-in surrounding text and layout back to original state
            gsap.to([textRef.current, '.assessment-callout'], {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.1,
              ease: 'power3.out'
            })
          }}
        />
      )}
    </section>
  )
}

export default VisionAssessment
