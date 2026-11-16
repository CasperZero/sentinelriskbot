import React from 'react';
import { Cpu, Zap, Database, ShieldAlert, Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const ArchitectureDocs: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl p-6 shadow-lg space-y-6">
        
        <div className="border-b border-[#2B2F36] pb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#F0B90B]" />
            <h2 className="text-base font-bold font-mono text-[#EAECEF]">{t.archTitle}</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0ECB81]/20 text-[#0ECB81] border border-[#0ECB81]/40 font-bold">
              ZERO DATABASE • ALGO QUANT ENGINE
            </span>
          </div>
          <p className="text-xs text-[#848E9C] font-mono mt-0.5">
            {t.archSubtitle}
          </p>
        </div>

        {/* Pillar 1 */}
        <div className="bg-[#121418] p-5 rounded border border-[#2B2F36] space-y-2">
          <h3 className="text-xs font-bold font-mono text-[#F0B90B] flex items-center gap-2 uppercase tracking-wider">
            <Database className="w-4 h-4 text-[#F0B90B]" /> 1. Stateless RAM Sliding Window Engine
          </h3>
          <p className="text-xs text-[#EAECEF] leading-relaxed font-mono">
            Traditional relational or time-series databases (PostgreSQL, InfluxDB) introduce I/O latency that is unacceptable for flash-crash early warning systems.
            This application maintains all short-term tick history strictly in RAM using Python's <code className="text-[#F0B90B] bg-[#181A20] px-1 py-0.5 rounded border border-[#2B2F36]">collections.deque</code>.
          </p>
          <ul className="text-xs text-[#848E9C] font-mono list-disc list-inside space-y-1 pt-1">
            <li><strong className="text-[#EAECEF]">O(1) Appends & Purges:</strong> Older ticks outside the sliding window boundary (e.g. &gt; 300s) are evicted immediately from the left of the double-ended queue.</li>
            <li><strong className="text-[#EAECEF]">Zero Disk Footprint:</strong> Runs comfortably on 256MB RAM edge instances or Kubernetes micro-containers.</li>
            <li><strong className="text-[#EAECEF]">60-Bucket Historical Baseline:</strong> Keeps rolling 1-minute sell volume samples in a fixed-size deque to compute baseline mean and variance for Z-Score calculation.</li>
          </ul>
        </div>

        {/* Pillar 2 */}
        <div className="bg-[#121418] p-5 rounded border border-[#2B2F36] space-y-2">
          <h3 className="text-xs font-bold font-mono text-[#F0B90B] flex items-center gap-2 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-[#F0B90B]" /> 2. Low-Latency WebSockets & Resilient Auto-Reconnect
          </h3>
          <p className="text-xs text-[#EAECEF] leading-relaxed font-mono">
            Consumes public low-latency streams directly from major exchange endpoints (<code className="text-[#F0B90B] bg-[#181A20] px-1 py-0.5 rounded border border-[#2B2F36]">stream.binance.com</code> and <code className="text-[#F0B90B] bg-[#181A20] px-1 py-0.5 rounded border border-[#2B2F36]">fstream.binance.com</code>):
          </p>
          <ul className="text-xs text-[#848E9C] font-mono list-disc list-inside space-y-1 pt-1">
            <li><strong className="text-[#EAECEF]">Spot Trades & L2 Depth:</strong> Subscribes to <code className="text-[#EAECEF]">btcusdt@trade</code> and <code className="text-[#EAECEF]">btcusdt@depth20@100ms</code>.</li>
            <li><strong className="text-[#EAECEF]">Futures Force Orders:</strong> Subscribes to <code className="text-[#EAECEF]">btcusdt@forceOrder</code> to detect long position liquidations in real-time.</li>
            <li><strong className="text-[#EAECEF]">Exponential Backoff:</strong> Automatically recovers from network disconnects or exchange restarts with reconnect delay scaling from 1s to 60s max.</li>
          </ul>
        </div>

        {/* Pillar 3 */}
        <div className="bg-[#121418] p-5 rounded border border-[#2B2F36] space-y-2">
          <h3 className="text-xs font-bold font-mono text-[#F0B90B] flex items-center gap-2 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-[#F0B90B]" /> 3. Trigger Engine Rules & Formulas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs font-mono">
            <div className="bg-[#181A20] p-3 rounded border border-[#2B2F36]">
              <span className="text-[#F6465D] font-bold block mb-1">Rule 1: Sell Acceleration</span>
              <p className="text-[#848E9C] text-[11px]">
                Z-Score formula: <br />
                <code className="text-[#F0B90B]">Z = (V_1m - μ) / σ</code><br />
                Triggers when Z &gt; 2.5 or Sell Ratio &gt; 70%.
              </p>
            </div>

            <div className="bg-[#181A20] p-3 rounded border border-[#2B2F36]">
              <span className="text-[#F0B90B] font-bold block mb-1">Rule 2: Wall Breakdown</span>
              <p className="text-[#848E9C] text-[11px]">
                Tracks top bid walls &gt; 80 BTC.<br />
                Triggers when wall quantity drops by &gt; 75%.
              </p>
            </div>

            <div className="bg-[#181A20] p-3 rounded border border-[#2B2F36]">
              <span className="text-orange-400 font-bold block mb-1">Rule 3: Liq Cascade</span>
              <p className="text-[#848E9C] text-[11px]">
                Sums forced long sales in 1m.<br />
                Triggers when 1m liquidations &gt; $500k USD.
              </p>
            </div>
          </div>
        </div>

        {/* Pillar 4 */}
        <div className="bg-[#121418] p-5 rounded border border-[#2B2F36] space-y-2">
          <h3 className="text-xs font-bold font-mono text-[#F0B90B] flex items-center gap-2 uppercase tracking-wider">
            <Send className="w-4 h-4 text-[#F0B90B]" /> 4. Non-Blocking Async Notification Dispatch
          </h3>
          <p className="text-xs text-[#EAECEF] leading-relaxed font-mono">
            Uses <code className="text-[#F0B90B] bg-[#181A20] px-1 py-0.5 rounded border border-[#2B2F36]">aiohttp.ClientSession</code> to push alerts concurrently without blocking incoming WebSocket tick processing. Supports both custom HTTP Webhook JSON endpoints and Telegram Bot Markdown messages.
          </p>
        </div>

        {/* Pillar 5: Recommended Algorithmic Risk Mitigation & Sentinel Parameter Tuning */}
        <div className="bg-[#121418] p-5 rounded border border-[#2B2F36] space-y-4">
          <h3 className="text-xs font-bold font-mono text-[#F0B90B] flex items-center gap-2 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-[#F0B90B]" /> 5. Recommended Algorithmic Risk Mitigation & Sentinel Parameter Tuning
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-[#181A20] p-4 rounded border border-[#2B2F36] space-y-2">
              <h4 className="text-sm font-bold text-[#EAECEF] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F6465D]" />
                Recommended Algorithmic Risk Mitigation
              </h4>
              <ul className="text-[#848E9C] space-y-2 pt-1">
                <li>
                  <strong className="text-[#EAECEF]">• Immediate Quote Halt:</strong> Immediately suspend all two-sided quoting and liquidity-provision orders for BTCUSDT market-making algorithms to avoid toxic fills.
                </li>
                <li>
                  <strong className="text-[#EAECEF]">• Slippage &amp; Routing Controls:</strong> Transition execution algorithms to a passive &quot;Reduce-Only&quot; mode, tighten maximum allowable slippage tolerances to &lt; 2 bps (0.02%), and force an immediate automated socket reconnect to re-validate L2 orderbook depth integrity.
                </li>
              </ul>
            </div>

            <div className="bg-[#181A20] p-4 rounded border border-[#2B2F36] space-y-2">
              <h4 className="text-sm font-bold text-[#EAECEF] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F0B90B]" />
                Python Sentinel Parameter Tuning Suggestion
              </h4>
              <ul className="text-[#848E9C] space-y-2 pt-1">
                <li>
                  <strong className="text-[#EAECEF]">• Two-Tailed Anomaly Detection:</strong> Update the Z-score trigger condition from a one-tailed threshold (<code className="text-[#F0B90B]">sell_volume_zscore &gt; 2.5</code>) to a two-tailed absolute boundary check (<code className="text-[#F0B90B]">abs(sell_volume_zscore) &gt; 2.5</code>) to flag extreme structural order-flow imbalances in both directions.
                </li>
                <li>
                  <strong className="text-[#EAECEF]">• Data Integrity Guardrails:</strong> Add an explicit telemetry assertion rule within the sliding window class to instantly assign a high risk score whenever orderbook depth yields null or zero values:
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-[#0B0E11] p-4 rounded-lg border border-[#2B2F36] font-mono text-xs text-[#EAECEF] space-y-2">
            <div className="text-[11px] text-[#848E9C] font-bold uppercase flex items-center justify-between">
              <span>Sentinel Data Integrity Assertion (Python)</span>
              <span className="text-[#0ECB81]">CRITICAL GUARDRAIL</span>
            </div>
            <pre className="text-[#F0B90B] overflow-x-auto p-2 bg-[#181A20] rounded border border-[#2B2F36] text-[11px] leading-relaxed">
{`# Sentinel Data Integrity Assertion
if bid_wall_depth_btc == 0.0 or ask_wall_depth_btc == 0.0:
    composite_risk_index = max(composite_risk_index, 85)
    raise TelemetryAnomalyError("Critical L2 orderbook depth void detected.")`}
            </pre>
          </div>
        </div>

      </div>

    </div>
  );
};
