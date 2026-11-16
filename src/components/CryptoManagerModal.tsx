import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Plus,
  Trash2,
  Search,
  Check,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Coins,
  Layers,
  Info
} from 'lucide-react';
import { useCrypto } from '../context/CryptoContext';
import { useMarket } from '../context/MarketContext';
import { useLanguage } from '../context/LanguageContext';
import { CryptoPreset } from '../types';
import { formatCryptoDisplayPrice } from '../services/livePricesService';

const TARGET_USD_WALL = 500000;
const futuresOnlyTickerCache = new Set<string>(['KASUSDT']);

export const CryptoManagerModal: React.FC = () => {
  const {
    cryptoList,
    popularCatalog,
    addCrypto,
    removeCrypto,
    resetToDefaults,
    isCustomCrypto,
    isManageModalOpen,
    setIsManageModalOpen,
    activeSymbol,
    setActiveSymbol,
    validateAndFetchBinanceSymbol
  } = useCrypto();

  const { symbolsState, refreshMarketState } = useMarket();
  const { language, t } = useLanguage();
  const isEs = language.startsWith('es');

  const [activeTab, setActiveTab] = useState<'active' | 'discover' | 'custom'>('active');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ai' | 'l1_l2' | 'defi' | 'meme'>('all');

  // Real-time Binance ticker map (strictly populated from Binance live API)
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [isLoadingPrices, setIsLoadingPrices] = useState<boolean>(false);

  // Custom Pair Form State
  const [customInputSymbol, setCustomInputSymbol] = useState('');
  const [customInputName, setCustomInputName] = useState('');
  const [customInputWall, setCustomInputWall] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [verifiedPreset, setVerifiedPreset] = useState<CryptoPreset | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Status notification toast
  const [statusNotification, setStatusNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const syncingLabel = t.syncingText || 'Syncing...';

  // Fetch real-time prices directly from Binance public ticker API whenever modal opens or watchlist changes
  const fetchLiveBinanceTickers = useCallback(async (symbolsToFetch: string[]) => {
    const cleanSet = new Set(symbolsToFetch.map((s) => s.toUpperCase().trim()).filter(Boolean));
    if (cleanSet.size === 0) return;

    setIsLoadingPrices(true);
    const updatedMap: Record<string, number> = {};

    try {
      // Fetch all spot ticker prices directly from Binance Vision (never fails with 400 if a pair is unlisted)
      const res = await fetch('https://data-api.binance.vision/api/v3/ticker/price');
      if (res.ok) {
        const allTickers = await res.json();
        if (Array.isArray(allTickers)) {
          for (const row of allTickers) {
            const sym = row?.symbol?.toUpperCase();
            if (sym && cleanSet.has(sym)) {
              const price = parseFloat(row.price || '0');
              if (Number.isFinite(price) && price > 0) {
                updatedMap[sym] = price;
              }
            }
          }
        }
      }
    } catch {
      // Per-symbol fallback below
    }

    // 2. Futures fallback: fetch all USDⓈ-M Futures ticker prices in one clean call for Futures-only pairs (e.g. KASUSDT)
    const missingAfterSpot = Array.from(cleanSet).filter((sym) => !(updatedMap[sym] > 0));
    if (missingAfterSpot.length > 0) {
      const missingSet = new Set(missingAfterSpot);
      try {
        const fapiRes = await fetch('https://fapi.binance.com/fapi/v1/ticker/price');
        if (fapiRes.ok) {
          const allFutures = await fapiRes.json();
          if (Array.isArray(allFutures)) {
            for (const row of allFutures) {
              const sym = row?.symbol?.toUpperCase();
              if (sym && missingSet.has(sym)) {
                const price = parseFloat(row.price || '0');
                if (Number.isFinite(price) && price > 0) {
                  updatedMap[sym] = price;
                  futuresOnlyTickerCache.add(sym);
                }
              }
            }
          }
        }
      } catch {
        // Fallback to backend symbol validator below
      }
    }

    // 3. Backend proxy batch fallback (resolves Futures-only pairs via server Futures mirrors when browser fapi is geo-blocked)
    const missingForProxy = Array.from(cleanSet).filter((sym) => !(updatedMap[sym] > 0));
    if (missingForProxy.length > 0) {
      try {
        const proxyRes = await fetch(`/api/market/radar-prices?symbols=${encodeURIComponent(missingForProxy.join(','))}`);
        if (proxyRes.ok) {
          const json = await proxyRes.json();
          const pricesObj = json?.prices || {};
          for (const sym of missingForProxy) {
            const p = parseFloat(pricesObj?.[sym]?.price || '0');
            if (Number.isFinite(p) && p > 0) {
              updatedMap[sym] = p;
            }
          }
        }
      } catch {
        // Fallback to per-symbol validator below
      }
    }

    // 4. Per-symbol backend validator fallback for any remaining unresolved symbols
    const stillMissing = Array.from(cleanSet).filter((sym) => !(updatedMap[sym] > 0));
    if (stillMissing.length > 0) {
      await Promise.allSettled(
        stillMissing.map(async (sym) => {
          try {
            const res = await fetch(`/api/market/symbol-validate?symbol=${encodeURIComponent(sym)}`);
            if (res.ok) {
              const data = await res.json();
              const price = parseFloat(data?.price || '0');
              if (Number.isFinite(price) && price > 0) {
                updatedMap[sym] = price;
              }
            }
          } catch {
            // Keep null so UI displays Syncing... instead of a fake number
          }
        })
      );
    }

    if (Object.keys(updatedMap).length > 0) {
      setLivePrices((prev) => ({ ...prev, ...updatedMap }));
    }
    setIsLoadingPrices(false);
  }, []);

  useEffect(() => {
    if (!isManageModalOpen) return;
    const targetSymbols = [
      ...cryptoList.map((c) => c.symbol),
      ...popularCatalog.map((c) => c.symbol)
    ];
    fetchLiveBinanceTickers(targetSymbols);
  }, [isManageModalOpen, cryptoList, popularCatalog, fetchLiveBinanceTickers]);

  // Resolve real live price strictly from livePrices map or live backend symbolsState
  const resolveLivePrice = useCallback(
    (symbol: string): number | null => {
      const sym = symbol.toUpperCase().trim();
      const fetched = livePrices[sym];
      if (Number.isFinite(fetched) && fetched > 0) {
        return fetched;
      }
      const backendEntry = symbolsState?.[sym] as any;
      const backendPrice = Number(backendEntry?.price ?? backendEntry?.currentPrice ?? 0);
      if (Number.isFinite(backendPrice) && backendPrice > 0) {
        return backendPrice;
      }
      return null;
    },
    [livePrices, symbolsState]
  );

  // Recalculate MIN WALL dynamically on the fly from real live price (never from a static cached property)
  const calculateDynamicMinWall = useCallback(
    (item: CryptoPreset, livePrice: number | null): number | null => {
      if (item.isWallCustomized && Number.isFinite(item.defaultMinWallQty) && item.defaultMinWallQty > 0) {
        return Math.round(item.defaultMinWallQty);
      }
      if (livePrice !== null && Number.isFinite(livePrice) && livePrice > 0) {
        return Math.max(1, Math.round(TARGET_USD_WALL / livePrice));
      }
      return null;
    },
    []
  );

  if (!isManageModalOpen) return null;

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setStatusNotification({ type, message });
    setTimeout(() => {
      setStatusNotification(null);
    }, 3500);
  };

  const registerSymbolOnBackend = async (symbol: string) => {
    try {
      const res = await fetch('/api/symbols/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol })
      });
      if (res.ok) {
        const json = await res.json();
        const price = Number(json?.price || 0);
        if (Number.isFinite(price) && price > 0) {
          setLivePrices((prev) => ({ ...prev, [symbol]: price }));
        }
        await refreshMarketState();
      }
    } catch (err) {
      console.warn(`[CryptoManagerModal] Backend symbol registration failed for ${symbol}:`, err);
    }
  };

  const handleRemove = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (cryptoList.length <= 1) {
      showNotification('error', t.cantRemoveLastCrypto);
      return;
    }

    const res = removeCrypto(symbol);
    if (res.success) {
      showNotification('success', res.message);
      setTimeout(() => {
        refreshMarketState().catch(() => {});
      }, 200);
    } else {
      showNotification('error', res.message);
    }
  };

  const handleAddFromCatalog = async (preset: CryptoPreset) => {
    let resolvedPrice = resolveLivePrice(preset.symbol);

    if (!resolvedPrice) {
      let useFutures = futuresOnlyTickerCache.has(preset.symbol);
      if (!useFutures) {
        try {
          const res = await fetch(
            `https://data-api.binance.vision/api/v3/ticker/price?symbol=${encodeURIComponent(preset.symbol)}`
          );
          if (res.ok) {
            const data = await res.json();
            const p = parseFloat(data?.price || '0');
            if (Number.isFinite(p) && p > 0) {
              resolvedPrice = p;
              setLivePrices((prev) => ({ ...prev, [preset.symbol]: p }));
            }
          } else if (res.status === 400) {
            useFutures = true;
          }
        } catch {
          useFutures = true;
        }
      }

      if (!resolvedPrice && useFutures) {
        try {
          const fRes = await fetch(
            `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${encodeURIComponent(preset.symbol)}`
          );
          if (fRes.ok) {
            const fData = await fRes.json();
            const p = parseFloat(fData?.price || '0');
            if (Number.isFinite(p) && p > 0) {
              resolvedPrice = p;
              futuresOnlyTickerCache.add(preset.symbol);
              setLivePrices((prev) => ({ ...prev, [preset.symbol]: p }));
            }
          }
        } catch {
          // Proceed with backend registration below
        }
      }
    }

    const res = addCrypto({
      ...preset,
      defaultPrice: 0,
      defaultMinWallQty: 0
    });

    if (res.success) {
      showNotification('success', res.message);
      await registerSymbolOnBackend(preset.symbol);
    } else {
      showNotification('error', res.message);
    }
  };

  const handleVerifyCustom = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customInputSymbol.trim()) return;

    setIsVerifying(true);
    setVerifyError(null);
    setVerifiedPreset(null);

    const result = await validateAndFetchBinanceSymbol(customInputSymbol);
    setIsVerifying(false);

    if (result.success && result.preset && result.preset.defaultPrice > 0) {
      const realPrice = result.preset.defaultPrice;
      const calculatedWall = Math.max(1, Math.round(TARGET_USD_WALL / realPrice));

      setLivePrices((prev) => ({ ...prev, [result.preset!.symbol]: realPrice }));
      setVerifiedPreset({
        ...result.preset,
        defaultPrice: realPrice,
        defaultMinWallQty: calculatedWall
      });
      setCustomInputName(result.preset.name);
      setCustomInputWall(String(calculatedWall));
    } else {
      setVerifyError(result.error || t.symbolNotFound);
    }
  };

  const handleAddCustom = async (selectAfterAdd = true) => {
    if (!verifiedPreset || isAddingCustom) return;

    setIsAddingCustom(true);
    try {
      const enteredWall = Number(customInputWall);
      const calculatedDefaultWall = Math.max(1, Math.round(TARGET_USD_WALL / verifiedPreset.defaultPrice));
      const isCustomized =
        Number.isFinite(enteredWall) &&
        enteredWall > 0 &&
        Math.round(enteredWall) !== calculatedDefaultWall;

      const finalPreset: CryptoPreset = {
        ...verifiedPreset,
        name: customInputName.trim() || verifiedPreset.name,
        defaultPrice: 0,
        defaultMinWallQty: isCustomized ? Math.round(enteredWall) : 0,
        isWallCustomized: isCustomized
      };

      const res = addCrypto(finalPreset);
      if (res.success) {
        await registerSymbolOnBackend(finalPreset.symbol);
        showNotification('success', res.message);
        if (selectAfterAdd) {
          setActiveSymbol(finalPreset.symbol);
        }
        setVerifiedPreset(null);
        setCustomInputSymbol('');
        setCustomInputName('');
        setCustomInputWall('');
        setActiveTab('active');
      } else {
        showNotification('error', res.message);
      }
    } finally {
      setIsAddingCustom(false);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm(t.resetDefaultConfirm)) {
      resetToDefaults();
      showNotification(
        'info',
        isEs
          ? 'Lista de criptomonedas restaurada a los 12 valores predeterminados'
          : 'Cryptocurrency list reset to 12 core presets'
      );
    }
  };

  const filteredActive = cryptoList.filter(
    (c) =>
      c.symbol.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.baseAsset.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredCatalog = popularCatalog.filter((c) => {
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesSearch =
      c.symbol.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.baseAsset.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#2B2F36] flex items-center justify-between bg-[#121418]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F0B90B]/10 border border-[#F0B90B]/30 flex items-center justify-center text-[#F0B90B]">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-[#EAECEF] tracking-wide font-mono">
                  {t.cryptoManagerTitle}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30 tabular-nums">
                  {cryptoList.length} {isEs ? 'ACTIVAS' : 'ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-[#848E9C] mt-0.5 line-clamp-1">
                {t.cryptoManagerSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsManageModalOpen(false)}
            className="p-1.5 rounded-lg text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B2F36] transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification Toast */}
        {statusNotification && (
          <div
            className={`px-4 py-2.5 text-xs font-mono flex items-center justify-between border-b ${
              statusNotification.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                : statusNotification.type === 'error'
                ? 'bg-rose-950/40 border-rose-500/30 text-rose-400'
                : 'bg-blue-950/40 border-blue-500/30 text-blue-400'
            }`}
          >
            <span className="flex items-center gap-2">
              {statusNotification.type === 'success' ? (
                <Check className="w-3.5 h-3.5" />
              ) : statusNotification.type === 'error' ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <Info className="w-3.5 h-3.5" />
              )}
              {statusNotification.message}
            </span>
            <button
              onClick={() => setStatusNotification(null)}
              className="text-current opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
        )}

        {/* Tab Switcher & Search Bar */}
        <div className="p-4 border-b border-[#2B2F36] bg-[#14161C] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-1 bg-[#0B0E11] p-1 rounded-lg border border-[#2B2F36]">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 rounded-md font-mono text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'active'
                  ? 'bg-[#F0B90B] text-slate-950 shadow'
                  : 'text-[#848E9C] hover:text-[#EAECEF]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {t.activeCryptos} ({cryptoList.length})
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`px-3 py-1.5 rounded-md font-mono text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'discover'
                  ? 'bg-[#F0B90B] text-slate-950 shadow'
                  : 'text-[#848E9C] hover:text-[#EAECEF]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t.discoverCryptos}
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-3 py-1.5 rounded-md font-mono text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'custom'
                  ? 'bg-[#F0B90B] text-slate-950 shadow'
                  : 'text-[#848E9C] hover:text-[#EAECEF]'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              {t.customCryptoPair}
            </button>
          </div>

          {activeTab !== 'custom' && (
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#848E9C]" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={t.searchAddPlaceholder}
                className="w-full bg-[#0B0E11] border border-[#2B2F36] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#EAECEF] font-mono placeholder:text-[#5E6673] focus:outline-none focus:border-[#F0B90B]"
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2.5 top-2 text-[#848E9C] hover:text-[#EAECEF] text-xs"
                >
                  ×
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* TAB 1: ACTIVE WATCHLIST */}
          {activeTab === 'active' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#848E9C] font-mono px-1">
                <span>
                  {isEs ? 'Mostrando' : 'Showing'} {filteredActive.length} / {cryptoList.length}{' '}
                  {isEs ? 'pares seguidos' : 'tracked pairs'}
                </span>
                <span className="text-[11px] text-[#F0B90B]">
                  {isEs
                    ? 'Haz clic para seleccionar o el icono de basura para eliminar'
                    : 'Click to select or trash icon to remove'}
                </span>
              </div>

              {filteredActive.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-[#2B2F36] rounded-xl">
                  <Coins className="w-8 h-8 text-[#848E9C] mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-[#848E9C] font-mono">
                    {isEs
                      ? 'No se encontraron criptomonedas con ese filtro.'
                      : 'No cryptocurrencies match your search.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredActive.map((item) => {
                    const isActive = item.symbol === activeSymbol;
                    const isCustom = isCustomCrypto(item.symbol);
                    const canRemove = cryptoList.length > 1;
                    const livePrice = resolveLivePrice(item.symbol);
                    const dynamicWall = calculateDynamicMinWall(item, livePrice);

                    return (
                      <div
                        key={item.symbol}
                        onClick={() => {
                          setActiveSymbol(item.symbol);
                          showNotification(
                            'info',
                            `${isEs ? 'Símbolo activo cambiado a' : 'Active symbol switched to'} ${item.symbol}`
                          );
                        }}
                        className={`relative group rounded-xl p-3.5 border transition cursor-pointer flex flex-col justify-between ${
                          isActive
                            ? 'bg-[#F0B90B]/10 border-[#F0B90B] shadow-md shadow-[#F0B90B]/5'
                            : 'bg-[#121418] border-[#2B2F36] hover:border-[#848E9C]/50 hover:bg-[#15181F]'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl p-1 bg-[#181A20] rounded border border-[#2B2F36]">
                              {item.icon}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs sm:text-sm text-[#EAECEF] font-mono">
                                  {item.symbol}
                                </span>
                                {isActive && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-[#F0B90B] text-slate-950">
                                    {isEs ? 'ACTIVO' : 'LIVE'}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-[#848E9C] block">
                                {item.name}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => handleRemove(item.symbol, e)}
                            disabled={!canRemove}
                            title={
                              canRemove ? `${t.removeCryptoBtn} ${item.symbol}` : t.cantRemoveLastCrypto
                            }
                            className={`p-1.5 rounded-lg transition ${
                              canRemove
                                ? 'text-[#848E9C] hover:text-[#F6465D] hover:bg-[#F6465D]/15'
                                : 'opacity-30 cursor-not-allowed text-[#5E6673]'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Live Binance PRICE REF & Dynamic MIN WALL */}
                        <div className="mt-3 pt-2.5 border-t border-[#2B2F36]/60 flex items-center justify-between text-[11px] font-mono text-[#848E9C]">
                          <div>
                            <span className="text-[9px] text-[#5E6673] block uppercase">
                              PRICE REF
                            </span>
                            {livePrice !== null ? (
                              <span className="text-[#EAECEF] font-semibold tabular-nums">
                                {formatCryptoDisplayPrice(livePrice)}
                              </span>
                            ) : (
                              <span className="text-[#848E9C] italic">{syncingLabel}</span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-[#5E6673] block uppercase">
                              MIN WALL
                            </span>
                            {dynamicWall !== null ? (
                              <span className="text-[#F0B90B] tabular-nums">
                                {dynamicWall.toLocaleString()} {item.baseAsset}
                              </span>
                            ) : (
                              <span className="text-[#848E9C] italic">{syncingLabel}</span>
                            )}
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[9px] font-mono">
                          <span
                            className={`px-1.5 py-0.5 rounded ${
                              isCustom
                                ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30'
                                : 'bg-blue-950/60 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {isCustom
                              ? isEs
                                ? 'Personalizado'
                                : 'Custom Added'
                              : isEs
                              ? 'Predeterminado'
                              : 'Core Preset'}
                          </span>
                          <span className="text-[#848E9C] group-hover:text-[#F0B90B] transition flex items-center gap-0.5 text-[10px]">
                            {isActive
                              ? isEs
                                ? 'Seleccionado'
                                : 'Selected'
                              : isEs
                              ? 'Seleccionar →'
                              : 'Select →'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-3 border-t border-[#2B2F36] flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={handleResetDefaults}
                  className="px-3 py-1.5 rounded-lg border border-[#2B2F36] hover:bg-[#2B2F36] text-[#848E9C] hover:text-[#EAECEF] font-mono text-xs transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t.resetDefaultCryptos}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('discover')}
                    className="px-3 py-1.5 rounded-lg bg-[#2B2F36] hover:bg-[#363C4E] text-[#EAECEF] font-mono text-xs transition flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#F0B90B]" />
                    {isEs ? 'Ver Catálogo Popular' : 'Explore Catalog'}
                  </button>
                  <button
                    onClick={() => setActiveTab('custom')}
                    className="px-3.5 py-1.5 rounded-lg bg-[#F0B90B] text-slate-950 font-mono font-bold text-xs hover:bg-amber-400 transition flex items-center gap-1.5 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t.addCryptoBtn}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DISCOVER POPULAR PAIRS */}
          {activeTab === 'discover' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-1.5 pb-1">
                {[
                  { id: 'all', label: t.categoryAll },
                  { id: 'ai', label: t.categoryAi },
                  { id: 'l1_l2', label: t.categoryL1L2 },
                  { id: 'defi', label: t.categoryDefi },
                  { id: 'meme', label: t.categoryMeme }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id as any)}
                    className={`px-2.5 py-1 rounded-full text-xs font-mono transition ${
                      selectedCategory === cat.id
                        ? 'bg-[#F0B90B]/20 text-[#F0B90B] border border-[#F0B90B]/40 font-bold'
                        : 'bg-[#121418] border border-[#2B2F36] text-[#848E9C] hover:text-[#EAECEF]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {filteredCatalog.map((item) => {
                  const alreadyAdded = cryptoList.some((c) => c.symbol === item.symbol);
                  const livePrice = resolveLivePrice(item.symbol);
                  const dynamicWall = calculateDynamicMinWall(item, livePrice);

                  return (
                    <div
                      key={item.symbol}
                      className="bg-[#121418] border border-[#2B2F36] rounded-xl p-3.5 flex flex-col justify-between hover:border-[#848E9C]/40 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl p-1 bg-[#181A20] rounded border border-[#2B2F36]">
                            {item.icon}
                          </span>
                          <div>
                            <span className="font-bold text-xs sm:text-sm text-[#EAECEF] font-mono block">
                              {item.symbol}
                            </span>
                            <span className="text-[11px] text-[#848E9C] block">
                              {item.name}
                            </span>
                          </div>
                        </div>

                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#181A20] text-[#848E9C] border border-[#2B2F36] uppercase">
                          {item.category || 'crypto'}
                        </span>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#2B2F36]/60 flex items-center justify-between text-[11px] font-mono text-[#848E9C]">
                        <span className="text-[#EAECEF] tabular-nums">
                          {livePrice !== null ? formatCryptoDisplayPrice(livePrice) : syncingLabel}
                        </span>
                        <span className="text-[#F0B90B] tabular-nums">
                          {dynamicWall !== null
                            ? `Wall: ${dynamicWall.toLocaleString()} ${item.baseAsset}`
                            : `Wall: ${syncingLabel}`}
                        </span>
                      </div>

                      <div className="mt-3">
                        {alreadyAdded ? (
                          <button
                            disabled
                            className="w-full py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium flex items-center justify-center gap-1.5 cursor-default"
                          >
                            <Check className="w-3.5 h-3.5" />
                            {t.inWatchlist}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddFromCatalog(item)}
                            className="w-full py-1.5 rounded-lg bg-[#2B2F36] hover:bg-[#F0B90B] text-[#EAECEF] hover:text-slate-950 text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 shadow"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            {t.addToWatchlist}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ADD CUSTOM BINANCE PAIR */}
          {activeTab === 'custom' && (
            <div className="max-w-xl mx-auto space-y-4">
              <div className="bg-[#121418] border border-[#2B2F36] rounded-xl p-4 sm:p-5">
                <h4 className="text-xs sm:text-sm font-bold text-[#EAECEF] font-mono mb-1 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[#F0B90B]" />
                  {t.customCryptoPair}
                </h4>
                <p className="text-xs text-[#848E9C] mb-4">
                  {isEs
                    ? 'Ingrese cualquier símbolo de par de Binance (ej. ZEC, TAO, APT, SUI, NEAR, RENDER, INJ) para verificar su precio real en vivo y rastrearlo en tiempo real.'
                    : 'Enter any valid Binance trading pair or base ticker (e.g. ZEC, TAO, APT, SUI, NEAR, RENDER, INJ) to fetch its live Binance price and stream indicators.'}
                </p>

                <form onSubmit={handleVerifyCustom} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-[#EAECEF] mb-1">
                      {t.customSymbolLabel} *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customInputSymbol}
                        onChange={(e) => {
                          setCustomInputSymbol(e.target.value.toUpperCase());
                          setVerifiedPreset(null);
                          setVerifyError(null);
                        }}
                        placeholder="e.g. ZECUSDT or ZEC"
                        className="flex-1 bg-[#0B0E11] border border-[#2B2F36] rounded-lg px-3 py-2 text-xs font-mono text-[#EAECEF] uppercase focus:outline-none focus:border-[#F0B90B]"
                      />
                      <button
                        type="submit"
                        disabled={isVerifying || !customInputSymbol.trim()}
                        className="px-4 py-2 bg-[#2B2F36] hover:bg-[#363C4E] disabled:opacity-50 text-[#EAECEF] rounded-lg text-xs font-mono font-medium transition flex items-center gap-1.5"
                      >
                        {isVerifying ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-[#F0B90B] border-t-transparent rounded-full animate-spin" />
                            {syncingLabel}
                          </>
                        ) : (
                          <>
                            <Search className="w-3.5 h-3.5 text-[#F0B90B]" />
                            {isEs ? 'Verificar' : 'Verify'}
                          </>
                        )}
                      </button>
                    </div>
                    <span className="text-[10px] text-[#848E9C] block mt-1 font-mono">
                      {t.customSymbolHelp}
                    </span>
                  </div>

                  {verifyError && (
                    <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-lg text-rose-400 text-xs font-mono flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      {verifyError}
                    </div>
                  )}

                  <div className="pt-2">
                    <span className="text-[10px] text-[#848E9C] font-mono block mb-1.5">
                      {t.quickAddSuggestions}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['ZEC', 'TAO', 'RENDER', 'INJ', 'APT', 'TON', 'KAS', 'TIA', 'SEI', 'AAVE'].map(
                        (sym) => (
                          <button
                            key={sym}
                            type="button"
                            onClick={() => {
                              setCustomInputSymbol(`${sym}USDT`);
                              setVerifiedPreset(null);
                              setVerifyError(null);
                            }}
                            className="px-2 py-0.5 rounded bg-[#181A20] border border-[#2B2F36] hover:border-[#F0B90B] text-[#848E9C] hover:text-[#EAECEF] font-mono text-[11px] transition"
                          >
                            +{sym}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {verifiedPreset && (
                    <div className="mt-4 p-4 bg-[#181A20] border border-emerald-500/30 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-400" />
                          {t.symbolValid}
                        </span>
                        <span className="text-xs font-mono text-[#EAECEF] font-bold tabular-nums">
                          {formatCryptoDisplayPrice(verifiedPreset.defaultPrice)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#2B2F36]">
                        <div>
                          <label className="block text-[11px] font-mono text-[#848E9C] mb-1">
                            {t.customNameLabel}
                          </label>
                          <input
                            type="text"
                            value={customInputName}
                            onChange={(e) => setCustomInputName(e.target.value)}
                            className="w-full bg-[#0B0E11] border border-[#2B2F36] rounded px-2.5 py-1.5 text-xs font-mono text-[#EAECEF] focus:outline-none focus:border-[#F0B90B]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono text-[#848E9C] mb-1">
                            {t.defaultWallSizeLabel} ({verifiedPreset.baseAsset})
                          </label>
                          <input
                            type="number"
                            value={customInputWall}
                            onChange={(e) => setCustomInputWall(e.target.value)}
                            className="w-full bg-[#0B0E11] border border-[#2B2F36] rounded px-2.5 py-1.5 text-xs font-mono text-[#EAECEF] tabular-nums focus:outline-none focus:border-[#F0B90B]"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button
                          type="button"
                          disabled={isAddingCustom}
                          onClick={() => handleAddCustom(true)}
                          className="flex-1 py-2 bg-[#F0B90B] text-slate-950 font-bold rounded-lg text-xs font-mono hover:bg-amber-400 disabled:opacity-50 transition flex items-center justify-center gap-1.5 shadow"
                        >
                          <Plus className="w-4 h-4" />
                          {isAddingCustom
                            ? syncingLabel
                            : isEs
                            ? 'Añadir y Seleccionar Ahora'
                            : 'Add to Watchlist & Select'}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#2B2F36] bg-[#121418] flex items-center justify-between text-xs text-[#848E9C] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0ECB81]" />
            <span>
              {isLoadingPrices ? syncingLabel : 'Binance Live Market Sync'}
            </span>
          </div>
          <button
            onClick={() => setIsManageModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-[#2B2F36] hover:bg-[#363C4E] text-[#EAECEF] transition text-xs font-mono"
          >
            {isEs ? 'Cerrar' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
