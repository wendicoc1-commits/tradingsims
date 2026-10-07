/**
 * Fincept Capital — Indonesian Stock Exchange (IDX / BEI) Trading Hours Engine
 * 
 * Mengatur validasi jadwal perdagangan resmi Bursa Efek Indonesia (WIB / UTC+7):
 * 
 * 1. Hari Perdagangan:
 *    - Senin s/d Jumat (Sabtu, Minggu & Libur Nasional = TUTUP)
 * 
 * 2. Jam Perdagangan Sesi Reguler:
 *    - Senin – Kamis:
 *        Sesi I   : 09:00:00 – 12:00:00 WIB
 *        Istirahat: 12:00:01 – 13:29:59 WIB
 *        Sesi II  : 13:30:00 – 15:49:59 WIB
 *        Pre-Close / Post-Trade : 15:50:00 – 16:15:00 WIB
 * 
 *    - Jumat:
 *        Sesi I   : 09:00:00 – 11:30:00 WIB
 *        Istirahat: 11:30:01 – 13:59:59 WIB (Ibadah Sholat Jumat)
 *        Sesi II  : 14:00:00 – 15:49:59 WIB
 *        Pre-Close / Post-Trade : 15:50:00 – 16:15:00 WIB
 * 
 * 3. Batas Toleransi Order Entry:
 *    - Order beli saham Indonesia DITOLAK di luar jam bursa aktif (sebelum 09:00,
 *      saat istirahat siang, setelah 16:00 WIB, dan akhir pekan).
 *    - Aset Kripto (Crypto) dikecualikan karena berjalan 24/7/365 nonstop.
 */

export type IDXSessionStatus =
  | 'OPEN_SESSION_1'
  | 'OPEN_SESSION_2'
  | 'CLOSED_WEEKEND'
  | 'CLOSED_PRE_MARKET'
  | 'CLOSED_MIDDAY_BREAK'
  | 'CLOSED_AFTER_HOURS';

export interface MarketStatusCheck {
  isOpen: boolean;
  status: IDXSessionStatus;
  statusLabel: string;
  message: string;
  currentWibTime: string;
  nextOpenNotice: string;
}

/**
 * Menghitung waktu saat ini dalam zona waktu WIB (UTC+7 / Asia/Jakarta)
 */
export function getNowInWIB(baseDate = new Date()): Date {
  const utc = baseDate.getTime() + baseDate.getTimezoneOffset() * 60000;
  return new Date(utc + 3600000 * 7);
}

/**
 * Memvalidasi apakah Bursa Efek Indonesia (BEI) saat ini sedang buka untuk transaksi
 */
export function checkIDXMarketStatus(customDate = new Date()): MarketStatusCheck {
  const wib = getNowInWIB(customDate);
  const day = wib.getDay(); // 0 = Minggu, 1 = Senin, ..., 5 = Jumat, 6 = Sabtu
  const hours = wib.getHours();
  const minutes = wib.getMinutes();
  const seconds = wib.getSeconds();
  const totalMinutes = hours * 60 + minutes;

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  const timeFormatted = `${hh}:${mm}:${ss} WIB`;

  // 1. Akhir Pekan (Sabtu & Minggu)
  if (day === 0 || day === 6) {
    const dayName = day === 0 ? 'Minggu' : 'Sabtu';
    return {
      isOpen: false,
      status: 'CLOSED_WEEKEND',
      statusLabel: 'LIBUR AKHIR PEKAN',
      message: `Bursa Efek Indonesia (BEI) libur akhir pekan (${dayName}, ${timeFormatted}). Jam perdagangan aktif: Senin–Jumat 09:00–16:00 WIB.`,
      currentWibTime: timeFormatted,
      nextOpenNotice: 'Pasar reguler dibuka kembali hari Senin pukul 09:00 WIB.',
    };
  }

  // 2. Hari Jumat
  if (day === 5) {
    // Sesi I: 09:00 (540) s/d 11:30 (690)
    // Istirahat: 11:30 (690) s/d 14:00 (840)
    // Sesi II: 14:00 (840) s/d 16:00 (960)
    if (totalMinutes < 540) {
      return {
        isOpen: false,
        status: 'CLOSED_PRE_MARKET',
        statusLabel: 'PRA-PEMBUKAAN (BELUM BUKA)',
        message: `Bursa Efek Indonesia belum buka (${timeFormatted}). Sesi I Jumat dimulai pukul 09:00 WIB.`,
        currentWibTime: timeFormatted,
        nextOpenNotice: 'Pasar buka hari ini pukul 09:00 WIB.',
      };
    }

    if (totalMinutes >= 540 && totalMinutes < 690) {
      return {
        isOpen: true,
        status: 'OPEN_SESSION_1',
        statusLabel: 'SESI I BERLANGSUNG',
        message: `Bursa Efek Indonesia BUKA — Sesi I (${timeFormatted}).`,
        currentWibTime: timeFormatted,
        nextOpenNotice: 'Sesi I berakhir pukul 11:30 WIB.',
      };
    }

    if (totalMinutes >= 690 && totalMinutes < 840) {
      return {
        isOpen: false,
        status: 'CLOSED_MIDDAY_BREAK',
        statusLabel: 'ISTIRAHAT SIANG JUMAT',
        message: `Bursa Efek Indonesia sedang jeda istirahat siang hari Jumat (${timeFormatted}). Sesi II dibuka pukul 14:00 WIB.`,
        currentWibTime: timeFormatted,
        nextOpenNotice: 'Sesi II dibuka kembali pukul 14:00 WIB.',
      };
    }

    if (totalMinutes >= 840 && totalMinutes <= 960) {
      return {
        isOpen: true,
        status: 'OPEN_SESSION_2',
        statusLabel: 'SESI II BERLANGSUNG',
        message: `Bursa Efek Indonesia BUKA — Sesi II (${timeFormatted}).`,
        currentWibTime: timeFormatted,
        nextOpenNotice: 'Bursa tutup pukul 16:00 WIB.',
      };
    }

    return {
      isOpen: false,
      status: 'CLOSED_AFTER_HOURS',
      statusLabel: 'PASAR TUTUP (AFTER-HOURS)',
      message: `Bursa Efek Indonesia telah tutup hari ini (${timeFormatted}).`,
      currentWibTime: timeFormatted,
      nextOpenNotice: 'Pasar reguler dibuka kembali hari Senin pukul 09:00 WIB.',
    };
  }

  // 3. Hari Senin – Kamis
  // Sesi I: 09:00 (540) s/d 12:00 (720)
  // Istirahat: 12:00 (720) s/d 13:30 (810)
  // Sesi II: 13:30 (810) s/d 16:00 (960)
  if (totalMinutes < 540) {
    return {
      isOpen: false,
      status: 'CLOSED_PRE_MARKET',
      statusLabel: 'PRA-PEMBUKAAN (BELUM BUKA)',
      message: `Bursa Efek Indonesia belum buka (${timeFormatted}). Sesi I dimulai pukul 09:00 WIB.`,
      currentWibTime: timeFormatted,
      nextOpenNotice: 'Pasar buka hari ini pukul 09:00 WIB.',
    };
  }

  if (totalMinutes >= 540 && totalMinutes < 720) {
    return {
      isOpen: true,
      status: 'OPEN_SESSION_1',
      statusLabel: 'SESI I BERLANGSUNG',
      message: `Bursa Efek Indonesia BUKA — Sesi I (${timeFormatted}).`,
      currentWibTime: timeFormatted,
      nextOpenNotice: 'Sesi I berakhir pukul 12:00 WIB.',
    };
  }

  if (totalMinutes >= 720 && totalMinutes < 810) {
    return {
      isOpen: false,
      status: 'CLOSED_MIDDAY_BREAK',
      statusLabel: 'ISTIRAHAT SIANG',
      message: `Bursa Efek Indonesia sedang jeda istirahat sesi I (${timeFormatted}). Sesi II dibuka pukul 13:30 WIB.`,
      currentWibTime: timeFormatted,
      nextOpenNotice: 'Sesi II dibuka kembali pukul 13:30 WIB.',
    };
  }

  if (totalMinutes >= 810 && totalMinutes <= 960) {
    return {
      isOpen: true,
      status: 'OPEN_SESSION_2',
      statusLabel: 'SESI II BERLANGSUNG',
      message: `Bursa Efek Indonesia BUKA — Sesi II (${timeFormatted}).`,
      currentWibTime: timeFormatted,
      nextOpenNotice: 'Bursa tutup pukul 16:00 WIB.',
    };
  }

  return {
    isOpen: false,
    status: 'CLOSED_AFTER_HOURS',
    statusLabel: 'PASAR TUTUP (AFTER-HOURS)',
    message: `Bursa Efek Indonesia telah tutup hari ini (${timeFormatted}).`,
    currentWibTime: timeFormatted,
    nextOpenNotice: 'Pasar reguler dibuka kembali esok hari pukul 09:00 WIB.',
  };
}

/**
 * Cek cepat boolean apakah bursa BEI sedang buka
 */
export function isIDXMarketOpen(customDate = new Date()): boolean {
  return checkIDXMarketStatus(customDate).isOpen;
}

/**
 * Cek apakah aset tertentu merupakan saham Indonesia (IDX)
 */
export function isIndonesianStock(symbol: string): boolean {
  if (!symbol) return false;
  const s = symbol.trim().toUpperCase();
  // Kecualikan pair kripto umum
  const cryptoList = [
    'BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX',
    'SUI', 'NEAR', 'LINK', 'PEPE', 'SHIB', 'DOT', 'TRX'
  ];
  if (cryptoList.includes(s.replace(/USDT$/i, '')) || s.endsWith('USDT')) {
    return false;
  }
  // Kecualikan saham US
  const usList = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'AMZN', 'GOOGL', 'META'];
  if (usList.includes(s)) {
    return false;
  }
  // Saham Indonesia berakhiran .JK atau 4 huruf kapital (misal BBCA, BMRI)
  return s.endsWith('.JK') || /^[A-Z]{4}$/.test(s);
}
