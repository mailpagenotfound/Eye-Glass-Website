import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function BackgroundParticles({ count = 120, active = true }) {
  const pointsRef = useRef()

  const [positions, speeds, randoms] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const spd = new Float32Array(count)
    const rnd = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      // Spread particles in a box volume
      pos[i * 3] = (Math.random() - 0.5) * 8
      pos[i * 3 + 1] = (Math.random() - 0.5) * 5
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5 - 1.0 // slightly behind the glasses
      spd[i] = 0.02 + Math.random() * 0.05
      rnd[i] = Math.random() * 100
    }
    return [pos, spd, rnd]
  }, [count])

  useFrame((state, delta) => {
    if (!active || !pointsRef.current) return

    const points = pointsRef.current
    const posArray = points.geometry.attributes.position.array
    const time = state.clock.getElapsedTime()

    for (let i = 0; i < count; i++) {
      const yIdx = i * 3 + 1
      const xIdx = i * 3
      const zIdx = i * 3 + 2
      
      // Upward drift
      posArray[yIdx] += speeds[i] * delta
      // Subtle organic side-to-side float
      posArray[xIdx] += Math.sin(time * 0.4 + randoms[i]) * 0.04 * delta
      posArray[zIdx] += Math.cos(time * 0.3 + randoms[i]) * 0.02 * delta

      // Reset when drifting out of screen space
      if (posArray[yIdx] > 2.5) {
        posArray[yIdx] = -2.5
        posArray[xIdx] = (Math.random() - 0.5) * 8
      }
    }
    points.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#D7B46A" // Luxury champagne gold dust
        size={0.028}
        transparent
        opacity={active ? 0.45 : 0.0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default BackgroundParticles
