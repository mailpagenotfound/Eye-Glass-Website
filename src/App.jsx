import React, { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react'
import { ReactLenis } from '@studio-freight/react-lenis'
import Navbar from './components/Navbar/Navbar'
import Loader from './components/Loader/Loader'
import Hero from './components/Hero/Hero'

// Critical Landing page sections (Directly loaded)
import About from './components/About/About'
import HorizontalGallery from './components/HorizontalGallery/HorizontalGallery'
import ExplodedView from './components/ExplodedView/ExplodedView'
import LensTechnology from './components/LensTechnology/LensTechnology'
import LensSimulator from './components/LensTechnology/LensSimulator'

// Non-critical below-the-fold sections (Dynamically imported)
const VisionAssessment = lazy(() => import('./components/VisionAssessment/VisionAssessment'))
const ColorVariants = lazy(() => import('./components/ColorVariants/ColorVariants'))
const Viewer = lazy(() => import('./components/Viewer/Viewer'))
const Testimonials = lazy(() => import('./components/Testimonials/Testimonials'))
const Footer = lazy(() => import('./components/Footer/Footer'))

// Minimalist placeholder matching site design aesthetics for dynamic transitions
const SectionPlaceholder = ({ height = '100vh', bg = 'var(--bg-primary)' }) => (
  <div style={{ height, width: '100vw', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.15)' }}>
      LOADING VISION STORY
    </div>
  </div>
)

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function App() {
  const [loaderComplete, setLoaderComplete] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const lenisRef = useRef(null)

  // Manage Lenis scroll locks programmatically without changing layout wrapper heights
  useEffect(() => {
    const lenis = lenisRef.current?.lenis
    if (!lenis) return

    if (!isReady) {
      lenis.stop()
    } else {
      lenis.start()
      setTimeout(() => {
        ScrollTrigger.refresh()
      }, 150)
    }
  }, [isReady, loaderComplete])

  // Synchronize GSAP ScrollTrigger updates with Lenis scroll ticks
  useEffect(() => {
    const lenis = lenisRef.current?.lenis
    if (!lenis) return

    const updateScrollTrigger = () => ScrollTrigger.update()
    lenis.on('scroll', updateScrollTrigger)

    return () => {
      lenis.off('scroll', updateScrollTrigger)
    }
  }, [loaderComplete])


  // Handles the WebGL scene GSAP timeline completion
  const handleTimelineComplete = useCallback(() => {
    setIsReady(true)
  }, [])

  return (
    <ReactLenis ref={lenisRef} root options={{ lerp: 0.1, duration: 1.5, smoothTouch: true }}>
      <div 
        className="app-container" 
        style={{ 
          backgroundColor: 'var(--bg-primary)', 
          overflow: 'visible', 
          height: 'auto', 
          width: '100vw' 
        }}
      >
        


        {/* Loader curtain (0s -> 1.5s) */}
        <Loader onComplete={() => setLoaderComplete(true)} />

        {loaderComplete && (
          <>
            {/* Minimal transparent floating Navbar */}
            <Navbar isReady={isReady} />
            
            <main>
              {/* Cinematic Hero Section Container */}
              <Hero
                isReady={isReady}
                onTimelineComplete={handleTimelineComplete}
              />
              
              {/* Other sections of the landing page */}
              <About />
              <HorizontalGallery />
              <ExplodedView />
              <LensTechnology />

              {/* Lens Performance Simulator Chapter */}
              <section
                id="lens-simulator-section"
                style={{
                  minHeight: '100vh',
                  width: '100vw',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  padding: '120px 40px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                }}
              >
                <div style={{ maxWidth: '600px', textAlign: 'center', marginBottom: '20px', pointerEvents: 'none' }}>
                  <span style={{ fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#D7B46A', fontWeight: 600 }}>
                    PERFORMANCE DEMONSTRATION
                  </span>
                  <h2 className="h-medium" style={{ color: 'var(--text-primary)', fontWeight: 300, margin: '10px 0 0 0' }}>
                    INTERACTIVE LENS SIMULATOR
                  </h2>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '10px' }}>
                    Drag the slider to compare raw vision with advanced polarization, blue light shielding, and smart UV transitions.
                  </p>
                </div>
                <LensSimulator />
              </section>

              <Suspense fallback={<SectionPlaceholder />}>
                <VisionAssessment />
                <ColorVariants />
                <Viewer />
                <Testimonials />
                <Footer />
              </Suspense>
            </main>
          </>
        )}
      </div>
    </ReactLenis>
  )
}

export default App
