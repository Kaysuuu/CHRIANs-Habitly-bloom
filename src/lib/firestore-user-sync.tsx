import { useEffect, useRef } from "react";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/integrations/firebase/client";
import { useAuth } from "@/lib/auth";
import { HABIT_SEED, useHabits, type Habit, type JogRun } from "@/lib/habits-store";
import { REWARD_DEFAULT, useRewards, type Reward } from "@/lib/rewards";
import { habitsStorageKey, rewardsStorageKey } from "@/lib/storage-keys";

const COLLECTION = "habitly_users";

function serializeReward(r: Reward) {
  return JSON.stringify({
    xp: r.xp,
    level: r.level,
    totalCompletions: r.totalCompletions,
    badges: r.badges,
    soundEnabled: r.soundEnabled,
  });
}

function serializeHabits(habits: Habit[], runs: JogRun[]) {
  return JSON.stringify({ habits, runs });
}

/** Never use in-memory refs for a new Firestore doc — they can still be the previous user's data. */
function readPersistedHabitsForUid(uid: string): { habits: Habit[]; runs: JogRun[] } {
  try {
    const raw = localStorage.getItem(habitsStorageKey(uid));
    if (raw) {
      const p = JSON.parse(raw);
      return {
        habits: Array.isArray(p.habits) ? p.habits : HABIT_SEED,
        runs: Array.isArray(p.runs) ? p.runs : [],
      };
    }
  } catch {
    /* ignore */
  }
  return { habits: HABIT_SEED, runs: [] };
}

function readPersistedRewardForUid(uid: string): Reward {
  try {
    const raw = localStorage.getItem(rewardsStorageKey(uid));
    if (raw) return { ...REWARD_DEFAULT, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { ...REWARD_DEFAULT };
}

export function AppFirestoreSync() {
  const { user } = useAuth();
  const { habits, runs, replaceFromCloud } = useHabits();
  const { replaceFromCloud: replaceRewardFromCloud, ...rewardFields } = useRewards();
  const reward: Reward = {
    xp: rewardFields.xp,
    level: rewardFields.level,
    totalCompletions: rewardFields.totalCompletions,
    badges: rewardFields.badges,
    soundEnabled: rewardFields.soundEnabled,
  };

  const habitsRef = useRef(habits);
  const runsRef = useRef(runs);
  const rewardRef = useRef(reward);
  habitsRef.current = habits;
  runsRef.current = runs;
  rewardRef.current = reward;

  const lastRemoteHabits = useRef("");
  const lastRemoteReward = useRef("");

  useEffect(() => {
    const db = getFirebaseDb();
    const uid = user?.uid;
    if (!db || !uid) return;

    lastRemoteHabits.current = "";
    lastRemoteReward.current = "";

    const ref = doc(db, COLLECTION, uid);
    let unsub: (() => void) | undefined;

    void getDoc(ref).then((snap) => {
      if (!snap.exists()) {
        const initialHabits = readPersistedHabitsForUid(uid);
        const initialReward = readPersistedRewardForUid(uid);
        void setDoc(
          ref,
          { habits: initialHabits.habits, runs: initialHabits.runs, reward: initialReward },
          { merge: true }
        );
        replaceFromCloud(initialHabits.habits, initialHabits.runs);
        replaceRewardFromCloud(initialReward);
      } else {
        const d = snap.data();
        const h = d.habits as Habit[] | undefined;
        const r = d.runs as JogRun[] | undefined;
        const rew = d.reward as Reward | undefined;
        if (Array.isArray(h) && Array.isArray(r)) {
          const ser = serializeHabits(h, r);
          if (ser !== lastRemoteHabits.current) {
            lastRemoteHabits.current = ser;
            replaceFromCloud(h, r);
          }
        }
        if (rew && typeof rew === "object" && "xp" in rew) {
          const ser = serializeReward(rew as Reward);
          if (ser !== lastRemoteReward.current) {
            lastRemoteReward.current = ser;
            replaceRewardFromCloud(rew as Reward);
          }
        }
      }

      unsub = onSnapshot(ref, (s) => {
        if (!s.exists()) return;
        const d = s.data();
        const h = d.habits as Habit[] | undefined;
        const r = d.runs as JogRun[] | undefined;
        const rew = d.reward as Reward | undefined;
        if (Array.isArray(h) && Array.isArray(r)) {
          const ser = serializeHabits(h, r);
          if (ser !== lastRemoteHabits.current) {
            lastRemoteHabits.current = ser;
            replaceFromCloud(h, r);
          }
        }
        if (rew && typeof rew === "object" && "xp" in rew) {
          const ser = serializeReward(rew as Reward);
          if (ser !== lastRemoteReward.current) {
            lastRemoteReward.current = ser;
            replaceRewardFromCloud(rew as Reward);
          }
        }
      });
    });

    return () => {
      unsub?.();
    };
  }, [user?.uid, replaceFromCloud, replaceRewardFromCloud]);

  useEffect(() => {
    const db = getFirebaseDb();
    const uid = user?.uid;
    if (!db || !uid) return;

    const ref = doc(db, COLLECTION, uid);
    const t = window.setTimeout(() => {
      void setDoc(
        ref,
        {
          habits: habitsRef.current,
          runs: runsRef.current,
          reward: rewardRef.current,
        },
        { merge: true }
      );
    }, 500);

    return () => window.clearTimeout(t);
  }, [user?.uid, habits, runs, reward.xp, reward.level, reward.totalCompletions, reward.badges, reward.soundEnabled]);

  return null;
}
