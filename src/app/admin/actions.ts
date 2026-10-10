'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { 
  resetUserPortfolio, 
  deleteUserAccountLocal,
  saveServerDeposit,
  getServerDeposits,
  updateServerDepositStatus,
  loadUserPortfolio,
  saveUserPortfolio,
  ServerDepositRecord
} from '@/lib/server/portfolioStorage';
import crypto from 'crypto';

const SALT = 'tradingsims_cloud_sync_salt_v1';

function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, SALT, 1000, 64, 'sha512').toString('hex');
}

export interface DepositRecord {
  id: string;
  user_id: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  payment_method: string;
  proof_url?: string | null;
  notes?: string | null;
  rejection_reason?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
}

export interface MemberPortfolioItem {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  cash: number;
  realized_pl: number;
  holdings: Array<{
    symbol: string;
    displaySymbol: string;
    name: string;
    avgPrice: number;
    lots: number;
    shares: number;
    currentPrice: number;
    unrealizedPL: number;
    unrealizedPLPercent: number;
    assetClass?: string;
    currency?: string;
  }>;
  totalMarketValue: number;
  totalAssetValue: number;
  updated_at: string;
}

/**
 * Server Action: Approve Deposit via Atomic Postgres RPC + Resilient Direct Fallback
 */
export async function approveDeposit(depositId: string, adminId: string = 'admin-system') {
  try {
    if (!depositId) {
      return { success: false, error: 'Deposit ID tidak valid' };
    }

    const supabaseAdmin = getSupabaseAdminClient();
    let rpcSuccess = false;
    let rpcData: any = null;

    // 1. Coba panggil PostgreSQL RPC approve_deposit (ACID / FOR UPDATE)
    try {
      const { data, error } = await supabaseAdmin.rpc('approve_deposit', {
        deposit_id: depositId,
        admin_id: adminId,
      });

      if (!error && data && data.success !== false) {
        rpcSuccess = true;
        rpcData = data;
      } else if (error) {
        console.warn('[RPC approve_deposit unavailable or failed, using resilient fallback]', error.message);
      }
    } catch (rpcErr: any) {
      console.warn('[RPC approve_deposit catch, falling back to direct update]', rpcErr?.message);
    }

    // 2. Direct Fallback jika RPC function belum di-deploy di PostgreSQL
    if (!rpcSuccess) {
      let targetDeposit: any = null;

      // Cari dari Supabase
      try {
        const { data: d } = await supabaseAdmin
          .from('deposits')
          .select('*')
          .eq('id', depositId)
          .maybeSingle();
        targetDeposit = d;
      } catch (_) {}

      // Jika tidak di Supabase, cari dari server runtime memory
      if (!targetDeposit) {
        const localList = getServerDeposits();
        targetDeposit = localList.find((d) => d.id === depositId);
      }

      if (!targetDeposit) {
        return { success: false, error: 'Data deposit tidak ditemukan' };
      }

      const depositAmount = Number(targetDeposit.amount) || 0;
      const targetUserId = targetDeposit.user_id;

      // Ambil portofolio saat ini
      let currentCash = 0;
      let userEmail = targetDeposit.user?.email || '';

      try {
        const { data: port } = await supabaseAdmin
          .from('user_portfolios')
          .select('cash, email')
          .eq('user_id', targetUserId)
          .maybeSingle();

        if (port) {
          currentCash = Number(port.cash) || 0;
          if (port.email) userEmail = port.email;
        }
      } catch (_) {}

      if (!userEmail) {
        try {
          const { data: u } = await supabaseAdmin
            .from('app_users')
            .select('email')
            .eq('id', targetUserId)
            .maybeSingle();
          if (u?.email) userEmail = u.email;
        } catch (_) {}
      }

      const newCash = currentCash + depositAmount;

      // Update cash dan status orders di user_portfolios Supabase
      try {
        const { data: portData } = await supabaseAdmin
          .from('user_portfolios')
          .select('cash, orders')
          .eq('user_id', targetUserId)
          .maybeSingle();

        const curOrders = Array.isArray(portData?.orders) ? portData.orders : [];
        const updatedOrders = curOrders.map((o: any) =>
          o.id === depositId ? { ...o, status: 'APPROVED', approvedAt: new Date().toISOString(), approvedBy: adminId } : o
        );

        await supabaseAdmin
          .from('user_portfolios')
          .update({ cash: newCash, orders: updatedOrders, updated_at: new Date().toISOString() })
          .eq('user_id', targetUserId);
      } catch (_) {}

      // Update status di tabel deposits Supabase
      try {
        await supabaseAdmin
          .from('deposits')
          .update({
            status: 'APPROVED',
            approved_by: adminId,
            approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', depositId);
      } catch (_) {}

      // Catat di ledger portfolio_transactions jika ada
      try {
        await supabaseAdmin.from('portfolio_transactions').insert({
          user_id: targetUserId,
          email: userEmail || 'member@tradesim.id',
          transaction_type: 'DEPOSIT',
          ticker: 'CASH',
          lots: 0,
          shares_or_amount: depositAmount,
          price: 1,
          total_cash_impact: depositAmount,
          balance_before: currentCash,
          balance_after: newCash,
          notes: `Top up via Admin Approval. Tiket ID: ${depositId}`,
          created_at: new Date().toISOString(),
        });
      } catch (_) {}

      // Sinkronkan juga ke runtime memory server lokal
      const localPort = loadUserPortfolio({ userId: targetUserId, email: userEmail });
      saveUserPortfolio({ userId: targetUserId, email: userEmail }, {
        cash: (localPort?.cash || 0) + depositAmount,
        realizedPL: localPort?.realizedPL || 0,
        holdings: localPort?.holdings || [],
        orders: localPort?.orders || [],
        lastUpdated: Date.now(),
      });

      // Update status di memory server
      updateServerDepositStatus(depositId, 'APPROVED', adminId);
    }

    revalidatePath('/admin/deposits');
    revalidatePath('/admin/portfolios');

    return {
      success: true,
      message: 'Deposit berhasil disetujui dan saldo wallet member telah ditambahkan!',
      data: rpcData,
    };
  } catch (err: any) {
    console.error('[ServerAction approveDeposit]', err);
    return { success: false, error: err.message || 'Terjadi kesalahan sistem' };
  }
}

/**
 * Server Action: Reject Deposit
 */
export async function rejectDeposit(
  depositId: string,
  reason: string = 'Bukti transfer tidak valid atau dana belum masuk',
  adminId: string = 'admin-system'
) {
  try {
    if (!depositId) {
      return { success: false, error: 'Deposit ID tidak valid' };
    }

    const supabaseAdmin = getSupabaseAdminClient();

    try {
      await supabaseAdmin.rpc('reject_deposit', {
        deposit_id: depositId,
        admin_id: adminId,
        rejection_notes: reason,
      });
    } catch (_) {}

    // Selalu pastikan status tabel deposits di Supabase diupdate
    try {
      await supabaseAdmin
        .from('deposits')
        .update({
          status: 'REJECTED',
          rejection_reason: reason,
          approved_by: adminId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', depositId);
    } catch (_) {}

    // Update status di user_portfolios.orders
    try {
      const { data: allPorts } = await supabaseAdmin
        .from('user_portfolios')
        .select('user_id, orders');

      if (allPorts) {
        for (const p of allPorts) {
          const ords = Array.isArray(p.orders) ? p.orders : [];
          const hasTarget = ords.some((o: any) => o.id === depositId);
          if (hasTarget) {
            const updatedOrders = ords.map((o: any) =>
              o.id === depositId ? { ...o, status: 'REJECTED', rejectionReason: reason, approvedBy: adminId } : o
            );
            await supabaseAdmin
              .from('user_portfolios')
              .update({ orders: updatedOrders, updated_at: new Date().toISOString() })
              .eq('user_id', p.user_id);
            break;
          }
        }
      }
    } catch (_) {}

    // Update status di memory server
    updateServerDepositStatus(depositId, 'REJECTED', adminId, reason);

    revalidatePath('/admin/deposits');

    return {
      success: true,
      message: 'Permohonan deposit telah ditolak.',
    };

  } catch (err: any) {
    console.error('[ServerAction rejectDeposit]', err);
    return { success: false, error: err.message || 'Terjadi kesalahan sistem' };
  }
}


/**
 * Server Action: Force Reset Member Password (Auth Admin + Database Table)
 */
export async function resetMemberPassword(userId: string, newPassword: string) {
  try {
    if (!userId || !newPassword) {
      return { success: false, error: 'User ID dan Password baru wajib diisi' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'Password baru minimal 6 karakter' };
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // 1. Update di Supabase Auth Admin jika user terdaftar di auth.users
    try {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword,
      });
    } catch (authErr) {
      console.warn('[Supabase Auth Admin Warning - May be custom auth user]', authErr);
    }

    // 2. Update di tabel public.app_users (password_hash)
    const newHash = hashPassword(newPassword);
    const { error: userErr } = await supabaseAdmin
      .from('app_users')
      .update({ password_hash: newHash })
      .eq('id', userId);

    if (userErr) {
      console.error('[resetMemberPassword app_users error]', userErr);
      return { success: false, error: `Gagal mengupdate password member: ${userErr.message}` };
    }

    revalidatePath('/admin/portfolios');

    return {
      success: true,
      message: `Password untuk akun member (${userId}) berhasil direset!`,
    };
  } catch (err: any) {
    console.error('[ServerAction resetMemberPassword]', err);
    return { success: false, error: err.message || 'Terjadi kesalahan sistem' };
  }
}

/**
 * Server Query: Fetch Pending Deposits Queue (Cloud Supabase + User Portfolios Cloud + Resilient Memory)
 */
export async function getPendingDeposits(): Promise<DepositRecord[]> {
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const combinedMap = new Map<string, any>();

    // 1. Ambil data deposits dari Supabase table deposits jika ada
    try {
      const { data, error } = await supabaseAdmin
        .from('deposits')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        for (const d of data) {
          combinedMap.set(d.id, d);
        }
      }
    } catch (e: any) {
      console.warn('[getPendingDeposits Supabase deposits catch]', e?.message);
    }

    // 2. Ambil data deposit dari user_portfolios (kolom orders) yang selalu ada di Supabase Cloud!
    try {
      const { data: allPorts } = await supabaseAdmin
        .from('user_portfolios')
        .select('user_id, email, orders');

      if (allPorts && Array.isArray(allPorts)) {
        for (const port of allPorts) {
          const ords = Array.isArray(port.orders) ? port.orders : [];
          for (const ord of ords) {
            if (ord.type === 'DEPOSIT' || ord.symbol === 'DEPOSIT' || ord.symbol === 'IDR_DEPOSIT') {
              const rec: DepositRecord = {
                id: ord.id,
                user_id: port.user_id,
                amount: ord.virtualCashAmount || ord.shares || ord.total || 0,
                status: ord.status || 'PENDING',
                payment_method: ord.senderBank || 'QRIS',
                proof_url: ord.proofUrl || null,
                notes: ord.notes || `Pengirim: ${ord.senderName || 'Member'} (${ord.senderBank || 'Bank'}). Bayar: Rp ${(ord.total || 0).toLocaleString('id-ID')}`,
                created_at: ord.createdAt || new Date().toISOString(),
                updated_at: ord.createdAt || new Date().toISOString(),
                user: {
                  id: port.user_id,
                  email: port.email || 'member@tradesim.id',
                  full_name: ord.senderName || port.email?.split('@')[0] || 'Member Trader',
                  role: 'member',
                },
              };
              // Jangan timpa jika sudah ada dari tabel deposits
              if (!combinedMap.has(rec.id)) {
                combinedMap.set(rec.id, rec);
              }
            }
          }
        }
      }
    } catch (e: any) {
      console.warn('[getPendingDeposits user_portfolios catch]', e?.message);
    }

    // 3. Ambil data deposits dari runtime server memory
    const serverMemoryDeposits = getServerDeposits();
    for (const d of serverMemoryDeposits) {
      if (!combinedMap.has(d.id)) {
        combinedMap.set(d.id, d);
      }
    }

    const allDeposits = Array.from(combinedMap.values()).sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );

    // Ambil metadata users untuk join
    const userIds = Array.from(new Set(allDeposits.map((d: any) => d.user_id).filter(Boolean)));
    let userMap: Record<string, any> = {};

    if (userIds.length > 0) {
      try {
        const { data: users } = await supabaseAdmin
          .from('app_users')
          .select('id, email, full_name, role')
          .in('id', userIds);

        if (users) {
          users.forEach((u: any) => {
            userMap[u.id] = u;
          });
        }
      } catch (_) {}
    }

    return allDeposits.map((d: any) => ({
      ...d,
      user: d.user || userMap[d.user_id] || {
        id: d.user_id,
        email: 'member@tradesim.id',
        full_name: 'Member Trader',
        role: 'member',
      },
    }));
  } catch (err) {
    console.error('[getPendingDeposits Error]', err);
    return getServerDeposits() as DepositRecord[];
  }
}



/**
 * Server Query: Fetch Member Portfolios & Cash Balance
 */
export async function getMembersWithPortfolios(searchQuery: string = ''): Promise<MemberPortfolioItem[]> {
  try {
    const supabaseAdmin = getSupabaseAdminClient();

    // 1. Ambil data app_users
    const { data: users, error: usersErr } = await supabaseAdmin
      .from('app_users')
      .select('id, email, full_name, role');

    if (usersErr || !users) {
      return [];
    }

    // 2. Ambil data user_portfolios
    const { data: portfolios, error: portErr } = await supabaseAdmin
      .from('user_portfolios')
      .select('*');

    const portMap: Record<string, any> = {};
    if (portfolios) {
      portfolios.forEach((p: any) => {
        if (p.user_id) portMap[p.user_id] = p;
        if (p.email) portMap[p.email.toLowerCase()] = p;
      });
    }

    const query = searchQuery.trim().toLowerCase();

    const result: MemberPortfolioItem[] = users
      .filter((u: any) => {
        if (!query) return true;
        return (
          u.id.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          (u.full_name && u.full_name.toLowerCase().includes(query))
        );
      })
      .map((u: any) => {
        const port = portMap[u.id] || portMap[u.email.toLowerCase()] || {};
        const holdings = Array.isArray(port.holdings) ? port.holdings : [];
        const cash = typeof port.cash === 'number' ? port.cash : (Number(port.cash) || 0);
        const realized_pl = Number(port.realized_pl) || 0;

        // Hitung estimasi market value
        const totalMarketValue = holdings.reduce((sum: number, h: any) => {
          const shares = (h.shares || 0) > 0 ? h.shares : ((h.lots || 0) * 100);
          const price = h.currentPrice || h.avgPrice || 0;
          const rate = h.currency === 'USD' || h.assetClass === 'US' ? (h.exchangeRate || 16000) : 1;
          return sum + (shares * price * rate);
        }, 0);

        return {
          user_id: u.id,
          email: u.email,
          full_name: u.full_name || 'Member Trader',
          role: u.role || 'member',
          cash,
          realized_pl,
          holdings,
          totalMarketValue,
          totalAssetValue: cash + totalMarketValue,
          updated_at: port.updated_at || new Date().toISOString(),
        };
      });

    return result;
  } catch (err) {
    console.error('[getMembersWithPortfolios Error]', err);
    return [];
  }
}

/**
 * Server Action: Submit Dummy Deposit Request (Untuk testing / onboarding member)
 */
export async function createDepositRequest(userId: string, amount: number, paymentMethod: string = 'BANK_TRANSFER') {
  return submitDepositTicket({
    userId: userId.trim(),
    senderName: 'Simulasi Admin',
    senderBank: paymentMethod,
    nominalPay: Math.round(amount / 100),
    virtualCashAmount: amount,
    notes: 'Dibuat langsung via fitur Simulasi Admin Panel',
  });
}


/**
 * Server Action: Submit Tiket Deposit Member dari Top Up Modal ke Supabase Cloud
 */
export async function submitDepositTicket({
  userId,
  userEmail,
  senderName,
  senderBank,
  nominalPay,
  virtualCashAmount,
  proofImage,
  notes,
}: {
  userId?: string;
  userEmail?: string;
  senderName: string;
  senderBank: string;
  nominalPay: number;
  virtualCashAmount: number;
  proofImage?: string;
  notes?: string;
}) {
  try {
    const supabaseAdmin = getSupabaseAdminClient();

    // 1. Tentukan user_id yang valid
    let targetUserId = userId;

    if (targetUserId) {
      const { data: u } = await supabaseAdmin
        .from('app_users')
        .select('id')
        .eq('id', targetUserId)
        .maybeSingle();
      if (!u) {
        targetUserId = undefined;
      }
    }

    if (!targetUserId && userEmail) {
      const { data: u } = await supabaseAdmin
        .from('app_users')
        .select('id')
        .eq('email', userEmail.toLowerCase().trim())
        .maybeSingle();
      if (u) {
        targetUserId = u.id;
      }
    }

    if (!targetUserId) {
      const { data: anyUser } = await supabaseAdmin
        .from('app_users')
        .select('id')
        .limit(1)
        .maybeSingle();
      targetUserId = anyUser?.id || (userId || `usr-${Date.now()}`);
    }

    const ticketUuid = crypto.randomUUID();
    const nowIso = new Date().toISOString();
    const notesText = `Pengirim: ${senderName} (${senderBank}). Bayar: Rp ${nominalPay.toLocaleString('id-ID')}. Saldo Wallet: Rp ${virtualCashAmount.toLocaleString('id-ID')}.${notes ? ` Catatan: ${notes}` : ''}`;

    const memoryRecord: ServerDepositRecord = {
      id: ticketUuid,
      user_id: targetUserId,
      amount: virtualCashAmount,
      status: 'PENDING',
      payment_method: senderBank || 'QRIS',
      proof_url: proofImage || null,
      notes: notesText,
      created_at: nowIso,
      updated_at: nowIso,
      user: {
        id: targetUserId,
        email: userEmail || 'member@tradesim.id',
        full_name: senderName || 'Member Trader',
        role: 'member',
      },
    };

    // 1. Simpan ke memory queue server terlebih dahulu agar langsung tersedia di admin panel
    saveServerDeposit(memoryRecord);

    // 2. Simpan ke Supabase Cloud (tabel deposits jika ada)
    let savedData: any = memoryRecord;
    try {
      const { data: cloudData, error: cloudErr } = await supabaseAdmin
        .from('deposits')
        .insert({
          id: ticketUuid,
          user_id: targetUserId,
          amount: virtualCashAmount,
          status: 'PENDING',
          payment_method: senderBank || 'QRIS',
          proof_url: proofImage || null,
          notes: notesText,
          created_at: nowIso,
          updated_at: nowIso,
        })
        .select()
        .maybeSingle();

      if (cloudErr) {
        console.warn('[submitDepositTicket Supabase notice - saved in memory queue]', cloudErr.message);
      } else if (cloudData) {
        savedData = cloudData;
      }
    } catch (e: any) {
      console.warn('[submitDepositTicket Supabase catch - saved in memory queue]', e?.message);
    }

    // 3. Simpan juga langsung ke Supabase Cloud tabel user_portfolios (kolom orders) yang PASTI ADA
    try {
      const { data: portData } = await supabaseAdmin
        .from('user_portfolios')
        .select('orders, email')
        .eq('user_id', targetUserId)
        .maybeSingle();

      const existingOrders = Array.isArray(portData?.orders) ? portData.orders : [];
      const depositOrder = {
        id: ticketUuid,
        symbol: 'DEPOSIT',
        displaySymbol: 'TOP UP CASHRDN',
        type: 'DEPOSIT',
        orderType: 'TOPUP',
        price: 1,
        lots: nominalPay,
        shares: virtualCashAmount,
        total: nominalPay,
        fee: 0,
        status: 'PENDING',
        createdAt: nowIso,
        senderName,
        senderBank,
        proofUrl: proofImage || null,
        notes: notesText,
        virtualCashAmount,
      };

      const updatedOrders = [depositOrder, ...existingOrders.filter((o: any) => o.id !== ticketUuid)];

      if (portData) {
        await supabaseAdmin
          .from('user_portfolios')
          .update({ orders: updatedOrders, updated_at: nowIso })
          .eq('user_id', targetUserId);
      } else {
        await supabaseAdmin.from('user_portfolios').insert({
          user_id: targetUserId,
          email: userEmail || 'member@tradesim.id',
          cash: 0,
          realized_pl: 0,
          holdings: [],
          orders: updatedOrders,
          updated_at: nowIso,
        });
      }
    } catch (e: any) {
      console.warn('[submitDepositTicket user_portfolios catch]', e?.message);
    }

    revalidatePath('/admin/deposits');
    return { success: true, data: savedData };

  } catch (err: any) {
    console.error('[submitDepositTicket error]', err);
    return { success: false, error: err.message || 'Gagal menyimpan tiket deposit' };
  }
}



/**
 * Server Action: Reset Akun Member ke Rp 0 (Saldo 0, Portofolio Kosong)
 */
export async function resetMemberAccountToZero(userId: string) {
  try {
    if (!userId) {
      return { success: false, error: 'User ID tidak valid' };
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // 1. Ambil data user
    const { data: user } = await supabaseAdmin
      .from('app_users')
      .select('id, email, full_name')
      .eq('id', userId)
      .maybeSingle();

    const userEmail = user?.email;

    // 2. Ambil saldo lama untuk pencatatan audit
    const { data: currentPort } = await supabaseAdmin
      .from('user_portfolios')
      .select('cash')
      .eq('user_id', userId)
      .maybeSingle();

    const previousCash = currentPort?.cash ? Number(currentPort.cash) : 0;

    // 3. Update user_portfolios di Supabase Cloud: Set cash = 0, realized_pl = 0, kosongkan holdings & orders
    const nowIso = new Date().toISOString();
    const { error: portErr } = await supabaseAdmin
      .from('user_portfolios')
      .upsert({
        user_id: userId,
        email: userEmail || `${userId}@tradesim.id`,
        cash: 0.00,
        realized_pl: 0.00,
        holdings: [],
        orders: [],
        conditional_orders: [],
        dividends: [],
        last_updated: Date.now(),
        updated_at: nowIso,
      }, { onConflict: 'user_id' });

    if (portErr) {
      console.error('[resetMemberAccountToZero error]', portErr);
      return { success: false, error: `Gagal mereset portofolio: ${portErr.message}` };
    }

    // 4. Hapus data order aktif di tabel orders
    try {
      await supabaseAdmin.from('orders').delete().eq('user_id', userId);
    } catch (_) {}

    // 5. Catat ke audit ledger (portfolio_transactions)
    if (userEmail) {
      try {
        await supabaseAdmin.from('portfolio_transactions').insert({
          user_id: userId,
          email: userEmail,
          transaction_type: 'RESET',
          ticker: 'CASH',
          lots: 0,
          shares_or_amount: previousCash,
          price: 1,
          total_cash_impact: -previousCash,
          balance_before: previousCash,
          balance_after: 0,
          notes: 'Admin melakukan Reset Akun Member ke Rp 0',
          created_at: nowIso,
        });
      } catch (_) {}
    }

    // 6. Sinkronisasi memori runtime lokal
    resetUserPortfolio({ userId, email: userEmail }, 0);

    revalidatePath('/admin/portfolios');

    return {
      success: true,
      message: `Akun member (${user?.full_name || userId}) berhasil direset: Saldo Rp 0 & seluruh kepemilikan aset dikosongkan.`,
    };
  } catch (err: any) {
    console.error('[ServerAction resetMemberAccountToZero]', err);
    return { success: false, error: err.message || 'Gagal mereset akun member' };
  }
}

/**
 * Server Action: Hapus Akun Member Seluruhnya (Database + Supabase Auth)
 */
export async function deleteMemberAccount(userId: string) {
  try {
    if (!userId) {
      return { success: false, error: 'User ID tidak valid' };
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // 1. Ambil data user terlebih dahulu
    const { data: user } = await supabaseAdmin
      .from('app_users')
      .select('id, email, full_name, role')
      .eq('id', userId)
      .maybeSingle();

    if (user && user.role === 'admin') {
      return { success: false, error: 'Akun Administrator tidak dapat dihapus demi keamanan sistem.' };
    }

    // 2. Hapus data riwayat deposit jika ada
    try {
      await supabaseAdmin.from('deposits').delete().eq('user_id', userId);
    } catch (_) {}

    // 3. Hapus data order
    try {
      await supabaseAdmin.from('orders').delete().eq('user_id', userId);
    } catch (_) {}

    // 4. Hapus transaksi ledger
    try {
      await supabaseAdmin.from('portfolio_transactions').delete().eq('user_id', userId);
    } catch (_) {}

    // 5. Hapus portofolio pengguna
    try {
      await supabaseAdmin.from('user_portfolios').delete().eq('user_id', userId);
    } catch (_) {}

    // 6. Hapus pengguna dari tabel public.app_users
    const { error: delUserErr } = await supabaseAdmin
      .from('app_users')
      .delete()
      .eq('id', userId);

    if (delUserErr) {
      console.error('[deleteMemberAccount app_users error]', delUserErr);
      return { success: false, error: `Gagal menghapus akun: ${delUserErr.message}` };
    }

    // 7. Hapus dari Supabase Auth Admin jika terdaftar
    try {
      await supabaseAdmin.auth.admin.deleteUser(userId);
    } catch (authErr) {
      console.warn('[Supabase Auth Admin Delete Note]', authErr);
    }

    // 8. Hapus dari memori cache lokal
    deleteUserAccountLocal(userId);

    revalidatePath('/admin/portfolios');
    revalidatePath('/admin/deposits');

    return {
      success: true,
      message: `Akun member (${user?.full_name || user?.email || userId}) telah berhasil dihapus permanen.`,
    };
  } catch (err: any) {
    console.error('[ServerAction deleteMemberAccount]', err);
    return { success: false, error: err.message || 'Gagal menghapus akun member' };
  }
}

