import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * CSV export of users. Admin-only; mirrors the filters from
 * /admin/users. Capped at 5000 rows — if we ever need more, switch
 * to a streamed/chunked response.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ROWS = 5000;

export async function GET(request: Request) {
  const supabase = await createClient();

  // Guard
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { data: admin } = await supabase
    .from("admins")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!admin) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const city = url.searchParams.get("city") ?? "";

  let query = supabase
    .from("profiles")
    .select(
      "id, display_name, city, favourite_sports, skill_level, is_pro, rating_avg, games_played, banned_at, banned_reason, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(MAX_ROWS);

  if (q.trim()) query = query.ilike("display_name", `%${q.trim()}%`);
  if (city) query = query.eq("city", city);

  const { data, error } = await query;
  if (error) return new NextResponse(error.message, { status: 500 });

  const headers = [
    "id",
    "display_name",
    "city",
    "favourite_sports",
    "skill_level",
    "is_pro",
    "rating_avg",
    "games_played",
    "banned_at",
    "banned_reason",
    "created_at",
  ];

  type Row = {
    id: string;
    display_name: string | null;
    city: string | null;
    favourite_sports: string[] | null;
    skill_level: string | null;
    is_pro: boolean | null;
    rating_avg: number | null;
    games_played: number | null;
    banned_at: string | null;
    banned_reason: string | null;
    created_at: string;
  };

  const lines: string[] = [headers.join(",")];
  for (const r of (data ?? []) as Row[]) {
    lines.push(
      [
        r.id,
        r.display_name ?? "",
        r.city ?? "",
        (r.favourite_sports ?? []).join("|"),
        r.skill_level ?? "",
        r.is_pro ? "true" : "false",
        r.rating_avg ?? 0,
        r.games_played ?? 0,
        r.banned_at ?? "",
        r.banned_reason ?? "",
        r.created_at,
      ]
        .map(csvEscape)
        .join(","),
    );
  }

  const filename = `iminplay-users-${new Date().toISOString().slice(0, 10)}.csv`;

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
