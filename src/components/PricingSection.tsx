import React, { useState } from 'react';
import { 
  Crown, 
  Check, 
  X, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  CreditCard, 
  HelpCircle, 
  Bot, 
  Bell, 
  BarChart2, 
  TrendingUp, 
  ChevronRight,
  ArrowRight,
  Sliders,
  Layers,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const PricingSection: React.FC = () => {
  const { isPremium, userProfile, upgradeToPremium, openSubscriptionModal, openAuthModal, user } = useAuth();
  const { language, t } = useLanguage();
  const isEs = language === 'es';

  const corePillars = [
    { title: t.subFeature1Title, desc: t.subFeature1Desc },
    { title: t.subFeature2Title, desc: t.subFeature2Desc },
    { title: t.subFeature3Title, desc: t.subFeature3Desc },
    { title: t.subFeature4Title, desc: t.subFeature4Desc },
    { title: t.subFeature5Title, desc: t.subFeature5Desc },
  ];

  const [selectedCycle, setSelectedCycle] = useState<'monthly' | 'semiannual' | 'annual'>('annual');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [processingPlan, setProcessingPlan] = useState<'monthly' | 'semiannual' | 'annual' | null>(null);

  const handleSubscribe = async (plan: 'monthly' | 'semiannual' | 'annual') => {
    setProcessingPlan(plan);
    // Open payment modal or execute direct upgrade
    openSubscriptionModal();
    setProcessingPlan(null);
  };

  const faqs = [
    {
      qEn: 'Can I cancel or change my subscription plan at any time?',
      qEs: '¿Puedo cancelar o cambiar mi plan de suscripción en cualquier momento?',
      aEn: 'Yes, absolutely. There are no lock-in contracts. You can manage, switch, or downgrade your plan directly from your account menu.',
      aEs: 'Sí, por supuesto. No hay contratos de permanencia. Puede administrar, cambiar o degradar su plan directamente desde su menú de usuario.'
    },
    {
      qEn: 'What payment methods do you accept?',
      qEs: '¿Qué métodos de pago son aceptados?',
      aEn: 'We support all major Cryptocurrencies (USDT, BTC, ETH, SOL, TON, BNB) via the Cryptomus decentralized gateway with instant on-chain webhook activation, as well as Credit/Debit cards via Stripe and Mercado Pago.',
      aEs: 'Aceptamos las principales Criptomonedas (USDT TRC20/BEP20, BTC, ETH, SOL, TON, BNB) mediante la pasarela descentralizada Cryptomus con activación instantánea en blockchain, además de tarjetas de crédito/débito con Stripe y Mercado Pago.'
    },
    {
      qEn: 'How does the Algorithmic Real-Time Alert system work for Premium users?',
      qEs: '¿Cómo funciona el sistema de alertas algorítmicas en tiempo real para usuarios Premium?',
      aEn: 'Premium subscribers gain direct access to our high-performance quantitative engine running over Binance Spot & Futures streams, sending real-time Webhook HTTP POST and Telegram alerts within milliseconds of detecting a flash crash.',
      aEs: 'Los suscriptores Premium obtienen acceso directo a nuestro motor cuantitativo que monitorea flujos de Binance Spot y Futuros, enviando notificaciones Webhook y de Telegram en milisegundos.'
    },
    {
      qEn: 'Is there a free trial or refund policy?',
      qEs: '¿Existe una prueba gratuita o política de reembolso?',
      aEn: 'Our Free Tier provides permanent access to basic market dashboards, heatmaps, and news feeds. All Premium plans come with a 7-day money-back satisfaction guarantee.',
      aEs: 'Nuestro Plan Gratuito ofrece acceso permanente al mapa de calor y feeds de noticias. Todos los planes Premium cuentan con garantía de satisfacción de 7 días.'
    }
  ];

  return (
    <div className="space-y-8 font-mono pb-12 animate-fadeIn">
      
      {/* Top Banner Header */}
      <div className="bg-[#121418] border border-[#2B2F36] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F0B90B]/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/30 text-[#F0B90B] text-xs font-bold uppercase tracking-widest">
            <Crown className="w-4 h-4" />
            <span>{isEs ? 'PLANES & MEMBRESÍA SENTINEL' : 'SENTINEL MEMBERSHIP PLANS'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#EAECEF] tracking-tight uppercase">
            {isEs ? 'Maximice su ventaja cuantitativa con la suite Quant Premium' : 'Maximize Your Quant Edge with the Premium Quant Suite'}
          </h1>

          <p className="text-xs sm:text-sm text-[#848E9C] leading-relaxed">
            {t.subModalSubtitle}
          </p>

          {isPremium && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center justify-between font-bold">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                {isEs ? 'Actualmente cuenta con una suscripción Premium activa' : 'You currently have an Active Premium Subscription'}
              </span>
              <button
                onClick={openSubscriptionModal}
                className="px-3 py-1 bg-emerald-500 text-slate-950 rounded-lg hover:bg-emerald-400 transition"
              >
                {isEs ? 'Administrar Plan' : 'Manage Subscription'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Cards Grid (3 Billing Options) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Monthly Plan */}
        <div className={`bg-[#121418] border rounded-2xl p-6 flex flex-col justify-between relative transition hover:border-[#848E9C] shadow-xl ${
          selectedCycle === 'monthly' ? 'border-[#2B2F36]' : 'border-[#2B2F36]'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-[#181A20] border border-[#2B2F36] text-[11px] font-bold text-[#848E9C] uppercase">
                {isEs ? 'Plan Mensual' : 'Monthly Plan'}
              </span>
              <span className="text-xs text-[#848E9C]">{isEs ? 'Recurrente' : 'Recurring'}</span>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#EAECEF] font-mono">$29</span>
                <span className="text-xs text-[#848E9C]">/ {isEs ? 'mes' : 'month'}</span>
              </div>
              <p className="text-[11px] text-[#848E9C] mt-1">
                {isEs ? 'Facturado $29 cada mes. Cancela en cualquier momento.' : 'Billed $29 monthly. Cancel anytime.'}
              </p>
            </div>

            <hr className="border-[#2B2F36]" />

            <div className="space-y-2.5 text-xs text-[#EAECEF]">
              {corePillars.map((feat, i) => (
                <div key={feat.title} className={`flex items-start gap-2 ${i === 0 ? 'text-[#0ECB81] font-semibold' : ''}`}>
                  <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${i === 0 ? 'text-[#0ECB81]' : 'text-[#F0B90B]'}`} />
                  <span>{feat.title}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleSubscribe('monthly')}
            className="w-full mt-6 py-3 bg-[#181A20] hover:bg-[#2B2F36] text-[#EAECEF] font-extrabold text-xs rounded-xl border border-[#2B2F36] hover:border-[#F0B90B] transition flex items-center justify-center gap-2"
          >
            <span>{isEs ? 'SUSCRIBIRSE MENSUAL ($29)' : 'SUBSCRIBE MONTHLY ($29)'}</span>
            <ArrowRight className="w-4 h-4 text-[#F0B90B]" />
          </button>
        </div>

        {/* 2. Semi-Annual Plan (6 Months) */}
        <div className="bg-[#121418] border border-[#2B2F36] rounded-2xl p-6 flex flex-col justify-between relative transition hover:border-[#F0B90B] shadow-xl">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#2B2F36] border border-[#F0B90B]/50 text-[#F0B90B] text-[10px] font-extrabold uppercase tracking-wider shadow">
            {isEs ? 'AHORRA $25' : 'SAVE $25'}
          </div>

          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-[#F0B90B]/10 border border-[#F0B90B]/30 text-[11px] font-bold text-[#F0B90B] uppercase">
                {isEs ? 'Plan Semestral (6 Meses)' : 'Semi-Annual Plan (6 Months)'}
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#EAECEF] font-mono">$149</span>
                <span className="text-xs text-[#848E9C]">/ 6 {isEs ? 'meses' : 'months'}</span>
              </div>
              <p className="text-[11px] text-[#F0B90B] font-semibold mt-1">
                {isEs ? 'Equivale a $24.83 / mes ($149 / 6 meses)' : 'Equivalent to $24.83 / mo ($149 / 6 mos)'}
              </p>
            </div>

            <hr className="border-[#2B2F36]" />

            <div className="space-y-2.5 text-xs text-[#EAECEF]">
              {corePillars.map((feat, i) => (
                <div key={feat.title} className={`flex items-start gap-2 ${i === 0 ? 'text-[#0ECB81] font-semibold' : ''}`}>
                  <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${i === 0 ? 'text-[#0ECB81]' : 'text-[#F0B90B]'}`} />
                  <span>{feat.title}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-[#0ECB81] font-bold">
                <Check className="w-4 h-4 text-[#0ECB81] flex-shrink-0" />
                <span>{isEs ? 'Ahorro de $25 cada 6 meses' : 'Save $25 every 6 months'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleSubscribe('semiannual')}
            className="w-full mt-6 py-3 bg-[#181A20] hover:bg-[#F0B90B] hover:text-slate-950 text-[#EAECEF] font-extrabold text-xs rounded-xl border border-[#2B2F36] hover:border-[#F0B90B] transition flex items-center justify-center gap-2 shadow-md"
          >
            <span>{isEs ? 'ELEGIR PLAN SEMESTRAL ($149)' : 'CHOOSE SEMI-ANNUAL ($149)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3. Annual Plan (12 Months - Highlighted Best Value) */}
        <div className="bg-gradient-to-b from-[#181A20] via-[#121418] to-[#181A20] border-2 border-[#F0B90B] rounded-2xl p-6 flex flex-col justify-between relative transition shadow-2xl shadow-[#F0B90B]/10">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#F0B90B] text-slate-950 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#F0B90B]/30 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isEs ? 'MEJOR VALOR - AHORRA $99' : 'BEST VALUE - SAVE $99'}</span>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-[#F0B90B] text-slate-950 text-[11px] font-extrabold uppercase">
                {isEs ? 'Plan Anual (12 Meses)' : 'Annual Plan (12 Months)'}
              </span>
              <span className="text-[10px] font-bold text-[#F0B90B] border border-[#F0B90B]/30 px-2 py-0.5 rounded">
                SENTINEL PRO
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-[#EAECEF] font-mono">$249</span>
                <span className="text-xs text-[#848E9C]">/ {isEs ? 'año' : 'year'}</span>
              </div>
              <p className="text-[11px] text-[#F0B90B] font-bold mt-1">
                {isEs ? 'Equivale a solo $20.75 / mes. ¡Más de 3 meses gratis!' : 'Equivalent to only $20.75 / mo. Over 3 months free!'}
              </p>
            </div>

            <hr className="border-[#2B2F36]" />

            <div className="space-y-2.5 text-xs text-[#EAECEF]">
              {corePillars.map((feat, i) => (
                <div key={feat.title} className={`flex items-start gap-2 ${i === 0 ? 'text-[#0ECB81] font-semibold' : ''}`}>
                  <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${i === 0 ? 'text-[#0ECB81]' : 'text-[#F0B90B]'}`} />
                  <span>{feat.title}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-[#0ECB81] font-bold">
                <Check className="w-4 h-4 text-[#0ECB81] flex-shrink-0" />
                <span>{isEs ? 'Ahorro Máximo de $99 al Año' : 'Maximum Savings of $99 per Year'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleSubscribe('annual')}
            className="w-full mt-6 py-3.5 bg-gradient-to-r from-[#F0B90B] to-amber-500 hover:from-[#fcd535] hover:to-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-xl shadow-[#F0B90B]/20 flex items-center justify-center gap-2"
          >
            <Crown className="w-4 h-4" />
            <span>{isEs ? 'ACTIVAR ACCESO ANUAL PRO ($249)' : 'UNLOCK ANNUAL PRO ACCESS ($249)'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Feature Comparison Matrix */}
      <div className="bg-[#121418] border border-[#2B2F36] rounded-2xl p-6 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#2B2F36] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#EAECEF] uppercase tracking-wide flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-[#F0B90B]" />
              <span>{isEs ? 'Matriz Comparativa de Funcionalidades' : 'Feature Comparison Matrix'}</span>
            </h3>
            <p className="text-xs text-[#848E9C]">
              {isEs ? 'Vea en detalle las características incluidas en cada nivel de membresía.' : 'Detailed breakdown of features included in each subscription tier.'}
            </p>
          </div>

          <span className="px-3 py-1 bg-[#181A20] border border-[#2B2F36] rounded-lg text-xs font-bold text-[#F0B90B]">
            FREE vs PREMIUM
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2B2F36] text-[#848E9C] uppercase font-mono">
                <th className="py-3 px-4 font-bold">{isEs ? 'Módulo / Funcionalidad' : 'Module / Feature'}</th>
                <th className="py-3 px-4 font-bold text-center w-36 bg-[#181A20]/50">{isEs ? 'Plan Free' : 'Free Tier'}</th>
                <th className="py-3 px-4 font-bold text-center w-48 bg-[#F0B90B]/10 text-[#F0B90B]">{isEs ? 'Plan Premium' : 'Premium Tier'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B2F36] text-[#EAECEF]">
              {corePillars.map((feat, idx) => (
                <tr key={feat.title}>
                  <td className="py-3 px-4 font-semibold">
                    <div className="font-bold text-[#EAECEF]">{feat.title}</div>
                    <div className="text-[11px] text-[#848E9C]">{feat.desc}</div>
                  </td>
                  <td className="py-3 px-4 text-center bg-[#181A20]/30 text-red-400 font-bold">
                    {idx === 2 || idx === 4 ? (
                      <span className="text-[#848E9C]">{isEs ? 'Limitado' : 'Limited'}</span>
                    ) : (
                      <span>✕ {isEs ? 'Bloqueado' : 'Locked'}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center bg-[#F0B90B]/5 font-bold text-emerald-400">
                    ✓ {isEs ? 'Incluido 24/7' : 'Included 24/7'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-[#121418] border border-[#2B2F36] rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-[#EAECEF] uppercase tracking-wide flex items-center gap-2 border-b border-[#2B2F36] pb-3">
          <HelpCircle className="w-5 h-5 text-[#F0B90B]" />
          <span>{isEs ? 'Preguntas Frecuentes sobre la Suscripción' : 'Subscription FAQ'}</span>
        </h3>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="bg-[#181A20] border border-[#2B2F36] rounded-xl overflow-hidden transition"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full text-left px-4 py-3 font-bold text-xs text-[#EAECEF] flex items-center justify-between gap-2 hover:text-[#F0B90B] transition"
              >
                <span>{isEs ? faq.qEs : faq.qEn}</span>
                <ChevronRight className={`w-4 h-4 text-[#848E9C] transition-transform ${activeFaq === idx ? 'rotate-90 text-[#F0B90B]' : ''}`} />
              </button>
              {activeFaq === idx && (
                <div className="px-4 pb-3 text-xs text-[#848E9C] leading-relaxed border-t border-[#2B2F36] pt-2 bg-[#121418]">
                  {isEs ? faq.aEs : faq.aEn}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
