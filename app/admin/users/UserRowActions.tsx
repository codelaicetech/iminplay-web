"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, Loader2, ShieldCheck } from "lucide-react";
import { banUserAction, unbanUserAction } from "../actions";

type Props = {
  userId: string;
  displayName: string;
  bannedAt: string | null;
};

export function UserRowActions({ userId, displayName, bannedAt }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isBanned = !!bannedAt;

  function submitBan() {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      const res = await banUserAction(userId, reason);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOpen(false);
      setReason("");
      router.refresh();
    });
  }

  function submitUnban() {
    if (pending) return;
    if (!confirm(`Unban ${displayName}? They will be able to post again.`))
      return;
    startTransition(async () => {
      const res = await unbanUserAction(userId);
      if (!res.ok) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  if (isBanned) {
    return (
      <button
        type="button"
        onClick={submitUnban}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-success ring-1 ring-success/40 hover:bg-success/5 disabled:opacity-40"
      >
        {pending ? (
          <Loader2 className="size-3 animate-spin" aria-hidden />
        ) : (
          <ShieldCheck className="size-3" aria-hidden />
        )}
        Unban
      </button>
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
        <Ban className="size-3" aria-hidden />
        Ban
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !pending) setOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-black">Ban {displayName}?</h3>
            <p className="mt-1 text-sm text-text-secondary">
              Banned users can&apos;t create games, join games, send chat
              messages, or report. They can still browse the app. Minimum 5
              characters for the reason — it goes to the audit log.
            </p>
            <textarea
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="e.g., Multiple no-shows + verbal abuse in chat on 2026-04-12."
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
                Cancel
              </button>
              <button
                type="button"
                onClick={submitBan}
                disabled={pending || reason.trim().length < 5}
                className="rounded-full bg-error px-5 py-2 text-sm font-extrabold text-white disabled:opacity-40 hover:bg-error/90"
              >
                {pending ? "Banning…" : "Ban user"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
