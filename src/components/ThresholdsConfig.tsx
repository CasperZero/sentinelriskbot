import React, { useState } from 'react';
import { Sliders, Save, Send, Globe, Check, Volume2, VolumeX, Play, Zap, AlertTriangle, ShieldCheck, Coins, Plus } from 'lucide-react';
import { AlertTriggerConfig, PRESET_CRYPTOS } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCrypto } from '../context/CryptoContext';
import { ALARM_SOUND_OPTIONS, playAlarmSound, AlarmSoundType } from '../utils/audioAlerts';
import { TelegramLinkCard } from './TelegramLinkCard';

const OFFICIAL_TELEGRAM_BOT_USERNAME = 'SentinelRiskBot_bot';

interface ThresholdsConfigProps {
  config: AlertTriggerConfig;
  onUpdateConfig: (newConfig: AlertTriggerConfig) => void;
}

export const ThresholdsConfig: React.FC<ThresholdsConfigProps> = ({ config, onUpdateConfig }) => {
  const { t, language } = useLanguage();
  const isEs = language.startsWith('es');
  const { isPremium, openSubscriptionModal } = useAuth();
  const { cryptoList, setIsManageModalOpen } = useCrypto();
  const [formState, setFormState] = useState<AlertTriggerConfig>({ ...config });
  const [savedMessage, setSavedMessage] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(formState);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between border-b border-[#2B2F36] pb-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-[#EAECEF] font-mono flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#F0B90B]" /> {t.configTitle.toUpperCase()}
            </h2>
            <p className="text-xs text-[#848E9C] font-mono mt-0.5">
              {t.configSubtitle}
            </p>
          </div>

          {savedMessage && (
            <span className="text-xs font-mono font-bold text-[#0ECB81] flex items-center gap-1 bg-[#0ECB81]/10 px-3 py-1.5 rounded border border-[#0ECB81]/30">
              <Check className="w-4 h-4" /> {t.thresholdsUpdatedToast}
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Active Crypto Pair & RAM Window */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase text-[#F0B90B] font-bold tracking-wider">
              {t.section1Title}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-mono text-[#EAECEF]">
                    {t.targetCryptoPair}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsManageModalOpen(true)}
                    className="text-[11px] font-mono text-[#F0B90B] hover:text-amber-300 transition flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    {t.manageCryptosPlusMinus}
                  </button>
                </div>
                <div className="flex gap-2">
                  <select
                    value={formState.symbol}
                    onChange={e => {
                      const sel = e.target.value;
                      const preset = cryptoList.find(p => p.symbol === sel) || PRESET_CRYPTOS.find(p => p.symbol === sel);
                      const base = preset ? preset.baseAsset : (sel.endsWith('USDT') ? sel.slice(0, -4) : sel);
                      const wall = preset ? preset.defaultMinWallQty : formState.minBuyWallBtc;
                      setFormState({
                        ...formState,
                        symbol: sel,
                        baseAsset: base,
                        quoteAsset: 'USDT',
                        minBuyWallBtc: wall
                      });
                    }}
                    className="flex-1 bg-[#121418] border border-[#2B2F36] rounded px-3 py-2 text-xs font-mono text-[#EAECEF] focus:outline-none focus:border-[#F0B90B]"
                  >
                    {cryptoList.map(p => (
                      <option key={p.symbol} value={p.symbol}>
                        {p.icon} {p.symbol} ({p.name})
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-[10px] text-[#848E9C] font-mono block mt-1">
                  {t.activeStreamNote}
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#EAECEF] mb-1">
                  {t.slidingWindowSec}
                </label>
                <input
                  type="number"
                  min="60"
                  max="1800"
                  value={formState.slidingWindowSeconds}
                  onChange={e => setFormState({ ...formState, slidingWindowSeconds: Number(e.target.value) })}
                  className="w-full bg-[#121418] border border-[#2B2F36] rounded px-3 py-2 text-xs font-mono text-[#EAECEF] focus:outline-none focus:border-[#F0B90B]"
                />
                <span className="text-[10px] text-[#848E9C] font-mono block mt-1">
                  {t.slidingWindowHelp}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Rule 1 Thresholds */}
          <div className="space-y-4 pt-4 border-t border-[#2B2F36]">
            <h3 className="text-xs font-mono uppercase text-[#F6465D] font-bold tracking-wider">
              {t.section2Title}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#EAECEF] mb-1">
                  {t.zScoreThreshold}
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="6.0"
                  value={formState.sellVolumeZScoreThreshold}
                  onChange={e => setFormState({ ...formState, sellVolumeZScoreThreshold: Number(e.target.value) })}
                  className="w-full bg-[#121418] border border-[#2B2F36] rounded px-3 py-2 text-xs font-mono text-[#EAECEF] focus:outline-none focus:border-[#F0B90B]"
                />
                <span className="text-[10px] text-[#848E9C] font-mono block mt-1">
                  {t.zScoreHelp}
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#EAECEF] mb-1">
                  {t.sellRatioThreshold}
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.5"
                  max="0.95"
                  value={formState.sellVolumeRatioThreshold}
                  onChange={e => setFormState({ ...formState, sellVolumeRatioThreshold: Number(e.target.value) })}
                  className="w-full bg-[#121418] border border-[#2B2F36] rounded px-3 py-2 text-xs font-mono text-[#EAECEF] focus:outline-none focus:border-[#F0B90B]"
                />
                <span className="text-[10px] text-[#848E9C] font-mono block mt-1">
                  {t.sellRatioHelp}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Rule 2 Thresholds */}
          <div className="space-y-4 pt-4 border-t border-[#2B2F36]">
            <h3 className="text-xs font-mono uppercase text-[#F0B90B] font-bold tracking-wider">
              {t.section3Title}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#EAECEF] mb-1">
                  {t.minBuyWallSize} ({formState.baseAsset || 'BTC'})
                </label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={formState.minBuyWallBtc}
                  onChange={e => setFormState({ ...formState, minBuyWallBtc: Number(e.target.value) })}
                  className="w-full bg-[#121418] border border-[#2B2F36] rounded px-3 py-2 text-xs font-mono text-[#EAECEF] focus:outline-none focus:border-[#F0B90B]"
                />
                <span className="text-[10px] text-[#848E9C] font-mono block mt-1">
                  {t.minBuyWallHelp}
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#EAECEF] mb-1">
                  {t.wallChewThreshold}
                </label>
                <input
                  type="number"
                  min="20"
                  max="99"
                  value={formState.wallChewThresholdPercent}
                  onChange={e => setFormState({ ...formState, wallChewThresholdPercent: Number(e.target.value) })}
                  className="w-full bg-[#121418] border border-[#2B2F36] rounded px-3 py-2 text-xs font-mono text-[#EAECEF] focus:outline-none focus:border-[#F0B90B]"
                />
                <span className="text-[10px] text-[#848E9C] font-mono block mt-1">
                  {t.wallChewHelp}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Rule 3 Thresholds */}
          <div className="space-y-4 pt-4 border-t border-[#2B2F36]">
            <h3 className="text-xs font-mono uppercase text-orange-400 font-bold tracking-wider">
              {t.section4Title}
            </h3>

            <div>
              <label className="block text-xs font-mono text-[#EAECEF] mb-1">
                {t.longLiqSpike}
              </label>
              <input
                type="number"
                step="50000"
                min="50000"
                max="10000000"
                value={formState.longLiquidationSpikeUsd}
                onChange={e => setFormState({ ...formState, longLiquidationSpikeUsd: Number(e.target.value) })}
                className="w-full bg-[#121418] border border-[#2B2F36] rounded px-3 py-2 text-xs font-mono text-[#EAECEF] focus:outline-none focus:border-[#F0B90B]"
              />
              <span className="text-[10px] text-[#848E9C] font-mono block mt-1">
                {t.longLiqHelp}
              </span>
            </div>
          </div>

          {/* Section 5: Webhook & Telegram Integration (PREMIUM ONLY) */}
          <div className="space-y-4 pt-4 border-t border-[#2B2F36]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase text-[#0ECB81] font-bold tracking-wider flex items-center gap-1.5">
                <Send className="w-4 h-4 text-[#0088cc]" />
                <span>{t.section5Title}</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-[#0088cc]/20 text-[#0088cc] border border-[#0088cc]/40 px-2 py-0.5 rounded font-mono font-bold">
                  @{OFFICIAL_TELEGRAM_BOT_USERNAME}
                </span>
                <span className="text-[10px] bg-[#F0B90B]/20 text-[#F0B90B] border border-[#F0B90B]/40 px-1.5 py-0.5 rounded font-mono font-bold">
                  PRO ONLY
                </span>
              </div>
            </div>

            {!isPremium ? (
              /* GATED FOR NON-PREMIUM USERS */
              <div className="bg-[#121418] border border-[#F0B90B]/40 rounded-xl p-5 font-mono space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#F0B90B]/15 border border-[#F0B90B]/40 flex items-center justify-center text-[#F0B90B] shrink-0">
                    <Zap className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <div className="font-bold text-[#EAECEF] text-xs flex items-center gap-2">
                      <span>{t.telegramWebhookProTitle}</span>
                      <span className="text-[10px] bg-[#F0B90B] text-black px-1.5 py-0.2 rounded font-extrabold">
                        $29
                      </span>
                    </div>
                    <p className="text-[11px] text-[#848E9C] mt-1 leading-relaxed">
                      {t.telegramWebhookProDesc}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={openSubscriptionModal}
                    className="w-full py-2.5 rounded-lg bg-[#F0B90B] hover:bg-[#fcd535] text-slate-950 font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-[#F0B90B]/10"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>{t.unlockTelegramWebhookBtn}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* UNIFIED NON-DUPLICATED SECTION FOR PREMIUM USERS */
              <div className="space-y-4">
                {/* Unified Telegram Link Component */}
                <TelegramLinkCard compact />

                {/* Custom JSON Webhook Server Input */}
                <div className="bg-[#121418] border border-[#2B2F36] rounded-xl p-4 space-y-2 font-mono">
                  <label className="block text-xs font-mono text-[#EAECEF] flex items-center gap-1.5 font-bold">
                    <Globe className="w-4 h-4 text-[#0ECB81]" /> {t.webhookUrl} (Custom JSON Webhook Endpoint)
                  </label>
                  <input
                    type="text"
                    placeholder="https://your-server.com/api/btc-alerts"
                    value={formState.webhookUrl}
                    onChange={e => setFormState({ ...formState, webhookUrl: e.target.value })}
                    className="w-full bg-[#181A20] border border-[#2B2F36] rounded px-3 py-2 text-xs font-mono text-[#EAECEF] focus:outline-none focus:border-[#0ECB81]"
                  />
                  <div className="text-[10px] text-[#848E9C] flex items-center justify-between pt-0.5">
                    <span>
                      {t.webhookDispatchDesc}
                    </span>
                    <span className="text-[#0ECB81] font-bold">HTTP POST JSON</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 6: Audio Alarm Sound Customization */}
          <div className="space-y-4 pt-4 border-t border-[#2B2F36]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase text-[#F0B90B] font-bold tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#F0B90B]" />
                6. {t.alarmSoundTypeLabel}
              </h3>

              {/* Toggle Sound Alerts */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono select-none">
                <input
                  type="checkbox"
                  checked={formState.soundAlertsEnabled}
                  onChange={(e) => setFormState({ ...formState, soundAlertsEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#2B2F36] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#F0B90B] relative"></div>
                <span className={formState.soundAlertsEnabled ? 'text-[#F0B90B] font-bold' : 'text-[#848E9C]'}>
                  {formState.soundAlertsEnabled ? t.audioOnLabel : t.mutedUpperLabel}
                </span>
              </label>
            </div>

            <p className="text-xs text-[#848E9C] font-mono">
              {t.alarmSoundTypeHelp}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {ALARM_SOUND_OPTIONS.map((snd) => {
                const isSelected = (formState.alarmSoundType || 'siren') === snd.id;
                const soundName = isEs ? snd.nameEs : snd.nameEn;
                const soundDesc = isEs ? snd.descriptionEs : snd.descriptionEn;

                return (
                  <div
                    key={snd.id}
                    onClick={() => {
                      setFormState({ ...formState, alarmSoundType: snd.id });
                      playAlarmSound(snd.id);
                    }}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#F0B90B]/10 border-[#F0B90B] text-[#EAECEF] shadow-sm'
                        : 'bg-[#121418] border-[#2B2F36] text-[#848E9C] hover:border-slate-500 hover:text-[#EAECEF]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-base">{snd.icon}</span>
                        {isSelected && (
                          <span className="text-[10px] font-mono font-bold uppercase bg-[#F0B90B] text-slate-950 px-2 py-0.5 rounded">
                            {t.activeLabel}
                          </span>
                        )}
                      </div>
                      <div className="font-mono font-bold text-xs text-[#EAECEF] mt-1">
                        {soundName}
                      </div>
                      <div className="text-[11px] font-mono text-[#848E9C] line-clamp-2">
                        {soundDesc}
                      </div>
                    </div>

                    <div className="pt-2 mt-2 border-t border-[#2B2F36]/60 flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-[#848E9C]">
                        {snd.id}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playAlarmSound(snd.id);
                        }}
                        className="px-2 py-1 rounded bg-[#181A20] hover:bg-[#2B2F36] border border-[#2B2F36] text-[#F0B90B] hover:text-amber-300 text-[10px] font-mono flex items-center gap-1 transition"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        {t.testAlarmSoundBtn}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[#2B2F36] flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded bg-[#F0B90B] hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono transition flex items-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" /> {t.saveConfigBtn}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
