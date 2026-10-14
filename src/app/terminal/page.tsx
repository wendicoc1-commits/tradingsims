'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import WorkstationSkeleton from '@/components/skeletons/WorkstationSkeleton';

// Dynamic import dengan skeleton loading instan untuk workstation terminal
const FinceptCustomizableDashboard = dynamic(
  () => import('@/components/dashboard/FinceptCustomizableDashboard'),
  {
    ssr: false,
    loading: () => <WorkstationSkeleton />,
  }
);

export default function TerminalPage() {
  const router = useRouter();
  const [hasEnteredSession, setHasEnteredSession] = useState(false);

  useEffect(() => {
    try {
      // Pastikan setiap sesi baru selalu melewati landing page terlebih dahulu
      const isSessionActive = sessionStorage.getItem('tradesim_session_entered_v1');
      if (!isSessionActive) {
        router.replace('/');
        return;
      }
      setHasEnteredSession(true);
    } catch {
      setHasEnteredSession(true);
    }
  }, [router]);

  if (!hasEnteredSession) {
    return <WorkstationSkeleton />;
  }

  return <FinceptCustomizableDashboard />;
}
