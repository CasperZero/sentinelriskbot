import React, { useState, useEffect } from 'react';
import { 
  X, 
  Crown, 
  Check, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  QrCode, 
  RefreshCw, 
  AlertCircle, 
  ArrowRight, 
  Coins, 
  Lock,
  Wallet,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: 'monthly' | 'semiannual' | 'annual';
}

interface InvoiceData {
  order_id: string;
  invoice_uuid: string;
  payment_url: string;
  amount: string;
  currency: string;
  payment_amount: string;
  payment_currency: string;
  address?: string;
  network?: string;
  expired_at?: number;
  status_payment?: string;
  is_test?: boolean;
}

const CRYPTO_CURRENCIES = [
  { id: 'USDT', name: 'Tether USD', network: 'TRC-20 (Tron)', badge: 'Fastest & Lowest Fee', icon: '₮' },
  { id: 'USDT_BEP20', name: 'Tether USD', network: 'BEP-20 (BSC)', badge: 'Low Fee', icon: '₮' },
  { id: 'BTC', name: 'Bitcoin', network: 'Native Bitcoin', badge: 'Standard', icon: '₿' },
  { id: 'ETH', name: 'Ethereum', network: 'ERC-20', badge: 'Standard', icon: 'Ξ' },
  { id: 'SOL', name: 'Solana', network: 'Solana Network', badge: 'Instant', icon: '◎' },
  { id: 'TON', name: 'Toncoin', network: 'TON Network', badge: 'Telegram Ready', icon: '💎' },
  { id: 'BNB', name: 'BNB', network: 'BNB Chain', badge: 'Low Fee', icon: '🟡' },
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  initialPlan = 'annual'
}) => {
  const { user, userProfile, openAuthModal } = useAuth();
  const { language, t } = useLanguage();
  const isEs = language === 'es';

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'semiannual' | 'annual'>(initialPlan);
  const [selectedCrypto, setSelectedCrypto] = useState<string>('USDT');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(7200); // 2 hours

  // Sync initial plan when prop changes
  useEffect(() => {
    if (initialPlan) {
      setSelectedPlan(initialPlan);
    }
  }, [initialPlan]);

  // Expiration countdown
  useEffect(() => {
    if (!invoice) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [invoice]);

  // Real-time listener: When server webhook updates user's subscription_tier to pro in Firestore,
  // the AuthContext onSnapshot immediately updates userProfile without manual polling.
  useEffect(() => {
    if (
      (userProfile?.subscription_tier === 'pro' || userProfile?.subscription_tier === 'premium') &&
      userProfile?.payment_status !== 'inactive'
    ) {
      setPaymentSuccess(true);
    }
  }, [userProfile?.subscription_tier, userProfile?.payment_status]);

  if (!isOpen) return null;

  const planDetails = {
    monthly: {
      name: isEs ? 'Plan Mensual' : 'Monthly Plan',
      price: '$29',
      amountNum: 29,
      period: isEs ? '/ mes' : '/ month',
      discount: null,
      days: 30
    },
    semiannual: {
      name: isEs ? 'Plan Semestral (6 Meses)' : 'Semi-Annual (6 Months)',
      price: '$149',
      amountNum: 149,
      period: isEs ? '/ 6 meses' : '/ 6 months',
      discount: isEs ? 'Ahorra $25' : 'Save $25',
      days: 180
    },
    annual: {
      name: isEs ? 'Plan Anual (12 Meses)' : 'Annual Plan (12 Months)',
      price: '$249',
      amountNum: 249,
      period: isEs ? '/ año' : '/ year',
      discount: isEs ? 'Mejor Valor (Ahorra $99)' : 'Best Value (Save $99)',
      days: 365
    }
  };

  const handleCreateInvoice = async () => {
    if (!user?.uid) {
      onClose();
      openAuthModal();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const planInfo = planDetails[selectedPlan];
      const targetCrypto = selectedCrypto.startsWith('USDT') ? 'USDT' : selectedCrypto;
      const idToken = await user.getIdToken().catch(() => null);

      const res = await fetch('/api/payments/create-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify({
          amount: planInfo.amountNum,
          currency: 'USD',
          to_currency: targetCrypto,
          plan: selectedPlan,
          userId: user.uid,
          email: user.email || userProfile?.email || 'trader@sentinel.node',
          returnUrl: window.location.href
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to create Cryptomus invoice');
      }

      setInvoice(data);
      setTimeLeft(7200);
    } catch (err: any) {
      console.error('[Checkout Error]', err);
      setError(err.message || (isEs ? 'Error al generar factura de pago' : 'Failed to generate payment invoice'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleVerifyPayment = async () => {
    if (!invoice || !user?.uid) return;
    setVerifying(true);
    setError(null);

    try {
      const idToken = await user.getIdToken().catch(() => null);
      const res = await fetch('/api/payments/verify-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify({
          order_id: invoice.order_id,
          invoice_uuid: invoice.invoice_uuid,
          userId: user.uid,
          plan: selectedPlan
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || (isEs ? 'No se pudo verificar el pago con la pasarela.' : 'Unable to verify payment with gateway.'));
        return;
      }

      if (data.status === 'success' && (data.subscription_tier === 'pro' || data.payment_status === 'active')) {
        // Server verified payment and updated Firestore directly; AuthContext onSnapshot syncs automatically
        setPaymentSuccess(true);
      } else {
        setError(isEs ? 'El pago aún está en proceso en la blockchain. Por favor confirme su transferencia.' : 'Payment is still confirming on-chain. Please verify transaction.');
      }
    } catch (err: any) {
      console.warn('Verify payment error:', err);
      setError(isEs ? 'Error de conexión al verificar el pago. Intente de nuevo.' : 'Connection error verifying payment. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-mono animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#121418] border border-[#2B2F36] rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2B2F36] bg-[#181A20] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#F0B90B] to-amber-600 text-slate-950 font-black shadow-lg shadow-[#F0B90B]/20">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#EAECEF] uppercase tracking-wide">
                  {isEs ? 'Pasarela de Pago Cripto Cryptomus' : 'Cryptomus Crypto Payment Gateway'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0B90B]/20 text-[#F0B90B] border border-[#F0B90B]/40">
                  OFFICIAL QUANT GATE
                </span>
              </div>
              <p className="text-[11px] text-[#848E9C]">
                {isEs ? 'Pagos descentralizados en USDT, BTC, ETH, SOL con activación instantánea' : 'Decentralized checkout with instant blockchain webhook activation'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B2F36] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#EAECEF]">

          {/* Success State */}
          {paymentSuccess ? (
            <div className="text-center py-10 space-y-5">
              <div className="inline-flex items-center justify-center p-5 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-400 shadow-2xl shadow-emerald-500/20 animate-bounce">
                <CheckCircle2 className="w-14 h-14" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-[#EAECEF] uppercase tracking-tight">
                  {isEs ? '¡Suscripción Sentinel Premium Activada!' : 'Sentinel Premium Activated!'}
                </h3>
                <p className="text-xs text-[#848E9C] max-w-md mx-auto">
                  {isEs 
                    ? 'Su pago ha sido verificado en la blockchain. Su cuenta ha sido actualizada al nivel Premium y todos los módulos avanzados ya están desbloqueados.'
                    : 'Your blockchain transaction has been verified. Your subscription tier is now Premium and all quant features are unlocked.'}
                </p>
              </div>

              <div className="p-4 bg-[#181A20] rounded-xl border border-[#2B2F36] max-w-md mx-auto text-left text-xs space-y-2 font-mono">
                <div className="text-[#F0B90B] font-bold uppercase text-[10px] tracking-wider">
                  {isEs ? 'Recursos Desbloqueados:' : 'Unlocked Capabilities:'}
                </div>
                <div className="text-[#EAECEF] space-y-1">
                  <div>✓ {t.subFeature1Title}</div>
                  <div>✓ {t.subFeature2Title}</div>
                  <div>✓ {t.subFeature3Title}</div>
                  <div>✓ {t.subFeature4Title}</div>
                  <div>✓ {t.subFeature5Title}</div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-8 py-3 bg-[#F0B90B] hover:bg-[#fcd535] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-xl shadow-[#F0B90B]/20"
              >
                {isEs ? 'COMENZAR A OPERAR EN SENTINEL' : 'START TRADING ON SENTINEL'}
              </button>
            </div>
          ) : !invoice ? (
            /* STEP 1: PLAN & CRYPTO SELECTION */
            <div className="space-y-6">
              
              {/* Plan Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#848E9C] uppercase tracking-wider block">
                  {isEs ? '1. Seleccione la Duración del Plan' : '1. Select Plan Duration'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['monthly', 'semiannual', 'annual'] as const).map((planKey) => {
                    const p = planDetails[planKey];
                    const isSelected = selectedPlan === planKey;

                    return (
                      <button
                        key={planKey}
                        type="button"
                        onClick={() => setSelectedPlan(planKey)}
                        className={`p-4 rounded-xl border text-left transition relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#F0B90B]/10 border-[#F0B90B] shadow-lg shadow-[#F0B90B]/10'
                            : 'bg-[#181A20] border-[#2B2F36] hover:border-slate-500'
                        }`}
                      >
                        {p.discount && (
                          <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-[#F0B90B] text-slate-950 text-[9px] font-black uppercase">
                            {p.discount}
                          </span>
                        )}
                        <div>
                          <div className="text-xs font-bold text-[#EAECEF]">{p.name}</div>
                          <div className="mt-2 flex items-baseline gap-1">
                            <span className="text-xl font-extrabold text-[#F0B90B]">{p.price}</span>
                            <span className="text-[10px] text-[#848E9C]">{p.period}</span>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#2B2F36]">
                          <span className="text-[10px] text-[#848E9C]">{p.days} {isEs ? 'días' : 'days'}</span>
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#F0B90B] bg-[#F0B90B]' : 'border-[#848E9C]'}`}>
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950"></span>}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cryptocurrency Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#848E9C] uppercase tracking-wider block">
                  {isEs ? '2. Seleccione Criptomoneda de Pago (Cryptomus)' : '2. Select Payment Cryptocurrency (Cryptomus)'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {CRYPTO_CURRENCIES.map((crypto) => {
                    const isSelected = selectedCrypto === crypto.id;
                    return (
                      <button
                        key={crypto.id}
                        type="button"
                        onClick={() => setSelectedCrypto(crypto.id)}
                        className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                          isSelected
                            ? 'bg-[#F0B90B]/10 border-[#F0B90B] shadow-md shadow-[#F0B90B]/10 text-[#EAECEF]'
                            : 'bg-[#181A20] border-[#2B2F36] hover:border-slate-500 text-[#848E9C]'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                          isSelected ? 'bg-[#F0B90B] text-slate-950' : 'bg-[#2B2F36] text-[#EAECEF]'
                        }`}>
                          {crypto.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-[#EAECEF] truncate">{crypto.id.replace('_BEP20', '')}</div>
                          <div className="text-[10px] text-[#848E9C] truncate">{crypto.network}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Security & Gate Notice */}
              <div className="p-3 bg-[#181A20] rounded-xl border border-[#2B2F36] flex items-center gap-3 text-xs text-[#848E9C]">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>
                  {isEs 
                    ? 'Procesado de forma segura por Cryptomus Payment Gateway. Activación inmediata sin custodia de llaves privadas.' 
                    : 'Securely processed by Cryptomus. Automatic on-chain callback triggers instant membership upgrade.'}
                </span>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleCreateInvoice}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-[#F0B90B] to-amber-500 hover:from-[#fcd535] hover:to-amber-400 active:opacity-90 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-xl shadow-[#F0B90B]/20"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isEs ? 'GENERANDO FACTURA CRYPTOMUS...' : 'GENERATING CRYPTOMUS INVOICE...'}</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    <span>
                      {isEs 
                        ? `PAGAR ${planDetails[selectedPlan].price} USD CON ${selectedCrypto.replace('_BEP20', '')}` 
                        : `PAY ${planDetails[selectedPlan].price} USD WITH ${selectedCrypto.replace('_BEP20', '')}`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </div>
          ) : (
            /* STEP 2: INVOICE DETAILS & CRYPTOMUS PAYMENT SCREEN */
            <div className="space-y-5">
              
              {/* Top Banner with Expiry & Status */}
              <div className="p-4 bg-[#181A20] rounded-xl border border-[#F0B90B]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F0B90B] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F0B90B]"></span>
                  </span>
                  <div>
                    <div className="text-xs font-bold text-[#EAECEF] uppercase">
                      {isEs ? 'Esperando Pago en la Blockchain' : 'Awaiting Blockchain Payment'}
                    </div>
                    <div className="text-[10px] text-[#848E9C]">
                      Order ID: <span className="font-mono text-[#F0B90B]">{invoice.order_id}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-[#0B0E11] px-3 py-1.5 rounded-lg border border-[#2B2F36] text-xs font-bold text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{isEs ? 'Expira en:' : 'Expires in:'} {formatTimer(timeLeft)}</span>
                </div>
              </div>

              {/* Direct Cryptomus Hosted Link Button */}
              {invoice.payment_url && (
                <a
                  href={invoice.payment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 bg-[#F0B90B] hover:bg-[#fcd535] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-[#F0B90B]/15 text-center"
                >
                  <span>{isEs ? 'ABRIR PASARELA CRYPTOMUS OFICIAL' : 'OPEN OFFICIAL CRYPTOMUS CHECKOUT'}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              {/* Deposit Card Details */}
              <div className="p-4 bg-[#0B0E11] rounded-xl border border-[#2B2F36] space-y-4">
                
                <div className="flex items-center justify-between border-b border-[#2B2F36] pb-3">
                  <span className="text-xs text-[#848E9C] uppercase font-bold">
                    {isEs ? 'Monto a Transferir:' : 'Amount to Send:'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-mono font-black text-[#F0B90B]">
                      {invoice.amount} {invoice.currency}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(invoice.amount, 'amount')}
                      className="p-1 rounded bg-[#181A20] hover:bg-[#2B2F36] text-[#848E9C] hover:text-[#EAECEF] transition"
                      title="Copy Amount"
                    >
                      {copiedField === 'amount' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {invoice.address && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#848E9C] uppercase font-bold">
                        {isEs ? 'Dirección de Depósito' : 'Deposit Address'} ({invoice.payment_currency} / {invoice.network || 'TRC20'}):
                      </span>
                      {copiedField === 'address' && (
                        <span className="text-[10px] text-emerald-400 font-bold">
                          {isEs ? '¡Copiado!' : 'Copied to clipboard!'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 p-2.5 bg-[#181A20] rounded-lg border border-[#2B2F36]">
                      <code className="text-xs font-mono text-[#EAECEF] truncate flex-1 select-all">
                        {invoice.address}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy(invoice.address || '', 'address')}
                        className="px-3 py-1 bg-[#2B2F36] hover:bg-[#F0B90B] hover:text-slate-950 text-xs rounded font-bold transition flex items-center gap-1 flex-shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{isEs ? 'Copiar' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* QR Code Placeholder / Representation */}
                <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-[#181A20] rounded-xl border border-[#2B2F36]">
                  <div className="w-24 h-24 bg-white rounded-lg p-2 flex items-center justify-center flex-shrink-0 shadow-md">
                    <QrCode className="w-20 h-20 text-slate-950" />
                  </div>
                  <div className="text-xs text-[#848E9C] space-y-1">
                    <div className="text-[#EAECEF] font-bold">
                      {isEs ? 'Escanee con su billetera o Binance Pay' : 'Scan with your Mobile Wallet or Binance Pay'}
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {isEs 
                        ? 'Envíe únicamente la moneda especificada a esta dirección. Una vez detectada la transacción en la red, su plan se activará automáticamente.'
                        : 'Send only the specified cryptocurrency to this address. The Sentinel engine automatically detects on-chain confirmation.'}
                    </p>
                  </div>
                </div>

              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setInvoice(null)}
                  className="py-3 px-4 rounded-xl border border-[#2B2F36] hover:bg-[#181A20] text-xs font-bold text-[#848E9C] hover:text-[#EAECEF] transition"
                >
                  {isEs ? 'Cambiar Plan o Moneda' : 'Change Plan / Currency'}
                </button>

                <button
                  type="button"
                  onClick={handleVerifyPayment}
                  disabled={verifying}
                  className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-400 active:opacity-90 disabled:opacity-50 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  {verifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{isEs ? 'VERIFICANDO EN BLOCKCHAIN...' : 'CHECKING ON-CHAIN STATUS...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{isEs ? 'YA HE PAGADO (CONFIRMAR ACTIVACIÓN)' : 'I HAVE PAID (VERIFY & ACTIVATE)'}</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
