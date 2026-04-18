import Link from "next/link";
import { Flag, Users, ChevronRight, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin" };

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Counts run in parallel — layout already confirmed admin role.
  const [pendingRes, reportsRes, adminsRes] = await Promise.all([
    supabase
      .from("games")
      .select("id", { count: "exact", head: true })
      .eq("approval_status", "pending"),
    supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
    supabase.from("admins").select("user_id", { count: "exact", head: true }),
  ]);

  const pendingCount = pendingRes.count ?? 0;
  const openReports = reportsRes.count ?? 0;
  const adminCount = adminsRes.count ?? 0;

  return (
    <div>
      <h1 className="text-3xl font-black">Moderation</h1>
      <p className="mt-2 text-text-secondary">
        Approve games, resolve reports, keep the community healthy.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <StatCard
          href="/admin/pending-games"
          icon={Users}
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

      <div className="mt-12 rounded-3xl bg-white p-6 ring-1 ring-border/60">
        <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">
          Keyboard shortcuts
        </h2>
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <ShortcutRow keys={["A"]} label="Approve current game" />
          <ShortcutRow keys={["R"]} label="Open reject dialog" />
          <ShortcutRow keys={["J"]} label="Next item" />
          <ShortcutRow keys={["K"]} label="Previous item" />
          <ShortcutRow keys={["G", "D"]} label="Go to Dashboard" />
          <ShortcutRow keys={["G", "P"]} label="Go to Pending games" />
          <ShortcutRow keys={["G", "R"]} label="Go to Reports" />
        </ul>
      </div>
    </div>
  );
}

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
  const valueClass =
    tone === "muted" ? "text-charcoal" : "text-charcoal";
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
        <div className={`text-4xl font-black ${valueClass}`}>{value}</div>
        <div className={`mt-2 text-sm font-bold ${ctaClass}`}>{cta}</div>
      </div>
    </Link>
  );
}

function ShortcutRow({
  keys,
  label,
}: {
  keys: string[];
  label: string;
}) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex items-center gap-1">
        {keys.map((k, i) => (
          <kbd
            key={i}
            className="min-w-[1.75rem] rounded-md border border-border bg-off-white px-2 py-0.5 text-center font-mono text-xs font-bold text-charcoal"
          >
            {k}
          </kbd>
        ))}
      </span>
      <span className="text-text-secondary">{label}</span>
    </li>
  );
}
