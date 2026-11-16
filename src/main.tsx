import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import './index.css';

function isViteProxyWebSocketRejection(reason: unknown): boolean {
  if (!reason) return false;
  try {
    const message =
      typeof reason === 'string'
        ? reason
        : typeof (reason as { message?: unknown }).message === 'string'
          ? (reason as { message: string }).message
          : '';
    const stack =
      typeof (reason as { stack?: unknown }).stack === 'string'
        ? (reason as { stack: string }).stack
        : '';

    if (message.includes('WebSocket closed without opened')) {
      return true;
    }
    if (stack.includes('@vite/client') && /websocket/i.test(message)) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

if (typeof window !== 'undefined') {
  window.addEventListener(
    'unhandledrejection',
    (event: PromiseRejectionEvent) => {
      if (isViteProxyWebSocketRejection(event.reason)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );
}

// Manage PWA Service Worker: unregister in dev to prevent caching Vite pre-bundled chunks, register only in prod
const isProdEnv = Boolean((import.meta as { env?: { PROD?: boolean } }).env?.PROD);
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  if (isProdEnv) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => {
          console.log('[PWA] ServiceWorker registered successfully with scope:', registration.scope);
        },
        (err) => {
          console.warn('[PWA] ServiceWorker registration failed:', err);
        }
      );
    });
  } else {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().catch(() => {});
      }
    }).catch(() => {});
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
);
