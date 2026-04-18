import Link from "next/link";
import {
  Activity,
  CalendarCheck,
  ChevronRight,
  Flag,
  Gamepad2,
  Shield,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin" };

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default async function AdminDashboard() {
  const supabase = await createClient();

  const now = new Date();
  const weekAgo = new Date(now.getTime() - WEEK_MS).toISOString();

  // Counts + aggregates run in parallel — layout already confirmed admin.
  const [
    pendingRes,
    reportsRes,
    adminsRes,
    usersRes,
    newUsersRes,
    totalGamesRes,
    upcomingGamesRes,
    gamesThisWeekRes,
    approvedGamesRes,
    cancelledGamesRes,
    recentActivityRes,
    recentSignupsRes,
  ] = await Promise.all([
    supabase
      .from("games")
      .select("id", { count: "exact", head: true })
      .eq("approval_status", "pending"),
    supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
    supabase.from("admins").select("user_id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekAgo),
    supabase.from("games").select("id", { count: "exact", head: true }),
    supabase
      .from("games")
      .select("id", { count: "exact", head: true })
      .eq("approval_status", "approved")
      .gte("date_time", now.toISOString()),
    supabase
      .from("games")
      .select("id", { count: "exact", head: true })
      .gte("created_at", weekAgo),
    supabase
      .from("games")
      .select("id", { count: "exact", head: true })
      .eq("approval_status", "approved"),
    supabase
      .from("games")
      .select("id", { count: "exact", head: true })
      .eq("status", "cancelled"),
    supabase
      .from("admin_actions")
      .select(
        "id, admin_id, action, target_type, target_id, reason, created_at, profile:profiles!admin_actions_admin_id_fkey(display_name)",
      )
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("profiles")
      .select("id, display_name, city, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const pendingCount = pendingRes.count ?? 0;
  const openReports = reportsRes.count ?? 0;
  const adminCount = adminsRes.count ?? 0;
  const userCount = usersRes.count ?? 0;
  const newUsers = newUsersRes.count ?? 0;
  const totalGames = totalGamesRes.count ?? 0;
  const upcomingGames = upcomingGamesRes.count ?? 0;
  const gamesThisWeek = gamesThisWeekRes.count ?? 0;
  const approvedGames = approvedGamesRes.count ?? 0;
  const cancelledGames = cancelledGamesRes.count ?? 0;

  type ActivityRaw = {
    id: string;
    admin_id: string;
    action: string;
    target_type: string;
    target_id: string;
    reason: string | null;
    created_at: string;
    profile:
      | { display_name: string | null }
      | { display_name: string | null }[]
      | null;
  };
  const activity = ((recentActivityRes.data ?? []) as ActivityRaw[]).map(
    (a) => ({
      ...a,
      profile: Array.isArray(a.profile) ? (a.profile[0] ?? null) : a.profile,
    }),
  );

  type NewUser = {
    id: string;
    display_name: string | null;
    city: string | null;
    created_at: string;
  };
  const recentSignups = (recentSignupsRes.data ?? []) as NewUser[];

  return (
    <div>
      <h1 className="text-3xl font-black">Dashboard</h1>
      <p className="mt-2 text-text-secondary">
        Overview of the IminPlay community. Drill down for moderation actions.
      </p>

      {/* Urgent queue strip */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          href="/admin/pending-games"
          icon={CalendarCheck}
          label="Pending games"
          value={pendingCount}
          cta={pendingCount > 0 ? "Review queue →" : "All clear"}
          tone={pendingCount > 0 ? "primary" : "muted"}
        />
        <StatCard
          href="/admin/reports"
          icon={Flag}
          label="Open reports"
          value={openReports}
          cta={openReports > 0 ? "Resolve →" : "All clear"}
          tone={openReports > 0 ? "error" : "muted"}
        />
        <StatCard
          href="/admin/admins"
          icon={Shield}
          label="Admins"
          value={adminCount}
          cta="Manage →"
          tone="muted"
        />
      </div>

      {/* KPI grid */}
      <h2 className="mt-12 text-xs font-bold uppercase tracking-wider text-text-muted">
        Growth
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile
          icon={Users}
          label="Total users"
          value={userCount.toLocaleString("en-ZA")}
          sublabel={`${totalGames.toLocaleString("en-ZA")} games all-time`}
        />
        <KpiTile
          icon={UserPlus}
          label="New users · 7d"
          value={newUsers.toString()}
          sublabel="last 7 days"
          accent={newUsers > 0}
        />
        <KpiTile
          icon={Gamepad2}
          label="Upcoming games"
          value={upcomingGames.toString()}
          sublabel={`${approvedGames} approved · ${cancelledGames} cancelled`}
        />
        <KpiTile
          icon={TrendingUp}
          label="Games created · 7d"
          value={gamesThisWeek.toString()}
          sublabel="last 7 days"
          accent={gamesThisWeek > 0}
        />
      </div>

      {/* Two-column content */}
      <div className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Recent admin activity */}
        <section className="rounded-3xl bg-white ring-1 ring-border/60">
          <header className="flex items-center justify-between border-b border-border/60 px-6 py-4">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-primary" aria-hidden />
              <h2 className="text-sm font-extrabold uppercase tracking-wider">
                Recent moderator activity
              </h2>
            </div>
            <Link
              href="/admin/activity"
              className="text-xs font-extrabold text-primary hover:underline"
            >
              View all →
            </Link>
          </header>
          {activity.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-text-muted">
              No moderator actions yet.
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {activity.map((a) => (
                <li key={a.id} className="flex items-start gap-3 px-6 py-4">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-off-white text-xs">
                    {actionEmoji(a.action)}
                  </div>
                  <div className="flex-1 text-sm">
                    <div className="font-bold text-charcoal">
                      {a.profile?.display_name ?? "Admin"}{" "}
                      <span className="font-semibold text-text-secondary">
                        {actionLabel(a.action)}
                      </span>{" "}
                      <span className="text-text-muted">
                        {a.target_type}
                      </span>
                    </div>
                    {a.reason && (
                      <div className="mt-1 line-clamp-2 text-xs text-text-muted">
                        “{a.reason}”
                      </div>
                    )}
                    <div className="mt-1 text-xs text-text-muted">
                      {formatRelative(a.created_at)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Latest signups */}
        <section className="rounded-3xl bg-white ring-1 ring-border/60">
          <header className="flex items-center justify-between border-b border-border/60 px-6 py-4">
            <div className="flex items-center gap-2">
              <UserPlus className="size-4 text-primary" aria-hidden />
              <h2 className="text-sm font-extrabold uppercase tracking-wider">
                Latest signups
              </h2>
            </div>
            <Link
              href="/admin/users"
              className="text-xs font-extrabold text-primary hover:underline"
            >
              All users →
            </Link>
          </header>
          {recentSignups.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-text-muted">
              No signups yet.
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {recentSignups.map((u) => (
                <li key={u.id} className="flex items-center gap-3 px-6 py-4">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-extrabold text-primary">
                    {(u.display_name ?? "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 text-sm">
                    <Link
                      href={`/u/${u.id}`}
                      className="font-bold text-charcoal hover:text-primary"
                    >
                      {u.display_name ?? "Unnamed"}
                    </Link>
                    <div className="text-xs text-text-muted">
                      {u.city ?? "No city"} · {formatRelative(u.created_at)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────── */

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
  });
}

function actionEmoji(action: string): string {
  if (action.startsWith("approve")) return "✅";
  if (action.startsWith("reject")) return "❌";
  if (action.startsWith("cancel")) return "🚫";
  if (action.startsWith("resolve_report_resolved")) return "✔️";
  if (action.startsWith("resolve_report_dismissed")) return "🙈";
  if (action.includes("admin")) return "🛡️";
  return "•";
}

function actionLabel(action: string): string {
  const map: Record<string, string> = {
    approve_game: "approved",
    reject_game: "rejected",
    cancel_game: "cancelled",
    resolve_report_resolved: "resolved",
    resolve_report_dismissed: "dismissed",
  };
  return map[action] ?? action.replaceAll("_", " ");
}

/* ── UI bits ──────────────────────────────────────────────── */

function StatCard({
  href,
  icon: Icon,
  label,
  value,
  cta,
  tone,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: number;
  cta: string;
  tone: "primary" | "error" | "muted";
}) {
  const toneClass =
    tone === "primary"
      ? "bg-primary/10 text-primary"
      : tone === "error"
        ? "bg-error/10 text-error"
        : "bg-off-white text-text-muted";
  const ctaClass =
    tone === "muted"
      ? "text-text-muted"
      : tone === "error"
        ? "text-error"
        : "text-primary";

  return (
    <Link
      href={href}
      className="group flex flex-col justify-between rounded-3xl bg-white p-5 ring-1 ring-border/60 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div
          className={`flex size-11 items-center justify-center rounded-xl ${toneClass}`}
        >
          <Icon className="size-5" aria-hidden />
        </div>
        <ChevronRight className="size-4 text-text-muted group-hover:text-primary" />
      </div>
      <div>
        <div className="mt-6 text-xs font-bold uppercase tracking-wider text-text-muted">
          {label}
        </div>
        <div className="text-4xl font-black text-charcoal">{value}</div>
        <div className={`mt-2 text-sm font-bold ${ctaClass}`}>{cta}</div>
      </div>
    </Link>
  );
}

function KpiTile({
  icon: Icon,
  label,
  value,
  sublabel,
  accent,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
  sublabel: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-3xl bg-white p-5 ring-1 ring-border/60">
      <div className="flex items-center justify-between">
        <div
          className={`flex size-9 items-center justify-center rounded-lg ${
            accent ? "bg-primary/10 text-primary" : "bg-off-white text-text-muted"
          }`}
        >
          <Icon className="size-4" aria-hidden />
        </div>
      </div>
      <div className="mt-4 text-xs font-bold uppercase tracking-wider text-text-muted">
        {label}
      </div>
      <div className="mt-1 text-3xl font-black">{value}</div>
      <div className="mt-1 text-xs text-text-muted">{sublabel}</div>
    </div>
  );
}

