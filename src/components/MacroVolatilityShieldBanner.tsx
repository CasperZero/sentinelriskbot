import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  Play, 
  RotateCcw, 
  Info, 
  Sparkles, 
  Lock,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useVolatilityShield } from '../context/VolatilityShieldContext';
import { useLanguage } from '../context/LanguageContext';

interface MacroVolatilityShieldBannerProps {
  scannerType?: 'BUY' | 'SELL' | 'VWAP' | 'COMPACT';
  onSimulateToggle?: () => void;
}

export const MacroVolatilityShieldBanner: React.FC<MacroVolatilityShieldBannerProps> = ({
  scannerType = 'BUY'
}) => {
  const { 
    isVolatilityShieldActive, 
    shieldData, 
    currentEvent, 
    minutesRemaining, 
    toggleShieldSimulation,
    isSimulating
  } = useVolatilityShield();
  const { language } = useLanguage();
  const isEs = language.startsWith('es');

  if (!isVolatilityShieldActive) return null;

  const eventTitle = currentEvent?.title || (isEs ? 'Reunión de Política Monetaria FOMC' : 'FOMC Rate Decision & Fed Press Conference');
  const eventDesc = currentEvent?.description || (isEs 
    ? 'Los creadores de mercado institucionales retiran liquidez y los algoritmos automatizados ejecutan barridos de stop loss. Las señales están pausadas.' 
    : 'Institutional market makers pull order book depth and automated algorithms execute stop hunts. Trading signals are paused.');

  // Compact variant for dashboard summary cards
  if (scannerType === 'COMPACT') {
    return (
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-[#181A20] to-blue-500/10 border border-amber-500/40 text-xs font-mono shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0 animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#EAECEF] uppercase tracking-wide">
                  {isEs ? '🛡️ ESCUDO DE VOLATILIDAD MACRO ACTIVO' : '🛡️ MACRO VOLATILITY SHIELD ACTIVE'}
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {eventTitle.split('&')[0]}
                </span>
              </div>
              <p className="text-[11px] text-[#848E9C] mt-0.5">
                {isEs 
                  ? 'Señales de trading pausadas por 30 minutos para proteger su capital de manipulación.' 
                  : 'Trading signals paused for 30 minutes to protect capital from news manipulation.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 rounded-lg bg-[#121418] border border-[#2B2F36] text-[11px] text-[#F0B90B] font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{minutesRemaining > 0 ? `${minutesRemaining}m` : '30m'} {isEs ? 'restantes' : 'remaining'}</span>
            </span>
            <button
              onClick={() => toggleShieldSimulation(false)}
              className="px-2.5 py-1 rounded-lg bg-[#2B2F36] hover:bg-[#3B414B] text-[10px] text-[#848E9C] hover:text-[#EAECEF] transition"
              title="Deactivate shield"
            >
              {isEs ? 'Desactivar' : 'Deactivate'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#181C24] via-[#14161C] to-[#0F1116] border-2 border-amber-500/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden font-mono my-4">
      {/* Background Soft Glow Accents */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        
        {/* Top Header Badge & Countdown */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#2B2F36]">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/25 to-amber-600/10 text-amber-400 border border-amber-500/50 shadow-lg shadow-amber-500/10">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/50">
                  {isEs ? 'PROTECCIÓN INVISIBLE ACTIVA' : 'CAPITAL PRESERVATION SHIELD'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/50">
                  🇺🇸 HIGH IMPACT EVENT
                </span>
                {isSimulating && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    {isEs ? 'MODO SIMULACIÓN' : 'TEST MODE'}
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#EAECEF] mt-1 tracking-tight">
                {eventTitle}
              </h2>
            </div>
          </div>

          {/* Time Window Countdown Capsule */}
          <div className="flex items-center gap-2.5 bg-[#0B0E11] px-4 py-2 rounded-xl border border-amber-500/30 shrink-0">
            <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '10s' }} />
            <div className="text-right font-mono">
              <div className="text-[10px] text-[#848E9C] uppercase">{isEs ? 'Ventana de Protección' : 'Protection Window'}</div>
              <div className="text-sm font-extrabold text-amber-300">
                {minutesRemaining > 0 ? `${minutesRemaining}m` : '30m'} {isEs ? 'Restantes' : 'Remaining'}
              </div>
            </div>
          </div>
        </div>

        {/* Primary User Notice Banner (Required Text) */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 text-[#EAECEF] leading-relaxed">
          <p className="text-sm sm:text-base font-bold flex items-start gap-2.5">
            <span className="text-amber-400 text-lg leading-none shrink-0">🛡️</span>
            <span>
              {isEs 
                ? 'Escudo de Volatilidad Activo: Eventos macroeconómicos de alto impacto en curso. Las señales de trading están pausadas durante 30 minutos para proteger su capital de la manipulación del mercado y volatilidad extrema.'
                : 'Volatility Shield Active: High-impact macroeconomic events are currently unfolding. Trading signals are paused for 30 minutes to protect your capital from market manipulation and extreme volatility.'}
            </span>
          </p>
        </div>

        {/* 3 Protection Pillars for Novice Traders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          
          <div className="p-4 rounded-xl bg-[#0B0E11]/90 border border-[#2B2F36] space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{isEs ? '1. Vacío de Liquidez L2' : '1. Order Book Thinning'}</span>
            </div>
            <p className="text-[11px] text-[#848E9C] leading-relaxed">
              {isEs 
                ? 'Los creadores de mercado institucionales retiran órdenes pasivas antes de los datos macro, ampliando los spreads hasta 10 veces.' 
                : 'Market makers pull passive bids and asks prior to releases, widening spreads and increasing slippage tenfold.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0E11]/90 border border-[#2B2F36] space-y-1.5">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>{isEs ? '2. Cacería de Stops y Barridos' : '2. Dual-Sided Stop Hunts'}</span>
            </div>
            <p className="text-[11px] text-[#848E9C] leading-relaxed">
              {isEs 
                ? 'Los algoritmos de alta velocidad ejecutan mechas violentas en ambas direcciones para liquidar stops antes del movimiento real.' 
                : 'High-speed algorithms trigger extreme wick spikes in both directions to purge retail stops before genuine discovery.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0E11]/90 border border-[#2B2F36] space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{isEs ? '3. Preservación Cuántica' : '3. Capital Preservation'}</span>
            </div>
            <p className="text-[11px] text-[#848E9C] leading-relaxed">
              {isEs 
                ? 'Los fondos profesionales operan con órdenes neutralizadas durante los 15m previos y 15m posteriores al comunicado.' 
                : 'Quantitative desks deliberately sit in cash during the 15m pre and 15m post window until implied volatility stabilizes.'}
            </p>
          </div>

        </div>

        {/* Footer Actions: Countdown & Simulation Controls */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-[#2B2F36]">
          <div className="flex items-center gap-2 text-[#848E9C]">
            <span className="w-2 h-2 rounded-full bg-[#0ECB81] animate-ping" />
            <span>
              {isEs ? 'Reanudación automática al finalizar la ventana de 30 minutos.' : 'Automatic resumption when the 30-minute window concludes.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleShieldSimulation(false)}
              className="px-3.5 py-1.5 rounded-xl bg-[#181A20] hover:bg-[#2B2F36] text-[#848E9C] hover:text-[#EAECEF] border border-[#2B2F36] font-bold transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isEs ? 'Desactivar Escudo (Prueba)' : 'Deactivate Shield (Test)'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
