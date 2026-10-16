import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  LogOut,
  ChevronRight,
  Dumbbell,
  Home,
  Menu,
  Moon,
  Pill,
  Salad,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { PHASE_META } from "../types/cycle";
import { useProfileData } from "../hooks/useProfileData";
import { hasProfile } from "../lib/profileStore";
import { useAuth } from "../lib/auth";

const nav = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/diet", label: "My Diet", icon: Salad },
  { to: "/workout", label: "My Workout", icon: Dumbbell },
  { to: "/grocery", label: "Grocery List", icon: ShoppingCart },
  { to: "/cycle", label: "My Cycle", icon: Moon },
  { to: "/supplements", label: "Supplements", icon: Pill },
  { to: "/profile", label: "Profile", icon: User },
];

const bottomNav = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/diet", label: "Diet", icon: Salad },
  { to: "/workout", label: "Workout", icon: Dumbbell },
  { to: "/grocery", label: "Grocery", icon: ShoppingCart },
  { to: "/profile", label: "Profile", icon: User },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function AppLayout() {
  const location = useLocation();
  const [drawer, setDrawer] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { userName, initials, cycleDay, phase } = useProfileData();
  const { localMode, syncError, signOut } = useAuth();
  const phaseLabel = PHASE_META[phase].label;

  const hideChrome = location.pathname.startsWith("/onboarding");

  if (hideChrome) {
    return <Outlet />;
  }

  // First visit — nothing to personalise yet, so send her through onboarding.
  if (!hasProfile()) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen bg-brand-bg font-body text-ink-dark">
      {/* Desktop sidebar */}
      <aside className={`fixed left-0 top-0 z-40 hidden h-screen w-[220px] flex-col border-r border-border bg-white/90 px-4 py-6 backdrop-blur transition-transform duration-300 md:flex ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-white">
              H
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-tight text-ink-dark">HerBalance</p>
              <p className="text-[11px] text-ink-soft">Your body, understood.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-full p-1.5 text-ink-soft hover:bg-brand-surface"
            aria-label="Close sidebar"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-8 flex items-center gap-3 rounded-card border border-border bg-brand-surface p-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 font-display text-sm font-bold text-primary-dark">
            {initials.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-dark">
              {greeting()}, {userName}
            </p>
            <p className="text-xs text-ink-mid">
              Day {cycleDay} · {phaseLabel}
            </p>
          </div>
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-white shadow-card"
                    : "text-ink-mid hover:bg-primary/5 hover:text-primary-dark"
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-card border border-accent-light/50 bg-accent-pale p-3 text-xs leading-relaxed text-accent">
          <p className="font-semibold text-[#5B21B6]">You are allowed to rest.</p>
          <p className="mt-1 text-ink-mid">Small steps still move you forward.</p>
        </div>
        <p className="mt-3 px-3 text-[11px] text-ink-soft">
          <NavLink to="/privacy" className="hover:underline">Privacy</NavLink> ·{" "}
          <NavLink to="/disclaimer" className="hover:underline">Health disclaimer</NavLink>
        </p>
        {!localMode && (
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-3 flex items-center gap-2 rounded-btn px-3 py-2 text-sm font-medium text-ink-mid hover:bg-brand-surface"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        )}
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-white/90 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-white">
            H
          </div>
          <div>
            <p className="font-display text-base font-bold">HerBalance</p>
            <p className="text-[10px] text-ink-soft">Your body, understood.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDrawer(true)}
          className="rounded-full p-2 text-ink-mid hover:bg-brand-surface"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink-dark/40"
            aria-label="Close menu"
            onClick={() => setDrawer(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-[min(88vw,280px)] flex-col bg-white p-4 shadow-card-hover animate-slide-in-right">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display font-bold text-ink-dark">Menu</p>
              <button type="button" onClick={() => setDrawer(false)} className="rounded-full p-2 hover:bg-brand-surface">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {nav.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setDrawer(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium ${
                      isActive ? "bg-primary text-white" : "text-ink-mid hover:bg-brand-surface"
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </NavLink>
              ))}
            </nav>
            {!localMode && (
              <button
                type="button"
                onClick={() => { setDrawer(false); void signOut(); }}
                className="mt-auto flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium text-ink-mid hover:bg-brand-surface"
              >
                <LogOut className="h-5 w-5" /> Sign out
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating re-open button (desktop, sidebar closed) */}
      {!sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="fixed left-0 top-1/2 z-40 hidden -translate-y-1/2 rounded-r-btn border border-l-0 border-border bg-white px-1.5 py-3 text-ink-mid shadow-card hover:bg-brand-surface md:flex"
          aria-label="Open sidebar"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      <main className={`page-enter transition-[padding] duration-300 ${sidebarOpen ? "md:pl-[220px]" : "md:pl-0"}`}>
        <div className="mx-auto max-w-content px-4 pb-28 pt-6 md:pb-10 md:pt-8">
          {syncError && (
            <p className="mb-4 rounded-card border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{syncError}</p>
          )}
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom tabs */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-white/95 px-2 pt-2 backdrop-blur md:hidden"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-content justify-between gap-1">
          {bottomNav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className="relative flex flex-1 flex-col items-center">
              {({ isActive }) => (
                <div
                  className={`flex w-full flex-col items-center gap-1 rounded-lg py-2 text-[11px] font-medium transition-colors ${
                    isActive ? "text-primary" : "text-ink-soft"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                  <span>{label}</span>
                  {isActive && (
                    <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-primary" />
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
