"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Sphere, Box, Line } from "@react-three/drei";
import * as THREE from "three";

// Floating Cube representing a question or module
function FloatingCube({ position, color, speed = 1 }: { position: [number, number, number], color: string, speed?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5 * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2 * speed;
    }
  });

  return (
    <Float speed={2 * speed} rotationIntensity={1} floatIntensity={2} position={position}>
      <Box ref={meshRef} args={[1, 1, 1]}>
        <meshStandardMaterial color={color} wireframe transparent opacity={0.6} />
      </Box>
    </Float>
  );
}

// Glowing Node representing logic
function GlowingNode({ position, color }: { position: [number, number, number], color: string }) {
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1} position={position}>
      <Sphere args={[0.3, 16, 16]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
      </Sphere>
      <pointLight color={color} intensity={5} distance={5} />
    </Float>
  );
}

// Pre-generate particle positions at module scope (outside render) to satisfy purity rules
const PARTICLE_COUNT = 100;
const PARTICLE_POSITIONS = (() => {
  const pos = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 15;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
  }
  return pos;
})();

// Particle system for data processing
function DataParticles() {
  const positions = PARTICLE_POSITIONS;

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      pointsRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#45A29E" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

// Constellation lines to connect nodes
function ConstellationNetwork() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <GlowingNode position={[-2, 1, 0]} color="#45A29E" />
      <GlowingNode position={[2, 2, -2]} color="#66FCF1" />
      <GlowingNode position={[0, -2, 1]} color="#C5C6C7" />
      <GlowingNode position={[3, -1, -1]} color="#45A29E" />

      {/* Lines between nodes */}
      <Line points={[[-2, 1, 0], [2, 2, -2]]} color="#1F2833" lineWidth={1} transparent opacity={0.5} />
      <Line points={[[2, 2, -2], [3, -1, -1]]} color="#1F2833" lineWidth={1} transparent opacity={0.5} />
      <Line points={[[3, -1, -1], [0, -2, 1]]} color="#1F2833" lineWidth={1} transparent opacity={0.5} />
      <Line points={[[0, -2, 1], [-2, 1, 0]]} color="#1F2833" lineWidth={1} transparent opacity={0.5} />
      <Line points={[[0, -2, 1], [2, 2, -2]]} color="#1F2833" lineWidth={1} transparent opacity={0.5} />
    </group>
  );
}

export default function Hero3D() {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        {/* Soft ambient light */}
        <ambientLight intensity={0.4} />
        {/* Directional light to give some 3D feel to non-emissive meshes */}
        <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
        
        {/* Base visualization components */}
        <ConstellationNetwork />
        
        {/* Floating geometric elements */}
        <FloatingCube position={[-3, -2, -2]} color="#45A29E" speed={0.8} />
        <FloatingCube position={[3, 3, -4]} color="#66FCF1" speed={1.2} />
        <FloatingCube position={[-4, 3, -1]} color="#1F2833" speed={0.5} />

        {/* Subtle particle background */}
        <DataParticles />

        {/* Orbit controls with restricted movement for subtle parallax by user if they drag */}
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate={false}
          maxPolarAngle={Math.PI / 2 + 0.2} 
          minPolarAngle={Math.PI / 2 - 0.2}
          maxAzimuthAngle={0.2}
          minAzimuthAngle={-0.2}
        />
      </Canvas>
    </div>
  );
}
