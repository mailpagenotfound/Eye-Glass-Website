import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0)

  const reviews = [
    {
      quote: "Vision One represents a masterclass in optical convergence. The structural alignment of the frame combined with custom lens tech matches the exacting tolerances of our hardware designs.",
      author: "Senior Director of Industrial Design",
      company: "Apple Inc."
    },
    {
      quote: "A bold experiment that breaks the boundaries of traditional fashion. The way the background marquee reveals itself sharp and amplified through the physical refraction shader is sheer digital magic.",
      author: "Executive Creative Director",
      company: "Gentle Monster Studio"
    },
    {
      quote: "Every radius and line is optimized for aerodynamic facial symmetry. Fusing the PBR materials with clear coat carbon fiber represents high-octane automotive styling in optical form.",
      author: "Chief Styling Architect",
      company: "Porsche Design Group"
    }
  ]

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % reviews.length)
  }

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
  }

  return (
    <section
      id="testimonials"
      style={{
        minHeight: '80vh',
        width: '100vw',
        backgroundColor: '#0F0F0F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}
    >
      <div 
        className="container"
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '40px',
          padding: '80px 20px',
          boxSizing: 'border-box'
        }}
      >
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#D7B46A' }}>
          VERDICTS
        </span>

        {/* Dynamic Editorial Review Card */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '850px', minHeight: '260px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '30px'
              }}
            >
              {/* Quote Text */}
              <p
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 'clamp(1.4rem, 2.5vw, 2.2rem)',
                  fontWeight: 200,
                  lineHeight: '1.5',
                  color: '#FFFFFF',
                  letterSpacing: '0.02em',
                  margin: 0
                }}
              >
                “{reviews[activeIndex].quote}”
              </p>

              {/* Author Credits */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', color: '#D7B46A', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {reviews[activeIndex].author}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#C8C8C8', opacity: 0.7, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  {reviews[activeIndex].company}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel controls */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '20px' }}>
          <button
            onClick={handlePrev}
            aria-label="Previous testimonial"
            className="btn-luxury"
            style={{ padding: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronLeft size={16} />
          </button>
          
          {/* Index Dots */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {reviews.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setActiveIndex(idx)}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: activeIndex === idx ? '#D7B46A' : 'rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease'
                }}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            aria-label="Next testimonial"
            className="btn-luxury"
            style={{ padding: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
