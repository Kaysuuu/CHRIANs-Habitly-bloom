import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, TrendingUp } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Area, AreaChart } from "recharts";
import { useHabits, streakOf, consistency, todayKey } from "@/lib/habits-store";
import { coachFor } from "@/lib/coach";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/insights")({
  head: () => ({ meta: [{ title: "Insights — Habitly" }] }),
  component: Insights,
});

function Insights() {
  const { habits } = useHabits();

  const timeline = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const k = todayKey(d);
    const total = habits.length;
    const done = habits.filter((h) => h.logs[k]).length;
    return {
      date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      completed: done,
      rate: total ? Math.round((done / total) * 100) : 0,
    };
  });

  const weekday = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((w) => ({ day: w, done: 0, total: 0 }));
  habits.forEach((h) => {
    Object.entries(h.logs).forEach(([k, v]) => {
      const d = new Date(k);
      const idx = d.getDay();
      weekday[idx].total++;
      if (v) weekday[idx].done++;
    });
  });
  const weekdayData = weekday.map((w) => ({ day: w.day, rate: w.total ? Math.round((w.done / w.total) * 100) : 0 }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Insights</h1>
        <p className="mt-1 text-muted-foreground">Trends, patterns, and adaptive coaching.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Consistency trend" subtitle="Last 30 days completion rate" accent="oklch(0.6 0.2 295)">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.6 0.2 295)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="oklch(0.6 0.2 295)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 290)" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0.02 290)" }} />
              <Area type="monotone" dataKey="rate" stroke="oklch(0.55 0.22 295)" strokeWidth={2.5} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Streak growth" subtitle="Habits completed per day" accent="oklch(0.7 0.15 160)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.7 0.15 160)" />
                  <stop offset="100%" stopColor="oklch(0.78 0.13 160)" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 290)" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0.02 290)" }} />
              <Bar dataKey="completed" fill="url(#g2)" radius={8} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Behavioral patterns" subtitle="Completion rate by weekday" accent="oklch(0.68 0.15 230)">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weekdayData}>
            <defs>
              <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.68 0.15 230)" />
                <stop offset="100%" stopColor="oklch(0.6 0.2 295)" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 290)" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0.02 290)" }} />
            <Bar dataKey="rate" fill="url(#g3)" radius={8} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <h2 className="text-xl font-semibold">Adaptive Coach</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {habits.map((h) => {
            const c = coachFor(h, habits);
            const toneStyle =
              c.tone === "struggle" ? "border-[oklch(0.88_0.1_70)] bg-[oklch(0.97_0.04_70)]"
              : c.tone === "success" ? "border-[oklch(0.85_0.1_160)] bg-[oklch(0.97_0.04_160)]"
              : "border-border bg-card/80";
            return (
              <div key={h.id} className={cn("rounded-3xl border p-5 shadow-soft backdrop-blur-sm", toneStyle)}>
                <h3 className="font-semibold">{c.title}</h3>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {c.tips.map((t, i) => <li key={i}>• {t}</li>)}
                </ul>
              </div>
            );
          })}
          {habits.length === 0 && (
            <p className="text-sm text-muted-foreground">Add habits to see coaching.</p>
          )}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {habits.slice(0, 3).map((h) => (
          <div key={h.id} className="glass rounded-3xl p-5 shadow-soft">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><TrendingUp className="size-3" />{h.category}</div>
            <p className="mt-1 font-semibold">{h.name}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gradient">{streakOf(h)}d</p>
            <p className="text-xs text-muted-foreground">{consistency(h, 30)}% / 30d</p>
          </div>
        ))}
      </section>
    </div>
  );
}

function Card({ title, subtitle, accent, children }: { title: string; subtitle?: string; accent?: string; children: React.ReactNode }) {
  return (
    <div className="glass relative overflow-hidden rounded-3xl p-6 shadow-soft">
      {accent && (
        <span
          className="absolute -right-10 -top-10 size-32 rounded-full opacity-30 blur-2xl"
          style={{ background: accent }}
          aria-hidden
        />
      )}
      <h3 className="font-semibold">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      <div className="relative mt-4">{children}</div>
    </div>
  );
}
