import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PRODUCT_DETAILS = [
  {
    name: 'OBSIDIAN NOIR',
    collection: 'DESIGN STUDY / 01',
    desc: 'Organic handcrafted acetate meets gold titanium hardware. A timeless dark silhouette of absolute mystique.',
    price: '$420'
  },
  {
    name: 'TITANIUM EDGE',
    collection: 'DESIGN STUDY / 02',
    desc: 'Sleek matte silver titanium chassis, representing absolute minimalism. Seamless industrial lines built for zero-weight comfort.',
    price: '$460'
  },
  {
    name: 'CRYSTAL HERITAGE',
    collection: 'DESIGN STUDY / 03',
    desc: 'High-transmission crystal-clear acetate frames featuring hand-polished champagne hardware. An elegant look for modern posture.',
    price: '$450'
  },
  {
    name: 'AURUM PRESTIGE',
    collection: 'DESIGN STUDY / 04',
    desc: 'Limited edition Havana tortoise shell acetate paired with brushed bronze hardware. Handcrafted warmth with a cinematic character.',
    price: '$495'
  }
]

function ProductInfo({ activeIndex, isReady }) {
  const current = PRODUCT_DETAILS[activeIndex]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  const fadeUpItem = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] }
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: { duration: 0.4, ease: 'easeIn' }
    }
  }

  return (
    <div style={{ pointerEvents: 'none', minWidth: '400px', display: 'flex', flexDirection: 'column' }}>
      <AnimatePresence mode="wait">
        {isReady && (
          <motion.div
            key={activeIndex}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}
          >
            {/* Product Name */}
            <motion.h1
              variants={fadeUpItem}
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 'clamp(2.0rem, 4.5vw, 3.8rem)',
                fontWeight: 100,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#FFFFFF',
                margin: 0,
                lineHeight: 1.1
              }}
            >
              {current.name}
            </motion.h1>

            {/* Accent divider line */}
            <motion.div
              variants={fadeUpItem}
              style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '8px', marginBottom: '8px' }}
            >
              <div style={{ width: '35px', height: '1px', backgroundColor: '#D7B46A' }} />
              <span style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '0.75rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#FFFFFF',
                fontWeight: 300
              }}>
                {current.price} USD
              </span>
            </motion.div>

            {/* Description */}
            <motion.p
              variants={fadeUpItem}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.85rem',
                lineHeight: '1.7',
                color: '#D2D2D2',
                maxWidth: '350px',
                margin: 0,
                letterSpacing: '0.02em',
                fontWeight: 300,
                marginTop: '6px'
              }}
            >
              {current.desc}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProductInfo
