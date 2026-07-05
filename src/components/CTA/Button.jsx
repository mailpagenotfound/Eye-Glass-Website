import React from 'react'
import { motion } from 'framer-motion'

function Button({ text = 'Explore Collection', href = '#', onClick, isReady, variant = 'underline', delay = 0 }) {
  const entranceVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1], delay },
    },
  }

  // Dark glass variant: Start Eye Test
  if (variant === 'glass') {
    return (
      <motion.div
        variants={entranceVariants}
        initial="hidden"
        animate={isReady ? 'visible' : 'hidden'}
        style={{ display: 'inline-block', pointerEvents: 'all' }}
      >
        <motion.a
          href={href}
          onClick={onClick}
          whileHover={{ 
            y: -3, 
            scale: 1.03,
            borderColor: '#D7B46A',
            boxShadow: '0 0 20px rgba(215, 180, 106, 0.3)',
            color: '#D7B46A'
          }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '0.78rem',
            fontWeight: 400,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#FFFFFF',
            textDecoration: 'none',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            padding: '11px 26px',
            borderRadius: '24px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxSizing: 'border-box',
            transition: 'color 0.3s ease, border-color 0.3s ease',
          }}
        >
          {text}
        </motion.a>
      </motion.div>
    )
  }

  // Default Underline variant: Explore Collection
  const lineVariants = {
    initial: { width: 0, left: 0 },
    hover: { width: '100%', transition: { duration: 0.45, ease: 'easeInOut' } }
  }

  const arrowVariants = {
    initial: { x: 0 },
    hover: { x: 6, transition: { duration: 0.3, ease: 'easeOut' } }
  }

  const linkHoverVariants = {
    initial: { y: 0, scale: 1 },
    hover: { y: -3, scale: 1.02, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
  }

  return (
    <motion.div
      variants={entranceVariants}
      initial="hidden"
      animate={isReady ? 'visible' : 'hidden'}
      style={{ display: 'inline-block', pointerEvents: 'all' }}
    >
      <motion.a
        href={href}
        onClick={onClick}
        initial="initial"
        whileHover="hover"
        variants={linkHoverVariants}
        style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '0.78rem',
          fontWeight: 400,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#D7B46A', // Golden Accent color
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          position: 'relative',
          paddingBottom: '8px',
          cursor: 'pointer',
        }}
      >
        <span>{text}</span>
        
        {/* Sliding Arrow */}
        <motion.span
          variants={arrowVariants}
          style={{ fontSize: '0.9rem', display: 'inline-block', lineHeight: 1.0 }}
        >
          →
        </motion.span>
        
        {/* Underline animated bar */}
        <motion.span
          variants={lineVariants}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '1px',
            backgroundColor: '#D7B46A',
            display: 'block',
          }}
        />
      </motion.a>
    </motion.div>
  )
}

export default Button
