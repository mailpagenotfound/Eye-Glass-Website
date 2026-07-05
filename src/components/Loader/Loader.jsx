import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function Loader({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true)
  const [showLogo, setShowLogo] = useState(false)

  useEffect(() => {
    // Staggered sequence:
    // 0.5s -> Fade logo in
    const logoTimer = setTimeout(() => {
      setShowLogo(true)
    }, 500)

    // 1.5s -> Trigger loader curtain slide up/fade out
    const curtainTimer = setTimeout(() => {
      setIsVisible(false)
      // Call parent complete to trigger secondary timelines
      setTimeout(onComplete, 800)
    }, 1500)

    return () => {
      clearTimeout(logoTimer)
      clearTimeout(curtainTimer)
    }
  }, [onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            y: '-100vh',
            transition: { duration: 1.0, ease: [0.76, 0, 0.24, 1] } 
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#040404',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          <AnimatePresence>
            {showLogo && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <h1
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '1.2rem',
                    fontWeight: 100,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: '#FFFFFF',
                    margin: 0
                  }}
                >
                  VISION ONE
                </h1>
                <span
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '0.65rem',
                    fontWeight: 200,
                    letterSpacing: '0.2em',
                    color: '#C8C8C8',
                    opacity: 0.5,
                    textTransform: 'uppercase'
                  }}
                >
                  APPLE × GENTLE MONSTER × PD
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Loader
