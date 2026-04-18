import Link from "next/link";
import { Activity, ExternalLink, Filter } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Activity" };

const PAGE_SIZE = 50;

type SearchParams = Promise<{
  action?: string;
  target_type?: string;
  page?: string;
}>;

export default async function AdminActivityPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { action, target_type, page } = await searchParams;
  const pageNum = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const offset = (pageNum - 1) * PAGE_SIZE;

  const supabase = await createClient();

  let query = supabase
    .from("admin_actions")
    .select(
      "id, admin_id, action, target_type, target_id, reason, metadata, created_at, profile:profiles!admin_actions_admin_id_fkey(display_name)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (action) query = query.eq("action", action);
  if (target_type) query = query.eq("target_type", target_type);

  const { data, count } = await query;

  type Raw = {
    id: string;
    admin_id: string;
    action: string;
    target_type: string;
    target_id: string;
    reason: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
    profile:
      | { display_name: string | null }
      | { display_name: string | null }[]
      | null;
  };
  const rows = ((data ?? []) as Raw[]).map((r) => ({
    ...r,
    profile: Array.isArray(r.profile) ? (r.profile[0] ?? null) : r.profile,
  }));

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">Activity</h1>
          <p className="mt-2 text-text-secondary">
            Append-only audit log · {totalCount.toLocaleString("en-ZA")} actions
            recorded.
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <form
        method="get"
        className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 ring-1 ring-border/60"
      >
        <Filter className="size-4 text-text-muted" aria-hidden />
        <label className="inline-flex items-center gap-1.5 rounded-xl bg-off-white px-3 py-2 text-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Action:
          </span>
          <select
            name="action"
            defaultValue={action ?? ""}
            className="bg-transparent font-bold outline-none"
          >
            <option value="">Any</option>
            <option value="approve_game">Approve game</option>
            <option value="reject_game">Reject game</option>
            <option value="cancel_game">Cancel game</option>
            <option value="resolve_report_resolved">
              Resolve report
            </option>
            <option value="resolve_report_dismissed">
              Dismiss report
            </option>
          </select>
        </label>
        <label className="inline-flex items-center gap-1.5 rounded-xl bg-off-white px-3 py-2 text-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Target:
          </span>
          <select
            name="target_type"
            defaultValue={target_type ?? ""}
            className="bg-transparent font-bold outline-none"
          >
            <option value="">Any</option>
            <option value="game">Game</option>
            <option value="user">User</option>
            <option value="report">Report</option>
            <option value="message">Message</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-xl bg-charcoal px-4 py-2 text-sm font-extrabold text-white hover:bg-charcoal/90"
        >
          Apply
        </button>
        {(action || target_type) && (
          <Link
            href="/admin/activity"
            className="rounded-xl px-3 py-2 text-sm font-bold text-text-secondary hover:bg-off-white"
          >
            Clear
          </Link>
        )}
      </form>

      {rows.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-white p-14 text-center ring-1 ring-border/60">
          <Activity
            className="mx-auto size-8 text-text-muted"
            aria-hidden
          />
          <div className="mt-3 text-lg font-extrabold">No activity yet</div>
          <p className="mt-1 text-sm text-text-secondary">
            Moderator actions show up here as they happen.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-hidden rounded-3xl bg-white ring-1 ring-border/60">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-off-white">
                <tr>
                  <th className="px-5 py-3 font-bold text-text-muted">When</th>
                  <th className="px-5 py-3 font-bold text-text-muted">
                    Admin
                  </th>
                  <th className="px-5 py-3 font-bold text-text-muted">
                    Action
                  </th>
                  <th className="px-5 py-3 font-bold text-text-muted">
                    Target
                  </th>
                  <th className="px-5 py-3 font-bold text-text-muted">
                    Reason
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-border last:border-b-0 align-top hover:bg-off-white/60"
                  >
                    <td className="whitespace-nowrap px-5 py-3 text-text-secondary">
                      {new Date(r.created_at).toLocaleString("en-ZA", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </td>
                    <td className="px-5 py-3 font-bold text-charcoal">
                      {r.profile?.display_name ?? (
                        <span className="font-mono text-xs text-text-muted">
                          {r.admin_id.slice(0, 8)}…
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <ActionPill action={r.action} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <span className="rounded-md bg-off-white px-2 py-0.5 text-[11px] font-bold text-text-secondary capitalize">
                          {r.target_type}
                        </span>
                        <span className="font-mono text-[11px] text-text-muted">
                          {r.target_id.slice(0, 8)}…
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-text-secondary">
                      {r.reason ? (
                        <span className="line-clamp-2">{r.reason}</span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-right">
                      {targetLink(r.target_type, r.target_id) && (
                        <Link
                          href={targetLink(r.target_type, r.target_id)!}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs font-extrabold text-primary hover:underline"
                        >
                          Open
                          <ExternalLink className="size-3" aria-hidden />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <Pagination
              page={pageNum}
              totalPages={totalPages}
              action={action}
              target_type={target_type}
            />
          )}
        </>
      )}
    </div>
  );
}

function targetLink(type: string, id: string): string | null {
  if (type === "game") return `/app/game/${id}`;
  if (type === "user") return `/u/${id}`;
  return null;
}

function ActionPill({ action }: { action: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    approve_game: { cls: "bg-success/10 text-success", label: "✅ Approve" },
    reject_game: { cls: "bg-error/10 text-error", label: "❌ Reject" },
    cancel_game: { cls: "bg-error/10 text-error", label: "🚫 Cancel" },
    resolve_report_resolved: {
      cls: "bg-success/10 text-success",
      label: "✔️ Resolve",
    },
    resolve_report_dismissed: {
      cls: "bg-text-muted/20 text-text-secondary",
      label: "🙈 Dismiss",
    },
  };
  const v = map[action] ?? {
    cls: "bg-off-white text-text-secondary",
    label: action.replaceAll("_", " "),
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-extrabold ${v.cls}`}
    >
      {v.label}
    </span>
  );
}

function Pagination({
  page,
  totalPages,
  action,
  target_type,
}: {
  page: number;
  totalPages: number;
  action?: string;
  target_type?: string;
}) {
  function href(p: number): string {
    const params = new URLSearchParams();
    if (action) params.set("action", action);
    if (target_type) params.set("target_type", target_type);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/admin/activity${qs ? "?" + qs : ""}`;
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
