"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";
import { deleteAccountAction } from "../../actions";

const CONFIRM_WORD = "delete";

const CONSEQUENCES = [
  "Your profile, ratings, and games played count",
  "All games you created",
  "Your chat history across every game",
  "Your push notification subscriptions",
  "Related crash reports in our error monitoring",
  "Your authentication record (you won't be able to sign back in)",
];

export default function DeleteAccountPage() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [typed, setTyped] = useState("");

  const canDelete = typed.trim().toLowerCase() === CONFIRM_WORD;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canDelete) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteAccountAction(typed);
      if (res && !res.ok) {
        setError(res.error);
      }
      // On success the action redirects to "/" — no client handling needed
    });
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-10 sm:px-10">
      <Link
        href="/app/settings"
        className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-text-muted hover:text-charcoal"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to Settings
      </Link>
      <h1 className="text-3xl font-black">Delete account</h1>

      {/* Warning banner */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-error/5 p-4 ring-1 ring-error/20">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-error">
          <AlertTriangle className="size-5" aria-hidden />
        </div>
        <div>
          <div className="font-extrabold text-error">
            This cannot be undone
          </div>
          <p className="mt-1 text-sm font-semibold text-error/80">
            Deleting your account permanently removes your data from IminPlay
            and our third-party processors.
          </p>
        </div>
      </div>

      {/* Consequences */}
      <h2 className="mt-8 text-xs font-bold uppercase tracking-wider text-text-muted">
        What will be deleted
      </h2>
      <ul className="mt-3 space-y-2 rounded-2xl bg-white p-4 ring-1 ring-border/60">
        {CONSEQUENCES.map((line) => (
          <li key={line} className="flex items-start gap-2 text-sm">
            <XCircle
              className="mt-0.5 size-4 shrink-0 text-error"
              aria-hidden
            />
            <span className="text-charcoal">{line}</span>
          </li>
        ))}
      </ul>

      {/* Typed confirmation */}
      <form onSubmit={submit} className="mt-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">
          Confirm
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Type <span className="font-extrabold text-error">{CONFIRM_WORD}</span>{" "}
          below to enable the button.
        </p>

        <div
          className={`mt-3 flex items-center rounded-xl border-2 bg-white ${
            canDelete ? "border-success" : "border-border"
          }`}
        >
          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={CONFIRM_WORD}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            className="w-full bg-transparent px-4 py-3 outline-none"
          />
          {canDelete && (
            <CheckCircle2
              className="mr-3 size-5 text-success"
              aria-hidden
            />
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-error/10 px-4 py-3 text-sm font-semibold text-error">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-2">
          <button
            type="submit"
            disabled={!canDelete || pending}
            className="w-full rounded-full bg-error px-5 py-3.5 font-extrabold text-white transition-transform active:scale-95 hover:bg-error/90 disabled:opacity-40"
          >
            {pending ? "Deleting…" : "Permanently delete account"}
          </button>
          <Link
            href="/app/settings"
            className="block w-full rounded-full px-5 py-3 text-center text-sm font-bold text-text-secondary hover:bg-off-white"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
