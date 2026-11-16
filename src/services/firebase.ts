import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific Database ID specified in firebase-applet-config.json
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Auth with defensive recovery if a stale Service Worker cached mismatched Vite chunks
function initFirebaseAuth(): Auth {
  try {
    return getAuth(app);
  } catch (err) {
    console.warn('[Firebase Auth] Recovering from stale module cache:', err);
    if (typeof window !== 'undefined') {
      const reloadKey = 'sentinel_sw_cache_recovery_v3';
      if (!sessionStorage.getItem(reloadKey)) {
        sessionStorage.setItem(reloadKey, '1');
        Promise.all([
          'caches' in window
            ? caches.keys().then((names) => Promise.all(names.map((n) => caches.delete(n))))
            : Promise.resolve(),
          'serviceWorker' in navigator
            ? navigator.serviceWorker.getRegistrations().then((regs) => Promise.all(regs.map((r) => r.unregister())))
            : Promise.resolve(),
        ]).finally(() => {
          window.location.reload();
        });
      }
    }
    // Return a safe proxy so synchronous module evaluation does not crash while reload triggers
    return new Proxy({} as Auth, {
      get(_target, prop) {
        if (prop === 'currentUser') return null;
        if (prop === 'onAuthStateChanged') {
          return (cb: (user: null) => void) => {
            if (typeof cb === 'function') cb(null);
            return () => {};
          };
        }
        return () => Promise.resolve();
      },
    });
  }
}

export const auth: Auth = initFirebaseAuth();

// Validate connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export default app;
