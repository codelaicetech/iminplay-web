/** Cities the app officially supports — keep in sync with mobile constants. */
export const CITIES = [
  "Cape Town",
  "Johannesburg",
  "Pretoria",
  "Durban",
  "Port Elizabeth",
  "Bloemfontein",
  "East London",
] as const;

export type City = (typeof CITIES)[number];

/** Sports offered in the app, ordered by popularity in the SA market. */
export const SPORTS = [
  { id: "football", name: "Football", emoji: "⚽" },
  { id: "tennis", name: "Tennis", emoji: "🎾" },
  { id: "basketball", name: "Basketball", emoji: "🏀" },
  { id: "volleyball", name: "Volleyball", emoji: "🏐" },
  { id: "running", name: "Running", emoji: "🏃" },
  { id: "cricket", name: "Cricket", emoji: "🏏" },
  { id: "rugby", name: "Rugby", emoji: "🏉" },
  { id: "swimming", name: "Swimming", emoji: "🏊" },
  { id: "cycling", name: "Cycling", emoji: "🚴" },
  { id: "padel", name: "Padel", emoji: "🎾" },
] as const;

/** City slug ↔ display name helpers for /c/[city] URLs. */
export function cityToSlug(name: string): string {
  return name.toLowerCase().replaceAll(" ", "-");
}

export function slugToCity(slug: string): string | null {
  const match = CITIES.find((c) => cityToSlug(c) === slug.toLowerCase());
  return match ?? null;
}
