import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { rewardsStorageKey } from "@/lib/storage-keys";

export interface Reward {
  xp: number;
  level: number;
  totalCompletions: number;
  badges: string[]; // badge ids unlocked
  soundEnabled: boolean;
}

export const REWARD_DEFAULT: Reward = { xp: 0, level: 1, totalCompletions: 0, badges: [], soundEnabled: true };

const KEY_LEGACY = "habit-rewards-v1";

export const BADGES: { id: string; name: string; emoji: string; threshold: number; desc: string }[] = [
  { id: "first-step", name: "First Step", emoji: "🌱", threshold: 1, desc: "Logged your first habit" },
  { id: "rolling", name: "Rolling", emoji: "🔥", threshold: 5, desc: "5 completions" },
  { id: "committed", name: "Committed", emoji: "💪", threshold: 15, desc: "15 completions" },
  { id: "unstoppable", name: "Unstoppable", emoji: "🚀", threshold: 30, desc: "30 completions" },
  { id: "legend", name: "Legend", emoji: "👑", threshold: 75, desc: "75 completions" },
];

export function xpForLevel(level: number) {
  return 50 + (level - 1) * 25;
}

interface Ctx extends Reward {
  award: (amount: number) => { leveledUp: boolean; newBadges: typeof BADGES; newLevel: number };
  toggleSound: () => void;
  replaceFromCloud: (next: Reward) => void;
}

const RewardsCtx = createContext<Ctx | null>(null);

export function RewardsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const storageKey = rewardsStorageKey(user?.uid);

  const [state, setState] = useState<Reward>(REWARD_DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(false);
    try {
      let raw = localStorage.getItem(storageKey);
      if (!raw && user?.uid) {
        const legacy = localStorage.getItem(KEY_LEGACY);
        if (legacy) {
          localStorage.setItem(storageKey, legacy);
          localStorage.removeItem(KEY_LEGACY);
          raw = legacy;
        }
      }
      if (raw) setState({ ...REWARD_DEFAULT, ...JSON.parse(raw) });
      else setState(REWARD_DEFAULT);
    } catch {
      setState(REWARD_DEFAULT);
    }
    setHydrated(true);
  }, [storageKey, user?.uid]);

  const replaceFromCloud = useCallback((next: Reward) => {
    setState({ ...REWARD_DEFAULT, ...next });
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, hydrated, storageKey]);

  const award: Ctx["award"] = (amount) => {
    let leveledUp = false;
    let newLevel = state.level;
    const newBadges: typeof BADGES = [];
    setState((s) => {
      let xp = s.xp + amount;
      let level = s.level;
      while (xp >= xpForLevel(level)) {
        xp -= xpForLevel(level);
        level += 1;
        leveledUp = true;
      }
      newLevel = level;
      const totalCompletions = s.totalCompletions + 1;
      const badges = [...s.badges];
      for (const b of BADGES) {
        if (totalCompletions >= b.threshold && !badges.includes(b.id)) {
          badges.push(b.id);
          newBadges.push(b);
        }
      }
      return { ...s, xp, level, totalCompletions, badges };
    });
    return { leveledUp, newBadges, newLevel };
  };

  const toggleSound = () => setState((s) => ({ ...s, soundEnabled: !s.soundEnabled }));

  return (
    <RewardsCtx.Provider value={{ ...state, award, toggleSound, replaceFromCloud }}>
      {children}
    </RewardsCtx.Provider>
  );
}

export function useRewards() {
  const v = useContext(RewardsCtx);
  if (!v) throw new Error("RewardsProvider missing");
  return v;
}
