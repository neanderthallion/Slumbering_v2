import { useEffect, useMemo } from 'react';
import { useAppData } from '../data/AppDataContext';
import { computeCompanionMessage } from '../data/selectors';
import { addDays, todayKey } from '../utils/date';

/**
 * Computes today's companion message once and caches it in settings
 * (AppSettings.lastCompanionMessage) so it (a) stays stable all day and (b)
 * can be excluded from tomorrow's pick per the "never repeat 2 days in a
 * row" rule.
 */
export function useCompanionMessage(): string {
  const { records, settings, updateSettings, isLoaded } = useAppData();
  const today = todayKey();
  const cached = settings.lastCompanionMessage;

  const message = useMemo(() => {
    if (!isLoaded) return '';
    if (cached && cached.date === today) return cached.text;
    const yesterday = addDays(today, -1);
    const excludeText = cached && cached.date === yesterday ? cached.text : undefined;
    return computeCompanionMessage(records, today, excludeText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, records, cached?.date, cached?.text, today]);

  useEffect(() => {
    if (!isLoaded || !message) return;
    if (!cached || cached.date !== today) {
      updateSettings((prev) => ({ ...prev, lastCompanionMessage: { date: today, text: message } }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, message, cached?.date, today]);

  return message;
}
