import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Footprints, History, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHabits, type Habit, type JogRun } from "@/lib/habits-store";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "Activity history — Habitly" }] }),
  component: HistoryPage,
});

type Filter = "all" | "habits" | "jogs";

type HabitLogEvent = {
  kind: "habit";
  id: string;
  ts: number;
  dateLabel: string;
  habit: Habit;
};

type JogEvent = {
  kind: "jog";
  id: string;
  ts: number;
  dateLabel: string;
  run: JogRun;
};

type TimelineItem = HabitLogEvent | JogEvent;

const categoryColors: Record<string, { bg: string; text: string; dot: string }> = {
  health: { bg: "bg-[oklch(0.95_0.05_160)]", text: "text-[oklch(0.4_0.15_160)]", dot: "oklch(0.7 0.15 160)" },
  mind: { bg: "bg-[oklch(0.95_0.05_295)]", text: "text-[oklch(0.4_0.18_295)]", dot: "oklch(0.6 0.2 295)" },
  learning: { bg: "bg-[oklch(0.95_0.05_70)]", text: "text-[oklch(0.45_0.15_70)]", dot: "oklch(0.78 0.15 70)" },
  fitness: { bg: "bg-[oklch(0.95_0.05_230)]", text: "text-[oklch(0.4_0.15_230)]", dot: "oklch(0.68 0.15 230)" },
  creative: { bg: "bg-[oklch(0.95_0.05_350)]", text: "text-[oklch(0.45_0.15_350)]", dot: "oklch(0.7 0.18 350)" },
  social: { bg: "bg-[oklch(0.96_0.05_40)]", text: "text-[oklch(0.45_0.16_40)]", dot: "oklch(0.74 0.16 40)" },
};

function dayStartTs(yyyyMmDd: string): number {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function formatRunDate(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  return new Date(t).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatHabitDate(yyyyMmDd: string): string {
  const t = dayStartTs(yyyyMmDd);
  return new Date(t).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return `${h}h ${rm}m`;
  }
  return `${m}m ${s}s`;
}

function buildTimeline(habits: Habit[], runs: JogRun[]): TimelineItem[] {
  const items: TimelineItem[] = [];

  for (const h of habits) {
    for (const [day, done] of Object.entries(h.logs)) {
      if (!done) continue;
      items.push({
        kind: "habit",
        id: `habit-${h.id}-${day}`,
        ts: dayStartTs(day),
        dateLabel: formatHabitDate(day),
        habit: h,
      });
    }
  }

  for (const r of runs) {
    const t = Date.parse(r.date);
    items.push({
      kind: "jog",
      id: r.id,
      ts: Number.isNaN(t) ? 0 : t,
      dateLabel: formatRunDate(r.date),
      run: r,
    });
  }

  items.sort((a, b) => b.ts - a.ts);
  return items;
}

function HistoryPage() {
  const { habits, runs } = useHabits();
  const [filter, setFilter] = useState<Filter>("all");

  const timeline = useMemo(() => buildTimeline(habits, runs), [habits, runs]);

  const filtered = useMemo(() => {
    if (filter === "habits") return timeline.filter((e) => e.kind === "habit");
    if (filter === "jogs") return timeline.filter((e) => e.kind === "jog");
    return timeline;
  }, [timeline, filter]);

  const totalKm = useMemo(
    () => runs.reduce((a, r) => a + (Number.isFinite(r.distanceKm) ? r.distanceKm : 0), 0),
    [runs]
  );
  const habitCompletions = useMemo(
    () => habits.reduce((acc, h) => acc + Object.values(h.logs).filter(Boolean).length, 0),
    [habits]
  );

  const filters: { id: Filter; label: string; icon: typeof History }[] = [
    { id: "all", label: "All activity", icon: History },
    { id: "habits", label: "Habits", icon: ListChecks },
    { id: "jogs", label: "Jogs", icon: Footprints },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <span
            className="flex size-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-glow"
            style={{ background: "var(--gradient-primary)" }}
          >
            <History className="size-6" />
          </span>
          <div>
            <h1 className="font-[Poppins] text-4xl font-bold tracking-tight">Activity history</h1>
            <p className="mt-1 text-muted-foreground">
              Habit completions and jogging distance in one place.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="glass relative overflow-hidden rounded-3xl p-5 shadow-soft">
          <span
            className="absolute -right-8 -top-8 size-28 rounded-full opacity-25 blur-2xl"
            style={{ background: "oklch(0.68 0.15 230)" }}
            aria-hidden
          />
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total distance</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-gradient">{totalKm.toFixed(1)} km</p>
          <p className="mt-1 text-xs text-muted-foreground">{runs.length} run{runs.length === 1 ? "" : "s"} logged</p>
        </div>
        <div className="glass relative overflow-hidden rounded-3xl p-5 shadow-soft">
          <span
            className="absolute -right-8 -top-8 size-28 rounded-full opacity-25 blur-2xl"
            style={{ background: "oklch(0.6 0.2 295)" }}
            aria-hidden
          />
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Habit check-ins</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-gradient">{habitCompletions}</p>
          <p className="mt-1 text-xs text-muted-foreground">Across {habits.length} habit{habits.length === 1 ? "" : "s"}</p>
        </div>
        <div className="glass relative overflow-hidden rounded-3xl p-5 shadow-soft">
          <span
            className="absolute -right-8 -top-8 size-28 rounded-full opacity-25 blur-2xl"
            style={{ background: "oklch(0.72 0.15 160)" }}
            aria-hidden
          />
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Timeline</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-gradient">{filtered.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Events shown below</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
              filter === id
                ? "border-transparent text-white shadow-glow"
                : "border-border/60 bg-card/70 text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
            style={filter === id ? { background: "var(--gradient-primary)" } : undefined}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Recent events</h2>
        {filtered.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center text-muted-foreground shadow-soft">
            No activity yet. Log a habit or save a jog to build your history.
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map((item) =>
              item.kind === "habit" ? (
                <HabitHistoryRow key={item.id} item={item} />
              ) : (
                <JogHistoryRow key={item.id} item={item} />
              )
            )}
          </ul>
        )}
      </section>
    </div>
  );
}

function HabitHistoryRow({ item }: { item: HabitLogEvent }) {
  const h = item.habit;
  const cat = categoryColors[h.category] ?? categoryColors.health;
  return (
    <li className="group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-4 shadow-soft backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-glow">
      <span className="absolute inset-y-3 left-0 w-1 rounded-r-full" style={{ background: cat.dot }} aria-hidden />
      <span
        className={cn(
          "ml-1 flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-card text-white shadow-soft",
          "bg-gradient-to-br from-[oklch(0.7_0.2_295)] to-[oklch(0.55_0.22_295)]"
        )}
      >
        <ListChecks className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold tracking-tight">{h.name}</p>
          <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize", cat.bg, cat.text)}>
            {h.category}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">Completed · {item.dateLabel}</p>
      </div>
    </li>
  );
}

function JogHistoryRow({ item }: { item: JogEvent }) {
  const r = item.run;
  return (
    <li className="group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-4 shadow-soft backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-glow">
      <span
        className="absolute inset-y-3 left-0 w-1 rounded-r-full"
        style={{ background: "oklch(0.68 0.15 230)" }}
        aria-hidden
      />
      <span
        className="ml-1 flex size-11 shrink-0 items-center justify-center rounded-xl text-white shadow-soft"
        style={{ background: "linear-gradient(135deg, oklch(0.65 0.14 230), oklch(0.55 0.12 260))" }}
      >
        <Footprints className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold tracking-tight">Jog · {r.distanceKm.toFixed(2)} km</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {formatDuration(r.durationSec)} · {item.dateLabel}
        </p>
      </div>
      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-lg font-bold tabular-nums text-gradient">{r.distanceKm.toFixed(1)}</p>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">km</p>
      </div>
    </li>
  );
}
