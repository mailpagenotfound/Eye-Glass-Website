import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'

// Import raw GLSL shader files as strings
import refractionVertex from '../../shaders/LensRefraction.glsl?raw'
import chromaticHelper from '../../shaders/Chromatic.glsl?raw'
import blurRevealFragment from '../../shaders/BlurReveal.glsl?raw'

function Glasses({
  marqueeSharpTexture,
  isReady,
  onHoverGlassesState
}) {
  const groupRef = useRef()
  const leftLensRef = useRef()
  const rightLensRef = useRef()

  // 1. Core Materials Configurations
  const frameMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#080808'), // Deep obsidian black
      roughness: 0.04,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      envMapIntensity: 2.2, // Emphasize HDR studio highlights
    })
  }, [])

  const metalMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#C5B358'), // Luxury champagne gold hinges
      metalness: 0.98,
      roughness: 0.12,
      envMapIntensity: 2.5,
    })
  }, [])

  const nosePadMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#FFFFFF'),
      transmission: 0.85,
      opacity: 0.95,
      transparent: true,
      roughness: 0.25,
      thickness: 0.1,
    })
  }, [])

  // Temples move outwards, back, and rotate outwards
  const leftTempleX = -1.68
  const leftTempleExploded = -2.25
  const leftTempleZ = -0.05
  const leftTempleZExploded = -0.8

  const rightTempleX = 1.68
  const rightTempleExploded = 2.25
  const rightTempleZ = -0.05
  const rightTempleZExploded = -0.8

  // 2. Compose the custom GLSL Lens shader
  const lensShaderMaterial = useMemo(() => {
    // Concatenate chromatic helper functions and the fragment body
    const composedFragment = chromaticHelper + '\n' + blurRevealFragment

    return new THREE.ShaderMaterial({
      uniforms: {
        uMarqueeSharp: { value: null },
        uTime: { value: 0 },
        uMouse: { value: [0, 0] },
        uResolution: { value: [window.innerWidth, window.innerHeight] },
        uMagnification: { value: 0.85 }, // Slight magnification
        uIOR: { value: 1.15 }, // Zeiss index of refraction
        uDispersion: { value: 0.012 }, // Subtly split RGB channels
      },
      vertexShader: refractionVertex,
      fragmentShader: composedFragment,
      transparent: true,
      depthWrite: true,
    })
  }, [])

  // Sync texture uniform
  useEffect(() => {
    if (marqueeSharpTexture && lensShaderMaterial) {
      lensShaderMaterial.uniforms.uMarqueeSharp.value = marqueeSharpTexture
    }
  }, [marqueeSharpTexture, lensShaderMaterial])

  // Mouse coordinate interpolation target refs
  const mouseTargetRef = useRef({ x: 0, y: 0 })

  // Listen to window mouse movements for standard pointer tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize coordinate grid (-1 to 1)
      mouseTargetRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseTargetRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // 3. Animation Loop: Idle floats, breathing, and mouse rotations
  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    // Uniform updates
    if (lensShaderMaterial) {
      lensShaderMaterial.uniforms.uTime.value = time
      lensShaderMaterial.uniforms.uMouse.value = [state.pointer.x, state.pointer.y]
    }

    if (!groupRef.current) return

    // Idle floating sequence (position.y 0 -> 0.04 -> 0 over 8 seconds)
    // 0.04 is ~4px in 3D camera units
    const floatAmplitude = 0.02
    const floatFrequency = (2 * Math.PI) / 8.0 // 8s loop duration
    const idleY = Math.sin(time * floatFrequency) * floatAmplitude

    // Y rotation idle (-1° to +1° over 10 seconds)
    // 1° is approx 0.0175 radians
    const rotAmplitude = 0.0175
    const rotFrequency = (2 * Math.PI) / 10.0 // 10s loop duration
    const idleRotY = Math.sin(time * rotFrequency) * rotAmplitude

    // Tiny breathing scale (1 -> 1.01 -> 1, e.g. 5s loop)
    const scaleAmplitude = 0.005
    const scaleFrequency = (2 * Math.PI) / 5.0
    const currentScale = 1.0 + Math.sin(time * scaleFrequency) * scaleAmplitude

    // Mouse rotation limits (max 5° rotation = ~0.087 radians)
    const maxMouseRotX = 0.087
    const maxMouseRotY = 0.087
    const targetRotX = mouseTargetRef.current.y * maxMouseRotX
    const targetRotY = mouseTargetRef.current.x * maxMouseRotY

    // Smooth interpolation (lerp) damping factor 0.05
    const currentRotX = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05)
    const currentRotY = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY + idleRotY, 0.05)
    const currentPosY = THREE.MathUtils.lerp(groupRef.current.position.y, idleY, 0.05)

    // Apply calculated matrices
    groupRef.current.rotation.x = currentRotX
    groupRef.current.rotation.y = currentRotY
    groupRef.current.position.y = currentPosY
    groupRef.current.scale.setScalar(currentScale)
  })

  // Model geometry layouts (procedural coordinates)
  const leftRimPos = [-0.85, 0, 0]
  const rightRimPos = [0.85, 0, 0]
  const bridgePos = [0, 0, 0]
  
  const leftLensPos = [-0.85, 0, 0.04]
  const rightLensPos = [0.85, 0, 0.04]

  const leftHingePos = [-1.6, 0, -0.05]
  const rightHingePos = [1.6, 0, -0.05]

  const leftTemplePos = [-1.6, 0.0, -0.05]
  const rightTemplePos = [1.6, 0.0, -0.05]

  const leftNosePadPos = [-0.28, -0.22, -0.08]
  const rightNosePadPos = [0.28, -0.22, -0.08]

  return (
    <group 
      ref={groupRef} 
      scale={[1.15, 1.15, 1.15]} 
      dispose={null}
      // Add hovering bounds detectors directly on the group for glasses specific checks
      onPointerOver={() => onHoverGlassesState('glasses')}
      onPointerOut={() => onHoverGlassesState('hero')}
    >
      {/* 1. Left Rim Acetate Frame */}
      <mesh position={leftRimPos} material={frameMaterial} castShadow receiveShadow>
        <torusGeometry args={[0.74, 0.075, 16, 80]} />
      </mesh>

      {/* 2. Right Rim Acetate Frame */}
      <mesh position={rightRimPos} material={frameMaterial} castShadow receiveShadow>
        <torusGeometry args={[0.74, 0.075, 16, 80]} />
      </mesh>

      {/* 3. Golden Metal Bridge connecting bars */}
      <mesh position={bridgePos} rotation={[0, 0, Math.PI / 2]} material={metalMaterial} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.6, 16]} />
      </mesh>
      <mesh position={[bridgePos[0], bridgePos[1] + 0.1, bridgePos[2]]} material={metalMaterial}>
        <torusGeometry args={[0.2, 0.02, 8, 30, Math.PI]} />
      </mesh>

      {/* 4. Left Lens (GLSL mask reveal refraction shader) */}
      <mesh
        ref={leftLensRef}
        position={leftLensPos}
        rotation={[Math.PI / 2, 0, 0]}
        material={lensShaderMaterial}
        castShadow
      >
        <cylinderGeometry args={[0.73, 0.73, 0.02, 64]} />
      </mesh>

      {/* 5. Right Lens */}
      <mesh
        ref={rightLensRef}
        position={rightLensPos}
        rotation={[Math.PI / 2, 0, 0]}
        material={lensShaderMaterial}
        castShadow
      >
        <cylinderGeometry args={[0.73, 0.73, 0.02, 64]} />
      </mesh>

      {/* 6. Gold Accent Hinges */}
      <mesh position={leftHingePos} rotation={[Math.PI / 2, 0, 0]} material={metalMaterial}>
        <cylinderGeometry args={[0.045, 0.045, 0.15, 16]} />
      </mesh>
      <mesh position={rightHingePos} rotation={[Math.PI / 2, 0, 0]} material={metalMaterial}>
        <cylinderGeometry args={[0.045, 0.045, 0.15, 16]} />
      </mesh>

      {/* 7. Screws */}
      <mesh position={[leftHingePos[0], 0.15, -0.05]} material={metalMaterial}>
        <cylinderGeometry args={[0.022, 0.022, 0.08, 12]} />
      </mesh>
      <mesh position={[rightHingePos[0], 0.15, -0.05]} material={metalMaterial}>
        <cylinderGeometry args={[0.022, 0.022, 0.08, 12]} />
      </mesh>

      {/* 8. Temples */}
      <group position={leftTemplePos} rotation={[0, 0.05, 0]}>
        <mesh position={[0, 0, -0.45]} material={metalMaterial} castShadow>
          <boxGeometry args={[0.03, 0.05, 0.9]} />
        </mesh>
        <mesh position={[-0.02, -0.1, -1.0]} rotation={[-Math.PI / 8, 0, 0]} material={frameMaterial} castShadow>
          <boxGeometry args={[0.04, 0.06, 0.4]} />
        </mesh>
      </group>

      <group position={rightTemplePos} rotation={[0, -0.05, 0]}>
        <mesh position={[0, 0, -0.45]} material={metalMaterial} castShadow>
          <boxGeometry args={[0.03, 0.05, 0.9]} />
        </mesh>
        <mesh position={[0.02, -0.1, -1.0]} rotation={[-Math.PI / 8, 0, 0]} material={frameMaterial} castShadow>
          <boxGeometry args={[0.04, 0.06, 0.4]} />
        </mesh>
      </group>

      {/* 9. Silicone Nose Pads */}
      <mesh position={leftNosePadPos} material={nosePadMaterial}>
        <sphereGeometry args={[0.05, 16, 16]} />
      </mesh>
      <mesh position={rightNosePadPos} material={nosePadMaterial}>
        <sphereGeometry args={[0.05, 16, 16]} />
      </mesh>
      <mesh
        position={[leftNosePadPos[0] + 0.1, leftNosePadPos[1] + 0.1, leftNosePadPos[2]]}
        rotation={[0, 0, -Math.PI / 4]}
        material={metalMaterial}
      >
        <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
      </mesh>
      <mesh
        position={[rightNosePadPos[0] - 0.1, rightNosePadPos[1] + 0.1, rightNosePadPos[2]]}
        rotation={[0, 0, Math.PI / 4]}
        material={metalMaterial}
      >
        <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
      </mesh>
    </group>
  )
}

export default Glasses
