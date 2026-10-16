import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";

// Landing page for the "reset your password" email link. Supabase signs the user in
// from the link, so all that's left is choosing the new password.
export function ResetPassword() {
  const { ready, session } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setError(error.message);
    else navigate("/dashboard", { replace: true });
  }

  return (
    <div className="min-h-screen bg-brand-bg px-4 py-10 md:py-16">
      <div className="mx-auto w-full max-w-md rounded-onboard bg-white p-6 shadow-onboard md:p-8">
        <h1 className="text-center font-display text-2xl font-bold text-ink-dark">Choose a new password</h1>
        {!ready ? (
          <p className="mt-4 text-center text-sm text-ink-mid">Checking your reset link…</p>
        ) : !session ? (
          <p className="mt-4 text-center text-sm text-ink-mid">
            This reset link has expired or was already used.{" "}
            <a href="/login" className="font-semibold text-primary hover:underline">Request a new one</a>.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">New password</span>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-input border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </label>
            {error && <p className="rounded-card border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="btn-press w-full rounded-btn bg-primary py-3 font-display font-semibold text-white shadow-card hover:bg-primary-dark disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save new password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
