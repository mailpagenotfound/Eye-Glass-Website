import React from 'react'
import { motion } from 'framer-motion'

function Indicator({ isReady }) {
  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={isReady ? 'visible' : 'hidden'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px',
        pointerEvents: 'all',
        cursor: 'pointer'
      }}
      onClick={() => {
        // Smooth scroll fallback helper
        window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })
      }}
    >
      {/* Scroll indicator text */}
      <span
        style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '0.72rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#D7B46A',
          fontWeight: 400,
          writingMode: 'horizontal-tb'
        }}
      >
        SCROLL TO EXPLORE
      </span>

      {/* Elegant sliding dot track */}
      <div
        style={{
          position: 'relative',
          height: '60px',
          width: '1px',
          backgroundColor: 'rgba(215, 180, 106, 0.15)',
          overflow: 'visible'
        }}
      >
        {/* Bouncing sliding dot indicator */}
        <motion.div
          animate={{
            y: [0, 50, 50],
            opacity: [0, 1, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: 2.0,
            ease: 'easeInOut'
          }}
          style={{
            position: 'absolute',
            left: '-2px',
            top: 0,
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            backgroundColor: '#D7B46A', // Golden Accent color
            boxShadow: '0 0 8px rgba(215, 180, 106, 0.6)'
          }}
        />
      </div>
    </motion.div>
  )
}

export default Indicator
