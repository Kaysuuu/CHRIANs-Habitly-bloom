import { Check, Flame, Trash2, Clock } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useHabits, todayKey, streakOf, consistency, type Habit } from "@/lib/habits-store";
import { useRewards } from "@/lib/rewards";
import { celebrate, playSuccessChime } from "@/lib/celebrate";
import { pushReward } from "@/components/app/level-up-modal";
import { toast } from "sonner";

const categoryColors: Record<string, { bg: string; text: string; dot: string }> = {
  health:   { bg: "bg-[oklch(0.95_0.05_160)]", text: "text-[oklch(0.4_0.15_160)]",  dot: "oklch(0.7 0.15 160)" },
  mind:     { bg: "bg-[oklch(0.95_0.05_295)]", text: "text-[oklch(0.4_0.18_295)]",  dot: "oklch(0.6 0.2 295)" },
  learning: { bg: "bg-[oklch(0.95_0.05_70)]",  text: "text-[oklch(0.45_0.15_70)]",  dot: "oklch(0.78 0.15 70)" },
  fitness:  { bg: "bg-[oklch(0.95_0.05_230)]", text: "text-[oklch(0.4_0.15_230)]",  dot: "oklch(0.68 0.15 230)" },
  creative: { bg: "bg-[oklch(0.95_0.05_350)]", text: "text-[oklch(0.45_0.15_350)]", dot: "oklch(0.7 0.18 350)" },
  social:   { bg: "bg-[oklch(0.96_0.05_40)]",  text: "text-[oklch(0.45_0.16_40)]",  dot: "oklch(0.74 0.16 40)" },
};

export function HabitCard({ habit, date }: { habit: Habit; date?: string }) {
  const { toggleLog, removeHabit } = useHabits();
  const { award, soundEnabled } = useRewards();
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const day = date ?? todayKey();
  const done = !!habit.logs[day];
  const streak = streakOf(habit);
  const consist = consistency(habit, 30);
  const cat = categoryColors[habit.category] ?? categoryColors.health;

  const handleToggle = () => {
    const willComplete = !done;
    toggleLog(habit.id, day);
    if (willComplete) {
      const rect = btnRef.current?.getBoundingClientRect();
      const origin = rect
        ? { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight }
        : undefined;
      celebrate(origin);
      if (soundEnabled) playSuccessChime();
      const xpGain = habit.difficulty === "hard" ? 25 : habit.difficulty === "medium" ? 15 : 10;
      const result = award(xpGain);
      const nextStreak = streak + 1;
      toast.success(`+${xpGain} XP · ${habit.name}`, {
        description: nextStreak > 1 ? `🔥 ${nextStreak}-day streak!` : "Nice start!",
      });
      if (result.leveledUp) pushReward({ kind: "level", level: result.newLevel });
      result.newBadges.forEach((b) => pushReward({ kind: "badge", id: b.id }));
    }
  };

  return (
    <div className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-4 shadow-soft backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-glow">
      <span
        className="absolute inset-y-3 left-0 w-1 rounded-r-full"
        style={{ background: cat.dot }}
        aria-hidden
      />
      <button
        ref={btnRef}
        onClick={handleToggle}
        aria-label={done ? "Mark incomplete" : "Mark complete"}
        className={cn(
          "ml-1 flex size-12 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 active:scale-90",
          done
            ? "border-transparent text-white shadow-glow scale-105"
            : "border-border hover:border-primary hover:scale-105"
        )}
        style={done ? { background: "var(--gradient-primary)" } : undefined}
      >
        {done && <Check className="size-5 animate-in zoom-in-50 duration-300" strokeWidth={3} />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={cn("font-semibold tracking-tight truncate", done && "line-through text-muted-foreground")}>
            {habit.name}
          </h3>
          <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize", cat.bg, cat.text)}>
            {habit.category}
          </span>
        </div>
        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 font-medium text-[oklch(0.6_0.18_30)]">
            <Flame className="size-3.5" />{streak}d
          </span>
          <span>{consist}% consistency</span>
          <span className="hidden items-center gap-1 sm:inline-flex">
            <Clock className="size-3" />{habit.reminderTime}
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => removeHabit(habit.id)}
        className="opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Delete habit"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
