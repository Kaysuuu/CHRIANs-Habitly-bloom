import type { Habit } from "./habits-store";
import { consistency, streakOf } from "./habits-store";

export interface CoachMessage {
  habitId: string;
  habitName: string;
  tone: "struggle" | "success" | "neutral";
  title: string;
  tips: string[];
}

export function coachFor(h: Habit, allHabits: Habit[]): CoachMessage {
  const c = consistency(h, 14);
  const s = streakOf(h);
  if (c < 40) {
    const stackable = allHabits.find((x) => x.id !== h.id && consistency(x, 14) > 70);
    return {
      habitId: h.id,
      habitName: h.name,
      tone: "struggle",
      title: `Let's lighten the load on "${h.name}"`,
      tips: [
        h.frequency === "daily"
          ? "Try shifting to weekdays only — small wins beat broken streaks."
          : "Reduce target to 3x/week for two weeks.",
        `Move reminder from ${h.reminderTime} to a calmer slot (try ±2 hours).`,
        stackable
          ? `Stack it after "${stackable.name}" — habit-stacking boosts follow-through.`
          : "Pair it with an existing routine like morning coffee.",
      ],
    };
  }
  if (c >= 80 || s >= 7) {
    return {
      habitId: h.id,
      habitName: h.name,
      tone: "success",
      title: `🎉 You're crushing "${h.name}"`,
      tips: [
        `Streak: ${s} days. Consistency: ${c}%.`,
        h.difficulty !== "hard"
          ? "Level up: increase duration or intensity by ~20%."
          : "Maintain mastery — add a stretch goal once per week.",
        "Reward yourself — progress deserves recognition.",
      ],
    };
  }
  return {
    habitId: h.id,
    habitName: h.name,
    tone: "neutral",
    title: `Steady progress on "${h.name}"`,
    tips: [
      `Consistency: ${c}%. Streak: ${s} days.`,
      "Keep your reminder consistent for two more weeks.",
      "Track friction points — note what blocks you on missed days.",
    ],
  };
}
