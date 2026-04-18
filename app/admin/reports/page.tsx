import { createClient } from "@/lib/supabase/server";
import { ReportsQueue } from "./ReportsQueue";

export const metadata = { title: "Reports" };

export type ReportRow = {
  id: string;
  target_type: "user" | "game" | "message";
  target_id: string;
  reason: string;
  details: string | null;
  status: "open" | "resolved" | "dismissed";
  created_at: string;
  reporter: { display_name: string | null } | null;
};

type RawReport = Omit<ReportRow, "reporter"> & {
  reporter:
    | { display_name: string | null }
    | { display_name: string | null }[]
    | null;
};

export default async function ReportsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("reports")
    .select(
      "id, target_type, target_id, reason, details, status, created_at, reporter:profiles!reports_reporter_id_fkey(display_name)",
    )
    .eq("status", "open")
    .order("created_at", { ascending: true })
    .limit(100);

  const reports = ((data ?? []) as RawReport[]).map((r) => ({
    ...r,
    reporter: Array.isArray(r.reporter) ? (r.reporter[0] ?? null) : r.reporter,
  })) as ReportRow[];

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-3xl font-black">Reports</h1>
        <div className="text-sm text-text-muted">{reports.length} open</div>
      </div>
      <p className="mt-2 text-text-secondary">
        Reports from users about games, other users, or chat messages. Resolve
        when action was taken, dismiss if nothing needs to happen.
      </p>

      {reports.length === 0 ? (
        <div className="mt-10 rounded-3xl bg-white p-14 text-center ring-1 ring-border/60">
          <div className="text-4xl">✨</div>
          <div className="mt-4 text-xl font-extrabold">All clear</div>
          <p className="mt-2 text-text-secondary">No open reports.</p>
        </div>
      ) : (
        <ReportsQueue reports={reports} />
      )}
    </div>
  );
}
