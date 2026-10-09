/**
 * Meritocratic Spatial Engine & Capital Routing
 * Mengatur alokasi AUM dan mutasi meja fisik kantor berdasarkan performa kuantitatif.
 */

import { DeskTier, MeritocraticAllocation } from './autonomousEcosystemSchema';

export interface OfficeSeatCoordinate {
  seatId: string;
  tier: DeskTier;
  x: number;
  y: number;
  deskStyle: {
    color: string;
    glow: string;
    label: string;
  };
}

export const SPATIAL_SEAT_DIRECTORY: Record<DeskTier, OfficeSeatCoordinate[]> = {
  CORNER_PENTHOUSE: [
    {
      seatId: 'PENTHOUSE_01',
      tier: 'CORNER_PENTHOUSE',
      x: 780,
      y: 95,
      deskStyle: { color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.45)', label: 'Penthouse Suite (Alpha Lead)' }
    }
  ],
  SENIOR_DESK: [
    {
      seatId: 'SENIOR_01',
      tier: 'SENIOR_DESK',
      x: 620,
      y: 180,
      deskStyle: { color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.25)', label: 'Senior Quant Desk' }
    },
    {
      seatId: 'SENIOR_02',
      tier: 'SENIOR_DESK',
      x: 620,
      y: 280,
      deskStyle: { color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.25)', label: 'Senior Execution Desk' }
    }
  ],
  BULLPEN_STANDARD: [
    {
      seatId: 'BULLPEN_01',
      tier: 'BULLPEN_STANDARD',
      x: 340,
      y: 220,
      deskStyle: { color: '#94a3b8', glow: 'rgba(148, 163, 184, 0.1)', label: 'Bullpen Desk A' }
    },
    {
      seatId: 'BULLPEN_02',
      tier: 'BULLPEN_STANDARD',
      x: 340,
      y: 320,
      deskStyle: { color: '#94a3b8', glow: 'rgba(148, 163, 184, 0.1)', label: 'Bullpen Desk B' }
    }
  ],
  INTERN_EXILE: [
    {
      seatId: 'INTERN_01',
      tier: 'INTERN_EXILE',
      x: 95,
      y: 490,
      deskStyle: { color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.3)', label: 'The Penalty Box (Intern)' }
    }
  ]
};

/**
 * Evaluasi performa dan alokasi meja secara dinamis
 */
export function reallocateOfficeDesks(
  allocations: MeritocraticAllocation[]
): Map<string, { targetSeat: OfficeSeatCoordinate; tierChanged: boolean; newTier: DeskTier }> {
  // Urutkan agen berdasarkan Skor Sharpe tertinggi
  const sorted = [...allocations].sort((a, b) => b.rollingSharpe - a.rollingSharpe);
  const movements = new Map<string, { targetSeat: OfficeSeatCoordinate; tierChanged: boolean; newTier: DeskTier }>();

  sorted.forEach((agent, index) => {
    let targetTier: DeskTier = 'BULLPEN_STANDARD';

    if (index === 0 && agent.rollingSharpe >= 1.6) {
      targetTier = 'CORNER_PENTHOUSE';
    } else if (index <= 2 && agent.rollingSharpe >= 1.0) {
      targetTier = 'SENIOR_DESK';
    } else if (agent.rollingSharpe < 0 || agent.winRatePct < 40) {
      targetTier = 'INTERN_EXILE';
    }

    const availableSeats = SPATIAL_SEAT_DIRECTORY[targetTier];
    const assignedSeat = availableSeats[0] || SPATIAL_SEAT_DIRECTORY.BULLPEN_STANDARD[0];
    const tierChanged = agent.deskTier !== targetTier;

    movements.set(agent.agentId, {
      targetSeat: assignedSeat,
      tierChanged,
      newTier: targetTier
    });
  });

  return movements;
}

/**
 * Hitung rasio alokasi modal dinamis berdasarkan Kelly Criterion / Sharpe weighting
 */
export function calculateDynamicAumRouting(
  agents: { id: string; name: string; sharpe: number; winRate: number; sortino: number }[],
  totalFundNavUsd: number
): MeritocraticAllocation[] {
  // Normalisasi bobot Sharpe non-negatif
  const safeWeights = agents.map((a) => Math.max(0.05, (a.sharpe + 1.0) * (a.winRate / 100)));
  const sumWeights = safeWeights.reduce((a, b) => a + b, 0) || 1;

  const sorted = agents
    .map((agent, i) => {
      const allocatedPct = Math.round((safeWeights[i] / sumWeights) * 100);
      const allocatedUsd = Math.round((allocatedPct / 100) * totalFundNavUsd);
      return {
        agentId: agent.id,
        agentName: agent.name,
        deskTier: 'BULLPEN_STANDARD' as DeskTier,
        rollingSharpe: Number(agent.sharpe.toFixed(2)),
        sortinoRatio: Number(agent.sortino.toFixed(2)),
        winRatePct: Math.round(agent.winRate),
        consecutiveWins: Math.max(1, Math.round(agent.sharpe * 2)),
        currentAumUsd: allocatedUsd,
        allocatedCapitalPct: allocatedPct,
        rank: 1,
      };
    })
    .sort((a, b) => b.rollingSharpe - a.rollingSharpe);

  return sorted.map((item, idx) => ({
    ...item,
    rank: idx + 1,
    deskTier: idx === 0 ? 'CORNER_PENTHOUSE' : idx <= 2 ? 'SENIOR_DESK' : item.rollingSharpe < 0 ? 'INTERN_EXILE' : 'BULLPEN_STANDARD'
  }));
}
