import React, { useState } from 'react';
import {
  X,
  Crown,
  Check,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Coins,
  Wallet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const SubscriptionModal: React.FC = () => {
  const {
    isSubscriptionModalOpen,
    closeSubscriptionModal,
    openCheckoutModal,
    openAuthModal,
    user,
    userProfile,
    isPremium
  } = useAuth();

  const { language, t } = useLanguage();
  const isEs = language === 'es';

  const premiumFeatures = [
    { title: t.subFeature1Title, description: t.subFeature1Desc },
    { title: t.subFeature2Title, description: t.subFeature2Desc },
    { title: t.subFeature3Title, description: t.subFeature3Desc },
    { title: t.subFeature4Title, description: t.subFeature4Desc },
    { title: t.subFeature5Title, description: t.subFeature5Desc },
  ];

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'semiannual' | 'annual'>('annual');

  if (!isSubscriptionModalOpen) return null;

  const selectedPrice = selectedPlan === 'monthly' ? '29' : selectedPlan === 'semiannual' ? '149' : '249';

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      closeSubscriptionModal();
      openAuthModal();
      return;
    }
    closeSubscriptionModal();
    openCheckoutModal(selectedPlan);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-mono">
      <div className="relative w-full max-w-2xl bg-[#121418] border border-[#2B2F36] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2B2F36] bg-[#181A20] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#F0B90B] to-amber-600 text-slate-950 font-black shadow-lg shadow-[#F0B90B]/20">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#EAECEF] uppercase tracking-wide">
                  {isEs ? 'MEMBRESÍA SENTINEL PRO' : 'SENTINEL PRO MEMBERSHIP'}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0B90B]/20 text-[#F0B90B] border border-[#F0B90B]/40">
                  PRO
                </span>
              </div>
              <p className="text-xs text-[#848E9C]">
                {t.subModalSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={closeSubscriptionModal}
            className="p-1.5 text-[#848E9C] hover:text-[#EAECEF] rounded-lg hover:bg-[#2B2F36] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">

          {/* Active Status Banner if already PRO */}
          {isPremium ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <ShieldCheck className="w-5 h-5" />
                  <span>{isEs ? '¡MEMBRESÍA SENTINEL PRO ACTIVA!' : 'ACTIVE SENTINEL PRO MEMBERSHIP!'}</span>
                </div>
                <span className="text-[11px] text-[#848E9C]">
                  {isEs ? 'Expiración:' : 'Expires:'}{' '}
                  {userProfile?.subscription_expires_at
                    ? new Date(
                        typeof userProfile.subscription_expires_at === 'number' || /^\d+$/.test(String(userProfile.subscription_expires_at))
                          ? Number(userProfile.subscription_expires_at)
                          : String(userProfile.subscription_expires_at)
                      ).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
              <p className="text-xs text-[#EAECEF]">
                {t.subModalActiveDesc}
              </p>
            </div>
          ) : (
            <>
              {/* Plan Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                {/* Monthly Plan ($29/mo) */}
                <div
                  onClick={() => setSelectedPlan('monthly')}
                  className={`relative p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    selectedPlan === 'monthly'
                      ? 'bg-[#181A20] border-[#F0B90B] shadow-lg shadow-[#F0B90B]/10'
                      : 'bg-[#121418] border-[#2B2F36] hover:border-[#848E9C]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#848E9C] uppercase">{isEs ? 'Plan Mensual' : 'Monthly Plan'}</span>
                      <h3 className="text-xl font-extrabold text-[#EAECEF] font-mono mt-0.5">$29 <span className="text-[10px] text-[#848E9C] font-normal">/ mo</span></h3>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPlan === 'monthly' ? 'border-[#F0B90B] bg-[#F0B90B] text-slate-950' : 'border-[#2B2F36]'}`}>
                      {selectedPlan === 'monthly' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-[10px] text-[#848E9C]">{isEs ? 'Facturado mensualmente.' : 'Billed monthly.'}</p>
                </div>

                {/* Semi-Annual Plan ($149 / 6 mo) */}
                <div
                  onClick={() => setSelectedPlan('semiannual')}
                  className={`relative p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    selectedPlan === 'semiannual'
                      ? 'bg-[#181A20] border-[#F0B90B] shadow-lg shadow-[#F0B90B]/10'
                      : 'bg-[#121418] border-[#2B2F36] hover:border-[#848E9C]'
                  }`}
                >
                  <div className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-md bg-[#2B2F36] text-[#F0B90B] border border-[#F0B90B]/40 font-extrabold text-[8px] uppercase tracking-wider">
                    {isEs ? 'AHORRA $25' : 'SAVE $25'}
                  </div>

                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#F0B90B] uppercase">{isEs ? 'Semestral' : 'Semi-Annual'}</span>
                      <h3 className="text-xl font-extrabold text-[#EAECEF] font-mono mt-0.5">$149 <span className="text-[10px] text-[#848E9C] font-normal">/ 6 mo</span></h3>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPlan === 'semiannual' ? 'border-[#F0B90B] bg-[#F0B90B] text-slate-950' : 'border-[#2B2F36]'}`}>
                      {selectedPlan === 'semiannual' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-[10px] text-[#848E9C]">{isEs ? 'Equivale a $24.83/mes.' : 'Eq. to $24.83/mo.'}</p>
                </div>

                {/* Annual Plan ($249 / yr - Best Value) */}
                <div
                  onClick={() => setSelectedPlan('annual')}
                  className={`relative p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                    selectedPlan === 'annual'
                      ? 'bg-[#181A20] border-[#F0B90B] shadow-lg shadow-[#F0B90B]/10'
                      : 'bg-[#121418] border-[#2B2F36] hover:border-[#848E9C]'
                  }`}
                >
                  <div className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-md bg-[#F0B90B] text-slate-950 font-extrabold text-[8px] uppercase tracking-wider">
                    {isEs ? 'MEJOR VALOR • -$99' : 'BEST VALUE • -$99'}
                  </div>

                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] font-bold text-[#F0B90B] uppercase">{isEs ? 'Plan Anual' : 'Annual Plan'}</span>
                      <h3 className="text-xl font-extrabold text-[#EAECEF] font-mono mt-0.5">$249 <span className="text-[10px] text-[#848E9C] font-normal">/ yr</span></h3>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPlan === 'annual' ? 'border-[#F0B90B] bg-[#F0B90B] text-slate-950' : 'border-[#2B2F36]'}`}>
                      {selectedPlan === 'annual' && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-[10px] text-[#848E9C]">{isEs ? 'Equivale a $20.75/mes.' : 'Eq. to $20.75/mo.'}</p>
                </div>

              </div>

              {/* Feature Comparison List */}
              <div className="p-4 bg-[#181A20] rounded-xl border border-[#2B2F36] space-y-3">
                <h4 className="text-xs font-bold text-[#EAECEF] uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#F0B90B]" />
                  <span>{t.subModalFeaturesTitle}</span>
                </h4>

                <div className="space-y-2.5 text-xs">
                  {premiumFeatures.map((feature, idx) => (
                    <div
                      key={feature.title}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#121418] border border-[#2B2F36]/80"
                    >
                      <Check
                        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          idx === 0 ? 'text-[#0ECB81]' : 'text-[#F0B90B]'
                        }`}
                      />
                      <div className="space-y-0.5">
                        <div className="font-bold text-[#EAECEF] leading-snug">
                          {feature.title}
                        </div>
                        <p className="text-[11px] text-[#848E9C] leading-relaxed font-sans">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Cryptomus Checkout Box */}
              <form onSubmit={handleCheckout} className="p-4 bg-[#0B0E11] rounded-xl border border-[#2B2F36] space-y-4">
                <div className="p-3.5 bg-[#181A20] rounded-xl border border-[#F0B90B]/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#EAECEF]">
                      <Coins className="w-4 h-4 text-[#F0B90B]" />
                      <span>{isEs ? 'Pasarela Cripto Verificada Cryptomus' : 'Verified Cryptomus Crypto Gateway'}</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#F0B90B]/20 text-[#F0B90B] border border-[#F0B90B]/30">
                      USDT • BTC • ETH • SOL • TON
                    </span>
                  </div>
                  <p className="text-[11px] text-[#848E9C] leading-relaxed font-sans">
                    {isEs
                      ? 'Paga al instante con USDT (TRC-20 / BEP-20), Bitcoin, Ethereum, Solana o Toncoin. Tu acceso PRO se activa automáticamente al confirmarse el webhook firmado en la blockchain.'
                      : 'Pay instantly with USDT (TRC-20 / BEP-20), Bitcoin, Ethereum, Solana, or Toncoin. PRO access activates automatically once the signed on-chain webhook confirms.'}
                  </p>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-[#F0B90B] to-amber-500 hover:from-[#fcd535] hover:to-amber-400 active:opacity-90 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-xl shadow-[#F0B90B]/20"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>
                      {!user
                        ? (isEs ? `INICIAR SESIÓN Y PAGAR $${selectedPrice} CON CRYPTOMUS` : `SIGN IN & PAY $${selectedPrice} WITH CRYPTOMUS`)
                        : (isEs ? `PAGAR $${selectedPrice} CON CRYPTOMUS (CRIPTO)` : `CONTINUE TO CRYPTOMUS CHECKOUT ($${selectedPrice})`)}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#848E9C] pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {isEs ? 'Verificación Criptográfica de Webhook' : 'Cryptographic Webhook Verification'}
                  </span>
                  <span>{isEs ? 'Activación Automática PRO' : 'Automatic PRO Activation'}</span>
                </div>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
