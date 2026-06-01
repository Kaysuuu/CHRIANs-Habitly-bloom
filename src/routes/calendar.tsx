import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHabits, todayKey } from "@/lib/habits-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Calendar — Habitly" }] }),
  component: CalendarPage,
});

function CalendarPage() {
  const { habits } = useHabits();
  const [cursor, setCursor] = useState(new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const today = todayKey();

  const dayStatus = (d: Date): "complete" | "partial" | "missed" | "future" | "empty" => {
    const k = todayKey(d);
    if (k > today) return "future";
    if (habits.length === 0) return "empty";
    const total = habits.length;
    const done = habits.filter((h) => h.logs[k]).length;
    if (done === total) return "complete";
    if (done > 0) return "partial";
    return "missed";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Calendar</h1>
          <p className="mt-1 text-muted-foreground">A bird's-eye view of your consistency.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setCursor(new Date(year, month - 1, 1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-[160px] rounded-full bg-card px-4 py-1.5 text-center text-sm font-semibold shadow-soft">
            {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </span>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setCursor(new Date(year, month + 1, 1))}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="glass rounded-3xl p-6 shadow-soft">
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted-foreground">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-2">
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const k = todayKey(d);
            const status = dayStatus(d);
            const isToday = k === today;
            return (
              <div
                key={i}
                className={cn(
                  "aspect-square rounded-2xl flex flex-col items-center justify-center text-sm relative border transition-all hover:scale-[1.04]",
                  isToday ? "ring-2 ring-primary shadow-glow border-transparent" : "border-transparent",
                  status === "complete" && "bg-[oklch(0.93_0.07_160)] text-[oklch(0.35_0.15_160)]",
                  status === "partial" && "bg-[oklch(0.95_0.07_70)] text-[oklch(0.4_0.15_70)]",
                  status === "missed" && "bg-[oklch(0.96_0.04_20)] text-[oklch(0.5_0.14_25)]",
                  status === "future" && "bg-secondary/40 text-muted-foreground",
                  status === "empty" && "bg-secondary/30",
                )}
              >
                <span className="font-semibold">{d.getDate()}</span>
                {status === "complete" && <span className="text-[10px]">✓ all</span>}
                {status === "partial" && <span className="text-[10px]">partial</span>}
                {status === "missed" && k < today && (
                  <span className="text-[10px]">missed</span>
                )}
              </div>
            );
          })}
        </div>
        <Legend />
      </div>
    </div>
  );
}

function Legend() {
  const items = [
    { label: "All complete", cls: "bg-[oklch(0.85_0.12_160)]" },
    { label: "Partial", cls: "bg-[oklch(0.88_0.12_70)]" },
    { label: "Missed", cls: "bg-[oklch(0.9_0.08_25)]" },
    { label: "Today", cls: "ring-2 ring-primary bg-primary/20" },
  ];
  return (
    <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-2">
          <span className={cn("size-3 rounded", it.cls)} />
          {it.label}
        </div>
      ))}
    </div>
  );
}
