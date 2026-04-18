"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, Loader2 } from "lucide-react";
import { adminCancelGameAction } from "../actions";

type Props = {
  gameId: string;
  title: string;
  status: string;
};

export function GameRowActions({ gameId, title, status }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canCancel =
    status !== "cancelled" && status !== "completed";

  function submit() {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      const res = await adminCancelGameAction(gameId, reason);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOpen(false);
      setReason("");
      router.refresh();
    });
  }

  if (!canCancel) {
    return (
      <span className="text-xs text-text-muted">—</span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-text-muted hover:bg-error/10 hover:text-error disabled:opacity-40"
      >
        {pending ? (
          <Loader2 className="size-3 animate-spin" aria-hidden />
        ) : (
          <Ban className="size-3" aria-hidden />
        )}
        Cancel
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !pending) setOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-black line-clamp-2">
              Cancel “{title}”?
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              The game will be marked cancelled. Confirmed players should be
              notified separately. Reason goes to the audit log.
            </p>
            <textarea
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="e.g., Host no-show; venue closed unexpectedly."
              className="mt-4 w-full resize-none rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary"
            />
            {error && (
              <div className="mt-3 rounded-xl bg-error/10 px-3 py-2 text-sm font-semibold text-error">
                {error}
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setError(null);
                }}
                disabled={pending}
                className="rounded-full px-4 py-2 text-sm font-bold text-text-secondary hover:bg-off-white disabled:opacity-50"
              >
                Keep game
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={pending || reason.trim().length < 5}
                className="rounded-full bg-error px-5 py-2 text-sm font-extrabold text-white disabled:opacity-40 hover:bg-error/90"
              >
                {pending ? "Cancelling…" : "Cancel game"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
