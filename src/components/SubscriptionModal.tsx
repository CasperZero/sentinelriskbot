import React, { useState, useEffect } from "react";
import {
  X,
  Crown,
  Check,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Coins,
  Wallet,
  CreditCard,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Globe,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export const SubscriptionModal: React.FC = () => {
  const {
    isSubscriptionModalOpen,
    closeSubscriptionModal,
    openAuthModal,
    user,
    userProfile,
    isPremium,
  } = useAuth();

  const { language, t } = useLanguage();
  const isEs = language === "es";

  const premiumFeatures = [
    { title: t.subFeature1Title, description: t.subFeature1Desc },
    { title: t.subFeature2Title, description: t.subFeature2Desc },
    { title: t.subFeature3Title, description: t.subFeature3Desc },
    { title: t.subFeature4Title, description: t.subFeature4Desc },
    { title: t.subFeature5Title, description: t.subFeature5Desc },
  ];

  const [mpPriceArs, setMpPriceArs] = useState<number>(38000);
  const [mpLoading, setMpLoading] = useState<boolean>(false);
  const [oxaLoading, setOxaLoading] = useState<boolean>(false);
  const [gatewayError, setGatewayError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSubscriptionModalOpen) return;
    setGatewayError(null);
    let cancelled = false;
    fetch("/api/payments/gateway-status")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        if (Number(data.mpProPriceArs) > 0) {
          setMpPriceArs(Number(data.mpProPriceArs));
        }
      })
      .catch(() => {
        // Keep safe defaults on network failure
      });
    return () => {
      cancelled = true;
    };
  }, [isSubscriptionModalOpen]);

  if (!isSubscriptionModalOpen) return null;

  const rawWhopBaseUrl = String(
    (import.meta as any).env?.VITE_WHOP_CHECKOUT_URL ||
      "https://whop.com/checkout/sentinel-pro",
  ).trim();
  const userEmail = user?.email || userProfile?.email || "";
  const userUid = user?.uid || "";
  const whopSeparator = rawWhopBaseUrl.includes("?") ? "&" : "?";
  const whopCheckoutUrl = userUid
    ? `${rawWhopBaseUrl}${whopSeparator}email=${encodeURIComponent(userEmail)}&metadata[uid]=${encodeURIComponent(userUid)}`
    : rawWhopBaseUrl;

  const handleRequireAuth = () => {
    closeSubscriptionModal();
    openAuthModal();
  };

  const handleMercadoPagoCheckout = async () => {
    if (!user || !user.uid) {
      handleRequireAuth();
      return;
    }

    setMpLoading(true);
    setGatewayError(null);
    try {
      const idToken = await user.getIdToken().catch(() => null);
      const res = await fetch("/api/payments/mercadopago/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          userId: user.uid,
          email: userEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.checkoutUrl) {
        throw new Error(
          data?.error ||
            (isEs
              ? "No se pudo iniciar el checkout de Mercado Pago. Verifique la configuración o intente nuevamente."
              : "Could not start Mercado Pago checkout. Please check configuration or try again."),
        );
      }

      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      setGatewayError(
        err?.message ||
          (isEs
            ? "Error al conectar con Mercado Pago"
            : "Error connecting to Mercado Pago"),
      );
    } finally {
      setMpLoading(false);
    }
  };

  const handleOxaPayCheckout = async () => {
    if (!user || !user.uid) {
      handleRequireAuth();
      return;
    }

    setOxaLoading(true);
    setGatewayError(null);
    try {
      const idToken = await user.getIdToken().catch(() => null);
      const res = await fetch("/api/payments/oxapay/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({}),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.paymentUrl) {
        throw new Error(
          data?.error ||
            (isEs
              ? "No se pudo generar la factura cripto con OxaPay. Por favor intente nuevamente."
              : "Could not generate OxaPay crypto invoice. Please try again."),
        );
      }

      window.location.href = data.paymentUrl;
    } catch (err: any) {
      setGatewayError(
        err?.message ||
          (isEs
            ? "Error al conectar con la pasarela cripto OxaPay"
            : "Error connecting to OxaPay crypto gateway"),
      );
    } finally {
      setOxaLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-mono">
      <div className="relative w-full max-w-2xl bg-[#121418] border border-[#2B2F36] rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2B2F36] bg-[#181A20] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#F0B90B] to-amber-600 text-slate-950 font-black shadow-lg shadow-[#F0B90B]/20">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#EAECEF] uppercase tracking-wide">
                  {isEs
                    ? "OBTENER SENTINEL PRO ($29/MES)"
                    : "GET SENTINEL PRO ($29/MO)"}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0B90B]/20 text-[#F0B90B] border border-[#F0B90B]/40">
                  PRO 24/7
                </span>
              </div>
              <p className="text-xs text-[#848E9C]">{t.subModalSubtitle}</p>
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Active Status Banner if already PRO */}
          {isPremium ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <ShieldCheck className="w-5 h-5" />
                  <span>
                    {isEs
                      ? "¡MEMBRESÍA SENTINEL PRO ACTIVA!"
                      : "ACTIVE SENTINEL PRO MEMBERSHIP!"}
                  </span>
                </div>
                <span className="text-[11px] text-[#848E9C]">
                  {isEs ? "Expiración:" : "Expires:"}{" "}
                  {userProfile?.subscription_expires_at
                    ? new Date(
                        typeof userProfile.subscription_expires_at ===
                          "number" ||
                          /^\d+$/.test(
                            String(userProfile.subscription_expires_at),
                          )
                          ? Number(userProfile.subscription_expires_at)
                          : String(userProfile.subscription_expires_at),
                      ).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <p className="text-xs text-[#EAECEF]">{t.subModalActiveDesc}</p>
            </div>
          ) : (
            <>
              {/* Multi-Gateway Payment Section (3 Official Options) */}
              <div className="p-4 sm:p-5 bg-[#0B0E11] rounded-xl border border-[#2B2F36] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2B2F36] pb-3">
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-[#EAECEF] uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#0ECB81]" />
                      <span>
                        {isEs
                          ? "Selecciona tu Método de Pago Instantáneo"
                          : "Select Your Instant Payment Method"}
                      </span>
                    </h3>
                    <p className="text-[11px] text-[#848E9C] font-sans mt-0.5">
                      {isEs
                        ? "Activación automática de Sentinel PRO (30 días) al confirmarse el pago."
                        : "Automatic 30-day Sentinel PRO activation immediately upon payment confirmation."}
                    </p>
                  </div>
                  <span className="self-start sm:self-center px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/40">
                    $29 USD / {isEs ? "30 DÍAS" : "30 DAYS"}
                  </span>
                </div>

                {gatewayError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{gatewayError}</span>
                  </div>
                )}

                <div className="space-y-3">
                  {/* OPTION A: Whop — Card / Apple Pay (Global — $29 USD) */}
                  <div className="p-3.5 bg-[#181A20] rounded-xl border border-[#F0B90B]/40 hover:border-[#F0B90B] transition space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-[#EAECEF] flex items-center gap-2 flex-wrap">
                            <span>
                              {isEs
                                ? "Tarjeta / Apple Pay (Global — $29 USD)"
                                : "Card / Apple Pay (Global — $29 USD)"}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30 uppercase">
                              {isEs ? "RECOMENDADO" : "INSTANT"}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#848E9C] font-sans mt-0.5">
                            {isEs
                              ? "Visa, Mastercard, Amex, Apple Pay y Google Pay vía Whop Checkout seguro."
                              : "Visa, Mastercard, Amex, Apple Pay & Google Pay via secure Whop Checkout."}
                          </p>
                        </div>
                      </div>
                    </div>

                    {user ? (
                      <a
                        href={whopCheckoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 px-4 bg-gradient-to-r from-[#F0B90B] to-amber-500 hover:from-[#fcd535] hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-[#F0B90B]/20"
                      >
                        <Globe className="w-4 h-4" />
                        <span>
                          {isEs
                            ? "PAGAR CON TARJETA / APPLE PAY ($29 USD)"
                            : "PAY WITH CARD / APPLE PAY ($29 USD)"}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRequireAuth}
                        className="w-full py-3 px-4 bg-gradient-to-r from-[#F0B90B] to-amber-500 hover:from-[#fcd535] hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-[#F0B90B]/20"
                      >
                        <Globe className="w-4 h-4" />
                        <span>
                          {isEs
                            ? "INICIAR SESIÓN Y PAGAR CON TARJETA / APPLE PAY ($29 USD)"
                            : "SIGN IN & PAY WITH CARD / APPLE PAY ($29 USD)"}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* OPTION B: Mercado Pago (Argentina / ARS) */}
                  <div className="p-3.5 bg-[#181A20] rounded-xl border border-sky-500/30 hover:border-sky-400/60 transition space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30">
                          <Wallet className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-[#EAECEF] flex items-center gap-2 flex-wrap">
                            <span>
                              {isEs
                                ? "Mercado Pago (Argentina / ARS)"
                                : "Mercado Pago (Argentina / ARS)"}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                              ${mpPriceArs.toLocaleString("es-AR")} ARS
                            </span>
                          </div>
                          <p className="text-[11px] text-[#848E9C] font-sans mt-0.5">
                            {isEs
                              ? "Dinero en cuenta Mercado Pago, Tarjetas locales de Débito/Crédito en Pesos (Checkout Pro)."
                              : "Mercado Pago wallet balance, local Argentine Debit & Credit cards in ARS (Checkout Pro)."}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleMercadoPagoCheckout}
                      disabled={mpLoading}
                      className="w-full py-3 px-4 bg-[#009EE3] hover:bg-[#008ACA] disabled:opacity-50 text-white font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-[#009EE3]/20"
                    >
                      {mpLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>
                            {isEs
                              ? "CONECTANDO CON MERCADO PAGO..."
                              : "REDIRECTING TO MERCADO PAGO..."}
                          </span>
                        </>
                      ) : (
                        <>
                          <Wallet className="w-4 h-4" />
                          <span>
                            {!user
                              ? isEs
                                ? `INICIAR SESIÓN Y PAGAR CON MERCADO PAGO ($${mpPriceArs.toLocaleString("es-AR")} ARS)`
                                : `SIGN IN & PAY WITH MERCADO PAGO ($${mpPriceArs.toLocaleString("es-AR")} ARS)`
                              : isEs
                                ? `PAGAR CON MERCADO PAGO ($${mpPriceArs.toLocaleString("es-AR")} ARS)`
                                : `PAY WITH MERCADO PAGO ($${mpPriceArs.toLocaleString("es-AR")} ARS)`}
                          </span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* OPTION C: Crypto (USDT / BTC / ETH — OxaPay) */}
                  <div className="p-3.5 bg-[#181A20] rounded-xl border border-emerald-500/30 hover:border-emerald-400/60 transition space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <Coins className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-[#EAECEF] flex items-center gap-2 flex-wrap">
                            <span>
                              {isEs
                                ? "Cripto (USDT / BTC / ETH — OxaPay)"
                                : "Crypto (USDT / BTC / ETH — OxaPay)"}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              USDT • BTC • ETH • SOL
                            </span>
                          </div>
                          <p className="text-[11px] text-[#848E9C] font-sans mt-0.5">
                            {isEs
                              ? "Paga al instante en la blockchain con USDT (TRC-20 / BEP-20 / Polygon), Bitcoin, Ethereum o Solana vía OxaPay."
                              : "Pay instantly on-chain with USDT (TRC-20 / BEP-20 / Polygon), Bitcoin, Ethereum, or Solana via OxaPay."}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleOxaPayCheckout}
                      disabled={oxaLoading}
                      className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20"
                    >
                      {oxaLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>
                            {isEs
                              ? "CONECTANDO CON OXAPAY..."
                              : "REDIRECTING TO OXAPAY..."}
                          </span>
                        </>
                      ) : (
                        <>
                          <Coins className="w-4 h-4" />
                          <span>
                            {!user
                              ? isEs
                                ? "INICIAR SESIÓN Y PAGAR CON CRIPTO (USDT / BTC / ETH)"
                                : "SIGN IN & PAY WITH CRYPTO (USDT / BTC / ETH)"
                              : isEs
                                ? "PAGAR CON CRIPTO (USDT / BTC / ETH)"
                                : "PAY WITH CRYPTO (USDT / BTC / ETH)"}
                          </span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#848E9C] pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {isEs
                      ? "Webhooks Oficiales Verificados"
                      : "Verified Official Webhooks"}
                  </span>
                  <span>
                    {isEs
                      ? "Activación Automática PRO 24/7"
                      : "Automatic 24/7 PRO Activation"}
                  </span>
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
                          idx === 0 ? "text-[#0ECB81]" : "text-[#F0B90B]"
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};
