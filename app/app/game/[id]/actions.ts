"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CITIES } from "@/lib/constants";

export type GameActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

// ── Host edit + cancel ────────────────────────────────────────────────
type UpdateGameInput = {
  title: string;
  description?: string;
  locationName: string;
  city: string;
  dateTime: string; // ISO
  durationMinutes: number;
  maxPlayers: number;
  skillLevel: "any" | "beginner" | "intermediate" | "advanced";
};

export async function updateGameAction(
  gameId: string,
  input: UpdateGameInput,
): Promise<GameActionResult> {
  if (!/^[0-9a-f-]{36}$/i.test(gameId))
    return { ok: false, error: "Invalid game ID." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  // Load the game to verify ownership + current player count, since
  // max_players can't drop below the confirmed count.
  const { data: game, error: fetchErr } = await supabase
    .from("games")
    .select("id, creator_id, status, current_players")
    .eq("id", gameId)
    .single();
  if (fetchErr || !game) return { ok: false, error: "Game not found." };
  if (game.creator_id !== user.id)
    return { ok: false, error: "Only the host can edit this game." };
  if (game.status === "completed" || game.status === "cancelled")
    return {
      ok: false,
      error:
        "This game is already " + game.status + " and can't be edited.",
    };

  // ── Validation ──
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
  if (input.maxPlayers < game.current_players)
    return {
      ok: false,
      error: `${game.current_players} players already confirmed — can't drop the cap below that.`,
    };

  const { error } = await supabase
    .from("games")
    .update({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      location_name: input.locationName.trim(),
      city: input.city,
      date_time: new Date(input.dateTime).toISOString(),
      duration_minutes: input.durationMinutes,
      max_players: input.maxPlayers,
      skill_level: input.skillLevel,
      updated_at: new Date().toISOString(),
    })
    .eq("id", gameId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/app/game/${gameId}`);
  revalidatePath(`/game/${gameId}`);
  revalidatePath(`/app`);
  revalidatePath(`/app/my-games`);
  return { ok: true, message: "Game updated." };
}

export async function cancelOwnGameAction(
  gameId: string,
): Promise<GameActionResult> {
  if (!/^[0-9a-f-]{36}$/i.test(gameId))
    return { ok: false, error: "Invalid game ID." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { data: game } = await supabase
    .from("games")
    .select("id, creator_id, status")
    .eq("id", gameId)
    .single();
  if (!game) return { ok: false, error: "Game not found." };
  if (game.creator_id !== user.id)
    return { ok: false, error: "Only the host can cancel this game." };
  if (game.status === "cancelled")
    return { ok: false, error: "Already cancelled." };

  const { error } = await supabase
    .from("games")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", gameId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/app/game/${gameId}`);
  revalidatePath(`/app`);
  revalidatePath(`/app/my-games`);
  return { ok: true, message: "Game cancelled." };
}


export async function joinGameAction(
  gameId: string,
): Promise<GameActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { error } = await supabase.from("game_participants").insert({
    game_id: gameId,
    user_id: user.id,
    status: "confirmed",
  });
  if (error) {
    // Unique violation → already joined
    if (error.code === "23505") {
      return { ok: true, message: "You're already in." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath(`/app/game/${gameId}`);
  revalidatePath(`/app`);
  return { ok: true, message: "You're in!" };
}

export async function leaveGameAction(
  gameId: string,
): Promise<GameActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { error } = await supabase
    .from("game_participants")
    .delete()
    .eq("game_id", gameId)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/app/game/${gameId}`);
  revalidatePath(`/app`);
  return { ok: true };
}
