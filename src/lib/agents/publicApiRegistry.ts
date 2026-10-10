import { PUBLIC_APIS_CATALOG, PublicApiItem } from '@/data/publicApisData';

export interface AgentApiExecutionResult {
  apiId: string;
  apiName: string;
  category: string;
  success: boolean;
  latencyMs: number;
  data: any;
  error?: string;
  timestamp: string;
}

/**
 * PublicApiRegistry
 * Jembatan penghubung bagi AI Agent trading untuk menemukan dan mengeksekusi
 * API eksternal publik secara otonom (Autonomous Tool Calling & Data Grounding).
 */
export class PublicApiRegistry {
  /**
   * Cari API berdasarkan kata kunci atau kategori
   */
  static searchApis(query: string, category?: string): PublicApiItem[] {
    const q = query.toLowerCase().trim();
    return PUBLIC_APIS_CATALOG.filter((item) => {
      const matchCat = category && category !== 'ALL' ? item.category === category : true;
      const matchQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.agentUseCases.some((uc) => uc.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }

  /**
   * Dapatkan semua API yang dapat dipanggil langsung dari browser (CORS Ready & No Auth)
   */
  static getDirectExecutableApis(): PublicApiItem[] {
    return PUBLIC_APIS_CATALOG.filter((item) => item.cors === 'Yes' && !!item.testEndpoint);
  }

  /**
   * Eksekusi live fetch ke salah satu public API yang mendukung endpoint langsung
   */
  static async executeLiveProbe(apiId: string): Promise<AgentApiExecutionResult> {
    const target = PUBLIC_APIS_CATALOG.find((item) => item.id === apiId);
    if (!target) {
      return {
        apiId,
        apiName: 'Unknown',
        category: 'General',
        success: false,
        latencyMs: 0,
        data: null,
        error: `API dengan ID "${apiId}" tidak ditemukan dalam registri.`,
        timestamp: new Date().toISOString(),
      };
    }

    if (!target.testEndpoint) {
      return {
        apiId: target.id,
        apiName: target.name,
        category: target.category,
        success: false,
        latencyMs: 0,
        data: null,
        error: `API ini memerlukan autentikasi khusus atau pendaftaran API Key langsung ke ${target.url}`,
        timestamp: new Date().toISOString(),
      };
    }

    const startTime = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const res = await fetch(target.testEndpoint, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json, text/plain, */*',
        },
      });
      clearTimeout(timeoutId);

      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      }

      const contentType = res.headers.get('content-type') || '';
      let data: any = null;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = text.slice(0, 1000); // truncate if long text
      }

      return {
        apiId: target.id,
        apiName: target.name,
        category: target.category,
        success: true,
        latencyMs,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      const endTime = performance.now();
      return {
        apiId: target.id,
        apiName: target.name,
        category: target.category,
        success: false,
        latencyMs: Math.round(endTime - startTime),
        data: null,
        error: err?.message || 'Gagal terhubung ke endpoint publik.',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Helper ringkasan metrik live kurs valas EUR & USD untuk AI Trading Agent
   */
  static async getLiveForexSummary(): Promise<{ usdIdr?: number; eurUsd?: number; timestamp: string }> {
    try {
      const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=IDR,EUR', {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        return {
          usdIdr: json.rates?.IDR,
          eurUsd: json.rates?.EUR ? Number((1 / json.rates.EUR).toFixed(4)) : undefined,
          timestamp: json.date || new Date().toISOString(),
        };
      }
    } catch (_) {}
    return { timestamp: new Date().toISOString() };
  }

  /**
   * Helper ringkasan metrik Bitcoin & Ethereum untuk AI Crypto Desk
   */
  static async getLiveCryptoSnapshot(): Promise<{ btcUsd?: number; ethUsd?: number; solUsd?: number; btcChange24h?: number } | null> {
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true',
        { headers: { Accept: 'application/json' } }
      );
      if (res.ok) {
        const json = await res.json();
        return {
          btcUsd: json.bitcoin?.usd,
          ethUsd: json.ethereum?.usd,
          solUsd: json.solana?.usd,
          btcChange24h: json.bitcoin?.usd_24h_change,
        };
      }
    } catch (_) {}
    return null;
  }
}
