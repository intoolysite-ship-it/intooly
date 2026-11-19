'use client';

import { useCallback, useEffect, useState } from 'react';

type ExchangeRates = Record<string, number>;
type ExchangeStatus = 'loading' | 'live' | 'cached' | 'stale' | 'error';

interface CachedRates {
  rates: ExchangeRates;
  date: string;
  fetchedAt: number;
}

const CACHE_KEY = 'intooly-gold-exchange-rates-v1';
const CACHE_DURATION = 12 * 60 * 60 * 1000;

export function useExchangeRate() {
  const [rates, setRates] = useState<ExchangeRates>({});
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [status, setStatus] = useState<ExchangeStatus>('loading');

  const refresh = useCallback(async (force = false) => {
    let cached: CachedRates | null = null;

    try {
      const saved = localStorage.getItem(CACHE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (
          parsed !== null &&
          typeof parsed === 'object' &&
          'rates' in parsed &&
          'date' in parsed &&
          'fetchedAt' in parsed &&
          typeof parsed.rates === 'object' &&
          parsed.rates !== null &&
          typeof parsed.date === 'string' &&
          typeof parsed.fetchedAt === 'number'
        ) {
          cached = parsed as CachedRates;
          setRates(cached.rates);
          setUpdatedAt(cached.date);
        }
      }
    } catch {
      cached = null;
    }

    if (
      !force &&
      cached &&
      Date.now() - cached.fetchedAt < CACHE_DURATION
    ) {
      setStatus('cached');
      return;
    }

    try {
      setStatus(cached ? 'cached' : 'loading');

      const urls = [
        'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
        'https://latest.currency-api.pages.dev/v1/currencies/usd.json',
      ];

      let response: Response | null = null;

      for (const url of urls) {
        try {
          const candidate = await fetch(url, { cache: 'no-store' });
          if (candidate.ok) {
            response = candidate;
            break;
          }
        } catch {
          // Try the fallback source.
        }
      }

      if (!response) throw new Error('تعذر الاتصال بمصدر أسعار الصرف');

      const data: unknown = await response.json();

      if (
        data === null ||
        typeof data !== 'object' ||
        !('usd' in data) ||
        !('date' in data) ||
        typeof data.usd !== 'object' ||
        data.usd === null ||
        typeof data.date !== 'string'
      ) {
        throw new Error('بيانات أسعار الصرف غير صالحة');
      }

      const rawRates = data.usd as Record<string, unknown>;
      const normalized: ExchangeRates = { USD: 1 };

      for (const [code, value] of Object.entries(rawRates)) {
        if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
          normalized[code.toUpperCase()] = value;
        }
      }

      const result: CachedRates = {
        rates: normalized,
        date: data.date,
        fetchedAt: Date.now(),
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify(result));
      setRates(normalized);
      setUpdatedAt(data.date);
      setStatus('live');
    } catch {
      setStatus(cached ? 'stale' : 'error');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    rates,
    updatedAt,
    status,
    refresh: () => refresh(true),
  };
}