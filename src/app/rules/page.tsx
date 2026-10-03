'use client';

import React from 'react';
import { RulesModal } from '../../components/RulesModal';
import { useRouter } from 'next/navigation';

export default function RulesPage() {
  const router = useRouter();
  return <RulesModal onClose={() => router.push('/')} />;
}
