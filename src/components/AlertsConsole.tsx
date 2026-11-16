import React, { useState } from 'react';
import { Terminal, Send, Copy, Check, Trash2, Lock } from 'lucide-react';
import { RiskAlert, AlertTriggerConfig } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface AlertsConsoleProps {
  alerts: RiskAlert[];
  config: AlertTriggerConfig;
  onClearAlerts: () => void;
}

export const AlertsConsole: React.FC<AlertsConsoleProps> = ({ alerts, config, onClearAlerts }) => {
  const { t } = useLanguage();
  const { isPremium, openSubscriptionModal } = useAuth();
  const [selectedAlert, setSelectedAlert] = useState<RiskAlert | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [testWebhookStatus, setTestWebhookStatus] = useState<string | null>(null);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);

  const activeSelected = selectedAlert || (alerts.length > 0 ? alerts[0] : null);

  const filteredAlerts = alerts.filter(a => {
    if (filterLevel === 'ALL') return true;
    return a.level === filterLevel;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendTestWebhook = async () => {
    if (!isPremium) {
      openSubscriptionModal();
      return;
    }
    setIsSendingTest(true);
    setTestWebhookStatus(null);
    try {
      const url = config.webhookUrl || '/api/webhook-test';
      const testPayload = {
        app: 'BTC-FlashCrash-Sentinel',
        event: 'TEST_ALERT_TRIGGER',
        timestamp: Date.now(),
        iso_time: new Date().toISOString(),
        severity: 'CRITICAL',
        rule_triggered: 'SELL_VOLUME_ACCELERATION',
        title: 'Manual Test Trigger from Sentinel Console',
        details: {
          price: 96450.0,
          z_score: 3.42,
          sell_ratio: '84.5%'
        }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      });

      if (res.ok) {
        setTestWebhookStatus(`HTTP 200 OK - Dispatched to ${url}`);
      } else {
        setTestWebhookStatus(`Failed: HTTP ${res.status}`);
      }
    } catch (e: any) {
      setTestWebhookStatus(`Webhook Error: ${e.message}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Test Controls */}
      <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#EAECEF] font-mono flex items-center gap-2">
            <Terminal className="w-5 h-5 text-[#F0B90B]" /> {t.alertsTitle}
          </h2>
          <p className="text-xs text-[#848E9C] font-mono mt-0.5">
            {t.alertsSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSendTestWebhook}
            disabled={isSendingTest}
            className="px-3.5 py-2 rounded bg-[#F0B90B] hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono transition flex items-center gap-2 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            {isSendingTest ? t.sendingBtn : t.testWebhookBtn}
          </button>

          {alerts.length > 0 && (
            <button
              onClick={onClearAlerts}
              className="p-2 rounded bg-[#2B2F36] hover:bg-[#363C4E] text-[#848E9C] hover:text-[#EAECEF] text-xs transition"
              title={t.clearLogsBtn}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {testWebhookStatus && (
        <div className="bg-[#181A20] border border-[#2B2F36] rounded-xl p-3 text-xs font-mono text-[#0ECB81] flex items-center justify-between">
          <span>Status: {testWebhookStatus}</span>
        </div>
      )}

      {/* Main Alerts Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Alert Log Stream */}
        <div className="lg:col-span-5 bg-[#181A20] border border-[#2B2F36] rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-[#2B2F36] pb-3">
            <span className="text-xs font-mono text-[#848E9C] font-semibold uppercase">
              ALERT STREAM ({filteredAlerts.length})
            </span>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#121418] p-1 rounded border border-[#2B2F36] text-[10px] font-mono">
              {['ALL', 'FLASH_CRASH', 'CRITICAL', 'WARNING'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setFilterLevel(lvl)}
                  className={`px-2 py-0.5 rounded transition ${
                    filterLevel === lvl ? 'bg-[#2B2F36] text-[#F0B90B] font-bold' : 'text-[#848E9C] hover:text-[#EAECEF]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12 text-[#848E9C] font-mono text-xs">
                No alerts logged yet. Use the Simulator triggers or test webhook.
              </div>
            ) : (
              filteredAlerts.map(alert => (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`p-3 rounded border text-xs cursor-pointer transition ${
                    activeSelected?.id === alert.id
                      ? 'bg-[#2B2F36] border-[#F0B90B] shadow-sm'
                      : 'bg-[#121418] border-[#2B2F36] hover:border-[#363C4E]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                      alert.level === 'FLASH_CRASH'
                        ? 'bg-[#F6465D]/20 text-[#F6465D] border border-[#F6465D]/40'
                        : alert.level === 'CRITICAL'
                        ? 'bg-[#F0B90B]/20 text-[#F0B90B] border border-[#F0B90B]/40'
                        : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                    }`}>
                      {alert.level}
                    </span>
                    <span className="text-[10px] font-mono text-[#848E9C]">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <h4 className="font-bold text-[#EAECEF] text-xs font-mono">{alert.title}</h4>
                  <p className="text-[11px] text-[#848E9C] font-mono line-clamp-1 mt-0.5">{alert.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Payload Inspector */}
        <div className="lg:col-span-7 bg-[#181A20] border border-[#2B2F36] rounded-xl p-5 shadow-lg flex flex-col justify-between">
          {activeSelected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#2B2F36] pb-3">
                <div>
                  <span className="text-xs font-mono text-[#F0B90B] font-bold block">{activeSelected.rule}</span>
                  <h3 className="font-bold text-base text-[#EAECEF] font-mono">{activeSelected.title}</h3>
                </div>
                <span className="text-xs font-mono text-[#848E9C]">
                  {new Date(activeSelected.timestamp).toISOString()}
                </span>
              </div>

              {/* Telegram Markdown Format Preview */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-mono text-[#848E9C] font-semibold">TELEGRAM BOT MARKDOWN PREVIEW</span>
                  <button
                    onClick={() => handleCopy(activeSelected.telegramMarkdown, 'tg')}
                    className="text-[11px] font-mono text-[#F0B90B] hover:text-amber-300 flex items-center gap-1"
                  >
                    {copiedId === 'tg' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedId === 'tg' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-[#121418] p-3 rounded border border-[#2B2F36] text-xs font-mono text-[#EAECEF] whitespace-pre-wrap">
                  {activeSelected.telegramMarkdown}
                </pre>
              </div>

              {/* JSON Webhook Body Preview */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-mono text-[#848E9C] font-semibold">HTTP WEBHOOK JSON BODY</span>
                  <button
                    onClick={() => handleCopy(JSON.stringify(activeSelected.payloadJson, null, 2), 'json')}
                    className="text-[11px] font-mono text-[#F0B90B] hover:text-amber-300 flex items-center gap-1"
                  >
                    {copiedId === 'json' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedId === 'json' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-[#121418] p-3 rounded border border-[#2B2F36] text-xs font-mono text-[#F0B90B] overflow-x-auto max-h-[200px]">
                  {JSON.stringify(activeSelected.payloadJson, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-[#848E9C] font-mono text-xs">
              Select an alert from the stream to inspect raw Webhook and Telegram payloads.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
