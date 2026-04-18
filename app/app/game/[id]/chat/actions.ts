"use server";

import { createClient } from "@/lib/supabase/server";

export type SendResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

const MAX_LEN = 2000;

export async function sendMessageAction(
  gameId: string,
  content: string,
): Promise<SendResult> {
  const trimmed = content.trim();
  if (!trimmed) return { ok: false, error: "Message is empty." };
  if (trimmed.length > MAX_LEN)
    return { ok: false, error: `Message is too long (max ${MAX_LEN}).` };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { data, error } = await supabase
    .from("messages")
    .insert({
      game_id: gameId,
      user_id: user.id,
      content: trimmed,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data.id as string };
}
