import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * CSV export of games. Admin-only; mirrors the filters from
 * /admin/games. Capped at 5000 rows.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ROWS = 5000;

export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { data: admin } = await supabase
    .from("admins")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!admin) return new NextResponse("Forbidden", { status: 403 });

  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const approval = url.searchParams.get("approval") ?? "";
  const status = url.searchParams.get("status") ?? "";
  const city = url.searchParams.get("city") ?? "";
  const sport = url.searchParams.get("sport") ?? "";

  let query = supabase
    .from("games")
    .select(
      "id, creator_id, sport, title, city, location_name, date_time, duration_minutes, max_players, current_players, skill_level, status, approval_status, is_recurring, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(MAX_ROWS);

  if (q.trim()) query = query.ilike("title", `%${q.trim()}%`);
  if (approval) query = query.eq("approval_status", approval);
  if (status) query = query.eq("status", status);
  if (city) query = query.eq("city", city);
  if (sport) query = query.eq("sport", sport);

  const { data, error } = await query;
  if (error) return new NextResponse(error.message, { status: 500 });

  const headers = [
    "id",
    "creator_id",
    "sport",
    "title",
    "city",
    "location_name",
    "date_time",
    "duration_minutes",
    "max_players",
    "current_players",
    "skill_level",
    "status",
    "approval_status",
    "is_recurring",
    "created_at",
  ];

  type Row = {
    id: string;
    creator_id: string;
    sport: string;
    title: string;
    city: string | null;
    location_name: string | null;
    date_time: string;
    duration_minutes: number;
    max_players: number;
    current_players: number;
    skill_level: string | null;
    status: string;
    approval_status: string;
    is_recurring: boolean;
    created_at: string;
  };

  const lines: string[] = [headers.join(",")];
  for (const r of (data ?? []) as Row[]) {
    lines.push(
      [
        r.id,
        r.creator_id,
        r.sport,
        r.title,
        r.city ?? "",
        r.location_name ?? "",
        r.date_time,
        r.duration_minutes,
        r.max_players,
        r.current_players,
        r.skill_level ?? "",
        r.status,
        r.approval_status,
        r.is_recurring ? "true" : "false",
        r.created_at,
      ]
        .map(csvEscape)
        .join(","),
    );
  }

  const filename = `iminplay-games-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

function csvEscape(v: string | number | boolean | null | undefined): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}
