/**
 * QUANT MULTI-PAIR RADAR: Live Price Feeder Service
 * Fetches and parses real-time spot prices for all monitored cryptocurrency pairs.
 * Strictly extracts live spot price fields ('lastPrice' or 'price') as floats.
 * Never reads 24h weighted averages or historical/stale baseline metrics.
 */

export interface LiveRadarPrice {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume: number;
  quoteVolume: number;
  timestamp: number;
}

export type LiveRadarPriceMap = Record<string, LiveRadarPrice>;

// In-memory client cache with short 1.5s validity to throttle duplicate rapid requests
let clientPriceCache: { data: LiveRadarPriceMap; timestamp: number } | null = null;
const CLIENT_CACHE_TTL = 1500;
const clientFuturesOnlySet = new Set<string>(['KASUSDT']);

/**
 * Fetches real-time market prices for requested symbols from the local backend proxy
 * with fallback directly to Binance Vision public endpoint.
 */
export async function fetchLiveRadarPrices(symbols: string[]): Promise<LiveRadarPriceMap> {
  const now = Date.now();
  if (clientPriceCache && (now - clientPriceCache.timestamp < CLIENT_CACHE_TTL)) {
    const hasAll = symbols.every(s => clientPriceCache!.data[s]);
    if (hasAll) {
      return clientPriceCache.data;
    }
  }

  const cleanSymbols = symbols.map(s => s.trim().toUpperCase().replace(/[\/\-_]/g, '')).filter(Boolean);
  const symbolsParam = cleanSymbols.join(',');

  try {
    // 1. Primary: Server-side proxy with batching and rate-limit protection
    const res = await fetch(`/api/market/radar-prices?symbols=${encodeURIComponent(symbolsParam)}`);
    if (res.ok) {
      const json = await res.json();
      if (json && json.prices && typeof json.prices === 'object') {
        const resultMap: LiveRadarPriceMap = {};
        for (const [sym, item] of Object.entries(json.prices as Record<string, any>)) {
          if (!item) continue;
          // Verify price is a valid positive float
          const price = typeof item.price === 'number' ? item.price : parseFloat(item.price || item.lastPrice || '0');
          if (Number.isFinite(price) && price > 0) {
            resultMap[sym] = {
              symbol: sym,
              price,
              change24h: typeof item.change24h === 'number' ? item.change24h : parseFloat(item.change24h || item.priceChangePercent || '0') || 0,
              high24h: typeof item.high24h === 'number' ? item.high24h : parseFloat(item.high24h || '0') || 0,
              low24h: typeof item.low24h === 'number' ? item.low24h : parseFloat(item.low24h || '0') || 0,
              volume: typeof item.volume === 'number' ? item.volume : parseFloat(item.volume || '0') || 0,
              quoteVolume: typeof item.quoteVolume === 'number' ? item.quoteVolume : parseFloat(item.quoteVolume || '0') || 0,
              timestamp: item.timestamp || now
            };
          }
        }

        if (Object.keys(resultMap).length > 0) {
          clientPriceCache = { data: resultMap, timestamp: now };
          return resultMap;
        }
      }
    }
  } catch (err) {
    console.warn('[LiveRadarPrices] Server proxy fetch error, attempting direct client fallback:', err);
  }

  // 2. Direct client-side fallback against Binance Vision Spot + USDⓈ-M Futures API
  try {
    const directMap: LiveRadarPriceMap = {};
    const wantedSet = new Set(cleanSymbols);
    const spotSymbols = cleanSymbols.filter(s => !clientFuturesOnlySet.has(s));

    if (spotSymbols.length > 0) {
      let rawSpotList: any[] | null = null;
      const directRes = await fetch(
        `https://data-api.binance.vision/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(spotSymbols))}`
      );
      if (directRes.ok) {
        const parsed = await directRes.json();
        if (Array.isArray(parsed)) rawSpotList = parsed;
      } else if (directRes.status === 400) {
        // Batch failed due to an unlisted/Futures-only symbol: fetch full Spot list once without 400 errors
        const allSpotRes = await fetch('https://data-api.binance.vision/api/v3/ticker/24hr');
        if (allSpotRes.ok) {
          const parsedAll = await allSpotRes.json();
          if (Array.isArray(parsedAll)) rawSpotList = parsedAll;
        }
      }

      if (rawSpotList) {
        for (const item of rawSpotList) {
          if (!item || !item.symbol || !wantedSet.has(item.symbol)) continue;
          const livePrice = parseFloat(item.lastPrice || item.price || '0');
          if (Number.isFinite(livePrice) && livePrice > 0) {
            directMap[item.symbol] = {
              symbol: item.symbol,
              price: livePrice,
              change24h: parseFloat(item.priceChangePercent || '0') || 0,
              high24h: parseFloat(item.highPrice || '0') || 0,
              low24h: parseFloat(item.lowPrice || '0') || 0,
              volume: parseFloat(item.volume || '0') || 0,
              quoteVolume: parseFloat(item.quoteVolume || '0') || 0,
              timestamp: now
            };
          }
        }
      }
    }

    const missingForFutures = cleanSymbols.filter(s => !directMap[s]);
    if (missingForFutures.length > 0) {
      const missingSet = new Set(missingForFutures);
      try {
        const fapiRes = await fetch('https://fapi.binance.com/fapi/v1/ticker/24hr');
        if (fapiRes.ok) {
          const rawFutures = await fapiRes.json();
          if (Array.isArray(rawFutures)) {
            for (const item of rawFutures) {
              if (!item || !item.symbol || !missingSet.has(item.symbol)) continue;
              const livePrice = parseFloat(item.lastPrice || item.price || '0');
              if (Number.isFinite(livePrice) && livePrice > 0) {
                clientFuturesOnlySet.add(item.symbol);
                directMap[item.symbol] = {
                  symbol: item.symbol,
                  price: livePrice,
                  change24h: parseFloat(item.priceChangePercent || '0') || 0,
                  high24h: parseFloat(item.highPrice || '0') || 0,
                  low24h: parseFloat(item.lowPrice || '0') || 0,
                  volume: parseFloat(item.volume || '0') || 0,
                  quoteVolume: parseFloat(item.quoteVolume || '0') || 0,
                  timestamp: now
                };
              }
            }
          }
        }
      } catch {
        // Keep best effort
      }
    }

    if (Object.keys(directMap).length > 0) {
      clientPriceCache = { data: directMap, timestamp: now };
      return directMap;
    }
  } catch (err) {
    console.error('[LiveRadarPrices] Direct client fallback failed:', err);
  }

  return clientPriceCache?.data || {};
}

/**
 * Format cryptocurrency prices according to order-of-magnitude precision
 */
export function formatCryptoDisplayPrice(price: number | null | undefined): string {
  if (price === null || price === undefined || !Number.isFinite(price) || price <= 0) return '—';
  if (price < 0.00001) return `$${price.toFixed(8)}`;
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  if (price < 10) return `$${price.toFixed(3)}`;
  return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
