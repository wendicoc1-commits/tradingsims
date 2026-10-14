'use client';

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
  return <FinceptCustomizableDashboard />;
}
