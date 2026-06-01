import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHabits, type Category, type Difficulty, type Frequency } from "@/lib/habits-store";

export const Route = createFileRoute("/add")({
  head: () => ({ meta: [{ title: "Add habit — Habitly" }] }),
  component: AddHabit,
});

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  category: z.enum(["health", "mind", "learning", "fitness", "creative", "social"]),
  frequency: z.enum(["daily", "weekdays", "weekly"]),
  reminderTime: z.string().regex(/^\d{2}:\d{2}$/, "Pick a time"),
  difficulty: z.enum(["easy", "medium", "hard"]),
});
type FormVals = z.infer<typeof schema>;

const cats: Category[] = ["health", "mind", "learning", "fitness", "creative", "social"];
const freqs: { value: Frequency; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekdays", label: "Weekdays" },
  { value: "weekly", label: "Weekly" },
];
const diffs: Difficulty[] = ["easy", "medium", "hard"];

function AddHabit() {
  const { addHabit } = useHabits();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<FormVals>({
      resolver: zodResolver(schema),
      defaultValues: {
        name: "",
        category: "health",
        frequency: "daily",
        reminderTime: "08:00",
        difficulty: "easy",
      },
    });

  const cat = watch("category");
  const freq = watch("frequency");
  const diff = watch("difficulty");

  const onSubmit = (v: FormVals) => {
    addHabit(v);
    toast.success(`Created "${v.name}"`);
    navigate({ to: "/habits" });
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">New habit</h1>
        <p className="mt-1 text-muted-foreground">Define what, when, and how often.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="glass space-y-6 rounded-3xl p-6 shadow-soft">
        <div className="space-y-2">
          <Label htmlFor="name">Habit name</Label>
          <Input id="name" placeholder="e.g. Morning run" className="rounded-xl" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => (
              <Chip key={c} active={cat === c} onClick={() => setValue("category", c)}>{c}</Chip>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Frequency</Label>
          <div className="flex flex-wrap gap-2">
            {freqs.map((f) => (
              <Chip key={f.value} active={freq === f.value} onClick={() => setValue("frequency", f.value)}>{f.label}</Chip>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="reminderTime">Preferred reminder</Label>
            <Input id="reminderTime" type="time" className="rounded-xl" {...register("reminderTime")} />
            {errors.reminderTime && <p className="text-xs text-destructive">{errors.reminderTime.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Difficulty</Label>
            <div className="flex gap-2">
              {diffs.map((d) => (
                <Chip key={d} active={diff === d} onClick={() => setValue("difficulty", d)}>{d}</Chip>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" className="rounded-full" onClick={() => navigate({ to: "/habits" })}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting} className="glow-btn rounded-full px-6 font-semibold">Create habit</Button>
        </div>
      </form>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full border px-4 py-1.5 text-sm capitalize transition-all hover:-translate-y-0.5 " +
        (active
          ? "border-transparent text-white shadow-glow [background-image:var(--gradient-primary)]"
          : "border-border bg-card hover:bg-secondary")
      }
    >
      {children}
    </button>
  );
}
