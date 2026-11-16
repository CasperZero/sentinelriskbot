import React from 'react';
import { Lock, Crown, Zap, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface PaywallGateProps {
  title?: string;
  description?: string;
  featureName?: string;
  children?: React.ReactNode;
  mode?: 'full' | 'banner' | 'overlay';
}

export const PaywallGate: React.FC<PaywallGateProps> = ({
  title,
  description,
  featureName,
  children,
  mode = 'full'
}) => {
  const { isPremium, openSubscriptionModal, openAuthModal, user } = useAuth();
  const { language, t } = useLanguage();
  const isEs = language === 'es';

  if (isPremium) {
    return <>{children}</>;
  }

  const handleUpgradeClick = () => {
    openSubscriptionModal();
  };

  if (mode === 'banner') {
    return (
      <div className="p-4 bg-gradient-to-r from-[#181A20] via-[#121418] to-[#181A20] border border-[#F0B90B]/40 rounded-2xl shadow-xl font-mono relative overflow-hidden my-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F0B90B]/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#F0B90B] text-slate-950 font-black shadow-md flex-shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0B90B]/20 text-[#F0B90B] border border-[#F0B90B]/30 uppercase">
                  {isEs ? 'RECURSO PREMIUM' : 'PREMIUM FEATURE'}
                </span>
                <h4 className="text-xs font-bold text-[#EAECEF] uppercase tracking-wide">
                  {title || (featureName ? `${featureName} (${isEs ? 'Suscripción Requerida' : 'Subscription Required'})` : (isEs ? 'Función Exclusiva Premium' : 'Exclusive Premium Feature'))}
                </h4>
              </div>
              <p className="text-xs text-[#848E9C] mt-1 max-w-xl leading-relaxed">
                {description || t.subModalActiveDesc}
              </p>
            </div>
          </div>

          <button
            onClick={handleUpgradeClick}
            className="px-4 py-2.5 bg-[#F0B90B] hover:bg-[#fcd535] active:bg-[#e0ac07] text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 transition flex-shrink-0 shadow-lg shadow-[#F0B90B]/15"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isEs ? 'DESBLOQUEAR PREMIUM' : 'UNLOCK PREMIUM'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative font-mono min-h-[400px] flex items-center justify-center p-6 bg-[#121418] border border-[#2B2F36] rounded-2xl overflow-hidden shadow-2xl">
      {/* Background Dimming Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0E11]/90 via-[#121418]/95 to-[#0B0E11] backdrop-blur-md z-10"></div>

      {/* Paywall Content Card */}
      <div className="relative z-20 max-w-lg w-full text-center space-y-5 p-8 bg-[#181A20] border border-[#F0B90B]/30 rounded-2xl shadow-2xl">
        
        {/* Crown & Lock Icon Badge */}
        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-[#F0B90B]/10 border border-[#F0B90B]/30 text-[#F0B90B] shadow-xl shadow-[#F0B90B]/10">
          <Crown className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/30 text-[#F0B90B] text-[10px] font-bold uppercase tracking-widest">
            {isEs ? 'PLAN DE PAGO - TIER PREMIUM' : 'PAID PLAN - PREMIUM TIER'}
          </div>
          
          <h3 className="text-xl font-extrabold text-[#EAECEF] uppercase tracking-wide">
            {title || (isEs ? 'Acceso Restringido a Suscriptores' : 'Restricted Subscription Access')}
          </h3>

          <p className="text-xs text-[#848E9C] leading-relaxed max-w-md mx-auto">
            {description || t.subModalSubtitle}
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="p-4 bg-[#121418] rounded-xl border border-[#2B2F36] text-left text-xs space-y-2">
          <div className="text-[10px] font-bold uppercase text-[#848E9C] tracking-wider mb-1">
            {t.subModalFeaturesTitle}
          </div>
          <div className="grid grid-cols-1 gap-1.5 text-[#EAECEF]">
            <div className="flex items-center gap-2 text-[#0ECB81] font-semibold">
              <span className="text-[#0ECB81]">✓</span>
              <span>{t.subFeature1Title}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#F0B90B]">✓</span>
              <span>{t.subFeature2Title}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#F0B90B]">✓</span>
              <span>{t.subFeature3Title}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#F0B90B]">✓</span>
              <span>{t.subFeature4Title}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#F0B90B]">✓</span>
              <span>{t.subFeature5Title}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          <button
            onClick={handleUpgradeClick}
            className="w-full py-3.5 bg-gradient-to-r from-[#F0B90B] to-amber-500 hover:from-[#fcd535] hover:to-amber-400 active:opacity-90 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-[#F0B90B]/20 transition"
          >
            <Crown className="w-4 h-4" />
            <span>{isEs ? 'OBTENER SUSCRIPCIÓN PRO ($29/MES)' : 'UPGRADE TO SENTINEL PRO ($29/MO)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {!user && (
            <p className="text-[11px] text-[#848E9C] pt-1">
              {isEs ? '¿Ya tiene suscripción?' : 'Already subscribed?'}{' '}
              <button
                onClick={openAuthModal}
                className="text-[#F0B90B] underline hover:text-[#fcd535]"
              >
                {isEs ? 'Inicie sesión aquí' : 'Log in to your account'}
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
