import Link from "next/link";
import {
  CalendarCheck,
  Download,
  ExternalLink,
  Filter,
  MapPin,
  Users as UsersIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { sportLabel } from "@/lib/types";
import { CITIES, SPORTS } from "@/lib/constants";
import { GameRowActions } from "./GameRowActions";

export const metadata = { title: "Games" };

const PAGE_SIZE = 30;

type Approval = "" | "pending" | "approved" | "rejected";
type Status = "" | "open" | "full" | "in_progress" | "completed" | "cancelled";

type SearchParams = Promise<{
  q?: string;
  approval?: string;
  status?: string;
  city?: string;
  sport?: string;
  page?: string;
}>;

export default async function AdminGamesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q, approval, status, city, sport, page } = await searchParams;
  const pageNum = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const offset = (pageNum - 1) * PAGE_SIZE;

  const supabase = await createClient();

  let query = supabase
    .from("games")
    .select(
      "id, creator_id, sport, title, city, location_name, date_time, duration_minutes, max_players, current_players, skill_level, status, approval_status, created_at, creator:profiles!games_creator_id_fkey(display_name)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (q && q.trim()) query = query.ilike("title", `%${q.trim()}%`);
  if (approval) query = query.eq("approval_status", approval);
  if (status) query = query.eq("status", status);
  if (city) query = query.eq("city", city);
  if (sport) query = query.eq("sport", sport);

  const { data, count } = await query;

  type Raw = {
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
    skill_level: string;
    status: Status;
    approval_status: Approval;
    created_at: string;
    creator:
      | { display_name: string | null }
      | { display_name: string | null }[]
      | null;
  };
  const games = ((data ?? []) as Raw[]).map((g) => ({
    ...g,
    creator: Array.isArray(g.creator) ? (g.creator[0] ?? null) : g.creator,
  }));

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">Games</h1>
          <p className="mt-2 text-text-secondary">
            {totalCount.toLocaleString("en-ZA")} games · filter by approval,
            status, city, sport.
          </p>
        </div>
        <a
          href={buildExportUrl({ q, approval, status, city, sport })}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-charcoal ring-1 ring-border hover:ring-charcoal"
        >
          <Download className="size-4" aria-hidden />
          Export CSV
        </a>
      </div>

      {/* Filter bar */}
      <form
        method="get"
        className="mt-6 rounded-2xl bg-white p-3 ring-1 ring-border/60"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="size-4 text-text-muted" aria-hidden />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search by title…"
            className="flex-1 min-w-[200px] rounded-xl bg-off-white px-3 py-2 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-primary"
          />
          <Select name="approval" value={approval ?? ""} label="Approval">
            <option value="">Any</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </Select>
          <Select name="status" value={status ?? ""} label="Status">
            <option value="">Any</option>
            <option value="open">Open</option>
            <option value="full">Full</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          <Select name="city" value={city ?? ""} label="City">
            <option value="">Any</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select name="sport" value={sport ?? ""} label="Sport">
            <option value="">Any</option>
            {SPORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          <button
            type="submit"
            className="rounded-xl bg-charcoal px-4 py-2 text-sm font-extrabold text-white hover:bg-charcoal/90"
          >
            Apply
          </button>
          {(q || approval || status || city || sport) && (
            <Link
              href="/admin/games"
              className="rounded-xl px-3 py-2 text-sm font-bold text-text-secondary hover:bg-off-white"
            >
              Clear
            </Link>
          )}
        </div>
      </form>

      {/* Results */}
      {games.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-white p-14 text-center ring-1 ring-border/60">
          <div className="text-3xl">🗓️</div>
          <div className="mt-3 text-lg font-extrabold">No games found</div>
          <p className="mt-1 text-sm text-text-secondary">
            Try widening your filters.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-hidden rounded-3xl bg-white ring-1 ring-border/60">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-off-white">
                <tr>
                  <th className="px-5 py-3 font-bold text-text-muted">Game</th>
                  <th className="px-5 py-3 font-bold text-text-muted">Host</th>
                  <th className="px-5 py-3 font-bold text-text-muted">When</th>
                  <th className="px-5 py-3 font-bold text-text-muted">
                    Players
                  </th>
                  <th className="px-5 py-3 font-bold text-text-muted">
                    Approval
                  </th>
                  <th className="px-5 py-3 font-bold text-text-muted">
                    Status
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {games.map((g) => {
                  const sp = sportLabel(g.sport);
                  return (
                    <tr
                      key={g.id}
                      className="border-b border-border last:border-b-0 hover:bg-off-white/60"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-start gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-off-white text-lg">
                            {sp.emoji}
                          </div>
                          <div className="min-w-0">
                            <div className="line-clamp-1 font-bold text-charcoal">
                              {g.title}
                            </div>
                            <div className="mt-0.5 flex items-center gap-1 text-xs text-text-muted">
                              <MapPin className="size-3" aria-hidden />
                              {g.location_name ?? g.city ?? "TBD"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {g.creator?.display_name ? (
                          <Link
                            href={`/u/${g.creator_id}`}
                            target="_blank"
                            className="font-bold text-charcoal hover:text-primary"
                          >
                            {g.creator.display_name}
                          </Link>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-text-secondary">
                        <div className="inline-flex items-center gap-1">
                          <CalendarCheck
                            className="size-3.5 text-text-muted"
                            aria-hidden
                          />
                          {new Date(g.date_time).toLocaleDateString("en-ZA", {
                            day: "numeric",
                            month: "short",
                          })}{" "}
                          {new Date(g.date_time).toLocaleTimeString("en-ZA", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </div>
                      </td>
                      <td className="px-5 py-3 font-bold text-charcoal">
                        <span className="inline-flex items-center gap-1">
                          <UsersIcon
                            className="size-3.5 text-text-muted"
                            aria-hidden
                          />
                          {g.current_players}/{g.max_players}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <ApprovalBadge value={g.approval_status} />
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge value={g.status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <GameRowActions
                            gameId={g.id}
                            title={g.title}
                            status={g.status}
                          />
                          <Link
                            href={`/app/game/${g.id}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-xs font-extrabold text-primary hover:underline"
                          >
                            Open
                            <ExternalLink className="size-3" aria-hidden />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <Pagination
              page={pageNum}
              totalPages={totalPages}
              q={q}
              approval={approval}
              status={status}
              city={city}
              sport={sport}
            />
          )}
        </>
      )}
    </div>
  );
}

/* ── Components ──────────────────────────────────────────── */

function Select({
  name,
  value,
  label,
  children,
}: {
  name: string;
  value: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="inline-flex items-center gap-1.5 rounded-xl bg-off-white px-3 py-2 text-sm">
      <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
        {label}:
      </span>
      <select
        name={name}
        defaultValue={value}
        className="bg-transparent text-sm font-bold outline-none"
      >
        {children}
      </select>
    </label>
  );
}

function ApprovalBadge({ value }: { value: Approval }) {
  if (value === "pending")
    return (
      <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-extrabold text-warning">
        Pending
      </span>
    );
  if (value === "approved")
    return (
      <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-extrabold text-success">
        Approved
      </span>
    );
  if (value === "rejected")
    return (
      <span className="rounded-full bg-error/10 px-2 py-0.5 text-xs font-extrabold text-error">
        Rejected
      </span>
    );
  return <span className="text-text-muted">—</span>;
}

function StatusBadge({ value }: { value: Status }) {
  const map: Record<Status, { cls: string; label: string }> = {
    "": { cls: "", label: "—" },
    open: { cls: "bg-info/10 text-info", label: "Open" },
    full: { cls: "bg-primary/10 text-primary", label: "Full" },
    in_progress: { cls: "bg-primary/10 text-primary", label: "In progress" },
    completed: {
      cls: "bg-off-white text-text-muted",
      label: "Completed",
    },
    cancelled: { cls: "bg-error/10 text-error", label: "Cancelled" },
  };
  const v = map[value] ?? map[""];
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${v.cls}`}
    >
      {v.label}
    </span>
  );
}

function buildExportUrl({
  q,
  approval,
  status,
  city,
  sport,
}: {
  q?: string;
  approval?: string;
  status?: string;
  city?: string;
  sport?: string;
}): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (approval) params.set("approval", approval);
  if (status) params.set("status", status);
  if (city) params.set("city", city);
  if (sport) params.set("sport", sport);
  const qs = params.toString();
  return `/admin/games/export${qs ? "?" + qs : ""}`;
}

function Pagination({
  page,
  totalPages,
  q,
  approval,
  status,
  city,
  sport,
}: {
  page: number;
  totalPages: number;
  q?: string;
  approval?: string;
  status?: string;
  city?: string;
  sport?: string;
}) {
  function href(p: number): string {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (approval) params.set("approval", approval);
    if (status) params.set("status", status);
    if (city) params.set("city", city);
    if (sport) params.set("sport", sport);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/admin/games${qs ? "?" + qs : ""}`;
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
