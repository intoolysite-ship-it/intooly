'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { GoldPriceResponse } from '../lib/types';

type PriceStatus = 'loading' | 'live' | 'cached' | 'stale' | 'error';

const API_URL = process.env.NODE_ENV === 'development' ? '/api/gold-price' : '/gold-price-api.php';
const REFRESH_INTERVAL = 60_000;

export function useGoldPrice() {
  const [price, setPrice] = useState<GoldPriceResponse | null>(null);
  const [status, setStatus] = useState<PriceStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const priceRef = useRef<GoldPriceResponse | null>(null);
  const requestInProgressRef = useRef(false);

  const refresh = useCallback(async () => {
    if (requestInProgressRef.current) return;

    requestInProgressRef.current = true;
    setIsRefreshing(true);

    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: GoldPriceResponse = await response.json();

      if (
        !data ||
        !Number.isFinite(data.priceUsdPerOunce) ||
        data.priceUsdPerOunce <= 0 ||
        !Number.isFinite(data.gram24Usd) ||
        data.gram24Usd <= 0 ||
        typeof data.cached !== 'boolean' ||
        typeof data.stale !== 'boolean'
      ) {
        throw new Error('Invalid price data');
      }

      priceRef.current = data;
      setPrice(data);
      setLastChecked(Date.now());
      setError(null);

      if (data.stale) {
        setStatus('stale');
      } else if (data.cached) {
        setStatus('cached');
      } else {
        setStatus('live');
      }
    } catch {
      setError('تعذر الاتصال بمصدر أسعار الذهب حالياً');
      setStatus(priceRef.current ? 'stale' : 'error');
    } finally {
      requestInProgressRef.current = false;
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refresh();

    const interval = window.setInterval(() => {
      void refresh();
    }, REFRESH_INTERVAL);

    return () => window.clearInterval(interval);
  }, [refresh]);

  return {
    price,
    status,
    error,
    lastChecked,
    refresh,
    isLive: status === 'live',
    isLoading: status === 'loading',
    isRefreshing,
  };
}