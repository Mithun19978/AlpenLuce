/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck — R3F JSX intrinsics (mesh, group, etc.) are not recognised by TypeScript
// in React 19's new JSX transform. The runtime behaviour is correct.
'use client';

import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useCustomizerStore } from '@/lib/store';

/* ─── Spinning tee placeholder ─────────────────────────────────── */
function GarmentMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const layers = useCustomizerStore((s) => s.layers);
  const selectedArea = useCustomizerStore((s) => s.selectedArea);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  // Show active area label
  const areaColors: Record<string, string> = {
    FRONT: '#FFD700',
    BACK: '#FFC107',
    LEFT_SLEEVE: '#FFAB00',
    RIGHT_SLEEVE: '#FF8F00',
  };

  const frontLayer = layers.find((l) => l.area === 'FRONT');

  return (
    <group>
      {/* Body */}
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[1.6, 2.2, 0.25]} />
        <meshStandardMaterial
          color={frontLayer?.colorHex ?? '#1a1a1a'}
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>

      {/* Left sleeve */}
      <mesh position={[-1.05, 0.55, 0]}>
        <boxGeometry args={[0.7, 0.9, 0.22]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>

      {/* Right sleeve */}
      <mesh position={[1.05, 0.55, 0]}>
        <boxGeometry args={[0.7, 0.9, 0.22]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.22, 0]}>
        <cylinderGeometry args={[0.28, 0.3, 0.22, 24]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>

      {/* Selected area highlight label */}
      {selectedArea && (
        <Text
          position={[0, -1.6, 0.2]}
          fontSize={0.14}
          color={areaColors[selectedArea] ?? '#FFD700'}
          anchorX="center"
          anchorY="middle"
        >
          {selectedArea.replace('_', ' ')}
        </Text>
      )}
    </group>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#333" />
    </mesh>
  );
}

export default function CustomizerCanvas() {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-[#0a0a0a] border border-white/10">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        shadows
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[4, 6, 4]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-3, -2, -3]} intensity={0.3} color="#FFD700" />

        <Suspense fallback={<LoadingFallback />}>
          <GarmentMesh />
          <Environment preset="city" />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={2.5}
          maxDistance={7}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI * 0.75}
        />
      </Canvas>
    </div>
  );
}
