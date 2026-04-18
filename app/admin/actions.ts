"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AdminResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

// Shared guard — throws nothing, returns a discriminated result.
async function requireAdmin(): Promise<
  | { ok: true; supabase: Awaited<ReturnType<typeof createClient>>; userId: string }
  | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { data } = await supabase
    .from("admins")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return { ok: false, error: "Admin role required." };
  return { ok: true, supabase, userId: user.id };
}

// ── Games ──────────────────────────────────────────────────────────────
export async function approveGameAction(
  gameId: string,
): Promise<AdminResult> {
  const g = await requireAdmin();
  if (!g.ok) return g;
  const { error } = await g.supabase.rpc("admin_approve_game", {
    p_game_id: gameId,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/pending-games");
  revalidatePath(`/app/game/${gameId}`);
  return { ok: true, message: "Approved." };
}

export async function rejectGameAction(
  gameId: string,
  reason: string,
): Promise<AdminResult> {
  const trimmed = reason.trim();
  if (trimmed.length < 5)
    return { ok: false, error: "Reason must be at least 5 characters." };

  const g = await requireAdmin();
  if (!g.ok) return g;
  const { error } = await g.supabase.rpc("admin_reject_game", {
    p_game_id: gameId,
    p_reason: trimmed,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/pending-games");
  return { ok: true, message: "Rejected." };
}

// ── Reports ────────────────────────────────────────────────────────────
export async function resolveReportAction(
  reportId: string,
  reason?: string,
): Promise<AdminResult> {
  const g = await requireAdmin();
  if (!g.ok) return g;
  const { error } = await g.supabase.rpc("admin_resolve_report", {
    p_report_id: reportId,
    p_status: "resolved",
    p_reason: reason ?? null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/reports");
  return { ok: true };
}

// ── Admin grant / revoke (superadmin only) ─────────────────────────────
async function requireSuperadmin(): Promise<
  | { ok: true; supabase: Awaited<ReturnType<typeof createClient>>; userId: string }
  | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { data } = await supabase
    .from("admins")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data || data.role !== "superadmin")
    return { ok: false, error: "Superadmin role required." };
  return { ok: true, supabase, userId: user.id };
}

export async function grantAdminAction(input: {
  userId: string;
  role: "moderator" | "superadmin";
  notes?: string;
}): Promise<AdminResult> {
  if (!/^[0-9a-f-]{36}$/i.test(input.userId))
    return { ok: false, error: "Invalid user ID." };
  if (input.role !== "moderator" && input.role !== "superadmin")
    return { ok: false, error: "Invalid role." };

  const g = await requireSuperadmin();
  if (!g.ok) return g;

  // Verify the target profile exists — avoids a confusing FK error.
  const { data: profile } = await g.supabase
    .from("profiles")
    .select("id, display_name")
    .eq("id", input.userId)
    .maybeSingle();
  if (!profile)
    return { ok: false, error: "No player with that ID exists." };

  const { error } = await g.supabase.from("admins").upsert(
    {
      user_id: input.userId,
      role: input.role,
      granted_by: g.userId,
      notes: input.notes?.trim() || null,
    },
    { onConflict: "user_id" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/admins");
  return {
    ok: true,
    message: `Granted ${input.role} to ${profile.display_name ?? input.userId.slice(0, 8)}.`,
  };
}

export async function revokeAdminAction(
  targetUserId: string,
): Promise<AdminResult> {
  if (!/^[0-9a-f-]{36}$/i.test(targetUserId))
    return { ok: false, error: "Invalid user ID." };

  const g = await requireSuperadmin();
  if (!g.ok) return g;

  // Block self-revoke — use another superadmin to do it, so we never
  // accidentally leave the org without any superadmins.
  if (targetUserId === g.userId)
    return {
      ok: false,
      error: "You can't revoke your own admin access. Ask another superadmin.",
    };

  const { error } = await g.supabase
    .from("admins")
    .delete()
    .eq("user_id", targetUserId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/admins");
  return { ok: true, message: "Admin access revoked." };
}

export async function dismissReportAction(
  reportId: string,
  reason?: string,
): Promise<AdminResult> {
  const g = await requireAdmin();
  if (!g.ok) return g;
  const { error } = await g.supabase.rpc("admin_resolve_report", {
    p_report_id: reportId,
    p_status: "dismissed",
    p_reason: reason ?? null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/reports");
  return { ok: true };
}
