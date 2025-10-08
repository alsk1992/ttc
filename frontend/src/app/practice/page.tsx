'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PracticeGame } from '@/components/PracticeGame';
import { Difficulty } from '@/lib/ai-player';

export default function PracticePage() {
  const searchParams = useSearchParams();
  const difficultyParam = searchParams.get('difficulty') as Difficulty | null;
  const [difficulty] = useState<Difficulty>(difficultyParam || 'medium');

  return <PracticeGame difficulty={difficulty} />;
}