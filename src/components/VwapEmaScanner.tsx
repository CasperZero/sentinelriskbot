import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Radio,
  Layers,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Crown,
  Play,
  Settings2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Target,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Sliders,
  Check,
  Plus,
  BrainCircuit,
  Calendar
} from 'lucide-react';
import { VwapEmaSignalItem, VwapTimeframe, RiskMetrics, ActiveTab } from '../types';
import { scanAllVwapEmaMarkets } from '../services/vwapEmaEngine';
import { formatCryptoDisplayPrice } from '../services/livePricesService';
import { SignalRationaleModal } from './SignalRationaleModal';
import { MacroVolatilityShieldBanner } from './MacroVolatilityShieldBanner';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCrypto } from '../context/CryptoContext';
import { useVolatilityShield } from '../context/VolatilityShieldContext';
import { useMarket } from '../context/MarketContext';
import { playVwapSignalChime, getIsGlobalMuted } from '../utils/audioAlerts';
import { TelegramLinkCard } from './TelegramLinkCard';

interface VwapEmaScannerProps {
  currentMetrics: RiskMetrics | null;
  currentSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const VwapEmaScanner: React.FC<VwapEmaScannerProps> = ({
  currentMetrics,
  currentSymbol,
  onSelectSymbol,
  onNavigateTab
}) => {
  const { isPremium, userProfile, user, openSubscriptionModal } = useAuth();
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const { language, t } = useLanguage();
  const isEs = language.startsWith('es');
  const { cryptoList, setIsManageModalOpen } = useCrypto();
  const { isVolatilityShieldActive } = useVolatilityShield();
  const { vwapMatrix } = useMarket();

  const [selectedSymbol, setSelectedSymbol] = useState<string>(currentSymbol || 'BTCUSDT');
  const [timeframe, setTimeframe] = useState<VwapTimeframe>('1h');
  const [filterType, setFilterType] = useState<'ALL' | 'BUY' | 'SELL' | 'CROSSOVER'>('ALL');
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [refreshCountdown, setRefreshCountdown] = useState(10);

  // Audio Alerts State with localStorage persistence
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('vwap_sound_alerts_enabled');
    return saved !== null ? saved === 'true' : true;
  });
  const [soundVolume, setSoundVolume] = useState<number>(() => {
    const saved = localStorage.getItem('vwap_sound_volume');
    return saved ? Number(saved) : 0.2;
  });
  const [isSoundSettingsOpen, setIsSoundSettingsOpen] = useState(false);
  const soundSettingsContainerRef = useRef<HTMLDivElement | null>(null);

  // Telegram dispatch state
  const [telegramDispatchStatus, setTelegramDispatchStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  // Interactive Signal Rationale & Favorability Analyzer Modal state
  const [analyzingSignal, setAnalyzingSignal] = useState<VwapEmaSignalItem | null>(null);

  // Cross alerts tracking to avoid spamming audio
  const lastAlertedSignalsRef = useRef<Map<string, string>>(new Map());

  // Close audio settings popup on outside click
  useEffect(() => {
    if (!isSoundSettingsOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        soundSettingsContainerRef.current &&
        !soundSettingsContainerRef.current.contains(e.target as Node)
      ) {
        setIsSoundSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSoundSettingsOpen]);

  // Sync selected symbol with prop
  useEffect(() => {
    if (currentSymbol) {
      setSelectedSymbol(currentSymbol);
    }
  }, [currentSymbol]);

  // Auto-refresh countdown
  useEffect(() => {
    if (!isAutoRefresh) return;
    const timer = setInterval(() => {
      setRefreshCountdown(prev => {
        if (prev <= 1) return 10;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isAutoRefresh]);

  // Custom timeframe scan state (when timeframe !== '1h'; 1h consumes MarketContext.vwapMatrix directly)
  const [customTimeframeSignals, setCustomTimeframeSignals] = useState<VwapEmaSignalItem[]>([]);
  const [loadingMarket, setLoadingMarket] = useState(false);

  const matrix1hSignals = useMemo(() => {
    const list: VwapEmaSignalItem[] = [];
    for (const preset of cryptoList) {
      const item = vwapMatrix?.[preset.symbol];
      if (item && item.currentPrice > 0) {
        list.push(item);
      }
    }
    return list;
  }, [cryptoList, vwapMatrix]);

  useEffect(() => {
    if (timeframe === '1h') {
      setLoadingMarket(false);
      return;
    }

    let isCancelled = false;
    async function loadScans() {
      setLoadingMarket(true);
      try {
        const idToken = user ? await user.getIdToken() : undefined;
        const results = await scanAllVwapEmaMarkets(timeframe, undefined, cryptoList, {
          userId: user?.uid || userProfile?.uid || 'guest-demo-id',
          subscriptionTier: userProfile?.subscription_tier || (isPremium ? 'premium' : 'free'),
          authToken: idToken
        });
        if (!isCancelled) {
          setCustomTimeframeSignals(results);
        }
      } catch (err) {
        console.warn('Error scanning VWAP markets', err);
      } finally {
        if (!isCancelled) setLoadingMarket(false);
      }
    }

    loadScans();
    return () => {
      isCancelled = true;
    };
  }, [timeframe, refreshCountdown === 10, isPremium, cryptoList]);

  const marketSignals: VwapEmaSignalItem[] = timeframe === '1h' ? matrix1hSignals : customTimeframeSignals;

  // Audio alerts on fresh crossover events for premium users
  useEffect(() => {
    if (!isPremium || getIsGlobalMuted() || !soundAlertsEnabled || isVolatilityShieldActive) return;
    marketSignals.forEach(sig => {
      if (sig.crossoverStatus === 'BULLISH_CROSS' || sig.crossoverStatus === 'BEARISH_CROSS') {
        const prevStatus = lastAlertedSignalsRef.current.get(sig.symbol);
        if (prevStatus !== sig.crossoverStatus) {
          lastAlertedSignalsRef.current.set(sig.symbol, sig.crossoverStatus);
          playVwapSignalChime(sig.crossoverStatus === 'BULLISH_CROSS', soundVolume);
        }
      }
    });
  }, [marketSignals, isPremium, soundAlertsEnabled, soundVolume, isVolatilityShieldActive]);

  // Active deep-dive signal from authentic backend data (null while syncing)
  const activeSignal: VwapEmaSignalItem | null = useMemo(() => {
    const found =
      marketSignals.find(s => s.symbol === selectedSymbol) ||
      (timeframe === '1h' ? vwapMatrix?.[selectedSymbol] : undefined) ||
      null;
    if (!found || found.currentPrice <= 0) return null;
    return found;
  }, [selectedSymbol, marketSignals, timeframe, vwapMatrix]);

  // 75% Rule Noise Reduction: Group/hide lower-scoring assets (<75%) to prevent analysis paralysis
  const [showNoise, setShowNoise] = useState(false);

  const highConfidenceSignals = useMemo(() => {
    return marketSignals.filter(sig => {
      const score = Math.max(sig.trendScore, sig.multiTimeframe?.confluenceScore ?? 0);
      return score >= 75;
    });
  }, [marketSignals]);

  const noiseFilteredCount = marketSignals.length - highConfidenceSignals.length;

  // Filtered market signals list enforcing 75% rule by default
  const filteredSignals = useMemo(() => {
    const baseList = showNoise ? marketSignals : highConfidenceSignals;
    return baseList.filter(sig => {
      if (filterType === 'BUY') return sig.signalType === 'BUY';
      if (filterType === 'SELL') return sig.signalType === 'SELL';
      if (filterType === 'CROSSOVER') {
        return sig.crossoverStatus === 'BULLISH_CROSS' || sig.crossoverStatus === 'BEARISH_CROSS';
      }
      return true;
    });
  }, [marketSignals, highConfidenceSignals, showNoise, filterType]);

  // Open Rationale Modal with strict subscription tier validation
  const handleOpenRationaleModal = (sig: VwapEmaSignalItem) => {
    if (!isPremium && userProfile?.subscription_tier !== 'pro' && userProfile?.subscription_tier !== 'premium') {
      openSubscriptionModal();
      return;
    }
    setAnalyzingSignal(sig);
  };

  // Telegram Alert Dispatch Handler
  const handleDispatchTelegramAlert = async (signalToPush: VwapEmaSignalItem | null = activeSignal) => {
    if (!signalToPush) return;
    if (!isPremium) {
      openSubscriptionModal();
      return;
    }

    if (!userProfile?.telegram_chat_id) {
      setTelegramDispatchStatus({
        loading: false,
        success: false,
        message: t.vwapLinkTelegramErr
      });
      return;
    }

    setTelegramDispatchStatus({ loading: true });

    try {
      const idToken = user ? await user.getIdToken() : undefined;
      const res = await fetch('/api/telegram/dispatch-vwap-signal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify({
          signal: signalToPush,
          chatId: userProfile.telegram_chat_id,
          subscriptionTier: userProfile.subscription_tier,
          userId: userProfile.uid,
          language: isEs ? 'es' : 'en'
        })
      });

      const data = await res.json();
      if (res.ok && data.dispatched) {
        setTelegramDispatchStatus({
          loading: false,
          success: true,
          message: `${t.vwapPushSuccessPrefix} ${signalToPush.symbol} ${t.vwapPushSuccessMiddle} ${userProfile.telegram_chat_id}!`
        });
      } else {
        setTelegramDispatchStatus({
          loading: false,
          success: false,
          message: data.error || t.vwapPushFail
        });
      }
    } catch (e: any) {
      setTelegramDispatchStatus({
        loading: false,
        success: false,
        message: e.message || t.vwapNetworkErr
      });
    }

    setTimeout(() => {
      setTelegramDispatchStatus(prev => ({ ...prev, message: undefined }));
    }, 6000);
  };

  const getCrossoverBadge = (status: VwapEmaSignalItem['crossoverStatus']) => {
    switch (status) {
      case 'BULLISH_CROSS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/40 animate-pulse">
            <ArrowUpRight className="w-3.5 h-3.5" />
            {t.vwapCrossBullish}
          </span>
        );
      case 'BEARISH_CROSS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#F6465D]/15 text-[#F6465D] border border-[#F6465D]/40 animate-pulse">
            <ArrowDownRight className="w-3.5 h-3.5" />
            {t.vwapCrossBearish}
          </span>
        );
      case 'SUSTAINED_UPTREND':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#0ECB81]/10 text-[#0ECB81] border border-[#0ECB81]/20">
            <TrendingUp className="w-3.5 h-3.5" />
            {t.vwapSustainedUptrend}
          </span>
        );
      case 'SUSTAINED_DOWNTREND':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#F6465D]/10 text-[#F6465D] border border-[#F6465D]/20">
            <TrendingDown className="w-3.5 h-3.5" />
            {t.vwapSustainedDowntrend}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-[#2B2F36] text-[#848E9C]">
            <Activity className="w-3.5 h-3.5" />
            {t.vwapConsolidation}
          </span>
        );
    }
  };

  const getSignalStrengthColor = (strength: VwapEmaSignalItem['signalStrength']) => {
    switch (strength) {
      case 'STRONG_BULLISH':
        return 'text-[#0ECB81] border-[#0ECB81]/40 bg-[#0ECB81]/10';
      case 'MODERATE_BULLISH':
        return 'text-[#0ECB81] border-[#0ECB81]/20 bg-[#0ECB81]/5';
      case 'STRONG_BEARISH':
        return 'text-[#F6465D] border-[#F6465D]/40 bg-[#F6465D]/10';
      case 'MODERATE_BEARISH':
        return 'text-[#F6465D] border-[#F6465D]/20 bg-[#F6465D]/5';
      default:
        return 'text-[#848E9C] border-[#2B2F36] bg-[#181A20]';
    }
  };

  return (
    <div className="space-y-6 font-mono text-[#EAECEF]">
      
      {/* Top Banner Header */}
      <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30 tracking-wider">
              {t.hftEngine}
            </span>
            {isVolatilityShieldActive && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse flex items-center gap-1">
                <span>🛡️</span>
                <span>{t.shieldActiveBadge}</span>
              </span>
            )}
            <span className="text-xs text-[#848E9C]">VWAP & EMA 9/21</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#EAECEF]">
            {t.vwapScannerTitle}
          </h2>
          <p className="text-xs text-[#848E9C] mt-1 max-w-2xl">
            {t.vwapScannerSubtitle}
          </p>
        </div>

        {/* Global Controls: Timeframe, Audio Alerts & Refresh */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Timeframe Selector with 1W and 1M Multi-Timeframe Horizons */}
          <div className="flex items-center bg-[#121418] border border-[#2B2F36] rounded-lg p-0.5">
            {(['15m', '1h', '4h', '1d', '1w', '1m'] as VwapTimeframe[]).map(tf => {
              const label = tf === '1w' ? t.vwapWeeklyLabel : tf === '1m' ? t.vwapMonthlyLabel : tf;
              const title = tf === '1w' ? t.vwapWeeklyTooltip : tf === '1m' ? t.vwapMonthlyTooltip : tf;
              return (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  title={title}
                  className={`px-2.5 py-1 text-xs font-semibold rounded transition ${
                    timeframe === tf
                      ? 'bg-[#F0B90B] text-slate-950 font-bold'
                      : 'text-[#848E9C] hover:text-[#EAECEF]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Audio Alert Toggle with Settings Menu */}
          <div className="relative" ref={soundSettingsContainerRef}>
            <div className="flex items-center bg-[#121418] border border-[#2B2F36] rounded-lg overflow-hidden">
              <button
                onClick={() => {
                  const nextState = !soundAlertsEnabled;
                  setSoundAlertsEnabled(nextState);
                  localStorage.setItem('vwap_sound_alerts_enabled', String(nextState));
                  if (nextState) {
                    playVwapSignalChime(true, soundVolume);
                  }
                }}
                className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition ${
                  soundAlertsEnabled
                    ? 'text-[#0ECB81] hover:bg-[#0ECB81]/10'
                    : 'text-[#848E9C] hover:text-[#EAECEF]'
                }`}
                title={soundAlertsEnabled ? t.enableAudioAlertsTitle : t.muteAudioAlertsTitle}
              >
                {soundAlertsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">
                  {soundAlertsEnabled ? t.vwapAudioActive : t.vwapMuted}
                </span>
              </button>

              <button
                onClick={() => setIsSoundSettingsOpen(!isSoundSettingsOpen)}
                className="px-2 py-1.5 border-l border-[#2B2F36] text-[#848E9C] hover:text-[#EAECEF] transition"
                title={t.vwapAudioSettings}
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Audio Settings Dropdown */}
            {isSoundSettingsOpen && (
              <div className="fixed top-28 left-4 right-4 sm:absolute sm:top-full sm:left-auto sm:right-0 sm:mt-2 sm:w-72 z-50 max-h-[75vh] overflow-y-auto bg-[#181A20] border border-[#2B2F36] rounded-xl shadow-2xl p-4 text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#2B2F36]">
                  <span className="font-bold text-[#EAECEF]">{t.vwapAudioSettings}</span>
                  <button
                    onClick={() => playVwapSignalChime(true, soundVolume)}
                    className="text-[10px] text-[#F0B90B] hover:underline flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" /> {t.vwapTestSoundShort}
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-[#848E9C] mb-1">
                    <span>{t.vwapAlertVolume}</span>
                    <span>{Math.round(soundVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.5"
                    step="0.05"
                    value={soundVolume}
                    onChange={e => {
                      const v = Number(e.target.value);
                      setSoundVolume(v);
                      localStorage.setItem('vwap_sound_volume', String(v));
                    }}
                    className="w-full accent-[#F0B90B]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Auto Refresh Indicator */}
          <button
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className={`px-3 py-1.5 text-xs rounded-lg border font-mono flex items-center gap-1.5 transition ${
              isAutoRefresh
                ? 'bg-[#121418] border-[#2B2F36] text-[#848E9C] hover:text-[#EAECEF]'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isAutoRefresh ? 'text-[#0ECB81] animate-pulse' : 'text-red-400'}`} />
            <span>{isAutoRefresh ? `${refreshCountdown}s` : t.vwapPausedBadge}</span>
          </button>

        </div>
      </div>

      {/* Telegram Status Toast Message */}
      {telegramDispatchStatus.message && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
            telegramDispatchStatus.success
              ? 'bg-[#0ECB81]/10 border-[#0ECB81]/30 text-[#0ECB81]'
              : 'bg-[#F6465D]/10 border-[#F6465D]/30 text-[#F6465D]'
          }`}
        >
          <div className="flex items-center gap-2">
            {telegramDispatchStatus.success ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{telegramDispatchStatus.message}</span>
          </div>
        </div>
      )}

      {/* Main Grid: Active Deep Dive on Left (7 cols), Market Overview on Right (5 cols) or Volatility Shield */}
      {isVolatilityShieldActive ? (
        <MacroVolatilityShieldBanner scannerType="VWAP" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: ACTIVE ASSET DEEP-DIVE STRATEGY VIEW */}
        <div className="lg:col-span-7 space-y-6">

          {/* Active Asset Strategy Card */}
          {!activeSignal ? (
            <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl p-10 text-center space-y-3 animate-pulse">
              <div className="w-10 h-10 mx-auto rounded-full bg-[#2B2F36] flex items-center justify-center text-[#F0B90B]">
                <Activity className="w-5 h-5 animate-spin" />
              </div>
              <h3 className="text-sm font-bold text-[#EAECEF]">
                {t.vwapSyncingTitlePrefix} {selectedSymbol} [{timeframe}]...
              </h3>
              <p className="text-xs text-[#848E9C]">
                {t.vwapSyncingDesc}
              </p>
            </div>
          ) : (
          <>
          <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl p-5 shadow-lg">
            
            {/* Header: Asset, Price, Trend Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#2B2F36]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-[#EAECEF]">{activeSignal.symbol}</span>
                  <span className="text-xs text-[#848E9C]">[{timeframe}]</span>
                  {getCrossoverBadge(activeSignal.crossoverStatus)}
                </div>
                <div className="text-2xl font-black tracking-tight text-[#EAECEF] mt-1">
                  {formatCryptoDisplayPrice(activeSignal.currentPrice)}
                  <span
                    className={`ml-2 text-xs font-semibold ${
                      activeSignal.change24h >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                    }`}
                  >
                    {activeSignal.change24h >= 0 ? `+${activeSignal.change24h}%` : `${activeSignal.change24h}%`}
                  </span>
                </div>
              </div>

              {/* Trend Strength Meter & Analyzer Action */}
              <div className="flex flex-col items-end gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenRationaleModal(activeSignal)}
                  className="px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider border border-[#F0B90B]/40 bg-[#F0B90B]/15 hover:bg-[#F0B90B] text-[#F0B90B] hover:text-slate-950 transition flex items-center gap-1.5 shadow active:scale-95"
                  title={t.vwapAnalyzeConfluenceBtn}
                >
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>{t.whyThisAlertBtn}</span>
                </button>
                <div className="text-right">
                  <div className="text-[10px] text-[#848E9C] uppercase">{t.vwapTrendScoreLabel}</div>
                  <div className="flex items-center gap-2 justify-end">
                    <div className="text-2xl font-extrabold text-[#F0B90B]">{activeSignal.trendScore}</div>
                    <div className="text-[11px] text-[#848E9C]">/ 100</div>
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getSignalStrengthColor(activeSignal.signalStrength)}`}>
                    {activeSignal.signalStrength}
                  </span>
                </div>
              </div>
            </div>

            {/* Plain-Language 1-Sentence Verdict Banner */}
            <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#F0B90B] flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-[#EAECEF] font-medium leading-relaxed">
                {isEs ? activeSignal.rationaleEs : activeSignal.rationaleEn}
              </p>
            </div>

            {/* Algorithmic Execution Levels (ATR-Based) */}
            <div className="bg-[#121418] border border-[#2B2F36] rounded-xl p-4 space-y-3 mt-4">
              <div className="flex items-center justify-between text-xs font-bold text-[#EAECEF]">
                <span className="flex items-center gap-1.5 text-[#F0B90B]">
                  <Target className="w-3.5 h-3.5" />
                  {t.vwapExecutionTargets || 'Algorithmic Execution Targets (ATR)'}
                </span>
                <span className="text-[#848E9C] text-[11px]">
                  {t.riskRewardLabel || 'R:R'}: <strong className="text-[#0ECB81]">1 : {activeSignal.riskRewardRatio}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {/* Entry Zone */}
                <div className="p-2.5 rounded-lg bg-[#181A20] border border-[#2B2F36]">
                  <div className="text-[10px] text-[#848E9C] uppercase">{t.entryZoneLabel || 'Entry Zone'}</div>
                  <div className="font-bold text-[#EAECEF] mt-0.5">
                    {formatCryptoDisplayPrice(activeSignal.entryZone.min)} - {formatCryptoDisplayPrice(activeSignal.entryZone.max)}
                  </div>
                </div>

                {/* Invalidation Stop Loss */}
                <div className="p-2.5 rounded-lg bg-[#181A20] border border-[#F6465D]/30">
                  <div className="text-[10px] text-[#F6465D] uppercase">{t.stopLossLabel || 'Stop Loss'}</div>
                  <div className="font-bold text-[#F6465D] mt-0.5">
                    {formatCryptoDisplayPrice(activeSignal.stopLoss)}
                  </div>
                </div>

                {/* Target 1 */}
                <div className="p-2.5 rounded-lg bg-[#181A20] border border-[#0ECB81]/30">
                  <div className="text-[10px] text-[#0ECB81] uppercase">{t.takeProfit1Label || 'Target 1'}</div>
                  <div className="font-bold text-[#0ECB81] mt-0.5">
                    {formatCryptoDisplayPrice(activeSignal.takeProfit1)}
                  </div>
                </div>

                {/* Target 2 */}
                <div className="p-2.5 rounded-lg bg-[#181A20] border border-[#0ECB81]/30">
                  <div className="text-[10px] text-[#0ECB81] uppercase">{t.takeProfit2Label || 'Target 2'}</div>
                  <div className="font-bold text-[#0ECB81] mt-0.5">
                    {formatCryptoDisplayPrice(activeSignal.takeProfit2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Multi-Timeframe Confluence Panel (Intraday • 1W Weekly • 1M Monthly) */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-[#121418] to-[#181A20] border border-[#2B2F36] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#F0B90B]" />
                  <span className="font-extrabold text-xs text-[#EAECEF] uppercase tracking-wider">
                    {t.vwapMultiTfTitle}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    activeSignal.multiTimeframe?.isMacroAligned
                      ? 'bg-[#0ECB81]/20 text-[#0ECB81] border-[#0ECB81]/40'
                      : activeSignal.multiTimeframe?.isCounterTrend
                      ? 'bg-[#F6465D]/20 text-[#F6465D] border-[#F6465D]/40'
                      : 'bg-[#F0B90B]/20 text-[#F0B90B] border-[#F0B90B]/40'
                  }`}>
                    {activeSignal.multiTimeframe?.confluenceRating.replace(/_/g, ' ') || (loadingMarket ? t.vwapScanningBadge : t.vwapAnalyzingBadge)}
                  </span>
                </div>
              </div>

              {/* 3 Horizon Snapshot Cards or Skeleton Loader */}
              {loadingMarket || !activeSignal.multiTimeframe ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs animate-pulse">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-2.5 rounded-lg bg-[#0B0E11] border border-[#2B2F36] space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="h-3.5 w-20 bg-[#2B2F36] rounded" />
                        <div className="h-3.5 w-12 bg-[#2B2F36] rounded" />
                      </div>
                      <div className="h-3 w-full bg-[#181A20] rounded mt-2" />
                      <div className="h-3 w-3/4 bg-[#181A20] rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  {/* 1. Intraday */}
                  <div className="p-2.5 rounded-lg bg-[#0B0E11] border border-[#2B2F36]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#848E9C] uppercase font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {`${t.vwapIntradayLabel} (${activeSignal.multiTimeframe.intraday.timeframe || activeSignal.timeframe || timeframe})`}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        activeSignal.multiTimeframe.intraday.trend === 'BULLISH'
                          ? 'text-[#0ECB81] bg-[#0ECB81]/15'
                          : activeSignal.multiTimeframe.intraday.trend === 'BEARISH'
                          ? 'text-[#F6465D] bg-[#F6465D]/15'
                          : 'text-[#848E9C] bg-[#2B2F36]'
                      }`}>
                        {activeSignal.multiTimeframe.intraday.trend === 'BULLISH' ? t.vwapBullTag : activeSignal.multiTimeframe.intraday.trend === 'BEARISH' ? t.vwapBearTag : t.vwapChopTag}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#EAECEF] mt-1.5 flex justify-between">
                      <span className="text-[#848E9C]">VWAP:</span>
                      <strong className={activeSignal.multiTimeframe.intraday.isAboveVwap ? 'text-[#0ECB81]' : 'text-[#F6465D]'}>
                        {formatCryptoDisplayPrice(activeSignal.multiTimeframe.intraday.vwap)}
                        {' '}
                        <span className="text-[10px]">
                          ({activeSignal.multiTimeframe.intraday.distanceToVwapPercent >= 0 ? '+' : ''}{activeSignal.multiTimeframe.intraday.distanceToVwapPercent.toFixed(2)}%)
                        </span>
                      </strong>
                    </div>
                    <div className="text-[11px] font-mono text-[#EAECEF] mt-1 flex justify-between">
                      <span className="text-[#848E9C]">EMA Spread:</span>
                      <strong className={activeSignal.multiTimeframe.intraday.emaSpreadPercent >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}>
                        {activeSignal.multiTimeframe.intraday.emaSpreadPercent >= 0 ? '+' : ''}{activeSignal.multiTimeframe.intraday.emaSpreadPercent.toFixed(2)}%
                      </strong>
                    </div>
                  </div>

                  {/* 2. Weekly (1W) */}
                  <div className="p-2.5 rounded-lg bg-[#0B0E11] border border-[#2B2F36]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#848E9C] uppercase font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-blue-400" />
                        {t.vwapWeeklyCardLabel}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        activeSignal.multiTimeframe.weekly.trend === 'BULLISH'
                          ? 'text-[#0ECB81] bg-[#0ECB81]/15'
                          : activeSignal.multiTimeframe.weekly.trend === 'BEARISH'
                          ? 'text-[#F6465D] bg-[#F6465D]/15'
                          : 'text-[#848E9C] bg-[#2B2F36]'
                      }`}>
                        {activeSignal.multiTimeframe.weekly.trend === 'BULLISH' ? t.vwapBullTag : activeSignal.multiTimeframe.weekly.trend === 'BEARISH' ? t.vwapBearTag : t.vwapChopTag}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#EAECEF] mt-1.5 flex justify-between">
                      <span className="text-[#848E9C]">1W VWAP:</span>
                      <strong className="text-[#EAECEF]">
                        {formatCryptoDisplayPrice(activeSignal.multiTimeframe.weekly.vwap)}
                      </strong>
                    </div>
                    <div className="text-[11px] font-mono text-[#EAECEF] mt-1 flex justify-between">
                      <span className="text-[#848E9C]">EMA Spread:</span>
                      <strong className={activeSignal.multiTimeframe.weekly.emaSpreadPercent >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}>
                        {activeSignal.multiTimeframe.weekly.emaSpreadPercent >= 0 ? '+' : ''}{activeSignal.multiTimeframe.weekly.emaSpreadPercent.toFixed(2)}%
                      </strong>
                    </div>
                  </div>

                  {/* 3. Monthly (1M) */}
                  <div className="p-2.5 rounded-lg bg-[#0B0E11] border border-[#2B2F36]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#848E9C] uppercase font-mono flex items-center gap-1">
                        <Layers className="w-3 h-3 text-purple-400" />
                        {t.vwapMonthlyCardLabel}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        activeSignal.multiTimeframe.monthly.trend === 'BULLISH'
                          ? 'text-[#0ECB81] bg-[#0ECB81]/15'
                          : activeSignal.multiTimeframe.monthly.trend === 'BEARISH'
                          ? 'text-[#F6465D] bg-[#F6465D]/15'
                          : 'text-[#848E9C] bg-[#2B2F36]'
                      }`}>
                        {activeSignal.multiTimeframe.monthly.trend === 'BULLISH' ? t.vwapBullTag : activeSignal.multiTimeframe.monthly.trend === 'BEARISH' ? t.vwapBearTag : t.vwapChopTag}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#EAECEF] mt-1.5 flex justify-between">
                      <span className="text-[#848E9C]">1M VWAP:</span>
                      <strong className="text-[#EAECEF]">
                        {formatCryptoDisplayPrice(activeSignal.multiTimeframe.monthly.vwap)}
                      </strong>
                    </div>
                    <div className="text-[11px] font-mono text-[#EAECEF] mt-1 flex justify-between">
                      <span className="text-[#848E9C]">{t.vwapMacroBiasLabel}</span>
                      <strong className="text-[#EAECEF]">
                        {activeSignal.multiTimeframe.monthly.trend === 'BULLISH' ? t.vwapMacroBull : t.vwapMacroBear}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Prominent High-Conversion Telegram 24/7 Button */}
            <div className="mt-5 pt-4 border-t border-[#2B2F36]">
              <button
                type="button"
                onClick={() => {
                  if (onNavigateTab) {
                    onNavigateTab('config');
                  } else {
                    handleDispatchTelegramAlert();
                  }
                }}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#0088cc] via-[#0099ee] to-[#F0B90B] hover:brightness-110 active:scale-[0.99] text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <Send className="w-5 h-5 text-slate-950" />
                <span>{t.receiveTelegram247Btn}</span>
              </button>
            </div>

          </div>

          {/* SECONDARY VIEW: Collapsible Technical Algorithm Details (Hidden by Default) */}
          <div className="bg-[#181A20] border border-[#2B2F36] rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full flex items-center justify-between p-4 bg-[#1E2329] hover:bg-[#252a32] text-xs font-mono font-bold text-[#848E9C] hover:text-[#EAECEF] transition select-none cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#F0B90B]" />
                <span>{t.viewTechDetailsBtn}</span>
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-[#F0B90B]">
                <span>{showTechnicalDetails ? t.hideLabel : t.showLabel}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showTechnicalDetails ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {showTechnicalDetails && (
              <div className="p-5 border-t border-[#2B2F36] space-y-4 animate-in fade-in duration-200">
                {/* 4 Quantitative Strategy Pillars */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Pillar 1: VWAP Anchor */}
                  <div className="bg-[#121418] border border-[#2B2F36] rounded-xl p-3">
                    <div className="text-[10px] text-[#848E9C] uppercase tracking-wider mb-1">
                      {t.vwapPillarVwap || 'VWAP Anchor'}
                    </div>
                    <div className="text-sm font-bold text-[#EAECEF]">
                      {formatCryptoDisplayPrice(activeSignal.vwap)}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] mt-1">
                      <span className="text-[#848E9C]">{t.vwapDevLabel}</span>
                      <span className={`font-semibold ${activeSignal.isAboveVwap ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                        {activeSignal.distanceToVwapPercent >= 0 ? `+${activeSignal.distanceToVwapPercent}%` : `${activeSignal.distanceToVwapPercent}%`}
                      </span>
                    </div>
                  </div>

                  {/* Pillar 2: Fast EMA (9) */}
                  <div className="bg-[#121418] border border-[#2B2F36] rounded-xl p-3">
                    <div className="text-[10px] text-[#848E9C] uppercase tracking-wider mb-1">
                      {t.vwapEma9Fast}
                    </div>
                    <div className="text-sm font-bold text-amber-400">
                      {formatCryptoDisplayPrice(activeSignal.ema9)}
                    </div>
                    <div className="text-[11px] text-[#848E9C] mt-1">
                      {activeSignal.isEmaBullishCross ? (
                        <span className="text-[#0ECB81] font-semibold">{t.vwapGtEma21Bull}</span>
                      ) : (
                        <span className="text-[#F6465D] font-semibold">{t.vwapLtEma21Bear}</span>
                      )}
                    </div>
                  </div>

                  {/* Pillar 3: Slow EMA (21) */}
                  <div className="bg-[#121418] border border-[#2B2F36] rounded-xl p-3">
                    <div className="text-[10px] text-[#848E9C] uppercase tracking-wider mb-1">
                      {t.vwapEma21Slow}
                    </div>
                    <div className="text-sm font-bold text-cyan-400">
                      {formatCryptoDisplayPrice(activeSignal.ema21)}
                    </div>
                    <div className="text-[11px] text-[#848E9C] mt-1">
                      {t.vwapDynamicBenchmark}
                    </div>
                  </div>

                  {/* Pillar 4: EMA Spread */}
                  <div className="bg-[#121418] border border-[#2B2F36] rounded-xl p-3">
                    <div className="text-[10px] text-[#848E9C] uppercase tracking-wider mb-1">
                      {t.vwapPillarSpread || 'EMA Spread'}
                    </div>
                    <div className={`text-sm font-bold ${activeSignal.emaSpreadPercent >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                      {activeSignal.emaSpreadPercent >= 0 ? `+${activeSignal.emaSpreadPercent}%` : `${activeSignal.emaSpreadPercent}%`}
                    </div>
                    <div className="text-[11px] text-[#848E9C] mt-1">
                      {Math.abs(activeSignal.emaSpreadPercent) > 0.5 ? (
                        <span className="text-yellow-400 font-semibold">{t.vwapStrongExpansion}</span>
                      ) : (
                        <span>{t.vwapCompressed}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantitative Trend Thesis Rationale & Analyzer */}
                <div className="p-3.5 bg-[#121418] border border-[#2B2F36] rounded-xl text-xs space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-[#F0B90B] uppercase tracking-wider block">
                      {t.vwapQuantThesis || 'Quantitative Trend Rationale'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenRationaleModal(activeSignal)}
                      className="px-2.5 py-1 rounded-lg bg-[#F0B90B]/15 hover:bg-[#F0B90B] text-[#F0B90B] hover:text-slate-950 border border-[#F0B90B]/40 font-mono font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <BrainCircuit className="w-3.5 h-3.5" />
                      <span>{t.vwapAnalyzeConfluenceBtn}</span>
                    </button>
                  </div>
                  <p className="text-[#848E9C] leading-relaxed">
                    {isEs ? activeSignal.rationaleEs : activeSignal.rationaleEn}
                  </p>
                </div>
              </div>
            )}
          </div>
          </>
          )}

          {/* Telegram Link Card for fast onboarding */}
          <TelegramLinkCard />

        </div>

        {/* RIGHT COLUMN: CROSS-MARKET SCANNER TABLE (12 CRYPTOS) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl p-5 shadow-lg">
            
            {/* Header with Filters & 75% Rule Noise Indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#2B2F36]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[#EAECEF]">
                    {`${t.vwapRadarTitle} (${filteredSignals.length} ${t.vwapPairsUnit})`}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30">
                    {t.rule75Badge}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#848E9C] mt-0.5">
                  <span>{`${t.vwapTimeframePrefix} ${timeframe} • ${t.vwapLiveStreamedSuffix}`}</span>
                  {noiseFilteredCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNoise(!showNoise)}
                      className={`px-1.5 py-0.2 rounded border transition ${
                        showNoise
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-[#121418] text-[#848E9C] border-[#2B2F36] hover:text-[#EAECEF]'
                      }`}
                      title={showNoise ? t.hideNoiseTooltip : t.showNoiseTooltip}
                    >
                      {showNoise
                        ? `${t.hidingNoiseLabel} (-${noiseFilteredCount})`
                        : `+${noiseFilteredCount} ${t.filteredSuffix} (<75%)`}
                    </button>
                  )}
                </div>
              </div>

              {/* Action & Filter Tabs */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsManageModalOpen(true)}
                  className="p-1 rounded bg-[#121418] hover:bg-[#2B2F36] border border-[#2B2F36] text-[10px] text-[#F0B90B] flex items-center gap-0.5 transition"
                  title={t.vwapManageTooltip}
                >
                  <Plus className="w-3 h-3" />
                  <span>{t.manageCryptosShort}</span>
                </button>

                <div className="flex items-center bg-[#121418] border border-[#2B2F36] rounded-lg p-0.5 text-[10px]">
                  {(['ALL', 'BUY', 'SELL', 'CROSSOVER'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilterType(f)}
                      className={`px-2 py-0.5 rounded font-bold transition ${
                        filterType === f
                          ? 'bg-[#F0B90B] text-slate-950'
                          : 'text-[#848E9C] hover:text-[#EAECEF]'
                      }`}
                    >
                      {f === 'ALL'
                        ? `${t.sellFilterAll} (${filteredSignals.length})`
                        : f === 'BUY'
                        ? t.vwapFilterBuy
                        : f === 'SELL'
                        ? t.vwapFilterSell
                        : t.vwapFilterCross}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* List of Cryptos or Sleek Empty State */}
            {filteredSignals.length > 0 ? (
              <div className="space-y-2 mt-3 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#2B2F36]">
                {filteredSignals.map(sig => {
                  const isSelected = sig.symbol === selectedSymbol;
                  const isBull = sig.signalType === 'BUY';
                  const isBear = sig.signalType === 'SELL';
                  const hasCross = sig.crossoverStatus === 'BULLISH_CROSS' || sig.crossoverStatus === 'BEARISH_CROSS';

                  return (
                    <div
                      key={sig.symbol}
                      onClick={() => {
                        setSelectedSymbol(sig.symbol);
                        onSelectSymbol(sig.symbol);
                      }}
                      className={`p-3 rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#F0B90B]/10 border-[#F0B90B]/40 shadow-md'
                          : 'bg-[#121418] border-[#2B2F36] hover:border-[#848E9C]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        {/* Symbol & Price */}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs text-[#EAECEF]">{sig.symbol}</span>
                            {hasCross && (
                              <span
                                className={`w-2 h-2 rounded-full animate-ping ${
                                  sig.crossoverStatus === 'BULLISH_CROSS' ? 'bg-[#0ECB81]' : 'bg-[#F6465D]'
                                }`}
                              />
                            )}
                          </div>
                          <div className="text-[11px] text-[#848E9C] mt-0.5">
                            <span className="font-bold text-[#EAECEF]">{formatCryptoDisplayPrice(sig.currentPrice)}</span>
                            <span className="mx-1 text-[#2B2F36]">·</span>
                            <span className={sig.isAboveVwap ? 'text-[#0ECB81]' : 'text-[#F6465D]'}>
                              VWAP {sig.distanceToVwapPercent >= 0 ? `+${sig.distanceToVwapPercent}%` : `${sig.distanceToVwapPercent}%`}
                            </span>
                          </div>
                        </div>

                        {/* Crossover & Signal Pill */}
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div
                              className={`text-xs font-bold ${
                                isBull ? 'text-[#0ECB81]' : isBear ? 'text-[#F6465D]' : 'text-[#848E9C]'
                              }`}
                            >
                              {sig.signalType}
                            </div>
                            <div className="text-[10px] text-[#848E9C]">
                              {t.vwapScoreLabel} <strong className="text-[#EAECEF]">{sig.trendScore}</strong>
                            </div>
                          </div>

                          <ChevronRight
                            className={`w-4 h-4 transition ${
                              isSelected ? 'text-[#F0B90B] translate-x-0.5' : 'text-[#848E9C]'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Multi-Timeframe Confluence Micro-Badges (1W & 1M) */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-[#2B2F36]/60 text-[9px] font-mono">
                        <span className={`px-1.5 py-0.5 rounded border font-bold ${
                          sig.multiTimeframe?.weekly.trend === 'BULLISH'
                            ? 'bg-[#0ECB81]/15 text-[#0ECB81] border-[#0ECB81]/30'
                            : sig.multiTimeframe?.weekly.trend === 'BEARISH'
                            ? 'bg-[#F6465D]/15 text-[#F6465D] border-[#F6465D]/30'
                            : 'bg-[#2B2F36] text-[#848E9C] border-transparent'
                        }`}>
                          1W: {sig.multiTimeframe?.weekly.trend === 'BULLISH' ? t.vwapBullTag : sig.multiTimeframe?.weekly.trend === 'BEARISH' ? t.vwapBearTag : t.vwapChopShortTag}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded border font-bold ${
                          sig.multiTimeframe?.monthly.trend === 'BULLISH'
                            ? 'bg-[#0ECB81]/15 text-[#0ECB81] border-[#0ECB81]/30'
                            : sig.multiTimeframe?.monthly.trend === 'BEARISH'
                            ? 'bg-[#F6465D]/15 text-[#F6465D] border-[#F6465D]/30'
                            : 'bg-[#2B2F36] text-[#848E9C] border-transparent'
                        }`}>
                          1M: {sig.multiTimeframe?.monthly.trend === 'BULLISH' ? t.vwapBullTag : sig.multiTimeframe?.monthly.trend === 'BEARISH' ? t.vwapBearTag : t.vwapChopShortTag}
                        </span>
                        {sig.multiTimeframe?.isMacroAligned && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-extrabold text-[8px] uppercase tracking-wider border border-emerald-500/30">
                            {t.vwapMacro33Badge}
                          </span>
                        )}
                        {sig.multiTimeframe?.isCounterTrend && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-extrabold text-[8px] uppercase tracking-wider border border-amber-500/30">
                            {t.vwapCounterBadge}
                          </span>
                        )}
                      </div>

                      {/* Actionable Analysis Button on each active card */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSymbol(sig.symbol);
                          onSelectSymbol(sig.symbol);
                          handleOpenRationaleModal(sig);
                        }}
                        className="mt-2.5 w-full py-1 px-1.5 rounded-lg bg-[#0B0E11] hover:bg-[#F0B90B] text-[#848E9C] hover:text-slate-950 border border-[#2B2F36] hover:border-[#F0B90B] text-[10px] font-mono font-bold transition-all flex items-center justify-center gap-1 group/btn shadow-sm"
                        title={t.vwapAnalyzeConfluenceBtn}
                      >
                        <BrainCircuit className="w-3 h-3 text-[#F0B90B] group-hover/btn:text-slate-950 transition" />
                        <span className="truncate">{t.whyThisAlertBtn}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Sleek Empty State for Noise Reduction */
              <div className="py-10 px-4 rounded-xl bg-[#121418] border border-[#2B2F36] border-dashed text-center flex flex-col items-center justify-center space-y-3 font-mono mt-3">
                <div className="p-3 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/30 text-[#F0B90B]">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#EAECEF] uppercase tracking-wide">
                    {t.scanningHighProbTitle}
                  </h3>
                  <p className="text-xs text-[#848E9C] max-w-sm mx-auto">
                    {`${t.vwapEmptyNoiseDescPrefix} ${noiseFilteredCount} ${t.vwapEmptyNoiseDescSuffix}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowNoise(true)}
                    className="px-3 py-1.5 rounded-lg bg-[#181A20] hover:bg-[#2B2F36] border border-[#2B2F36] text-[11px] text-[#848E9C] hover:text-[#EAECEF] transition"
                  >
                    {`${t.inspectFilteredSetups} (${noiseFilteredCount})`}
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
      )}

      {/* Interactive Signal Rationale & Favorability Analyzer Modal */}
      <SignalRationaleModal
        isOpen={!!analyzingSignal}
        onClose={() => setAnalyzingSignal(null)}
        signalType="VWAP"
        signal={analyzingSignal}
        currentMetrics={currentMetrics}
        onDispatchTelegram={(sig) => handleDispatchTelegramAlert(sig)}
        isDispatchingTelegram={telegramDispatchStatus.loading}
      />

    </div>
  );
};
