'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Cylinder, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { WinningParticles } from './Particles';

interface ConnectFourBoard3DProps {
  board: (string | null)[];
  onCellClick: (index: number) => void;
  disabled?: boolean;
  winningLine?: number[] | null;
}

// Individual slot in the Connect Four board
function Slot({ position, columnIndex, rowIndex, isEmpty, onColumnClick, isHovered }: {
  position: [number, number, number];
  columnIndex: number;
  rowIndex: number;
  isEmpty: boolean;
  onColumnClick: () => void;
  isHovered: boolean;
}) {
  return (
    <group position={position}>
      {/* Slot hole - dark interior */}
      <Cylinder args={[0.35, 0.35, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial 
          color="#0a0e27"
          metalness={0.2}
          roughness={0.8}
        />
      </Cylinder>
      
      {/* Slot ring - yellow/gold frame */}
      <Cylinder args={[0.4, 0.4, 0.3, 32, 1, false]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial 
          color={isHovered && isEmpty ? "#FFCC33" : "#F0B90B"}
          metalness={0.7}
          roughness={0.3}
          emissive={isHovered && isEmpty ? "#FFCC33" : "#000000"}
          emissiveIntensity={isHovered && isEmpty ? 0.2 : 0}
        />
      </Cylinder>
    </group>
  );
}

// Game piece (disc)
function GamePiece({ position, color, isDropping }: {
  position: [number, number, number];
  color: 'X' | 'O';
  isDropping: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [dropProgress, setDropProgress] = useState(0);
  
  useFrame((state, delta) => {
    if (isDropping && dropProgress < 1) {
      setDropProgress(Math.min(dropProgress + delta * 3, 1));
    }
    
    if (meshRef.current && isDropping) {
      // Bounce effect
      const bounce = Math.sin(dropProgress * Math.PI * 2) * 0.1 * (1 - dropProgress);
      meshRef.current.position.y = position[1] + (1 - dropProgress) * 3 + bounce;
    }
  });
  
  return (
    <Cylinder 
      ref={meshRef}
      args={[0.35, 0.35, 0.25]} 
      position={isDropping ? [position[0], position[1] + 3, position[2]] : position}
      rotation={[Math.PI / 2, 0, 0]}
      castShadow
    >
      <meshStandardMaterial 
        color={color === 'X' ? '#3b82f6' : '#ef4444'}
        metalness={0.6}
        roughness={0.2}
        emissive={color === 'X' ? '#3b82f6' : '#ef4444'}
        emissiveIntensity={0.1}
      />
    </Cylinder>
  );
}

function ConnectFourBoard({ board, onCellClick, disabled, winningLine }: ConnectFourBoard3DProps) {
  const boardRef = useRef<THREE.Group>(null);
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  const [recentMoves, setRecentMoves] = useState<Set<number>>(new Set());
  const showParticles = winningLine && winningLine.length > 0;
  
  // Track recent moves for drop animation
  useEffect(() => {
    const newMoves = new Set<number>();
    board.forEach((cell, index) => {
      if (cell && !recentMoves.has(index)) {
        newMoves.add(index);
      }
    });
    setRecentMoves(new Set([...recentMoves, ...newMoves]));
  }, [board]);
  
  // Gentle board rotation
  useFrame((state) => {
    if (boardRef.current) {
      boardRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
    }
  });
  
  // Find the lowest empty row in a column
  const getLowestEmptyRow = (col: number): number | null => {
    for (let row = 3; row >= 0; row--) {
      const index = row * 4 + col;
      if (!board[index]) {
        return row;
      }
    }
    return null;
  };
  
  const handleColumnClick = (col: number) => {
    const row = getLowestEmptyRow(col);
    if (row !== null) {
      const index = row * 4 + col;
      onCellClick(index);
    }
  };
  
  return (
    <>
      {/* Enhanced lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />
      <pointLight position={[-10, 10, -10]} intensity={0.5} />
      <pointLight position={[0, -5, 0]} intensity={0.3} color="#F0B90B" />
      
      {/* Main board group */}
      <group ref={boardRef} position={[0, 0, 0]}>
        {/* Board frame - yellow/gold Connect Four style */}
        <RoundedBox 
          args={[5.2, 4.5, 0.5]} 
          position={[0, 1.5, 0]}
          radius={0.1}
          receiveShadow
        >
          <meshStandardMaterial 
            color="#F0B90B"
            metalness={0.7}
            roughness={0.3}
            emissive="#F0B90B"
            emissiveIntensity={0.05}
          />
        </RoundedBox>
        
        {/* Board slots and pieces */}
        {Array.from({ length: 4 }, (_, row) => 
          Array.from({ length: 4 }, (_, col) => {
            const index = row * 4 + col;
            const value = board[index];
            const x = (col - 1.5) * 1.1;
            const y = (3 - row) * 0.9 + 0.2; // Flip Y so bottom is row 3
            const z = 0.3; // Slightly forward from board
            
            return (
              <group key={index}>
                {/* Clickable area for column */}
                {row === 0 && (
                  <Box 
                    args={[1, 4, 0.5]} 
                    position={[x, 1.5, 0]}
                    onClick={() => !disabled && handleColumnClick(col)}
                    onPointerEnter={() => !disabled && setHoveredColumn(col)}
                    onPointerLeave={() => setHoveredColumn(null)}
                    visible={false}
                  />
                )}
                
                {/* Slot */}
                <Slot
                  position={[x, y, z]}
                  columnIndex={col}
                  rowIndex={row}
                  isEmpty={!value}
                  onColumnClick={() => !disabled && handleColumnClick(col)}
                  isHovered={hoveredColumn === col && !disabled}
                />
                
                {/* Game piece */}
                {value && (
                  <GamePiece
                    position={[x, y, z]}
                    color={value as 'X' | 'O'}
                    isDropping={recentMoves.has(index)}
                  />
                )}
              </group>
            );
          })
        )}
        
        {/* Base/stand */}
        <Box args={[5.4, 0.3, 2]} position={[0, -0.3, 0]} receiveShadow>
          <meshStandardMaterial 
            color="#1e293b"
            metalness={0.8}
            roughness={0.2}
          />
        </Box>
        
        {/* Support legs */}
        <Cylinder args={[0.2, 0.3, 0.8]} position={[-2, -0.7, 0]} castShadow>
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </Cylinder>
        <Cylinder args={[0.2, 0.3, 0.8]} position={[2, -0.7, 0]} castShadow>
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </Cylinder>
      </group>
      
      {/* Victory particles */}
      {showParticles && <WinningParticles count={200} />}
    </>
  );
}

export function ConnectFourBoard3D({ board, onCellClick, disabled, winningLine }: ConnectFourBoard3DProps) {
  return (
    <div className="w-full h-[600px] bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg overflow-hidden shadow-2xl">
      <Canvas
        camera={{ position: [0, 3, 8], fov: 45 }}
        shadows
      >
        <OrbitControls
          enablePan={false}
          minDistance={6}
          maxDistance={15}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 4}
          enableDamping
          dampingFactor={0.05}
          target={[0, 1.5, 0]}
        />
        <ConnectFourBoard
          board={board}
          onCellClick={onCellClick}
          disabled={disabled}
          winningLine={winningLine}
        />
      </Canvas>
    </div>
  );
}