import React, { useState, useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import HeroScene from './HeroScene'
import Button from '../CTA/Button'
import Indicator from '../ScrollIndicator/Indicator'

gsap.registerPlugin(ScrollTrigger)

function Hero({ isReady, onTimelineComplete }) {
  const [hoverState, setHoverState] = useState('none') // 'none', 'hero', 'glasses'
  const [lensHovered, setLensHovered] = useState('none') // 'none', 'left', 'right'
  const [scrollProgress, setScrollProgress] = useState(0)

  const containerRef = useRef(null)

  // Scroll pinning and progress evaluation
  useEffect(() => {
    if (!isReady) return

    const container = containerRef.current
    if (!container) return

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: '+=1000', // Pin duration
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        setScrollProgress(self.progress)
      }
    })

    return () => {
      trigger.kill()
    }
  }, [isReady])

  const handleHoverGlassesState = useCallback((state) => {
    setHoverState(state)
  }, [])

  // Start eye test test modal trigger
  const handleStartEyeTest = (e) => {
    e.preventDefault()
    // Open modal via hash change or dispatching click event
    const navBtn = document.querySelector('a[href="#vision-assessment-section"]')
    if (navBtn) {
      navBtn.click()
    } else {
      window.location.hash = 'vision-assessment-section'
    }
  }

  return (
    <section
      ref={containerRef}
      id="hero"
      onMouseEnter={() => setHoverState('hero')}
      onMouseLeave={() => setHoverState('none')}
      style={{
        height: '100vh',
        width: '100vw',
        position: 'relative',
        backgroundColor: '#000000',
        boxSizing: 'border-box',
        overflow: 'hidden',
        userSelect: 'none'
      }}
    >
      {/* 3D WebGL Canvas Layer */}
      <HeroScene
        activeIndex={2} // Crystal Heritage
        prevIndex={2}
        direction="next"
        isTransitioning={false}
        setIsTransitioning={() => {}}
        hoverState={hoverState}
        onHoverGlassesState={handleHoverGlassesState}
        isReady={isReady}
        onTimelineComplete={onTimelineComplete}
        onTextUpdate={() => {}}
        lensHovered={lensHovered}
        onHoverLens={setLensHovered}
        scrollProgress={scrollProgress}
      />

      {/* Centered Brand Content (Museum-style Luxury Layout) */}
      <div 
        style={{ 
          position: 'absolute', 
          left: '50%', 
          top: '75%', // Positioned elegantly below the centered larger glasses
          transform: 'translate(-50%, -50%)', 
          width: '100%',
          maxWidth: '900px', // Constrained to max 900px
          textAlign: 'center',
          zIndex: 5, 
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          opacity: 1.0 - scrollProgress * 2.0,
          transition: 'opacity 0.35s ease-out'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}
        >
          {/* Headline */}
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2.2rem, 5.5vw, 4.2rem)',
            fontWeight: 200,
            letterSpacing: '0.24em',
            color: '#FFFFFF',
            margin: 0,
            textTransform: 'uppercase',
            lineHeight: 1.1
          }}>
            SEE DIFFERENTLY
          </h1>
          
          {/* Subtitle */}
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(0.85rem, 1.2vw, 1.0rem)',
            fontWeight: 300,
            color: '#C8C8C8',
            letterSpacing: '0.04em',
            maxWidth: '650px', // Constrained to max 650px (under 700px limit)
            lineHeight: '1.65',
            margin: '5px 0 0 0',
            textAlign: 'center'
          }}>
            The world becomes clearer when premium craftsmanship meets precision optics.
          </p>
        </motion.div>
      </div>

      {/* Centered Scroll Indicator */}
      <div 
        style={{ 
          position: 'absolute', 
          left: '50%', 
          bottom: '4%', 
          transform: 'translateX(-50%)',
          zIndex: 5,
          pointerEvents: 'auto',
          opacity: 1.0 - scrollProgress * 2.0,
          transition: 'opacity 0.35s ease-out'
        }}
      >
        <Indicator isReady={isReady} />
      </div>
      
      {/* Clean responsive layout styling overrides */}
      <style>{`
        @media (max-width: 900px) {
          #hero {
            padding: 100px 30px 40px 30px !important;
          }
        }
      `}</style>
    </section>
  )
}

export default Hero
export const AUTO_SLIDE_DURATION = 6000
