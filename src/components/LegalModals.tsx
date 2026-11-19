import React, { useEffect } from "react";
import { X, FileText, Lock, RotateCcw, Mail } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export type LegalDocType = "terms" | "privacy" | "refund" | null;

export interface LegalModalsProps {
  activeDoc: LegalDocType;
  onClose: () => void;
  onSelectDoc?: (doc: Exclude<LegalDocType, null>) => void;
}

const LEGAL_COPY = {
  en: {
    effectiveDate:
      "Effective Date: January 1, 2026 · Sentinel Quantitative Systems",
    closeAria: "Close modal",
    tabTerms: "Terms of Service",
    tabPrivacy: "Privacy Policy",
    tabRefund: "Refund & Cancellation Policy",
    questionsLabel: "Questions? Contact",
    understoodBtn: "Understood",
    refund: {
      badge: "Official SaaS Refund & Cancellation Policy",
      highlightPrimary:
        "Subscriptions may be canceled at any time. Due to the instant digital nature of quantitative signals, we do not offer refunds for active billing periods.",
      highlightSecondary:
        "Subscriptions can be canceled at any time. Due to the nature of digital signals, we do not offer refunds for active billing periods.",
      s1Title: "1. Subscription Cancellation at Any Time",
      s1BodyBeforeEmail:
        "You may cancel your Sentinel PRO subscription ($29.00 USD / month) at any time directly from your account settings inside the Command Center dashboard or by contacting our support desk at ",
      s1BodyAfterEmail:
        ". Once canceled, your account retains full PRO access until the end of your current paid 30-day billing period, and no subsequent charges will be generated.",
      s2Title: "2. Non-Refundable Instant Digital Delivery",
      s2Body:
        "Sentinel delivers real-time quantitative market telemetry, institutional ATR execution levels, and instant automated 24/7 Telegram alerts immediately upon subscription activation. Because these digital intelligence feeds are delivered and consumed instantaneously and cannot be returned, all completed subscription payments are final and non-refundable for the active billing period.",
      s3Title: "3. Billing Discrepancies & Technical Support",
      s3BodyBeforeEmail:
        "If you experience a duplicate blockchain transfer, gateway settlement issue, or need assistance linking your Telegram Chat ID, please contact ",
      s3BodyAfterEmail:
        " within 7 calendar days with your Order ID. Verified duplicate payments or technical provisioning issues are resolved within 24–48 business hours.",
    },
    terms: {
      s1Title: "1. Informational Algorithmic Alert Tool (Not Financial Advice)",
      s1Body:
        "Sentinel is an informational algorithmic market telemetry and alert software platform. All signals, Global Flash Crash Risk Index scores, order-book wall measurements, and ATR execution blueprints are provided strictly for analytical and informational purposes. Nothing on this platform or dispatched via our Telegram bot constitutes personalized financial, investment, legal, or brokerage advice.",
      s2Title: "2. User Responsibility for Trading Execution",
      s2Body:
        "Trading digital assets on spot and derivatives markets carries a high level of risk and may not be suitable for all investors. Users are 100% responsible for their own trading execution, risk management, and capital allocation decisions. Sentinel is strictly non-custodial: we never hold user funds, never request exchange API withdrawal keys, and never execute trades on your behalf.",
      s3Title: "3. Personal License & Anti-Redistribution",
      s3Body:
        "Your Sentinel PRO membership grants an individual, non-transferable license to access the Command Center and link your personal Telegram Chat ID. Automated scraping, commercial reselling, or unauthorized forwarding of private PRO Telegram alerts to third-party channels is prohibited.",
      s4Title: "4. Subscription Billing & Cancellation",
      s4Body:
        "Sentinel PRO is billed at $29.00 USD per 30-day cycle via OxaPay, Whop, or Mercado Pago. Subscriptions may be canceled at any time. Due to the instant digital nature of quantitative signals, we do not offer refunds for active billing periods.",
    },
    privacy: {
      s1Title: "1. Minimal Data Storage & Purpose",
      s1Body:
        "We store only the essential data required to authenticate your account and deliver 24/7 alerts: your email address, encrypted authentication credentials, selected watchlist trading pairs (tracked_symbols), and your linked Telegram Chat ID. This information is used exclusively to synchronize your personal Command Center and dispatch real-time notifications.",
      s2Title: "2. Zero Third-Party Data Sharing",
      s2Body:
        "Sentinel never sells, rents, trades, or shares your personal email, watchlist preferences, or Telegram identifiers with third-party advertisers, data brokers, or external marketers.",
      s3Title: "3. Cryptographic Payment & Account Security",
      s3BodyBeforeEmail:
        "Subscription payments are processed externally through OxaPay, Whop, and Mercado Pago using cryptographically signed webhooks. Sentinel never stores private wallet keys, seed phrases, or payment card details. You may unlink your Telegram Chat ID at any time with one click in the dashboard or request complete account deletion by writing to ",
      s3BodyAfterEmail: ".",
    },
  },
  es: {
    effectiveDate:
      "Fecha de Vigencia: 1 de enero de 2026 · Sentinel Quantitative Systems",
    closeAria: "Cerrar ventana",
    tabTerms: "Términos de Servicio",
    tabPrivacy: "Política de Privacidad",
    tabRefund: "Política de Reembolsos y Cancelación",
    questionsLabel: "¿Preguntas? Contáctenos en",
    understoodBtn: "Entendido",
    refund: {
      badge: "Política Oficial de Reembolsos y Cancelación SaaS",
      highlightPrimary:
        "Las suscripciones pueden cancelarse en cualquier momento desde el panel. Debido a la naturaleza digital e instantánea de las señales cuantitativas, no se ofrecen reembolsos por períodos de facturación ya iniciados.",
      highlightSecondary:
        "Subscriptions may be canceled at any time. Due to the instant digital nature of quantitative signals, we do not offer refunds for active billing periods.",
      s1Title: "1. Cancelación de Suscripción en Cualquier Momento",
      s1BodyBeforeEmail:
        "Puede cancelar su suscripción a Sentinel PRO ($29.00 USD / mes) en cualquier momento directamente desde el panel de control en el Centro de Comando o escribiendo a nuestro equipo de soporte en ",
      s1BodyAfterEmail:
        ". Una vez cancelada, su cuenta conservará el acceso PRO completo hasta finalizar el período de facturación activo de 30 días, sin cargos posteriores.",
      s2Title: "2. Entrega Digital Instantánea No Reembolsable",
      s2Body:
        "Sentinel entrega telemetría cuantitativa en tiempo real, planes de ejecución ATR institucionales y alertas automatizadas 24/7 en Telegram de forma inmediata tras activar la suscripción. Dado que estas señales digitales se consumen al instante y no pueden devolverse, los pagos completados no son reembolsables por períodos de facturación ya iniciados.",
      s3Title: "3. Soporte de Facturación y Asistencia Técnica",
      s3BodyBeforeEmail:
        "Si experimenta un cobro duplicado en blockchain, una discrepancia en la pasarela o necesita ayuda para vincular su Chat ID de Telegram, escríbanos a ",
      s3BodyAfterEmail:
        " dentro de los 7 días posteriores a la transacción indicando su Order ID. Nuestro equipo resuelve incidencias verificadas en un plazo de 24 a 48 horas hábiles.",
    },
    terms: {
      s1Title:
        "1. Herramienta Algorítmica Informativa (No es Asesoría Financiera)",
      s1Body:
        "Sentinel es una herramienta informativa de monitoreo algorítmico y alertas cuantitativas de mercado. Todas las señales, el Índice Global de Riesgo Anti-Crash, la lectura de muros de liquidez L2 y los planes de ejecución ATR se proporcionan exclusivamente con fines informativos y analíticos. Ningún contenido de la plataforma o del bot de Telegram constituye asesoramiento financiero, de inversión ni recomendación personalizada de compra o venta.",
      s2Title: "2. Responsabilidad del Usuario sobre su Ejecución de Trading",
      s2Body:
        "El trading de criptomonedas en mercados Spot y de Futuros conlleva un alto nivel de riesgo. El usuario es 100% responsable de sus propias decisiones de inversión, gestión de riesgo y ejecución de órdenes. Sentinel es una plataforma estrictamente no custodial: nunca custodiamos fondos, nunca solicitamos claves API de retiro de ningún exchange y nunca ejecutamos operaciones en su nombre.",
      s3Title: "3. Licencia de Uso Personal y Prohibición de Redistribución",
      s3Body:
        "Su suscripción a Sentinel PRO otorga una licencia personal e intransferible para acceder al Centro de Comando y vincular su Chat ID privado de Telegram. Queda prohibida la extracción automatizada (scraping), la reventa comercial o el reenvío no autorizado de señales privadas PRO a grupos públicos.",
      s4Title: "4. Facturación y Cancelación de Suscripciones",
      s4Body:
        "Sentinel PRO tiene un costo de $29.00 USD por período de 30 días procesado mediante OxaPay, Whop o Mercado Pago. Las suscripciones pueden cancelarse en cualquier momento desde el panel. Debido a la naturaleza digital e instantánea de las señales cuantitativas, no se ofrecen reembolsos por períodos de facturación ya iniciados.",
    },
    privacy: {
      s1Title: "1. Almacenamiento Mínimo de Datos y Finalidad",
      s1Body:
        "Únicamente almacenamos los datos estrictamente necesarios para autenticar su cuenta y enviar alertas 24/7: su correo electrónico, credenciales de autenticación cifradas, lista personalizada de pares en seguimiento (watchlist) y su Chat ID de Telegram. Esta información se utiliza exclusivamente para sincronizar su radar y despachar notificaciones en tiempo real.",
      s2Title: "2. Cero Compartición de Datos con Terceros",
      s2Body:
        "Sentinel nunca vende, alquila, comercializa ni comparte su correo electrónico, preferencias de criptomonedas ni identificadores de Telegram con terceros, anunciantes o corredores de datos.",
      s3Title: "3. Seguridad Criptográfica en Pagos y Eliminación de Cuenta",
      s3BodyBeforeEmail:
        "Los pagos de suscripción se procesan de forma segura a través de OxaPay, Whop y Mercado Pago mediante webhooks verificados criptográficamente. Sentinel nunca almacena claves privadas de billeteras, frases semilla ni números de tarjetas. Puede desvincular su cuenta de Telegram con un solo clic desde el panel o solicitar la eliminación total de sus datos escribiendo a ",
      s3BodyAfterEmail: ".",
    },
  },
};

export const LegalModals: React.FC<LegalModalsProps> = ({
  activeDoc,
  onClose,
  onSelectDoc,
}) => {
  const { language } = useLanguage();
  const isEs = language === "es";
  const copy = isEs ? LEGAL_COPY.es : LEGAL_COPY.en;

  useEffect(() => {
    if (!activeDoc) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeDoc, onClose]);

  if (!activeDoc) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-[#121418] border border-[#2B2F36] rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2B2F36] flex items-center justify-between bg-[#0B0E11]">
          <div className="flex items-center gap-3">
            {activeDoc === "terms" && (
              <FileText className="w-5 h-5 text-[#F0B90B] shrink-0" />
            )}
            {activeDoc === "privacy" && (
              <Lock className="w-5 h-5 text-[#0ECB81] shrink-0" />
            )}
            {activeDoc === "refund" && (
              <RotateCcw className="w-5 h-5 text-[#F0B90B] shrink-0" />
            )}
            <div>
              <h2
                id="legal-modal-title"
                className="text-base sm:text-lg font-bold text-[#EAECEF] tracking-tight"
              >
                {activeDoc === "terms" && copy.tabTerms}
                {activeDoc === "privacy" && copy.tabPrivacy}
                {activeDoc === "refund" && copy.tabRefund}
              </h2>
              <p className="text-xs text-[#848E9C] font-mono">
                {copy.effectiveDate}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#181A20] transition-colors"
            aria-label={copy.closeAria}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document Switcher Tabs */}
        {onSelectDoc && (
          <div className="px-6 py-2.5 bg-[#181A20] border-b border-[#2B2F36] flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => onSelectDoc("terms")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeDoc === "terms"
                  ? "bg-[#F0B90B] text-slate-950 font-semibold"
                  : "text-[#848E9C] hover:text-[#EAECEF]"
              }`}
            >
              {copy.tabTerms}
            </button>
            <button
              type="button"
              onClick={() => onSelectDoc("privacy")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeDoc === "privacy"
                  ? "bg-[#F0B90B] text-slate-950 font-semibold"
                  : "text-[#848E9C] hover:text-[#EAECEF]"
              }`}
            >
              {copy.tabPrivacy}
            </button>
            <button
              type="button"
              onClick={() => onSelectDoc("refund")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeDoc === "refund"
                  ? "bg-[#F0B90B] text-slate-950 font-semibold"
                  : "text-[#848E9C] hover:text-[#EAECEF]"
              }`}
            >
              {copy.tabRefund}
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-[#EAECEF]/90 leading-relaxed">
          {activeDoc === "refund" && (
            <>
              <div className="p-4 rounded-xl bg-[#181A20] border border-[#2B2F36] space-y-2">
                <div className="text-xs font-mono font-semibold text-[#F0B90B]">
                  {copy.refund.badge}
                </div>
                <p className="text-sm font-medium text-[#EAECEF]">
                  {copy.refund.highlightPrimary}
                </p>
                <p className="text-xs text-[#848E9C] font-mono">
                  {copy.refund.highlightSecondary}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#EAECEF]">
                  {copy.refund.s1Title}
                </h3>
                <p className="text-[#848E9C]">
                  {copy.refund.s1BodyBeforeEmail}
                  <a
                    href="mailto:support@sentinel.com"
                    className="text-[#F0B90B] hover:underline"
                  >
                    support@sentinel.com
                  </a>
                  {copy.refund.s1BodyAfterEmail}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#EAECEF]">
                  {copy.refund.s2Title}
                </h3>
                <p className="text-[#848E9C]">{copy.refund.s2Body}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#EAECEF]">
                  {copy.refund.s3Title}
                </h3>
                <p className="text-[#848E9C]">
                  {copy.refund.s3BodyBeforeEmail}
                  <a
                    href="mailto:support@sentinel.com"
                    className="text-[#F0B90B] hover:underline"
                  >
                    support@sentinel.com
                  </a>
                  {copy.refund.s3BodyAfterEmail}
                </p>
              </div>
            </>
          )}

          {activeDoc === "terms" && (
            <>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#EAECEF]">
                  {copy.terms.s1Title}
                </h3>
                <p className="text-[#848E9C]">{copy.terms.s1Body}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#EAECEF]">
                  {copy.terms.s2Title}
                </h3>
                <p className="text-[#848E9C]">{copy.terms.s2Body}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#EAECEF]">
                  {copy.terms.s3Title}
                </h3>
                <p className="text-[#848E9C]">{copy.terms.s3Body}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#EAECEF]">
                  {copy.terms.s4Title}
                </h3>
                <p className="text-[#848E9C]">{copy.terms.s4Body}</p>
              </div>
            </>
          )}

          {activeDoc === "privacy" && (
            <>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#EAECEF]">
                  {copy.privacy.s1Title}
                </h3>
                <p className="text-[#848E9C]">{copy.privacy.s1Body}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#EAECEF]">
                  {copy.privacy.s2Title}
                </h3>
                <p className="text-[#848E9C]">{copy.privacy.s2Body}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#EAECEF]">
                  {copy.privacy.s3Title}
                </h3>
                <p className="text-[#848E9C]">
                  {copy.privacy.s3BodyBeforeEmail}
                  <a
                    href="mailto:support@sentinel.com"
                    className="text-[#F0B90B] hover:underline"
                  >
                    support@sentinel.com
                  </a>
                  {copy.privacy.s3BodyAfterEmail}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#2B2F36] bg-[#0B0E11] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#848E9C]">
            <Mail className="w-3.5 h-3.5 text-[#F0B90B] shrink-0" />
            <span>{copy.questionsLabel}</span>
            <a
              href="mailto:support@sentinel.com"
              className="text-[#EAECEF] hover:text-[#F0B90B] font-mono transition-colors"
            >
              support@sentinel.com
            </a>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-lg bg-[#F0B90B] hover:bg-[#fcd535] text-slate-950 font-semibold text-xs transition-colors whitespace-nowrap shrink-0"
          >
            {copy.understoodBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
