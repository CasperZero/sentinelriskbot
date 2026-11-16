import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  MarketState,
  RiskMetrics,
  OrderBookData,
  BuySignalItem,
  SellSignalItem,
  BreakdownSignalItem,
  VwapEmaSignalItem,
  SymbolMarketState,
  WinningSignalLedgerItem,
} from '../types';
import { useCrypto } from './CryptoContext';

interface MarketContextType {
  marketState: MarketState | null;
  activeMetrics: RiskMetrics | null;
  orderBook: OrderBookData;
  symbolsState: Record<string, SymbolMarketState>;
  buySignals: BuySignalItem[];
  sellSignals: SellSignalItem[];
  breakdownSignals: BreakdownSignalItem[];
  allBuyScans: BuySignalItem[];
  allSellScans: SellSignalItem[];
  vwapMatrix: Record<string, VwapEmaSignalItem>;
  monitoredSymbols: string[];
  winningSignalsLedger: WinningSignalLedgerItem[];
  activeTrackedSignalsCount: number;
  globalRiskIndex: number;
  globalRiskStatus: 'NORMAL' | 'ELEVATED' | 'HIGH_RISK' | 'FLASH_CRASH_WARNING';
  isCrashWarningActive: boolean;
  buyEligible: boolean;
  isVolatilityShieldActive: boolean;
  btcRiskIndex: number;
  ethRiskIndex: number;
  isConnected: boolean;
  isLoading: boolean;
  lastUpdated: number | null;
  refreshMarketState: () => Promise<void>;
}

const EMPTY_ORDER_BOOK: OrderBookData = {
  bids: [],
  asks: [],
  timestamp: 0,
};

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeSymbol, availableSymbols } = useCrypto();
  const [marketState, setMarketState] = useState<MarketState | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const symbolsKey = availableSymbols.join(',');

  const fetchMarketState = useCallback(async () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const url = `/api/market/market-state?symbol=${encodeURIComponent(activeSymbol)}&symbols=${encodeURIComponent(symbolsKey)}`;
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data && data.success) {
        setMarketState({
          timestamp: data.timestamp || Date.now(),
          globalRiskIndex: typeof data.globalRiskIndex === 'number' ? data.globalRiskIndex : 18,
          globalRiskStatus: data.globalRiskStatus || 'NORMAL',
          isCrashWarningActive: Boolean(data.isCrashWarningActive),
          buyEligible: data.buyEligible !== false,
          isVolatilityShieldActive: Boolean(data.isVolatilityShieldActive),
          btcRiskIndex: typeof data.btcRiskIndex === 'number' ? data.btcRiskIndex : 18,
          ethRiskIndex: typeof data.ethRiskIndex === 'number' ? data.ethRiskIndex : 20,
          activeMetrics: data.activeMetrics || null,
          orderBook: data.orderBook || EMPTY_ORDER_BOOK,
          symbolsState: data.symbolsState || {},
          liquidations: data.liquidations || {
            total1mUsd: 0,
            long1mUsd: 0,
            short1mUsd: 0,
            recentEvents: [],
          },
          buySignals: Array.isArray(data.buySignals) ? data.buySignals : [],
          sellSignals: Array.isArray(data.sellSignals) ? data.sellSignals : [],
          breakdownSignals: Array.isArray(data.breakdownSignals) ? data.breakdownSignals : [],
          allBuyScans: Array.isArray(data.allBuyScans) ? data.allBuyScans : [],
          allSellScans: Array.isArray(data.allSellScans) ? data.allSellScans : [],
          vwapMatrix: data.vwapMatrix || {},
          monitoredSymbols: Array.isArray(data.monitoredSymbols) ? data.monitoredSymbols : Object.keys(data.symbolsState || {}),
          trackedSymbols: Array.isArray(data.trackedSymbols) ? data.trackedSymbols : undefined,
          winningSignalsLedger: Array.isArray(data.winningSignalsLedger) ? data.winningSignalsLedger : [],
          activeTrackedSignalsCount: typeof data.activeTrackedSignalsCount === 'number' ? data.activeTrackedSignalsCount : 0,
        });
        setIsConnected(true);
        setLastUpdated(Date.now());
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        setIsConnected(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeSymbol, symbolsKey]);

  useEffect(() => {
    setIsLoading(true);
    fetchMarketState();
    const intervalId = setInterval(() => {
      fetchMarketState();
    }, 2500);

    return () => {
      clearInterval(intervalId);
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [fetchMarketState]);

  // Prevent cross-symbol stale metrics display while a symbol switch fetch is inflight
  const activeMetrics =
    marketState?.activeMetrics && marketState.activeMetrics.symbol === activeSymbol
      ? marketState.activeMetrics
      : null;

  const orderBook =
    activeMetrics && marketState?.orderBook
      ? marketState.orderBook
      : EMPTY_ORDER_BOOK;

  const monitoredSymbols = Array.from(
    new Set([
      ...(marketState?.monitoredSymbols || []),
      ...Object.keys(marketState?.symbolsState || {}),
    ])
  );

  const value: MarketContextType = {
    marketState,
    activeMetrics,
    orderBook,
    symbolsState: marketState?.symbolsState || {},
    buySignals: marketState?.buySignals || [],
    sellSignals: marketState?.sellSignals || [],
    breakdownSignals: marketState?.breakdownSignals || [],
    allBuyScans: marketState?.allBuyScans || [],
    allSellScans: marketState?.allSellScans || [],
    vwapMatrix: marketState?.vwapMatrix || {},
    monitoredSymbols,
    winningSignalsLedger: marketState?.winningSignalsLedger || [],
    activeTrackedSignalsCount: marketState?.activeTrackedSignalsCount ?? 0,
    globalRiskIndex: marketState?.globalRiskIndex ?? 0,
    globalRiskStatus: marketState?.globalRiskStatus || 'NORMAL',
    isCrashWarningActive: Boolean(marketState?.isCrashWarningActive),
    buyEligible: marketState ? marketState.buyEligible : true,
    isVolatilityShieldActive: Boolean(marketState?.isVolatilityShieldActive),
    btcRiskIndex: marketState?.btcRiskIndex ?? 0,
    ethRiskIndex: marketState?.ethRiskIndex ?? 0,
    isConnected,
    isLoading,
    lastUpdated,
    refreshMarketState: fetchMarketState,
  };

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
};

export const useMarket = (): MarketContextType => {
  const ctx = useContext(MarketContext);
  if (!ctx) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return ctx;
};
