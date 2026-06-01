/** Per–Firebase-user localStorage keys so accounts never share cached habits/rewards. */
export function habitsStorageKey(uid: string | null | undefined): string {
  return uid ? `habit-tracker-v1:${uid}` : "habit-tracker-v1:guest";
}

export function rewardsStorageKey(uid: string | null | undefined): string {
  return uid ? `habit-rewards-v1:${uid}` : "habit-rewards-v1:guest";
}
