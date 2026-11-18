import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Send,
  Sliders,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Crown,
  Radar,
  Lock,
  Loader2,
  Flame,
  Star,
  Globe,
} from "lucide-react";
import { useMarket } from "../context/MarketContext";
import { useCrypto } from "../context/CryptoContext";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useVolatilityShield } from "../context/VolatilityShieldContext";
import {
  BuySignalItem,
  SellSignalItem,
  BreakdownSignalItem,
  WinningSignalLedgerItem,
} from "../types";
import { formatCryptoDisplayPrice } from "../services/livePricesService";
import { TelegramLinkCard } from "./TelegramLinkCard";
import {
  getIsGlobalMuted,
  playBuySignalChime,
  playSellSignalChime,
} from "../utils/audioAlerts";

type UnifiedSignal =
  | { kind: "BUY"; item: BuySignalItem }
  | { kind: "SELL"; item: SellSignalItem }
  | { kind: "BREAKDOWN_WARNING"; item: BreakdownSignalItem };

export const CommandCenter: React.FC = () => {
  const {
    symbolsState,
    buySignals,
    sellSignals,
    breakdownSignals,
    monitoredSymbols,
    winningSignalsLedger,
    activeTrackedSignalsCount,
    globalRiskIndex,
    isCrashWarningActive,
    buyEligible,
    btcRiskIndex,
    ethRiskIndex,
    refreshMarketState,
  } = useMarket();

  const {
    cryptoList,
    availableSymbols,
    trackedSymbols: contextTrackedSymbols,
    isSymbolInWatchlist,
    toggleWatchlistSymbol,
    setIsManageModalOpen,
  } = useCrypto();

  const {
    isPremium,
    userProfile,
    openSubscriptionModal,
    updateTrackedSymbols,
    setIsTelegramModalOpen,
  } = useAuth();
  const { language, t } = useLanguage();
  const { isVolatilityShieldActive } = useVolatilityShield();

  const [signalFilter, setSignalFilter] = useState<"ALL" | "BUY" | "SELL">(
    "ALL",
  );
  const [watchlistScope, setWatchlistScope] = useState<"WATCHLIST" | "GLOBAL">(
    "WATCHLIST",
  );
  const [sendingSignalId, setSendingSignalId] = useState<string | null>(null);
  const [pushedMap, setPushedMap] = useState<Record<string, boolean>>({});
  const [pushErrorMap, setPushErrorMap] = useState<
    Record<string, string | null>
  >({});
  const [globalWinningSignals, setGlobalWinningSignals] = useState<
    WinningSignalLedgerItem[]
  >([]);
  const seenSignalsRef = useRef<Set<string>>(new Set());

  // Fetch Global 24h Winning Signals immediately on mount and poll every 20 seconds
  useEffect(() => {
    let isMounted = true;

    const fetchGlobalWinningSignals = async () => {
      try {
        const res = await fetch("/api/winning-signals");
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted) return;
        if (Array.isArray(data)) {
          setGlobalWinningSignals(data.slice(0, 20));
        } else if (Array.isArray(data?.winningSignalsLedger)) {
          setGlobalWinningSignals(data.winningSignalsLedger.slice(0, 20));
        } else if (Array.isArray(data?.winningSignals)) {
          setGlobalWinningSignals(data.winningSignals.slice(0, 20));
        }
      } catch {
        // Fallback to context winningSignalsLedger if network request transiently fails
      }
    };

    fetchGlobalWinningSignals();
    const pollInterval = setInterval(fetchGlobalWinningSignals, 20_000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, []);

  const displayedWinningSignals = useMemo<WinningSignalLedgerItem[]>(() => {
    const source =
      globalWinningSignals.length > 0
        ? globalWinningSignals
        : winningSignalsLedger;
    return source.slice(0, 20);
  }, [globalWinningSignals, winningSignalsLedger]);

  // Single unified Watchlist source of truth (tracked_symbols synchronized with Manage Coins)
  const trackedSymbols = useMemo<string[]>(() => {
    const source =
      contextTrackedSymbols.length > 0
        ? contextTrackedSymbols
        : Array.isArray(userProfile?.tracked_symbols) &&
            userProfile.tracked_symbols.length > 0
          ? userProfile.tracked_symbols
          : availableSymbols;
    return Array.from(
      new Set(
        source
          .map((s) =>
            String(s || "")
              .toUpperCase()
              .trim(),
          )
          .filter(Boolean)
          .map((s) => (s.endsWith("USDT") ? s : `${s}USDT`)),
      ),
    );
  }, [contextTrackedSymbols, userProfile?.tracked_symbols, availableSymbols]);

  const trackedSet = useMemo(() => new Set(trackedSymbols), [trackedSymbols]);

  // All server-monitored pairs for Global Radar scope
  const allSymbols = useMemo<string[]>(() => {
    return Array.from(
      new Set(
        [
          ...monitoredSymbols,
          ...Object.keys(symbolsState),
          ...trackedSymbols,
          ...buySignals.map((s) => s.symbol),
          ...sellSignals.map((s) => s.symbol),
          ...breakdownSignals.map((s) => s.symbol),
        ]
          .map((s) =>
            String(s || "")
              .toUpperCase()
              .trim(),
          )
          .filter(Boolean),
      ),
    );
  }, [
    monitoredSymbols,
    symbolsState,
    trackedSymbols,
    buySignals,
    sellSignals,
    breakdownSignals,
  ]);

  // Mutual Exclusion Rule: Strictly hide ALL Buy signals when Global Risk Index >= 80
  const isCrashShieldLocked =
    globalRiskIndex >= 80 || isCrashWarningActive || !buyEligible;

  // Coins with elevated individual risk (riskIndex >= 65) displayed inside Block 1
  const coinsUnderSellingPressure = useMemo(() => {
    return Object.values(symbolsState)
      .filter((coin) => Number.isFinite(coin.riskIndex) && coin.riskIndex >= 65)
      .sort((a, b) => b.riskIndex - a.riskIndex);
  }, [symbolsState]);

  // Qualifying high-probability signals (score >= 75), filtered by Watchlist Scope and Direction
  const unifiedSignals = useMemo<UnifiedSignal[]>(() => {
    const qualifiedBuys: UnifiedSignal[] = isCrashShieldLocked
      ? []
      : buySignals
          .filter((s) => s.opportunityScore >= 75 && !s.isBuyLocked)
          .map((item) => ({ kind: "BUY" as const, item }));

    const qualifiedSells: UnifiedSignal[] = sellSignals
      .filter((s) => s.opportunityScore >= 75)
      .map((item) => ({ kind: "SELL" as const, item }));

    const qualifiedBreakdowns: UnifiedSignal[] = breakdownSignals
      .filter((s) => s.opportunityScore >= 75)
      .map((item) => ({ kind: "BREAKDOWN_WARNING" as const, item }));

    const combined = [
      ...qualifiedBreakdowns,
      ...qualifiedBuys,
      ...qualifiedSells,
    ].sort((a, b) => b.item.opportunityScore - a.item.opportunityScore);

    // 1. Scope Filter: strictly filter to tracked_symbols when My Watchlist is active
    const scoped =
      watchlistScope === "WATCHLIST"
        ? combined.filter((s) =>
            trackedSet.has(
              String(s.item.symbol || "")
                .toUpperCase()
                .trim(),
            ),
          )
        : combined;

    // 2. Direction Filter
    if (signalFilter === "BUY") {
      return scoped.filter((s) => s.kind === "BUY");
    }
    if (signalFilter === "SELL") {
      return scoped.filter(
        (s) => s.kind === "SELL" || s.kind === "BREAKDOWN_WARNING",
      );
    }
    return scoped;
  }, [
    buySignals,
    sellSignals,
    breakdownSignals,
    isCrashShieldLocked,
    watchlistScope,
    trackedSet,
    signalFilter,
  ]);

  // Play crisp audio chime on genuinely new qualifying signals, strictly honoring global mute
  useEffect(() => {
    if (unifiedSignals.length === 0) return;

    let hasNewBuy = false;
    let hasNewSell = false;

    for (const sig of unifiedSignals) {
      const key = `${sig.kind}_${sig.item.symbol}`;
      if (!seenSignalsRef.current.has(key)) {
        seenSignalsRef.current.add(key);
        if (sig.kind === "BUY") hasNewBuy = true;
        else hasNewSell = true;
      }
    }

    if (hasNewBuy || hasNewSell) {
      if (getIsGlobalMuted()) return;
      if (hasNewSell) {
        playSellSignalChime(0.18);
      } else if (hasNewBuy) {
        playBuySignalChime(0.18);
      }
    }
  }, [unifiedSignals]);

  // Determine Block 1 risk tier styling & exact plain-language status copy
  const riskTier = useMemo(() => {
    if (globalRiskIndex >= 80 || isCrashWarningActive) {
      return {
        statusText: t.ccStatusCrash,
        borderClass: "border-[#F6465D]/60 bg-[#F6465D]/10",
        scoreTextClass: "text-[#F6465D]",
        barBgClass: "bg-[#F6465D]",
        icon: <ShieldAlert className="w-7 h-7 text-[#F6465D]" />,
      };
    }
    if (globalRiskIndex >= 60) {
      return {
        statusText: t.ccStatusCaution,
        borderClass: "border-[#F0B90B]/50 bg-[#F0B90B]/10",
        scoreTextClass: "text-[#F0B90B]",
        barBgClass: "bg-[#F0B90B]",
        icon: <AlertTriangle className="w-7 h-7 text-[#F0B90B]" />,
      };
    }
    return {
      statusText: t.ccStatusStable,
      borderClass: "border-[#0ECB81]/40 bg-[#0ECB81]/10",
      scoreTextClass: "text-[#0ECB81]",
      barBgClass: "bg-[#0ECB81]",
      icon: <ShieldCheck className="w-7 h-7 text-[#0ECB81]" />,
    };
  }, [globalRiskIndex, isCrashWarningActive, t]);

  const handleQuickToggleWatchlist = async (
    symbol: string,
    livePrice?: number,
  ) => {
    toggleWatchlistSymbol(symbol, livePrice);
    setTimeout(() => {
      refreshMarketState().catch(() => {});
    }, 250);
  };

  const ensureSymbolTracked = async (rawSymbol: string, livePrice?: number) => {
    const sym = String(rawSymbol || "")
      .toUpperCase()
      .trim();
    if (!sym) return;
    if (!isSymbolInWatchlist(sym)) {
      toggleWatchlistSymbol(sym, livePrice);
    } else if (!trackedSet.has(sym)) {
      await updateTrackedSymbols([...trackedSymbols, sym]);
    }
  };

  const handlePushSignalToTelegram = async (sig: UnifiedSignal) => {
    const item = sig.item;
    const symbol = item.symbol;
    const pushKey = `${sig.kind}_${symbol}`;
    const telegramChatId = userProfile?.telegram_chat_id?.trim() || "";

    setPushErrorMap((prev) => ({ ...prev, [pushKey]: null }));

    // Case A: No Telegram Chat ID configured yet -> pre-select symbol in tracked_symbols & open Telegram Configuration Modal
    if (!telegramChatId) {
      try {
        await ensureSymbolTracked(symbol, item.currentPrice);
      } catch (err) {
        console.warn(
          "[CommandCenter] Failed to pre-add symbol to tracked_symbols:",
          err,
        );
      }
      setIsTelegramModalOpen(true);
      return;
    }

    // Case B: Telegram Chat ID is configured -> send signal directly via /api/telegram/push-signal
    const formattedPrice = formatCryptoDisplayPrice(item.currentPrice);
    let signalPayload: Record<string, any>;

    if (sig.kind === "BREAKDOWN_WARNING") {
      const bd = sig.item;
      const formattedBrokenSupport = formatCryptoDisplayPrice(bd.brokenSupport);
      const formattedEmergencyExit = formatCryptoDisplayPrice(bd.emergencyExit);
      const formattedDownside1 = formatCryptoDisplayPrice(bd.downsideTarget1);
      const formattedDownside2 = formatCryptoDisplayPrice(bd.downsideTarget2);
      const summaryText = t.ccBreakdownSimpleDesc.replace("{symbol}", symbol);

      signalPayload = {
        symbol,
        type: "BREAKDOWN_WARNING",
        price: formattedPrice,
        currentPrice: bd.currentPrice,
        score: Math.round(bd.opportunityScore),
        summary: summaryText,
        brokenSupport: formattedBrokenSupport,
        stopLoss: formattedEmergencyExit,
        tp1: formattedDownside1,
        tp2: formattedDownside2,
      };
    } else {
      const formattedEntryZone = `${formatCryptoDisplayPrice(item.entryZone?.min)} – ${formatCryptoDisplayPrice(item.entryZone?.max)}`;
      const formattedStopLoss = formatCryptoDisplayPrice(item.stopLoss);
      const formattedTp1 = formatCryptoDisplayPrice(item.takeProfit1);
      const formattedTp2 = formatCryptoDisplayPrice(item.takeProfit2);
      const summaryText = (
        sig.kind === "BUY" ? t.ccBuySimpleDesc : t.ccSellSimpleDesc
      ).replace("{sl}", formattedStopLoss);

      signalPayload = {
        symbol,
        type: sig.kind,
        price: formattedPrice,
        currentPrice: item.currentPrice,
        score: Math.round(item.opportunityScore),
        summary: summaryText,
        entryZone: formattedEntryZone,
        stopLoss: formattedStopLoss,
        tp1: formattedTp1,
        tp2: formattedTp2,
      };
    }

    setSendingSignalId(pushKey);

    try {
      // Ensure coin is tracked in Firestore for future 24/7 updates
      ensureSymbolTracked(symbol, item.currentPrice).catch((err) => {
        console.warn("[CommandCenter] Could not sync tracked_symbols:", err);
      });

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const res = await fetch("/api/telegram/push-signal", {
        method: "POST",
        headers,
        body: JSON.stringify({
          chatId: telegramChatId,
          signal: signalPayload,
          lang: language,
          userId: userProfile?.uid,
        }),
      });

      const raw = await res.text();
      let parsed: any = null;
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = null;
      }

      if (res.status === 403 && parsed?.code === "EXPIRED") {
        const expMsg =
          parsed?.error ||
          (language === "es"
            ? "Tu suscripción PRO ha expirado. Renueva para continuar."
            : "Your PRO subscription has expired. Please renew to continue.");
        setPushErrorMap((prev) => ({ ...prev, [pushKey]: expMsg }));
        openSubscriptionModal();
        return;
      }

      if (res.ok && parsed?.success) {
        setPushedMap((prev) => ({ ...prev, [pushKey]: true }));
        setTimeout(() => {
          setPushedMap((prev) => ({ ...prev, [pushKey]: false }));
        }, 3000);
      } else {
        const errMsg =
          parsed?.error ||
          parsed?.message ||
          `HTTP ${res.status}: Failed to send Telegram alert`;
        setPushErrorMap((prev) => ({ ...prev, [pushKey]: errMsg }));
      }
    } catch (err: any) {
      console.warn("[CommandCenter] Manual Telegram push failed:", err);
      setPushErrorMap((prev) => ({
        ...prev,
        [pushKey]:
          err?.message || "Network error while sending alert to Telegram",
      }));
    } finally {
      setSendingSignalId(null);
    }
  };

  const getCoinIcon = (symbol: string) => {
    const match = cryptoList.find((c) => c.symbol === symbol);
    return match?.icon || "🪙";
  };

  const formatStopDistancePct = (entry: number, stop: number): string => {
    if (!Number.isFinite(entry) || !Number.isFinite(stop) || entry <= 0) {
      return "4.0%";
    }
    const rawPct = Math.abs((entry - stop) / entry) * 100;
    const capped = Math.min(4.0, Math.max(0.1, rawPct));
    return `${capped.toFixed(1)}%`;
  };

  const formatRelativeTime = (
    ts: number,
    lang: "en" | "es" = language,
  ): string => {
    if (!Number.isFinite(ts) || ts <= 0) {
      return lang === "es" ? "Ahora mismo" : "Just now";
    }
    const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (diffSec < 60) {
      return lang === "es" ? "Ahora mismo" : "Just now";
    }
    const diffMins = Math.floor(diffSec / 60);
    if (diffMins < 60) {
      if (diffMins === 1) {
        return lang === "es" ? "Hace 1 min" : "1 min ago";
      }
      return lang === "es" ? `Hace ${diffMins} mins` : `${diffMins} mins ago`;
    }
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      if (diffHours === 1) {
        return lang === "es" ? "Hace 1 hora" : "1 hour ago";
      }
      return lang === "es"
        ? `Hace ${diffHours} horas`
        : `${diffHours} hours ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) {
      return lang === "es" ? "Hace 1 día" : "1 day ago";
    }
    return lang === "es" ? `Hace ${diffDays} días` : `${diffDays} days ago`;
  };

  const formatLocalTooltipTime = (ts: number): string => {
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return "";
    }
  };

  return (
    <div className="space-y-8 pb-6">
      {/* ===================================================================== */}
      {/* BLOCK 1: GLOBAL FLASH CRASH SHIELD (TOP BANNER)                       */}
      {/* ===================================================================== */}
      <section
        aria-label={t.ccBlock1Label}
        className={`rounded-2xl border p-5 sm:p-6 transition-colors ${riskTier.borderClass}`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Shield Icon + Plain-Language Market Status */}
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#0B0E11]/80 border border-[#2B2F36] shrink-0">
              {riskTier.icon}
            </div>
            <div className="space-y-1.5">
              <div className="text-xs font-mono uppercase tracking-wider text-[#848E9C] font-semibold">
                {t.ccBlock1Label}
              </div>
              <h2 className="text-base sm:text-xl font-bold text-[#EAECEF] leading-snug">
                {riskTier.statusText}
              </h2>

              {isVolatilityShieldActive && (
                <div className="inline-flex items-center gap-2 text-xs text-amber-300 bg-amber-500/15 border border-amber-500/30 rounded-lg px-2.5 py-1 mt-1">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.ccMacroShieldBanner}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Market Risk Index Gauge + BTC / ETH Health */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-5 bg-[#0B0E11]/75 border border-[#2B2F36] rounded-xl px-4 py-3 shrink-0">
            <div className="min-w-[140px]">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#848E9C] mb-1">
                <span>{t.ccRiskIndexLabel}</span>
                <span
                  className={`font-bold tabular-nums text-sm ${riskTier.scoreTextClass}`}
                >
                  {Math.round(globalRiskIndex)}/100
                </span>
              </div>
              <div className="h-2 w-full rounded-sm bg-[#181A20] overflow-hidden">
                <div
                  className={`h-full rounded-sm transition-all duration-500 ${riskTier.barBgClass}`}
                  style={{
                    width: `${Math.min(100, Math.max(4, globalRiskIndex))}%`,
                  }}
                />
              </div>
            </div>

            <div className="h-8 w-px bg-[#2B2F36] hidden sm:block" />

            <div className="flex items-center gap-4 font-mono text-xs">
              <div>
                <div className="text-[10px] text-[#848E9C] uppercase">
                  {t.ccBtcHealthLabel}
                </div>
                <div
                  className={`font-bold tabular-nums text-sm ${
                    btcRiskIndex >= 80
                      ? "text-[#F6465D]"
                      : btcRiskIndex >= 65
                        ? "text-[#F0B90B]"
                        : "text-[#EAECEF]"
                  }`}
                >
                  {Math.round(btcRiskIndex)}/100
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#848E9C] uppercase">
                  {t.ccEthHealthLabel}
                </div>
                <div
                  className={`font-bold tabular-nums text-sm ${
                    ethRiskIndex >= 80
                      ? "text-[#F6465D]"
                      : ethRiskIndex >= 65
                        ? "text-[#F0B90B]"
                        : "text-[#EAECEF]"
                  }`}
                >
                  {Math.round(ethRiskIndex)}/100
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specific Dropping / High-Risk Coins Under Selling Pressure */}
        {coinsUnderSellingPressure.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#2B2F36]/70 flex flex-col sm:flex-row sm:items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#F6465D] shrink-0">
              <Flame className="w-3.5 h-3.5" />
              <span>{t.ccSellingPressureTitle}:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {coinsUnderSellingPressure.map((coin) => {
                const chg1h =
                  typeof coin.priceChange1h === "number"
                    ? coin.priceChange1h
                    : typeof coin.priceChange5m === "number"
                      ? coin.priceChange5m
                      : 0;
                const isSevere = coin.riskIndex >= 80;
                return (
                  <span
                    key={coin.symbol}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-xs font-semibold tabular-nums ${
                      isSevere
                        ? "bg-[#F6465D]/15 border-[#F6465D]/40 text-[#F6465D]"
                        : "bg-[#F0B90B]/15 border-[#F0B90B]/40 text-[#F0B90B]"
                    }`}
                  >
                    <span>⚠️ {coin.symbol}</span>
                    <span className="text-[#EAECEF]/90">
                      ({t.ccRiskShortLabel}: {Math.round(coin.riskIndex)}
                      {Number.isFinite(chg1h)
                        ? ` | 1h: ${chg1h >= 0 ? "+" : ""}${chg1h.toFixed(2)}%`
                        : ""}
                      )
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ===================================================================== */}
      {/* BLOCK 2: UNIFIED ACTIVE SIGNALS FEED (ZERO TECHNICAL JARGON)          */}
      {/* ===================================================================== */}
      <section aria-label={t.ccBlock2Title} className="space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#EAECEF] tracking-tight">
              {t.ccBlock2Title}
            </h2>
            <p className="text-xs sm:text-sm text-[#848E9C] mt-0.5">
              {t.ccBlock2Subtitle}
            </p>
          </div>

          {/* Scope Toggle (My Watchlist vs Global Radar) + Direction Filter Controls */}
          <div className="flex flex-wrap items-center gap-2 self-start xl:self-auto">
            {/* Watchlist Scope Toggle */}
            <div className="inline-flex items-center gap-1 bg-[#181A20] border border-[#2B2F36] rounded-xl p-1 font-mono text-xs">
              <button
                type="button"
                onClick={() => setWatchlistScope("WATCHLIST")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                  watchlistScope === "WATCHLIST"
                    ? "bg-[#F0B90B]/20 text-[#F0B90B] border border-[#F0B90B]/40"
                    : "text-[#848E9C] hover:text-[#EAECEF]"
                }`}
              >
                <Star
                  className={`w-3.5 h-3.5 ${watchlistScope === "WATCHLIST" ? "fill-[#F0B90B] text-[#F0B90B]" : ""}`}
                />
                <span>
                  {t.ccScopeWatchlist} ({trackedSymbols.length})
                </span>
              </button>
              <button
                type="button"
                onClick={() => setWatchlistScope("GLOBAL")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                  watchlistScope === "GLOBAL"
                    ? "bg-[#F0B90B]/20 text-[#F0B90B] border border-[#F0B90B]/40"
                    : "text-[#848E9C] hover:text-[#EAECEF]"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>
                  {t.ccScopeGlobalRadar} ({allSymbols.length})
                </span>
              </button>
            </div>

            {/* Direction Filter Controls */}
            <div className="inline-flex items-center gap-1 bg-[#181A20] border border-[#2B2F36] rounded-xl p-1 font-mono text-xs">
              <button
                type="button"
                onClick={() => setSignalFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  signalFilter === "ALL"
                    ? "bg-[#F0B90B] text-slate-950"
                    : "text-[#848E9C] hover:text-[#EAECEF]"
                }`}
              >
                {t.ccFilterAll}
              </button>
              <button
                type="button"
                onClick={() => setSignalFilter("BUY")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  signalFilter === "BUY"
                    ? "bg-[#0ECB81] text-slate-950"
                    : "text-[#848E9C] hover:text-[#EAECEF]"
                }`}
              >
                {t.ccFilterBuy}
              </button>
              <button
                type="button"
                onClick={() => setSignalFilter("SELL")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  signalFilter === "SELL"
                    ? "bg-[#F6465D] text-white"
                    : "text-[#848E9C] hover:text-[#EAECEF]"
                }`}
              >
                {t.ccFilterSell}
              </button>
            </div>
          </div>
        </div>

        {/* Notice when Crash Shield forces Buy Signals hidden */}
        {isCrashShieldLocked && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#F6465D]/10 border border-[#F6465D]/30 text-xs text-[#EAECEF]">
            <Lock className="w-4 h-4 text-[#F6465D] shrink-0" />
            <span>{t.ccCrashBuyLockedNote}</span>
          </div>
        )}

        {/* Qualifying Action Cards Grid OR Calm Empty State */}
        {unifiedSignals.length === 0 ? (
          <div className="bg-[#181A20] border border-[#2B2F36] rounded-2xl p-8 sm:p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#121418] border border-[#2B2F36] flex items-center justify-center mx-auto text-[#F0B90B]">
              <Radar className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#EAECEF] uppercase tracking-wide font-mono">
              {watchlistScope === "WATCHLIST"
                ? t.ccEmptyWatchlistSignalsTitle
                : t.ccEmptySignalsTitle}
            </h3>
            <p className="text-sm text-[#848E9C] max-w-xl mx-auto leading-relaxed">
              {watchlistScope === "WATCHLIST"
                ? t.ccEmptyWatchlistSignalsDesc
                : t.ccEmptySignalsDesc}
            </p>
            {watchlistScope === "WATCHLIST" && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWatchlistScope("GLOBAL")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#121418] hover:bg-[#2B2F36] border border-[#2B2F36] text-[#F0B90B] font-mono text-xs font-bold transition"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>
                    {t.ccSwitchToGlobalRadarBtn} ({allSymbols.length})
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsManageModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#121418] hover:bg-[#2B2F36] border border-[#2B2F36] text-[#EAECEF] font-mono text-xs font-bold transition"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#F0B90B]" />
                  <span>{t.ccManageCoinsBtn}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {unifiedSignals.map((sig) => {
              const isBreakdown = sig.kind === "BREAKDOWN_WARNING";
              const isBuy = sig.kind === "BUY";
              const item = sig.item;
              const pushKey = `${sig.kind}_${item.symbol}`;
              const isPushing = sendingSignalId === pushKey;
              const wasPushed = !!pushedMap[pushKey];
              const pushError = pushErrorMap[pushKey];
              const inWatchlist = trackedSet.has(item.symbol.toUpperCase());

              if (isBreakdown) {
                const bd = sig.item;
                const formattedBrokenSupport = formatCryptoDisplayPrice(
                  bd.brokenSupport,
                );
                const formattedEmergencyStop = formatCryptoDisplayPrice(
                  bd.emergencyExit,
                );
                const formattedDownside1 = formatCryptoDisplayPrice(
                  bd.downsideTarget1,
                );
                const formattedDownside2 = formatCryptoDisplayPrice(
                  bd.downsideTarget2,
                );
                const headline = t.ccBreakdownHeadline.replace(
                  "{symbol}",
                  bd.symbol,
                );
                const explanation = t.ccBreakdownSimpleDesc.replace(
                  "{symbol}",
                  bd.symbol,
                );

                return (
                  <article
                    key={pushKey}
                    className="bg-[#181A20] border border-[#F6465D]/50 rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-[#F6465D]/80 transition"
                  >
                    {/* Top Row: Asset + Live Price + Breakdown Badge + 1-Click Watchlist Toggle */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#F6465D]/15 border border-[#F6465D]/35 flex items-center justify-center text-lg shrink-0">
                          {getCoinIcon(bd.symbol)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-base text-[#EAECEF]">
                              {bd.symbol}
                            </span>
                            <span className="font-mono text-[11px] text-[#F6465D] font-semibold tabular-nums">
                              {t.ccConfidenceLabel}{" "}
                              {Math.round(bd.opportunityScore)}/100
                            </span>
                          </div>
                          <div className="flex items-center gap-2 font-mono mt-0.5">
                            <span className="font-bold text-lg text-[#F0B90B] tabular-nums">
                              {formatCryptoDisplayPrice(bd.currentPrice)}
                            </span>
                            <span className="text-xs font-semibold text-[#F6465D] tabular-nums">
                              (1h: {bd.priceChange1h >= 0 ? "+" : ""}
                              {bd.priceChange1h.toFixed(2)}%)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-xs font-bold border bg-[#F6465D]/20 text-[#F6465D] border-[#F6465D]/40">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{t.ccBadgeBreakdown}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleQuickToggleWatchlist(
                              bd.symbol,
                              bd.currentPrice,
                            )
                          }
                          title={
                            inWatchlist
                              ? t.ccRemoveFromWatchlistTooltip
                              : t.ccAddToWatchlistTooltip
                          }
                          aria-label={
                            inWatchlist
                              ? t.ccRemoveFromWatchlistTooltip
                              : t.ccAddToWatchlistTooltip
                          }
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border transition ${
                            inWatchlist
                              ? "bg-[#F0B90B]/15 text-[#F0B90B] border-[#F0B90B]/40 hover:bg-[#F6465D]/15 hover:text-[#F6465D] hover:border-[#F6465D]/40"
                              : "bg-[#121418] text-[#848E9C] border-[#2B2F36] hover:text-[#F0B90B] hover:border-[#F0B90B]/40"
                          }`}
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${inWatchlist ? "fill-[#F0B90B] text-[#F0B90B]" : ""}`}
                          />
                          <span className="hidden sm:inline">
                            {inWatchlist
                              ? t.ccInWatchlistBtn
                              : t.ccAddToWatchlistBtn}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Explicit Breakdown Headline & Plain-Language Warning */}
                    <div className="space-y-1.5">
                      <div className="font-mono text-xs font-bold text-[#F6465D] tracking-wide">
                        {headline}
                      </div>
                      <p className="text-sm text-[#EAECEF]/90 leading-relaxed">
                        {explanation}
                      </p>
                    </div>

                    {/* Actionable Protection Plan Box */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-[#121418] border border-[#F6465D]/30 rounded-xl p-3 font-mono text-xs">
                      <div>
                        <div className="text-[10px] text-[#848E9C] uppercase">
                          {t.ccPlanBrokenSupport}
                        </div>
                        <div className="font-bold text-[#F0B90B] tabular-nums mt-1">
                          {formattedBrokenSupport}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-[#848E9C] uppercase">
                          {t.ccPlanEmergencyExit}
                        </div>
                        <div className="font-bold text-[#F6465D] tabular-nums mt-1">
                          {formattedEmergencyStop}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-[#848E9C] uppercase">
                          {t.ccPlanDownside1}
                        </div>
                        <div className="font-bold text-[#F6465D] tabular-nums mt-1">
                          {formattedDownside1}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-[#848E9C] uppercase">
                          {t.ccPlanDownside2}
                        </div>
                        <div className="font-bold text-[#F6465D] tabular-nums mt-1">
                          {formattedDownside2}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action: Push to Telegram (PRO) or Upgrade CTA (Free) */}
                    <div className="flex flex-col items-end gap-2 pt-1">
                      {isPremium ? (
                        <button
                          type="button"
                          onClick={() => handlePushSignalToTelegram(sig)}
                          disabled={isPushing}
                          className={`px-3.5 py-2 rounded-lg font-mono text-xs font-bold transition flex items-center gap-2 disabled:opacity-70 ${
                            wasPushed
                              ? "bg-[#0ECB81]/20 text-[#0ECB81] border border-[#0ECB81]/40"
                              : "bg-[#0088cc] hover:bg-[#0077b5] text-white"
                          }`}
                        >
                          {isPushing ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>{t.ccSendingToTelegram}</span>
                            </>
                          ) : wasPushed ? (
                            <span>{t.ccSentToTelegramOk}</span>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>{t.ccSendToTelegramBtn}</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={openSubscriptionModal}
                          className="px-3.5 py-2 rounded-lg font-mono text-xs font-bold bg-[#F0B90B] hover:bg-[#fcd535] text-slate-950 transition flex items-center gap-2"
                        >
                          <Crown className="w-3.5 h-3.5" />
                          <span>{t.ccUnlockTelegramCta}</span>
                        </button>
                      )}

                      {pushError && (
                        <div className="w-full text-left text-[11px] font-mono text-[#F6465D] bg-[#F6465D]/10 border border-[#F6465D]/30 rounded-lg px-3 py-1.5">
                          {pushError}
                        </div>
                      )}
                    </div>
                  </article>
                );
              }

              const formattedSl = formatCryptoDisplayPrice(item.stopLoss);
              const simpleExplanation = (
                isBuy ? t.ccBuySimpleDesc : t.ccSellSimpleDesc
              ).replace("{sl}", formattedSl);
              const stopDistance = formatStopDistancePct(
                item.currentPrice,
                item.stopLoss,
              );

              return (
                <article
                  key={pushKey}
                  className="bg-[#181A20] border border-[#2B2F36] rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-[#363C4E] transition"
                >
                  {/* Top Row: Asset + Live Price + Direction Badge + 1-Click Watchlist Toggle */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#121418] border border-[#2B2F36] flex items-center justify-center text-lg shrink-0">
                        {getCoinIcon(item.symbol)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-base text-[#EAECEF]">
                            {item.symbol}
                          </span>
                          <span className="font-mono text-[11px] text-[#848E9C] tabular-nums">
                            {t.ccConfidenceLabel}{" "}
                            {Math.round(item.opportunityScore)}/100
                          </span>
                        </div>
                        <div className="font-mono font-bold text-lg text-[#F0B90B] tabular-nums mt-0.5">
                          {formatCryptoDisplayPrice(item.currentPrice)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-xs font-bold border ${
                          isBuy
                            ? "bg-[#0ECB81]/15 text-[#0ECB81] border-[#0ECB81]/30"
                            : "bg-[#F6465D]/15 text-[#F6465D] border-[#F6465D]/30"
                        }`}
                      >
                        {isBuy ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        <span>{isBuy ? t.ccBadgeBuy : t.ccBadgeSell}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          handleQuickToggleWatchlist(
                            item.symbol,
                            item.currentPrice,
                          )
                        }
                        title={
                          inWatchlist
                            ? t.ccRemoveFromWatchlistTooltip
                            : t.ccAddToWatchlistTooltip
                        }
                        aria-label={
                          inWatchlist
                            ? t.ccRemoveFromWatchlistTooltip
                            : t.ccAddToWatchlistTooltip
                        }
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border transition ${
                          inWatchlist
                            ? "bg-[#F0B90B]/15 text-[#F0B90B] border-[#F0B90B]/40 hover:bg-[#F6465D]/15 hover:text-[#F6465D] hover:border-[#F6465D]/40"
                            : "bg-[#121418] text-[#848E9C] border-[#2B2F36] hover:text-[#F0B90B] hover:border-[#F0B90B]/40"
                        }`}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${inWatchlist ? "fill-[#F0B90B] text-[#F0B90B]" : ""}`}
                        />
                        <span className="hidden sm:inline">
                          {inWatchlist
                            ? t.ccInWatchlistBtn
                            : t.ccAddToWatchlistBtn}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* 1-Sentence Plain-Language Explanation (ZERO technical jargon) */}
                  <p className="text-sm text-[#EAECEF]/90 leading-relaxed">
                    {simpleExplanation}
                  </p>

                  {/* ATR Execution Plan Box */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-[#121418] border border-[#2B2F36] rounded-xl p-3 font-mono text-xs">
                    <div>
                      <div className="text-[10px] text-[#848E9C] uppercase">
                        {t.ccPlanEntryZone}
                      </div>
                      <div className="font-bold text-[#EAECEF] tabular-nums mt-1 text-[11px]">
                        {formatCryptoDisplayPrice(item.entryZone?.min)} –{" "}
                        {formatCryptoDisplayPrice(item.entryZone?.max)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-[#848E9C] uppercase flex items-center gap-1">
                        <span>{t.ccPlanStopLoss}</span>
                      </div>
                      <div className="font-bold text-[#F6465D] tabular-nums mt-1">
                        {formattedSl}
                      </div>
                      <div className="text-[10px] text-[#848E9C] tabular-nums">
                        {stopDistance} ({t.ccPlanMaxStopNote})
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-[#848E9C] uppercase">
                        {t.ccPlanTp1}
                      </div>
                      <div className="font-bold text-[#0ECB81] tabular-nums mt-1">
                        {formatCryptoDisplayPrice(item.takeProfit1)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-[#848E9C] uppercase">
                        {t.ccPlanTp2}
                      </div>
                      <div className="font-bold text-[#0ECB81] tabular-nums mt-1">
                        {formatCryptoDisplayPrice(item.takeProfit2)}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action: Push to Telegram (PRO) or Upgrade CTA (Free) */}
                  <div className="flex flex-col items-end gap-2 pt-1">
                    {isPremium ? (
                      <button
                        type="button"
                        onClick={() => handlePushSignalToTelegram(sig)}
                        disabled={isPushing}
                        className={`px-3.5 py-2 rounded-lg font-mono text-xs font-bold transition flex items-center gap-2 disabled:opacity-70 ${
                          wasPushed
                            ? "bg-[#0ECB81]/20 text-[#0ECB81] border border-[#0ECB81]/40"
                            : "bg-[#0088cc] hover:bg-[#0077b5] text-white"
                        }`}
                      >
                        {isPushing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>{t.ccSendingToTelegram}</span>
                          </>
                        ) : wasPushed ? (
                          <span>{t.ccSentToTelegramOk}</span>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>{t.ccSendToTelegramBtn}</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={openSubscriptionModal}
                        className="px-3.5 py-2 rounded-lg font-mono text-xs font-bold bg-[#F0B90B] hover:bg-[#fcd535] text-slate-950 transition flex items-center gap-2"
                      >
                        <Crown className="w-3.5 h-3.5" />
                        <span>{t.ccUnlockTelegramCta}</span>
                      </button>
                    )}

                    {pushError && (
                      <div className="w-full text-left text-[11px] font-mono text-[#F6465D] bg-[#F6465D]/10 border border-[#F6465D]/30 rounded-lg px-3 py-1.5">
                        {pushError}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ===================================================================== */}
      {/* BLOCK 3: TELEGRAM 24/7 HUB & DYNAMIC COIN SELECTOR                    */}
      {/* ===================================================================== */}
      <section
        id="telegram-hub-block"
        aria-label={t.ccBlock3Title}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#EAECEF] tracking-tight">
              {t.ccBlock3Title}
            </h2>
            <p className="text-xs sm:text-sm text-[#848E9C] mt-0.5">
              {t.ccBlock3Subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsManageModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#181A20] hover:bg-[#2B2F36] border border-[#2B2F36] hover:border-[#F0B90B]/50 text-[#EAECEF] font-mono text-xs font-bold transition self-start sm:self-auto"
          >
            <Sliders className="w-3.5 h-3.5 text-[#F0B90B]" />
            <span>{t.ccManageCoinsBtn}</span>
            <span className="text-[#848E9C] tabular-nums">
              ({trackedSymbols.length} {t.ccMonitoredCountLabel})
            </span>
          </button>
        </div>

        <TelegramLinkCard availableSymbols={trackedSymbols} />
      </section>

      {/* ===================================================================== */}
      {/* BLOCK 4: RECENT WINNING SIGNALS LEDGER (FOMO PROOF ENGINE)            */}
      {/* ===================================================================== */}
      <section aria-label={t.ccBlock4Title} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#F0B90B]" />
              <h2 className="text-lg sm:text-xl font-bold text-[#EAECEF] tracking-tight">
                {t.ccBlock4Title}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#848E9C] mt-0.5">
              {t.ccBlock4Subtitle}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#181A20] border border-[#2B2F36] font-mono text-xs text-[#848E9C] self-start sm:self-auto">
            <span className="text-[#0ECB81] font-bold tabular-nums">
              {displayedWinningSignals.length}
            </span>
            <span>•</span>
            <span>{t.ccTrackerActiveBadge}</span>
          </div>
        </div>

        <div className="bg-[#181A20] border border-[#2B2F36] rounded-2xl overflow-hidden">
          {displayedWinningSignals.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <div className="text-sm font-bold text-[#EAECEF] font-mono">
                {t.ccLedgerEmptyTitle}
              </div>
              <p className="text-xs text-[#848E9C] max-w-lg mx-auto leading-relaxed">
                {t.ccLedgerEmptyDesc}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b border-[#2B2F36] bg-[#121418] text-[#848E9C] text-[11px] uppercase">
                    <th className="py-3 px-4 font-semibold">{t.ccColAsset}</th>
                    <th className="py-3 px-4 font-semibold">{t.ccColSignal}</th>
                    <th className="py-3 px-4 font-semibold">{t.ccColTarget}</th>
                    <th className="py-3 px-4 font-semibold text-right">
                      {t.ccColGain}
                    </th>
                    <th className="py-3 px-4 font-semibold text-right">
                      {t.ccColClosed}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2B2F36]">
                  {displayedWinningSignals.map((entry: any) => {
                    const signalDir = entry.type || entry.signal || "BUY";
                    const isBuyWin = signalDir === "BUY";
                    const gainValue = Number(
                      entry.gainPct ?? entry.profitPct ?? 0,
                    );
                    const closedTimestamp = Number(
                      entry.closedAt ?? entry.hitAt ?? Date.now(),
                    );
                    return (
                      <tr
                        key={entry.id}
                        className="hover:bg-[#121418]/60 transition"
                      >
                        <td className="py-3 px-4 font-bold text-[#EAECEF]">
                          <div className="flex items-center gap-2">
                            <span>{getCoinIcon(entry.symbol)}</span>
                            <span>{entry.symbol}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] ${
                              isBuyWin
                                ? "bg-[#0ECB81]/15 text-[#0ECB81]"
                                : "bg-[#F6465D]/15 text-[#F6465D]"
                            }`}
                          >
                            {isBuyWin ? t.ccSignalBuyTag : t.ccSignalSellTag}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-[#F0B90B]/15 text-[#F0B90B] font-bold text-[11px]">
                            {entry.targetHit}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-[#0ECB81] tabular-nums">
                          +{gainValue.toFixed(2)}%
                        </td>
                        <td className="py-3 px-4 text-right text-[#848E9C] tabular-nums">
                          <span title={formatLocalTooltipTime(closedTimestamp)}>
                            {formatRelativeTime(closedTimestamp, language)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
