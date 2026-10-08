'use client';

import dynamic from 'next/dynamic';
import WorkstationSkeleton from '@/components/skeletons/WorkstationSkeleton';

// Dynamic import dengan skeleton loading instan untuk eliminasi CSR lock & blank freeze
const FinceptCustomizableDashboard = dynamic(
  () => import('@/components/dashboard/FinceptCustomizableDashboard'),
  {
    ssr: false,
    loading: () => <WorkstationSkeleton />,
  }
);

export default function HomePage() {
  return <FinceptCustomizableDashboard />;
}
