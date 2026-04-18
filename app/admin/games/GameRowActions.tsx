"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, Loader2, Trash2 } from "lucide-react";
import { adminCancelGameAction, adminDeleteGameAction } from "../actions";

type Props = {
  gameId: string;
  title: string;
  status: string;
};

type Mode = "cancel" | "delete" | null;

export function GameRowActions({ gameId, title, status }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [mode, setMode] = useState<Mode>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canCancel =
    status !== "cancelled" && status !== "completed";

  function submit() {
    if (pending || !mode) return;
    setError(null);
    startTransition(async () => {
      const res =
        mode === "cancel"
          ? await adminCancelGameAction(gameId, reason)
          : await adminDeleteGameAction(gameId, reason);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setMode(null);
      setReason("");
      router.refresh();
    });
  }

  return (
    <>
      <div className="inline-flex items-center gap-1">
        {canCancel && (
          <button
            type="button"
            onClick={() => setMode("cancel")}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-text-muted hover:bg-warning/10 hover:text-warning disabled:opacity-40"
          >
            {pending && mode === "cancel" ? (
              <Loader2 className="size-3 animate-spin" aria-hidden />
            ) : (
              <Ban className="size-3" aria-hidden />
            )}
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={() => setMode("delete")}
          disabled={pending}
          className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-text-muted hover:bg-error/10 hover:text-error disabled:opacity-40"
          title="Permanently delete this game"
        >
          {pending && mode === "delete" ? (
            <Loader2 className="size-3 animate-spin" aria-hidden />
          ) : (
            <Trash2 className="size-3" aria-hidden />
          )}
          Delete
        </button>
      </div>

      {mode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !pending) setMode(null);
          }}
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-black line-clamp-2">
              {mode === "cancel"
                ? `Cancel “${title}”?`
                : `Delete “${title}”?`}
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              {mode === "cancel"
                ? "The game will be marked cancelled. Confirmed players should be notified separately."
                : "Permanently deletes this game plus every chat message and participant on it. This cannot be undone."}{" "}
              Reason goes to the audit log.
            </p>
            <textarea
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder={
                mode === "cancel"
                  ? "e.g., Host no-show; venue closed unexpectedly."
                  : "e.g., Test data cleanup; spam game."
              }
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
                  setMode(null);
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
                className={`rounded-full px-5 py-2 text-sm font-extrabold text-white disabled:opacity-40 ${
                  mode === "cancel"
                    ? "bg-warning hover:bg-warning/90"
                    : "bg-error hover:bg-error/90"
                }`}
              >
                {pending
                  ? mode === "cancel"
                    ? "Cancelling…"
                    : "Deleting…"
                  : mode === "cancel"
                    ? "Cancel game"
                    : "Delete game"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
