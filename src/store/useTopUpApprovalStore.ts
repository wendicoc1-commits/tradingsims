'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { usePortfolioStore } from '@/store';
import { bloombergAudio } from '@/lib/bloombergAudio';

export interface TopUpRequest {
  id: string;
  senderName: string;
  senderBank: string;
  nominalIDR: number;
  virtualCash: number;
  refNote?: string;
  proofImageBase64?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
  approvedAt?: string;
}

interface TopUpApprovalState {
  requests: TopUpRequest[];
  adminPin: string;
  submitRequest: (params: {
    senderName: string;
    senderBank: string;
    nominalIDR: number;
    refNote?: string;
    proofImageBase64?: string;
  }) => TopUpRequest;
  approveRequest: (requestId: string) => { success: boolean; message: string; addedVirtualCash?: number };
  rejectRequest: (requestId: string, reason?: string) => { success: boolean; message: string };
  verifyAdminPin: (pin: string) => boolean;
  changeAdminPin: (oldPin: string, newPin: string) => boolean;
  clearHistory: () => void;
}

export const useTopUpApprovalStore = create<TopUpApprovalState>()(
  persist(
    (set, get) => ({
      requests: [],
      adminPin: '8888', // Default PIN Admin

      submitRequest: ({ senderName, senderBank, nominalIDR, refNote, proofImageBase64 }) => {
        const multiplier = Math.floor(nominalIDR / 10000);
        const virtualCash = multiplier * 1_000_000;
        const now = new Date();
        const dateStr = now.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
        const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        const newReq: TopUpRequest = {
          id: `REQ-${Date.now().toString().slice(-6)}`,
          senderName: senderName.trim(),
          senderBank: senderBank.trim(),
          nominalIDR,
          virtualCash,
          refNote: refNote?.trim(),
          proofImageBase64,
          status: 'PENDING',
          createdAt: `${dateStr}, ${timeStr}`,
        };

        set((state) => ({
          requests: [newReq, ...state.requests],
        }));

        return newReq;
      },

      approveRequest: (requestId: string) => {
        const state = get();
        const target = state.requests.find((r) => r.id === requestId);

        if (!target) {
          return { success: false, message: 'Permintaan top-up tidak ditemukan.' };
        }

        if (target.status === 'APPROVED') {
          return { success: false, message: 'Permintaan ini sudah disetujui sebelumnya.' };
        }

        // 1. Eksekusi penambahan saldo kas ke portofolio HANYA setelah Admin setuju!
        const res = usePortfolioStore.getState().topUpCashWithBonus(target.nominalIDR);

        // 2. Mainkan audio sukses persetujuan
        bloombergAudio.playOrderFilledChime();

        // 3. Update status tiket
        const now = new Date();
        const approvedAt = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        set((s) => ({
          requests: s.requests.map((r) =>
            r.id === requestId
              ? { ...r, status: 'APPROVED', approvedAt }
              : r
          ),
        }));

        return {
          success: true,
          message: `Berhasil! Saldo +Rp ${res.addedVirtualCash.toLocaleString('id-ID')} telah disuntikkan ke portofolio.`,
          addedVirtualCash: res.addedVirtualCash,
        };
      },

      rejectRequest: (requestId: string, reason = 'Uang belum masuk ke rekening atau bukti transfer tidak valid.') => {
        const state = get();
        const target = state.requests.find((r) => r.id === requestId);

        if (!target) {
          return { success: false, message: 'Permintaan tidak ditemukan.' };
        }

        set((s) => ({
          requests: s.requests.map((r) =>
            r.id === requestId
              ? { ...r, status: 'REJECTED', rejectionReason: reason }
              : r
          ),
        }));

        return { success: true, message: 'Permintaan top-up telah ditolak.' };
      },

      verifyAdminPin: (pin: string) => {
        return pin === get().adminPin;
      },

      changeAdminPin: (oldPin: string, newPin: string) => {
        if (oldPin !== get().adminPin) return false;
        set({ adminPin: newPin });
        return true;
      },

      clearHistory: () => {
        set({ requests: [] });
      },
    }),
    {
      name: 'tradingsims-topup-approval-storage',
    }
  )
);
