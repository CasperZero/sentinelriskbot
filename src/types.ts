export type { Language } from './i18n/translations';

export interface CryptoPreset {
  symbol: string;       // e.g. 'BTCUSDT'
  name: string;         // e.g. 'Bitcoin'
  baseAsset: string;    // e.g. 'BTC'
  quoteAsset: string;   // e.g. 'USDT'
  icon: string;         // e.g. '⚡'
  defaultPrice: number; // Always 0 in static presets; live prices fetched dynamically
  defaultMinWallQty: number; // Computed dynamically from real live price ($750k / livePrice) unless customized
  isCustom?: boolean;
  isWallCustomized?: boolean;
  category?: 'core' | 'ai' | 'l1_l2' | 'defi' | 'meme';
}

export const PRESET_CRYPTOS: CryptoPreset[] = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', baseAsset: 'BTC', quoteAsset: 'USDT', icon: '⚡', defaultPrice: 0, defaultMinWallQty: 0, category: 'core' },
  { symbol: 'ETHUSDT', name: 'Ethereum', baseAsset: 'ETH', quoteAsset: 'USDT', icon: 'Ξ', defaultPrice: 0, defaultMinWallQty: 0, category: 'core' },
  { symbol: 'SOLUSDT', name: 'Solana', baseAsset: 'SOL', quoteAsset: 'USDT', icon: '◎', defaultPrice: 0, defaultMinWallQty: 0, category: 'l1_l2' },
  { symbol: 'BNBUSDT', name: 'BNB Chain', baseAsset: 'BNB', quoteAsset: 'USDT', icon: '🟡', defaultPrice: 0, defaultMinWallQty: 0, category: 'core' },
  { symbol: 'XRPUSDT', name: 'Ripple', baseAsset: 'XRP', quoteAsset: 'USDT', icon: '✕', defaultPrice: 0, defaultMinWallQty: 0, category: 'core' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', baseAsset: 'DOGE', quoteAsset: 'USDT', icon: '🐕', defaultPrice: 0, defaultMinWallQty: 0, category: 'meme' },
  { symbol: 'AVAXUSDT', name: 'Avalanche', baseAsset: 'AVAX', quoteAsset: 'USDT', icon: '🔺', defaultPrice: 0, defaultMinWallQty: 0, category: 'l1_l2' },
  { symbol: 'ADAUSDT', name: 'Cardano', baseAsset: 'ADA', quoteAsset: 'USDT', icon: '🪙', defaultPrice: 0, defaultMinWallQty: 0, category: 'l1_l2' },
  { symbol: 'LINKUSDT', name: 'Chainlink', baseAsset: 'LINK', quoteAsset: 'USDT', icon: '🔗', defaultPrice: 0, defaultMinWallQty: 0, category: 'defi' },
  { symbol: 'SUIUSDT', name: 'Sui Network', baseAsset: 'SUI', quoteAsset: 'USDT', icon: '💧', defaultPrice: 0, defaultMinWallQty: 0, category: 'l1_l2' },
  { symbol: 'NEARUSDT', name: 'Near Protocol', baseAsset: 'NEAR', quoteAsset: 'USDT', icon: 'Ⓝ', defaultPrice: 0, defaultMinWallQty: 0, category: 'l1_l2' },
  { symbol: 'PEPEUSDT', name: 'Pepe', baseAsset: 'PEPE', quoteAsset: 'USDT', icon: '🐸', defaultPrice: 0, defaultMinWallQty: 0, category: 'meme' },
];

export const POPULAR_CATALOG_CRYPTOS: CryptoPreset[] = [
  { symbol: 'ZECUSDT', name: 'Zcash', baseAsset: 'ZEC', quoteAsset: 'USDT', icon: '🛡️', defaultPrice: 0, defaultMinWallQty: 0, category: 'core' },
  { symbol: 'TAOUSDT', name: 'Bittensor', baseAsset: 'TAO', quoteAsset: 'USDT', icon: '🧠', defaultPrice: 0, defaultMinWallQty: 0, category: 'ai' },
  { symbol: 'RENDERUSDT', name: 'Render Network', baseAsset: 'RENDER', quoteAsset: 'USDT', icon: '🎨', defaultPrice: 0, defaultMinWallQty: 0, category: 'ai' },
  { symbol: 'FETUSDT', name: 'Artificial Superintelligence', baseAsset: 'FET', quoteAsset: 'USDT', icon: '🤖', defaultPrice: 0, defaultMinWallQty: 0, category: 'ai' },
  { symbol: 'INJUSDT', name: 'Injective', baseAsset: 'INJ', quoteAsset: 'USDT', icon: '🥷', defaultPrice: 0, defaultMinWallQty: 0, category: 'defi' },
  { symbol: 'APTUSDT', name: 'Aptos', baseAsset: 'APT', quoteAsset: 'USDT', icon: '🌀', defaultPrice: 0, defaultMinWallQty: 0, category: 'l1_l2' },
  { symbol: 'TONUSDT', name: 'The Open Network', baseAsset: 'TON', quoteAsset: 'USDT', icon: '💎', defaultPrice: 0, defaultMinWallQty: 0, category: 'l1_l2' },
  { symbol: 'UNIUSDT', name: 'Uniswap', baseAsset: 'UNI', quoteAsset: 'USDT', icon: '🦄', defaultPrice: 0, defaultMinWallQty: 0, category: 'defi' },
  { symbol: 'TIAUSDT', name: 'Celestia', baseAsset: 'TIA', quoteAsset: 'USDT', icon: '🌌', defaultPrice: 0, defaultMinWallQty: 0, category: 'l1_l2' },
  { symbol: 'SEIUSDT', name: 'Sei Network', baseAsset: 'SEI', quoteAsset: 'USDT', icon: '🔴', defaultPrice: 0, defaultMinWallQty: 0, category: 'l1_l2' },
  { symbol: 'SHIBUSDT', name: 'Shiba Inu', baseAsset: 'SHIB', quoteAsset: 'USDT', icon: '🐕', defaultPrice: 0, defaultMinWallQty: 0, category: 'meme' },
  { symbol: 'BONKUSDT', name: 'Bonk', baseAsset: 'BONK', quoteAsset: 'USDT', icon: '🔨', defaultPrice: 0, defaultMinWallQty: 0, category: 'meme' },
  { symbol: 'WIFUSDT', name: 'dogwifhat', baseAsset: 'WIF', quoteAsset: 'USDT', icon: '🧢', defaultPrice: 0, defaultMinWallQty: 0, category: 'meme' },
  { symbol: 'DOTUSDT', name: 'Polkadot', baseAsset: 'DOT', quoteAsset: 'USDT', icon: '🟣', defaultPrice: 0, defaultMinWallQty: 0, category: 'l1_l2' },
  { symbol: 'PENDLEUSDT', name: 'Pendle Finance', baseAsset: 'PENDLE', quoteAsset: 'USDT', icon: '⏳', defaultPrice: 0, defaultMinWallQty: 0, category: 'defi' },
  { symbol: 'AAVEUSDT', name: 'Aave', baseAsset: 'AAVE', quoteAsset: 'USDT', icon: '👻', defaultPrice: 0, defaultMinWallQty: 0, category: 'defi' },
  { symbol: 'LTCUSDT', name: 'Litecoin', baseAsset: 'LTC', quoteAsset: 'USDT', icon: 'Ł', defaultPrice: 0, defaultMinWallQty: 0, category: 'core' },
  { symbol: 'ARBUSDT', name: 'Arbitrum', baseAsset: 'ARB', quoteAsset: 'USDT', icon: '💙', defaultPrice: 0, defaultMinWallQty: 0, category: 'l1_l2' },
  { symbol: 'OPUSDT', name: 'Optimism', baseAsset: 'OP', quoteAsset: 'USDT', icon: '🔴', defaultPrice: 0, defaultMinWallQty: 0, category: 'l1_l2' },
  { symbol: 'ATOMUSDT', name: 'Cosmos Hub', baseAsset: 'ATOM', quoteAsset: 'USDT', icon: '⚛️', defaultPrice: 0, defaultMinWallQty: 0, category: 'l1_l2' },
  { symbol: 'FILUSDT', name: 'Filecoin', baseAsset: 'FIL', quoteAsset: 'USDT', icon: '📁', defaultPrice: 0, defaultMinWallQty: 0, category: 'defi' }
];

export interface TradeTick {
  id: string;
  price: number;
  quantity: number;
  side: 'buy' | 'sell';
  timestamp: number;
}

export interface OrderBookLevel {
  price: number;
  quantity: number;
  total: number;
}

export interface OrderBookData {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: number;
  nearestBuyWall?: {
    price: number;
    quantity: number;
    originalQuantity: number;
  };
  nearestAskWall?: {
    price: number;
    quantity: number;
  };
}

export interface LiquidationEvent {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL'; // BUY = Short liquidation, SELL = Long liquidation
  price: number;
  quantity: number;
  usdValue: number;
  timestamp: number;
}

export interface TimeframeRangeMetric {
  interval: '1h' | '24h' | '1w' | '1m';
  label: string;
  basePrice: number;
  minPrice: number;
  maxPrice: number;
  potentialGainPercent: number; // Positive % potential gain from lowest baseline to peak maximum: ((High - Base) / Base) * 100
  maxGainPercent: number;       // Alias kept in sync with potentialGainPercent
  maxDropPercent: number;       // Negative % drop from peak baseline to lowest trough: ((Low - Base) / Base) * 100
  changePercent: number;        // Net period change %
  drawdownFromHighPercent: number;
}

export function calcSafePercentage(target: number, base: number): number {
  if (!Number.isFinite(target) || !Number.isFinite(base) || base <= 0) {
    return 0;
  }
  const pct = ((target - base) / base) * 100;
  return Number.isFinite(pct) ? Number(pct.toFixed(2)) : 0;
}

export function computeTimeframeRangeMetric(
  interval: '1h' | '24h' | '1w' | '1m',
  label: string,
  currentPrice: number,
  rawOpenPrice: number,
  rawMinPrice: number,
  rawMaxPrice: number
): TimeframeRangeMetric {
  const safeCurrent = Number.isFinite(currentPrice) && currentPrice > 0 ? currentPrice : 0;
  const safeOpen = Number.isFinite(rawOpenPrice) && rawOpenPrice > 0 ? rawOpenPrice : safeCurrent;
  const hasValidBounds =
    Number.isFinite(rawMinPrice) &&
    rawMinPrice > 0 &&
    Number.isFinite(rawMaxPrice) &&
    rawMaxPrice > 0;

  const candidates = hasValidBounds
    ? [rawMinPrice, rawMaxPrice]
    : [safeCurrent, safeOpen, rawMinPrice, rawMaxPrice].filter((v) => Number.isFinite(v) && v > 0);

  if (candidates.length === 0) {
    return {
      interval,
      label,
      basePrice: 0,
      minPrice: 0,
      maxPrice: 0,
      potentialGainPercent: 0,
      maxGainPercent: 0,
      maxDropPercent: 0,
      changePercent: 0,
      drawdownFromHighPercent: 0
    };
  }

  const minPrice = Math.min(...candidates);
  const maxPrice = Math.max(...candidates);
  const basePrice = safeOpen > 0 ? safeOpen : minPrice;

  // Potential Gain %: Calculated from the lowest baseline (minPrice) to the peak maximum (maxPrice): ((High - Base) / Base) * 100
  const potentialGainPercent = Math.max(0, calcSafePercentage(maxPrice, minPrice));

  // Max Drop / Drawdown %: Calculated from the peak baseline (maxPrice) to the lowest trough (minPrice): ((Low - Base) / Base) * 100
  const maxDropPercent = Math.min(0, calcSafePercentage(minPrice, maxPrice));

  const changePercent = calcSafePercentage(safeCurrent > 0 ? safeCurrent : basePrice, basePrice);
  const drawdownFromHighPercent = Math.min(0, calcSafePercentage(safeCurrent > 0 ? safeCurrent : maxPrice, maxPrice));

  return {
    interval,
    label,
    basePrice,
    minPrice,
    maxPrice,
    potentialGainPercent,
    maxGainPercent: potentialGainPercent,
    maxDropPercent,
    changePercent,
    drawdownFromHighPercent
  };
}

export interface RiskMetrics {
  symbol: string;        // e.g. 'BTCUSDT'
  baseAsset: string;     // e.g. 'BTC'
  quoteAsset: string;    // e.g. 'USDT'
  currentPrice: number;
  priceChange1m: number;
  priceChange5m: number;
  priceChange1h: number;
  priceChange24h?: number;
  priceChange1w: number;
  priceChange1M: number;
  recentDropPercent: number; // Pullback / drawdown % from rolling window peak (<= 0)
  rollingHighPrice: number;  // Rolling window peak price reference
  timeframeMatrix?: Record<'1h' | '24h' | '1w' | '1m', TimeframeRangeMetric> | Record<'24h' | '1w' | '1m', TimeframeRangeMetric>;
  
  // Rule 1: Sell Volume Acceleration
  sellVolume1m: number;
  buyVolume1m: number;
  sellVolume5m: number;
  buyVolume5m: number;
  sellVolumeRatio: number; // 0.0 - 1.0
  sellVolumeZScore: number;

  // Rule 2: Order Book Breakdown
  nearestBuyWallPrice: number;
  nearestBuyWallBtc: number;
  originalWallBtc: number;
  wallChewThroughPercent: number; // 0 - 100%
  bidDepthPressureRatio: number; // bids / (bids + asks)
  buyWallVanished: boolean;

  // Rule 3: Liquidation Cascade
  longLiquidations1m: number; // USD
  longLiquidationCount1m: number;
  liquidationSpikeDetected: boolean;

  // Composite Risk Index (0 - 100)
  riskIndex: number;
  riskStatus: 'NORMAL' | 'ELEVATED' | 'HIGH_RISK' | 'FLASH_CRASH_WARNING';
  buyEligible?: boolean;
  isBuyLocked?: boolean;
  lastUpdated: number;
}

import type { AlarmSoundType } from './utils/audioAlerts';
export type { AlarmSoundType };

export interface AlertTriggerConfig {
  symbol: string; // e.g. 'BTCUSDT'
  baseAsset: string; // e.g. 'BTC'
  quoteAsset: string; // e.g. 'USDT'
  slidingWindowSeconds: number; // e.g. 300 (5 mins)
  sellVolumeZScoreThreshold: number; // e.g. 2.5
  sellVolumeRatioThreshold: number; // e.g. 0.70 (70% sells)
  minBuyWallBtc: number; // e.g. 80 BTC / 500 ETH / etc.
  wallChewThresholdPercent: number; // e.g. 75%
  longLiquidationSpikeUsd: number; // e.g. 500,000 USD
  riskIndexAlertThreshold: number; // e.g. 75
  webhookUrl: string;
  telegramBotToken: string;
  telegramChatId: string;
  soundAlertsEnabled: boolean;
  alarmSoundType?: AlarmSoundType;
}

export interface RiskAlert {
  id: string;
  timestamp: number;
  level: 'INFO' | 'WARNING' | 'CRITICAL' | 'FLASH_CRASH';
  rule: 'SELL_ACCELERATION' | 'WALL_BREAKDOWN' | 'LIQUIDATION_CASCADE' | 'COMPOSITE_INDEX';
  title: string;
  message: string;
  metricsSnapshot: {
    price: number;
    value: string;
    threshold: string;
  };
  payloadJson: Record<string, any>;
  telegramMarkdown: string;
  sentToWebhook: boolean;
}

export interface NewsChannel {
  id: string;
  name: string;
  feedUrl: string;
  category: 'News' | 'Alerts' | 'On-Chain' | 'Macro' | 'Custom';
  isDefault: boolean;
  isActive: boolean;
  lastUpdated?: number;
  itemCount?: number;
  icon?: string;
}

export interface NewsArticle {
  id: string;
  channelId: string;
  channelName: string;
  category: string;
  title: string;
  link: string;
  pubDate: number;
  summary: string;
  author?: string;
  sentiment?: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'HIGH_IMPACT';
  relatedCrypto?: string;
}

export type ActiveTab = 'dashboard' | 'vwap-scanner' | 'buy-signals' | 'sell-signals' | 'heatmap' | 'ai-manager' | 'config' | 'alerts-log' | 'pricing';

export type VwapTimeframe = '15m' | '1h' | '4h' | '1d' | '1w' | '1m';

export interface TimeframeTrendMetrics {
  timeframe: VwapTimeframe;
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  ema9: number;
  ema21: number;
  vwap: number;
  isAboveVwap: boolean;
  distanceToVwapPercent: number;
  emaSpreadPercent: number;
  crossoverStatus: 'BULLISH_CROSS' | 'BEARISH_CROSS' | 'SUSTAINED_UPTREND' | 'SUSTAINED_DOWNTREND' | 'CHOP_CONSOLIDATION';
}

export interface MultiTimeframeConfluence {
  intraday: TimeframeTrendMetrics;
  weekly: TimeframeTrendMetrics;
  monthly: TimeframeTrendMetrics;
  confluenceScore: number; // 0 - 100
  confluenceRating: 'MACRO_ALIGNED_BULLISH' | 'MACRO_ALIGNED_BEARISH' | 'MODERATE_ALIGNMENT' | 'COUNTER_TREND_WARNING' | 'CHOPPY_MIXED';
  titleEn: string;
  titleEs: string;
  descriptionEn: string;
  descriptionEs: string;
  isMacroAligned: boolean;
  isCounterTrend: boolean;
  alignedCount: number; // 3, 2, or 1
}

export interface VwapEmaSignalItem {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  currentPrice: number;
  timeframe: VwapTimeframe;
  
  // Indicators
  vwap: number;
  distanceToVwapPercent: number; // ((price - vwap) / vwap) * 100
  isAboveVwap: boolean;
  
  ema9: number;
  ema21: number;
  emaSpreadPercent: number; // ((ema9 - ema21) / ema21) * 100
  isEmaBullishCross: boolean; // ema9 >= ema21
  
  // Strategy evaluation
  crossoverStatus: 'BULLISH_CROSS' | 'BEARISH_CROSS' | 'SUSTAINED_UPTREND' | 'SUSTAINED_DOWNTREND' | 'CHOP_CONSOLIDATION';
  signalType: 'BUY' | 'SELL' | 'NEUTRAL';
  signalStrength: 'STRONG_BULLISH' | 'MODERATE_BULLISH' | 'NEUTRAL' | 'MODERATE_BEARISH' | 'STRONG_BEARISH';
  trendScore: number; // 0 - 100
  
  // Levels
  entryZone: {
    min: number;
    max: number;
  };
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  riskRewardRatio: number;
  
  change24h: number;
  timestamp: number;
  rationaleEn: string;
  rationaleEs: string;

  // Multi-Timeframe Alignment (1h/Intraday, 1w Weekly, 1m Monthly)
  multiTimeframe?: MultiTimeframeConfluence;
}

export interface BuySignalItem {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  currentPrice: number;
  change24h: number;
  priceChange1m: number;
  priceChange5m: number;
  opportunityScore: number; // 0 - 100
  signalStrength: 'STRONG_BUY' | 'MODERATE_BUY' | 'ACCUMULATION' | 'NEUTRAL' | 'AVOID';
  
  // 1. MFI (Money Flow Index)
  mfi: number; // 0 - 100
  mfiCondition: 'EXTREME_OVERSOLD' | 'OVERSOLD' | 'NEUTRAL' | 'OVERBOUGHT';
  mfiScoreContribution: number; // e.g. 0 - 30

  // 2. Long Liquidations (Flushing excess leverage)
  longLiquidations1m: number; // in USD
  isCapitulationDetected: boolean;
  liquidationScoreContribution: number; // e.g. 0 - 25

  // 3. Futures Funding Rate
  fundingRate: number; // e.g. -0.015%
  fundingBias: 'NEGATIVE_SHORT_SQUEEZE' | 'NEUTRAL' | 'POSITIVE_LONG_HEAVY';
  fundingScoreContribution: number; // e.g. 0 - 25

  // 4. Order Book & Volume Absorption
  sellVolumeDeceleration: boolean;
  bidAbsorptionRatio: number; // 0.0 - 1.0 (e.g. 0.72)
  sellVolumeZScore: number;
  absorptionScoreContribution: number; // e.g. 0 - 20

  // Trade Execution Levels
  entryZone: {
    min: number;
    max: number;
  };
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  riskRewardRatio: number;

  // Trigger conditions checklist
  triggers: {
    mfiOversold: boolean;
    liquidationFlush: boolean;
    negativeOrNeutralFunding: boolean;
    orderBookAbsorption: boolean;
    reboundMomentum: boolean;
  };

  timestamp: number;
  rationaleEn: string;
  rationaleEs: string;

  // Global Anti-Contradiction & Safety Controls
  buyEligible?: boolean;
  isBuyLocked?: boolean;
  atr?: number;
  rsi?: number;
  riskIndex?: number;
  stopLossPercent?: number;
  takeProfit1Percent?: number;
  takeProfit2Percent?: number;
}

export interface SymbolMarketState {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  currentPrice: number;
  change24h: number;
  priceChange1m: number;
  priceChange5m: number;
  priceChange15m?: number;
  priceChange1h?: number;
  vwap1h?: number;
  ema21_1h?: number;
  mfi: number;
  rsi: number;
  atr: number;
  riskIndex: number;
  riskStatus: 'NORMAL' | 'ELEVATED' | 'HIGH_RISK' | 'FLASH_CRASH_WARNING';
  buyEligible: boolean;
  isBuyLocked: boolean;
  buyerAbsorptionRatio: number;
  sellerVolumeRatio: number;
  sellVolumeZScore?: number;
  volume24hUsd?: number;
  fundingRate: number;
  nearestBuyWallPrice: number;
  nearestBuyWallQty: number;
  updatedAt: number;
}

export interface BreakdownSignalItem {
  id: string;
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  type: 'BREAKDOWN_WARNING';
  signalStrength: 'CRITICAL_DUMP' | 'BREAKDOWN_WARNING';
  currentPrice: number;
  priceChange1h: number;
  priceChange15m: number;
  change24h: number;
  opportunityScore: number;
  riskIndex: number;
  vwap1h: number;
  ema21_1h: number;
  takerBuyRatio: number;
  atr: number;
  brokenSupport: number;
  emergencyExit: number;
  downsideTarget1: number;
  downsideTarget2: number;
  entryZone: {
    min: number;
    max: number;
  };
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  timestamp: number;
  rationaleEn: string;
  rationaleEs: string;
}

export interface WinningSignalLedgerItem {
  id: string;
  symbol: string;
  baseAsset: string;
  type: 'BUY' | 'SELL';
  targetHit: 'TP1' | 'TP2';
  entryPrice: number;
  exitPrice: number;
  profitPct: number;
  dispatchedAt: number;
  hitAt: number;
  timeElapsedMs: number;
}

export interface MarketState {
  timestamp: number;
  globalRiskIndex: number;
  globalRiskStatus: 'NORMAL' | 'ELEVATED' | 'HIGH_RISK' | 'FLASH_CRASH_WARNING';
  isCrashWarningActive: boolean;
  buyEligible: boolean;
  isVolatilityShieldActive: boolean;
  btcRiskIndex: number;
  ethRiskIndex: number;
  activeMetrics: RiskMetrics | null;
  orderBook: OrderBookData;
  symbolsState: Record<string, SymbolMarketState>;
  liquidations: {
    total1mUsd: number;
    long1mUsd: number;
    short1mUsd: number;
    recentEvents: LiquidationEvent[];
  };
  buySignals: BuySignalItem[];
  sellSignals: SellSignalItem[];
  breakdownSignals?: BreakdownSignalItem[];
  allBuyScans: BuySignalItem[];
  allSellScans: SellSignalItem[];
  vwapMatrix: Record<string, VwapEmaSignalItem>;
  monitoredSymbols?: string[];
  trackedSymbols?: string[];
  winningSignalsLedger?: WinningSignalLedgerItem[];
  activeTrackedSignalsCount?: number;
}

export interface SellSignalItem {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  currentPrice: number;
  change24h: number;
  priceChange1m: number;
  priceChange5m: number;
  opportunityScore: number; // 0 - 100 (Sell / Distribution Opportunity Score)
  signalStrength: 'STRONG_SELL' | 'MODERATE_SELL' | 'DISTRIBUTION' | 'NEUTRAL' | 'AVOID';
  
  // 1. MFI (Money Flow Index - Overbought / Exhaustion)
  mfi: number; // 0 - 100
  mfiCondition: 'EXTREME_OVERBOUGHT' | 'OVERBOUGHT' | 'NEUTRAL' | 'OVERSOLD';
  mfiScoreContribution: number; // 0 - 30 pts

  // 2. Short Liquidations (Exhaustion tops & short squeeze climaxes)
  shortLiquidations1m: number; // in USD
  isExhaustionTopDetected: boolean;
  liquidationScoreContribution: number; // 0 - 25 pts

  // 3. Futures Funding Rate (Heavy positive funding = overleveraged longs vulnerable to cascade)
  fundingRate: number; // e.g. +0.035%
  fundingBias: 'HEAVILY_POSITIVE_LONG_HEAVY' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  fundingScoreContribution: number; // 0 - 25 pts

  // 4. Volume Absorption / Resistance (Buy volume fading, massive limit ask walls)
  buyVolumeDeceleration: boolean;
  askResistanceRatio: number; // asks / (bids + asks), e.g. 0.75
  sellVolumeZScore: number;
  resistanceScoreContribution: number; // 0 - 20 pts

  // Precision Short / Take Profit Execution Levels
  entryZone: {
    min: number;
    max: number;
  };
  stopLoss: number; // Invalidation level above resistance
  takeProfit1: number; // Mean-reversion target
  takeProfit2: number; // Deep liquidity pool target
  riskRewardRatio: number;

  // Trigger conditions checklist
  triggers: {
    mfiOverbought: boolean;
    shortLiquidationClimax: boolean;
    elevatedPositiveFunding: boolean;
    askResistanceAbsorption: boolean;
    distributionMomentum: boolean;
  };

  timestamp: number;
  rationaleEn: string;
  rationaleEs: string;
  rsi?: number;
  atr?: number;
  riskIndex?: number;
  stopLossPercent?: number;
  takeProfit1Percent?: number;
  takeProfit2Percent?: number;
}

export type SubscriptionTier = 'free' | 'pro' | 'premium';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  subscription_tier: SubscriptionTier;
  subscription_expires_at?: string | number;
  payment_status?: 'active' | 'inactive' | 'expired';
  created_at: string;
  telegram_chat_id?: string;
  telegram_username?: string;
  telegram_linked_at?: string;
  is_telegram_linked?: boolean;
  tracked_symbols?: string[];
  language_preference?: 'es' | 'en';
}

// ---------------------------------------------------------------------------
// MACRO VOLATILITY SHIELD (INVISIBLE SHIELD)
// ---------------------------------------------------------------------------
export interface MacroVolatilityEvent {
  id: string;
  title: string;
  country: string; // e.g. "US"
  currency: string; // e.g. "USD"
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  scheduledTime: string; // ISO string
  scheduledEpochMs: number;
  windowStartEpochMs: number; // 15 mins before
  windowEndEpochMs: number; // 15 mins after
  description: string;
  category: 'FOMC' | 'CPI' | 'NFP' | 'GDP' | 'PCE' | 'PPI' | 'RATE_DECISION';
}

export interface MacroVolatilityShieldState {
  isActive: boolean;
  reason?: string;
  currentEvent: MacroVolatilityEvent | null;
  minutesRemaining: number;
  windowMinutes: number;
  protectionWindow: {
    preEventMinutes: number;
    postEventMinutes: number;
    start: string;
    end: string;
  };
  upcomingEvents: MacroVolatilityEvent[];
  isSimulated: boolean;
  protectionNoticeEn: string;
  protectionNoticeEs: string;
}

export interface SystemStatusResponse {
  isVolatilityShieldActive: boolean;
  shield: MacroVolatilityShieldState;
  timestamp: string;
}


