/**
 * Fills `{name}` placeholders in a COPY template string.
 *
 * Vietnamese has no plural inflection, so templates carry a single form and
 * callers never branch on count for grammar -- e.g. `fmt(COPY.journey.nightsLogged, { count })`.
 */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = vars[key];
    return value == null ? '' : String(value);
  });
}
