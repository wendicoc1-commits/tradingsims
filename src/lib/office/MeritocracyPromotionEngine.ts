// src/lib/office/MeritocracyPromotionEngine.ts
/**
 * Autonomous Meritocratic Promotion & Desk Allocation Engine
 * Dynamically re-ranks agents by rolling Sharpe Ratio and Net Alpha:
 * - Rank #1: The Corner Executive Suite (Executive desk, dual ultrawide screens, golden aura)
 * - Middle Ranks: Standard bullpen desks
 * - Lowest Rank / Drawdown: "The Intern Desk" (flickering CRT monitor, stacking coffee mugs)
 */

import { DeskEntity, DeskTier } from '@/types/simulation.types';

export interface AgentPerformanceStats {
  agentId: string;
  name: string;
  role: string;
  rollingSharpe: number;
  netAlphaUsd: number;
  winRatePct: number;
  maxDrawdownPct: number;
  currentDeskId?: string;
}

export interface DeskRelocationOrder {
  agentId: string;
  agentName: string;
  previousDeskId: string;
  targetDeskId: string;
  targetTier: DeskTier;
  targetCoord: { x: number; y: number };
  reason: string;
}

export class MeritocracyPromotionEngine {
  private deskMap: Map<string, DeskEntity> = new Map();
  private lastEvaluationTime: number = 0;
  private readonly evaluationIntervalMs: number = 20_000; // Eval every 20s

  constructor() {
    this.initDefaultDesks();
  }

  private initDefaultDesks() {
    // 1. The Corner Executive Suite (Top Performer: Dual ultrawide, golden aura)
    this.deskMap.set('desk_exec_suite', {
      deskId: 'desk_exec_suite',
      tier: 'EXECUTIVE',
      gridCoord: { gx: 4, gy: 4 },
      worldCoord: { x: 340, y: 380 },
      assignedAgentId: 'cio',
      props: {
        coffeeCupCount: 1,
        hasGoldenTrophy: true,
        monitorHealth: 'NORMAL',
      },
    });

    // 2. Standard Bullpen Desks
    const standardCoords = [
      { id: 'desk_std_1', x: 620, y: 380 },
      { id: 'desk_std_2', x: 900, y: 380 },
      { id: 'desk_std_3', x: 620, y: 640 },
      { id: 'desk_std_4', x: 900, y: 640 },
      { id: 'desk_std_5', x: 1180, y: 380 },
      { id: 'desk_std_6', x: 1180, y: 640 },
    ];

    standardCoords.forEach((d) => {
      this.deskMap.set(d.id, {
        deskId: d.id,
        tier: 'STANDARD',
        gridCoord: { gx: Math.floor(d.x / 32), gy: Math.floor(d.y / 32) },
        worldCoord: { x: d.x, y: d.y },
        assignedAgentId: null,
        props: {
          coffeeCupCount: 2,
          hasGoldenTrophy: false,
          monitorHealth: 'NORMAL',
        },
      });
    });

    // 3. The Intern Desk (Corner Demotion Desk)
    this.deskMap.set('desk_intern_corner', {
      deskId: 'desk_intern_corner',
      tier: 'INTERN',
      gridCoord: { gx: 38, gy: 22 },
      worldCoord: { x: 1420, y: 840 },
      assignedAgentId: null,
      props: {
        coffeeCupCount: 5,
        hasGoldenTrophy: false,
        monitorHealth: 'GLITCH_SMOKE',
      },
    });
  }

  public getDesks(): DeskEntity[] {
    return Array.from(this.deskMap.values());
  }

  public getDeskById(id: string): DeskEntity | undefined {
    return this.deskMap.get(id);
  }

  /**
   * Evaluates agent performance and returns relocation orders if hierarchy swapped
   */
  public evaluatePromotions(
    agents: AgentPerformanceStats[],
    force: boolean = false
  ): DeskRelocationOrder[] {
    const now = Date.now();
    if (!force && now - this.lastEvaluationTime < this.evaluationIntervalMs) {
      return [];
    }
    this.lastEvaluationTime = now;

    if (agents.length === 0) return [];

    // Sort descending by Sharpe Ratio, then Net Alpha
    const ranked = [...agents].sort((a, b) => {
      if (b.rollingSharpe !== a.rollingSharpe) {
        return b.rollingSharpe - a.rollingSharpe;
      }
      return b.netAlphaUsd - a.netAlphaUsd;
    });

    const orders: DeskRelocationOrder[] = [];
    const execDesk = this.deskMap.get('desk_exec_suite');
    const internDesk = this.deskMap.get('desk_intern_corner');

    // 1. Evaluate Corner Executive Suite (Rank #1)
    const topAgent = ranked[0];
    if (execDesk && topAgent && execDesk.assignedAgentId !== topAgent.agentId) {
      orders.push({
        agentId: topAgent.agentId,
        agentName: topAgent.name,
        previousDeskId: topAgent.currentDeskId || 'unknown',
        targetDeskId: 'desk_exec_suite',
        targetTier: 'EXECUTIVE',
        targetCoord: { ...execDesk.worldCoord },
        reason: `Promosi ke Corner Executive Suite (Sharpe Ratio tertinggi: ${topAgent.rollingSharpe.toFixed(2)})`,
      });
      execDesk.assignedAgentId = topAgent.agentId;
      execDesk.props.hasGoldenTrophy = true;
    }

    // 2. Evaluate Intern Desk (Lowest Performer with Drawdown)
    const bottomAgent = ranked[ranked.length - 1];
    if (
      internDesk &&
      bottomAgent &&
      ranked.length > 2 &&
      bottomAgent.rollingSharpe < 0.8 &&
      internDesk.assignedAgentId !== bottomAgent.agentId
    ) {
      orders.push({
        agentId: bottomAgent.agentId,
        agentName: bottomAgent.name,
        previousDeskId: bottomAgent.currentDeskId || 'unknown',
        targetDeskId: 'desk_intern_corner',
        targetTier: 'INTERN',
        targetCoord: { ...internDesk.worldCoord },
        reason: `Demosi ke Meja Magang (Sharpe ${bottomAgent.rollingSharpe.toFixed(2)}, Drawdown ${bottomAgent.maxDrawdownPct.toFixed(1)}%)`,
      });
      internDesk.assignedAgentId = bottomAgent.agentId;
      internDesk.props.coffeeCupCount = 6;
      internDesk.props.monitorHealth = 'GLITCH_SMOKE';
    }

    return orders;
  }
}

export const globalMeritocracy = new MeritocracyPromotionEngine();
