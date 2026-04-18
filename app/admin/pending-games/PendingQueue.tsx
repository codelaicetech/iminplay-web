"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Check,
  MapPin,
  Star,
  Users,
  X,
  ExternalLink,
} from "lucide-react";
import { sportLabel, type Game, type Profile } from "@/lib/types";
import { approveGameAction, rejectGameAction } from "../actions";

type QueueGame = Game & {
  creator: Pick<Profile, "display_name" | "avatar_url" | "rating_avg"> | null;
};

type Props = {
  games: QueueGame[];
};

export function PendingQueue({ games }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [cursor, setCursor] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  const current = games[cursor];

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (rejectOpen) return; // don't hijack typing inside the modal
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      const k = e.key.toLowerCase();
      if (k === "a") {
        e.preventDefault();
        onApprove();
      } else if (k === "r") {
        e.preventDefault();
        setRejectOpen(true);
      } else if (k === "j") {
        e.preventDefault();
        setCursor((i) => Math.min(i + 1, games.length - 1));
      } else if (k === "k") {
        e.preventDefault();
        setCursor((i) => Math.max(i - 1, 0));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, games.length, rejectOpen]);

  if (!current) {
    return (
      <div className="mt-10 rounded-3xl bg-white p-14 text-center ring-1 ring-border/60">
        <div className="text-4xl">🎉</div>
        <div className="mt-4 text-xl font-extrabold">Queue empty</div>
      </div>
    );
  }

  function onApprove() {
    if (!current || pending) return;
    setError(null);
    startTransition(async () => {
      const res = await approveGameAction(current!.id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      // Move to next; if none, refresh to get a fresh server list
      if (cursor >= games.length - 1) {
        router.refresh();
        setCursor(0);
      } else {
        setCursor((i) => i + 1);
      }
    });
  }

  function onReject() {
    if (!current || pending) return;
    setError(null);
    startTransition(async () => {
      const res = await rejectGameAction(current!.id, reason);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setRejectOpen(false);
      setReason("");
      if (cursor >= games.length - 1) {
        router.refresh();
        setCursor(0);
      } else {
        setCursor((i) => i + 1);
      }
    });
  }

  const sport = sportLabel(current.sport);
  const date = new Date(current.date_time);

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Main card */}
      <div className="rounded-3xl bg-white p-6 ring-1 ring-border/60 sm:p-8">
        <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-text-muted">
          <span>
            {cursor + 1} / {games.length} · submitted{" "}
            {new Date(current.created_at).toLocaleDateString("en-ZA")}
          </span>
          <Link
            href={`/app/game/${current.id}`}
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            Open page
            <ExternalLink className="size-3.5" aria-hidden />
          </Link>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-off-white text-2xl">
            {sport.emoji}
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-primary">{sport.name}</div>
            <h2 className="text-2xl font-black leading-tight">
              {current.title}
            </h2>
          </div>
        </div>

        {current.description && (
          <p className="mt-5 whitespace-pre-wrap rounded-2xl bg-off-white p-4 text-sm leading-relaxed text-charcoal">
            {current.description}
          </p>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Row icon={MapPin}>
            {current.location_name ?? current.city ?? "TBD"}
          </Row>
          <Row icon={Calendar}>
            {date.toLocaleDateString("en-ZA", {
              weekday: "short",
              day: "numeric",
              month: "short",
              timeZone: "Africa/Johannesburg",
            })}{" "}
            at{" "}
            {date.toLocaleTimeString("en-ZA", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: "Africa/Johannesburg",
            })}
          </Row>
          <Row icon={Users}>
            {current.current_players}/{current.max_players} players ·{" "}
            {current.skill_level !== "any" ? current.skill_level : "any level"}
          </Row>
          <Row icon={Star}>
            Host:{" "}
            <span className="font-extrabold">
              {current.creator?.display_name ?? "Unknown"}
            </span>
            {typeof current.creator?.rating_avg === "number" &&
              current.creator.rating_avg > 0 && (
                <> · ⭐ {current.creator.rating_avg.toFixed(1)}</>
              )}
          </Row>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-error/10 px-4 py-3 text-sm font-semibold text-error">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={onApprove}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full bg-success px-6 py-3 font-extrabold text-white transition-transform active:scale-95 hover:bg-success/90 disabled:opacity-60"
          >
            <Check className="size-5" aria-hidden />
            Approve (A)
          </button>
          <button
            onClick={() => setRejectOpen(true)}
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-extrabold text-error ring-2 ring-error/40 transition hover:bg-error/5 disabled:opacity-60"
          >
            <X className="size-5" aria-hidden />
            Reject (R)
          </button>
        </div>
      </div>

      {/* Queue sidebar */}
      <aside className="rounded-3xl bg-white p-4 ring-1 ring-border/60">
        <div className="mb-3 px-2 text-xs font-bold uppercase tracking-wider text-text-muted">
          Queue
        </div>
        <ul className="space-y-1">
          {games.map((g, i) => {
            const s = sportLabel(g.sport);
            const active = i === cursor;
            return (
              <li key={g.id}>
                <button
                  type="button"
                  onClick={() => setCursor(i)}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${
                    active
                      ? "bg-primary/10 text-charcoal"
                      : "hover:bg-off-white text-text-secondary"
                  }`}
                >
                  <span className="text-lg">{s.emoji}</span>
                  <span className="flex-1 truncate font-bold">{g.title}</span>
                  {active && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                      now
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Reject modal */}
      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-black">Reject this game</h3>
            <p className="mt-1 text-sm text-text-secondary">
              The host will receive an email with your reason. Be kind but
              clear.
            </p>
            <textarea
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="e.g., The title contains language we don't allow on the platform."
              className="mt-4 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary"
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
                  setRejectOpen(false);
                  setError(null);
                }}
                className="rounded-full px-4 py-2 text-sm font-bold text-text-secondary hover:bg-off-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onReject}
                disabled={pending || reason.trim().length < 5}
                className="rounded-full bg-error px-5 py-2 text-sm font-extrabold text-white disabled:opacity-40 hover:bg-error/90"
              >
                {pending ? "Rejecting…" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-text-secondary">
      <Icon className="size-4 text-text-muted" aria-hidden />
      <span className="text-charcoal">{children}</span>
    </div>
  );
}
