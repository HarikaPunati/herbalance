import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { hasProfile } from "../lib/profileStore";

type Mode = "signin" | "signup" | "reset";

const inputCls =
  "mt-1 w-full rounded-input border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30";

export function Login() {
  const { ready, session, localMode } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (localMode) return <Navigate to="/dashboard" replace />;
  if (ready && session) return <Navigate to={hasProfile() ? "/dashboard" : "/onboarding"} replace />;

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setNotice(null);
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/login` },
        });
        if (error) throw error;
        if (!data.session) {
          setNotice("Check your inbox — we sent a link to confirm your email. Then come back and sign in.");
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setNotice("If that email has an account, a password reset link is on its way.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const title = mode === "signin" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset your password";
  const cta = mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link";

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-10 md:py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-onboard bg-white p-6 shadow-onboard md:p-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/30 text-3xl">
            🪷
          </div>
          <h1 className="text-center font-display text-2xl font-bold text-ink-dark">{title}</h1>
          <p className="mt-2 text-center text-sm text-ink-mid">
            {mode === "signup"
              ? "Your plans and progress, saved to your account on every device."
              : mode === "signin"
                ? "Sign in to see your plan for today."
                : "We'll email you a link to choose a new password."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Email</span>
              <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            </label>
            {mode !== "reset" && (
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">Password</span>
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputCls}
                />
                {mode === "signup" && <span className="mt-1 block text-xs text-ink-soft">At least 8 characters.</span>}
              </label>
            )}

            {error && <p className="rounded-card border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
            {notice && <p className="rounded-card border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{notice}</p>}

            <button
              type="submit"
              disabled={busy}
              className="btn-press w-full rounded-btn bg-primary py-3 font-display font-semibold text-white shadow-card hover:bg-primary-dark disabled:opacity-60"
            >
              {busy ? "Please wait…" : cta}
            </button>
          </form>

          <div className="mt-5 space-y-2 text-center text-sm text-ink-mid">
            {mode === "signin" && (
              <>
                <p>
                  New to HerBalance?{" "}
                  <button type="button" onClick={() => switchMode("signup")} className="font-semibold text-primary hover:underline">
                    Create an account
                  </button>
                </p>
                <button type="button" onClick={() => switchMode("reset")} className="text-xs text-ink-soft hover:underline">
                  Forgot your password?
                </button>
              </>
            )}
            {mode !== "signin" && (
              <p>
                Already have an account?{" "}
                <button type="button" onClick={() => switchMode("signin")} className="font-semibold text-primary hover:underline">
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-ink-soft">
          Your data is private to your account. HerBalance offers general wellness guidance, not medical advice.
        </p>
      </div>
    </div>
  );
}
