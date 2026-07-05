import React, { useState, useRef, useEffect } from 'react'
import { Eye, ShieldAlert, Sparkles, Sun } from 'lucide-react'

const LENS_MODES = [
  {
    id: 'polarized',
    name: 'Polarized Core',
    icon: Sun,
    title: 'GLARE ELIMINATION',
    description: 'Filters out harsh horizontal glare reflections from highways, water, and wet asphalt.',
    // Unfiltered side has a bright white glare overlay block
    hasGlare: true,
    filterStyle: {
      filter: 'contrast(1.1) brightness(0.95) saturate(1.1)',
    }
  },
  {
    id: 'bluelight',
    name: 'Blue Light Shield',
    icon: ShieldAlert,
    title: 'DIGITAL SCREEN PROTECTION',
    description: 'Absorbs harmful high-energy blue-violet light emitted by digital screens, reducing eye fatigue.',
    hasGlare: false,
    filterStyle: {
      filter: 'sepia(0.22) saturate(1.1) brightness(0.93)',
    }
  },
  {
    id: 'photochromic',
    name: 'Transitions Core',
    icon: Sparkles,
    title: 'SMART UV ADAPTATION',
    description: 'Instantly transitions from crystal-clear indoors to deep dark sunglass shading when exposed to solar UV rays.',
    hasGlare: false,
    filterStyle: {
      filter: 'brightness(0.48) contrast(1.2) sepia(0.08) saturate(1.1)',
    }
  }
]

function LensSimulator() {
  const [activeMode, setActiveMode] = useState('polarized')
  const [sliderPos, setSliderPos] = useState(50) // percentage
  const containerRef = useRef(null)
  const isDragging = useRef(false)

  const mode = LENS_MODES.find(m => m.id === activeMode)

  const handleMove = (clientX) => {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const x = clientX - rect.left
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPos(percent)
  }

  const handleTouchMove = (e) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX)
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging.current) {
      handleMove(e.clientX)
    }
  }

  const startDrag = () => {
    isDragging.current = true
  }

  const stopDrag = () => {
    isDragging.current = false
  }

  useEffect(() => {
    window.addEventListener('mouseup', stopDrag)
    window.addEventListener('touchend', stopDrag)
    return () => {
      window.removeEventListener('mouseup', stopDrag)
      window.removeEventListener('touchend', stopDrag)
    }
  }, [])

  return (
    <div 
      style={{
        width: '100%',
        maxWidth: '900px',
        margin: '40px auto 0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        pointerEvents: 'all'
      }}
    >
      {/* 1. Mode selector tab row */}
      <div 
        style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.03)',
          padding: '6px',
          borderRadius: '20px',
          alignSelf: 'center',
          border: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        {LENS_MODES.map((item) => {
          const Icon = item.icon
          const isActive = item.id === activeMode
          return (
            <button
              key={item.id}
              onClick={() => setActiveMode(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '16px',
                background: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? '#000000' : '#A0A0A0',
                fontFamily: 'Outfit, sans-serif',
                fontSize: '0.72rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: isActive ? 500 : 400,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <Icon size={12} />
              {item.name}
            </button>
          )
        })}
      </div>

      {/* 2. Interactive Split Image Container */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        style={{
          width: '100%',
          height: '420px',
          borderRadius: '20px',
          overflow: 'hidden',
          position: 'relative',
          userSelect: 'none',
          cursor: isDragging.current ? 'ew-resize' : 'default',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
        }}
      >
        {/* Base: Raw Unfiltered View (Left/Base Layer) */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Glare Simulation Layer (Overlay white blocks to represent road reflections) */}
          {mode.hasGlare && (
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.0) 70%)',
                mixBlendMode: 'overlay',
                pointerEvents: 'none'
              }}
            />
          )}

          {/* Left Side Tag (Raw view) */}
          <div 
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              backgroundColor: 'rgba(0,0,0,0.65)',
              padding: '6px 12px',
              borderRadius: '12px',
              color: '#FFFFFF',
              fontFamily: 'Outfit, sans-serif',
              fontSize: '0.62rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase'
            }}
          >
            RAW VISION (WITHOUT LENS)
          </div>
        </div>

        {/* Top: Filtered View (Right Layer, clipped by width) */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: `${100 - sliderPos}%`,
            height: '100%',
            overflow: 'hidden',
            transition: isDragging.current ? 'none' : 'width 0.1s ease',
            zIndex: 3
          }}
        >
          {/* Inner image positioned to align perfectly with base */}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '900px', // Matches container max-width
              height: '420px',
              backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              ...mode.filterStyle
            }}
          >
            {/* Filtered view tag (Right) */}
            <div 
              style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                backgroundColor: '#D7B46A',
                padding: '6px 12px',
                borderRadius: '12px',
                color: '#000000',
                fontFamily: 'Outfit, sans-serif',
                fontSize: '0.62rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontWeight: 650
              }}
            >
              {mode.title}
            </div>
          </div>
        </div>

        {/* 3. Drag Handle Slider Bar */}
        <div 
          onMouseDown={startDrag}
          onTouchStart={startDrag}
          style={{
            position: 'absolute',
            top: 0,
            left: `${sliderPos}%`,
            width: '2px',
            height: '100%',
            backgroundColor: '#FFFFFF',
            cursor: 'ew-resize',
            zIndex: 4,
            transform: 'translateX(-50%)',
            transition: isDragging.current ? 'none' : 'left 0.1s ease',
            boxShadow: '0 0 10px rgba(0,0,0,0.5)'
          }}
        >
          {/* Circular thumb handle */}
          <div 
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#000000',
              border: '2px solid #FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              color: '#FFFFFF'
            }}
          >
            <Eye size={14} />
          </div>
        </div>
      </div>

      {/* 4. Text description below simulator */}
      <div 
        style={{
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        <span style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D7B46A', fontWeight: 550 }}>
          {mode.title}
        </span>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
          {mode.description}
        </p>
      </div>
    </div>
  )
}

export default React.memo(LensSimulator)
