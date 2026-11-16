import React, { useMemo } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  ShieldAlert,
  Sparkles,
  BrainCircuit,
  Zap,
  Flame,
  Layers,
  Send,
  Info,
  Check,
  Percent,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Radio,
  Activity,
  Compass,
  Calendar,
  Clock
} from 'lucide-react';
import { BuySignalItem, SellSignalItem, VwapEmaSignalItem, RiskMetrics } from '../types';
import { useLanguage } from '../context/LanguageContext';

export interface SignalRationaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  signalType: 'BUY' | 'SELL' | 'VWAP';
  signal: BuySignalItem | SellSignalItem | VwapEmaSignalItem | null;
  currentMetrics?: RiskMetrics | null;
  onDispatchTelegram?: (signal: any) => Promise<void>;
  isDispatchingTelegram?: boolean;
}

export const SignalRationaleModal: React.FC<SignalRationaleModalProps> = ({
  isOpen,
  onClose,
  signalType,
  signal,
  currentMetrics,
  onDispatchTelegram,
  isDispatchingTelegram = false
}) => {
  const { language } = useLanguage();
  const isEs = language.startsWith('es');

  // Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Compute Favorability Score & Institutional Assessment
  const assessment = useMemo(() => {
    if (!signal) return null;

    const isBuy = signalType === 'BUY';
    const isSell = signalType === 'SELL';
    const isVwap = signalType === 'VWAP';

    const buySig = isBuy ? (signal as BuySignalItem) : null;
    const sellSig = isSell ? (signal as SellSignalItem) : null;
    const vwapSig = isVwap ? (signal as VwapEmaSignalItem) : null;

    let favorabilityScore = 0;
    let ratingTitle = '';
    let ratingDescription = '';
    let ratingBadgeClass = '';
    let progressGradient = '';

    // -------------------------------------------------------------
    // CASE 1: VWAP & EMA TREND SCANNER
    // -------------------------------------------------------------
    if (isVwap && vwapSig) {
      const baseOpp = (vwapSig.trendScore || 50) * 0.40;

      // Crossover status contribution (max 30 pts)
      let crossPts = 0;
      if (vwapSig.crossoverStatus === 'BULLISH_CROSS' || vwapSig.crossoverStatus === 'BEARISH_CROSS') {
        crossPts = 30; // Fresh breakout
      } else if (vwapSig.crossoverStatus === 'SUSTAINED_UPTREND' || vwapSig.crossoverStatus === 'SUSTAINED_DOWNTREND') {
        crossPts = 25; // Established trend
      } else {
        crossPts = 8; // Chop / Consolidation
      }

      // VWAP anchor alignment & institutional volume backing (max 20 pts)
      const absVwapDist = Math.abs(vwapSig.distanceToVwapPercent || 0);
      let vwapPts = 0;
      if (absVwapDist >= 0.25 && absVwapDist <= 2.5) {
        vwapPts = 20; // Healthy institutional backing without being overextended
      } else if (absVwapDist > 2.5 && absVwapDist <= 4.0) {
        vwapPts = 13;
      } else if (absVwapDist < 0.25) {
        vwapPts = 10; // Testing mean line
      } else {
        vwapPts = 6; // Overextended
      }

      // EMA Spread & Expansion (max 10 pts)
      const absSpread = Math.abs(vwapSig.emaSpreadPercent || 0);
      let spreadPts = 0;
      if (absSpread >= 0.40) spreadPts = 10;
      else if (absSpread >= 0.20) spreadPts = 7;
      else spreadPts = 3;

      // Multi-timeframe confluence boost / penalty
      const mtf = vwapSig.multiTimeframe;
      let mtfPts = 0;
      if (mtf) {
        if (mtf.isMacroAligned) {
          mtfPts = 14; // +14 points for 3/3 alignment
        } else if (mtf.isCounterTrend) {
          mtfPts = -18; // -18 points penalty for counter-trend
        } else if (mtf.alignedCount === 2) {
          mtfPts = 6;
        }
      }

      favorabilityScore = Math.min(99, Math.max(18, Math.round(baseOpp + crossPts + vwapPts + spreadPts + mtfPts)));

      const isBullTrend = vwapSig.signalType === 'BUY';
      const isBearTrend = vwapSig.signalType === 'SELL';

      if (mtf?.isMacroAligned && favorabilityScore >= 85) {
        ratingTitle = isEs
          ? 'Tendencia Alineada Macro • Confluencia Triple (1H • 1S • 1M)'
          : 'Macro-Aligned Trend • Triple Timeframe Confluence (1H • 1W • 1M)';
        ratingDescription = isEs
          ? 'Máxima confluencia cuantitativa: El impulso intradiario está sincronizado con el soporte a 1 Semana y la expansión macro a 1 Mes. Los vientos de cola estructurales maximizan drásticamente la probabilidad estadística de éxito (90%+).'
          : 'Prime quantitative confluence: Intraday momentum is perfectly synchronized with 1-Week institutional support and 1-Month macro expansion. Structural tailwinds maximize statistical edge (90%+).';
        ratingBadgeClass = isBearTrend
          ? 'bg-[#F6465D]/25 text-[#F6465D] border-[#F6465D]/50 font-black'
          : 'bg-[#0ECB81]/25 text-[#0ECB81] border-[#0ECB81]/50 font-black';
        progressGradient = isBearTrend
          ? 'from-rose-500 via-[#F6465D] to-red-600'
          : 'from-emerald-500 via-[#0ECB81] to-teal-400';
      } else if (mtf?.isCounterTrend) {
        ratingTitle = isEs
          ? 'Alerta Contra-Tendencia • Intradiario vs. Estructura Macro'
          : 'Counter-Trend Warning • Intraday Setup vs. Macro Structure';
        ratingDescription = isEs
          ? 'Advertencia de riesgo: La señal intradiaria choca contra la tendencia dominante de marco temporal superior (1 Semana o 1 Mes). Se aconseja operar únicamente como scalp técnico de corto plazo con stop-loss defensivo estricto.'
          : 'Elevated risk warning: The intraday signal is fighting the prevailing higher-timeframe trend (1-Week or 1-Month). Treat strictly as a short-term scalp with tight invalidation floors and defensive risk controls.';
        ratingBadgeClass = 'bg-amber-500/25 text-amber-400 border-amber-500/50 font-black';
        progressGradient = 'from-amber-500 via-rose-500 to-red-500';
      } else if (favorabilityScore >= 80) {
        ratingTitle = isEs
          ? 'Alineación de Tendencia Fuerte • Confluencia Institucional Óptima'
          : 'Strong Trend Alignment • Prime Institutional Confluence';
        ratingDescription = isEs
          ? 'Alta confluencia cuantitativa: Las medias rápidas (EMA 9) y lentas (EMA 21) confirman una trayectoria direccional sólida respaldada por el anclaje institucional VWAP. La dispersión y el ángulo indican expansión de liquidez favorable para operaciones direccionales.'
          : 'High quantitative confluence: Fast EMA 9 and slow EMA 21 confirm robust directional trajectory anchored by the institutional VWAP benchmark. Spread expansion validates authentic volume participation over retail noise.';
        ratingBadgeClass = isBearTrend
          ? 'bg-[#F6465D]/20 text-[#F6465D] border-[#F6465D]/40'
          : 'bg-[#0ECB81]/20 text-[#0ECB81] border-[#0ECB81]/40';
        progressGradient = isBearTrend
          ? 'from-rose-500 via-[#F6465D] to-red-600'
          : 'from-emerald-500 via-[#0ECB81] to-teal-400';
      } else if (favorabilityScore >= 65) {
        ratingTitle = isEs
          ? 'Tendencia Moderada • Continuación con Gestión de Riesgo'
          : 'Moderate Trend • Continuation Setup with Risk Discipline';
        ratingDescription = isEs
          ? 'Estructura direccional favorable con sesgo definido respecto al ancla VWAP. Se recomienda entrada dentro de la zona óptima para maximizar el ratio Riesgo/Beneficio y absorber pequeñas oscilaciones intradiarias.'
          : 'Favorable directional structure with clean VWAP bias. Execution within the optimal entry zone is recommended to maximize Risk:Reward and absorb minor intraday pullbacks.';
        ratingBadgeClass = 'bg-[#F0B90B]/20 text-[#F0B90B] border-[#F0B90B]/40';
        progressGradient = 'from-amber-500 via-[#F0B90B] to-emerald-400';
      } else {
        ratingTitle = isEs
          ? 'Alerta de Rango / Volatilidad Choppy • Precaución Aconsejada'
          : 'Choppy / Low Volume Warning • Caution Advised';
        ratingDescription = isEs
          ? 'El activo se encuentra en fase de consolidación o compresión de medias cerca del ancla VWAP. El volumen no muestra una intención institucional unidireccional clara. Se aconseja esperar confirmación de ruptura limpia.'
          : 'Asset is currently consolidating or compressing EMAs near the VWAP anchor. Microstructure lacks definitive institutional volume expansion. Traders should await a clean breakout before committing capital.';
        ratingBadgeClass = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
        progressGradient = 'from-blue-500 via-amber-500 to-rose-400';
      }
    }
    // -------------------------------------------------------------
    // CASE 2: BUY SIGNAL SCANNER
    // -------------------------------------------------------------
    else if (isBuy && buySig) {
      const baseOpp = buySig.opportunityScore * 0.40;
      
      let mfiPts = 0;
      if (buySig.mfi < 20) mfiPts = 30;
      else if (buySig.mfi < 35) mfiPts = 22;
      else if (buySig.mfi < 48) mfiPts = 12;
      else mfiPts = 4;

      let fundingPts = 0;
      if (buySig.fundingRate < -0.01) fundingPts = 15;
      else if (buySig.fundingRate <= 0) fundingPts = 10;
      else if (buySig.fundingRate < 0.01) fundingPts = 5;

      let flowPts = 0;
      if (buySig.bidAbsorptionRatio >= 0.70) flowPts += 8;
      else if (buySig.bidAbsorptionRatio >= 0.55) flowPts += 5;
      if (buySig.riskRewardRatio >= 3.0) flowPts += 7;
      else if (buySig.riskRewardRatio >= 2.0) flowPts += 4;

      favorabilityScore = Math.min(99, Math.max(25, Math.round(baseOpp + mfiPts + fundingPts + flowPts)));

      if (favorabilityScore >= 82) {
        ratingTitle = isEs ? 'Alta Favorabilidad • Setup Institucional Óptimo' : 'High Favorability • Prime Institutional Setup';
        ratingDescription = isEs
          ? 'Las condiciones de microestructura muestran una capitulación de apalancamiento completa, absorción pasiva masiva en bids y agotamiento del flujo de ventas. La probabilidad estadística de rebote por reversión a la media es excepcionalmente alta.'
          : 'Microstructure indicators confirm a comprehensive leverage flush, dense passive bid wall absorption, and exhausted taker sell flow. Statistical mean-reversion rebound probability is prime.';
        ratingBadgeClass = 'bg-[#0ECB81]/20 text-[#0ECB81] border-[#0ECB81]/40';
        progressGradient = 'from-emerald-500 via-[#0ECB81] to-teal-400';
      } else if (favorabilityScore >= 68) {
        ratingTitle = isEs ? 'Favorabilidad Moderada • Rebote de Alta Probabilidad' : 'Moderate Favorability • High Probability Rebound';
        ratingDescription = isEs
          ? 'Configuración alcista favorable con sobreventa técnica evidente y desaceleración del volumen bajista. Se aconseja entrada fraccionada respetando el stop loss de soporte.'
          : 'Solid bullish alignment with evident technical oversold metrics and decelerating sell volume. Scaled entry within the target zone is advised with strict stop loss adherence.';
        ratingBadgeClass = 'bg-[#F0B90B]/20 text-[#F0B90B] border-[#F0B90B]/40';
        progressGradient = 'from-amber-500 via-[#F0B90B] to-emerald-400';
      } else {
        ratingTitle = isEs ? 'Precaución Aconsejada • Rango de Acumulación Temprana' : 'Caution Advised • Early Accumulation Range';
        ratingDescription = isEs
          ? 'El activo presenta sobreventa pero aún persiste cierta presión de volatilidad. Adecuado para acumulación gradual o confirmación de ruptura de VWAP.'
          : 'Asset is oversold but elevated market volatility remains active. Best suited for DCA accumulation or awaiting a clean VWAP reclaim confirmation.';
        ratingBadgeClass = 'bg-blue-500/20 text-blue-400 border-blue-500/40';
        progressGradient = 'from-blue-500 via-indigo-500 to-emerald-400';
      }
    }
    // -------------------------------------------------------------
    // CASE 3: SELL SIGNAL SCANNER
    // -------------------------------------------------------------
    else if (isSell && sellSig) {
      const baseOpp = sellSig.opportunityScore * 0.40;

      let mfiPts = 0;
      if (sellSig.mfi > 80) mfiPts = 30;
      else if (sellSig.mfi > 68) mfiPts = 22;
      else if (sellSig.mfi > 58) mfiPts = 12;
      else mfiPts = 4;

      let fundingPts = 0;
      if (sellSig.fundingRate > 0.03) fundingPts = 15;
      else if (sellSig.fundingRate > 0.01) fundingPts = 10;
      else if (sellSig.fundingRate >= 0) fundingPts = 5;

      let flowPts = 0;
      if (sellSig.askResistanceRatio >= 0.70) flowPts += 8;
      else if (sellSig.askResistanceRatio >= 0.55) flowPts += 5;
      if (sellSig.riskRewardRatio >= 3.0) flowPts += 7;
      else if (sellSig.riskRewardRatio >= 2.0) flowPts += 4;

      favorabilityScore = Math.min(99, Math.max(25, Math.round(baseOpp + mfiPts + fundingPts + flowPts)));

      if (favorabilityScore >= 82) {
        ratingTitle = isEs ? 'Alta Favorabilidad de Venta • Techo de Distribución Clímax' : 'High Short Favorability • Exhaustion Top Distribution';
        ratingDescription = isEs
          ? 'Clímax de liquidaciones de cortos completado en coincidencia con sobrecompra extrema del MFI y muros de venta L2 infranqueables. Las probabilidades favorecen un retroceso correctivo inmediato hacia zonas de soporte.'
          : 'Short liquidation squeeze has climaxed concurrently with extreme MFI overbought exhaustion and impenetrable L2 ask walls. Odds strongly favor an immediate mean-reversion drop into support.';
        ratingBadgeClass = 'bg-[#F6465D]/20 text-[#F6465D] border-[#F6465D]/40';
        progressGradient = 'from-rose-500 via-[#F6465D] to-red-600';
      } else if (favorabilityScore >= 68) {
        ratingTitle = isEs ? 'Distribución Moderada • Retroceso Confirmado' : 'Moderate Distribution • Confirmed Pullback Setup';
        ratingDescription = isEs
          ? 'Presión compradora perdiendo tracción frente a resistencias clave. Ratio Riesgo/Beneficio asimétrico para toma de beneficios o posiciones cortas tácticas.'
          : 'Buyer momentum is stalling against overhead resistance with heavy positive funding penalties on longs. Asymmetric Risk:Reward profile for tactical take-profits or shorts.';
        ratingBadgeClass = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
        progressGradient = 'from-amber-500 via-orange-500 to-rose-500';
      } else {
        ratingTitle = isEs ? 'Vigilancia de Resistencia • Volatilidad Elevada' : 'Resistance Watch • Elevated Trend Momentum';
        ratingDescription = isEs
          ? 'El activo se encuentra en zona de resistencia pero conserva impulso alcista. Espere un rechazo confirmado o ruptura bajista de VWAP antes de ejecutar.'
          : 'Asset is testing major ceiling levels but momentum remains energetic. Wait for a confirmed order book rejection or VWAP breakdown prior to execution.';
        ratingBadgeClass = 'bg-purple-500/20 text-purple-400 border-purple-500/40';
        progressGradient = 'from-purple-500 via-pink-500 to-rose-500';
      }
    }

    return {
      favorabilityScore,
      ratingTitle,
      ratingDescription,
      ratingBadgeClass,
      progressGradient
    };
  }, [signal, signalType, isEs]);

  if (!isOpen || !signal || !assessment) return null;

  const isBuy = signalType === 'BUY';
  const isSell = signalType === 'SELL';
  const isVwap = signalType === 'VWAP';

  const buySignal = isBuy ? (signal as BuySignalItem) : null;
  const sellSignal = isSell ? (signal as SellSignalItem) : null;
  const vwapSignal = isVwap ? (signal as VwapEmaSignalItem) : null;

  const formatPrice = (p: number) => {
    if (!Number.isFinite(p) || p <= 0) return '—';
    if (p < 0.0001) return `$${p.toFixed(8)}`;
    if (p < 1) return `$${p.toFixed(6)}`;
    return `$${p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getHeaderIcon = () => {
    if (isVwap) {
      if (vwapSignal?.signalType === 'BUY') return <TrendingUp className="w-5 h-5 text-[#0ECB81]" />;
      if (vwapSignal?.signalType === 'SELL') return <TrendingDown className="w-5 h-5 text-[#F6465D]" />;
      return <Activity className="w-5 h-5 text-[#F0B90B]" />;
    }
    return isBuy ? <TrendingUp className="w-5 h-5 text-[#0ECB81]" /> : <TrendingDown className="w-5 h-5 text-[#F6465D]" />;
  };

  const getHeaderBadge = () => {
    if (isVwap && vwapSignal) {
      const isBull = vwapSignal.signalType === 'BUY';
      const isBear = vwapSignal.signalType === 'SELL';
      return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono uppercase border ${
          isBull
            ? 'bg-[#0ECB81]/20 text-[#0ECB81] border-[#0ECB81]/40'
            : isBear
            ? 'bg-[#F6465D]/20 text-[#F6465D] border-[#F6465D]/40'
            : 'bg-[#F0B90B]/20 text-[#F0B90B] border-[#F0B90B]/40'
        }`}>
          {vwapSignal.crossoverStatus.replace('_', ' ')}
        </span>
      );
    }
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono uppercase border ${
        isBuy
          ? 'bg-[#0ECB81]/20 text-[#0ECB81] border-[#0ECB81]/40'
          : 'bg-[#F6465D]/20 text-[#F6465D] border-[#F6465D]/40'
      }`}>
        {signal.signalStrength.replace('_', ' ')}
      </span>
    );
  };

  const isPositiveTheme = isVwap
    ? vwapSignal?.signalType !== 'SELL'
    : isBuy;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-[#121418] border border-[#2B2F36] rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="px-5 py-4 bg-[#181A20] border-b border-[#2B2F36] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-sm border shadow-inner ${
              isPositiveTheme
                ? 'bg-[#0ECB81]/15 border-[#0ECB81]/40'
                : 'bg-[#F6465D]/15 border-[#F6465D]/40'
            }`}>
              {getHeaderIcon()}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-mono text-[#EAECEF] tracking-tight">
                  {signal.symbol}
                </h2>
                {getHeaderBadge()}
                {isVwap && vwapSignal && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#121418] border border-[#2B2F36] text-[#F0B90B] font-bold">
                    {vwapSignal.timeframe}
                  </span>
                )}
                <span className="text-xs font-mono font-semibold text-[#848E9C]">
                  {formatPrice(signal.currentPrice)}
                </span>
              </div>
              <p className="text-[11px] text-[#848E9C] font-mono mt-0.5">
                {isVwap
                  ? (isEs
                      ? `Analizador Cuántico de Confluencia de Tendencia • VWAP & EMA 9/21 [${vwapSignal?.timeframe}]`
                      : `Quantum Trend Confluence & Favorability Analyzer • VWAP & EMA 9/21 [${vwapSignal?.timeframe}]`)
                  : (isEs
                      ? `Analizador Cuántico de Razón de Señal & Favorabilidad • ${isBuy ? 'Señal de Compra' : 'Señal de Venta'}`
                      : `Quantum Signal Rationale & Favorability Analyzer • ${isBuy ? 'Buy Trigger' : 'Sell Trigger'}`)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#0B0E11] hover:bg-[#2B2F36] border border-[#2B2F36] text-[#848E9C] hover:text-[#EAECEF] transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-[#EAECEF] text-xs font-mono">
          
          {/* SECTION 1: FAVORABILITY SCORE HERO */}
          <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-lg">
                <div className="flex items-center gap-2">
                  <BrainCircuit className={`w-4 h-4 ${isPositiveTheme ? 'text-[#0ECB81]' : 'text-[#F6465D]'} animate-pulse`} />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#848E9C]">
                    {isVwap
                      ? (isEs ? 'EVALUACIÓN DE CONFLUENCIA DE TENDENCIA' : 'TREND CONFLUENCE & FAVORABILITY ASSESSMENT')
                      : (isEs ? 'EVALUACIÓN DE FAVORABILIDAD & PROBABILIDAD' : 'FAVORABILITY & PROBABILITY ASSESSMENT')}
                  </span>
                </div>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${assessment.ratingBadgeClass}`}>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{assessment.ratingTitle}</span>
                </div>
                <p className="text-[11px] text-[#848E9C] font-sans leading-relaxed pt-1">
                  {assessment.ratingDescription}
                </p>
              </div>

              {/* Big Score Dial */}
              <div className="flex items-center gap-3 bg-[#0B0E11] px-4 py-3 rounded-xl border border-[#2B2F36] shrink-0 self-stretch sm:self-auto justify-center">
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-[#848E9C] block">
                    {isVwap ? (isEs ? 'CONFLUENCIA DE TENDENCIA' : 'TREND FAVORABILITY') : (isEs ? 'PUNTAJE DE FAVORABILIDAD' : 'FAVORABILITY SCORE')}
                  </span>
                  <div className="text-3xl font-black font-mono tracking-tight flex items-baseline justify-end gap-1">
                    <span className={isPositiveTheme ? 'text-[#0ECB81]' : 'text-[#F6465D]'}>
                      {assessment.favorabilityScore}%
                    </span>
                  </div>
                  <span className="text-[9px] text-[#848E9C] block">
                    {isVwap ? (isEs ? 'VWAP + EMA 9/21' : 'VWAP + EMA 9/21 Core') : (isEs ? 'Basado en 4 pilares cuantitativos' : 'Based on 4 Quantitative Pillars')}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="mt-4 pt-3 border-t border-[#2B2F36]">
              <div className="flex justify-between text-[10px] text-[#848E9C] mb-1">
                <span>{isVwap ? (isEs ? 'Consolidación / Chop' : 'Chop / Mixed') : (isEs ? 'Riesgo / Desfavorabilidad' : 'Risk / Unfavorable')}</span>
                <span className="font-bold text-[#EAECEF]">{assessment.favorabilityScore}/100</span>
                <span>{isVwap ? (isEs ? 'Alineación Fuerte' : 'Strong Alignment') : (isEs ? 'Excelente Probabilidad' : 'Prime High Probability')}</span>
              </div>
              <div className="w-full h-2 bg-[#0B0E11] rounded-full overflow-hidden border border-[#2B2F36]">
                <div
                  className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${assessment.progressGradient}`}
                  style={{ width: `${assessment.favorabilityScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: QUANTITATIVE PILLARS BREAKDOWN */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <SlidersHorizontal className="w-4 h-4 text-[#F0B90B]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#EAECEF]">
                {isVwap
                  ? (isEs ? 'DESGLOSE DE CONFLUENCIA VWAP & MEDIAS EMA' : 'VWAP & EMA CONFLUENCE DRIVERS BREAKDOWN')
                  : (isEs ? 'DESGLOSE DE LOS 4 PILARES CUANTITATIVOS' : 'THE 4 QUANTITATIVE PILLARS BREAKDOWN')}
              </h3>
            </div>

            {/* VWAP MULTI-TIMEFRAME CONFLUENCE MATRIX */}
            {isVwap && vwapSignal && (
              <div className="mb-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#EAECEF]">
                    <Layers className="w-4 h-4 text-[#F0B90B]" />
                    <span>{isEs ? 'CONFLUENCIA MULTI-MARCO (INTRADIARIO • 1 SEMANA • 1 MES)' : 'MULTI-TIMEFRAME CONFLUENCE (INTRADAY • 1-WEEK • 1-MONTH)'}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    vwapSignal.multiTimeframe?.isMacroAligned
                      ? 'bg-[#0ECB81]/20 text-[#0ECB81] border-[#0ECB81]/40'
                      : vwapSignal.multiTimeframe?.isCounterTrend
                      ? 'bg-[#F6465D]/20 text-[#F6465D] border-[#F6465D]/40'
                      : 'bg-[#F0B90B]/20 text-[#F0B90B] border-[#F0B90B]/40'
                  }`}>
                    {vwapSignal.multiTimeframe?.confluenceRating.replace(/_/g, ' ') || '3/3 CONFLUENCE'}
                  </span>
                </div>

                {/* Confluence Callout Banner */}
                <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  vwapSignal.multiTimeframe?.isMacroAligned
                    ? 'bg-[#0ECB81]/10 border-[#0ECB81]/30 text-[#EAECEF]'
                    : vwapSignal.multiTimeframe?.isCounterTrend
                    ? 'bg-amber-500/10 border-amber-500/30 text-[#EAECEF]'
                    : 'bg-[#181A20] border-[#2B2F36] text-[#EAECEF]'
                }`}>
                  {vwapSignal.multiTimeframe?.isMacroAligned ? (
                    <CheckCircle2 className="w-4 h-4 text-[#0ECB81] flex-shrink-0 mt-0.5" />
                  ) : vwapSignal.multiTimeframe?.isCounterTrend ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-4 h-4 text-[#F0B90B] flex-shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-[#EAECEF]">
                      {isEs ? vwapSignal.multiTimeframe?.titleEs : vwapSignal.multiTimeframe?.titleEn}
                    </div>
                    <div className="text-[11px] text-[#848E9C] leading-relaxed">
                      {isEs ? vwapSignal.multiTimeframe?.descriptionEs : vwapSignal.multiTimeframe?.descriptionEn}
                    </div>
                  </div>
                </div>

                {/* 3 Horizon Grid: Intraday vs Weekly 1w vs Monthly 1m */}
                {!vwapSignal.multiTimeframe ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 animate-pulse">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-3 rounded-xl bg-[#121418] border border-[#2B2F36] space-y-2">
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Horizon 1: Intraday / Short-Term */}
                    <div className="p-3 rounded-xl bg-[#121418] border border-[#2B2F36] space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1 font-bold text-[#EAECEF]">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isEs ? `Intradiario (${vwapSignal.multiTimeframe.intraday.timeframe || vwapSignal.timeframe})` : `Intraday (${vwapSignal.multiTimeframe.intraday.timeframe || vwapSignal.timeframe})`}</span>
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          vwapSignal.multiTimeframe.intraday.trend === 'BULLISH'
                            ? 'bg-[#0ECB81]/20 text-[#0ECB81]'
                            : vwapSignal.multiTimeframe.intraday.trend === 'BEARISH'
                            ? 'bg-[#F6465D]/20 text-[#F6465D]'
                            : 'bg-[#2B2F36] text-[#848E9C]'
                        }`}>
                          {vwapSignal.multiTimeframe.intraday.trend === 'BULLISH' ? 'BULL ▲' : vwapSignal.multiTimeframe.intraday.trend === 'BEARISH' ? 'BEAR ▼' : 'CHOP ▬'}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#848E9C] font-mono space-y-0.5 pt-1 border-t border-[#2B2F36]/60">
                        <div className="flex justify-between">
                          <span>VWAP:</span>
                          <strong className="text-[#EAECEF]">{formatPrice(vwapSignal.multiTimeframe.intraday.vwap)}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>EMA 9/21 Spread:</span>
                          <strong className={vwapSignal.multiTimeframe.intraday.emaSpreadPercent >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}>
                            {vwapSignal.multiTimeframe.intraday.emaSpreadPercent >= 0 ? `+${vwapSignal.multiTimeframe.intraday.emaSpreadPercent.toFixed(2)}%` : `${vwapSignal.multiTimeframe.intraday.emaSpreadPercent.toFixed(2)}%`}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span>{isEs ? 'Estructura:' : 'Structure:'}</span>
                          <strong className="text-[#EAECEF]">{vwapSignal.multiTimeframe.intraday.crossoverStatus.replace(/_/g, ' ')}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Horizon 2: Weekly (1W) */}
                    <div className="p-3 rounded-xl bg-[#121418] border border-[#2B2F36] space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1 font-bold text-[#EAECEF]">
                          <Calendar className="w-3.5 h-3.5 text-blue-400" />
                          <span>{isEs ? '1 Semana (1W)' : '1-Week (1W)'}</span>
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          vwapSignal.multiTimeframe.weekly.trend === 'BULLISH'
                            ? 'bg-[#0ECB81]/20 text-[#0ECB81]'
                            : vwapSignal.multiTimeframe.weekly.trend === 'BEARISH'
                            ? 'bg-[#F6465D]/20 text-[#F6465D]'
                            : 'bg-[#2B2F36] text-[#848E9C]'
                        }`}>
                          {vwapSignal.multiTimeframe.weekly.trend === 'BULLISH' ? 'BULL ▲' : vwapSignal.multiTimeframe.weekly.trend === 'BEARISH' ? 'BEAR ▼' : 'CHOP ▬'}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#848E9C] font-mono space-y-0.5 pt-1 border-t border-[#2B2F36]/60">
                        <div className="flex justify-between">
                          <span>{isEs ? 'VWAP Semanal:' : 'Weekly VWAP:'}</span>
                          <strong className="text-[#EAECEF]">{formatPrice(vwapSignal.multiTimeframe.weekly.vwap)}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>EMA 9/21 Spread:</span>
                          <strong className={vwapSignal.multiTimeframe.weekly.emaSpreadPercent >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}>
                            {vwapSignal.multiTimeframe.weekly.emaSpreadPercent >= 0 ? `+${vwapSignal.multiTimeframe.weekly.emaSpreadPercent.toFixed(2)}%` : `${vwapSignal.multiTimeframe.weekly.emaSpreadPercent.toFixed(2)}%`}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span>{isEs ? 'Estructura:' : 'Structure:'}</span>
                          <strong className="text-[#EAECEF]">{vwapSignal.multiTimeframe.weekly.crossoverStatus.replace(/_/g, ' ')}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Horizon 3: Monthly (1M) */}
                    <div className="p-3 rounded-xl bg-[#121418] border border-[#2B2F36] space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1 font-bold text-[#EAECEF]">
                          <Compass className="w-3.5 h-3.5 text-purple-400" />
                          <span>{isEs ? '1 Mes (1M Macro)' : '1-Month (1M Macro)'}</span>
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          vwapSignal.multiTimeframe.monthly.trend === 'BULLISH'
                            ? 'bg-[#0ECB81]/20 text-[#0ECB81]'
                            : vwapSignal.multiTimeframe.monthly.trend === 'BEARISH'
                            ? 'bg-[#F6465D]/20 text-[#F6465D]'
                            : 'bg-[#2B2F36] text-[#848E9C]'
                        }`}>
                          {vwapSignal.multiTimeframe.monthly.trend === 'BULLISH' ? 'BULL ▲' : vwapSignal.multiTimeframe.monthly.trend === 'BEARISH' ? 'BEAR ▼' : 'CHOP ▬'}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#848E9C] font-mono space-y-0.5 pt-1 border-t border-[#2B2F36]/60">
                        <div className="flex justify-between">
                          <span>{isEs ? 'VWAP Mensual:' : 'Monthly VWAP:'}</span>
                          <strong className="text-[#EAECEF]">{formatPrice(vwapSignal.multiTimeframe.monthly.vwap)}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>EMA 9/21 Spread:</span>
                          <strong className={vwapSignal.multiTimeframe.monthly.emaSpreadPercent >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}>
                            {vwapSignal.multiTimeframe.monthly.emaSpreadPercent >= 0 ? `+${vwapSignal.multiTimeframe.monthly.emaSpreadPercent.toFixed(2)}%` : `${vwapSignal.multiTimeframe.monthly.emaSpreadPercent.toFixed(2)}%`}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span>{isEs ? 'Sesgo Macro:' : 'Macro Bias:'}</span>
                          <strong className="text-[#EAECEF]">{vwapSignal.multiTimeframe.monthly.trend === 'BULLISH' ? (isEs ? 'Acumulación' : 'Accumulation') : (isEs ? 'Distribución' : 'Distribution')}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VWAP SPECIFIC PILLARS */}
            {isVwap && vwapSignal ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Pillar 1: VWAP Anchor Benchmark */}
                <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B2F36] space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#848E9C]">
                      <Compass className="w-3.5 h-3.5 text-[#F0B90B]" />
                      <span className="font-bold text-[#EAECEF]">1. VWAP Anchor (Valor Institucional)</span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      vwapSignal.isAboveVwap ? 'bg-[#0ECB81]/20 text-[#0ECB81]' : 'bg-[#F6465D]/20 text-[#F6465D]'
                    }`}>
                      {vwapSignal.isAboveVwap ? (isEs ? 'SOBRE VWAP' : 'ABOVE VWAP') : (isEs ? 'BAJO VWAP' : 'BELOW VWAP')}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pt-1">
                    <div className="text-xl font-black font-mono text-[#EAECEF]">
                      {formatPrice(vwapSignal.vwap)}
                    </div>
                    <div className={`text-[11px] font-bold ${vwapSignal.isAboveVwap ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                      {vwapSignal.distanceToVwapPercent >= 0 ? `+${vwapSignal.distanceToVwapPercent}%` : `${vwapSignal.distanceToVwapPercent}%`}
                    </div>
                  </div>

                  <p className="text-[10px] text-[#848E9C] font-sans">
                    {isEs
                      ? 'El precio ponderado por volumen (VWAP) actúa como soporte/resistencia institucional de referencia. El precio cotiza ' +
                        (vwapSignal.isAboveVwap ? 'por encima, validando acumulación institucional.' : 'por debajo, validando presión de distribución.')
                      : 'Volume-Weighted Average Price confirms authentic institutional participation. Spot trades ' +
                        (vwapSignal.isAboveVwap ? 'above VWAP, confirming institutional buying backing.' : 'below VWAP, confirming persistent distribution pressure.')}
                  </p>
                </div>

                {/* Pillar 2: Fast EMA (9) vs Slow EMA (21) Crossover */}
                <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B2F36] space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#848E9C]">
                      <Activity className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-bold text-[#EAECEF]">2. EMA 9 vs. EMA 21 Crossover</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#0B0E11] text-[#EAECEF] border border-[#2B2F36]">
                      {vwapSignal.crossoverStatus.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pt-1">
                    <div className="text-sm font-black font-mono text-[#EAECEF]">
                      <span className="text-amber-400 font-bold">EMA 9: {formatPrice(vwapSignal.ema9)}</span>
                      <span className="mx-1 text-[#5E6673]">·</span>
                      <span className="text-cyan-400 font-bold">EMA 21: {formatPrice(vwapSignal.ema21)}</span>
                    </div>
                    <div className={`text-[11px] font-bold ${vwapSignal.isEmaBullishCross ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                      {vwapSignal.isEmaBullishCross ? (isEs ? 'Cruz Alcista' : 'Bullish Cross') : (isEs ? 'Cruz Bajista' : 'Bearish Cross')}
                    </div>
                  </div>

                  <p className="text-[10px] text-[#848E9C] font-sans">
                    {isEs
                      ? 'El ángulo y la orientación de la EMA rápida (9) respecto a la EMA lenta (21) confirman la aceleración del impulso intradiario.'
                      : 'The directional angle and alignment between fast EMA 9 and slow EMA 21 confirm real-time momentum acceleration.'}
                  </p>
                </div>

                {/* Pillar 3: EMA Spread & Momentum Angle */}
                <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B2F36] space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#848E9C]">
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                      <span className="font-bold text-[#EAECEF]">3. EMA Spread & Expansión</span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      Math.abs(vwapSignal.emaSpreadPercent) >= 0.4
                        ? 'bg-[#0ECB81]/20 text-[#0ECB81]'
                        : 'bg-[#2B2F36] text-[#848E9C]'
                    }`}>
                      {Math.abs(vwapSignal.emaSpreadPercent) >= 0.4 ? (isEs ? 'Expansión Fuerte' : 'Strong Expansion') : (isEs ? 'Comprimido' : 'Compressed')}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pt-1">
                    <div className={`text-xl font-black font-mono ${vwapSignal.emaSpreadPercent >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                      {vwapSignal.emaSpreadPercent >= 0 ? `+${vwapSignal.emaSpreadPercent}%` : `${vwapSignal.emaSpreadPercent}%`}
                    </div>
                    <div className="text-[11px] text-[#848E9C]">
                      {isEs ? 'Dispersión de medias 9/21' : 'EMA 9/21 Spread'}
                    </div>
                  </div>

                  <p className="text-[10px] text-[#848E9C] font-sans">
                    {isEs
                      ? 'Una mayor dispersión porcentual indica que los participantes institucionales están expandiendo la tendencia con convicción y volumen genuino.'
                      : 'Higher spread percentages signify expanding conviction and true liquidity flow, filtering out false consolidation wicks.'}
                  </p>
                </div>

                {/* Pillar 4: Risk / Reward Optimization */}
                <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B2F36] space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#848E9C]">
                      <Target className="w-3.5 h-3.5 text-[#F0B90B]" />
                      <span className="font-bold text-[#EAECEF]">4. Risk : Reward Ratio</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#0ECB81]/20 text-[#0ECB81]">
                      1 : {vwapSignal.riskRewardRatio}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pt-1">
                    <div className="text-xl font-black font-mono text-[#0ECB81]">
                      1 : {vwapSignal.riskRewardRatio}
                    </div>
                    <div className="text-[11px] text-[#848E9C]">
                      {isEs ? 'Asimétrico Favorable' : 'Asymmetric Edge'}
                    </div>
                  </div>

                  <p className="text-[10px] text-[#848E9C] font-sans">
                    {isEs
                      ? 'Stop loss calibrado debajo del ancla VWAP o techo EMA 21 para minimizar el riesgo y maximizar el potencial hacia los objetivos de liquidez.'
                      : 'Stop loss is anchored strictly under VWAP or EMA 21 invalidation floors to minimize drawdown while targeting liquidity pools.'}
                  </p>
                </div>
              </div>
            ) : (
              /* BUY & SELL SPECIFIC PILLARS */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Pillar 1: Money Flow Index (MFI) */}
                <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B2F36] space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#848E9C]">
                      <Zap className={`w-3.5 h-3.5 ${isBuy ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`} />
                      <span className="font-bold text-[#EAECEF]">1. Money Flow Index (MFI 14)</span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isBuy
                        ? (buySignal?.mfi! < 20 ? 'bg-[#0ECB81]/20 text-[#0ECB81]' : 'bg-[#F0B90B]/20 text-[#F0B90B]')
                        : (sellSignal?.mfi! > 80 ? 'bg-[#F6465D]/20 text-[#F6465D]' : 'bg-amber-500/20 text-amber-400')
                    }`}>
                      {isBuy ? buySignal?.mfiCondition.replace('_', ' ') : sellSignal?.mfiCondition.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pt-1">
                    <div className="text-xl font-black font-mono text-[#EAECEF]">
                      {isBuy ? buySignal?.mfi : sellSignal?.mfi}
                      <span className="text-[10px] text-[#848E9C] font-normal"> / 100</span>
                    </div>
                    <div className="text-[11px] text-[#848E9C]">
                      {isBuy
                        ? (buySignal?.mfi! < 20 ? (isEs ? 'Sobreventa Extrema (<20)' : 'Extreme Oversold (<20)') : (isEs ? 'Sobreventa Normal (<35)' : 'Oversold (<35)'))
                        : (sellSignal?.mfi! > 80 ? (isEs ? 'Sobrecompra Extrema (>80)' : 'Extreme Overbought (>80)') : (isEs ? 'Sobrecompra Normal (>68)' : 'Overbought (>68)'))}
                    </div>
                  </div>

                  <p className="text-[10px] text-[#848E9C] font-sans">
                    {isBuy
                      ? (isEs ? 'El flujo de capital institucional indica agotamiento total de vendedores.' : 'Institutional money flow confirms complete seller exhaustion.')
                      : (isEs ? 'Euforia compradora insostenible; el flujo monetario alcanza techos de saturación.' : 'Retail buyer euphoria is unsustainable; money flow has reached saturation ceilings.')}
                  </p>
                </div>

                {/* Pillar 2: Liquidation Cascade & Squeeze Exhaustion */}
                <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B2F36] space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#848E9C]">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-bold text-[#EAECEF]">
                        {isBuy ? '2. Long Liquidation Flush' : '2. Short Liqs Squeeze Climax'}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#0B0E11] text-[#EAECEF] border border-[#2B2F36]">
                      {isBuy
                        ? (buySignal?.isCapitulationDetected ? (isEs ? 'CAPITULACIÓN' : 'CAPITULATION') : (isEs ? 'ABSORBIDO' : 'ABSORBED'))
                        : (sellSignal?.isExhaustionTopDetected ? (isEs ? 'TOP CLÍMAX' : 'CLIMAX TOP') : (isEs ? 'NORMAL' : 'NORMAL'))}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pt-1">
                    <div className="text-xl font-black font-mono text-[#EAECEF]">
                      ${isBuy
                        ? ((buySignal?.longLiquidations1m || 0) / 1000).toFixed(0)
                        : ((sellSignal?.shortLiquidations1m || 0) / 1000).toFixed(0)}k
                      <span className="text-[10px] text-[#848E9C] font-normal"> USD (1m)</span>
                    </div>
                    <div className="text-[11px] text-[#848E9C]">
                      {isBuy
                        ? (isEs ? 'Purga de stops largos' : 'Long stops flushed')
                        : (isEs ? 'Combustible de shorts agotado' : 'Short squeeze fuel exhausted')}
                    </div>
                  </div>

                  <p className="text-[10px] text-[#848E9C] font-sans">
                    {isBuy
                      ? (isEs ? 'La purga de apalancamiento forzado elimina vendedores descontrolados.' : 'Forced long leverage flush clears out market stop-runs and liquidations.')
                      : (isEs ? 'Los compradores forzados por liquidación de cortos ya se ejecutaron, dejando un vacío.' : 'Forced buyers from short liquidations have completed, creating buyer vacuum.')}
                  </p>
                </div>

                {/* Pillar 3: Funding Rate Pressures */}
                <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B2F36] space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#848E9C]">
                      <Percent className="w-3.5 h-3.5 text-blue-400" />
                      <span className="font-bold text-[#EAECEF]">3. Futures Funding Rate</span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isBuy
                        ? (buySignal?.fundingRate! < 0 ? 'bg-[#0ECB81]/20 text-[#0ECB81]' : 'bg-[#2B2F36] text-[#848E9C]')
                        : (sellSignal?.fundingRate! > 0.02 ? 'bg-[#F6465D]/20 text-[#F6465D]' : 'bg-[#2B2F36] text-[#848E9C]')
                    }`}>
                      {isBuy ? buySignal?.fundingBias : sellSignal?.fundingBias}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pt-1">
                    <div className={`text-xl font-black font-mono ${
                      isBuy
                        ? (buySignal?.fundingRate! < 0 ? 'text-[#0ECB81]' : 'text-[#EAECEF]')
                        : (sellSignal?.fundingRate! > 0.02 ? 'text-[#F6465D]' : 'text-[#EAECEF]')
                    }`}>
                      {isBuy
                        ? `${(buySignal?.fundingRate! * 100).toFixed(3)}%`
                        : `+${(sellSignal?.fundingRate! * 100).toFixed(3)}%`}
                    </div>
                    <div className="text-[11px] text-[#848E9C]">
                      {isBuy
                        ? (buySignal?.fundingRate! < 0 ? (isEs ? 'Favor al Rebote (Short Squeeze)' : 'Short Squeeze Primed') : (isEs ? 'Financiación Equilibrada' : 'Neutral Funding'))
                        : (sellSignal?.fundingRate! > 0.02 ? (isEs ? 'Largos Sobreapalancados' : 'Crowded Long Leverage') : (isEs ? 'Financiación Positiva' : 'Positive Funding'))}
                    </div>
                  </div>

                  <p className="text-[10px] text-[#848E9C] font-sans">
                    {isBuy
                      ? (isEs ? 'Financiación negativa castiga a vendedores en corto y propicia squeezes alcistas.' : 'Negative or discounted funding forces short sellers to pay continuous carry fees.')
                      : (isEs ? 'Largos masivos pagan altas tasas periódicas, haciéndolos vulnerables a caídas.' : 'High positive funding penalizes leveraged longs, creating cascade sell-off incentives.')}
                  </p>
                </div>

                {/* Pillar 4: Order Book Wall Defense / Resistance Rejection */}
                <div className="p-3.5 rounded-xl bg-[#181A20] border border-[#2B2F36] space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#848E9C]">
                      <Layers className="w-3.5 h-3.5 text-[#F0B90B]" />
                      <span className="font-bold text-[#EAECEF]">
                        {isBuy 
                          ? (isEs ? '4. Absorción en Soporte' : '4. Support Floor Absorption') 
                          : (isEs ? '4. Resistencia en Techo' : '4. Resistance Ceiling Capping')}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isBuy ? 'bg-[#0ECB81]/20 text-[#0ECB81]' : 'bg-[#F6465D]/20 text-[#F6465D]'
                    }`}>
                      {isBuy 
                        ? (isEs ? '🟢 Presión Vendedora Agotada' : '🟢 Sell Pressure Exhausted') 
                        : (isEs ? '🔴 Presión Compradora Agotada' : '🔴 Buy Momentum Exhausted')}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pt-1">
                    <div className="text-base sm:text-lg font-black font-mono text-[#EAECEF]">
                      {isBuy
                        ? (isEs ? 'Absorción Activa' : 'Active Absorption')
                        : (isEs ? 'Freno Institucional' : 'Institutional Ceiling')}
                    </div>
                    <div className="text-[11px] font-mono text-[#848E9C]">
                      {isBuy
                        ? `${Math.round((buySignal?.bidAbsorptionRatio || 0.5) * 100)}% volumen comprador`
                        : `${Math.round((sellSignal?.askResistanceRatio || 0.5) * 100)}% volumen vendedor`}
                    </div>
                  </div>

                  <p className="text-[10px] text-[#848E9C] font-sans">
                    {isBuy
                      ? (isEs ? '🟢 Presión de venta agotada: Los compradores están absorbiendo la caída cerca del piso de soporte.' : '🟢 Selling pressure exhausted: Buyers are absorbing the dip near the key support floor.')
                      : (isEs ? '🔴 Presión compradora agotada: Los vendedores institucionales frenan la subida en el techo de resistencia.' : '🔴 Buying momentum exhausted: Institutional sellers are capping advance near the resistance ceiling.')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: QUANT TRADE EXECUTION MATRIX */}
          <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#F0B90B]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#EAECEF]">
                  {isEs ? 'PLAN DE EJECUCIÓN CON NIVELES REALES ATR' : 'ACTIONABLE EXECUTION PLAN (REAL ATR LEVELS)'}
                </h3>
              </div>
              <span className="text-[11px] font-bold text-[#0ECB81] font-mono">
                R:R 1 : {signal.riskRewardRatio}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-lg bg-[#0B0E11] border border-[#2B2F36]">
                <div className="text-[10px] text-[#848E9C] uppercase font-bold">
                  {isEs ? 'Zona de Entrada' : 'Entry Zone'}
                </div>
                <div className="text-xs font-bold font-mono text-[#EAECEF] mt-1 truncate">
                  {formatPrice(signal.entryZone.min)} - {formatPrice(signal.entryZone.max)}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0B0E11] border border-[#2B2F36]">
                <div className="text-[10px] text-[#F6465D] uppercase font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>{isEs ? 'Límite Stop Loss' : 'Stop Loss Limit'}</span>
                </div>
                <div className="text-xs font-bold font-mono text-[#F6465D] mt-1 flex items-baseline gap-1">
                  <span>{formatPrice(signal.stopLoss)}</span>
                  <span className="text-[10px] font-bold text-[#F6465D]">
                    {(signal as any).stopLossPercent !== undefined ? `(${(signal as any).stopLossPercent}%)` : ''}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0B0E11] border border-[#2B2F36]">
                <div className="text-[10px] text-[#0ECB81] uppercase font-bold flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  <span>{isEs ? 'Objetivo 1 (TP1)' : 'Target 1 (TP1)'}</span>
                </div>
                <div className="text-xs font-bold font-mono text-[#0ECB81] mt-1 flex items-baseline gap-1">
                  <span>{formatPrice(signal.takeProfit1)}</span>
                  <span className="text-[10px] font-black text-[#0ECB81]">
                    {(signal as any).takeProfit1Percent !== undefined 
                      ? `(+${Math.abs((signal as any).takeProfit1Percent)}%)` 
                      : ''}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0B0E11] border border-[#2B2F36]">
                <div className="text-[10px] text-[#0ECB81] uppercase font-bold flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  <span>{isEs ? 'Objetivo 2 (TP2)' : 'Target 2 (TP2)'}</span>
                </div>
                <div className="text-xs font-bold font-mono text-[#0ECB81] mt-1 flex items-baseline gap-1">
                  <span>{formatPrice(signal.takeProfit2)}</span>
                  <span className="text-[10px] font-black text-[#0ECB81]">
                    {(signal as any).takeProfit2Percent !== undefined 
                      ? `(+${Math.abs((signal as any).takeProfit2Percent)}%)` 
                      : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: INSTITUTIONAL RATIONALE TEXT */}
          <div className="bg-[#0B0E11] border border-[#2B2F36] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-[#EAECEF]">
              <Info className="w-3.5 h-3.5 text-[#F0B90B]" />
              <span>{isEs ? 'Tesis Algorítmica Institucional' : 'Institutional Algorithmic Thesis'}</span>
            </div>
            <p className="text-[11px] text-[#848E9C] font-sans leading-relaxed">
              {isEs ? signal.rationaleEs : signal.rationaleEn}
            </p>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3.5 bg-[#181A20] border-t border-[#2B2F36] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-[#848E9C]">
            <span className="w-2 h-2 rounded-full bg-[#0ECB81] animate-ping" />
            <span>{isEs ? 'Calculado en tiempo real en RAM' : 'Live in-browser RAM computation'}</span>
          </div>

          <div className="flex items-center gap-2">
            {onDispatchTelegram && (
              <button
                onClick={() => onDispatchTelegram(signal)}
                disabled={isDispatchingTelegram}
                className="px-3.5 py-1.5 bg-[#2B2F36] hover:bg-[#3B4048] active:scale-95 text-[#EAECEF] font-bold text-xs rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-[#0ECB81]" />
                <span>
                  {isDispatchingTelegram
                    ? (isEs ? 'Enviando...' : 'Dispatching...')
                    : (isEs ? 'Enviar a Telegram' : 'Push to Telegram')}
                </span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#F0B90B] hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow transition"
            >
              {isEs ? 'Entendido / Cerrar' : 'Done / Close'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
