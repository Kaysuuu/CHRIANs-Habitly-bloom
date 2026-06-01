import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Sparkles, Flame, Target, TrendingUp, Droplets, Minus, Heart, Brain, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useHabits, todayKey, streakOf, consistency } from "@/lib/habits-store";
import { HabitCard } from "@/components/app/habit-card";
import { coachFor } from "@/lib/coach";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — CHRIANs Habitly" },
      { name: "description", content: "Your wellness dashboard, streaks and quick log." },
    ],
  }),
  component: Home,
});

function Home() {
  const { habits } = useHabits();
  const { user } = useAuth();
  const today = todayKey();
  const completed = habits.filter((h) => h.logs[today]).length;
  const totalStreak = habits.reduce((a, h) => a + streakOf(h), 0);
  const avgConsist = habits.length
    ? Math.round(habits.reduce((a, h) => a + consistency(h, 30), 0) / habits.length)
    : 0;
  const completionPct = habits.length ? Math.round((completed / habits.length) * 100) : 0;

  // Hydration tracker (local, lightweight)
  const HYD_KEY = `hydration-${today}`;
  const [hyd, setHyd] = useState(0);
  useEffect(() => {
    const v = parseInt(localStorage.getItem(HYD_KEY) || "0", 10);
    setHyd(isNaN(v) ? 0 : v);
  }, [HYD_KEY]);
  const updateHyd = (n: number) => {
    const v = Math.max(0, Math.min(12, hyd + n));
    setHyd(v);
    localStorage.setItem(HYD_KEY, String(v));
  };
  const hydPct = Math.round((hyd / 8) * 100);

  const coachPick = habits.length
    ? coachFor([...habits].sort((a, b) => consistency(a, 14) - consistency(b, 14))[0], habits)
    : null;

  const firstName =
    user?.displayName?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "friend";

  // Mini calendar - this week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + i);
    return d;
  });

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="mt-1 text-4xl font-bold tracking-tight">
            Hello, <span className="text-gradient">{firstName}</span> ✨
          </h1>
          <p className="mt-1 text-muted-foreground">Here's your wellness overview for today.</p>
        </div>
        <Button asChild className="glow-btn rounded-full px-5 py-2.5 text-sm font-semibold">
          <Link to="/add"><Plus className="mr-1 size-4" />New habit</Link>
        </Button>
      </section>

      {/* Progress cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ProgressCard
          icon={<Target className="size-5" />}
          label="Today's Progress"
          value={`${completed}/${habits.length || 0}`}
          hint={`${completionPct}% complete`}
          ring={completionPct}
          color="oklch(0.6 0.2 295)"
          tone="purple"
        />
        <ProgressCard
          icon={<Flame className="size-5" />}
          label="Total Streak"
          value={`${totalStreak}`}
          hint="days combined"
          ring={Math.min(100, totalStreak * 5)}
          color="oklch(0.74 0.16 40)"
          tone="orange"
        />
        <ProgressCard
          icon={<TrendingUp className="size-5" />}
          label="Consistency"
          value={`${avgConsist}%`}
          hint="last 30 days"
          ring={avgConsist}
          color="oklch(0.7 0.15 160)"
          tone="green"
        />
        <ProgressCard
          icon={<Droplets className="size-5" />}
          label="Hydration"
          value={`${hyd}/8`}
          hint="glasses today"
          ring={hydPct}
          color="oklch(0.68 0.15 230)"
          tone="blue"
          action={
            <div className="mt-2 flex items-center gap-2">
              <button onClick={() => updateHyd(-1)} className="flex size-7 items-center justify-center rounded-full bg-secondary hover:bg-secondary/70">
                <Minus className="size-3" />
              </button>
              <button onClick={() => updateHyd(1)} className="flex size-7 items-center justify-center rounded-full bg-[oklch(0.68_0.15_230)] text-white hover:brightness-110">
                <Plus className="size-3" />
              </button>
            </div>
          }
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's habits */}
        <section className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Today's habits</h2>
            <Link to="/habits" className="text-sm text-primary hover:underline">View all →</Link>
          </div>
          {habits.length === 0 ? (
            <div className="glass rounded-3xl p-10 text-center text-muted-foreground shadow-soft">
              No habits yet. <Link to="/add" className="text-primary underline">Create your first one</Link>.
            </div>
          ) : (
            <div className="grid gap-3">
              {habits.map((h) => <HabitCard key={h.id} habit={h} />)}
            </div>
          )}
        </section>

        {/* Side column */}
        <aside className="space-y-4">
          {/* Mini calendar */}
          <div className="glass rounded-3xl p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">This week</p>
              <Link to="/calendar" className="text-xs text-primary hover:underline">Open →</Link>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1.5">
              {weekDays.map((d) => {
                const k = todayKey(d);
                const total = habits.length;
                const done = habits.filter((h) => h.logs[k]).length;
                const ratio = total ? done / total : 0;
                const isToday = k === today;
                return (
                  <div key={k} className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {["S","M","T","W","T","F","S"][d.getDay()]}
                    </span>
                    <div
                      className={`flex size-9 items-center justify-center rounded-2xl text-xs font-semibold transition-all ${
                        isToday
                          ? "bg-gradient-to-br from-[oklch(0.7_0.2_295)] to-[oklch(0.5_0.22_295)] text-white shadow-glow"
                          : ratio === 1
                          ? "bg-[oklch(0.7_0.15_160)]/20 text-[oklch(0.4_0.15_160)]"
                          : ratio > 0
                          ? "bg-[oklch(0.78_0.15_70)]/20 text-[oklch(0.45_0.15_70)]"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {d.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wellness pillars */}
          <div className="glass rounded-3xl p-5 shadow-soft">
            <p className="text-sm font-semibold">Wellness pillars</p>
            <div className="mt-3 space-y-2.5">
              <Pillar icon={<Heart className="size-4" />} label="Body" color="oklch(0.7 0.18 350)" pct={Math.min(100, completionPct)} />
              <Pillar icon={<Brain className="size-4" />} label="Mind" color="oklch(0.6 0.2 295)" pct={Math.min(100, avgConsist)} />
              <Pillar icon={<Zap className="size-4" />} label="Energy" color="oklch(0.78 0.15 70)" pct={Math.min(100, hydPct)} />
            </div>
          </div>

          {/* Coach */}
          {coachPick && (
            <div
              className="rounded-3xl p-5 text-white shadow-glow"
              style={{ background: "var(--gradient-primary)" }}
            >
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider opacity-90">
                <Sparkles className="size-4" /> Adaptive Coach
              </div>
              <h3 className="mt-1.5 text-lg font-semibold leading-snug">{coachPick.title}</h3>
              <ul className="mt-3 space-y-1.5 text-sm text-white/90">
                {coachPick.tips.slice(0, 3).map((t, i) => <li key={i}>• {t}</li>)}
              </ul>
            </div>
          )}

          {/* Motivational */}
          <div className="rounded-3xl border border-border bg-card/60 p-5 shadow-soft">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Daily reminder</p>
            <p className="mt-2 text-sm leading-relaxed">
              "You don't have to be extreme, just consistent."
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ProgressCard({
  icon, label, value, hint, ring, color, tone, action,
}: {
  icon: React.ReactNode; label: string; value: string; hint: string;
  ring: number; color: string; tone: "purple"|"green"|"blue"|"orange"; action?: React.ReactNode;
}) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, ring)) / 100) * c;
  const toneBg: Record<string,string> = {
    purple: "from-[oklch(0.95_0.04_295)] to-[oklch(0.98_0.02_295)]",
    green: "from-[oklch(0.95_0.04_160)] to-[oklch(0.98_0.02_160)]",
    blue: "from-[oklch(0.95_0.04_230)] to-[oklch(0.98_0.02_230)]",
    orange: "from-[oklch(0.96_0.04_70)] to-[oklch(0.98_0.02_70)]",
  };
  return (
    <div className={`relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br ${toneBg[tone]} p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-glow`}>
      <div className="flex items-start justify-between">
        <div className="flex size-10 items-center justify-center rounded-xl bg-white/70 backdrop-blur" style={{ color }}>
          {icon}
        </div>
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} fill="none" stroke="oklch(0.92 0.01 290)" strokeWidth="6" />
          <circle
            cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={offset}
            transform="rotate(-90 32 32)"
            style={{ transition: "stroke-dashoffset .8s ease" }}
          />
        </svg>
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
      {action}
    </div>
  );
}

function Pillar({ icon, label, color, pct }: { icon: React.ReactNode; label: string; color: string; pct: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5 font-medium" style={{ color }}>{icon}{label}</span>
        <span className="text-muted-foreground">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, oklch(from ${color} l c h / 0.6))` }}
        />
      </div>
    </div>
  );
}
