"use client";

import {
  STORAGE_KEY,
  deserializeState,
  findActivity,
  lazilessReducer,
  serializeState,
  type LazilessAction,
  type LazilessState,
} from "@laziless/core";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import { playChime, showNotification } from "~/lib/notify";

const SOUND_KEY = "laziless:sound";
const BASE_TITLE = "Laziless";

type Action = LazilessAction;
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
/** Actions without `now`/`rand`; the hook fills those in. */
export type AppAction = DistributiveOmit<Exclude<Action, { type: "replace" }>, "now" | "rand">;

function reducer(state: LazilessState | null, action: Action): LazilessState | null {
  if (action.type === "replace") return action.state;
  return state ? lazilessReducer(state, action) : state;
}

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage full or blocked (private mode) — the app still works in memory.
  }
}

/**
 * Owns Laziless state for the web app: loads/saves it in localStorage, ticks
 * once a second, and fires a notification + chime when a new task is due.
 */
export function useLaziless() {
  const [state, rawDispatch] = useReducer(reducer, null);
  const [now, setNow] = useState(() => Date.now());
  const [soundOn, setSoundOn] = useState(true);

  // Load once on mount (client only, so there is no SSR hydration mismatch).
  useEffect(() => {
    const t = Date.now();
    rawDispatch({ type: "replace", state: deserializeState(readStorage(STORAGE_KEY), t) });
    setSoundOn(readStorage(SOUND_KEY) !== "off");
    setNow(t);
  }, []);

  // Persist on every change.
  useEffect(() => {
    if (state) writeStorage(STORAGE_KEY, serializeState(state));
  }, [state]);

  // Keep other open tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        rawDispatch({ type: "replace", state: deserializeState(e.newValue, Date.now()) });
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Tick. Background tabs get throttled, but the engine compares timestamps,
  // so a late tick still fires the nudge as soon as it runs.
  useEffect(() => {
    const tick = () => {
      const t = Date.now();
      setNow(t);
      rawDispatch({ type: "tick", now: t, rand: Math.random() });
    };
    const id = window.setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, []);

  // React to a newly prompted activity.
  const prevActivity = useRef<string | null | undefined>(undefined);
  const soundRef = useRef(soundOn);
  useEffect(() => {
    soundRef.current = soundOn;
  }, [soundOn]);
  useEffect(() => {
    if (!state) return;
    const id = state.currentActivityId;
    const prev = prevActivity.current;
    prevActivity.current = id;
    // Skip the very first load: a task restored from storage isn't "new".
    if (prev === undefined || !id || id === prev) return;

    const activity = findActivity(state.settings, id);
    if (!activity) return;
    if (soundRef.current) playChime();
    if (document.hidden) {
      showNotification(`${activity.emoji} Time for a tiny task`, activity.title);
    }
  }, [state]);

  // Tab title shows when a task is waiting.
  useEffect(() => {
    document.title = state?.currentActivityId ? `⏰ Tiny task! · ${BASE_TITLE}` : BASE_TITLE;
  }, [state?.currentActivityId]);

  const dispatch = useCallback((action: AppAction) => {
    rawDispatch({ ...action, now: Date.now(), rand: Math.random() } as Action);
  }, []);

  const toggleSound = useCallback(() => {
    const next = !soundOn;
    setSoundOn(next);
    writeStorage(SOUND_KEY, next ? "on" : "off");
  }, [soundOn]);

  return { state, now, dispatch, soundOn, toggleSound };
}
