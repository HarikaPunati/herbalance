import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { clearLocalUserData, pullUserData } from "./cloudSync";

type AuthState = {
  /** false while the session is being restored and the user's data pulled */
  ready: boolean;
  session: Session | null;
  /** true when Supabase isn't configured — the app runs on this device only, no login */
  localMode: boolean;
  syncError: string | null;
  signOut: () => Promise<void>;
  /** Permanently deletes the account and all its cloud data (or this device's data in local mode). */
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!supabase);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let syncedFor: string | null = null;

    const handle = async (s: Session | null) => {
      setSession(s);
      if (!s) {
        syncedFor = null;
        setReady(true);
        return;
      }
      if (syncedFor === s.user.id) return; // token refreshes don't need a re-pull
      syncedFor = s.user.id;
      setReady(false);
      try {
        await pullUserData(s.user.id);
        setSyncError(null);
      } catch {
        setSyncError("Couldn't load your saved data — showing what's on this device.");
      }
      setReady(true);
    };

    supabase.auth.getSession().then(({ data }) => handle(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      // Defer: Supabase recommends not awaiting other Supabase calls inside this callback
      setTimeout(() => void handle(s), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    clearLocalUserData();
    setSession(null);
  };

  const deleteAccount = async () => {
    if (supabase) {
      const { error } = await supabase.rpc("delete_my_account");
      if (error) throw new Error(error.message);
      await supabase.auth.signOut();
    }
    clearLocalUserData();
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ ready, session, localMode: !supabase, syncError, signOut, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

/** Sends signed-out visitors to /login (no-op in local mode). */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { ready, session, localMode } = useAuth();
  const location = useLocation();
  if (localMode) return <>{children}</>;
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-bg">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}
