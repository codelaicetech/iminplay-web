/**
 * Domain types — keep in sync with iminplay-app/lib/types.ts.
 * When this diverges we'll extract a shared package; until then,
 * treat the mobile file as source of truth.
 */
export type SkillLevel = "any" | "beginner" | "intermediate" | "advanced";
export type GameStatus =
  | "open"
  | "full"
  | "in_progress"
  | "completed"
  | "cancelled";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  city: string | null;
  favourite_sports: string[];
  skill_level: SkillLevel;
  is_pro: boolean;
  rating_avg: number;
  games_played: number;
};

export type Game = {
  id: string;
  creator_id: string;
  sport: string;
  title: string;
  description: string | null;
  location_name: string | null;
  city: string | null;
  date_time: string;
  duration_minutes: number;
  max_players: number;
  current_players: number;
  skill_level: SkillLevel;
  status: GameStatus;
  approval_status: ApprovalStatus;
  is_recurring: boolean;
  created_at: string;
  creator?: Pick<Profile, "display_name" | "avatar_url" | "rating_avg"> | null;
};

export const SPORT_LABELS: Record<string, { name: string; emoji: string }> = {
  football: { name: "Football", emoji: "⚽" },
  tennis: { name: "Tennis", emoji: "🎾" },
  basketball: { name: "Basketball", emoji: "🏀" },
  volleyball: { name: "Volleyball", emoji: "🏐" },
  running: { name: "Running", emoji: "🏃" },
  cricket: { name: "Cricket", emoji: "🏏" },
  rugby: { name: "Rugby", emoji: "🏉" },
  swimming: { name: "Swimming", emoji: "🏊" },
  cycling: { name: "Cycling", emoji: "🚴" },
  padel: { name: "Padel", emoji: "🎾" },
};

export function sportLabel(id: string): { name: string; emoji: string } {
  return SPORT_LABELS[id] ?? { name: id, emoji: "🏆" };
}
