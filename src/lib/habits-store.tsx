import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { habitsStorageKey } from "@/lib/storage-keys";

export type Difficulty = "easy" | "medium" | "hard";
export type Frequency = "daily" | "weekdays" | "weekly";
export type Category = "health" | "mind" | "learning" | "fitness" | "creative" | "social";

export interface Habit {
  id: string;
  name: string;
  category: Category;
  frequency: Frequency;
  reminderTime: string; // HH:MM
  difficulty: Difficulty;
  createdAt: string;
  level: number;
  logs: Record<string, boolean>; // YYYY-MM-DD -> done
}

export interface JogRun {
  id: string;
  date: string;
  distanceKm: number;
  durationSec: number;
  path: [number, number][];
}

interface State {
  habits: Habit[];
  runs: JogRun[];
  addHabit: (h: Omit<Habit, "id" | "createdAt" | "logs" | "level">) => void;
  toggleLog: (id: string, date: string) => void;
  removeHabit: (id: string) => void;
  levelUp: (id: string) => void;
  addRun: (r: Omit<JogRun, "id">) => void;
  replaceFromCloud: (nextHabits: Habit[], nextRuns: JogRun[]) => void;
}

const Ctx = createContext<State | null>(null);

/** Default starter habits for a new account (also used when creating a Firestore doc). */
export const HABIT_SEED: Habit[] = [
  {
    id: "h1",
    name: "Morning meditation",
    category: "mind",
    frequency: "daily",
    reminderTime: "07:00",
    difficulty: "easy",
    createdAt: new Date().toISOString(),
    level: 1,
    logs: {},
  },
  {
    id: "h2",
    name: "Read 20 pages",
    category: "learning",
    frequency: "daily",
    reminderTime: "21:00",
    difficulty: "medium",
    createdAt: new Date().toISOString(),
    level: 2,
    logs: {},
  },
  {
    id: "h3",
    name: "Drink 2L water",
    category: "health",
    frequency: "daily",
    reminderTime: "09:00",
    difficulty: "easy",
    createdAt: new Date().toISOString(),
    level: 1,
    logs: {},
  },
];

const KEY_LEGACY_HABITS = "habit-tracker-v1";

export function HabitsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const storageKey = habitsStorageKey(user?.uid);

  const [habits, setHabits] = useState<Habit[]>([]);
  const [runs, setRuns] = useState<JogRun[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(false);
    try {
      let raw = localStorage.getItem(storageKey);
      if (!raw && user?.uid) {
        const legacy = localStorage.getItem(KEY_LEGACY_HABITS);
        if (legacy) {
          localStorage.setItem(storageKey, legacy);
          localStorage.removeItem(KEY_LEGACY_HABITS);
          raw = legacy;
        }
      }
      if (raw) {
        const p = JSON.parse(raw);
        setHabits(p.habits ?? HABIT_SEED);
        setRuns(p.runs ?? []);
      } else {
        setHabits(HABIT_SEED);
        setRuns([]);
      }
    } catch {
      setHabits(HABIT_SEED);
      setRuns([]);
    }
    setHydrated(true);
  }, [storageKey, user?.uid]);

  const replaceFromCloud = useCallback((nextHabits: Habit[], nextRuns: JogRun[]) => {
    setHabits(nextHabits);
    setRuns(nextRuns);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(storageKey, JSON.stringify({ habits, runs }));
  }, [habits, runs, hydrated, storageKey]);

  const value: State = {
    habits,
    runs,
    addHabit: (h) =>
      setHabits((prev) => [
        ...prev,
        { ...h, id: crypto.randomUUID(), createdAt: new Date().toISOString(), logs: {}, level: 1 },
      ]),
    toggleLog: (id, date) =>
      setHabits((prev) =>
        prev.map((h) =>
          h.id === id
            ? { ...h, logs: { ...h.logs, [date]: !h.logs[date] } }
            : h
        )
      ),
    removeHabit: (id) => setHabits((prev) => prev.filter((h) => h.id !== id)),
    levelUp: (id) =>
      setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, level: h.level + 1 } : h))),
    addRun: (r) => setRuns((prev) => [{ ...r, id: crypto.randomUUID() }, ...prev]),
    replaceFromCloud,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useHabits() {
  const v = useContext(Ctx);
  if (!v) throw new Error("HabitsProvider missing");
  return v;
}

// Helpers
export function todayKey(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function streakOf(h: Habit): number {
  let s = 0;
  const d = new Date();
  while (true) {
    const k = todayKey(d);
    if (h.logs[k]) {
      s++;
      d.setDate(d.getDate() - 1);
    } else {
      // Allow today not yet done
      if (s === 0 && k === todayKey()) {
        d.setDate(d.getDate() - 1);
        continue;
      }
      break;
    }
  }
  return s;
}

export function consistency(h: Habit, days = 30): number {
  let done = 0;
  const d = new Date();
  for (let i = 0; i < days; i++) {
    if (h.logs[todayKey(d)]) done++;
    d.setDate(d.getDate() - 1);
  }
  return Math.round((done / days) * 100);
}
