'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { XPiece, OPiece } from './Pieces3D';
import { WinningParticles } from './Particles';

interface Board3DProps {
  board: (string | null)[];
  onCellClick: (index: number) => void;
  disabled?: boolean;
  winningLine?: number[] | null;
}

function Cell({ position, value, index, onClick, isWinning, disabled }: {
  position: [number, number, number];
  value: string | null;
  index: number;
  onClick: () => void;
  isWinning: boolean;
  disabled: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [dropAnimation, setDropAnimation] = useState(0);
  
  // Animate cell on hover
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = hovered && !value && !disabled ? 0.05 : 0;
    }
  });
  
  // Trigger drop animation when value changes
  useEffect(() => {
    if (value) {
      setDropAnimation(1);
    }
  }, [value]);

  return (
    <group ref={groupRef} position={position}>
      {/* Cell base */}
      <Box
        ref={meshRef}
        args={[0.9, 0.1, 0.9]}
        onClick={() => !disabled && !value && onClick()}
        onPointerOver={() => !disabled && !value && setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={
            isWinning ? '#10b981' :
            hovered && !value && !disabled ? '#60a5fa' :
            '#1e293b'
          }
          metalness={0.3}
          roughness={0.5}
          emissive={isWinning ? '#10b981' : (hovered && !value && !disabled ? '#3b82f6' : '#000000')}
          emissiveIntensity={isWinning ? 0.3 : (hovered && !value && !disabled ? 0.1 : 0)}
        />
      </Box>
      
      {/* Cell border with glow effect */}
      <Box args={[1, 0.05, 1]} position={[0, -0.025, 0]} receiveShadow>
        <meshStandardMaterial 
          color="#475569"
          metalness={0.6}
          roughness={0.3}
        />
      </Box>
      
      {/* Hover indicator */}
      {hovered && !value && !disabled && (
        <Box args={[0.9, 0.01, 0.9]} position={[0, 0.06, 0]}>
          <meshStandardMaterial
            color="#60a5fa"
            emissive="#60a5fa"
            emissiveIntensity={0.5}
            opacity={0.3}
            transparent
          />
        </Box>
      )}
      
      {/* X or O piece with drop animation */}
      {value === 'X' && (
        <XPiece 
          position={[0, 0.3, 0]} 
          color={isWinning ? '#10b981' : '#3b82f6'}
          dropAnimation={dropAnimation}
        />
      )}
      {value === 'O' && (
        <OPiece 
          position={[0, 0.3, 0]} 
          color={isWinning ? '#10b981' : '#ef4444'}
          dropAnimation={dropAnimation}
        />
      )}
    </group>
  );
}

function GameBoard({ board, onCellClick, disabled, winningLine }: Board3DProps) {
  const boardRef = useRef<THREE.Group>(null);
  const showParticles = winningLine && winningLine.length > 0;
  
  // Gentle board rotation
  useFrame((state) => {
    if (boardRef.current) {
      boardRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
    }
  });
  
  return (
    <>
      {/* Enhanced lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />
      <pointLight position={[-10, 10, -10]} intensity={0.5} />
      <pointLight position={[0, -5, 0]} intensity={0.3} color="#60a5fa" />
      
      {/* Environment for reflections */}
      <Environment preset="city" />
      
      {/* Board grid */}
      <group ref={boardRef} position={[0, 0, 0]}>
        {board.map((value, index) => {
          const row = Math.floor(index / 4);
          const col = index % 4;
          const x = (col - 1.5) * 1.1;
          const z = (row - 1.5) * 1.1;
          
          return (
            <Cell
              key={index}
              position={[x, 0, z]}
              value={value}
              index={index}
              onClick={() => onCellClick(index)}
              isWinning={winningLine?.includes(index) || false}
              disabled={disabled || false}
            />
          );
        })}
      </group>
      
      {/* Board base with enhanced materials */}
      <Box args={[5, 0.2, 5]} position={[0, -0.2, 0]} receiveShadow>
        <meshStandardMaterial 
          color="#0f172a" 
          metalness={0.9} 
          roughness={0.1}
          envMapIntensity={0.5}
        />
      </Box>
      
      {/* Board glow effect */}
      <Box args={[5.1, 0.01, 5.1]} position={[0, -0.31, 0]}>
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={0.2}
        />
      </Box>
      
      {/* Contact shadows for depth */}
      <ContactShadows 
        position={[0, -0.32, 0]} 
        opacity={0.4} 
        scale={10} 
        blur={2} 
        far={10}
      />
      
      {/* Victory particles */}
      {showParticles && <WinningParticles count={200} />}
    </>
  );
}

export function Board3D({ board, onCellClick, disabled, winningLine }: Board3DProps) {
  return (
    <div className="w-full h-[600px] bg-gray-900 rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [5, 5, 5], fov: 50 }}
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}
      >
        <OrbitControls
          enablePan={false}
          minDistance={5}
          maxDistance={12}
          maxPolarAngle={Math.PI / 2.2}
          autoRotate={false}
          enableDamping
          dampingFactor={0.05}
        />
        <GameBoard
          board={board}
          onCellClick={onCellClick}
          disabled={disabled}
          winningLine={winningLine}
        />
      </Canvas>
    </div>
  );
}