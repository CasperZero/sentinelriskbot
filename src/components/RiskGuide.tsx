import React, { useState } from 'react';
import {
  BookOpen,
  TrendingDown,
  TrendingUp,
  Layers,
  BarChart3,
  Flame,
  ShieldCheck,
  Zap,
  Sliders,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Target,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Clock,
  DollarSign,
  Check,
  Crown,
  Send,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Volume2,
  Activity
} from 'lucide-react';
import { AlertTriggerConfig } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface RiskGuideProps {
  config: AlertTriggerConfig;
}

export const RiskGuide: React.FC<RiskGuideProps> = ({ config }) => {
  const { language } = useLanguage();
  const isEs = language === 'es';

  // Active category filter
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedCard, setExpandedCard] = useState<string | null>('buy-signals');
  const [isMobileNavExpanded, setIsMobileNavExpanded] = useState<boolean>(false);

  // Interactive Calculator State
  const [calcSellRatio, setCalcSellRatio] = useState<number>(75);
  const [calcZScore, setCalcZScore] = useState<number>(2.8);
  const [calcWallChew, setCalcWallChew] = useState<number>(85);
  const [calcLiqAmount, setCalcLiqAmount] = useState<number>(650000);

  // Evaluate risk level for calculator
  const calculateSimulatedRisk = () => {
    let score = 10;
    if (calcSellRatio > 60) score += (calcSellRatio - 60) * 0.8;
    if (calcZScore > 1.5) score += Math.min(30, (calcZScore - 1.5) * 12);
    if (calcWallChew > 20) score += (calcWallChew - 20) * 0.65;
    if (calcLiqAmount > 100000) score += Math.min(35, (calcLiqAmount / 100000) * 5);

    score = Math.min(100, Math.max(0, Math.round(score)));

    let status = 'NORMAL';
    let color = 'text-[#0ECB81] bg-[#0ECB81]/15 border-[#0ECB81]/30';
    if (score >= 85 || calcWallChew >= 90) {
      status = 'FLASH_CRASH_WARNING';
      color = 'text-[#F6465D] bg-[#F6465D]/15 border-[#F6465D]/40';
    } else if (score >= 65 || calcWallChew >= 75) {
      status = 'HIGH_RISK';
      color = 'text-[#F0B90B] bg-[#F0B90B]/15 border-[#F0B90B]/40';
    } else if (score >= 40 || calcSellRatio > 65) {
      status = 'ELEVATED';
      color = 'text-amber-400 bg-amber-500/15 border-amber-500/30';
    }

    return { score, status, color };
  };

  const simRisk = calculateSimulatedRisk();

  const toggleExpand = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Hero / Header Banner */}
      <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl p-6 relative overflow-hidden shadow-lg">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-[#F0B90B]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/30 text-[#F0B90B] text-xs font-mono font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              {isEs ? 'Manual Operativo & Guía de Riesgo' : 'Operational Manual & Risk Guide'}
            </div>
            <h2 className="text-2xl font-bold font-mono text-[#EAECEF] tracking-tight">
              {isEs ? 'Guía de Indicadores de Riesgo y Configuración' : 'Risk Indicators & Configuration Guide'}
            </h2>
            <p className="text-sm text-[#848E9C] max-w-3xl leading-relaxed">
              {isEs
                ? 'Comprenda cómo el motor Sentinel Crypto Node monitorea el flujo de órdenes en tiempo real, detecta picos anómalos de venta, analiza la liquidez en profundidad y anticipa cascadas de liquidación antes de que ocurra un flash crash.'
                : 'Understand how the Sentinel Crypto Node engine monitors real-time order flow, detects anomalous sell volume spikes, analyzes deep order book liquidity, and anticipates liquidation cascades before a flash crash occurs.'}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#0B0E11] p-3 rounded-lg border border-[#2B2F36] font-mono text-xs text-[#EAECEF]">
            <ShieldCheck className="w-8 h-8 text-[#F0B90B] flex-shrink-0" />
            <div>
              <div className="text-[10px] text-[#848E9C] uppercase font-bold">{isEs ? 'Configuración Activa' : 'Active Config'}</div>
              <div className="text-[#F0B90B] font-bold">{config.symbol}</div>
              <div className="text-[11px] text-[#848E9C]">Z-Score: &gt;{config.sellVolumeZScoreThreshold} | Wall: {config.minBuyWallBtc} {config.baseAsset}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation (Desktop vs Mobile) */}
      {(() => {
        const categories = [
          { id: 'all', labelEn: 'All Indicators & Modules', labelEs: 'Todos los Módulos', icon: <Layers className="w-3.5 h-3.5" /> },
          { id: 'vwap-scanner', labelEn: 'VWAP & EMA Scanner (New)', labelEs: 'Escáner VWAP & EMA (Nuevo)', icon: <TrendingUp className="w-3.5 h-3.5 text-[#F0B90B]" /> },
          { id: 'buy-signals', labelEn: 'Buy Signal Scanner', labelEs: 'Escáner de Señales de Compra', icon: <TrendingUp className="w-3.5 h-3.5 text-[#0ECB81]" /> },
          { id: 'sell-accel', labelEn: '1. Sell Volume Acceleration', labelEs: '1. Aceleración de Venta', icon: <TrendingDown className="w-3.5 h-3.5 text-red-400" /> },
          { id: 'wall-break', labelEn: '2. Support Wall Breakdown', labelEs: '2. Ruptura de Muro', icon: <Layers className="w-3.5 h-3.5 text-amber-400" /> },
          { id: 'book-depth', labelEn: '3. Order Book Pressure', labelEs: '3. Presión de Libro', icon: <BarChart3 className="w-3.5 h-3.5 text-blue-400" /> },
          { id: 'liq-cascade', labelEn: '4. Liquidation Cascade', labelEs: '4. Cascada Liquidación', icon: <Flame className="w-3.5 h-3.5 text-purple-400" /> },
          { id: 'best-practices', labelEn: 'Risk Rules & Checklist', labelEs: 'Reglas y Consejos', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> }
        ];

        const activeCatObj = categories.find((c) => c.id === activeCategory) || categories[0];

        return (
          <>
            {/* 1. DESKTOP / TABLET PILLS (hidden md:flex) */}
            <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-mono text-xs">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-2 rounded-lg font-semibold transition flex-shrink-0 flex items-center gap-2 border ${
                    activeCategory === cat.id
                      ? 'bg-[#F0B90B] text-slate-950 border-[#F0B90B] shadow'
                      : 'bg-[#181A20] text-[#848E9C] border-[#2B2F36] hover:text-[#EAECEF] hover:border-slate-500'
                  }`}
                >
                  <span className={activeCategory === cat.id ? 'text-slate-950' : ''}>{cat.icon}</span>
                  <span>{isEs ? cat.labelEs : cat.labelEn}</span>
                </button>
              ))}
            </div>

            {/* 2. MOBILE PILLAR NAVIGATION (md:hidden) */}
            <div className="flex md:hidden flex-col font-mono text-xs">
              <div className="flex items-center justify-between gap-2 bg-[#181A20] p-2 rounded-xl border border-[#2B2F36]">
                {/* Active Selected Pillar Indicator */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F0B90B] text-slate-950 font-bold shadow-sm flex-1 min-w-0">
                  <span className="flex-shrink-0">{activeCatObj.icon}</span>
                  <span className="truncate uppercase font-extrabold text-xs">
                    {isEs ? activeCatObj.labelEs : activeCatObj.labelEn}
                  </span>
                </div>

                {/* Expand / Collapse Button */}
                <button
                  onClick={() => setIsMobileNavExpanded(!isMobileNavExpanded)}
                  className={`px-3 py-2 rounded-lg border font-mono font-bold text-xs flex items-center gap-1.5 transition flex-shrink-0 ${
                    isMobileNavExpanded
                      ? 'bg-[#F0B90B] text-slate-950 border-[#F0B90B]'
                      : 'bg-[#121418] border-[#2B2F36] text-[#EAECEF] hover:bg-[#2B2F36]'
                  }`}
                >
                  <span>{isMobileNavExpanded ? (isEs ? 'CERRAR' : 'CLOSE') : (isEs ? 'PILARES' : 'PILLARS')}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMobileNavExpanded ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Mobile Expanded Pillar Drawer */}
              {isMobileNavExpanded && (
                <div className="mt-2 p-2 bg-[#121418] border border-[#2B2F36] rounded-xl shadow-2xl space-y-1">
                  <div className="px-2 py-1 text-[10px] uppercase font-bold text-[#848E9C] border-b border-[#2B2F36] flex justify-between items-center">
                    <span>{isEs ? 'Seleccionar Pilar o Sección' : 'Select Pillar or Section'}</span>
                    <span className="text-[#F0B90B]">8 {isEs ? 'Opciones' : 'Options'}</span>
                  </div>

                  <div className="grid grid-cols-1 gap-1 pt-1">
                    {categories.map((cat) => {
                      const isActive = activeCategory === cat.id;

                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setActiveCategory(cat.id);
                            if (['vwap-scanner', 'buy-signals', 'sell-accel', 'wall-break', 'book-depth', 'liq-cascade'].includes(cat.id)) {
                              setExpandedCard(cat.id);
                            }
                            setIsMobileNavExpanded(false); // Auto-collapse menu upon selection
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition font-mono ${
                            isActive
                              ? 'bg-[#F0B90B] text-slate-950 font-bold shadow-sm'
                              : 'text-[#EAECEF] hover:bg-[#181A20] active:bg-[#2B2F36]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={isActive ? 'text-slate-950' : ''}>{cat.icon}</span>
                            <span className="uppercase text-xs tracking-wide truncate">
                              {isEs ? cat.labelEs : cat.labelEn}
                            </span>
                          </div>

                          {isActive && <Check className="w-4 h-4 text-slate-950 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        );
      })()}

      {/* Feature Module: VWAP & EMA Trend Scanner */}
      {(activeCategory === 'all' || activeCategory === 'vwap-scanner') && (
        <div className="bg-[#181A20] border-2 border-[#F0B90B]/40 rounded-xl overflow-hidden transition shadow-xl relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#F0B90B]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div
            onClick={() => toggleExpand('vwap-scanner')}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#2B2F36]/30 transition select-none relative z-10"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-[#F0B90B]/15 border border-[#F0B90B]/40 text-[#F0B90B] shadow-lg shadow-[#F0B90B]/10">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-[#F0B90B] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {isEs ? 'MÓDULO CUÁNTICO: ALINEACIÓN TENDENCIAL Y SISTEMA DUAL EMA' : 'QUANT MODULE: TREND ALIGNMENT & DUAL EMA SYSTEM'}
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono bg-gradient-to-r from-amber-500 to-[#F0B90B] text-slate-950 font-black tracking-wider uppercase shadow">
                    PREMIUM EXCLUSIVE
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black font-mono text-[#EAECEF] mt-1">
                  {isEs ? 'Guía del Escáner Cuántico de Tendencias VWAP & EMA' : 'Quantitative VWAP & EMA Trend Scanner Operational Guide'}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#848E9C] hidden sm:inline">
                {expandedCard === 'vwap-scanner' ? (isEs ? 'Ocultar' : 'Collapse') : (isEs ? 'Ver Detalle Completo' : 'Expand Details')}
              </span>
              {expandedCard === 'vwap-scanner' ? (
                <ChevronUp className="w-5 h-5 text-[#F0B90B]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#848E9C]" />
              )}
            </div>
          </div>

          {expandedCard === 'vwap-scanner' && (
            <div className="p-6 pt-0 border-t border-[#2B2F36] space-y-6 text-sm text-[#EAECEF] relative z-10">
              
              {/* 1. Introduction & Strategy Philosophy */}
              <div className="bg-[#121418] p-5 rounded-xl border border-[#2B2F36] space-y-3 mt-4">
                <div className="flex items-center gap-2 text-[#F0B90B] font-bold font-mono text-sm uppercase">
                  <Target className="w-4 h-4" />
                  <span>{isEs ? '¿Qué es y cómo funciona el Escáner VWAP & EMA?' : 'What is the VWAP & EMA Trend Scanner?'}</span>
                </div>
                <p className="text-xs sm:text-sm text-[#848E9C] leading-relaxed">
                  {isEs
                    ? 'El Escáner Cuántico VWAP & EMA es un sistema cuantitativo diseñado para identificar la dirección genuina del flujo institucional y eliminar falsas rupturas causadas por el ruido intradiario. Combina el VWAP (Precio Ponderado por Volumen), que representa el verdadero costo promedio transaccionado por los grandes fondos, con una cinta dual de medias móviles exponenciales (EMA 9 rápida y EMA 21 lenta). El algoritmo solo valida señales cuando la aceleración del precio (cruce de EMAs) coincide en la misma dirección con la posición respecto al anclaje institucional VWAP.'
                    : 'The Quantitative VWAP & EMA Trend Scanner is an institutional trading system engineered to isolate genuine institutional flow and filter out whipsaws caused by intraday chop. It couples the VWAP (Volume-Weighted Average Price)—the benchmark price anchor of institutional market makers—with a dual exponential moving average ribbon (Fast EMA 9 & Slow EMA 21). The algorithm strictly requires both price velocity (EMA alignment) and value bias (VWAP position) to agree before confirming an actionable signal.'}
                </p>
              </div>

              {/* 2. Detailed Breakdown of the 4 Strategy Pillars */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold font-mono text-[#F0B90B] uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>{isEs ? 'Los 4 Pilares del Algoritmo Cuántico' : 'The 4 Core Indicator Pillars'}</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  
                  {/* Pillar 1: Institutional VWAP */}
                  <div className="bg-[#121418] p-4 rounded-xl border border-[#2B2F36] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[#F0B90B] font-bold text-xs uppercase flex items-center gap-1.5">
                        <Activity className="w-4 h-4" />
                        <span>1. Institutional VWAP Anchor</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30 font-bold">
                        Anclaje de Valor
                      </span>
                    </div>
                    <p className="text-[#848E9C] leading-relaxed font-sans text-xs">
                      {isEs
                        ? 'Calculado ponderando cada vela por su volumen real: VWAP = ∑(Precio Típico × Volumen) / ∑(Volumen), donde Precio Típico = (High + Low + Close) / 3. Si el precio cotiza SOBRE el VWAP, los compradores dominan el valor transaccional del periodo. Si cotiza BAJO el VWAP, los vendedores institucionales descargan inventario con descuento.'
                        : 'Calculated by weighting each candle by volume: VWAP = ∑(Typical Price × Volume) / ∑(Volume), where Typical Price = (High + Low + Close) / 3. Trading ABOVE VWAP signifies institutional buyers absorbing supply at a premium. Trading BELOW VWAP reflects aggressive institutional distribution.'}
                    </p>
                    <div className="p-2.5 bg-[#0B0E11] rounded border border-[#2B2F36] text-[11px] text-[#848E9C]">
                      <strong className="text-[#EAECEF]">{isEs ? 'Lectura de Desviación %:' : 'Deviation Reading:'}</strong>{' '}
                      {isEs
                        ? 'Desviaciones entre +0.2% y +1.5% son ideales para entradas. Desviaciones > +2.5% indican agotamiento (sobreextensión) y riesgo de retroceso hacia la media.'
                        : 'Deviations between +0.2% and +1.5% provide optimal entry zones. Stretches > +2.5% indicate overextension vulnerable to mean reversion.'}
                    </div>
                  </div>

                  {/* Pillar 2: Dual EMA Ribbon */}
                  <div className="bg-[#121418] p-4 rounded-xl border border-[#2B2F36] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-amber-400 font-bold text-xs uppercase flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4" />
                        <span>2. Dual EMA Ribbon (9 / 21)</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                        Velocidad & Dinámica
                      </span>
                    </div>
                    <p className="text-[#848E9C] leading-relaxed font-sans text-xs">
                      {isEs
                        ? 'La EMA 9 (rápida, multiplicador k=0.20) reacciona de inmediato al impulso del flujo de órdenes. La EMA 21 (lenta, k=0.09) actúa como soporte/resistencia dinámico del swing. La dispersión de medias (EMA Spread %) mide la fuerza de la expansión tendencial.'
                        : 'Fast EMA 9 (smoothing factor k=0.20) reacts immediately to order flow impulse. Slow EMA 21 (k=0.09) acts as dynamic floating trend support/resistance. The EMA Spread % quantifies expansion velocity between short and medium momentum.'}
                    </p>
                    <div className="p-2.5 bg-[#0B0E11] rounded border border-[#2B2F36] text-[11px] text-[#848E9C]">
                      <strong className="text-[#EAECEF]">{isEs ? 'Dispersión EMA (Spread):' : 'EMA Spread Metric:'}</strong>{' '}
                      {isEs
                        ? 'Spread > +0.4% confirma aceleración alcista sólida. Spread < -0.4% confirma fuerte presión bajista. Spread cerca de 0% indica compresión.'
                        : 'Spread > +0.4% confirms strong bullish acceleration. Spread < -0.4% confirms heavy downward distribution. Near 0% indicates compression.'}
                    </div>
                  </div>

                  {/* Pillar 3: Signal Conditions */}
                  <div className="bg-[#121418] p-4 rounded-xl border border-[#2B2F36] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[#0ECB81] font-bold text-xs uppercase flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>3. Signal Conditions & Triggers</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30 font-bold">
                        Gatillos Cuánticos
                      </span>
                    </div>
                    <p className="text-[#848E9C] leading-relaxed font-sans text-xs">
                      {isEs
                        ? 'Señal de COMPRA (BUY): Ocurre cuando EMA 9 cruza o se mantiene SOBRE EMA 21 Y el precio spot se sostiene SOBRE el anclaje VWAP. Señal de VENTA (SELL / SHORT): Ocurre cuando EMA 9 cruza o se mantiene BAJO EMA 21 Y el precio spot se sostiene BAJO el VWAP.'
                        : 'BUY Signal: Fast EMA 9 crosses or sustains ABOVE Slow EMA 21 AND current spot price is sustained ABOVE the VWAP line. SELL / SHORT Signal: Fast EMA 9 crosses or sustains BELOW Slow EMA 21 AND current spot price is sustained BELOW the VWAP line.'}
                    </p>
                    <div className="p-2.5 bg-[#0B0E11] rounded border border-[#2B2F36] text-[11px] text-[#848E9C]">
                      <strong className="text-[#EAECEF]">{isEs ? 'Filtro Anti-Trampas (Chop):' : 'Anti-Whipsaw Rule:'}</strong>{' '}
                      {isEs
                        ? 'Si el precio está sobre VWAP pero EMA 9 está bajo EMA 21, el sistema clasifica el estado como CONSOLIDACIÓN / CHOP y neutraliza la señal para evitar quedar atrapado.'
                        : 'If price is above VWAP but EMA 9 is below EMA 21, the system flags CHOP / CONSOLIDATION, preventing traders from entering conflicting traps.'}
                    </div>
                  </div>

                  {/* Pillar 4: Trend Score & Classification */}
                  <div className="bg-[#121418] p-4 rounded-xl border border-[#2B2F36] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-purple-400 font-bold text-xs uppercase flex items-center gap-1.5">
                        <Target className="w-4 h-4" />
                        <span>4. Trend Score & Strength</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold">
                        0 a 100 Pts
                      </span>
                    </div>
                    <p className="text-[#848E9C] leading-relaxed font-sans text-xs">
                      {isEs
                        ? 'Puntuación matemática compuesta que evalúa la fuerza relativa de la tendencia: 80-100 = Fuerte Alcista (Strong Bullish), 65-79 = Alcista Moderado, 40-64 = Neutral / Consolidación, 20-39 = Bajista Moderado, y 0-19 = Fuerte Bajista (Strong Bearish).'
                        : 'Mathematical score quantifying trend conviction: 80-100 = Strong Bullish, 65-79 = Moderate Bullish, 40-64 = Neutral / Chop, 20-39 = Moderate Bearish, and 0-19 = Strong Bearish.'}
                    </p>
                    <div className="p-2.5 bg-[#0B0E11] rounded border border-[#2B2F36] text-[11px] text-[#848E9C]">
                      <strong className="text-[#EAECEF]">{isEs ? 'Alertas Sonoras & Telegram:' : 'Audio & Telegram Push:'}</strong>{' '}
                      {isEs
                        ? 'Los cruces frescos (Bullish Cross o Bearish Breakdown) disparan un arpegio sonoro armónico y notifican de inmediato al bot de Telegram vinculado.'
                        : 'Fresh crossovers trigger harmonic browser audio chimes and dispatch automated real-time notifications to your linked Telegram bot.'}
                    </div>
                  </div>

                </div>
              </div>

              {/* 3. Algorithmic Execution Targets & Level Interpretation */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold font-mono text-[#F0B90B] uppercase tracking-wider flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>{isEs ? 'Cómo Interpretar los Niveles de Ejecución Algorítmica' : 'How to Read Algorithmic Execution Levels'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                  
                  {/* Level 1: Entry Zone */}
                  <div className="bg-[#121418] p-3.5 rounded-xl border border-[#2B2F36] space-y-1.5">
                    <div className="text-[10px] text-[#848E9C] uppercase font-bold">{isEs ? '1. Zona de Entrada' : '1. Entry Zone'}</div>
                    <div className="text-sm font-bold text-[#EAECEF]">{isEs ? 'Rango Óptimo de Entrada' : 'Optimal Entry Band'}</div>
                    <p className="text-[11px] text-[#848E9C] font-sans leading-relaxed">
                      {isEs
                        ? 'Calculada dentro del ±0.2% del precio actual cerca de la línea EMA 9. Permite posicionarse con orden límite sin perseguir velas extendidas.'
                        : 'Calculated within ±0.2% near the EMA 9 retest band. Enables limit order positioning without chasing breakout candles.'}
                    </p>
                  </div>

                  {/* Level 2: Invalidation Stop Loss */}
                  <div className="bg-[#121418] p-3.5 rounded-xl border border-[#F6465D]/30 space-y-1.5">
                    <div className="text-[10px] text-[#F6465D] uppercase font-bold">{isEs ? '2. Stop Loss Estructural' : '2. Invalidation Stop'}</div>
                    <div className="text-sm font-bold text-[#F6465D]">{isEs ? 'Punto de Invalidez (< 1.5%)' : 'Breakdown Floor (< 1.5%)'}</div>
                    <p className="text-[11px] text-[#848E9C] font-sans leading-relaxed">
                      {isEs
                        ? 'Fijado estrictamente bajo el anclaje VWAP y la EMA 21. Si el precio cierra por debajo, la tesis institucional queda refutada y se corta la pérdida de inmediato.'
                        : 'Placed strictly below the VWAP line and EMA 21 dynamic floor. A candle close through this invalidates the institutional thesis.'}
                    </p>
                  </div>

                  {/* Level 3: Target 1 */}
                  <div className="bg-[#121418] p-3.5 rounded-xl border border-[#0ECB81]/30 space-y-1.5">
                    <div className="text-[10px] text-[#0ECB81] uppercase font-bold">{isEs ? '3. Objetivo 1 (TP1)' : '3. Target 1 (TP1)'}</div>
                    <div className="text-sm font-bold text-[#0ECB81]">1 : 1.5 R:R Ratio</div>
                    <p className="text-[11px] text-[#848E9C] font-sans leading-relaxed">
                      {isEs
                        ? 'Objetivo de continuación media basado en 1.5x el riesgo asumido. Se recomienda tomar 50% de beneficio y mover el stop loss a precio de entrada (Breakeven).'
                        : 'Mean continuation target delivering 1.5x risk. Recommended to take 50% profit and trail the remaining stop loss to breakeven.'}
                    </p>
                  </div>

                  {/* Level 4: Target 2 */}
                  <div className="bg-[#121418] p-3.5 rounded-xl border border-[#0ECB81]/30 space-y-1.5">
                    <div className="text-[10px] text-[#0ECB81] uppercase font-bold">{isEs ? '4. Objetivo 2 (TP2)' : '4. Target 2 (TP2)'}</div>
                    <div className="text-sm font-bold text-[#0ECB81]">1 : 2.8+ R:R Ratio</div>
                    <p className="text-[11px] text-[#848E9C] font-sans leading-relaxed">
                      {isEs
                        ? 'Expansión de liquidez y barrido de órdenes stop contrarias. Permite capturar corridas tendenciales completas de múltiples velas.'
                        : 'Trend expansion target into opposing liquidity pools, allowing capture of extended multi-candle directional runners.'}
                    </p>
                  </div>

                </div>
              </div>

              {/* 4. Step-by-Step Operator Playbook */}
              <div className="bg-[#121418] p-5 rounded-xl border border-[#2B2F36] space-y-3">
                <h4 className="text-xs font-bold font-mono text-[#F0B90B] uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEs ? 'Guía Paso a Paso para Operar con el Escáner' : 'Step-by-Step Operator Playbook'}</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs font-mono">
                  
                  <div className="p-3 bg-[#181A20] rounded-lg border border-[#2B2F36]">
                    <div className="text-[#F0B90B] font-bold text-xs mb-1">PASO 1</div>
                    <div className="font-bold text-[#EAECEF] mb-1">{isEs ? 'Elegir Temporalidad' : 'Select Timeframe'}</div>
                    <p className="text-[11px] text-[#848E9C] font-sans">
                      {isEs
                        ? 'Use 15m para scalping intradiario, 1h para operaciones swing estándar, o 4h/1d para macro tendencias.'
                        : 'Use 15m for scalp momentum, 1h for standard day swings, and 4h/1d for macro trends.'}
                    </p>
                  </div>

                  <div className="p-3 bg-[#181A20] rounded-lg border border-[#2B2F36]">
                    <div className="text-[#F0B90B] font-bold text-xs mb-1">PASO 2</div>
                    <div className="font-bold text-[#EAECEF] mb-1">{isEs ? 'Filtrar Oportunidades' : 'Filter Opportunities'}</div>
                    <p className="text-[11px] text-[#848E9C] font-sans">
                      {isEs
                        ? 'Haga clic en el filtro "CROSSOVER" en la tabla derecha para ver solo criptos con cruces frescos activos.'
                        : 'Click the "CROSSOVER" filter in the right table to isolate assets with active crossover events.'}
                    </p>
                  </div>

                  <div className="p-3 bg-[#181A20] rounded-lg border border-[#2B2F36]">
                    <div className="text-[#F0B90B] font-bold text-xs mb-1">PASO 3</div>
                    <div className="font-bold text-[#EAECEF] mb-1">{isEs ? 'Validar Tendencia' : 'Confirm Trend Score'}</div>
                    <p className="text-[11px] text-[#848E9C] font-sans">
                      {isEs
                        ? 'Verifique que el Trend Score supere 75 pts (alcista) o esté bajo 25 pts (bajista) antes de ejecutar.'
                        : 'Ensure the Trend Score is > 75 pts (bullish) or < 25 pts (bearish) before entering.'}
                    </p>
                  </div>

                  <div className="p-3 bg-[#181A20] rounded-lg border border-[#2B2F36]">
                    <div className="text-[#F0B90B] font-bold text-xs mb-1">PASO 4</div>
                    <div className="font-bold text-[#EAECEF] mb-1">{isEs ? 'Audio & Silenciador' : 'Audio Alert Settings'}</div>
                    <p className="text-[11px] text-[#848E9C] font-sans">
                      {isEs
                        ? 'Active el botón de sonido para oír tonos ascendentes/descendentes automáticos con control de volumen.'
                        : 'Keep audio active to hear ascending/descending tones on new crossover events.'}
                    </p>
                  </div>

                  <div className="p-3 bg-[#181A20] rounded-lg border border-[#2B2F36]">
                    <div className="text-[#F0B90B] font-bold text-xs mb-1">PASO 5</div>
                    <div className="font-bold text-[#EAECEF] mb-1">{isEs ? 'Despachar a Telegram' : 'Push to Telegram'}</div>
                    <p className="text-[11px] text-[#848E9C] font-sans">
                      {isEs
                        ? 'Use el botón "Despachar a Telegram" para enviar la señal formateada con niveles y ratio R:R a su chat móvil.'
                        : 'Click "Dispatch to Telegram" to send formatted signal alerts and R:R levels to your mobile chat.'}
                    </p>
                  </div>

                </div>
              </div>

              {/* 5. Golden Rules & Pro Tips */}
              <div className="p-4 bg-gradient-to-r from-[#F0B90B]/10 via-[#181A20] to-[#121418] rounded-xl border border-[#F0B90B]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#F0B90B] uppercase">
                    <Sparkles className="w-4 h-4" />
                    <span>{isEs ? 'Consejos Pro y Prevención de Falsas Señales' : 'Pro-Tips & Whipsaw Prevention'}</span>
                  </div>
                  <p className="text-xs text-[#848E9C] max-w-3xl leading-relaxed">
                    {isEs
                      ? '• Nunca compre cuando el precio esté sobreextendido (> 2.5% sobre VWAP); espere el retesteo a la EMA 9. • Durante fines de semana de bajo volumen, exija un EMA Spread > 0.3% para confirmar volumen real. • Pruebe los botones "+ Bull Cross" y "- Bear Breakdown" para ensayar su reacción ante alertas.'
                      : '• Never buy into an overextended price (> 2.5% above VWAP); wait for a pullback to EMA 9. • In low-volume weekend sessions, require an EMA Spread > 0.3% to confirm institutional backing. • Use the "+ Bull Cross" and "- Bear Breakdown" simulation buttons in the scanner to rehearse strategy triggers.'}
                  </p>
                </div>

                <div className="flex-shrink-0 flex items-center gap-2">
                  <div className="px-3.5 py-2 rounded-xl bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30 font-mono text-xs font-bold flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" />
                    <span>{isEs ? 'Alertas Telegram Listas' : 'Telegram Signals Active'}</span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* Feature Module: Buy Signal Scanner & Opportunity Engine */}
      {(activeCategory === 'all' || activeCategory === 'buy-signals') && (
        <div className="bg-[#181A20] border-2 border-[#0ECB81]/40 rounded-xl overflow-hidden transition shadow-xl relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#0ECB81]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div
            onClick={() => toggleExpand('buy-signals')}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#2B2F36]/30 transition select-none relative z-10"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-[#0ECB81]/15 border border-[#0ECB81]/40 text-[#0ECB81] shadow-lg shadow-[#0ECB81]/10">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-[#0ECB81] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {isEs ? 'MÓDULO CUÁNTICO: MOTOR DE OPORTUNIDADES' : 'QUANT MODULE: REBOUND & ACCUMULATION ENGINE'}
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono bg-gradient-to-r from-amber-500 to-[#F0B90B] text-slate-950 font-black tracking-wider uppercase shadow">
                    PREMIUM EXCLUSIVE
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black font-mono text-[#EAECEF] mt-1">
                  {isEs ? 'Escáner Cuántico de Señales de Compra (Buy Signal Scanner)' : 'Quantitative Buy Signal Scanner & Opportunity Engine'}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#848E9C] hidden sm:inline">
                {expandedCard === 'buy-signals' ? (isEs ? 'Ocultar' : 'Collapse') : (isEs ? 'Ver Detalle Completo' : 'Expand Details')}
              </span>
              {expandedCard === 'buy-signals' ? (
                <ChevronUp className="w-5 h-5 text-[#0ECB81]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#848E9C]" />
              )}
            </div>
          </div>

          {expandedCard === 'buy-signals' && (
            <div className="p-6 pt-0 border-t border-[#2B2F36] space-y-6 text-sm text-[#EAECEF] relative z-10">
              
              {/* 1. Introduction & Core Concept */}
              <div className="bg-[#121418] p-5 rounded-xl border border-[#2B2F36] space-y-3 mt-4">
                <div className="flex items-center gap-2 text-[#0ECB81] font-bold font-mono text-sm uppercase">
                  <Target className="w-4 h-4" />
                  <span>{isEs ? '¿Qué es el Escáner de Señales de Compra?' : 'What is the Buy Signal Scanner?'}</span>
                </div>
                <p className="text-xs sm:text-sm text-[#848E9C] leading-relaxed">
                  {isEs
                    ? 'El Escáner de Señales de Compra es una herramienta cuantitativa algorítmica de grado institucional diseñada para detectar zonas de alta probabilidad de rebote, acumulación institucional y giros de mercado justo antes de una expansión alcista violenta. En lugar de intentar adivinar suelos a ciegas durante momentos de pánico, el motor RAM evalúa en tiempo real 4 pilares técnicos para generar una Puntuación de Oportunidad compuesta de 0 a 100.'
                    : 'The Buy Signal Scanner is an institutional-grade quantitative engine designed to identify high-probability reversal, accumulation, and mean-reversion zones right before violent upward price expansions. Rather than blindly guessing market bottoms during extreme fear, the Sentinel RAM Engine calculates a 0 to 100 Composite Opportunity Score based on 4 real-time technical pillars.'}
                </p>
              </div>

              {/* 2. Detailed Breakdown of the 4 Key Indicators */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold font-mono text-[#F0B90B] uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>{isEs ? 'Los 4 Indicadores Clave del Algoritmo' : 'Detailed Breakdown of the 4 Key Indicators'}</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  
                  {/* Indicator 1: MFI */}
                  <div className="bg-[#121418] p-4 rounded-xl border border-[#2B2F36] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[#0ECB81] font-bold text-xs uppercase flex items-center gap-1.5">
                        <Activity className="w-4 h-4" />
                        <span>1. Money Flow Index (MFI)</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30 font-bold">
                        Hasta +30 Pts
                      </span>
                    </div>
                    <p className="text-[#848E9C] leading-relaxed font-sans text-xs">
                      {isEs
                        ? 'El MFI (Índice de Flujo de Dinero) combina la acción del precio con el volumen transaccionado en una ventana continua. Cuando el MFI cae por debajo de 20 (sobreventa extrema) o 35 (sobreventa estándar), indica que los vendedores agresivos han agotado su inventario y el volumen de venta se seca a precios mínimos locales, preparando el giro alcista.'
                        : 'MFI incorporates both price action and trading volume across an institutional rolling window. An MFI reading below 20 (extreme oversold) or 35 (standard oversold) signals that aggressive market sellers have exhausted their inventory and selling velocity is drying up at local lows.'}
                    </p>
                  </div>

                  {/* Indicator 2: Long Liquidations Flush */}
                  <div className="bg-[#121418] p-4 rounded-xl border border-[#2B2F36] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-amber-400 font-bold text-xs uppercase flex items-center gap-1.5">
                        <Flame className="w-4 h-4" />
                        <span>{isEs ? '2. Purga de Liquidaciones de Largos' : '2. Long Liquidations Flush'}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                        Hasta +25 Pts
                      </span>
                    </div>
                    <p className="text-[#848E9C] leading-relaxed font-sans text-xs">
                      {isEs
                        ? 'Monitorea picos repentinos de liquidaciones forzadas en posiciones largas (> $80k - $500k+ USD/min). Estas cascadas barren el exceso de apalancamiento minorista (capitulación). Una vez purgadas las órdenes stop-out, la presión vendedora desaparece bruscamente, formando suelos de mercado sólidos y limpios.'
                        : 'Tracks sudden volume spikes in forced long liquidations (> $80k - $500k+ USD/min). These cascades flush out over-leveraged retail positions (capitulation). Once margin stops are cleared, selling pressure collapses to zero, forming clean structural market bottoms.'}
                    </p>
                  </div>

                  {/* Indicator 3: Funding Rates */}
                  <div className="bg-[#121418] p-4 rounded-xl border border-[#2B2F36] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-purple-400 font-bold text-xs uppercase flex items-center gap-1.5">
                        <Zap className="w-4 h-4" />
                        <span>{isEs ? '3. Tasas de Financiación de Futuros' : '3. Futures Funding Rates'}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold">
                        Hasta +25 Pts
                      </span>
                    </div>
                    <p className="text-[#848E9C] leading-relaxed font-sans text-xs">
                      {isEs
                        ? 'Evalúa las tasas de financiación (Funding Rates) de contratos perpetuos. Tasas negativas (≤ -0.005% a -0.035%) indican acumulación excesiva de posiciones cortas donde los shorters pagan altos intereses para mantener sus ventas. Cualquier compra spot desencadena cierres forzados de cortos (Short Squeeze masivo).'
                        : 'Evaluates perpetual futures funding rates. Negative funding (≤ -0.005% to -0.035%) indicates heavy short crowding where sellers pay longs to hold positions. This creates an asymmetric setup where any spot bid sparks forced short covering and a violent short-squeeze rally.'}
                    </p>
                  </div>

                  {/* Indicator 4: Order Book & Volume Absorption */}
                  <div className="bg-[#121418] p-4 rounded-xl border border-[#2B2F36] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-blue-400 font-bold text-xs uppercase flex items-center gap-1.5">
                        <BarChart3 className="w-4 h-4" />
                        <span>{isEs ? '4. Absorción en Libro L2 y Muros Pasivos' : '4. L2 Order Book & Volume Absorption'}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 font-bold">
                        Hasta +20 Pts
                      </span>
                    </div>
                    <p className="text-[#848E9C] leading-relaxed font-sans text-xs">
                      {isEs
                        ? 'Detecta la desaceleración de la velocidad de venta (Z-Score < 1.0) junto con una fuerte concentración de órdenes límite de compra en el libro L2 (≥ 65% - 80% bids). Esto confirma que ballenas e instituciones están absorbiendo pasivamente las ventas sin permitir que el precio siga cayendo.'
                        : 'Detects sell volume deceleration (Z-Score < 1.0) paired with heavy passive limit buy walls in the L2 order book (≥ 65% - 80% bids). This confirms institutional market makers are absorbing sell flow and constructing a resilient price floor.'}
                    </p>
                  </div>

                </div>
              </div>

              {/* 3. Opportunity Score Classification & Blueprint */}
              <div className="bg-[#121418] p-5 rounded-xl border border-[#2B2F36] space-y-4">
                <h4 className="text-xs font-bold font-mono text-[#EAECEF] uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#0ECB81]" />
                  <span>{isEs ? 'Escala de Puntuación de Oportunidad y Niveles de Ejecución' : 'Opportunity Score Tiers & Trade Execution Blueprint'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs font-mono text-center">
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <div className="text-emerald-400 font-extrabold text-sm">85 - 100</div>
                    <div className="text-[11px] font-bold text-[#EAECEF] mt-1">{isEs ? 'COMPRA FUERTE' : 'STRONG BUY'}</div>
                    <div className="text-[10px] text-[#848E9C] mt-0.5">{isEs ? 'Capitulación / Giro Flash' : 'Flash Crash Reversal'}</div>
                  </div>

                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                    <div className="text-green-300 font-extrabold text-sm">70 - 84</div>
                    <div className="text-[11px] font-bold text-[#EAECEF] mt-1">{isEs ? 'COMPRA MODERADA' : 'MODERATE BUY'}</div>
                    <div className="text-[10px] text-[#848E9C] mt-0.5">{isEs ? 'Rebote de Sobreventa' : 'Oversold Rebound'}</div>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <div className="text-amber-400 font-extrabold text-sm">50 - 69</div>
                    <div className="text-[11px] font-bold text-[#EAECEF] mt-1">{isEs ? 'ACUMULACIÓN' : 'ACCUMULATION'}</div>
                    <div className="text-[10px] text-[#848E9C] mt-0.5">{isEs ? 'Construcción de Base' : 'Base Construction'}</div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#181A20] border border-[#2B2F36]">
                    <div className="text-[#848E9C] font-extrabold text-sm">&lt; 50</div>
                    <div className="text-[11px] font-bold text-[#848E9C] mt-1">{isEs ? 'NEUTRAL / ESPERAR' : 'NEUTRAL / AVOID'}</div>
                    <div className="text-[10px] text-[#848E9C] mt-0.5">{isEs ? 'Sin Señal Clara' : 'No Clear Edge'}</div>
                  </div>
                </div>

                <div className="p-3.5 bg-[#181A20] rounded-lg border border-[#2B2F36] text-xs font-mono space-y-1.5">
                  <div className="text-[#F0B90B] font-bold uppercase">{isEs ? 'Niveles Cuánticos de Gestión de Riesgo:' : 'Quantitative Execution Parameters:'}</div>
                  <ul className="text-[#848E9C] space-y-1 list-disc list-inside">
                    <li><strong className="text-[#EAECEF]">{isEs ? 'Zona de Entrada:' : 'Entry Zone:'}</strong> {isEs ? 'Rango de compra algorítmica alrededor del precio spot (0.996 × P a 1.002 × P).' : 'Algorithmic limit range around current spot price (0.996 × P to 1.002 × P).'}</li>
                    <li><strong className="text-[#EAECEF]">{isEs ? 'Stop Loss Invalidador:' : 'Invalidation Stop Loss:'}</strong> {isEs ? 'Calculado a < 1.5% justo por debajo del muro de compra/soporte más cercano.' : 'Calculated at < 1.5% directly below the nearest major L2 buy wall cluster.'}</li>
                    <li><strong className="text-[#EAECEF]">{isEs ? 'Objetivo 1 (Rebote a la Media):' : 'Take Profit 1 (Mean Reversion):'}</strong> {isEs ? '+2.6% de ganancia rápida para asegurar punto de equilibrio.' : '+2.6% quick target to de-risk and move stop to break-even.'}</li>
                    <li><strong className="text-[#EAECEF]">{isEs ? 'Objetivo 2 (Expansión de Liquidez):' : 'Take Profit 2 (Liquidity Expansion):'}</strong> {isEs ? '+5.8% para capturar la mecha de barrido de cortos.' : '+5.8% targeting resting overhead ask liquidity.'}</li>
                    <li><strong className="text-[#0ECB81]">{isEs ? 'Ratio Riesgo/Beneficio (R:R):' : 'Risk/Reward Ratio (R:R):'}</strong> {isEs ? 'Optimizado algorítmicamente para ratios asimétricos ≥ 1 : 3.5.' : 'Optimized algorithmically for asymmetric ≥ 1 : 3.5 payout ratios.'}</li>
                  </ul>
                </div>
              </div>

              {/* 4. Exclusive Premium Benefit & Telegram Integration */}
              <div className="bg-gradient-to-r from-amber-500/10 via-[#181A20] to-[#0ECB81]/10 p-5 rounded-xl border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold font-mono text-amber-400 uppercase">
                      {isEs ? 'Beneficio Exclusivo del Plan Premium con Alertas Telegram' : 'Exclusive Premium Tier Feature with Telegram Dispatch'}
                    </span>
                  </div>
                  <p className="text-xs text-[#848E9C] max-w-2xl leading-relaxed">
                    {isEs
                      ? 'El Escáner de Señales de Compra y las alertas push automáticas a Telegram con puntuaciones superiores a 85 están reservados exclusivamente para suscriptores de Sentinel PRO ($29/mes, $149/semestral o $249/anual). Vincula tu Chat ID de Telegram en el menú de usuario para recibir señales con niveles exactos de entrada y stop loss en milisegundos.'
                      : 'The Buy Signal Scanner and automated real-time Telegram dispatch alerts (for scores ≥ 85) are exclusively available to Sentinel PRO subscribers ($29/mo, $149/6mo, or $249/yr). Link your Telegram Chat ID in the user menu to receive high-conviction buy setups with precise entry, stop loss, and targets directly to your phone in milliseconds.'}
                  </p>
                </div>

                <div className="flex-shrink-0 flex items-center gap-2">
                  <div className="px-3.5 py-2 rounded-xl bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30 font-mono text-xs font-bold flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" />
                    <span>{isEs ? 'Telegram Bot Activo' : 'Telegram Bot Ready'}</span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* Pillar 1: Sell Volume Acceleration */}
      {(activeCategory === 'all' || activeCategory === 'sell-accel') && (
        <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl overflow-hidden transition shadow-sm">
          <div
            onClick={() => toggleExpand('sell-accel')}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#2B2F36]/30 transition select-none"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#F0B90B] uppercase">PILLAR 01</span>
                  <span className="text-xs px-2 py-0.5 rounded font-mono bg-red-500/15 text-red-400 border border-red-500/30 font-semibold">
                    Z-SCORE &gt; {config.sellVolumeZScoreThreshold}
                  </span>
                </div>
                <h3 className="text-lg font-bold font-mono text-[#EAECEF] mt-0.5">
                  {isEs ? '1. Aceleración de Volumen de Venta (Sell Volume Acceleration)' : '1. Sell Volume Acceleration'}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#848E9C] hidden sm:inline">
                {expandedCard === 'sell-accel' ? (isEs ? 'Ocultar' : 'Collapse') : (isEs ? 'Ver Detalle' : 'Expand')}
              </span>
              {expandedCard === 'sell-accel' ? (
                <ChevronUp className="w-5 h-5 text-[#848E9C]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#848E9C]" />
              )}
            </div>
          </div>

          {expandedCard === 'sell-accel' && (
            <div className="p-6 border-t border-[#2B2F36] bg-[#121418] space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* What it is */}
                <div className="bg-[#181A20] p-4 rounded-lg border border-[#2B2F36] space-y-2">
                  <h4 className="text-xs font-mono uppercase text-[#F0B90B] font-bold flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-[#F0B90B]" />
                    {isEs ? '¿Qué es y por qué importa?' : 'What it is & Why it matters'}
                  </h4>
                  <p className="text-xs text-[#EAECEF] leading-relaxed">
                    {isEs
                      ? 'Mide la velocidad a la que el mercado absorbe órdenes de venta de mercado. Cuando la proporción de ejecuciones vendedoras supera el 65-70% en una ventana corta (1-5 min) y el Z-Score supera 2.5 desviaciones estándar, indica presión vendedora institucional desproporcionada.'
                      : 'Measures the rate at which market sell orders are filled. When market sell ratio exceeds 65-70% in short rolling windows (1-5 mins) and Z-Score exceeds 2.5 standard deviations, it indicates institutional market sell aggression.'}
                  </p>
                </div>

                {/* How to configure */}
                <div className="bg-[#181A20] p-4 rounded-lg border border-[#2B2F36] space-y-2">
                  <h4 className="text-xs font-mono uppercase text-[#F0B90B] font-bold flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-[#F0B90B]" />
                    {isEs ? '¿Cómo configurarlo?' : 'How to configure it'}
                  </h4>
                  <ul className="text-xs text-[#EAECEF] space-y-1.5 list-disc list-inside">
                    <li>
                      <strong>{isEs ? 'Ventana de cálculo:' : 'Calculation Window:'}</strong> {isEs ? '1 a 3 minutos para monitoreo rápido, 5 minutos para trading intradía.' : '1 to 3 mins for fast monitoring, 5 mins for day trading.'}
                    </li>
                    <li>
                      <strong>{isEs ? 'Umbral de Desviación Cuantitativa:' : 'Quant Deviation Threshold:'}</strong> {isEs ? '2.0 (Moderado), 2.5 (Estándar recomendado), 3.0+ (Crítico de extrema volatilidad).' : '2.0 (Moderate), 2.5 (Standard recommended), 3.0+ (Critical volatility).'}
                    </li>
                    <li>
                      <strong>{isEs ? 'Ratio de Ventas:' : 'Sell Ratio:'}</strong> 0.65 - 0.75 ({isEs ? '65% a 75% ventas de mercado' : '65% to 75% market sells'}).
                    </li>
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="bg-[#181A20] p-4 rounded-lg border border-[#2B2F36] space-y-2">
                  <h4 className="text-xs font-mono uppercase text-[#F0B90B] font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    {isEs ? 'Recomendaciones y Antiruido' : 'Recommendations & Whipsaw Prevention'}
                  </h4>
                  <p className="text-xs text-[#EAECEF] leading-relaxed">
                    {isEs
                      ? 'Para evitar falsas alarmas por ruido normal del mercado durante periodos ilíquidos (fines de semana/madrugada), combine el Z-Score con la confirmación de volumen mínimo acumulado ($1M+ USD) en lugar de evaluar únicamente el ratio porcentual.'
                      : 'To prevent false positives caused by normal market noise during illiquid periods (weekends/off-hours), require cumulative minimum sell volume ($1M+ USD) alongside Z-Score validation.'}
                  </p>
                </div>
              </div>

              {/* Formula & Technical Box */}
              <div className="p-3 bg-[#0B0E11] rounded-lg border border-[#2B2F36] font-mono text-xs flex flex-wrap items-center justify-between gap-3 text-[#848E9C]">
                <div>
                  <span className="text-[#F0B90B] font-bold">{isEs ? 'Fórmula Z-Score:' : 'Z-Score Formula:'}</span> Z = (Vol_1m - μ_5m) / σ_5m
                </div>
                <div className="text-emerald-400">
                  ✓ {isEs ? 'Implementado en motor RAM C++ / WebSockets' : 'Implemented in RAM Engine & WebSockets'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pillar 2: Support Wall Breakdown */}
      {(activeCategory === 'all' || activeCategory === 'wall-break') && (
        <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl overflow-hidden transition shadow-sm">
          <div
            onClick={() => toggleExpand('wall-break')}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#2B2F36]/30 transition select-none"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#F0B90B] uppercase">PILLAR 02</span>
                  <span className="text-xs px-2 py-0.5 rounded font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold">
                    WALL CHEW &gt; {config.wallChewThresholdPercent}%
                  </span>
                </div>
                <h3 className="text-lg font-bold font-mono text-[#EAECEF] mt-0.5">
                  {isEs ? '2. Ruptura de Muro de Soporte (Support Wall Breakdown)' : '2. Support Wall Breakdown'}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#848E9C] hidden sm:inline">
                {expandedCard === 'wall-break' ? (isEs ? 'Ocultar' : 'Collapse') : (isEs ? 'Ver Detalle' : 'Expand')}
              </span>
              {expandedCard === 'wall-break' ? (
                <ChevronUp className="w-5 h-5 text-[#848E9C]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#848E9C]" />
              )}
            </div>
          </div>

          {expandedCard === 'wall-break' && (
            <div className="p-6 border-t border-[#2B2F36] bg-[#121418] space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* What it is */}
                <div className="bg-[#181A20] p-4 rounded-lg border border-[#2B2F36] space-y-2">
                  <h4 className="text-xs font-mono uppercase text-[#F0B90B] font-bold flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-[#F0B90B]" />
                    {isEs ? '¿Qué es y por qué importa?' : 'What it is & Why it matters'}
                  </h4>
                  <p className="text-xs text-[#EAECEF] leading-relaxed">
                    {isEs
                      ? 'Analiza los muros de compra (Buy Walls) de gran volumen agrupados en el libro de órdenes dentro del 0.5% - 1% del precio actual. Cuando un muro masivo es absorbido gradualmente (masticado > 75%) o cancelado de golpe, la barrera defensiva del precio desaparece, acelerando la caída.'
                      : 'Analyzes large buy walls clustered in the order book within 0.5% - 1% of current price. When a massive buy wall gets absorbed (> 75% chewed through) or suddenly pulled, price defense collapses, accelerating downside slippage.'}
                  </p>
                </div>

                {/* How to configure */}
                <div className="bg-[#181A20] p-4 rounded-lg border border-[#2B2F36] space-y-2">
                  <h4 className="text-xs font-mono uppercase text-[#F0B90B] font-bold flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-[#F0B90B]" />
                    {isEs ? '¿Cómo configurarlo?' : 'How to configure it'}
                  </h4>
                  <ul className="text-xs text-[#EAECEF] space-y-1.5 list-disc list-inside">
                    <li>
                      <strong>{isEs ? 'Muro Mínimo (BTC):' : 'Min Wall Size:'}</strong> {isEs ? '80 - 250 BTC en Bitcoin (o equivalente $5M+ en altcoins).' : '80 - 250 BTC in Bitcoin ($5M+ equivalent in altcoins).'}`
                    </li>
                    <li>
                      <strong>{isEs ? 'Umbral de Masticado:' : 'Wall Chew Threshold:'}</strong> 75% {isEs ? 'de reducción sobre tamaño original.' : 'reduction from original volume.'}`
                    </li>
                    <li>
                      <strong>{isEs ? 'Detección de Cancelación:' : 'Vanished Detection:'}</strong> {isEs ? 'Alerta inmediata si el muro desaparece en < 2 segundos.' : 'Immediate alert if wall vanishes in < 2s.'}
                    </li>
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="bg-[#181A20] p-4 rounded-lg border border-[#2B2F36] space-y-2">
                  <h4 className="text-xs font-mono uppercase text-[#F0B90B] font-bold flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-emerald-400" />
                    {isEs ? 'Real vs Spoofing (Muros Falsos)' : 'Real Liquidity vs Spoofing'}
                  </h4>
                  <p className="text-xs text-[#EAECEF] leading-relaxed">
                    {isEs
                      ? 'Diferencie la liquidez real del Spoofing: los muros reales sufren operaciones de ejecución continua que incrementan el volumen vendedora. Si el muro desaparece sin operaciones ejecutadas, se trata de manipulación (Spoofing) para incitar compras antes del desplome.'
                      : 'Distinguish real liquidity from Spoofing: real walls experience executed trade prints that increase sell volume. If a wall vanishes without trade executions, it is Spoofing manipulation designed to trap buyers.'}
                  </p>
                </div>
              </div>

              {/* Status Indicator Example */}
              <div className="p-3 bg-[#0B0E11] rounded-lg border border-[#2B2F36] font-mono text-xs flex flex-wrap items-center justify-between gap-3 text-[#848E9C]">
                <div>
                  <span className="text-[#F0B90B] font-bold">{isEs ? 'Muro Detectado:' : 'Tracked Wall:'}</span> ${config.symbol} @ $96,000 | Original: {config.minBuyWallBtc} BTC
                </div>
                <div className="text-amber-400">
                  {isEs ? 'Estado: Rastreo de Masticado en Vivo' : 'Status: Live Wall Consumption Tracked'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pillar 3: Order Book Pressure & Wall Depth */}
      {(activeCategory === 'all' || activeCategory === 'book-depth') && (
        <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl overflow-hidden transition shadow-sm">
          <div
            onClick={() => toggleExpand('book-depth')}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#2B2F36]/30 transition select-none"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#F0B90B] uppercase">PILLAR 03</span>
                  <span className="text-xs px-2 py-0.5 rounded font-mono bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold">
                    BID / ASK DEPTH RATIO
                  </span>
                </div>
                <h3 className="text-lg font-bold font-mono text-[#EAECEF] mt-0.5">
                  {isEs ? '3. Presión del Libro de Órdenes y Profundidad (Order Book Pressure)' : '3. Order Book Pressure & Wall Depth'}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#848E9C] hidden sm:inline">
                {expandedCard === 'book-depth' ? (isEs ? 'Ocultar' : 'Collapse') : (isEs ? 'Ver Detalle' : 'Expand')}
              </span>
              {expandedCard === 'book-depth' ? (
                <ChevronUp className="w-5 h-5 text-[#848E9C]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#848E9C]" />
              )}
            </div>
          </div>

          {expandedCard === 'book-depth' && (
            <div className="p-6 border-t border-[#2B2F36] bg-[#121418] space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* What it is */}
                <div className="bg-[#181A20] p-4 rounded-lg border border-[#2B2F36] space-y-2">
                  <h4 className="text-xs font-mono uppercase text-[#F0B90B] font-bold flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-[#F0B90B]" />
                    {isEs ? '¿Qué es y por qué importa?' : 'What it is & Why it matters'}
                  </h4>
                  <p className="text-xs text-[#EAECEF] leading-relaxed">
                    {isEs
                      ? 'Evalúa el balance relativo de oferta y demanda en las primeras 20 niveles del libro de órdenes (Bid/Ask Depth Ratio dentro del +/- 1% del precio medio). Cuando el ratio Bids/(Bids+Asks) cae por debajo del 35%, la profundidad defensiva es superficial, lo que expone al activo a caídas abruptas.'
                      : 'Evaluates the balance between bids and asks across top 20 order book levels (Bid/Ask Depth Ratio within +/- 1% of mid-price). When Bids/(Bids+Asks) ratio drops below 35%, buy-side depth is thin, exposing the asset to steep slippage.'}
                  </p>
                </div>

                {/* How to configure */}
                <div className="bg-[#181A20] p-4 rounded-lg border border-[#2B2F36] space-y-2">
                  <h4 className="text-xs font-mono uppercase text-[#F0B90B] font-bold flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-[#F0B90B]" />
                    {isEs ? '¿Cómo configurarlo?' : 'How to configure it'}
                  </h4>
                  <ul className="text-xs text-[#EAECEF] space-y-1.5 list-disc list-inside">
                    <li>
                      <strong>{isEs ? 'Rango de Profundidad:' : 'Depth Range:'}</strong> ±0.5% a ±1.0% {isEs ? 'del precio mid-market.' : 'from mid-price.'}
                    </li>
                    <li>
                      <strong>{isEs ? 'Zona Normal:' : 'Normal Zone:'}</strong> 45% - 55% {isEs ? 'de balance equilibrado.' : 'balanced bid/ask spread.'}
                    </li>
                    <li>
                      <strong>{isEs ? 'Zona de Alerta:' : 'Warning Zone:'}</strong> &lt; 35% ({isEs ? 'Presión bajista crítica' : 'Critical bearish pressure'}).
                    </li>
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="bg-[#181A20] p-4 rounded-lg border border-[#2B2F36] space-y-2">
                  <h4 className="text-xs font-mono uppercase text-[#F0B90B] font-bold flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    {isEs ? 'Direccionalidad a Corto Plazo' : 'Short-Term Directional Bias'}
                  </h4>
                  <p className="text-xs text-[#EAECEF] leading-relaxed">
                    {isEs
                      ? 'Utilice este métrico como un sesgo de dirección a muy corto plazo. Si la profundidad vendedora (Asks) apila 3x el volumen de compras (Bids), los algoritmos market makers retirarán sus ofertas defensivas antes de impactos macro.'
                      : 'Use this metric to gauge immediate order flow direction. If ask depth accumulates 3x bid depth, algorithmic market makers tend to step back, widening the spread before volatility triggers.'}
                  </p>
                </div>
              </div>

              {/* Technical Indicator Note */}
              <div className="p-3 bg-[#0B0E11] rounded-lg border border-[#2B2F36] font-mono text-xs flex flex-wrap items-center justify-between gap-3 text-[#848E9C]">
                <div>
                  <span className="text-[#F0B90B] font-bold">{isEs ? 'Cálculo de Presión:' : 'Pressure Ratio:'}</span> Depth_Ratio = Σ Bids_20 / (Σ Bids_20 + Σ Asks_20)
                </div>
                <div className="text-cyan-400">
                  {isEs ? 'Actualizado en cada WebSocket depthUpdate' : 'Updated on every WebSocket depthUpdate'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pillar 4: Liquidation Cascade (Rule 3) */}
      {(activeCategory === 'all' || activeCategory === 'liq-cascade') && (
        <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl overflow-hidden transition shadow-sm">
          <div
            onClick={() => toggleExpand('liq-cascade')}
            className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#2B2F36]/30 transition select-none"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#F0B90B] uppercase">PILLAR 04</span>
                  <span className="text-xs px-2 py-0.5 rounded font-mono bg-purple-500/15 text-purple-400 border border-purple-500/30 font-semibold">
                    LIQUIDATIONS &gt; ${(config.longLiquidationSpikeUsd / 1000).toFixed(0)}k USD
                  </span>
                </div>
                <h3 className="text-lg font-bold font-mono text-[#EAECEF] mt-0.5">
                  {isEs ? '4. Cascada de Liquidaciones (Liquidation Cascade - Regla 3)' : '4. Liquidation Cascade (Rule 3)'}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#848E9C] hidden sm:inline">
                {expandedCard === 'liq-cascade' ? (isEs ? 'Ocultar' : 'Collapse') : (isEs ? 'Ver Detalle' : 'Expand')}
              </span>
              {expandedCard === 'liq-cascade' ? (
                <ChevronUp className="w-5 h-5 text-[#848E9C]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#848E9C]" />
              )}
            </div>
          </div>

          {expandedCard === 'liq-cascade' && (
            <div className="p-6 border-t border-[#2B2F36] bg-[#121418] space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* What it is */}
                <div className="bg-[#181A20] p-4 rounded-lg border border-[#2B2F36] space-y-2">
                  <h4 className="text-xs font-mono uppercase text-[#F0B90B] font-bold flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-[#F0B90B]" />
                    {isEs ? '¿Qué es y por qué importa?' : 'What it is & Why it matters'}
                  </h4>
                  <p className="text-xs text-[#EAECEF] leading-relaxed">
                    {isEs
                      ? 'Monitorea el cierre forzado (liquidación) de posiciones apalancadas en largo. Cuando el precio cae y liquida posiciones alcistas, el motor del exchange vende de golpe el colateral al mercado, generando una reacción en cadena donde una liquidación fuerza la siguiente.'
                      : 'Tracks forced liquidations of leveraged long positions. When prices drop and trigger long liquidations, the exchange liquidation engine automatically market-sells collateral, causing a domino chain reaction.'}
                  </p>
                </div>

                {/* How to configure */}
                <div className="bg-[#181A20] p-4 rounded-lg border border-[#2B2F36] space-y-2">
                  <h4 className="text-xs font-mono uppercase text-[#F0B90B] font-bold flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-[#F0B90B]" />
                    {isEs ? '¿Cómo configurarlo?' : 'How to configure it'}
                  </h4>
                  <ul className="text-xs text-[#EAECEF] space-y-1.5 list-disc list-inside">
                    <li>
                      <strong>{isEs ? 'Umbral Temprano:' : 'Early Warning:'}</strong> $500k - $2M USD {isEs ? 'en 1 minuto.' : 'in 1 min window.'}
                    </li>
                    <li>
                      <strong>{isEs ? 'Umbral Crítico:' : 'Critical Cascade:'}</strong> $5M+ USD {isEs ? 'de liquidaciones forzadas.' : 'of forced long liquidations.'}
                    </li>
                    <li>
                      <strong>{isEs ? 'Frecuencia de Eventos:' : 'Event Frequency:'}</strong> &gt; 15 {isEs ? 'órdenes de liquidación por minuto.' : 'liquidation orders / min.'}
                    </li>
                  </ul>
                </div>

                {/* Recommendations */}
                <div className="bg-[#181A20] p-4 rounded-lg border border-[#2B2F36] space-y-2">
                  <h4 className="text-xs font-mono uppercase text-[#F0B90B] font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    {isEs ? 'Reacción Defensiva y Stop Loss' : 'Defensive Action & Stop Loss Placement'}
                  </h4>
                  <p className="text-xs text-[#EAECEF] leading-relaxed">
                    {isEs
                      ? 'Las cascadas de liquidación son el detonante #1 de los Flash Crashes. Cuando este indicador parpadea en rojo, evite ingresar en largo inmediatamente y sitúe sus órdenes Stop Loss fuera de los clusters de alto apalancamiento (ej. 50x / 100x).'
                      : 'Liquidation cascades are the #1 catalyst for Flash Crashes. When this indicator flashes red, avoid immediate long entries and place Stop Losses outside high-leverage clusters (e.g. 50x / 100x liquidation zones).'}
                  </p>
                </div>
              </div>

              {/* Feed Source */}
              <div className="p-3 bg-[#0B0E11] rounded-lg border border-[#2B2F36] font-mono text-xs flex flex-wrap items-center justify-between gap-3 text-[#848E9C]">
                <div>
                  <span className="text-[#F0B90B] font-bold">{isEs ? 'Fuente de Datos:' : 'Data Stream:'}</span> Binance Futures forceOrder WebSocket (@forceOrder)
                </div>
                <div className="text-purple-400">
                  ⚡ {isEs ? 'Rastreo en Milisegundos de Liquidaciones Reales' : 'Real Millisecond Forced Order Tracking'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Risk Evaluator / Simulator Box */}
      <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2B2F36] pb-3">
          <div>
            <h3 className="text-base font-bold font-mono text-[#EAECEF] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F0B90B]" />
              {isEs ? 'Simulador Interactivo de Evaluación de Riesgo' : 'Interactive Risk Assessment Simulator'}
            </h3>
            <p className="text-xs text-[#848E9C]">
              {isEs
                ? 'Ajuste los parámetros a continuación para ver cómo el algoritmo del Sentinel calcula el Índice de Riesgo Compuesto (0-100) en tiempo real.'
                : 'Adjust the sliders below to see how the Sentinel algorithm calculates the Composite Risk Index (0-100) in real-time.'}
            </p>
          </div>

          <div className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold flex items-center gap-2 ${simRisk.color}`}>
            <span>SCORE: {simRisk.score}/100</span>
            <span>[{simRisk.status}]</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          
          {/* Slider 1: Sell Ratio */}
          <div className="bg-[#121418] p-3 rounded-lg border border-[#2B2F36] space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-[#848E9C]">
              <span>{isEs ? 'Ratio de Ventas:' : 'Sell Ratio:'}</span>
              <span className="text-[#F0B90B] font-bold">{calcSellRatio}%</span>
            </div>
            <input
              type="range"
              min="30"
              max="95"
              value={calcSellRatio}
              onChange={(e) => setCalcSellRatio(Number(e.target.value))}
              className="w-full accent-[#F0B90B] cursor-pointer"
            />
            <div className="text-[10px] text-[#848E9C]">
              {calcSellRatio > 65 ? (isEs ? '⚠️ Presión de Venta Alta' : '⚠️ High Sell Pressure') : (isEs ? '✓ Normal' : '✓ Normal')}
            </div>
          </div>

          {/* Slider 2: Z-Score */}
          <div className="bg-[#121418] p-3 rounded-lg border border-[#2B2F36] space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-[#848E9C]">
              <span>Z-Score:</span>
              <span className="text-[#F0B90B] font-bold">{calcZScore.toFixed(1)} σ</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={calcZScore}
              onChange={(e) => setCalcZScore(Number(e.target.value))}
              className="w-full accent-[#F0B90B] cursor-pointer"
            />
            <div className="text-[10px] text-[#848E9C]">
              {calcZScore >= config.sellVolumeZScoreThreshold ? (isEs ? '🚨 Pico de Desviación' : '🚨 Spike Triggered') : (isEs ? '✓ Sin Anomalía' : '✓ Normal')}
            </div>
          </div>

          {/* Slider 3: Wall Chew */}
          <div className="bg-[#121418] p-3 rounded-lg border border-[#2B2F36] space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-[#848E9C]">
              <span>{isEs ? 'Muro Consumido:' : 'Wall Chew:'}</span>
              <span className="text-[#F0B90B] font-bold">{calcWallChew}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={calcWallChew}
              onChange={(e) => setCalcWallChew(Number(e.target.value))}
              className="w-full accent-[#F0B90B] cursor-pointer"
            />
            <div className="text-[10px] text-[#848E9C]">
              {calcWallChew >= config.wallChewThresholdPercent ? (isEs ? '💥 Muro en Peligro' : '💥 Wall Breaking') : (isEs ? '✓ Muro Defendido' : '✓ Defended')}
            </div>
          </div>

          {/* Slider 4: Liquidations */}
          <div className="bg-[#121418] p-3 rounded-lg border border-[#2B2F36] space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-[#848E9C]">
              <span>{isEs ? 'Liquidaciones 1m:' : '1m Long Liq:'}</span>
              <span className="text-[#F0B90B] font-bold">${(calcLiqAmount / 1000).toFixed(0)}k</span>
            </div>
            <input
              type="range"
              min="10000"
              max="2000000"
              step="20000"
              value={calcLiqAmount}
              onChange={(e) => setCalcLiqAmount(Number(e.target.value))}
              className="w-full accent-[#F0B90B] cursor-pointer"
            />
            <div className="text-[10px] text-[#848E9C]">
              {calcLiqAmount >= config.longLiquidationSpikeUsd ? (isEs ? '🔥 Cascada Detectada' : '🔥 Cascade Active') : (isEs ? '✓ Flujo Estable' : '✓ Stable')}
            </div>
          </div>
        </div>
      </div>

      {/* Pillar Checklist & Risk Management Best Practices */}
      {(activeCategory === 'all' || activeCategory === 'best-practices') && (
        <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#2B2F36] pb-3">
            <CheckCircle2 className="w-5 h-5 text-[#0ECB81]" />
            <h3 className="text-base font-bold font-mono text-[#EAECEF]">
              {isEs ? 'Lista de Verificación Operativa y Protocolo de Mitigación' : 'Operational Checklist & Mitigation Protocol'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-[#121418] p-4 rounded-lg border border-[#2B2F36] space-y-2">
              <div className="text-[#F0B90B] font-bold uppercase flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {isEs ? '1. Protocolo de Reacción Rápida (< 10s)' : '1. Rapid Reaction Protocol (< 10s)'}
              </div>
              <p className="text-[#848E9C] leading-relaxed">
                {isEs
                  ? 'Ante una alerta de FLASH_CRASH_WARNING (Índice de Riesgo >= 85), reduzca automáticamente el apalancamiento superior a 10x o ajuste las órdenes Stop Loss a la baja para evitar mechas de barrido.'
                  : 'Upon a FLASH_CRASH_WARNING alert (Risk Score >= 85), automatically reduce leverage above 10x or lower Stop Loss orders to prevent wick liquidation hunts.'}
              </p>
            </div>

            <div className="bg-[#121418] p-4 rounded-lg border border-[#2B2F36] space-y-2">
              <div className="text-[#F0B90B] font-bold uppercase flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" />
                {isEs ? '2. Gestión de Tamaño de Posición (Position Sizing)' : '2. Risk-Adjusted Position Sizing'}
              </div>
              <p className="text-[#848E9C] leading-relaxed">
                {isEs
                  ? 'Nunca mantenga más del 2-5% del capital total expuesto durante picos de Z-Score > 3.0. La volatilidad del libro de órdenes genera deslizamientos (slippage) significativos en ejecuciones al mercado.'
                  : 'Never expose more than 2-5% of total account equity during Z-Score spikes > 3.0. Order book illiquidity leads to significant market fill slippage.'}
              </p>
            </div>

            {/* Algorithmic Protection Actions */}
            <div className="bg-[#121418] p-4 rounded-lg border border-[#2B2F36] space-y-2">
              <div className="text-[#F6465D] font-bold uppercase flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#F6465D]" />
                {isEs ? '3. Acción de Mitigación Algorítmica Recomendada' : '3. Recommended Algorithmic Risk Mitigation'}
              </div>
              <ul className="text-[#848E9C] space-y-1.5 list-disc list-inside">
                <li>
                  <strong className="text-[#EAECEF]">{isEs ? 'Pausa Inmediata de Cotizaciones:' : 'Immediate Quote Halt:'}</strong> {isEs ? 'Suspenda inmediatamente todas las órdenes de provisión de liquidez en algoritmos market-making para evitar ejecuciones tóxicas.' : 'Immediately suspend all two-sided quoting and liquidity-provision orders for BTCUSDT market-making algorithms to avoid toxic fills.'}
                </li>
                <li>
                  <strong className="text-[#EAECEF]">{isEs ? 'Controles de Deslizamiento y Enrutamiento:' : 'Slippage & Routing Controls:'}</strong> {isEs ? 'Cambie los algoritmos de ejecución al modo pasivo "Reduce-Only", reduzca la tolerancia de deslizamiento a < 2 bps y fuerce una reconexión de socket para validar la integridad del libro de órdenes.' : 'Transition execution algorithms to a passive "Reduce-Only" mode, tighten maximum allowable slippage tolerances to < 2 bps, and force an immediate automated socket reconnect to re-validate orderbook depth integrity.'}
                </li>
              </ul>
            </div>

            {/* Quantitative Sentinel Tuning */}
            <div className="bg-[#121418] p-4 rounded-lg border border-[#2B2F36] space-y-2">
              <div className="text-[#0ECB81] font-bold uppercase flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#0ECB81]" />
                {isEs ? '4. Ajuste de Parámetros del Centinela Cuantitativo' : '4. Quantitative Sentinel Parameter Tuning'}
              </div>
              <ul className="text-[#848E9C] space-y-1.5 list-disc list-inside">
                <li>
                  <strong className="text-[#EAECEF]">{isEs ? 'Detección de Anomalías Bilateral:' : 'Two-Tailed Anomaly Detection:'}</strong> {isEs ? 'Actualice la condición Z-score a una comprobación de límite absoluto ' : 'Update the Z-score trigger condition to a two-tailed absolute boundary check '}
                  <code className="text-[#F0B90B] bg-[#181A20] px-1 py-0.5 rounded">abs(sell_volume_zscore) &gt; 2.5</code> {isEs ? 'para detectar desequilibrios en ambas direcciones.' : 'to flag extreme structural order-flow imbalances in both directions.'}
                </li>
                <li>
                  <strong className="text-[#EAECEF]">{isEs ? 'Protección de Integridad de Datos:' : 'Data Integrity Guardrails:'}</strong> {isEs ? 'Asigne un índice de riesgo de 85 inmediatamente si la profundidad del libro de órdenes es nula o 0.' : 'Assign a risk index of 85 immediately if orderbook depth yields null or zero values.'}
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
