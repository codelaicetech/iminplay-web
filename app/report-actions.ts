"use server";

import { createClient } from "@/lib/supabase/server";

export type ReportTarget = "user" | "game" | "message";
export type ReportReason =
  | "harassment"
  | "spam"
  | "inappropriate"
  | "no_show"
  | "fake_game"
  | "other";

export type ReportResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

const VALID_TARGETS: ReportTarget[] = ["user", "game", "message"];
const VALID_REASONS: ReportReason[] = [
  "harassment",
  "spam",
  "inappropriate",
  "no_show",
  "fake_game",
  "other",
];
const MAX_DETAILS = 500;

export async function submitReportAction(input: {
  targetType: ReportTarget;
  targetId: string;
  reason: ReportReason;
  details?: string;
}): Promise<ReportResult> {
  if (!VALID_TARGETS.includes(input.targetType))
    return { ok: false, error: "Invalid report target." };
  if (!VALID_REASONS.includes(input.reason))
    return { ok: false, error: "Pick a reason." };
  if (!/^[0-9a-f-]{36}$/i.test(input.targetId))
    return { ok: false, error: "Invalid target." };
  const details = (input.details ?? "").trim();
  if (details.length > MAX_DETAILS)
    return {
      ok: false,
      error: `Details too long (max ${MAX_DETAILS}).`,
    };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in to report." };

  // Don't let users report themselves
  if (input.targetType === "user" && input.targetId === user.id)
    return { ok: false, error: "You can't report yourself." };

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_type: input.targetType,
    target_id: input.targetId,
    reason: input.reason,
    details: details || null,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true, message: "Thanks — your report has been received." };
}
