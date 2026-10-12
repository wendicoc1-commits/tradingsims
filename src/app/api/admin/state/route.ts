import { NextRequest, NextResponse } from 'next/server';
import { getSteyerState, saveSteyerState, resetSteyerState } from '@/lib/server/steyerAdminState';
import { getPendingDeposits, getMembersWithPortfolios } from '@/app/admin/actions';

export const dynamic = 'force-dynamic';

function addDays(iso: string, n: number): string {
  const d = new Date(iso + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  try {
    const state = getSteyerState();
    const includeTradesim = req.nextUrl.searchParams.get('tradesim') !== '0';

    if (!includeTradesim) {
      return NextResponse.json(state);
    }

    const [deposits, members] = await Promise.all([
      getPendingDeposits().catch(() => []),
      getMembersWithPortfolios('').catch(() => []),
    ]);

    return NextResponse.json({
      ...state,
      deposits,
      members,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to load admin state' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    let state = getSteyerState();

    if (action === 'reset') {
      state = resetSteyerState();
      return NextResponse.json({ ok: true, state });
    }

    if (action === 'rental_create') {
      const { extra_id, date_from, days = 1, qty = 1, room_booking_id = null, name = '' } = body;
      const extra = state.extras.find((e) => e.id === Number(extra_id));
      if (!extra) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
      const numDays = Math.max(1, Number(days) || 1);
      const numQty = Math.max(1, Number(qty) || 1);
      const date_to = addDays(date_from, numDays);

      // Stock conflict check (409) across all days in [date_from, date_to)
      if (extra.stock !== null && extra.stock !== undefined) {
        for (let i = 0; i < numDays; i++) {
          const d = addDays(date_from, i);
          const used = state.equipment
            .filter(
              (r) =>
                r.extra_id === extra.id &&
                r.status !== 'cancelled' &&
                r.date_from <= d &&
                r.date_to > d
            )
            .reduce((sum, r) => sum + (Number(r.qty) || 0), 0);
          if (used + numQty > extra.stock) {
            return NextResponse.json({ error: 'Not enough stock on the selected dates.' }, { status: 409 });
          }
        }
      }

      const rb = room_booking_id ? state.roomBookings.find((b) => b.id === Number(room_booking_id)) : null;
      const guestName = rb ? rb.name : String(name).trim() || 'Day Guest';
      const isOnce = ['stay', 'person_stay', 'appointment'].includes(extra.unit);
      const total = extra.price * numQty * (isOnce ? 1 : numDays);
      const nextId = state.equipment.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1;

      const newRental = {
        id: nextId,
        created_at: new Date().toISOString(),
        extra_id: extra.id,
        room_booking_id: rb ? rb.id : null,
        spa_booking_id: null,
        date_from,
        date_to,
        qty: numQty,
        total,
        name: guestName,
        status: 'confirmed',
        source: 'desk',
      };

      state.equipment.unshift(newRental);
      if (rb) {
        rb.total = (Number(rb.total) || 0) + total;
      }
      saveSteyerState(state);
      return NextResponse.json({ ok: true, id: nextId, rental: newRental });
    }

    if (action === 'rental_status') {
      const { id, status } = body;
      const rental = state.equipment.find((r) => r.id === Number(id));
      if (rental) {
        const prevStatus = rental.status;
        rental.status = status;
        if (rental.room_booking_id && prevStatus !== status) {
          const rb = state.roomBookings.find((b) => b.id === rental.room_booking_id);
          if (rb) {
            if (status === 'cancelled') rb.total = Math.max(rb.room_total, (rb.total || 0) - rental.total);
            else if (prevStatus === 'cancelled') rb.total = (rb.total || 0) + rental.total;
          }
        }
        saveSteyerState(state);
      }
      return NextResponse.json({ ok: true });
    }

    if (action === 'room_status') {
      const { id, status } = body;
      const rb = state.roomBookings.find((b) => b.id === Number(id));
      if (rb) {
        rb.status = status;
        saveSteyerState(state);
      }
      return NextResponse.json({ ok: true });
    }

    if (action === 'spa_patch') {
      const { id, status, therapist_id } = body;
      const sb = state.spaBookings.find((b) => b.id === Number(id));
      if (sb) {
        if (status !== undefined) sb.status = status;
        if (therapist_id !== undefined) sb.therapist_id = therapist_id === null ? null : Number(therapist_id);
        saveSteyerState(state);
      }
      return NextResponse.json({ ok: true });
    }

    if (action === 'block_create') {
      const { date, start_min, end_min, therapist_id, reason } = body;
      const nextId = state.blocks.reduce((max, b) => Math.max(max, Number(b.id) || 0), 0) + 1;
      state.blocks.push({
        id: nextId,
        date,
        start_min: Number(start_min),
        end_min: Number(end_min),
        therapist_id: therapist_id ? Number(therapist_id) : null,
        reason: reason || 'Blocked',
      });
      saveSteyerState(state);
      return NextResponse.json({ ok: true, id: nextId });
    }

    if (action === 'block_delete') {
      const { id } = body;
      state.blocks = state.blocks.filter((b) => b.id !== Number(id));
      saveSteyerState(state);
      return NextResponse.json({ ok: true });
    }

    if (action === 'enquiry_status') {
      const { id, status } = body;
      const enq = state.enquiries.find((e) => e.id === Number(id));
      if (enq) {
        enq.status = status;
        saveSteyerState(state);
      }
      return NextResponse.json({ ok: true });
    }

    if (action === 'voucher_patch') {
      const { id, status, redeem, note } = body;
      const v = state.vouchers.find((x) => x.id === Number(id));
      if (!v) return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });

      if (redeem !== undefined) {
        const amt = Number(redeem);
        if (!amt || amt <= 0 || amt > v.balance) {
          return NextResponse.json({ error: 'Invalid redemption amount' }, { status: 400 });
        }
        v.balance = Math.max(0, v.balance - amt);
        if (v.balance === 0) v.status = 'redeemed';
        const nextRedId = state.redemptions.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1;
        state.redemptions.unshift({
          id: nextRedId,
          created_at: new Date().toISOString(),
          voucher_id: v.id,
          amount: amt,
          note: note || '',
        });
      }
      if (status !== undefined) {
        v.status = status;
      }
      saveSteyerState(state);
      return NextResponse.json({ ok: true, voucher: v });
    }

    if (action === 'post_save') {
      const { post } = body;
      if (post.id) {
        const idx = state.posts.findIndex((p) => p.id === Number(post.id));
        if (idx >= 0) {
          state.posts[idx] = { ...state.posts[idx], ...post };
        }
      } else {
        const nextId = state.posts.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0) + 1;
        state.posts.unshift({
          ...post,
          id: nextId,
          created_at: new Date().toISOString(),
          published_at: post.status === 'published' ? new Date().toISOString() : null,
        });
      }
      saveSteyerState(state);
      return NextResponse.json({ ok: true });
    }

    if (action === 'post_delete') {
      const { id } = body;
      state.posts = state.posts.filter((p) => p.id !== Number(id));
      saveSteyerState(state);
      return NextResponse.json({ ok: true });
    }

    if (action === 'product_patch') {
      const { kind, id, patch } = body;
      const list = kind === 'room' ? state.rooms : kind === 'extra' ? state.extras : state.treatments;
      const item = list.find((x) => x.id === Number(id));
      if (item) {
        Object.assign(item, patch);
        saveSteyerState(state);
      }
      return NextResponse.json({ ok: true });
    }

    if (action === 'faq_save') {
      const { id, question, answer } = body;
      if (id) {
        const f = state.faq.find((x) => x.id === Number(id));
        if (f) {
          f.question = question;
          f.answer = answer;
        }
      } else {
        const nextId = state.faq.reduce((max, x) => Math.max(max, Number(x.id) || 0), 0) + 1;
        state.faq.push({ id: nextId, question, answer, sort: state.faq.length });
      }
      saveSteyerState(state);
      return NextResponse.json({ ok: true });
    }

    if (action === 'faq_delete') {
      const { id } = body;
      state.faq = state.faq.filter((x) => x.id !== Number(id));
      saveSteyerState(state);
      return NextResponse.json({ ok: true });
    }

    if (action === 'concierge_save') {
      const { ai } = body;
      state.concierge.ai = Boolean(ai);
      saveSteyerState(state);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Mutation error' }, { status: 500 });
  }
}
