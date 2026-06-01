import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Home, ListChecks, Plus, Calendar, BarChart3, Footprints, LogOut, Menu, X, Sparkles, Trophy, Volume2, VolumeX, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useRewards, xpForLevel } from "@/lib/rewards";

const nav = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/habits", label: "Habits", icon: ListChecks },
  { to: "/add", label: "Add Habit", icon: Plus },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/history", label: "History", icon: History },
  { to: "/insights", label: "Insights", icon: BarChart3 },
  { to: "/jogging", label: "Jogging", icon: Footprints },
] as const;

export function AppLayout() {
  const loc = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const rewards = useRewards();

  const isAuthRoute = loc.pathname === "/auth";

  useEffect(() => {
    if (!loading && !user && !isAuthRoute) navigate({ to: "/auth" });
  }, [user, loading, isAuthRoute, navigate]);

  useEffect(() => { setMobileOpen(false); }, [loc.pathname]);

  if (isAuthRoute) {
    return (
      <div className="min-h-screen text-foreground">
        <Outlet />
      </div>
    );
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="size-2.5 animate-ping rounded-full bg-primary" />
          Loading…
        </div>
      </div>
    );
  }

  const SidebarInner = (
    <div
      className="sidebar-scroll flex h-full w-[248px] flex-col overflow-y-auto rounded-[28px] p-4 text-sidebar-foreground shadow-glow"
      style={{ background: "var(--gradient-sidebar)" }}
    >
      <Link to="/" className="mb-8 flex items-center gap-3 px-2 pt-2">
        <div
          className="flex size-10 items-center justify-center rounded-2xl text-white font-bold shadow-glow"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Sparkles className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-base font-semibold tracking-tight">Habitly</p>
          <p className="text-[11px] text-sidebar-foreground/60">Wellness OS</p>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {nav.map(({ to, label, icon: Icon }) => {
          const active = loc.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-white/10 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                  : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl transition-all",
                  active
                    ? "bg-gradient-to-br from-[oklch(0.7_0.2_295)] to-[oklch(0.55_0.22_295)] text-white shadow-glow"
                    : "bg-white/5 text-sidebar-foreground/80 group-hover:bg-white/10"
                )}
              >
                <Icon className="size-4" />
              </span>
              {label}
              {active && (
                <span className="absolute right-3 size-1.5 rounded-full bg-[oklch(0.78_0.2_295)] shadow-[0_0_10px_oklch(0.78_0.2_295)]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 rounded-2xl bg-white/5 p-3 text-xs text-sidebar-foreground/80">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 font-medium text-white">
            <Trophy className="size-3.5 text-[oklch(0.85_0.15_85)]" /> Level {rewards.level}
          </span>
          <button
            onClick={rewards.toggleSound}
            className="rounded-lg p-1 text-sidebar-foreground/60 hover:bg-white/10 hover:text-white"
            aria-label="Toggle sound"
          >
            {rewards.soundEnabled ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
          </button>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, (rewards.xp / xpForLevel(rewards.level)) * 100)}%`,
              background: "linear-gradient(90deg, oklch(0.78 0.2 295), oklch(0.85 0.18 85))",
            }}
          />
        </div>
        <p className="mt-1.5 text-[10px] text-sidebar-foreground/60">
          {rewards.xp} / {xpForLevel(rewards.level)} XP · {rewards.totalCompletions} done
        </p>
      </div>

      <button
        onClick={() => setShowLogout(true)}
        className="mt-3 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-white/5 hover:text-white"
      >
        <span className="flex size-9 items-center justify-center rounded-xl bg-white/5">
          <LogOut className="size-4" />
        </span>
        Sign out
      </button>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Desktop floating sidebar */}
      <aside className="fixed left-4 top-4 bottom-4 z-30 hidden lg:block">
        {SidebarInner}
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 lg:hidden glass">
        <Link to="/" className="flex items-center gap-2">
          <div
            className="flex size-9 items-center justify-center rounded-xl text-white"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Sparkles className="size-4" />
          </div>
          <span className="font-semibold tracking-tight">Habitly</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="flex size-10 items-center justify-center rounded-xl bg-card shadow-soft"
        >
          <Menu className="size-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-3 top-3 bottom-3 animate-float-in">
            {SidebarInner}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-xl bg-white/10 text-white"
              aria-label="Close menu"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      <main className="px-4 py-6 lg:pl-[280px] lg:pr-8 lg:py-8">
        <div className="mx-auto max-w-6xl animate-float-in">
          <Outlet />
        </div>
      </main>

      {showLogout && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={() => !signingOut && setShowLogout(false)} />
          <div className="relative w-full max-w-sm rounded-3xl glass-strong p-7 shadow-glow animate-in zoom-in-95 duration-200">
            <div
              className="mx-auto flex size-16 items-center justify-center rounded-2xl text-white shadow-glow"
              style={{ background: "var(--gradient-primary)" }}
            >
              <LogOut className="size-7" />
            </div>
            <h3 className="mt-5 text-center text-xl font-semibold tracking-tight">Sign out?</h3>
            <p className="mt-1.5 text-center text-sm text-muted-foreground">
              Your progress is safely saved. You can come back anytime.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowLogout(false)}
                disabled={signingOut}
                className="rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-soft"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setSigningOut(true);
                  await signOut();
                  setSigningOut(false);
                  setShowLogout(false);
                  navigate({ to: "/auth" });
                }}
                disabled={signingOut}
                className="glow-btn rounded-full px-4 py-2.5 text-sm font-semibold"
              >
                {signingOut ? "Signing out…" : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
