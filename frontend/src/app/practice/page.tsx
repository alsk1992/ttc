'use client';

import { Suspense } from 'react';
import { Game4x4 } from '@/components/Game4x4';

function PracticeGameContent() {
  return <Game4x4 mode="practice" />;
}

export default function PracticePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-400">加载中 Loading 3D practice mode...</p>
        </div>
      </div>
    }>
      <PracticeGameContent />
    </Suspense>
  );
}