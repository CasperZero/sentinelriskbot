import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  TrendingUp,
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
  Plus,
  BrainCircuit,
  ChevronDown
} from 'lucide-react';
import { BuySignalItem, RiskMetrics, OrderBookData, ActiveTab } from '../types';
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
  playBuySignalChime,
  AlarmSoundType,
  getIsGlobalMuted
} from '../utils/audioAlerts';

interface BuySignalScannerProps {
  currentMetrics: RiskMetrics | null;
  orderBook: OrderBookData | null;
  currentSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

export const BuySignalScanner: React.FC<BuySignalScannerProps> = ({
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
    allBuyScans,
    buySignals,
    isCrashWarningActive: marketCrashWarning,
    globalRiskIndex,
    refreshMarketState,
    isLoading: marketLoading,
  } = useMarket();

  // Global Anti-Contradiction Rule: Risk Index >= 80 disables buy signals
  const isCrashWarningActive = marketCrashWarning || (currentMetrics?.riskIndex ?? globalRiskIndex ?? 0) >= 80;

  const [selectedSymbol, setSelectedSymbol] = useState<string>(currentSymbol || 'BTCUSDT');
  const [filterType, setFilterType] = useState<'ALL' | 'STRONG_BUY' | 'OVERSOLD' | 'HIGH_SCORE'>('ALL');
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [refreshCountdown, setRefreshCountdown] = useState(5);
  const [telegramDispatchStatus, setTelegramDispatchStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  // Interactive Signal Rationale & Favorability Analyzer Modal state
  const [analyzingSignal, setAnalyzingSignal] = useState<BuySignalItem | null>(null);

  // Audio Alerts State with localStorage persistence
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('buy_signals_sound_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const [soundThreshold, setSoundThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('buy_signals_sound_threshold');
    return saved ? Number(saved) : 75;
  });

  const [soundType, setSoundType] = useState<string>(() => {
    return localStorage.getItem('buy_signals_sound_type') || 'bullish_chime';
  });

  const [soundVolume, setSoundVolume] = useState<number>(() => {
    const saved = localStorage.getItem('buy_signals_sound_volume');
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
  const allScans = allBuyScans;

  // Active Deep Dive Signal from real backend scan (null while syncing — never fabricate placeholder scores)
  const activeSignal: BuySignalItem | null = useMemo(() => {
    const found =
      allScans.find(s => s.symbol === selectedSymbol) ||
      buySignals.find(s => s.symbol === selectedSymbol) ||
      null;
    if (!found || found.currentPrice <= 0) return null;
    return found;
  }, [selectedSymbol, allScans, buySignals]);

  // Play audio alert helper
  const triggerBuySound = (type = soundType, vol = soundVolume) => {
    if (getIsGlobalMuted()) return;
    if (type === 'bullish_chime') {
      playBuySignalChime(vol);
    } else {
      playAlarmSound(type as AlarmSoundType, vol);
    }
  };

  // Toggle Mute / Unmute handler
  const handleToggleSound = () => {
    const nextState = !soundAlertsEnabled;
    setSoundAlertsEnabled(nextState);
    localStorage.setItem('buy_signals_sound_enabled', String(nextState));
    if (nextState) {
      triggerBuySound();
    }
  };

  // Update sound threshold
  const handleSetSoundThreshold = (threshold: number) => {
    setSoundThreshold(threshold);
    localStorage.setItem('buy_signals_sound_threshold', String(threshold));
  };

  // Update sound type
  const handleSetSoundType = (type: string) => {
    setSoundType(type);
    localStorage.setItem('buy_signals_sound_type', type);
    triggerBuySound(type, soundVolume);
  };

  // Update sound volume
  const handleSetSoundVolume = (vol: number) => {
    setSoundVolume(vol);
    localStorage.setItem('buy_signals_sound_volume', String(vol));
  };

  // Real-time Audio Alert Dispatcher Engine
  useEffect(() => {
    if (getIsGlobalMuted() || !soundAlertsEnabled || isVolatilityShieldActive || isCrashWarningActive) return;

    const now = Date.now();
    // Global minimum gap of 3.5 seconds between audio pings
    if (now - lastGlobalAudioTimeRef.current < 3500) return;

    // Evaluate all candidates
    const allCandidates = [...allScans];
    if (activeSignal && !allCandidates.some(s => s.symbol === activeSignal.symbol)) {
      allCandidates.push(activeSignal);
    }

    const highConfidenceSignals = allCandidates.filter(
      s => s.opportunityScore >= soundThreshold
    );

    for (const sig of highConfidenceSignals) {
      const lastTrigger = lastAlertedSignalsRef.current.get(sig.symbol) || 0;
      // 60-second cooldown per individual cryptocurrency symbol
      if (now - lastTrigger > 60000) {
        lastAlertedSignalsRef.current.set(sig.symbol, now);
        lastGlobalAudioTimeRef.current = now;
        triggerBuySound(soundType, soundVolume);
        setRecentAudioAlert({ symbol: sig.symbol, score: sig.opportunityScore, time: now });
        break;
      }
    }
  }, [allScans, activeSignal, soundAlertsEnabled, soundThreshold, soundType, soundVolume]);

  // Auto-dismiss audio alert banner after 7 seconds
  useEffect(() => {
    if (!recentAudioAlert) return;
    const timer = setTimeout(() => {
      setRecentAudioAlert(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [recentAudioAlert]);

  // 75% Rule Noise Reduction: Group/hide lower-scoring assets (<75%) to prevent analysis paralysis
  const [showNoise, setShowNoise] = useState(false);

  const highConfidenceScans = useMemo(() => {
    return allScans.filter(s => s.opportunityScore >= 75);
  }, [allScans]);

  const noiseFilteredCount = allScans.length - highConfidenceScans.length;

  // Filtered market list enforcing the strict 75% Rule by default
  const filteredScans = useMemo(() => {
    const baseList = showNoise ? allScans : highConfidenceScans;
    switch (filterType) {
      case 'STRONG_BUY':
        return baseList.filter(s => s.signalStrength === 'STRONG_BUY');
      case 'OVERSOLD':
        return baseList.filter(s => s.mfi < 35);
      case 'HIGH_SCORE':
        return baseList.filter(s => s.opportunityScore >= 85);
      default:
        return baseList;
    }
  }, [allScans, highConfidenceScans, showNoise, filterType]);

  // Handle Telegram Buy Signal Dispatch
  const handleDispatchTelegram = async (signalToPush: BuySignalItem | null = activeSignal) => {
    if (!signalToPush) return;
    if (isCrashWarningActive) {
      setTelegramDispatchStatus({
        loading: false,
        success: false,
        message: t.buyCrashBlockedMsg
      });
      return;
    }

    if (!isPremium) {
      openSubscriptionModal();
      return;
    }

    if (!userProfile?.telegram_chat_id) {
      setTelegramDispatchStatus({
        loading: false,
        success: false,
        message: t.buyLinkTelegramErr
      });
      return;
    }

    setTelegramDispatchStatus({ loading: true });

    try {
      const idToken = user ? await user.getIdToken() : undefined;
      const res = await fetch('/api/telegram/dispatch-buy-signal', {
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
          language
        })
      });

      const data = await res.json();
      if (res.ok && data.dispatched) {
        setTelegramDispatchStatus({
          loading: false,
          success: true,
          message: `${t.buyPushSuccessPrefix} ${userProfile.telegram_chat_id}!`
        });
      } else {
        setTelegramDispatchStatus({
          loading: false,
          success: false,
          message: data.message || t.buyPushError
        });
      }
    } catch (err: any) {
      setTelegramDispatchStatus({
        loading: false,
        success: false,
        message: err.message || t.buyPushNetworkErr
      });
    }

    setTimeout(() => {
      setTelegramDispatchStatus(prev => ({ ...prev, loading: false }));
    }, 6000);
  };

  // Helper for score color styling
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-[#0ECB81] border-[#0ECB81] bg-[#0ECB81]/10';
    if (score >= 70) return 'text-[#F0B90B] border-[#F0B90B] bg-[#F0B90B]/10';
    if (score >= 50) return 'text-amber-400 border-amber-400/50 bg-amber-400/10';
    return 'text-[#848E9C] border-[#2B2F36] bg-[#181A20]';
  };

  const getBadgeStyle = (strength: BuySignalItem['signalStrength']) => {
    switch (strength) {
      case 'STRONG_BUY':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'MODERATE_BUY':
        return 'bg-green-500/20 text-green-300 border-green-500/40';
      case 'ACCUMULATION':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'NEUTRAL':
        return 'bg-[#2B2F36] text-[#848E9C] border-transparent';
      default:
        return 'bg-red-500/20 text-red-400 border-red-500/40';
    }
  };

  if (isVolatilityShieldActive) {
    return (
      <div id="buy-signal-scanner-module" className="space-y-6">
        <MacroVolatilityShieldBanner />
      </div>
    );
  }

  return (
    <div id="buy-signal-scanner-module" className="space-y-6">
      
      {/* 1. Header Banner & Live Scanner Status */}
      <div className="bg-[#121418] border border-[#2B2F36] rounded-2xl p-5 shadow-2xl relative">
        {/* Isolated glow effect wrapped with overflow-hidden so child menus never get clipped */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#0ECB81]/5 rounded-full blur-3xl pointer-events-none" />
        </div>
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-2 rounded-xl bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-[#EAECEF] tracking-tight">
                    {t.buyScannerTitle}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-[#F0B90B] text-slate-950 shadow-md">
                    {t.premiumBadge}
                  </span>
                  {isVolatilityShieldActive && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse flex items-center gap-1">
                      <span>🛡️</span>
                      <span>{t.shieldActiveBadge}</span>
                    </span>
                  )}
                  {isCrashWarningActive && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse flex items-center gap-1">
                      <span>🚨</span>
                      <span>{t.crashWarningBadge}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#848E9C] mt-0.5">
                  {t.buyScannerSubtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Scanner Controls & Audio Alert Switcher */}
          <div className="flex items-center flex-wrap gap-2.5 self-stretch sm:self-auto">
            
            {/* Live Monitoring Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#181A20] border border-[#2B2F36] text-xs font-mono text-[#848E9C]">
              <span className="w-2 h-2 rounded-full bg-[#0ECB81] animate-pulse" />
              <span>{t.monitoringAssetsPrefix} {cryptoList.length} {t.monitoringAssetsSuffix}</span>
              <span className="text-[#F0B90B] font-bold">({refreshCountdown}s)</span>
            </div>

            {/* Audio Alert Mute / Unmute & Settings Button */}
            <div
              ref={soundSettingsContainerRef}
              className="relative flex items-center bg-[#181A20] rounded-xl border border-[#2B2F36] p-0.5 shadow-sm"
            >
              <button
                type="button"
                id="toggle-buy-signal-audio-btn"
                onClick={handleToggleSound}
                title={soundAlertsEnabled ? t.muteAudioAlertsTitle : t.enableAudioAlertsTitle}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition ${
                  soundAlertsEnabled
                    ? 'bg-[#0ECB81]/15 text-[#0ECB81] hover:bg-[#0ECB81]/25'
                    : 'text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B2F36]'
                }`}
              >
                {soundAlertsEnabled ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[#0ECB81]" />
                    <span className="hidden sm:inline">{t.audioOnLabel}</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-[#848E9C]" />
                    <span className="hidden sm:inline">{t.mutedUpperLabel}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                id="buy-signal-audio-settings-btn"
                onClick={() => setIsSoundSettingsOpen(!isSoundSettingsOpen)}
                title={t.audioAlertSettingsTitle}
                className={`p-1.5 rounded-lg text-xs transition border-l border-[#2B2F36] ${
                  isSoundSettingsOpen
                    ? 'bg-[#2B2F36] text-[#F0B90B]'
                    : 'text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B2F36]'
                }`}
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>

              {/* Audio Settings Popover Menu */}
              {isSoundSettingsOpen && (
                <div className="fixed top-28 left-4 right-4 sm:absolute sm:top-full sm:left-auto sm:right-0 sm:mt-2 sm:w-72 max-h-[75vh] overflow-y-auto bg-[#14161C] border border-[#2B2F36] rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 space-y-3.5 backdrop-blur-md">
                  <div className="flex items-center justify-between border-b border-[#2B2F36] pb-2">
                    <span className="text-xs font-mono font-bold text-[#EAECEF] flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-[#0ECB81]" />
                      {t.buyAudioPanelTitle}
                    </span>
                    <button
                      onClick={() => setIsSoundSettingsOpen(false)}
                      className="text-[#848E9C] hover:text-[#EAECEF] text-xs p-1 rounded-md hover:bg-[#2B2F36]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sound Enable Switch */}
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#848E9C]">
                      {t.soundNotificationsLabel}
                    </span>
                    <button
                      onClick={handleToggleSound}
                      className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
                        soundAlertsEnabled
                          ? 'bg-[#0ECB81]/20 text-[#0ECB81] border border-[#0ECB81]/40'
                          : 'bg-[#2B2F36] text-[#848E9C]'
                      }`}
                    >
                      {soundAlertsEnabled ? t.enabledUpperLabel : t.mutedUpperLabel}
                    </button>
                  </div>

                  {/* Sound Type Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono text-[#848E9C] block">
                      {t.alertSoundStyleLabel}
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={soundType}
                        onChange={(e) => handleSetSoundType(e.target.value)}
                        className="flex-1 bg-[#181A20] border border-[#2B2F36] text-[#EAECEF] text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#0ECB81]"
                      >
                        <option value="bullish_chime">✨ {t.buySoundArpeggioOption}</option>
                        {ALARM_SOUND_OPTIONS.map(opt => (
                          <option key={opt.id} value={opt.id}>
                            {opt.icon} {isEs ? opt.nameEs : opt.nameEn}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => triggerBuySound(soundType, soundVolume)}
                        title={t.testSoundLabel}
                        className="px-2.5 py-1.5 rounded-lg bg-[#2B2F36] hover:bg-[#0ECB81]/20 hover:text-[#0ECB81] text-[#EAECEF] text-xs font-mono flex items-center gap-1 transition"
                      >
                        <Play className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Trigger Threshold selector */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-[#848E9C]">{t.triggerAtScoreLabel}</span>
                      <span className="text-[#0ECB81] font-bold">{soundThreshold} / 100</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[70, 75, 80, 85].map(thresh => (
                        <button
                          key={thresh}
                          type="button"
                          onClick={() => handleSetSoundThreshold(thresh)}
                          className={`py-1 rounded-lg text-xs font-mono font-bold border transition ${
                            soundThreshold === thresh
                              ? 'bg-[#0ECB81]/20 text-[#0ECB81] border-[#0ECB81]'
                              : 'bg-[#181A20] text-[#848E9C] border-[#2B2F36] hover:text-[#EAECEF]'
                          }`}
                        >
                          ≥ {thresh}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Volume Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-[#848E9C]">{t.volumeLabel}</span>
                      <span className="text-[#EAECEF] font-bold">{Math.round(soundVolume * 500)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.4"
                      step="0.05"
                      value={soundVolume}
                      onChange={(e) => handleSetSoundVolume(Number(e.target.value))}
                      className="w-full h-1.5 bg-[#2B2F36] rounded-lg appearance-none cursor-pointer accent-[#0ECB81]"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setRefreshCountdown(5);
                refreshMarketState();
              }}
              className="px-3 py-1.5 bg-[#181A20] hover:bg-[#2B2F36] active:scale-95 text-[#EAECEF] text-xs font-semibold rounded-xl border border-[#2B2F36] flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#F0B90B]" />
              <span>{t.scanNowBtn}</span>
            </button>

            <button
              onClick={() => handleDispatchTelegram(activeSignal)}
              disabled={telegramDispatchStatus.loading || !activeSignal}
              className="px-3.5 py-1.5 bg-gradient-to-r from-[#0ECB81] to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 active:scale-95 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {telegramDispatchStatus.loading
                  ? t.dispatchingLabel
                  : t.buyTelegramBtn}
              </span>
            </button>
          </div>
        </div>

        {/* Audio Alert Trigger Live Banner */}
        {recentAudioAlert && soundAlertsEnabled && (
          <div className="mt-3 p-3 rounded-xl bg-[#0ECB81]/15 border border-[#0ECB81]/50 text-emerald-300 text-xs font-mono flex items-center justify-between gap-2 animate-pulse">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-[#0ECB81]/20 text-[#0ECB81]">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-[#EAECEF]">{t.buyAudioToastTitle}</span>{' '}
                <span>
                  {t.buyAudioToastAsset} {recentAudioAlert.symbol} {t.buyAudioToastMiddle} {recentAudioAlert.score}/100.
                </span>
              </div>
            </div>
            <button
              onClick={() => setRecentAudioAlert(null)}
              className="text-[#848E9C] hover:text-[#EAECEF] p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Telegram feedback message toast */}
        {telegramDispatchStatus.message && (
          <div className={`mt-3 p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
            telegramDispatchStatus.success
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/40 text-amber-300'
          }`}>
            <div className="flex items-center gap-2">
              {telegramDispatchStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />}
              <span>{telegramDispatchStatus.message}</span>
            </div>
            <button
              onClick={() => setTelegramDispatchStatus({ loading: false })}
              className="text-[#848E9C] hover:text-[#EAECEF]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>


      {/* 2 & 3. Active Opportunity Matrix & Deep Dive (Gracefully paused during Macro Volatility Shield or Crash Warning) */}
      {isVolatilityShieldActive ? (
        <MacroVolatilityShieldBanner scannerType="BUY" />
      ) : isCrashWarningActive ? (
        /* Strict Anti-Contradiction Rule: Risk Index >= 80 hides all buy setups */
        <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-red-950/40 via-red-900/15 to-[#121418] border-2 border-red-500/50 shadow-[0_0_50px_rgba(246,70,93,0.25)] text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 border-2 border-red-500/60 flex items-center justify-center text-red-400 shadow-lg shadow-red-500/30 animate-pulse">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-mono font-bold tracking-wider uppercase">
              <span>{t.buyCrashBannerRiskPrefix} {currentMetrics?.riskIndex ?? globalRiskIndex}/100</span>
              <span>·</span>
              <span>{t.buyCrashBannerBadge}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-red-200 tracking-tight">
              {t.buyCrashBannerTitle}
            </h2>
            <p className="text-sm text-red-300/90 leading-relaxed font-medium">
              {t.buyCrashBannerDesc}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#0B0E11]/80 border border-red-500/30 text-xs font-mono text-[#848E9C] max-w-lg text-left space-y-1.5">
            <div className="text-red-400 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>{t.buyCrashAntiContradictionTitle}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#848E9C]">
              {t.buyCrashAntiContradictionDesc}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* 2. Top Universe Scanner Matrix Chips (75% Rule Noise Filtering) */}
          <div className="bg-[#121418] border border-[#2B2F36] rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <Compass className="w-4 h-4 text-[#F0B90B]" />
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#EAECEF]">
              {t.buyMatrixTitle}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30">
              {t.rule75Badge}
            </span>
            {noiseFilteredCount > 0 && (
              <button
                type="button"
                onClick={() => setShowNoise(!showNoise)}
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition ${
                  showNoise
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-[#181A20] text-[#848E9C] border-[#2B2F36] hover:text-[#EAECEF]'
                }`}
                title={showNoise ? t.hideNoiseTooltip : t.showNoiseTooltip}
              >
                {showNoise
                  ? `${t.hidingNoiseLabel} (-${noiseFilteredCount})`
                  : `+${noiseFilteredCount} ${t.lowerScoringSuffix}`}
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium">
            <div className="flex items-center gap-1 bg-[#181A20] p-1 rounded-xl border border-[#2B2F36]">
              {(['ALL', 'STRONG_BUY', 'OVERSOLD', 'HIGH_SCORE'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    filterType === f
                      ? 'bg-[#F0B90B] text-slate-950 font-bold shadow'
                      : 'text-[#848E9C] hover:text-[#EAECEF]'
                  }`}
                >
                  {f === 'ALL' && `${t.buyFilterActive} (${filteredScans.length})`}
                  {f === 'STRONG_BUY' && t.buyFilterStrongBuy}
                  {f === 'OVERSOLD' && t.buyFilterOversold}
                  {f === 'HIGH_SCORE' && t.buyFilterHighScore}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsManageModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-[#181A20] hover:bg-[#2B2F36] text-[#F0B90B] border border-[#2B2F36] font-bold transition flex items-center gap-1 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              {t.manageCryptos}
            </button>
          </div>
        </div>

        {/* Asset Cards Grid or Sleek Empty State */}
        {filteredScans.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredScans.map(item => {
              const isSelected = item.symbol === selectedSymbol;
              return (
                <div
                  key={item.symbol}
                  onClick={() => {
                    setSelectedSymbol(item.symbol);
                    onSelectSymbol(item.symbol);
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#181A20] border-[#0ECB81] ring-1 ring-[#0ECB81] shadow-lg shadow-[#0ECB81]/10'
                      : 'bg-[#181A20]/70 border-[#2B2F36] hover:border-[#848E9C]/40 hover:bg-[#181A20]'
                  }`}
                >
                  <div>
                    {/* Header: Symbol & Score */}
                    <div className="flex justify-between items-start mb-1.5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-extrabold text-sm text-[#EAECEF] font-mono">{item.baseAsset}</span>
                        <span className="text-[10px] text-[#848E9C] font-mono">USDT</span>
                      </div>
                      <div className={`px-2 py-0.5 rounded-full text-[10px] font-black font-mono border ${getScoreColor(item.opportunityScore)}`}>
                        {item.opportunityScore} / 100
                      </div>
                    </div>

                    {/* Price and 24h change */}
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className="font-black text-[#EAECEF]">{formatCryptoDisplayPrice(item.currentPrice)}</span>
                      {item.change24h !== undefined && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          item.change24h >= 0 ? 'text-[#0ECB81] bg-[#0ECB81]/15' : 'text-[#F6465D] bg-[#F6465D]/15'
                        }`}>
                          {item.change24h >= 0 ? `+${item.change24h.toFixed(1)}%` : `${item.change24h.toFixed(1)}%`}
                        </span>
                      )}
                    </div>

                    {/* Reassuring human metric banner */}
                    <div className="text-[10px] text-[#0ECB81] font-semibold flex items-center gap-1.5 bg-[#0ECB81]/10 border border-[#0ECB81]/25 px-2 py-1 rounded-md mb-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0ECB81] shrink-0 animate-pulse" />
                      <span className="truncate">
                        {t.buyCardHumanBanner}
                      </span>
                    </div>

                    {/* 3 Actionable Numbers (Execution Plan) */}
                    <div className="bg-[#121418] rounded-lg p-2.5 border border-[#2B2F36] space-y-1.5 text-[11px] font-mono mb-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[#848E9C] text-[10px] uppercase font-bold">{t.entryZoneShort}</span>
                        <span className="text-[#EAECEF] font-bold truncate">
                          {formatCryptoDisplayPrice(item.entryZone.min)} - {formatCryptoDisplayPrice(item.entryZone.max)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#848E9C] text-[10px] uppercase font-bold">{t.targetTp1Short}</span>
                        <span className="text-[#0ECB81] font-black truncate flex items-center gap-1">
                          <span>{formatCryptoDisplayPrice(item.takeProfit1)}</span>
                          {item.currentPrice > 0 && (
                            <span className="text-[9px] bg-[#0ECB81]/15 px-1 rounded">
                              +{(((item.takeProfit1 - item.currentPrice) / item.currentPrice) * 100).toFixed(1)}%
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#848E9C] text-[10px] uppercase font-bold">{t.stopLossShort}</span>
                        <span className="text-[#F6465D] font-bold truncate flex items-center gap-1">
                          <span>{formatCryptoDisplayPrice(item.stopLoss)}</span>
                          {item.currentPrice > 0 && (
                            <span className="text-[9px] bg-[#F6465D]/15 px-1 rounded">
                              {(((item.stopLoss - item.currentPrice) / item.currentPrice) * 100).toFixed(1)}%
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Indicators Micro-Row */}
                    <div className="flex items-center justify-between text-[10px] text-[#848E9C] font-mono px-0.5">
                      <span>MFI: <strong className={item.mfi < 20 ? 'text-[#0ECB81]' : item.mfi < 35 ? 'text-[#F0B90B]' : 'text-[#848E9C]'}>{item.mfi}</strong></span>
                      <span>R:R: <strong className="text-[#0ECB81]">1:{item.riskRewardRatio}</strong></span>
                    </div>

                    {/* Score Bar */}
                    <div className="w-full bg-[#2B2F36] h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.opportunityScore >= 85 ? 'bg-[#0ECB81]' : item.opportunityScore >= 70 ? 'bg-[#F0B90B]' : 'bg-[#848E9C]'
                        }`}
                        style={{ width: `${item.opportunityScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Interactive Actionable Alert Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSymbol(item.symbol);
                      onSelectSymbol(item.symbol);
                      setAnalyzingSignal(item);
                    }}
                    className="mt-3 w-full py-1.5 px-2 rounded-lg bg-[#0B0E11] hover:bg-[#0ECB81] text-[#848E9C] hover:text-slate-950 border border-[#2B2F36] hover:border-[#0ECB81] text-[11px] font-mono font-bold transition-all flex items-center justify-center gap-1.5 group/btn shadow-sm cursor-pointer"
                    title={t.whyThisAlertTooltip}
                  >
                    <BrainCircuit className="w-3.5 h-3.5 text-[#0ECB81] group-hover/btn:text-slate-950 transition" />
                    <span>{t.buyAnalyzeBtn}</span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          /* Sleek Empty State for Noise Reduction */
          <div className="py-10 px-4 rounded-xl bg-[#181A20]/50 border border-[#2B2F36] border-dashed text-center flex flex-col items-center justify-center space-y-3 font-mono">
            <div className="p-3 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/30 text-[#F0B90B]">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#EAECEF] uppercase tracking-wide">
                {t.scanningHighProbTitle}
              </h3>
              <p className="text-xs text-[#848E9C] max-w-md mx-auto">
                {t.buyEmptyNoiseDescPrefix} {noiseFilteredCount} {t.buyEmptyNoiseDescSuffix}
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

      {/* 3. Deep Dive Action Card for Selected Symbol (Strict >=75% Rule) */}
      {!activeSignal ? (
        <div className="py-14 px-6 rounded-2xl bg-[#121418] border border-[#2B2F36] border-dashed text-center flex flex-col items-center justify-center space-y-4 font-mono shadow-xl animate-pulse">
          <div className="p-3.5 rounded-full bg-[#0ECB81]/10 border border-[#0ECB81]/30 text-[#0ECB81]">
            <Activity className="w-7 h-7 animate-spin" />
          </div>
          <div className="space-y-1.5 max-w-lg">
            <h3 className="text-sm sm:text-base font-bold text-[#EAECEF] uppercase tracking-wide">
              {t.buySyncingTitle} {selectedSymbol}...
            </h3>
            <p className="text-xs text-[#848E9C] leading-relaxed">
              {marketLoading
                ? t.buySyncingDesc
                : t.awaitingNextScannerConfirm}
            </p>
          </div>
        </div>
      ) : activeSignal.opportunityScore >= 75 ? (
        <div className="space-y-4">
          {/* PRIMARY ACTION CARD (Clean, Decisive, Hide the Math) */}
          <div className="bg-[#121418] border border-[#2B2F36] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-[#2B2F36]">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0ECB81] flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#0ECB81] animate-ping" />
                  {t.buyHighConvictionDetected}
                </span>
                <div className="flex items-baseline gap-3">
                  <h3 className="text-2xl sm:text-3xl font-black text-[#EAECEF] font-mono">
                    {activeSignal.symbol}
                  </h3>
                  <span className="text-lg font-bold font-mono text-[#EAECEF]">
                    {formatCryptoDisplayPrice(activeSignal.currentPrice)}
                  </span>
                  <span className={`text-xs font-mono font-bold ${activeSignal.change24h >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                    {activeSignal.change24h >= 0 ? '+' : ''}{activeSignal.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getBadgeStyle(activeSignal.signalStrength)}`}>
                  {activeSignal.signalStrength.replace('_', ' ')}
                </span>
                <button
                  type="button"
                  onClick={() => setAnalyzingSignal(activeSignal)}
                  className="px-3 py-1 rounded-full text-xs font-bold font-mono border border-[#0ECB81]/40 bg-[#0ECB81]/15 hover:bg-[#0ECB81] text-[#0ECB81] hover:text-slate-950 transition flex items-center gap-1.5 shadow active:scale-95"
                  title={t.whyThisAlertTooltip}
                >
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>{t.whyThisAlertBtn}</span>
                </button>
              </div>
            </div>

            {/* Plain-Language 1-Sentence Verdict Banner */}
            <div className="mt-4 p-3.5 rounded-xl bg-[#0ECB81]/10 border border-[#0ECB81]/30 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#0ECB81] flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-[#EAECEF] font-medium leading-relaxed">
                {isEs ? activeSignal.rationaleEs : activeSignal.rationaleEn}
              </p>
            </div>

            {/* Grid: Favorability Gauge (Left) & Execution Blueprint (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-5 items-center">
              
              {/* Favorability Score Gauge (4 cols) */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-[#181A20] border border-[#2B2F36]">
                <span className="text-[10px] uppercase font-mono font-bold text-[#848E9C] tracking-wider mb-2">
                  {t.buyFavorabilityScore}
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
                      stroke={activeSignal.opportunityScore >= 85 ? '#0ECB81' : activeSignal.opportunityScore >= 70 ? '#F0B90B' : '#848E9C'}
                      strokeWidth="10"
                      strokeDasharray={326}
                      strokeDashoffset={326 - (326 * activeSignal.opportunityScore) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute text-center flex flex-col items-center">
                    <span className="text-3xl font-black font-mono text-[#EAECEF]">
                      {activeSignal.opportunityScore}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-[#848E9C]">/ 100</span>
                  </div>
                </div>
                <div className="text-[11px] font-mono font-semibold text-[#0ECB81] mt-2">
                  {t.buyHighReboundProb}
                </div>
              </div>

              {/* Execution Plan Box (ATR-based) (8 cols) */}
              <div className="md:col-span-8 p-4 rounded-xl bg-[#181A20] border border-[#2B2F36] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#2B2F36]">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#0ECB81]" />
                    <span className="text-xs font-bold font-mono text-[#EAECEF] uppercase tracking-wide">
                      {t.buyExecutionBlueprint}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#0ECB81] bg-[#0ECB81]/15 px-2 py-0.5 rounded border border-[#0ECB81]/30">
                    R:R 1 : {activeSignal.riskRewardRatio}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
                  {/* Entry Zone */}
                  <div className="p-2.5 rounded-lg bg-[#0B0E11] border border-[#2B2F36]">
                    <div className="text-[10px] text-[#848E9C] uppercase">{t.buyEntryZoneFull}</div>
                    <div className="text-sm font-bold text-[#EAECEF] mt-0.5">
                      {formatCryptoDisplayPrice(activeSignal.entryZone.min)} - {formatCryptoDisplayPrice(activeSignal.entryZone.max)}
                    </div>
                  </div>

                  {/* Stop Loss Invalidation (Capped at 4% max) */}
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30">
                    <div className="text-[10px] text-red-300 uppercase">{t.stopLossSafetyCap}</div>
                    <div className="text-sm font-bold text-red-400 mt-0.5">
                      {formatCryptoDisplayPrice(activeSignal.stopLoss)} ({(((activeSignal.stopLoss - activeSignal.currentPrice) / activeSignal.currentPrice) * 100).toFixed(2)}%)
                    </div>
                  </div>

                  {/* Target 1 (TP1) */}
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <div className="text-[10px] text-emerald-300 uppercase">{t.target1Tp1_15R}</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">
                      {formatCryptoDisplayPrice(activeSignal.takeProfit1)} (+{(((activeSignal.takeProfit1 - activeSignal.currentPrice) / activeSignal.currentPrice) * 100).toFixed(2)}%)
                    </div>
                  </div>

                  {/* Target 2 (TP2) */}
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <div className="text-[10px] text-emerald-300 uppercase">{t.target2Tp2_25R}</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">
                      {formatCryptoDisplayPrice(activeSignal.takeProfit2)} (+{(((activeSignal.takeProfit2 - activeSignal.currentPrice) / activeSignal.currentPrice) * 100).toFixed(2)}%)
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
                    handleDispatchTelegram();
                  }
                }}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#0088cc] via-[#0099ee] to-[#0ECB81] hover:brightness-110 active:scale-[0.99] text-white font-black text-sm sm:text-base shadow-xl shadow-sky-500/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <Send className="w-5 h-5 text-white" />
                <span>{t.receiveTelegram247Btn}</span>
              </button>
            </div>
          </div>

          {/* SECONDARY VIEW: Collapsible Technical Algorithm Details (Hidden by Default) */}
          <div className="bg-[#121418] border border-[#2B2F36] rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full flex items-center justify-between p-4 bg-[#181A20] hover:bg-[#20242B] text-xs font-mono font-bold text-[#848E9C] hover:text-[#EAECEF] transition select-none cursor-pointer"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Pillar 1: MFI */}
                  <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B2F36] space-y-1.5">
                    <div className="text-[10px] font-bold text-[#848E9C] uppercase">{t.buyPillar1Title}</div>
                    <div className="text-base font-bold text-[#EAECEF] flex items-center gap-1.5">
                      <span>{activeSignal.mfi}</span>
                      <span className="text-[10px] text-[#0ECB81] font-mono">+{activeSignal.mfiScoreContribution} pts</span>
                    </div>
                    <p className="text-[10px] text-[#848E9C] leading-snug">
                      {t.buyPillar1Desc}
                    </p>
                  </div>

                  {/* Pillar 2: Long Liquidations Flush */}
                  <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B2F36] space-y-1.5">
                    <div className="text-[10px] font-bold text-[#848E9C] uppercase">{t.buyPillar2Title}</div>
                    <div className="text-base font-bold text-[#EAECEF] flex items-center gap-1.5">
                      <span>${(activeSignal.longLiquidations1m / 1000).toFixed(0)}k</span>
                      <span className="text-[10px] text-amber-400 font-mono">+{activeSignal.liquidationScoreContribution} pts</span>
                    </div>
                    <p className="text-[10px] text-[#848E9C] leading-snug">
                      {t.buyPillar2Desc}
                    </p>
                  </div>

                  {/* Pillar 3: Funding Rate Squeeze */}
                  <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B2F36] space-y-1.5">
                    <div className="text-[10px] font-bold text-[#848E9C] uppercase">{t.futuresFundingLabel}</div>
                    <div className="text-base font-bold text-[#EAECEF] flex items-center gap-1.5">
                      <span>{(activeSignal.fundingRate * 100).toFixed(3)}%</span>
                      <span className="text-[10px] text-[#0ECB81] font-mono">+{activeSignal.fundingScoreContribution} pts</span>
                    </div>
                    <p className="text-[10px] text-[#848E9C] leading-snug">
                      {t.buyPillar3Desc}
                    </p>
                  </div>

                  {/* Pillar 4: Bid Absorption */}
                  <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B2F36] space-y-1.5">
                    <div className="text-[10px] font-bold text-[#848E9C] uppercase">{t.buyPillar4Title}</div>
                    <div className="text-base font-bold text-[#EAECEF] flex items-center gap-1.5">
                      <span>{(activeSignal.bidAbsorptionRatio * 100).toFixed(0)}% {t.buyPillar4BidsSuffix}</span>
                      <span className="text-[10px] text-[#0ECB81] font-mono">+{activeSignal.absorptionScoreContribution} pts</span>
                    </div>
                    <p className="text-[10px] text-[#848E9C] leading-snug">
                      {t.buyPillar4Desc}
                    </p>
                  </div>
                </div>

                {/* Technical Triggers Checklist */}
                <div className="p-4 rounded-xl bg-[#181A20] border border-[#2B2F36] space-y-2">
                  <div className="text-[11px] font-bold text-[#EAECEF] uppercase font-mono">
                    {t.buyConfirmedTriggersTitle}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className={`p-2 rounded bg-[#0B0E11] border ${activeSignal.triggers.mfiOversold ? 'border-[#0ECB81]/40 text-[#0ECB81]' : 'border-[#2B2F36] text-[#5E6673]'}`}>
                      ✓ {t.buyTrigMfi}
                    </div>
                    <div className={`p-2 rounded bg-[#0B0E11] border ${activeSignal.triggers.liquidationFlush ? 'border-[#0ECB81]/40 text-[#0ECB81]' : 'border-[#2B2F36] text-[#5E6673]'}`}>
                      ✓ {t.buyTrigLiq}
                    </div>
                    <div className={`p-2 rounded bg-[#0B0E11] border ${activeSignal.triggers.negativeOrNeutralFunding ? 'border-[#0ECB81]/40 text-[#0ECB81]' : 'border-[#2B2F36] text-[#5E6673]'}`}>
                      ✓ {t.buyTrigFunding}
                    </div>
                    <div className={`p-2 rounded bg-[#0B0E11] border ${activeSignal.triggers.orderBookAbsorption ? 'border-[#0ECB81]/40 text-[#0ECB81]' : 'border-[#2B2F36] text-[#5E6673]'}`}>
                      ✓ {t.buyTrigAbsorption}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Sleek Centered Empty-State UI when score < 75 */
        <div className="py-14 px-6 rounded-2xl bg-[#121418] border border-[#2B2F36] border-dashed text-center flex flex-col items-center justify-center space-y-4 font-mono shadow-xl">
          <div className="p-3.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[#F0B90B]">
            <Radio className="w-7 h-7 animate-pulse" />
          </div>
          <div className="space-y-1.5 max-w-lg">
            <h3 className="text-sm sm:text-base font-bold text-[#EAECEF] uppercase tracking-wide">
              ⏳ {t.scanningSetupsEllipsis}
            </h3>
            <p className="text-xs text-[#848E9C] leading-relaxed">
              {t.buyLowScoreDescPrefix} {activeSignal.opportunityScore}{t.buyLowScoreDescSuffix}
            </p>
          </div>
          <div className="text-[11px] text-[#848E9C] bg-[#181A20] px-3 py-1 rounded-full border border-[#2B2F36]">
            {t.only75SetupsShown}
          </div>
        </div>
      )}
        </>
      )}

      {/* Interactive Signal Rationale & Favorability Analyzer Modal */}
      <SignalRationaleModal
        isOpen={!!analyzingSignal}
        onClose={() => setAnalyzingSignal(null)}
        signalType="BUY"
        signal={analyzingSignal}
        currentMetrics={currentMetrics}
        onDispatchTelegram={(sig) => handleDispatchTelegram(sig)}
        isDispatchingTelegram={telegramDispatchStatus.loading}
      />

    </div>
  );
};
