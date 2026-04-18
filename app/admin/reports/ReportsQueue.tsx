"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Flag, X, ExternalLink } from "lucide-react";
import type { ReportRow } from "./page";
import { dismissReportAction, resolveReportAction } from "../actions";

const REASON_LABEL: Record<string, string> = {
  harassment: "Harassment",
  spam: "Spam",
  inappropriate: "Inappropriate",
  no_show: "No-show",
  fake_game: "Fake game",
  other: "Other",
};

function relativeTime(iso: string): string {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const dd = Math.floor(h / 24);
  return `${dd}d ago`;
}

function targetUrl(r: ReportRow): string {
  if (r.target_type === "user") return `/u/${r.target_id}`;
  if (r.target_type === "game") return `/app/game/${r.target_id}`;
  // messages are per-game; we can't deep-link to a single message yet
  return "#";
}

export function ReportsQueue({ reports }: { reports: ReportRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  function run(action: "resolve" | "dismiss", id: string) {
    setError(null);
    setActing(id);
    startTransition(async () => {
      const fn = action === "resolve" ? resolveReportAction : dismissReportAction;
      const res = await fn(id);
      setActing(null);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="mt-6 space-y-3">
      {error && (
        <div className="rounded-xl bg-error/10 px-4 py-3 text-sm font-semibold text-error">
          {error}
        </div>
      )}

      {reports.map((r) => {
        const reasonLabel = REASON_LABEL[r.reason] ?? r.reason;
        const isBusy = pending && acting === r.id;
        return (
          <div
            key={r.id}
            className="rounded-2xl bg-white p-4 ring-1 ring-border/60 sm:p-5"
          >
            <div className="flex flex-wrap items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-error/10 text-error">
                <Flag className="size-5" aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <TypeBadge type={r.target_type} />
                  <span className="inline-flex rounded-full bg-error/10 px-2 py-0.5 text-xs font-bold text-error">
                    {reasonLabel}
                  </span>
                  <span className="text-xs text-text-muted">
                    {relativeTime(r.created_at)}
                  </span>
                </div>
                <div className="mt-2 text-sm text-charcoal">
                  Reported by{" "}
                  <span className="font-extrabold">
                    {r.reporter?.display_name ?? "a user"}
                  </span>
                </div>
                {r.details && (
                  <p className="mt-2 whitespace-pre-wrap rounded-xl bg-off-white px-3 py-2 text-sm text-charcoal">
                    {r.details}
                  </p>
                )}
                <Link
                  href={targetUrl(r)}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
                >
                  View {r.target_type}
                  <ExternalLink className="size-3.5" aria-hidden />
                </Link>
              </div>

              <div className="flex items-center gap-2 sm:flex-col">
                <button
                  onClick={() => run("resolve", r.id)}
                  disabled={isBusy}
                  className="inline-flex items-center gap-1.5 rounded-full bg-success px-4 py-2 text-sm font-extrabold text-white hover:bg-success/90 disabled:opacity-60"
                >
                  <Check className="size-4" aria-hidden />
                  Resolve
                </button>
                <button
                  onClick={() => run("dismiss", r.id)}
                  disabled={isBusy}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-text-secondary ring-1 ring-border hover:bg-off-white disabled:opacity-60"
                >
                  <X className="size-4" aria-hidden />
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TypeBadge({ type }: { type: ReportRow["target_type"] }) {
  const map: Record<
    ReportRow["target_type"],
    { label: string; cls: string }
  > = {
    user: { label: "User", cls: "bg-info/10 text-info" },
    game: { label: "Game", cls: "bg-primary/10 text-primary" },
    message: { label: "Message", cls: "bg-warning/10 text-warning" },
  };
  const { label, cls } = map[type];
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${cls}`}>
      {label}
    </span>
  );
}
