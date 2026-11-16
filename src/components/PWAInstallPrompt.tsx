import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Check, Share, PlusSquare } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const { language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(() => {
    return localStorage.getItem('sentinel_pwa_dismissed') === 'true';
  });

  useEffect(() => {
    // Check if app is running in standalone mode (already installed)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone ||
      document.referrer.includes('android-app://');
    
    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for BeforeInstallPromptEvent on Chrome / Android / Desktop
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    setBannerDismissed(true);
    localStorage.setItem('sentinel_pwa_dismissed', 'true');
  };

  if (isStandalone || isInstalled || bannerDismissed) {
    return null;
  }

  // Show if either deferred prompt is captured OR if on iOS device
  if (!deferredPrompt && !isIOS) {
    return null;
  }

  return (
    <>
      {/* Top Floating PWA Installation Banner */}
      <div className="bg-[#181A20] border-b border-[#F0B90B]/40 px-4 py-2.5 flex items-center justify-between gap-3 text-xs font-mono shadow-md relative z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F0B90B]/15 border border-[#F0B90B]/40 flex items-center justify-center text-[#F0B90B] shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[#EAECEF] font-bold flex items-center gap-2">
              <span>{language === 'es' ? 'Instalar App Sentinel' : 'Install Sentinel App'}</span>
              <span className="text-[10px] bg-[#0ECB81]/20 text-[#0ECB81] px-1.5 py-0.2 rounded border border-[#0ECB81]/30 font-semibold">
                PWA Ready
              </span>
            </div>
            <p className="text-[11px] text-[#848E9C] hidden sm:block">
              {language === 'es'
                ? 'Acceso instantáneo sin navegador, alertas algorítmicas y soporte offline para escritorio e iOS/Android.'
                : 'Instant standalone desktop & mobile access, low latency alerts, and offline caching.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded bg-[#F0B90B] hover:bg-[#fcd535] text-slate-950 font-bold transition flex items-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === 'es' ? 'Instalar' : 'Install'}</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B2F36] rounded transition"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-mono">
          <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl p-5 max-w-sm w-full space-y-4 relative shadow-2xl">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-3 right-3 text-[#848E9C] hover:text-white p-1 rounded"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-[#2B2F36] pb-3">
              <div className="w-10 h-10 rounded-lg bg-[#F0B90B]/15 border border-[#F0B90B]/40 flex items-center justify-center text-[#F0B90B]">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#EAECEF]">
                  {language === 'es' ? 'Instalar en iPhone / iPad' : 'Install on iPhone / iPad'}
                </h3>
                <p className="text-[11px] text-[#848E9C]">
                  {language === 'es' ? 'Siga estos sencillos pasos en Safari:' : 'Follow these steps in Safari:'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[#EAECEF]">
              <div className="flex items-start gap-3 bg-[#121418] p-2.5 rounded border border-[#2B2F36]">
                <div className="w-6 h-6 rounded bg-[#2B2F36] flex items-center justify-center font-bold text-[#F0B90B] shrink-0">
                  1
                </div>
                <div>
                  <p className="font-semibold flex items-center gap-1">
                    {language === 'es' ? 'Toca el botón Compartir' : 'Tap the Share button'}
                    <Share className="w-3.5 h-3.5 text-[#F0B90B] inline" />
                  </p>
                  <p className="text-[11px] text-[#848E9C]">
                    {language === 'es' ? 'Ubicado en la barra inferior de Safari.' : 'Located at the bottom of Safari browser.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#121418] p-2.5 rounded border border-[#2B2F36]">
                <div className="w-6 h-6 rounded bg-[#2B2F36] flex items-center justify-center font-bold text-[#F0B90B] shrink-0">
                  2
                </div>
                <div>
                  <p className="font-semibold flex items-center gap-1">
                    {language === 'es' ? 'Selecciona "Agregar a inicio"' : 'Select "Add to Home Screen"'}
                    <PlusSquare className="w-3.5 h-3.5 text-[#0ECB81] inline" />
                  </p>
                  <p className="text-[11px] text-[#848E9C]">
                    {language === 'es' ? 'Desplázate hacia abajo en el menú de opciones.' : 'Scroll down in the action menu.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#121418] p-2.5 rounded border border-[#2B2F36]">
                <div className="w-6 h-6 rounded bg-[#2B2F36] flex items-center justify-center font-bold text-[#F0B90B] shrink-0">
                  3
                </div>
                <div>
                  <p className="font-semibold">{language === 'es' ? 'Confirma tocando "Agregar"' : 'Confirm by tapping "Add"'}</p>
                  <p className="text-[11px] text-[#848E9C]">
                    {language === 'es' ? 'La app aparecerá en tu pantalla principal.' : 'The icon will appear on your home screen.'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2 rounded bg-[#F0B90B] text-slate-950 font-bold text-xs hover:bg-[#fcd535] transition"
            >
              {language === 'es' ? 'Entendido' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
