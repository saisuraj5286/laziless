export type ActivityCategory =
  | "hydrate"
  | "move"
  | "stretch"
  | "breathe"
  | "eyes"
  | "tidy";

export interface Activity {
  id: string;
  title: string;
  emoji: string;
  /** Rough time it takes, in seconds. */
  durationSec: number;
  category: ActivityCategory;
  /** True for activities the user added themselves. */
  custom?: boolean;
}

export interface Settings {
  /** Minutes between nudges. */
  intervalMinutes: number;
  /** "HH:MM", 24h, local time. Nudges only fire inside this window. */
  activeStart: string;
  /** "HH:MM", 24h, local time. May be earlier than start (window wraps midnight). */
  activeEnd: string;
  /** IDs of activities that can be picked. */
  enabledActivityIds: string[];
  customActivities: Activity[];
  paused: boolean;
}

export type LogStatus = "done" | "skipped";

export interface LogEntry {
  activityId: string;
  status: LogStatus;
  /** Epoch ms. */
  at: number;
}

export interface LazilessState {
  version: 1;
  settings: Settings;
  log: LogEntry[];
  /** Epoch ms of the next nudge, or null when paused. */
  nextReminderAt: number | null;
  /** The activity currently being asked of the user, if any. */
  currentActivityId: string | null;
}
