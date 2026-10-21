import fs from 'fs';
import path from 'path';

export interface SiteSettings {
  announcement: {
    enabled: boolean;
    message: string;
    type: 'info' | 'warning' | 'alert' | 'success';
    updatedAt: string;
    updatedBy?: string;
  };
  features: {
    aiAdvisor: boolean;
    darkPoolScanner: boolean;
    cfoRiskShield: boolean;
    maintenanceMode: boolean;
    paperTrading: boolean;
  };
  lastAudit?: {
    timestamp: string;
    status: string;
    summary: string;
  };
}

const DEFAULT_SETTINGS: SiteSettings = {
  announcement: {
    enabled: false,
    message: '',
    type: 'info',
    updatedAt: new Date().toISOString(),
    updatedBy: 'system',
  },
  features: {
    aiAdvisor: true,
    darkPoolScanner: true,
    cfoRiskShield: true,
    maintenanceMode: false,
    paperTrading: true,
  },
};

// Lokasi penyimpanan persisten (file JSON di /tmp atau OS temp)
function getSettingsFilePath(): string {
  if (process.platform === 'win32') {
    return path.join(process.cwd(), 'src', 'data', 'remote_site_settings.json');
  }
  return '/tmp/tradesims_site_settings.json';
}

let inMemoryCache: SiteSettings = { ...DEFAULT_SETTINGS };
let hasLoadedFromFile = false;

export function getSiteSettings(): SiteSettings {
  if (!hasLoadedFromFile) {
    try {
      const filePath = getSettingsFilePath();
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        inMemoryCache = {
          ...DEFAULT_SETTINGS,
          ...parsed,
          announcement: { ...DEFAULT_SETTINGS.announcement, ...(parsed.announcement || {}) },
          features: { ...DEFAULT_SETTINGS.features, ...(parsed.features || {}) },
        };
      }
    } catch (err) {
      console.warn('[RemoteSiteSettings] Gagal membaca berkas pengaturan, menggunakan cache bawaan:', err);
    }
    hasLoadedFromFile = true;
  }
  return inMemoryCache;
}

export function updateSiteSettings(partial: Partial<SiteSettings>): SiteSettings {
  const current = getSiteSettings();
  const next: SiteSettings = {
    ...current,
    ...partial,
    announcement: partial.announcement ? { ...current.announcement, ...partial.announcement } : current.announcement,
    features: partial.features ? { ...current.features, ...partial.features } : current.features,
  };

  inMemoryCache = next;

  try {
    const filePath = getSettingsFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(next, null, 2), 'utf-8');
  } catch (err) {
    console.error('[RemoteSiteSettings] Gagal menulis ke file pengaturan:', err);
  }

  return next;
}
