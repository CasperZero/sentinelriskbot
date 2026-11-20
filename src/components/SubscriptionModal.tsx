import React, { useState, useEffect } from "react";
import {
  X,
  Crown,
  Check,
  Copy,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Coins,
  Wallet,
  CreditCard,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Globe,
  QrCode,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

type CryptoNetworkId = "bsc" | "polygon" | "arbitrum";

interface CryptoPaymentConfig {
  enabled: boolean;
  walletAddress: string;
  priceUsd: number;
  networks: Array<{
    id: CryptoNetworkId;
    label: string;
    tokens: string[];
  }>;
}

export const SubscriptionModal: React.FC = () => {
  const {
    isSubscriptionModalOpen,
    closeSubscriptionModal,
    openAuthModal,
    user,
    userProfile,
    isPremium,
    refreshUserProfile,
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
  const [gatewayError, setGatewayError] = useState<string | null>(null);

  // Direct On-Chain Crypto State
  const [cryptoConfig, setCryptoConfig] = useState<CryptoPaymentConfig>({
    enabled: false,
    walletAddress: "",
    priceUsd: 29,
    networks: [
      { id: "bsc", label: "BNB Smart Chain (BEP20)", tokens: ["USDT", "USDC"] },
      { id: "polygon", label: "Polygon", tokens: ["USDT", "USDC"] },
      { id: "arbitrum", label: "Arbitrum One", tokens: ["USDT", "USDC"] },
    ],
  });
  const [selectedNetwork, setSelectedNetwork] =
    useState<CryptoNetworkId>("bsc");
  const [txHashInput, setTxHashInput] = useState<string>("");
  const [walletCopied, setWalletCopied] = useState<boolean>(false);
  const [qrLoadError, setQrLoadError] = useState<boolean>(false);
  const [verifyingCrypto, setVerifyingCrypto] = useState<boolean>(false);
  const [cryptoError, setCryptoError] = useState<string | null>(null);
  const [cryptoSuccessData, setCryptoSuccessData] = useState<{
    network: string;
    token: string;
    amount: string;
    txHash: string;
  } | null>(null);

  useEffect(() => {
    if (!isSubscriptionModalOpen) return;
    setGatewayError(null);
    setCryptoError(null);
    setCryptoSuccessData(null);
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

    fetch("/api/payments/crypto/config")
      .then((r) => (r.ok ? r.json() : null))
      .then((cfg) => {
        if (cancelled || !cfg) return;
        setCryptoConfig({
          enabled: Boolean(cfg.enabled && cfg.walletAddress),
          walletAddress: String(cfg.walletAddress || ""),
          priceUsd: Number(cfg.priceUsd) || 29,
          networks:
            Array.isArray(cfg.networks) && cfg.networks.length > 0
              ? cfg.networks
              : [
                  {
                    id: "bsc",
                    label: "BNB Smart Chain (BEP20)",
                    tokens: ["USDT", "USDC"],
                  },
                  { id: "polygon", label: "Polygon", tokens: ["USDT", "USDC"] },
                  {
                    id: "arbitrum",
                    label: "Arbitrum One",
                    tokens: ["USDT", "USDC"],
                  },
                ],
        });
        setQrLoadError(false);
      })
      .catch(() => {
        // Hide crypto option if config cannot be loaded
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

  const handleCopyWalletAddress = () => {
    if (!cryptoConfig.walletAddress) return;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(cryptoConfig.walletAddress);
      setWalletCopied(true);
      setTimeout(() => setWalletCopied(false), 2500);
    }
  };

  const formatLocalizedCryptoError = (
    code?: string,
    fallbackMsg?: string,
    details?: any,
  ): string => {
    switch (code) {
      case "invalid_tx_hash":
        return isEs
          ? "Formato de TxHash inválido. Pega un hash hexadecimal de 66 caracteres que comience con 0x."
          : "Invalid TxHash format. Please paste a valid 66-character hexadecimal hash starting with 0x.";
      case "tx_not_found_or_pending":
      case "tx_pending_confirmations":
        return isEs
          ? "Transacción pendiente de confirmación en la blockchain (requiere al menos 2 bloques). Espera 15 segundos y vuelve a presionar Verificar Pago."
          : "Transaction is still confirming on-chain (requires at least 2 confirmations). Please wait 15 seconds and click Verify Payment again.";
      case "tx_failed":
        return isEs
          ? "La transacción falló o fue revertida en la blockchain. Por favor verifica tu envío."
          : "This transaction failed or reverted on-chain. Please check your transfer.";
      case "tx_too_old":
        return isEs
          ? "Esta transacción tiene más de 48 horas de antigüedad. Si necesitas ayuda, contacta a soporte."
          : "This transaction is older than 48 hours. Please contact support if you need assistance.";
      case "recipient_or_token_mismatch":
        return isEs
          ? "No se encontró una transferencia de USDT o USDC a la billetera oficial de Sentinel en la red seleccionada. Verifica haber elegido la misma red (BEP20, Polygon o Arbitrum)."
          : "No USDT or USDC transfer to the official Sentinel wallet was found on the selected network. Please verify you selected the right network (BEP20, Polygon, or Arbitrum).";
      case "insufficient_amount": {
        const received = details?.receivedAmount;
        const tok = details?.token || "USDT";
        if (received) {
          return isEs
            ? `Monto recibido insuficiente (${received} ${tok}). Asegúrate de que lleguen al menos ${cryptoConfig.priceUsd} USDT/USDC después de la comisión de retiro.`
            : `Insufficient amount received (${received} ${tok}). Please ensure at least ${cryptoConfig.priceUsd} USDT/USDC arrives after exchange withdrawal fees.`;
        }
        return isEs
          ? `El monto recibido es menor a ${cryptoConfig.priceUsd} USDT/USDC. Asegúrate de cubrir la comisión de retiro de tu exchange.`
          : `Transfer amount is below ${cryptoConfig.priceUsd} USDT/USDC. Please ensure exchange withdrawal fees are covered.`;
      }
      case "tx_already_claimed":
        return isEs
          ? "Este Hash de Transacción (TxHash) ya fue utilizado anteriormente para activar una suscripción."
          : "This Transaction Hash (TxHash) has already been used to activate a subscription.";
      case "rate_limited":
        return isEs
          ? "Demasiados intentos de verificación. Espera 1 minuto antes de volver a intentar."
          : "Too many verification attempts. Please wait 1 minute before trying again.";
      case "unauthorized":
        return isEs
          ? "Debes iniciar sesión en tu cuenta antes de verificar tu pago."
          : "Please sign in to your account before verifying your payment.";
      case "rpc_unreachable":
        return isEs
          ? "Conexión ocupada con el nodo RPC de la blockchain. Espera unos segundos y vuelve a presionar Verificar Pago."
          : "Temporary blockchain RPC node timeout. Please wait a few seconds and click Verify Payment again.";
      default:
        return (
          fallbackMsg ||
          (isEs
            ? "No se pudo verificar la transacción. Revisa la red seleccionada y el TxHash."
            : "Could not verify transaction. Please check the selected network and TxHash.")
        );
    }
  };

  const handleVerifyCryptoPayment = async () => {
    if (!user || !user.uid) {
      handleRequireAuth();
      return;
    }

    const cleanHash = txHashInput.trim();
    if (!/^0x[a-fA-F0-9]{64}$/.test(cleanHash)) {
      setCryptoError(formatLocalizedCryptoError("invalid_tx_hash"));
      return;
    }

    setVerifyingCrypto(true);
    setCryptoError(null);

    try {
      const idToken = await user.getIdToken().catch(() => null);
      if (!idToken) {
        setCryptoError(formatLocalizedCryptoError("unauthorized"));
        setVerifyingCrypto(false);
        return;
      }

      const res = await fetch("/api/payments/crypto/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          network: selectedNetwork,
          txHash: cleanHash,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        const errCode =
          data?.code ||
          (res.status === 409
            ? "tx_already_claimed"
            : res.status === 429
              ? "rate_limited"
              : undefined);
        setCryptoError(
          formatLocalizedCryptoError(errCode, data?.error, data?.details),
        );
        return;
      }

      setCryptoSuccessData({
        network: data.network,
        token: data.token,
        amount: data.amount,
        txHash: data.txHash,
      });
      setTxHashInput("");

      await refreshUserProfile(
        Number(data.subscription_expires_at) ||
          Date.now() + 30 * 24 * 60 * 60 * 1000,
      );
    } catch (err: any) {
      setCryptoError(
        err?.message ||
          (isEs
            ? "Error de red al verificar el pago en la blockchain. Intenta nuevamente."
            : "Network error while verifying blockchain transaction. Please try again."),
      );
    } finally {
      setVerifyingCrypto(false);
    }
  };

  const networkTabs: Array<{
    id: CryptoNetworkId;
    title: string;
    badge?: string;
    confirmTime: string;
  }> = [
    {
      id: "bsc",
      title: "BNB Smart Chain (BEP20)",
      badge: isEs
        ? "Comisión más baja / Recomendado"
        : "Lowest fee / Recommended",
      confirmTime: "~6s",
    },
    {
      id: "polygon",
      title: "Polygon",
      confirmTime: "~5s",
    },
    {
      id: "arbitrum",
      title: "Arbitrum One",
      confirmTime: "~3s",
    },
  ];

  const activeNetworkLabel =
    networkTabs.find((n) => n.id === selectedNetwork)?.title ||
    "BNB Smart Chain (BEP20)";

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
              <div className="flex items-center justify-between flex-wrap gap-2">
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
              {cryptoSuccessData && (
                <div className="p-3 rounded-lg bg-[#121418] border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>
                      {isEs
                        ? `Pago verificado en blockchain: ${cryptoSuccessData.amount} ${cryptoSuccessData.token} (${cryptoSuccessData.network.toUpperCase()})`
                        : `On-chain payment verified: ${cryptoSuccessData.amount} ${cryptoSuccessData.token} (${cryptoSuccessData.network.toUpperCase()})`}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#848E9C] truncate">
                    TxHash: {cryptoSuccessData.txHash}
                  </div>
                </div>
              )}
              <p className="text-xs text-[#EAECEF]">{t.subModalActiveDesc}</p>
            </div>
          ) : (
            <>
              {/* Multi-Gateway Payment Section */}
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

                  {/* OPTION C: Direct On-Chain Crypto Verification (USDT / USDC via TxHash) */}
                  {cryptoConfig.enabled && cryptoConfig.walletAddress && (
                    <div className="p-4 bg-[#181A20] rounded-xl border border-emerald-500/40 space-y-4">
                      {/* Panel Title */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <Coins className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-extrabold text-[#EAECEF] flex items-center gap-2 flex-wrap">
                              <span>
                                {isEs
                                  ? `Pago Cripto Directo On-Chain (${cryptoConfig.priceUsd} USDT / USDC)`
                                  : `Direct On-Chain Crypto Payment (${cryptoConfig.priceUsd} USDT / USDC)`}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                {isEs
                                  ? "VERIFICACIÓN POR TXHASH"
                                  : "TXHASH VERIFIED"}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#848E9C] font-sans mt-0.5">
                              {isEs
                                ? "Sin intermediarios ni KYC. Envía USDT o USDC desde cualquier exchange o wallet y pega tu TxHash para activación inmediata."
                                : "Non-custodial, zero middleman. Send USDT or USDC from any exchange or wallet and paste your TxHash for instant activation."}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Step 1: Network Selector Pills */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-[#848E9C] uppercase tracking-wider block">
                          {isEs
                            ? "1. Selecciona la Red Blockchain"
                            : "1. Select Blockchain Network"}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {networkTabs.map((net) => {
                            const isSelected = selectedNetwork === net.id;
                            return (
                              <button
                                key={net.id}
                                type="button"
                                onClick={() => {
                                  setSelectedNetwork(net.id);
                                  setCryptoError(null);
                                }}
                                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                                  isSelected
                                    ? "bg-[#F0B90B]/15 border-[#F0B90B] text-[#EAECEF] shadow-md shadow-[#F0B90B]/10"
                                    : "bg-[#121418] border-[#2B2F36] hover:border-[#848E9C] text-[#848E9C]"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[11px] font-extrabold text-[#EAECEF]">
                                    {net.title}
                                  </span>
                                  <span
                                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                                      isSelected
                                        ? "bg-[#F0B90B]"
                                        : "border border-[#848E9C]"
                                    }`}
                                  />
                                </div>
                                {net.badge ? (
                                  <span className="mt-1.5 inline-block self-start px-1.5 py-0.5 rounded text-[9px] font-black bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30">
                                    {net.badge}
                                  </span>
                                ) : (
                                  <span className="mt-1.5 text-[10px] text-[#848E9C]">
                                    USDT / USDC ({net.confirmTime})
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Step 2: Amount, Wallet Address & Scannable QR Code */}
                      <div className="p-3.5 bg-[#121418] rounded-xl border border-[#2B2F36] space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2B2F36] pb-2.5">
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-[#848E9C] uppercase font-bold block">
                              {isEs
                                ? "Monto Exacto y Monedas Aceptadas:"
                                : "Exact Amount & Accepted Tokens:"}
                            </span>
                            <div className="text-sm font-black text-[#F0B90B]">
                              {cryptoConfig.priceUsd} USDT{" "}
                              <span className="text-[#848E9C] font-normal">
                                {isEs ? "o" : "or"}
                              </span>{" "}
                              {cryptoConfig.priceUsd} USDC
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-[#848E9C] uppercase font-bold block">
                              {isEs ? "Red Seleccionada:" : "Selected Network:"}
                            </span>
                            <span className="text-xs font-extrabold text-emerald-400">
                              {activeNetworkLabel}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3.5">
                          {/* Scannable QR Code */}
                          <div className="w-24 h-24 rounded-xl bg-white p-1.5 flex items-center justify-center flex-shrink-0 shadow-md">
                            {!qrLoadError ? (
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=4&data=${encodeURIComponent(
                                  cryptoConfig.walletAddress,
                                )}`}
                                alt="Receiving Wallet QR Code"
                                className="w-full h-full object-contain"
                                onError={() => setQrLoadError(true)}
                              />
                            ) : (
                              <QrCode className="w-16 h-16 text-slate-950" />
                            )}
                          </div>

                          {/* Receiving 0x Address & One-Click Copy Button */}
                          <div className="w-full min-w-0 flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-[#848E9C] uppercase">
                                {isEs
                                  ? "Dirección de Depósito (EVM 0x):"
                                  : "Receiving Wallet Address (EVM 0x):"}
                              </span>
                              {walletCopied && (
                                <span className="text-[10px] font-bold text-emerald-400">
                                  {isEs
                                    ? "¡Dirección copiada!"
                                    : "Address copied!"}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 p-2 bg-[#0B0E11] rounded-lg border border-[#2B2F36]">
                              <code className="text-[11px] font-mono text-[#EAECEF] break-all flex-1 select-all">
                                {cryptoConfig.walletAddress}
                              </code>
                              <button
                                type="button"
                                onClick={handleCopyWalletAddress}
                                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold transition flex items-center gap-1 flex-shrink-0 ${
                                  walletCopied
                                    ? "bg-emerald-500 text-slate-950"
                                    : "bg-[#F0B90B] hover:bg-[#fcd535] text-slate-950"
                                }`}
                              >
                                {walletCopied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>{isEs ? "Copiado" : "Copied"}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>{isEs ? "Copiar" : "Copy"}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Network & Withdrawal Fee Warning */}
                        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-[11px] text-amber-300 font-sans">
                          <AlertTriangle className="w-4 h-4 text-[#F0B90B] flex-shrink-0 mt-0.5" />
                          <span>
                            {isEs
                              ? `Importante: Selecciona exactamente la red ${activeNetworkLabel} al retirar desde tu exchange o wallet y asegúrate de que lleguen al menos ${cryptoConfig.priceUsd} USDT o USDC.`
                              : `Important: Select the exact ${activeNetworkLabel} network when withdrawing from your exchange or wallet and ensure at least ${cryptoConfig.priceUsd} USDT or USDC arrives.`}
                          </span>
                        </div>
                      </div>

                      {/* Step 3: Paste Transaction Hash (TxHash) & Verify Button */}
                      <div className="space-y-2.5">
                        <label className="text-[11px] font-bold text-[#848E9C] uppercase tracking-wider block">
                          {isEs
                            ? "2. Pega tu Hash de Transacción (TxHash) para Activar PRO"
                            : "2. Paste Your Transaction Hash (TxHash) to Activate PRO"}
                        </label>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={txHashInput}
                            onChange={(e) => {
                              setTxHashInput(e.target.value);
                              if (cryptoError) setCryptoError(null);
                            }}
                            placeholder="0x..."
                            disabled={verifyingCrypto}
                            className="flex-1 px-3 py-2.5 bg-[#0B0E11] border border-[#2B2F36] focus:border-[#F0B90B] focus:outline-none rounded-xl text-xs font-mono text-[#EAECEF] placeholder-[#848E9C]/50"
                          />

                          <button
                            type="button"
                            onClick={handleVerifyCryptoPayment}
                            disabled={verifyingCrypto}
                            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20 flex-shrink-0"
                          >
                            {verifyingCrypto ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>
                                  {isEs
                                    ? "VERIFICANDO ON-CHAIN..."
                                    : "VERIFYING ON-CHAIN..."}
                                </span>
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="w-4 h-4" />
                                <span>
                                  {!user
                                    ? isEs
                                      ? "INICIAR SESIÓN Y VERIFICAR"
                                      : "SIGN IN & VERIFY"
                                    : isEs
                                      ? "VERIFICAR PAGO"
                                      : "VERIFY PAYMENT"}
                                </span>
                              </>
                            )}
                          </button>
                        </div>

                        {cryptoError && (
                          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-start gap-2 font-sans">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{cryptoError}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#848E9C] pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {isEs
                      ? "Verificación On-Chain & Webhooks Oficiales"
                      : "Direct On-Chain & Verified Webhooks"}
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
