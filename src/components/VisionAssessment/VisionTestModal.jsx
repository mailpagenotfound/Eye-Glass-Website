import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { Check, Shield, Eye, ArrowRight, Sun, RefreshCw, X } from 'lucide-react'
import Eyeglass from '../Eyeglass/Eyeglass'

// Dynamic breathing, orbiting and tint-fading 3D Model wrapper for the test modal
function ModalGlasses({ step, lensTint }) {
  const modelRef = useRef()

  useFrame((state) => {
    if (!modelRef.current) return
    const time = state.clock.getElapsedTime()

    if (step === 8) {
      // Continuous slow 360 rotation on Results page
      modelRef.current.rotation.y = time * 0.4
      modelRef.current.position.y = Math.sin(time * 0.8) * 0.04
    } else {
      // Soft breathing & micro-orbiting during screening questions
      modelRef.current.position.y = Math.sin(time * 0.6) * 0.05
      modelRef.current.rotation.y = Math.sin(time * 0.25) * 0.12
      modelRef.current.rotation.x = Math.cos(time * 0.2) * 0.03
    }
  })

  // Fade-in dynamic blue blocker reflection lens tint on results
  const customLensMaterial = useMemo(() => {
    if (step === 8 && lensTint) {
      return new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(lensTint),
        transmission: 0.88,
        opacity: 0.9,
        transparent: true,
        roughness: 0.05,
        ior: 1.62,
        thickness: 0.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        envMapIntensity: 2.8,
      })
    }
    return null
  }, [step, lensTint])

  useEffect(() => {
    return () => {
      if (customLensMaterial) {
        customLensMaterial.dispose()
      }
    }
  }, [customLensMaterial])

  return (
    <group ref={modelRef} scale={[1.15, 1.15, 1.15]}>
      <Eyeglass 
        color="black" 
        shape="square" 
        customMaterials={customLensMaterial ? { lens: customLensMaterial } : null} 
      />
    </group>
  )
}

// Procedural HTML5 Canvas Ishihara plate rendering component
function IshiharaPlate({ number }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    // Draw offscreen number to test circle intersections
    const offscreen = document.createElement('canvas')
    offscreen.width = width
    offscreen.height = height
    const octx = offscreen.getContext('2d')
    octx.fillStyle = 'white'
    octx.font = '900 160px Outfit, sans-serif'
    octx.textAlign = 'center'
    octx.textBaseline = 'middle'
    octx.fillText(number.toString(), width / 2, height / 2)
    const imgData = octx.getImageData(0, 0, width, height)

    // Clear main canvas with a light background
    ctx.fillStyle = '#F0F0F0'
    ctx.fillRect(0, 0, width, height)

    // Pack randomized dots in a circular boundary
    const dots = []
    const maxDots = 750
    const centerX = width / 2
    const centerY = height / 2
    const radiusBoundary = 115

    for (let i = 0; i < maxDots; i++) {
      const r = Math.random() * radiusBoundary
      const theta = Math.random() * Math.PI * 2
      const x = centerX + Math.cos(theta) * r
      const y = centerY + Math.sin(theta) * r
      const dotR = 2.0 + Math.random() * 4.5

      let overlap = false
      for (let d of dots) {
        const dist = Math.hypot(x - d.x, y - d.y)
        if (dist < (dotR + d.r + 1.0)) {
          overlap = true
          break
        }
      }
      if (overlap) continue

      // Test image pixel brightness to see if dot coordinates fall inside the hidden number
      const pxIdx = (Math.floor(y) * width + Math.floor(x)) * 4
      const isInside = imgData.data[pxIdx] > 128

      let color
      if (isInside) {
        // Red-Orange hues (Protanopia/Deuteranopia test)
        const red = 195 + Math.floor(Math.random() * 60)
        const green = 55 + Math.floor(Math.random() * 60)
        const blue = 35 + Math.floor(Math.random() * 40)
        color = `rgb(${red}, ${green}, ${blue})`
      } else {
        // Green-Yellow-Brown hues
        const red = 70 + Math.floor(Math.random() * 50)
        const green = 120 + Math.floor(Math.random() * 60)
        const blue = 45 + Math.floor(Math.random() * 40)
        color = `rgb(${red}, ${green}, ${blue})`
      }

      dots.push({ x, y, r: dotR, color })
    }

    // Render packing dots
    dots.forEach((d) => {
      ctx.beginPath()
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
      ctx.fillStyle = d.color
      ctx.fill()
    })
  }, [number])

  return (
    <canvas 
      ref={canvasRef} 
      width={280} 
      height={280} 
      style={{ borderRadius: '50%', border: '2px solid rgba(0,0,0,0.05)', display: 'block', margin: '0 auto' }} 
    />
  )
}

function VisionTestModal({ isOpen, onClose }) {
  const overlayRef = useRef(null)
  const glassesCanvasRef = useRef(null)
  const uiInterfaceRef = useRef(null)

  const [introComplete, setIntroComplete] = useState(false)
  const [step, setStep] = useState(1)

  // Step 2: Distance Vision States
  const snellenLetters = ['E', 'F', 'P', 'T', 'O', 'Z']
  const [distanceRound, setDistanceRound] = useState(0)
  const [currentLetter, setCurrentLetter] = useState('E')
  const [distanceAnswers, setDistanceAnswers] = useState([]) // true or false array

  // Step 3: Near Vision States
  const [nearFontSize, setNearFontSize] = useState(13)

  // Step 4: Astigmatism State
  const [astigmatismChoice, setAstigmatismChoice] = useState('')

  // Step 5: Contrast State
  const [contrastChoice, setContrastChoice] = useState('')

  // Step 6: Color Vision States
  const [colorRound, setColorRound] = useState(0)
  const [colorAnswers, setColorAnswers] = useState([]) // true or false array
  const colorNumbers = [7, 5]

  // Step 7: Blur Choice State
  const [blurChoice, setBlurChoice] = useState('')

  // Modal Entrance cinematic sequence
  useEffect(() => {
    if (!isOpen) return

    gsap.set(overlayRef.current, { backgroundColor: 'rgba(15, 15, 15, 0)' })
    gsap.set(glassesCanvasRef.current, { scale: 0.4, x: '0%', y: '0%', filter: 'blur(0px)', opacity: 1 })
    gsap.set(uiInterfaceRef.current, { opacity: 0, x: 50 })

    const tl = gsap.timeline({
      onComplete: () => {
        setIntroComplete(true)
      }
    })

    // Cinematic orchestration (approx 1.8 seconds)
    tl.to(overlayRef.current, { backgroundColor: '#0F0F0F', duration: 0.6, ease: 'power2.inOut' })
      .to(glassesCanvasRef.current, { scale: 1.8, duration: 0.7, ease: 'power3.inOut' }, '-=0.3')
      .to(glassesCanvasRef.current, { scale: 0.95, x: '-22%', filter: 'blur(1.2px)', duration: 0.6, ease: 'power2.inOut' })
      .to(uiInterfaceRef.current, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, '-=0.2')
  }, [isOpen])

  // Setup initial letter for distance round
  useEffect(() => {
    if (step === 2) {
      const randomChar = snellenLetters[Math.floor(Math.random() * snellenLetters.length)]
      setCurrentLetter(randomChar)
    }
  }, [step, distanceRound])

  // Computed results and dynamic suggestions based on responses
  const results = useMemo(() => {
    if (step !== 8) return null

    const correctDistanceCount = distanceAnswers.filter(Boolean).length
    const correctColorCount = colorAnswers.filter(Boolean).length

    const hasDistortion = astigmatismChoice !== 'all'
    const lowContrast = contrastChoice === 'no'
    const largeNearFont = nearFontSize > 17

    return {
      distance: correctDistanceCount >= 2 ? 'Excellent' : 'Needs Calibration',
      near: largeNearFont ? 'Magnification Needed' : 'Good',
      astigmatism: hasDistortion ? 'Possible Distortion' : 'No Significant Signs',
      color: correctColorCount === 2 ? 'Normal' : 'Atypical Perception',
      contrast: lowContrast ? 'Reduced Sensitivity' : 'Good',
      blueBlocker: lowContrast || correctDistanceCount < 3,
      antiReflective: hasDistortion || lowContrast,
      tintColor: (lowContrast || correctDistanceCount < 3) ? '#E8F2FF' : hasDistortion ? '#D0E5FF' : '#FFF'
    }
  }, [step, distanceAnswers, colorAnswers, astigmatismChoice, contrastChoice, nearFontSize])

  // Close animation handler
  const handleClose = () => {
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
      onComplete: onClose
    })
  }

  // Answer handler for distance vision
  const handleDistanceAnswer = (selectedLetter) => {
    const isCorrect = selectedLetter === currentLetter
    const newAnswers = [...distanceAnswers, isCorrect]
    setDistanceAnswers(newAnswers)

    if (distanceRound < 2) {
      setDistanceRound(distanceRound + 1)
    } else {
      setStep(3)
    }
  }

  // Answer handler for color vision Ishihara round
  const handleColorAnswer = (selectedNum) => {
    const isCorrect = parseInt(selectedNum) === colorNumbers[colorRound]
    const newAnswers = [...colorAnswers, isCorrect]
    setColorAnswers(newAnswers)

    if (colorRound < 1) {
      setColorRound(colorRound + 1)
    } else {
      setStep(7)
    }
  }

  // Helper size values for Snellen letter scaling
  const getSnellenFontSize = () => {
    switch (distanceRound) {
      case 0: return '5.5rem'
      case 1: return '2.5rem'
      case 2:
      default: return '1.1rem'
    }
  }

  // Helper contrast colors
  const getContrastValue = (idx) => {
    switch (idx) {
      case 0: return 'rgba(255,255,255,1.0)'
      case 1: return 'rgba(255,255,255,0.7)'
      case 2: return 'rgba(255,255,255,0.4)'
      case 3: return 'rgba(255,255,255,0.22)'
      case 4: return 'rgba(255,255,255,0.11)'
      case 5:
      default: return 'rgba(255,255,255,0.05)'
    }
  }

  // Dynamic calculated blur amount for Step 7 simulation
  const getSimulatedBlurAmount = () => {
    let score = 0
    const correctDistanceCount = distanceAnswers.filter(Boolean).length
    score += (3 - correctDistanceCount) * 1.5
    if (astigmatismChoice !== 'all') score += 2.0
    if (nearFontSize > 16) score += 1.0
    return Math.min(5.5, score)
  }

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0F0F0F',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* Absolute Close X Trigger */}
      <button
        onClick={handleClose}
        style={{
          position: 'absolute',
          top: '30px',
          right: '40px',
          background: 'transparent',
          border: 'none',
          color: '#FFFFFF',
          opacity: 0.5,
          cursor: 'pointer',
          zIndex: 1010,
          transition: 'opacity 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.opacity = 1}
        onMouseLeave={(e) => e.target.style.opacity = 0.5}
      >
        <X size={24} />
      </button>

      {/* Grid wrapper for Left Visualizer and Right Questions UI */}
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'grid',
          gridTemplateColumns: '42vw 58vw',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}
      >
        {/* Left Column: Floating 3D Canvas */}
        <div
          ref={glassesCanvasRef}
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          <div style={{ width: '100%', height: '500px' }}>
            <Canvas 
              dpr={[1, 2]} 
              camera={{ position: [0, 0, 2.6], fov: 45 }} 
              gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            >
              <ambientLight intensity={0.45} />
              <directionalLight position={[3, 5, 4]} intensity={1.8} />
              <spotLight position={[-4, 4, -4]} intensity={1.5} color="#D7B46A" />
              <Environment preset="studio" />
              <ModalGlasses step={step} lensTint={results?.tintColor} />
            </Canvas>
          </div>
        </div>

        {/* Right Column: Screen assessment questions and cards */}
        <div
          ref={uiInterfaceRef}
          style={{
            paddingRight: '12%',
            paddingLeft: '4%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            color: '#FFFFFF',
            zIndex: 10
          }}
        >
          {/* Welcome Screen */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <span style={{ fontSize: '0.7rem', letterSpacing: '0.3em', color: '#D7B46A', textTransform: 'uppercase' }}>
                ONLINE SCREENING
              </span>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 100, lineHeight: 1.1, margin: 0 }}>
                WELCOME TO VISION ONE EYE TEST
              </h1>
              <p style={{ fontSize: '0.9rem', color: '#C8C8C8', lineHeight: 1.5, margin: '10px 0 20px 0', maxWidth: '500px' }}>
                Use your prescription glasses if you normally wear them. Sit approximately 60 cm from your screen. Good lighting is recommended.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '10px', borderLeft: '1px solid rgba(255,255,255,0.08)', marginBottom: '15px' }}>
                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>✓ Takes approximately 2 minutes</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>✓ Guided interactive questions</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>✓ Instant personalized lens report</span>
              </div>

              <button
                onClick={() => setStep(2)}
                style={{
                  alignSelf: 'flex-start',
                  padding: '14px 40px',
                  backgroundColor: '#D7B46A',
                  color: '#FFF',
                  border: 'none',
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '0.85rem',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'opacity 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.opacity = 0.9}
                onMouseLeave={(e) => e.target.style.opacity = 1}
              >
                Begin Test
              </button>
            </div>
          )}

          {/* Step 2: Distance Vision (Snellen Letter shrinker) */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <span style={{ fontSize: '0.7rem', letterSpacing: '0.25em', color: '#D7B46A', textTransform: 'uppercase' }}>
                STEP 1 OF 6 : DISTANCE VISION
              </span>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 200, margin: 0 }}>
                Identify the letters shown in the box
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#C8C8C8', margin: 0, opacity: 0.7 }}>
                Sit 60cm away and identify the character below by clicking on the keypad pad.
              </p>

              {/* Snellen letter canvas box */}
              <div
                style={{
                  width: '280px',
                  height: '180px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '10px 0'
                }}
              >
                <span
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: getSnellenFontSize(),
                    fontWeight: 900,
                    letterSpacing: '0',
                    color: '#FFFFFF',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {currentLetter}
                </span>
              </div>

              {/* Pad selections */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', maxWidth: '300px' }}>
                {snellenLetters.map((char) => (
                  <button
                    key={char}
                    onClick={() => handleDistanceAnswer(char)}
                    style={{
                      height: '42px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      fontSize: '0.9rem',
                      fontFamily: 'Outfit, sans-serif',
                      fontWeight: 600,
                      cursor: 'pointer',
                      borderRadius: '3px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(215, 180, 106, 0.15)'
                      e.target.style.borderColor = '#D7B46A'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    {char}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Near Vision (Font Size scaling) */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <span style={{ fontSize: '0.7rem', letterSpacing: '0.25em', color: '#D7B46A', textTransform: 'uppercase' }}>
                STEP 2 OF 6 : NEAR VISION
              </span>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 200, margin: 0 }}>
                Adjust text size until it is legible
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#C8C8C8', margin: 0, opacity: 0.7 }}>
                Shrink the text using the buttons below until it is the smallest size you can read comfortably.
              </p>

              {/* Responsive Text paragraph block */}
              <div
                style={{
                  width: '460px',
                  padding: '24px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '4px',
                  margin: '10px 0',
                  boxSizing: 'border-box'
                }}
              >
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: `${nearFontSize}px`,
                    lineHeight: '1.5',
                    color: '#FFFFFF',
                    margin: 0,
                    transition: 'font-size 0.2s ease'
                  }}
                >
                  Vision is the art of seeing what is invisible to others. The details of craftsmanship, the refraction of premium lenses, and the alignment of raw titanium are only appreciated by those who look closely.
                </p>
              </div>

              {/* Adjust Sizers */}
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <button
                  onClick={() => setNearFontSize(Math.max(9, nearFontSize - 1))}
                  style={{
                    padding: '8px 20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    borderRadius: '3px'
                  }}
                >
                  - Smaller
                </button>
                <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', opacity: 0.7 }}>{nearFontSize}px</span>
                <button
                  onClick={() => setNearFontSize(Math.min(24, nearFontSize + 1))}
                  style={{
                    padding: '8px 20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    borderRadius: '3px'
                  }}
                >
                  + Larger
                </button>
              </div>

              <button
                onClick={() => setStep(4)}
                style={{
                  alignSelf: 'flex-start',
                  marginTop: '15px',
                  padding: '12px 36px',
                  backgroundColor: '#D7B46A',
                  color: '#FFF',
                  border: 'none',
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '0.8rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Confirm Sizing
              </button>
            </div>
          )}

          {/* Step 4: Astigmatism (Clock Wheel) */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <span style={{ fontSize: '0.7rem', letterSpacing: '0.25em', color: '#D7B46A', textTransform: 'uppercase' }}>
                STEP 3 OF 6 : ASTIGMATISM
              </span>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 200, margin: 0 }}>
                Which lines appear darker or sharper?
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#C8C8C8', margin: 0, opacity: 0.7 }}>
                Cover one eye and inspect the radial line wheel below.
              </p>

              {/* SVG Radial Wheel */}
              <div style={{ margin: '15px 0' }}>
                <svg width="180" height="180" viewBox="0 0 100 100" style={{ display: 'block', margin: '0' }}>
                  <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
                  {[0, 30, 60, 90, 120, 150].map((angle) => (
                    <line
                      key={angle}
                      x1="50"
                      y1="2"
                      x2="50"
                      y2="98"
                      stroke="#FFFFFF"
                      strokeWidth={
                        (astigmatismChoice === 'top' && (angle === 90)) ||
                        (astigmatismChoice === 'left' && (angle === 0)) ||
                        (astigmatismChoice === 'diagonal' && (angle === 30 || angle === 120))
                          ? '1.2'
                          : '0.5'
                      }
                      opacity={
                        (astigmatismChoice === 'top' && (angle === 90)) ||
                        (astigmatismChoice === 'left' && (angle === 0)) ||
                        (astigmatismChoice === 'diagonal' && (angle === 30 || angle === 120))
                          ? '1.0'
                          : '0.45'
                      }
                      transform={`rotate(${angle} 50 50)`}
                    />
                  ))}
                  <circle cx="50" cy="50" r="10" fill="#0F0F0F" stroke="#D7B46A" strokeWidth="0.8" />
                </svg>
              </div>

              {/* Choice pads */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', maxWidth: '420px' }}>
                {[
                  { label: 'Top / Bottom', value: 'top' },
                  { label: 'Left / Right', value: 'left' },
                  { label: 'Diagonal', value: 'diagonal' },
                  { label: 'All Equal', value: 'all' }
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => {
                      setAstigmatismChoice(item.value)
                      setTimeout(() => setStep(5), 200)
                    }}
                    style={{
                      padding: '12px 10px',
                      backgroundColor: astigmatismChoice === item.value ? 'rgba(215,180,106,0.15)' : 'rgba(255,255,255,0.03)',
                      border: astigmatismChoice === item.value ? '1px solid #D7B46A' : '1px solid rgba(255,255,255,0.08)',
                      color: astigmatismChoice === item.value ? '#D7B46A' : '#FFFFFF',
                      fontSize: '0.75rem',
                      fontFamily: 'Outfit, sans-serif',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      borderRadius: '3px'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Contrast Sensitivity (Fading letters) */}
          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <span style={{ fontSize: '0.7rem', letterSpacing: '0.25em', color: '#D7B46A', textTransform: 'uppercase' }}>
                STEP 4 OF 6 : CONTRAST SENSITIVITY
              </span>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 200, margin: 0 }}>
                Can you read all letters below?
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#C8C8C8', margin: 0, opacity: 0.7 }}>
                The characters gradually decrease in contrast against the background.
              </p>

              {/* Fading letters container */}
              <div
                style={{
                  width: '380px',
                  padding: '28px 20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  margin: '10px 0'
                }}
              >
                {['C', 'A', 'R', 'L', 'Z', 'S'].map((char, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: 800,
                      fontFamily: 'Outfit, sans-serif',
                      color: getContrastValue(idx),
                      letterSpacing: '0',
                      lineHeight: '1.0'
                    }}
                  >
                    {char}
                  </span>
                ))}
              </div>

              {/* Response button actions */}
              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  onClick={() => {
                    setContrastChoice('yes')
                    setStep(6)
                  }}
                  style={{
                    padding: '12px 35px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'}
                >
                  Yes, clearly
                </button>
                <button
                  onClick={() => {
                    setContrastChoice('no')
                    setStep(6)
                  }}
                  style={{
                    padding: '12px 35px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'}
                >
                  No, some blur
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Color Vision (Ishihara) */}
          {step === 6 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <span style={{ fontSize: '0.7rem', letterSpacing: '0.25em', color: '#D7B46A', textTransform: 'uppercase' }}>
                STEP 5 OF 6 : COLOR PERCEPTION
              </span>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 200, margin: 0 }}>
                Identify the hidden number in the circle
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#C8C8C8', margin: 0, opacity: 0.7 }}>
                Provide the digit form packing hidden in the plates (Round {colorRound + 1} of 2).
              </p>

              {/* Procedural plate */}
              <div style={{ margin: '10px 0' }}>
                <IshiharaPlate number={colorNumbers[colorRound]} />
              </div>

              {/* Multiple choice button list */}
              <div style={{ display: 'flex', gap: '10px', maxWidth: '350px' }}>
                {(colorRound === 0 ? ['7', '2', '12', 'Unsure'] : ['5', '6', '3', 'Unsure']).map((num) => (
                  <button
                    key={num}
                    onClick={() => handleColorAnswer(num)}
                    style={{
                      flex: 1,
                      padding: '10px 0',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: '#FFFFFF',
                      fontSize: '0.8rem',
                      fontFamily: 'Outfit, sans-serif',
                      cursor: 'pointer',
                      borderRadius: '3px'
                    }}
                    onMouseEnter={(e) => e.target.style.borderColor = '#D7B46A'}
                    onMouseLeave={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 7: Blur Simulation (Focal clarity check) */}
          {step === 7 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <span style={{ fontSize: '0.7rem', letterSpacing: '0.25em', color: '#D7B46A', textTransform: 'uppercase' }}>
                STEP 6 OF 6 : FOCAL SIMULATION
              </span>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 200, margin: 0 }}>
                Which focus representation appears clearer?
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#C8C8C8', margin: 0, opacity: 0.7 }}>
                Lens A represents your simulated sight based on previous selections; Lens B is fully corrected.
              </p>

              {/* Side-by-side comparison images */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '10px 0' }}>
                {/* Lens A: Simulated sight (blurred) */}
                <div
                  onClick={() => {
                    setBlurChoice('A')
                    setStep(8)
                  }}
                  style={{
                    border: blurChoice === 'A' ? '2px solid #D7B46A' : '1px solid rgba(255,255,255,0.08)',
                    padding: '24px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: '15px' }}>LENS A (SIMULATED)</h4>
                  <div style={{ filter: `blur(${getSimulatedBlurAmount()}px)`, transition: 'filter 0.3s ease' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: '#FFFFFF' }}>V O D</span>
                  </div>
                </div>

                {/* Lens B: Fully Corrected (sharp) */}
                <div
                  onClick={() => {
                    setBlurChoice('B')
                    setStep(8)
                  }}
                  style={{
                    border: blurChoice === 'B' ? '2px solid #D7B46A' : '1px solid rgba(255,255,255,0.08)',
                    padding: '24px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <h4 style={{ fontSize: '0.75rem', letterSpacing: '0.1em', marginBottom: '15px' }}>LENS B (CORRECTED)</h4>
                  <div style={{ filter: 'blur(0px)' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: '#FFFFFF' }}>V O D</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 8: Diagnostic Results & Eyewear Recommendations */}
          {step === 8 && results && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '90vh', overflowY: 'auto', paddingRight: '20px' }}>
              <span style={{ fontSize: '0.7rem', letterSpacing: '0.3em', color: '#D7B46A', textTransform: 'uppercase' }}>
                DIAGNOSTIC REPORT
              </span>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.2rem', fontWeight: 100, margin: 0, lineHeight: 1.1 }}>
                YOUR VISION REPORT IS READY
              </h2>

              {/* Assessment details grids */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginTop: '10px' }}>
                {[
                  { title: 'Distance Vision', value: results.distance },
                  { title: 'Near Vision', value: results.near },
                  { title: 'Astigmatism', value: results.astigmatism },
                  { title: 'Color Vision', value: results.color },
                  { title: 'Contrast Sensitivity', value: results.contrast }
                ].map((item) => (
                  <div
                    key={item.title}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '3px'
                    }}
                  >
                    <div style={{ fontSize: '0.65rem', opacity: 0.5, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: item.value.includes('Needs') || item.value.includes('Needed') || item.value.includes('Possible') ? '#D7B46A' : '#FFFFFF' }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommended Lenses */}
              <div style={{ marginTop: '10px' }}>
                <span style={{ fontSize: '0.7rem', letterSpacing: '0.2em', opacity: 0.6, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  RECOMMENDED LENSES
                </span>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {results.blueBlocker && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: 'rgba(215, 180, 106, 0.08)', border: '1px solid rgba(215,180,106,0.3)', borderRadius: '3px' }}>
                      <Check size={12} color="#D7B46A" />
                      <span style={{ fontSize: '0.7rem', color: '#D7B46A', letterSpacing: '0.05em' }}>Blue Light Protection</span>
                    </div>
                  )}
                  {results.antiReflective && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: 'rgba(215, 180, 106, 0.08)', border: '1px solid rgba(215,180,106,0.3)', borderRadius: '3px' }}>
                      <Check size={12} color="#D7B46A" />
                      <span style={{ fontSize: '0.7rem', color: '#D7B46A', letterSpacing: '0.05em' }}>Anti-Reflective Coating</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '3px' }}>
                    <Check size={12} color="#FFFFFF" />
                    <span style={{ fontSize: '0.7rem', color: '#FFFFFF', letterSpacing: '0.05em' }}>UV400 Shield</span>
                  </div>
                </div>
              </div>

              {/* Eyewear catalog recommendations */}
              <div style={{ marginTop: '10px' }}>
                <span style={{ fontSize: '0.7rem', letterSpacing: '0.2em', opacity: 0.6, textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                  MATCHING EYEWEAR RECOMMENDATION
                </span>
                <div style={{ display: 'flex', gap: '15px' }}>
                  {[
                    { name: 'Obsidian Noir', price: '$420', desc: 'Chunky acetate, square frame design.' },
                    { name: 'Aerospace Raw', price: '$480', desc: 'Ultra-thin rect titanium profile.' }
                  ].map((glass) => (
                    <div
                      key={glass.name}
                      style={{
                        flex: 1,
                        padding: '16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '3px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>{glass.name}</span>
                        <span style={{ fontSize: '0.75rem', color: '#D7B46A' }}>{glass.price}</span>
                      </div>
                      <p style={{ fontSize: '0.65rem', color: '#C8C8C8', lineHeight: 1.3, margin: 0 }}>
                        {glass.desc}
                      </p>
                      <button
                        onClick={handleClose}
                        style={{
                          marginTop: '10px',
                          padding: '6px 0',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderBottom: '1px solid #D7B46A',
                          color: '#D7B46A',
                          fontSize: '0.65rem',
                          fontFamily: 'Outfit, sans-serif',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          alignSelf: 'flex-start'
                        }}
                      >
                        Select Frames
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <p
                style={{
                  fontSize: '0.6rem',
                  lineHeight: '1.4',
                  color: '#888888',
                  marginTop: '15px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingTop: '15px',
                  margin: 0
                }}
              >
                Disclaimer: This vision assessment is intended for educational and screening purposes only. It does not replace a comprehensive eye examination by a licensed optometrist or ophthalmologist. If you experience vision problems, consult an eye care professional.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VisionTestModal
