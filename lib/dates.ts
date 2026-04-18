/**
 * Game time rendering helpers.
 *
 * IminPlay is a South-Africa-first pickup-sport app — every game time
 * is meaningful in Cape Town's wall-clock hours, regardless of where
 * the viewer's device clock is set. A user in London looking at a
 * Saturday game in Sea Point should see "Sat 09:00" (when the game
 * actually starts on the ground), not "07:00 London".
 *
 * So we always format with `timeZone: "Africa/Johannesburg"`. Use
 * these helpers instead of `new Date(iso).toLocaleXString(...)`
 * directly for anything rendering `games.date_time`.
 */

const SAST = "Africa/Johannesburg";
const LOCALE = "en-ZA";

export function formatGameDate(
  iso: string,
  options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "short",
  },
): string {
  return new Date(iso).toLocaleDateString(LOCALE, {
    ...options,
    timeZone: SAST,
  });
}

export function formatGameTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: SAST,
  });
}

export function formatGameDateTime(iso: string): string {
  return new Date(iso).toLocaleString(LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: SAST,
  });
}
