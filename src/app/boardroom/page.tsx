import React from 'react';
import type { Metadata } from 'next';
import AutonomousBoardroomView from '@/components/ai/AutonomousBoardroomView';

export const metadata: Metadata = {
  title: 'Autonomous C-Suite Boardroom | TradeSims AI Trading Firm',
  description:
    'Sidang Dewan Direksi Otonom 24/7 (Bezos, Munger, Vogels, Godin) yang menganalisis dan memutuskan alokasi investasi saham BEI dan Kripto secara mandiri.',
};

export default function BoardroomPage() {
  return <AutonomousBoardroomView />;
}
