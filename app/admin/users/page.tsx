import Link from "next/link";
import { Download, ExternalLink, Search, Star, Trophy, Users as UsersIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { UserRowActions } from "./UserRowActions";

export const metadata = { title: "Users" };

const PAGE_SIZE = 30;

type SearchParams = Promise<{
  q?: string;
  city?: string;
  page?: string;
}>;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q, city, page } = await searchParams;
  const pageNum = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const offset = (pageNum - 1) * PAGE_SIZE;

  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select(
      "id, display_name, avatar_url, city, favourite_sports, skill_level, is_pro, rating_avg, games_played, created_at, banned_at, banned_reason",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (q && q.trim()) {
    // ILIKE on display_name. Could also search email via RPC with
    // service role — leaving that for later.
    query = query.ilike("display_name", `%${q.trim()}%`);
  }
  if (city) {
    query = query.eq("city", city);
  }

  const { data, count } = await query;

  type Row = {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    city: string | null;
    favourite_sports: string[];
    skill_level: string;
    is_pro: boolean;
    rating_avg: number;
    games_played: number;
    created_at: string;
    banned_at: string | null;
    banned_reason: string | null;
  };
  const users = (data ?? []) as Row[];
  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">Users</h1>
          <p className="mt-2 text-text-secondary">
            {totalCount.toLocaleString("en-ZA")} profiles · sorted by most
            recent signup.
          </p>
        </div>
        <a
          href={buildExportUrl({ q, city })}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-charcoal ring-1 ring-border hover:ring-charcoal"
        >
          <Download className="size-4" aria-hidden />
          Export CSV
        </a>
      </div>

      {/* Search + filter bar */}
      <form
        method="get"
        className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl bg-white p-2 ring-1 ring-border/60"
      >
        <div className="flex flex-1 items-center gap-2 rounded-xl px-3">
          <Search className="size-4 text-text-muted" aria-hidden />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search by display name…"
            className="w-full bg-transparent px-1 py-2 text-sm outline-none"
          />
        </div>
        <input
          type="text"
          name="city"
          defaultValue={city ?? ""}
          placeholder="City"
          className="w-32 rounded-xl bg-off-white px-3 py-2 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          className="rounded-xl bg-charcoal px-4 py-2 text-sm font-extrabold text-white hover:bg-charcoal/90"
        >
          Search
        </button>
        {(q || city) && (
          <Link
            href="/admin/users"
            className="rounded-xl px-3 py-2 text-sm font-bold text-text-secondary hover:bg-off-white"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Results */}
      {users.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-white p-14 text-center ring-1 ring-border/60">
          <UsersIcon
            className="mx-auto size-8 text-text-muted"
            aria-hidden
          />
          <div className="mt-3 text-lg font-extrabold">No users found</div>
          <p className="mt-1 text-sm text-text-secondary">
            Try widening your search.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-hidden rounded-3xl bg-white ring-1 ring-border/60">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-off-white">
                <tr>
                  <th className="px-5 py-3 font-bold text-text-muted">Player</th>
                  <th className="px-5 py-3 font-bold text-text-muted">City</th>
                  <th className="px-5 py-3 font-bold text-text-muted">Sports</th>
                  <th className="px-5 py-3 font-bold text-text-muted">Games</th>
                  <th className="px-5 py-3 font-bold text-text-muted">Rating</th>
                  <th className="px-5 py-3 font-bold text-text-muted">Joined</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-border last:border-b-0 hover:bg-off-white/60"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/20 text-xs font-extrabold text-primary">
                          {u.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={u.avatar_url}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : (
                            (u.display_name ?? "?")[0].toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-charcoal">
                            {u.display_name ?? (
                              <span className="text-text-muted">Unnamed</span>
                            )}
                            {u.is_pro && (
                              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold text-primary">
                                PRO
                              </span>
                            )}
                            {u.banned_at && (
                              <span
                                className="ml-2 rounded-full bg-error/10 px-2 py-0.5 text-[10px] font-extrabold text-error"
                                title={u.banned_reason ?? undefined}
                              >
                                BANNED
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-[11px] text-text-muted">
                            {u.id.slice(0, 8)}…
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-text-secondary">
                      {u.city ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(u.favourite_sports ?? []).slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="rounded-full bg-off-white px-2 py-0.5 text-[11px] font-bold text-charcoal"
                          >
                            {s}
                          </span>
                        ))}
                        {(u.favourite_sports ?? []).length === 0 && (
                          <span className="text-text-muted">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-bold text-charcoal">
                      <span className="inline-flex items-center gap-1">
                        <Trophy
                          className="size-3.5 text-text-muted"
                          aria-hidden
                        />
                        {u.games_played}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-charcoal">
                      {u.rating_avg > 0 ? (
                        <span className="inline-flex items-center gap-1 font-bold">
                          <Star className="size-3.5 fill-primary text-primary" />
                          {u.rating_avg.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-text-secondary">
                      {new Date(u.created_at).toLocaleDateString("en-ZA", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <UserRowActions
                          userId={u.id}
                          displayName={u.display_name ?? "this user"}
                          bannedAt={u.banned_at}
                        />
                        <Link
                          href={`/u/${u.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs font-extrabold text-primary hover:underline"
                        >
                          Profile
                          <ExternalLink className="size-3" aria-hidden />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              page={pageNum}
              totalPages={totalPages}
              q={q}
              city={city}
            />
          )}
        </>
      )}
    </div>
  );
}

function buildExportUrl({
  q,
  city,
}: {
  q?: string;
  city?: string;
}): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (city) params.set("city", city);
  const qs = params.toString();
  return `/admin/users/export${qs ? "?" + qs : ""}`;
}

function Pagination({
  page,
  totalPages,
  q,
  city,
}: {
  page: number;
  totalPages: number;
  q?: string;
  city?: string;
}) {
  function href(p: number): string {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (city) params.set("city", city);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/admin/users${qs ? "?" + qs : ""}`;
  }

  return (
    <nav className="mt-6 flex items-center justify-between text-sm">
      <div className="text-text-muted">
        Page {page} of {totalPages}
      </div>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            href={href(page - 1)}
            className="rounded-full bg-white px-4 py-2 font-bold text-charcoal ring-1 ring-border hover:ring-charcoal"
          >
            ← Previous
          </Link>
        ) : (
          <span className="rounded-full bg-off-white px-4 py-2 font-bold text-text-muted">
            ← Previous
          </span>
        )}
        {page < totalPages ? (
          <Link
            href={href(page + 1)}
            className="rounded-full bg-white px-4 py-2 font-bold text-charcoal ring-1 ring-border hover:ring-charcoal"
          >
            Next →
          </Link>
        ) : (
          <span className="rounded-full bg-off-white px-4 py-2 font-bold text-text-muted">
            Next →
          </span>
        )}
      </div>
    </nav>
  );
}
