import React, { useState } from "react";
import {
  ShieldCheck,
  Send,
  Crosshair,
  AlertTriangle,
  Sliders,
  Check,
  ArrowRight,
  Lock,
  Mail,
  Terminal,
  Globe,
} from "lucide-react";
import { useMarket } from "../context/MarketContext";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { LegalModals, LegalDocType } from "./LegalModals";

export interface LandingPageProps {
  onNavigateToDashboard: () => void;
  onGetProClick: () => void;
}

const LANDING_COPY = {
  en: {
    navFeatures: "Features",
    navEngine: "Execution Engine",
    navPricing: "Pricing",
    navLegal: "Legal & Support",
    navOpenTerminalAuth: "Open Command Center",
    navOpenTerminalGuest: "Launch Command Center",
    heroKicker: "QUANTITATIVE ORDER-BOOK TELEMETRY · 24/7 TELEGRAM DISPATCH",
    heroTitle: "Institutional Grade Crypto Signals & Crash Protection",
    heroHook:
      "Real-time Binance Spot & Futures order-book telemetry scanning 24/7 so you never stare at charts all day.",
    heroBullet1:
      "Exact ATR Entry Zones, TP1 (+1.5R) & TP2 (+2.5R) targets, and hard-capped ≤ 4.0% Stop-Loss.",
    heroBullet2:
      "Global Flash Crash Shield that automatically locks buy signals during market dumps.",
    heroBullet3:
      "Instant 24/7 alerts dispatched straight to your phone via Telegram.",
    ctaLaunchFree: "Launch Free Live Terminal",
    ctaGetPro: "Get Sentinel PRO - $29/mo",
    ctaEnterPro: "Enter PRO Command Center",
    ctaJoinFreeTelegram: "Join Free Telegram Alerts",
    ctaQuickUpgradePro: "Already convinced? Upgrade to PRO ($29/mo) →",
    fomoBannerTitle: "Public Free Alerts Channel (FOMO)",
    fomoBannerDesc:
      "Not PRO yet? Join our public Telegram channel (@SentinelFreeAlerts) to watch real-time signal teasers and verified TP1/TP2 wins 24/7.",
    fomoBannerCta: "Join Free Channel",
    meta1: "Instant OxaPay & Card Activation",
    meta2: "Non-Custodial (Zero Exchange Keys Required)",
    meta3: "Cancel Anytime",
    previewShieldTitle: "GLOBAL FLASH CRASH SHIELD",
    previewLiveFeed: "LIVE BINANCE FEED",
    previewCrashLocked: "Crash Shield Active — Buys Locked",
    previewMonitored247: "Market Conditions Monitored 24/7",
    previewBtcRisk: "BTC Risk",
    previewEthRisk: "ETH Risk",
    previewSamplePlanLabel: "SAMPLE TELEGRAM & TERMINAL EXECUTION PLAN",
    previewScore: "Score",
    previewBuyBadge: "BUY OPPORTUNITY",
    previewSampleDesc:
      "Strong passive bid absorption verified near institutional L2 support floor with seller exhaustion on 15m/1h klines.",
    previewEntryZone: "Entry Zone",
    previewEntryVal: "ATR Band ±0.35x",
    previewStopCap: "Stop Loss Cap",
    previewStopVal: "Max 4.0% Risk",
    previewTp1: "Target 1 (TP1)",
    previewTp1Val: "+1.5R Objective",
    previewTp2: "Target 2 (TP2)",
    previewTp2Val: "+2.5R Objective",
    previewTgHeader: "🤖 @SentinelRiskBot_bot · Just now",
    previewTgLine1: "SOLUSDT — TP1 HIT (+1.5R VERIFIED)",
    previewTgLine2:
      "Entry: $184.20 → Target 1: $191.50 (+3.96%) | Stop trailed to Breakeven.",
    previewVerifiedEvery20s: "Verified every 20s against live prices",
    previewInspectFeed: "Inspect Live Feed →",
    spec1Val: "20s",
    spec1Desc:
      "Continuous Binance Spot & Futures kline + L2 depth ingestion cycle",
    spec2Val: "≤ 4.0%",
    spec2Desc: "Strict algorithmic Stop-Loss risk cap enforced on every signal",
    spec3Val: "≥ 75/100",
    spec3Desc:
      "Minimum multi-factor confluence score required to trigger an alert",
    spec4Val: "4 Hours",
    spec4Desc:
      "Smart per-coin anti-spam cooldown window for clean mobile alerts",
    featuresKicker: "CORE CAPABILITIES · FIVE PRODUCTION PILLARS",
    featuresTitle:
      "Built for Disciplined Execution and Downside Capital Protection",
    featuresSubtitle:
      "Every component of Sentinel is engineered to eliminate emotional entries, filter out low-conviction market chop, and protect your portfolio during sudden liquidity cascades.",
    pillars: [
      {
        num: "01.",
        title: "24/7 Private Telegram Alert Bot",
        description:
          "Instant Buy, Take-Profit, and Emergency Breakdown notifications sent straight to your phone via @SentinelRiskBot_bot without needing to keep a browser tab open.",
        highlight:
          "Sub-second webhook & mobile push delivery · English & Spanish support",
        span: "lg:col-span-2",
      },
      {
        num: "02.",
        title: "Institutional ATR Execution Plans",
        description:
          "Exact Entry Zones, TP1 (1.5R) and TP2 (2.5R) targets, and a strict Stop-Loss capped at max 4% risk on every signal.",
        highlight: "Hard-capped ≤ 4.0% downside protection",
        span: "lg:col-span-1",
      },
      {
        num: "03.",
        title: "Global Flash Crash Shield",
        description:
          "Real-time risk radar driven by BTC, ETH, and order-book liquidation velocity that automatically locks buy signals during market dumps to protect your capital.",
        highlight: "Auto-locks entries when Global Risk ≥ 80/100",
        span: "lg:col-span-1",
      },
      {
        num: "04.",
        title: "Breakdown & Evacuation Warnings",
        description:
          "Early per-coin alerts when key institutional support (1h VWAP & EMA 21) breaks with heavy taker sell volume—warning you before a deeper cascade.",
        highlight: "Real-time L2 support erosion & VWAP breakdown detection",
        span: "lg:col-span-1",
      },
      {
        num: "05.",
        title: "Custom Spot & Futures Watchlist",
        description:
          "Track your favorite Binance Spot and USDⓈ-M Futures pairs 24/7 with automatic Spot-to-Futures fallback and smart 4-hour anti-spam cooldowns.",
        highlight: "Supports all major Binance Spot & Perpetual Futures pairs",
        span: "lg:col-span-1",
      },
    ],
    pricingKicker: "TRANSPARENT SAAS MEMBERSHIP",
    pricingTitle: "One Flat Monthly Rate. Full Institutional Access.",
    pricingSubtitle:
      "Instant account activation via OxaPay, Whop, or Mercado Pago. No hidden tiers, no profit-sharing fees, and no exchange API keys required.",
    freePlanLabel: "OBSERVER PLAN",
    freePlanTitle: "Sentinel Free",
    freePlanUnit: "USD / month",
    freePlanDesc:
      "Designed for traders who want to monitor the Global Market Risk Index and inspect recent winning signals in the web terminal.",
    freeFeat1: "Global Flash Crash Shield risk thermometer",
    freeFeat2: "Web Command Center signal preview",
    freeFeat3: "Recent Winning Signals verification ledger",
    freePlanCta: "Open Free Web Terminal",
    proPlanLabel: "FULL EXECUTIVE ACCESS · MOST POPULAR",
    proPlanTitle: "Sentinel PRO Membership",
    proPlanUnit: " USD / mo",
    proPlanSub: "Billed monthly · Instant crypto checkout",
    proPlanDesc:
      "Complete 24/7 private Telegram alert delivery, institutional ATR execution plans, custom Spot & Futures watchlist synchronization, and automated crash protection.",
    proFeats: [
      {
        title: "24/7 Private Telegram Alert Bot",
        desc: "Instant Buy, Take-Profit, and Emergency Breakdown notifications sent straight to your phone.",
      },
      {
        title: "Institutional ATR Execution Plans",
        desc: "Exact Entry Zones, TP1/TP2 targets, and a strict Stop-Loss capped at max 4% risk on every signal.",
      },
      {
        title: "Global Flash Crash Shield",
        desc: "Real-time risk radar that automatically locks buy signals during market dumps to protect your capital.",
      },
      {
        title: "Breakdown & Evacuation Warnings",
        desc: "Early per-coin alerts when key institutional support (VWAP/EMA) breaks with heavy sell volume.",
      },
      {
        title: "Custom Spot & Futures Watchlist",
        desc: "Track your favorite Binance pairs 24/7 with smart 4-hour anti-spam cooldowns.",
      },
    ],
    proGatewayNote:
      "Secured by OxaPay, Whop & Mercado Pago (USDT, BTC, ETH, Cards)",
    footerBrandDesc:
      "Quantitative cryptocurrency order-book risk monitoring, Flash Crash protection, and automated 24/7 Telegram execution alerts. Non-custodial analytical SaaS platform.",
    footerSupportLabel: "Support:",
    footerPlatformHeader: "Platform",
    footerCommandCenterLink: "Command Center (/dashboard)",
    footerFeaturesLink: "PRO Features",
    footerPricingLink: "Pricing ($29/mo)",
    footerLegalHeader: "Legal & Compliance",
    footerTerms: "Terms of Service",
    footerPrivacy: "Privacy Policy",
    footerRefund: "Refund & Cancellation Policy",
    footerCopyright: "Copyright © 2026 Sentinel. All rights reserved.",
    footerCancelNote: "Subscriptions may be canceled at any time · Support:",
  },
  es: {
    navFeatures: "Funciones",
    navEngine: "Motor de Ejecución",
    navPricing: "Precios",
    navLegal: "Legal y Soporte",
    navOpenTerminalAuth: "Abrir Centro de Comando",
    navOpenTerminalGuest: "Entrar al Centro de Comando",
    heroKicker:
      "TELEMETRÍA CUANTITATIVA DEL LIBRO DE ÓRDENES · ALERTAS TELEGRAM 24/7",
    heroTitle: "Señales Cripto de Grado Institucional y Protección Anti-Crash",
    heroHook:
      "Telemetría en vivo de Binance Spot y Futuros escaneando 24/7 para que no tengas que mirar gráficas todo el día.",
    heroBullet1:
      "Zonas de entrada ATR exactas, objetivos TP1 (+1.5R) y TP2 (+2.5R), y Stop-Loss limitado al 4.0% máx.",
    heroBullet2:
      "Escudo Global Anti-Crash que bloquea compras automáticamente durante desplomes del mercado.",
    heroBullet3:
      "Alertas instantáneas 24/7 enviadas directo a tu celular por Telegram.",
    ctaLaunchFree: "Abrir Terminal en Vivo (Gratis)",
    ctaGetPro: "Obtener Sentinel PRO - $29/mes",
    ctaEnterPro: "Entrar al Centro de Comando PRO",
    ctaJoinFreeTelegram: "Unirse al Canal de Alertas (Gratis)",
    ctaQuickUpgradePro: "¿Ya estás decidido? Pásate a PRO ($29/mes) →",
    fomoBannerTitle: "Canal Público de Alertas (FOMO)",
    fomoBannerDesc:
      "¿Aún no eres PRO? Únete a nuestro canal público en Telegram (@SentinelFreeAlerts) para ver alertas en tiempo real y cierres ganadores TP1/TP2 verificados 24/7.",
    fomoBannerCta: "Unirse al Canal Gratuito",
    meta1: "Activación Instantánea con OxaPay y Tarjeta",
    meta2: "No Custodial (Sin Claves API de Exchanges)",
    meta3: "Cancela en Cualquier Momento",
    previewShieldTitle: "ESCUDO GLOBAL ANTI-CRASH",
    previewLiveFeed: "DATOS BINANCE EN VIVO",
    previewCrashLocked: "Escudo Anti-Crash Activo — Compras Bloqueadas",
    previewMonitored247: "Condiciones de Mercado Monitoreadas 24/7",
    previewBtcRisk: "Riesgo BTC",
    previewEthRisk: "Riesgo ETH",
    previewSamplePlanLabel:
      "EJEMPLO DE PLAN DE EJECUCIÓN EN TELEGRAM Y TERMINAL",
    previewScore: "Puntaje",
    previewBuyBadge: "OPORTUNIDAD DE COMPRA",
    previewSampleDesc:
      "Fuerte absorción compradora verificada cerca del piso de soporte institucional L2 con agotamiento de ventas en velas de 15m y 1h.",
    previewEntryZone: "Zona de Entrada",
    previewEntryVal: "Banda ATR ±0.35x",
    previewStopCap: "Límite Stop Loss",
    previewStopVal: "Riesgo Máx. 4.0%",
    previewTp1: "Objetivo 1 (TP1)",
    previewTp1Val: "Meta +1.5R",
    previewTp2: "Objetivo 2 (TP2)",
    previewTp2Val: "Meta +2.5R",
    previewTgHeader: "🤖 @SentinelRiskBot_bot · Ahora mismo",
    previewTgLine1: "SOLUSDT — TP1 ALCANZADO (+1.5R VERIFICADO)",
    previewTgLine2:
      "Entrada: $184.20 → Objetivo 1: $191.50 (+3.96%) | Stop movido a Breakeven.",
    previewVerifiedEvery20s:
      "Verificado cada 20s con precios reales del mercado",
    previewInspectFeed: "Ver Radar en Vivo →",
    spec1Val: "20s",
    spec1Desc:
      "Ciclo continuo de ingesta de velas y profundidad L2 en Binance Spot y Futuros",
    spec2Val: "≤ 4.0%",
    spec2Desc:
      "Límite estricto de riesgo máximo en Stop-Loss aplicado a cada señal",
    spec3Val: "≥ 75/100",
    spec3Desc:
      "Puntaje mínimo de confluencia institucional requerido para disparar alertas",
    spec4Val: "4 Horas",
    spec4Desc:
      "Enfriamiento inteligente anti-spam por moneda para alertas móviles limpias",
    featuresKicker: "CAPACIDADES CENTRALES · CINCO PILARES DE PRODUCCIÓN",
    featuresTitle:
      "Diseñado para una Ejecución Disciplinada y Protección de Capital",
    featuresSubtitle:
      "Cada módulo de Sentinel está diseñado para eliminar entradas emocionales, filtrar el ruido lateral del mercado y proteger tu portafolio ante caídas abruptas de liquidez.",
    pillars: [
      {
        num: "01.",
        title: "Bot Privado de Alertas 24/7 en Telegram",
        description:
          "Notificaciones instantáneas de Compra, Toma de Ganancias y Evacuación enviadas directo a tu celular mediante @SentinelRiskBot_bot sin necesidad de mantener el navegador abierto.",
        highlight:
          "Entrega móvil en menos de un segundo · Soporte en Español e Inglés",
        span: "lg:col-span-2",
      },
      {
        num: "02.",
        title: "Planes de Ejecución Exactos (ATR)",
        description:
          "Zona de Entrada exacta, Objetivos TP1 (1.5R) y TP2 (2.5R), y Stop Loss estricto limitado al 4% de riesgo máximo en cada señal.",
        highlight: "Protección bajista estricta ≤ 4.0% de riesgo máximo",
        span: "lg:col-span-1",
      },
      {
        num: "03.",
        title: "Escudo Global Anti-Crash",
        description:
          "Radar de riesgo en tiempo real impulsado por la salud de BTC, ETH y la velocidad de liquidaciones que bloquea las compras durante desplomes para proteger tu capital.",
        highlight:
          "Bloquea compras automáticamente cuando el Riesgo Global ≥ 80/100",
        span: "lg:col-span-1",
      },
      {
        num: "04.",
        title: "Alertas de Ruptura y Evacuación",
        description:
          "Avisos tempranos por moneda cuando se rompen soportes institucionales clave (VWAP 1h y EMA 21) con fuerte presión de venta.",
        highlight:
          "Detección en vivo de pérdida de soporte L2 y ruptura de VWAP",
        span: "lg:col-span-1",
      },
      {
        num: "05.",
        title: "Radar Personalizado (Spot y Futuros)",
        description:
          "Monitoreo 24/7 de tus criptomonedas favoritas de Binance Spot y Futuros USDⓈ-M con soporte automático Spot-a-Futuros y filtro anti-spam de 4 horas.",
        highlight:
          "Compatible con todos los pares principales de Binance Spot y Futuros",
        span: "lg:col-span-1",
      },
    ],
    pricingKicker: "MEMBRESÍA SAAS TRANSPARENTE",
    pricingTitle: "Una Tarifa Mensual Fija. Acceso Institucional Completo.",
    pricingSubtitle:
      "Activación instantánea mediante OxaPay, Whop o Mercado Pago. Sin niveles ocultos, sin comisiones sobre ganancias y sin pedir claves API de tus exchanges.",
    freePlanLabel: "PLAN OBSERVADOR",
    freePlanTitle: "Sentinel Gratis",
    freePlanUnit: "USD / mes",
    freePlanDesc:
      "Diseñado para operadores que desean monitorear el Índice de Riesgo Global e inspeccionar el historial de señales ganadoras en la terminal web.",
    freeFeat1: "Termómetro en vivo del Escudo Global Anti-Crash",
    freeFeat2: "Vista previa de señales en el Centro de Comando web",
    freeFeat3: "Historial verificado de Señales Ganadoras (TP1/TP2)",
    freePlanCta: "Abrir Terminal Web Gratis",
    proPlanLabel: "ACCESO EJECUTIVO COMPLETO · MÁS POPULAR",
    proPlanTitle: "Membresía Sentinel PRO",
    proPlanUnit: " USD / mes",
    proPlanSub: "Facturación mensual · Pago cripto instantáneo",
    proPlanDesc:
      "Alertas privadas 24/7 en Telegram, planes de ejecución ATR exactos, sincronización personalizada de Watchlist Spot y Futuros, y protección automática Anti-Crash.",
    proFeats: [
      {
        title: "Bot Privado de Alertas 24/7 en Telegram",
        desc: "Notificaciones instantáneas de Compra, Toma de Ganancias y Evacuación directo a tu celular.",
      },
      {
        title: "Planes de Ejecución Exactos (ATR)",
        desc: "Zona de Entrada, Objetivos TP1/TP2 y Stop Loss estricto limitado al 4% de riesgo máximo en cada señal.",
      },
      {
        title: "Escudo Global Anti-Crash",
        desc: "Radar de riesgo en tiempo real que bloquea las compras durante desplomes para proteger tu capital.",
      },
      {
        title: "Alertas de Ruptura y Evacuación",
        desc: "Avisos inmediatos por moneda cuando se rompen soportes institucionales (VWAP/EMA) con fuerte presión de venta.",
      },
      {
        title: "Radar Personalizado (Spot y Futuros)",
        desc: "Monitoreo 24/7 de tus criptomonedas favoritas de Binance con filtro inteligente anti-spam.",
      },
    ],
    proGatewayNote:
      "Pago seguro vía OxaPay, Whop y Mercado Pago (USDT, BTC, ETH, Tarjetas)",
    footerBrandDesc:
      "Monitoreo cuantitativo de riesgo en libros de órdenes cripto, protección Anti-Crash y alertas automatizadas de ejecución 24/7 en Telegram. Plataforma SaaS analítica no custodial.",
    footerSupportLabel: "Soporte:",
    footerPlatformHeader: "Plataforma",
    footerCommandCenterLink: "Centro de Comando (/dashboard)",
    footerFeaturesLink: "Beneficios PRO",
    footerPricingLink: "Precios ($29/mes)",
    footerLegalHeader: "Legal y Cumplimiento",
    footerTerms: "Términos de Servicio",
    footerPrivacy: "Política de Privacidad",
    footerRefund: "Política de Reembolsos y Cancelación",
    footerCopyright:
      "Copyright © 2026 Sentinel. Todos los derechos reservados.",
    footerCancelNote:
      "Las suscripciones pueden cancelarse en cualquier momento · Soporte:",
  },
};

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToDashboard,
  onGetProClick,
}) => {
  const { globalRiskIndex, btcRiskIndex, ethRiskIndex, isCrashWarningActive } =
    useMarket();
  const { user, isPremium, updateLanguagePreference } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocType>(null);

  const isEs = language === "es";
  const copy = isEs ? LANDING_COPY.es : LANDING_COPY.en;

  const handleSelectLanguage = (nextLang: "en" | "es") => {
    if (nextLang === language) return;
    setLanguage(nextLang);
    updateLanguagePreference(nextLang).catch(() => {});
  };

  const effectiveGlobalRisk =
    globalRiskIndex > 0 ? Math.round(globalRiskIndex) : 22;
  const effectiveBtcRisk = btcRiskIndex > 0 ? Math.round(btcRiskIndex) : 19;
  const effectiveEthRisk = ethRiskIndex > 0 ? Math.round(ethRiskIndex) : 24;

  const pillarIcons = [
    <Send key="p1" className="w-5 h-5 text-[#F0B90B]" />,
    <Crosshair key="p2" className="w-5 h-5 text-[#0ECB81]" />,
    <ShieldCheck key="p3" className="w-5 h-5 text-[#F0B90B]" />,
    <AlertTriangle key="p4" className="w-5 h-5 text-[#F6465D]" />,
    <Sliders key="p5" className="w-5 h-5 text-[#0ECB81]" />,
  ];

  return (
    <div className="min-h-screen bg-[#0B0E11] text-[#EAECEF] flex flex-col font-sans selection:bg-[#F0B90B] selection:text-slate-950">
      {/* ===================================================================== */}
      {/* TOP BAR CONTRACT: Brand — Nav Links — Language Switcher + Primary CTA */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-40 bg-[#0B0E11]/90 backdrop-blur-md border-b border-[#2B2F36]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-lg font-extrabold tracking-tight text-[#EAECEF] whitespace-nowrap shrink-0"
          >
            SENTINEL
          </a>

          {/* Zone 2: 4 concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#848E9C]">
            <a
              href="#features"
              className="hover:text-[#EAECEF] transition-colors whitespace-nowrap shrink-0"
            >
              {copy.navFeatures}
            </a>
            <a
              href="#specifications"
              className="hover:text-[#EAECEF] transition-colors whitespace-nowrap shrink-0"
            >
              {copy.navEngine}
            </a>
            <a
              href="#pricing"
              className="hover:text-[#EAECEF] transition-colors whitespace-nowrap shrink-0"
            >
              {copy.navPricing}
            </a>
            <a
              href="#compliance-footer"
              className="hover:text-[#EAECEF] transition-colors whitespace-nowrap shrink-0"
            >
              {copy.navLegal}
            </a>
          </nav>

          {/* Zone 3: Language Switcher (EN | ES) + Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              role="group"
              aria-label="Language switcher"
              className="inline-flex items-center bg-[#181A20] border border-[#2B2F36] rounded-lg p-0.5 font-mono text-xs"
            >
              <Globe className="w-3.5 h-3.5 text-[#848E9C] ml-2 mr-1 hidden sm:inline" />
              <button
                type="button"
                onClick={() => handleSelectLanguage("en")}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors whitespace-nowrap ${
                  language === "en"
                    ? "bg-[#F0B90B] text-slate-950"
                    : "text-[#848E9C] hover:text-[#EAECEF]"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => handleSelectLanguage("es")}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors whitespace-nowrap ${
                  language === "es"
                    ? "bg-[#F0B90B] text-slate-950"
                    : "text-[#848E9C] hover:text-[#EAECEF]"
                }`}
              >
                ES
              </button>
            </div>

            <button
              type="button"
              onClick={onNavigateToDashboard}
              className="px-3.5 sm:px-4 py-2 rounded-lg text-xs font-semibold bg-[#181A20] hover:bg-[#2B2F36] text-[#EAECEF] border border-[#2B2F36] transition-colors whitespace-nowrap shrink-0"
            >
              {user ? copy.navOpenTerminalAuth : copy.navOpenTerminalGuest}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* =================================================================== */}
        {/* HERO SECTION                                                        */}
        {/* =================================================================== */}
        <section className="relative border-b border-[#2B2F36] py-16 sm:py-24 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
              {/* Left Column: Proposition & Primary CTA */}
              <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
                <div className="text-xs font-mono text-[#F0B90B] tracking-wide">
                  {copy.heroKicker}
                </div>

                <h1
                  className="font-extrabold text-[#EAECEF] tracking-tight leading-[1.12] max-w-2xl"
                  style={{
                    fontSize: "clamp(2.25rem, 4vw, 3.75rem)",
                    textWrap: "balance",
                  }}
                >
                  {copy.heroTitle}
                </h1>

                <div className="space-y-4 max-w-2xl">
                  <p className="text-base sm:text-lg text-[#EAECEF]/90 leading-relaxed font-medium">
                    {copy.heroHook}
                  </p>
                  <ul className="space-y-2.5 text-sm sm:text-base text-[#848E9C]">
                    <li className="flex items-start gap-2.5">
                      <Check className="w-5 h-5 text-[#0ECB81] shrink-0 mt-0.5" />
                      <span>{copy.heroBullet1}</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-5 h-5 text-[#0ECB81] shrink-0 mt-0.5" />
                      <span>{copy.heroBullet2}</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-5 h-5 text-[#0ECB81] shrink-0 mt-0.5" />
                      <span>{copy.heroBullet3}</span>
                    </li>
                  </ul>
                </div>

                {/* Primary & Secondary Actions (Zero Friction Entry Funnel) */}
                <div className="pt-2 space-y-3">
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={onNavigateToDashboard}
                      className="px-6 py-3.5 rounded-xl bg-[#F0B90B] hover:bg-[#fcd535] text-slate-950 font-bold text-sm transition-colors inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 shadow-md"
                    >
                      <Terminal className="w-4 h-4" />
                      <span>
                        {isPremium ? copy.ctaEnterPro : copy.ctaLaunchFree}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <a
                      href="https://t.me/SentinelFreeAlerts"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-3.5 rounded-xl bg-[#181A20] hover:bg-[#2B2F36] text-[#EAECEF] border border-[#0088cc]/50 hover:border-[#0088cc] font-semibold text-sm transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                    >
                      <Send className="w-4 h-4 text-[#0088cc]" />
                      <span>{copy.ctaJoinFreeTelegram}</span>
                    </a>
                  </div>

                  {!isPremium && (
                    <div>
                      <button
                        type="button"
                        onClick={onGetProClick}
                        className="text-xs font-mono text-[#848E9C] hover:text-[#F0B90B] transition-colors underline underline-offset-4"
                      >
                        {copy.ctaQuickUpgradePro}
                      </button>
                    </div>
                  )}
                </div>

                {/* Unboxed Metadata Line (Zero-Pill Discipline) */}
                <div className="pt-1 flex flex-wrap items-center gap-2 text-xs text-[#848E9C] font-mono">
                  <span>{copy.meta1}</span>
                  <span aria-hidden="true">·</span>
                  <span>{copy.meta2}</span>
                  <span aria-hidden="true">·</span>
                  <span>{copy.meta3}</span>
                </div>
              </div>

              {/* Right Column: Live Command Center Telemetry Preview Card */}
              <div className="lg:col-span-5 flex flex-col">
                <div className="bg-[#181A20] border border-[#2B2F36] rounded-2xl p-6 flex flex-col justify-between gap-5 h-full">
                  {/* Live Global Flash Crash Shield Preview */}
                  <div className="space-y-3 border-b border-[#2B2F36] pb-5">
                    <div className="flex items-center justify-between text-xs font-mono text-[#848E9C]">
                      <span>{copy.previewShieldTitle}</span>
                      <span className="text-[#0ECB81] font-semibold tabular-nums">
                        {copy.previewLiveFeed}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-sm font-bold text-[#EAECEF]">
                          {isCrashWarningActive
                            ? copy.previewCrashLocked
                            : copy.previewMonitored247}
                        </div>
                        <div className="text-xs text-[#848E9C] mt-0.5 font-mono tabular-nums">
                          {copy.previewBtcRisk}: {effectiveBtcRisk}/100 ·{" "}
                          {copy.previewEthRisk}: {effectiveEthRisk}/100
                        </div>
                      </div>
                      <div className="text-right font-mono tabular-nums">
                        <span className="text-2xl font-extrabold text-[#0ECB81]">
                          {effectiveGlobalRisk}
                        </span>
                        <span className="text-xs text-[#848E9C]">/100</span>
                      </div>
                    </div>

                    <div className="h-2 w-full rounded-sm bg-[#121418] overflow-hidden">
                      <div
                        className="h-full bg-[#0ECB81] transition-all duration-300"
                        style={{
                          width: `${Math.min(100, Math.max(8, effectiveGlobalRisk))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Sample ATR Signal Blueprint */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-mono text-[#848E9C]">
                          {copy.previewSamplePlanLabel}
                        </div>
                        <div className="text-base font-mono font-bold text-[#EAECEF] mt-0.5">
                          BTCUSDT · {copy.previewScore} 86/100
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#0ECB81]">
                        {copy.previewBuyBadge}
                      </span>
                    </div>

                    <p className="text-xs text-[#848E9C] leading-relaxed">
                      {copy.previewSampleDesc}
                    </p>

                    <div className="grid grid-cols-2 gap-3 bg-[#121418] border border-[#2B2F36] rounded-xl p-3.5 font-mono text-xs tabular-nums">
                      <div>
                        <div className="text-[10px] text-[#848E9C] uppercase">
                          {copy.previewEntryZone}
                        </div>
                        <div className="font-bold text-[#EAECEF] mt-0.5">
                          {copy.previewEntryVal}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#848E9C] uppercase">
                          {copy.previewStopCap}
                        </div>
                        <div className="font-bold text-[#F6465D] mt-0.5">
                          {copy.previewStopVal}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#848E9C] uppercase">
                          {copy.previewTp1}
                        </div>
                        <div className="font-bold text-[#0ECB81] mt-0.5">
                          {copy.previewTp1Val}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#848E9C] uppercase">
                          {copy.previewTp2}
                        </div>
                        <div className="font-bold text-[#0ECB81] mt-0.5">
                          {copy.previewTp2Val}
                        </div>
                      </div>
                    </div>

                    {/* Live Telegram Alert Mockup Bubble */}
                    <div className="bg-[#0B0E11] border border-[#0ECB81]/40 rounded-xl p-3.5 font-mono text-xs space-y-1.5">
                      <div className="text-[11px] text-[#0088cc] font-semibold">
                        {copy.previewTgHeader}
                      </div>
                      <div className="text-[#EAECEF] font-bold">
                        ✅ <strong>{copy.previewTgLine1}</strong>
                      </div>
                      <div className="text-[11px] text-[#848E9C] leading-snug tabular-nums">
                        {copy.previewTgLine2}
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs font-mono text-[#848E9C]">
                    <span>{copy.previewVerifiedEvery20s}</span>
                    <button
                      type="button"
                      onClick={onNavigateToDashboard}
                      className="text-[#F0B90B] hover:underline font-semibold"
                    >
                      {copy.previewInspectFeed}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Full-Width 4-Column Quantitative Proof Bar Below Hero Split */}
            <div
              id="specifications"
              className="mt-14 pt-10 border-t border-[#2B2F36] grid grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <div>
                <div className="text-2xl sm:text-3xl font-mono font-extrabold text-[#EAECEF] tabular-nums">
                  {copy.spec1Val}
                </div>
                <div className="text-xs text-[#848E9C] mt-1">
                  {copy.spec1Desc}
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-mono font-extrabold text-[#0ECB81] tabular-nums">
                  {copy.spec2Val}
                </div>
                <div className="text-xs text-[#848E9C] mt-1">
                  {copy.spec2Desc}
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-mono font-extrabold text-[#F0B90B] tabular-nums">
                  {copy.spec3Val}
                </div>
                <div className="text-xs text-[#848E9C] mt-1">
                  {copy.spec3Desc}
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-mono font-extrabold text-[#EAECEF] tabular-nums">
                  {copy.spec4Val}
                </div>
                <div className="text-xs text-[#848E9C] mt-1">
                  {copy.spec4Desc}
                </div>
              </div>
            </div>

            {/* Above-the-Fold Public Free Alerts Channel (FOMO) Banner */}
            <div className="mt-10 bg-[#181A20] border border-[#F0B90B]/40 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-[#121418] border border-[#2B2F36] text-[#F0B90B] text-xl shrink-0">
                  📢
                </div>
                <div className="space-y-1">
                  <h3 className="text-[#EAECEF] font-bold text-base sm:text-lg">
                    {copy.fomoBannerTitle}
                  </h3>
                  <p className="text-[#848E9C] text-xs sm:text-sm leading-relaxed max-w-2xl">
                    {copy.fomoBannerDesc}
                  </p>
                </div>
              </div>
              <a
                href="https://t.me/SentinelFreeAlerts"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#F0B90B] hover:bg-[#fcd535] text-slate-950 font-bold text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>{copy.fomoBannerCta}</span>
              </a>
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* FEATURES BENTO GRID: THE 5 CORE PRO PILLARS                         */}
        {/* =================================================================== */}
        <section
          id="features"
          className="py-16 sm:py-24 border-b border-[#2B2F36]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="max-w-2xl space-y-3">
              <div className="text-xs font-mono text-[#F0B90B] tracking-wide">
                {copy.featuresKicker}
              </div>
              <h2
                className="text-2xl sm:text-3xl font-bold text-[#EAECEF] tracking-tight"
                style={{ textWrap: "balance" }}
              >
                {copy.featuresTitle}
              </h2>
              <p className="text-sm sm:text-base text-[#848E9C] leading-relaxed">
                {copy.featuresSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {copy.pillars.map((pillar, idx) => (
                <article
                  key={pillar.num}
                  className={`${pillar.span} bg-[#181A20] border border-[#2B2F36] rounded-2xl p-6 sm:p-7 flex flex-col justify-between gap-6 hover:border-[#363C4E] transition-colors`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#848E9C] tabular-nums">
                        {pillar.num}
                      </span>
                      <div className="p-2.5 rounded-xl bg-[#121418] border border-[#2B2F36]">
                        {pillarIcons[idx]}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-[#EAECEF] tracking-tight">
                      {pillar.title}
                    </h3>

                    <p className="text-sm text-[#848E9C] leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#2B2F36] text-xs font-mono text-[#EAECEF]/80">
                    {pillar.highlight}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* PRICING SECTION ($29 USD / MONTH)                                   */}
        {/* =================================================================== */}
        <section
          id="pricing"
          className="py-16 sm:py-24 border-b border-[#2B2F36]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="max-w-2xl mx-auto text-center space-y-3">
              <div className="text-xs font-mono text-[#F0B90B] tracking-wide">
                {copy.pricingKicker}
              </div>
              <h2
                className="text-2xl sm:text-3xl font-bold text-[#EAECEF] tracking-tight"
                style={{ textWrap: "balance" }}
              >
                {copy.pricingTitle}
              </h2>
              <p className="text-sm sm:text-base text-[#848E9C]">
                {copy.pricingSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-stretch">
              {/* Left Card: Free Observer Tier */}
              <div className="lg:col-span-5 bg-[#121418] border border-[#2B2F36] rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6">
                <div className="space-y-5">
                  <div>
                    <div className="text-xs font-mono text-[#848E9C]">
                      {copy.freePlanLabel}
                    </div>
                    <h3 className="text-xl font-bold text-[#EAECEF] mt-1">
                      {copy.freePlanTitle}
                    </h3>
                    <div className="mt-4 flex items-baseline gap-1 font-mono tabular-nums">
                      <span className="text-3xl font-extrabold text-[#EAECEF]">
                        $0
                      </span>
                      <span className="text-xs text-[#848E9C]">
                        {copy.freePlanUnit}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#848E9C] leading-relaxed">
                    {copy.freePlanDesc}
                  </p>

                  <ul className="space-y-3 text-sm text-[#848E9C]">
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#848E9C] shrink-0 mt-0.5" />
                      <span>{copy.freeFeat1}</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#848E9C] shrink-0 mt-0.5" />
                      <span>{copy.freeFeat2}</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#848E9C] shrink-0 mt-0.5" />
                      <span>{copy.freeFeat3}</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={onNavigateToDashboard}
                  className="w-full py-3 px-4 rounded-xl bg-[#181A20] hover:bg-[#2B2F36] text-[#EAECEF] border border-[#2B2F36] font-semibold text-xs transition-colors whitespace-nowrap"
                >
                  {copy.freePlanCta}
                </button>
              </div>

              {/* Right Card: Sentinel PRO ($29/mo) */}
              <div className="lg:col-span-7 bg-[#181A20] border border-[#F0B90B]/60 rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-mono font-semibold text-[#F0B90B]">
                        {copy.proPlanLabel}
                      </div>
                      <h3 className="text-2xl font-bold text-[#EAECEF] mt-1">
                        {copy.proPlanTitle}
                      </h3>
                    </div>

                    <div className="text-left sm:text-right font-mono tabular-nums">
                      <div className="text-3xl sm:text-4xl font-extrabold text-[#F0B90B]">
                        $29
                        <span className="text-sm font-normal text-[#848E9C]">
                          {copy.proPlanUnit}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#848E9C]">
                        {copy.proPlanSub}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-[#EAECEF]/90 leading-relaxed">
                    {copy.proPlanDesc}
                  </p>

                  <div className="border-t border-[#2B2F36] pt-4">
                    <ul className="space-y-3 text-sm text-[#EAECEF]">
                      {copy.proFeats.map((feat) => (
                        <li key={feat.title} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-[#0ECB81] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold">{feat.title}</span>
                            <span className="text-[#848E9C]">
                              {" "}
                              — {feat.desc}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={onGetProClick}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#F0B90B] hover:bg-[#fcd535] text-slate-950 font-bold text-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <span>{isPremium ? copy.ctaEnterPro : copy.ctaGetPro}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#848E9C] font-mono">
                    <span className="inline-flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#0ECB81]" />
                      <span>{copy.proGatewayNote}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveLegalDoc("refund")}
                      className="text-[#848E9C] hover:text-[#EAECEF] underline"
                    >
                      {copy.footerRefund}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===================================================================== */}
      {/* COMPLIANCE FOOTER                                                     */}
      {/* ===================================================================== */}
      <footer
        id="compliance-footer"
        className="bg-[#0B0E11] border-t border-[#2B2F36] py-12 text-xs text-[#848E9C]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 justify-between">
            {/* Brand & Service Description */}
            <div className="md:col-span-5 space-y-2.5">
              <div className="text-base font-extrabold tracking-tight text-[#EAECEF]">
                SENTINEL
              </div>
              <p className="text-xs text-[#848E9C] leading-relaxed max-w-sm">
                {copy.footerBrandDesc}
              </p>
              <div className="pt-1 flex items-center gap-2 font-mono text-xs text-[#EAECEF]">
                <Mail className="w-3.5 h-3.5 text-[#F0B90B] shrink-0" />
                <span>{copy.footerSupportLabel}</span>
                <a
                  href="mailto:support@sentinelriskbot.com"
                  className="text-[#F0B90B] hover:underline"
                >
                  support@sentinelriskbot.com
                </a>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="md:col-span-3 space-y-2.5">
              <div className="font-mono font-semibold text-[#EAECEF] uppercase tracking-wider text-[11px]">
                {copy.footerPlatformHeader}
              </div>
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    onClick={onNavigateToDashboard}
                    className="hover:text-[#EAECEF] transition-colors"
                  >
                    {copy.footerCommandCenterLink}
                  </button>
                </li>
                <li>
                  <a
                    href="#features"
                    className="hover:text-[#EAECEF] transition-colors"
                  >
                    {copy.footerFeaturesLink}
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-[#EAECEF] transition-colors"
                  >
                    {copy.footerPricingLink}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal & Compliance Links */}
            <div className="md:col-span-4 space-y-2.5">
              <div className="font-mono font-semibold text-[#EAECEF] uppercase tracking-wider text-[11px]">
                {copy.footerLegalHeader}
              </div>
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveLegalDoc("terms")}
                    className="hover:text-[#EAECEF] underline underline-offset-4 transition-colors text-left"
                  >
                    {copy.footerTerms}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveLegalDoc("privacy")}
                    className="hover:text-[#EAECEF] underline underline-offset-4 transition-colors text-left"
                  >
                    {copy.footerPrivacy}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveLegalDoc("refund")}
                    className="hover:text-[#EAECEF] underline underline-offset-4 transition-colors text-left"
                  >
                    {copy.footerRefund}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-[#2B2F36] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-[#848E9C]">
            <div>{copy.footerCopyright}</div>
            <div>
              {copy.footerCancelNote}{" "}
              <a
                href="mailto:support@sentinelriskbot.com"
                className="text-[#EAECEF] hover:underline"
              >
                support@sentinelriskbot.com
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Compliance Modals */}
      <LegalModals
        activeDoc={activeLegalDoc}
        onClose={() => setActiveLegalDoc(null)}
        onSelectDoc={(doc) => setActiveLegalDoc(doc)}
      />
    </div>
  );
};
