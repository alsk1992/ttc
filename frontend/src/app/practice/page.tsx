'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PracticeGame } from '@/components/PracticeGame';
import { Difficulty } from '@/lib/ai-player';

function PracticeGameContent() {
  const searchParams = useSearchParams();
  const difficultyParam = searchParams.get('difficulty') as Difficulty | null;
  const [difficulty] = useState<Difficulty>(difficultyParam || 'medium');

  return <PracticeGame difficulty={difficulty} />;
}

export default function PracticePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading practice mode...</p>
        </div>
      </div>
    }>
      <PracticeGameContent />
    </Suspense>
  );
}