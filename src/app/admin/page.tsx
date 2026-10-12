import React, { Suspense } from 'react';
import SteyerAdminApp from '@/components/admin/SteyerAdminApp';

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="steyer-scope" style={{ minHeight: '100vh', background: '#141413' }} />}>
      <SteyerAdminApp initialView="equipment" />
    </Suspense>
  );
}
