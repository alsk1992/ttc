'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticlesProps {
  count?: number;
  color?: string;
}

export function WinningParticles({ count = 100, color = '#10b981' }: ParticlesProps) {
  const meshRef = useRef<THREE.Points>(null);
  const particlesRef = useRef<Float32Array>();

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Random starting positions
      positions[i * 3] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 1] = Math.random() * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      
      // Random velocities
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = Math.random() * 0.05 + 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    
    particlesRef.current = velocities;
    return positions;
  }, [count]);

  useFrame((state) => {
    if (meshRef.current && particlesRef.current) {
      const positions = meshRef.current.geometry.attributes.position;
      const velocities = particlesRef.current;
      
      for (let i = 0; i < count; i++) {
        // Update positions
        positions.array[i * 3] += velocities[i * 3];
        positions.array[i * 3 + 1] += velocities[i * 3 + 1];
        positions.array[i * 3 + 2] += velocities[i * 3 + 2];
        
        // Apply gravity
        velocities[i * 3 + 1] -= 0.001;
        
        // Reset particles that fall too low
        if (positions.array[i * 3 + 1] < -2) {
          positions.array[i * 3] = (Math.random() - 0.5) * 4;
          positions.array[i * 3 + 1] = Math.random() * 2;
          positions.array[i * 3 + 2] = (Math.random() - 0.5) * 4;
          
          velocities[i * 3] = (Math.random() - 0.5) * 0.02;
          velocities[i * 3 + 1] = Math.random() * 0.05 + 0.02;
          velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
        }
      }
      
      positions.needsUpdate = true;
      
      // Rotate the whole system
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={color}
        transparent
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}