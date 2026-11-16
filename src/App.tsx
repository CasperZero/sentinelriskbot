import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Lock, ArrowLeft, ShieldCheck, Crown, Terminal } from 'lucide-react';
import { AlertTriggerConfig } from './types';
import { Header } from './components/Header';
import { CommandCenter } from './components/CommandCenter';
import { LandingPage } from './components/LandingPage';
import { LegalModals, LegalDocType } from './components/LegalModals';
import { AuthModal } from './components/AuthModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { CheckoutModal } from './components/CheckoutModal';
import { CryptoManagerModal } from './components/CryptoManagerModal';
import { PaywallGate } from './components/PaywallGate';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CryptoProvider, useCrypto } from './context/CryptoContext';
import { MarketProvider, useMarket } from './context/MarketContext';
import { VolatilityShieldProvider } from './context/VolatilityShieldContext';
import { useLanguage } from './context/LanguageContext';
import { playAlarmSound, getIsGlobalMuted, setGlobalMuted } from './utils/audioAlerts';

const DEFAULT_CONFIG: AlertTriggerConfig = {
  symbol: 'BTCUSDT',
  baseAsset: 'BTC',
  quoteAsset: 'USDT',
  slidingWindowSeconds: 300,
  sellVolumeZScoreThreshold: 2.5,
  sellVolumeRatioThreshold: 0.7,
  minBuyWallBtc: 80,
  wallChewThresholdPercent: 75,
  longLiquidationSpikeUsd: 500000,
  riskIndexAlertThreshold: 80,
  webhookUrl: '/api/webhook-test',
  telegramBotToken: '',
  telegramChatId: '',
  soundAlertsEnabled: true,
  alarmSoundType: 'siren'
};

function resolvePathname(): '/dashboard' | '/' {
  if (typeof window === 'undefined') return '/';
  const raw = window.location.pathname.toLowerCase();
  if (raw.startsWith('/dashboard')) {
    return '/dashboard';
  }
  return '/';
}

function MainApp() {
  const [config, setConfig] = useState<AlertTriggerConfig>(DEFAULT_CONFIG);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => !getIsGlobalMuted());
  const [currentRoute, setCurrentRoute] = useState<'/' | '/dashboard'>(resolvePathname);
  const [guestSessionUnlocked, setGuestSessionUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('sentinel_dashboard_session') === 'true';
    } catch {
      return false;
    }
  });
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocType>(null);

  const navigateTo = useCallback((path: '/' | '/dashboard') => {
    if (typeof window !== 'undefined' && window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentRoute(path);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(resolvePathname());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    setGlobalMuted(!enabled);
  };

  useEffect(() => {
    const handleMuteChange = (e: any) => {
      const isMuted = e?.detail?.isMuted ?? getIsGlobalMuted();
      setSoundEnabledState(!isMuted);
    };
    window.addEventListener('sentinel_audio_mute_toggle', handleMuteChange);
    return () => window.removeEventListener('sentinel_audio_mute_toggle', handleMuteChange);
  }, []);

  const { activeSymbol, setActiveSymbol, trackedSymbols } = useCrypto();
  const {
    activeMetrics: metrics,
    isConnected,
    globalRiskIndex,
    isCrashWarningActive
  } = useMarket();

  const { language, t } = useLanguage();
  const {
    user,
    loading: authLoading,
    isPremium,
    userProfile,
    openAuthModal,
    setAuthModalMode,
    openSubscriptionModal,
    isCheckoutModalOpen,
    closeCheckoutModal,
    checkoutModalPlan
  } = useAuth();

  const lastCrashAlertAtRef = useRef<number>(0);

  // Sync user's custom Watchlist (tracked_symbols) with /server.ts active Binance ingestion loop
  useEffect(() => {
    if (!Array.isArray(trackedSymbols) || trackedSymbols.length === 0) return;
    fetch('/api/symbols/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbols: trackedSymbols,
        tracked_symbols: trackedSymbols,
        userId: user?.uid || userProfile?.uid,
        chatId: userProfile?.telegram_chat_id
      })
    }).catch((err) => console.warn('[Watchlist Sync Warning]', err));
  }, [trackedSymbols, user?.uid, userProfile?.uid, userProfile?.telegram_chat_id]);

  // Sync authenticated subscriber preferences (Chat ID, tracked_symbols, language_preference) to backend
  useEffect(() => {
    if (userProfile?.telegram_chat_id) {
      const activeLang = language || userProfile.language_preference || 'es';
      const effectiveTracked =
        trackedSymbols.length > 0
          ? trackedSymbols
          : userProfile.tracked_symbols || [];
      (async () => {
        const idToken = user ? await user.getIdToken().catch(() => null) : null;
        await fetch('/api/telegram/sync-subscriber', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
          },
          body: JSON.stringify({
            userId: userProfile.uid,
            chatId: userProfile.telegram_chat_id,
            telegramChatId: userProfile.telegram_chat_id,
            subscriptionTier: userProfile.subscription_tier || (isPremium ? 'pro' : 'free'),
            tracked_symbols: effectiveTracked,
            trackedSymbols: effectiveTracked,
            languagePreference: activeLang,
            language_preference: activeLang
          })
        });
      })().catch((err) => console.warn('[24/7 Sentinel Sync Error]', err));
    }
  }, [user, userProfile, isPremium, language, trackedSymbols]);

  // Trigger audio alarm on critical Global Crash Shield activation when inside /dashboard
  useEffect(() => {
    if (currentRoute !== '/dashboard') return;
    const isCritical = isCrashWarningActive || globalRiskIndex >= 80;
    const now = Date.now();
    if (isCritical && now - lastCrashAlertAtRef.current > 60_000) {
      lastCrashAlertAtRef.current = now;
      if (getIsGlobalMuted() || !soundEnabled || !config.soundAlertsEnabled) {
        return;
      }
      playAlarmSound(config.alarmSoundType || 'siren');
    }
  }, [currentRoute, globalRiskIndex, isCrashWarningActive, soundEnabled, config.soundAlertsEnabled, config.alarmSoundType]);

  const handleUpdateConfig = (newConfig: AlertTriggerConfig) => {
    setConfig(newConfig);
    if (newConfig.symbol && newConfig.symbol !== activeSymbol) {
      setActiveSymbol(newConfig.symbol);
    }
  };

  const unlockGuestDashboardSession = () => {
    try {
      sessionStorage.setItem('sentinel_dashboard_session', 'true');
    } catch {
      // ignore storage errors
    }
    setGuestSessionUnlocked(true);
  };

  const handleNavigateToDashboard = () => {
    unlockGuestDashboardSession();
    navigateTo('/dashboard');
  };

  const handleGetProClick = () => {
    unlockGuestDashboardSession();
    navigateTo('/dashboard');
    openSubscriptionModal();
  };

  // ===========================================================================
  // PUBLIC ROOT ROUTE ("/"): CRYPTOMUS-COMPLIANT COMMERCIAL LANDING PAGE
  // ===========================================================================
  if (currentRoute === '/') {
    return (
      <>
        <PWAInstallPrompt />
        <LandingPage
          onNavigateToDashboard={handleNavigateToDashboard}
          onGetProClick={handleGetProClick}
        />
        <AuthModal />
        <SubscriptionModal />
        <CheckoutModal
          isOpen={isCheckoutModalOpen}
          onClose={closeCheckoutModal}
          initialPlan={checkoutModalPlan}
        />
      </>
    );
  }

  // ===========================================================================
  // PROTECTED ROUTE ("/dashboard"): EXECUTIVE COMMAND CENTER
  // ===========================================================================
  const isAuthenticatedOrUnlocked = Boolean(user) || guestSessionUnlocked;

  return (
    <div className="min-h-screen bg-[#0B0E11] text-[#EAECEF] flex flex-col font-sans selection:bg-[#F0B90B] selection:text-slate-950">
      <PWAInstallPrompt />

      <Header
        isConnected={isConnected}
        metrics={metrics}
        config={config}
        onUpdateConfig={handleUpdateConfig}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      {/* Breadcrumb bar to return to public Landing Page ("/") */}
      <div className="border-b border-[#2B2F36] bg-[#121418]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between text-xs font-mono text-[#848E9C]">
          <button
            type="button"
            onClick={() => navigateTo('/')}
            className="inline-flex items-center gap-1.5 text-[#848E9C] hover:text-[#EAECEF] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#F0B90B]" />
            <span>{language === 'es' ? 'Volver al Inicio de Sentinel' : 'Back to Sentinel Home'}</span>
          </button>
          <span className="tabular-nums">Route: /dashboard</span>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!authLoading && !isAuthenticatedOrUnlocked ? (
          /* Protected Route Authentication Gate for direct unauthenticated /dashboard visits */
          <div className="my-12 max-w-xl mx-auto bg-[#181A20] border border-[#2B2F36] rounded-2xl p-6 sm:p-8 space-y-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#121418] border border-[#2B2F36] flex items-center justify-center mx-auto text-[#F0B90B]">
              <Lock className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono text-[#F0B90B] uppercase tracking-wider">
                {language === 'es' ? 'Ruta Ejecutiva Protegida (/dashboard)' : 'Protected Executive Route (/dashboard)'}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#EAECEF]">
                {language === 'es'
                  ? 'Inicia Sesión para Acceder al Centro de Comando'
                  : 'Sign In to Access Sentinel Command Center'}
              </h1>
              <p className="text-sm text-[#848E9C] leading-relaxed">
                {language === 'es'
                  ? 'Autentica tu cuenta para sincronizar tu Watchlist personalizada de Binance, el Bot de Alertas 24/7 en Telegram y los Planes de Ejecución ATR.'
                  : 'Authenticate your account to synchronize your custom Binance Watchlist, 24/7 Telegram Alert Bot, and ATR Execution Plans.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('login');
                  openAuthModal();
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#F0B90B] hover:bg-[#fcd535] text-slate-950 font-bold text-xs transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{language === 'es' ? 'Iniciar Sesión / Crear Cuenta' : 'Sign In / Create Account'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  openSubscriptionModal();
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#121418] hover:bg-[#2B2F36] text-[#F0B90B] border border-[#F0B90B]/40 font-bold text-xs transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Crown className="w-4 h-4" />
                <span>{language === 'es' ? 'Obtener Sentinel PRO - $29/mes' : 'Get Sentinel PRO - $29/mo'}</span>
              </button>
            </div>

            <div className="pt-4 border-t border-[#2B2F36] flex items-center justify-center">
              <button
                type="button"
                onClick={unlockGuestDashboardSession}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-[#848E9C] hover:text-[#EAECEF] underline underline-offset-4 transition-colors"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>
                  {language === 'es'
                    ? 'Continuar a la Vista Previa del Centro de Comando'
                    : 'Continue to Live Command Center Preview'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {!isPremium && (
              <PaywallGate
                mode="banner"
                title={t.appFreePlanBannerTitle}
                description={t.appFreePlanBannerDesc}
              />
            )}

            <CommandCenter />
          </>
        )}
      </main>

      <AuthModal />
      <SubscriptionModal />
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={closeCheckoutModal}
        initialPlan={checkoutModalPlan}
      />
      <CryptoManagerModal />
      <LegalModals
        activeDoc={activeLegalDoc}
        onClose={() => setActiveLegalDoc(null)}
        onSelectDoc={(doc) => setActiveLegalDoc(doc)}
      />

      <footer className="border-t border-[#2B2F36] bg-[#0B0E11] py-5 text-xs font-mono text-[#848E9C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="text-[#EAECEF] font-semibold">Copyright © 2026 Sentinel.</span>
            <span>·</span>
            <a href="mailto:support@sentinel.com" className="text-[#F0B90B] hover:underline">
              support@sentinel.com
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setActiveLegalDoc('terms')}
              className="hover:text-[#EAECEF] underline underline-offset-4 transition-colors"
            >
              {language === 'es' ? 'Términos de Servicio' : 'Terms of Service'}
            </button>
            <button
              type="button"
              onClick={() => setActiveLegalDoc('privacy')}
              className="hover:text-[#EAECEF] underline underline-offset-4 transition-colors"
            >
              {language === 'es' ? 'Política de Privacidad' : 'Privacy Policy'}
            </button>
            <button
              type="button"
              onClick={() => setActiveLegalDoc('refund')}
              className="hover:text-[#EAECEF] underline underline-offset-4 transition-colors"
            >
              {language === 'es' ? 'Política de Reembolsos y Cancelación' : 'Refund & Cancellation Policy'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <VolatilityShieldProvider>
        <CryptoProvider initialSymbol={DEFAULT_CONFIG.symbol}>
          <MarketProvider>
            <MainApp />
          </MarketProvider>
        </CryptoProvider>
      </VolatilityShieldProvider>
    </AuthProvider>
  );
}
