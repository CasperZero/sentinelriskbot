import {
  VwapEmaSignalItem,
  VwapTimeframe,
  RiskMetrics,
  PRESET_CRYPTOS,
  CryptoPreset,
} from '../types';

/**
 * Fetches server-computed multi-timeframe VWAP & EMA 9/21 institutional signals.
 * Zero synthetic candle generation or client-side approximations.
 */
export async function scanAllVwapEmaMarkets(
  timeframe: VwapTimeframe = '1h',
  _liveMetricsMap?: Map<string, RiskMetrics>,
  targetList?: CryptoPreset[],
  authContext?: {
    userId?: string;
    subscriptionTier?: string;
    authToken?: string;
  }
): Promise<VwapEmaSignalItem[]> {
  const activeList = targetList && targetList.length > 0 ? targetList : PRESET_CRYPTOS;
  const symbolsParam = activeList.map((c) => c.symbol).join(',');

  try {
    const queryParams = new URLSearchParams({
      timeframe,
      symbols: symbolsParam,
    });
    if (authContext?.userId) queryParams.set('userId', authContext.userId);
    if (authContext?.subscriptionTier) queryParams.set('subscriptionTier', authContext.subscriptionTier);

    const headers: Record<string, string> = {};
    if (authContext?.authToken) {
      headers['Authorization'] = authContext.authToken.startsWith('Bearer ')
        ? authContext.authToken
        : `Bearer ${authContext.authToken}`;
    }

    const res = await fetch(`/api/market/vwap-ema-scan?${queryParams.toString()}`, { headers });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.signals)) {
        return data.signals;
      }
    }
  } catch {
    // Return empty array gracefully when backend is temporarily unreachable
  }

  return [];
}
