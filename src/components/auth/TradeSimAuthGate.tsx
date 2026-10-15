'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, waitForAuthHydration } from '@/store/useAuthStore';
import WorkstationSkeleton from '@/components/skeletons/WorkstationSkeleton';

/**
 * TradeSimAuthGate
 * 
 * Enforces strict authentication for all internal platform routes (terminal, markets, crypto, portfolio, etc.).
 * If the user is not authenticated or closes their tab/logs out, they are instantly redirected to the beranda (/).
 */
export default function TradeSimAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const { user } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const isPublicRoute =
    pathname === '/' ||
    pathname === '/landing' ||
    pathname.startsWith('/tools') ||
    pathname.startsWith('/learn') ||
    pathname.startsWith('/stock') ||
    pathname.startsWith('/admin');

  useEffect(() => {
    if (isPublicRoute) {
      setIsAuthorized(true);
      return;
    }

    let mounted = true;

    async function checkUserAuth() {
      await waitForAuthHydration();
      const currentUser = useAuthStore.getState().user;

      if (!currentUser) {
        if (mounted) {
          router.replace('/');
        }
        return;
      }

      if (mounted) {
        setIsAuthorized(true);
      }
    }

    checkUserAuth();

    return () => {
      mounted = false;
    };
  }, [pathname, isPublicRoute, router, user]);

  if (!isAuthorized && !isPublicRoute) {
    return <WorkstationSkeleton />;
  }

  return <>{children}</>;
}
