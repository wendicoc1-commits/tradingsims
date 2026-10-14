'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuthStore, waitForAuthHydration } from '@/store/useAuthStore';
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
  const { user } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function verifyAccess() {
      await waitForAuthHydration();
      const currentUser = useAuthStore.getState().user;

      // 1. Jika belum sign in, paksa kembali ke beranda
      if (!currentUser) {
        if (mounted) {
          router.replace('/');
        }
        return;
      }

      // 2. Pastikan sesi valid
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('tradesim_session_entered_v1', 'true');
      }

      if (mounted) {
        setIsAuthorized(true);
      }
    }

    verifyAccess();

    return () => {
      mounted = false;
    };
  }, [router, user]);

  if (!isAuthorized) {
    return <WorkstationSkeleton />;
  }

  return <FinceptCustomizableDashboard />;
}
