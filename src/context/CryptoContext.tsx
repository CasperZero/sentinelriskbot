import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { CryptoPreset, PRESET_CRYPTOS, POPULAR_CATALOG_CRYPTOS } from '../types';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';

const LOCAL_STORAGE_CRYPTO_LIST_KEY = 'sentinel_crypto_presets';
const LOCAL_STORAGE_TRACKED_SYMBOLS_KEY = 'sentinel_tracked_symbols';
const clientFuturesOnlySymbols = new Set<string>(['KASUSDT']);

interface CryptoContextType {
  cryptoList: CryptoPreset[];
  availableSymbols: string[];
  trackedSymbols: string[];
  popularCatalog: CryptoPreset[];
  addCrypto: (preset: CryptoPreset) => { success: boolean; message: string };
  removeCrypto: (symbol: string) => { success: boolean; message: string };
  toggleWatchlistSymbol: (symbol: string, livePrice?: number) => { added: boolean; symbol: string; message: string };
  isSymbolInWatchlist: (symbol: string) => boolean;
  resetToDefaults: () => void;
  isCustomCrypto: (symbol: string) => boolean;
  isManageModalOpen: boolean;
  setIsManageModalOpen: (open: boolean) => void;
  activeSymbol: string;
  setActiveSymbol: (symbol: string) => void;
  validateAndFetchBinanceSymbol: (rawTicker: string) => Promise<{ success: boolean; preset?: CryptoPreset; error?: string }>;
}

const CryptoContext = createContext<CryptoContextType | undefined>(undefined);

// Mapping of known token symbols to icons
const KNOWN_ICONS: Record<string, string> = {
  BTC: '⚡',
  ETH: 'Ξ',
  SOL: '◎',
  ZEC: '🛡️',
  BNB: '🟡',
  XRP: '✕',
  DOGE: '🐕',
  AVAX: '🔺',
  ADA: '🪙',
  LINK: '🔗',
  SUI: '💧',
  NEAR: 'Ⓝ',
  PEPE: '🐸',
  TAO: '🧠',
  RENDER: '🎨',
  FET: '🤖',
  INJ: '🥷',
  APT: '🌀',
  TON: '💎',
  KAS: '⚡',
  TIA: '🌌',
  SEI: '🔴',
  SHIB: '🐕',
  BONK: '🔨',
  WIF: '🧢',
  DOT: '🟣',
  PENDLE: '⏳',
  AAVE: '👻',
  LTC: 'Ł',
  ARB: '💙',
  OP: '🔴',
  ATOM: '⚛️',
  FIL: '📁',
  MATIC: '🟣',
  POL: '🟣',
  UNI: '🦄',
  ICP: '♾️',
  TRX: '🔴',
  FTM: '👻',
  ALGO: '🔷',
};

// Unified catalog combining PRESET_CRYPTOS and POPULAR_CATALOG_CRYPTOS so removed core coins can always be re-added
const UNIFIED_CATALOG: CryptoPreset[] = (() => {
  const map = new Map<string, CryptoPreset>();
  for (const item of [...PRESET_CRYPTOS, ...POPULAR_CATALOG_CRYPTOS]) {
    if (!map.has(item.symbol)) {
      map.set(item.symbol, {
        ...item,
        defaultPrice: 0,
        defaultMinWallQty: 0,
      });
    }
  }
  return Array.from(map.values());
})();

export function buildPresetFromSymbol(rawSymbol: string, livePrice = 0): CryptoPreset {
  const clean = String(rawSymbol || '').trim().toUpperCase();
  const symbol = clean.endsWith('USDT') ? clean : `${clean}USDT`;
  const baseAsset = symbol.endsWith('USDT') ? symbol.slice(0, -4) : symbol;
  const known = UNIFIED_CATALOG.find(c => c.symbol === symbol);
  const price = Number.isFinite(livePrice) && livePrice > 0 ? livePrice : 0;
  const minWall = price > 0 ? Math.max(1, Math.round(500000 / price)) : 0;

  return {
    symbol,
    name: known?.name || baseAsset,
    baseAsset,
    quoteAsset: 'USDT',
    icon: known?.icon || KNOWN_ICONS[baseAsset] || '🪙',
    defaultPrice: price,
    defaultMinWallQty: minWall,
    isCustom: !PRESET_CRYPTOS.some(p => p.symbol === symbol),
    category: known?.category || 'l1_l2',
  };
}

export const CryptoProvider: React.FC<{
  children: React.ReactNode;
  initialSymbol?: string;
  onSymbolChange?: (symbol: string) => void;
}> = ({ children, initialSymbol = 'BTCUSDT', onSymbolChange }) => {
  const { t } = useLanguage();
  const { user, userProfile, updateTrackedSymbols } = useAuth();
  const [activeSymbol, setActiveSymbolState] = useState<string>(initialSymbol);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  // Initialize crypto list from localStorage, strictly stripping any stale cached priceRef/minWall/defaultPrice values
  const [cryptoList, setCryptoList] = useState<CryptoPreset[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CRYPTO_LIST_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((rawItem: any) => {
            const { priceRef: _pr, minWall: _mw, defaultPrice: _dp, defaultMinWallQty: _dmw, ...rest } = rawItem || {};
            return {
              ...rest,
              defaultPrice: 0,
              defaultMinWallQty: rest?.isWallCustomized ? Number(_dmw || 0) : 0
            };
          });
        }
      }
      const savedTracked = localStorage.getItem(LOCAL_STORAGE_TRACKED_SYMBOLS_KEY);
      if (savedTracked) {
        const parsedSymbols = JSON.parse(savedTracked);
        if (Array.isArray(parsedSymbols) && parsedSymbols.length > 0) {
          return parsedSymbols.map((sym: string) => buildPresetFromSymbol(sym));
        }
      }
    } catch (e) {
      console.warn('Failed to load crypto presets from localStorage', e);
    }
    return PRESET_CRYPTOS.map(p => ({ ...p, defaultPrice: 0, defaultMinWallQty: 0 }));
  });

  const lastSyncedProfileSymbolsRef = useRef<string>('');

  // Keep cryptoList synchronized if userProfile.tracked_symbols is updated externally (e.g., Firestore or TelegramLinkCard)
  useEffect(() => {
    const profileSymbols = userProfile?.tracked_symbols;
    if (!Array.isArray(profileSymbols) || profileSymbols.length === 0) return;

    const normalized = Array.from(
      new Set(
        profileSymbols
          .map(s => String(s || '').trim().toUpperCase())
          .filter(Boolean)
          .map(s => (s.endsWith('USDT') ? s : `${s}USDT`))
      )
    );
    const key = normalized.join(',');
    if (key === lastSyncedProfileSymbolsRef.current) return;
    lastSyncedProfileSymbolsRef.current = key;

    setCryptoList(prev => {
      const currentKey = prev.map(c => c.symbol).join(',');
      if (currentKey === key) return prev;
      const existingMap = new Map<string, CryptoPreset>(prev.map(c => [c.symbol, c] as [string, CryptoPreset]));
      return normalized.map((sym: string) => existingMap.get(sym) || buildPresetFromSymbol(sym));
    });
  }, [userProfile?.tracked_symbols]);

  // Save to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CRYPTO_LIST_KEY, JSON.stringify(cryptoList));
      const syms = cryptoList.map(c => c.symbol);
      localStorage.setItem(LOCAL_STORAGE_TRACKED_SYMBOLS_KEY, JSON.stringify(syms));
    } catch (e) {
      console.error('Failed to save crypto presets to localStorage', e);
    }
  }, [cryptoList]);

  // Sync external symbol change
  useEffect(() => {
    if (initialSymbol && initialSymbol !== activeSymbol) {
      setActiveSymbolState(initialSymbol);
    }
  }, [initialSymbol]);

  const syncWithBackendAndProfile = (
    nextList: CryptoPreset[],
    options?: { addedSymbol?: string; removedSymbol?: string; removeFromIngestion?: boolean }
  ) => {
    const nextSymbols = nextList.map(c => c.symbol);
    lastSyncedProfileSymbolsRef.current = nextSymbols.join(',');

    // Update shared AuthContext tracked_symbols state
    updateTrackedSymbols(nextSymbols).catch(err => {
      console.warn('[CryptoContext] updateTrackedSymbols warning:', err);
    });

    // Call /api/symbols/sync directly with explicit add/remove metadata so backend updates active ingestion loop immediately
    fetch('/api/symbols/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbols: nextSymbols,
        tracked_symbols: nextSymbols,
        addedSymbol: options?.addedSymbol,
        removedSymbol: options?.removedSymbol,
        removeFromIngestion: Boolean(options?.removeFromIngestion || options?.removedSymbol),
        userId: user?.uid || userProfile?.uid,
        chatId: userProfile?.telegram_chat_id,
      }),
    }).catch(err => {
      console.warn('[CryptoContext] Failed to sync symbols with /api/symbols/sync:', err);
    });
  };

  const setActiveSymbol = (symbol: string) => {
    setActiveSymbolState(symbol);
    if (onSymbolChange) {
      onSymbolChange(symbol);
    }
  };

  const isCustomCrypto = (symbol: string): boolean => {
    return !PRESET_CRYPTOS.some(p => p.symbol === symbol);
  };

  const isSymbolInWatchlist = (symbol: string): boolean => {
    const norm = String(symbol || '').trim().toUpperCase();
    const clean = norm.endsWith('USDT') ? norm : `${norm}USDT`;
    return cryptoList.some(c => c.symbol === clean);
  };

  const addCrypto = (preset: CryptoPreset): { success: boolean; message: string } => {
    const normSymbol = preset.symbol.trim().toUpperCase();
    const cleanSymbol = normSymbol.endsWith('USDT') ? normSymbol : `${normSymbol}USDT`;

    // Check if already in list
    if (cryptoList.some(c => c.symbol === cleanSymbol)) {
      return {
        success: false,
        message: t.cryptoAlreadyInList || 'This cryptocurrency is already in your active watchlist'
      };
    }

    const cleanBase = preset.baseAsset?.toUpperCase() || (cleanSymbol.endsWith('USDT') ? cleanSymbol.slice(0, -4) : cleanSymbol);
    const livePrice = Number.isFinite(preset.defaultPrice) && preset.defaultPrice > 0 ? preset.defaultPrice : 0;
    const computedWall = livePrice > 0 ? Math.max(1, Math.round(500000 / livePrice)) : 0;
    const finalWallQty = preset.isWallCustomized && preset.defaultMinWallQty > 0
      ? preset.defaultMinWallQty
      : computedWall;

    const newPreset: CryptoPreset = {
      ...preset,
      symbol: cleanSymbol,
      baseAsset: cleanBase,
      quoteAsset: preset.quoteAsset || 'USDT',
      name: preset.name || cleanBase,
      icon: preset.icon || KNOWN_ICONS[cleanBase] || '🪙',
      defaultPrice: livePrice,
      defaultMinWallQty: finalWallQty,
      isCustom: isCustomCrypto(cleanSymbol)
    };

    const updated = [...cryptoList, newPreset];
    setCryptoList(updated);

    // Immediately notify /api/symbols/add and /api/symbols/sync on /server.ts
    fetch('/api/symbols/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbol: cleanSymbol })
    }).catch((err) => {
      console.warn(`[CryptoContext] Failed to register ${cleanSymbol} on backend:`, err);
    });

    syncWithBackendAndProfile(updated, { addedSymbol: cleanSymbol });

    return {
      success: true,
      message: t.cryptoAddedSuccess || 'Cryptocurrency successfully added to active watchlist'
    };
  };

  const removeCrypto = (symbolToRemove: string): { success: boolean; message: string } => {
    if (cryptoList.length <= 1) {
      return {
        success: false,
        message: t.cantRemoveLastCrypto || 'Cannot remove: at least 1 active cryptocurrency is required'
      };
    }

    const norm = symbolToRemove.trim().toUpperCase();
    const targetSymbol = norm.endsWith('USDT') ? norm : `${norm}USDT`;
    const updated = cryptoList.filter(c => c.symbol !== targetSymbol);
    setCryptoList(updated);

    // If the active symbol is the one being removed, switch to the first available symbol
    if (activeSymbol === targetSymbol && updated.length > 0) {
      const nextSymbol = updated[0].symbol;
      setActiveSymbol(nextSymbol);
    }

    syncWithBackendAndProfile(updated, {
      removedSymbol: targetSymbol,
      removeFromIngestion: true,
    });

    return {
      success: true,
      message: t.cryptoRemovedSuccess || 'Cryptocurrency removed from active watchlist'
    };
  };

  const toggleWatchlistSymbol = (
    rawSymbol: string,
    livePrice = 0
  ): { added: boolean; symbol: string; message: string } => {
    const norm = String(rawSymbol || '').trim().toUpperCase();
    const cleanSymbol = norm.endsWith('USDT') ? norm : `${norm}USDT`;

    if (isSymbolInWatchlist(cleanSymbol)) {
      const res = removeCrypto(cleanSymbol);
      return {
        added: false,
        symbol: cleanSymbol,
        message: res.message,
      };
    } else {
      const preset = buildPresetFromSymbol(cleanSymbol, livePrice);
      const res = addCrypto(preset);
      return {
        added: true,
        symbol: cleanSymbol,
        message: res.message,
      };
    }
  };

  const resetToDefaults = () => {
    const defaults = PRESET_CRYPTOS.map(p => ({ ...p, defaultPrice: 0, defaultMinWallQty: 0 }));
    setCryptoList(defaults);
    try {
      localStorage.removeItem(LOCAL_STORAGE_CRYPTO_LIST_KEY);
    } catch (e) {
      console.warn(e);
    }
    syncWithBackendAndProfile(defaults, { removeFromIngestion: true });
  };

  const validateAndFetchBinanceSymbol = async (rawTicker: string): Promise<{ success: boolean; preset?: CryptoPreset; error?: string }> => {
    const clean = rawTicker.trim().toUpperCase().replace(/[\/\-_]/g, '');
    if (!clean) {
      return { success: false, error: 'Empty symbol' };
    }

    const symbol = clean.endsWith('USDT') ? clean : `${clean}USDT`;
    const baseAsset = symbol.endsWith('USDT') ? symbol.slice(0, -4) : symbol;

    try {
      // First attempt: call backend proxy endpoint (already handles Spot + Futures fallback & pruning)
      let price = 0;
      let name = baseAsset;
      let backendRejected = false;

      try {
        const localRes = await fetch(`/api/market/symbol-validate?symbol=${encodeURIComponent(symbol)}`);
        if (localRes.ok) {
          const lData = await localRes.json();
          if (lData && lData.valid && lData.price > 0) {
            price = parseFloat(lData.price);
          }
        } else if (localRes.status === 404) {
          backendRejected = true;
        }
      } catch {
        // Fallback to public Binance Spot/Futures mirrors if server check is unreachable
      }

      if (price <= 0 && !backendRejected) {
        let shouldTryFutures = clientFuturesOnlySymbols.has(symbol);

        if (!shouldTryFutures) {
          try {
            const res = await fetch(`https://data-api.binance.vision/api/v3/ticker/price?symbol=${encodeURIComponent(symbol)}`);
            if (res.ok) {
              const data = await res.json();
              if (data && data.price) {
                price = parseFloat(data.price);
              }
            } else if (res.status === 400) {
              const errText = await res.text().catch(() => '');
              if (errText.includes('-1121') || errText.toLowerCase().includes('invalid symbol')) {
                shouldTryFutures = true;
              }
            }
          } catch {
            shouldTryFutures = true;
          }
        }

        if (price <= 0 && shouldTryFutures) {
          try {
            const fapiRes = await fetch(`https://fapi.binance.com/fapi/v1/ticker/price?symbol=${encodeURIComponent(symbol)}`);
            if (fapiRes.ok) {
              const fData = await fapiRes.json();
              const fPrice = parseFloat(fData?.price || '0');
              if (Number.isFinite(fPrice) && fPrice > 0) {
                price = fPrice;
                clientFuturesOnlySymbols.add(symbol);
              }
            }
          } catch {
            // Handled below
          }
        }
      }

      if (price <= 0) {
        return { success: false, error: t.symbolNotFound || 'Pair not found on Binance. Please check the ticker symbol.' };
      }

      // Check if known in catalog for proper display name & icon
      const catalogMatch = UNIFIED_CATALOG.find(c => c.symbol === symbol);
      if (catalogMatch) {
        name = catalogMatch.name;
      }

      // Dynamic institutional wall calculation ($500k / real live price)
      const targetWallUsd = 500000;
      const defaultMinWall = Math.max(1, Math.round(targetWallUsd / price));

      const preset: CryptoPreset = {
        symbol,
        name: catalogMatch?.name || name || baseAsset,
        baseAsset,
        quoteAsset: 'USDT',
        icon: catalogMatch?.icon || KNOWN_ICONS[baseAsset] || '🪙',
        defaultPrice: price,
        defaultMinWallQty: defaultMinWall,
        isCustom: !PRESET_CRYPTOS.some(p => p.symbol === symbol),
        category: catalogMatch?.category || 'l1_l2'
      };

      return { success: true, preset };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error verifying symbol' };
    }
  };

  const availableSymbols = useMemo(() => cryptoList.map(c => c.symbol), [cryptoList]);

  return (
    <CryptoContext.Provider
      value={{
        cryptoList,
        availableSymbols,
        trackedSymbols: availableSymbols,
        popularCatalog: UNIFIED_CATALOG,
        addCrypto,
        removeCrypto,
        toggleWatchlistSymbol,
        isSymbolInWatchlist,
        resetToDefaults,
        isCustomCrypto,
        isManageModalOpen,
        setIsManageModalOpen,
        activeSymbol,
        setActiveSymbol,
        validateAndFetchBinanceSymbol
      }}
    >
      {children}
    </CryptoContext.Provider>
  );
};

export const useCrypto = (): CryptoContextType => {
  const context = useContext(CryptoContext);
  if (!context) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  return context;
};
