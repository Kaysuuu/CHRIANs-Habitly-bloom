import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HabitCard } from "@/components/app/habit-card";
import { useHabits } from "@/lib/habits-store";

export const Route = createFileRoute("/habits")({
  head: () => ({ meta: [{ title: "Habits — Habitly" }] }),
  component: HabitsPage,
});

function HabitsPage() {
  const { habits } = useHabits();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">All habits</h1>
          <p className="mt-1 text-muted-foreground">{habits.length} routines fueling your wellness journey.</p>
        </div>
        <Button asChild className="glow-btn rounded-full px-5 py-2.5 text-sm font-semibold">
          <Link to="/add"><Plus className="mr-1 size-4" />New habit</Link>
        </Button>
      </div>
      {habits.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center text-muted-foreground shadow-soft">No habits yet.</div>
      ) : (
        <div className="grid gap-3">{habits.map((h) => <HabitCard key={h.id} habit={h} />)}</div>
      )}
    </div>
  );
}
