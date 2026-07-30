import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useAppData } from '../data/AppDataContext';
import { useTheme } from '../theme/ThemeContext';
import { lowerBrightness, restoreBrightness } from '../sleepMode/brightness';
import { setDndEnabled } from '../sleepMode/dnd';
import { isNowWithinWindow } from '../utils/date';

/** JS Date#getDay(): 0=Sun..6=Sat. Our daysOfWeek array is Mon..Sun. */
function todayIndexMonFirst(date: Date = new Date()): number {
  const jsDay = date.getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function useSleepModeEngine() {
  const { settings, updateSettings } = useAppData();
  const { setMode } = useTheme();
  const sm = settings.sleepMode;
  const busyRef = useRef(false);

  const activate = useCallback(async () => {
    if (busyRef.current || sm.manualActive) return;
    busyRef.current = true;
    try {
      let previousBrightness: number | null = null;
      if (sm.toggles.lowerBrightness) previousBrightness = await lowerBrightness();
      if (sm.toggles.doNotDisturb) await setDndEnabled(true);
      const previousThemeMode = settings.themeMode;
      if (sm.toggles.darkMode) setMode('dark');
      updateSettings((prev) => ({
        ...prev,
        sleepMode: {
          ...prev.sleepMode,
          manualActive: true,
          activatedAt: new Date().toISOString(),
          previousBrightness,
          previousThemeMode,
        },
      }));
    } finally {
      busyRef.current = false;
    }
  }, [sm.toggles, sm.manualActive, settings.themeMode, setMode, updateSettings]);

  const deactivate = useCallback(async () => {
    if (busyRef.current || !sm.manualActive) return;
    busyRef.current = true;
    try {
      if (sm.toggles.lowerBrightness) await restoreBrightness(sm.previousBrightness);
      if (sm.toggles.doNotDisturb) await setDndEnabled(false);
      if (sm.toggles.darkMode && sm.previousThemeMode) setMode(sm.previousThemeMode);
      updateSettings((prev) => ({
        ...prev,
        sleepMode: {
          ...prev.sleepMode,
          manualActive: false,
          activatedAt: null,
          previousBrightness: null,
          previousThemeMode: null,
        },
      }));
    } finally {
      busyRef.current = false;
    }
  }, [sm.toggles, sm.manualActive, sm.previousBrightness, sm.previousThemeMode, setMode, updateSettings]);

  useEffect(() => {
    function checkAutoWindow() {
      if (!sm.autoActivated) return;
      const withinWindow = sm.daysOfWeek[todayIndexMonFirst()] && isNowWithinWindow(sm.bedtime, sm.wakeTime);
      if (withinWindow && !sm.manualActive) activate();
      else if (!withinWindow && sm.manualActive && sm.activatedAt) deactivate();
    }
    checkAutoWindow();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkAutoWindow();
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sm.autoActivated, sm.bedtime, sm.wakeTime, JSON.stringify(sm.daysOfWeek), sm.manualActive, sm.activatedAt]);

  return { isActive: sm.manualActive, activate, deactivate };
}
