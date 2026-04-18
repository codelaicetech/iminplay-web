"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type GameActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

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
