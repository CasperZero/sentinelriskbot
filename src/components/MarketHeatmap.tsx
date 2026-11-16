import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LayoutGrid, Flame, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Activity, Eye, BarChart2, ShieldAlert, Plus } from 'lucide-react';
import { RiskMetrics } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useCrypto } from '../context/CryptoContext';
import { useMarket } from '../context/MarketContext';

interface HeatmapPairData {
  symbol: string;
  name: string;
  baseAsset: string;
  quoteAsset: string;
  icon: string;
  price: number;
  priceChange1m: number;
  priceChange5m: number;
  sellVolumeRatio: number; // 0 - 1
  sellVolumeZScore: number;
  volume24hUsd: number;
  riskIndex: number;
  riskStatus: 'NORMAL' | 'ELEVATED' | 'HIGH_RISK' | 'FLASH_CRASH_WARNING';
  lastUpdated: number;
  hasData: boolean;
  flashState?: 'BUY' | 'SELL' | null;
}

interface MarketHeatmapProps {
  currentMetrics: RiskMetrics | null;
  onSelectSymbol: (symbol: string) => void;
  onSwitchTab?: (tab: 'dashboard') => void;
}

type MetricOverlay = 'riskIndex' | 'volatility' | 'sellRatio' | 'volume';
type SortOption = 'risk' | 'volatility' | 'volume' | 'sellRatio';
type ViewMode = 'grid' | 'matrix' | 'treemap';

export const MarketHeatmap: React.FC<MarketHeatmapProps> = ({
  currentMetrics,
  onSelectSymbol,
  onSwitchTab,
}) => {
  const { t } = useLanguage();
  const { cryptoList, setIsManageModalOpen } = useCrypto();
  const { symbolsState } = useMarket();

  const [overlay, setOverlay] = useState<MetricOverlay>('riskIndex');
  const [sortBy, setSortBy] = useState<SortOption>('risk');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [flashMap, setFlashMap] = useState<Record<string, 'BUY' | 'SELL'>>({});
  const prevPricesRef = useRef<Record<string, number>>({});

  // Single Source of Truth derivation from MarketContext + active WebSocket/SSE currentMetrics
  const pairsData: HeatmapPairData[] = useMemo(() => {
    return cryptoList.map((preset) => {
      const state = symbolsState[preset.symbol];
      const isActiveLive = Boolean(
        currentMetrics &&
        currentMetrics.symbol === preset.symbol &&
        currentMetrics.currentPrice > 0
      );

      const price = isActiveLive
        ? currentMetrics!.currentPrice
        : (state?.currentPrice && state.currentPrice > 0 ? state.currentPrice : 0);

      const hasData = price > 0;

      return {
        symbol: preset.symbol,
        name: preset.name,
        baseAsset: preset.baseAsset,
        quoteAsset: preset.quoteAsset,
        icon: preset.icon,
        price,
        priceChange1m: isActiveLive ? currentMetrics!.priceChange1m : (state?.priceChange1m ?? 0),
        priceChange5m: isActiveLive ? currentMetrics!.priceChange5m : (state?.priceChange5m ?? 0),
        sellVolumeRatio: isActiveLive ? currentMetrics!.sellVolumeRatio : (state?.sellerVolumeRatio ?? 0.5),
        sellVolumeZScore: isActiveLive ? currentMetrics!.sellVolumeZScore : (state?.sellVolumeZScore ?? 0),
        volume24hUsd: state?.volume24hUsd ?? 0,
        riskIndex: isActiveLive ? currentMetrics!.riskIndex : (state?.riskIndex ?? 0),
        riskStatus: isActiveLive ? currentMetrics!.riskStatus : (state?.riskStatus || 'NORMAL'),
        lastUpdated: state?.updatedAt || 0,
        hasData,
        flashState: flashMap[preset.symbol] || null,
      };
    });
  }, [cryptoList, symbolsState, currentMetrics, flashMap]);

  // Track subtle price-tick flashes only when prices actually change
  useEffect(() => {
    const nextFlashes: Record<string, 'BUY' | 'SELL'> = {};
    let changed = false;

    for (const pair of pairsData) {
      if (pair.price <= 0) continue;
      const prevPrice = prevPricesRef.current[pair.symbol];
      if (prevPrice !== undefined && prevPrice > 0 && prevPrice !== pair.price) {
        nextFlashes[pair.symbol] = pair.price > prevPrice ? 'BUY' : 'SELL';
        changed = true;
      }
      prevPricesRef.current[pair.symbol] = pair.price;
    }

    if (changed) {
      setFlashMap(nextFlashes);
      const timer = setTimeout(() => setFlashMap({}), 600);
      return () => clearTimeout(timer);
    }
  }, [symbolsState, currentMetrics?.currentPrice, currentMetrics?.symbol]);

  // Sort pairs based on active user selection (pairs with data always float above syncing pairs)
  const sortedPairs = useMemo(() => {
    return [...pairsData].sort((a, b) => {
      if (a.hasData !== b.hasData) return a.hasData ? -1 : 1;
      if (sortBy === 'risk') return b.riskIndex - a.riskIndex;
      if (sortBy === 'volatility') return Math.abs(b.priceChange1m) - Math.abs(a.priceChange1m);
      if (sortBy === 'volume') return b.volume24hUsd - a.volume24hUsd;
      if (sortBy === 'sellRatio') return b.sellVolumeRatio - a.sellVolumeRatio;
      return 0;
    });
  }, [pairsData, sortBy]);

  // Calculate background color intensity based on active overlay metric
  const getCardStyle = (pair: HeatmapPairData) => {
    if (!pair.hasData) {
      return {
        bg: 'bg-[#181A20]',
        border: 'border-[#2B2F36]',
        badgeBg: 'bg-[#2B2F36] text-[#848E9C] border-[#2B2F36]',
        accentColor: '#848E9C',
      };
    }

    if (overlay === 'riskIndex') {
      if (pair.riskIndex >= 75) {
        return {
          bg: 'bg-gradient-to-br from-[#2D1217] via-[#1F1014] to-[#121418]',
          border: 'border-[#F6465D]/70 shadow-[0_0_15px_rgba(246,70,93,0.25)]',
          badgeBg: 'bg-[#F6465D]/20 text-[#F6465D] border-[#F6465D]/50',
          accentColor: '#F6465D',
        };
      }
      if (pair.riskIndex >= 50) {
        return {
          bg: 'bg-gradient-to-br from-[#2A1D12] via-[#1A1612] to-[#121418]',
          border: 'border-orange-500/60 shadow-[0_0_10px_rgba(249,115,22,0.15)]',
          badgeBg: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
          accentColor: '#FB923C',
        };
      }
      if (pair.riskIndex >= 25) {
        return {
          bg: 'bg-gradient-to-br from-[#262212] via-[#1A1812] to-[#121418]',
          border: 'border-[#F0B90B]/50',
          badgeBg: 'bg-[#F0B90B]/20 text-[#F0B90B] border-[#F0B90B]/40',
          accentColor: '#F0B90B',
        };
      }
      return {
        bg: 'bg-gradient-to-br from-[#12221A] via-[#121815] to-[#121418]',
        border: 'border-[#0ECB81]/40',
        badgeBg: 'bg-[#0ECB81]/20 text-[#0ECB81] border-[#0ECB81]/40',
        accentColor: '#0ECB81',
      };
    }

    if (overlay === 'volatility') {
      const isNegative = pair.priceChange1m < 0;
      const absVol = Math.abs(pair.priceChange1m);
      if (isNegative) {
        return {
          bg: absVol > 0.5 ? 'bg-gradient-to-br from-[#2D1217] to-[#121418]' : 'bg-[#181A20]',
          border: absVol > 0.5 ? 'border-[#F6465D]' : 'border-[#2B2F36]',
          badgeBg: 'bg-[#F6465D]/20 text-[#F6465D]',
          accentColor: '#F6465D',
        };
      }
      return {
        bg: absVol > 0.5 ? 'bg-gradient-to-br from-[#12221A] to-[#121418]' : 'bg-[#181A20]',
        border: absVol > 0.5 ? 'border-[#0ECB81]' : 'border-[#2B2F36]',
        badgeBg: 'bg-[#0ECB81]/20 text-[#0ECB81]',
        accentColor: '#0ECB81',
      };
    }

    if (overlay === 'sellRatio') {
      if (pair.sellVolumeRatio >= 0.70) {
        return {
          bg: 'bg-gradient-to-br from-[#2D1217] to-[#121418]',
          border: 'border-[#F6465D]',
          badgeBg: 'bg-[#F6465D]/20 text-[#F6465D]',
          accentColor: '#F6465D',
        };
      }
      return {
        bg: 'bg-[#181A20]',
        border: 'border-[#2B2F36]',
        badgeBg: 'bg-[#0ECB81]/20 text-[#0ECB81]',
        accentColor: '#0ECB81',
      };
    }

    // Default Volume
    return {
      bg: 'bg-gradient-to-br from-[#1A222D] to-[#121418]',
      border: 'border-[#3B82F6]/50',
      badgeBg: 'bg-[#3B82F6]/20 text-[#60A5FA]',
      accentColor: '#60A5FA',
    };
  };

  const formatPairPrice = (price: number): string => {
    if (!Number.isFinite(price) || price <= 0) return '—';
    if (price >= 1) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (price < 0.0001) return `$${price.toFixed(8)}`;
    return `$${price.toFixed(6)}`;
  };

  const formatVolumeUsd = (vol: number): string => {
    if (!Number.isFinite(vol) || vol <= 0) return '—';
    if (vol >= 1_000_000_000) return `$${(vol / 1_000_000_000).toFixed(2)}B`;
    if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(1)}M`;
    if (vol >= 1_000) return `$${(vol / 1_000).toFixed(0)}K`;
    return `$${vol.toFixed(0)}`;
  };

  const handlePairClick = (symbol: string) => {
    onSelectSymbol(symbol);
    if (onSwitchTab) {
      onSwitchTab('dashboard');
    }
  };

  // Calculate market-wide high risk count (only among synced pairs)
  const flashCrashCount = pairsData.filter(p => p.hasData && p.riskIndex >= 75).length;
  const highRiskCount = pairsData.filter(p => p.hasData && p.riskIndex >= 50 && p.riskIndex < 75).length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner & Controls */}
      <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#F0B90B] animate-pulse" />
              <h2 className="text-base font-bold font-mono text-[#EAECEF] uppercase tracking-wide">
                {t.heatmapTitle}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F0B90B]/20 text-[#F0B90B] border border-[#F0B90B]/40 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0ECB81] animate-ping" />
                {t.liveFeed}
              </span>
            </div>
            <p className="text-xs text-[#848E9C] font-mono mt-1">
              {t.heatmapSubtitle}
            </p>
          </div>

          {/* High-Level Market Health Badges */}
          <div className="flex items-center gap-2">
            <div className="bg-[#121418] border border-[#2B2F36] rounded-lg px-3 py-1.5 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#F6465D]" />
              <div className="text-xs font-mono">
                <span className="text-[#848E9C]">Flash Crash Alerts: </span>
                <span className={`font-bold ${flashCrashCount > 0 ? 'text-[#F6465D]' : 'text-[#0ECB81]'}`}>
                  {flashCrashCount} Pairs
                </span>
              </div>
            </div>

            <div className="bg-[#121418] border border-[#2B2F36] rounded-lg px-3 py-1.5 flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-400" />
              <div className="text-xs font-mono">
                <span className="text-[#848E9C]">Elevated/High Risk: </span>
                <span className="font-bold text-orange-400">
                  {highRiskCount} Pairs
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="pt-3 border-t border-[#2B2F36] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          
          {/* Overlay Selector */}
          <div className="flex items-center gap-1 bg-[#121418] p-1 rounded border border-[#2B2F36]">
            <span className="text-[10px] text-[#848E9C] px-2 font-bold uppercase">Overlay:</span>
            <button
              onClick={() => setOverlay('riskIndex')}
              className={`px-2.5 py-1 rounded transition text-xs font-semibold ${
                overlay === 'riskIndex' ? 'bg-[#F0B90B] text-slate-950 shadow' : 'text-[#848E9C] hover:text-[#EAECEF]'
              }`}
            >
              {t.metricRiskIndex}
            </button>
            <button
              onClick={() => setOverlay('volatility')}
              className={`px-2.5 py-1 rounded transition text-xs font-semibold ${
                overlay === 'volatility' ? 'bg-[#F0B90B] text-slate-950 shadow' : 'text-[#848E9C] hover:text-[#EAECEF]'
              }`}
            >
              {t.metricVolatility}
            </button>
            <button
              onClick={() => setOverlay('sellRatio')}
              className={`px-2.5 py-1 rounded transition text-xs font-semibold ${
                overlay === 'sellRatio' ? 'bg-[#F0B90B] text-slate-950 shadow' : 'text-[#848E9C] hover:text-[#EAECEF]'
              }`}
            >
              {t.metricSellRatio}
            </button>
            <button
              onClick={() => setOverlay('volume')}
              className={`px-2.5 py-1 rounded transition text-xs font-semibold ${
                overlay === 'volume' ? 'bg-[#F0B90B] text-slate-950 shadow' : 'text-[#848E9C] hover:text-[#EAECEF]'
              }`}
            >
              {t.metricVolume}
            </button>
          </div>

          {/* Sort By Controls */}
          <div className="flex items-center gap-2">
            <span className="text-[#848E9C] text-xs">{t.sortBy}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-[#121418] border border-[#2B2F36] rounded px-3 py-1 text-xs text-[#EAECEF] focus:outline-none focus:border-[#F0B90B]"
            >
              <option value="risk">{t.sortByRisk}</option>
              <option value="volatility">{t.sortByVol}</option>
              <option value="sellRatio">{t.sortBySellRatio}</option>
              <option value="volume">{t.sortByVolume}</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-[#121418] p-1 rounded border border-[#2B2F36]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition ${viewMode === 'grid' ? 'bg-[#2B2F36] text-[#F0B90B]' : 'text-[#848E9C] hover:text-[#EAECEF]'}`}
              title={t.viewGrid}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`p-1.5 rounded transition ${viewMode === 'matrix' ? 'bg-[#2B2F36] text-[#F0B90B]' : 'text-[#848E9C] hover:text-[#EAECEF]'}`}
              title={t.viewMatrix}
            >
              <BarChart2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('treemap')}
              className={`p-1.5 rounded transition ${viewMode === 'treemap' ? 'bg-[#2B2F36] text-[#F0B90B]' : 'text-[#848E9C] hover:text-[#EAECEF]'}`}
              title={t.viewTreemap}
            >
              <Flame className="w-4 h-4" />
            </button>
          </div>

          {/* Manage Cryptos Button */}
          <button
            onClick={() => setIsManageModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-[#121418] hover:bg-[#2B2F36] text-[#F0B90B] border border-[#2B2F36] font-bold transition flex items-center gap-1.5 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.manageCryptos}</span>
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] font-mono text-[#848E9C] flex-wrap pt-1">
          <span className="font-bold uppercase">Color Key:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#0ECB81]" />
            <span>{t.legendNormal}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#F0B90B]" />
            <span>{t.legendElevated}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-orange-500" />
            <span>{t.legendHighRisk}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#F6465D]" />
            <span>{t.legendFlashCrash}</span>
          </div>
        </div>
      </div>

      {/* VIEW 1: GRID CARDS */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {sortedPairs.map((pair) => {
            const style = getCardStyle(pair);
            const isMonitored = currentMetrics?.symbol === pair.symbol;

            return (
              <div
                key={pair.symbol}
                onClick={() => handlePairClick(pair.symbol)}
                className={`rounded-xl p-4 border transition-all duration-200 cursor-pointer hover:scale-[1.02] flex flex-col justify-between relative overflow-hidden group ${style.bg} ${style.border} ${
                  pair.flashState === 'BUY'
                    ? 'ring-2 ring-[#0ECB81]/60'
                    : pair.flashState === 'SELL'
                    ? 'ring-2 ring-[#F6465D]/60'
                    : ''
                }`}
              >
                {/* Active Stream Marker */}
                {isMonitored && (
                  <div className="absolute top-0 right-0 bg-[#F0B90B] text-slate-950 font-mono text-[9px] font-bold px-2 py-0.5 rounded-bl shadow">
                    LIVE STREAM
                  </div>
                )}

                <div>
                  {/* Top Bar: Icon, Symbol, Risk Index Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{pair.icon}</span>
                      <div>
                        <div className="font-mono font-bold text-sm text-[#EAECEF] flex items-center gap-1">
                          {pair.baseAsset}
                          <span className="text-[10px] text-[#848E9C]">/USDT</span>
                        </div>
                        <div className="text-[10px] text-[#848E9C] font-mono truncate max-w-[90px]">
                          {pair.name}
                        </div>
                      </div>
                    </div>

                    <div className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${style.badgeBg}`}>
                      {pair.hasData ? pair.riskIndex : '—'}
                    </div>
                  </div>

                  {/* Price & Volatility */}
                  <div className="space-y-1 mb-3">
                    <div className="text-lg font-mono font-bold text-[#EAECEF] tracking-tight">
                      {formatPairPrice(pair.price)}
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#848E9C]">1m Vol:</span>
                      <span className={`font-bold flex items-center ${!pair.hasData ? 'text-[#848E9C]' : pair.priceChange1m >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                        {pair.hasData ? (
                          <>
                            {pair.priceChange1m >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {pair.priceChange1m >= 0 ? '+' : ''}{pair.priceChange1m.toFixed(2)}%
                          </>
                        ) : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Sell Volume Progress Bar */}
                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-[#848E9C]">Sell Ratio:</span>
                      <span className={`font-bold ${pair.hasData && pair.sellVolumeRatio >= 0.65 ? 'text-[#F6465D]' : 'text-[#EAECEF]'}`}>
                        {pair.hasData ? `${(pair.sellVolumeRatio * 100).toFixed(0)}% Sells` : '—'}
                      </span>
                    </div>
                    <div className="w-full bg-[#121418] rounded-full h-1.5 overflow-hidden flex border border-[#2B2F36]">
                      <div
                        className="bg-[#0ECB81] h-full transition-all duration-300"
                        style={{ width: `${pair.hasData ? (1 - pair.sellVolumeRatio) * 100 : 50}%` }}
                      />
                      <div
                        className="bg-[#F6465D] h-full transition-all duration-300"
                        style={{ width: `${pair.hasData ? pair.sellVolumeRatio * 100 : 50}%` }}
                      />
                    </div>
                  </div>

                  {/* Metrics Snapshot Grid */}
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono bg-[#121418]/60 p-2 rounded border border-[#2B2F36] mb-3">
                    <div>
                      <span className="text-[#848E9C] block">Z-Score:</span>
                      <span className={`font-bold ${pair.hasData && pair.sellVolumeZScore >= 2.5 ? 'text-[#F6465D]' : 'text-[#EAECEF]'}`}>
                        {pair.hasData ? `${pair.sellVolumeZScore.toFixed(1)} σ` : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#848E9C] block">24h Vol:</span>
                      <span className="text-[#EAECEF] font-bold">
                        {formatVolumeUsd(pair.volume24hUsd)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Inspect Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePairClick(pair.symbol);
                  }}
                  className="w-full py-1.5 rounded bg-[#2B2F36] group-hover:bg-[#F0B90B] group-hover:text-slate-950 text-[#EAECEF] font-mono text-[11px] font-bold transition flex items-center justify-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> {t.monitorPair}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: RISK MATRIX TABLE */}
      {viewMode === 'matrix' && (
        <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#121418] text-[#848E9C] border-b border-[#2B2F36] uppercase text-[10px]">
                <tr>
                  <th className="p-3">Crypto Pair</th>
                  <th className="p-3">Live Price</th>
                  <th className="p-3">1m Volatility</th>
                  <th className="p-3">5m Change</th>
                  <th className="p-3">Sell Volume Ratio</th>
                  <th className="p-3">Z-Score (σ)</th>
                  <th className="p-3">24h Est Volume</th>
                  <th className="p-3 text-center">Risk Index</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B2F36]">
                {sortedPairs.map((pair) => {
                  const style = getCardStyle(pair);
                  const isMonitored = currentMetrics?.symbol === pair.symbol;

                  return (
                    <tr
                      key={pair.symbol}
                      onClick={() => handlePairClick(pair.symbol)}
                      className="hover:bg-[#2B2F36]/40 transition cursor-pointer"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{pair.icon}</span>
                          <div>
                            <div className="font-bold text-[#EAECEF] flex items-center gap-1">
                              {pair.symbol}
                              {isMonitored && (
                                <span className="text-[9px] bg-[#F0B90B] text-slate-950 px-1 rounded font-bold">LIVE</span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#848E9C]">{pair.name}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 font-bold text-[#EAECEF]">
                        {formatPairPrice(pair.price)}
                      </td>

                      <td className={`p-3 font-bold ${!pair.hasData ? 'text-[#848E9C]' : pair.priceChange1m >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                        {pair.hasData ? `${pair.priceChange1m >= 0 ? '+' : ''}${pair.priceChange1m.toFixed(2)}%` : '—'}
                      </td>

                      <td className={`p-3 ${!pair.hasData ? 'text-[#848E9C]' : pair.priceChange5m >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                        {pair.hasData ? `${pair.priceChange5m >= 0 ? '+' : ''}${pair.priceChange5m.toFixed(2)}%` : '—'}
                      </td>

                      <td className="p-3">
                        <div className="space-y-1 w-28">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-[#848E9C]">Sell:</span>
                            <span className="font-bold text-[#EAECEF]">{pair.hasData ? `${(pair.sellVolumeRatio * 100).toFixed(0)}%` : '—'}</span>
                          </div>
                          <div className="w-full bg-[#121418] rounded-full h-1.5 overflow-hidden flex border border-[#2B2F36]">
                            <div className="bg-[#0ECB81] h-full" style={{ width: `${pair.hasData ? (1 - pair.sellVolumeRatio) * 100 : 50}%` }} />
                            <div className="bg-[#F6465D] h-full" style={{ width: `${pair.hasData ? pair.sellVolumeRatio * 100 : 50}%` }} />
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded ${pair.hasData && pair.sellVolumeZScore >= 2.5 ? 'bg-[#F6465D]/20 text-[#F6465D] font-bold' : 'text-[#848E9C]'}`}>
                          {pair.hasData ? `${pair.sellVolumeZScore.toFixed(2)} σ` : '—'}
                        </span>
                      </td>

                      <td className="p-3 text-[#EAECEF]">
                        {formatVolumeUsd(pair.volume24hUsd)}
                      </td>

                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded font-bold border ${style.badgeBg}`}>
                          {pair.hasData ? pair.riskIndex : '—'}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePairClick(pair.symbol);
                          }}
                          className="px-3 py-1 rounded bg-[#2B2F36] hover:bg-[#F0B90B] hover:text-slate-950 text-[#EAECEF] font-bold text-[11px] transition"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: PROPORTIONAL TREEMAP */}
      {viewMode === 'treemap' && (
        <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl p-4 shadow-lg min-h-[450px]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 h-full">
            {sortedPairs.map((pair, index) => {
              const style = getCardStyle(pair);
              // Top market cap pairs get larger span
              const isLarge = index < 2;
              const isMedium = index >= 2 && index < 5;

              return (
                <div
                  key={pair.symbol}
                  onClick={() => handlePairClick(pair.symbol)}
                  className={`${
                    isLarge ? 'md:col-span-2 md:row-span-2 min-h-[200px]' : isMedium ? 'md:col-span-2 min-h-[140px]' : 'min-h-[120px]'
                  } rounded-xl p-4 border cursor-pointer hover:scale-[1.01] transition duration-200 flex flex-col justify-between ${style.bg} ${style.border}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{pair.icon}</span>
                      <span className="font-mono font-bold text-sm text-[#EAECEF]">{pair.symbol}</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold border ${style.badgeBg}`}>
                      {pair.hasData ? `Risk ${pair.riskIndex}` : 'Syncing...'}
                    </span>
                  </div>

                  <div>
                    <div className="font-mono font-bold text-xl text-[#EAECEF] mt-2">
                      {formatPairPrice(pair.price)}
                    </div>
                    <div className="flex justify-between items-center text-xs font-mono mt-1">
                      <span className="text-[#848E9C]">1m Volatility:</span>
                      <span className={`font-bold ${!pair.hasData ? 'text-[#848E9C]' : pair.priceChange1m >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                        {pair.hasData ? `${pair.priceChange1m >= 0 ? '+' : ''}${pair.priceChange1m.toFixed(2)}%` : '—'}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-[#848E9C] pt-2 border-t border-white/5 flex justify-between">
                    <span>24h Vol: {formatVolumeUsd(pair.volume24hUsd)}</span>
                    <span>Sells: {pair.hasData ? `${(pair.sellVolumeRatio * 100).toFixed(0)}%` : '—'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
