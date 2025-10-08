'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Torus, Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface XPieceProps {
  position: [number, number, number];
  color?: string;
  dropAnimation?: number;
}

export function XPiece({ position, color = '#3b82f6', dropAnimation = 0 }: XPieceProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  
  // Drop and rotation animation
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Rotation
      groupRef.current.rotation.y += 0.01;
      
      // Drop animation
      if (dropAnimation > 0 && animationProgress < 1) {
        const newProgress = Math.min(animationProgress + delta * 3, 1);
        setAnimationProgress(newProgress);
        
        // Bounce effect
        const dropHeight = 3;
        const bounce = Math.sin(newProgress * Math.PI) * 0.2;
        const easeOut = 1 - Math.pow(1 - newProgress, 3);
        groupRef.current.position.y = position[1] + (1 - easeOut) * dropHeight + bounce;
        
        // Scale effect
        const scale = 0.5 + easeOut * 0.5;
        groupRef.current.scale.setScalar(scale);
      }
    }
  });

  return (
    <group ref={groupRef} position={[position[0], position[1] + 3, position[2]]}>
      {/* First bar of X */}
      <Box args={[0.7, 0.15, 0.15]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <meshStandardMaterial 
          color={color} 
          metalness={0.8} 
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.1}
        />
      </Box>
      {/* Second bar of X */}
      <Box args={[0.7, 0.15, 0.15]} rotation={[0, 0, -Math.PI / 4]} castShadow>
        <meshStandardMaterial 
          color={color} 
          metalness={0.8} 
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.1}
        />
      </Box>
      {/* Center sphere for style */}
      <Sphere args={[0.1, 16, 16]} castShadow>
        <meshStandardMaterial 
          color={color} 
          metalness={1} 
          roughness={0}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </Sphere>
    </group>
  );
}

interface OPieceProps {
  position: [number, number, number];
  color?: string;
  dropAnimation?: number;
}

export function OPiece({ position, color = '#ef4444', dropAnimation = 0 }: OPieceProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  
  // Drop and rotation animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Rotation
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.z += 0.005;
      
      // Drop animation
      if (dropAnimation > 0 && animationProgress < 1) {
        const newProgress = Math.min(animationProgress + delta * 3, 1);
        setAnimationProgress(newProgress);
        
        // Bounce effect
        const dropHeight = 3;
        const bounce = Math.sin(newProgress * Math.PI) * 0.2;
        const easeOut = 1 - Math.pow(1 - newProgress, 3);
        meshRef.current.position.y = position[1] + (1 - easeOut) * dropHeight + bounce;
        
        // Scale effect
        const scale = 0.5 + easeOut * 0.5;
        meshRef.current.scale.setScalar(scale);
      }
    }
  });

  return (
    <Torus
      ref={meshRef}
      position={[position[0], position[1] + 3, position[2]]}
      args={[0.3, 0.1, 16, 100]}
      castShadow
    >
      <meshStandardMaterial 
        color={color} 
        metalness={0.8} 
        roughness={0.2}
        emissive={color}
        emissiveIntensity={0.1}
      />
    </Torus>
  );
}