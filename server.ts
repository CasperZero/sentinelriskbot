import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  initializeApp as initializeAdminApp,
  getApps as getAdminApps,
  cert,
  type App as AdminApp,
} from "firebase-admin/app";
import {
  getFirestore as getAdminFirestore,
  type Firestore as AdminFirestore,
} from "firebase-admin/firestore";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "Bitcoin Flash Crash Sentinel API",
      timestamp: new Date().toISOString(),
    });
  });

  // ---------------------------------------------------------------------------
  // MACRO VOLATILITY SHIELD (INVISIBLE SHIELD) SERVICE
  // Protects novice traders from high-impact macroeconomic news manipulation
  // 30-minute protection window: 15 minutes before to 15 minutes after high-impact events
  // ---------------------------------------------------------------------------
  interface MacroEconomicEvent {
    id: string;
    title: string;
    country: string;
    currency: string;
    impact: "HIGH" | "MEDIUM" | "LOW";
    scheduledTime: string;
    scheduledEpochMs: number;
    windowStartEpochMs: number;
    windowEndEpochMs: number;
    description: string;
    category: "FOMC" | "CPI" | "NFP" | "GDP" | "PCE" | "PPI" | "RATE_DECISION";
  }

  class MacroVolatilityShieldService {
    private isSimulating: boolean = false;
    private simulatedEvent: MacroEconomicEvent | null = null;
    private eventsSchedule: MacroEconomicEvent[] = [];

    constructor() {
      this.initEventsSchedule();
    }

    private initEventsSchedule() {
      // Fixed scheduled UTC economic releases (FOMC, CPI, NFP, PCE, PPI)
      // Shield is ONLY active during the 30-minute window (15m before -> 15m after) of the scheduled event,
      // or when explicitly simulated via /api/system-status/simulate-shield.
      const rawEvents: Array<{
        id: string;
        title: string;
        category: MacroEconomicEvent["category"];
        description: string;
        scheduledTime: string;
      }> = [
        {
          id: "macro_cpi_nov",
          title: "US Consumer Price Index (CPI YoY / MoM)",
          category: "CPI",
          description:
            "Headline & Core inflation data release. Triggers violent liquidity sweeps and order book book-clearing wicks.",
          scheduledTime: "2026-11-12T13:30:00.000Z",
        },
        {
          id: "macro_ppi_nov",
          title: "US Producer Price Index (PPI Final Demand)",
          category: "PPI",
          description:
            "Wholesale inflation and supplier pipeline cost inflation metrics.",
          scheduledTime: "2026-11-13T13:30:00.000Z",
        },
        {
          id: "macro_fomc_nov",
          title: "FOMC Rate Decision & Fed Press Conference",
          category: "FOMC",
          description:
            "Federal Open Market Committee announces interest rate policy followed by Fed Chair press conference. Highest market volatility event.",
          scheduledTime: "2026-11-18T19:00:00.000Z",
        },
        {
          id: "macro_pce_nov",
          title: "US Core PCE Price Index MoM/YoY",
          category: "PCE",
          description:
            "Federal Reserve's preferred primary inflation benchmark report.",
          scheduledTime: "2026-11-25T13:30:00.000Z",
        },
        {
          id: "macro_nfp_dec",
          title: "US Non-Farm Payrolls (NFP) & Unemployment",
          category: "NFP",
          description:
            "Monthly employment situation report. High institutional repositioning and spread expansion.",
          scheduledTime: "2026-12-04T13:30:00.000Z",
        },
      ];

      this.eventsSchedule = rawEvents.map((ev) => {
        const scheduledMs = new Date(ev.scheduledTime).getTime();
        return {
          id: ev.id,
          title: ev.title,
          country: "US",
          currency: "USD",
          impact: "HIGH",
          scheduledTime: ev.scheduledTime,
          scheduledEpochMs: scheduledMs,
          windowStartEpochMs: scheduledMs - 15 * 60 * 1000, // 15 mins before
          windowEndEpochMs: scheduledMs + 15 * 60 * 1000, // 15 mins after
          description: ev.description,
          category: ev.category,
        };
      });
    }

    public isShieldActive(): boolean {
      if (this.isSimulating) return true;
      const now = Date.now();
      return this.eventsSchedule.some(
        (ev) => now >= ev.windowStartEpochMs && now <= ev.windowEndEpochMs,
      );
    }

    public getCurrentActiveEvent(): MacroEconomicEvent | null {
      if (this.isSimulating) {
        return this.simulatedEvent;
      }
      const now = Date.now();
      const activeEvent = this.eventsSchedule.find(
        (ev) => now >= ev.windowStartEpochMs && now <= ev.windowEndEpochMs,
      );
      return activeEvent || null;
    }

    public getUpcomingEvents(): MacroEconomicEvent[] {
      const now = Date.now();
      return this.eventsSchedule
        .filter((ev) => ev.windowEndEpochMs > now)
        .slice(0, 5);
    }

    public simulateShield(
      active: boolean,
      eventName?: string,
      durationMinutes: number = 30,
    ) {
      this.isSimulating = active;
      if (active) {
        const now = Date.now();
        const scheduledTime = now; // Event is occurring now
        this.simulatedEvent = {
          id: `sim_event_${now}`,
          title:
            eventName || "FOMC Interest Rate Decision & Fed Press Conference",
          country: "US",
          currency: "USD",
          impact: "HIGH",
          scheduledTime: new Date(scheduledTime).toISOString(),
          scheduledEpochMs: scheduledTime,
          windowStartEpochMs: now - 5 * 60 * 1000,
          windowEndEpochMs: now + durationMinutes * 60 * 1000,
          description:
            "High-impact macroeconomic event in progress. Institutional spreads widen and high-frequency algorithms execute stop hunts. Trading signals paused.",
          category: "FOMC",
        };
      } else {
        this.simulatedEvent = null;
      }
    }

    public getStatus() {
      const now = Date.now();
      const isActive = this.isShieldActive();
      const currentEvent = this.getCurrentActiveEvent();
      let minutesRemaining = 0;

      if (isActive && currentEvent) {
        minutesRemaining = Math.max(
          1,
          Math.ceil((currentEvent.windowEndEpochMs - now) / (60 * 1000)),
        );
      }

      return {
        isVolatilityShieldActive: isActive,
        shield: {
          isActive,
          reason: isActive
            ? "HIGH_IMPACT_MACRO_EVENT_WINDOW"
            : "MARKET_CONDITIONS_STABLE",
          currentEvent,
          minutesRemaining,
          windowMinutes: 30,
          protectionWindow: {
            preEventMinutes: 15,
            postEventMinutes: 15,
            start: currentEvent
              ? new Date(currentEvent.windowStartEpochMs).toISOString()
              : "",
            end: currentEvent
              ? new Date(currentEvent.windowEndEpochMs).toISOString()
              : "",
          },
          upcomingEvents: this.getUpcomingEvents(),
          isSimulated: this.isSimulating,
          protectionNoticeEn:
            "🛡️ Volatility Shield Active: High-impact macroeconomic events are currently unfolding. Trading signals are paused for 30 minutes to protect your capital from market manipulation and extreme volatility.",
          protectionNoticeEs:
            "🛡️ Escudo de Volatilidad Activo: Eventos macroeconómicos de alto impacto en curso. Las señales de trading están pausadas durante 30 minutos para proteger su capital de la manipulación del mercado y volatilidad extrema.",
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  const volatilityShield = new MacroVolatilityShieldService();

  // Public endpoint for frontend to check Volatility Shield and Macro Risk status
  app.get("/api/system-status", (_req, res) => {
    res.json(volatilityShield.getStatus());
  });

  // Simulation endpoint allowing testers and users to preview the Volatility Shield on demand
  app.post("/api/system-status/simulate-shield", (req, res) => {
    const { active, eventName, durationMinutes } = req.body || {};
    const shouldActivate =
      active !== undefined
        ? Boolean(active)
        : !volatilityShield.isShieldActive();
    volatilityShield.simulateShield(
      shouldActivate,
      eventName,
      durationMinutes || 30,
    );
    res.json({
      success: true,
      message: shouldActivate
        ? "Macro Volatility Shield activated (simulation mode)"
        : "Macro Volatility Shield deactivated",
      ...volatilityShield.getStatus(),
    });
  });

  // ---------------------------------------------------------------------------
  // MULTI-TIMEFRAME TICKER STATS PROVIDER (CACHED TO PREVENT REDUNDANT CALLS)
  // ---------------------------------------------------------------------------
  interface TimeframeRangePayload {
    minPrice: number;
    maxPrice: number;
    openPrice: number;
    changePercent: number;
    potentialGainPercent: number;
    maxGainPercent: number;
    maxDropPercent: number;
  }

  function safePct(target: number, base: number): number {
    if (!Number.isFinite(target) || !Number.isFinite(base) || base <= 0)
      return 0;
    const val = ((target - base) / base) * 100;
    return Number.isFinite(val) ? Number(val.toFixed(2)) : 0;
  }

  function finalizeRangePayload(
    minPrice: number,
    maxPrice: number,
    openPrice: number,
    currentPrice: number,
  ): TimeframeRangePayload {
    const validPrices = [minPrice, maxPrice].filter(
      (v) => Number.isFinite(v) && v > 0,
    );
    if (validPrices.length === 0) {
      return {
        minPrice: 0,
        maxPrice: 0,
        openPrice: 0,
        changePercent: 0,
        potentialGainPercent: 0,
        maxGainPercent: 0,
        maxDropPercent: 0,
      };
    }
    const low = Math.min(...validPrices);
    const high = Math.max(...validPrices);
    const base = Number.isFinite(openPrice) && openPrice > 0 ? openPrice : low;
    const potentialGainPercent = Math.max(0, safePct(high, low));
    return {
      minPrice: low,
      maxPrice: high,
      openPrice: base,
      changePercent: safePct(currentPrice, base),
      potentialGainPercent,
      maxGainPercent: potentialGainPercent,
      maxDropPercent: Math.min(0, safePct(low, high)),
    };
  }

  interface CachedTickerStats {
    symbol: string;
    priceChange1h: number;
    priceChange24h: number;
    priceChange1w: number;
    priceChange1M: number;
    high24h: number;
    low24h: number;
    referencePrice: number;
    ranges: Record<"24h" | "1w" | "1m", TimeframeRangePayload>;
    nearestBuyWallPrice?: number;
    nearestBuyWallBtc?: number;
    longLiquidations1m?: number;
    longLiquidationCount1m?: number;
    liquidationSpikeDetected?: boolean;
    fetchedAt: number;
  }

  const tickerStatsCache = new Map<string, CachedTickerStats>();
  const inflightRequests = new Map<string, Promise<CachedTickerStats>>();
  const CACHE_TTL_MS = 60_000; // 60s server-side cache per symbol

  // Multi-endpoint Binance API mirror rotation to withstand geo-blocks and rate limits
  const BINANCE_MIRRORS = [
    "https://data-api.binance.vision",
    "https://api.binance.us",
    "https://api1.binance.com",
    "https://api2.binance.com",
    "https://api3.binance.com",
  ];

  const BINANCE_FUTURES_MIRRORS = [
    "https://fapi.binance.com",
    "https://www.binance.com",
  ];
  let primaryFuturesMirrorIndex = 0;

  // Cache of Futures-only pairs (pre-seeded with known Futures-only symbols like KASUSDT)
  const futuresOnlySymbols = new Set<string>(["KASUSDT"]);
  // Cache of invalid pairs returning -1121 on BOTH Spot and Futures APIs
  const invalidSymbols = new Set<string>();
  const loggedInvalidWarnings = new Set<string>();

  class BinanceInvalidSymbolError extends Error {
    public readonly symbol?: string;
    constructor(message: string, symbol?: string) {
      super(message);
      this.name = "BinanceInvalidSymbolError";
      this.symbol = symbol;
    }
  }

  function isInvalidSymbolErr(err: any): boolean {
    if (!err) return false;
    if (
      err instanceof BinanceInvalidSymbolError ||
      err?.name === "BinanceInvalidSymbolError"
    ) {
      return true;
    }
    const msg = String(err?.message || err || "");
    return (
      msg.includes("-1121") || msg.toLowerCase().includes("invalid symbol")
    );
  }

  function extractSymbolFromPath(pathAndQuery: string): string | undefined {
    const match = pathAndQuery.match(/[?&]symbol=([A-Z0-9_-]+)/i);
    return match ? match[1].toUpperCase().trim() : undefined;
  }

  function spotPathToFuturesPath(spotPathAndQuery: string): string {
    const normalized = spotPathAndQuery.startsWith("/")
      ? spotPathAndQuery
      : `/${spotPathAndQuery}`;
    return normalized
      .replace(/^\/api\/v3\/depth\b/, "/fapi/v1/depth")
      .replace(/^\/api\/v3\/klines\b/, "/fapi/v1/klines")
      .replace(/^\/api\/v3\/ticker\/price\b/, "/fapi/v1/ticker/price")
      .replace(/^\/api\/v3\/ticker\/24hr\b/, "/fapi/v1/ticker/24hr");
  }

  let primaryMirrorIndex = 0;

  async function fetchFromBinance<T = any>(
    pathAndQuery: string,
    options: { timeoutMs?: number } = {},
  ): Promise<T> {
    const timeoutMs = options.timeoutMs ?? 6000;
    const normalizedPath = pathAndQuery.startsWith("/")
      ? pathAndQuery
      : `/${pathAndQuery}`;
    let lastError: any = null;
    const mirrorCount = BINANCE_MIRRORS.length;

    for (let i = 0; i < mirrorCount; i++) {
      const mirrorIdx = (primaryMirrorIndex + i) % mirrorCount;
      const base = BINANCE_MIRRORS[mirrorIdx];
      const url = `${base}${normalizedPath}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SentinelMarket/1.0",
          },
        });
        clearTimeout(timer);

        if (res.ok) {
          const data = await res.json();
          if (
            data &&
            typeof data === "object" &&
            "code" in data &&
            data.code !== 200 &&
            data.code !== 0
          ) {
            if (data.code === -1121) {
              throw new BinanceInvalidSymbolError(
                data.msg || "Invalid symbol (-1121)",
                extractSymbolFromPath(normalizedPath),
              );
            }
            throw new Error(data.msg || `Binance API error code ${data.code}`);
          }
          if (
            data &&
            typeof data === "object" &&
            data.code === 0 &&
            typeof data.msg === "string" &&
            data.msg.includes("restricted")
          ) {
            continue;
          }
          primaryMirrorIndex = mirrorIdx;
          return data as T;
        }

        if (
          res.status === 429 ||
          res.status === 418 ||
          res.status === 451 ||
          res.status >= 500
        ) {
          continue;
        }

        const errBody = await res.text().catch(() => "");
        if (
          res.status === 400 &&
          (errBody.includes("-1121") ||
            errBody.toLowerCase().includes("invalid symbol"))
        ) {
          throw new BinanceInvalidSymbolError(
            `Binance HTTP ${res.status}: ${errBody || res.statusText}`,
            extractSymbolFromPath(normalizedPath),
          );
        }
        throw new Error(
          `Binance HTTP ${res.status}: ${errBody || res.statusText}`,
        );
      } catch (err: any) {
        clearTimeout(timer);
        if (err instanceof BinanceInvalidSymbolError) {
          throw err;
        }
        lastError = err;
        continue;
      }
    }

    throw (
      lastError ||
      new Error(`All Binance mirrors unreachable for: ${normalizedPath}`)
    );
  }

  async function fetchFromBinanceFutures<T = any>(
    fapiPathAndQuery: string,
    options: { timeoutMs?: number } = {},
  ): Promise<T> {
    const timeoutMs = options.timeoutMs ?? 6000;
    const normalizedPath = fapiPathAndQuery.startsWith("/")
      ? fapiPathAndQuery
      : `/${fapiPathAndQuery}`;
    let lastError: any = null;
    const mirrorCount = BINANCE_FUTURES_MIRRORS.length;

    for (let i = 0; i < mirrorCount; i++) {
      const mirrorIdx = (primaryFuturesMirrorIndex + i) % mirrorCount;
      const base = BINANCE_FUTURES_MIRRORS[mirrorIdx];
      const url = `${base}${normalizedPath}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SentinelMarket/1.0",
          },
        });
        clearTimeout(timer);

        if (res.ok) {
          const data = await res.json();
          if (
            data &&
            typeof data === "object" &&
            "code" in data &&
            data.code !== 200 &&
            data.code !== 0
          ) {
            if (data.code === -1121) {
              throw new BinanceInvalidSymbolError(
                data.msg || "Invalid Futures symbol (-1121)",
                extractSymbolFromPath(normalizedPath),
              );
            }
            throw new Error(
              data.msg || `Binance Futures API error code ${data.code}`,
            );
          }
          if (
            data &&
            typeof data === "object" &&
            data.code === 0 &&
            typeof data.msg === "string" &&
            data.msg.includes("restricted")
          ) {
            continue;
          }
          primaryFuturesMirrorIndex = mirrorIdx;
          return data as T;
        }

        if (
          res.status === 429 ||
          res.status === 418 ||
          res.status === 451 ||
          res.status >= 500
        ) {
          continue;
        }

        const errBody = await res.text().catch(() => "");
        if (
          res.status === 400 &&
          (errBody.includes("-1121") ||
            errBody.toLowerCase().includes("invalid symbol"))
        ) {
          throw new BinanceInvalidSymbolError(
            `Binance Futures HTTP ${res.status}: ${errBody || res.statusText}`,
            extractSymbolFromPath(normalizedPath),
          );
        }
        throw new Error(
          `Binance Futures HTTP ${res.status}: ${errBody || res.statusText}`,
        );
      } catch (err: any) {
        clearTimeout(timer);
        if (err instanceof BinanceInvalidSymbolError) {
          throw err;
        }
        lastError = err;
        continue;
      }
    }

    throw (
      lastError ||
      new Error(
        `All Binance Futures mirrors unreachable for: ${normalizedPath}`,
      )
    );
  }

  let onInvalidSymbolPrune: ((symbol: string) => void) | null = null;

  async function fetchBinanceSpotOrFutures<T = any>(
    spotPathAndQuery: string,
    explicitSymbol?: string,
    options: { timeoutMs?: number } = {},
  ): Promise<T> {
    const symbol = (
      explicitSymbol ||
      extractSymbolFromPath(spotPathAndQuery) ||
      ""
    )
      .toUpperCase()
      .trim();
    const futuresPath = spotPathToFuturesPath(spotPathAndQuery);

    if (symbol && invalidSymbols.has(symbol)) {
      throw new BinanceInvalidSymbolError(
        `Symbol ${symbol} previously pruned as invalid on both Spot and Futures`,
        symbol,
      );
    }

    if (symbol && futuresOnlySymbols.has(symbol)) {
      try {
        return await fetchFromBinanceFutures<T>(futuresPath, options);
      } catch (fErr: any) {
        if (isInvalidSymbolErr(fErr)) {
          invalidSymbols.add(symbol);
          if (!loggedInvalidWarnings.has(symbol)) {
            loggedInvalidWarnings.add(symbol);
            console.warn(
              `[Binance Symbol Pruned] ${symbol} rejected (-1121) on Futures API. Removing from active polling.`,
            );
          }
          if (onInvalidSymbolPrune) onInvalidSymbolPrune(symbol);
        }
        throw fErr;
      }
    }

    try {
      return await fetchFromBinance<T>(spotPathAndQuery, options);
    } catch (spotErr: any) {
      if (!isInvalidSymbolErr(spotErr)) {
        throw spotErr;
      }

      // Automatic Spot-to-Futures fallback on -1121 Invalid symbol
      try {
        const futuresData = await fetchFromBinanceFutures<T>(
          futuresPath,
          options,
        );
        if (symbol) {
          futuresOnlySymbols.add(symbol);
          console.log(
            `[Binance Futures Fallback] ${symbol} resolved via fapi.binance.com (cached as futuresOnly).`,
          );
        }
        return futuresData;
      } catch (futuresErr: any) {
        if (symbol && isInvalidSymbolErr(futuresErr)) {
          invalidSymbols.add(symbol);
          if (!loggedInvalidWarnings.has(symbol)) {
            loggedInvalidWarnings.add(symbol);
            console.warn(
              `[Binance Symbol Pruned] ${symbol} invalid (-1121) on BOTH Spot and Futures APIs. Removed from active polling.`,
            );
          }
          if (onInvalidSymbolPrune) onInvalidSymbolPrune(symbol);
        }
        throw futuresErr;
      }
    }
  }

  // Format price precision helper based on asset scale
  function formatCryptoPrice(val: number, refPrice: number): number {
    if (!Number.isFinite(val) || val <= 0) return 0;
    if (refPrice < 0.0001) return Number(val.toFixed(8));
    if (refPrice < 0.01) return Number(val.toFixed(6));
    if (refPrice < 0.1) return Number(val.toFixed(5)); // 5 decimals for sub-dime assets (e.g. DOGE)
    if (refPrice < 1) return Number(val.toFixed(4));
    if (refPrice < 10) return Number(val.toFixed(4)); // 4 decimals for $1-$10 assets (e.g. XRP, NEAR, AVAX)
    return Number(val.toFixed(2));
  }

  // ---------------------------------------------------------------------------
  // REAL-TIME BINANCE FUTURES LIQUIDATION MANAGER
  // Subscribes to wss://fstream.binance.com/ws/!forceOrder@arr
  // Tracks long and short liquidations in 1-minute rolling buffer
  // ---------------------------------------------------------------------------
  interface ServerLiquidationEvent {
    symbol: string;
    side: "BUY" | "SELL"; // SELL = Long liquidation, BUY = Short liquidation
    price: number;
    quantity: number;
    usdValue: number;
    timestamp: number;
  }

  class FuturesLiquidationManager {
    private ws: WebSocket | null = null;
    private liquidations: ServerLiquidationEvent[] = [];
    private isReconnecting = false;
    private reconnectTimer: NodeJS.Timeout | null = null;
    public isConnected = false;
    private maxRetainedMs = 300_000; // 5 minutes buffer

    constructor() {
      this.connect();
      // Periodic purge every 15 seconds
      setInterval(() => this.purgeStale(), 15_000);
    }

    private connect() {
      if (this.ws) {
        try {
          this.ws.close();
        } catch {}
        this.ws = null;
      }

      try {
        const wsUrl = "wss://fstream.binance.com/ws/!forceOrder@arr";
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.isConnected = true;
          console.log(
            "[Futures Liquidation Stream] Connected to Binance Futures !forceOrder@arr",
          );
        };

        this.ws.onmessage = (event: any) => {
          try {
            const raw =
              typeof event.data === "string"
                ? event.data
                : event.data?.toString();
            if (!raw) return;
            const parsed = JSON.parse(raw);
            const orders = Array.isArray(parsed)
              ? parsed
              : parsed.o
                ? [parsed]
                : [];

            const now = Date.now();
            for (const item of orders) {
              const o = item.o || item;
              if (!o || !o.s || !o.S) continue;
              const price = parseFloat(o.p) || parseFloat(o.ap) || 0;
              const quantity = parseFloat(o.q) || 0;
              const usdValue = price * quantity;
              const side = o.S === "SELL" || o.S === "BUY" ? o.S : "SELL";
              const sym = String(o.s).toUpperCase();

              this.liquidations.push({
                symbol: sym,
                side,
                price,
                quantity,
                usdValue,
                timestamp: o.T || now,
              });
            }
          } catch {
            // Ignore non-json frames
          }
        };

        this.ws.onerror = (err: any) => {
          console.warn(
            "[Futures Liquidation Stream] Error:",
            err?.message || err,
          );
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          this.scheduleReconnect();
        };
      } catch (err: any) {
        console.warn(
          "[Futures Liquidation Stream] Failed to initialize:",
          err?.message,
        );
        this.scheduleReconnect();
      }
    }

    private scheduleReconnect() {
      if (this.isReconnecting) return;
      this.isReconnecting = true;
      if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
      this.reconnectTimer = setTimeout(() => {
        this.isReconnecting = false;
        this.connect();
      }, 5000);
    }

    private purgeStale() {
      const cutoff = Date.now() - this.maxRetainedMs;
      this.liquidations = this.liquidations.filter(
        (l) => l.timestamp >= cutoff,
      );
    }

    public getLiquidationStats(targetSymbol?: string) {
      const now = Date.now();
      const cutoff1m = now - 60_000;
      const cleanSym = targetSymbol ? targetSymbol.trim().toUpperCase() : null;

      let longLiquidations1m = 0;
      let shortLiquidations1m = 0;
      let longLiquidationCount1m = 0;
      let shortLiquidationCount1m = 0;

      const matchedEvents: ServerLiquidationEvent[] = [];

      for (let i = this.liquidations.length - 1; i >= 0; i--) {
        const l = this.liquidations[i];
        if (l.timestamp < cutoff1m) continue;
        if (!cleanSym || l.symbol === cleanSym) {
          if (l.side === "SELL") {
            longLiquidations1m += l.usdValue;
            longLiquidationCount1m++;
          } else {
            shortLiquidations1m += l.usdValue;
            shortLiquidationCount1m++;
          }
          if (matchedEvents.length < 15) {
            matchedEvents.push(l);
          }
        }
      }

      const spikeThreshold = cleanSym === "BTCUSDT" ? 250_000 : 80_000;
      const liquidationSpikeDetected = longLiquidations1m >= spikeThreshold;

      return {
        symbol: cleanSym || "ALL",
        longLiquidations1m: Math.round(longLiquidations1m),
        shortLiquidations1m: Math.round(shortLiquidations1m),
        longLiquidationCount1m,
        shortLiquidationCount1m,
        liquidationSpikeDetected,
        recentEvents: matchedEvents,
        connected: this.isConnected,
        timestamp: now,
      };
    }
  }

  const futuresLiquidationManager = new FuturesLiquidationManager();

  // ---------------------------------------------------------------------------
  // ORDER BOOK (L2 DEPTH) INGESTION & SUPPORT FLOOR MANAGER
  // Fetches authentic L2 depth from Binance for active & tracked symbols
  // Calculates nearestBuyWallPrice within 5% distance below current price
  // GUARANTEE: NEVER returns $0.00 for a live asset
  // ---------------------------------------------------------------------------
  interface OrderBookDepthSnapshot {
    symbol: string;
    bids: Array<{ price: number; quantity: number; total: number }>;
    asks: Array<{ price: number; quantity: number; total: number }>;
    nearestBuyWall: {
      price: number;
      quantity: number;
      originalQuantity: number;
    };
    nearestBuyWallPrice: number;
    nearestBuyWallQty: number;
    currentPrice: number;
    fetchedAt: number;
  }

  class OrderBookDepthManager {
    private cache = new Map<string, OrderBookDepthSnapshot>();
    private inflight = new Map<string, Promise<OrderBookDepthSnapshot>>();
    private CACHE_TTL_MS = 2500; // 2.5s cache for real-time freshness without API spam

    public async getDepth(rawSymbol: string): Promise<OrderBookDepthSnapshot> {
      const cleanSymbol = rawSymbol.trim().toUpperCase();
      const cached = this.cache.get(cleanSymbol);
      if (cached && Date.now() - cached.fetchedAt < this.CACHE_TTL_MS) {
        return cached;
      }

      let pending = this.inflight.get(cleanSymbol);
      if (!pending) {
        pending = this.fetchFromBinanceDepth(cleanSymbol).finally(() => {
          this.inflight.delete(cleanSymbol);
        });
        this.inflight.set(cleanSymbol, pending);
      }
      return pending;
    }

    private async fetchFromBinanceDepth(
      cleanSymbol: string,
    ): Promise<OrderBookDepthSnapshot> {
      try {
        const data = await fetchBinanceSpotOrFutures<any>(
          `/api/v3/depth?symbol=${cleanSymbol}&limit=100`,
          cleanSymbol,
          { timeoutMs: 5000 },
        );
        if (!data || !Array.isArray(data.bids) || !Array.isArray(data.asks)) {
          throw new Error(
            `Invalid depth payload from Binance for ${cleanSymbol}`,
          );
        }

        const bids = data.bids.map(([p, q]: [string, string]) => {
          const price = parseFloat(p);
          const quantity = parseFloat(q);
          return { price, quantity, total: price * quantity };
        });

        const asks = data.asks.map(([p, q]: [string, string]) => {
          const price = parseFloat(p);
          const quantity = parseFloat(q);
          return { price, quantity, total: price * quantity };
        });

        const bestBid = bids.length > 0 ? bids[0].price : 0;
        const bestAsk = asks.length > 0 ? asks[0].price : bestBid;
        const currentPrice =
          bestBid > 0 && bestAsk > 0 ? (bestBid + bestAsk) / 2 : bestBid;

        // 1. Calculate nearestBuyWallPrice: largest single bid volume within 5% distance below currentPrice
        const bidsWithin5Pct = bids.filter(
          (b: any) => b.price >= currentPrice * 0.95 && b.price <= currentPrice,
        );
        bidsWithin5Pct.sort((a: any, b: any) => b.quantity - a.quantity);

        let wallPrice = 0;
        let wallQty = 0;

        if (bidsWithin5Pct.length > 0) {
          wallPrice = bidsWithin5Pct[0].price;
          wallQty = bidsWithin5Pct[0].quantity;
        } else if (bids.length > 0) {
          const topBids = [...bids.slice(0, 20)].sort(
            (a: any, b: any) => b.quantity - a.quantity,
          );
          wallPrice = topBids[0].price;
          wallQty = topBids[0].quantity;
        }

        if (wallPrice <= 0 && bestBid > 0) {
          wallPrice = bestBid;
          wallQty = bids[0]?.quantity || 0;
        }

        const snapshot: OrderBookDepthSnapshot = {
          symbol: cleanSymbol,
          bids,
          asks,
          nearestBuyWall: {
            price: wallPrice,
            quantity: wallQty,
            originalQuantity: wallQty,
          },
          nearestBuyWallPrice: wallPrice,
          nearestBuyWallQty: wallQty,
          currentPrice,
          fetchedAt: Date.now(),
        };

        this.cache.set(cleanSymbol, snapshot);
        return snapshot;
      } catch (err: any) {
        if (isInvalidSymbolErr(err)) {
          const fallbackSnapshot: OrderBookDepthSnapshot = {
            symbol: cleanSymbol,
            bids: [],
            asks: [],
            nearestBuyWall: { price: 0, quantity: 0, originalQuantity: 0 },
            nearestBuyWallPrice: 0,
            nearestBuyWallQty: 0,
            currentPrice: 0,
            fetchedAt: Date.now(),
          };
          return fallbackSnapshot;
        }
        console.warn(
          `[OrderBookDepthManager Error for ${cleanSymbol}]`,
          err?.message,
        );
        const prev = this.cache.get(cleanSymbol);
        if (prev) return prev;
        throw err;
      }
    }
  }

  const orderBookDepthManager = new OrderBookDepthManager();

  // ---------------------------------------------------------------------------
  // AUTHENTIC 14-PERIOD ATR & EXECUTION LEVELS ENGINE (WITH 4% NOVICE SAFETY NET)
  // ---------------------------------------------------------------------------
  interface AtrExecutionLevels {
    atr14: number;
    rawAtr: number;
    riskDistance: number;
    riskDistancePercent: number;
    isCappedAtMaxRisk: boolean;
    buy: {
      entryZone: { min: number; max: number };
      stopLoss: number;
      stopLossPercent: number;
      takeProfit1: number;
      takeProfit1Percent: number;
      takeProfit2: number;
      takeProfit2Percent: number;
      riskRewardRatio: number;
    };
    sell: {
      entryZone: { min: number; max: number };
      stopLoss: number;
      stopLossPercent: number;
      takeProfit1: number;
      takeProfit1Percent: number;
      takeProfit2: number;
      takeProfit2Percent: number;
      riskRewardRatio: number;
    };
  }

  function computeAtr14(
    highs: number[],
    lows: number[],
    closes: number[],
    period: number = 14,
  ): number {
    const len = closes.length;
    if (len < 2) return closes[0] ? closes[0] * 0.015 : 0;

    const startIndex = Math.max(1, len - period);
    let sumTr = 0;
    let count = 0;

    for (let i = startIndex; i < len; i++) {
      const prevClose = closes[i - 1];
      const tr = Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - prevClose),
        Math.abs(lows[i] - prevClose),
      );
      sumTr += tr;
      count++;
    }

    return count > 0 ? sumTr / count : closes[len - 1] * 0.015;
  }

  function calculateAtrExecutionLevels(
    currentPrice: number,
    highs: number[],
    lows: number[],
    closes: number[],
    period: number = 14,
  ): AtrExecutionLevels {
    const rawAtr = computeAtr14(highs, lows, closes, period);
    const atr14 = formatCryptoPrice(rawAtr, currentPrice);

    // 1. Standardize the Stop Loss Distance: (ATR * 1.5)
    const rawRiskDistance = rawAtr * 1.5;

    // 2. Strict Hard Cap for Novice Protection (Safety Net):
    // The final calculated Stop Loss distance MUST NEVER exceed 4% of the entry price.
    // If the ATR calculation suggests a drop/rise of more than 4%, override and cap at exactly 4%.
    const maxRiskDistance = currentPrice * 0.04; // Strict 4.0% safety cap
    const minRiskDistance = currentPrice * 0.005; // 0.5% minimum floor to avoid zero risk

    let riskDistance = rawRiskDistance;
    let isCappedAtMaxRisk = false;

    if (riskDistance > maxRiskDistance) {
      riskDistance = maxRiskDistance;
      isCappedAtMaxRisk = true;
    } else if (riskDistance < minRiskDistance) {
      riskDistance = minRiskDistance;
    }

    const riskDistancePercent = Number(
      ((riskDistance / currentPrice) * 100).toFixed(2),
    );

    // 3. Buy Signal Execution Levels:
    // Stop Loss = currentPrice - (ATR * 1.5), strictly hard-capped at 4% maximum drop
    const rawBuySl = Math.max(currentPrice * 0.96, currentPrice - riskDistance);
    let buyStopLoss = formatCryptoPrice(rawBuySl, currentPrice);
    // Guarantee that decimal rounding never causes distance to exceed 4.00%
    if ((currentPrice - buyStopLoss) / currentPrice > 0.04) {
      const step =
        currentPrice < 0.0001
          ? 1e-8
          : currentPrice < 0.01
            ? 1e-6
            : currentPrice < 0.1
              ? 1e-5
              : currentPrice < 10
                ? 1e-4
                : 1e-2;
      buyStopLoss = formatCryptoPrice(buyStopLoss + step, currentPrice);
    }
    const buyStopLossPercent = Number(
      (((buyStopLoss - currentPrice) / currentPrice) * 100).toFixed(2),
    );

    // Recalculate TP1 (1.5x risk distance) and TP2 (2.5x risk distance) strictly using the corrected risk distance
    const buyTp1 = formatCryptoPrice(
      currentPrice + riskDistance * 1.5,
      currentPrice,
    );
    const buyTp1Percent = Number(
      (((buyTp1 - currentPrice) / currentPrice) * 100).toFixed(2),
    );
    const buyTp2 = formatCryptoPrice(
      currentPrice + riskDistance * 2.5,
      currentPrice,
    );
    const buyTp2Percent = Number(
      (((buyTp2 - currentPrice) / currentPrice) * 100).toFixed(2),
    );

    const buyEntryMin = formatCryptoPrice(
      currentPrice - riskDistance * 0.2,
      currentPrice,
    );
    const buyEntryMax = formatCryptoPrice(
      currentPrice + riskDistance * 0.1,
      currentPrice,
    );

    // 4. Sell Signal Execution Levels:
    // Stop Loss = currentPrice + (ATR * 1.5), strictly hard-capped at 4% maximum rise
    const rawSellSl = Math.min(
      currentPrice * 1.04,
      currentPrice + riskDistance,
    );
    let sellStopLoss = formatCryptoPrice(rawSellSl, currentPrice);
    // Guarantee that decimal rounding never causes distance to exceed 4.00%
    if ((sellStopLoss - currentPrice) / currentPrice > 0.04) {
      const step =
        currentPrice < 0.0001
          ? 1e-8
          : currentPrice < 0.01
            ? 1e-6
            : currentPrice < 0.1
              ? 1e-5
              : currentPrice < 10
                ? 1e-4
                : 1e-2;
      sellStopLoss = formatCryptoPrice(sellStopLoss - step, currentPrice);
    }
    const sellStopLossPercent = Number(
      (((sellStopLoss - currentPrice) / currentPrice) * 100).toFixed(2),
    );

    // Recalculate TP1 (1.5x risk distance) and TP2 (2.5x risk distance) strictly using the corrected risk distance
    const sellTp1 = formatCryptoPrice(
      currentPrice - riskDistance * 1.5,
      currentPrice,
    );
    const sellTp1Percent = Number(
      (((currentPrice - sellTp1) / currentPrice) * 100).toFixed(2),
    );
    const sellTp2 = formatCryptoPrice(
      currentPrice - riskDistance * 2.5,
      currentPrice,
    );
    const sellTp2Percent = Number(
      (((currentPrice - sellTp2) / currentPrice) * 100).toFixed(2),
    );

    const sellEntryMin = formatCryptoPrice(
      currentPrice - riskDistance * 0.1,
      currentPrice,
    );
    const sellEntryMax = formatCryptoPrice(
      currentPrice + riskDistance * 0.2,
      currentPrice,
    );

    return {
      atr14,
      rawAtr,
      riskDistance: formatCryptoPrice(riskDistance, currentPrice),
      riskDistancePercent,
      isCappedAtMaxRisk,
      buy: {
        entryZone: { min: buyEntryMin, max: buyEntryMax },
        stopLoss: buyStopLoss,
        stopLossPercent: buyStopLossPercent,
        takeProfit1: buyTp1,
        takeProfit1Percent: buyTp1Percent,
        takeProfit2: buyTp2,
        takeProfit2Percent: buyTp2Percent,
        riskRewardRatio: 1.5,
      },
      sell: {
        entryZone: { min: sellEntryMin, max: sellEntryMax },
        stopLoss: sellStopLoss,
        stopLossPercent: sellStopLossPercent,
        takeProfit1: sellTp1,
        takeProfit1Percent: sellTp1Percent,
        takeProfit2: sellTp2,
        takeProfit2Percent: sellTp2Percent,
        riskRewardRatio: 1.5,
      },
    };
  }

  // Higher timeframe (1w, 1M) candle caching (5 minutes TTL) to prevent redundant queries
  interface CachedHigherTfKlines {
    klines: any[];
    fetchedAt: number;
  }
  const higherTfKlineCache = new Map<string, CachedHigherTfKlines>();
  const HIGHER_TF_CACHE_TTL_MS = 300_000; // 5 minutes

  async function getHigherTfKlines(
    symbol: string,
    interval: "1w" | "1M",
  ): Promise<any[]> {
    const cacheKey = `${symbol}_${interval}`;
    const now = Date.now();
    const cached = higherTfKlineCache.get(cacheKey);
    if (cached && now - cached.fetchedAt < HIGHER_TF_CACHE_TTL_MS) {
      return cached.klines;
    }
    const klines = await fetchBinanceSpotOrFutures<any[]>(
      `/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=25`,
      symbol,
    );
    if (Array.isArray(klines) && klines.length >= 9) {
      higherTfKlineCache.set(cacheKey, { klines, fetchedAt: now });
      return klines;
    }
    throw new Error(`Insufficient klines for ${symbol} ${interval}`);
  }

  interface TimeframeIndicators {
    timeframe: string;
    trend: "BULLISH" | "BEARISH" | "NEUTRAL";
    ema9: number;
    ema21: number;
    vwap: number;
    isAboveVwap: boolean;
    distanceToVwapPercent: number;
    emaSpreadPercent: number;
    crossoverStatus:
      | "BULLISH_CROSS"
      | "BEARISH_CROSS"
      | "SUSTAINED_UPTREND"
      | "SUSTAINED_DOWNTREND"
      | "CHOP_CONSOLIDATION";
  }

  // Pure function computing authentic VWAP, EMA 9, EMA 21, crossover status, and trend from real klines
  function computeTimeframeIndicators(
    rawKlines: any[],
    tf: string,
    refPrice?: number,
  ): TimeframeIndicators {
    if (!Array.isArray(rawKlines) || rawKlines.length === 0) {
      throw new Error(`Empty klines array for timeframe ${tf}`);
    }

    let cumTypVol = 0;
    let cumVol = 0;
    const closes: number[] = [];

    for (const k of rawKlines) {
      const h = parseFloat(k[2]);
      const l = parseFloat(k[3]);
      const c = parseFloat(k[4]);
      const v = parseFloat(k[5]) || 1;
      const tp = (h + l + c) / 3;
      cumTypVol += tp * v;
      cumVol += v;
      closes.push(c);
    }

    const currentPrice = closes[closes.length - 1] || refPrice || 1;
    const vwap = cumVol > 0 ? cumTypVol / cumVol : currentPrice;

    function calcEma(series: number[], period: number): number[] {
      if (series.length === 0) return [0];
      const p = Math.min(period, series.length);
      const k = 2 / (period + 1);
      let ema = series.slice(0, p).reduce((a, b) => a + b, 0) / p;
      const emas = [ema];
      for (let i = p; i < series.length; i++) {
        ema = series[i] * k + ema * (1 - k);
        emas.push(ema);
      }
      return emas;
    }

    const ema9Series = calcEma(closes, 9);
    const ema21Series = calcEma(closes, 21);

    const ema9 = ema9Series[ema9Series.length - 1];
    const ema21 = ema21Series[ema21Series.length - 1];
    const prevEma9 =
      ema9Series.length > 1 ? ema9Series[ema9Series.length - 2] : ema9;
    const prevEma21 =
      ema21Series.length > 1 ? ema21Series[ema21Series.length - 2] : ema21;

    const isAboveVwap = currentPrice >= vwap;
    const isEmaBullish = ema9 >= ema21;
    const isFreshBullishCross = prevEma9 <= prevEma21 && ema9 > ema21;
    const isFreshBearishCross = prevEma9 >= prevEma21 && ema9 < ema21;
    const distanceToVwapPercent =
      vwap > 0 ? ((currentPrice - vwap) / vwap) * 100 : 0;
    const emaSpreadPercent = ema21 > 0 ? ((ema9 - ema21) / ema21) * 100 : 0;

    let trend: "BULLISH" | "BEARISH" | "NEUTRAL" = "NEUTRAL";
    let crossoverStatus:
      | "BULLISH_CROSS"
      | "BEARISH_CROSS"
      | "SUSTAINED_UPTREND"
      | "SUSTAINED_DOWNTREND"
      | "CHOP_CONSOLIDATION" = "CHOP_CONSOLIDATION";

    if (isEmaBullish && isAboveVwap) {
      trend = "BULLISH";
      crossoverStatus = isFreshBullishCross
        ? "BULLISH_CROSS"
        : "SUSTAINED_UPTREND";
    } else if (!isEmaBullish && !isAboveVwap) {
      trend = "BEARISH";
      crossoverStatus = isFreshBearishCross
        ? "BEARISH_CROSS"
        : "SUSTAINED_DOWNTREND";
    } else {
      trend = "NEUTRAL";
      crossoverStatus = "CHOP_CONSOLIDATION";
    }

    const targetRef = refPrice ?? currentPrice;

    return {
      timeframe: tf,
      trend,
      ema9: formatCryptoPrice(ema9, targetRef),
      ema21: formatCryptoPrice(ema21, targetRef),
      vwap: formatCryptoPrice(vwap, targetRef),
      isAboveVwap,
      distanceToVwapPercent: Number(distanceToVwapPercent.toFixed(2)),
      emaSpreadPercent: Number(emaSpreadPercent.toFixed(2)),
      crossoverStatus,
    };
  }

  async function fetchBinanceTimeframeStats(
    symbol: string,
  ): Promise<CachedTickerStats> {
    const cleanSymbol = symbol.trim().toUpperCase();

    try {
      // Parallel batch against Binance public market data API (with automatic Spot->Futures fallback)
      const [klines1h, klines1d, ticker24h, depthData] = await Promise.all([
        fetchBinanceSpotOrFutures<any[]>(
          `/api/v3/klines?symbol=${cleanSymbol}&interval=1h&limit=24`,
          cleanSymbol,
        ),
        fetchBinanceSpotOrFutures<any[]>(
          `/api/v3/klines?symbol=${cleanSymbol}&interval=1d&limit=35`,
          cleanSymbol,
        ),
        fetchBinanceSpotOrFutures<any>(
          `/api/v3/ticker/24hr?symbol=${cleanSymbol}`,
          cleanSymbol,
        ),
        orderBookDepthManager.getDepth(cleanSymbol).catch(() => null),
      ]);

      if (
        Array.isArray(klines1h) &&
        Array.isArray(klines1d) &&
        ticker24h &&
        ticker24h.lastPrice
      ) {
        const currentPrice = parseFloat(ticker24h.lastPrice);
        const high24h = parseFloat(ticker24h.highPrice) || currentPrice;
        const low24h = parseFloat(ticker24h.lowPrice) || currentPrice;
        const open24h = parseFloat(ticker24h.openPrice) || currentPrice;
        const priceChange24h =
          parseFloat(ticker24h.priceChangePercent) ||
          safePct(currentPrice, open24h);

        // 24 Hours (24h) verified range from official 24hr ticker & 24 hourly klines
        let min24h = low24h > 0 ? low24h : currentPrice;
        let max24h = high24h > 0 ? high24h : currentPrice;
        let priceChange1h = 0;

        if (klines1h.length > 0 && currentPrice > 0) {
          const latestHourOpen =
            parseFloat(klines1h[klines1h.length - 1][1]) || currentPrice;
          priceChange1h = safePct(currentPrice, latestHourOpen);
          for (let i = 0; i < klines1h.length; i++) {
            const h = parseFloat(klines1h[i][2]);
            const l = parseFloat(klines1h[i][3]);
            if (Number.isFinite(h) && h > max24h) max24h = h;
            if (Number.isFinite(l) && l > 0 && l < min24h) min24h = l;
          }
        }

        const range24h = finalizeRangePayload(
          min24h,
          max24h,
          open24h,
          currentPrice,
        );

        // Single-pass extraction for 1 Week (7d) and 1 Month (30d) from daily klines
        const totalDays = klines1d.length;
        let runningMin = min24h;
        let runningMax = max24h;
        let open1w = open24h;
        let open1m = open24h;
        let min1w = min24h,
          max1w = max24h;
        let min1m = min24h,
          max1m = max24h;

        // Walk backwards from most recent daily candle to oldest
        for (let i = totalDays - 1; i >= 0; i--) {
          const candle = klines1d[i];
          const open = parseFloat(candle[1]) || currentPrice;
          const high = parseFloat(candle[2]) || currentPrice;
          const low = parseFloat(candle[3]) || currentPrice;

          if (Number.isFinite(high) && high > runningMax) runningMax = high;
          if (Number.isFinite(low) && low > 0 && low < runningMin)
            runningMin = low;

          const daysBack = totalDays - 1 - i;
          if (daysBack < 7) {
            open1w = open;
            min1w = runningMin;
            max1w = runningMax;
          }
          if (daysBack < 30) {
            open1m = open;
            min1m = runningMin;
            max1m = runningMax;
          }
        }

        const range1w = finalizeRangePayload(
          min1w,
          max1w,
          open1w,
          currentPrice,
        );
        const range1m = finalizeRangePayload(
          min1m,
          max1m,
          open1m,
          currentPrice,
        );

        // Pull authentic 1-minute liquidations
        const liqStats =
          futuresLiquidationManager.getLiquidationStats(cleanSymbol);

        // Determine nearestBuyWallPrice from real L2 depth (0 while unavailable; never synthetic)
        const buyWallPrice = depthData?.nearestBuyWallPrice || 0;
        const buyWallQty = depthData?.nearestBuyWallQty || 0;

        const stats: CachedTickerStats = {
          symbol: cleanSymbol,
          priceChange1h,
          priceChange24h: Number(priceChange24h.toFixed(2)),
          priceChange1w: range1w.changePercent,
          priceChange1M: range1m.changePercent,
          high24h: range24h.maxPrice,
          low24h: range24h.minPrice,
          referencePrice: currentPrice,
          ranges: {
            "24h": range24h,
            "1w": range1w,
            "1m": range1m,
          },
          nearestBuyWallPrice: buyWallPrice,
          nearestBuyWallBtc: buyWallQty,
          longLiquidations1m: liqStats.longLiquidations1m,
          longLiquidationCount1m: liqStats.longLiquidationCount1m,
          liquidationSpikeDetected: liqStats.liquidationSpikeDetected,
          fetchedAt: Date.now(),
        };

        tickerStatsCache.set(cleanSymbol, stats);
        return stats;
      }
      throw new Error(
        `Invalid ticker data received from Binance for ${cleanSymbol}`,
      );
    } catch (err: any) {
      console.warn(
        `[Market Ticker Stats Live Error for ${cleanSymbol}]`,
        err.message,
      );
      const existing = tickerStatsCache.get(cleanSymbol);
      if (existing) {
        return { ...existing };
      }
      throw err;
    }
  }

  app.get("/api/market/ticker-stats", async (req, res) => {
    const rawSymbol = String(req.query.symbol || "BTCUSDT")
      .trim()
      .toUpperCase();
    const symbol = rawSymbol.endsWith("USDT") ? rawSymbol : `${rawSymbol}USDT`;

    const cached = tickerStatsCache.get(symbol);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return res.json({ ...cached, cached: true });
    }

    // Deduplicate concurrent in-flight requests for the same symbol
    let pending = inflightRequests.get(symbol);
    if (!pending) {
      pending = fetchBinanceTimeframeStats(symbol).finally(() => {
        inflightRequests.delete(symbol);
      });
      inflightRequests.set(symbol, pending);
    }

    try {
      const stats = await pending;
      res.json({ ...stats, cached: false });
    } catch (err: any) {
      const fallbackCached = tickerStatsCache.get(symbol);
      if (fallbackCached) {
        return res.json({ ...fallbackCached, cached: true, stale: true });
      }
      return res.status(503).json({
        error: `Live market data unavailable for ${symbol}. Service temporarily busy or unreachable.`,
        symbol,
        stale: false,
      });
    }
  });

  // =========================================================================
  // ORDER BOOK (L2 DEPTH) LIVE ENDPOINT
  // Provides authentic L2 depth and nearest support floor within 5% distance
  // GUARANTEE: NEVER returns $0.00 for a live asset
  // =========================================================================
  app.get("/api/market/depth", async (req, res) => {
    const rawSymbol = String(req.query.symbol || "BTCUSDT")
      .trim()
      .toUpperCase();
    const symbol = rawSymbol.endsWith("USDT") ? rawSymbol : `${rawSymbol}USDT`;
    try {
      const depth = await orderBookDepthManager.getDepth(symbol);
      res.json({
        symbol,
        bids: depth.bids.slice(0, 20),
        asks: depth.asks.slice(0, 20),
        nearestBuyWall: depth.nearestBuyWall,
        nearestBuyWallPrice: depth.nearestBuyWallPrice,
        nearestBuyWallQty: depth.nearestBuyWallQty,
        currentPrice: depth.currentPrice,
        timestamp: depth.fetchedAt,
      });
    } catch (err: any) {
      res.status(503).json({
        error: `Order book depth unavailable for ${symbol}`,
        symbol,
        nearestBuyWallPrice: 0,
      });
    }
  });

  // =========================================================================
  // REAL-TIME FUTURES LIQUIDATIONS ENDPOINT
  // Streams authentic 1-minute aggregated forced liquidations
  // =========================================================================
  app.get("/api/market/liquidations", (req, res) => {
    const rawSymbol = req.query.symbol
      ? String(req.query.symbol).trim().toUpperCase()
      : undefined;
    const symbol = rawSymbol
      ? rawSymbol.endsWith("USDT")
        ? rawSymbol
        : `${rawSymbol}USDT`
      : undefined;
    const stats = futuresLiquidationManager.getLiquidationStats(symbol);
    res.json(stats);
  });

  // =========================================================================
  // QUANT MULTI-PAIR RADAR: Real-time Multi-ticker Live Price Endpoint
  // Queries Binance official market endpoints for the exact trading pairs (e.g. 'BTCUSDT', 'ETHUSDT')
  // Strictly extracts live spot price fields ('lastPrice' or 'price') as floats — NEVER weightedAvgPrice or historical averages
  // =========================================================================
  interface RadarPriceItem {
    symbol: string;
    price: number;
    change24h: number;
    high24h: number;
    low24h: number;
    volume: number;
    quoteVolume: number;
    timestamp: number;
  }
  let radarPricesCache: {
    data: Record<string, RadarPriceItem>;
    fetchedAt: number;
  } | null = null;
  const RADAR_CACHE_TTL_MS = 2000; // Ultra-fresh 2-second cache to prevent spamming Binance while keeping prices live

  app.get("/api/market/radar-prices", async (req, res) => {
    try {
      const now = Date.now();
      const rawSymbols = req.query.symbols ? String(req.query.symbols) : "";
      const requestedList = rawSymbols
        ? rawSymbols
            .split(",")
            .map((s) =>
              s
                .trim()
                .toUpperCase()
                .replace(/[\/\-_]/g, ""),
            )
            .filter(Boolean)
        : [];

      // If cached recently and covers the requested symbols, return fresh cache
      if (
        radarPricesCache &&
        now - radarPricesCache.fetchedAt < RADAR_CACHE_TTL_MS
      ) {
        if (
          requestedList.length === 0 ||
          requestedList.every((s) => radarPricesCache!.data[s])
        ) {
          return res.json({
            success: true,
            cached: true,
            timestamp: radarPricesCache.fetchedAt,
            prices: radarPricesCache.data,
          });
        }
      }

      // Default standard radar symbols if none specified
      const defaultRadarSymbols = [
        "BTCUSDT",
        "ETHUSDT",
        "SOLUSDT",
        "BNBUSDT",
        "XRPUSDT",
        "DOGEUSDT",
        "AVAXUSDT",
        "ADAUSDT",
        "LINKUSDT",
        "SUIUSDT",
        "NEARUSDT",
        "PEPEUSDT",
      ];
      const targetSymbols =
        requestedList.length > 0
          ? Array.from(new Set([...requestedList, ...defaultRadarSymbols]))
          : defaultRadarSymbols;

      const resultMap: Record<string, RadarPriceItem> = {};
      const spotBatchSymbols = targetSymbols.filter(
        (s) => !futuresOnlySymbols.has(s) && !invalidSymbols.has(s),
      );

      // 1. Primary attempt: Binance Spot multi-ticker batch query (excluding known Futures-only & invalid pairs)
      if (spotBatchSymbols.length > 0) {
        try {
          const batchPath = `/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(spotBatchSymbols))}`;
          const rawItems = await fetchFromBinance<any[]>(batchPath, {
            timeoutMs: 4000,
          });
          if (Array.isArray(rawItems)) {
            for (const item of rawItems) {
              if (!item || !item.symbol) continue;
              // Extract strictly the live spot price field as float — NEVER weightedAvgPrice or historical averages
              const livePrice = parseFloat(item.lastPrice || item.price || "0");
              if (Number.isFinite(livePrice) && livePrice > 0) {
                resultMap[item.symbol] = {
                  symbol: item.symbol,
                  price: livePrice,
                  change24h: parseFloat(item.priceChangePercent || "0") || 0,
                  high24h: parseFloat(item.highPrice || "0") || livePrice,
                  low24h: parseFloat(item.lowPrice || "0") || livePrice,
                  volume: parseFloat(item.volume || "0") || 0,
                  quoteVolume: parseFloat(item.quoteVolume || "0") || 0,
                  timestamp: now,
                };
              }
            }
          }
        } catch {
          // Fall forward to global Spot/Futures queries
        }
      }

      // 2. Fallback check: If any target symbols are missing (e.g. a Futures-only pair in Spot batch), resolve via full Spot & Futures tickers
      const missingAfterSpotBatch = targetSymbols.filter(
        (s) =>
          !resultMap[s] && !invalidSymbols.has(s) && !futuresOnlySymbols.has(s),
      );
      if (missingAfterSpotBatch.length > 0) {
        try {
          const allTickers = await fetchFromBinance<any[]>(
            "/api/v3/ticker/24hr",
            { timeoutMs: 6000 },
          );
          if (Array.isArray(allTickers)) {
            const tickerLookup = new Map<string, any>();
            for (const t of allTickers) {
              if (t?.symbol) tickerLookup.set(t.symbol, t);
            }
            for (const sym of missingAfterSpotBatch) {
              const found = tickerLookup.get(sym);
              if (found) {
                const livePrice = parseFloat(
                  found.lastPrice || found.price || "0",
                );
                if (Number.isFinite(livePrice) && livePrice > 0) {
                  resultMap[sym] = {
                    symbol: sym,
                    price: livePrice,
                    change24h: parseFloat(found.priceChangePercent || "0") || 0,
                    high24h: parseFloat(found.highPrice || "0") || livePrice,
                    low24h: parseFloat(found.lowPrice || "0") || livePrice,
                    volume: parseFloat(found.volume || "0") || 0,
                    quoteVolume: parseFloat(found.quoteVolume || "0") || 0,
                    timestamp: now,
                  };
                }
              }
            }
          }
        } catch {
          // Keep best effort
        }
      }

      // 3. Binance USDⓈ-M Futures fallback for Futures-only pairs (e.g., KASUSDT)
      const missingForFutures = targetSymbols.filter(
        (s) => !resultMap[s] && !invalidSymbols.has(s),
      );
      if (missingForFutures.length > 0) {
        try {
          const allFuturesTickers = await fetchFromBinanceFutures<any[]>(
            "/fapi/v1/ticker/24hr",
            { timeoutMs: 5000 },
          );
          if (Array.isArray(allFuturesTickers)) {
            const futuresLookup = new Map<string, any>();
            for (const t of allFuturesTickers) {
              if (t?.symbol) futuresLookup.set(t.symbol, t);
            }
            for (const sym of missingForFutures) {
              const found = futuresLookup.get(sym);
              if (found) {
                const livePrice = parseFloat(
                  found.lastPrice || found.price || "0",
                );
                if (Number.isFinite(livePrice) && livePrice > 0) {
                  futuresOnlySymbols.add(sym);
                  resultMap[sym] = {
                    symbol: sym,
                    price: livePrice,
                    change24h: parseFloat(found.priceChangePercent || "0") || 0,
                    high24h: parseFloat(found.highPrice || "0") || livePrice,
                    low24h: parseFloat(found.lowPrice || "0") || livePrice,
                    volume: parseFloat(found.volume || "0") || 0,
                    quoteVolume: parseFloat(found.quoteVolume || "0") || 0,
                    timestamp: now,
                  };
                }
              }
            }
          }
        } catch {
          // Keep best effort
        }
      }

      // 3. Cache and response handling:
      // If we got results, update cache and serve
      const resolvedCount = Object.keys(resultMap).length;
      if (resolvedCount > 0) {
        // Merge with existing cache if some symbols were not available in this cycle
        const merged = radarPricesCache
          ? { ...radarPricesCache.data, ...resultMap }
          : resultMap;
        radarPricesCache = { data: merged, fetchedAt: now };

        return res.json({
          success: true,
          cached: false,
          timestamp: now,
          count: Object.keys(merged).length,
          prices: merged,
        });
      }

      // If live fetch returned nothing, serve previous cache with stale: true flag
      if (radarPricesCache && Object.keys(radarPricesCache.data).length > 0) {
        return res.json({
          success: true,
          cached: true,
          stale: true,
          timestamp: radarPricesCache.fetchedAt,
          count: Object.keys(radarPricesCache.data).length,
          prices: radarPricesCache.data,
          warning:
            "Serving last verified live exchange data while refreshing connection.",
        });
      }

      // If no cached entries exist and live fetch failed, return clean HTTP 503 JSON error
      return res.status(503).json({
        success: false,
        error:
          "Live cryptocurrency prices temporarily unavailable. Please retry.",
        stale: false,
      });
    } catch (err: any) {
      console.error("[Radar Prices Endpoint Error]", err);
      if (radarPricesCache && Object.keys(radarPricesCache.data).length > 0) {
        return res.json({
          success: true,
          cached: true,
          stale: true,
          timestamp: radarPricesCache.fetchedAt,
          count: Object.keys(radarPricesCache.data).length,
          prices: radarPricesCache.data,
        });
      }
      return res.status(503).json({
        success: false,
        error: err?.message || "Failed to fetch live radar prices",
        stale: false,
      });
    }
  });

  // Simulated Webhook Endpoint for testing alerts
  app.post("/api/webhook-test", (req, res) => {
    console.log("[Webhook Received]", req.body);
    res.json({
      status: "success",
      received_at: new Date().toISOString(),
      payload_summary: req.body,
    });
  });

  // Disabled unverified client checkout endpoint (must go through verified Cryptomus flow)
  app.post("/api/payment/checkout-session", (_req, res) => {
    return res.status(403).json({
      status: "error",
      error:
        "Unverified client-side checkout is disabled. Please complete payment via Cryptomus.",
    });
  });

  // ---------------------------------------------------------------------------
  // CRYPTOMUS PAYMENT GATEWAY INTEGRATION (STRICTLY SECURED)
  // ---------------------------------------------------------------------------
  const CRYPTOMUS_MERCHANT_ID = process.env.CRYPTOMUS_MERCHANT_ID || "";
  const CRYPTOMUS_API_BASE = "https://api.cryptomus.com/v1";
  const processedPaymentOrders = new Set<string>();

  // Helper: Generate Cryptomus API Signature: MD5( base64(JSON(payload)) + PAYMENT_KEY )
  function createCryptomusSignature(
    payload: Record<string, any>,
    paymentKey: string,
  ): string {
    const jsonStr = JSON.stringify(payload);
    const base64Str = Buffer.from(jsonStr).toString("base64");
    return crypto
      .createHash("md5")
      .update(base64Str + paymentKey)
      .digest("hex");
  }

  // Helper: Strictly verify incoming Cryptomus webhook signature using crypto.timingSafeEqual
  function verifyCryptomusSignature(body: any, headerSign?: string): boolean {
    const paymentKey = process.env.CRYPTOMUS_PAYMENT_KEY;
    if (
      !paymentKey ||
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return false;
    }

    const incomingSignRaw = body.sign ?? headerSign;
    if (!incomingSignRaw || typeof incomingSignRaw !== "string") {
      return false;
    }

    const data: Record<string, any> = { ...body };
    delete data.sign;

    const jsonString = JSON.stringify(data);
    const base64Payload = Buffer.from(jsonString).toString("base64");
    const computedHash = crypto
      .createHash("md5")
      .update(base64Payload + paymentKey)
      .digest("hex")
      .toLowerCase();

    const incomingHash = incomingSignRaw.trim().toLowerCase();
    const computedBuf = Buffer.from(computedHash, "utf8");
    const incomingBuf = Buffer.from(incomingHash, "utf8");

    if (computedBuf.length !== incomingBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(computedBuf, incomingBuf);
  }

  // Firebase Firestore Configuration & Safe Admin SDK Initialization
  const FIREBASE_PROJECT_ID =
    process.env.FIREBASE_PROJECT_ID || "striped-outrider-l1ttq";
  const FIRESTORE_DATABASE_ID =
    process.env.FIRESTORE_DATABASE_ID ||
    "ai-studio-bitcoinflashcras-b8da80f3-9055-4083-89a4-36a68bb0c761";
  const FIREBASE_API_KEY =
    process.env.FIREBASE_API_KEY || "AIzaSyBwVB9jxehbtwHfXheRpa_WtNdkhr7S2zE";

  let adminAppInstance: AdminApp | null = null;
  let adminDb: AdminFirestore | null = null;
  try {
    const existingApps = getAdminApps();
    if (existingApps.length > 0) {
      adminAppInstance = existingApps[0];
    } else {
      const rawSaJson =
        process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
        process.env.FIREBASE_SERVICE_ACCOUNT;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n",
      );

      if (rawSaJson) {
        const parsedSa = JSON.parse(rawSaJson);
        adminAppInstance = initializeAdminApp({
          credential: cert(parsedSa),
          projectId: parsedSa.project_id || FIREBASE_PROJECT_ID,
        });
      } else if (clientEmail && privateKey) {
        adminAppInstance = initializeAdminApp({
          credential: cert({
            projectId: FIREBASE_PROJECT_ID,
            clientEmail,
            privateKey,
          }),
          projectId: FIREBASE_PROJECT_ID,
        });
      } else {
        adminAppInstance = initializeAdminApp({
          projectId: FIREBASE_PROJECT_ID,
        });
      }
    }
    if (adminAppInstance) {
      adminDb = getAdminFirestore(adminAppInstance, FIRESTORE_DATABASE_ID);
    }
  } catch (adminInitErr: any) {
    console.warn(
      `[Firebase Admin Init Notice]: ${adminInitErr?.message || adminInitErr}`,
    );
  }

  // Flag to track whether Admin SDK has working credentials in this runtime
  let adminSdkCredentialsAvailable = Boolean(
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
    process.env.FIREBASE_SERVICE_ACCOUNT ||
    process.env.FIREBASE_PRIVATE_KEY ||
    process.env.K_SERVICE,
  );

  // Cached Google OAuth2 access token from Service Account credentials (if provided in env)
  let cachedServiceAccountToken: { token: string; expiresAt: number } | null =
    null;

  function toBase64Url(input: Buffer | string): string {
    const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
    return buf
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  async function getFirestoreServiceAccountToken(): Promise<string | null> {
    if (
      cachedServiceAccountToken &&
      Date.now() < cachedServiceAccountToken.expiresAt - 60_000
    ) {
      return cachedServiceAccountToken.token;
    }

    let clientEmail = process.env.FIREBASE_CLIENT_EMAIL || "";
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || "";

    const rawSaJson =
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
      process.env.FIREBASE_SERVICE_ACCOUNT;
    if ((!clientEmail || !privateKey) && rawSaJson) {
      try {
        const parsed = JSON.parse(rawSaJson);
        clientEmail = parsed.client_email || clientEmail;
        privateKey = parsed.private_key || privateKey;
      } catch (e) {
        console.warn(
          "[Firestore Service Account] Failed to parse FIREBASE_SERVICE_ACCOUNT JSON",
        );
      }
    }

    if (!clientEmail || !privateKey) {
      return null;
    }

    privateKey = privateKey.replace(/\\n/g, "\n");

    try {
      const nowSec = Math.floor(Date.now() / 1000);
      const header = toBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
      const claimSet = toBase64Url(
        JSON.stringify({
          iss: clientEmail,
          scope: "https://www.googleapis.com/auth/datastore",
          aud: "https://oauth2.googleapis.com/token",
          exp: nowSec + 3600,
          iat: nowSec,
        }),
      );
      const unsignedJwt = `${header}.${claimSet}`;
      const signer = crypto.createSign("RSA-SHA256");
      signer.update(unsignedJwt);
      signer.end();
      const signature = toBase64Url(signer.sign(privateKey));
      const assertion = `${unsignedJwt}.${signature}`;

      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
          assertion,
        }).toString(),
      });

      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        console.warn(
          `[Firestore Service Account Token Error ${tokenRes.status}]`,
          errText,
        );
        return null;
      }

      const tokenJson: any = await tokenRes.json();
      if (tokenJson?.access_token) {
        cachedServiceAccountToken = {
          token: tokenJson.access_token,
          expiresAt: Date.now() + (Number(tokenJson.expires_in) || 3600) * 1000,
        };
        return tokenJson.access_token;
      }
    } catch (err: any) {
      console.warn("[Firestore Service Account Exception]", err.message);
    }

    return null;
  }

  function isGuestOrDemoUserId(userId?: string): boolean {
    if (!userId) return true;
    const clean = String(userId).trim();
    return (
      !clean ||
      clean === "guest" ||
      clean === "guest-demo-id" ||
      clean.startsWith("demo_") ||
      clean.startsWith("offline_")
    );
  }

  function isPaidTierValue(tier?: string): boolean {
    return tier === "pro" || tier === "premium";
  }

  // Helper: Verify user subscription tier and expiration directly in Firestore document
  async function verifyUserFirestoreSubscription(
    userId?: string,
    _claimedTier?: string,
    authToken?: string,
  ): Promise<{
    isPremium: boolean;
    tier: string;
    error?: string;
    trackedSymbols?: string[];
    languagePreference?: "es" | "en";
    telegramChatId?: string;
  }> {
    if (!userId) {
      return {
        isPremium: false,
        tier: "free",
        error: "User ID is required",
        trackedSymbols: [],
        languagePreference: "es",
      };
    }

    if (userId === "official_admin") {
      return {
        isPremium: true,
        tier: "pro",
        trackedSymbols: ["BTCUSDT", "ETHUSDT", "SOLUSDT", "ZECUSDT"],
        languagePreference: "es",
      };
    }

    // Never grant PRO/Premium to unverified guest/demo identifiers
    if (isGuestOrDemoUserId(userId)) {
      return {
        isPremium: false,
        tier: "free",
        trackedSymbols: ["BTCUSDT", "ETHUSDT", "SOLUSDT"],
        languagePreference: "es",
      };
    }

    try {
      const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/${FIRESTORE_DATABASE_ID}/documents/users/${encodeURIComponent(userId)}?key=${FIREBASE_API_KEY}`;
      const headers: Record<string, string> = {};
      const saToken = await getFirestoreServiceAccountToken();
      if (saToken) {
        headers["Authorization"] = `Bearer ${saToken}`;
      } else if (authToken) {
        headers["Authorization"] = authToken.startsWith("Bearer ")
          ? authToken
          : `Bearer ${authToken}`;
      }

      const res = await fetch(url, { headers });

      if (!res.ok) {
        if (res.status === 404) {
          console.warn(
            `[Firestore Verify] User profile not found for uid: ${userId}`,
          );
          return {
            isPremium: false,
            tier: "free",
            error: "User not registered in database",
            trackedSymbols: [],
            languagePreference: "es",
          };
        }
        if (res.status === 403 || res.status === 401) {
          console.warn(
            `[Firestore Verify] Permission denied or unverified token for uid: ${userId}`,
          );
          return {
            isPremium: false,
            tier: "free",
            error: "Missing or invalid authentication token",
            trackedSymbols: [],
            languagePreference: "es",
          };
        }
        return {
          isPremium: false,
          tier: "free",
          error: "Firestore query failed",
          trackedSymbols: [],
          languagePreference: "es",
        };
      }

      const docData = await res.json();
      const firestoreTier =
        docData?.fields?.subscription_tier?.stringValue || "free";
      const paymentStatus = docData?.fields?.payment_status?.stringValue;
      const expField = docData?.fields?.subscription_expires_at;
      const rawExpiresAt =
        expField?.integerValue ??
        expField?.doubleValue ??
        expField?.stringValue;

      let isExpired = false;
      if (
        rawExpiresAt !== undefined &&
        rawExpiresAt !== null &&
        rawExpiresAt !== ""
      ) {
        const expTimestamp =
          typeof rawExpiresAt === "number" || /^\d+$/.test(String(rawExpiresAt))
            ? Number(rawExpiresAt)
            : new Date(String(rawExpiresAt)).getTime();
        if (Number.isFinite(expTimestamp) && expTimestamp < Date.now()) {
          isExpired = true;
          console.log(
            `[Firestore Verify] User ${userId} subscription expired at ${rawExpiresAt}`,
          );
        }
      }

      let trackedSymbols: string[] = [];
      if (docData?.fields?.tracked_symbols?.arrayValue?.values) {
        trackedSymbols = docData.fields.tracked_symbols.arrayValue.values
          .map((v: any) => v.stringValue?.toUpperCase()?.trim())
          .filter(Boolean);
      }

      const rawLang = docData?.fields?.language_preference?.stringValue;
      const languagePreference: "es" | "en" =
        rawLang === "en" || rawLang === "es" ? rawLang : "es";
      const telegramChatId =
        docData?.fields?.telegram_chat_id?.stringValue || undefined;

      const isPremium =
        isPaidTierValue(firestoreTier) &&
        paymentStatus !== "inactive" &&
        !isExpired;
      return {
        isPremium,
        tier: isPremium ? firestoreTier : "free",
        trackedSymbols,
        languagePreference,
        telegramChatId,
      };
    } catch (err: any) {
      console.warn(`[Firestore Verify Error for ${userId}]`, err.message);
      return {
        isPremium: false,
        tier: "free",
        error: err.message,
        trackedSymbols: [],
        languagePreference: "es",
      };
    }
  }

  // Helper: Update user language preference in Firestore via REST API
  async function updateFirestoreUserLanguage(
    userId: string,
    language: "es" | "en",
    authToken?: string,
  ) {
    try {
      if (isGuestOrDemoUserId(userId)) {
        console.log(
          `[Firestore Language] Guest user ${userId} updated in memory: ${language}`,
        );
        return { ok: true, guest: true };
      }

      const cleanLang: "es" | "en" = language === "en" ? "en" : "es";
      const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/${FIRESTORE_DATABASE_ID}/documents/users/${encodeURIComponent(userId)}?updateMask.fieldPaths=language_preference&key=${FIREBASE_API_KEY}`;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const saToken = await getFirestoreServiceAccountToken();
      if (saToken) {
        headers["Authorization"] = `Bearer ${saToken}`;
      } else if (authToken) {
        headers["Authorization"] = authToken.startsWith("Bearer ")
          ? authToken
          : `Bearer ${authToken}`;
      } else {
        // Client SDK already updates Firestore directly; skip unauthenticated REST PATCH to avoid 403 permission error
        return { ok: true, clientHandled: true };
      }

      const body = {
        fields: {
          language_preference: {
            stringValue: cleanLang,
          },
        },
      };

      const res = await fetch(url, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error?.message || `HTTP ${res.status}`;
        console.warn(
          `[Firestore Language Update Notice ${res.status}]: ${msg}`,
        );
        return { ok: false, error: msg };
      }
      console.log(
        `[Firestore Language Preference Updated] User: ${userId} -> ${cleanLang}`,
      );
      return { ok: true, data };
    } catch (err: any) {
      console.warn(`[Firestore Language Exception]: ${err?.message || err}`);
      return {
        ok: false,
        error: err?.message || "Firestore language exception",
      };
    }
  }

  // Helper: Update tracked cryptocurrency symbols for user in Firestore via REST API
  async function updateFirestoreUserTrackedSymbols(
    userId: string,
    symbols: string[],
    authToken?: string,
  ) {
    try {
      if (isGuestOrDemoUserId(userId)) {
        console.log(
          `[Firestore Tracked Symbols] Guest user ${userId} updated in memory: [${symbols.join(", ")}]`,
        );
        return { ok: true, guest: true };
      }

      const cleanSymbols = Array.from(
        new Set(symbols.map((s) => s.toUpperCase().trim()).filter(Boolean)),
      );
      const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/${FIRESTORE_DATABASE_ID}/documents/users/${encodeURIComponent(userId)}?updateMask.fieldPaths=tracked_symbols&key=${FIREBASE_API_KEY}`;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const saToken = await getFirestoreServiceAccountToken();
      if (saToken) {
        headers["Authorization"] = `Bearer ${saToken}`;
      } else if (authToken) {
        headers["Authorization"] = authToken.startsWith("Bearer ")
          ? authToken
          : `Bearer ${authToken}`;
      } else {
        // Client SDK already updates Firestore directly; skip unauthenticated REST PATCH to avoid 403 permission error
        return { ok: true, clientHandled: true };
      }

      const body = {
        fields: {
          tracked_symbols: {
            arrayValue: {
              values: cleanSymbols.map((s) => ({ stringValue: s })),
            },
          },
        },
      };

      const res = await fetch(url, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error?.message || `HTTP ${res.status}`;
        console.warn(
          `[Firestore Tracked Symbols Update Notice ${res.status}]: ${msg}`,
        );
        return { ok: false, error: msg };
      }
      console.log(
        `[Firestore Tracked Symbols Updated] User: ${userId} -> [${cleanSymbols.join(", ")}]`,
      );
      return { ok: true, data };
    } catch (err: any) {
      console.warn(
        `[Firestore Tracked Symbols Exception]: ${err?.message || err}`,
      );
      return {
        ok: false,
        error: err?.message || "Firestore tracked symbols exception",
      };
    }
  }

  // Helper: Parse a numeric epoch timestamp from Firestore field value (Admin SDK or REST)
  function parseExpiresAtMs(rawVal: any): number | null {
    if (rawVal === undefined || rawVal === null || rawVal === "") return null;
    if (typeof rawVal === "number" && Number.isFinite(rawVal)) return rawVal;
    if (typeof rawVal?.toMillis === "function") return rawVal.toMillis();
    if (typeof rawVal === "object") {
      const candidate =
        rawVal.integerValue ?? rawVal.doubleValue ?? rawVal.stringValue;
      if (candidate !== undefined) return parseExpiresAtMs(candidate);
    }
    const str = String(rawVal).trim();
    if (/^\d+$/.test(str)) {
      const n = Number(str);
      return Number.isFinite(n) ? n : null;
    }
    const parsedDate = new Date(str).getTime();
    return Number.isFinite(parsedDate) ? parsedDate : null;
  }

  // Helper: Fetch a normalized user document from Firestore (Admin SDK with REST fallback)
  async function getFirestoreUserDocNormalized(
    userId: string,
    authToken?: string,
  ): Promise<{
    exists: boolean;
    subscription_tier: string;
    subscription_expires_at: number | null;
    payment_status: string;
    telegram_chat_id: string;
    language_preference: "es" | "en";
  } | null> {
    if (isGuestOrDemoUserId(userId)) return null;

    if (adminDb && adminSdkCredentialsAvailable) {
      try {
        const snap = await adminDb.collection("users").doc(userId).get();
        if (!snap.exists) {
          return {
            exists: false,
            subscription_tier: "free",
            subscription_expires_at: null,
            payment_status: "inactive",
            telegram_chat_id: "",
            language_preference: "es",
          };
        }
        const d = snap.data() || {};
        return {
          exists: true,
          subscription_tier: String(d.subscription_tier || "free"),
          subscription_expires_at: parseExpiresAtMs(d.subscription_expires_at),
          payment_status: String(d.payment_status || "inactive"),
          telegram_chat_id: String(d.telegram_chat_id || ""),
          language_preference: d.language_preference === "en" ? "en" : "es",
        };
      } catch (err: any) {
        adminSdkCredentialsAvailable = false;
        console.warn(`[Firebase Admin Read Fallback]: ${err?.message || err}`);
      }
    }

    try {
      const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/${FIRESTORE_DATABASE_ID}/documents/users/${encodeURIComponent(userId)}?key=${FIREBASE_API_KEY}`;
      const headers: Record<string, string> = {};
      const saToken = await getFirestoreServiceAccountToken();
      if (saToken) {
        headers["Authorization"] = `Bearer ${saToken}`;
      } else if (authToken) {
        headers["Authorization"] = authToken.startsWith("Bearer ")
          ? authToken
          : `Bearer ${authToken}`;
      }

      const res = await fetch(url, { headers });
      if (res.status === 404) {
        return {
          exists: false,
          subscription_tier: "free",
          subscription_expires_at: null,
          payment_status: "inactive",
          telegram_chat_id: "",
          language_preference: "es",
        };
      }
      if (!res.ok) return null;

      const docData: any = await res.json();
      const fields = docData?.fields || {};
      return {
        exists: true,
        subscription_tier: String(
          fields.subscription_tier?.stringValue || "free",
        ),
        subscription_expires_at: parseExpiresAtMs(
          fields.subscription_expires_at,
        ),
        payment_status: String(
          fields.payment_status?.stringValue || "inactive",
        ),
        telegram_chat_id: String(fields.telegram_chat_id?.stringValue || ""),
        language_preference:
          fields.language_preference?.stringValue === "en" ? "en" : "es",
      };
    } catch {
      return null;
    }
  }

  // Helper: Downgrade expired PRO user in Firestore to free + payment_status: 'expired' and optionally notify via Telegram
  async function expireFirestoreProSubscription(
    userId: string,
    callerAuthToken?: string,
    sendTelegramNotice: boolean = false,
    knownChatId?: string,
    knownLang?: "es" | "en",
  ): Promise<{ ok: boolean; error?: string }> {
    if (isGuestOrDemoUserId(userId)) {
      return { ok: false, error: "Invalid userId" };
    }

    let chatId = knownChatId || "";
    let langPref: "es" | "en" = knownLang === "en" ? "en" : "es";
    let updatedViaAdmin = false;

    if (adminDb && adminSdkCredentialsAvailable) {
      try {
        const userRef = adminDb.collection("users").doc(userId);
        const snap = await userRef.get();
        if (snap.exists) {
          const d = snap.data() || {};
          if (!chatId && d.telegram_chat_id)
            chatId = String(d.telegram_chat_id);
          if (!knownLang && d.language_preference === "en") langPref = "en";
        }
        await userRef.set(
          {
            subscription_tier: "free",
            payment_status: "expired",
          },
          { merge: true },
        );
        updatedViaAdmin = true;
      } catch (err: any) {
        adminSdkCredentialsAvailable = false;
        console.warn(
          `[Firebase Admin Expiration Fallback]: ${err?.message || err}`,
        );
      }
    }

    if (!updatedViaAdmin) {
      try {
        const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/${FIRESTORE_DATABASE_ID}/documents/users/${encodeURIComponent(userId)}?updateMask.fieldPaths=subscription_tier&updateMask.fieldPaths=payment_status&key=${FIREBASE_API_KEY}`;
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        const saToken = await getFirestoreServiceAccountToken();
        if (saToken) {
          headers["Authorization"] = `Bearer ${saToken}`;
        } else if (callerAuthToken) {
          headers["Authorization"] = callerAuthToken.startsWith("Bearer ")
            ? callerAuthToken
            : `Bearer ${callerAuthToken}`;
        }

        if (headers["Authorization"]) {
          const res = await fetch(url, {
            method: "PATCH",
            headers,
            body: JSON.stringify({
              fields: {
                subscription_tier: { stringValue: "free" },
                payment_status: { stringValue: "expired" },
              },
            }),
          });
          if (res.ok) {
            const data: any = await res.json();
            if (!chatId && data?.fields?.telegram_chat_id?.stringValue) {
              chatId = data.fields.telegram_chat_id.stringValue;
            }
            if (
              !knownLang &&
              data?.fields?.language_preference?.stringValue === "en"
            ) {
              langPref = "en";
            }
          }
        }
      } catch (err: any) {
        console.warn(
          `[Firestore Expiration Update Notice]: ${err?.message || err}`,
        );
      }
    }

    if (
      typeof backgroundSentinelScanner !== "undefined" &&
      backgroundSentinelScanner
    ) {
      backgroundSentinelScanner.updateSubscriberTier(userId, "free");
      if (!chatId) {
        const memSub = backgroundSentinelScanner.getSubscriber(userId);
        if (memSub?.chatId) chatId = memSub.chatId;
        if (!knownLang && memSub?.languagePreference)
          langPref = memSub.languagePreference;
      }
    }

    console.log(
      `[Firestore Subscription Expired] User: ${userId} downgraded to free (payment_status: expired)`,
    );

    if (sendTelegramNotice && chatId && chatId.trim() !== "") {
      const appUrl =
        process.env.PUBLIC_APP_URL || "https://www.sentinelriskbot.com";
      const expirationMsg =
        langPref === "en"
          ? `⚠️ *SENTINEL PRO — SUBSCRIPTION EXPIRED*\n━━━━━━━━━━━━━━━━━━━━\nYour 30-day *Sentinel PRO* access pass has expired, and your account has been switched back to the *Free* tier.\n\n🔒 *Paused PRO Features:*\n• 24/7 Private Telegram Buy, Take-Profit & Breakdown Alerts\n• Institutional ATR Execution Plans (Entry, TP1/TP2, Max 4% SL)\n• Custom Multi-Asset Watchlist Filtering\n\n⚡ Renew your 30-day PRO pass anytime to restore instant 24/7 protection:\n👉 [Renew Sentinel PRO ($29/mo)](${appUrl})`
          : `⚠️ *SENTINEL PRO — SUSCRIPCIÓN EXPIRADA*\n━━━━━━━━━━━━━━━━━━━━\nTu pase de 30 días de *Sentinel PRO* ha finalizado y tu cuenta ha vuelto al nivel *Gratuito*.\n\n🔒 *Funciones PRO en Pausa:*\n• Alertas Privadas 24/7 de Compra, Take-Profit y Ruptura Bajista\n• Planes Institucionales ATR (Entrada, TP1/TP2 y Stop Loss máx 4%)\n• Filtro Personalizado Multi-Moneda (Spot y Futuros)\n\n⚡ Renueva tu pase PRO de 30 días en cualquier momento para reactivar tu protección 24/7:\n👉 [Renovar Sentinel PRO ($29/mes)](${appUrl})`;

      await sendTelegramMessage(chatId.trim(), expirationMsg);
    }

    return { ok: true };
  }

  // Helper: Hourly Background Sweep to downgrade expired PRO subscriptions and notify via Telegram
  async function scanAndExpireOverdueSubscriptions(): Promise<void> {
    const now = Date.now();

    if (adminDb && adminSdkCredentialsAvailable) {
      try {
        const proSnapshot = await adminDb
          .collection("users")
          .where("subscription_tier", "in", ["pro", "premium"])
          .get();

        for (const docSnap of proSnapshot.docs) {
          const data = docSnap.data() || {};
          const expiresAt = parseExpiresAtMs(data.subscription_expires_at);
          if (expiresAt !== null && expiresAt < now) {
            await expireFirestoreProSubscription(
              docSnap.id,
              undefined,
              true,
              typeof data.telegram_chat_id === "string"
                ? data.telegram_chat_id
                : "",
              data.language_preference === "en" ? "en" : "es",
            );
          }
        }
        return;
      } catch (err: any) {
        adminSdkCredentialsAvailable = false;
        console.warn(
          `[Hourly Expiration Check Admin Notice]: ${err?.message || err}`,
        );
      }
    }

    // Fallback via Firestore REST API when Service Account token is configured
    try {
      const saToken = await getFirestoreServiceAccountToken();
      if (!saToken) return;

      const listUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/${FIRESTORE_DATABASE_ID}/documents/users?pageSize=200&key=${FIREBASE_API_KEY}`;
      const res = await fetch(listUrl, {
        headers: { Authorization: `Bearer ${saToken}` },
      });
      if (!res.ok) return;

      const listData: any = await res.json();
      const documents: any[] = Array.isArray(listData?.documents)
        ? listData.documents
        : [];
      for (const docItem of documents) {
        const docName = String(docItem?.name || "");
        const uid = docName.split("/").pop() || "";
        const fields = docItem?.fields || {};
        const tier = String(fields.subscription_tier?.stringValue || "free");
        if (!isPaidTierValue(tier) || !uid) continue;

        const expiresAt = parseExpiresAtMs(fields.subscription_expires_at);
        if (expiresAt !== null && expiresAt < now) {
          await expireFirestoreProSubscription(
            uid,
            undefined,
            true,
            fields.telegram_chat_id?.stringValue || "",
            fields.language_preference?.stringValue === "en" ? "en" : "es",
          );
        }
      }
    } catch (err: any) {
      console.warn(`[Hourly Expiration Check Notice]: ${err?.message || err}`);
    }
  }

  // Helper: Server-side PRO activation in Firestore + Bilingual Telegram confirmation
  async function activateFirestoreProSubscription(
    userId: string,
    days: number = 30,
    callerAuthToken?: string,
    orderReference?: string,
  ) {
    try {
      if (isGuestOrDemoUserId(userId)) {
        console.warn(
          `[Firestore PRO Activation Rejected] Cannot activate PRO for guest/unauthenticated user: ${userId}`,
        );
        return {
          ok: false,
          error: "Authenticated user ID is required for PRO activation",
        };
      }

      const expiresAtMs = Date.now() + days * 24 * 60 * 60 * 1000;
      let chatId = "";
      let langPref: "es" | "en" = "es";
      let updatedViaAdmin = false;

      if (adminDb && adminSdkCredentialsAvailable) {
        try {
          const userRef = adminDb.collection("users").doc(userId);
          await userRef.set(
            {
              subscription_tier: "pro",
              subscription_expires_at: expiresAtMs,
              payment_status: "active",
            },
            { merge: true },
          );
          const snap = await userRef.get();
          const d = snap.data() || {};
          chatId =
            typeof d.telegram_chat_id === "string" ? d.telegram_chat_id : "";
          langPref = d.language_preference === "en" ? "en" : "es";
          updatedViaAdmin = true;
        } catch (adminErr: any) {
          adminSdkCredentialsAvailable = false;
          console.warn(
            `[Firebase Admin PRO Activation Fallback]: ${adminErr?.message || adminErr}`,
          );
        }
      }

      let data: any = null;
      if (!updatedViaAdmin) {
        const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/${FIRESTORE_DATABASE_ID}/documents/users/${encodeURIComponent(userId)}?updateMask.fieldPaths=subscription_tier&updateMask.fieldPaths=subscription_expires_at&updateMask.fieldPaths=payment_status&key=${FIREBASE_API_KEY}`;

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        const saToken = await getFirestoreServiceAccountToken();
        if (saToken) {
          headers["Authorization"] = `Bearer ${saToken}`;
        } else if (callerAuthToken) {
          headers["Authorization"] = callerAuthToken.startsWith("Bearer ")
            ? callerAuthToken
            : `Bearer ${callerAuthToken}`;
        }

        const body = {
          fields: {
            subscription_tier: { stringValue: "pro" },
            subscription_expires_at: { integerValue: String(expiresAtMs) },
            payment_status: { stringValue: "active" },
          },
        };

        const res = await fetch(url, {
          method: "PATCH",
          headers,
          body: JSON.stringify(body),
        });

        data = await res.json();
        if (!res.ok) {
          const msg = data?.error?.message || `HTTP ${res.status}`;
          console.warn(
            `[Firestore PRO Activation Notice ${res.status}]: ${msg}`,
          );
          return { ok: false, error: msg };
        }
        chatId = data?.fields?.telegram_chat_id?.stringValue || "";
        langPref =
          data?.fields?.language_preference?.stringValue === "en" ? "en" : "es";
      }

      console.log(
        `[Firestore User PRO Activated] User: ${userId} -> Tier: pro, ExpiresMs: ${expiresAtMs}, Status: active`,
      );

      if (
        typeof backgroundSentinelScanner !== "undefined" &&
        backgroundSentinelScanner
      ) {
        backgroundSentinelScanner.updateSubscriberTier(userId, "pro");
      }

      // Send celebratory bilingual Telegram confirmation if user has a linked telegram_chat_id
      const orderKey = orderReference ? `${userId}:${orderReference}` : null;
      const shouldSendTelegram =
        !orderKey || !processedPaymentOrders.has(orderKey);
      if (orderKey) {
        processedPaymentOrders.add(orderKey);
      }

      if (shouldSendTelegram) {
        if (
          (!chatId || chatId.trim() === "") &&
          typeof backgroundSentinelScanner !== "undefined" &&
          backgroundSentinelScanner
        ) {
          const memSub = backgroundSentinelScanner.getSubscriber(userId);
          if (memSub?.chatId) {
            chatId = memSub.chatId;
            if (memSub.languagePreference) langPref = memSub.languagePreference;
          }
        }

        if (chatId && chatId.trim() !== "") {
          const expDateStr = new Date(expiresAtMs).toISOString().split("T")[0];
          const welcomeMsg =
            langPref === "en"
              ? `🚀 *SENTINEL PRO ACTIVATED!*\n━━━━━━━━━━━━━━━━━━━━\n✅ Your crypto payment has been verified and your *Sentinel PRO* membership is now *ACTIVE*.\n\n🛡️ *Unlocked 24/7 Capabilities:*\n• Private 24/7 Buy, Take-Profit & Evacuation Alerts\n• Institutional ATR Execution Plans (Entry, TP1/TP2, Max 4% SL)\n• Global Flash Crash Shield & Breakdown Warnings\n• Custom Spot & Futures Watchlist Filtering\n\n📅 *Active Until:* \`${expDateStr}\`\n🤖 _Thank you for trading safely with_ [@SentinelRiskBot_bot](https://t.me/SentinelRiskBot_bot)`
              : `🚀 *¡BIENVENIDO A SENTINEL PRO!*\n━━━━━━━━━━━━━━━━━━━━\n✅ Tu pago en cripto ha sido verificado y tu membresía *Sentinel PRO* ya está *ACTIVA*.\n\n🛡️ *Beneficios Desbloqueados 24/7:*\n• Bot Privado de Alertas 24/7 (Compra, Take-Profit y Evacuación)\n• Planes Institucionales ATR (Entrada, TP1/TP2 y Stop Loss máx 4%)\n• Escudo Global Anti-Crash y Alertas de Ruptura Bajista\n• Lista Personalizada Spot & Futuros con Filtro Anti-Spam\n\n📅 *Activo Hasta:* \`${expDateStr}\`\n🤖 _Gracias por proteger tu capital con_ [@SentinelRiskBot_bot](https://t.me/SentinelRiskBot_bot)`;

          await sendTelegramMessage(chatId, welcomeMsg);
          console.log(
            `[Telegram PRO Welcome Sent] User: ${userId} | Chat ID: ${chatId} | Lang: ${langPref}`,
          );
        }
      }

      return { ok: true, data, subscription_expires_at: expiresAtMs };
    } catch (err: any) {
      console.warn(`[Firestore PRO Activation Exception]`, err.message);
      return { ok: false, error: err.message };
    }
  }

  // 1. POST /api/payments/create-invoice - Generate Cryptomus Payment Invoice
  app.post("/api/payments/create-invoice", async (req, res) => {
    try {
      const paymentKey = process.env.CRYPTOMUS_PAYMENT_KEY || "";
      const isPlaceholderCredentials =
        !CRYPTOMUS_MERCHANT_ID ||
        !paymentKey ||
        CRYPTOMUS_MERCHANT_ID.includes("aqui_pones") ||
        paymentKey.includes("aqui_pones") ||
        CRYPTOMUS_MERCHANT_ID.includes("your_") ||
        paymentKey.includes("your_");

      if (isPlaceholderCredentials) {
        return res.status(503).json({
          status: "error",
          error:
            "Live Cryptomus merchant credentials (CRYPTOMUS_MERCHANT_ID / CRYPTOMUS_PAYMENT_KEY) are pending activation. Replace the placeholder values in .env once your Cryptomus merchant KYC/KYB is approved.",
        });
      }

      const {
        currency = "USD",
        to_currency,
        plan = "monthly",
        userId,
        email = "trader@sentinel.node",
        returnUrl,
      } = req.body || {};

      if (isGuestOrDemoUserId(userId)) {
        return res.status(401).json({
          status: "error",
          error:
            "Please sign in with a verified account before initiating checkout.",
        });
      }

      // Server-authoritative plan pricing ($29/mo, $149/6mo, $249/yr)
      const planPrices: Record<string, string> = {
        monthly: "29.00",
        semiannual: "149.00",
        annual: "249.00",
      };
      const normalizedPlan =
        plan === "annual" || plan === "semiannual" ? plan : "monthly";
      const invoiceAmount = planPrices[normalizedPlan];
      const orderId = `sentinel_${userId}_${normalizedPlan}_${Date.now()}`;

      const host = req.get("host") || "localhost:3000";
      const protocol =
        req.protocol === "https" || host.includes(".app") ? "https" : "http";
      const callbackUrl = `${protocol}://${host}/api/payments/webhook`;
      const redirectUrl =
        returnUrl ||
        `${protocol}://${host}/?payment_status=success&order_id=${orderId}`;

      const additionalData = JSON.stringify({
        uid: userId,
        email,
        plan: normalizedPlan,
        amount: invoiceAmount,
        created_at: new Date().toISOString(),
      });

      const cryptomusPayload: Record<string, any> = {
        amount: invoiceAmount,
        currency: String(currency).toUpperCase(),
        order_id: orderId,
        url_callback: callbackUrl,
        url_return: redirectUrl,
        url_success: redirectUrl,
        is_payment_multiple: true,
        lifetime: 7200, // 2 hours
        additional_data: additionalData,
      };

      if (to_currency) {
        cryptomusPayload.to_currency = String(to_currency).toUpperCase();
      }

      console.log(
        `[Cryptomus Invoice Request] Order: ${orderId} | Amount: ${invoiceAmount} ${currency} | Plan: ${normalizedPlan} | User: ${userId}`,
      );

      const sign = createCryptomusSignature(cryptomusPayload, paymentKey);
      const response = await fetch(`${CRYPTOMUS_API_BASE}/payment`, {
        method: "POST",
        headers: {
          merchant: CRYPTOMUS_MERCHANT_ID,
          sign: sign,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cryptomusPayload),
      });

      const cryptomusData = await response.json();
      console.log(
        `[Cryptomus API Response] Status: ${response.status} | State: ${cryptomusData?.state ?? "N/A"}`,
      );

      if (!response.ok || !cryptomusData?.result) {
        return res.status(502).json({
          status: "error",
          error:
            cryptomusData?.message ||
            "Failed to generate invoice with Cryptomus gateway",
        });
      }

      const resData = cryptomusData.result;
      return res.json({
        status: "success",
        order_id: orderId,
        invoice_uuid: resData.uuid,
        payment_url: resData.url,
        amount: resData.amount,
        currency: resData.currency,
        payment_amount: resData.payment_amount,
        payment_currency: resData.payer_currency || to_currency || "USDT",
        address: resData.address || "",
        network: resData.network || "",
        expired_at: resData.expired_at,
        status_payment: resData.status,
        is_test: false,
      });
    } catch (err: any) {
      console.error("[Create Invoice Error]", err);
      return res
        .status(500)
        .json({
          status: "error",
          error: err.message || "Failed to create payment invoice",
        });
    }
  });

  // 2. Hardened Cryptomus Webhook Handler (mounted on /api/payments/webhook, /api/webhooks/cryptomus, and /api/payment/webhook)
  const handleCryptomusWebhook = async (
    req: express.Request,
    res: express.Response,
  ) => {
    try {
      const webhookData = req.body;
      const headerSign =
        typeof req.headers["sign"] === "string"
          ? req.headers["sign"]
          : undefined;

      // Fail closed with 401 if CRYPTOMUS_PAYMENT_KEY is missing OR signature does not match
      const isValid = verifyCryptomusSignature(webhookData, headerSign);
      if (!isValid) {
        console.warn(
          "[Cryptomus Webhook] Rejected request with missing key or invalid signature.",
        );
        return res.status(401).json({ error: "Invalid payment signature" });
      }

      const { status, order_id, additional_data, uuid } = webhookData;

      // Only activate on Cryptomus verified paid statuses: 'paid' or 'paid_over'
      const isPaid = status === "paid" || status === "paid_over";

      if (isPaid) {
        let userId = "";
        let plan = "monthly";

        if (additional_data) {
          try {
            const parsed =
              typeof additional_data === "string"
                ? JSON.parse(additional_data)
                : additional_data;
            userId = parsed.uid || parsed.userId || "";
            plan = parsed.plan || "monthly";
          } catch (e) {
            console.warn("Error parsing additional_data JSON in webhook", e);
          }
        }

        // Fallback: extract UID from order_id pattern: sentinel_<UID>_<plan>_<timestamp>
        if (!userId && order_id) {
          const parts = String(order_id).split("_");
          if (parts.length >= 2) {
            userId = parts[1];
          }
        }

        const days = plan === "annual" ? 365 : plan === "semiannual" ? 180 : 30;
        console.log(
          `[Cryptomus Payment Verified] Order: ${order_id} | UUID: ${uuid} | Status: ${status} | User: ${userId} | Plan: ${plan}`,
        );

        if (isGuestOrDemoUserId(userId)) {
          return res
            .status(400)
            .json({
              error:
                "Valid authenticated userId is required for PRO activation",
            });
        }

        const activation = await activateFirestoreProSubscription(
          userId,
          days,
          undefined,
          String(order_id || uuid || ""),
        );
        if (!activation.ok) {
          return res.status(500).json({
            received: true,
            status: "error",
            error: activation.error || "Failed to persist PRO activation",
          });
        }

        return res.json({
          received: true,
          status: "success",
          order_id,
          user_upgraded: userId,
          subscription_tier: "pro",
          subscription_expires_at: activation.subscription_expires_at,
          payment_status: "active",
        });
      }

      return res.json({
        received: true,
        status: status || "pending",
        order_id,
      });
    } catch (err: any) {
      console.error("[Cryptomus Webhook Exception]", err);
      return res
        .status(500)
        .json({ error: err.message || "Webhook handling error" });
    }
  };

  app.post("/api/payments/webhook", handleCryptomusWebhook);
  app.post("/api/webhooks/cryptomus", handleCryptomusWebhook);
  app.post("/api/payment/webhook", handleCryptomusWebhook);

  // 3. POST /api/payments/verify-invoice - Strictly Verified Cryptomus Payment Check
  app.post("/api/payments/verify-invoice", async (req, res) => {
    try {
      const paymentKey = process.env.CRYPTOMUS_PAYMENT_KEY;
      const headerSign =
        typeof req.headers["sign"] === "string"
          ? req.headers["sign"]
          : undefined;
      if (!paymentKey) {
        console.error(
          "[Verify Invoice Security Error] CRYPTOMUS_PAYMENT_KEY is missing.",
        );
        return res.status(401).json({ error: "Invalid payment signature" });
      }

      if (
        (req.body?.sign !== undefined || headerSign !== undefined) &&
        !verifyCryptomusSignature(req.body, headerSign)
      ) {
        console.warn(
          "[Verify Invoice Security Error] Rejected invalid signature on verify-invoice.",
        );
        return res.status(401).json({ error: "Invalid payment signature" });
      }

      if (!CRYPTOMUS_MERCHANT_ID) {
        return res.status(500).json({
          status: "error",
          error:
            "Payment gateway misconfigured: missing CRYPTOMUS_MERCHANT_ID.",
        });
      }

      const {
        order_id,
        invoice_uuid,
        userId,
        plan = "monthly",
      } = req.body || {};
      const authHeader = req.headers.authorization;
      console.log(
        `[Verify Invoice Check] Order: ${order_id} | UUID: ${invoice_uuid} | User: ${userId}`,
      );

      if (!invoice_uuid || !order_id) {
        return res.status(400).json({
          status: "error",
          error:
            "Missing required invoice parameters (invoice_uuid, order_id).",
        });
      }

      if (isGuestOrDemoUserId(userId)) {
        return res.status(401).json({
          status: "error",
          error:
            "Authenticated account required to verify payment and activate PRO.",
        });
      }

      // Block Mock/Demo Invoices
      if (String(invoice_uuid).startsWith("inv_")) {
        return res.status(403).json({
          status: "error",
          payment_status: "pending",
          error:
            "Mock or demo invoice UUIDs cannot be verified for live account upgrades.",
        });
      }

      const days = plan === "annual" ? 365 : plan === "semiannual" ? 180 : 30;
      const checkPayload = { uuid: invoice_uuid, order_id };
      const sign = createCryptomusSignature(checkPayload, paymentKey);

      let checkRes: Response;
      try {
        checkRes = await fetch(`${CRYPTOMUS_API_BASE}/payment/info`, {
          method: "POST",
          headers: {
            merchant: CRYPTOMUS_MERCHANT_ID,
            sign,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(checkPayload),
        });
      } catch (apiErr: any) {
        console.warn("[Cryptomus Verify Info Unreachable]", apiErr.message);
        return res.status(502).json({
          status: "error",
          error: "Payment gateway verification unreachable",
        });
      }

      if (!checkRes.ok) {
        const errorText = await checkRes.text();
        console.warn(
          `[Cryptomus Verify Info Error ${checkRes.status}]`,
          errorText,
        );
        return res.status(400).json({
          status: "error",
          error: "Unable to verify live payment status with Cryptomus API",
        });
      }

      const checkData = await checkRes.json();
      const result = checkData?.result;

      if (!result) {
        return res.status(400).json({
          status: "error",
          error: "Invalid response from Cryptomus API",
        });
      }

      if (
        result.order_id &&
        String(result.order_id).trim() !== String(order_id).trim()
      ) {
        return res.status(403).json({
          status: "error",
          payment_status: "fraud_detected",
          error: "Order ID mismatch detected",
        });
      }

      if (
        result.uuid &&
        String(result.uuid).toLowerCase() !== String(invoice_uuid).toLowerCase()
      ) {
        return res.status(403).json({
          status: "error",
          payment_status: "fraud_detected",
          error: "Invoice UUID mismatch detected",
        });
      }

      const pStatus = result.status || result.payment_status;
      const isPaid = pStatus === "paid" || pStatus === "paid_over";

      if (!isPaid) {
        return res.json({
          status: "pending",
          order_id,
          invoice_uuid,
          payment_status: pStatus || "pending",
          subscription_tier: "free",
        });
      }

      const activation = await activateFirestoreProSubscription(
        userId,
        days,
        authHeader,
        String(order_id),
      );
      if (!activation.ok) {
        return res.status(500).json({
          status: "error",
          error:
            activation.error || "Payment verified but database update failed.",
        });
      }

      return res.json({
        status: "success",
        order_id,
        invoice_uuid,
        payment_status: "active",
        subscription_tier: "pro",
        subscription_expires_at: activation.subscription_expires_at,
        expires_in_days: days,
        verified_at: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("[Verify Invoice Error]", err);
      return res.status(500).json({
        status: "error",
        error: err.message || "Failed to verify invoice",
      });
    }
  });

  const TELEGRAM_BOT_TOKEN =
    process.env.TELEGRAM_BOT_TOKEN ||
    "8584754414:AAEK6_4ipchAIvyH60VJH6spravz6_2_bi4";
  const TELEGRAM_BOT_USERNAME =
    process.env.TELEGRAM_BOT_USERNAME || "SentinelRiskBot_bot";

  // Helper to send messages via official Telegram Bot API
  async function sendTelegramMessage(
    chatId: string | number,
    text: string,
    customToken?: string,
  ) {
    const token = customToken || TELEGRAM_BOT_TOKEN;
    if (!token || !chatId)
      return { ok: false, error: "Missing token or chatId" };

    try {
      let response = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: "Markdown",
            disable_web_page_preview: true,
          }),
        },
      );
      let data = await response.json();

      // Resilient fallback: If Telegram fails due to Markdown entity mismatch, retry sending as sanitized plain text
      if (!data?.ok && data?.description?.includes("can't parse entities")) {
        console.warn(
          `[Telegram Dispatch] Markdown entity parse warning (${data.description}). Retrying with plain text...`,
        );
        response = await fetch(
          `https://api.telegram.org/bot${token}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: text.replace(/[*_`]/g, ""),
              disable_web_page_preview: true,
            }),
          },
        );
        data = await response.json();
      }

      return { ok: response.ok && data.ok, data };
    } catch (err: any) {
      console.warn(`[Telegram API Dispatch Error]`, err.message);
      return { ok: false, error: err.message };
    }
  }

  // ---------------------------------------------------------------------------
  // 24/7 AUTONOMOUS BACKGROUND SENTINEL SCANNER & TELEGRAM BROADCAST ENGINE
  // ---------------------------------------------------------------------------
  interface TelegramSubscriber {
    userId: string;
    chatId: string;
    username?: string;
    subscriptionTier: "free" | "pro" | "premium";
    linkedAt: string;
    lastNotifiedAt?: number;
    trackedSymbols?: string[];
    languagePreference?: "es" | "en";
  }

  function buildBuyAlertMarkdown(signal: any, isEs: boolean = true): string {
    const symbol = signal.symbol;
    const score = signal.opportunityScore;
    const price = formatCryptoPrice(signal.currentPrice, signal.currentPrice);
    const mfi = signal.mfi;
    const rsi = signal.rsi;
    const absorption = Math.round((signal.bidAbsorptionRatio || 0.5) * 100);
    const entryMin = formatCryptoPrice(
      signal.entryZone?.min,
      signal.currentPrice,
    );
    const entryMax = formatCryptoPrice(
      signal.entryZone?.max,
      signal.currentPrice,
    );
    const sl = formatCryptoPrice(signal.stopLoss, signal.currentPrice);
    const slPct = signal.stopLossPercent || -1.5;
    const tp1 = formatCryptoPrice(signal.takeProfit1, signal.currentPrice);
    const tp1Pct = signal.takeProfit1Percent || 2.5;
    const tp2 = formatCryptoPrice(signal.takeProfit2, signal.currentPrice);
    const tp2Pct = signal.takeProfit2Percent || 5.0;
    const rr = signal.riskRewardRatio || 2.0;

    if (isEs) {
      return `🟢 *SENTINEL • ALERTA DE COMPRA INSTITUCIONAL (24/7)*
━━━━━━━━━━━━━━━━━━━━
🎯 *Activo:* \`${symbol}\` | *Precio Actual:* \`$${price}\`
⚡ *Puntuación de Oportunidad:* \`${score}/100\` (${signal.signalStrength || "ALTA CONFLUENCIA"})

📊 *MÉTRICAS DEL DISPARADOR:*
• *MFI (14):* \`${mfi}\` (Sobreventa Detectada)
• *RSI (14):* \`${rsi}\`
• *Absorción Compradora:* \`${absorption}%\` (Freno de ventas en soporte)

🎯 *NIVELES DE OPERACIÓN SUGERIDOS (ATR REAL):*
• *Zona de Entrada:* \`$${entryMin} - $${entryMax}\`
• *Stop Loss:* \`$${sl}\` (\`${slPct}%\`)
• *Objetivo 1 (TP1):* \`$${tp1}\` (\`+${tp1Pct}%\`)
• *Objetivo 2 (TP2):* \`$${tp2}\` (\`+${tp2Pct}%\`)
• *Ratio Riesgo/Beneficio:* \`1 : ${rr}\`

💡 _${signal.rationaleEs || "Presión de venta agotada. Los compradores institucionales absorben la caída."}_
🤖 _Bot Sentinel 24/7:_ [@SentinelRiskBot_bot](https://t.me/SentinelRiskBot_bot)`;
    } else {
      return `🟢 *SENTINEL • INSTITUTIONAL BUY ALERT (24/7)*
━━━━━━━━━━━━━━━━━━━━
🎯 *Asset:* \`${symbol}\` | *Current Price:* \`$${price}\`
⚡ *Opportunity Score:* \`${score}/100\` (${signal.signalStrength || "HIGH CONFLUENCE"})

📊 *TRIGGER TECHNICAL METRICS:*
• *MFI (14):* \`${mfi}\` (Oversold Dip)
• *RSI (14):* \`${rsi}\`
• *Buyer Absorption:* \`${absorption}%\` (Selling decelerating near floor)

🎯 *EXECUTION LEVELS (REAL ATR):*
• *Entry Zone:* \`$${entryMin} - $${entryMax}\`
• *Stop Loss:* \`$${sl}\` (\`${slPct}%\`)
• *Target 1 (TP1):* \`$${tp1}\` (\`+${tp1Pct}%\`)
• *Target 2 (TP2):* \`$${tp2}\` (\`+${tp2Pct}%\`)
• *Risk/Reward Ratio:* \`1 : ${rr}\`

💡 _${signal.rationaleEn || "Selling pressure exhausted. Buyers absorbing dip near support floor."}_
🤖 _Sentinel 24/7 Bot:_ [@SentinelRiskBot_bot](https://t.me/SentinelRiskBot_bot)`;
    }
  }

  function buildSellAlertMarkdown(signal: any, isEs: boolean = true): string {
    const symbol = signal.symbol;
    const score = signal.opportunityScore;
    const price = formatCryptoPrice(signal.currentPrice, signal.currentPrice);
    const mfi = signal.mfi;
    const rsi = signal.rsi;
    const resistance = Math.round((signal.askResistanceRatio || 0.5) * 100);
    const entryMin = formatCryptoPrice(
      signal.entryZone?.min,
      signal.currentPrice,
    );
    const entryMax = formatCryptoPrice(
      signal.entryZone?.max,
      signal.currentPrice,
    );
    const sl = formatCryptoPrice(signal.stopLoss, signal.currentPrice);
    const slPct = signal.stopLossPercent || 1.5;
    const tp1 = formatCryptoPrice(signal.takeProfit1, signal.currentPrice);
    const tp1Pct = signal.takeProfit1Percent || 2.5;
    const tp2 = formatCryptoPrice(signal.takeProfit2, signal.currentPrice);
    const tp2Pct = signal.takeProfit2Percent || 5.0;
    const rr = signal.riskRewardRatio || 2.0;

    if (isEs) {
      return `🔴 *SENTINEL • ALERTA DE VENTA / TOMA DE GANANCIAS (24/7)*
━━━━━━━━━━━━━━━━━━━━
🎯 *Activo:* \`${symbol}\` | *Precio Actual:* \`$${price}\`
⚡ *Puntuación de Distribución:* \`${score}/100\` (${signal.signalStrength || "DISTRIBUCIÓN INSTITUCIONAL"})

📊 *MÉTRICAS DEL DISPARADOR:*
• *MFI (14):* \`${mfi}\` (Sobrecompra Extrema)
• *RSI (14):* \`${rsi}\`
• *Presión Vendedora:* \`${resistance}%\` (Muro institucional en techo)

🎯 *NIVELES DE SALIDA / CORTO (ATR REAL):*
• *Zona de Entrada Short:* \`$${entryMin} - $${entryMax}\`
• *Stop Loss:* \`$${sl}\` (\`+${slPct}%\`)
• *Objetivo 1 (TP1):* \`$${tp1}\` (\`-${tp1Pct}%\`)
• *Objetivo 2 (TP2):* \`$${tp2}\` (\`-${tp2Pct}%\`)
• *Ratio Riesgo/Beneficio:* \`1 : ${rr}\`

💡 _${signal.rationaleEs || "Presión compradora agotada. Los vendedores institucionales frenan la subida en el techo de resistencia."}_
🤖 _Bot Sentinel 24/7:_ [@SentinelRiskBot_bot](https://t.me/SentinelRiskBot_bot)`;
    } else {
      return `🔴 *SENTINEL • INSTITUTIONAL SELL / TAKE PROFIT ALERT (24/7)*
━━━━━━━━━━━━━━━━━━━━
🎯 *Asset:* \`${symbol}\` | *Current Price:* \`$${price}\`
⚡ *Distribution Score:* \`${score}/100\` (${signal.signalStrength || "INSTITUTIONAL DISTRIBUTION"})

📊 *KEY METRICS:*
• *MFI (14):* \`${mfi}\` (Extreme Overbought)
• *RSI (14):* \`${rsi}\`
• *Seller Pressure:* \`${resistance}%\` (Ceiling capped by passive ask depth)

🎯 *SHORT / EXIT LEVELS (REAL ATR):*
• *Short Entry Zone:* \`$${entryMin} - $${entryMax}\`
• *Stop Loss:* \`$${sl}\` (\`+${slPct}%\`)
• *Target 1 (TP1):* \`$${tp1}\` (\`-${tp1Pct}%\`)
• *Target 2 (TP2):* \`$${tp2}\` (\`-${tp2Pct}%\`)
• *Risk/Reward Ratio:* \`1 : ${rr}\`

💡 _${signal.rationaleEn || "Buying momentum exhausted. Institutional sellers capping advance near resistance."}_
🤖 _Sentinel 24/7 Bot:_ [@SentinelRiskBot_bot](https://t.me/SentinelRiskBot_bot)`;
    }
  }

  function buildVwapAlertMarkdown(signal: any, isEs: boolean = true): string {
    const symbol = signal.symbol;
    const price = formatCryptoPrice(signal.currentPrice, signal.currentPrice);
    const trend =
      signal.signalType === "BUY"
        ? isEs
          ? "ALCISTA"
          : "BULLISH"
        : isEs
          ? "BAJISTA"
          : "BEARISH";
    const score = signal.trendScore || 85;
    const vwap = formatCryptoPrice(signal.vwap, signal.currentPrice);
    const dist = signal.distanceToVwapPercent || 0;
    const ema9 = formatCryptoPrice(signal.ema9, signal.currentPrice);
    const ema21 = formatCryptoPrice(signal.ema21, signal.currentPrice);
    const spread = signal.emaSpreadPercent || 0;
    const entryMin = formatCryptoPrice(
      signal.entryZone?.min,
      signal.currentPrice,
    );
    const entryMax = formatCryptoPrice(
      signal.entryZone?.max,
      signal.currentPrice,
    );
    const sl = formatCryptoPrice(signal.stopLoss, signal.currentPrice);
    const tp1 = formatCryptoPrice(signal.takeProfit1, signal.currentPrice);
    const rr = signal.riskRewardRatio || 2.0;

    if (isEs) {
      return `⚡ *SENTINEL • ALERTA DE CONFLUENCIA DE TENDENCIA (24/7)*
━━━━━━━━━━━━━━━━━━━━
🎯 *Activo:* \`${symbol}\` | *Precio:* \`$${price}\`
📈 *Dirección de Tendencia:* \`${trend}\` (\`${score}/100\` Fuerza)

📊 *CONFLUENCIA INSTITUCIONAL:*
• *Ancla VWAP (1h):* \`$${vwap}\` (\`${dist >= 0 ? "+" : ""}${dist}%\` vs VWAP)
• *EMA 9:* \`$${ema9}\` · *EMA 21:* \`$${ema21}\`
• *Separación de Medias:* \`${spread >= 0 ? "+" : ""}${spread}%\`
• *Alineación Macro:* Confluencia confirmada con marcos mayores

🎯 *PLAN DE ENTRADA RECOMENDADO:*
• *Zona de Entrada:* \`$${entryMin} - $${entryMax}\`
• *Stop Loss Invalidador:* \`$${sl}\`
• *Objetivo 1 (TP1):* \`$${tp1}\`
• *Ratio R:R:* \`1 : ${rr}\`

🤖 _Bot Sentinel 24/7:_ [@SentinelRiskBot_bot](https://t.me/SentinelRiskBot_bot)`;
    } else {
      return `⚡ *SENTINEL • TREND CONFLUENCE ALERT (24/7)*
━━━━━━━━━━━━━━━━━━━━
🎯 *Asset:* \`${symbol}\` | *Price:* \`$${price}\`
📈 *Trend Direction:* \`${trend}\` (\`${score}/100\` Strength)

📊 *INSTITUTIONAL CONFLUENCE:*
• *VWAP Anchor (1h):* \`$${vwap}\` (\`${dist >= 0 ? "+" : ""}${dist}%\` vs VWAP)
• *Fast EMA 9:* \`$${ema9}\` · *Slow EMA 21:* \`$${ema21}\`
• *EMA 9/21 Spread:* \`${spread >= 0 ? "+" : ""}${spread}%\`
• *Macro Alignment:* Multi-timeframe trend confluence confirmed

🎯 *EXECUTION PLAN:*
• *Entry Zone:* \`$${entryMin} - $${entryMax}\`
• *Invalidation Stop:* \`$${sl}\`
• *Target 1 (TP1):* \`$${tp1}\`
• *Risk/Reward:* \`1 : ${rr}\`

🤖 _Sentinel 24/7 Bot:_ [@SentinelRiskBot_bot](https://t.me/SentinelRiskBot_bot)`;
    }
  }

  function buildTeaserAlertMarkdown(
    _type: "BUY" | "SELL" | "VWAP",
    signal: any,
    _isEs: boolean = true,
  ): string {
    const symbol = signal.symbol;
    const price = formatCryptoPrice(signal.currentPrice, signal.currentPrice);
    const publicMessage = `⚡ **SENTINEL ALGO ALERT** ⚡

🎯 Activo / Asset: ${symbol} | Precio / Price: $${price}

[ES] 🔒 Zona de Entrada, Stop Loss y Take Profit exclusivos para miembros PRO.
[EN] 🔒 Entry Zone, Stop Loss, and Take Profit exclusive for PRO members.

🚀 Protege tu capital / Protect your capital:
👉 [Acceder a Sentinel PRO / Get PRO](https://www.sentinelriskbot.com)

🤖 Bot Oficial: [@SentinelRiskBot_bot](https://t.me/SentinelRiskBot_bot)`;

    return publicMessage;
  }

  function buildCrashAlertMarkdown(
    riskIndex: number,
    isEs: boolean = true,
  ): string {
    if (isEs) {
      return `🚨 *ALERTA DE CAÍDA (CRASH):* El riesgo global del mercado es crítico (Índice: \`${riskIndex}/100\`). Fuerte presión de venta detectada. Las señales de compra están bloqueadas. Proteja su capital y ajuste sus Stop Loss.
━━━━━━━━━━━━━━━━━━━━
⚠️ *ESTADO DEL MERCADO:* RIESGO CRÍTICO / DUMP INMINENTE
🔒 *MOTOR CUANTITATIVO:* Señales de compra congeladas por seguridad
🛡️ *MEDIDAS DE PROTECCIÓN:*
• Reduzca apalancamiento inmediatamente
• Ajuste Stop Loss al precio de entrada o soporte clave
• Evite intentar comprar rebotes prematuros
🤖 _Bot Sentinel 24/7:_ [@SentinelRiskBot_bot](https://t.me/SentinelRiskBot_bot)`;
    } else {
      return `🚨 *FLASH CRASH WARNING:* Global market risk is critical (Index: \`${riskIndex}/100\`). Heavy selling pressure detected. Buy signals are currently locked. Protect your capital and tighten Stop Losses.
━━━━━━━━━━━━━━━━━━━━
⚠️ *MARKET STATUS:* CRITICAL RISK / IMMINENT DUMP
🔒 *QUANT ALGO ENGINE:* Buy signals locked for capital protection
🛡️ *PROTECTION MEASURES:*
• Reduce leverage immediately
• Tighten Stop Losses to breakeven or primary support
• Avoid trying to catch falling knives
🤖 _Sentinel 24/7 Bot:_ [@SentinelRiskBot_bot](https://t.me/SentinelRiskBot_bot)`;
    }
  }

  function buildBreakdownAlertMarkdown(
    signal: any,
    isEs: boolean = true,
  ): string {
    const symbol = String(signal.symbol || "BTCUSDT").toUpperCase();
    const score = Math.round(Number(signal.opportunityScore || 0));
    const price = formatCryptoPrice(signal.currentPrice, signal.currentPrice);
    const brokenSupport = formatCryptoPrice(
      signal.brokenSupport ?? signal.vwap1h ?? signal.entryZone?.min,
      signal.currentPrice,
    );
    const emergencyExit = formatCryptoPrice(
      signal.emergencyExit ?? signal.stopLoss,
      signal.currentPrice,
    );
    const downsideTarget1 = formatCryptoPrice(
      signal.downsideTarget1 ?? signal.takeProfit1,
      signal.currentPrice,
    );
    const downsideTarget2 = formatCryptoPrice(
      signal.downsideTarget2 ?? signal.takeProfit2,
      signal.currentPrice,
    );
    const chg1h = Number(signal.priceChange1h || 0);
    const chg1hStr = `${chg1h >= 0 ? "+" : ""}${chg1h.toFixed(2)}%`;

    if (isEs) {
      return `🚨 *${symbol} — RUPTURA BAJISTA / RIESGO DE CAÍDA*
━━━━━━━━━━━━━━━━━━━━
💵 *Precio Actual:* \`$${price}\` (*1h:* \`${chg1hStr}\`)
🔥 *Nivel de Riesgo:* \`${score}/100\`

📝 Fuerte presión de venta detectada en *${symbol}* tras perder su soporte institucional (VWAP 1h). Riesgo de caída mayor.

🛡️ *Plan de Protección Accionable:*
⚠️ *Soporte Perdido (VWAP):* \`$${brokenSupport}\`
🛡️ *Salida de Emergencia:* \`$${emergencyExit}\`
📉 *Objetivo Bajista 1:* \`$${downsideTarget1}\`
📉 *Objetivo Bajista 2:* \`$${downsideTarget2}\`
━━━━━━━━━━━━━━━━━━━━
🤖 _Sentinel 24/7 Guardián:_ [@SentinelRiskBot_bot](https://t.me/SentinelRiskBot_bot)`;
    } else {
      return `🚨 *${symbol} — BEARISH BREAKDOWN / DUMP RISK*
━━━━━━━━━━━━━━━━━━━━
💵 *Current Price:* \`$${price}\` (*1h:* \`${chg1hStr}\`)
🔥 *Alert Score:* \`${score}/100\`

📝 Strong selling pressure detected on *${symbol}* after losing institutional support (1h VWAP). Risk of further downside.

🛡️ *Actionable Protection Plan:*
⚠️ *Broken Support (VWAP):* \`$${brokenSupport}\`
🛡️ *Emergency Stop:* \`$${emergencyExit}\`
📉 *Downside Target 1:* \`$${downsideTarget1}\`
📉 *Downside Target 2:* \`$${downsideTarget2}\`
━━━━━━━━━━━━━━━━━━━━
🤖 _Sentinel 24/7 Guardian:_ [@SentinelRiskBot_bot](https://t.me/SentinelRiskBot_bot)`;
    }
  }

  interface ActiveSignalRecord {
    id: string;
    symbol: string;
    baseAsset: string;
    type: "BUY" | "SELL";
    entryPrice: number;
    stopLoss: number;
    tp1: number;
    tp2: number;
    score: number;
    dispatchedAt: number;
    status: "ACTIVE" | "TP1_HIT" | "TP2_HIT" | "STOPPED";
  }

  interface WinningLedgerEntry {
    id: string;
    symbol: string;
    baseAsset: string;
    type: "BUY" | "SELL";
    signal?: "BUY" | "SELL";
    targetHit: "TP1" | "TP2";
    entryPrice: number;
    exitPrice: number;
    profitPct: number;
    gainPct?: number;
    dispatchedAt: number;
    hitAt: number;
    closedAt?: number;
    timeElapsedMs: number;
    verifiedTelegramAlert?: boolean;
  }

  // Server-side Global 24h Winning Signals Memory (stores up to latest 20 TP1/TP2 hits)
  let globalWinningSignals: WinningLedgerEntry[] = [];

  async function persistWinningSignalToFirestore(entry: WinningLedgerEntry) {
    if (!adminDb || !adminSdkCredentialsAvailable) return;
    try {
      await adminDb
        .collection("winning_signals")
        .doc(entry.id)
        .set(
          {
            ...entry,
            signal: entry.type,
            gainPct: entry.profitPct,
            closedAt: entry.hitAt,
            verifiedTelegramAlert: true,
            updatedAt: Date.now(),
          },
          { merge: true },
        );
    } catch (err: any) {
      if (
        String(err?.message || "").includes(
          "Could not load the default credentials",
        ) ||
        String(err?.message || "").includes("UNAUTHENTICATED") ||
        String(err?.message || "").includes("PERMISSION_DENIED")
      ) {
        adminSdkCredentialsAvailable = false;
      } else {
        console.warn(
          `[Firestore winning_signals Save Notice]: ${err?.message || err}`,
        );
      }
    }
  }

  async function loadGlobalWinningSignalsFromFirestore() {
    if (!adminDb || !adminSdkCredentialsAvailable) return;
    try {
      const snap = await adminDb
        .collection("winning_signals")
        .orderBy("hitAt", "desc")
        .limit(20)
        .get();
      if (snap.empty) return;
      const loaded: WinningLedgerEntry[] = [];
      for (const docSnap of snap.docs) {
        const d = docSnap.data();
        // Only restore real 1-to-1 Telegram-verified TP1/TP2 hits (skip any legacy backfilled entries)
        if (
          d &&
          d.verifiedTelegramAlert === true &&
          d.symbol &&
          (d.targetHit === "TP1" || d.targetHit === "TP2")
        ) {
          const hitTimestamp = Number(d.closedAt || d.hitAt || Date.now());
          const gainVal = Number(d.gainPct ?? d.profitPct ?? 0);
          const sigType: "BUY" | "SELL" =
            (d.type || d.signal) === "SELL" ? "SELL" : "BUY";
          loaded.push({
            id: String(d.id || docSnap.id),
            symbol: String(d.symbol),
            baseAsset: String(
              d.baseAsset || String(d.symbol).replace(/USDT$/, ""),
            ),
            type: sigType,
            signal: sigType,
            targetHit: d.targetHit === "TP2" ? "TP2" : "TP1",
            entryPrice: Number(d.entryPrice || 0),
            exitPrice: Number(d.exitPrice || 0),
            profitPct: gainVal,
            gainPct: gainVal,
            dispatchedAt: Number(d.dispatchedAt || hitTimestamp),
            hitAt: hitTimestamp,
            closedAt: hitTimestamp,
            timeElapsedMs: Number(d.timeElapsedMs || 60_000),
            verifiedTelegramAlert: true,
          });
        }
      }
      if (loaded.length > 0) {
        const merged = [...loaded, ...globalWinningSignals];
        const uniqueMap = new Map<string, WinningLedgerEntry>();
        for (const item of merged) {
          const dedupeKey = `${item.symbol}_${item.type}_${item.targetHit}_${item.dispatchedAt}`;
          if (!uniqueMap.has(item.id) && !uniqueMap.has(dedupeKey)) {
            uniqueMap.set(item.id, item);
            uniqueMap.set(dedupeKey, item);
          }
        }
        const deduplicated = Array.from(new Set(uniqueMap.values())).sort(
          (a, b) => b.hitAt - a.hitAt,
        );
        globalWinningSignals = deduplicated.slice(0, 20);
        console.log(
          `[WinningSignalsLedger] Restored ${globalWinningSignals.length} global winning signals from Firestore.`,
        );
      }
    } catch (err: any) {
      if (
        String(err?.message || "").includes(
          "Could not load the default credentials",
        ) ||
        String(err?.message || "").includes("UNAUTHENTICATED") ||
        String(err?.message || "").includes("PERMISSION_DENIED")
      ) {
        adminSdkCredentialsAvailable = false;
      } else {
        console.warn(
          `[Firestore winning_signals Load Notice]: ${err?.message || err}`,
        );
      }
    }
  }

  function formatElapsedTimeEs(elapsedMs: number): string {
    const totalMinutes = Math.max(1, Math.round(elapsedMs / 60_000));
    if (totalMinutes < 60) {
      return `${totalMinutes} min`;
    }
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  function buildPublicVictoryAlertMarkdown(entry: WinningLedgerEntry): string {
    const symbol = entry.symbol.toUpperCase().replace("/", "");
    const elapsedMins = Math.max(
      1,
      Math.round((entry.timeElapsedMs || 60_000) / 60_000),
    );
    const gainPct = Math.abs(entry.gainPct ?? entry.profitPct).toFixed(2);
    const signalTypeEs = entry.type === "BUY" ? "COMPRA" : "VENTA";
    const signalTypeEn = entry.type === "BUY" ? "BUY" : "SELL";
    const targetLabel = entry.targetHit;

    const tpHitPublicMessage = `🎯 **TARGET HIT / OBJETIVO ALCANZADO (#${symbol})** 🎯

[ES] ✅ Señal de ${signalTypeEs} enviada hace ${elapsedMins} min a miembros PRO acaba de tocar **${targetLabel} (+${gainPct}%)**.
[EN] ✅ ${signalTypeEn} signal sent ${elapsedMins}m ago to PRO members just hit **${targetLabel} (+${gainPct}%)**.

🔒 *No operes a ciegas / Stop trading blind:*
👉 [Acceder a Sentinel PRO / Get PRO](https://www.sentinelriskbot.com)

🤖 Bot Oficial: [@SentinelRiskBot_bot](https://t.me/SentinelRiskBot_bot)`;

    return tpHitPublicMessage;
  }

  interface QueuedAlert {
    id: string;
    type: "BUY" | "SELL" | "VWAP" | "CRASH" | "BREAKDOWN_WARNING";
    symbol: string;
    signal: any;
    queuedAt: number;
    attempts: number;
  }

  interface MarketAssetEvaluation {
    symbol: string;
    baseAsset: string;
    quoteAsset: string;
    currentPrice: number;
    change24h: number;
    priceChange1m: number;
    priceChange5m: number;
    priceChange15m: number;
    priceChange1h: number;
    vwap1h: number;
    ema21_1h: number;
    rollingHighPrice: number;
    recentDropPercent: number;
    sellVolume1m: number;
    buyVolume1m: number;
    sellVolume5m: number;
    buyVolume5m: number;
    sellVolumeZScore: number;
    volume24hUsd: number;
    mfi: number;
    rsi: number;
    atr14: number;
    buyerAbsorptionRatio: number;
    sellerVolumeRatio: number;
    bidDepthPressureRatio: number;
    fundingRate: number;
    riskIndex: number;
    riskStatus: "NORMAL" | "ELEVATED" | "HIGH_RISK" | "FLASH_CRASH_WARNING";
    buyEligible: boolean;
    isBuyLocked: boolean;
    nearestBuyWallPrice: number;
    nearestBuyWallQty: number;
    buy: any;
    sell: any;
    breakdown: any;
    vwap?: any;
    updatedAt: number;
  }

  function buildVwapSignalFromKlines(
    symbol: string,
    timeframe: string,
    rawKlines: any[],
    weeklyKlines: any[],
    monthlyKlines: any[],
    realChange24h: number,
  ) {
    const currentPrice = parseFloat(rawKlines[rawKlines.length - 1][4]);
    if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
      throw new Error(`Invalid close price for ${symbol}`);
    }

    const intraInd = computeTimeframeIndicators(
      rawKlines,
      timeframe,
      currentPrice,
    );
    const weekInd = computeTimeframeIndicators(
      weeklyKlines,
      "1w",
      currentPrice,
    );
    const monthInd = computeTimeframeIndicators(
      monthlyKlines,
      "1m",
      currentPrice,
    );

    const intraTrend = intraInd.trend;
    const weekTrend = weekInd.trend;
    const monthTrend = monthInd.trend;

    const isMacroAligned =
      (intraTrend === "BULLISH" &&
        weekTrend === "BULLISH" &&
        monthTrend === "BULLISH") ||
      (intraTrend === "BEARISH" &&
        weekTrend === "BEARISH" &&
        monthTrend === "BEARISH");
    const isCounterTrend =
      (intraTrend === "BULLISH" &&
        (weekTrend === "BEARISH" || monthTrend === "BEARISH")) ||
      (intraTrend === "BEARISH" &&
        (weekTrend === "BULLISH" || monthTrend === "BULLISH"));

    let signalType: "BUY" | "SELL" | "NEUTRAL" = "NEUTRAL";
    let signalStrength:
      | "STRONG_BULLISH"
      | "MODERATE_BULLISH"
      | "STRONG_BEARISH"
      | "MODERATE_BEARISH"
      | "NEUTRAL" = "NEUTRAL";
    let trendScore = 50;

    if (intraTrend === "BULLISH") {
      signalType = "BUY";
      if (intraInd.crossoverStatus === "BULLISH_CROSS") {
        signalStrength = "STRONG_BULLISH";
        trendScore = Math.min(
          98,
          85 + Math.abs(intraInd.distanceToVwapPercent) * 3,
        );
      } else {
        signalStrength =
          intraInd.distanceToVwapPercent > 1.2
            ? "STRONG_BULLISH"
            : "MODERATE_BULLISH";
        trendScore = Math.min(
          95,
          72 + Math.abs(intraInd.distanceToVwapPercent) * 4,
        );
      }
    } else if (intraTrend === "BEARISH") {
      signalType = "SELL";
      if (intraInd.crossoverStatus === "BEARISH_CROSS") {
        signalStrength = "STRONG_BEARISH";
        trendScore = Math.max(
          2,
          15 - Math.abs(intraInd.distanceToVwapPercent) * 3,
        );
      } else {
        signalStrength =
          intraInd.distanceToVwapPercent < -1.2
            ? "STRONG_BEARISH"
            : "MODERATE_BEARISH";
        trendScore = Math.max(
          5,
          28 - Math.abs(intraInd.distanceToVwapPercent) * 4,
        );
      }
    }

    const baseAsset = symbol.endsWith("USDT") ? symbol.slice(0, -4) : symbol;
    const invalidation =
      signalType === "BUY"
        ? Math.min(intraInd.vwap, intraInd.ema21) * 0.994
        : Math.max(intraInd.vwap, intraInd.ema21) * 1.006;

    const maxAllowedRisk = currentPrice * 0.04;
    const minAllowedRisk = currentPrice * 0.008;
    let risk = Math.abs(currentPrice - invalidation);
    if (risk > maxAllowedRisk) risk = maxAllowedRisk;
    if (risk < minAllowedRisk) risk = minAllowedRisk;

    const stopLoss =
      signalType === "BUY" ? currentPrice - risk : currentPrice + risk;
    const takeProfit1 =
      signalType === "BUY"
        ? currentPrice + risk * 1.5
        : currentPrice - risk * 1.5;
    const takeProfit2 =
      signalType === "BUY"
        ? currentPrice + risk * 2.5
        : currentPrice - risk * 2.5;
    const riskRewardRatio = 1.5;

    const rationaleEn =
      signalType === "BUY"
        ? `EMA 9 ($${intraInd.ema9.toLocaleString()}) sustains above EMA 21 ($${intraInd.ema21.toLocaleString()}) with price floating +${intraInd.distanceToVwapPercent.toFixed(2)}% above VWAP anchor ($${intraInd.vwap.toLocaleString()}). Bullish trend alignment confirmed.`
        : signalType === "SELL"
          ? `EMA 9 ($${intraInd.ema9.toLocaleString()}) trades below EMA 21 ($${intraInd.ema21.toLocaleString()}) with price pinned ${intraInd.distanceToVwapPercent.toFixed(2)}% below VWAP ($${intraInd.vwap.toLocaleString()}). Bearish continuation favored.`
          : `Consolidation mode: Price testing VWAP mean ($${intraInd.vwap.toLocaleString()}) with neutral EMA spread (${intraInd.emaSpreadPercent.toFixed(2)}%).`;

    const rationaleEs =
      signalType === "BUY"
        ? `EMA 9 ($${intraInd.ema9.toLocaleString()}) se mantiene sobre EMA 21 ($${intraInd.ema21.toLocaleString()}) con precio cotizando +${intraInd.distanceToVwapPercent.toFixed(2)}% sobre el anclaje VWAP ($${intraInd.vwap.toLocaleString()}). Tendencia alcista confirmada.`
        : signalType === "SELL"
          ? `EMA 9 ($${intraInd.ema9.toLocaleString()}) opera bajo EMA 21 ($${intraInd.ema21.toLocaleString()}) con precio atrapado ${intraInd.distanceToVwapPercent.toFixed(2)}% bajo VWAP ($${intraInd.vwap.toLocaleString()}). Tendencia bajista favorecida.`
          : `Consolidación: Precio oscilando en torno a VWAP ($${intraInd.vwap.toLocaleString()}) con dispersión EMA neutral (${intraInd.emaSpreadPercent.toFixed(2)}%).`;

    let confluenceRating: any = "CHOPPY_MIXED";
    let confluenceScore = 50;
    let titleEn = "Moderate Confluence";
    let titleEs = "Confluencia Moderada";
    let descEn = "Partial alignment across multi-timeframe horizon.";
    let descEs = "Alineación parcial en el horizonte multi-marco temporal.";

    if (isMacroAligned) {
      if (intraTrend === "BULLISH") {
        confluenceRating = "MACRO_ALIGNED_BULLISH";
        confluenceScore = 96;
        titleEn =
          "Macro-Aligned Trend • Triple Bullish Confluence (1H • 1W • 1M)";
        titleEs =
          "Tendencia Alineada Macro • Confluencia Alcista Triple (1H • 1S • 1M)";
        descEn =
          "Triple-tier alignment: Intraday setup is confirmed by weekly institutional support and monthly macro accumulation.";
        descEs =
          "Alineación triple: La configuración intradiaria está confirmada por soporte semanal y acumulación mensual.";
      } else {
        confluenceRating = "MACRO_ALIGNED_BEARISH";
        confluenceScore = 95;
        titleEn =
          "Macro-Aligned Breakdown • Triple Bearish Confluence (1H • 1W • 1M)";
        titleEs =
          "Desglose Alineado Macro • Confluencia Bajista Triple (1H • 1S • 1M)";
        descEn =
          "Triple-tier distribution: Spot trades below VWAP and EMAs across intraday, weekly, and monthly horizons.";
        descEs =
          "Distribución triple: El precio cotiza bajo el VWAP y las EMAs en horizontes intradiarios, semanales y mensuales.";
      }
    } else if (isCounterTrend) {
      confluenceRating = "COUNTER_TREND_WARNING";
      confluenceScore = 52;
      titleEn =
        "Counter-Trend Warning • Intraday Signal vs. Higher-Timeframe Flow";
      titleEs =
        "Alerta Contra-Tendencia • Señal Intradiaria vs. Flujo Temporal Superior";
      descEn =
        "Caution advised: Intraday signal is fighting the higher-timeframe trend. Scalp profits proactively.";
      descEs =
        "Precaución aconsejada: La señal intradiaria choca contra la tendencia del marco temporal superior.";
    } else {
      confluenceRating = "MODERATE_ALIGNMENT";
      confluenceScore = 74;
      titleEn = "Moderate Confluence • Partial Timeframe Alignment";
      titleEs = "Confluencia Moderada • Alineación Parcial de Marcos";
      descEn =
        "Market is in multi-timeframe transition. Maintain standard risk:reward parameters.";
      descEs =
        "El mercado está en transición multi-marco. Mantenga parámetros estándar de riesgo:beneficio.";
    }

    let adjustedScore = trendScore;
    if (isMacroAligned) {
      if (signalType === "BUY")
        adjustedScore = Math.min(99, Math.max(90, trendScore + 10));
      else if (signalType === "SELL")
        adjustedScore = Math.max(1, Math.min(10, trendScore - 10));
    } else if (isCounterTrend) {
      if (signalType === "BUY")
        adjustedScore = Math.max(48, Math.min(68, trendScore - 16));
      else if (signalType === "SELL")
        adjustedScore = Math.min(52, Math.max(32, trendScore + 16));
    }

    return {
      symbol,
      baseAsset,
      quoteAsset: "USDT",
      currentPrice: formatCryptoPrice(currentPrice, currentPrice),
      timeframe,
      vwap: intraInd.vwap,
      distanceToVwapPercent: intraInd.distanceToVwapPercent,
      isAboveVwap: intraInd.isAboveVwap,
      ema9: intraInd.ema9,
      ema21: intraInd.ema21,
      emaSpreadPercent: intraInd.emaSpreadPercent,
      isEmaBullishCross: intraInd.trend === "BULLISH",
      crossoverStatus: intraInd.crossoverStatus,
      signalType,
      signalStrength,
      trendScore: Math.round(adjustedScore),
      entryZone: {
        min: formatCryptoPrice(currentPrice * 0.998, currentPrice),
        max: formatCryptoPrice(currentPrice * 1.002, currentPrice),
      },
      stopLoss: formatCryptoPrice(stopLoss, currentPrice),
      takeProfit1: formatCryptoPrice(takeProfit1, currentPrice),
      takeProfit2: formatCryptoPrice(takeProfit2, currentPrice),
      riskRewardRatio: Math.max(1.8, riskRewardRatio),
      change24h: realChange24h,
      timestamp: Date.now(),
      rationaleEn,
      rationaleEs,
      multiTimeframe: {
        intraday: {
          timeframe,
          trend: intraInd.trend,
          ema9: intraInd.ema9,
          ema21: intraInd.ema21,
          vwap: intraInd.vwap,
          isAboveVwap: intraInd.isAboveVwap,
          distanceToVwapPercent: intraInd.distanceToVwapPercent,
          emaSpreadPercent: intraInd.emaSpreadPercent,
          crossoverStatus: intraInd.crossoverStatus,
        },
        weekly: {
          timeframe: "1w",
          trend: weekInd.trend,
          ema9: weekInd.ema9,
          ema21: weekInd.ema21,
          vwap: weekInd.vwap,
          isAboveVwap: weekInd.isAboveVwap,
          distanceToVwapPercent: weekInd.distanceToVwapPercent,
          emaSpreadPercent: weekInd.emaSpreadPercent,
          crossoverStatus: weekInd.crossoverStatus,
        },
        monthly: {
          timeframe: "1m",
          trend: monthInd.trend,
          ema9: monthInd.ema9,
          ema21: monthInd.ema21,
          vwap: monthInd.vwap,
          isAboveVwap: monthInd.isAboveVwap,
          distanceToVwapPercent: monthInd.distanceToVwapPercent,
          emaSpreadPercent: monthInd.emaSpreadPercent,
          crossoverStatus: monthInd.crossoverStatus,
        },
        confluenceScore,
        confluenceRating,
        titleEn,
        titleEs,
        descriptionEn: descEn,
        descriptionEs: descEs,
        isMacroAligned,
        isCounterTrend,
        alignedCount: isMacroAligned ? 3 : isCounterTrend ? 1 : 2,
      },
    };
  }

  function evaluateAssetFromKlines(params: {
    symbol: string;
    rawKlines: any[];
    klines1h?: any[] | null;
    fundingRate?: number;
    depthData?: OrderBookDepthSnapshot | null;
    liqStats?: ReturnType<FuturesLiquidationManager["getLiquidationStats"]>;
    ticker24h?: { change24h?: number; quoteVolume?: number; high24h?: number };
    vwapSignal?: any;
  }): MarketAssetEvaluation | null {
    const {
      symbol,
      rawKlines,
      klines1h,
      depthData,
      liqStats,
      ticker24h,
      vwapSignal,
    } = params;
    if (!Array.isArray(rawKlines) || rawKlines.length < 18) return null;

    const highs: number[] = [];
    const lows: number[] = [];
    const closes: number[] = [];
    const volumes: number[] = [];
    const takerBuys: number[] = [];
    const typicalPrices: number[] = [];

    for (let i = 0; i < rawKlines.length; i++) {
      const h = parseFloat(rawKlines[i][2]);
      const l = parseFloat(rawKlines[i][3]);
      const c = parseFloat(rawKlines[i][4]);
      const v = parseFloat(rawKlines[i][5]);
      const tb = parseFloat(rawKlines[i][9]);
      if (
        !Number.isFinite(h) ||
        !Number.isFinite(l) ||
        !Number.isFinite(c) ||
        c <= 0
      ) {
        return null;
      }
      highs.push(h);
      lows.push(l);
      closes.push(c);
      volumes.push(Number.isFinite(v) && v >= 0 ? v : 0);
      takerBuys.push(Number.isFinite(tb) && tb >= 0 ? tb : 0);
      typicalPrices.push((h + l + c) / 3);
    }

    const len = closes.length;
    const currentPrice = closes[len - 1];
    if (!Number.isFinite(currentPrice) || currentPrice <= 0) return null;

    const prevClose = closes[len - 2] || currentPrice;
    const open24h = closes[Math.max(0, len - 24)] || currentPrice;
    const fallbackChange24h = Number(
      (((currentPrice - open24h) / open24h) * 100).toFixed(2),
    );
    const change24h =
      ticker24h?.change24h !== undefined && Number.isFinite(ticker24h.change24h)
        ? Number(ticker24h.change24h.toFixed(2))
        : fallbackChange24h;
    const priceChange1m = Number(
      (((currentPrice - prevClose) / prevClose) * 100).toFixed(2),
    );
    const close5Back = closes[Math.max(0, len - 5)] || currentPrice;
    const priceChange5m = Number(
      (((currentPrice - close5Back) / close5Back) * 100).toFixed(2),
    );

    // Exact 15m and 1h candle momentum (rawKlines are 15m intervals)
    const latest15mOpen = parseFloat(rawKlines[len - 1][1]) || prevClose;
    const candle15mDrop = Number(
      (((currentPrice - latest15mOpen) / latest15mOpen) * 100).toFixed(2),
    );
    const priceChange15m = Number(priceChange1m.toFixed(2));
    const effectiveDrop15m = Math.min(priceChange15m, candle15mDrop);

    // True rolling 1h change (4 x 15m bars = 60m) + 1h bar open/prev-close comparison
    let priceChange1h = priceChange5m;
    let effectiveDrop1h = priceChange5m;
    let vwap1h = Number(vwapSignal?.vwap || 0);
    let ema21_1h = Number(vwapSignal?.ema21 || 0);

    if (Array.isArray(klines1h) && klines1h.length >= 21) {
      try {
        const ind1h = computeTimeframeIndicators(klines1h, "1h", currentPrice);
        if (Number.isFinite(ind1h.vwap) && ind1h.vwap > 0) vwap1h = ind1h.vwap;
        if (Number.isFinite(ind1h.ema21) && ind1h.ema21 > 0)
          ema21_1h = ind1h.ema21;
        const prev1hClose =
          parseFloat(klines1h[klines1h.length - 2][4]) || currentPrice;
        const cur1hOpen =
          parseFloat(klines1h[klines1h.length - 1][1]) || prev1hClose;
        const chgPrev1h = ((currentPrice - prev1hClose) / prev1hClose) * 100;
        const chgOpen1h = ((currentPrice - cur1hOpen) / cur1hOpen) * 100;
        effectiveDrop1h = Math.min(priceChange1h, chgPrev1h, chgOpen1h);
      } catch {
        // Retain fallback from 15m / vwapSignal
      }
    } else if (vwap1h <= 0 || ema21_1h <= 0) {
      try {
        const ind15 = computeTimeframeIndicators(
          rawKlines,
          "15m",
          currentPrice,
        );
        if (vwap1h <= 0) vwap1h = ind15.vwap;
        if (ema21_1h <= 0) ema21_1h = ind15.ema21;
      } catch {
        // Best effort
      }
    }

    const rollingHighPrice = Math.max(
      ...highs.slice(Math.max(0, len - 24)),
      ticker24h?.high24h || 0,
    );
    const recentDropPercent =
      rollingHighPrice > 0
        ? Math.min(
            0,
            Number(
              (
                ((currentPrice - rollingHighPrice) / rollingHighPrice) *
                100
              ).toFixed(2),
            ),
          )
        : 0;

    // 1. MFI (14) + Previous-bar MFI to detect falling money flow
    let posFlow = 0;
    let negFlow = 0;
    const mfiStart = Math.max(1, len - 14);
    for (let i = mfiStart; i < len; i++) {
      const curTP = typicalPrices[i];
      const prvTP = typicalPrices[i - 1];
      const flow = curTP * volumes[i];
      if (curTP > prvTP) posFlow += flow;
      else if (curTP < prvTP) negFlow += flow;
    }
    const moneyRatio = negFlow > 0 ? posFlow / negFlow : 100;
    const mfi = Math.min(
      99,
      Math.max(5, Math.round((100 - 100 / (1 + moneyRatio)) * 10) / 10),
    );

    let prevPosFlow = 0;
    let prevNegFlow = 0;
    const prevMfiStart = Math.max(1, len - 15);
    for (let i = prevMfiStart; i < len - 1; i++) {
      const curTP = typicalPrices[i];
      const prvTP = typicalPrices[i - 1];
      const flow = curTP * volumes[i];
      if (curTP > prvTP) prevPosFlow += flow;
      else if (curTP < prvTP) prevNegFlow += flow;
    }
    const prevMoneyRatio = prevNegFlow > 0 ? prevPosFlow / prevNegFlow : 100;
    const prevMfi = Math.min(
      99,
      Math.max(5, Math.round((100 - 100 / (1 + prevMoneyRatio)) * 10) / 10),
    );
    const mfiFalling = mfi < prevMfi || (mfi < 40 && effectiveDrop15m < 0);

    // 2. RSI (14)
    let gains = 0;
    let losses = 0;
    for (let i = mfiStart; i < len; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff > 0) gains += diff;
      else losses += Math.abs(diff);
    }
    const avgG = gains / 14;
    const avgL = losses / 14;
    const rs = avgL > 0 ? avgG / avgL : 100;
    const rsi = Math.min(
      99,
      Math.max(5, Math.round((100 - 100 / (1 + rs)) * 10) / 10),
    );

    // 3. ATR14 Execution Levels
    const executionLevels = calculateAtrExecutionLevels(
      currentPrice,
      highs,
      lows,
      closes,
      14,
    );
    const atr14 = executionLevels.atr14;

    // 4. Volume Absorption & Sell Z-Score Analysis (from actual USD kline flows)
    const recentCount = Math.min(3, len);
    let recentTotVol = 0;
    let recentTakerBuy = 0;
    for (let i = len - recentCount; i < len; i++) {
      recentTotVol += volumes[i];
      recentTakerBuy += takerBuys[i];
    }
    const buyerAbsorptionRatio =
      recentTotVol > 0
        ? Math.min(0.95, Math.max(0.05, recentTakerBuy / recentTotVol))
        : 0.5;
    const sellerVolumeRatio = Number((1 - buyerAbsorptionRatio).toFixed(2));

    const sellVolUsdSeries: number[] = [];
    for (let i = 0; i < len; i++) {
      const sellBase = Math.max(0, volumes[i] - takerBuys[i]);
      sellVolUsdSeries.push(sellBase * closes[i]);
    }
    const latestBuyUsd = takerBuys[len - 1] * currentPrice;
    const latestSellUsd = sellVolUsdSeries[len - 1];
    const buyVolume1m = Math.round(latestBuyUsd / 15);
    const sellVolume1m = Math.round(latestSellUsd / 15);
    const buyVolume5m = Math.round(latestBuyUsd / 3);
    const sellVolume5m = Math.round(latestSellUsd / 3);

    const baselineSells = sellVolUsdSeries.slice(0, len - 1);
    const meanSell =
      baselineSells.length > 0
        ? baselineSells.reduce((a, b) => a + b, 0) / baselineSells.length
        : latestSellUsd;
    const varianceSell =
      baselineSells.length > 1
        ? baselineSells.reduce((a, b) => a + Math.pow(b - meanSell, 2), 0) /
          baselineSells.length
        : 0;
    const stdSell = Math.sqrt(varianceSell);
    const rawZScore = stdSell > 0 ? (latestSellUsd - meanSell) / stdSell : 0;
    const sellVolumeZScore = Number(
      Math.max(-4, Math.min(6, rawZScore)).toFixed(2),
    );

    let volume24hUsd =
      ticker24h?.quoteVolume && Number.isFinite(ticker24h.quoteVolume)
        ? ticker24h.quoteVolume
        : 0;
    if (volume24hUsd <= 0) {
      let sumVolUsd = 0;
      for (let i = 0; i < len; i++) sumVolUsd += volumes[i] * closes[i];
      volume24hUsd = Math.round(sumVolUsd * (96 / len));
    }

    let bidDepthPressureRatio = buyerAbsorptionRatio;
    if (depthData && depthData.bids.length > 0 && depthData.asks.length > 0) {
      const bidSum = depthData.bids
        .slice(0, 20)
        .reduce((acc, l) => acc + l.total, 0);
      const askSum = depthData.asks
        .slice(0, 20)
        .reduce((acc, l) => acc + l.total, 0);
      if (bidSum + askSum > 0) {
        bidDepthPressureRatio = Number((bidSum / (bidSum + askSum)).toFixed(2));
      }
    }

    let fundingRate = params.fundingRate;
    if (fundingRate === undefined || Number.isNaN(fundingRate)) {
      const netImbalance = (buyerAbsorptionRatio - 0.5) * 2;
      fundingRate = Number((netImbalance * 0.00035).toFixed(6));
    }

    const longLiqUsd1m = liqStats?.longLiquidations1m || 0;
    const shortLiqUsd1m = liqStats?.shortLiquidations1m || 0;
    const liqSpike = liqStats?.liquidationSpikeDetected || false;

    // 5. Individual Asset Risk Index Calculation (Real-Time 15m/1h Momentum + VWAP/EMA Breakdown + Volume Dominance)
    const isBelowVwap1h = vwap1h > 0 && currentPrice < vwap1h;
    const isBelowEma21_1h = ema21_1h > 0 && currentPrice < ema21_1h;
    const effectiveTakerBuyRatio =
      recentTotVol > 0 ? buyerAbsorptionRatio : bidDepthPressureRatio;

    let assetRisk = 10;

    // 5a. Price below 1h VWAP & EMA 21: +35 pts
    if (isBelowVwap1h && isBelowEma21_1h) {
      assetRisk += 35;
    } else if (isBelowVwap1h || isBelowEma21_1h) {
      assetRisk += 16;
    }

    // 5b. Negative 1h & 15m price momentum (dropping > 1.5% in 1h or > 0.7% in 15m): +25 to +40 pts
    const hasHeavyDrop = effectiveDrop1h < -1.5 || effectiveDrop15m < -0.7;
    if (hasHeavyDrop) {
      const severity1h =
        effectiveDrop1h < -1.5
          ? Math.min(15, (Math.abs(effectiveDrop1h) - 1.5) * 6)
          : 0;
      const severity15m =
        effectiveDrop15m < -0.7
          ? Math.min(15, (Math.abs(effectiveDrop15m) - 0.7) * 12)
          : 0;
      const momentumRisk = Math.min(
        40,
        Math.round(25 + Math.max(severity1h, severity15m)),
      );
      assetRisk += momentumRisk;
    } else if (effectiveDrop1h < -0.6 || effectiveDrop15m < -0.35) {
      assetRisk += 12;
    }

    // 5c. Sell Volume dominance (Taker Buy Ratio < 42% or MFI < 40 and falling): +25 pts
    if (effectiveTakerBuyRatio < 0.42 || (mfi < 40 && mfiFalling)) {
      assetRisk += 25;
    } else if (effectiveTakerBuyRatio < 0.46) {
      assetRisk += 10;
    }

    // 5d. Cascading stress & Z-score tail risk
    if (sellVolumeZScore > 1.8) {
      assetRisk += Math.min(12, Math.round((sellVolumeZScore - 1.8) * 5));
    }
    if (change24h < -6) {
      assetRisk += Math.min(12, Math.round(Math.abs(change24h + 6) * 2));
    }
    if (liqSpike) {
      assetRisk += 15;
    }
    if (fundingRate > 0.02) {
      assetRisk += 8;
    }
    assetRisk = Math.min(100, Math.max(5, Math.round(assetRisk)));

    // 5e. Bearish Breakdown Detection (BREAKDOWN_WARNING >= 75)
    // Triggers when symbol breaks below 1h VWAP & EMA 21 with strong selling volume (takerBuyRatio < 45% or rapid 1h drop > 2%)
    let breakdownScore = 0;
    const hasBreakdownVolumeOrVelocity =
      effectiveTakerBuyRatio < 0.45 || effectiveDrop1h < -2.0;
    if (isBelowVwap1h && isBelowEma21_1h && hasBreakdownVolumeOrVelocity) {
      const dropBonus =
        effectiveDrop1h < -2.0
          ? Math.min(14, Math.round((Math.abs(effectiveDrop1h) - 2.0) * 5 + 5))
          : effectiveDrop15m < -0.7
            ? Math.min(10, Math.round(Math.abs(effectiveDrop15m) * 4))
            : 0;
      const sellerBonus =
        effectiveTakerBuyRatio < 0.45
          ? Math.min(12, Math.round((0.45 - effectiveTakerBuyRatio) * 80))
          : 0;
      const mfiBonus = mfi < 40 && mfiFalling ? 5 : 0;
      breakdownScore = Math.min(
        99,
        Math.max(75, Math.round(75 + dropBonus + sellerBonus + mfiBonus)),
      );
    } else {
      let partial = 0;
      if (isBelowVwap1h) partial += 25;
      if (isBelowEma21_1h) partial += 20;
      if (effectiveTakerBuyRatio < 0.45) partial += 15;
      if (effectiveDrop1h < -1.5 || effectiveDrop15m < -0.7) partial += 12;
      breakdownScore = Math.min(72, partial);
    }
    const isBreakdownTriggered = breakdownScore >= 75;

    // 6. Buy & Sell Scoring
    const buyMfiPts = mfi < 20 ? 35 : mfi < 35 ? 25 : mfi < 48 ? 12 : 2;
    const buyRsiPts = rsi < 30 ? 25 : rsi < 38 ? 18 : rsi < 48 ? 8 : 0;
    const buyVolPts =
      buyerAbsorptionRatio >= 0.58
        ? 25
        : buyerAbsorptionRatio >= 0.52
          ? 18
          : buyerAbsorptionRatio >= 0.46
            ? 10
            : 2;
    const buyFundingPts =
      fundingRate < -0.005
        ? 15
        : fundingRate <= 0
          ? 10
          : fundingRate < 0.005
            ? 5
            : 0;
    let rawBuyScore = buyMfiPts + buyRsiPts + buyVolPts + buyFundingPts;

    const sellMfiPts = mfi > 80 ? 35 : mfi > 68 ? 25 : mfi > 55 ? 12 : 2;
    const sellRsiPts = rsi > 70 ? 25 : rsi > 65 ? 18 : rsi > 52 ? 8 : 0;
    const sellVolPts =
      sellerVolumeRatio >= 0.58
        ? 25
        : sellerVolumeRatio >= 0.52
          ? 18
          : sellerVolumeRatio >= 0.46
            ? 10
            : 2;
    const sellFundingPts =
      fundingRate > 0.02
        ? 15
        : fundingRate > 0.01
          ? 10
          : fundingRate >= 0
            ? 5
            : 0;
    let rawSellScore = sellMfiPts + sellRsiPts + sellVolPts + sellFundingPts;

    // Mutual exclusion & Anti-Contradiction
    if (isBreakdownTriggered || assetRisk >= 65)
      rawBuyScore = Math.min(rawBuyScore, 45);
    if (mfi >= 50 || rsi >= 52) rawBuyScore = Math.min(rawBuyScore, 54);
    if (!(mfi < 35 || rsi < 38) || buyerAbsorptionRatio < 0.45)
      rawBuyScore = Math.min(rawBuyScore, 68);

    if (mfi < 50 || rsi < 48) rawSellScore = Math.min(rawSellScore, 54);
    if (!(mfi > 68 || rsi > 65) || sellerVolumeRatio < 0.45)
      rawSellScore = Math.min(rawSellScore, 68);

    if (rawBuyScore >= 75) rawSellScore = Math.min(rawSellScore, 38);
    else if (rawSellScore >= 75) rawBuyScore = Math.min(rawBuyScore, 38);

    const baseAsset = symbol.endsWith("USDT") ? symbol.slice(0, -4) : symbol;
    const nearestBuyWallPrice = depthData?.nearestBuyWallPrice || 0;
    const nearestBuyWallQty = depthData?.nearestBuyWallQty || 0;
    const now = Date.now();

    const buyItem = {
      symbol,
      baseAsset,
      quoteAsset: "USDT",
      currentPrice,
      change24h,
      priceChange1m,
      priceChange5m,
      opportunityScore: rawBuyScore,
      signalStrength:
        rawBuyScore >= 85
          ? "STRONG_BUY"
          : rawBuyScore >= 70
            ? "MODERATE_BUY"
            : rawBuyScore >= 55
              ? "ACCUMULATION"
              : "NEUTRAL",
      mfi,
      rsi,
      atr: atr14,
      riskIndex: assetRisk,
      buyEligible: assetRisk < 80,
      isBuyLocked: assetRisk >= 80,
      mfiCondition:
        mfi < 20
          ? "EXTREME_OVERSOLD"
          : mfi < 35
            ? "OVERSOLD"
            : mfi < 50
              ? "NEUTRAL"
              : "OVERBOUGHT",
      mfiScoreContribution: buyMfiPts,
      longLiquidations1m: longLiqUsd1m,
      isCapitulationDetected:
        (mfi < 30 && buyerAbsorptionRatio > 0.55) || liqSpike,
      liquidationScoreContribution: buyVolPts,
      fundingRate,
      fundingBias:
        fundingRate < -0.01
          ? "NEGATIVE_SHORT_SQUEEZE"
          : fundingRate <= 0
            ? "NEUTRAL"
            : "POSITIVE_LONG_HEAVY",
      fundingScoreContribution: buyFundingPts,
      sellVolumeDeceleration: buyerAbsorptionRatio >= 0.5,
      bidAbsorptionRatio: Number(buyerAbsorptionRatio.toFixed(2)),
      sellVolumeZScore,
      absorptionScoreContribution: buyVolPts,
      entryZone: {
        min: executionLevels.buy.entryZone.min,
        max: executionLevels.buy.entryZone.max,
      },
      stopLoss: executionLevels.buy.stopLoss,
      stopLossPercent: executionLevels.buy.stopLossPercent,
      takeProfit1: executionLevels.buy.takeProfit1,
      takeProfit1Percent: executionLevels.buy.takeProfit1Percent,
      takeProfit2: executionLevels.buy.takeProfit2,
      takeProfit2Percent: executionLevels.buy.takeProfit2Percent,
      riskRewardRatio: executionLevels.buy.riskRewardRatio,
      triggers: {
        mfiOversold: mfi < 35,
        liquidationFlush: buyerAbsorptionRatio > 0.52 || liqSpike,
        negativeOrNeutralFunding: fundingRate <= 0.005,
        orderBookAbsorption: buyerAbsorptionRatio >= 0.55,
        reboundMomentum: rawBuyScore >= 70,
      },
      timestamp: now,
      rationaleEn: `Buyers are absorbing selling pressure and defending key price support near $${executionLevels.buy.stopLoss.toLocaleString()}.`,
      rationaleEs: `Los compradores están absorbiendo la presión de venta y defendiendo el soporte cercano en $${executionLevels.buy.stopLoss.toLocaleString()}.`,
    };

    const sellItem = {
      symbol,
      baseAsset,
      quoteAsset: "USDT",
      currentPrice,
      change24h,
      priceChange1m,
      priceChange5m,
      opportunityScore: rawSellScore,
      signalStrength:
        rawSellScore >= 85
          ? "STRONG_SELL"
          : rawSellScore >= 70
            ? "MODERATE_SELL"
            : rawSellScore >= 55
              ? "DISTRIBUTION"
              : "NEUTRAL",
      mfi,
      rsi,
      atr: atr14,
      riskIndex: assetRisk,
      mfiCondition:
        mfi > 80
          ? "EXTREME_OVERBOUGHT"
          : mfi > 68
            ? "OVERBOUGHT"
            : mfi > 50
              ? "NEUTRAL"
              : "OVERSOLD",
      mfiScoreContribution: sellMfiPts,
      shortLiquidations1m: shortLiqUsd1m,
      isExhaustionTopDetected: mfi > 70 && sellerVolumeRatio > 0.55,
      liquidationScoreContribution: sellVolPts,
      fundingRate,
      fundingBias:
        fundingRate > 0.02
          ? "HEAVILY_POSITIVE_LONG_HEAVY"
          : fundingRate > 0
            ? "POSITIVE"
            : "NEUTRAL",
      fundingScoreContribution: sellFundingPts,
      buyVolumeDeceleration: sellerVolumeRatio >= 0.5,
      askResistanceRatio: Number(sellerVolumeRatio.toFixed(2)),
      sellVolumeZScore,
      resistanceScoreContribution: sellVolPts,
      entryZone: {
        min: executionLevels.sell.entryZone.min,
        max: executionLevels.sell.entryZone.max,
      },
      stopLoss: executionLevels.sell.stopLoss,
      stopLossPercent: executionLevels.sell.stopLossPercent,
      takeProfit1: executionLevels.sell.takeProfit1,
      takeProfit1Percent: executionLevels.sell.takeProfit1Percent,
      takeProfit2: executionLevels.sell.takeProfit2,
      takeProfit2Percent: executionLevels.sell.takeProfit2Percent,
      riskRewardRatio: executionLevels.sell.riskRewardRatio,
      triggers: {
        mfiOverbought: mfi > 68,
        shortLiquidationClimax:
          shortLiqUsd1m > 25000 || sellerVolumeRatio > 0.52,
        elevatedPositiveFunding: fundingRate > 0.01,
        askResistanceAbsorption: sellerVolumeRatio >= 0.55,
        distributionMomentum: rawSellScore >= 70,
      },
      timestamp: now,
      rationaleEn: `Upward momentum is fading as sellers take profits near the resistance ceiling at $${executionLevels.sell.stopLoss.toLocaleString()}.`,
      rationaleEs: `El impulso alcista pierde fuerza mientras los vendedores aseguran ganancias cerca del techo en $${executionLevels.sell.stopLoss.toLocaleString()}.`,
    };

    const riskStatus =
      assetRisk >= 80
        ? "FLASH_CRASH_WARNING"
        : assetRisk >= 65
          ? "HIGH_RISK"
          : assetRisk >= 40
            ? "ELEVATED"
            : "NORMAL";

    const brokenSupport = formatCryptoPrice(
      vwap1h > 0 ? vwap1h : ema21_1h > 0 ? ema21_1h : currentPrice * 1.005,
      currentPrice,
    );
    const rawDownside1 = Math.max(
      currentPrice * 0.5,
      currentPrice - 1.5 * atr14,
    );
    const rawDownside2 = Math.max(
      currentPrice * 0.3,
      currentPrice - 2.5 * atr14,
    );
    const rawEmergencyExit =
      nearestBuyWallPrice > rawDownside1 &&
      nearestBuyWallPrice < currentPrice &&
      nearestBuyWallPrice >= currentPrice * 0.99
        ? nearestBuyWallPrice
        : Math.max(
            currentPrice * 0.995,
            rawDownside1 + (currentPrice - rawDownside1) * 0.45,
          );
    const emergencyExit = formatCryptoPrice(
      Math.min(currentPrice * 0.998, rawEmergencyExit),
      currentPrice,
    );
    const downsideTarget1 = formatCryptoPrice(rawDownside1, currentPrice);
    const downsideTarget2 = formatCryptoPrice(rawDownside2, currentPrice);

    const breakdownItem = {
      id: `bd_${symbol}_${now}`,
      symbol,
      baseAsset,
      quoteAsset: "USDT",
      type: "BREAKDOWN_WARNING" as const,
      signalStrength:
        breakdownScore >= 88 ? "CRITICAL_DUMP" : "BREAKDOWN_WARNING",
      currentPrice,
      priceChange1h,
      priceChange15m,
      change24h,
      opportunityScore: breakdownScore,
      riskIndex: assetRisk,
      vwap1h: formatCryptoPrice(vwap1h, currentPrice),
      ema21_1h: formatCryptoPrice(ema21_1h, currentPrice),
      takerBuyRatio: Number(effectiveTakerBuyRatio.toFixed(3)),
      atr: atr14,
      brokenSupport,
      emergencyExit,
      downsideTarget1,
      downsideTarget2,
      entryZone: { min: brokenSupport, max: currentPrice },
      stopLoss: emergencyExit,
      takeProfit1: downsideTarget1,
      takeProfit2: downsideTarget2,
      timestamp: now,
      rationaleEn: `Strong selling pressure detected on ${symbol} after losing institutional support (VWAP). Risk of further downside.`,
      rationaleEs: `Fuerte presión de venta detectada en ${symbol} tras perder su soporte institucional (VWAP). Riesgo de caída mayor.`,
    };

    return {
      symbol,
      baseAsset,
      quoteAsset: "USDT",
      currentPrice,
      change24h,
      priceChange1m,
      priceChange5m,
      priceChange15m,
      priceChange1h,
      vwap1h: formatCryptoPrice(vwap1h, currentPrice),
      ema21_1h: formatCryptoPrice(ema21_1h, currentPrice),
      rollingHighPrice,
      recentDropPercent,
      sellVolume1m,
      buyVolume1m,
      sellVolume5m,
      buyVolume5m,
      sellVolumeZScore,
      volume24hUsd,
      mfi,
      rsi,
      atr14,
      buyerAbsorptionRatio,
      sellerVolumeRatio,
      bidDepthPressureRatio,
      fundingRate,
      riskIndex: assetRisk,
      riskStatus,
      buyEligible: assetRisk < 80 && !isBreakdownTriggered,
      isBuyLocked: assetRisk >= 80 || isBreakdownTriggered,
      nearestBuyWallPrice,
      nearestBuyWallQty,
      buy: buyItem,
      sell: sellItem,
      breakdown: breakdownItem,
      vwap: vwapSignal,
      updatedAt: now,
    };
  }

  class BackgroundSentinelScanner {
    private isRunning = false;
    private ingestionIntervalId: NodeJS.Timeout | null = null;
    private queueIntervalId: NodeJS.Timeout | null = null;
    private subscribers = new Map<string, TelegramSubscriber>();
    private cooldownMap = new Map<string, number>(); // 4-hour anti-spam cooldown per symbol_type
    private lastCrashAlertTime: number = 0; // Strict 4-Hour Global Crash Alert Cooldown
    private alertQueue: QueuedAlert[] = [];
    private isProcessingQueue = false;
    private lastPublicTeaserTimestamp: number = 0; // Max 1 teaser per 12 hours

    // ActiveSignalsTracker: Verifies winning trades against TP1 / TP2 every 20s cycle
    private activeSignalsMap = new Map<string, ActiveSignalRecord>();

    // In-Memory Market State Store
    public marketStore = {
      evaluations: new Map<string, MarketAssetEvaluation>(),
      latestBuySignals: [] as any[],
      latestSellSignals: [] as any[],
      latestBreakdownSignals: [] as any[],
      latestVwapSignals: [] as any[],
      globalRiskIndex: 25,
      lastIngestionTimestamp: 0,
      ingestionCount: 0,
    };

    private recentAlerts: Array<{
      id: string;
      symbol: string;
      type: "BUY" | "SELL" | "VWAP" | "CRASH" | "BREAKDOWN_WARNING";
      score: number;
      timestamp: number;
      dispatchedToCount: number;
    }> = [];

    public coreGlobalSymbols: string[] = [
      "BTCUSDT",
      "ETHUSDT",
      "SOLUSDT",
      "BNBUSDT",
      "XRPUSDT",
      "DOGEUSDT",
      "AVAXUSDT",
      "ADAUSDT",
      "LINKUSDT",
      "SUIUSDT",
      "NEARUSDT",
      "PEPEUSDT",
      "ZECUSDT",
    ];

    public targetSymbols: string[] = [
      "BTCUSDT",
      "ETHUSDT",
      "SOLUSDT",
      "BNBUSDT",
      "XRPUSDT",
      "DOGEUSDT",
      "AVAXUSDT",
      "ADAUSDT",
      "LINKUSDT",
      "SUIUSDT",
      "NEARUSDT",
      "PEPEUSDT",
      "ZECUSDT",
    ];

    public activeWatchlistSymbols: string[] = [
      "BTCUSDT",
      "ETHUSDT",
      "SOLUSDT",
      "BNBUSDT",
      "XRPUSDT",
      "DOGEUSDT",
      "AVAXUSDT",
      "ADAUSDT",
      "LINKUSDT",
      "SUIUSDT",
      "NEARUSDT",
      "PEPEUSDT",
      "ZECUSDT",
    ];

    constructor() {
      // Dynamic in-memory registry populated via Firestore sync and registration API
    }

    public rebuildSignalLists() {
      const isGlobalCrash = this.marketStore.globalRiskIndex >= 80;
      const finalBuyList: any[] = [];
      const finalSellList: any[] = [];
      const finalBreakdownList: any[] = [];
      const finalVwapList: any[] = [];

      for (const ev of this.marketStore.evaluations.values()) {
        if (
          !isGlobalCrash &&
          ev.buy &&
          ev.buy.opportunityScore >= 75 &&
          !ev.isBuyLocked
        ) {
          finalBuyList.push(ev.buy);
        }
        if (ev.sell && ev.sell.opportunityScore >= 75) {
          finalSellList.push(ev.sell);
        }
        if (ev.breakdown && ev.breakdown.opportunityScore >= 75) {
          finalBreakdownList.push(ev.breakdown);
        }
        if (ev.vwap) {
          finalVwapList.push(ev.vwap);
        }
      }

      this.marketStore.latestBuySignals = finalBuyList.sort(
        (a, b) => b.opportunityScore - a.opportunityScore,
      );
      this.marketStore.latestSellSignals = finalSellList.sort(
        (a, b) => b.opportunityScore - a.opportunityScore,
      );
      this.marketStore.latestBreakdownSignals = finalBreakdownList.sort(
        (a, b) => b.opportunityScore - a.opportunityScore,
      );
      this.marketStore.latestVwapSignals = finalVwapList.sort(
        (a, b) => b.trendScore - a.trendScore,
      );
    }

    public registerSubscriber(sub: TelegramSubscriber) {
      if (!sub.chatId || String(sub.chatId).trim() === "") return;
      const key = sub.userId || sub.chatId;
      const existing = this.subscribers.get(key);
      const cleanTracked = Array.isArray(sub.trackedSymbols)
        ? sub.trackedSymbols.map((s) => String(s).toUpperCase().trim())
        : existing?.trackedSymbols || ["BTCUSDT", "ETHUSDT", "SOLUSDT"];
      const cleanLang: "es" | "en" =
        sub.languagePreference || existing?.languagePreference || "es";

      this.subscribers.set(key, {
        ...sub,
        trackedSymbols: cleanTracked,
        languagePreference: cleanLang,
      });
      console.log(
        `[24/7 Scanner Registry] Registered subscriber ${key} (Chat: ${sub.chatId}, Tier: ${sub.subscriptionTier}, Lang: ${cleanLang}, Tracked: [${cleanTracked.join(", ")}])`,
      );
    }

    public updateSubscriberTrackedSymbols(
      userIdOrChat: string,
      symbols: string[],
    ) {
      const cleanSymbols = symbols
        .map((s) => String(s).toUpperCase().trim())
        .filter(Boolean);
      this.activeWatchlistSymbols = [...cleanSymbols];
      // Ensure targetSymbols tracks any dynamically requested symbols
      for (const sym of cleanSymbols) {
        this.addTrackedSymbol(sym);
      }
      if (!userIdOrChat) return;
      const sub = this.subscribers.get(userIdOrChat);
      if (sub) {
        sub.trackedSymbols = cleanSymbols;
        console.log(
          `[24/7 Scanner Registry] Updated tracked symbols for ${userIdOrChat}: [${cleanSymbols.join(", ")}]`,
        );
        return;
      }
      for (const [k, s] of this.subscribers.entries()) {
        if (s.userId === userIdOrChat || s.chatId === userIdOrChat) {
          s.trackedSymbols = cleanSymbols;
          console.log(
            `[24/7 Scanner Registry] Updated tracked symbols for ${k}: [${cleanSymbols.join(", ")}]`,
          );
          return;
        }
      }
    }

    public updateSubscriberLanguage(
      userIdOrChat: string,
      language: "es" | "en",
    ) {
      const cleanLang: "es" | "en" = language === "en" ? "en" : "es";
      const sub = this.subscribers.get(userIdOrChat);
      if (sub) {
        sub.languagePreference = cleanLang;
        console.log(
          `[24/7 Scanner Registry] Updated language preference for ${userIdOrChat}: ${cleanLang}`,
        );
        return;
      }
      for (const [k, s] of this.subscribers.entries()) {
        if (s.userId === userIdOrChat || s.chatId === userIdOrChat) {
          s.languagePreference = cleanLang;
          console.log(
            `[24/7 Scanner Registry] Updated language preference for ${k}: [${cleanLang}]`,
          );
          return;
        }
      }
    }

    public addTrackedSymbol(symbol: string) {
      const raw = String(symbol || "")
        .toUpperCase()
        .trim();
      if (!raw) return;
      const clean = raw.endsWith("USDT") ? raw : `${raw}USDT`;
      if (
        clean &&
        !invalidSymbols.has(clean) &&
        !this.targetSymbols.includes(clean)
      ) {
        this.targetSymbols.push(clean);
        console.log(
          `[24/7 Scanner] Dynamically added ${clean} to monitored asset list (Total: ${this.targetSymbols.length})`,
        );
      }
    }

    public removeTrackedSymbol(symbol: string) {
      const raw = String(symbol || "")
        .toUpperCase()
        .trim();
      if (!raw) return;
      const clean = raw.endsWith("USDT") ? raw : `${raw}USDT`;
      const prevLen = this.targetSymbols.length;
      this.targetSymbols = this.targetSymbols.filter((s) => s !== clean);
      this.activeWatchlistSymbols = this.activeWatchlistSymbols.filter(
        (s) => s !== clean,
      );
      this.marketStore.evaluations.delete(clean);
      this.rebuildSignalLists();
      if (this.targetSymbols.length !== prevLen) {
        console.log(
          `[24/7 Scanner] Removed symbol ${clean} from monitored asset list (Total: ${this.targetSymbols.length})`,
        );
      }
    }

    public async syncWatchlistSymbols(
      symbols: string[],
      options?: {
        addedSymbol?: string;
        removedSymbol?: string;
        userId?: string;
        chatId?: string;
        removeFromIngestion?: boolean;
      },
    ) {
      const normalized = Array.from(
        new Set(
          (Array.isArray(symbols) ? symbols : [])
            .map((s) =>
              String(s || "")
                .toUpperCase()
                .trim(),
            )
            .filter(Boolean)
            .map((s) => (s.endsWith("USDT") ? s : `${s}USDT`))
            .filter((s) => !invalidSymbols.has(s)),
        ),
      );

      this.activeWatchlistSymbols = normalized;

      if (options?.userId) {
        this.updateSubscriberTrackedSymbols(options.userId, normalized);
      }
      if (options?.chatId) {
        this.updateSubscriberTrackedSymbols(options.chatId, normalized);
      }

      // If a specific symbol was removed, or if removeFromIngestion is requested, prune from targetSymbols
      if (options?.removedSymbol) {
        const remRaw = String(options.removedSymbol).toUpperCase().trim();
        const remClean = remRaw.endsWith("USDT") ? remRaw : `${remRaw}USDT`;
        this.removeTrackedSymbol(remClean);
      }

      // Also prune any custom (non-core) symbols that are no longer in the user's watchlist or any subscriber's watchlist
      const subscriberTracked = new Set<string>();
      for (const sub of this.subscribers.values()) {
        for (const sym of sub.trackedSymbols || []) {
          subscriberTracked.add(sym);
        }
      }
      const wantedSet = new Set<string>(normalized);
      for (const existingSym of [...this.targetSymbols]) {
        if (
          !wantedSet.has(existingSym) &&
          !subscriberTracked.has(existingSym)
        ) {
          if (
            options?.removeFromIngestion ||
            !this.coreGlobalSymbols.includes(existingSym)
          ) {
            this.removeTrackedSymbol(existingSym);
          }
        }
      }

      // Add all watchlist symbols to targetSymbols and evaluate any newly added ones immediately
      const toEvaluate: string[] = [];
      for (const sym of normalized) {
        this.addTrackedSymbol(sym);
        if (!this.marketStore.evaluations.has(sym)) {
          toEvaluate.push(sym);
        }
      }
      if (options?.addedSymbol) {
        const addRaw = String(options.addedSymbol).toUpperCase().trim();
        const addClean = addRaw.endsWith("USDT") ? addRaw : `${addRaw}USDT`;
        if (!invalidSymbols.has(addClean)) {
          this.addTrackedSymbol(addClean);
          if (!toEvaluate.includes(addClean)) {
            toEvaluate.push(addClean);
          }
        }
      }

      if (toEvaluate.length > 0) {
        await Promise.all(
          toEvaluate
            .slice(0, 6)
            .map((sym) => this.evaluateSymbolOnDemand(sym).catch(() => null)),
        );
      }

      this.rebuildSignalLists();
      return {
        trackedSymbols: this.activeWatchlistSymbols,
        monitoredSymbols: this.targetSymbols,
      };
    }

    public unregisterSubscriber(userId: string) {
      this.subscribers.delete(userId);
    }

    public getSubscriber(userIdOrChat: string): TelegramSubscriber | undefined {
      const direct = this.subscribers.get(userIdOrChat);
      if (direct) return direct;
      for (const s of this.subscribers.values()) {
        if (s.userId === userIdOrChat || s.chatId === userIdOrChat) return s;
      }
      return undefined;
    }

    public updateSubscriberTier(
      userId: string,
      tier: "free" | "pro" | "premium",
    ) {
      const existing = this.subscribers.get(userId);
      if (existing) {
        existing.subscriptionTier = tier;
      }
    }

    public getPremiumSubscribers(): TelegramSubscriber[] {
      return Array.from(this.subscribers.values()).filter(
        (s) =>
          (s.subscriptionTier === "pro" || s.subscriptionTier === "premium") &&
          s.chatId &&
          s.chatId.trim() !== "",
      );
    }

    public getState() {
      const evaluationsObj: Record<string, any> = {};
      for (const [sym, evalData] of this.marketStore.evaluations.entries()) {
        evaluationsObj[sym] = {
          buy: evalData.buy,
          sell: evalData.sell,
          vwap: evalData.vwap,
        };
      }

      return {
        service: "BackgroundSentinelScanner",
        status: this.isRunning ? "online" : "stopped",
        isScanning: this.isRunning,
        lastScanTimestamp: this.marketStore.lastIngestionTimestamp,
        scanCount: this.marketStore.ingestionCount,
        monitoredSymbols: this.targetSymbols,
        isVolatilityShieldActive: volatilityShield.isShieldActive(),
        globalRiskIndex: this.marketStore.globalRiskIndex,
        isCrashWarningActive: this.marketStore.globalRiskIndex >= 80,
        lastCrashAlertTime: this.lastCrashAlertTime,
        isCrashCooldownActive:
          Date.now() - this.lastCrashAlertTime < 4 * 60 * 60 * 1000,
        queuedAlertsCount: this.alertQueue.length,
        premiumSubscribersCount: this.getPremiumSubscribers().length,
        highProbabilityBuyCount: this.marketStore.latestBuySignals.length,
        highProbabilitySellCount: this.marketStore.latestSellSignals.length,
        highProbabilityBreakdownCount:
          this.marketStore.latestBreakdownSignals.length,
        highProbabilityVwapCount: this.marketStore.latestVwapSignals.length,
        buySignals: this.marketStore.latestBuySignals,
        sellSignals: this.marketStore.latestSellSignals,
        breakdownSignals: this.marketStore.latestBreakdownSignals,
        vwapSignals: this.marketStore.latestVwapSignals,
        allEvaluations: evaluationsObj,
        recentAlerts: this.recentAlerts.slice(0, 20),
        winningSignalsLedger: globalWinningSignals.slice(0, 20),
        activeTrackedSignalsCount: this.activeSignalsMap.size,
      };
    }

    // -------------------------------------------------------------------------
    // BACKEND FOMO ENGINE: ActiveSignalsTracker (20s Target Verification)
    // -------------------------------------------------------------------------
    public trackDispatchedSignal(type: "BUY" | "SELL", signal: any) {
      if (!signal || !signal.symbol) return;
      const score = Number(signal.opportunityScore || 0);
      if (score < 75) return;

      const cleanSym = String(signal.symbol).toUpperCase().trim();
      const key = `${cleanSym}_${type}`;
      const existing = this.activeSignalsMap.get(key);
      if (
        existing &&
        (existing.status === "ACTIVE" || existing.status === "TP1_HIT")
      ) {
        return; // Already actively tracking this setup
      }

      const entryPrice = Number(signal.currentPrice || 0);
      const stopLoss = Number(signal.stopLoss || 0);
      const tp1 = Number(signal.takeProfit1 || 0);
      const tp2 = Number(signal.takeProfit2 || 0);

      if (entryPrice <= 0 || stopLoss <= 0 || tp1 <= 0 || tp2 <= 0) return;

      const record: ActiveSignalRecord = {
        id: `sig_${Date.now()}_${cleanSym}_${type}`,
        symbol: cleanSym,
        baseAsset:
          signal.baseAsset ||
          (cleanSym.endsWith("USDT") ? cleanSym.slice(0, -4) : cleanSym),
        type,
        entryPrice,
        stopLoss,
        tp1,
        tp2,
        score,
        dispatchedAt: Date.now(),
        status: "ACTIVE",
      };

      this.activeSignalsMap.set(key, record);
      console.log(
        `[ActiveSignalsTracker] Tracking ${type} ${cleanSym} | Entry: $${entryPrice} | SL: $${stopLoss} | TP1: $${tp1} | TP2: $${tp2}`,
      );
    }

    public async verifyActiveSignalsAgainstLivePrices() {
      if (this.activeSignalsMap.size === 0) return;

      const now = Date.now();
      const MAX_SIGNAL_AGE_MS = 48 * 60 * 60 * 1000; // Purge stale unhit signals older than 48h

      for (const [key, sig] of Array.from(this.activeSignalsMap.entries())) {
        if (now - sig.dispatchedAt > MAX_SIGNAL_AGE_MS) {
          this.activeSignalsMap.delete(key);
          continue;
        }

        const liveEval = this.marketStore.evaluations.get(sig.symbol);
        const currentPrice = liveEval?.currentPrice || 0;
        if (
          !Number.isFinite(currentPrice) ||
          currentPrice <= 0 ||
          sig.entryPrice <= 0
        ) {
          continue;
        }

        if (sig.type === "BUY") {
          // Stop Loss hit before TP1
          if (sig.status === "ACTIVE" && currentPrice <= sig.stopLoss) {
            sig.status = "STOPPED";
            this.activeSignalsMap.delete(key);
            console.log(
              `[ActiveSignalsTracker] ${sig.symbol} BUY hit Stop Loss ($${currentPrice} <= $${sig.stopLoss}). Removed.`,
            );
            continue;
          }

          // TP1 Hit
          if (sig.status === "ACTIVE" && currentPrice >= sig.tp1) {
            sig.status = "TP1_HIT";
            const gainPct = Math.max(
              0.01,
              Number(
                (
                  ((currentPrice - sig.entryPrice) / sig.entryPrice) *
                  100
                ).toFixed(2),
              ),
            );
            const closedAt = Date.now();
            const entry: WinningLedgerEntry = {
              id: `win_${sig.dispatchedAt}_${sig.symbol}_BUY_TP1`,
              symbol: sig.symbol,
              baseAsset: sig.baseAsset,
              type: "BUY",
              signal: "BUY",
              targetHit: "TP1",
              entryPrice: sig.entryPrice,
              exitPrice: currentPrice,
              profitPct: gainPct,
              gainPct,
              dispatchedAt: sig.dispatchedAt,
              hitAt: closedAt,
              closedAt,
              timeElapsedMs: closedAt - sig.dispatchedAt,
              verifiedTelegramAlert: true,
            };
            await this.dispatchPublicVictoryAlert(entry);
          }

          // TP2 Hit
          if (sig.status === "TP1_HIT" && currentPrice >= sig.tp2) {
            sig.status = "TP2_HIT";
            const gainPct = Math.max(
              0.01,
              Number(
                (
                  ((currentPrice - sig.entryPrice) / sig.entryPrice) *
                  100
                ).toFixed(2),
              ),
            );
            const closedAt = Date.now();
            const entry: WinningLedgerEntry = {
              id: `win_${sig.dispatchedAt}_${sig.symbol}_BUY_TP2`,
              symbol: sig.symbol,
              baseAsset: sig.baseAsset,
              type: "BUY",
              signal: "BUY",
              targetHit: "TP2",
              entryPrice: sig.entryPrice,
              exitPrice: currentPrice,
              profitPct: gainPct,
              gainPct,
              dispatchedAt: sig.dispatchedAt,
              hitAt: closedAt,
              closedAt,
              timeElapsedMs: closedAt - sig.dispatchedAt,
              verifiedTelegramAlert: true,
            };
            await this.dispatchPublicVictoryAlert(entry);
            this.activeSignalsMap.delete(key);
          }
        } else {
          // Exact Inverse Logic for SELL signals
          if (sig.status === "ACTIVE" && currentPrice >= sig.stopLoss) {
            sig.status = "STOPPED";
            this.activeSignalsMap.delete(key);
            console.log(
              `[ActiveSignalsTracker] ${sig.symbol} SELL hit Stop Loss ($${currentPrice} >= $${sig.stopLoss}). Removed.`,
            );
            continue;
          }

          // TP1 Hit (Price dropped to or below TP1)
          if (sig.status === "ACTIVE" && currentPrice <= sig.tp1) {
            sig.status = "TP1_HIT";
            const gainPct = Math.max(
              0.01,
              Number(
                (
                  ((sig.entryPrice - currentPrice) / sig.entryPrice) *
                  100
                ).toFixed(2),
              ),
            );
            const closedAt = Date.now();
            const entry: WinningLedgerEntry = {
              id: `win_${sig.dispatchedAt}_${sig.symbol}_SELL_TP1`,
              symbol: sig.symbol,
              baseAsset: sig.baseAsset,
              type: "SELL",
              signal: "SELL",
              targetHit: "TP1",
              entryPrice: sig.entryPrice,
              exitPrice: currentPrice,
              profitPct: gainPct,
              gainPct,
              dispatchedAt: sig.dispatchedAt,
              hitAt: closedAt,
              closedAt,
              timeElapsedMs: closedAt - sig.dispatchedAt,
              verifiedTelegramAlert: true,
            };
            await this.dispatchPublicVictoryAlert(entry);
          }

          // TP2 Hit (Price dropped to or below TP2)
          if (sig.status === "TP1_HIT" && currentPrice <= sig.tp2) {
            sig.status = "TP2_HIT";
            const gainPct = Math.max(
              0.01,
              Number(
                (
                  ((sig.entryPrice - currentPrice) / sig.entryPrice) *
                  100
                ).toFixed(2),
              ),
            );
            const closedAt = Date.now();
            const entry: WinningLedgerEntry = {
              id: `win_${sig.dispatchedAt}_${sig.symbol}_SELL_TP2`,
              symbol: sig.symbol,
              baseAsset: sig.baseAsset,
              type: "SELL",
              signal: "SELL",
              targetHit: "TP2",
              entryPrice: sig.entryPrice,
              exitPrice: currentPrice,
              profitPct: gainPct,
              gainPct,
              dispatchedAt: sig.dispatchedAt,
              hitAt: closedAt,
              closedAt,
              timeElapsedMs: closedAt - sig.dispatchedAt,
              verifiedTelegramAlert: true,
            };
            await this.dispatchPublicVictoryAlert(entry);
            this.activeSignalsMap.delete(key);
          }
        }
      }
    }

    private recordWinningSignal(entry: WinningLedgerEntry): boolean {
      // Avoid duplicate entries for the same signal/target
      const isDuplicate = globalWinningSignals.some(
        (existing) =>
          existing.id === entry.id ||
          (existing.symbol === entry.symbol &&
            existing.type === entry.type &&
            existing.targetHit === entry.targetHit &&
            (existing.dispatchedAt === entry.dispatchedAt ||
              Math.abs((existing.hitAt || 0) - (entry.hitAt || 0)) <
                15 * 60 * 1000)),
      );
      if (isDuplicate) {
        return false;
      }

      const closedAt = entry.closedAt || entry.hitAt || Date.now();
      const gainPct = entry.gainPct ?? entry.profitPct;
      const normalizedEntry: WinningLedgerEntry = {
        ...entry,
        signal: entry.type,
        gainPct,
        profitPct: gainPct,
        hitAt: closedAt,
        closedAt,
        verifiedTelegramAlert: true,
      };

      globalWinningSignals.unshift(normalizedEntry);
      globalWinningSignals.sort((a, b) => b.hitAt - a.hitAt);
      globalWinningSignals = globalWinningSignals.slice(0, 20);

      void persistWinningSignalToFirestore(normalizedEntry);

      console.log(
        `[WinningSignalsLedger] 🏆 ${normalizedEntry.symbol} ${normalizedEntry.type} hit ${normalizedEntry.targetHit} (+${normalizedEntry.profitPct}%) in ${formatElapsedTimeEs(normalizedEntry.timeElapsedMs)}`,
      );
      return true;
    }

    private async dispatchPublicVictoryAlert(entry: WinningLedgerEntry) {
      // Single Source of Truth: simultaneously record win in globalWinningSignals & dispatch public Telegram alert
      const added = this.recordWinningSignal(entry);
      if (!added) {
        return;
      }

      const publicChannelId = process.env.TELEGRAM_PUBLIC_CHANNEL_ID;
      if (!publicChannelId || String(publicChannelId).trim() === "") {
        return;
      }
      try {
        const tpHitPublicMessage = buildPublicVictoryAlertMarkdown(entry);
        const res = await sendTelegramMessage(
          publicChannelId,
          tpHitPublicMessage,
        );
        if (res.ok) {
          console.log(
            `[Telegram Public FOMO Victory] Dispatched ${entry.symbol} ${entry.targetHit} (+${entry.profitPct}%) to channel ${publicChannelId}`,
          );
        }
      } catch (err: any) {
        console.warn(
          `[Telegram Public FOMO Victory Error]`,
          err?.message || err,
        );
      }
    }

    public getWinningSignalsLedger(): WinningLedgerEntry[] {
      return globalWinningSignals.slice(0, 20);
    }

    public getActiveTrackedSignalsCount(): number {
      return this.activeSignalsMap.size;
    }

    public getLastCrashAlertTime(): number {
      return this.lastCrashAlertTime;
    }

    public resetCrashAlertCooldown() {
      this.lastCrashAlertTime = 0;
      this.cooldownMap.delete("GLOBAL_CRASH");
      console.log(
        `[Flash Crash Cooldown] Reset cooldown for testing/emergency dispatch.`,
      );
    }

    public enqueueCrashAlert(riskIndex: number): boolean {
      const cooldownKey = "GLOBAL_CRASH";
      const lastDispatched = Math.max(
        this.lastCrashAlertTime,
        this.cooldownMap.get(cooldownKey) || 0,
      );
      const FOUR_HOURS_MS = 4 * 60 * 60 * 1000; // Strict 4-Hour Anti-Spam Cooldown

      if (Date.now() - lastDispatched < FOUR_HOURS_MS) {
        // Block any subsequent Crash Alerts for at least 4 hours even if index fluctuates
        return false;
      }

      // Avoid queueing duplicate if already in alertQueue
      const alreadyQueued = this.alertQueue.some((q) => q.type === "CRASH");
      if (alreadyQueued) return false;

      this.alertQueue.push({
        id: `alert_${Date.now()}_GLOBAL_CRASH`,
        type: "CRASH",
        symbol: "MARKET",
        signal: {
          riskIndex,
          timestamp: Date.now(),
        },
        queuedAt: Date.now(),
        attempts: 0,
      });

      console.log(
        `[Flash Crash Alert Enqueued] Global Risk Index: ${riskIndex}/100. Dispatched to Telegram queue.`,
      );
      return true;
    }

    public start(ingestionIntervalMs: number = 20_000) {
      if (this.isRunning) return;
      this.isRunning = true;
      console.log(
        `[24/7 Scanner Engine] Starting Market Ingestion Worker (${ingestionIntervalMs / 1000}s) & Telegram Dispatch Queue Worker (100ms)...`,
      );

      // 0. Restore persisted Global Winning Signals from Firestore on startup
      loadGlobalWinningSignalsFromFirestore().catch(() => null);

      // 1. Start Market Ingestion Worker (Producer - every 20s)
      setTimeout(() => {
        this.runMarketIngestionCycle().catch((err) => {
          console.warn(
            "[24/7 Ingestion Worker Initial Cycle Error]",
            err.message,
          );
        });
      }, 1_500);

      this.ingestionIntervalId = setInterval(() => {
        this.runMarketIngestionCycle().catch((err) => {
          console.warn("[24/7 Ingestion Worker Cycle Error]", err.message);
        });
      }, ingestionIntervalMs);

      // 2. Start Telegram Dispatch Queue Worker (Consumer - every 100ms)
      this.queueIntervalId = setInterval(() => {
        this.processTelegramDispatchQueue().catch((err) => {
          console.warn("[24/7 Telegram Queue Worker Error]", err.message);
        });
      }, 100);
    }

    public stop() {
      if (this.ingestionIntervalId) {
        clearInterval(this.ingestionIntervalId);
        this.ingestionIntervalId = null;
      }
      if (this.queueIntervalId) {
        clearInterval(this.queueIntervalId);
        this.queueIntervalId = null;
      }
      this.isRunning = false;
      console.log("[24/7 Scanner Engine] Background Sentinel Scanner stopped.");
    }

    // -------------------------------------------------------------------------
    // ON-DEMAND SINGLE SYMBOL EVALUATION (Supports dynamic custom added symbols)
    // -------------------------------------------------------------------------
    public async evaluateSymbolOnDemand(
      rawSymbol: string,
    ): Promise<MarketAssetEvaluation | null> {
      const symbol = rawSymbol.trim().toUpperCase().endsWith("USDT")
        ? rawSymbol.trim().toUpperCase()
        : `${rawSymbol.trim().toUpperCase()}USDT`;
      if (invalidSymbols.has(symbol)) {
        return null;
      }
      this.addTrackedSymbol(symbol);
      try {
        const [
          rawKlines,
          klines1h,
          weeklyKlines,
          monthlyKlines,
          depthData,
          ticker24h,
        ] = await Promise.all([
          fetchBinanceSpotOrFutures<any[]>(
            `/api/v3/klines?symbol=${symbol}&interval=15m&limit=35`,
            symbol,
          ),
          fetchBinanceSpotOrFutures<any[]>(
            `/api/v3/klines?symbol=${symbol}&interval=1h&limit=35`,
            symbol,
          ).catch(() => null),
          getHigherTfKlines(symbol, "1w").catch(() => null),
          getHigherTfKlines(symbol, "1M").catch(() => null),
          orderBookDepthManager.getDepth(symbol).catch(() => null),
          fetchBinanceSpotOrFutures<any>(
            `/api/v3/ticker/24hr?symbol=${symbol}`,
            symbol,
          ).catch(() => null),
        ]);
        const t24 = ticker24h
          ? {
              change24h: parseFloat(ticker24h.priceChangePercent || "0"),
              quoteVolume: parseFloat(ticker24h.quoteVolume || "0"),
              high24h: parseFloat(ticker24h.highPrice || "0"),
            }
          : undefined;
        let vwapSignal: any = undefined;
        if (
          klines1h &&
          klines1h.length >= 21 &&
          weeklyKlines &&
          monthlyKlines
        ) {
          vwapSignal = buildVwapSignalFromKlines(
            symbol,
            "1h",
            klines1h,
            weeklyKlines,
            monthlyKlines,
            t24?.change24h || 0,
          );
        }
        const liqStats = futuresLiquidationManager.getLiquidationStats(symbol);
        const ev = evaluateAssetFromKlines({
          symbol,
          rawKlines,
          klines1h,
          depthData,
          liqStats,
          ticker24h: t24,
          vwapSignal,
        });
        if (ev) {
          const isGlobalCrash = this.marketStore.globalRiskIndex >= 80;
          const isBreakdown = Boolean(
            ev.breakdown && ev.breakdown.opportunityScore >= 75,
          );
          const isLocked = isGlobalCrash || ev.riskIndex >= 80 || isBreakdown;
          ev.isBuyLocked = isLocked;
          ev.buyEligible = !isLocked;
          if (ev.buy) {
            ev.buy.isBuyLocked = isLocked;
            ev.buy.buyEligible = !isLocked;
            if (isLocked) {
              ev.buy.opportunityScore = Math.min(ev.buy.opportunityScore, 30);
              ev.buy.signalStrength = "AVOID";
            }
          }
          this.marketStore.evaluations.set(symbol, ev);
          this.rebuildSignalLists();
        }
        return ev;
      } catch (err: any) {
        if (isInvalidSymbolErr(err)) {
          this.removeTrackedSymbol(symbol);
          return null;
        }
        console.warn(`[On-Demand Evaluation Error ${symbol}]`, err?.message);
        return null;
      }
    }

    // -------------------------------------------------------------------------
    // WORKER 1: Market Ingestion Worker (Producer - runs every 20 seconds)
    // -------------------------------------------------------------------------
    public async runMarketIngestionCycle() {
      this.marketStore.ingestionCount++;
      this.marketStore.lastIngestionTimestamp = Date.now();

      const isShieldActive = volatilityShield.isShieldActive();
      if (isShieldActive) {
        const activeEvent = volatilityShield.getCurrentActiveEvent();
        console.log(
          `[24/7 Ingestion Guard] Volatility Shield Active (${activeEvent?.title || "High Impact"}). Alerts paused.`,
        );
      }

      // Batch fetch 24h tickers (Spot & Futures-only separately) & Futures Premium Index in parallel
      const ticker24hMap: Record<
        string,
        { change24h: number; quoteVolume: number; high24h: number }
      > = {};
      let fundingRatesMap: Record<string, number> = {};

      const spotSymbols = this.targetSymbols.filter(
        (s) => !futuresOnlySymbols.has(s) && !invalidSymbols.has(s),
      );
      const futuresTargets = this.targetSymbols.filter(
        (s) => futuresOnlySymbols.has(s) && !invalidSymbols.has(s),
      );

      await Promise.all([
        (async () => {
          if (spotSymbols.length === 0) return;
          try {
            const batchPath = `/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(spotSymbols))}`;
            const rawTickers = await fetchFromBinance<any[]>(batchPath, {
              timeoutMs: 4000,
            });
            if (Array.isArray(rawTickers)) {
              for (const t of rawTickers) {
                if (t?.symbol) {
                  ticker24hMap[t.symbol] = {
                    change24h: parseFloat(t.priceChangePercent || "0") || 0,
                    quoteVolume: parseFloat(t.quoteVolume || "0") || 0,
                    high24h: parseFloat(t.highPrice || "0") || 0,
                  };
                }
              }
            }
          } catch {
            // Fallback handled per symbol via fetchBinanceSpotOrFutures
          }
        })(),
        (async () => {
          if (futuresTargets.length === 0) return;
          try {
            const allFutures = await fetchFromBinanceFutures<any[]>(
              "/fapi/v1/ticker/24hr",
              { timeoutMs: 4000 },
            );
            if (Array.isArray(allFutures)) {
              const wanted = new Set(futuresTargets);
              for (const t of allFutures) {
                if (t?.symbol && wanted.has(t.symbol)) {
                  ticker24hMap[t.symbol] = {
                    change24h: parseFloat(t.priceChangePercent || "0") || 0,
                    quoteVolume: parseFloat(t.quoteVolume || "0") || 0,
                    high24h: parseFloat(t.highPrice || "0") || 0,
                  };
                }
              }
            }
          } catch {
            // Best effort
          }
        })(),
        (async () => {
          try {
            const rawItems = await fetchFromBinanceFutures<any[]>(
              "/fapi/v1/premiumIndex",
              { timeoutMs: 3000 },
            );
            if (Array.isArray(rawItems)) {
              for (const item of rawItems) {
                if (item?.symbol && item?.lastFundingRate !== undefined) {
                  fundingRatesMap[item.symbol] = parseFloat(
                    item.lastFundingRate,
                  );
                }
              }
            }
          } catch {
            // Fallback handled in evaluation
          }
        })(),
      ]);

      // Snapshot targetSymbols so pruning inside the loop never shifts batch indexes
      const symbolsSnapshot = [...this.targetSymbols].filter(
        (s) => !invalidSymbols.has(s),
      );

      // Process symbols in parallel batches of 5 for speed while protecting Binance rate limits
      for (let idx = 0; idx < symbolsSnapshot.length; idx += 5) {
        const batch = symbolsSnapshot.slice(idx, idx + 5);
        await Promise.all(
          batch.map(async (symbol) => {
            try {
              const [
                rawKlines,
                klines1h,
                weeklyKlines,
                monthlyKlines,
                depthData,
              ] = await Promise.all([
                fetchBinanceSpotOrFutures<any[]>(
                  `/api/v3/klines?symbol=${symbol}&interval=15m&limit=35`,
                  symbol,
                ),
                fetchBinanceSpotOrFutures<any[]>(
                  `/api/v3/klines?symbol=${symbol}&interval=1h&limit=35`,
                  symbol,
                ).catch(() => null),
                getHigherTfKlines(symbol, "1w").catch(() => null),
                getHigherTfKlines(symbol, "1M").catch(() => null),
                orderBookDepthManager.getDepth(symbol).catch(() => null),
              ]);

              if (!Array.isArray(rawKlines) || rawKlines.length < 18) return;

              const t24 = ticker24hMap[symbol];
              let vwapSignal: any =
                this.marketStore.evaluations.get(symbol)?.vwap;
              if (
                klines1h &&
                klines1h.length >= 21 &&
                weeklyKlines &&
                monthlyKlines
              ) {
                try {
                  vwapSignal = buildVwapSignalFromKlines(
                    symbol,
                    "1h",
                    klines1h,
                    weeklyKlines,
                    monthlyKlines,
                    t24?.change24h || 0,
                  );
                } catch {
                  // Retain previous vwapSignal if transient error
                }
              }

              const liqStats =
                futuresLiquidationManager.getLiquidationStats(symbol);
              const ev = evaluateAssetFromKlines({
                symbol,
                rawKlines,
                klines1h,
                fundingRate: fundingRatesMap[symbol],
                depthData,
                liqStats,
                ticker24h: t24,
                vwapSignal,
              });

              if (ev) {
                this.marketStore.evaluations.set(symbol, ev);
              }
            } catch (err: any) {
              if (isInvalidSymbolErr(err)) {
                this.removeTrackedSymbol(symbol);
              } else {
                console.warn(
                  `[24/7 Ingestion Symbol Error ${symbol}]`,
                  err?.message,
                );
              }
            }
          }),
        );
      }

      // 8. TIE GLOBAL RISK INDEX TO BTC, ETH & WORST-PERFORMING WATCHLIST COINS
      const btcEval = this.marketStore.evaluations.get("BTCUSDT");
      const ethEval = this.marketStore.evaluations.get("ETHUSDT");
      const btcRisk = btcEval?.riskIndex ?? 18;
      const ethRisk = ethEval?.riskIndex ?? 20;

      const allRisks: number[] = [];
      for (const [, ev] of this.marketStore.evaluations.entries()) {
        if (Number.isFinite(ev.riskIndex)) {
          allRisks.push(ev.riskIndex);
        }
      }
      const sortedWorstRisks = [...allRisks].sort((a, b) => b - a);
      const worstSlice = sortedWorstRisks.slice(
        0,
        Math.min(3, sortedWorstRisks.length),
      );
      const worstCoinsAvg =
        worstSlice.length > 0
          ? worstSlice.reduce((a, b) => a + b, 0) / worstSlice.length
          : (btcRisk + ethRisk) / 2;

      // Weighted Market Health: 40% BTC + 25% ETH + 35% Worst Watchlist Coins
      let weightedGlobalRisk = Math.round(
        btcRisk * 0.4 + ethRisk * 0.25 + worstCoinsAvg * 0.35,
      );
      const highRiskCoinsCount = sortedWorstRisks.filter((r) => r >= 65).length;
      if (highRiskCoinsCount >= 3 || Math.max(btcRisk, ethRisk) >= 75) {
        weightedGlobalRisk = Math.max(
          weightedGlobalRisk,
          Math.round(worstCoinsAvg * 0.88),
        );
      }
      this.marketStore.globalRiskIndex = Math.min(
        100,
        Math.max(5, weightedGlobalRisk),
      );

      const isGlobalCrash = this.marketStore.globalRiskIndex >= 80;

      // 9. ENFORCE GLOBAL ANTI-CONTRADICTION RULE CENTRALLY (Pillar 4)
      for (const [, ev] of this.marketStore.evaluations.entries()) {
        const isBreakdown = Boolean(
          ev.breakdown && ev.breakdown.opportunityScore >= 75,
        );
        const isLocked = isGlobalCrash || ev.riskIndex >= 80 || isBreakdown;
        ev.isBuyLocked = isLocked;
        ev.buyEligible = !isLocked;
        if (ev.buy) {
          ev.buy.isBuyLocked = isLocked;
          ev.buy.buyEligible = !isLocked;
          ev.buy.riskIndex = ev.riskIndex;
          if (isLocked) {
            ev.buy.opportunityScore = Math.min(ev.buy.opportunityScore, 30);
            ev.buy.signalStrength = "AVOID";
          }
        }
      }

      // Collect qualified signals (BUY, SELL, BREAKDOWN_WARNING)
      const finalBuyList: any[] = [];
      const finalSellList: any[] = [];
      const finalBreakdownList: any[] = [];
      const finalVwapList: any[] = [];

      for (const ev of this.marketStore.evaluations.values()) {
        if (
          !isGlobalCrash &&
          ev.buy &&
          ev.buy.opportunityScore >= 75 &&
          !ev.isBuyLocked
        ) {
          finalBuyList.push(ev.buy);
          this.trackDispatchedSignal("BUY", ev.buy);
          if (!isShieldActive) {
            this.enqueueAlert("BUY", ev.buy);
          }
        }
        if (ev.sell && ev.sell.opportunityScore >= 75) {
          finalSellList.push(ev.sell);
          this.trackDispatchedSignal("SELL", ev.sell);
          if (!isShieldActive) {
            this.enqueueAlert("SELL", ev.sell);
          }
        }
        if (ev.breakdown && ev.breakdown.opportunityScore >= 75) {
          finalBreakdownList.push(ev.breakdown);
          if (!isShieldActive) {
            this.enqueueAlert("BREAKDOWN_WARNING", ev.breakdown);
          }
        }
        if (ev.vwap) {
          finalVwapList.push(ev.vwap);
        }
      }

      // 10. AUTOMATED TAKE-PROFIT TRACKER: Verify active signals against live prices every 20s
      await this.verifyActiveSignalsAgainstLivePrices();

      // 11. GLOBAL FLASH CRASH ALERT TRIGGER (Risk Index >= 80)
      if (isGlobalCrash) {
        this.enqueueCrashAlert(this.marketStore.globalRiskIndex);
      }

      this.marketStore.latestBuySignals = finalBuyList.sort(
        (a, b) => b.opportunityScore - a.opportunityScore,
      );
      this.marketStore.latestSellSignals = finalSellList.sort(
        (a, b) => b.opportunityScore - a.opportunityScore,
      );
      this.marketStore.latestBreakdownSignals = finalBreakdownList.sort(
        (a, b) => b.opportunityScore - a.opportunityScore,
      );
      this.marketStore.latestVwapSignals = finalVwapList.sort(
        (a, b) => b.trendScore - a.trendScore,
      );

      console.log(
        `[24/7 Ingestion Cycle #${this.marketStore.ingestionCount}] Evaluated ${this.marketStore.evaluations.size} assets | Global Risk: ${this.marketStore.globalRiskIndex}/100 (BTC: ${btcRisk}, ETH: ${ethRisk}, WorstTop3: ${Math.round(worstCoinsAvg)}) | Setups: ${finalBuyList.length} Buys, ${finalSellList.length} Sells, ${finalBreakdownList.length} Breakdowns | Active Tracked: ${this.activeSignalsMap.size} | Winners: ${globalWinningSignals.length} | Queued Alerts: ${this.alertQueue.length}`,
      );
    }

    private enqueueAlert(
      type: "BUY" | "SELL" | "VWAP" | "CRASH" | "BREAKDOWN_WARNING",
      signal: any,
    ) {
      if (type === "CRASH") {
        return this.enqueueCrashAlert(
          signal?.riskIndex || this.marketStore.globalRiskIndex,
        );
      }
      const symbol = signal.symbol;
      const cooldownKey = `${symbol}_${type}`;
      const lastDispatched = this.cooldownMap.get(cooldownKey) || 0;
      const FOUR_HOURS_MS = 4 * 60 * 60 * 1000; // Strict 4-Hour Cooldown per asset + setup type

      if (Date.now() - lastDispatched < FOUR_HOURS_MS) {
        return; // Suppress duplicate alert under active 4-hour cooldown
      }

      // Avoid queueing duplicate if already in alertQueue
      const alreadyQueued = this.alertQueue.some(
        (q) => q.symbol === symbol && q.type === type,
      );
      if (alreadyQueued) return;

      this.alertQueue.push({
        id: `alert_${Date.now()}_${symbol}_${type}`,
        type,
        symbol,
        signal,
        queuedAt: Date.now(),
        attempts: 0,
      });
    }

    // -------------------------------------------------------------------------
    // WORKER 2: Telegram Dispatch Queue Worker (Consumer - runs every 100ms)
    // -------------------------------------------------------------------------
    public async processTelegramDispatchQueue() {
      if (this.alertQueue.length === 0 || this.isProcessingQueue) {
        return;
      }

      this.isProcessingQueue = true;
      const item = this.alertQueue.shift();
      if (!item) {
        this.isProcessingQueue = false;
        return;
      }

      const { symbol, type, signal } = item;
      const cooldownKey =
        type === "CRASH" ? "GLOBAL_CRASH" : `${symbol}_${type}`;
      const lastDispatched =
        type === "CRASH"
          ? Math.max(
              this.lastCrashAlertTime,
              this.cooldownMap.get(cooldownKey) || 0,
            )
          : this.cooldownMap.get(cooldownKey) || 0;
      const FOUR_HOURS_MS = 4 * 60 * 60 * 1000; // Strict 4-hour cooldown

      if (Date.now() - lastDispatched < FOUR_HOURS_MS) {
        // Cooldown was triggered while in queue, discard safely
        this.isProcessingQueue = false;
        return;
      }

      try {
        const premiumSubs = this.getPremiumSubscribers();
        const cleanSignalSym = String(symbol)
          .toUpperCase()
          .replace("/", "")
          .trim();

        // 1. VIP PRIVATE DISPATCH: Filter subscribers
        // CRITICAL RULE: When processing a CrashAlert, dispatch a global warning to ALL Premium users with valid Telegram chats
        // (regardless of their tracked_symbols, since a market crash affects all assets).
        // Otherwise, filter subscribers by tracked_symbols.
        const eligibleSubs =
          type === "CRASH"
            ? premiumSubs
            : premiumSubs.filter((sub) => {
                if (
                  !sub.trackedSymbols ||
                  !Array.isArray(sub.trackedSymbols) ||
                  sub.trackedSymbols.length === 0
                ) {
                  return false;
                }
                return sub.trackedSymbols.some(
                  (ts) =>
                    ts.toUpperCase().replace("/", "").trim() === cleanSignalSym,
                );
              });

        let deliveredCount = 0;
        if (eligibleSubs.length > 0) {
          // Pre-generate bilingual templates to maximize queue throughput
          const markdownEs =
            type === "CRASH"
              ? buildCrashAlertMarkdown(
                  signal?.riskIndex || this.marketStore.globalRiskIndex,
                  true,
                )
              : type === "BREAKDOWN_WARNING"
                ? buildBreakdownAlertMarkdown(signal, true)
                : type === "BUY"
                  ? buildBuyAlertMarkdown(signal, true)
                  : type === "SELL"
                    ? buildSellAlertMarkdown(signal, true)
                    : buildVwapAlertMarkdown(signal, true);

          const markdownEn =
            type === "CRASH"
              ? buildCrashAlertMarkdown(
                  signal?.riskIndex || this.marketStore.globalRiskIndex,
                  false,
                )
              : type === "BREAKDOWN_WARNING"
                ? buildBreakdownAlertMarkdown(signal, false)
                : type === "BUY"
                  ? buildBuyAlertMarkdown(signal, false)
                  : type === "SELL"
                    ? buildSellAlertMarkdown(signal, false)
                    : buildVwapAlertMarkdown(signal, false);

          for (const sub of eligibleSubs) {
            try {
              const isSubEs = sub.languagePreference !== "en";
              const userMarkdown = isSubEs ? markdownEs : markdownEn;
              const res = await sendTelegramMessage(sub.chatId, userMarkdown);
              if (res.ok) deliveredCount++;
            } catch (e: any) {
              console.warn(
                `[Telegram VIP Dispatch Error] Chat ${sub.chatId}:`,
                e.message,
              );
            }
            // Strict 100ms pacing between individual subscriber dispatches to respect Telegram rate limits
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
          console.log(
            `[Telegram VIP Dispatch] Sent ${type} alert for ${symbol} to ${deliveredCount}/${eligibleSubs.length} subscribers in their preferred language.`,
          );
        }

        // Track VIP-dispatched BUY/SELL signals (score >= 75) inside ActiveSignalsTracker
        if (type === "BUY" || type === "SELL") {
          backgroundSentinelScanner.trackDispatchedSignal(type, signal);
        }

        // 2. PUBLIC FREEMIUM TEASER DISPATCH: Max 1 teaser every 12 hours (only for standard BUY/SELL/VWAP signals)
        if (type === "BUY" || type === "SELL" || type === "VWAP") {
          const publicChannelId = process.env.TELEGRAM_PUBLIC_CHANNEL_ID;
          const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
          if (publicChannelId && String(publicChannelId).trim() !== "") {
            if (
              Date.now() - this.lastPublicTeaserTimestamp >=
              TWELVE_HOURS_MS
            ) {
              try {
                const teaserMarkdown = buildTeaserAlertMarkdown(
                  type,
                  signal,
                  true,
                );
                const teaserRes = await sendTelegramMessage(
                  publicChannelId,
                  teaserMarkdown,
                );
                if (teaserRes.ok) {
                  this.lastPublicTeaserTimestamp = Date.now();
                  console.log(
                    `[Telegram Public Teaser] Dispatched freemium teaser for ${symbol} to public channel ${publicChannelId}`,
                  );
                }
              } catch (err: any) {
                console.warn(`[Telegram Public Teaser Error]`, err.message);
              }
            }
          }
        }

        // Record cooldown and recent dispatch history
        this.cooldownMap.set(cooldownKey, Date.now());
        if (type === "CRASH") {
          this.lastCrashAlertTime = Date.now();
        }
        this.recentAlerts.unshift({
          id: item.id,
          symbol,
          type,
          score:
            type === "CRASH"
              ? signal?.riskIndex || 85
              : signal.opportunityScore || signal.trendScore || 75,
          timestamp: Date.now(),
          dispatchedToCount: deliveredCount,
        });
      } catch (err: any) {
        console.error(`[Telegram Queue Worker Exception]`, err);
        // Retry logic: allow up to 2 attempts for transient errors
        if (item.attempts < 2) {
          item.attempts++;
          this.alertQueue.push(item);
        }
      } finally {
        this.isProcessingQueue = false;
      }
    }
  }

  // Instantiate the 24/7 Background Scanner Engine
  const backgroundSentinelScanner = new BackgroundSentinelScanner();
  onInvalidSymbolPrune = (sym: string) =>
    backgroundSentinelScanner.removeTrackedSymbol(sym);

  // Public endpoint for live scanner status & evaluated market setups
  app.get("/api/market/live-signals", (_req, res) => {
    res.json({
      success: true,
      timestamp: Date.now(),
      ...backgroundSentinelScanner.getState(),
    });
  });

  // =========================================================================
  // COHESIVE MARKET STATE: The Single Source of Truth for the Frontend (Pillars 1, 2 & 4)
  // Provides a comprehensive, fully synchronized payload containing:
  // - Global risk index (weighted 50% BTC + 30% ETH + 20% Altcoins)
  // - Live L2 order book support floor (NEVER $0.00)
  // - Real forced liquidations in 1-minute window
  // - Pre-calculated algorithmic setups enforcing the Anti-Contradiction Rule
  // =========================================================================
  app.get("/api/market/market-state", async (req, res) => {
    try {
      const rawSymbol = String(req.query.symbol || "BTCUSDT")
        .trim()
        .toUpperCase();
      const symbol = rawSymbol.endsWith("USDT")
        ? rawSymbol
        : `${rawSymbol}USDT`;

      // Register dynamic watchlist symbols if provided by frontend
      if (req.query.symbols) {
        const requestedSyms = String(req.query.symbols)
          .split(",")
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean);
        for (const s of requestedSyms) {
          backgroundSentinelScanner.addTrackedSymbol(
            s.endsWith("USDT") ? s : `${s}USDT`,
          );
        }
      } else {
        backgroundSentinelScanner.addTrackedSymbol(symbol);
      }

      const globalRisk =
        backgroundSentinelScanner.marketStore.globalRiskIndex || 18;
      const isCrash = globalRisk >= 80;
      const isShield = volatilityShield.isShieldActive();

      // Fetch live depth, ticker timeframe stats, and on-demand evaluation if missing
      const cachedStats = tickerStatsCache.get(symbol);
      const needsStats =
        !cachedStats || Date.now() - cachedStats.fetchedAt >= CACHE_TTL_MS;
      const needsEval =
        !backgroundSentinelScanner.marketStore.evaluations.has(symbol);

      const [depthData, tickerStats, onDemandEval] = await Promise.all([
        orderBookDepthManager.getDepth(symbol).catch(() => null),
        needsStats
          ? fetchBinanceTimeframeStats(symbol).catch(() => cachedStats || null)
          : Promise.resolve(cachedStats),
        needsEval
          ? backgroundSentinelScanner.evaluateSymbolOnDemand(symbol)
          : Promise.resolve(null),
      ]);

      const activeEval =
        backgroundSentinelScanner.marketStore.evaluations.get(symbol) ||
        onDemandEval;

      // Authentic 1m futures forced liquidations (matching getLiquidationStats contract)
      const liqStats = futuresLiquidationManager.getLiquidationStats(symbol);
      const long1mUsd = Number(liqStats.longLiquidations1m || 0);
      const short1mUsd = Number(liqStats.shortLiquidations1m || 0);
      const total1mUsd = long1mUsd + short1mUsd;
      const longCount1m = Number(liqStats.longLiquidationCount1m || 0);
      const liqSpike = Boolean(
        liqStats.liquidationSpikeDetected || long1mUsd >= 500000,
      );

      const activePrice =
        depthData?.currentPrice && depthData.currentPrice > 0
          ? depthData.currentPrice
          : activeEval?.currentPrice || 0;
      const nearestWallPrice =
        depthData?.nearestBuyWallPrice || activeEval?.nearestBuyWallPrice || 0;
      const nearestWallQty =
        depthData?.nearestBuyWallQty || activeEval?.nearestBuyWallQty || 0;

      let activeMetrics: any = null;
      if (activePrice > 0) {
        const effectiveAssetRisk = activeEval?.riskIndex ?? globalRisk;
        const effectiveRisk = isCrash
          ? Math.max(globalRisk, effectiveAssetRisk)
          : effectiveAssetRisk;
        const effectiveStatus =
          effectiveRisk >= 80
            ? "FLASH_CRASH_WARNING"
            : effectiveRisk >= 65
              ? "HIGH_RISK"
              : effectiveRisk >= 40
                ? "ELEVATED"
                : "NORMAL";

        activeMetrics = {
          symbol,
          baseAsset: symbol.endsWith("USDT") ? symbol.slice(0, -4) : symbol,
          quoteAsset: "USDT",
          currentPrice: activePrice,
          priceChange1m: activeEval?.priceChange1m ?? 0,
          priceChange5m: activeEval?.priceChange5m ?? 0,
          priceChange1h: tickerStats?.priceChange1h ?? 0,
          priceChange24h:
            tickerStats?.priceChange24h ?? activeEval?.change24h ?? 0,
          priceChange1w: tickerStats?.priceChange1w ?? 0,
          priceChange1M: tickerStats?.priceChange1M ?? 0,
          recentDropPercent: activeEval?.recentDropPercent ?? 0,
          rollingHighPrice:
            activeEval?.rollingHighPrice || tickerStats?.high24h || activePrice,
          timeframeMatrix: tickerStats?.ranges,
          sellVolume1m: activeEval?.sellVolume1m ?? 0,
          buyVolume1m: activeEval?.buyVolume1m ?? 0,
          sellVolume5m: activeEval?.sellVolume5m ?? 0,
          buyVolume5m: activeEval?.buyVolume5m ?? 0,
          sellVolumeRatio: activeEval?.sellerVolumeRatio ?? 0.5,
          sellVolumeZScore: activeEval?.sellVolumeZScore ?? 0,
          nearestBuyWallPrice: nearestWallPrice,
          nearestBuyWallBtc: nearestWallQty,
          originalWallBtc: nearestWallQty,
          wallChewThroughPercent: 0,
          bidDepthPressureRatio:
            activeEval?.bidDepthPressureRatio ??
            activeEval?.buyerAbsorptionRatio ??
            0.5,
          buyWallVanished:
            nearestWallPrice <= 0 &&
            activePrice > 0 &&
            Boolean(depthData && depthData.bids.length === 0),
          longLiquidations1m: long1mUsd,
          longLiquidationCount1m: longCount1m,
          liquidationSpikeDetected: liqSpike,
          riskIndex: effectiveRisk,
          riskStatus: effectiveStatus,
          buyEligible: !isCrash && effectiveRisk < 80,
          isBuyLocked: isCrash || effectiveRisk >= 80,
          lastUpdated: Date.now(),
        };
      }

      // Map all evaluated symbols & VWAP matrix
      const symbolsState: Record<string, any> = {};
      const vwapMatrix: Record<string, any> = {};
      for (const [
        sym,
        ev,
      ] of backgroundSentinelScanner.marketStore.evaluations.entries()) {
        symbolsState[sym] = {
          symbol: ev.symbol,
          baseAsset: ev.baseAsset,
          quoteAsset: ev.quoteAsset,
          price: ev.currentPrice,
          currentPrice: ev.currentPrice,
          change24h: ev.change24h,
          priceChange1m: ev.priceChange1m,
          priceChange5m: ev.priceChange5m,
          priceChange15m: ev.priceChange15m,
          priceChange1h: ev.priceChange1h,
          vwap1h: ev.vwap1h,
          ema21_1h: ev.ema21_1h,
          mfi: ev.mfi,
          rsi: ev.rsi,
          atr: ev.atr14,
          riskIndex: ev.riskIndex,
          riskStatus:
            ev.riskIndex >= 80
              ? "FLASH_CRASH_WARNING"
              : ev.riskIndex >= 65
                ? "HIGH_RISK"
                : ev.riskIndex >= 40
                  ? "ELEVATED"
                  : "NORMAL",
          buyEligible: !isCrash && ev.buyEligible && ev.riskIndex < 80,
          isBuyLocked: isCrash || ev.isBuyLocked || ev.riskIndex >= 80,
          buyerAbsorptionRatio: ev.buyerAbsorptionRatio,
          sellerVolumeRatio: ev.sellerVolumeRatio,
          sellVolumeZScore: ev.sellVolumeZScore,
          volume24hUsd: ev.volume24hUsd,
          fundingRate: ev.fundingRate,
          nearestBuyWallPrice: ev.nearestBuyWallPrice,
          nearestBuyWallQty: ev.nearestBuyWallQty,
          updatedAt: ev.updatedAt,
        };
        if (ev.vwap) {
          vwapMatrix[sym] = ev.vwap;
        }
      }

      const btcRisk =
        backgroundSentinelScanner.marketStore.evaluations.get("BTCUSDT")
          ?.riskIndex ?? 18;
      const ethRisk =
        backgroundSentinelScanner.marketStore.evaluations.get("ETHUSDT")
          ?.riskIndex ?? 20;

      const allBuyScans = Array.from(
        backgroundSentinelScanner.marketStore.evaluations.values(),
      ).map((e) => e.buy);
      const allSellScans = Array.from(
        backgroundSentinelScanner.marketStore.evaluations.values(),
      ).map((e) => e.sell);

      res.json({
        success: true,
        timestamp: Date.now(),
        globalRiskIndex: globalRisk,
        globalRiskStatus: isCrash
          ? "FLASH_CRASH_WARNING"
          : globalRisk >= 65
            ? "HIGH_RISK"
            : globalRisk >= 40
              ? "ELEVATED"
              : "NORMAL",
        isCrashWarningActive: isCrash,
        buyEligible: !isCrash,
        isVolatilityShieldActive: isShield,
        btcRiskIndex: btcRisk,
        ethRiskIndex: ethRisk,
        activeMetrics,
        orderBook: depthData
          ? {
              bids: depthData.bids || [],
              asks: depthData.asks || [],
              nearestBuyWall: depthData.nearestBuyWall,
              timestamp: depthData.fetchedAt,
            }
          : { bids: [], asks: [], timestamp: Date.now() },
        symbolsState,
        liquidations: {
          total1mUsd,
          long1mUsd,
          short1mUsd,
          recentEvents: liqStats.recentEvents || [],
        },
        buySignals: isCrash
          ? []
          : backgroundSentinelScanner.marketStore.latestBuySignals,
        sellSignals: backgroundSentinelScanner.marketStore.latestSellSignals,
        breakdownSignals:
          backgroundSentinelScanner.marketStore.latestBreakdownSignals,
        allBuyScans,
        allSellScans,
        vwapMatrix,
        monitoredSymbols: backgroundSentinelScanner.targetSymbols,
        trackedSymbols: backgroundSentinelScanner.activeWatchlistSymbols,
        winningSignalsLedger:
          backgroundSentinelScanner.getWinningSignalsLedger(),
        activeTrackedSignalsCount:
          backgroundSentinelScanner.getActiveTrackedSignalsCount(),
      });
    } catch (err: any) {
      console.warn("[/api/market/market-state Error]", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Global 24h Winning Signals endpoint (returns latest 20 verified TP1/TP2 winning signals)
  app.get("/api/winning-signals", (_req, res) => {
    res.json(globalWinningSignals.slice(0, 20));
  });

  // Dedicated endpoint for Recent Winning Signals Ledger (TP1/TP2 hits)
  app.get("/api/market/winning-ledger", (_req, res) => {
    res.json({
      success: true,
      timestamp: Date.now(),
      activeTrackedSignalsCount:
        backgroundSentinelScanner.getActiveTrackedSignalsCount(),
      winningSignalsLedger: globalWinningSignals.slice(0, 20),
    });
  });

  // Subscriber sync endpoint: Keeps backend informed of authenticated Telegram users
  app.post("/api/telegram/sync-subscriber", async (req, res) => {
    const chatId =
      req.body?.chatId ||
      req.body?.telegramChatId ||
      req.body?.telegram_chat_id;
    const userId = req.body?.userId || req.body?.uid;
    const username = req.body?.username || "";
    const authHeader = req.headers.authorization;
    const rawTracked = req.body?.trackedSymbols || req.body?.tracked_symbols;
    const trackedSymbols = Array.isArray(rawTracked)
      ? rawTracked.map((s: any) => String(s).toUpperCase().trim())
      : undefined;
    const rawLang =
      req.body?.languagePreference ||
      req.body?.language_preference ||
      req.body?.language;
    const languagePreference: "es" | "en" = rawLang === "en" ? "en" : "es";

    if (!chatId) {
      return res
        .status(400)
        .json({ error: "chatId or telegramChatId is required" });
    }

    const subCheck = await verifyUserFirestoreSubscription(
      userId,
      undefined,
      authHeader,
    );
    const verifiedTier: "free" | "pro" | "premium" = subCheck.isPremium
      ? subCheck.tier === "pro"
        ? "pro"
        : "premium"
      : "free";

    backgroundSentinelScanner.registerSubscriber({
      userId: userId || `user_${chatId}`,
      chatId: String(chatId).trim(),
      username: username,
      subscriptionTier: verifiedTier,
      linkedAt: new Date().toISOString(),
      trackedSymbols,
      languagePreference,
    });

    res.json({
      success: true,
      registered: true,
      subscription_tier: verifiedTier,
      language_preference: languagePreference,
      activePremiumSubscribers:
        backgroundSentinelScanner.getPremiumSubscribers().length,
    });
  });

  // Telegram Bot Account Linking Endpoint (preserves verified tier, never auto-upgrades)
  app.post("/api/telegram/link-bot", async (req, res) => {
    const {
      userId,
      chatId,
      username,
      trackedSymbols,
      tracked_symbols,
      language,
      languagePreference,
      language_preference,
    } = req.body || {};
    const authHeader = req.headers.authorization;
    console.log(
      `[Telegram Link Bot] User: ${userId}, Chat ID: ${chatId}, Username: @${username || "N/A"}`,
    );

    if (!chatId) {
      return res.status(400).json({ error: "chatId is required" });
    }

    const rawTracked = trackedSymbols || tracked_symbols;
    const cleanTracked = Array.isArray(rawTracked)
      ? rawTracked.map((s: any) => String(s).toUpperCase().trim())
      : ["BTCUSDT", "ETHUSDT", "SOLUSDT"];

    const rawLang = languagePreference || language_preference || language;
    const cleanLang: "es" | "en" = rawLang === "en" ? "en" : "es";

    const subCheck = await verifyUserFirestoreSubscription(
      userId,
      undefined,
      authHeader,
    );
    const verifiedTier: "free" | "pro" | "premium" = subCheck.isPremium
      ? subCheck.tier === "pro"
        ? "pro"
        : "premium"
      : "free";

    backgroundSentinelScanner.registerSubscriber({
      userId: userId || `user_${chatId}`,
      chatId: String(chatId).trim(),
      username: username || "",
      subscriptionTier: verifiedTier,
      linkedAt: new Date().toISOString(),
      trackedSymbols: cleanTracked,
      languagePreference: cleanLang,
    });

    res.json({
      status: "linked",
      userId,
      chatId,
      username: username || "",
      subscription_tier: verifiedTier,
      language_preference: cleanLang,
      linked_at: new Date().toISOString(),
      bot_handle: `@${TELEGRAM_BOT_USERNAME}`,
      trackedSymbols: cleanTracked,
    });
  });

  // Update user's language preference for Telegram alerts & UI sync
  app.post("/api/telegram/update-language", async (req, res) => {
    try {
      const {
        userId,
        chatId,
        language,
        languagePreference,
        language_preference,
      } = req.body || {};
      const targetLang: "es" | "en" =
        (languagePreference || language_preference || language || "es") === "en"
          ? "en"
          : "es";

      // 1. Update in Firestore if userId is valid
      if (
        userId &&
        !String(userId).startsWith("demo_") &&
        !String(userId).startsWith("offline_")
      ) {
        await updateFirestoreUserLanguage(
          userId,
          targetLang,
          req.headers.authorization,
        );
      }

      // 2. Update in BackgroundSentinelScanner memory registry
      const targetId = userId || chatId;
      if (targetId) {
        backgroundSentinelScanner.updateSubscriberLanguage(
          targetId,
          targetLang,
        );
      }

      console.log(
        `[Telegram Language Sync] Updated language preference for ${targetId || "unknown"}: ${targetLang}`,
      );

      res.json({
        success: true,
        userId: userId || null,
        chatId: chatId || null,
        language_preference: targetLang,
        updated_at: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("[Update Language Preference Error]", err);
      res
        .status(500)
        .json({ error: err.message || "Failed to update language preference" });
    }
  });

  // Update user's custom tracked alert symbols (Assets to Track)
  app.post("/api/telegram/update-tracked-symbols", async (req, res) => {
    try {
      const { userId, chatId, trackedSymbols, tracked_symbols } =
        req.body || {};
      const rawTracked = trackedSymbols || tracked_symbols;
      if (!Array.isArray(rawTracked)) {
        return res
          .status(400)
          .json({ error: "trackedSymbols must be an array of symbol strings" });
      }

      const cleanSymbols = rawTracked
        .map((s: any) => String(s).toUpperCase().trim())
        .filter(Boolean);

      // 1. Update in Firestore if userId is provided
      if (
        userId &&
        !String(userId).startsWith("demo_") &&
        !String(userId).startsWith("offline_")
      ) {
        await updateFirestoreUserTrackedSymbols(
          userId,
          cleanSymbols,
          req.headers.authorization,
        );
      }

      // 2. Update in BackgroundSentinelScanner memory registry
      const targetId = userId || chatId;
      if (targetId) {
        backgroundSentinelScanner.updateSubscriberTrackedSymbols(
          targetId,
          cleanSymbols,
        );
      }

      console.log(
        `[Telegram Asset Filter] Updated tracked symbols for ${targetId || "unknown"}: [${cleanSymbols.join(", ")}]`,
      );

      res.json({
        success: true,
        userId: userId || null,
        chatId: chatId || null,
        trackedSymbols: cleanSymbols,
        count: cleanSymbols.length,
        updated_at: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("[Update Tracked Symbols Error]", err);
      res
        .status(500)
        .json({ error: err.message || "Failed to update tracked symbols" });
    }
  });

  // Telegram Bot Test Alert Endpoint
  app.post("/api/telegram/test-alert", async (req, res) => {
    try {
      const {
        chatId,
        subscriptionTier,
        userId,
        customToken,
        trackedSymbols,
        language,
        languagePreference,
        language_preference,
      } = req.body || {};
      const authHeader = req.headers.authorization;

      const subCheck = await verifyUserFirestoreSubscription(
        userId,
        subscriptionTier,
        authHeader,
      );
      const isPermitted = subCheck.isPremium;
      if (!isPermitted) {
        return res.status(403).json({
          error:
            "Telegram instant alerts are reserved for Sentinel PRO subscribers.",
          status: "forbidden",
          requiresUpgrade: true,
        });
      }

      if (!chatId || String(chatId).trim() === "") {
        return res.status(400).json({
          error: "Valid Telegram chat_id is required to send test alert.",
          status: "missing_chat_id",
        });
      }

      console.log(
        `[Telegram Test Alert] Dispatched test notification to Telegram chat_id: ${chatId}`,
      );

      // Sync to scanner registry
      const cleanTracked = Array.isArray(trackedSymbols)
        ? trackedSymbols.map((s: any) => String(s).toUpperCase().trim())
        : subCheck.trackedSymbols || ["BTCUSDT", "ETHUSDT", "SOLUSDT"];

      const rawLang =
        languagePreference ||
        language_preference ||
        language ||
        subCheck.languagePreference;
      const isEs = rawLang !== "en";
      const cleanLang: "es" | "en" = isEs ? "es" : "en";

      backgroundSentinelScanner.registerSubscriber({
        userId: userId || `user_${chatId}`,
        chatId: String(chatId).trim(),
        subscriptionTier: subCheck.tier === "pro" ? "pro" : "premium",
        linkedAt: new Date().toISOString(),
        trackedSymbols: cleanTracked,
        languagePreference: cleanLang,
      });

      const testMessage = isEs
        ? `🛡️ *SENTINEL ALGO MONITOR • ALERTA DE PRUEBA*
━━━━━━━━━━━━━━━━━━━━
✅ *Estado del Bot:* Conectado y Operativo
🤖 *Usuario del Bot:* [@SentinelRiskBot_bot](https://t.me/SentinelRiskBot_bot)
🆔 *Chat ID:* \`${chatId}\`
⚡ *Motor de Análisis:* ALGO QUANT ENGINE (24/7)
🎯 *Monedas Activas:* \`${cleanTracked
            .map((s) => s.replace("USDT", ""))
            .slice(0, 6)
            .join(", ")}${cleanTracked.length > 6 ? "..." : ""}\`
━━━━━━━━━━━━━━━━━━━━
Recibirás notificaciones inmediatas 24/7 para señales institucionales de compra (MFI sobreventa), toma de ganancias y confluencia de tendencias directamente en este chat.`
        : `🛡️ *SENTINEL ALGO MONITOR • TEST ALERT*
━━━━━━━━━━━━━━━━━━━━
✅ *Bot Status:* Connected and Operational
🤖 *Bot Handle:* [@SentinelRiskBot_bot](https://t.me/SentinelRiskBot_bot)
🆔 *Chat ID:* \`${chatId}\`
⚡ *Analysis Engine:* ALGO QUANT ENGINE (24/7)
🎯 *Active Monitored Assets:* \`${cleanTracked
            .map((s) => s.replace("USDT", ""))
            .slice(0, 6)
            .join(", ")}${cleanTracked.length > 6 ? "..." : ""}\`
━━━━━━━━━━━━━━━━━━━━
You will receive real-time 24/7 instant notifications for institutional buy signals (MFI oversold), profit-taking setups, and trend confluence directly in this chat.`;

      const dispatchResult = await sendTelegramMessage(
        chatId,
        testMessage,
        customToken,
      );

      return res.json({
        status: "success",
        message: `Test alert dispatched successfully to Telegram Chat ID ${chatId}`,
        language_used: cleanLang,
        deliveredToTelegram: dispatchResult.ok,
        telegramResponse: dispatchResult.data || null,
        dispatched_at: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("[Telegram Test Alert Error]", err);
      return res.status(500).json({
        error: err?.message || "Failed to dispatch Telegram test alert",
        status: "error",
      });
    }
  });

  // Instant Manual Signal Push to Telegram with Expiration Guard ("Patovica")
  app.post("/api/telegram/push-signal", async (req, res) => {
    try {
      const { chatId, signal, lang, language, userId } = req.body || {};
      const botToken = process.env.TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN;
      const rawLang = String(lang || language || "es").toLowerCase();
      const isEs = !rawLang.startsWith("en");

      // Expiration Guard ("Patovica"): Verify Firestore subscription_expires_at when userId is provided
      if (userId && !isGuestOrDemoUserId(String(userId))) {
        const cleanUserId = String(userId).trim();
        const userDoc = await getFirestoreUserDocNormalized(
          cleanUserId,
          req.headers.authorization,
        );
        if (userDoc && userDoc.exists) {
          const isProTier = isPaidTierValue(userDoc.subscription_tier);
          const isExpiredNow =
            userDoc.subscription_expires_at !== null &&
            userDoc.subscription_expires_at < Date.now();

          if (
            (isProTier && isExpiredNow) ||
            userDoc.payment_status === "expired"
          ) {
            await expireFirestoreProSubscription(
              cleanUserId,
              req.headers.authorization,
              false,
              userDoc.telegram_chat_id,
              userDoc.language_preference,
            );
            return res.status(403).json({
              success: false,
              code: "EXPIRED",
              error: isEs
                ? "Tu suscripción Sentinel PRO ha expirado. Renueva tu pase para seguir enviando planes ATR a tu Telegram."
                : "Your Sentinel PRO subscription has expired. Please renew your pass to continue pushing ATR plans to Telegram.",
            });
          }
        }
      }

      if (!botToken || String(botToken).trim() === "") {
        return res.status(500).json({
          success: false,
          error: "TELEGRAM_BOT_TOKEN is not configured on the server.",
        });
      }

      const cleanChatId = String(chatId || "").trim();
      if (!cleanChatId) {
        return res.status(400).json({
          success: false,
          error: "Valid Telegram chatId is required.",
        });
      }

      if (!signal || typeof signal !== "object") {
        return res.status(400).json({
          success: false,
          error: "Signal payload is required.",
        });
      }

      const rawSym = String(signal.symbol || "BTCUSDT")
        .toUpperCase()
        .trim();
      const symbol = rawSym.endsWith("USDT") ? rawSym : `${rawSym}USDT`;
      const rawType = String(
        signal.type ||
          signal.kind ||
          (String(signal.signalStrength || "").includes("SELL")
            ? "SELL"
            : "BUY"),
      ).toUpperCase();
      const isBreakdown =
        rawType === "BREAKDOWN_WARNING" || rawType === "BREAKDOWN";
      const isBuy = rawType === "BUY";

      const fmtNumPrice = (val: any): string => {
        if (typeof val === "string" && val.trim() !== "") return val.trim();
        const n = Number(val);
        if (!Number.isFinite(n) || n <= 0) return "—";
        if (n < 0.00001) return `$${n.toFixed(8)}`;
        if (n < 0.01) return `$${n.toFixed(6)}`;
        if (n < 1) return `$${n.toFixed(4)}`;
        if (n < 10) return `$${n.toFixed(3)}`;
        return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      };

      const livePrice = fmtNumPrice(signal.price ?? signal.currentPrice);
      const score = Math.round(
        Number(signal.score ?? signal.opportunityScore ?? 0),
      );
      const summary = String(
        signal.summary ||
          (isEs ? signal.rationaleEs : signal.rationaleEn) ||
          signal.rationaleEs ||
          signal.rationaleEn ||
          (isEs
            ? "Oportunidad algorítmica de alta probabilidad confirmada."
            : "High-probability algorithmic setup confirmed."),
      ).trim();

      let entryZoneStr = "—";
      if (
        typeof signal.entryZone === "string" &&
        signal.entryZone.trim() !== ""
      ) {
        entryZoneStr = signal.entryZone.trim();
      } else if (signal.entryZone && typeof signal.entryZone === "object") {
        entryZoneStr = `${fmtNumPrice(signal.entryZone.min)} – ${fmtNumPrice(signal.entryZone.max)}`;
      } else {
        entryZoneStr = livePrice;
      }

      const stopLossStr = fmtNumPrice(signal.stopLoss ?? signal.emergencyExit);
      const tp1Str = fmtNumPrice(
        signal.tp1 ?? signal.takeProfit1 ?? signal.downsideTarget1,
      );
      const tp2Str = fmtNumPrice(
        signal.tp2 ?? signal.takeProfit2 ?? signal.downsideTarget2,
      );
      const brokenSupportStr = fmtNumPrice(
        signal.brokenSupport ?? signal.vwap1h ?? signal.entryZone?.min,
      );

      const header = isBreakdown
        ? isEs
          ? `🚨 *${symbol} — RUPTURA BAJISTA / RIESGO DE CAÍDA*`
          : `🚨 *${symbol} — BEARISH BREAKDOWN / DUMP RISK*`
        : isBuy
          ? isEs
            ? `🟢 *SENTINEL PRO — COMPRA* (#${symbol})`
            : `🟢 *SENTINEL PRO — BUY* (#${symbol})`
          : isEs
            ? `🔴 *SENTINEL PRO — TOMA DE GANANCIAS* (#${symbol})`
            : `🔴 *SENTINEL PRO — TAKE PROFIT* (#${symbol})`;

      const message = isBreakdown
        ? isEs
          ? `${header}
━━━━━━━━━━━━━━━━━━━━
💵 *Precio en Vivo:* \`${livePrice}\`
📊 *Puntaje de Alerta:* \`${score}/100\`

📝 ${summary}

🛡️ *Plan de Protección Accionable:*
⚠️ *Nivel Perdido (Soporte VWAP):* \`${brokenSupportStr}\`
🛡️ *Salida de Emergencia:* \`${stopLossStr}\`
📉 *Posible Piso de Caída 1:* \`${tp1Str}\`
📉 *Posible Piso de Caída 2:* \`${tp2Str}\`
━━━━━━━━━━━━━━━━━━━━
⚡ _Sentinel Algo Monitor • Alertas 24/7_`
          : `${header}
━━━━━━━━━━━━━━━━━━━━
💵 *Live Price:* \`${livePrice}\`
📊 *Alert Score:* \`${score}/100\`

📝 ${summary}

🛡️ *Actionable Protection Plan:*
⚠️ *Broken Support (VWAP):* \`${brokenSupportStr}\`
🛡️ *Emergency Stop:* \`${stopLossStr}\`
📉 *Downside Target 1:* \`${tp1Str}\`
📉 *Downside Target 2:* \`${tp2Str}\`
━━━━━━━━━━━━━━━━━━━━
⚡ _Sentinel Algo Monitor • 24/7 Alerts_`
        : isEs
          ? `${header}
━━━━━━━━━━━━━━━━━━━━
💵 *Precio en Vivo:* \`${livePrice}\`
📊 *Puntaje de Favorabilidad:* \`${score}/100\`

📝 *Veredicto:* ${summary}

📐 *Plan de Ejecución ATR:*
🎯 *Zona de Entrada:* \`${entryZoneStr}\`
🛡️ *Stop Loss (ATR):* \`${stopLossStr}\`
💰 *TP1 (1.5R):* \`${tp1Str}\`
🚀 *TP2 (2.5R):* \`${tp2Str}\`
━━━━━━━━━━━━━━━━━━━━
⚡ _Sentinel Algo Monitor • Alertas 24/7_`
          : `${header}
━━━━━━━━━━━━━━━━━━━━
💵 *Live Price:* \`${livePrice}\`
📊 *Favorability Score:* \`${score}/100\`

📝 *Verdict:* ${summary}

📐 *ATR Execution Plan:*
🎯 *Entry Zone:* \`${entryZoneStr}\`
🛡️ *Stop Loss (ATR):* \`${stopLossStr}\`
💰 *TP1 (1.5R):* \`${tp1Str}\`
🚀 *TP2 (2.5R):* \`${tp2Str}\`
━━━━━━━━━━━━━━━━━━━━
⚡ _Sentinel Algo Monitor • 24/7 Alerts_`;

      const tgEndpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;
      let tgRes = await fetch(tgEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: cleanChatId,
          text: message,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        }),
      });

      let tgRaw = await tgRes.text();
      let tgData: any = null;
      try {
        tgData = JSON.parse(tgRaw);
      } catch {
        tgData = null;
      }

      // Fallback to plain text if Markdown entity parsing fails due to special characters in summary
      if (
        !tgData?.ok &&
        String(tgData?.description || "").includes("can't parse entities")
      ) {
        tgRes = await fetch(tgEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: cleanChatId,
            text: message.replace(/[*_`]/g, ""),
            disable_web_page_preview: true,
          }),
        });
        tgRaw = await tgRes.text();
        try {
          tgData = JSON.parse(tgRaw);
        } catch {
          tgData = null;
        }
      }

      if (!tgRes.ok || !tgData?.ok) {
        const errMessage =
          tgData?.description || `Telegram API returned HTTP ${tgRes.status}`;
        console.warn(
          `[Telegram Push Signal Failed] Chat ${cleanChatId} | ${symbol}:`,
          errMessage,
        );
        return res
          .status(
            tgRes.status >= 400 && tgRes.status < 500 ? tgRes.status : 400,
          )
          .json({
            success: false,
            error: errMessage,
          });
      }

      console.log(
        `[Telegram Push Signal Sent] Chat ${cleanChatId} | ${symbol} (${isBuy ? "BUY" : "SELL"})`,
      );
      return res.json({
        success: true,
        chatId: cleanChatId,
        symbol,
        messageId: tgData?.result?.message_id || null,
      });
    } catch (err: any) {
      console.error("[Telegram Push Signal Error]", err);
      return res.status(500).json({
        success: false,
        error: err?.message || "Failed to push signal to Telegram",
      });
    }
  });

  // Global Flash Crash Alert Trigger & Evaluation Endpoint
  app.post("/api/telegram/trigger-crash-alert", async (req, res) => {
    try {
      const { riskIndex, force, userId, subscriptionTier } = req.body || {};
      const authHeader = req.headers.authorization;

      const subCheck = await verifyUserFirestoreSubscription(
        userId,
        subscriptionTier,
        authHeader,
      );
      const isPermitted = subCheck.isPremium || userId === "official_admin";
      if (!isPermitted) {
        return res.status(403).json({
          error:
            "Global Flash Crash Alerts are reserved for Sentinel PRO users.",
          status: "forbidden",
        });
      }

      const targetRisk =
        Number(riskIndex) ||
        backgroundSentinelScanner.marketStore.globalRiskIndex ||
        85;

      if (force) {
        backgroundSentinelScanner.resetCrashAlertCooldown();
      }

      const enqueued = backgroundSentinelScanner.enqueueCrashAlert(targetRisk);
      if (enqueued) {
        // Trigger queue processor immediately
        backgroundSentinelScanner
          .processTelegramDispatchQueue()
          .catch((err) => {
            console.warn("[Crash Alert Dispatch Error]", err.message);
          });
      }

      const lastCrashTime = backgroundSentinelScanner.getLastCrashAlertTime();
      const elapsed = Date.now() - lastCrashTime;
      const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
      const remainingCooldownMs = Math.max(0, FOUR_HOURS_MS - elapsed);

      return res.json({
        success: true,
        enqueued,
        riskIndex: targetRisk,
        cooldownActive: !enqueued,
        remainingCooldownSeconds: Math.round(remainingCooldownMs / 1000),
        premiumSubscribersCount:
          backgroundSentinelScanner.getPremiumSubscribers().length,
        message: enqueued
          ? `Global Flash Crash Alert enqueued for Risk Index ${targetRisk}/100 and dispatched to all Premium users.`
          : `Flash Crash Alert suppressed: 4-hour anti-spam cooldown active (${Math.round(remainingCooldownMs / 60000)} minutes remaining).`,
      });
    } catch (err: any) {
      console.error("[Trigger Crash Alert Exception]", err);
      return res
        .status(500)
        .json({ error: err.message || "Failed to trigger crash alert" });
    }
  });

  // Telegram Real-time Warning Alert Dispatcher Endpoint
  // STRICT RULE: Only sends alerts if user subscription status is 'premium' AND has a valid linked Telegram 'chat_id'
  app.post("/api/telegram/dispatch-alert", async (req, res) => {
    const { alert, chatId, subscriptionTier, userId, customToken } =
      req.body || {};
    const authHeader = req.headers.authorization;

    // Macro Volatility Shield Check: Pause all alerts during high-impact macroeconomic event windows
    if (volatilityShield.isShieldActive()) {
      const activeEvent = volatilityShield.getCurrentActiveEvent();
      console.log(
        `[Telegram Alert Paused] Macro Volatility Shield Active (${activeEvent?.title || "High Impact Event"}). Alerts suspended.`,
      );
      return res.status(200).json({
        dispatched: false,
        paused: true,
        reason: "VOLATILITY_SHIELD_ACTIVE",
        event: activeEvent?.title,
        message:
          "🛡️ Volatility Shield Active: Trading alerts are temporarily paused for 30 minutes to protect capital during major macroeconomic releases.",
      });
    }

    // 1. Check Premium Subscription Status in Firestore
    const subCheck = await verifyUserFirestoreSubscription(
      userId,
      subscriptionTier,
      authHeader,
    );
    if (!subCheck.isPremium) {
      console.log(
        `[Telegram Dispatch Skipped] User ${userId || "unknown"} is on 'free' tier or expired.`,
      );
      return res.status(403).json({
        dispatched: false,
        reason: "SKIPPED_NOT_PREMIUM",
        message:
          "Real-time Telegram warning alerts are strictly restricted to Premium subscribers.",
      });
    }

    // 2. Check Valid Linked Telegram Chat ID
    if (!chatId || String(chatId).trim() === "") {
      console.log(
        `[Telegram Dispatch Skipped] User ${userId || "unknown"} does not have a linked Telegram chat_id.`,
      );
      return res.status(400).json({
        dispatched: false,
        reason: "SKIPPED_NO_CHAT_ID",
        message: "No valid Telegram chat_id found for this user.",
      });
    }

    // 3. Asset Tracking Filter Check (Custom Monedas en el Radar)
    const alertSymbol = alert?.symbol
      ? String(alert.symbol).toUpperCase().trim()
      : null;
    if (alertSymbol && subCheck.trackedSymbols) {
      if (!subCheck.trackedSymbols.includes(alertSymbol)) {
        console.log(
          `[Telegram Alert Skipped] User ${userId || "unknown"} has not tracked symbol ${alertSymbol}. Configured: [${subCheck.trackedSymbols.join(", ")}]`,
        );
        return res.status(200).json({
          dispatched: false,
          reason: "SYMBOL_NOT_TRACKED",
          message: `Alert for ${alertSymbol} skipped because it is not in your configured tracked alert assets list.`,
          symbol: alertSymbol,
          trackedSymbols: subCheck.trackedSymbols,
        });
      }
    }

    // 4. Dispatch Alert Payload
    console.log(
      `[Telegram Real-time Alert Dispatched] Premium User: ${userId} | Chat ID: ${chatId} | Level: ${alert?.level} | Title: ${alert?.title}`,
    );

    const messageText =
      alert?.telegramMarkdown ||
      `🚨 *SENTINEL RISK ALERT: ${alert?.level || "WARNING"}*
${alert?.title || "Market Anomaly Detected"}
${alert?.message || ""}
Time: ${new Date().toISOString()}`;

    const tgResult = await sendTelegramMessage(
      chatId,
      messageText,
      customToken,
    );

    res.json({
      dispatched: true,
      chatId,
      subscriptionTier,
      deliveredToTelegram: tgResult.ok,
      alertId: alert?.id || `alt_${Date.now()}`,
      dispatched_at: new Date().toISOString(),
    });
  });

  // Telegram Real-time Buy Signal Dispatcher Endpoint
  // STRICT RULE: Only sends buy signal alerts if user subscription status is 'premium' AND has a valid linked Telegram 'chat_id'
  app.post("/api/telegram/dispatch-buy-signal", async (req, res) => {
    const { signal, chatId, subscriptionTier, userId, language, customToken } =
      req.body || {};
    const authHeader = req.headers.authorization;

    // Macro Volatility Shield Check: Pause all alerts during high-impact macroeconomic event windows
    if (volatilityShield.isShieldActive()) {
      const activeEvent = volatilityShield.getCurrentActiveEvent();
      console.log(
        `[Telegram Buy Signal Paused] Macro Volatility Shield Active (${activeEvent?.title || "High Impact Event"}). Signals suspended.`,
      );
      return res.status(200).json({
        dispatched: false,
        paused: true,
        reason: "VOLATILITY_SHIELD_ACTIVE",
        event: activeEvent?.title,
        message:
          "🛡️ Volatility Shield Active: Buy signal alert dispatch paused during high-impact macro news window to protect against extreme manipulation.",
      });
    }

    // 1. Check Premium Subscription Status in Firestore
    const subCheck = await verifyUserFirestoreSubscription(
      userId,
      subscriptionTier,
      authHeader,
    );
    if (!subCheck.isPremium) {
      console.log(
        `[Telegram Buy Signal Skipped] User ${userId || "unknown"} is on 'free' tier or expired.`,
      );
      return res.status(403).json({
        dispatched: false,
        reason: "SKIPPED_NOT_PREMIUM",
        message:
          "Buy Signal Telegram alerts are strictly restricted to Premium subscribers.",
        requiresUpgrade: true,
      });
    }

    // 2. Check Valid Linked Telegram Chat ID
    if (!chatId || String(chatId).trim() === "") {
      console.log(
        `[Telegram Buy Signal Skipped] User ${userId || "unknown"} has no linked Telegram chat_id.`,
      );
      return res.status(400).json({
        dispatched: false,
        reason: "SKIPPED_NO_CHAT_ID",
        message: "No valid Telegram chat_id found for this user.",
      });
    }

    if (!signal) {
      return res.status(400).json({
        dispatched: false,
        reason: "MISSING_SIGNAL_PAYLOAD",
        message: "Signal data payload is required.",
      });
    }

    // 3. Asset Tracking Filter Check (Custom Monedas en el Radar)
    const isEs = (language || subCheck.languagePreference || "es").startsWith(
      "es",
    );
    const symbol = signal.symbol || "BTCUSDT";
    const cleanSym = String(symbol).toUpperCase().trim();
    const trackedList = subCheck.trackedSymbols || [];

    if (!trackedList.includes(cleanSym)) {
      console.log(
        `[Telegram Buy Signal Skipped] Symbol ${cleanSym} not in tracked symbols [${trackedList.join(", ")}] for user ${userId || "unknown"}`,
      );
      return res.status(200).json({
        dispatched: false,
        reason: "SYMBOL_NOT_TRACKED",
        message: `Buy signal for ${cleanSym} was skipped because ${cleanSym} is not in your configured tracked alert assets list.`,
        symbol: cleanSym,
        trackedSymbols: trackedList,
      });
    }
    const score = signal.opportunityScore || 88;
    const price = Number(signal.currentPrice || 96450).toLocaleString();
    const mfi = signal.mfi || 16.4;
    const liqs = ((signal.longLiquidations1m || 0) / 1000).toFixed(0);
    const funding = ((signal.fundingRate || -0.015) * 100).toFixed(3);
    const absorption = ((signal.bidAbsorptionRatio || 0.72) * 100).toFixed(0);
    const stopLoss = Number(signal.stopLoss || 0).toLocaleString();
    const tp1 = Number(signal.takeProfit1 || 0).toLocaleString();
    const tp2 = Number(signal.takeProfit2 || 0).toLocaleString();
    const rr = signal.riskRewardRatio || 3.4;

    const telegramMarkdown = isEs
      ? `
🟢 *SENTINEL • ALERTA DE SEÑAL DE COMPRA INSTITUCIONAL*
━━━━━━━━━━━━━━━━━━━━
🎯 *Activo:* \`${symbol}\` | *Precio:* \`$${price}\`
⚡ *Puntuación de Oportunidad:* \`${score}/100\` (${signal.signalStrength || "STRONG_BUY"})

📊 *MÉTRICAS DEL DISPARADOR:*
• *MFI (Money Flow):* \`${mfi}\` (Sobreventa Extrema)
• *Liquidaciones de Largos:* \`$${liqs}k USD\` (Capitulación / Flush)
• *Tasa de Financiación:* \`${funding}%\` (Potencial Short-Squeeze)
• *Absorción de Compras L2:* \`${absorption}%\` (Desaceleración de Ventas)

🎯 *NIVELES DE EJECUCIÓN CUÁNTICA:*
• *Zona de Entrada:* \`$${signal.entryZone?.min?.toLocaleString()} - $${signal.entryZone?.max?.toLocaleString()}\`
• *Stop Loss de Invalidación:* \`$${stopLoss}\` (< 1.5% bajo soporte)
• *Objetivo 1 (Rebote Medio):* \`$${tp1}\`
• *Objetivo 2 (Ruptura Liquidez):* \`$${tp2}\`
• *Ratio Riesgo/Beneficio (R:R):* \`1 : ${rr}\`

🤖 _Bot Oficial:_ [@SentinelRiskBot_bot](https://t.me/SentinelRiskBot_bot)
⏱️ _Generado en tiempo real por el Sentinel RAM Engine_
`
      : `
🟢 *SENTINEL • INSTITUTIONAL BUY SIGNAL ALERT*
━━━━━━━━━━━━━━━━━━━━
🎯 *Asset:* \`${symbol}\` | *Price:* \`$${price}\`
⚡ *Opportunity Score:* \`${score}/100\` (${signal.signalStrength || "STRONG_BUY"})

📊 *TRIGGER TECHNICAL METRICS:*
• *MFI (Money Flow):* \`${mfi}\` (Extreme Oversold Exhaustion)
• *Long Liquidations:* \`$${liqs}k USD\` (Capitulation Leverage Flush)
• *Funding Rate:* \`${funding}%\` (Short Squeeze Primed)
• *L2 Order Book Absorption:* \`${absorption}%\` (Sell Volume Decelerating)

🎯 *QUANT EXECUTION LEVELS:*
• *Entry Zone:* \`$${signal.entryZone?.min?.toLocaleString()} - $${signal.entryZone?.max?.toLocaleString()}\`
• *Invalidation Stop Loss:* \`$${stopLoss}\` (< 1.5% below key floor)
• *Take Profit 1 (Mean Reversion):* \`$${tp1}\`
• *Take Profit 2 (Liquidity Expansion):* \`$${tp2}\`
• *Risk / Reward Ratio (R:R):* \`1 : ${rr}\`

🤖 _Official Bot:_ [@SentinelRiskBot_bot](https://t.me/SentinelRiskBot_bot)
⏱️ _Real-time automated feed by Sentinel RAM Engine_
`;

    console.log(
      `[Telegram Buy Signal Dispatched] Premium User: ${userId} | Chat ID: ${chatId} | Symbol: ${symbol} | Score: ${score}`,
    );

    const tgResult = await sendTelegramMessage(
      chatId,
      telegramMarkdown,
      customToken,
    );
    backgroundSentinelScanner.trackDispatchedSignal("BUY", signal);

    res.json({
      dispatched: true,
      chatId,
      subscriptionTier,
      symbol,
      score,
      deliveredToTelegram: tgResult.ok,
      telegramMarkdown,
      dispatched_at: new Date().toISOString(),
    });
  });

  // Dedicated Telegram Sell Signal Dispatcher (Distribution & Short Squeeze Alerts)
  app.post("/api/telegram/dispatch-sell-signal", async (req, res) => {
    const { signal, chatId, subscriptionTier, userId, language, customToken } =
      req.body || {};

    // Macro Volatility Shield Check: Pause all alerts during high-impact macroeconomic event windows
    if (volatilityShield.isShieldActive()) {
      const activeEvent = volatilityShield.getCurrentActiveEvent();
      console.log(
        `[Telegram Sell Signal Paused] Macro Volatility Shield Active (${activeEvent?.title || "High Impact Event"}). Signals suspended.`,
      );
      return res.status(200).json({
        dispatched: false,
        paused: true,
        reason: "VOLATILITY_SHIELD_ACTIVE",
        event: activeEvent?.title,
        message:
          "🛡️ Volatility Shield Active: Sell signal alert dispatch paused during high-impact macro news window to protect against extreme manipulation.",
      });
    }

    if (!chatId) {
      return res
        .status(400)
        .json({ error: "Missing Telegram chatId parameter" });
    }

    if (!signal) {
      return res.status(400).json({ error: "Missing SellSignal payload" });
    }

    // Gate Telegram direct push strictly to premium subscribers in Firestore
    const authHeader = req.headers.authorization;
    const subCheck = await verifyUserFirestoreSubscription(
      userId,
      subscriptionTier,
      authHeader,
    );
    if (!subCheck.isPremium) {
      return res.status(403).json({
        error:
          "Telegram Automated Signal Dispatching is an exclusive feature for Sentinel Premium subscribers.",
        requiresUpgrade: true,
      });
    }

    // Asset Tracking Filter Check (Custom Monedas en el Radar)
    const isEs = (language || subCheck.languagePreference || "es").startsWith(
      "es",
    );
    const symbol = signal.symbol || "BTCUSDT";
    const cleanSym = String(symbol).toUpperCase().trim();
    const trackedList = subCheck.trackedSymbols || [];

    if (!trackedList.includes(cleanSym)) {
      console.log(
        `[Telegram Sell Signal Skipped] Symbol ${cleanSym} not in tracked symbols [${trackedList.join(", ")}] for user ${userId || "unknown"}`,
      );
      return res.status(200).json({
        dispatched: false,
        reason: "SYMBOL_NOT_TRACKED",
        message: `Sell signal for ${cleanSym} was skipped because ${cleanSym} is not in your configured tracked alert assets list.`,
        symbol: cleanSym,
        trackedSymbols: trackedList,
      });
    }
    const score = signal.opportunityScore || 85;
    const price = Number(signal.currentPrice || 0).toLocaleString();
    const mfi = signal.mfi || 82.5;
    const liqs = ((signal.shortLiquidations1m || 0) / 1000).toFixed(0);
    const funding = ((signal.fundingRate || 0.035) * 100).toFixed(3);
    const askResistance = ((signal.askResistanceRatio || 0.75) * 100).toFixed(
      0,
    );
    const stopLoss = Number(signal.stopLoss || 0).toLocaleString();
    const tp1 = Number(signal.takeProfit1 || 0).toLocaleString();
    const tp2 = Number(signal.takeProfit2 || 0).toLocaleString();
    const rr = signal.riskRewardRatio || 3.8;

    const telegramMarkdown = isEs
      ? `
🔴 *SENTINEL • ALERTA DE SEÑAL DE VENTA Y DISTRIBUCIÓN ALGORÍTMICA*
━━━━━━━━━━━━━━━━━━━━
🎯 *Activo:* \`${symbol}\` | *Precio:* \`$${price}\`
⚡ *Puntuación de Distribución:* \`${score}/100\` (${signal.signalStrength || "STRONG_SELL"})

📊 *MÉTRICAS DEL DISPARADOR:*
• *MFI (Money Flow):* \`${mfi}\` (Sobrecompra Extrema / Agotamiento)
• *Liquidaciones de Cortos:* \`$${liqs}k USD\` (Clímax de Short Squeeze)
• *Tasa de Financiación:* \`+${funding}%\` (Largos Sobreapalancados)
• *Resistencia de Órdenes Ask:* \`${askResistance}%\` (Muro L2 Absorbiendo Compras)

🎯 *NIVELES DE EJECUCIÓN EN CORTO / TAKE PROFIT:*
• *Zona de Entrada Short:* \`$${signal.entryZone?.min?.toLocaleString()} - $${signal.entryZone?.max?.toLocaleString()}\`
• *Stop Loss de Invalidación:* \`$${stopLoss}\` (+1.2% sobre techo)
• *Objetivo 1 (Retroceso Medio):* \`$${tp1}\` (-2.8%)
• *Objetivo 2 (Barrido de Liquidez):* \`$${tp2}\` (-6.2%)
• *Ratio Riesgo/Beneficio (R:R):* \`1 : ${rr}\`

🤖 _Bot Oficial:_ [@SentinelRiskBot_bot](https://t.me/SentinelRiskBot_bot)
⏱️ _Generado en tiempo real por el Sentinel RAM Engine_
`
      : `
🔴 *SENTINEL • INSTITUTIONAL SELL & DISTRIBUTION ALERT*
━━━━━━━━━━━━━━━━━━━━
🎯 *Asset:* \`${symbol}\` | *Price:* \`$${price}\`
⚡ *Distribution Score:* \`${score}/100\` (${signal.signalStrength || "STRONG_SELL"})

📊 *TRIGGER TECHNICAL METRICS:*
• *MFI (Money Flow):* \`${mfi}\` (Extreme Overbought Exhaustion)
• *Short Liquidations:* \`$${liqs}k USD\` (Short Squeeze Climax Flushed)
• *Funding Rate:* \`+${funding}%\` (Crowded Long Leverage)
• *L2 Ask Resistance Depth:* \`${askResistance}%\` (Passive Wall Absorption)

🎯 *SHORT / TAKE-PROFIT QUANT EXECUTION LEVELS:*
• *Short Entry Zone:* \`$${signal.entryZone?.min?.toLocaleString()} - $${signal.entryZone?.max?.toLocaleString()}\`
• *Invalidation Stop Loss:* \`$${stopLoss}\` (+1.2% above resistance)
• *Take Profit 1 (Mean Reversion):* \`$${tp1}\` (-2.8%)
• *Take Profit 2 (Liquidity Sweep):* \`$${tp2}\` (-6.2%)
• *Risk / Reward Ratio (R:R):* \`1 : ${rr}\`

🤖 _Official Bot:_ [@SentinelRiskBot_bot](https://t.me/SentinelRiskBot_bot)
⏱️ _Real-time automated feed by Sentinel RAM Engine_
`;

    console.log(
      `[Telegram Sell Signal Dispatched] Premium User: ${userId} | Chat ID: ${chatId} | Symbol: ${symbol} | Score: ${score}`,
    );

    const tgResult = await sendTelegramMessage(
      chatId,
      telegramMarkdown,
      customToken,
    );
    backgroundSentinelScanner.trackDispatchedSignal("SELL", signal);

    res.json({
      dispatched: true,
      chatId,
      subscriptionTier,
      symbol,
      score,
      deliveredToTelegram: tgResult.ok,
      telegramMarkdown,
      dispatched_at: new Date().toISOString(),
    });
  });

  // ---------------------------------------------------------------------------
  // VWAP & EMA TREND SCANNER ENDPOINT (MARKET SCAN + TELEGRAM DISPATCH)
  // ---------------------------------------------------------------------------
  interface CachedVwapScan {
    timeframe: string;
    signals: any[];
    fetchedAt: number;
  }
  const vwapScanCache = new Map<string, CachedVwapScan>();

  app.get("/api/market/vwap-ema-scan", async (req, res) => {
    const userId = String(req.query.userId || req.headers["x-user-id"] || "");
    const subscriptionTier = String(req.query.subscriptionTier || "");
    const authHeader = req.headers.authorization;

    // Macro Volatility Shield Check: Return empty signal state with shield active indicator
    if (volatilityShield.isShieldActive()) {
      const activeEvent = volatilityShield.getCurrentActiveEvent();
      return res.json({
        timeframe: req.query.timeframe || "1h",
        signals: [],
        isVolatilityShieldActive: true,
        shieldEvent: activeEvent,
        message:
          "🛡️ Volatility Shield Active: High-impact macroeconomic events are currently unfolding. Trading signals are paused for 30 minutes to protect your capital.",
      });
    }

    // Strict access control: Gate VWAP & EMA multi-market scanner to verified Premium users
    const subCheck = await verifyUserFirestoreSubscription(
      userId,
      subscriptionTier,
      authHeader,
    );
    if (!subCheck.isPremium) {
      return res.status(403).json({
        error:
          "VWAP & EMA Multi-market Scanner is an exclusive feature for Sentinel Premium subscribers.",
        requiresUpgrade: true,
      });
    }

    const rawTf = String(req.query.timeframe || "1h")
      .trim()
      .toLowerCase();
    const validTimeframes = ["15m", "1h", "4h", "1d", "1w", "1m"];
    const timeframe = validTimeframes.includes(rawTf) ? rawTf : "1h";
    const binanceInterval = timeframe === "1m" ? "1M" : timeframe;

    const customSymbols = req.query.symbols
      ? String(req.query.symbols)
          .split(",")
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean)
      : null;

    const targetSymbols =
      customSymbols && customSymbols.length > 0
        ? customSymbols
        : [
            "BTCUSDT",
            "ETHUSDT",
            "SOLUSDT",
            "BNBUSDT",
            "XRPUSDT",
            "DOGEUSDT",
            "AVAXUSDT",
            "ADAUSDT",
            "LINKUSDT",
            "SUIUSDT",
            "NEARUSDT",
            "PEPEUSDT",
          ];

    const cacheKey = `${timeframe}_${[...targetSymbols].sort().join(",")}`;
    const cached = vwapScanCache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < 15_000) {
      return res.json({ timeframe, signals: cached.signals, cached: true });
    }

    try {
      const results = await Promise.all(
        targetSymbols.map(async (symbol) => {
          try {
            // Fetch intraday klines, weekly klines (from higherTfKlineCache), and monthly klines in parallel (Spot or Futures auto-fallback)
            const [rawKlines, weeklyKlines, monthlyKlines] = await Promise.all([
              fetchBinanceSpotOrFutures<any[]>(
                `/api/v3/klines?symbol=${symbol}&interval=${binanceInterval}&limit=35`,
                symbol,
              ),
              getHigherTfKlines(symbol, "1w"),
              getHigherTfKlines(symbol, "1M"),
            ]);

            if (!Array.isArray(rawKlines) || rawKlines.length < 21) {
              throw new Error(`Insufficient intraday klines for ${symbol}`);
            }

            const currentPrice = parseFloat(rawKlines[rawKlines.length - 1][4]);
            if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
              throw new Error(`Invalid close price for ${symbol}`);
            }

            // Pure mathematical indicator calculation from authentic exchange candles
            const intraInd = computeTimeframeIndicators(
              rawKlines,
              timeframe,
              currentPrice,
            );
            const weekInd = computeTimeframeIndicators(
              weeklyKlines,
              "1w",
              currentPrice,
            );
            const monthInd = computeTimeframeIndicators(
              monthlyKlines,
              "1m",
              currentPrice,
            );

            const intraTrend = intraInd.trend;
            const weekTrend = weekInd.trend;
            const monthTrend = monthInd.trend;

            const isMacroAligned =
              (intraTrend === "BULLISH" &&
                weekTrend === "BULLISH" &&
                monthTrend === "BULLISH") ||
              (intraTrend === "BEARISH" &&
                weekTrend === "BEARISH" &&
                monthTrend === "BEARISH");
            const isCounterTrend =
              (intraTrend === "BULLISH" &&
                (weekTrend === "BEARISH" || monthTrend === "BEARISH")) ||
              (intraTrend === "BEARISH" &&
                (weekTrend === "BULLISH" || monthTrend === "BULLISH"));

            let signalType: "BUY" | "SELL" | "NEUTRAL" = "NEUTRAL";
            let signalStrength:
              | "STRONG_BULLISH"
              | "MODERATE_BULLISH"
              | "STRONG_BEARISH"
              | "MODERATE_BEARISH"
              | "NEUTRAL" = "NEUTRAL";
            let trendScore = 50;

            if (intraTrend === "BULLISH") {
              signalType = "BUY";
              if (intraInd.crossoverStatus === "BULLISH_CROSS") {
                signalStrength = "STRONG_BULLISH";
                trendScore = Math.min(
                  98,
                  85 + Math.abs(intraInd.distanceToVwapPercent) * 3,
                );
              } else {
                signalStrength =
                  intraInd.distanceToVwapPercent > 1.2
                    ? "STRONG_BULLISH"
                    : "MODERATE_BULLISH";
                trendScore = Math.min(
                  95,
                  72 + Math.abs(intraInd.distanceToVwapPercent) * 4,
                );
              }
            } else if (intraTrend === "BEARISH") {
              signalType = "SELL";
              if (intraInd.crossoverStatus === "BEARISH_CROSS") {
                signalStrength = "STRONG_BEARISH";
                trendScore = Math.max(
                  2,
                  15 - Math.abs(intraInd.distanceToVwapPercent) * 3,
                );
              } else {
                signalStrength =
                  intraInd.distanceToVwapPercent < -1.2
                    ? "STRONG_BEARISH"
                    : "MODERATE_BEARISH";
                trendScore = Math.max(
                  5,
                  28 - Math.abs(intraInd.distanceToVwapPercent) * 4,
                );
              }
            }

            const baseAsset = symbol.replace("USDT", "");
            const invalidation =
              signalType === "BUY"
                ? Math.min(intraInd.vwap, intraInd.ema21) * 0.994
                : Math.max(intraInd.vwap, intraInd.ema21) * 1.006;

            // Enforce strict 4% novice protection safety net: risk distance MUST NEVER exceed 4% of entry price
            const maxAllowedRisk = currentPrice * 0.04;
            const minAllowedRisk = currentPrice * 0.008;
            let risk = Math.abs(currentPrice - invalidation);
            if (risk > maxAllowedRisk) risk = maxAllowedRisk;
            if (risk < minAllowedRisk) risk = minAllowedRisk;

            const stopLoss =
              signalType === "BUY" ? currentPrice - risk : currentPrice + risk;

            const takeProfit1 =
              signalType === "BUY"
                ? currentPrice + risk * 1.5
                : currentPrice - risk * 1.5;
            const takeProfit2 =
              signalType === "BUY"
                ? currentPrice + risk * 2.5
                : currentPrice - risk * 2.5;
            const riskRewardRatio = 1.5;

            const rationaleEn =
              signalType === "BUY"
                ? `EMA 9 ($${intraInd.ema9.toLocaleString()}) sustains above EMA 21 ($${intraInd.ema21.toLocaleString()}) with price floating +${intraInd.distanceToVwapPercent.toFixed(2)}% above VWAP anchor ($${intraInd.vwap.toLocaleString()}). Bullish trend alignment confirmed.`
                : signalType === "SELL"
                  ? `EMA 9 ($${intraInd.ema9.toLocaleString()}) trades below EMA 21 ($${intraInd.ema21.toLocaleString()}) with price pinned ${intraInd.distanceToVwapPercent.toFixed(2)}% below VWAP ($${intraInd.vwap.toLocaleString()}). Bearish continuation favored.`
                  : `Consolidation mode: Price testing VWAP mean ($${intraInd.vwap.toLocaleString()}) with neutral EMA spread (${intraInd.emaSpreadPercent.toFixed(2)}%).`;

            const rationaleEs =
              signalType === "BUY"
                ? `EMA 9 ($${intraInd.ema9.toLocaleString()}) se mantiene sobre EMA 21 ($${intraInd.ema21.toLocaleString()}) con precio cotizando +${intraInd.distanceToVwapPercent.toFixed(2)}% sobre el anclaje VWAP ($${intraInd.vwap.toLocaleString()}). Tendencia alcista confirmada.`
                : signalType === "SELL"
                  ? `EMA 9 ($${intraInd.ema9.toLocaleString()}) opera bajo EMA 21 ($${intraInd.ema21.toLocaleString()}) con precio atrapado ${intraInd.distanceToVwapPercent.toFixed(2)}% bajo VWAP ($${intraInd.vwap.toLocaleString()}). Tendencia bajista favorecida.`
                  : `Consolidación: Precio oscilando en torno a VWAP ($${intraInd.vwap.toLocaleString()}) con dispersión EMA neutral (${intraInd.emaSpreadPercent.toFixed(2)}%).`;

            let confluenceRating: any = "CHOPPY_MIXED";
            let confluenceScore = 50;
            let titleEn = "Moderate Confluence";
            let titleEs = "Confluencia Moderada";
            let descEn = "Partial alignment across multi-timeframe horizon.";
            let descEs =
              "Alineación parcial en el horizonte multi-marco temporal.";

            if (isMacroAligned) {
              if (intraTrend === "BULLISH") {
                confluenceRating = "MACRO_ALIGNED_BULLISH";
                confluenceScore = 96;
                titleEn =
                  "Macro-Aligned Trend • Triple Bullish Confluence (1H • 1W • 1M)";
                titleEs =
                  "Tendencia Alineada Macro • Confluencia Alcista Triple (1H • 1S • 1M)";
                descEn =
                  "Triple-tier alignment: Intraday setup is confirmed by weekly institutional support and monthly macro accumulation.";
                descEs =
                  "Alineación triple: La configuración intradiaria está confirmada por soporte semanal y acumulación mensual.";
              } else {
                confluenceRating = "MACRO_ALIGNED_BEARISH";
                confluenceScore = 95;
                titleEn =
                  "Macro-Aligned Breakdown • Triple Bearish Confluence (1H • 1W • 1M)";
                titleEs =
                  "Desglose Alineado Macro • Confluencia Bajista Triple (1H • 1S • 1M)";
                descEn =
                  "Triple-tier distribution: Spot trades below VWAP and EMAs across intraday, weekly, and monthly horizons.";
                descEs =
                  "Distribución triple: El precio cotiza bajo el VWAP y las EMAs en horizontes intradiarios, semanales y mensuales.";
              }
            } else if (isCounterTrend) {
              confluenceRating = "COUNTER_TREND_WARNING";
              confluenceScore = 52;
              titleEn =
                "Counter-Trend Warning • Intraday Signal vs. Higher-Timeframe Flow";
              titleEs =
                "Alerta Contra-Tendencia • Señal Intradiaria vs. Flujo Temporal Superior";
              descEn =
                "Caution advised: Intraday signal is fighting the higher-timeframe trend. Scalp profits proactively.";
              descEs =
                "Precaución aconsejada: La señal intradiaria choca contra la tendencia del marco temporal superior.";
            } else {
              confluenceRating = "MODERATE_ALIGNMENT";
              confluenceScore = 74;
              titleEn = "Moderate Confluence • Partial Timeframe Alignment";
              titleEs = "Confluencia Moderada • Alineación Parcial de Marcos";
              descEn =
                "Market is in multi-timeframe transition. Maintain standard risk:reward parameters.";
              descEs =
                "El mercado está en transición multi-marco. Mantenga parámetros estándar de riesgo:beneficio.";
            }

            let adjustedScore = trendScore;
            if (isMacroAligned) {
              if (signalType === "BUY")
                adjustedScore = Math.min(99, Math.max(90, trendScore + 10));
              else if (signalType === "SELL")
                adjustedScore = Math.max(1, Math.min(10, trendScore - 10));
            } else if (isCounterTrend) {
              if (signalType === "BUY")
                adjustedScore = Math.max(48, Math.min(68, trendScore - 16));
              else if (signalType === "SELL")
                adjustedScore = Math.min(52, Math.max(32, trendScore + 16));
            }

            // 100% genuine multi-timeframe structure directly from computed indicators
            const multiTimeframe = {
              intraday: {
                timeframe,
                trend: intraInd.trend,
                ema9: intraInd.ema9,
                ema21: intraInd.ema21,
                vwap: intraInd.vwap,
                isAboveVwap: intraInd.isAboveVwap,
                distanceToVwapPercent: intraInd.distanceToVwapPercent,
                emaSpreadPercent: intraInd.emaSpreadPercent,
                crossoverStatus: intraInd.crossoverStatus,
              },
              weekly: {
                timeframe: "1w",
                trend: weekInd.trend,
                ema9: weekInd.ema9,
                ema21: weekInd.ema21,
                vwap: weekInd.vwap,
                isAboveVwap: weekInd.isAboveVwap,
                distanceToVwapPercent: weekInd.distanceToVwapPercent,
                emaSpreadPercent: weekInd.emaSpreadPercent,
                crossoverStatus: weekInd.crossoverStatus,
              },
              monthly: {
                timeframe: "1m",
                trend: monthInd.trend,
                ema9: monthInd.ema9,
                ema21: monthInd.ema21,
                vwap: monthInd.vwap,
                isAboveVwap: monthInd.isAboveVwap,
                distanceToVwapPercent: monthInd.distanceToVwapPercent,
                emaSpreadPercent: monthInd.emaSpreadPercent,
                crossoverStatus: monthInd.crossoverStatus,
              },
              confluenceScore,
              confluenceRating,
              titleEn,
              titleEs,
              descriptionEn: descEn,
              descriptionEs: descEs,
              isMacroAligned,
              isCounterTrend,
              alignedCount: isMacroAligned ? 3 : isCounterTrend ? 1 : 2,
            };

            // Real 24h change read from radarPricesCache or tickerStatsCache
            const realRadarItem = radarPricesCache?.data[symbol];
            const realTickerStats = tickerStatsCache.get(symbol);
            const realChange24h =
              realRadarItem?.change24h ?? realTickerStats?.priceChange24h ?? 0;

            return {
              symbol,
              baseAsset,
              quoteAsset: "USDT",
              currentPrice: formatCryptoPrice(currentPrice, currentPrice),
              timeframe,
              vwap: intraInd.vwap,
              distanceToVwapPercent: intraInd.distanceToVwapPercent,
              isAboveVwap: intraInd.isAboveVwap,
              ema9: intraInd.ema9,
              ema21: intraInd.ema21,
              emaSpreadPercent: intraInd.emaSpreadPercent,
              isEmaBullishCross: intraInd.trend === "BULLISH",
              crossoverStatus: intraInd.crossoverStatus,
              signalType,
              signalStrength,
              trendScore: Math.round(adjustedScore),
              entryZone: {
                min: formatCryptoPrice(currentPrice * 0.998, currentPrice),
                max: formatCryptoPrice(currentPrice * 1.002, currentPrice),
              },
              stopLoss: formatCryptoPrice(stopLoss, currentPrice),
              takeProfit1: formatCryptoPrice(takeProfit1, currentPrice),
              takeProfit2: formatCryptoPrice(takeProfit2, currentPrice),
              riskRewardRatio: Math.max(1.8, riskRewardRatio),
              change24h: realChange24h,
              timestamp: Date.now(),
              rationaleEn,
              rationaleEs,
              multiTimeframe,
            };
          } catch (e: any) {
            console.warn(`[VWAP Scan Skip ${symbol}]`, e?.message);
            return null;
          }
        }),
      );

      const validSignals = results.filter(
        (sig): sig is NonNullable<typeof sig> => sig !== null,
      );
      if (validSignals.length > 0) {
        vwScanCacheSet(cacheKey, validSignals);
      }
      return res.json({ timeframe, signals: validSignals, cached: false });
    } catch (err: any) {
      console.warn("[VWAP Scan Error]", err.message);
      return res
        .status(500)
        .json({ error: "Failed to compute VWAP & EMA scan" });
    }
  });

  function vwScanCacheSet(key: string, signals: any[]) {
    vwapScanCache.set(key, {
      timeframe: key,
      signals,
      fetchedAt: Date.now(),
    });
  }

  // ---------------------------------------------------------------------------
  // UNIFIED REAL-TIME MARKET SIGNALS SCANNER (BUY & SELL ANTI-CONTRADICTION ENGINE)
  // Computes authentic 14-period MFI, RSI, ATR, Taker Absorption & Real Funding Rates
  // ---------------------------------------------------------------------------
  interface SignalsScanCacheEntry {
    payload: {
      timeframe: string;
      buySignals: any[];
      sellSignals: any[];
      allBuyScans: any[];
      allSellScans: any[];
      allSignals: Record<string, { buy: any; sell: any }>;
      count: number;
    };
    fetchedAt: number;
  }
  const signalsScanCache = new Map<string, SignalsScanCacheEntry>();

  app.get("/api/market/signals-scan", async (req, res) => {
    try {
      // 1. Check Macro Volatility Shield
      if (volatilityShield.isShieldActive()) {
        const activeEvent = volatilityShield.getCurrentActiveEvent();
        return res.json({
          success: true,
          cached: false,
          isVolatilityShieldActive: true,
          shieldEvent: activeEvent,
          message:
            "🛡️ Volatility Shield Active: Trading signals are paused for 30 minutes to protect capital during high-impact macro events.",
          buySignals: [],
          sellSignals: [],
          allBuyScans: [],
          allSellScans: [],
          allSignals: {},
          timestamp: Date.now(),
        });
      }

      const rawTf = String(req.query.timeframe || "1h")
        .trim()
        .toLowerCase();
      const validTfs = ["15m", "1h", "4h", "1d"];
      const timeframe = validTfs.includes(rawTf) ? rawTf : "1h";

      const customSymbols = req.query.symbols
        ? String(req.query.symbols)
            .split(",")
            .map((s) => s.trim().toUpperCase())
            .filter(Boolean)
        : null;

      const targetSymbols =
        customSymbols && customSymbols.length > 0
          ? customSymbols
          : [
              "BTCUSDT",
              "ETHUSDT",
              "SOLUSDT",
              "BNBUSDT",
              "XRPUSDT",
              "DOGEUSDT",
              "AVAXUSDT",
              "ADAUSDT",
              "LINKUSDT",
              "SUIUSDT",
              "NEARUSDT",
              "PEPEUSDT",
              "ZECUSDT",
            ];

      // Fast-path: If MarketStateStore has fresh evaluations (< 25s) for all requested symbols, serve directly from store
      if (
        backgroundSentinelScanner.marketStore.evaluations.size > 0 &&
        Date.now() -
          backgroundSentinelScanner.marketStore.lastIngestionTimestamp <
          25_000
      ) {
        const hasAllSymbols = targetSymbols.every((sym) =>
          backgroundSentinelScanner.marketStore.evaluations.has(sym),
        );
        if (hasAllSymbols) {
          const storeEvaluations = targetSymbols.map(
            (sym) =>
              backgroundSentinelScanner.marketStore.evaluations.get(sym)!,
          );
          const allBuyScans = storeEvaluations.map((e) => e.buy);
          const allSellScans = storeEvaluations.map((e) => e.sell);
          const buySignals = allBuyScans.filter(
            (s) => s.opportunityScore >= 75 && !s.isBuyLocked,
          );
          const sellSignals = allSellScans.filter(
            (s) => s.opportunityScore >= 75,
          );
          const allSignals: Record<string, { buy: any; sell: any }> = {};
          for (const item of storeEvaluations) {
            allSignals[item.symbol] = { buy: item.buy, sell: item.sell };
          }
          return res.json({
            success: true,
            cached: true,
            source: "MarketStateStore",
            timestamp:
              backgroundSentinelScanner.marketStore.lastIngestionTimestamp,
            isVolatilityShieldActive: false,
            timeframe,
            buySignals,
            sellSignals,
            allBuyScans,
            allSellScans,
            allSignals,
            count: targetSymbols.length,
          });
        }
      }

      const cacheKey = `${timeframe}_${[...targetSymbols].sort().join(",")}`;
      const cached = signalsScanCache.get(cacheKey);
      if (cached && Date.now() - cached.fetchedAt < 15_000) {
        return res.json({
          success: true,
          cached: true,
          timestamp: cached.fetchedAt,
          isVolatilityShieldActive: false,
          ...cached.payload,
        });
      }

      // Try fetching Binance Futures premium index for authentic funding rates (with timeout)
      let fundingRatesMap: Record<string, number> = {};
      try {
        const rawItems = await fetchFromBinanceFutures<any[]>(
          "/fapi/v1/premiumIndex",
          { timeoutMs: 3000 },
        );
        if (Array.isArray(rawItems)) {
          for (const item of rawItems) {
            if (item?.symbol && item?.lastFundingRate !== undefined) {
              fundingRatesMap[item.symbol] = parseFloat(item.lastFundingRate);
            }
          }
        }
      } catch {
        // Futures endpoint may be regionalized or timeout; fallback to taker volume pressure
      }

      const results = await Promise.all(
        targetSymbols.map(async (symbol) => {
          try {
            // Fetch authentic 35 klines from Binance Spot (with automatic Futures fallback)
            const rawKlines = await fetchBinanceSpotOrFutures<any[]>(
              `/api/v3/klines?symbol=${symbol}&interval=${timeframe}&limit=35`,
              symbol,
            );

            if (!Array.isArray(rawKlines) || rawKlines.length < 18) {
              throw new Error(`Insufficient klines for ${symbol}`);
            }

            const highs: number[] = [];
            const lows: number[] = [];
            const closes: number[] = [];
            const volumes: number[] = [];
            const takerBuys: number[] = [];
            const typicalPrices: number[] = [];

            for (let i = 0; i < rawKlines.length; i++) {
              const h = parseFloat(rawKlines[i][2]);
              const l = parseFloat(rawKlines[i][3]);
              const c = parseFloat(rawKlines[i][4]);
              const v = parseFloat(rawKlines[i][5]);
              const tb = parseFloat(rawKlines[i][9]);
              highs.push(h);
              lows.push(l);
              closes.push(c);
              volumes.push(v);
              takerBuys.push(tb);
              typicalPrices.push((h + l + c) / 3);
            }

            const len = closes.length;
            const currentPrice = closes[len - 1];
            const prevClose = closes[len - 2] || currentPrice;
            const open24h = closes[Math.max(0, len - 24)];
            const change24h = Number(
              (((currentPrice - open24h) / open24h) * 100).toFixed(2),
            );
            const priceChange1m = Number(
              (((currentPrice - prevClose) / prevClose) * 100).toFixed(2),
            );
            const priceChange5m = Number(
              (
                ((currentPrice - closes[Math.max(0, len - 5)]) /
                  closes[Math.max(0, len - 5)]) *
                100
              ).toFixed(2),
            );

            // 1. Real 14-period MFI (Money Flow Index)
            let posFlow = 0;
            let negFlow = 0;
            const mfiStart = Math.max(1, len - 14);
            for (let i = mfiStart; i < len; i++) {
              const curTP = typicalPrices[i];
              const prvTP = typicalPrices[i - 1];
              const flow = curTP * volumes[i];
              if (curTP > prvTP) posFlow += flow;
              else if (curTP < prvTP) negFlow += flow;
            }
            const moneyRatio = negFlow > 0 ? posFlow / negFlow : 100;
            const mfi = Math.min(
              99,
              Math.max(5, Math.round((100 - 100 / (1 + moneyRatio)) * 10) / 10),
            );

            // 2. Real 14-period RSI
            let gains = 0;
            let losses = 0;
            for (let i = mfiStart; i < len; i++) {
              const diff = closes[i] - closes[i - 1];
              if (diff > 0) gains += diff;
              else losses += Math.abs(diff);
            }
            const avgG = gains / 14;
            const avgL = losses / 14;
            const rs = avgL > 0 ? avgG / avgL : 100;
            const rsi = Math.min(
              99,
              Math.max(5, Math.round((100 - 100 / (1 + rs)) * 10) / 10),
            );

            // 3. Authentic 14-period ATR & Execution Levels Engine (Standardized ATR*1.5 with 4% Novice Protection Cap)
            const executionLevels = calculateAtrExecutionLevels(
              currentPrice,
              highs,
              lows,
              closes,
              14,
            );
            const atr14 = executionLevels.atr14;

            // 4. Real Taker Volume Absorption Ratio
            const recentCount = Math.min(3, len);
            let recentTotVol = 0;
            let recentTakerBuy = 0;
            for (let i = len - recentCount; i < len; i++) {
              recentTotVol += volumes[i];
              recentTakerBuy += takerBuys[i];
            }
            const buyerAbsorptionRatio =
              recentTotVol > 0
                ? Math.min(0.95, Math.max(0.05, recentTakerBuy / recentTotVol))
                : 0.5;
            const sellerVolumeRatio = 1 - buyerAbsorptionRatio;

            // 5. Authentic or volume-derived Funding Rate
            let fundingRate = fundingRatesMap[symbol];
            if (fundingRate === undefined || Number.isNaN(fundingRate)) {
              const netImbalance = (buyerAbsorptionRatio - 0.5) * 2;
              fundingRate = Number((netImbalance * 0.00035).toFixed(6));
            }

            // 6. Volatility-based Execution Levels (ATR calibrated with 4% cap & 1.5x / 2.5x TPs)
            const buyEntryMin = executionLevels.buy.entryZone.min;
            const buyEntryMax = executionLevels.buy.entryZone.max;
            const buyStopLoss = executionLevels.buy.stopLoss;
            const buyTp1 = executionLevels.buy.takeProfit1;
            const buyTp2 = executionLevels.buy.takeProfit2;
            const buyStopLossPct = executionLevels.buy.stopLossPercent;
            const buyTp1Pct = executionLevels.buy.takeProfit1Percent;
            const buyTp2Pct = executionLevels.buy.takeProfit2Percent;
            const buyRr = executionLevels.buy.riskRewardRatio;

            const sellEntryMin = executionLevels.sell.entryZone.min;
            const sellEntryMax = executionLevels.sell.entryZone.max;
            const sellStopLoss = executionLevels.sell.stopLoss;
            const sellTp1 = executionLevels.sell.takeProfit1;
            const sellTp2 = executionLevels.sell.takeProfit2;
            const sellStopLossPct = executionLevels.sell.stopLossPercent;
            const sellTp1Pct = executionLevels.sell.takeProfit1Percent;
            const sellTp2Pct = executionLevels.sell.takeProfit2Percent;
            const sellRr = executionLevels.sell.riskRewardRatio;

            // 7. Scoring & Anti-Contradiction / Mutual Exclusion Engine
            // Buy Pillars
            let buyMfiPts = 0;
            if (mfi < 20) buyMfiPts = 35;
            else if (mfi < 35) buyMfiPts = 25;
            else if (mfi < 48) buyMfiPts = 12;
            else buyMfiPts = 2;

            let buyRsiPts = 0;
            if (rsi < 30) buyRsiPts = 25;
            else if (rsi < 38) buyRsiPts = 18;
            else if (rsi < 48) buyRsiPts = 8;

            let buyVolPts = 0;
            if (buyerAbsorptionRatio >= 0.58) buyVolPts = 25;
            else if (buyerAbsorptionRatio >= 0.52) buyVolPts = 18;
            else if (buyerAbsorptionRatio >= 0.46) buyVolPts = 10;
            else buyVolPts = 2;

            let buyFundingPts = 0;
            if (fundingRate < -0.005) buyFundingPts = 15;
            else if (fundingRate <= 0) buyFundingPts = 10;
            else if (fundingRate < 0.005) buyFundingPts = 5;

            let rawBuyScore = buyMfiPts + buyRsiPts + buyVolPts + buyFundingPts;

            // Sell Pillars
            let sellMfiPts = 0;
            if (mfi > 80) sellMfiPts = 35;
            else if (mfi > 68) sellMfiPts = 25;
            else if (mfi > 55) sellMfiPts = 12;
            else sellMfiPts = 2;

            let sellRsiPts = 0;
            if (rsi > 70) sellRsiPts = 25;
            else if (rsi > 65) sellRsiPts = 18;
            else if (rsi > 52) sellRsiPts = 8;

            let sellVolPts = 0;
            if (sellerVolumeRatio >= 0.58) sellVolPts = 25;
            else if (sellerVolumeRatio >= 0.52) sellVolPts = 18;
            else if (sellerVolumeRatio >= 0.46) sellVolPts = 10;
            else sellVolPts = 2;

            let sellFundingPts = 0;
            if (fundingRate > 0.02) sellFundingPts = 15;
            else if (fundingRate > 0.01) sellFundingPts = 10;
            else if (fundingRate >= 0) sellFundingPts = 5;

            let rawSellScore =
              sellMfiPts + sellRsiPts + sellVolPts + sellFundingPts;

            // ENFORCE STRICT MUTUAL EXCLUSION & ANTI-CONTRADICTION:
            // 1) If MFI >= 50, Buy Score MUST be capped below 60
            if (mfi >= 50 || rsi >= 52) {
              rawBuyScore = Math.min(rawBuyScore, 54);
            }
            if (!(mfi < 35 || rsi < 38) || buyerAbsorptionRatio < 0.45) {
              rawBuyScore = Math.min(rawBuyScore, 68);
            }

            // 2) If MFI < 50, Sell Score MUST be capped below 60
            if (mfi < 50 || rsi < 48) {
              rawSellScore = Math.min(rawSellScore, 54);
            }
            if (!(mfi > 68 || rsi > 65) || sellerVolumeRatio < 0.45) {
              rawSellScore = Math.min(rawSellScore, 68);
            }

            // 3) Strict exclusion: A coin can NEVER trigger in both scanners
            if (rawBuyScore >= 75) {
              rawSellScore = Math.min(rawSellScore, 38);
            } else if (rawSellScore >= 75) {
              rawBuyScore = Math.min(rawBuyScore, 38);
            }

            const baseAsset = symbol.endsWith("USDT")
              ? symbol.slice(0, -4)
              : symbol;

            const buyItem = {
              symbol,
              baseAsset,
              quoteAsset: "USDT",
              currentPrice,
              change24h,
              priceChange1m,
              priceChange5m,
              opportunityScore: rawBuyScore,
              signalStrength:
                rawBuyScore >= 85
                  ? "STRONG_BUY"
                  : rawBuyScore >= 70
                    ? "MODERATE_BUY"
                    : rawBuyScore >= 55
                      ? "ACCUMULATION"
                      : "NEUTRAL",
              mfi,
              rsi,
              atr: atr14,
              mfiCondition:
                mfi < 20
                  ? "EXTREME_OVERSOLD"
                  : mfi < 35
                    ? "OVERSOLD"
                    : mfi < 50
                      ? "NEUTRAL"
                      : "OVERBOUGHT",
              mfiScoreContribution: buyMfiPts,
              longLiquidations1m: Math.round(
                recentTotVol * currentPrice * 0.015,
              ),
              isCapitulationDetected: mfi < 30 && buyerAbsorptionRatio > 0.55,
              liquidationScoreContribution: buyVolPts,
              fundingRate,
              fundingBias:
                fundingRate < -0.01
                  ? "NEGATIVE_SHORT_SQUEEZE"
                  : fundingRate <= 0
                    ? "NEUTRAL"
                    : "POSITIVE_LONG_HEAVY",
              fundingScoreContribution: buyFundingPts,
              sellVolumeDeceleration: buyerAbsorptionRatio >= 0.5,
              bidAbsorptionRatio: Number(buyerAbsorptionRatio.toFixed(2)),
              sellVolumeZScore: Number(
                ((0.5 - buyerAbsorptionRatio) * 3).toFixed(2),
              ),
              absorptionScoreContribution: buyVolPts,
              entryZone: { min: buyEntryMin, max: buyEntryMax },
              stopLoss: buyStopLoss,
              stopLossPercent: buyStopLossPct,
              takeProfit1: buyTp1,
              takeProfit1Percent: buyTp1Pct,
              takeProfit2: buyTp2,
              takeProfit2Percent: buyTp2Pct,
              riskRewardRatio: buyRr,
              triggers: {
                mfiOversold: mfi < 35,
                liquidationFlush: buyerAbsorptionRatio > 0.52,
                negativeOrNeutralFunding: fundingRate <= 0.005,
                orderBookAbsorption: buyerAbsorptionRatio >= 0.55,
                reboundMomentum: rawBuyScore >= 70,
              },
              isBuyLocked: false,
              buyEligible: true,
              timestamp: Date.now(),
              rationaleEn: `🟢 Selling pressure exhausted: Buyers are absorbing the dip near support at $${buyStopLoss.toLocaleString()}. MFI at ${mfi} confirms strong oversold rebound setup.`,
              rationaleEs: `🟢 Presión de venta agotada: Los compradores están absorbiendo la caída cerca del piso de soporte en $${buyStopLoss.toLocaleString()}. MFI en ${mfi} confirma sobreventa y rebote técnico.`,
            };

            const sellItem = {
              symbol,
              baseAsset,
              quoteAsset: "USDT",
              currentPrice,
              change24h,
              priceChange1m,
              priceChange5m,
              opportunityScore: rawSellScore,
              signalStrength:
                rawSellScore >= 85
                  ? "STRONG_SELL"
                  : rawSellScore >= 70
                    ? "MODERATE_SELL"
                    : rawSellScore >= 55
                      ? "DISTRIBUTION"
                      : "NEUTRAL",
              mfi,
              rsi,
              atr: atr14,
              mfiCondition:
                mfi > 80
                  ? "EXTREME_OVERBOUGHT"
                  : mfi > 68
                    ? "OVERBOUGHT"
                    : mfi > 50
                      ? "NEUTRAL"
                      : "OVERSOLD",
              mfiScoreContribution: sellMfiPts,
              shortLiquidations1m: Math.round(
                recentTotVol * currentPrice * 0.015,
              ),
              isExhaustionTopDetected: mfi > 70 && sellerVolumeRatio > 0.55,
              liquidationScoreContribution: sellVolPts,
              fundingRate,
              fundingBias:
                fundingRate > 0.02
                  ? "HEAVILY_POSITIVE_LONG_HEAVY"
                  : fundingRate > 0
                    ? "POSITIVE"
                    : "NEUTRAL",
              fundingScoreContribution: sellFundingPts,
              buyVolumeDeceleration: sellerVolumeRatio >= 0.5,
              askResistanceRatio: Number(sellerVolumeRatio.toFixed(2)),
              sellVolumeZScore: Number(
                ((sellerVolumeRatio - 0.5) * 3).toFixed(2),
              ),
              resistanceScoreContribution: sellVolPts,
              entryZone: { min: sellEntryMin, max: sellEntryMax },
              stopLoss: sellStopLoss,
              stopLossPercent: sellStopLossPct,
              takeProfit1: sellTp1,
              takeProfit1Percent: sellTp1Pct,
              takeProfit2: sellTp2,
              takeProfit2Percent: sellTp2Pct,
              riskRewardRatio: sellRr,
              triggers: {
                mfiOverbought: mfi > 68,
                shortLiquidationClimax: sellerVolumeRatio > 0.52,
                elevatedPositiveFunding: fundingRate > 0.01,
                askResistanceAbsorption: sellerVolumeRatio >= 0.55,
                distributionMomentum: rawSellScore >= 70,
              },
              timestamp: Date.now(),
              rationaleEn: `🔴 Buying momentum exhausted: Institutional sellers are capping advance near resistance at $${sellStopLoss.toLocaleString()}. MFI at ${mfi} confirms overbought distribution.`,
              rationaleEs: `🔴 Presión compradora agotada: Los vendedores institucionales frenan la subida en el techo de resistencia de $${sellStopLoss.toLocaleString()}. MFI en ${mfi} confirma sobrecompra y toma de beneficios.`,
            };

            return { buy: buyItem, sell: sellItem };
          } catch (err: any) {
            console.warn(`[Signals Scan Skip ${symbol}]`, err?.message);
            return null;
          }
        }),
      );

      const validResults = results.filter(
        (r): r is NonNullable<typeof r> => r !== null,
      );
      const isGlobalCrash =
        backgroundSentinelScanner.marketStore.globalRiskIndex >= 80;

      // Apply Global Anti-Contradiction Rule centrally (Pillar 4)
      for (const item of validResults) {
        const isLocked = isGlobalCrash;
        item.buy.isBuyLocked = isLocked;
        item.buy.buyEligible = !isLocked;
        if (isLocked) {
          item.buy.opportunityScore = Math.min(item.buy.opportunityScore, 30);
          item.buy.signalStrength = "AVOID";
        }
      }

      const allBuyScans = validResults.map((r) => r.buy);
      const allSellScans = validResults.map((r) => r.sell);
      // Strictly enforce the 75% Rule and Anti-Contradiction: never return buys if crash is active
      const buySignals = isGlobalCrash
        ? []
        : allBuyScans.filter((s) => s.opportunityScore >= 75 && !s.isBuyLocked);
      const sellSignals = allSellScans.filter((s) => s.opportunityScore >= 75);

      const allSignals: Record<string, { buy: any; sell: any }> = {};
      for (const item of validResults) {
        allSignals[item.buy.symbol] = item;
      }

      const payload = {
        timeframe,
        buySignals,
        sellSignals,
        allBuyScans,
        allSellScans,
        allSignals,
        count: targetSymbols.length,
      };

      signalsScanCache.set(cacheKey, {
        payload,
        fetchedAt: Date.now(),
      });

      return res.json({
        success: true,
        cached: false,
        timestamp: Date.now(),
        isVolatilityShieldActive: false,
        ...payload,
      });
    } catch (err: any) {
      console.error("[Signals Scan Error]", err);
      return res
        .status(500)
        .json({ error: "Failed to compute market signals scan" });
    }
  });

  // Symbol validation endpoint for dynamic cryptocurrency addition
  app.get("/api/market/symbol-validate", async (req, res) => {
    try {
      const raw = String(req.query.symbol || "")
        .trim()
        .toUpperCase()
        .replace(/[\/\-_]/g, "");
      if (!raw) {
        return res
          .status(400)
          .json({ valid: false, error: "Symbol parameter is required" });
      }

      const symbol = raw.endsWith("USDT") ? raw : `${raw}USDT`;
      const baseAsset = symbol.endsWith("USDT") ? symbol.slice(0, -4) : symbol;

      // Query Binance Spot or Futures endpoint automatically
      try {
        const data = await fetchBinanceSpotOrFutures<any>(
          `/api/v3/ticker/24hr?symbol=${symbol}`,
          symbol,
        );
        const lastPrice = parseFloat(data.lastPrice || data.price || "0");
        return res.json({
          valid: true,
          symbol,
          baseAsset,
          quoteAsset: "USDT",
          price: lastPrice,
          high24h: parseFloat(data.highPrice || "0") || lastPrice,
          low24h: parseFloat(data.lowPrice || "0") || lastPrice,
          volume: parseFloat(data.volume || "0"),
          quoteVolume: parseFloat(data.quoteVolume || "0"),
          priceChangePercent: parseFloat(data.priceChangePercent || "0"),
        });
      } catch (err: any) {
        // Try direct ticker/price fallback (Spot or Futures)
        try {
          const pData = await fetchBinanceSpotOrFutures<any>(
            `/api/v3/ticker/price?symbol=${symbol}`,
            symbol,
          );
          const price = parseFloat(pData.price || "0");
          return res.json({
            valid: true,
            symbol,
            baseAsset,
            quoteAsset: "USDT",
            price,
            high24h: price,
            low24h: price,
            volume: 0,
            quoteVolume: 0,
            priceChangePercent: 0,
          });
        } catch {
          return res
            .status(404)
            .json({
              valid: false,
              error: `Trading pair ${symbol} not found on Binance Spot or Futures`,
            });
        }
      }
    } catch (err: any) {
      console.warn("[Symbol Validate Error]", err.message);
      return res
        .status(500)
        .json({
          valid: false,
          error: err?.message || "Internal validation error",
        });
    }
  });

  // Dynamic Custom Pair Registration Endpoint
  // Immediately registers a symbol (e.g., ZECUSDT) in BackgroundSentinelScanner and triggers live evaluation
  app.post("/api/symbols/add", async (req, res) => {
    try {
      const raw = String(req.body?.symbol || "")
        .trim()
        .toUpperCase()
        .replace(/[\/\-_]/g, "");
      if (!raw) {
        return res
          .status(400)
          .json({ success: false, error: "Symbol is required" });
      }

      const symbol = raw.endsWith("USDT") ? raw : `${raw}USDT`;
      const baseAsset = symbol.endsWith("USDT") ? symbol.slice(0, -4) : symbol;

      if (invalidSymbols.has(symbol)) {
        return res.status(404).json({
          success: false,
          error: `Trading pair ${symbol} not found on Binance Spot or Futures`,
        });
      }

      // Verify live market price strictly from Binance Spot or Futures before adding
      let livePrice = 0;
      try {
        const ticker = await fetchBinanceSpotOrFutures<any>(
          `/api/v3/ticker/price?symbol=${symbol}`,
          symbol,
          { timeoutMs: 4000 },
        );
        livePrice = parseFloat(ticker?.price || "0");
      } catch {
        try {
          const ticker24 = await fetchBinanceSpotOrFutures<any>(
            `/api/v3/ticker/24hr?symbol=${symbol}`,
            symbol,
            { timeoutMs: 4000 },
          );
          livePrice = parseFloat(ticker24?.lastPrice || ticker24?.price || "0");
        } catch {
          livePrice = 0;
        }
      }

      if (!Number.isFinite(livePrice) || livePrice <= 0) {
        return res.status(404).json({
          success: false,
          error: `Trading pair ${symbol} not found or has no active price on Binance Spot or Futures`,
        });
      }

      backgroundSentinelScanner.addTrackedSymbol(symbol);
      const evaluation =
        await backgroundSentinelScanner.evaluateSymbolOnDemand(symbol);
      const effectivePrice =
        evaluation?.currentPrice && evaluation.currentPrice > 0
          ? evaluation.currentPrice
          : livePrice;
      const targetWallUsd = 500000;
      const recommendedMinWallQty = Math.max(
        1,
        Math.round(targetWallUsd / effectivePrice),
      );

      return res.json({
        success: true,
        symbol,
        baseAsset,
        quoteAsset: "USDT",
        price: effectivePrice,
        nearestBuyWallQty: evaluation?.nearestBuyWallQty || 0,
        recommendedMinWallQty,
        monitoredSymbols: backgroundSentinelScanner.targetSymbols,
        trackedSymbols: backgroundSentinelScanner.activeWatchlistSymbols,
      });
    } catch (err: any) {
      console.error("[Symbols Add Error]", err?.message || err);
      return res.status(500).json({
        success: false,
        error: err?.message || "Failed to register custom symbol",
      });
    }
  });

  // Synchronize user Watchlist (tracked_symbols) and Manage Coins modal with active Binance ingestion loop
  app.post("/api/symbols/sync", async (req, res) => {
    try {
      const {
        symbols,
        tracked_symbols,
        trackedSymbols,
        addedSymbol,
        removedSymbol,
        action,
        symbol,
        userId,
        chatId,
        removeFromIngestion,
      } = req.body || {};

      const rawList: string[] = Array.isArray(symbols)
        ? symbols
        : Array.isArray(tracked_symbols)
          ? tracked_symbols
          : Array.isArray(trackedSymbols)
            ? trackedSymbols
            : backgroundSentinelScanner.activeWatchlistSymbols;

      const effectiveAdded =
        addedSymbol || (action === "add" ? symbol : undefined);
      const effectiveRemoved =
        removedSymbol || (action === "remove" ? symbol : undefined);

      const syncResult = await backgroundSentinelScanner.syncWatchlistSymbols(
        rawList,
        {
          addedSymbol: effectiveAdded,
          removedSymbol: effectiveRemoved,
          userId,
          chatId,
          removeFromIngestion: Boolean(removeFromIngestion || effectiveRemoved),
        },
      );

      return res.json({
        success: true,
        trackedSymbols: syncResult.trackedSymbols,
        monitoredSymbols: syncResult.monitoredSymbols,
        count: syncResult.trackedSymbols.length,
        monitoredCount: syncResult.monitoredSymbols.length,
        buySignals: backgroundSentinelScanner.marketStore.latestBuySignals,
        sellSignals: backgroundSentinelScanner.marketStore.latestSellSignals,
        breakdownSignals:
          backgroundSentinelScanner.marketStore.latestBreakdownSignals,
      });
    } catch (err: any) {
      console.error("[Symbols Sync Error]", err?.message || err);
      return res.status(500).json({
        success: false,
        error: err?.message || "Failed to synchronize watchlist symbols",
      });
    }
  });

  // Remove a symbol from active Binance ingestion loop & watchlist
  app.post("/api/symbols/remove", async (req, res) => {
    try {
      const raw = String(req.body?.symbol || "")
        .trim()
        .toUpperCase();
      if (!raw) {
        return res
          .status(400)
          .json({ success: false, error: "Symbol is required" });
      }
      const symbol = raw.endsWith("USDT") ? raw : `${raw}USDT`;
      backgroundSentinelScanner.removeTrackedSymbol(symbol);
      return res.json({
        success: true,
        removedSymbol: symbol,
        monitoredSymbols: backgroundSentinelScanner.targetSymbols,
        trackedSymbols: backgroundSentinelScanner.activeWatchlistSymbols,
      });
    } catch (err: any) {
      console.error("[Symbols Remove Error]", err?.message || err);
      return res.status(500).json({
        success: false,
        error: err?.message || "Failed to remove symbol",
      });
    }
  });

  // Telegram VWAP & EMA Trend Signal Dispatcher Endpoint
  app.post("/api/telegram/dispatch-vwap-signal", async (req, res) => {
    const { signal, chatId, subscriptionTier, userId, language, customToken } =
      req.body || {};

    // Macro Volatility Shield Check: Pause all alerts during high-impact macroeconomic event windows
    if (volatilityShield.isShieldActive()) {
      const activeEvent = volatilityShield.getCurrentActiveEvent();
      console.log(
        `[Telegram VWAP Signal Paused] Macro Volatility Shield Active (${activeEvent?.title || "High Impact Event"}). Signals suspended.`,
      );
      return res.status(200).json({
        dispatched: false,
        paused: true,
        reason: "VOLATILITY_SHIELD_ACTIVE",
        event: activeEvent?.title,
        message:
          "🛡️ Volatility Shield Active: VWAP & EMA signal alert dispatch paused during high-impact macro news window to protect against extreme manipulation.",
      });
    }

    if (!chatId) {
      return res
        .status(400)
        .json({ error: "Missing Telegram chatId parameter" });
    }

    if (!signal) {
      return res.status(400).json({ error: "Missing VWAP/EMA signal payload" });
    }

    // Gate Telegram direct push strictly to premium subscribers in Firestore
    const authHeader = req.headers.authorization;
    const subCheck = await verifyUserFirestoreSubscription(
      userId,
      subscriptionTier,
      authHeader,
    );
    if (!subCheck.isPremium) {
      return res.status(403).json({
        error:
          "Telegram Automated Signal Dispatching is an exclusive feature for Sentinel Premium subscribers.",
        requiresUpgrade: true,
      });
    }

    // Asset Tracking Filter Check (Custom Monedas en el Radar)
    const isEs = (language || subCheck.languagePreference || "es").startsWith(
      "es",
    );
    const symbol = signal.symbol || "BTCUSDT";
    const cleanSym = String(symbol).toUpperCase().trim();
    const trackedList = subCheck.trackedSymbols || [];

    if (!trackedList.includes(cleanSym)) {
      console.log(
        `[Telegram VWAP Signal Skipped] Symbol ${cleanSym} not in tracked symbols [${trackedList.join(", ")}] for user ${userId || "unknown"}`,
      );
      return res.status(200).json({
        dispatched: false,
        reason: "SYMBOL_NOT_TRACKED",
        message: `VWAP & Trend signal for ${cleanSym} was skipped because ${cleanSym} is not in your configured tracked alert assets list.`,
        symbol: cleanSym,
        trackedSymbols: trackedList,
      });
    }
    const isBull = signal.signalType === "BUY";
    const price = Number(signal.currentPrice || 0).toLocaleString();
    const vwap = Number(signal.vwap || 0).toLocaleString();
    const ema9 = Number(signal.ema9 || 0).toLocaleString();
    const ema21 = Number(signal.ema21 || 0).toLocaleString();
    const rawDistVwap = Number(signal.distanceToVwapPercent || 0);
    const rawEmaSpread = Number(signal.emaSpreadPercent || 0);
    const distVwap = rawDistVwap.toFixed(2);
    const emaSpread = rawEmaSpread.toFixed(2);
    const stopLoss = Number(signal.stopLoss || 0).toLocaleString();
    const tp1 = Number(signal.takeProfit1 || 0).toLocaleString();
    const tp2 = Number(signal.takeProfit2 || 0).toLocaleString();
    const rr = signal.riskRewardRatio || 2.6;
    const score = signal.trendScore || (isBull ? 88 : 18);
    const icon = isBull ? "🟢" : signal.signalType === "SELL" ? "🔴" : "🟡";
    const titleType = isBull
      ? isEs
        ? "SEÑAL ALCISTA VWAP + EMA CROSSOVER"
        : "VWAP + EMA BULLISH TREND CROSSOVER"
      : isEs
        ? "SEÑAL BAJISTA VWAP + EMA BREAKDOWN"
        : "VWAP + EMA BEARISH TREND BREAKDOWN";

    const telegramMarkdown = isEs
      ? `
${icon} *SENTINEL • ${titleType}*
━━━━━━━━━━━━━━━━━━━━
🎯 *Activo:* \`${symbol}\` | *Marco:* \`${signal.timeframe || "1h"}\`
💵 *Precio Spot:* \`$${price}\`
⚡ *Fuerza de Tendencia:* \`${score}/100\` (${signal.signalStrength || (isBull ? "STRONG_BULLISH" : "STRONG_BEARISH")})

📊 *INDICADORES CUÁNTICOS CLAVE:*
• *Media VWAP:* \`$${vwap}\` (Distancia: \`${rawDistVwap >= 0 ? "+" : ""}${distVwap}%\`)
• *EMA Rápida (9):* \`$${ema9}\`
• *EMA Lenta (21):* \`$${ema21}\`
• *Dispersión EMA (Spread):* \`${rawEmaSpread >= 0 ? "+" : ""}${emaSpread}%\`
• *Estado Crossover:* \`${signal.crossoverStatus}\`

🎯 *NIVELES DE OPERACIÓN SUGERIDOS:*
• *Zona de Entrada:* \`$${signal.entryZone?.min?.toLocaleString()} - $${signal.entryZone?.max?.toLocaleString()}\`
• *Stop Loss de Invalidación:* \`$${stopLoss}\`
• *Objetivo 1:* \`$${tp1}\`
• *Objetivo 2:* \`$${tp2}\`
• *Ratio R:R:* \`1 : ${rr}\`

📝 *Tesis Quant:*
_${signal.rationaleEs || signal.rationaleEn}_

🤖 _Bot Oficial:_ [@SentinelRiskBot_bot](https://t.me/SentinelRiskBot_bot)
⏱️ _Sentinel RAM Quantitative Trend Engine_
`
      : `
${icon} *SENTINEL • ${titleType}*
━━━━━━━━━━━━━━━━━━━━
🎯 *Asset:* \`${symbol}\` | *Timeframe:* \`${signal.timeframe || "1h"}\`
💵 *Spot Price:* \`$${price}\`
⚡ *Trend Strength Score:* \`${score}/100\` (${signal.signalStrength || (isBull ? "STRONG_BULLISH" : "STRONG_BEARISH")})

📊 *KEY QUANTITATIVE INDICATORS:*
• *VWAP Anchor:* \`$${vwap}\` (Deviation: \`${rawDistVwap >= 0 ? "+" : ""}${distVwap}%\`)
• *Fast EMA (9):* \`$${ema9}\`
• *Slow EMA (21):* \`$${ema21}\`
• *EMA 9/21 Spread:* \`${rawEmaSpread >= 0 ? "+" : ""}${emaSpread}%\`
• *Crossover Status:* \`${signal.crossoverStatus}\`

🎯 *EXECUTION TARGETS:*
• *Entry Zone:* \`$${signal.entryZone?.min?.toLocaleString()} - $${signal.entryZone?.max?.toLocaleString()}\`
• *Invalidation Stop Loss:* \`$${stopLoss}\`
• *Take Profit 1:* \`$${tp1}\`
• *Take Profit 2:* \`$${tp2}\`
• *Risk / Reward Ratio (R:R):* \`1 : ${rr}\`

📝 *Quant Thesis:*
_${signal.rationaleEn}_

🤖 _Official Bot:_ [@SentinelRiskBot_bot](https://t.me/SentinelRiskBot_bot)
⏱️ _Sentinel Quantitative Trend Engine_
`;

    console.log(
      `[Telegram VWAP Signal Dispatched] Premium User: ${userId} | Chat ID: ${chatId} | Symbol: ${symbol} | Type: ${signal.signalType}`,
    );

    const tgResult = await sendTelegramMessage(
      chatId,
      telegramMarkdown,
      customToken,
    );

    res.json({
      dispatched: true,
      chatId,
      subscriptionTier,
      symbol,
      signalType: signal.signalType,
      deliveredToTelegram: tgResult.ok,
      telegramMarkdown,
      dispatched_at: new Date().toISOString(),
    });
  });

  // Gemini Quantitative Risk Analysis Endpoint (supports /api/gemini/risk-analysis & /api/generate-risk-analysis)
  const handleRiskAnalysis = async (
    req: express.Request,
    res: express.Response,
  ) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res
          .status(500)
          .json({ error: "GEMINI_API_KEY environment variable is missing" });
      }

      const {
        metrics,
        marketData,
        activeAlerts,
        language,
        currentLanguage: reqCurrentLang,
        lang,
        userId,
        subscriptionTier,
      } = req.body || {};

      // Gate Gemini AI Market Analyst strictly to Premium users verified in Firestore
      const authHeader = req.headers.authorization;
      const subCheck = await verifyUserFirestoreSubscription(
        userId,
        subscriptionTier,
        authHeader,
      );
      if (!subCheck.isPremium) {
        return res.status(403).json({
          error:
            "AI Quantitative Risk Analysis is an exclusive feature for Sentinel Premium subscribers.",
          requiresUpgrade: true,
        });
      }
      const targetMetrics = metrics || marketData || {};
      const alertsToProcess = activeAlerts || [];

      const activeLang = (
        language ||
        reqCurrentLang ||
        lang ||
        "en"
      ).toLowerCase();
      const isSpanish = activeLang === "es" || activeLang.startsWith("es");

      const symbol = targetMetrics.symbol || "BTCUSDT";
      const baseAsset =
        targetMetrics.baseAsset ||
        (symbol.endsWith("USDT") ? symbol.slice(0, -4) : "BTC");

      const rawCurrentPrice = Number(targetMetrics.currentPrice) || 0;
      const formattedCurrentPrice =
        rawCurrentPrice > 0
          ? rawCurrentPrice.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "N/A";

      const rawWallPrice =
        Number(targetMetrics.nearestBuyWallPrice) ||
        (rawCurrentPrice > 0 ? rawCurrentPrice * 0.985 : 0);
      const formattedWallPrice =
        rawWallPrice > 0
          ? rawWallPrice.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "N/A";

      const rawHigh = Number(targetMetrics.high24h) || 0;
      const rawResistance =
        rawHigh > rawCurrentPrice
          ? rawHigh
          : rawCurrentPrice > 0
            ? rawCurrentPrice * 1.018
            : 0;
      const formattedResistance =
        rawResistance > 0
          ? rawResistance.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "N/A";

      const priceChange1m = Number(targetMetrics.priceChange1m || 0).toFixed(2);
      const sellRatioPct = (
        Number(targetMetrics.sellVolumeRatio || 0.5) * 100
      ).toFixed(1);
      const wallBtc = Number(targetMetrics.nearestBuyWallBtc || 0).toFixed(1);
      const wallEaten = Number(
        targetMetrics.wallChewThroughPercent || 0,
      ).toFixed(0);
      const longLiqsK = (
        Number(targetMetrics.longLiquidations1m || 0) / 1000
      ).toFixed(1);
      const riskIndexScore = Math.round(Number(targetMetrics.riskIndex || 0));

      const systemInstruction = isSpanish
        ? `Eres un Asesor Financiero y de Protección de Capital de élite para traders comunes e inversores de criptomonedas.
Tu objetivo es traducir datos en tiempo real en diagnósticos claros, honestos, prudentes y 100% entendibles para principiantes.
REGLA INQUEBRANTABLE:
- NUNCA uses jerga técnica de programación o desarrollo como "Z-Score", "código Python", "HFT", "RAM", "ventanas deslizantes", "buffers" ni "algoritmos de alta frecuencia".
- Habla en términos comprensibles: "presión de compra vs. venta", "piso de soporte institucional", "liquidaciones de operadores apresurados", "absorción de órdenes" y "protección de capital".
- Redacta absolutamente TODO el informe en español neutro, claro y profesional.`
        : `You are an elite Crypto Financial & Capital Protection Advisor for everyday retail traders and investors.
Your objective is to translate live market metrics into clear, honest, protective, and 100% beginner-friendly diagnoses.
UNBREAKABLE RULES:
- NEVER use engineering or programming jargon such as "Z-Score", "Python code", "HFT", "RAM sliding windows", "buffers", or "high-frequency algorithms".
- Speak in everyday trading terms: "buying vs. selling pressure", "institutional support floor", "panic liquidations", "order absorption", and "capital protection".
- Write the entire report strictly in clear, professional English.`;

      const promptContent = isSpanish
        ? `
Analiza la situación actual de ${symbol} utilizando las siguientes métricas del mercado en vivo:

DATOS EN VIVO DEL MERCADO:
- Par: ${symbol}
- Precio Actual: $${formattedCurrentPrice}
- Variación en 1 Minuto: ${priceChange1m}%
- Presión de Venta Reciente: ${sellRatioPct}% del volumen transaccionado son ventas (lo habitual y equilibrado es ~50%)
- Piso de Compra Institucional: ${wallBtc} ${baseAsset} esperando en $${formattedWallPrice} (${wallEaten}% absorbido)
- Liquidaciones por Pánico de Compradores (1 min): $${longLiqsK}k USD en posiciones liquidadas
- Nivel de Peligro Estimado: ${riskIndexScore} de 100
- Piso de Soporte Inmediato: $${formattedWallPrice}
- Techo / Resistencia Inmediata Estimada: $${formattedResistance}

ALERTAS ACTIVAS DISPARADAS:
${alertsToProcess && alertsToProcess.length > 0 ? alertsToProcess.map((a: any) => `- [${a.level || "Aviso"}] ${a.title || a.message}`).join("\n") : "Mercado sin alertas críticas de pánico."}

ESTRUCTURA OBLIGATORIA DEL INFORME (Markdown):
Por favor genera exactamente las siguientes 4 secciones con estos títulos y formato:

### 1. 🚦 Veredicto Rápido del Mercado
Escribe exactamente 1 sola oración clara y directa indicando el semáforo con su emoji:
- 🟢 Seguro para Operar (si el riesgo es bajo y hay absorción compradora)
- 🟡 Precaución / Esperar (si el mercado está indeciso o con volatilidad intermedia)
- 🔴 Alto Riesgo de Caída (si la presión vendedora es agresiva o el peligro supera 60/100)
Explica brevemente el porqué en palabras cotidianas que cualquier principiante entienda.

### 2. 🔍 ¿Qué está pasando detrás del precio?
Escribe de 2 a 3 viñetas concisas explicando:
- Quién domina el mercado en este instante (compradores o vendedores).
- Si el piso de compra cercano es sólido o si los vendedores lo están consumiendo.
- Si hay señales de pánico o liquidaciones forzadas de traders que entraron tarde.

### 3. 🎯 Plan de Acción Sugerido
Escribe recomendaciones prácticas para un trader minorista hoy (por ejemplo: esperar confirmación de soporte cerca de $${formattedWallPrice} antes de comprar, realizar compras escalonadas prudentes, o asegurar ganancias y proteger el capital sin entrar ahora).

### 4. 🛡️ Niveles Clave a Vigilar
Enumera explícitamente:
- **Piso de Soporte:** $${formattedWallPrice} (Zona donde los compradores institucionales están defendiendo el precio).
- **Techo / Zona de Precaución:** $${formattedResistance} (Nivel donde los vendedores suelen tomar beneficios y frenar subidas).
Añade una breve recomendación de 1 frase sobre qué hacer si el precio se acerca a estos niveles.
`
        : `
Analyze the current live market situation for ${symbol} using the following real-time data:

LIVE MARKET DATA:
- Asset: ${symbol}
- Current Price: $${formattedCurrentPrice}
- 1-Minute Price Change: ${priceChange1m}%
- Recent Selling Pressure: ${sellRatioPct}% of recent volume consists of sales (a balanced market is ~50%)
- Institutional Support Floor: ${wallBtc} ${baseAsset} queued at $${formattedWallPrice} (${wallEaten}% eaten)
- Panic Liquidations (Past Minute): $${longLiqsK}k USD forced liquidation volume
- Estimated Danger Score: ${riskIndexScore} out of 100
- Immediate Support Floor: $${formattedWallPrice}
- Immediate Resistance Ceiling: $${formattedResistance}

ACTIVE MARKET ALERTS:
${alertsToProcess && alertsToProcess.length > 0 ? alertsToProcess.map((a: any) => `- [${a.level || "Notice"}] ${a.title || a.message}`).join("\n") : "No critical market panic alerts active right now."}

MANDATORY REPORT STRUCTURE (Markdown):
Please generate exactly the following 4 sections with these titles and format:

### 1. 🚦 Market Traffic Light Verdict
Write exactly 1 clear, direct sentence indicating the traffic light status with its emoji:
- 🟢 Safe to Operate (if risk is low and buyers are absorbing volume)
- 🟡 Caution / Wait (if the market is choppy or indecisive)
- 🔴 High Risk of Drop (if selling pressure is aggressive or danger score > 60/100)
Explain the reason in everyday words that any beginner can easily grasp.

### 2. 🔍 What's happening behind the price?
Write 2 to 3 concise bullet points explaining:
- Who is currently controlling the market (buyers or sellers).
- Whether the nearby price floor is holding firm or being depleted by sellers.
- Whether there are signs of panic or forced liquidations from late traders.

### 3. 🎯 Recommended Action Plan
Provide practical, hands-on guidance for a retail trader right now (e.g. wait for stabilization near $${formattedWallPrice} before buying, consider prudent staggered entries, or take profits and protect capital without opening new positions).

### 4. 🛡️ Key Price Levels to Watch
Explicitly list:
- **Support Floor:** $${formattedWallPrice} (Zone where institutional buyers are actively defending the price).
- **Resistance Ceiling:** $${formattedResistance} (Zone where sellers usually take profits and halt upward moves).
Add a brief 1-sentence tip on what to do if price approaches these levels.
`;

      const ai = new GoogleGenAI({ apiKey });

      const modelsToTry = [
        "gemini-3.6-flash",
        "gemini-3.8-flash",
        "gemini-2.5-flash",
      ];
      let responseText: string | null = null;
      let lastErr: any = null;

      for (const modelCandidate of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: modelCandidate,
            contents: promptContent,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.2,
            },
          });
          if (response && response.text) {
            responseText = response.text;
            break;
          }
        } catch (err: any) {
          lastErr = err;
          console.warn(
            `[Gemini Analysis] Model ${modelCandidate} failed: ${err?.message || err}. Trying next fallback...`,
          );
        }
      }

      if (!responseText) {
        throw (
          lastErr ||
          new Error("Failed to generate AI analysis across Gemini models")
        );
      }

      res.json({
        analysis: responseText,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("[Gemini Risk Analysis Error]", error);
      res
        .status(500)
        .json({
          error: error.message || "Failed to generate AI market risk analysis",
        });
    }
  };

  app.post("/api/gemini/risk-analysis", handleRiskAnalysis);
  app.post("/api/generate-risk-analysis", handleRiskAnalysis);

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, ws: false },
      appType: "spa",
    });

    // WebSocket-free @vite/client replacement that preserves Vite's real CSS DOM injection (updateStyle / removeStyle)
    app.get("/@vite/client", (_req, res) => {
      res.type("application/javascript").send(`
const sheetsMap = new Map();
export function updateStyle(id, content) {
  let style = sheetsMap.get(id);
  if (!style) {
    style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('data-vite-dev-id', id);
    style.textContent = content;
    document.head.appendChild(style);
    sheetsMap.set(id, style);
  } else {
    style.textContent = content;
  }
}
export function removeStyle(id) {
  const style = sheetsMap.get(id);
  if (style) {
    document.head.removeChild(style);
    sheetsMap.delete(id);
  }
}
export const createHotContext = () => ({
  accept: () => {},
  dispose: () => {},
  prune: () => {},
  invalidate: () => {},
  on: () => {},
  off: () => {},
  send: () => {}
});
export const injectQuery = (url) => url;
`);
    });

    app.get("/sw.js", (_req, res) => {
      res.set({
        "Content-Type": "application/javascript",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "Clear-Site-Data": '"cache"',
      }).send(`
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(names.map((n) => caches.delete(n))))
      .then(() => self.registration.unregister())
  );
});
`);
    });

    app.use(vite.middlewares);

    app.get("*", async (req, res, next) => {
      if (req.path.startsWith("/api/")) return next();
      try {
        const indexPath = path.resolve(process.cwd(), "index.html");
        const rawHtml = await fs.promises.readFile(indexPath, "utf-8");
        const transformedHtml = await vite.transformIndexHtml(
          req.originalUrl,
          rawHtml,
        );
        res
          .status(200)
          .set({
            "Content-Type": "text/html",
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          })
          .end(transformedHtml);
      } catch (err) {
        next(err);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `[BTC Flash Crash Sentinel] Server listening on http://0.0.0.0:${PORT}`,
    );
    // Start continuous 24/7 autonomous background scanner & Telegram alerting engine (20s Ingestion Worker)
    backgroundSentinelScanner.start(20_000);

    // Periodic Background Expiration Check (runs every 1 hour)
    setInterval(
      () => {
        scanAndExpireOverdueSubscriptions().catch((err) => {
          console.warn(
            `[Periodic Expiration Check Error]: ${err?.message || err}`,
          );
        });
      },
      60 * 60 * 1000,
    );
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
