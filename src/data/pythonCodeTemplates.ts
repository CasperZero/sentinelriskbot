import { AlertTriggerConfig } from '../types';

export function getMonolithPythonCode(config?: Partial<AlertTriggerConfig>): string {
  const sym = (config?.symbol || 'BTCUSDT').toLowerCase();
  const base = config?.baseAsset || (sym.endsWith('usdt') ? sym.slice(0, -4).toUpperCase() : 'BTC');
  const zScore = config?.sellVolumeZScoreThreshold ?? 2.5;
  const ratio = config?.sellVolumeRatioThreshold ?? 0.70;
  const wallQty = config?.minBuyWallBtc ?? 80.0;
  const chewPct = config?.wallChewThresholdPercent ?? 75.0;
  const liqSpike = config?.longLiquidationSpikeUsd ?? 500000.0;
  const webhook = config?.webhookUrl || 'http://localhost:3000/api/webhook-test';
  const tgToken = config?.telegramBotToken || '';
  const tgChat = config?.telegramChatId || '';

  return `#!/usr/bin/env python3
"""
================================================================================
${base} FLASH-CRASH EARLY WARNING SENTINEL (RAM SLIDING WINDOW ENGINE)
================================================================================
Author: Senior High-Frequency Crypto Risk Systems Engineer
Architecture: Stateless, Zero-Database, High-Performance Async I/O
Dependencies: websockets, aiohttp, numpy

FEATURES:
1. Low-Latency Public WebSockets Connection to Binance Spot & Futures Data for ${sym.toUpperCase()}.
2. RAM-based Sliding Window via collections.deque for zero-disk, ultra-fast metrics.
3. Rule 1: Sell Volume Acceleration (Z-Score & Rolling Ratio Spike).
4. Rule 2: Order Book Support Breakdown (Buy Wall Vanishing & Chew-Through).
5. Rule 3: Liquidation Cascade Detection (Long Position Liquidations Spike).
6. Telegram & HTTP Webhook Alert Dispatch Engine.
7. Resilient Auto-Reconnection Logic with Exponential Backoff & Heartbeats.
================================================================================
"""

import asyncio
import json
import logging
import math
import sys
import time
from collections import deque
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple, Any
import aiohttp
import websockets

# Configure high-precision logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s.%(msecs)03d [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("${base}-FlashCrash-Sentinel")

# ==============================================================================
# CONFIGURATION & THRESHOLDS
# ==============================================================================
@dataclass
class SentinelConfig:
    # Asset Settings
    symbol: str = "${sym}"
    
    # WebSocket Endpoints
    spot_ws_url: str = "wss://stream.binance.com:9443/ws/${sym}@trade/${sym}@depth20@100ms"
    futures_ws_url: str = "wss://fstream.binance.com/ws/${sym}@forceOrder"
    
    # Sliding Window Durations (seconds)
    short_window_sec: int = 60    # 1 minute
    long_window_sec: int = ${config?.slidingWindowSeconds ?? 300}    # 5 minutes
    
    # Alert Rule 1: Sell Volume Acceleration
    sell_volume_zscore_threshold: float = ${zScore}   # Standard deviations above rolling mean
    sell_volume_ratio_threshold: float = ${ratio}    # ${Math.round(ratio * 100)}%+ sells in window
    
    # Alert Rule 2: Order Book Support Breakdown
    min_buy_wall_qty: float = ${wallQty}               # Minimum size (${base}) to count as key support wall
    wall_chew_threshold_pct: float = ${chewPct}        # Wall eaten by > ${chewPct}%
    
    # Alert Rule 3: Liquidation Cascade
    long_liquidation_spike_usd: float = ${liqSpike} # USD long liquidations in 1 min
    
    # Webhook & Telegram Notifications
    webhook_url: Optional[str] = "${webhook}"
    telegram_bot_token: Optional[str] = "${tgToken}"       # e.g., "123456789:ABCdefGHI..."
    telegram_chat_id: Optional[str] = "${tgChat}"         # e.g., "-100123456789"
    
    # Reconnect Config
    max_reconnect_delay: int = 60                # Max exponential backoff delay (sec)


# ==============================================================================
# DATA MODELS
# ==============================================================================
@dataclass
class TradeEvent:
    price: float
    quantity: float
    is_sell: bool
    timestamp: float

@dataclass
class LiquidationEvent:
    price: float
    quantity: float
    usd_value: float
    side: str # "SELL" = Long liquidation
    timestamp: float


# ==============================================================================
# RAM SLIDING WINDOW ENGINE (collections.deque)
# ==============================================================================
class RAMSlidingWindowEngine:
    """
    Stateless HFT data structure keeping raw tick data strictly in RAM memory.
    Utilizes double-ended queues (deque) with time-based purging.
    """
    def __init__(self, short_window_sec: int = 60, long_window_sec: int = 300):
        self.short_window_sec = short_window_sec
        self.long_window_sec = long_window_sec
        
        # Deques storing historical ticks
        self.trades: deque[TradeEvent] = deque()
        self.liquidations: deque[LiquidationEvent] = deque()
        
        # Historical baseline tracking for Z-Score calculation
        self.historical_sell_volumes_1m: deque[float] = deque(maxlen=60) # Last 60 minutes of 1m volumes
        self._last_bucket_time = time.time()
        self._current_1m_sell_vol = 0.0

    def add_trade(self, price: float, quantity: float, is_sell: bool, timestamp: float):
        trade = TradeEvent(price, quantity, is_sell, timestamp)
        self.trades.append(trade)
        
        if is_sell:
            self._current_1m_sell_vol += quantity * price
            
        self.purge_stale(timestamp)

    def add_liquidation(self, price: float, quantity: float, side: str, timestamp: float):
        usd_val = price * quantity
        liq = LiquidationEvent(price, quantity, usd_val, side, timestamp)
        self.liquidations.append(liq)
        self.purge_stale(timestamp)

    def purge_stale(self, current_time: float):
        """Purge data older than long_window_sec to prevent memory growth."""
        cutoff = current_time - self.long_window_sec
        
        while self.trades and self.trades[0].timestamp < cutoff:
            self.trades.popleft()
            
        while self.liquidations and self.liquidations[0].timestamp < cutoff:
            self.liquidations.popleft()

        # Update 1m baseline sample bucket
        if current_time - self._last_bucket_time >= 60.0:
            self.historical_sell_volumes_1m.append(self._current_1m_sell_vol)
            self._current_1m_sell_vol = 0.0
            self._last_bucket_time = current_time

    def get_trade_volumes(self, window_sec: int) -> Tuple[float, float]:
        """Returns (buy_volume_usd, sell_volume_usd) within window_sec."""
        now = time.time()
        cutoff = now - window_sec
        buy_vol = 0.0
        sell_vol = 0.0
        
        for t in reversed(self.trades):
            if t.timestamp < cutoff:
                break
            usd = t.price * t.quantity
            if t.is_sell:
                sell_vol += usd
            else:
                buy_vol += usd
                
        return buy_vol, sell_vol

    def get_sell_volume_zscore(self) -> float:
        """Calculates Z-score of recent 1m sell volume against baseline history."""
        if len(self.historical_sell_volumes_1m) < 5:
            return 0.0 # Insufficient sample size
            
        _, recent_sell_vol = self.get_trade_volumes(60)
        mean_vol = sum(self.historical_sell_volumes_1m) / len(self.historical_sell_volumes_1m)
        variance = sum((x - mean_vol) ** 2 for x in self.historical_sell_volumes_1m) / len(self.historical_sell_volumes_1m)
        std_dev = math.sqrt(variance)
        
        if std_dev == 0:
            return 0.0
        return (recent_sell_vol - mean_vol) / std_dev

    def get_long_liquidations_usd(self, window_sec: int = 60) -> float:
        """Calculates total long liquidations (market sell force) in window_sec."""
        now = time.time()
        cutoff = now - window_sec
        long_liq_usd = 0.0
        
        for liq in reversed(self.liquidations):
            if liq.timestamp < cutoff:
                break
            # Long liquidations are executed as Market SELL orders
            if liq.side == "SELL":
                long_liq_usd += liq.usd_value
                
        return long_liq_usd


# ==============================================================================
# SHALLOW ORDER BOOK TRACKER
# ==============================================================================
class OrderBookTracker:
    """
    Maintains shallow L2 depth memory and evaluates buy/sell walls.
    """
    def __init__(self, min_wall_qty: float = ${wallQty}):
        self.min_wall_qty = min_wall_qty
        self.bids: Dict[float, float] = {} # price -> qty
        self.asks: Dict[float, float] = {}
        self.initial_wall_sizes: Dict[float, float] = {} # price -> original_qty

    def update_depth(self, bids: List[List[str]], asks: List[List[str]]):
        """Update top level bids and asks from WebSocket payload."""
        self.bids = {float(p): float(q) for p, q in bids}
        self.asks = {float(p): float(q) for p, q in asks}
        
        # Track initial size of detected key buy walls
        for price, qty in self.bids.items():
            if qty >= self.min_wall_qty:
                if price not in self.initial_wall_sizes:
                    self.initial_wall_sizes[price] = qty

    def get_nearest_buy_wall(self) -> Optional[Tuple[float, float, float]]:
        """Returns (price, current_qty, original_qty) for the largest nearby buy wall."""
        if not self.bids:
            return None
            
        sorted_bids = sorted(self.bids.items(), key=lambda x: x[0], reverse=True)
        for price, qty in sorted_bids:
            if qty >= self.min_wall_qty or price in self.initial_wall_sizes:
                orig_qty = self.initial_wall_sizes.get(price, qty)
                return price, qty, orig_qty
                
        return None


# ==============================================================================
# NOTIFICATION & WEBHOOK DISPATCHER
# ==============================================================================
class Notifier:
    """Async notification engine supporting HTTP Webhooks and Telegram Bot API."""
    def __init__(self, webhook_url: Optional[str], bot_token: Optional[str], chat_id: Optional[str]):
        self.webhook_url = webhook_url
        self.bot_token = bot_token
        self.chat_id = chat_id
        self.session: Optional[aiohttp.ClientSession] = None

    async def init_session(self):
        if not self.session:
            self.session = aiohttp.ClientSession()

    async def close_session(self):
        if self.session and not self.session.closed:
            await self.session.close()

    async def send_alert(self, title: str, rule: str, severity: str, details: Dict[str, Any]):
        await self.init_session()
        
        payload = {
            "app": "${base}-FlashCrash-Sentinel",
            "timestamp": time.time(),
            "iso_time": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "severity": severity,
            "rule_triggered": rule,
            "title": title,
            "details": details
        }
        
        logger.warning(f"🚨 [ALERT DETECTED] [{severity}] {title} -> {details}")
        
        # 1. Send HTTP Webhook
        if self.webhook_url:
            try:
                async with self.session.post(self.webhook_url, json=payload, timeout=5) as resp:
                    if resp.status == 200:
                        logger.info("✅ Webhook alert dispatched successfully.")
                    else:
                        logger.error(f"❌ Webhook dispatch failed with status {resp.status}")
            except Exception as e:
                logger.error(f"❌ Webhook error: {e}")

        # 2. Send Telegram Message
        if self.bot_token and self.chat_id:
            telegram_text = (
                f"🚨 *${base} FLASH CRASH ALERT* 🚨\\n"
                f"*Severity:* {severity}\\n"
                f"*Rule:* {rule}\\n"
                f"*Summary:* {title}\\n\\n"
                f"*Details:*\\n"
                f"• *${base} Price:* USD {details.get('price', 0):,.2f}\\n"
                f"• *Metric:* {details.get('metric_desc', '')}\\n"
                f"• *Value:* {details.get('value', '')}\\n"
                f"• *Threshold:* {details.get('threshold', '')}"
            )
            tg_url = f"https://api.telegram.org/bot{self.bot_token}/sendMessage"
            tg_payload = {
                "chat_id": self.chat_id,
                "text": telegram_text,
                "parse_mode": "Markdown"
            }
            try:
                async with self.session.post(tg_url, json=tg_payload, timeout=5) as resp:
                    if resp.status == 200:
                        logger.info("✅ Telegram alert dispatched successfully.")
                    else:
                        logger.error(f"❌ Telegram dispatch failed: {await resp.text()}")
            except Exception as e:
                logger.error(f"❌ Telegram error: {e}")


# ==============================================================================
# CORE TRIGGER ENGINE & WEBSOCKET SENTINEL
# ==============================================================================
class FlashCrashSentinel:
    def __init__(self, config: SentinelConfig):
        self.cfg = config
        self.ram = RAMSlidingWindowEngine(config.short_window_sec, config.long_window_sec)
        self.orderbook = OrderBookTracker(config.min_buy_wall_qty)
        self.notifier = Notifier(config.webhook_url, config.telegram_bot_token, config.telegram_chat_id)
        
        self.current_price: float = 0.0
        self.last_alert_time: Dict[str, float] = {}
        self.alert_cooldown_sec: float = 30.0 # Prevent alert spamming within 30s

    def _should_trigger(self, rule_key: str) -> bool:
        now = time.time()
        last = self.last_alert_time.get(rule_key, 0.0)
        if now - last >= self.alert_cooldown_sec:
            self.last_alert_time[rule_key] = now
            return True
        return False

    async def evaluate_triggers(self):
        """Asynchronously checks all 3 critical flash-crash warning rules."""
        if self.current_price <= 0:
            return

        now = time.time()
        
        # ----------------------------------------------------------------------
        # RULE 1: Sell Volume Acceleration Spike
        # ----------------------------------------------------------------------
        buy_5m, sell_5m = self.ram.get_trade_volumes(300)
        total_5m = buy_5m + sell_5m
        
        if total_5m > 0:
            sell_ratio = sell_5m / total_5m
            zscore = self.ram.get_sell_volume_zscore()
            
            if (sell_ratio >= self.cfg.sell_volume_ratio_threshold or zscore >= self.cfg.sell_volume_zscore_threshold) and self._should_trigger("RULE_SELL_ACCEL"):
                await self.notifier.send_alert(
                    title="Anomalous Sell Volume Acceleration Spike",
                    rule="SELL_VOLUME_ACCELERATION",
                    severity="HIGH_RISK",
                    details={
                        "price": self.current_price,
                        "metric_desc": "5-Min Sell Volume Ratio & Z-Score",
                        "value": f"{sell_ratio*100:.1f}% sells (Z-Score: {zscore:.2f})",
                        "threshold": f">{self.cfg.sell_volume_ratio_threshold*100}% or Z-Score > {self.cfg.sell_volume_zscore_threshold}"
                    }
                )

        # ----------------------------------------------------------------------
        # RULE 2: Order Book Support Breakdown (Buy Wall Consumption/Vanishing)
        # ----------------------------------------------------------------------
        wall_info = self.orderbook.get_nearest_buy_wall()
        if wall_info:
            wall_price, curr_qty, orig_qty = wall_info
            chew_pct = ((orig_qty - curr_qty) / orig_qty) * 100.0 if orig_qty > 0 else 0.0
            
            if chew_pct >= self.cfg.wall_chew_threshold_pct and self._should_trigger("RULE_WALL_BREAKDOWN"):
                await self.notifier.send_alert(
                    title=f"Key Buy Wall at USD {wall_price:,.2f} Chewed Through ({chew_pct:.1f}%)",
                    rule="ORDERBOOK_SUPPORT_BREAKDOWN",
                    severity="CRITICAL",
                    details={
                        "price": self.current_price,
                        "metric_desc": f"Buy Wall at USD {wall_price:,.2f}",
                        "value": f"{curr_qty:.1f} ${base} remaining (was {orig_qty:.1f} ${base})",
                        "threshold": f">{self.cfg.wall_chew_threshold_pct}% eaten"
                    }
                )

        # ----------------------------------------------------------------------
        # RULE 3: Liquidation Cascade (Long Liquidations Surge)
        # ----------------------------------------------------------------------
        long_liq_usd = self.ram.get_long_liquidations_usd(60)
        if long_liq_usd >= self.cfg.long_liquidation_spike_usd and self._should_trigger("RULE_LIQUIDATION_CASCADE"):
            await self.notifier.send_alert(
                title=f"Long Liquidation Cascade Spike ({long_liq_usd/1e3:,.1f}K USD)",
                rule="LIQUIDATION_CASCADE",
                severity="FLASH_CRASH_WARNING",
                details={
                    "price": self.current_price,
                    "metric_desc": "1-Min Forced Long Liquidations",
                    "value": f"USD {long_liq_usd:,.2f}",
                    "threshold": f"> USD {self.cfg.long_liquidation_spike_usd:,.2f}"
                }
            )

    async def listen_spot_websocket(self):
        """Connects to Binance Spot Trades & Shallow Orderbook with auto-reconnect."""
        retry_delay = 1
        while True:
            try:
                logger.info(f"Connecting to Spot WS: {self.cfg.spot_ws_url}")
                async with websockets.connect(self.cfg.spot_ws_url, ping_interval=20, ping_timeout=10) as ws:
                    logger.info("Connected to Binance Spot Feed!")
                    retry_delay = 1 # Reset backoff
                    
                    async for msg in ws:
                        data = json.loads(msg)
                        
                        # Handle Trade Event
                        if "e" in data and data["e"] == "trade":
                            price = float(data["p"])
                            qty = float(data["q"])
                            is_sell = data["m"] # True if buyer is market maker (i.e. sell order)
                            ts = data["T"] / 1000.0
                            
                            self.current_price = price
                            self.ram.add_trade(price, qty, is_sell, ts)
                            await self.evaluate_triggers()

                        # Handle Depth Event
                        elif "bids" in data and "asks" in data:
                            self.orderbook.update_depth(data["bids"], data["asks"])
                            await self.evaluate_triggers()
                            
            except Exception as e:
                logger.error(f"Spot WebSocket connection error: {e}. Retrying in {retry_delay}s...")
                await asyncio.sleep(retry_delay)
                retry_delay = min(retry_delay * 2, self.cfg.max_reconnect_delay)

    async def listen_futures_liquidations(self):
        """Connects to Binance Futures Force Orders (Liquidations) feed."""
        retry_delay = 1
        while True:
            try:
                logger.info(f"Connecting to Futures WS: {self.cfg.futures_ws_url}")
                async with websockets.connect(self.cfg.futures_ws_url, ping_interval=20, ping_timeout=10) as ws:
                    logger.info("Connected to Binance Futures Liquidation Feed!")
                    retry_delay = 1
                    
                    async for msg in ws:
                        data = json.loads(msg)
                        if "e" in data and data["e"] == "forceOrder":
                            o = data["o"]
                            price = float(o["p"])
                            qty = float(o["q"])
                            side = o["S"] # "SELL" = Long position liquidated
                            ts = o["T"] / 1000.0
                            
                            self.ram.add_liquidation(price, qty, side, ts)
                            await self.evaluate_triggers()
                            
            except Exception as e:
                logger.error(f"Futures WebSocket connection error: {e}. Retrying in {retry_delay}s...")
                await asyncio.sleep(retry_delay)
                retry_delay = min(retry_delay * 2, self.cfg.max_reconnect_delay)

    async def start(self):
        logger.info("=========================================================")
        logger.info(" Starting ${base} Flash Crash Sentinel (Stateless RAM Engine) ")
        logger.info("=========================================================")
        await asyncio.gather(
            self.listen_spot_websocket(),
            self.listen_futures_liquidations()
        )


# ==============================================================================
# MAIN ENTRY POINT
# ==============================================================================
if __name__ == "__main__":
    config = SentinelConfig()
    sentinel = FlashCrashSentinel(config)
    
    try:
        asyncio.run(sentinel.start())
    except KeyboardInterrupt:
        logger.info("Shutdown signal received. Exiting gracefully.")
        sys.exit(0)
`;
}

export function getModularPythonFiles(config?: Partial<AlertTriggerConfig>): Record<string, string> {
  const sym = (config?.symbol || 'BTCUSDT').toLowerCase();
  const base = config?.baseAsset || (sym.endsWith('usdt') ? sym.slice(0, -4).toUpperCase() : 'BTC');
  const zScore = config?.sellVolumeZScoreThreshold ?? 2.5;
  const ratio = config?.sellVolumeRatioThreshold ?? 0.70;
  const wallQty = config?.minBuyWallBtc ?? 80.0;
  const chewPct = config?.wallChewThresholdPercent ?? 75.0;
  const liqSpike = config?.longLiquidationSpikeUsd ?? 500000.0;
  const webhook = config?.webhookUrl || '';
  const tgToken = config?.telegramBotToken || '';
  const tgChat = config?.telegramChatId || '';

  return {
    'config.py': `"""
Configuration parameters for ${base} Risk Sentinel
"""
import os
from dataclasses import dataclass

@dataclass
class Config:
    symbol: str = os.getenv("CRYPTO_SYMBOL", "${sym}")
    spot_ws_url: str = os.getenv("SPOT_WS_URL", "wss://stream.binance.com:9443/ws/${sym}@trade/${sym}@depth20@100ms")
    futures_ws_url: str = os.getenv("FUTURES_WS_URL", "wss://fstream.binance.com/ws/${sym}@forceOrder")
    
    # Thresholds
    sell_zscore_threshold: float = float(os.getenv("SELL_ZSCORE_THRESHOLD", "${zScore}"))
    sell_ratio_threshold: float = float(os.getenv("SELL_RATIO_THRESHOLD", "${ratio}"))
    min_buy_wall_qty: float = float(os.getenv("MIN_BUY_WALL_QTY", "${wallQty}"))
    wall_chew_pct_threshold: float = float(os.getenv("WALL_CHEW_PCT", "${chewPct}"))
    long_liq_spike_usd: float = float(os.getenv("LONG_LIQ_SPIKE_USD", "${liqSpike}"))
    
    # Webhooks & Telegram
    webhook_url: str = os.getenv("WEBHOOK_URL", "${webhook}")
    telegram_bot_token: str = os.getenv("TELEGRAM_BOT_TOKEN", "${tgToken}")
    telegram_chat_id: str = os.getenv("TELEGRAM_CHAT_ID", "${tgChat}")
`,
    'sliding_window.py': `"""
RAM-based Sliding Window Engine using collections.deque
"""
import math
import time
from collections import deque
from typing import Tuple, List

class SlidingWindowEngine:
    def __init__(self, window_seconds: int = ${config?.slidingWindowSeconds ?? 300}):
        self.window_seconds = window_seconds
        self.trades = deque() # (price, qty, is_sell, timestamp)
        self.liquidations = deque() # (price, qty, side, timestamp)
        self.historical_1m_sell_vols = deque(maxlen=60)
        self.last_bucket = time.time()
        self.current_1m_sell = 0.0

    def add_trade(self, price: float, qty: float, is_sell: bool, ts: float):
        self.trades.append((price, qty, is_sell, ts))
        if is_sell:
            self.current_1m_sell += price * qty
        self.purge(ts)

    def add_liquidation(self, price: float, qty: float, side: str, ts: float):
        self.liquidations.append((price, qty, side, ts))
        self.purge(ts)

    def purge(self, current_ts: float):
        cutoff = current_ts - self.window_seconds
        while self.trades and self.trades[0][3] < cutoff:
            self.trades.popleft()
        while self.liquidations and self.liquidations[0][3] < cutoff:
            self.liquidations.popleft()

        if current_ts - self.last_bucket >= 60.0:
            self.historical_1m_sell_vols.append(self.current_1m_sell)
            self.current_1m_sell = 0.0
            self.last_bucket = current_ts

    def get_volumes(self, seconds: int) -> Tuple[float, float]:
        cutoff = time.time() - seconds
        buy = sell = 0.0
        for p, q, is_s, ts in reversed(self.trades):
            if ts < cutoff: break
            usd = p * q
            if is_s: sell += usd
            else: buy += usd
        return buy, sell

    def get_sell_zscore(self) -> float:
        if len(self.historical_1m_sell_vols) < 5: return 0.0
        _, sell_1m = self.get_volumes(60)
        avg = sum(self.historical_1m_sell_vols) / len(self.historical_1m_sell_vols)
        var = sum((x - avg)**2 for x in self.historical_1m_sell_vols) / len(self.historical_1m_sell_vols)
        std = math.sqrt(var)
        return (sell_1m - avg) / std if std > 0 else 0.0

    def get_long_liquidations_usd(self, seconds: int = 60) -> float:
        cutoff = time.time() - seconds
        total = 0.0
        for p, q, side, ts in reversed(self.liquidations):
            if ts < cutoff: break
            if side == "SELL": total += p * q
        return total
`,
    'requirements.txt': `websockets>=11.0.3
aiohttp>=3.8.5
numpy>=1.24.3
python-dotenv>=1.0.0
`,
    'Dockerfile': `FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONUNBUFFERED=1

CMD ["python", "-u", "${sym.toLowerCase()}_flash_crash_sentinel.py"]
`,
    'crypto-sentinel.service': `[Unit]
Description=${base} Flash Crash Early Warning Sentinel
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/crypto-sentinel
ExecStart=/usr/bin/python3 /opt/crypto-sentinel/${sym.toLowerCase()}_flash_crash_sentinel.py
Restart=always
RestartSec=5
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
`
  };
}

export const MONOLITH_PYTHON_CODE = getMonolithPythonCode();
export const MODULAR_PYTHON_FILES = getModularPythonFiles();

