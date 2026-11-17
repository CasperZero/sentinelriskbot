import React, { useState, useMemo } from "react";
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  X,
  Zap,
  Copy,
  Check,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useCrypto } from "../context/CryptoContext";

export interface TelegramLinkCardProps {
  onClose?: () => void;
  compact?: boolean;
  availableSymbols?: string[];
}

export const TelegramLinkCard: React.FC<TelegramLinkCardProps> = ({
  onClose,
  compact = false,
  availableSymbols,
}) => {
  const {
    user,
    userProfile,
    isPremium,
    linkTelegramAccount,
    unlinkTelegramAccount,
    updateTrackedSymbols,
    openSubscriptionModal,
  } = useAuth();
  const { language, t } = useLanguage();
  const { cryptoList, availableSymbols: contextAvailableSymbols } = useCrypto();

  const OFFICIAL_BOT_USERNAME = "SentinelRiskBot_bot";
  const BOT_DIRECT_URL = `https://t.me/${OFFICIAL_BOT_USERNAME}?start=connect`;

  // Dynamically synchronize all assets:
  // 1. All assets in cryptoList from CryptoContext (Single Source of Truth, including user-added coins like ZEC)
  // 2. Any assets passed via availableSymbols prop or contextAvailableSymbols
  // 3. Any assets previously saved in the user's Firestore tracked_symbols
  const dynamicAssets = useMemo(() => {
    const assetMap = new Map<
      string,
      {
        symbol: string;
        name: string;
        badge: string;
        icon: string;
        popular: boolean;
      }
    >();

    // 1. Active cryptoList from CryptoContext (Single Source of Truth)
    for (const item of cryptoList) {
      const sym = item.symbol.toUpperCase().trim();
      const base =
        item.baseAsset?.toUpperCase() ||
        (sym.endsWith("USDT") ? sym.slice(0, -4) : sym);
      assetMap.set(sym, {
        symbol: sym,
        name: item.name || (base === "ZEC" ? "Zcash" : base),
        badge: base,
        icon: item.icon || (base === "ZEC" ? "🛡️" : "🪙"),
        popular: ["BTCUSDT", "ETHUSDT", "SOLUSDT"].includes(sym),
      });
    }

    // 2. Extra availableSymbols from props or CryptoContext
    const symbolList = [
      ...(Array.isArray(availableSymbols) ? availableSymbols : []),
      ...(Array.isArray(contextAvailableSymbols)
        ? contextAvailableSymbols
        : []),
    ];
    for (const rawSym of symbolList) {
      const sym = String(rawSym).toUpperCase().trim();
      if (sym && !assetMap.has(sym)) {
        const base = sym.endsWith("USDT") ? sym.slice(0, -4) : sym;
        assetMap.set(sym, {
          symbol: sym,
          name: base === "ZEC" ? "Zcash" : base,
          badge: base,
          icon: base === "ZEC" ? "🛡️" : "🪙",
          popular: ["BTCUSDT", "ETHUSDT", "SOLUSDT"].includes(sym),
        });
      }
    }

    // 3. Any symbols stored in user's Firestore profile (tracked_symbols)
    const stored = userProfile?.tracked_symbols;
    if (Array.isArray(stored)) {
      for (const rawSym of stored) {
        const sym = String(rawSym).toUpperCase().trim();
        if (sym && !assetMap.has(sym)) {
          const base = sym.endsWith("USDT") ? sym.slice(0, -4) : sym;
          assetMap.set(sym, {
            symbol: sym,
            name: base === "ZEC" ? "Zcash" : base,
            badge: base,
            icon: base === "ZEC" ? "🛡️" : "🪙",
            popular: false,
          });
        }
      }
    }

    return Array.from(assetMap.values());
  }, [
    cryptoList,
    availableSymbols,
    contextAvailableSymbols,
    userProfile?.tracked_symbols,
  ]);

  // Dynamic initialization: if user profile has a saved telegram_chat_id, display it; otherwise empty string ""
  const [chatIdInput, setChatIdInput] = useState<string>(
    () => userProfile?.telegram_chat_id || "",
  );
  const [usernameInput, setUsernameInput] = useState<string>(
    () => userProfile?.telegram_username || "",
  );
  const [isLinking, setIsLinking] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    msg: string;
  } | null>(null);
  const [copiedBot, setCopiedBot] = useState<boolean>(false);
  const [isUpdatingSymbols, setIsUpdatingSymbols] = useState<boolean>(false);

  // Synchronize state dynamically when user profile loads or changes from Firestore
  React.useEffect(() => {
    if (userProfile?.telegram_chat_id) {
      setChatIdInput(userProfile.telegram_chat_id);
    }
    if (userProfile?.telegram_username) {
      setUsernameInput(userProfile.telegram_username);
    }
  }, [userProfile?.telegram_chat_id, userProfile?.telegram_username]);

  // Unified Watchlist source of truth across Active Signals, Manage Coins modal, and Telegram 24/7 Hub
  const currentTrackedSymbols: string[] = useMemo(() => {
    if (
      userProfile?.tracked_symbols &&
      Array.isArray(userProfile.tracked_symbols) &&
      userProfile.tracked_symbols.length > 0
    ) {
      return userProfile.tracked_symbols.map((s) => s.toUpperCase().trim());
    }
    if (
      Array.isArray(contextAvailableSymbols) &&
      contextAvailableSymbols.length > 0
    ) {
      return contextAvailableSymbols.map((s) => s.toUpperCase().trim());
    }
    return ["BTCUSDT", "ETHUSDT", "SOLUSDT"];
  }, [userProfile?.tracked_symbols, contextAvailableSymbols]);

  const handleToggleSymbol = async (symbol: string) => {
    const sym = symbol.toUpperCase().trim();
    let updated: string[];
    let addedSymbol: string | undefined;
    let removedSymbol: string | undefined;

    if (currentTrackedSymbols.includes(sym)) {
      updated = currentTrackedSymbols.filter((s) => s !== sym);
      removedSymbol = sym;
    } else {
      updated = [...currentTrackedSymbols, sym];
      addedSymbol = sym;
    }
    setIsUpdatingSymbols(true);
    try {
      await updateTrackedSymbols(updated);
      await fetch("/api/symbols/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbols: updated,
          tracked_symbols: updated,
          addedSymbol,
          removedSymbol,
          removeFromIngestion: Boolean(removedSymbol),
          userId: user?.uid || userProfile?.uid,
          chatId: userProfile?.telegram_chat_id,
        }),
      });
    } catch (err: any) {
      console.error(
        "[Telegram Asset Filter] Failed to update tracked symbols:",
        err,
      );
    } finally {
      setIsUpdatingSymbols(false);
    }
  };

  const handleSelectPreset = async (preset: "top3" | "all" | "clear") => {
    let updated: string[] = [];
    if (preset === "top3") {
      updated = ["BTCUSDT", "ETHUSDT", "SOLUSDT"].filter((sym) =>
        dynamicAssets.some((a) => a.symbol === sym),
      );
      if (updated.length === 0 && dynamicAssets.length > 0) {
        updated = dynamicAssets.slice(0, 3).map((a) => a.symbol);
      }
    } else if (preset === "all") {
      updated = dynamicAssets.map((a) => a.symbol);
    } else {
      updated = ["BTCUSDT"];
    }
    setIsUpdatingSymbols(true);
    try {
      await updateTrackedSymbols(updated);
      await fetch("/api/symbols/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbols: updated,
          tracked_symbols: updated,
          userId: user?.uid || userProfile?.uid,
          chatId: userProfile?.telegram_chat_id,
        }),
      });
    } catch (err: any) {
      console.error(
        "[Telegram Asset Filter] Failed to update preset symbols:",
        err,
      );
    } finally {
      setIsUpdatingSymbols(false);
    }
  };

  const isLinked =
    !!userProfile?.is_telegram_linked && !!userProfile?.telegram_chat_id;

  const handleLink = async (
    e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent,
  ) => {
    if (e && "preventDefault" in e) {
      e.preventDefault();
    }
    if (!chatIdInput.trim()) return;

    setIsLinking(true);
    setTestResult(null);

    try {
      await linkTelegramAccount(chatIdInput, usernameInput);
      setTestResult({
        success: true,
        msg: t.tgLinkSuccess,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        msg: err.message || t.tgLinkError,
      });
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlink = async () => {
    if (confirm(t.tgUnlinkConfirm)) {
      await unlinkTelegramAccount();
      setChatIdInput("");
      setUsernameInput("");
      setTestResult(null);
    }
  };

  // Safe Test Alert Dispatcher with full HTML error handling & try/catch guard
  const handleTestAlert = async () => {
    if (!isLinked || !userProfile?.telegram_chat_id) {
      setTestResult({
        success: false,
        msg: t.tgTestNeedLink,
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const idToken = user ? await user.getIdToken().catch(() => null) : null;
      const response = await fetch("/api/telegram/test-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          chatId: userProfile.telegram_chat_id,
          subscriptionTier: userProfile.subscription_tier || "free",
          userId: userProfile.uid,
          trackedSymbols: currentTrackedSymbols,
          language: language,
          languagePreference: language,
        }),
      });

      // Explicitly read response as text first before JSON parse to protect against HTML 404/500 pages
      const rawText = await response.text();
      let data: any = null;

      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        // Raw text was HTML or unparseable plain string
        console.warn(
          "[Telegram Test] Response was not valid JSON:",
          rawText.slice(0, 150),
        );
      }

      // Check HTTP status code explicitly
      if (!response.ok) {
        const errorMsg =
          data?.error ||
          data?.message ||
          `${t.tgTestServerErrPrefix} (${response.status}): ${t.tgTestServerErrSuffix}`;
        setTestResult({
          success: false,
          msg: errorMsg,
        });
        return;
      }

      if (data?.status === "success" || data?.deliveredToTelegram) {
        setTestResult({
          success: true,
          msg: `${t.tgTestSuccessPrefix} ${userProfile.telegram_chat_id}`,
        });
      } else {
        const errMsg = data?.error || data?.message || t.tgTestStartBotErr;
        setTestResult({
          success: false,
          msg: errMsg,
        });
      }
    } catch (err: any) {
      console.error("[Telegram Test Alert Network Error]", err);
      setTestResult({
        success: false,
        msg: err?.message || t.tgTestNetworkErr,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const copyBotHandle = () => {
    navigator.clipboard.writeText(`@${OFFICIAL_BOT_USERNAME}`);
    setCopiedBot(true);
    setTimeout(() => setCopiedBot(false), 2000);
  };

  const lang = language;

  return (
    <div
      className={`bg-[#181A20] border border-[#2B2F36] rounded-xl font-mono relative text-xs shadow-xl ${compact ? "p-4" : "p-6"}`}
    >
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-[#848E9C] hover:text-white p-1 rounded transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Header Title */}
      <div className="flex items-center justify-between border-b border-[#2B2F36] pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#0088cc]/15 border border-[#0088cc]/40 flex items-center justify-center text-[#0088cc]">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#EAECEF] text-sm flex items-center gap-2">
              <span>{t.tgCardTitle}</span>
              {isLinked && (
                <span className="text-[10px] bg-[#0ECB81]/20 text-[#0ECB81] px-2 py-0.5 rounded border border-[#0ECB81]/40 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {t.tgLinkedBadge}
                </span>
              )}
            </h3>
            <p className="text-[11px] text-[#848E9C] mt-0.5">
              {t.tgCardSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Public Free Alerts Channel Card */}
      <div className="bg-gray-900/80 border border-blue-500/30 rounded-xl p-5 mb-6 shadow-lg backdrop-blur-md font-sans">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400 text-2xl">
            📢
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg mb-1">
              {lang === "es"
                ? "Canal Público de Alertas (FOMO)"
                : "Public Free Alerts Channel"}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              {lang === "es"
                ? "¿Aún no eres PRO? Únete a nuestro canal público en Telegram para ver las alertas en tiempo real y comprobar la efectividad del escáner."
                : "Not PRO yet? Join our public Telegram channel to see real-time alerts and test the scanner effectiveness."}
            </p>
            <a
              href="https://t.me/SentinelFreeAlerts"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shadow-md"
            >
              <span>
                {lang === "es"
                  ? "Unirse al Canal Gratuito"
                  : "Join Free Channel"}
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* CASE 1: NOT PREMIUM */}
      {!isPremium ? (
        <div className="bg-[#121418] border border-[#F0B90B]/30 rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#F0B90B] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-[#EAECEF] text-xs">
                {t.tgExclusiveProTitle}
              </div>
              <p className="text-[11px] text-[#848E9C] mt-1">
                {t.tgExclusiveProDesc}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openSubscriptionModal}
            className="w-full py-2.5 rounded-lg bg-[#F0B90B] hover:bg-[#fcd535] text-slate-950 font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-md"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>{t.tgUpgradeToLinkBtn}</span>
          </button>
        </div>
      ) : isLinked ? (
        /* CASE 2: PREMIUM AND LINKED */
        <div className="space-y-4">
          <div className="bg-[#121418] border border-[#0ECB81]/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0ECB81] animate-ping" />
                <span className="font-bold text-[#0ECB81] text-xs">
                  {t.tgBotActiveSynced}
                </span>
              </div>
              <span className="text-[10px] text-[#848E9C]">
                {t.tgLinkedAtLabel}:{" "}
                {userProfile.telegram_linked_at
                  ? new Date(
                      userProfile.telegram_linked_at,
                    ).toLocaleDateString()
                  : t.tgActiveFallback}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="bg-[#181A20] p-2.5 rounded border border-[#2B2F36]">
                <div className="text-[10px] text-[#848E9C] uppercase font-bold">
                  {t.tgChatIdLabel}
                </div>
                <div className="font-bold text-[#EAECEF] mt-0.5 text-sm">
                  {userProfile.telegram_chat_id}
                </div>
              </div>

              <div className="bg-[#181A20] p-2.5 rounded border border-[#2B2F36]">
                <div className="text-[10px] text-[#848E9C] uppercase font-bold">
                  {t.tgOfficialBotLabel}
                </div>
                <div className="font-bold text-[#0088cc] mt-0.5 text-sm">
                  @{OFFICIAL_BOT_USERNAME}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-[#848E9C] pt-1">
              {t.tgAutoAlertsNote}
            </div>
          </div>

          {/* CUSTOM ASSET FILTER: ASSETS TO TRACK (DYNAMICALLY SYNCED WITH WATCHLIST) */}
          <div className="bg-[#121418] border border-[#2B2F36] rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2B2F36] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#0088cc]" />
                <h4 className="font-bold text-[#EAECEF] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span>{t.tgRadarAssetsTitle}</span>
                  <span className="text-[10px] text-[#848E9C] font-normal lowercase">
                    ({currentTrackedSymbols.length} {t.activeLabel})
                  </span>
                </h4>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => handleSelectPreset("top3")}
                  disabled={isUpdatingSymbols}
                  className="px-2 py-0.5 rounded bg-[#0088cc]/15 hover:bg-[#0088cc]/30 text-[#0088cc] border border-[#0088cc]/30 font-semibold transition disabled:opacity-50"
                >
                  {t.tgTop3Recommended}
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset("all")}
                  disabled={isUpdatingSymbols}
                  className="px-2 py-0.5 rounded bg-[#2B2F36] hover:bg-[#363C4E] text-[#848E9C] hover:text-[#EAECEF] transition disabled:opacity-50"
                >
                  {t.allLabel}
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset("clear")}
                  disabled={isUpdatingSymbols}
                  className="px-2 py-0.5 rounded bg-[#2B2F36] hover:bg-red-500/20 text-[#848E9C] hover:text-[#F6465D] transition disabled:opacity-50"
                >
                  {t.noneLabel}
                </button>
              </div>
            </div>

            {/* Beginner-friendly explanation micro-copy */}
            <p className="text-[11px] text-[#848E9C] leading-relaxed">
              {t.tgRadarAssetsDesc}
            </p>

            {/* Dynamic Grid of Selectable Assets (Includes newly added coins like ZEC) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
              {dynamicAssets.map((asset) => {
                const isSelected = currentTrackedSymbols.includes(asset.symbol);
                return (
                  <button
                    key={asset.symbol}
                    type="button"
                    onClick={() => handleToggleSymbol(asset.symbol)}
                    disabled={isUpdatingSymbols}
                    className={`flex items-center justify-between p-2 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "bg-[#0088cc]/15 border-[#0088cc] text-[#EAECEF] shadow-sm"
                        : "bg-[#181A20] border-[#2B2F36] text-[#848E9C] hover:border-[#363C4E] hover:text-[#EAECEF]"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? "bg-[#0088cc] border-[#0088cc] text-white"
                            : "border-[#474D57] bg-[#121418]"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-[11px] leading-tight text-[#EAECEF] flex items-center gap-1">
                          <span>{asset.icon}</span>
                          <span>{asset.badge}</span>
                        </div>
                        <div className="text-[9px] text-[#848E9C] truncate">
                          {asset.name}
                        </div>
                      </div>
                    </div>

                    {asset.popular && (
                      <span className="text-[8px] bg-[#F0B90B]/15 text-[#F0B90B] px-1 py-0.2 rounded font-bold shrink-0 ml-1">
                        {t.proBadge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Zero selected warning */}
            {currentTrackedSymbols.length === 0 && (
              <div className="p-2.5 rounded-lg bg-[#F0B90B]/10 border border-[#F0B90B]/30 text-[#F0B90B] text-[11px] flex items-center gap-2 mt-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{t.tgZeroAssetsWarning}</span>
              </div>
            )}
          </div>

          {/* 24/7 Notification Management Pro Tip */}
          <div className="text-gray-400 text-sm bg-gray-900/50 p-3 rounded-md border border-gray-800 leading-relaxed font-sans">
            💡{" "}
            <strong className="text-gray-200 font-semibold">
              {t.tgNightProTipLabel}
            </strong>{" "}
            {t.tgNightProTipBody}
          </div>

          {/* Test & Unlink Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleTestAlert}
              disabled={isTesting}
              className="flex-1 py-2 px-3 rounded bg-[#0088cc] hover:bg-[#0077b5] disabled:opacity-50 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow"
            >
              {isTesting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{t.tgDispatchTestBtn}</span>
            </button>

            <button
              type="button"
              onClick={handleUnlink}
              className="py-2 px-3 rounded bg-[#2B2F36] hover:bg-red-500/20 hover:text-[#F6465D] text-[#848E9C] font-bold text-xs transition flex items-center gap-1"
            >
              <span>{t.tgUnlinkBtn}</span>
            </button>
          </div>
        </div>
      ) : (
        /* CASE 3: PREMIUM BUT NOT LINKED YET */
        <div className="space-y-4">
          <div className="bg-[#121418] border border-[#2B2F36] rounded-xl p-4 space-y-3">
            <div className="font-bold text-[#F0B90B] text-xs uppercase tracking-wider flex items-center justify-between">
              <span>{t.tgStepsTitle}</span>
              <a
                href={BOT_DIRECT_URL}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#0088cc] hover:underline flex items-center gap-1 font-bold"
              >
                <span>@{OFFICIAL_BOT_USERNAME}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Official Bot Details Highlight */}
            <div className="bg-[#181A20] border border-[#0088cc]/30 rounded-lg p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-[10px] text-[#848E9C] font-mono uppercase font-bold">
                  {t.tgOfficialAlertBotLabel}
                </div>
                <div className="font-bold text-[#0088cc] text-xs flex items-center gap-1.5 mt-0.5">
                  <Send className="w-3.5 h-3.5" />
                  <span>@{OFFICIAL_BOT_USERNAME}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={copyBotHandle}
                  className="px-2 py-1 rounded bg-[#2B2F36] hover:bg-[#363C4E] text-[#848E9C] hover:text-[#EAECEF] text-[11px] transition flex items-center gap-1"
                >
                  {copiedBot ? (
                    <Check className="w-3 h-3 text-[#0ECB81]" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedBot ? t.copiedLabel : t.copyUserLabel}</span>
                </button>
                <a
                  href={BOT_DIRECT_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded bg-[#0088cc] hover:bg-[#0077b5] text-white text-[11px] font-bold transition flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>{t.tgOpenBotBtn}</span>
                </a>
              </div>
            </div>

            <div className="space-y-2 text-xs text-[#EAECEF]">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded bg-[#0088cc]/20 text-[#0088cc] font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <p className="font-semibold">{t.tgStep1Title}</p>
                  <p className="text-[11px] text-[#848E9C]">
                    {t.tgStep1DescPrefix} @{OFFICIAL_BOT_USERNAME}{" "}
                    {t.tgStep1DescSuffix}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded bg-[#0088cc]/20 text-[#0088cc] font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <p className="font-semibold">{t.tgStep2Title}</p>
                  <p className="text-[11px] text-[#848E9C]">{t.tgStep2Desc}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded bg-[#0088cc]/20 text-[#0088cc] font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <p className="font-semibold">{t.tgStep3Title}</p>
                  <p className="text-[11px] text-[#848E9C]">{t.tgStep3Desc}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#2B2F36] flex items-center justify-between">
              <a
                href={BOT_DIRECT_URL}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold text-xs transition flex items-center gap-1.5 shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t.tgOpenBotFullBtn}</span>
              </a>

              <a
                href={BOT_DIRECT_URL}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#848E9C] hover:text-[#0088cc] flex items-center gap-1"
              >
                <span>t.me/{OFFICIAL_BOT_USERNAME}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Form to Link Chat ID */}
          <div
            className="space-y-3 pt-2"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleLink(e);
              }
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-[#EAECEF] font-bold mb-1">
                  {t.tgChatIdLabel} <span className="text-[#F6465D]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.tgChatIdPlaceholder}
                  value={chatIdInput}
                  onChange={(e) => setChatIdInput(e.target.value)}
                  className="w-full bg-[#121418] border border-[#2B2F36] rounded px-3 py-2 text-xs font-mono text-[#EAECEF] focus:outline-none focus:border-[#0088cc]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#EAECEF] mb-1">
                  {t.tgUsernameLabel} ({t.optionalLabel})
                </label>
                <input
                  type="text"
                  placeholder={t.tgUsernamePlaceholder}
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full bg-[#121418] border border-[#2B2F36] rounded px-3 py-2 text-xs font-mono text-[#EAECEF] focus:outline-none focus:border-[#0088cc]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleLink}
                disabled={isLinking || !chatIdInput.trim()}
                className="px-5 py-2 rounded bg-[#0088cc] hover:bg-[#0077b5] disabled:opacity-50 text-white font-bold text-xs font-mono transition flex items-center gap-1.5 shadow"
              >
                {isLinking ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{t.tgSaveAndLinkBtn}</span>
              </button>
            </div>

            {/* 24/7 Notification Management Pro Tip */}
            <div className="text-gray-400 text-sm bg-gray-900/50 p-3 rounded-md border border-gray-800 leading-relaxed font-sans">
              💡{" "}
              <strong className="text-gray-200 font-semibold">
                {t.tgNightProTipLabel}
              </strong>{" "}
              {t.tgNightProTipBody}
            </div>
          </div>
        </div>
      )}

      {/* Test / Feedback Messages */}
      {testResult && (
        <div
          className={`mt-4 p-3 rounded-lg border text-xs font-mono flex items-center gap-2 ${
            testResult.success
              ? "bg-[#0ECB81]/10 border-[#0ECB81]/30 text-[#0ECB81]"
              : "bg-[#F6465D]/10 border-[#F6465D]/30 text-[#F6465D]"
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{testResult.msg}</span>
        </div>
      )}
    </div>
  );
};
