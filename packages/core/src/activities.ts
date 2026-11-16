import type { Activity, Settings } from "./types";

export const DEFAULT_ACTIVITIES: Activity[] = [
  { id: "water", title: "Drink a glass of water", emoji: "💧", durationSec: 30, category: "hydrate" },
  { id: "stand", title: "Stand up and stretch tall", emoji: "🧍", durationSec: 30, category: "stretch" },
  { id: "neck", title: "Roll your neck slowly, 5 each way", emoji: "🔄", durationSec: 45, category: "stretch" },
  { id: "shoulders", title: "Shrug and roll your shoulders 10 times", emoji: "💪", durationSec: 30, category: "stretch" },
  { id: "breathe", title: "Take 5 slow, deep breaths", emoji: "🌬️", durationSec: 45, category: "breathe" },
  { id: "eyes", title: "Look at something far away for 20 seconds", emoji: "👀", durationSec: 20, category: "eyes" },
  { id: "squats", title: "Do 10 squats", emoji: "🏋️", durationSec: 60, category: "move" },
  { id: "walk", title: "Walk around for 2 minutes", emoji: "🚶", durationSec: 120, category: "move" },
  { id: "stairs", title: "Climb a flight of stairs", emoji: "🪜", durationSec: 90, category: "move" },
  { id: "pushups", title: "Do 5 push-ups (wall push-ups count!)", emoji: "🤸", durationSec: 45, category: "move" },
  { id: "desk", title: "Tidy one thing on your desk", emoji: "🧹", durationSec: 60, category: "tidy" },
  { id: "window", title: "Open a window or step outside for fresh air", emoji: "🪟", durationSec: 60, category: "breathe" },
];

export const DEFAULT_SETTINGS: Settings = {
  intervalMinutes: 30,
  activeStart: "09:00",
  activeEnd: "21:00",
  enabledActivityIds: DEFAULT_ACTIVITIES.map((a) => a.id),
  customActivities: [],
  paused: false,
};

export const INTERVAL_OPTIONS = [15, 20, 30, 45, 60, 90] as const;

export const SNOOZE_MINUTES = 10;

/** Built-in plus custom activities. */
export function allActivities(settings: Settings): Activity[] {
  return [...DEFAULT_ACTIVITIES, ...settings.customActivities];
}

export function enabledActivities(settings: Settings): Activity[] {
  const enabled = new Set(settings.enabledActivityIds);
  return allActivities(settings).filter((a) => enabled.has(a.id));
}

export function findActivity(settings: Settings, id: string | null): Activity | undefined {
  if (!id) return undefined;
  return allActivities(settings).find((a) => a.id === id);
}
