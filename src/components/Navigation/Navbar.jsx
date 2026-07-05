import React from 'react'
import { motion } from 'framer-motion'

function Navbar({ isReady }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] },
    },
  }

  const centerLinks = ['Collection', 'Technology', 'Eye Test', 'Craftsmanship', 'Journal']
  const linkMapping = {
    'Collection': '#collection',
    'Technology': '#lens-tech',
    'Eye Test': '#vision-assessment-section',
    'Craftsmanship': '#exploded',
    'Journal': '#testimonials'
  }

  const [visible, setVisible] = React.useState(true)
  const [atTop, setAtTop] = React.useState(true)
  const lastScrollY = React.useRef(0)

  React.useEffect(() => {
    // Initial check
    setAtTop(window.scrollY < 50)

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setAtTop(currentScrollY < 50)

      if (currentScrollY > 80 && currentScrollY > lastScrollY.current) {
        // Scrolling down - hide
        setVisible(false)
      } else {
        // Scrolling up - show
        setVisible(true)
      }
      lastScrollY.current = currentScrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header
      variants={containerVariants}
      initial="hidden"
      animate={isReady ? 'visible' : 'hidden'}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: atTop ? '95px' : '75px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 50px',
        backgroundColor: atTop ? 'transparent' : 'rgba(11, 11, 11, 0.95)',
        backdropFilter: atTop ? 'none' : 'blur(20px)',
        WebkitBackdropFilter: atTop ? 'none' : 'blur(20px)',
        borderBottom: atTop ? '1px solid transparent' : '1px solid rgba(255, 255, 255, 0.08)',
        boxSizing: 'border-box',
        zIndex: 1000,
        pointerEvents: 'auto',
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.35s ease, border-color 0.35s ease, height 0.35s ease, backdrop-filter 0.35s ease',
      }}
    >
      {/* Left side: Logo VISION ONE + golden square */}
      <motion.div
        variants={itemVariants}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <a
          href="#"
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '0.9rem',
            fontWeight: 300,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: '#FFFFFF',
            textDecoration: 'none',
          }}
        >
          VISION ONE
        </a>
        <div
          style={{
            width: '6px',
            height: '6px',
            backgroundColor: '#D7B46A', // Golden Square
          }}
        />
      </motion.div>

      {/* Center navigation links */}
      <motion.nav
        style={{
          display: 'flex',
          gap: '35px',
          alignItems: 'center',
          opacity: atTop ? 0 : 1,
          pointerEvents: atTop ? 'none' : 'auto',
          transition: 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="nav-center-links"
      >
        {centerLinks.map((link) => (
          <motion.a
            key={link}
            variants={itemVariants}
            href={linkMapping[link]}
            className="nav-link"
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '0.72rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#FFFFFF',
              textDecoration: 'none',
              fontWeight: 300,
              paddingBottom: '4px',
              transition: 'color 0.3s ease',
            }}
            onMouseEnter={(e) => (e.target.style.color = '#D7B46A')}
            onMouseLeave={(e) => (e.target.style.color = '#FFFFFF')}
          >
            {link}
          </motion.a>
        ))}
      </motion.nav>

      {/* Right side: CART (0) & MENU */}
      <motion.div
        variants={itemVariants}
        style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'center',
        }}
      >
        <a
          href="#cart"
          className="nav-link"
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '0.72rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#FFFFFF',
            textDecoration: 'none',
            fontWeight: 300,
            paddingBottom: '4px',
            transition: 'color 0.3s ease',
          }}
          onMouseEnter={(e) => (e.target.style.color = '#D7B46A')}
          onMouseLeave={(e) => (e.target.style.color = '#FFFFFF')}
        >
          CART (0)
        </a>
        
        {/* Minimal menu trigger button */}
        <button
          className="nav-link"
          style={{
            background: 'none',
            border: 'none',
            fontFamily: 'Outfit, sans-serif',
            fontSize: '0.72rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#FFFFFF',
            cursor: 'pointer',
            padding: '0 0 4px 0',
            fontWeight: 300,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'color 0.3s ease',
          }}
          onMouseEnter={(e) => (e.target.style.color = '#D7B46A')}
          onMouseLeave={(e) => (e.target.style.color = '#FFFFFF')}
        >
          MENU
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ width: '12px', height: '1px', backgroundColor: 'currentColor' }} />
            <span style={{ width: '12px', height: '1px', backgroundColor: 'currentColor' }} />
          </div>
        </button>
      </motion.div>

      <style>{`
        .nav-link {
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          width: 100%;
          transform: scaleX(0);
          height: 1px;
          bottom: 0;
          left: 0;
          background-color: #D7B46A;
          transform-origin: bottom right;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-link:hover::after {
          transform: scaleX(1);
          transform-origin: bottom left;
        }
        @media (max-width: 900px) {
          .nav-center-links {
            display: none !important;
          }
        }
      `}</style>
    </motion.header>
  )
}

export default Navbar
