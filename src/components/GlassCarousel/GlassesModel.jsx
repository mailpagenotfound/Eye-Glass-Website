import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'

// Import GLSL strings using Vite's ?raw query
import refractionVertex from '../../shaders/LensRefraction.glsl?raw'
import chromaticHelper from '../../shaders/Chromatic.glsl?raw'
import blurRevealFragment from '../../shaders/BlurReveal.glsl?raw'

function GlassesModel({
  variant = 'crystal_heritage',
  marqueeSharpTexture = null,
  isReady = true,
  scale = 1.0,
  lensHovered = 'none',
  onHoverLens
}) {
  const groupRef = useRef()
  const leftLensRef = useRef()
  const rightLensRef = useRef()

  // 1. Establish Curated PBR Materials based on the Active Variant
  const materials = useMemo(() => {
    switch (variant) {
      case 'obsidian':
        return {
          frame: new THREE.MeshPhysicalMaterial({
            color: new THREE.Color('#050505'), // High-gloss obsidian black acetate
            roughness: 0.01,
            metalness: 0.02,
            clearcoat: 1.0,
            clearcoatRoughness: 0.005,
            envMapIntensity: 2.5,
          }),
          metal: new THREE.MeshStandardMaterial({
            color: new THREE.Color('#E5C158'), // Luxury gold bridge and hardware
            metalness: 0.98,
            roughness: 0.08,
            envMapIntensity: 2.8,
          }),
          nosePad: new THREE.MeshPhysicalMaterial({
            color: new THREE.Color('#E5C158'),
            metalness: 0.9,
            roughness: 0.1,
          }),
          lensTint: new THREE.Color('#FFFFFF'), // Carl Zeiss clear lenses
          lensGlow: new THREE.Color('#FFFFFF'),
          lensOpacity: 0.02,
          isThinFrame: false
        }
      case 'titanium_edge':
        return {
          frame: new THREE.MeshStandardMaterial({
            color: new THREE.Color('#B2B6BC'), // Matte silver titanium frame
            metalness: 0.95,
            roughness: 0.28,
            envMapIntensity: 2.0,
          }),
          metal: new THREE.MeshStandardMaterial({
            color: new THREE.Color('#CCCCCC'), // Brushed silver hinges
            metalness: 0.98,
            roughness: 0.18,
            envMapIntensity: 2.4,
          }),
          nosePad: new THREE.MeshPhysicalMaterial({
            color: new THREE.Color('#CCCCCC'),
            metalness: 0.9,
            roughness: 0.15,
          }),
          lensTint: new THREE.Color('#9E9E9E'), // Cool grey lenses
          lensGlow: new THREE.Color('#B2B6BC'),
          lensOpacity: 0.12,
          isThinFrame: true
        }
      case 'crystal_heritage':
        return {
          frame: new THREE.MeshPhysicalMaterial({
            color: new THREE.Color('#F0F7FF'), // Clear crystal transparent acetate
            transmission: 0.95,
            opacity: 0.95,
            transparent: true,
            roughness: 0.03,
            thickness: 0.5,
            clearcoat: 1.0,
            clearcoatRoughness: 0.01,
            envMapIntensity: 3.0,
          }),
          metal: new THREE.MeshStandardMaterial({
            color: new THREE.Color('#EED0A6'), // Soft champagne/rose accents
            metalness: 0.96,
            roughness: 0.12,
            envMapIntensity: 2.6,
          }),
          nosePad: new THREE.MeshPhysicalMaterial({
            color: new THREE.Color('#EED0A6'),
            metalness: 0.85,
            roughness: 0.15,
          }),
          lensTint: new THREE.Color('#E3F2FD'), // Soft blue reflection
          lensGlow: new THREE.Color('#FFF8F0'),
          lensOpacity: 0.05,
          isThinFrame: false
        }
      case 'aurum_prestige':
      default:
        return {
          frame: new THREE.MeshPhysicalMaterial({
            color: new THREE.Color('#5E3B1C'), // Havana amber/tortoise shell brown base
            transmission: 0.25,
            opacity: 0.96,
            transparent: true,
            roughness: 0.05,
            thickness: 0.3,
            clearcoat: 1.0,
            clearcoatRoughness: 0.02,
            envMapIntensity: 2.2,
          }),
          metal: new THREE.MeshStandardMaterial({
            color: new THREE.Color('#B28441'), // Brushed bronze hardware
            metalness: 0.9,
            roughness: 0.28,
            envMapIntensity: 2.0,
          }),
          nosePad: new THREE.MeshPhysicalMaterial({
            color: new THREE.Color('#B28441'),
            metalness: 0.85,
            roughness: 0.2,
          }),
          lensTint: new THREE.Color('#E5A93C'), // Warm amber cinematic lenses
          lensGlow: new THREE.Color('#B28441'),
          lensOpacity: 0.25,
          isThinFrame: false
        }
    }
  }, [variant])

  // 2. Compose unique refraction lenses shader per variant to support different colors
  const leftLensMaterial = useMemo(() => {
    const composedFragment = chromaticHelper + '\n' + blurRevealFragment

    return new THREE.ShaderMaterial({
      uniforms: {
        uMarqueeSharp: { value: marqueeSharpTexture },
        uTime: { value: 0 },
        uMouse: { value: [0, 0] },
        uResolution: { value: [window.innerWidth, window.innerHeight] },
        uMagnification: { value: 0.95 }, // Zoom in by 1.05x (1 / 0.95 = 1.053)
        uIOR: { value: 1.06 }, // Realistic glass refraction index
        uDispersion: { value: 0.0025 }, // Subtle premium chromatic aberration
        uLensColor: { value: new THREE.Color('#FFFFFF') },
        uLensGlowColor: { value: new THREE.Color('#D7B46A') },
        uLensOpacity: { value: 0.06 },
        uBlurStrength: { value: 0.0 }, // Perfectly sharp left lens
        uLocalCameraPos: { value: new THREE.Vector3(0, 0, 5) }
      },
      vertexShader: refractionVertex,
      fragmentShader: composedFragment,
      transparent: true,
      depthWrite: true,
      fog: false,
    })
  }, [marqueeSharpTexture])

  const rightLensMaterial = useMemo(() => {
    const composedFragment = chromaticHelper + '\n' + blurRevealFragment

    return new THREE.ShaderMaterial({
      uniforms: {
        uMarqueeSharp: { value: marqueeSharpTexture },
        uTime: { value: 0 },
        uMouse: { value: [0, 0] },
        uResolution: { value: [window.innerWidth, window.innerHeight] },
        uMagnification: { value: 0.95 }, // Zoom in by 1.05x
        uIOR: { value: 1.06 },
        uDispersion: { value: 0.0025 },
        uLensColor: { value: new THREE.Color('#FFFFFF') },
        uLensGlowColor: { value: new THREE.Color('#D7B46A') },
        uLensOpacity: { value: 0.06 },
        uBlurStrength: { value: 0.0 }, // Perfectly sharp right lens
        uLocalCameraPos: { value: new THREE.Vector3(0, 0, 5) }
      },
      vertexShader: refractionVertex,
      fragmentShader: composedFragment,
      transparent: true,
      depthWrite: true,
      fog: false,
    })
  }, [marqueeSharpTexture])

  // Cleanup variant-specific frame/metal materials on change and unmount
  useEffect(() => {
    const currentMaterials = materials
    return () => {
      if (currentMaterials) {
        if (currentMaterials.frame) currentMaterials.frame.dispose()
        if (currentMaterials.metal) currentMaterials.metal.dispose()
        if (currentMaterials.nosePad) currentMaterials.nosePad.dispose()
      }
    }
  }, [materials])

  // Cleanup left and right lens materials on unmount
  useEffect(() => {
    const left = leftLensMaterial
    const right = rightLensMaterial
    return () => {
      if (left) left.dispose()
      if (right) right.dispose()
    }
  }, [leftLensMaterial, rightLensMaterial])

  // Update lens colors and texture whenever variant or texture changes
  useEffect(() => {
    if (leftLensMaterial) {
      leftLensMaterial.uniforms.uLensColor.value = materials.lensTint
      leftLensMaterial.uniforms.uLensGlowColor.value = materials.lensGlow
      leftLensMaterial.uniforms.uLensOpacity.value = materials.lensOpacity
      if (marqueeSharpTexture) {
        leftLensMaterial.uniforms.uMarqueeSharp.value = marqueeSharpTexture
      }
    }
    if (rightLensMaterial) {
      rightLensMaterial.uniforms.uLensColor.value = materials.lensTint
      rightLensMaterial.uniforms.uLensGlowColor.value = materials.lensGlow
      rightLensMaterial.uniforms.uLensOpacity.value = materials.lensOpacity
      if (marqueeSharpTexture) {
        rightLensMaterial.uniforms.uMarqueeSharp.value = marqueeSharpTexture
      }
    }
  }, [variant, marqueeSharpTexture, materials, leftLensMaterial, rightLensMaterial])

  // Lock left lens blur strength to 0.0 for premium readability
  useEffect(() => {
    if (leftLensMaterial) {
      gsap.to(leftLensMaterial.uniforms.uBlurStrength, {
        value: 0.0,
        duration: 0.6,
        ease: 'power2.out',
        overwrite: 'auto'
      })
    }
  }, [leftLensMaterial])

  // Update uniforms in render loop
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime()
    
    // Project camera position into group local coordinates for local ray tracing
    if (groupRef.current) {
      groupRef.current.updateMatrixWorld()
      const invMatrix = groupRef.current.matrixWorld.clone().invert()
      const localCam = state.camera.position.clone().applyMatrix4(invMatrix)
      
      if (leftLensMaterial) {
        leftLensMaterial.uniforms.uTime.value = elapsed
        leftLensMaterial.uniforms.uMouse.value = [state.pointer.x, state.pointer.y]
        leftLensMaterial.uniforms.uLocalCameraPos.value.copy(localCam)
      }
      if (rightLensMaterial) {
        rightLensMaterial.uniforms.uTime.value = elapsed
        rightLensMaterial.uniforms.uMouse.value = [state.pointer.x, state.pointer.y]
        rightLensMaterial.uniforms.uLocalCameraPos.value.copy(localCam)
      }
    }
  })

  // 3. Define shape types based on variant mapping
  const shapeType = useMemo(() => {
    switch (variant) {
      case 'titanium_edge':
        return 'rectangular'
      case 'obsidian':
        return 'square'
      case 'crystal_heritage':
      case 'aurum_prestige':
      default:
        return 'round'
    }
  }, [variant])

  const geometries = useMemo(() => {
    const isThin = materials.isThinFrame
    let gap = 0.08
    let depth = isThin ? 0.03 : 0.09 // Modern, sleeker frame depth

    const createRoundedRectShape = (w, h, r) => {
      const sh = new THREE.Shape()
      const x = -w / 2
      const y = -h / 2
      sh.moveTo(x, y + r)
      sh.lineTo(x, y + h - r)
      sh.quadraticCurveTo(x, y + h, x + r, y + h)
      sh.lineTo(x + w - r, y + h)
      sh.quadraticCurveTo(x + w, y + h, x + w, y + h - r)
      sh.lineTo(x + w, y + r)
      sh.quadraticCurveTo(x + w, y, x + w - r, y)
      sh.lineTo(x + r, y)
      sh.quadraticCurveTo(x, y, x, y + r)
      return sh
    }

    let outerShape, innerShape
    
    if (variant === 'obsidian') {
      // Chunky square acetate
      const w = 1.25, h = 1.15, r = 0.22
      outerShape = createRoundedRectShape(w, h, r)
      innerShape = createRoundedRectShape(w - gap * 2.2, h - gap * 2.2, Math.max(0.01, r - gap * 1.1))
      depth = 0.12
    } else if (variant === 'titanium_edge') {
      // Sleek rectangular metal wire
      const w = 1.35, h = 0.85, r = 0.12
      gap = 0.04
      outerShape = createRoundedRectShape(w, h, r)
      innerShape = createRoundedRectShape(w - gap * 2, h - gap * 2, Math.max(0.01, r - gap))
      depth = 0.03
    } else if (variant === 'crystal_heritage') {
      // Translucent clear circular frame
      const w = 1.25, h = 1.25, r = 0.62
      outerShape = createRoundedRectShape(w, h, r)
      innerShape = createRoundedRectShape(w - gap * 2, h - gap * 2, Math.max(0.01, r - gap))
      depth = 0.08
    } else {
      // Elegant rounded Havana frame
      const w = 1.22, h = 1.22, r = 0.58
      outerShape = createRoundedRectShape(w, h, r)
      innerShape = createRoundedRectShape(w - gap * 2.1, h - gap * 2.1, Math.max(0.01, r - gap * 1.05))
      depth = 0.10
    }

    outerShape.holes.push(innerShape)

    const frameGeom = new THREE.ExtrudeGeometry(outerShape, {
      depth: depth,
      bevelEnabled: true,
      bevelSegments: 6, // Smoother bevel curves
      steps: 1,
      bevelSize: isThin ? 0.012 : 0.018, // Polished premium edge profile
      bevelThickness: isThin ? 0.012 : 0.018,
    })
    frameGeom.center()

    const lensGeom = new THREE.ExtrudeGeometry(innerShape, {
      depth: 0.02,
      bevelEnabled: false
    })
    lensGeom.center()

    // Deform lens vertices to create a curved meniscus shape
    const lensPos = lensGeom.attributes.position
    for (let i = 0; i < lensPos.count; i++) {
      const x = lensPos.getX(i)
      const y = lensPos.getY(i)
      const z = lensPos.getZ(i)
      // Apply a spherical warp to bulge center forward by 0.08
      const distSq = x * x + y * y
      lensPos.setZ(i, z + 0.08 * Math.max(0.0, 1.0 - distSq / 1.4))
    }
    lensGeom.computeVertexNormals()

    return { frame: frameGeom, lens: lensGeom }
  }, [shapeType, materials.isThinFrame])

  // Explicit geometry disposal to prevent WebGL memory leaks
  useEffect(() => {
    return () => {
      geometries.frame.dispose()
      geometries.lens.dispose()
    }
  }, [geometries])

  // 4. Define Procedural coordinates
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

  const bridgeCylinderRadius = materials.isThinFrame ? 0.02 : 0.035

  return (
    <group 
      ref={groupRef} 
      scale={[scale * 1.28, scale * 1.28, scale * 1.28]} 
      dispose={null}
    >
      {/* 1. LEFT FRAME RIM & LENS GROUP (Face wrap Y-rotation) */}
      <group position={leftRimPos} rotation={[0, 0.08, 0]}>
        <mesh geometry={geometries.frame} material={materials.frame} castShadow receiveShadow />
        
        {/* LEFT LENS (Custom Refraction ShaderMaterial on curved meniscus) */}
        <mesh
          ref={leftLensRef}
          position={[0, 0, 0.04]}
          geometry={geometries.lens}
          material={leftLensMaterial}
          onPointerOver={(e) => {
            e.stopPropagation()
            onHoverLens && onHoverLens('left')
          }}
          onPointerOut={(e) => {
            e.stopPropagation()
            onHoverLens && onHoverLens('none')
          }}
          castShadow
        />

        {/* Outer Corner Rivets (Double polished capsule pins - skipped on ultra-thin wireframes) */}
        {!materials.isThinFrame && (
          <>
            <mesh position={[-0.56, 0.35, 0.055]} rotation={[Math.PI / 2, 0, 0]} material={materials.metal}>
              <cylinderGeometry args={[0.014, 0.014, 0.03, 12]} />
            </mesh>
            <mesh position={[-0.63, 0.35, 0.055]} rotation={[Math.PI / 2, 0, 0]} material={materials.metal}>
              <cylinderGeometry args={[0.014, 0.014, 0.03, 12]} />
            </mesh>
          </>
        )}
      </group>

      {/* 2. RIGHT FRAME RIM & LENS GROUP (Face wrap Y-rotation) */}
      <group position={rightRimPos} rotation={[0, -0.08, 0]}>
        <mesh geometry={geometries.frame} material={materials.frame} castShadow receiveShadow />

        {/* RIGHT LENS */}
        <mesh
          ref={rightLensRef}
          position={[0, 0, 0.04]}
          geometry={geometries.lens}
          material={rightLensMaterial}
          onPointerOver={(e) => {
            e.stopPropagation()
            onHoverLens && onHoverLens('right')
          }}
          onPointerOut={(e) => {
            e.stopPropagation()
            onHoverLens && onHoverLens('none')
          }}
          castShadow
        />

        {/* Outer Corner Rivets */}
        {!materials.isThinFrame && (
          <>
            <mesh position={[0.56, 0.35, 0.055]} rotation={[Math.PI / 2, 0, 0]} material={materials.metal}>
              <cylinderGeometry args={[0.014, 0.014, 0.03, 12]} />
            </mesh>
            <mesh position={[0.63, 0.35, 0.055]} rotation={[Math.PI / 2, 0, 0]} material={materials.metal}>
              <cylinderGeometry args={[0.014, 0.014, 0.03, 12]} />
            </mesh>
          </>
        )}
      </group>

      {/* 3. BRIDGE (Metal connecting bar) */}
      <mesh position={bridgePos} rotation={[0, 0, Math.PI / 2]} material={materials.metal} castShadow>
        <cylinderGeometry args={[bridgeCylinderRadius, bridgeCylinderRadius, 0.55, 16]} />
      </mesh>
      {/* Curved lower arch */}
      <mesh position={[bridgePos[0], bridgePos[1] - 0.04, bridgePos[2]]} rotation={[0, 0, 0]} material={materials.metal}>
        <torusGeometry args={[0.18, materials.isThinFrame ? 0.012 : 0.022, 8, 30, Math.PI]} />
      </mesh>
      {/* Secondary Top Wire (Tension bar) for rectangular/square shapes */}
      {(shapeType === 'rectangular' || shapeType === 'square') && (
        <mesh position={[bridgePos[0], bridgePos[1] + 0.15, bridgePos[2] - 0.02]} rotation={[0, 0, Math.PI / 2]} material={materials.metal}>
          <cylinderGeometry args={[0.015, 0.015, 0.52, 12]} />
        </mesh>
      )}

      {/* 4. HINGES (Left & Right - Metallic cylinders) */}
      <mesh position={leftHingePos} rotation={[Math.PI / 2, 0, 0]} material={materials.metal}>
        <cylinderGeometry args={[0.045, 0.045, 0.15, 16]} />
      </mesh>
      <mesh position={rightHingePos} rotation={[Math.PI / 2, 0, 0]} material={materials.metal}>
        <cylinderGeometry args={[0.045, 0.045, 0.15, 16]} />
      </mesh>

      {/* 5. SCREWS (Upper hinges) */}
      <mesh position={[leftHingePos[0], 0.15, -0.05]} material={materials.metal}>
        <cylinderGeometry args={[0.022, 0.022, 0.08, 12]} />
      </mesh>
      <mesh position={[rightHingePos[0], 0.15, -0.05]} material={materials.metal}>
        <cylinderGeometry args={[0.022, 0.022, 0.08, 12]} />
      </mesh>

      {/* 6. TEMPLES (Arms of the glass extending back in Z with metal cores) */}
      <group position={leftTemplePos} rotation={[0, 0.05, 0]}>
        {/* Acetate temple sleeve */}
        <mesh position={[0, 0, -0.45]} material={materials.frame} castShadow>
          <boxGeometry args={[materials.isThinFrame ? 0.02 : 0.045, 0.06, 0.95]} />
        </mesh>
        {/* Metal core wire running inside sleeve */}
        <mesh position={[0, 0, -0.45]} rotation={[Math.PI / 2, 0, 0]} material={materials.metal}>
          <cylinderGeometry args={[0.01, 0.01, 0.9, 8]} />
        </mesh>
        {/* Curved ear-hook (acetate temple tip segment 1) */}
        <mesh position={[0, -0.12, -1.02]} rotation={[-Math.PI / 6, 0, 0]} material={materials.frame} castShadow>
          <boxGeometry args={[materials.isThinFrame ? 0.016 : 0.04, 0.05, 0.3]} />
        </mesh>
        {/* Temple tip segment 2 (curved downwards) */}
        <mesh position={[0, -0.28, -1.1]} rotation={[-Math.PI / 3, 0, 0]} material={materials.frame} castShadow>
          <boxGeometry args={[materials.isThinFrame ? 0.012 : 0.035, 0.045, 0.15]} />
        </mesh>
      </group>

      <group position={rightTemplePos} rotation={[0, -0.05, 0]}>
        {/* Acetate temple sleeve */}
        <mesh position={[0, 0, -0.45]} material={materials.frame} castShadow>
          <boxGeometry args={[materials.isThinFrame ? 0.02 : 0.045, 0.06, 0.95]} />
        </mesh>
        {/* Metal core wire running inside sleeve */}
        <mesh position={[0, 0, -0.45]} rotation={[Math.PI / 2, 0, 0]} material={materials.metal}>
          <cylinderGeometry args={[0.01, 0.01, 0.9, 8]} />
        </mesh>
        {/* Curved ear-hook (acetate temple tip segment 1) */}
        <mesh position={[0, -0.12, -1.02]} rotation={[-Math.PI / 6, 0, 0]} material={materials.frame} castShadow>
          <boxGeometry args={[materials.isThinFrame ? 0.016 : 0.04, 0.05, 0.3]} />
        </mesh>
        {/* Temple tip segment 2 (curved downwards) */}
        <mesh position={[0, -0.28, -1.1]} rotation={[-Math.PI / 3, 0, 0]} material={materials.frame} castShadow>
          <boxGeometry args={[materials.isThinFrame ? 0.012 : 0.035, 0.045, 0.15]} />
        </mesh>
      </group>

      {/* 7. NOSE PADS (Polished silicone flat oval pads) */}
      <mesh position={leftNosePadPos} rotation={[0, Math.PI / 6, 0]} scale={[0.45, 1.0, 0.65]} material={materials.nosePad}>
        <sphereGeometry args={[0.07, 16, 16]} />
      </mesh>
      <mesh position={rightNosePadPos} rotation={[0, -Math.PI / 6, 0]} scale={[0.45, 1.0, 0.65]} material={materials.nosePad}>
        <sphereGeometry args={[0.07, 16, 16]} />
      </mesh>
      {/* Nose pad metal arm supports */}
      <mesh
        position={[leftNosePadPos[0] + 0.1, leftNosePadPos[1] + 0.1, leftNosePadPos[2]]}
        rotation={[0, 0, -Math.PI / 4]}
        material={materials.metal}
      >
        <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
      </mesh>
      <mesh
        position={[rightNosePadPos[0] - 0.1, rightNosePadPos[1] + 0.1, rightNosePadPos[2]]}
        rotation={[0, 0, Math.PI / 4]}
        material={materials.metal}
      >
        <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
      </mesh>
    </group>
  )
}

export default GlassesModel
