import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { LensShader } from '../../shaders/LensShader'

function Eyeglass({
  color = 'black',
  shape = 'round',
  explodeProgress = 0,
  useRefractionShader = false,
  marqueeSharpTexture = null,
  hovered = false,
  isViewer = false,
  customMaterials = null
}) {
  const groupRef = useRef()
  const leftLensRef = useRef()
  const rightLensRef = useRef()

  const geometries = useMemo(() => {
    const isThin = color === 'silver' || color === 'blue' || color === 'green'
    const gap = 0.08
    const depth = 0.09 // Sleeker, modern frame depth

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
    
    if (shape === 'rectangular') {
      const w = 1.35, h = 0.9, r = 0.15
      outerShape = createRoundedRectShape(w, h, r)
      innerShape = createRoundedRectShape(w - gap * 2, h - gap * 2, Math.max(0.01, r - gap))
    } else if (shape === 'square') {
      const w = 1.2, h = 1.1, r = 0.20
      outerShape = createRoundedRectShape(w, h, r)
      innerShape = createRoundedRectShape(w - gap * 2, h - gap * 2, Math.max(0.01, r - gap))
    } else {
      // Circular
      const w = 1.25, h = 1.25, r = 0.62
      outerShape = createRoundedRectShape(w, h, r)
      innerShape = createRoundedRectShape(w - gap * 2, h - gap * 2, Math.max(0.01, r - gap))
    }

    outerShape.holes.push(innerShape)

    const frameGeom = new THREE.ExtrudeGeometry(outerShape, {
      depth: depth,
      bevelEnabled: true,
      bevelSegments: 6, // Smoother bevel roundness
      steps: 1,
      bevelSize: 0.018, // Polished premium edge profile
      bevelThickness: 0.018,
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
  }, [shape, color])

  useEffect(() => {
    return () => {
      geometries.frame.dispose()
      geometries.lens.dispose()
    }
  }, [geometries])

  // 1. Color Palette Definitions for Frame, Lenses, and Metals
  const colors = useMemo(() => {
    // Colors match the luxury aesthetic requirements
    switch (color) {
      case 'gold':
        return {
          frame: '#111111',
          lens: '#e5c158',
          metal: '#D7B46A',
          roughness: 0.08,
          metalness: 0.9,
          transmission: 0.1,
          thickness: 0.1
        }
      case 'silver':
        return {
          frame: '#222222',
          lens: '#b0c4de',
          metal: '#E0E0E0',
          roughness: 0.05,
          metalness: 0.95,
          transmission: 0.2,
          thickness: 0.1
        }
      case 'blue':
        return {
          frame: '#0f1a30',
          lens: '#4a90e2',
          metal: '#C0C0C0',
          roughness: 0.1,
          metalness: 0.2,
          transmission: 0.6, // Semi-transparent acetate
          thickness: 0.3
        }
      case 'green':
        return {
          frame: '#0a2216',
          lens: '#50c878',
          metal: '#D7B46A',
          roughness: 0.12,
          metalness: 0.2,
          transmission: 0.6, // Semi-transparent acetate
          thickness: 0.3
        }
      case 'black':
      default:
        return {
          frame: '#0D0D0D', // Deep polished luxury black
          lens: '#ffffff',
          metal: '#888888',
          roughness: 0.05,
          metalness: 0.1,
          transmission: 0.05,
          thickness: 0.2
        }
    }
  }, [color])

  // 2. Animated coordinates for the Exploded Product View
  const offsets = useMemo(() => {
    return {
      // Moves left and right frame parts outwards in X
      leftRimX: -0.85,
      leftRimExploded: -1.3,
      rightRimX: 0.85,
      rightRimExploded: 1.3,

      // Bridge blows upwards and forwards
      bridgeY: 0,
      bridgeYExploded: 0.7,
      bridgeZExploded: 0.5,

      // Lenses explode straight forward in Z
      lensZ: 0.04,
      lensZExploded: 1.1,

      // Hinges separate outwards in X
      leftHingeX: -1.6,
      leftHingeExploded: -2.1,
      rightHingeX: 1.6,
      rightHingeExploded: 2.1,

      // Temples move outwards, back, and rotate outwards
      leftTempleX: -1.6,
      leftTempleExploded: -2.25,
      leftTempleZ: -0.05,
      leftTempleZExploded: -0.8,

      rightTempleX: 1.6,
      rightTempleExploded: 2.25,
      rightTempleZ: -0.05,
      rightTempleZExploded: -0.8,

      // Nose pads drift inwards and down
      leftNosePadX: -0.28,
      leftNosePadExploded: -0.5,
      leftNosePadY: -0.22,
      leftNosePadYExploded: -0.55,
      leftNosePadZ: -0.08,
      leftNosePadZExploded: 0.3,

      rightNosePadX: 0.28,
      rightNosePadExploded: 0.5,
      rightNosePadY: -0.22,
      rightNosePadYExploded: -0.55,
      rightNosePadZ: -0.08,
      rightNosePadZExploded: 0.3,

      // Screws fly upwards
      screwY: 0.15,
      screwYExploded: 0.65
    }
  }, [])

  // 3. Interpolate values between assembled (0) and exploded (1) state
  const getVal = (start, end) => {
    return start + (end - start) * explodeProgress
  }

  // 4. Custom Materials using physical shading
  const frameMaterial = useMemo(() => {
    if (customMaterials?.frame) return customMaterials.frame
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(colors.frame),
      roughness: colors.roughness,
      metalness: colors.metalness,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      transmission: colors.transmission,
      thickness: colors.thickness,
      envMapIntensity: 1.5,
    })
  }, [colors, customMaterials])

  const metalMaterial = useMemo(() => {
    if (customMaterials?.metal) return customMaterials.metal
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(colors.metal),
      metalness: 0.95,
      roughness: 0.15,
      envMapIntensity: 2.0,
    })
  }, [colors, customMaterials])

  const nosePadMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#FFFFFF'),
      transmission: 0.8,
      opacity: 0.9,
      transparent: true,
      roughness: 0.2,
      thickness: 0.1,
    })
  }, [])

  // Realistic transmission lens material when NOT in Hero reveal mode
  const glassLensMaterial = useMemo(() => {
    if (customMaterials?.lens) return customMaterials.lens
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(colors.lens),
      transmission: 0.96,
      opacity: 1,
      transparent: true,
      roughness: 0.0,
      ior: 1.55, // Index of refraction of realistic glass
      thickness: 0.4,
      clearcoat: 1.0,
      clearcoatRoughness: 0.0,
      envMapIntensity: 2.5,
    })
  }, [colors, customMaterials])

  // Custom refraction shader uniforms for Hero Reveal Mode
  const refractionShaderMaterial = useMemo(() => {
    if (!useRefractionShader) return null
    const mat = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(LensShader.uniforms),
      vertexShader: LensShader.vertexShader,
      fragmentShader: LensShader.fragmentShader,
      transparent: true,
      fog: false, // Disable fog to keep text inside the lenses high-contrast black
    })
    if (marqueeSharpTexture) {
      mat.uniforms.uMarqueeSharp.value = marqueeSharpTexture
    }
    return mat
  }, [useRefractionShader, marqueeSharpTexture])

  // Resource cleanups for custom materials to prevent WebGL memory leaks
  useEffect(() => {
    return () => {
      if (frameMaterial && !customMaterials?.frame) frameMaterial.dispose()
      if (metalMaterial && !customMaterials?.metal) metalMaterial.dispose()
      if (nosePadMaterial) nosePadMaterial.dispose()
      if (glassLensMaterial && !customMaterials?.lens) glassLensMaterial.dispose()
      if (refractionShaderMaterial) refractionShaderMaterial.dispose()
    }
  }, [frameMaterial, metalMaterial, nosePadMaterial, glassLensMaterial, refractionShaderMaterial, customMaterials])

  // Update uniforms over time
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    if (useRefractionShader && refractionShaderMaterial) {
      refractionShaderMaterial.uniforms.uTime.value = time
      // Track mouse position on screen
      refractionShaderMaterial.uniforms.uMouse.value = [
        state.pointer.x,
        state.pointer.y
      ]
    }

    // Natural floating rotation in Hero (when not in Orbit Customizer Viewer)
    if (!isViewer && groupRef.current) {
      const floatTime = time * 0.8
      // Subtle float animation
      groupRef.current.rotation.y = Math.sin(floatTime) * 0.08
      groupRef.current.rotation.x = Math.cos(floatTime) * 0.03
      groupRef.current.position.y = Math.sin(floatTime) * 0.05
      
      // Scale breathing
      const scaleVal = 1.0 + Math.sin(time * 1.2) * 0.01
      groupRef.current.scale.set(scaleVal, scaleVal, scaleVal)
    }
  })

  // Synchronize texture if it updates dynamically
  if (useRefractionShader && refractionShaderMaterial && marqueeSharpTexture) {
    if (refractionShaderMaterial.uniforms.uMarqueeSharp.value !== marqueeSharpTexture) {
      refractionShaderMaterial.uniforms.uMarqueeSharp.value = marqueeSharpTexture
    }
  }

  // Component render definitions
  const leftRimPos = [getVal(offsets.leftRimX, offsets.leftRimExploded), 0, 0]
  const rightRimPos = [getVal(offsets.rightRimX, offsets.rightRimExploded), 0, 0]
  const bridgePos = [0, getVal(offsets.bridgeY, offsets.bridgeYExploded), getVal(0, offsets.bridgeZExploded)]
  
  const leftLensPos = [getVal(offsets.leftRimX, offsets.leftRimExploded), 0, getVal(offsets.lensZ, offsets.lensZExploded)]
  const rightLensPos = [getVal(offsets.rightRimX, offsets.rightRimExploded), 0, getVal(offsets.lensZ, offsets.lensZExploded)]

  const leftHingePos = [getVal(offsets.leftHingeX, offsets.leftHingeExploded), 0, -0.05]
  const rightHingePos = [getVal(offsets.rightHingeX, offsets.rightHingeExploded), 0, -0.05]

  const leftTemplePos = [getVal(offsets.leftTempleX, offsets.leftTempleExploded), 0.0, getVal(offsets.leftTempleZ, offsets.leftTempleZExploded)]
  const rightTemplePos = [getVal(offsets.rightTempleX, offsets.rightTempleExploded), 0.0, getVal(offsets.rightTempleZ, offsets.rightTempleZExploded)]

  const leftNosePadPos = [
    getVal(offsets.leftNosePadX, offsets.leftNosePadExploded),
    getVal(offsets.leftNosePadY, offsets.leftNosePadYExploded),
    getVal(offsets.leftNosePadZ, offsets.leftNosePadZExploded)
  ]
  const rightNosePadPos = [
    getVal(offsets.rightNosePadX, offsets.rightNosePadExploded),
    getVal(offsets.rightNosePadY, offsets.rightNosePadYExploded),
    getVal(offsets.rightNosePadZ, offsets.rightNosePadZExploded)
  ]

  const leftScrewPos = [getVal(offsets.leftHingeX, offsets.leftHingeExploded), getVal(offsets.screwY, offsets.screwYExploded), -0.05]
  const rightScrewPos = [getVal(offsets.rightHingeX, offsets.rightHingeExploded), getVal(offsets.screwY, offsets.screwYExploded), -0.05]

  return (
    <group ref={groupRef} scale={[1.1, 1.1, 1.1]} dispose={null}>
      {/* 1. LEFT FRAME RIM & LENS GROUP (Face wrap Y-rotation) */}
      <group position={leftRimPos} rotation={[0, 0.08, 0]}>
        <mesh geometry={geometries.frame} material={frameMaterial} castShadow receiveShadow />
        
        {/* LEFT LENS (Meniscus curved glass/shader) */}
        <mesh
          ref={leftLensRef}
          position={[0, 0, getVal(offsets.lensZ, offsets.lensZExploded)]}
          geometry={geometries.lens}
          material={useRefractionShader ? refractionShaderMaterial : glassLensMaterial}
          castShadow
        />

        {/* Outer Corner Rivets (Double polished capsule pins) */}
        <mesh position={[-0.56, 0.35, 0.055]} rotation={[Math.PI / 2, 0, 0]} material={metalMaterial}>
          <cylinderGeometry args={[0.014, 0.014, 0.03, 12]} />
        </mesh>
        <mesh position={[-0.63, 0.35, 0.055]} rotation={[Math.PI / 2, 0, 0]} material={metalMaterial}>
          <cylinderGeometry args={[0.014, 0.014, 0.03, 12]} />
        </mesh>
      </group>

      {/* 2. RIGHT FRAME RIM & LENS GROUP (Face wrap Y-rotation) */}
      <group position={rightRimPos} rotation={[0, -0.08, 0]}>
        <mesh geometry={geometries.frame} material={frameMaterial} castShadow receiveShadow />

        {/* RIGHT LENS */}
        <mesh
          ref={rightLensRef}
          position={[0, 0, getVal(offsets.lensZ, offsets.lensZExploded)]}
          geometry={geometries.lens}
          material={useRefractionShader ? refractionShaderMaterial : glassLensMaterial}
          castShadow
        />

        {/* Outer Corner Rivets (Double polished capsule pins) */}
        <mesh position={[0.56, 0.35, 0.055]} rotation={[Math.PI / 2, 0, 0]} material={metalMaterial}>
          <cylinderGeometry args={[0.014, 0.014, 0.03, 12]} />
        </mesh>
        <mesh position={[0.63, 0.35, 0.055]} rotation={[Math.PI / 2, 0, 0]} material={metalMaterial}>
          <cylinderGeometry args={[0.014, 0.014, 0.03, 12]} />
        </mesh>
      </group>

      {/* 3. BRIDGE (Metal connecting bar) */}
      <mesh position={bridgePos} rotation={[0, 0, Math.PI / 2]} material={metalMaterial} castShadow receiveShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.55, 16]} />
      </mesh>
      {/* Sleek lower bridge arch */}
      <mesh position={[bridgePos[0], bridgePos[1] - 0.04, bridgePos[2]]} rotation={[0, 0, 0]} material={metalMaterial}>
        <torusGeometry args={[0.18, 0.022, 8, 30, Math.PI]} />
      </mesh>
      {/* Secondary Top Wire (Tension bar) for rectangular/square shapes */}
      {(shape === 'rectangular' || shape === 'square') && (
        <mesh position={[bridgePos[0], bridgePos[1] + 0.15, bridgePos[2] - 0.02]} rotation={[0, 0, Math.PI / 2]} material={metalMaterial}>
          <cylinderGeometry args={[0.015, 0.015, 0.52, 12]} />
        </mesh>
      )}

      {/* 4. HINGES (Left & Right - Metallic cylinders) */}
      <mesh position={leftHingePos} rotation={[Math.PI / 2, 0, 0]} material={metalMaterial}>
        <cylinderGeometry args={[0.045, 0.045, 0.15, 16]} />
      </mesh>
      <mesh position={rightHingePos} rotation={[Math.PI / 2, 0, 0]} material={metalMaterial}>
        <cylinderGeometry args={[0.045, 0.045, 0.15, 16]} />
      </mesh>

      {/* 5. SCREWS (Upper hinges) */}
      <mesh position={leftScrewPos} material={metalMaterial}>
        <cylinderGeometry args={[0.022, 0.022, 0.08, 12]} />
      </mesh>
      <mesh position={rightScrewPos} material={metalMaterial}>
        <cylinderGeometry args={[0.022, 0.022, 0.08, 12]} />
      </mesh>

      {/* 6. TEMPLES (Arms of the glass extending back in Z with metal cores) */}
      <group position={leftTemplePos} rotation={[0, getVal(0.06, -0.3), 0]}>
        {/* Acetate temple sleeve */}
        <mesh position={[0, 0, -0.45]} material={frameMaterial} castShadow>
          <boxGeometry args={[0.045, 0.06, 0.95]} />
        </mesh>
        {/* Metal core wire running inside sleeve */}
        <mesh position={[0, 0, -0.45]} rotation={[Math.PI / 2, 0, 0]} material={metalMaterial}>
          <cylinderGeometry args={[0.01, 0.01, 0.9, 8]} />
        </mesh>
        {/* Curved ear-hook (acetate temple tip segment 1) */}
        <mesh position={[0, -0.12, -1.02]} rotation={[-Math.PI / 6, 0, 0]} material={frameMaterial} castShadow>
          <boxGeometry args={[0.04, 0.05, 0.3]} />
        </mesh>
        {/* Temple tip segment 2 (curved downwards) */}
        <mesh position={[0, -0.28, -1.1]} rotation={[-Math.PI / 3, 0, 0]} material={frameMaterial} castShadow>
          <boxGeometry args={[0.035, 0.045, 0.15]} />
        </mesh>
      </group>

      <group position={rightTemplePos} rotation={[0, getVal(-0.06, 0.3), 0]}>
        {/* Acetate temple sleeve */}
        <mesh position={[0, 0, -0.45]} material={frameMaterial} castShadow>
          <boxGeometry args={[0.045, 0.06, 0.95]} />
        </mesh>
        {/* Metal core wire running inside sleeve */}
        <mesh position={[0, 0, -0.45]} rotation={[Math.PI / 2, 0, 0]} material={metalMaterial}>
          <cylinderGeometry args={[0.01, 0.01, 0.9, 8]} />
        </mesh>
        {/* Curved ear-hook (acetate temple tip segment 1) */}
        <mesh position={[0, -0.12, -1.02]} rotation={[-Math.PI / 6, 0, 0]} material={frameMaterial} castShadow>
          <boxGeometry args={[0.04, 0.05, 0.3]} />
        </mesh>
        {/* Temple tip segment 2 (curved downwards) */}
        <mesh position={[0, -0.28, -1.1]} rotation={[-Math.PI / 3, 0, 0]} material={frameMaterial} castShadow>
          <boxGeometry args={[0.035, 0.045, 0.15]} />
        </mesh>
      </group>

      {/* 7. NOSE PADS (Polished silicone flat oval pads) */}
      <mesh position={leftNosePadPos} rotation={[0, Math.PI / 6, 0]} scale={[0.45, 1.0, 0.65]} material={nosePadMaterial}>
        <sphereGeometry args={[0.07, 16, 16]} />
      </mesh>
      <mesh position={rightNosePadPos} rotation={[0, -Math.PI / 6, 0]} scale={[0.45, 1.0, 0.65]} material={nosePadMaterial}>
        <sphereGeometry args={[0.07, 16, 16]} />
      </mesh>
      {/* Nose pad metal arm supports */}
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

export default Eyeglass
