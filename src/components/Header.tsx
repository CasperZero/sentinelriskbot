import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  ChevronDown,
  Globe,
  Crown,
  User,
  LogOut,
  ShieldCheck,
  Send,
  Sliders,
  ShieldAlert,
  Play,
  Clock
} from 'lucide-react';
import { RiskMetrics, AlertTriggerConfig } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCrypto } from '../context/CryptoContext';
import { useVolatilityShield } from '../context/VolatilityShieldContext';
import { ALARM_SOUND_OPTIONS, playAlarmSound, setGlobalMuted } from '../utils/audioAlerts';
import { TelegramLinkCard } from './TelegramLinkCard';

interface HeaderProps {
  isConnected: boolean;
  metrics: RiskMetrics | null;
  config: AlertTriggerConfig;
  onUpdateConfig?: (newConfig: AlertTriggerConfig) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isConnected,
  config,
  onUpdateConfig,
  soundEnabled,
  setSoundEnabled
}) => {
  const { language, setLanguage, t } = useLanguage();
  const {
    user,
    userProfile,
    isPremium,
    openAuthModal,
    openSubscriptionModal,
    logout,
    updateLanguagePreference,
    isTelegramModalOpen,
    setIsTelegramModalOpen
  } = useAuth();
  const { cryptoList, availableSymbols, setIsManageModalOpen } = useCrypto();
  const {
    isVolatilityShieldActive,
    currentEvent,
    minutesRemaining,
    toggleShieldSimulation
  } = useVolatilityShield();

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isSoundPickerOpen, setIsSoundPickerOpen] = useState(false);
  const [isShieldPopoverOpen, setIsShieldPopoverOpen] = useState(false);

  const handleToggleLanguage = (newLang: 'en' | 'es') => {
    setLanguage(newLang);
    if (userProfile?.uid || user?.uid) {
      updateLanguagePreference(newLang).catch((err) => {
        console.warn('[Header] Failed to sync language preference to Firestore:', err);
      });
    }
  };

  return (
    <header className="bg-[#0B0E11] border-b border-[#2B2F36] text-[#EAECEF] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between py-3 gap-3">
          {/* Brand Wordmark + Real-Time Connection State */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F0B90B] flex items-center justify-center text-slate-950 font-black text-base shadow-sm">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base text-[#EAECEF] tracking-tight font-mono">
                  {t.hdrBrandTitle}
                </h1>
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] px-2 py-0.5 rounded bg-[#181A20] border border-[#2B2F36]">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isConnected ? 'bg-[#0ECB81] animate-pulse' : 'bg-[#F6465D]'
                    }`}
                  />
                  <span className={isConnected ? 'text-[#0ECB81]' : 'text-[#F6465D]'}>
                    {isConnected ? t.hdrLiveTag : t.hdrOfflineTag}
                  </span>
                </span>
              </div>
              <p className="text-[11px] text-[#848E9C] hidden sm:block">
                {t.appFooterStatus}
              </p>
            </div>
          </div>

          {/* Right Controls: Manage Coins, Shield Popover, Audio, Language Toggle, Account */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Manage Coins Quick Trigger */}
            <button
              type="button"
              onClick={() => setIsManageModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#181A20] hover:bg-[#2B2F36] border border-[#2B2F36] text-xs font-mono font-semibold text-[#EAECEF] transition"
            >
              <Sliders className="w-3.5 h-3.5 text-[#F0B90B]" />
              <span className="hidden sm:inline">{t.hdrManageCoins}</span>
              <span className="text-[#848E9C] tabular-nums">({cryptoList.length})</span>
            </button>

            {/* Macro Volatility Shield Status */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsShieldPopoverOpen(!isShieldPopoverOpen)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold font-mono transition border ${
                  isVolatilityShieldActive
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-[#181A20] text-[#0ECB81] border-[#2B2F36] hover:border-[#0ECB81]/40'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="hidden md:inline">
                  {isVolatilityShieldActive
                    ? `${t.hdrMacroShieldActive}${minutesRemaining > 0 ? ` (${minutesRemaining}m)` : ''}`
                    : t.hdrMacroShieldArmed}
                </span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {isShieldPopoverOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-[#181A20] border border-[#2B2F36] rounded-xl shadow-2xl p-3 z-50 font-mono text-xs space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-[#2B2F36]">
                    <span className="font-bold text-[#EAECEF]">
                      {currentEvent?.title || 'FOMC / CPI Shield'}
                    </span>
                    {isVolatilityShieldActive && (
                      <span className="text-[10px] text-amber-300 font-bold">
                        {minutesRemaining > 0 ? `${minutesRemaining}m` : '30m'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#848E9C] leading-snug">
                    {currentEvent?.description || t.ccMacroShieldBanner}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      toggleShieldSimulation();
                      setIsShieldPopoverOpen(false);
                    }}
                    className="w-full py-1.5 rounded-lg bg-[#2B2F36] hover:bg-[#363C4E] text-[#EAECEF] font-bold text-[11px] flex items-center justify-center gap-1.5 transition"
                  >
                    <Play className="w-3 h-3 fill-current text-[#F0B90B]" />
                    <span>
                      {isVolatilityShieldActive ? 'Deactivate Test' : 'Test Macro Shield'}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Audio Mute / Unmute & Sound Picker */}
            <div className="relative flex items-center">
              <button
                type="button"
                onClick={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  setGlobalMuted(!next);
                }}
                className={`p-2 rounded-l-lg border text-xs transition ${
                  soundEnabled
                    ? 'bg-[#F0B90B]/10 border-[#F0B90B]/40 text-[#F0B90B]'
                    : 'bg-[#181A20] border-[#2B2F36] text-[#848E9C] hover:text-[#EAECEF]'
                }`}
                title={soundEnabled ? t.hdrMuteAudio : t.hdrUnmuteAudio}
                aria-label={soundEnabled ? t.hdrMuteAudio : t.hdrUnmuteAudio}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!isPremium) {
                    openSubscriptionModal();
                    return;
                  }
                  setIsSoundPickerOpen(!isSoundPickerOpen);
                }}
                className={`p-2 rounded-r-lg border-t border-b border-r text-xs transition ${
                  isSoundPickerOpen
                    ? 'bg-[#F0B90B] text-slate-950 border-[#F0B90B]'
                    : 'bg-[#181A20] border-[#2B2F36] text-[#848E9C] hover:text-[#EAECEF]'
                }`}
                title={t.alarmSoundTypeLabel}
              >
                <ChevronDown className={`w-3 h-3 transition ${isSoundPickerOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSoundPickerOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-[#181A20] border border-[#2B2F36] rounded-xl shadow-2xl p-2 z-50 font-mono text-xs space-y-1">
                  <div className="text-[10px] text-[#848E9C] px-2 py-1 uppercase font-bold border-b border-[#2B2F36]">
                    {t.alarmSoundTypeLabel}
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-1 py-1">
                    {ALARM_SOUND_OPTIONS.map((snd) => {
                      const isSelected = (config.alarmSoundType || 'siren') === snd.id;
                      const soundName = language === 'es' ? snd.nameEs : snd.nameEn;

                      return (
                        <button
                          key={snd.id}
                          type="button"
                          onClick={() => {
                            if (onUpdateConfig) {
                              onUpdateConfig({ ...config, alarmSoundType: snd.id });
                            }
                            if (soundEnabled) {
                              playAlarmSound(snd.id);
                            }
                            setIsSoundPickerOpen(false);
                          }}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left transition ${
                            isSelected
                              ? 'bg-[#F0B90B]/15 text-[#F0B90B] font-bold border border-[#F0B90B]/30'
                              : 'text-[#EAECEF] hover:bg-[#2B2F36]'
                          }`}
                        >
                          <span>{snd.icon}</span>
                          <span className="text-xs truncate">{soundName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bilingual Language Toggle (US EN / ES ES) */}
            <div className="flex items-center gap-1 bg-[#181A20] p-1 rounded-lg border border-[#2B2F36]">
              <Globe className="w-3.5 h-3.5 text-[#F0B90B] ml-1 mr-0.5 hidden sm:block" />
              <button
                type="button"
                onClick={() => handleToggleLanguage('en')}
                className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold transition ${
                  language === 'en'
                    ? 'bg-[#F0B90B] text-slate-950 shadow'
                    : 'text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B2F36]'
                }`}
              >
                🇺🇸 EN
              </button>
              <button
                type="button"
                onClick={() => handleToggleLanguage('es')}
                className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold transition ${
                  language === 'es'
                    ? 'bg-[#F0B90B] text-slate-950 shadow'
                    : 'text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B2F36]'
                }`}
              >
                🇪🇸 ES
              </button>
            </div>

            {/* Account & Subscription Control */}
            <div className="relative">
              {isPremium ? (
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#F0B90B] hover:bg-[#fcd535] text-slate-950 font-mono font-black text-xs flex items-center gap-1.5 transition"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>{t.hdrProShort}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              ) : user ? (
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#181A20] border border-[#2B2F36] hover:border-[#F0B90B] text-[#EAECEF] font-mono text-xs flex items-center gap-1.5 transition"
                >
                  <span className="font-bold text-[#848E9C]">{t.hdrFreeShort}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#848E9C]" />
                </button>
              ) : (
                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <button
                    type="button"
                    onClick={openAuthModal}
                    className="px-2.5 py-1.5 rounded-lg bg-[#181A20] hover:bg-[#2B2F36] border border-[#2B2F36] text-[#EAECEF] font-bold transition flex items-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5 text-[#F0B90B]" />
                    <span>{t.hdrLogin}</span>
                  </button>
                  <button
                    type="button"
                    onClick={openSubscriptionModal}
                    className="px-2.5 py-1.5 rounded-lg bg-[#F0B90B] hover:bg-[#fcd535] text-slate-950 font-extrabold transition flex items-center gap-1"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>{t.hdrUpgradePro}</span>
                  </button>
                </div>
              )}

              {/* Account Dropdown */}
              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#181A20] border border-[#2B2F36] rounded-xl shadow-2xl z-50 p-3 font-mono text-xs space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#2B2F36] pb-2">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isPremium ? 'bg-[#F0B90B] text-slate-950' : 'bg-[#2B2F36] text-[#848E9C]'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-[#EAECEF] truncate">
                        {userProfile?.displayName || user?.email?.split('@')[0] || 'Trader'}
                      </div>
                      <div className="text-[10px] text-[#848E9C] truncate">{user?.email || ''}</div>
                    </div>
                  </div>

                  <div className="p-2 bg-[#0B0E11] rounded-lg border border-[#2B2F36] space-y-1 text-[11px]">
                    <div className="flex justify-between items-center text-[#848E9C]">
                      <span>{t.hdrTierLabel}</span>
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded ${
                          isPremium ? 'bg-[#F0B90B] text-slate-950' : 'bg-[#2B2F36] text-[#848E9C]'
                        }`}
                      >
                        {isPremium ? t.hdrProShort : t.hdrFreeShort}
                      </span>
                    </div>
                    {userProfile?.subscription_expires_at && (
                      <div className="flex justify-between items-center text-[#848E9C] pt-1">
                        <span>{t.hdrExpiresLabel}</span>
                        <span className="text-[#EAECEF] font-semibold">
                          {new Date(userProfile.subscription_expires_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      setIsTelegramModalOpen(true);
                    }}
                    className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-between transition border ${
                      userProfile?.is_telegram_linked
                        ? 'bg-[#0088cc]/15 border-[#0088cc]/40 text-[#0088cc]'
                        : 'bg-[#121418] border-[#2B2F36] text-[#EAECEF] hover:bg-[#2B2F36]'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-[#0088cc]" />
                      <span>
                        {userProfile?.is_telegram_linked ? t.hdrTelegramLinked : t.hdrTelegramConnect}
                      </span>
                    </span>
                    <Clock className="w-3 h-3 opacity-50" />
                  </button>

                  {!isPremium ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        openSubscriptionModal();
                      }}
                      className="w-full py-2 bg-[#F0B90B] hover:bg-[#fcd535] text-slate-950 font-extrabold rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Crown className="w-4 h-4" />
                      <span>{t.hdrUpgradePro}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        openSubscriptionModal();
                      }}
                      className="w-full py-1.5 bg-[#2B2F36] hover:bg-[#363C4E] text-[#EAECEF] font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Crown className="w-3.5 h-3.5 text-[#F0B90B]" />
                      <span>{t.hdrManageSub}</span>
                    </button>
                  )}

                  {user && (
                    <button
                      type="button"
                      onClick={async () => {
                        setIsAccountMenuOpen(false);
                        await logout();
                      }}
                      className="w-full py-1.5 text-[#F6465D] hover:bg-red-500/10 rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t.hdrSignOut}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Telegram Quick Link Modal */}
      {isTelegramModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg">
            <TelegramLinkCard
              availableSymbols={availableSymbols}
              onClose={() => setIsTelegramModalOpen(false)}
            />
          </div>
        </div>
      )}
    </header>
  );
};
