import React from 'react';
import AdminAuthGate from '@/components/admin/AdminAuthGate';
import './steyer-admin.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGate>
      {children}
    </AdminAuthGate>
  );
}
