import React, { useState } from 'react';
import { 
  BrainCircuit, 
  RefreshCw, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Compass, 
  Target, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { RiskMetrics, RiskAlert } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface AiMarketAnalystProps {
  metrics: RiskMetrics | null;
  alerts: RiskAlert[];
}

export const AiMarketAnalyst: React.FC<AiMarketAnalystProps> = ({ metrics, alerts }) => {
  const { t, language } = useLanguage();
  const { isPremium, userProfile, user, openSubscriptionModal } = useAuth();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<string | null>(null);

  const fetchRiskReport = async () => {
    if (!metrics) return;

    if (!isPremium) {
      openSubscriptionModal();
      return;
    }

    setLoading(true);
    setError(null);

    const currentLanguage = language || (typeof window !== 'undefined' ? localStorage.getItem('sentinel_language') : 'en') || 'en';

    try {
      const idToken = user ? await user.getIdToken() : undefined;
      const res = await fetch('/api/gemini/risk-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify({
          metrics,
          activeAlerts: alerts.slice(0, 5),
          language: currentLanguage,
          userId: user?.uid || userProfile?.uid || 'guest-demo-id',
          subscriptionTier: userProfile?.subscription_tier || (isPremium ? 'premium' : 'free')
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || (language === 'es' ? 'Error al consultar al Asesor IA' : 'Failed to call Gemini Advisor API'));
      }

      const data = await res.json();
      setAnalysis(data.analysis);
      setLastGeneratedAt(new Date().toLocaleTimeString());
    } catch (e: any) {
      setError(e.message || (language === 'es' ? 'Error al generar el diagnóstico del Asesor IA' : 'Error generating AI Market Report'));
    } finally {
      setLoading(false);
    }
  };

  // Helper to format bold markdown tags: **text**
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-semibold text-[#F0B90B]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  // Parse markdown into distinct sections for dedicated card rendering
  const parseSections = (rawText: string) => {
    const rawLines = rawText.split('\n');
    interface Section {
      title: string;
      rawTitle: string;
      lines: string[];
      type: 'traffic' | 'behind' | 'plan' | 'levels' | 'generic';
    }

    const sections: Section[] = [];
    let currentSec: Section = {
      title: language === 'es' ? 'Diagnóstico General' : 'General Diagnosis',
      rawTitle: '',
      lines: [],
      type: 'generic'
    };

    for (const line of rawLines) {
      const trimmed = line.trim();
      const isHeader = /^###?\s+/.test(trimmed) || /^(\d+\.)\s+\*\*/.test(trimmed);

      if (isHeader) {
        if (currentSec.lines.length > 0 || currentSec.rawTitle) {
          sections.push(currentSec);
        }

        const cleanTitle = trimmed
          .replace(/^###?\s+/, '')
          .replace(/^\d+\.\s*/, '')
          .replace(/\*\*/g, '')
          .trim();

        let type: Section['type'] = 'generic';
        const lower = cleanTitle.toLowerCase();
        if (lower.includes('veredicto') || lower.includes('traffic') || lower.includes('semáforo') || lower.includes('semaforo') || lower.includes('🚦')) {
          type = 'traffic';
        } else if (lower.includes('detrás') || lower.includes('behind') || lower.includes('pasando') || lower.includes('happening') || lower.includes('🔍')) {
          type = 'behind';
        } else if (lower.includes('plan') || lower.includes('acción') || lower.includes('accion') || lower.includes('action') || lower.includes('🎯')) {
          type = 'plan';
        } else if (lower.includes('niveles') || lower.includes('levels') || lower.includes('soporte') || lower.includes('vigilar') || lower.includes('🛡️')) {
          type = 'levels';
        }

        currentSec = {
          title: cleanTitle,
          rawTitle: trimmed,
          lines: [],
          type
        };
      } else if (trimmed !== '') {
        currentSec.lines.push(trimmed);
      }
    }

    if (currentSec.lines.length > 0 || currentSec.rawTitle) {
      sections.push(currentSec);
    }

    return sections;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Main Header Card */}
      <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2B2F36] pb-5 mb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F0B90B]/10 border border-[#F0B90B]/30 flex items-center justify-center">
                <BrainCircuit className="w-4 h-4 text-[#F0B90B] animate-pulse" />
              </div>
              <h2 className="text-base font-bold text-[#EAECEF] tracking-wide">
                {t.aiTitle || (language === 'es' ? 'Asesor Inteligente de Mercado' : 'Intelligent Market Advisor')}
              </h2>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#F0B90B]" />
                {language === 'es' ? 'GEMINI 3.6 FLASH • PLAN EN SIMPLE' : 'GEMINI 3.6 FLASH • SIMPLE PLAN'}
              </span>
            </div>
            <p className="text-xs text-[#848E9C] mt-1.5">
              {t.aiSubtitle || (language === 'es' ? 'Diagnóstico y Plan de Acción en Simple • Protección de Capital en Tiempo Real' : 'Market Diagnosis & Action Plan in Plain Terms • Real-Time Capital Protection')}
            </p>
          </div>

          <button
            onClick={fetchRiskReport}
            disabled={loading || !metrics}
            className="px-5 py-2.5 rounded-lg bg-[#F0B90B] hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading 
              ? (t.analyzingBtn || (language === 'es' ? 'Analizando Mercado...' : 'Analyzing Market...')) 
              : (t.generateReportBtn || (language === 'es' ? 'Consultar al Asesor IA' : 'Consult AI Advisor'))}
          </button>
        </div>

        {/* Live Context Strip */}
        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#121418] border border-[#2B2F36] rounded-lg p-3 text-xs mb-5">
            <div>
              <span className="text-[10px] uppercase font-mono text-[#848E9C] block">
                {language === 'es' ? 'Activo Monitoreado' : 'Monitored Asset'}
              </span>
              <span className="font-bold font-mono text-[#EAECEF]">
                {metrics.symbol || 'BTCUSDT'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-[#848E9C] block">
                {language === 'es' ? 'Precio en Vivo' : 'Live Price'}
              </span>
              <span className="font-bold font-mono text-[#EAECEF]">
                ${metrics.currentPrice ? metrics.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-[#848E9C] block">
                {language === 'es' ? 'Piso Institucional' : 'Support Floor'}
              </span>
              <span className="font-bold font-mono text-[#0ECB81]">
                ${metrics.nearestBuyWallPrice ? metrics.nearestBuyWallPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-[#848E9C] block">
                {language === 'es' ? 'Nivel de Riesgo' : 'Risk Score'}
              </span>
              <span className={`font-bold font-mono ${
                (metrics.riskIndex || 0) > 60 
                  ? 'text-[#F6465D]' 
                  : (metrics.riskIndex || 0) > 30 
                  ? 'text-[#F0B90B]' 
                  : 'text-[#0ECB81]'
              }`}>
                {(metrics.riskIndex || 0).toFixed(0)}/100 {
                  (metrics.riskIndex || 0) > 60 
                    ? (language === 'es' ? '• Peligro' : '• High Risk') 
                    : (metrics.riskIndex || 0) > 30 
                    ? (language === 'es' ? '• Cautela' : '• Caution') 
                    : (language === 'es' ? '• Estable' : '• Safe')
                }
              </span>
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="bg-[#F6465D]/15 border border-[#F6465D]/40 rounded-lg p-4 text-xs font-mono text-[#F6465D] flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Structured Analysis Report */}
        {analysis ? (
          <div className="space-y-4">
            {/* Top Status Header */}
            <div className="flex items-center justify-between border-b border-[#2B2F36] pb-3 text-xs">
              <span className="flex items-center gap-1.5 text-[#0ECB81] font-bold">
                <ShieldCheck className="w-4 h-4" />
                {language === 'es' ? 'DIAGNÓSTICO DEL MERCADO COMPLETADO' : 'MARKET DIAGNOSIS COMPLETE'}
              </span>
              <span className="text-[#848E9C] font-mono text-[11px]">
                {language === 'es' ? 'ACTUALIZADO A LAS' : 'UPDATED AT'} {lastGeneratedAt || new Date().toLocaleTimeString()}
              </span>
            </div>

            {/* Render 4 Specialized High-Readability Cards */}
            <div className="space-y-4">
              {parseSections(analysis).map((sec, secIdx) => {
                // Section 1: Traffic Light
                if (sec.type === 'traffic') {
                  const fullText = sec.lines.join(' ');
                  const isSafe = fullText.includes('🟢') || fullText.toLowerCase().includes('seguro') || fullText.toLowerCase().includes('safe');
                  const isHighRisk = fullText.includes('🔴') || fullText.toLowerCase().includes('alto riesgo') || fullText.toLowerCase().includes('high risk');
                  const isCaution = fullText.includes('🟡') || (!isSafe && !isHighRisk);

                  const borderColor = isHighRisk 
                    ? 'border-[#F6465D]/50 bg-[#F6465D]/10' 
                    : isCaution 
                    ? 'border-[#F0B90B]/50 bg-[#F0B90B]/10' 
                    : 'border-[#0ECB81]/50 bg-[#0ECB81]/10';

                  const badgeColor = isHighRisk 
                    ? 'bg-[#F6465D]/20 text-[#F6465D] border-[#F6465D]/40' 
                    : isCaution 
                    ? 'bg-[#F0B90B]/20 text-[#F0B90B] border-[#F0B90B]/40' 
                    : 'bg-[#0ECB81]/20 text-[#0ECB81] border-[#0ECB81]/40';

                  return (
                    <div key={secIdx} className={`rounded-xl border p-4.5 transition-all ${borderColor}`}>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🚦</span>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-[#EAECEF]">
                            {sec.title}
                          </h3>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                          {isHighRisk ? 'ALTO RIESGO / ESPERAR' : isCaution ? 'PRECAUCIÓN' : 'CONDICIÓN FAVORABLE'}
                        </span>
                      </div>
                      <div className="text-sm text-slate-100 font-medium leading-relaxed pl-7">
                        {sec.lines.map((l, lIdx) => (
                          <p key={lIdx}>{renderFormattedText(l)}</p>
                        ))}
                      </div>
                    </div>
                  );
                }

                // Section 2: What's happening behind the price
                if (sec.type === 'behind') {
                  return (
                    <div key={secIdx} className="bg-[#121418] border border-[#2B2F36] rounded-xl p-4.5">
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#2B2F36]">
                        <Compass className="w-4 h-4 text-[#F0B90B]" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#EAECEF]">
                          {sec.title}
                        </h3>
                      </div>
                      <div className="space-y-2.5">
                        {sec.lines.map((l, lIdx) => {
                          const cleanLine = l.replace(/^[-*•]\s*/, '').trim();
                          return (
                            <div key={lIdx} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                              <span className="text-[#0ECB81] font-bold text-sm leading-none mt-0.5">•</span>
                              <div className="flex-1">{renderFormattedText(cleanLine)}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                // Section 3: Recommended Action Plan
                if (sec.type === 'plan') {
                  return (
                    <div key={secIdx} className="bg-[#181A20] border border-[#F0B90B]/30 rounded-xl p-4.5 shadow-sm">
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#2B2F36]">
                        <Target className="w-4 h-4 text-[#F0B90B]" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#F0B90B]">
                          {sec.title}
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {sec.lines.map((l, lIdx) => {
                          const cleanLine = l.replace(/^[-*•]\s*/, '').trim();
                          return (
                            <div key={lIdx} className="flex items-start gap-2.5 text-xs text-slate-100 leading-relaxed bg-[#121418]/80 p-3 rounded-lg border border-[#2B2F36]/60">
                              <ArrowRight className="w-3.5 h-3.5 text-[#F0B90B] shrink-0 mt-0.5" />
                              <div className="flex-1">{renderFormattedText(cleanLine)}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                // Section 4: Key Price Levels to Watch
                if (sec.type === 'levels') {
                  return (
                    <div key={secIdx} className="bg-[#121418] border border-[#2B2F36] rounded-xl p-4.5">
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#2B2F36]">
                        <ShieldAlert className="w-4 h-4 text-[#0ECB81]" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#EAECEF]">
                          {sec.title}
                        </h3>
                      </div>
                      <div className="space-y-2.5">
                        {sec.lines.map((l, lIdx) => {
                          const cleanLine = l.replace(/^[-*•]\s*/, '').trim();
                          const isSupport = cleanLine.toLowerCase().includes('soporte') || cleanLine.toLowerCase().includes('support') || cleanLine.toLowerCase().includes('piso');
                          const isResistance = cleanLine.toLowerCase().includes('resistencia') || cleanLine.toLowerCase().includes('resistance') || cleanLine.toLowerCase().includes('techo');

                          return (
                            <div 
                              key={lIdx} 
                              className={`p-3 rounded-lg border text-xs leading-relaxed ${
                                isSupport 
                                  ? 'bg-[#0ECB81]/10 border-[#0ECB81]/30 text-slate-100' 
                                  : isResistance 
                                  ? 'bg-[#F6465D]/10 border-[#F6465D]/30 text-slate-100' 
                                  : 'bg-[#181A20] border-[#2B2F36] text-slate-300'
                              }`}
                            >
                              {renderFormattedText(cleanLine)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                // Generic Section Fallback
                return (
                  <div key={secIdx} className="bg-[#121418] border border-[#2B2F36] rounded-xl p-4">
                    {sec.title && (
                      <h3 className="text-xs font-bold text-[#F0B90B] mb-2 uppercase tracking-wide">
                        {sec.title}
                      </h3>
                    )}
                    <div className="space-y-1.5 text-xs text-slate-200 leading-relaxed">
                      {sec.lines.map((l, lIdx) => (
                        <p key={lIdx}>{renderFormattedText(l)}</p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Sleek Beginner-Friendly Empty State */
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-[#121418] rounded-xl border border-[#2B2F36]">
            <div className="w-14 h-14 rounded-2xl bg-[#F0B90B]/10 border border-[#F0B90B]/20 flex items-center justify-center mb-4">
              <TrendingUp className="w-7 h-7 text-[#F0B90B]" />
            </div>
            <h3 className="font-bold text-sm text-[#EAECEF] mb-1.5">
              {language === 'es' ? 'Diagnóstico y Plan de Acción en Simple' : 'Clear Market Diagnosis & Simple Action Plan'}
            </h3>
            <p className="text-xs text-[#848E9C] max-w-md leading-relaxed mb-5">
              {language === 'es'
                ? 'Haz clic en "Consultar al Asesor IA" para recibir un diagnóstico claro de la salud del mercado, saber si es seguro operar hoy y obtener un plan de acción paso a paso.'
                : 'Click "Consult AI Advisor" to get a clear market diagnosis, determine if it is safe to trade right now, and receive a step-by-step action plan.'}
            </p>
            <button
              onClick={fetchRiskReport}
              disabled={loading || !metrics}
              className="px-5 py-2.5 rounded-lg bg-[#F0B90B] hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs transition-all flex items-center gap-2 shadow-md shadow-amber-500/10 disabled:opacity-50 cursor-pointer"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {language === 'es' ? 'Consultar al Asesor IA Ahora' : 'Consult AI Advisor Now'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

