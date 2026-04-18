"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CITIES, SPORTS } from "@/lib/constants";

export type ActionResult<T = unknown> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string };

// ── Create game ─────────────────────────────────────────────────────────
type CreateGameInput = {
  sport: string;
  title: string;
  description?: string;
  locationName: string;
  city: string;
  lat?: number;
  lng?: number;
  dateTime: string; // ISO string
  durationMinutes: number;
  maxPlayers: number;
  skillLevel: "any" | "beginner" | "intermediate" | "advanced";
};

export async function createGameAction(
  input: CreateGameInput,
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  // Validation
  if (!SPORTS.find((s) => s.id === input.sport))
    return { ok: false, error: "Pick a sport." };
  if (!input.title.trim())
    return { ok: false, error: "Give your game a title." };
  if (input.title.length > 60)
    return { ok: false, error: "Title is too long (max 60 chars)." };
  if ((input.description ?? "").length > 500)
    return { ok: false, error: "Description is too long (max 500 chars)." };
  if (!input.locationName.trim())
    return { ok: false, error: "Location is required." };
  if (!(CITIES as readonly string[]).includes(input.city))
    return { ok: false, error: "Pick a valid city." };
  if (isNaN(Date.parse(input.dateTime)))
    return { ok: false, error: "Pick a valid date and time." };
  if (new Date(input.dateTime).getTime() <= Date.now())
    return { ok: false, error: "Date must be in the future." };
  if (input.durationMinutes < 15 || input.durationMinutes > 480)
    return { ok: false, error: "Duration must be 15–480 minutes." };
  if (input.maxPlayers < 2 || input.maxPlayers > 40)
    return { ok: false, error: "Max players must be 2–40." };

  // Prefer create_game_at RPC when we have coords — it builds the
  // PostGIS geography point server-side.
  let gameId: string | null = null;

  if (typeof input.lat === "number" && typeof input.lng === "number") {
    const { data, error } = await supabase.rpc("create_game_at", {
      p_title: input.title.trim(),
      p_sport: input.sport,
      p_lat: input.lat,
      p_lng: input.lng,
      p_location_name: input.locationName.trim(),
      p_city: input.city,
      p_date_time: new Date(input.dateTime).toISOString(),
      p_duration_minutes: input.durationMinutes,
      p_max_players: input.maxPlayers,
      p_skill_level: input.skillLevel,
      p_description: input.description?.trim() || null,
    });
    if (error) return { ok: false, error: error.message };
    gameId = data as string;
  } else {
    const { data, error } = await supabase
      .from("games")
      .insert({
        creator_id: user.id,
        sport: input.sport,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        location_name: input.locationName.trim(),
        city: input.city,
        date_time: new Date(input.dateTime).toISOString(),
        duration_minutes: input.durationMinutes,
        max_players: input.maxPlayers,
        skill_level: input.skillLevel,
      })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    gameId = data.id as string;
  }

  // Auto-join as creator
  await supabase.from("game_participants").insert({
    game_id: gameId,
    user_id: user.id,
    status: "confirmed",
  });

  revalidatePath("/app");
  revalidatePath("/app/my-games");
  return { ok: true, data: { id: gameId! }, message: "Game submitted — under review." };
}

// ── Update profile ──────────────────────────────────────────────────────
type UpdateProfileInput = {
  displayName: string;
  city: string | null;
  favouriteSports: string[];
  skillLevel: "any" | "beginner" | "intermediate" | "advanced";
};

export async function updateProfileAction(
  input: UpdateProfileInput,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  if (!input.displayName.trim())
    return { ok: false, error: "Display name is required." };
  if (input.displayName.length > 40)
    return { ok: false, error: "Name is too long (max 40 chars)." };
  if (input.city && !(CITIES as readonly string[]).includes(input.city))
    return { ok: false, error: "Invalid city." };

  const validSports = input.favouriteSports.filter((s) =>
    SPORTS.find((sp) => sp.id === s),
  );

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: input.displayName.trim(),
      city: input.city,
      favourite_sports: validSports,
      skill_level: input.skillLevel,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/app");
  revalidatePath(`/u/${user.id}`);
  return { ok: true, message: "Profile updated." };
}

// ── Avatar URL ──────────────────────────────────────────────────────────
// The actual upload happens on the client via the Supabase browser SDK
// (RLS enforces that users only write under their own uid folder).
// This action just persists the resulting public URL onto the profile
// and invalidates the relevant caches. Pass null to clear.
export async function setAvatarUrlAction(
  url: string | null,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  if (url !== null) {
    if (typeof url !== "string" || url.length > 500)
      return { ok: false, error: "Invalid avatar URL." };
    // Only allow URLs hosted on our Supabase project (avatars bucket).
    // Prevents storing arbitrary remote images.
    if (!/^https?:\/\/[^/]+\/storage\/v1\/object\/public\/avatars\//.test(url))
      return { ok: false, error: "Avatar URL must point to the avatars bucket." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      avatar_url: url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/app");
  revalidatePath(`/u/${user.id}`);
  return { ok: true, message: url ? "Avatar updated." : "Avatar removed." };
}

// ── Change password ─────────────────────────────────────────────────────
export async function changePasswordAction(input: {
  password: string;
  confirm: string;
}): Promise<ActionResult> {
  if (input.password.length < 8)
    return { ok: false, error: "Password must be at least 8 characters." };
  if (input.password !== input.confirm)
    return { ok: false, error: "Passwords don't match." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: input.password });
  if (error) return { ok: false, error: error.message };

  return { ok: true, message: "Password updated." };
}

// ── Delete account ──────────────────────────────────────────────────────
const DELETE_ACCOUNT_URL =
  "https://tayyqzsuccmqdnphqdwm.supabase.co/functions/v1/delete-account";

export async function deleteAccountAction(
  confirm: string,
): Promise<ActionResult> {
  if (confirm.trim().toLowerCase() !== "delete")
    return {
      ok: false,
      error: 'Type "delete" exactly to confirm.',
    };

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { ok: false, error: "You must be signed in." };

  const res = await fetch(DELETE_ACCOUNT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return {
      ok: false,
      error: (body as { error?: string }).error ?? "Failed to delete account.",
    };
  }

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
