import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  TrendingDown,
  Zap,
  Target,
  Send,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Clock,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Percent,
  Compass,
  Sliders,
  DollarSign,
  Activity,
  Check,
  X,
  Volume2,
  VolumeX,
  Volume1,
  Play,
  Settings2,
  Bell,
  Radio,
  Lock,
  Crown,
  Plus,
  BrainCircuit
} from 'lucide-react';
import { SellSignalItem, RiskMetrics, OrderBookData, PRESET_CRYPTOS, ActiveTab } from '../types';
import { formatCryptoDisplayPrice } from '../services/livePricesService';
import { SignalRationaleModal } from './SignalRationaleModal';
import { MacroVolatilityShieldBanner } from './MacroVolatilityShieldBanner';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCrypto } from '../context/CryptoContext';
import { useVolatilityShield } from '../context/VolatilityShieldContext';
import { useMarket } from '../context/MarketContext';
import {
  ALARM_SOUND_OPTIONS,
  playAlarmSound,
  playSellSignalChime,
  AlarmSoundType,
  getIsGlobalMuted
} from '../utils/audioAlerts';

interface SellSignalScannerProps {
  currentMetrics: RiskMetrics | null;
  orderBook: OrderBookData | null;
  currentSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const SellSignalScanner: React.FC<SellSignalScannerProps> = ({
  currentMetrics,
  orderBook,
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
  const {
    allSellScans,
    sellSignals,
    refreshMarketState,
    isLoading: marketLoading,
  } = useMarket();

  const [selectedSymbol, setSelectedSymbol] = useState<string>(currentSymbol || 'BTCUSDT');
  const [filterType, setFilterType] = useState<'ALL' | 'STRONG_SELL' | 'OVERBOUGHT' | 'HIGH_SCORE'>('ALL');
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [refreshCountdown, setRefreshCountdown] = useState(5);
  const [telegramDispatchStatus, setTelegramDispatchStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  // Interactive Signal Rationale & Favorability Analyzer Modal state
  const [analyzingSignal, setAnalyzingSignal] = useState<SellSignalItem | null>(null);

  // Audio Alerts State with localStorage persistence
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('sell_signals_sound_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const [soundThreshold, setSoundThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('sell_signals_sound_threshold');
    return saved ? Number(saved) : 75;
  });

  const [soundType, setSoundType] = useState<string>(() => {
    return localStorage.getItem('sell_signals_sound_type') || 'distribution_chime';
  });

  const [soundVolume, setSoundVolume] = useState<number>(() => {
    const saved = localStorage.getItem('sell_signals_sound_volume');
    return saved ? Number(saved) : 0.2;
  });

  const [isSoundSettingsOpen, setIsSoundSettingsOpen] = useState<boolean>(false);
  const soundSettingsContainerRef = useRef<HTMLDivElement | null>(null);
  const [recentAudioAlert, setRecentAudioAlert] = useState<{
    symbol: string;
    score: number;
    time: number;
  } | null>(null);

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

  // Audio trigger tracking refs to debounce repetition
  const lastAlertedSignalsRef = useRef<Map<string, number>>(new Map());
  const lastGlobalAudioTimeRef = useRef<number>(0);

  // Auto-refresh timer countdown
  useEffect(() => {
    if (!isAutoRefresh) return;
    const interval = setInterval(() => {
      setRefreshCountdown(prev => {
        if (prev <= 1) {
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isAutoRefresh]);

  // Keep selected symbol in sync if user changes from header
  useEffect(() => {
    if (currentSymbol) {
      setSelectedSymbol(currentSymbol);
    }
  }, [currentSymbol]);

  // All scans computed by the backend Single Source of Truth
  const allScans = allSellScans;

  // Current active spotlight signal item from real backend scan (null while syncing — never fabricate placeholder scores)
  const activeSignal: SellSignalItem | null = useMemo(() => {
    const found =
      allScans.find(s => s.symbol === selectedSymbol) ||
      sellSignals.find(s => s.symbol === selectedSymbol) ||
      null;
    if (!found || found.currentPrice <= 0) return null;
    return found;
  }, [selectedSymbol, allScans, sellSignals]);

  // Trigger Sound Alarm automatically when high score signals are detected
  useEffect(() => {
    if (getIsGlobalMuted() || !soundAlertsEnabled || isVolatilityShieldActive) return;

    const now = Date.now();
    // Throttle global audio so it doesn't play more than once every 8 seconds
    if (now - lastGlobalAudioTimeRef.current < 8000) return;

    const highScoringSignals = allScans.filter(s => s.opportunityScore >= soundThreshold);

    for (const sig of highScoringSignals) {
      const lastTriggered = lastAlertedSignalsRef.current.get(sig.symbol) || 0;
      // Alert only once every 4 minutes per symbol unless score jumps significantly
      if (now - lastTriggered > 240000) {
        lastAlertedSignalsRef.current.set(sig.symbol, now);
        lastGlobalAudioTimeRef.current = now;

        setRecentAudioAlert({
          symbol: sig.symbol,
          score: sig.opportunityScore,
          time: now
        });

        if (soundType === 'distribution_chime') {
          playSellSignalChime(soundVolume);
        } else {
          playAlarmSound(soundType as AlarmSoundType, soundVolume);
        }
        break; // Play one chime per scan cycle
      }
    }
  }, [allScans, soundAlertsEnabled, soundThreshold, soundType, soundVolume]);

  // Play test sound
  const handleTestSound = (typeToTest?: string) => {
    if (getIsGlobalMuted()) return;
    const t = typeToTest || soundType;
    if (t === 'distribution_chime') {
      playSellSignalChime(soundVolume);
    } else {
      playAlarmSound(t as AlarmSoundType, soundVolume);
    }
  };

  // Toggle sound setting & save to localStorage
  const handleToggleSound = () => {
    const next = !soundAlertsEnabled;
    setSoundAlertsEnabled(next);
    localStorage.setItem('sell_signals_sound_enabled', String(next));
    if (next) {
      handleTestSound();
    }
  };

  const handleUpdateSoundThreshold = (val: number) => {
    setSoundThreshold(val);
    localStorage.setItem('sell_signals_sound_threshold', String(val));
  };

  const handleUpdateSoundType = (type: string) => {
    setSoundType(type);
    localStorage.setItem('sell_signals_sound_type', type);
    handleTestSound(type);
  };

  const handleUpdateSoundVolume = (vol: number) => {
    setSoundVolume(vol);
    localStorage.setItem('sell_signals_sound_volume', String(vol));
  };

  // 75% Rule Noise Reduction: Group/hide lower-scoring assets (<75%) to prevent analysis paralysis
  const [showNoise, setShowNoise] = useState(false);

  const highConfidenceScans = useMemo(() => {
    return allScans.filter(s => s.opportunityScore >= 75);
  }, [allScans]);

  const noiseFilteredCount = allScans.length - highConfidenceScans.length;

  // Filtered signals for table/grid enforcing 75% rule by default
  const filteredScans = useMemo(() => {
    const baseList = showNoise ? allScans : highConfidenceScans;
    switch (filterType) {
      case 'STRONG_SELL':
        return baseList.filter(s => s.opportunityScore >= 85);
      case 'OVERBOUGHT':
        return baseList.filter(s => s.mfi >= 70);
      case 'HIGH_SCORE':
        return baseList.filter(s => s.opportunityScore >= 75);
      default:
        return baseList;
    }
  }, [allScans, highConfidenceScans, showNoise, filterType]);

  // Telegram Dispatcher Handler
  const handleDispatchTelegram = async (signalToPush: SellSignalItem | null = activeSignal) => {
    if (!signalToPush) return;
    if (!isPremium) {
      openSubscriptionModal();
      return;
    }

    if (!userProfile?.telegram_chat_id) {
      setTelegramDispatchStatus({
        loading: false,
        success: false,
        message: t.sellLinkTelegramErr
      });
      return;
    }

    setTelegramDispatchStatus({ loading: true });

    try {
      const idToken = user ? await user.getIdToken() : undefined;
      const res = await fetch('/api/telegram/dispatch-sell-signal', {
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
          language: language
        })
      });

      const data = await res.json();
      if (data.dispatched && data.deliveredToTelegram) {
        setTelegramDispatchStatus({
          loading: false,
          success: true,
          message: `${t.sellPushSuccessPrefix} ${userProfile.telegram_chat_id})!`
        });
      } else {
        setTelegramDispatchStatus({
          loading: false,
          success: false,
          message: data.message || t.sellPushFail
        });
      }
    } catch (err: any) {
      setTelegramDispatchStatus({
        loading: false,
        success: false,
        message: err.message || t.sellNetworkErr
      });
    }

    // Auto-clear message after 6 seconds
    setTimeout(() => {
      setTelegramDispatchStatus({ loading: false });
    }, 6000);
  };

  // Helper for score colors
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-[#F6465D] border-[#F6465D]/60 bg-[#F6465D]/10';
    if (score >= 70) return 'text-[#FF707E] border-[#FF707E]/50 bg-[#FF707E]/10';
    if (score >= 50) return 'text-[#F0B90B] border-[#F0B90B]/50 bg-[#F0B90B]/10';
    return 'text-[#848E9C] border-[#2B2F36] bg-[#1E2329]/60';
  };

  const getScoreBadgeBg = (score: number) => {
    if (score >= 85) return 'bg-[#F6465D] text-white';
    if (score >= 70) return 'bg-[#FF707E] text-slate-950';
    if (score >= 50) return 'bg-[#F0B90B] text-slate-950';
    return 'bg-[#2B2F36] text-[#848E9C]';
  };

  if (isVolatilityShieldActive) {
    return (
      <div className="space-y-6">
        <MacroVolatilityShieldBanner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Control Bar */}
      <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl p-5 shadow-2xl relative z-20">
        {/* Isolated glow effect inside overflow-hidden wrapper so popups are never clipped */}
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#F6465D]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="p-1.5 rounded-lg bg-[#F6465D]/15 text-[#F6465D] border border-[#F6465D]/30">
                <TrendingDown className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#EAECEF] font-mono uppercase">
                {t.sellSignalTitle}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F6465D]/20 text-[#F6465D] border border-[#F6465D]/40 animate-pulse">
                {t.sellBadgeDistribution}
              </span>
              {isVolatilityShieldActive && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse flex items-center gap-1">
                  <span>🛡️</span>
                  <span>{t.shieldActiveBadge}</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#848E9C] max-w-3xl">
              {t.sellSignalSubtitle}
            </p>
          </div>

          {/* Quick Actions & Live Pulse */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
            
            {/* Auto-Refresh Toggle & Countdown (Live Sync) */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0B0E11] border border-[#2B2F36] text-xs font-mono text-[#848E9C]">
              <span className="w-2 h-2 rounded-full bg-[#F6465D] animate-ping"></span>
              <span>{t.sellLiveSyncLabel}</span>
              <span className="text-[#F6465D] font-bold">({refreshCountdown}s)</span>
              <button
                onClick={() => {
                  setIsAutoRefresh(!isAutoRefresh);
                  refreshMarketState();
                }}
                className="hover:text-[#EAECEF] ml-1 p-0.5 rounded"
                title={isAutoRefresh ? t.sellPauseScanTooltip : t.sellResumeScanTooltip}
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isAutoRefresh ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
              </button>
            </div>

            {/* Audio Alerts Control & Settings Popup (Moved to right of Live Sync) */}
            <div className="relative" ref={soundSettingsContainerRef}>
              <div className="flex items-center rounded-lg border border-[#2B2F36] bg-[#0B0E11] p-1">
                <button
                  onClick={handleToggleSound}
                  title={soundAlertsEnabled ? t.muteAudioAlertsTitle : t.enableAudioAlertsTitle}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all ${
                    soundAlertsEnabled
                      ? 'bg-[#F6465D]/20 text-[#F6465D] border border-[#F6465D]/40 font-bold'
                      : 'text-[#848E9C] hover:text-[#EAECEF]'
                  }`}
                >
                  {soundAlertsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span>{soundAlertsEnabled ? t.audioOnLabel : t.mutedUpperLabel}</span>
                </button>

                <button
                  onClick={() => setIsSoundSettingsOpen(prev => !prev)}
                  title={t.audioAlertSettingsTitle}
                  className={`p-1.5 rounded hover:bg-[#2B2F36] text-[#848E9C] hover:text-[#EAECEF] transition-all ml-0.5 ${
                    isSoundSettingsOpen ? 'bg-[#2B2F36] text-[#EAECEF]' : ''
                  }`}
                >
                  <Settings2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sound Settings Dropdown Popup (Deploys to the right) */}
              {isSoundSettingsOpen && (
                <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-[#1E2329] border border-[#2B2F36] rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex justify-between items-center pb-2.5 border-b border-[#2B2F36] mb-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#EAECEF] font-mono">
                      <Bell className="w-3.5 h-3.5 text-[#F6465D]" />
                      <span>{t.sellAudioPanelTitle}</span>
                    </div>
                    <button
                      onClick={() => setIsSoundSettingsOpen(false)}
                      className="text-[#848E9C] hover:text-[#EAECEF] p-0.5 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3.5 text-xs font-mono">
                    {/* Trigger Threshold */}
                    <div>
                      <div className="flex justify-between text-[#848E9C] mb-1">
                        <span>{t.sellMinThresholdLabel}</span>
                        <span className="font-bold text-[#F6465D]">≥ {soundThreshold} pts</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="95"
                        step="5"
                        value={soundThreshold}
                        onChange={e => handleUpdateSoundThreshold(Number(e.target.value))}
                        className="w-full h-1.5 bg-[#0B0E11] rounded-lg appearance-none cursor-pointer accent-[#F6465D]"
                      />
                      <div className="flex justify-between text-[10px] text-[#5E6673] mt-0.5">
                        <span>{t.sellThreshAll}</span>
                        <span>{t.sellThreshMod}</span>
                        <span>{t.sellThreshStrong}</span>
                      </div>
                    </div>

                    {/* Sound Tone Selection */}
                    <div>
                      <label className="text-[#848E9C] block mb-1">
                        {t.sellAlarmToneLabel}
                      </label>
                      <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
                        <button
                          onClick={() => handleUpdateSoundType('distribution_chime')}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded text-left border transition-all ${
                            soundType === 'distribution_chime'
                              ? 'bg-[#F6465D]/15 border-[#F6465D]/50 text-[#F6465D] font-bold'
                              : 'bg-[#0B0E11] border-[#2B2F36] text-[#848E9C] hover:text-[#EAECEF]'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span>📉</span> {t.sellDistChimeOption}
                          </span>
                          {soundType === 'distribution_chime' && <Check className="w-3 h-3 text-[#F6465D]" />}
                        </button>

                        {ALARM_SOUND_OPTIONS.map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => handleUpdateSoundType(opt.id)}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded text-left border transition-all ${
                              soundType === opt.id
                                ? 'bg-[#F6465D]/15 border-[#F6465D]/50 text-[#F6465D] font-bold'
                                : 'bg-[#0B0E11] border-[#2B2F36] text-[#848E9C] hover:text-[#EAECEF]'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span>{opt.icon}</span> {isEs ? opt.nameEs : opt.nameEn}
                            </span>
                            {soundType === opt.id && <Check className="w-3 h-3 text-[#F6465D]" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Volume Slider */}
                    <div>
                      <div className="flex justify-between text-[#848E9C] mb-1">
                        <span>{t.volumeLabel}</span>
                        <span className="font-bold text-[#EAECEF]">{Math.round(soundVolume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="0.8"
                        step="0.05"
                        value={soundVolume}
                        onChange={e => handleUpdateSoundVolume(Number(e.target.value))}
                        className="w-full h-1.5 bg-[#0B0E11] rounded-lg appearance-none cursor-pointer accent-[#F6465D]"
                      />
                    </div>

                    {/* Test Button */}
                    <button
                      onClick={() => handleTestSound()}
                      className="w-full py-1.5 rounded bg-[#2B2F36] hover:bg-[#3b414c] text-[#EAECEF] text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Play className="w-3 h-3 text-[#F6465D]" />
                      <span>{t.sellTestAlarmBtn}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Telegram Dispatch Test */}
            <button
              onClick={() => handleDispatchTelegram(activeSignal)}
              disabled={telegramDispatchStatus.loading || !activeSignal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0088cc]/15 hover:bg-[#0088cc]/25 text-[#0088cc] border border-[#0088cc]/40 text-xs font-mono font-bold transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{telegramDispatchStatus.loading ? t.dispatchingLabel : t.pushToTelegramLabel}</span>
            </button>
          </div>
        </div>

        {/* Telegram Status Toast Message */}
        {telegramDispatchStatus.message && (
          <div className={`mt-3 p-2.5 rounded-lg text-xs font-mono flex items-center gap-2 border ${
            telegramDispatchStatus.success
              ? 'bg-[#0ECB81]/10 border-[#0ECB81]/30 text-[#0ECB81]'
              : 'bg-[#F6465D]/10 border-[#F6465D]/30 text-[#F6465D]'
          }`}>
            {telegramDispatchStatus.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{telegramDispatchStatus.message}</span>
          </div>
        )}

        {/* Recent Audio Alert Indicator Toast */}
        {recentAudioAlert && (
          <div className="mt-3 p-2 rounded-lg bg-[#F6465D]/10 border border-[#F6465D]/30 text-[#F6465D] text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F6465D] animate-ping"></span>
              <Volume2 className="w-3.5 h-3.5" />
              <span>
                {t.sellAudioTriggeredLabel} <strong>{recentAudioAlert.symbol}</strong> ({recentAudioAlert.score}/100 pts)
              </span>
            </div>
            <span className="text-[10px] text-[#848E9C]">
              {new Date(recentAudioAlert.time).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {/* Main Grid Layout: Left Spotlight (Active Asset) | Right Top Picks (All Cryptos) or Volatility Shield */}
      {isVolatilityShieldActive ? (
        <MacroVolatilityShieldBanner scannerType="SELL" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ============================================================ */}
        {/* LEFT COLUMN: ACTIVE MONITORED ASSET SPOTLIGHT (7 Cols) */}
        {/* ============================================================ */}
        <div className="lg:col-span-7 space-y-6">

          {/* Strict 75% Visibility Rule on Main Detailed Card */}
          {!activeSignal ? (
            <div className="py-20 px-6 rounded-xl bg-[#181A20] border border-[#2B2F36] border-dashed text-center flex flex-col items-center justify-center space-y-4 font-mono shadow-xl animate-pulse">
              <div className="p-3.5 rounded-full bg-[#F6465D]/10 border border-[#F6465D]/30 text-[#F6465D]">
                <Activity className="w-7 h-7 animate-spin" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h3 className="text-sm sm:text-base font-bold text-[#EAECEF] uppercase tracking-wide">
                  {t.sellSyncingTitle} {selectedSymbol}...
                </h3>
                <p className="text-xs text-[#848E9C] leading-relaxed">
                  {marketLoading
                    ? t.sellSyncingDesc
                    : t.sellAwaitingNextUpdate}
                </p>
              </div>
            </div>
          ) : activeSignal.opportunityScore >= 75 ? (
            <div className="space-y-4">
              {/* PRIMARY ACTION CARD (Clean, Decisive, High Conversion) */}
              <div className="bg-[#181A20] border border-[#2B2F36] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-[#2B2F36]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#0B0E11] border border-[#2B2F36] flex items-center justify-center text-2xl shadow-inner">
                      {(cryptoList.find(p => p.symbol === activeSignal.symbol) || PRESET_CRYPTOS.find(p => p.symbol === activeSignal.symbol))?.icon || '⚡'}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-bold font-mono text-[#EAECEF]">
                          {activeSignal.symbol}
                        </h2>
                        <button
                          type="button"
                          onClick={() => setAnalyzingSignal(activeSignal)}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider border border-[#F6465D]/40 bg-[#F6465D]/15 hover:bg-[#F6465D] text-[#F6465D] hover:text-white transition flex items-center gap-1 shadow active:scale-95"
                          title={t.whyThisAlertTooltip}
                        >
                          <BrainCircuit className="w-3 h-3" />
                          <span>{t.whyThisAlertBtn}</span>
                        </button>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase border ${getScoreColor(activeSignal.opportunityScore)}`}>
                          {activeSignal.signalStrength.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono text-[#848E9C] mt-1">
                        <span>{t.spotLabel} <strong className="text-[#EAECEF]">{formatCryptoDisplayPrice(activeSignal.currentPrice)}</strong></span>
                        <span className={activeSignal.change24h >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}>
                          {activeSignal.change24h >= 0 ? '+' : ''}{activeSignal.change24h.toFixed(2)}% (24h)
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#F6465D]/15 text-[#F6465D] border border-[#F6465D]/30">
                    {t.sellDistDetectedBadge}
                  </span>
                </div>

                {/* Plain-Language 1-Sentence Verdict Banner */}
                <div className="mt-4 p-3.5 rounded-xl bg-[#F6465D]/10 border border-[#F6465D]/30 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#F6465D] flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-[#EAECEF] font-medium leading-relaxed">
                    {isEs ? activeSignal.rationaleEs : activeSignal.rationaleEn}
                  </p>
                </div>

                {/* Grid: Favorability Gauge (Left) & Execution Blueprint (Right) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-5 items-center">
                  
                  {/* Distribution Score Gauge (4 cols) */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-[#0B0E11] border border-[#2B2F36]">
                    <span className="text-[10px] uppercase font-mono font-bold text-[#848E9C] tracking-wider mb-2">
                      {t.sellDistributionScore}
                    </span>
                    <div className="relative flex items-center justify-center">
                      <svg className="w-32 h-32 -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="52"
                          stroke="#2B2F36"
                          strokeWidth="10"
                          fill="transparent"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="52"
                          stroke={activeSignal.opportunityScore >= 85 ? '#F6465D' : activeSignal.opportunityScore >= 70 ? '#FF707E' : '#F0B90B'}
                          strokeWidth="10"
                          strokeDasharray={326}
                          strokeDashoffset={326 - (326 * activeSignal.opportunityScore) / 100}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute text-center flex flex-col items-center">
                        <span className="text-3xl font-black font-mono text-[#F6465D]">
                          {activeSignal.opportunityScore}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-[#848E9C]">/ 100</span>
                      </div>
                    </div>
                    <div className="text-[11px] font-mono font-semibold text-[#F6465D] mt-2">
                      {t.sellHighSellingPressure}
                    </div>
                  </div>

                  {/* Execution Plan Box (ATR-based) (8 cols) */}
                  <div className="md:col-span-8 p-4 rounded-xl bg-[#0B0E11] border border-[#2B2F36] space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#2B2F36]">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-[#F6465D]" />
                        <span className="text-xs font-bold font-mono text-[#EAECEF] uppercase tracking-wide">
                          {t.sellExecutionPlanAtr}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#F6465D] bg-[#F6465D]/15 px-2 py-0.5 rounded border border-[#F6465D]/30">
                        R:R 1 : {activeSignal.riskRewardRatio}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
                      {/* Entry Zone */}
                      <div className="p-2.5 rounded-lg bg-[#181A20] border border-[#2B2F36]">
                        <div className="text-[10px] text-[#848E9C] uppercase">{t.shortEntryZone}</div>
                        <div className="text-sm font-bold text-[#EAECEF] mt-0.5">
                          {formatCryptoDisplayPrice(activeSignal.entryZone.min)} - {formatCryptoDisplayPrice(activeSignal.entryZone.max)}
                        </div>
                      </div>

                      {/* Stop Loss (Capped at 4% max) */}
                      <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30">
                        <div className="text-[10px] text-red-300 uppercase">{t.stopLossSafetyCap}</div>
                        <div className="text-sm font-bold text-red-400 mt-0.5">
                          {formatCryptoDisplayPrice(activeSignal.stopLoss)} (+{(((activeSignal.stopLoss - activeSignal.currentPrice) / activeSignal.currentPrice) * 100).toFixed(2)}%)
                        </div>
                      </div>

                      {/* Target 1 (TP1) */}
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                        <div className="text-[10px] text-emerald-300 uppercase">{t.target1Tp1_15R}</div>
                        <div className="text-sm font-bold text-emerald-400 mt-0.5">
                          {formatCryptoDisplayPrice(activeSignal.takeProfit1)} ({(((activeSignal.takeProfit1 - activeSignal.currentPrice) / activeSignal.currentPrice) * 100).toFixed(2)}%)
                        </div>
                      </div>

                      {/* Target 2 (TP2) */}
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                        <div className="text-[10px] text-emerald-300 uppercase">{t.target2Tp2_25R}</div>
                        <div className="text-sm font-bold text-emerald-400 mt-0.5">
                          {formatCryptoDisplayPrice(activeSignal.takeProfit2)} ({(((activeSignal.takeProfit2 - activeSignal.currentPrice) / activeSignal.currentPrice) * 100).toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prominent High-Conversion Telegram 24/7 Button */}
                <div className="mt-5 pt-4 border-t border-[#2B2F36]">
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateTab) {
                        onNavigateTab('config');
                      } else {
                        handleDispatchTelegram(activeSignal);
                      }
                    }}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#0088cc] via-[#0099ee] to-[#F6465D] hover:brightness-110 active:scale-[0.99] text-white font-black text-sm sm:text-base shadow-xl shadow-rose-500/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                  >
                    <Send className="w-5 h-5 text-white" />
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
                    <Sliders className="w-4 h-4 text-[#F6465D]" />
                    <span>{t.viewTechDetailsBtn}</span>
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#F6465D]">
                    <span>{showTechnicalDetails ? t.hideLabel : t.showLabel}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showTechnicalDetails ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {showTechnicalDetails && (
                  <div className="p-5 border-t border-[#2B2F36] space-y-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* PILLAR 1: MFI Overbought Index */}
                      <div className="p-3.5 rounded-lg bg-[#0B0E11] border border-[#2B2F36] space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5 text-xs font-mono text-[#848E9C]">
                            <Zap className="w-3.5 h-3.5 text-[#F6465D]" />
                            <span>{t.sellPillar1Title}</span>
                          </div>
                          <span className="text-xs font-bold font-mono text-[#F6465D]">
                            +{activeSignal.mfiScoreContribution}/30 pts
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="text-lg font-black font-mono text-[#EAECEF]">{activeSignal.mfi}</span>
                          <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                            activeSignal.mfi >= 80 ? 'bg-[#F6465D]/20 text-[#F6465D]' :
                            activeSignal.mfi >= 68 ? 'bg-[#FF707E]/20 text-[#FF707E]' : 'bg-[#2B2F36] text-[#848E9C]'
                          }`}>
                            {activeSignal.mfiCondition.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#848E9C]">
                          {t.sellPillar1Desc}
                        </div>
                      </div>

                      {/* PILLAR 2: Short Liquidations Climax */}
                      <div className="p-3.5 rounded-lg bg-[#0B0E11] border border-[#2B2F36] space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5 text-xs font-mono text-[#848E9C]">
                            <Flame className="w-3.5 h-3.5 text-[#F6465D]" />
                            <span>{t.sellPillar2Title}</span>
                          </div>
                          <span className="text-xs font-bold font-mono text-[#F6465D]">
                            +{activeSignal.liquidationScoreContribution}/25 pts
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="text-lg font-black font-mono text-[#EAECEF]">
                            ${(activeSignal.shortLiquidations1m / 1000).toFixed(0)}k
                          </span>
                          <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                            activeSignal.isExhaustionTopDetected ? 'bg-[#F6465D]/20 text-[#F6465D]' : 'bg-[#2B2F36] text-[#848E9C]'
                          }`}>
                            {activeSignal.isExhaustionTopDetected ? t.sellPillar2Exhaustion : t.sellPillar2Normal}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#848E9C]">
                          {t.sellPillar2Desc}
                        </div>
                      </div>

                      {/* PILLAR 3: Futures Funding Rates */}
                      <div className="p-3.5 rounded-lg bg-[#0B0E11] border border-[#2B2F36] space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5 text-xs font-mono text-[#848E9C]">
                            <Percent className="w-3.5 h-3.5 text-[#F6465D]" />
                            <span>{t.futuresFundingLabel}</span>
                          </div>
                          <span className="text-xs font-bold font-mono text-[#F6465D]">
                            +{activeSignal.fundingScoreContribution}/25 pts
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="text-lg font-black font-mono text-[#F6465D]">
                            +{(activeSignal.fundingRate * 100).toFixed(3)}%
                          </span>
                          <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-[#F6465D]/20 text-[#F6465D]">
                            {activeSignal.fundingBias.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#848E9C]">
                          {t.sellPillar3Desc}
                        </div>
                      </div>

                      {/* PILLAR 4: Ask Resistance & Volume Deceleration */}
                      <div className="p-3.5 rounded-lg bg-[#0B0E11] border border-[#2B2F36] space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5 text-xs font-mono text-[#848E9C]">
                            <Layers className="w-3.5 h-3.5 text-[#F6465D]" />
                            <span>{t.sellPillar4Title}</span>
                          </div>
                          <span className="text-xs font-bold font-mono text-[#F6465D]">
                            +{activeSignal.resistanceScoreContribution}/20 pts
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="text-lg font-black font-mono text-[#EAECEF]">
                            {(activeSignal.askResistanceRatio * 100).toFixed(0)}% {t.sellPillar4AsksSuffix}
                          </span>
                          <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-[#F6465D]/20 text-[#F6465D]">
                            {activeSignal.buyVolumeDeceleration ? t.sellPillar4Fading : t.sellPillar4Steady}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#848E9C]">
                          {t.sellPillar4Desc}
                        </div>
                      </div>
                    </div>

                    {/* Technical Trigger Conditions */}
                    <div className="pt-2">
                      <div className="text-xs font-mono text-[#848E9C] mb-2">{t.sellTriggersMetTitle}</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                        <div className={`flex items-center gap-1.5 p-2 rounded bg-[#0B0E11] border ${
                          activeSignal.triggers.mfiOverbought ? 'border-[#F6465D]/40 text-[#F6465D]' : 'border-[#2B2F36] text-[#5E6673]'
                        }`}>
                          {activeSignal.triggers.mfiOverbought ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          <span>{t.sellTrigMfi}</span>
                        </div>

                        <div className={`flex items-center gap-1.5 p-2 rounded bg-[#0B0E11] border ${
                          activeSignal.triggers.shortLiquidationClimax ? 'border-[#F6465D]/40 text-[#F6465D]' : 'border-[#2B2F36] text-[#5E6673]'
                        }`}>
                          {activeSignal.triggers.shortLiquidationClimax ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          <span>{t.sellTrigShortLiq}</span>
                        </div>

                        <div className={`flex items-center gap-1.5 p-2 rounded bg-[#0B0E11] border ${
                          activeSignal.triggers.elevatedPositiveFunding ? 'border-[#F6465D]/40 text-[#F6465D]' : 'border-[#2B2F36] text-[#5E6673]'
                        }`}>
                          {activeSignal.triggers.elevatedPositiveFunding ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          <span>{t.sellTrigFunding}</span>
                        </div>

                        <div className={`flex items-center gap-1.5 p-2 rounded bg-[#0B0E11] border ${
                          activeSignal.triggers.askResistanceAbsorption ? 'border-[#F6465D]/40 text-[#F6465D]' : 'border-[#2B2F36] text-[#5E6673]'
                        }`}>
                          {activeSignal.triggers.askResistanceAbsorption ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          <span>{t.sellTrigAskWalls}</span>
                        </div>

                        <div className={`flex items-center gap-1.5 p-2 rounded bg-[#0B0E11] border ${
                          activeSignal.triggers.distributionMomentum ? 'border-[#F6465D]/40 text-[#F6465D]' : 'border-[#2B2F36] text-[#5E6673]'
                        }`}>
                          {activeSignal.triggers.distributionMomentum ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          <span>{t.sellTrigMomFade}</span>
                        </div>
                      </div>

                      {/* Action Button: Deep Signal Rationale & Favorability Analyzer */}
                      <div className="mt-4 pt-3 border-t border-[#2B2F36]">
                        <button
                          type="button"
                          onClick={() => setAnalyzingSignal(activeSignal)}
                          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#F6465D]/20 via-rose-500/10 to-[#F6465D]/20 hover:from-[#F6465D] hover:to-rose-600 text-[#F6465D] hover:text-white border border-[#F6465D]/40 font-mono font-bold text-xs transition-all flex items-center justify-center gap-2 shadow active:scale-95 group/btn"
                        >
                          <BrainCircuit className="w-4 h-4 text-[#F6465D] group-hover/btn:text-white transition" />
                          <span>{t.sellDeepRationaleBtn}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Sleek Centered Empty-State UI when score < 75 */
            <div className="py-20 px-6 rounded-xl bg-[#181A20] border border-[#2B2F36] border-dashed text-center flex flex-col items-center justify-center space-y-4 font-mono shadow-xl">
              <div className="p-3.5 rounded-full bg-[#F6465D]/10 border border-[#F6465D]/30 text-[#F6465D]">
                <Radio className="w-7 h-7 animate-pulse" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h3 className="text-sm sm:text-base font-bold text-[#EAECEF] uppercase tracking-wide">
                  ⏳ {t.scanningSetupsEllipsis}
                </h3>
                <p className="text-xs text-[#848E9C] leading-relaxed">
                  {t.buyLowScoreDescPrefix} {activeSignal.opportunityScore}{t.buyLowScoreDescSuffix}
                </p>
              </div>
              <div className="text-[11px] text-[#848E9C] bg-[#0B0E11] px-3 py-1 rounded-full border border-[#2B2F36]">
                {t.only75SetupsShown}
              </div>
            </div>
          )}

        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: MULTI-CRYPTO RADAR & RANKINGS (5 Cols) */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl p-5 shadow-xl space-y-4">
            
            {/* Header & Filter Tabs */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-[#2B2F36]">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold font-mono text-[#EAECEF]">
                    {t.sellRadarTitle}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F6465D]/15 text-[#F6465D] border border-[#F6465D]/30">
                    {t.rule75Badge}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-mono text-[#0ECB81] bg-[#0ECB81]/10 px-2 py-0.5 rounded-full border border-[#0ECB81]/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0ECB81] animate-ping" />
                    {t.liveSpotBadge}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#848E9C] mt-0.5">
                  {filteredScans.length} {t.sellRadarPairsSuffix}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {noiseFilteredCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowNoise(!showNoise)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition ${
                      showNoise
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-[#0B0E11] text-[#848E9C] border-[#2B2F36] hover:text-[#EAECEF]'
                    }`}
                    title={showNoise ? t.hideNoiseTooltip : t.showNoiseTooltip}
                  >
                    {showNoise
                      ? `${t.sellHidingShort} (-${noiseFilteredCount})`
                      : `+${noiseFilteredCount} ${t.lowerScoringSuffix}`}
                  </button>
                )}
                <button
                  onClick={() => setIsManageModalOpen(true)}
                  className="px-2 py-1 rounded bg-[#0B0E11] hover:bg-[#2B2F36] border border-[#2B2F36] text-[11px] font-mono text-[#F0B90B] flex items-center gap-1 transition"
                >
                  <Plus className="w-3 h-3" />
                  {t.manageCryptosShort}
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {(['ALL', 'STRONG_SELL', 'OVERBOUGHT', 'HIGH_SCORE'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all ${
                    filterType === f
                      ? 'bg-[#F6465D] text-white font-bold'
                      : 'bg-[#0B0E11] text-[#848E9C] hover:text-[#EAECEF] border border-[#2B2F36]'
                  }`}
                >
                  {f === 'ALL' ? `${t.sellFilterAll} (${filteredScans.length})` :
                   f === 'STRONG_SELL' ? t.sellFilterStrongSell :
                   f === 'OVERBOUGHT' ? t.sellFilterOverbought : t.sellFilterScore75}
                </button>
              ))}
            </div>

            {/* Ranked Crypto List or Sleek Empty State */}
            {filteredScans.length > 0 ? (
              <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
                {filteredScans.map((sig, idx) => {
                  const isSelected = sig.symbol === selectedSymbol;
                  const preset = cryptoList.find(p => p.symbol === sig.symbol) || PRESET_CRYPTOS.find(p => p.symbol === sig.symbol);

                  return (
                    <div
                      key={sig.symbol}
                      onClick={() => {
                        setSelectedSymbol(sig.symbol);
                        onSelectSymbol(sig.symbol);
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                        isSelected
                          ? 'bg-[#F6465D]/10 border-[#F6465D]/60 shadow-lg'
                          : 'bg-[#0B0E11] hover:bg-[#1E2329] border-[#2B2F36]'
                      }`}
                    >
                      {/* Top Row: Symbol, Price & Score Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="text-base w-7 h-7 rounded-lg bg-[#181A20] border border-[#2B2F36] flex items-center justify-center shrink-0">
                            {preset?.icon || '⚡'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold font-mono text-sm text-[#EAECEF]">
                                {sig.symbol}
                              </span>
                              <span className="text-[10px] text-[#848E9C]">#{idx + 1}</span>
                            </div>
                            <div className="text-xs font-mono text-[#EAECEF] flex items-center gap-2">
                              <span className="font-black">{formatCryptoDisplayPrice(sig.currentPrice)}</span>
                              {sig.change24h !== undefined && (
                                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                  sig.change24h >= 0 ? 'text-[#0ECB81] bg-[#0ECB81]/15' : 'text-[#F6465D] bg-[#F6465D]/15'
                                }`}>
                                  {sig.change24h >= 0 ? `+${sig.change24h.toFixed(2)}%` : `${sig.change24h.toFixed(2)}%`}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-xs ${getScoreBadgeBg(sig.opportunityScore)}`}>
                            {sig.opportunityScore} / 100
                          </div>
                          <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-[#F6465D]' : 'text-[#848E9C]'}`} />
                        </div>
                      </div>

                      {/* Reassuring human metric banner */}
                      <div className="text-[10px] text-[#F6465D] font-semibold flex items-center gap-1.5 bg-[#F6465D]/10 border border-[#F6465D]/25 px-2 py-1 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F6465D] shrink-0 animate-pulse" />
                        <span className="truncate">
                          {t.sellCardHumanBanner}
                        </span>
                      </div>

                      {/* 3 Actionable Numbers (Execution Plan) */}
                      <div className="bg-[#121418] rounded-lg p-2.5 border border-[#2B2F36] space-y-1.5 text-[11px] font-mono">
                        <div className="flex justify-between items-center">
                          <span className="text-[#848E9C] text-[10px] uppercase font-bold">{t.entryZoneShort}</span>
                          <span className="text-[#EAECEF] font-bold truncate">
                            {formatCryptoDisplayPrice(sig.entryZone.min)} - {formatCryptoDisplayPrice(sig.entryZone.max)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#848E9C] text-[10px] uppercase font-bold">{t.targetTp1Short}</span>
                          <span className="text-[#0ECB81] font-black truncate flex items-center gap-1">
                            <span>{formatCryptoDisplayPrice(sig.takeProfit1)}</span>
                            {sig.currentPrice > 0 && (
                              <span className="text-[9px] bg-[#0ECB81]/15 px-1 rounded">
                                {(((sig.takeProfit1 - sig.currentPrice) / sig.currentPrice) * 100).toFixed(1)}%
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#848E9C] text-[10px] uppercase font-bold">{t.stopLossShort}</span>
                          <span className="text-[#F6465D] font-bold truncate flex items-center gap-1">
                            <span>{formatCryptoDisplayPrice(sig.stopLoss)}</span>
                            {sig.currentPrice > 0 && (
                              <span className="text-[9px] bg-[#F6465D]/15 px-1 rounded">
                                +{(((sig.stopLoss - sig.currentPrice) / sig.currentPrice) * 100).toFixed(1)}%
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Indicators Micro-Row & Action Button */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#2B2F36]/60">
                        <div className="flex items-center gap-2.5 text-[10px] font-mono text-[#848E9C]">
                          <span>MFI: <strong className="text-[#F6465D]">{sig.mfi}</strong></span>
                          <span>Funding: <strong className="text-[#F6465D]">+{(sig.fundingRate * 100).toFixed(2)}%</strong></span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSymbol(sig.symbol);
                            onSelectSymbol(sig.symbol);
                            setAnalyzingSignal(sig);
                          }}
                          className="py-1 px-2.5 rounded-lg bg-[#181A20] hover:bg-[#F6465D] text-[#848E9C] hover:text-white border border-[#2B2F36] hover:border-[#F6465D] transition-all flex items-center gap-1 text-[11px] font-mono font-bold group/btn shadow-sm cursor-pointer"
                          title={t.whyThisAlertTooltip}
                        >
                          <BrainCircuit className="w-3.5 h-3.5 text-[#F6465D] group-hover/btn:text-white transition" />
                          <span>{t.sellAnalyzeBtn}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Sleek Empty State for Noise Reduction */
              <div className="py-10 px-4 rounded-xl bg-[#0B0E11]/80 border border-[#2B2F36] border-dashed text-center flex flex-col items-center justify-center space-y-3 font-mono">
                <div className="p-3 rounded-full bg-[#F6465D]/10 border border-[#F6465D]/30 text-[#F6465D]">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#EAECEF] uppercase tracking-wide">
                    {t.sellEmptyTitle}
                  </h3>
                  <p className="text-xs text-[#848E9C] max-w-sm mx-auto">
                    {t.sellEmptyDescPrefix} {noiseFilteredCount} {t.sellEmptyDescSuffix}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowNoise(true)}
                    className="px-3 py-1.5 rounded-lg bg-[#181A20] hover:bg-[#2B2F36] border border-[#2B2F36] text-[11px] text-[#848E9C] hover:text-[#EAECEF] transition"
                  >
                    {t.inspectFilteredSetups} ({noiseFilteredCount})
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
        signalType="SELL"
        signal={analyzingSignal}
        currentMetrics={currentMetrics}
        onDispatchTelegram={(sig) => handleDispatchTelegram(sig)}
        isDispatchingTelegram={telegramDispatchStatus.loading}
      />

    </div>
  );
};
