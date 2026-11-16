import React, { useMemo } from 'react';
import {
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Layers,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  AlertTriangle,
  Crown,
  ArrowRight,
  Sparkles,
  Compass,
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { RiskMetrics, OrderBookData, AlertTriggerConfig, TimeframeRangeMetric, computeTimeframeRangeMetric } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useVolatilityShield } from '../context/VolatilityShieldContext';
import { useMarket } from '../context/MarketContext';
import { MacroVolatilityShieldBanner } from './MacroVolatilityShieldBanner';

interface RiskDashboardProps {
  metrics: RiskMetrics | null;
  orderBook: OrderBookData;
  config: AlertTriggerConfig;
  onNavigateToVwapScanner?: () => void;
  onNavigateToBuyScanner?: () => void;
  onNavigateToSellScanner?: () => void;
}

export const RiskDashboard: React.FC<RiskDashboardProps> = ({
  metrics,
  orderBook,
  config,
  onNavigateToVwapScanner,
  onNavigateToBuyScanner,
  onNavigateToSellScanner
}) => {
  const { t } = useLanguage();
  const { isPremium, openSubscriptionModal } = useAuth();
  const { isVolatilityShieldActive } = useVolatilityShield();
  const { vwapMatrix } = useMarket();

  // Consume server-calculated institutional VWAP trend signal (Single Source of Truth)
  const vwapSignal = useMemo(() => {
    if (!metrics || metrics.currentPrice <= 0) return null;
    return vwapMatrix?.[metrics.symbol] || null;
  }, [metrics, vwapMatrix]);

  // Price formatting helper for micro-cap to mega-cap crypto assets
  const formatPrice = (price: number | undefined | null) => {
    if (price === undefined || price === null || !Number.isFinite(price) || price <= 0) {
      return '—';
    }
    const decimals = price < 0.00001 ? 8 : price < 0.01 ? 6 : price < 1 ? 4 : 2;
    return `$${price.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}`;
  };

  // Safe percentage formatter
  const formatPercent = (val: number | undefined | null, forceSign: 'plus' | 'minus' | 'auto' = 'auto') => {
    const safe = Number.isFinite(val) ? (val as number) : 0;
    if (forceSign === 'plus') {
      return `+${Math.abs(safe).toFixed(2)}%`;
    }
    if (forceSign === 'minus') {
      const neg = safe === 0 ? 0 : -Math.abs(safe);
      return `${neg.toFixed(2)}%`;
    }
    return `${safe >= 0 ? '+' : ''}${safe.toFixed(2)}%`;
  };

  // Safe dollar amount formatter for liquidations and volumes
  const formatDollarAmount = (val: number | undefined | null) => {
    if (!val || !Number.isFinite(val) || val <= 0) return '$0 USD';
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M USD`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}k USD`;
    return `$${val.toFixed(0)} USD`;
  };

  // 1. Initial Mount Skeleton Loader (Zero Mock Data fallback)
  if (!metrics || metrics.currentPrice <= 0) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Banner Skeleton */}
        <div className="bg-[#181A20] border border-[#2B2F36] rounded-2xl p-6 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#2B2F36] flex items-center justify-center text-[#F0B90B]">
            <Activity className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="text-base font-bold text-[#EAECEF] font-mono">
            {t.rdConnectingTitle}
          </h3>
          <p className="text-xs text-[#848E9C] max-w-md mx-auto leading-relaxed">
            {t.rdConnectingDesc}
          </p>
        </div>

        {/* Thermometer & Navigation Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 bg-[#181A20] border border-[#2B2F36] rounded-2xl p-6 h-64"></div>
          <div className="lg:col-span-4 bg-[#181A20] border border-[#2B2F36] rounded-2xl p-6 h-64"></div>
        </div>

        {/* Matrix & 3 Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl p-5 h-40"></div>
          <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl p-5 h-40"></div>
          <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl p-5 h-40"></div>
        </div>
      </div>
    );
  }

  // 2. Strict Multi-Timeframe Matrix resolution consuming /api/market/ticker-stats data
  const resolveTimeframeMetric = (
    interval: '24h' | '1w' | '1m',
    label: string
  ): TimeframeRangeMetric | null => {
    const existing = metrics.timeframeMatrix?.[interval];
    if (
      existing &&
      Number.isFinite(existing.minPrice) &&
      existing.minPrice > 0 &&
      Number.isFinite(existing.maxPrice) &&
      existing.maxPrice > 0
    ) {
      return computeTimeframeRangeMetric(
        interval,
        label,
        metrics.currentPrice,
        existing.basePrice > 0 ? existing.basePrice : existing.minPrice,
        existing.minPrice,
        existing.maxPrice
      );
    }
    return null;
  };

  const timeframeItems = [
    {
      interval: '24h' as const,
      label: t.rdTf24hHeader,
      metric: resolveTimeframeMetric('24h', t.change24h)
    },
    {
      interval: '1w' as const,
      label: t.change1w,
      metric: resolveTimeframeMetric('1w', t.change1w)
    },
    {
      interval: '1m' as const,
      label: t.change1M,
      metric: resolveTimeframeMetric('1m', t.change1M)
    }
  ];

  // 3. Thermometer Status Definition (0–35, 36–65, 66–100)
  const score = Math.max(0, Math.min(100, Math.round(metrics.riskIndex || 0)));
  const isLowRisk = score <= 35;
  const isModerateRisk = score > 35 && score <= 65;
  const isHighRisk = score > 65;

  const thermometerStatus = isLowRisk
    ? {
        level: 'LOW',
        badgeText: t.rdStatusLowBadge,
        explanation: t.rdStatusLowDesc,
        textColor: 'text-[#0ECB81]',
        bgColor: 'bg-[#0ECB81]/10',
        borderColor: 'border-[#0ECB81]/30',
        barGradient: 'from-[#0ECB81] to-emerald-400'
      }
    : isModerateRisk
    ? {
        level: 'MODERATE',
        badgeText: t.rdStatusModBadge,
        explanation: t.rdStatusModDesc,
        textColor: 'text-[#F0B90B]',
        bgColor: 'bg-[#F0B90B]/10',
        borderColor: 'border-[#F0B90B]/30',
        barGradient: 'from-[#F0B90B] to-amber-500'
      }
    : {
        level: 'HIGH',
        badgeText: t.rdStatusHighBadge,
        explanation: t.rdStatusHighDesc,
        textColor: 'text-[#F6465D]',
        bgColor: 'bg-[#F6465D]/10',
        borderColor: 'border-[#F6465D]/30',
        barGradient: 'from-[#F6465D] to-rose-600'
      };

  // 4. Buyer vs Seller Tug-of-War Calculations
  const sellRatio = Math.max(0, Math.min(1, metrics.sellVolumeRatio ?? 0.5));
  const sellersPct = Math.round(sellRatio * 100);
  const buyersPct = 100 - sellersPct;

  const orderBookBids = orderBook?.bids || [];
  const orderBookAsks = orderBook?.asks || [];

  // Support Floor Resolution (5% window largest bid volume & failsafe)
  let supportFloorPrice = (metrics.nearestBuyWallPrice && metrics.nearestBuyWallPrice > 0)
    ? metrics.nearestBuyWallPrice
    : (orderBook?.nearestBuyWall?.price && orderBook.nearestBuyWall.price > 0)
    ? orderBook.nearestBuyWall.price
    : 0;

  let supportFloorQty = (metrics.nearestBuyWallBtc && metrics.nearestBuyWallBtc > 0)
    ? metrics.nearestBuyWallBtc
    : (orderBook?.nearestBuyWall?.quantity && orderBook.nearestBuyWall.quantity > 0)
    ? orderBook.nearestBuyWall.quantity
    : 0;

  if (supportFloorPrice <= 0 && orderBookBids.length > 0 && metrics.currentPrice > 0) {
    const bidsWithin5Pct = orderBookBids.filter(
      b => b.price >= metrics.currentPrice * 0.95 && b.price <= metrics.currentPrice
    );
    if (bidsWithin5Pct.length > 0) {
      const topBid = [...bidsWithin5Pct].sort((a, b) => b.quantity - a.quantity)[0];
      supportFloorPrice = topBid.price;
      supportFloorQty = topBid.quantity;
    } else {
      supportFloorPrice = orderBookBids[0].price;
      supportFloorQty = orderBookBids[0].quantity;
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Macro Volatility Shield Banner (when active) */}
      {isVolatilityShieldActive && (
        <MacroVolatilityShieldBanner scannerType="COMPACT" />
      )}

      {/* SECTION 1: MARKET SAFETY THERMOMETER & GUIDED ACTION HERO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Market Safety Thermometer Card (8 cols) */}
        <div className="lg:col-span-8 bg-[#181A20] border border-[#2B2F36] rounded-2xl p-6 relative overflow-hidden shadow-xl flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <ShieldAlert className="w-48 h-48 text-[#F0B90B]" />
          </div>

          <div>
            {/* Header: Thermometer Label & Live Ticker */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#2B2F36]/80">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${thermometerStatus.bgColor} ${thermometerStatus.borderColor} border`}>
                  {isLowRisk ? (
                    <ShieldCheck className={`w-5 h-5 ${thermometerStatus.textColor}`} />
                  ) : isModerateRisk ? (
                    <Activity className={`w-5 h-5 ${thermometerStatus.textColor}`} />
                  ) : (
                    <AlertTriangle className={`w-5 h-5 ${thermometerStatus.textColor}`} />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#848E9C]">
                    {t.rdProtectionDeskLabel}
                  </span>
                  <h2 className="text-lg font-black text-[#EAECEF] tracking-tight">
                    {t.rdThermometerTitle}
                  </h2>
                </div>
              </div>

              {/* Live Spot Asset Badge */}
              <div className="flex items-center gap-2 bg-[#121418] border border-[#2B2F36] px-3 py-1.5 rounded-xl font-mono text-xs">
                <span className="text-[#0ECB81] flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#0ECB81] animate-pulse"></span>
                  {metrics.symbol || 'BTCUSDT'}
                </span>
                <span className="text-[#5E6673]">·</span>
                <span className="text-[#EAECEF] font-black">{formatPrice(metrics.currentPrice)}</span>
                <span className={`text-[11px] font-bold ${metrics.priceChange24h && metrics.priceChange24h >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                  {formatPercent(metrics.priceChange24h, 'auto')}
                </span>
              </div>
            </div>

            {/* Score & Traffic Light Banner */}
            <div className="my-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-baseline gap-3">
                <span className={`text-6xl sm:text-7xl font-mono font-black tracking-tight leading-none ${thermometerStatus.textColor}`}>
                  {score}
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-mono font-bold text-[#848E9C] uppercase">
                    {t.rdRiskIndexUnit}
                  </span>
                  <span className="text-[11px] font-mono text-[#5E6673]">
                    {t.rdSlidingWindow15s}
                  </span>
                </div>
              </div>

              {/* Traffic Light Status Badge */}
              <div className="md:max-w-xs space-y-1.5">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold font-mono tracking-wider border ${thermometerStatus.bgColor} ${thermometerStatus.borderColor} ${thermometerStatus.textColor}`}>
                  {thermometerStatus.badgeText}
                </div>
                <p className="text-xs text-[#EAECEF] font-medium leading-relaxed">
                  {thermometerStatus.explanation}
                </p>
              </div>
            </div>

            {/* Gradient Visual Thermometer Progress Bar */}
            <div className="mt-4 space-y-1.5">
              <div className="w-full bg-[#121418] rounded-full h-3 p-0.5 border border-[#2B2F36] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${thermometerStatus.barGradient}`}
                  style={{ width: `${Math.max(5, score)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono font-semibold text-[#848E9C]">
                <span className="text-[#0ECB81]">0 (🟢 {t.rdScaleSafe})</span>
                <span className="text-[#F0B90B]">35 (🟡 {t.rdScaleCaution})</span>
                <span className="text-[#F6465D]">65 (🔴 {t.rdScaleHighRisk})</span>
                <span className="text-red-500">100 ({t.rdScaleFlashCrash})</span>
              </div>
            </div>
          </div>

          {/* Bottom Micro Trend Pill */}
          <div className="pt-4 mt-4 border-t border-[#2B2F36]/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#848E9C]">
            <div className="flex items-center gap-3">
              <span>{t.rdDrift1m}</span>
              <strong className={metrics.priceChange1m >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}>
                {formatPercent(metrics.priceChange1m, 'auto')}
              </strong>
              <span>{t.rdDrift5m}</span>
              <strong className={metrics.priceChange5m >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}>
                {formatPercent(metrics.priceChange5m, 'auto')}
              </strong>
            </div>

            {metrics.rollingHighPrice > 0 && (
              <span className="text-[11px]">
                {t.rdRecentPeak}{' '}
                <strong className="text-[#EAECEF]">{formatPrice(metrics.rollingHighPrice)}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Guided Action & Recommendation Card (4 cols) */}
        <div className="lg:col-span-4 bg-[#181A20] border border-[#2B2F36] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#F0B90B] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#F0B90B]" />
                {t.rdQuickGuideBadge}
              </span>
              <span className="text-[10px] font-mono text-[#848E9C]">
                {t.rdNextAction}
              </span>
            </div>

            <h3 className="text-base font-bold text-[#EAECEF] leading-snug">
              {isLowRisk
                ? t.rdGuideLowTitle
                : isModerateRisk
                ? t.rdGuideModTitle
                : t.rdGuideHighTitle}
            </h3>

            <p className="text-xs text-[#848E9C] leading-relaxed">
              {isLowRisk
                ? t.rdGuideLowDesc
                : isModerateRisk
                ? t.rdGuideModDesc
                : t.rdGuideHighDesc}
            </p>
          </div>

          {/* Quick Guided Navigation Buttons */}
          <div className="space-y-2.5 pt-4 mt-3 border-t border-[#2B2F36]/80">
            {onNavigateToVwapScanner && (
              <button
                type="button"
                onClick={onNavigateToVwapScanner}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#F0B90B] hover:bg-[#fcd535] text-slate-950 font-bold font-mono text-xs transition flex items-center justify-between shadow-md active:scale-98"
              >
                <span>{t.rdBtnInspectVwap}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {onNavigateToBuyScanner && (
              <button
                type="button"
                onClick={onNavigateToBuyScanner}
                className="w-full py-2 px-3 rounded-xl bg-[#121418] hover:bg-[#2B2F36] border border-[#2B2F36] text-[#0ECB81] font-bold font-mono text-xs transition flex items-center justify-between"
              >
                <span>{t.rdBtnScanBuy}</span>
                <TrendingUp className="w-4 h-4" />
              </button>
            )}

            {onNavigateToSellScanner && isHighRisk && (
              <button
                type="button"
                onClick={onNavigateToSellScanner}
                className="w-full py-2 px-3 rounded-xl bg-[#F6465D]/15 hover:bg-[#F6465D]/25 border border-[#F6465D]/40 text-[#F6465D] font-bold font-mono text-xs transition flex items-center justify-between"
              >
                <span>{t.rdBtnCheckSell}</span>
                <TrendingDown className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* SECTION 2: MULTI-TIMEFRAME PERFORMANCE & RANGE MATRIX (1h/24h • 1w • 1m) */}
      <div className="bg-[#181A20] border border-[#2B2F36] rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#2B2F36]">
          <div>
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#848E9C]">
              {t.rdAuthenticBinanceBadge}
            </span>
            <h3 className="text-sm font-bold text-[#EAECEF] font-mono">
              {t.rdMatrixTitle}
            </h3>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-[#848E9C]">
            <span className="inline-flex items-center gap-1.5 text-[#0ECB81] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#0ECB81]"></span>
              {t.rdPotentialUpside}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#F6465D] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#F6465D]"></span>
              {t.rdMaxDropLegend}
            </span>
          </div>
        </div>

        {/* 3 Interval Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {timeframeItems.map(({ interval, label, metric }) => {
            if (!metric) {
              return (
                <div
                  key={interval}
                  className="bg-[#121418] border border-[#2B2F36] rounded-xl p-4 flex flex-col justify-center items-center text-center text-[#848E9C] text-xs font-mono h-32"
                >
                  <Activity className="w-4 h-4 animate-spin text-[#F0B90B] mb-2" />
                  <span>{t.rdFetchingKlines}</span>
                </div>
              );
            }

            const span = metric.maxPrice - metric.minPrice;
            const positionPct =
              Number.isFinite(span) && span > 0
                ? Math.min(100, Math.max(0, ((metrics.currentPrice - metric.minPrice) / span) * 100))
                : 50;
            const isNetPositive = (metric.changePercent || 0) >= 0;

            return (
              <div
                key={interval}
                className="bg-[#121418] border border-[#2B2F36] hover:border-[#3B414B] rounded-xl p-4 flex flex-col justify-between transition-colors shadow-sm"
              >
                {/* Interval Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2B2F36]">
                  <span className="text-xs font-mono font-bold text-[#EAECEF]">{label}</span>
                  <span
                    className={`text-xs font-mono font-black ${
                      isNetPositive ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                    }`}
                  >
                    {formatPercent(metric.changePercent, 'auto')}
                  </span>
                </div>

                {/* Peak Price (Max Price & Green Pill) */}
                <div className="bg-[#181A20] border border-[#0ECB81]/20 rounded-lg p-2.5 flex items-center justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono font-semibold uppercase text-[#0ECB81] block">
                      {t.rdPeakPrice}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#EAECEF] truncate block">
                      {formatPrice(metric.maxPrice)}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30 shrink-0">
                    <ArrowUpRight className="w-3 h-3" />
                    {formatPercent(metric.potentialGainPercent ?? metric.maxGainPercent, 'plus')}
                  </span>
                </div>

                {/* Floor Price (Min Price & Red Pill) */}
                <div className="bg-[#181A20] border border-[#F6465D]/20 rounded-lg p-2.5 flex items-center justify-between gap-2 mb-2.5">
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono font-semibold uppercase text-[#F6465D] block">
                      {t.rdFloorPrice}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#EAECEF] truncate block">
                      {formatPrice(metric.minPrice)}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#F6465D]/15 text-[#F6465D] border border-[#F6465D]/30 shrink-0">
                    <ArrowDownRight className="w-3 h-3" />
                    {formatPercent(metric.maxDropPercent, 'minus')}
                  </span>
                </div>

                {/* Relative Position Meter in Range */}
                <div className="pt-2 border-t border-[#2B2F36]">
                  <div className="w-full h-1.5 bg-[#181A20] rounded-full overflow-hidden mb-1 border border-[#2B2F36]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#F6465D] via-[#F0B90B] to-[#0ECB81] transition-all duration-300"
                      style={{ width: `${positionPct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#848E9C]">
                    <span>{t.rdPositionInRange}</span>
                    <span className="text-[#EAECEF] font-bold">{positionPct.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: THREE PLAIN-LANGUAGE CONCEPT CARDS (NO CONFUSING JARGON) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Buy vs. Sell Volume Pressure */}
        <div className="bg-[#181A20] border border-[#2B2F36] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#EAECEF] uppercase tracking-wider font-mono">
                  {t.rdBuySellPressureTitle}
                </h4>
                <span className="text-[10px] font-mono text-[#848E9C]">
                  {t.rdBuySellPressureSub}
                </span>
              </div>
            </div>

            {/* Visual Tug-of-War Percentage Dual Bar */}
            <div className="my-3 space-y-2">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span className="text-[#0ECB81] flex items-center gap-1">
                  <span>{buyersPct}%</span> {t.rdBuyersLabel}
                </span>
                <span className="text-[#F6465D] flex items-center gap-1">
                  {t.rdSellersLabel} <span>{sellersPct}%</span>
                </span>
              </div>

              {/* Tug-of-War Bar */}
              <div className="w-full h-3 rounded-full bg-[#121418] border border-[#2B2F36] flex overflow-hidden p-0.5">
                <div
                  className="bg-[#0ECB81] h-full rounded-l-full transition-all duration-300"
                  style={{ width: `${buyersPct}%` }}
                />
                <div
                  className="bg-[#F6465D] h-full rounded-r-full transition-all duration-300"
                  style={{ width: `${sellersPct}%` }}
                />
              </div>
            </div>

            {/* Plain Human Status Description */}
            <p className="text-xs text-[#EAECEF] font-mono bg-[#121418] p-2.5 rounded-xl border border-[#2B2F36]">
              {buyersPct > 55 ? (
                <span className="text-[#0ECB81]">
                  🟢 {t.rdBuyersControl}
                </span>
              ) : sellersPct > 55 ? (
                <span className="text-[#F6465D]">
                  🔴 {t.rdSellersControl}
                </span>
              ) : (
                <span className="text-[#F0B90B]">
                  ⚖️ {t.rdVolumeBalanced}
                </span>
              )}
            </p>
          </div>

          <div className="pt-3 mt-3 border-t border-[#2B2F36] flex justify-between text-[11px] font-mono text-[#848E9C]">
            <span>{t.rdVolume5mTotal}</span>
            <span className="text-[#EAECEF] font-bold">
              {formatDollarAmount((metrics.buyVolume5m || 0) + (metrics.sellVolume5m || 0))}
            </span>
          </div>
        </div>

        {/* Card 2: Nearest Buy Support Floor */}
        <div className="bg-[#181A20] border border-[#2B2F36] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[#F0B90B]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#EAECEF] uppercase tracking-wider font-mono">
                  {t.rdNearestSupportTitle}
                </h4>
                <span className="text-[10px] font-mono text-[#848E9C]">
                  {t.rdNearestSupportSub}
                </span>
              </div>
            </div>

            {/* Nearest Wall Price */}
            <div className="my-3 bg-[#121418] border border-[#2B2F36] rounded-xl p-3">
              <div className="text-[10px] font-mono uppercase text-[#848E9C]">
                {t.rdKeyDefenseFloor}
              </div>
              <div className="text-xl font-mono font-black text-[#EAECEF] mt-0.5 flex items-center justify-between">
                {supportFloorPrice > 0 ? (
                  <>
                    <span>{formatPrice(supportFloorPrice)}</span>
                    <span className="text-xs font-bold text-[#F0B90B] bg-[#F0B90B]/15 px-2 py-0.5 rounded border border-[#F0B90B]/30">
                      {supportFloorQty > 0 ? (supportFloorQty < 10 ? supportFloorQty.toFixed(2) : supportFloorQty.toFixed(1)) : '—'} {metrics.baseAsset || 'BTC'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-[#F0B90B] font-mono flex items-center gap-1.5 animate-pulse">
                      <Activity className="w-3.5 h-3.5 animate-spin" />
                      {t.rdCalculatingFloor}
                    </span>
                    <span className="text-xs font-bold text-[#848E9C] bg-[#2B2F36]/50 px-2 py-0.5 rounded border border-[#2B2F36]">
                      {t.syncingText}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Plain Human Description */}
            <p className="text-xs text-[#848E9C] leading-relaxed">
              {t.rdSupportDesc}
            </p>
          </div>

          <div className="pt-3 mt-3 border-t border-[#2B2F36] flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#848E9C]">{t.rdSupportStatusLabel}</span>
            {metrics.wallChewThroughPercent >= 50 ? (
              <span className="text-[#F6465D] font-bold">
                ⚠️ {metrics.wallChewThroughPercent.toFixed(0)}% {t.rdAbsorbedSuffix}
              </span>
            ) : (
              <span className="text-[#0ECB81] font-bold">
                🛡️ {t.rdFirmSupport}
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Liquidation Cascades */}
        <div className="bg-[#181A20] border border-[#2B2F36] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#EAECEF] uppercase tracking-wider font-mono">
                  {t.rdLiqCascadesTitle}
                </h4>
                <span className="text-[10px] font-mono text-[#848E9C]">
                  {t.rdLiqCascadesSub}
                </span>
              </div>
            </div>

            {/* Liquidations Amount */}
            <div className="my-3 bg-[#121418] border border-[#2B2F36] rounded-xl p-3">
              <div className="text-[10px] font-mono uppercase text-[#848E9C]">
                {t.rdLast1mLiqs}
              </div>
              <div className="text-xl font-mono font-black text-orange-400 mt-0.5 flex items-center justify-between">
                {metrics.currentPrice <= 0 ? (
                  <>
                    <span className="text-xs text-orange-400 font-mono flex items-center gap-1.5 animate-pulse">
                      <Activity className="w-3.5 h-3.5 animate-spin" />
                      {t.rdSyncingLiqs}
                    </span>
                    <span className="text-xs text-[#848E9C] font-normal">
                      0 {t.eventsUnit}
                    </span>
                  </>
                ) : (
                  <>
                    <span>{formatDollarAmount(metrics.longLiquidations1m || 0)}</span>
                    <span className="text-xs text-[#848E9C] font-normal">
                      {metrics.longLiquidationCount1m || 0} {t.eventsUnit}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Plain Human Description */}
            <p className="text-xs text-[#848E9C] leading-relaxed">
              {t.rdLiqCascadesDesc}
            </p>
          </div>

          <div className="pt-3 mt-3 border-t border-[#2B2F36] flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#848E9C]">{t.rdAlertStateLabel}</span>
            {metrics.liquidationSpikeDetected ? (
              <span className="text-[#F6465D] font-bold animate-pulse">
                🔴 {t.rdCascadeActive}
              </span>
            ) : (
              <span className="text-[#0ECB81] font-bold">
                🟢 {t.rdOrderlyMarket}
              </span>
            )}
          </div>
        </div>

      </div>

      {/* SECTION 4: REAL-TIME L2 ORDER BOOK & WALL DEPTH RADAR */}
      <div className="bg-[#181A20] border border-[#2B2F36] rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#2B2F36]">
          <div>
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#848E9C]">
              {t.rdLiveDepthBadge}
            </span>
            <h3 className="text-sm font-bold text-[#EAECEF] font-mono">
              {t.rdOrderBookTitle}
            </h3>
          </div>
          <span className="text-xs font-mono text-[#848E9C] bg-[#121418] px-3 py-1 rounded-lg border border-[#2B2F36]">
            {t.rdMinWallSizeLabel} {config.minBuyWallBtc} {metrics.baseAsset || 'BTC'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Bids (Buyers) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono font-bold text-[#0ECB81] pb-1 border-b border-[#2B2F36]">
              <span>{t.rdBidsColHeader}</span>
              <span>{t.rdVolumeColHeader} ({metrics.baseAsset || 'BTC'})</span>
              <span>{t.rdTotalUsdColHeader}</span>
            </div>

            {orderBookBids.length === 0 ? (
              <div className="py-6 text-center text-xs font-mono text-[#848E9C] flex items-center justify-center gap-2">
                <Activity className="w-3.5 h-3.5 animate-spin text-[#F0B90B]" />
                <span>{t.rdSyncingBids}</span>
              </div>
            ) : (
              orderBookBids.slice(0, 6).map((bid, i) => {
                const isWall = Math.abs(bid.price - supportFloorPrice) < (supportFloorPrice * 0.001) || (supportFloorQty > 0 && bid.quantity >= supportFloorQty * 0.95);
                return (
                  <div
                    key={`bid-${i}`}
                    className={`relative flex justify-between text-xs font-mono py-1.5 px-2.5 rounded-lg overflow-hidden transition ${
                      isWall
                        ? 'bg-[#F0B90B]/15 border border-[#F0B90B]/50 text-[#F0B90B] font-bold'
                        : 'bg-[#121418] text-[#EAECEF]'
                    }`}
                  >
                    <div
                      className="absolute top-0 bottom-0 right-0 bg-[#0ECB81]/10 pointer-events-none"
                      style={{ width: `${Math.min(100, (bid.quantity / (config.minBuyWallBtc * 1.5)) * 100)}%` }}
                    />
                    <span className="text-[#0ECB81] font-bold z-10">{formatPrice(bid.price)}</span>
                    <span className="z-10 flex items-center gap-1">
                      {bid.quantity.toFixed(3)} {metrics.baseAsset || 'BTC'}
                      {isWall && <span className="text-[10px] font-black text-[#F0B90B]">🧱 {t.rdWallBadge}</span>}
                    </span>
                    <span className="text-[#848E9C] z-10">{formatDollarAmount(bid.total)}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* Asks (Sellers) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono font-bold text-[#F6465D] pb-1 border-b border-[#2B2F36]">
              <span>{t.rdAsksColHeader}</span>
              <span>{t.rdVolumeColHeader} ({metrics.baseAsset || 'BTC'})</span>
              <span>{t.rdTotalUsdColHeader}</span>
            </div>

            {orderBookAsks.length === 0 ? (
              <div className="py-6 text-center text-xs font-mono text-[#848E9C] flex items-center justify-center gap-2">
                <Activity className="w-3.5 h-3.5 animate-spin text-[#F6465D]" />
                <span>{t.rdSyncingAsks}</span>
              </div>
            ) : (
              orderBookAsks.slice(0, 6).map((ask, i) => (
                <div
                  key={`ask-${i}`}
                  className="relative flex justify-between text-xs font-mono py-1.5 px-2.5 rounded-lg bg-[#121418] text-[#EAECEF] overflow-hidden"
                >
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-[#F6465D]/10 pointer-events-none"
                    style={{ width: `${Math.min(100, (ask.quantity / (config.minBuyWallBtc * 1.5)) * 100)}%` }}
                  />
                  <span className="text-[#F6465D] font-bold z-10">{formatPrice(ask.price)}</span>
                  <span className="z-10">{ask.quantity.toFixed(3)} {metrics.baseAsset || 'BTC'}</span>
                  <span className="text-[#848E9C] z-10">{formatDollarAmount(ask.total)}</span>
                </div>
              ))
            )}
          </div>

        </div>
      </div>

      {/* SECTION 5: VWAP TREND INSIGHT TEASER (LINKING TO FULL SCANNER) */}
      {vwapSignal && (
        <div className="bg-[#181A20] border border-[#2B2F36] rounded-2xl p-5 shadow-lg relative overflow-hidden font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2B2F36]">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border ${
                vwapSignal.signalType === 'BUY'
                  ? 'bg-[#0ECB81]/15 border-[#0ECB81]/30 text-[#0ECB81]'
                  : vwapSignal.signalType === 'SELL'
                  ? 'bg-[#F6465D]/15 border-[#F6465D]/30 text-[#F6465D]'
                  : 'bg-[#F0B90B]/15 border-[#F0B90B]/30 text-[#F0B90B]'
              }`}>
                {vwapSignal.signalType === 'BUY' ? (
                  <TrendingUp className="w-5 h-5" />
                ) : vwapSignal.signalType === 'SELL' ? (
                  <TrendingDown className="w-5 h-5" />
                ) : (
                  <Activity className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30 uppercase">
                    {t.rdInstitutionalTrendBadge}
                  </span>
                  <span className="text-xs text-[#848E9C]">[{vwapSignal.symbol} · 1H]</span>
                </div>
                <h4 className="font-extrabold text-sm text-[#EAECEF] mt-0.5 flex items-center gap-2">
                  <span>VWAP & EMA 9/21</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    vwapSignal.signalType === 'BUY'
                      ? 'bg-[#0ECB81]/20 text-[#0ECB81] border-[#0ECB81]/40'
                      : vwapSignal.signalType === 'SELL'
                      ? 'bg-[#F6465D]/20 text-[#F6465D] border-[#F6465D]/40'
                      : 'bg-[#2B2F36] text-[#848E9C] border-[#2B2F36]'
                  }`}>
                    {vwapSignal.signalType === 'BUY'
                      ? t.rdBullishTrend
                      : vwapSignal.signalType === 'SELL'
                      ? t.rdBearishTrend
                      : t.rdConsolidatingTrend}
                  </span>
                </h4>
              </div>
            </div>

            {onNavigateToVwapScanner && (
              <button
                type="button"
                onClick={onNavigateToVwapScanner}
                className="px-3.5 py-2 bg-[#121418] hover:bg-[#2B2F36] border border-[#2B2F36] text-[#EAECEF] font-bold text-xs rounded-xl flex items-center gap-2 transition"
              >
                <span>{t.rdOpenCompleteScanner}</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#F0B90B]" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
            <div className="p-3 bg-[#121418] rounded-xl border border-[#2B2F36]">
              <span className="text-[10px] text-[#848E9C] uppercase block">{t.rdVwapAnchor1h}</span>
              <span className="text-sm font-black text-[#EAECEF] mt-0.5 block">{formatPrice(vwapSignal.vwap)}</span>
            </div>
            <div className="p-3 bg-[#121418] rounded-xl border border-[#2B2F36]">
              <span className="text-[10px] text-[#848E9C] uppercase block">{t.rdEmaFast9}</span>
              <span className="text-sm font-black text-amber-400 mt-0.5 block">{formatPrice(vwapSignal.ema9)}</span>
            </div>
            <div className="p-3 bg-[#121418] rounded-xl border border-[#2B2F36]">
              <span className="text-[10px] text-[#848E9C] uppercase block">{t.rdEmaSlow21}</span>
              <span className="text-sm font-black text-cyan-400 mt-0.5 block">{formatPrice(vwapSignal.ema21)}</span>
            </div>
            <div className="p-3 bg-[#121418] rounded-xl border border-[#2B2F36]">
              <span className="text-[10px] text-[#848E9C] uppercase block">{t.rdEmaSpread}</span>
              <span className={`text-sm font-black mt-0.5 block ${vwapSignal.emaSpreadPercent >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                {vwapSignal.emaSpreadPercent >= 0 ? `+${vwapSignal.emaSpreadPercent}%` : `${vwapSignal.emaSpreadPercent}%`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Free Tier Premium Teaser */}
      {!isPremium && (
        <div className="p-4 bg-gradient-to-r from-[#F0B90B]/10 via-[#181A20] to-[#F0B90B]/5 border border-[#F0B90B]/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#F0B90B] text-slate-950 font-bold">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-[#EAECEF]">
                {t.rdTeaserTitle}
              </div>
              <div className="text-xs text-[#848E9C]">
                {t.rdTeaserDesc}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={openSubscriptionModal}
            className="px-4 py-2 bg-[#F0B90B] hover:bg-[#fcd535] text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition flex-shrink-0 shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.rdTeaserBtn}</span>
          </button>
        </div>
      )}

    </div>
  );
};
