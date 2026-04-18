"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { adminBulkDeleteGamesAction } from "../actions";

type Props = {
  totalCount: number;
  activeFilters: {
    q?: string;
    approval?: string;
    status?: string;
    city?: string;
    sport?: string;
  };
};

/**
 * Bulk delete games matching whatever filters are active on
 * /admin/games. Two layers of protection: 5-char reason minimum and
 * a typed "DELETE" confirmation. Deletes cascade to participants +
 * messages.
 */
export function BulkDeleteBar({ totalCount, activeFilters }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const hasFilters = Object.values(activeFilters).some((v) => !!v);

  function submit() {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      const res = await adminBulkDeleteGamesAction({
        ...activeFilters,
        reason,
        confirm,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setDone(res.message);
      router.refresh();
    });
  }

  function close() {
    setOpen(false);
    setReason("");
    setConfirm("");
    setError(null);
    setDone(null);
  }

  if (totalCount === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-error ring-1 ring-error/30 hover:bg-error/5 hover:ring-error/60"
      >
        <Trash2 className="size-4" aria-hidden />
        Delete {totalCount} matching
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !pending) close();
          }}
        >
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-black">
              {done ? "Done." : `Delete ${totalCount} games?`}
            </h3>

            {done ? (
              <>
                <p className="mt-3 rounded-xl bg-success/10 px-4 py-3 text-sm font-semibold text-success">
                  {done}
                </p>
                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-full bg-charcoal px-5 py-2 text-sm font-extrabold text-white"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm text-text-secondary">
                  This permanently deletes every game matching
                  {hasFilters ? " the active filters" : " (no filter)"},
                  plus every chat message and participant on them.{" "}
                  <strong className="text-charcoal">
                    There is no undo.
                  </strong>
                </p>

                <div className="mt-5">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Reason (for audit log)
                  </label>
                  <textarea
                    autoFocus
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    placeholder="e.g., Pre-launch test data cleanup."
                    className="mt-1 w-full resize-none rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="mt-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Type <code className="rounded bg-off-white px-1.5 py-0.5 font-mono text-charcoal">DELETE</code> to confirm
                  </label>
                  <input
                    type="text"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="DELETE"
                    autoComplete="off"
                    className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-3 font-mono text-sm outline-none focus:border-primary"
                  />
                </div>

                {error && (
                  <div className="mt-4 rounded-xl bg-error/10 px-3 py-2 text-sm font-semibold text-error">
                    {error}
                  </div>
                )}

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={close}
                    disabled={pending}
                    className="rounded-full px-4 py-2 text-sm font-bold text-text-secondary hover:bg-off-white disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={
                      pending ||
                      reason.trim().length < 5 ||
                      confirm.trim() !== "DELETE"
                    }
                    className="inline-flex items-center gap-1.5 rounded-full bg-error px-5 py-2 text-sm font-extrabold text-white disabled:opacity-40 hover:bg-error/90"
                  >
                    {pending ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <Trash2 className="size-4" aria-hidden />
                    )}
                    {pending
                      ? "Deleting…"
                      : `Delete ${totalCount} game${totalCount === 1 ? "" : "s"}`}
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
