import React, { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { UserProfile, SubscriptionTier } from "../types";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  subscriptionTier: SubscriptionTier;
  isPremium: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (
    email: string,
    pass: string,
    displayName?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  upgradeToPremium: (
    plan?: "monthly" | "semiannual" | "annual",
  ) => Promise<void>;
  downgradeToFree: () => Promise<void>;
  linkTelegramAccount: (chatId: string, username?: string) => Promise<void>;
  unlinkTelegramAccount: () => Promise<void>;
  updateTrackedSymbols: (symbols: string[]) => Promise<void>;
  updateLanguagePreference: (lang: "es" | "en") => Promise<void>;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authModalMode: "login" | "register";
  setAuthModalMode: (mode: "login" | "register") => void;
  openSubscriptionModal: () => void;
  closeSubscriptionModal: () => void;
  isSubscriptionModalOpen: boolean;
  openCheckoutModal: (plan?: "monthly" | "semiannual" | "annual") => void;
  closeCheckoutModal: () => void;
  isCheckoutModalOpen: boolean;
  checkoutModalPlan: "monthly" | "semiannual" | "annual";
  isTelegramModalOpen: boolean;
  setIsTelegramModalOpen: (open: boolean) => void;
  refreshUserProfile: (optimisticExpiresAt?: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">(
    "login",
  );
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] =
    useState<boolean>(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] =
    useState<boolean>(false);
  const [checkoutModalPlan, setCheckoutModalPlan] = useState<
    "monthly" | "semiannual" | "annual"
  >("annual");
  const [isTelegramModalOpen, setIsTelegramModalOpen] =
    useState<boolean>(false);

  // Sync auth state with real-time Firestore onSnapshot listener
  useEffect(() => {
    let profileUnsubscribe: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      // Clean up previous profile listener if any
      if (profileUnsubscribe) {
        profileUnsubscribe();
        profileUnsubscribe = null;
      }

      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);

          const resolveInitialLang = (): "es" | "en" => {
            const saved = localStorage.getItem("sentinel_language");
            if (saved === "es" || saved === "en") return saved;
            if (
              typeof navigator !== "undefined" &&
              navigator.language?.toLowerCase().startsWith("en")
            )
              return "en";
            return "es";
          };

          // Check if document exists, initialize default if missing
          const docSnap = await getDoc(userDocRef);
          if (!docSnap.exists()) {
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || "",
              displayName:
                currentUser.displayName ||
                currentUser.email?.split("@")[0] ||
                "Trader",
              subscription_tier: "free",
              created_at: new Date().toISOString(),
              language_preference: resolveInitialLang(),
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          } else {
            setUserProfile(docSnap.data() as UserProfile);
          }

          // Real-time listener: eliminates manual polling for webhook tier upgrades
          profileUnsubscribe = onSnapshot(
            userDocRef,
            (snap) => {
              if (snap.exists()) {
                const updatedData = snap.data() as UserProfile;
                setUserProfile(updatedData);
              }
            },
            (err) => {
              console.error("[Auth] Real-time profile sync error:", err);
            },
          );
        } catch (err) {
          console.warn(
            "[Auth] User profile Firestore sync fallback (using local state):",
            err,
          );
          setUserProfile({
            uid: currentUser.uid,
            email: currentUser.email || "",
            subscription_tier: "free",
            created_at: new Date().toISOString(),
            language_preference: (() => {
              try {
                const saved = localStorage.getItem("sentinel_language");
                if (saved === "en" || saved === "es") return saved;
              } catch {
                /* ignore */
              }
              return typeof navigator !== "undefined" &&
                navigator.language?.toLowerCase().startsWith("en")
                ? "en"
                : "es";
            })(),
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
      if (profileUnsubscribe) {
        profileUnsubscribe();
      }
      unsubscribeAuth();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
    setIsAuthModalOpen(false);
  };

  const register = async (
    email: string,
    pass: string,
    displayName?: string,
  ) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    const savedLang =
      (localStorage.getItem("sentinel_language") as "es" | "en") ||
      (typeof navigator !== "undefined" &&
      navigator.language?.toLowerCase().startsWith("en")
        ? "en"
        : "es");

    const newProfile: UserProfile = {
      uid: res.user.uid,
      email: res.user.email || email,
      displayName: displayName || email.split("@")[0],
      subscription_tier: "free",
      created_at: new Date().toISOString(),
      language_preference: savedLang,
    };
    try {
      await setDoc(doc(db, "users", res.user.uid), newProfile);
    } catch (e) {
      console.warn("Firestore setDoc failed, setting in memory", e);
    }
    setUserProfile(newProfile);
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const upgradeToPremium = async (
    plan: "monthly" | "semiannual" | "annual" = "monthly",
  ) => {
    // Client-side direct Firestore tier upgrades are disabled for security.
    // Open the subscription modal for verified server-side activation.
    setCheckoutModalPlan(plan);
    setIsSubscriptionModalOpen(true);
  };

  const refreshUserProfile = async (optimisticExpiresAt?: number) => {
    if (optimisticExpiresAt) {
      setUserProfile((prev) =>
        prev
          ? {
              ...prev,
              subscription_tier: "pro",
              payment_status: "active",
              subscription_expires_at: optimisticExpiresAt,
            }
          : null,
      );
    }
    if (user?.uid && user.uid !== "guest-demo-id") {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data() as UserProfile;
          if (optimisticExpiresAt && data.subscription_tier !== "pro") {
            setUserProfile({
              ...data,
              subscription_tier: "pro",
              payment_status: "active",
              subscription_expires_at: optimisticExpiresAt,
            });
          } else {
            setUserProfile(data);
          }
        }
      } catch (e) {
        console.warn("[Auth] refreshUserProfile notice:", e);
      }
    }
  };

  const downgradeToFree = async () => {
    if (user && userProfile) {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        subscription_tier: "free",
        payment_status: "inactive",
        subscription_expires_at: undefined,
      });
      setUserProfile((prev) =>
        prev
          ? {
              ...prev,
              subscription_tier: "free",
              payment_status: "inactive",
              subscription_expires_at: undefined,
            }
          : null,
      );
    } else {
      setUserProfile((prev) =>
        prev
          ? {
              ...prev,
              subscription_tier: "free",
              payment_status: "inactive",
              subscription_expires_at: undefined,
            }
          : null,
      );
    }
  };

  const linkTelegramAccount = async (chatId: string, username?: string) => {
    const cleanChatId = chatId.trim();
    const cleanUsername = username ? username.trim().replace(/^@/, "") : "";
    const now = new Date().toISOString();

    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        telegram_chat_id: cleanChatId,
        telegram_username: cleanUsername,
        telegram_linked_at: now,
        is_telegram_linked: true,
      });
    }

    setUserProfile((prev) =>
      prev
        ? {
            ...prev,
            telegram_chat_id: cleanChatId,
            telegram_username: cleanUsername,
            telegram_linked_at: now,
            is_telegram_linked: true,
          }
        : {
            uid: user?.uid || "guest-demo-id",
            email: user?.email || "trader@sentinel.node",
            subscription_tier: "free",
            created_at: now,
            telegram_chat_id: cleanChatId,
            telegram_username: cleanUsername,
            telegram_linked_at: now,
            is_telegram_linked: true,
          },
    );

    // Notify backend endpoint of telegram linking
    try {
      const idToken = user ? await user.getIdToken().catch(() => null) : null;
      await fetch("/api/telegram/link-bot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          userId: user?.uid || "guest-demo-id",
          chatId: cleanChatId,
          username: cleanUsername,
          trackedSymbols: userProfile?.tracked_symbols || [
            "BTCUSDT",
            "ETHUSDT",
            "SOLUSDT",
          ],
        }),
      });
    } catch (e) {
      console.warn("[Telegram Link] Backend notification warning:", e);
    }
  };

  const unlinkTelegramAccount = async () => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        telegram_chat_id: "",
        telegram_username: "",
        telegram_linked_at: undefined,
        is_telegram_linked: false,
      });
    }

    setUserProfile((prev) =>
      prev
        ? {
            ...prev,
            telegram_chat_id: "",
            telegram_username: "",
            telegram_linked_at: undefined,
            is_telegram_linked: false,
          }
        : null,
    );
  };

  const updateTrackedSymbols = async (symbols: string[]) => {
    const cleanSymbols = Array.from(
      new Set(
        symbols
          .map((s) =>
            String(s || "")
              .toUpperCase()
              .trim(),
          )
          .filter(Boolean)
          .map((s) => (s.endsWith("USDT") ? s : `${s}USDT`)),
      ),
    );
    try {
      localStorage.setItem(
        "sentinel_tracked_symbols",
        JSON.stringify(cleanSymbols),
      );
    } catch {
      // ignore storage quota errors
    }

    if (user && user.uid !== "guest-demo-id") {
      try {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          tracked_symbols: cleanSymbols,
        });
      } catch (err) {
        console.warn("[Firestore Update Tracked Symbols Warning]", err);
      }
    }

    setUserProfile((prev) =>
      prev
        ? {
            ...prev,
            tracked_symbols: cleanSymbols,
          }
        : {
            uid: user?.uid || "guest-demo-id",
            email: user?.email || "trader@sentinel.node",
            displayName: "Trader",
            subscription_tier: "free",
            created_at: new Date().toISOString(),
            tracked_symbols: cleanSymbols,
          },
    );

    // Synchronize directly with backend 24/7 background scanner & Binance ingestion loop
    try {
      const idToken = user ? await user.getIdToken().catch(() => null) : null;
      const authHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      };
      await Promise.all([
        fetch("/api/symbols/sync", {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            userId: user?.uid || userProfile?.uid,
            chatId: userProfile?.telegram_chat_id,
            symbols: cleanSymbols,
            tracked_symbols: cleanSymbols,
          }),
        }),
        fetch("/api/telegram/update-tracked-symbols", {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            userId: user?.uid || userProfile?.uid,
            chatId: userProfile?.telegram_chat_id,
            tracked_symbols: cleanSymbols,
          }),
        }),
      ]);
    } catch (e) {
      console.warn("[Tracked Symbols Sync Error]", e);
    }
  };

  const updateLanguagePreference = async (lang: "es" | "en") => {
    const cleanLang: "es" | "en" = lang === "en" ? "en" : "es";

    // 1. Always update local profile state immediately so UI/modals never stall or revert
    setUserProfile((prev) => {
      if (prev) {
        return { ...prev, language_preference: cleanLang };
      }
      if (!user) return null;
      return {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || user.email?.split("@")[0] || "Trader",
        subscription_tier: "free",
        created_at: new Date().toISOString(),
        language_preference: cleanLang,
      };
    });

    // 2. Targeted Firestore update (never overwrite whole profile or use set/merge) wrapped in try/catch
    if (user?.uid && user.uid !== "guest-demo-id") {
      try {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          language_preference: cleanLang,
        });
      } catch (err: any) {
        console.warn(
          "[Firestore Language Sync] Could not update language_preference in Firestore (local UI preference preserved):",
          err?.code || err?.message || err,
        );
      }
    }

    // 3. Quietly synchronize active Telegram background dispatcher if linked/authenticated
    const activeUid = user?.uid || userProfile?.uid;
    const activeChatId = userProfile?.telegram_chat_id;
    if ((activeUid && activeUid !== "guest-demo-id") || activeChatId) {
      try {
        const idToken = user ? await user.getIdToken().catch(() => null) : null;
        await fetch("/api/telegram/update-language", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
          },
          body: JSON.stringify({
            userId: activeUid,
            chatId: activeChatId,
            language: cleanLang,
            language_preference: cleanLang,
          }),
        });
      } catch (e) {
        console.warn("[Language Preference Sync Warning]", e);
      }
    }
  };

  const subscriptionTier: SubscriptionTier =
    userProfile?.subscription_tier || "free";
  const isPaidTier =
    subscriptionTier === "pro" || subscriptionTier === "premium";
  const isPaymentActive =
    userProfile?.payment_status !== "inactive" &&
    userProfile?.payment_status !== "expired";
  const expRaw = userProfile?.subscription_expires_at;
  const expMs =
    expRaw !== undefined && expRaw !== null && expRaw !== ""
      ? typeof expRaw === "number" || /^\d+$/.test(String(expRaw))
        ? Number(expRaw)
        : new Date(String(expRaw)).getTime()
      : null;
  const isNotExpired =
    expMs === null || !Number.isFinite(expMs) || expMs > Date.now();
  const isPremium = isPaidTier && isPaymentActive && isNotExpired;

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        subscriptionTier,
        isPremium,
        login,
        register,
        logout,
        upgradeToPremium,
        downgradeToFree,
        linkTelegramAccount,
        unlinkTelegramAccount,
        updateTrackedSymbols,
        updateLanguagePreference,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        isAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openSubscriptionModal: () => setIsSubscriptionModalOpen(true),
        closeSubscriptionModal: () => setIsSubscriptionModalOpen(false),
        isSubscriptionModalOpen,
        openCheckoutModal: (
          plan: "monthly" | "semiannual" | "annual" = "annual",
        ) => {
          setCheckoutModalPlan(plan);
          setIsCheckoutModalOpen(true);
        },
        closeCheckoutModal: () => setIsCheckoutModalOpen(false),
        isCheckoutModalOpen,
        checkoutModalPlan,
        isTelegramModalOpen,
        setIsTelegramModalOpen,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
