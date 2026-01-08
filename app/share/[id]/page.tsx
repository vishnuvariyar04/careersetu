// app/share/[id]/page.tsx
'use client';

import React from 'react';
import ImmersiveLearningPlatform from '@/app/learn/page'; // Adjust path if needed
import { useParams } from 'next/navigation';

export default function SharePage() {
  const params = useParams();
  const shareId = params?.id as string;

  return (
    <ImmersiveLearningPlatform shareInteractionId={shareId} />
  );
}