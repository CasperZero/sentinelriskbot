import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MacroVolatilityShieldState, MacroVolatilityEvent, SystemStatusResponse } from '../types';

interface VolatilityShieldContextType {
  isVolatilityShieldActive: boolean;
  shieldData: MacroVolatilityShieldState | null;
  upcomingEvents: MacroVolatilityEvent[];
  currentEvent: MacroVolatilityEvent | null;
  minutesRemaining: number;
  loading: boolean;
  refreshShieldStatus: () => Promise<void>;
  toggleShieldSimulation: (forced?: boolean, eventName?: string) => Promise<void>;
  isSimulating: boolean;
}

const DEFAULT_SHIELD_STATE: MacroVolatilityShieldState = {
  isActive: false,
  reason: 'MARKET_CONDITIONS_STABLE',
  currentEvent: null,
  minutesRemaining: 0,
  windowMinutes: 30,
  protectionWindow: {
    preEventMinutes: 15,
    postEventMinutes: 15,
    start: '',
    end: ''
  },
  upcomingEvents: [],
  isSimulated: false,
  protectionNoticeEn:
    '🛡️ Volatility Shield Active: High-impact macroeconomic events are currently unfolding. Trading signals are paused for 30 minutes to protect your capital from market manipulation and extreme volatility.',
  protectionNoticeEs:
    '🛡️ Escudo de Volatilidad Activo: Eventos macroeconómicos de alto impacto en curso. Las señales de trading están pausadas durante 30 minutos para proteger su capital de la manipulación del mercado y volatilidad extrema.'
};

const VolatilityShieldContext = createContext<VolatilityShieldContextType | undefined>(undefined);

export const VolatilityShieldProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shieldData, setShieldData] = useState<MacroVolatilityShieldState>(DEFAULT_SHIELD_STATE);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchShieldStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/system-status');
      if (res.ok) {
        const data: SystemStatusResponse = await res.json();
        if (data && data.shield) {
          setShieldData(data.shield);
        }
      }
    } catch (err) {
      console.warn('[VolatilityShield] Error checking system status:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll system status every 15 seconds for real-time protection
  useEffect(() => {
    fetchShieldStatus();
    const interval = setInterval(fetchShieldStatus, 15000);
    return () => clearInterval(interval);
  }, [fetchShieldStatus]);

  // Toggle or force simulation mode for MVP testing
  const toggleShieldSimulation = async (forced?: boolean, eventName?: string) => {
    try {
      const targetState = forced !== undefined ? forced : !shieldData.isActive;
      const res = await fetch('/api/system-status/simulate-shield', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          active: targetState,
          eventName: eventName || 'FOMC Interest Rate Decision & Fed Press Conference',
          durationMinutes: 30
        })
      });

      if (res.ok) {
        const data: SystemStatusResponse = await res.json();
        if (data && data.shield) {
          setShieldData(data.shield);
        }
      }
    } catch (err) {
      console.error('[VolatilityShield] Failed to toggle simulation:', err);
      // Fallback local toggle in case of network issue
      setShieldData(prev => ({
        ...prev,
        isActive: forced !== undefined ? forced : !prev.isActive,
        isSimulated: true
      }));
    }
  };

  return (
    <VolatilityShieldContext.Provider
      value={{
        isVolatilityShieldActive: shieldData.isActive,
        shieldData,
        upcomingEvents: shieldData.upcomingEvents || [],
        currentEvent: shieldData.currentEvent,
        minutesRemaining: shieldData.minutesRemaining || 0,
        loading,
        refreshShieldStatus: fetchShieldStatus,
        toggleShieldSimulation,
        isSimulating: shieldData.isSimulated
      }}
    >
      {children}
    </VolatilityShieldContext.Provider>
  );
};

export const useVolatilityShield = () => {
  const context = useContext(VolatilityShieldContext);
  if (!context) {
    throw new Error('useVolatilityShield must be used within a VolatilityShieldProvider');
  }
  return context;
};
