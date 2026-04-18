"use client";

import { useEffect, useState, useTransition } from "react";
import { Flag } from "lucide-react";
import {
  submitReportAction,
  type ReportReason,
  type ReportTarget,
} from "@/app/report-actions";

type Props = {
  targetType: ReportTarget;
  targetId: string;
  targetLabel?: string;
  /** Visual variant of the trigger button. */
  variant?: "ghost" | "chip";
  className?: string;
};

const REASON_LABELS: Record<ReportReason, string> = {
  harassment: "Harassment",
  spam: "Spam",
  inappropriate: "Inappropriate",
  no_show: "No-show",
  fake_game: "Fake game",
  other: "Other",
};

function reasonsFor(t: ReportTarget): ReportReason[] {
  switch (t) {
    case "user":
      return ["harassment", "spam", "inappropriate", "no_show", "other"];
    case "game":
      return ["spam", "fake_game", "inappropriate", "other"];
    case "message":
      return ["harassment", "spam", "inappropriate", "other"];
  }
}

const MAX_DETAILS = 500;

export function ReportButton({
  targetType,
  targetId,
  targetLabel,
  variant = "ghost",
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  // Reset state each time the modal closes
  useEffect(() => {
    if (!open) {
      setReason(null);
      setDetails("");
      setError(null);
      setDone(null);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function submit() {
    if (!reason || pending) return;
    setError(null);
    startTransition(async () => {
      const res = await submitReportAction({
        targetType,
        targetId,
        reason,
        details,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setDone(res.message);
    });
  }

  const triggerCls =
    variant === "chip"
      ? "inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-text-muted ring-1 ring-border hover:text-error hover:ring-error/40"
      : "inline-flex items-center gap-1.5 text-sm font-bold text-text-muted hover:text-error";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${triggerCls} ${className ?? ""}`}
      >
        <Flag className="size-4" aria-hidden />
        Report
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !pending) setOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl">
            <h3 className="text-xl font-black">
              {targetLabel ? `Report ${targetLabel}` : "Submit a report"}
            </h3>

            {done ? (
              <>
                <p className="mt-3 rounded-xl bg-success/10 px-4 py-3 text-sm font-semibold text-success">
                  {done}
                </p>
                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full bg-charcoal px-5 py-2 text-sm font-extrabold text-white"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm text-text-secondary">
                  Your report is reviewed by our moderation team. False reports
                  may affect your account.
                </p>

                <div className="mt-5 text-xs font-bold uppercase tracking-wider text-text-muted">
                  Reason
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {reasonsFor(targetType).map((r) => {
                    const active = reason === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setReason(r)}
                        className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-bold ring-1 transition ${
                          active
                            ? "bg-primary text-white ring-primary"
                            : "bg-white text-charcoal ring-border hover:ring-charcoal"
                        }`}
                      >
                        {REASON_LABELS[r]}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 flex items-end justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Details (optional)
                  </label>
                  <span className="text-xs text-text-muted">
                    {details.length}/{MAX_DETAILS}
                  </span>
                </div>
                <textarea
                  value={details}
                  onChange={(e) =>
                    setDetails(e.target.value.slice(0, MAX_DETAILS))
                  }
                  rows={4}
                  placeholder="Tell us more about what happened…"
                  className="mt-1 w-full resize-none rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary"
                />

                {error && (
                  <div className="mt-3 rounded-xl bg-error/10 px-3 py-2 text-sm font-semibold text-error">
                    {error}
                  </div>
                )}

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={pending}
                    className="rounded-full px-4 py-2 text-sm font-bold text-text-secondary hover:bg-off-white disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={pending || !reason}
                    className="rounded-full bg-error px-5 py-2 text-sm font-extrabold text-white disabled:opacity-40 hover:bg-error/90"
                  >
                    {pending ? "Submitting…" : "Submit report"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
