import { ServiceConnectionStatus } from '../types/museum';

const PADLET_OVERRIDE_KEY = 'suthiso_padlet_url_override';
const PADLET_HOUSE_OVERRIDE_KEY = 'suthiso_padlet_house_embed_url';
const PADLET_JOURNEY_OVERRIDE_KEY = 'suthiso_padlet_journey_embed_url';

export interface LocalPadletUrls {
  houseEmbedUrl: string | null;
  journeyEmbedUrl: string | null;
}

export const DEFAULT_CONFIG_STATUS: ServiceConnectionStatus = {
  gemini: {
    configured: false,
    mode: 'pending',
    model: 'gemini-4-hydrogen',
  },
  firebase: {
    configured: false,
    mode: 'demo',
  },
  padlet: {
    configured: false,
    url: null,
    houseEmbedUrl: null,
    journeyEmbedUrl: null,
  },
};

export function isValidHttpUrl(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const trimmed = raw.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function sanitizeHttpUrl(raw: string | null | undefined): string | null {
  if (!isValidHttpUrl(raw)) return null;
  return raw!.trim();
}

export function getLocalPadletUrl(): string | null {
  try {
    const saved = localStorage.getItem(PADLET_OVERRIDE_KEY);
    return sanitizeHttpUrl(saved);
  } catch {
    return null;
  }
}

export function getLocalPadletUrls(): LocalPadletUrls {
  try {
    const isOldPadlet = (url: string | null) =>
      Boolean(url && url.includes('tong-ket-oan-trich'));

    const rawHouse = sanitizeHttpUrl(localStorage.getItem(PADLET_HOUSE_OVERRIDE_KEY));
    const rawJourney = sanitizeHttpUrl(localStorage.getItem(PADLET_JOURNEY_OVERRIDE_KEY));
    const rawLegacy = getLocalPadletUrl();

    const house = isOldPadlet(rawHouse) ? null : rawHouse;
    const journey = isOldPadlet(rawJourney) ? null : rawJourney;
    const legacy = isOldPadlet(rawLegacy) ? null : rawLegacy;

    return {
      houseEmbedUrl: house || legacy,
      journeyEmbedUrl: journey || legacy,
    };
  } catch {
    return {
      houseEmbedUrl: null,
      journeyEmbedUrl: null,
    };
  }
}

export function saveLocalPadletUrls(urls: {
  houseEmbedUrl?: string;
  journeyEmbedUrl?: string;
}): void {
  try {
    const cleanHouse = urls.houseEmbedUrl?.trim() || '';
    const cleanJourney = urls.journeyEmbedUrl?.trim() || '';

    if (!cleanHouse) {
      localStorage.removeItem(PADLET_HOUSE_OVERRIDE_KEY);
    } else {
      localStorage.setItem(PADLET_HOUSE_OVERRIDE_KEY, cleanHouse);
    }

    if (!cleanJourney) {
      localStorage.removeItem(PADLET_JOURNEY_OVERRIDE_KEY);
    } else {
      localStorage.setItem(PADLET_JOURNEY_OVERRIDE_KEY, cleanJourney);
    }

    const fallback = cleanHouse || cleanJourney;
    if (!fallback) {
      localStorage.removeItem(PADLET_OVERRIDE_KEY);
    } else {
      localStorage.setItem(PADLET_OVERRIDE_KEY, fallback);
    }
  } catch {
    // Ignore storage unavailability
  }
}

export function saveLocalPadletUrl(url: string): void {
  saveLocalPadletUrls({ houseEmbedUrl: url, journeyEmbedUrl: url });
}

export async function fetchServiceStatus(): Promise<ServiceConnectionStatus> {
  const localPadlet = getLocalPadletUrls();

  const buildFallbackStatus = (): ServiceConnectionStatus => {
    const configured = Boolean(localPadlet.houseEmbedUrl || localPadlet.journeyEmbedUrl);
    return {
      ...DEFAULT_CONFIG_STATUS,
      padlet: {
        configured,
        url: localPadlet.houseEmbedUrl || localPadlet.journeyEmbedUrl,
        houseEmbedUrl: localPadlet.houseEmbedUrl,
        journeyEmbedUrl: localPadlet.journeyEmbedUrl,
      },
    };
  };

  try {
    const res = await fetch('/api/config/status');
    if (!res.ok) {
      return buildFallbackStatus();
    }
    const data = (await res.json()) as ServiceConnectionStatus;
    const serverHouse = sanitizeHttpUrl(data.padlet?.houseEmbedUrl);
    const serverJourney = sanitizeHttpUrl(data.padlet?.journeyEmbedUrl);
    const serverLegacy = sanitizeHttpUrl(data.padlet?.url);

    const houseEmbedUrl = serverHouse || localPadlet.houseEmbedUrl || serverLegacy;
    const journeyEmbedUrl = serverJourney || localPadlet.journeyEmbedUrl || serverLegacy;
    const anyUrl = houseEmbedUrl || journeyEmbedUrl || serverLegacy;

    data.padlet = {
      configured: Boolean(anyUrl),
      url: anyUrl,
      houseEmbedUrl,
      journeyEmbedUrl,
    };
    return data;
  } catch {
    return buildFallbackStatus();
  }
}
