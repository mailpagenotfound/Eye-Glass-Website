import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Eyeglass from '../Eyeglass/Eyeglass'
import { useInView } from '../../hooks/useInView'

gsap.registerPlugin(ScrollTrigger)

function ExplodedView() {
  const [containerNode, setContainerNode] = useState(null)
  const containerRef = useRef(null)
  const [inViewRef, inView] = useInView()
  const [explodeProgress, setExplodeProgress] = useState(0)

  const setRefs = useCallback((node) => {
    if (node) {
      containerRef.current = node
      setContainerNode(node)
    }
    inViewRef.current = node
  }, [inViewRef])

  useEffect(() => {
    const container = containerNode
    if (!container) return

    // Scroll Trigger to control the assembly/explosion timeline
    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: '+=1800',
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        setExplodeProgress(self.progress)
      }
    })

    // Refresh ScrollTrigger to measure dynamic canvas dimensions correctly
    ScrollTrigger.refresh()

    return () => {
      trigger.kill()
    }
  }, [containerNode])

  // Callout annotations that appear in exploded state
  const labels = [
    {
      name: 'Lens Transmission',
      detail: 'Shader reveal lens with anti-reflective backing.',
      targetX: '32%',
      targetY: '49%',
      cardStyle: { left: '-280px', top: '-110px' },
      linePath: 'M -40,-75 L -15,-75 L 0,0',
      side: 'left'
    },
    {
      name: 'Acetate Frame',
      detail: 'Premium hand-polished circular silhouette.',
      targetX: '29%',
      targetY: '51%',
      cardStyle: { left: '-280px', top: '-35px' },
      linePath: 'M -40,0 L -15,0 L 0,0',
      side: 'left'
    },
    {
      name: 'Silicone Nose Pads',
      detail: 'Hypoallergenic soft-grip structural mounts.',
      targetX: '46%',
      targetY: '56%',
      cardStyle: { left: '-280px', top: '40px' },
      linePath: 'M -40,75 L -15,75 L 0,0',
      side: 'left'
    },
    {
      name: 'Titanium Bridge',
      detail: 'Precision arched core stabilizer bar.',
      targetX: '50%',
      targetY: '41%',
      cardStyle: { left: '40px', top: '-110px' },
      linePath: 'M 40,-75 L 15,-75 L 0,0',
      side: 'right'
    },
    {
      name: 'Multi-Barrel Hinges',
      detail: 'Milled hardware for zero-play movement.',
      targetX: '78%',
      targetY: '51%',
      cardStyle: { left: '40px', top: '-35px' },
      linePath: 'M 40,0 L 15,0 L 0,0',
      side: 'right'
    },
    {
      name: 'Acetate Temples',
      detail: 'Weighted balance tips for head grip.',
      targetX: '73%',
      targetY: '55%',
      cardStyle: { left: '40px', top: '40px' },
      linePath: 'M 40,75 L 15,75 L 0,0',
      side: 'right'
    }
  ]

  const showLabels = explodeProgress >= 0.25

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
      id="exploded"
      style={{
        height: '100vh',
        width: '100vw',
        position: 'relative',
        backgroundColor: '#050505',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}
    >
      {/* HTML Layout */}
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
        {/* Sticky Copy with smooth parallax drift */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px', 
          pointerEvents: 'none',
          ...getParallaxStyle(explodeProgress)
        }}>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D7B46A' }}>
            ENGINEERING
          </span>
          <h2 className="h-medium" style={{ margin: 0, fontWeight: 100, color: '#FFF' }}>
            EXPLODED CORE
          </h2>
          <p className="p-editorial" style={{ margin: 0, color: '#C8C8C8' }}>
            Scroll to pull apart the components. Every screw thread, barrel hinge, and lens layering is mapped with absolute dimensional integrity, showing the structural transparency of next-gen eyewear.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#FFF', opacity: 0.5 }}>COMPONENTS</span>
              <span style={{ fontSize: '0.75rem', color: '#D7B46A' }}>12 INDEPENDENT PARTS</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: '#FFF', opacity: 0.5 }}>TOLERANCES</span>
              <span style={{ fontSize: '0.75rem', color: '#D7B46A' }}>MICRON-LEVEL METROLOGY</span>
            </div>
          </div>
        </div>

        {/* 3D Explosion Canvas Container with fade out */}
        <div style={{ 
          position: 'relative', 
          height: '100%', 
          width: '100%',
          opacity: 1
        }}>
          {inView ? (
            <Canvas 
              dpr={[1, 2]} 
              gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            >
              <ambientLight intensity={0.5} />
              <directionalLight position={[4, 6, 4]} intensity={2} castShadow />
              <spotLight position={[-4, 4, -4]} intensity={2.5} color="#D7B46A" />
              <Environment preset="studio" />
              <Eyeglass color="black" explodeProgress={explodeProgress} />
            </Canvas>
          ) : (
            <div style={{ width: '100%', height: '100%', backgroundColor: '#050505' }} />
          )}

          {/* Annotation Labels Overlay */}
          {labels.map((lbl, idx) => (
            <div
              key={lbl.name}
              style={{
                position: 'absolute',
                top: lbl.targetY,
                left: lbl.targetX,
                opacity: showLabels ? 1 : 0,
                transform: `translateY(${showLabels ? 0 : 25}px)`,
                transition: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.05}s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.05}s`,
                zIndex: 10,
                pointerEvents: 'none'
              }}
            >
              {/* Connecting Vector Lines */}
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
                  d={lbl.linePath}
                  fill="none"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="1.0"
                  strokeDasharray={showLabels ? '0' : '400'}
                  style={{ transition: 'stroke-dasharray 0.8s ease' }}
                />
                <circle cx="0" cy="0" r="3.5" fill="#D7B46A" />
              </svg>

              {/* Text Card */}
              <div 
                className="glass-panel" 
                style={{ 
                  position: 'absolute',
                  ...lbl.cardStyle,
                  width: '240px',
                  padding: '12px 18px', 
                  backgroundColor: 'rgba(5, 5, 5, 0.88)',
                  borderLeft: lbl.side === 'left' ? '2px solid #D7B46A' : 'none',
                  borderRight: lbl.side === 'right' ? '2px solid #D7B46A' : 'none',
                  pointerEvents: 'all'
                }}
              >
                <h4 style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '0.8rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#FFFFFF',
                  marginBottom: '4px'
                }}>
                  {lbl.name}
                </h4>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.7rem',
                  lineHeight: '1.4',
                  color: '#C8C8C8',
                  margin: 0
                }}>
                  {lbl.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default React.memo(ExplodedView)
