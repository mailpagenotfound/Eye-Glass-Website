import { useState, useEffect, useRef } from 'react'

export function useInView(options = {}) {
  const [inView, setInView] = useState(false)
  const [element, setElement] = useState(null)

  const { root = null, rootMargin = '800px', threshold = 0.01 } = options

  // Internal ref to store the actual DOM element
  const ref = useRef(null)
  
  // Custom ref object with setter to trigger state updates when element is bound
  const refObject = useRef({
    get current() {
      return ref.current
    },
    set current(node) {
      if (ref.current !== node) {
        ref.current = node
        setElement(node)
      }
    }
  }).current

  useEffect(() => {
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting)
    }, {
      root,
      rootMargin,
      threshold
    })

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [element, root, rootMargin, threshold])

  return [refObject, inView]
}
