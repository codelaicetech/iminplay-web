"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarCheck,
  ExternalLink,
  Loader2,
  MapPin,
  Trash2,
  Users as UsersIcon,
  X,
} from "lucide-react";
import { sportLabel } from "@/lib/types";
import { GameRowActions } from "./GameRowActions";
import { adminDeleteSelectedGamesAction } from "../actions";

type Approval = "" | "pending" | "approved" | "rejected";
type Status = "" | "open" | "full" | "in_progress" | "completed" | "cancelled";

export type AdminGameRow = {
  id: string;
  creator_id: string;
  sport: string;
  title: string;
  city: string | null;
  location_name: string | null;
  date_time: string;
  duration_minutes: number;
  max_players: number;
  current_players: number;
  skill_level: string;
  status: Status;
  approval_status: Approval;
  created_at: string;
  creator: { display_name: string | null } | null;
};

export function GamesTable({ games }: { games: AdminGameRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const selectedIds = useMemo(() => Array.from(selected), [selected]);
  const selectedCount = selectedIds.length;
  const allVisibleSelected =
    games.length > 0 && games.every((g) => selected.has(g.id));

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      if (games.every((g) => prev.has(g.id))) {
        // All visible selected — deselect just the visible ones
        const next = new Set(prev);
        games.forEach((g) => next.delete(g.id));
        return next;
      }
      // Otherwise select all visible (preserve any already selected)
      const next = new Set(prev);
      games.forEach((g) => next.add(g.id));
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function submitDelete() {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      const res = await adminDeleteSelectedGamesAction({
        ids: selectedIds,
        reason,
        confirm,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setDone(res.message);
      setSelected(new Set());
      router.refresh();
    });
  }

  function closeModal() {
    setModalOpen(false);
    setReason("");
    setConfirm("");
    setError(null);
    setDone(null);
  }

  return (
    <>
      {/* Selection action bar */}
      {selectedCount > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-charcoal px-4 py-3 text-sm text-white">
          <div className="font-extrabold">
            {selectedCount} selected
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearSelection}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-white/80 hover:bg-white/10 hover:text-white"
            >
              <X className="size-3.5" aria-hidden />
              Clear
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-error px-4 py-1.5 text-xs font-extrabold text-white hover:bg-error/90"
            >
              <Trash2 className="size-3.5" aria-hidden />
              Delete selected
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-3xl bg-white ring-1 ring-border/60">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-off-white">
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleAll}
                  aria-label="Select all visible"
                  className="size-4 cursor-pointer accent-primary"
                />
              </th>
              <th className="px-5 py-3 font-bold text-text-muted">Game</th>
              <th className="px-5 py-3 font-bold text-text-muted">Host</th>
              <th className="px-5 py-3 font-bold text-text-muted">When</th>
              <th className="px-5 py-3 font-bold text-text-muted">Players</th>
              <th className="px-5 py-3 font-bold text-text-muted">Approval</th>
              <th className="px-5 py-3 font-bold text-text-muted">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {games.map((g) => {
              const sp = sportLabel(g.sport);
              const isSelected = selected.has(g.id);
              return (
                <tr
                  key={g.id}
                  className={`border-b border-border last:border-b-0 ${
                    isSelected ? "bg-primary/5" : "hover:bg-off-white/60"
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(g.id)}
                      aria-label={`Select ${g.title}`}
                      className="size-4 cursor-pointer accent-primary"
                    />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-off-white text-lg">
                        {sp.emoji}
                      </div>
                      <div className="min-w-0">
                        <div className="line-clamp-1 font-bold text-charcoal">
                          {g.title}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-text-muted">
                          <MapPin className="size-3" aria-hidden />
                          {g.location_name ?? g.city ?? "TBD"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {g.creator?.display_name ? (
                      <Link
                        href={`/u/${g.creator_id}`}
                        target="_blank"
                        className="font-bold text-charcoal hover:text-primary"
                      >
                        {g.creator.display_name}
                      </Link>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-text-secondary">
                    <div className="inline-flex items-center gap-1">
                      <CalendarCheck
                        className="size-3.5 text-text-muted"
                        aria-hidden
                      />
                      {new Date(g.date_time).toLocaleDateString("en-ZA", {
                        day: "numeric",
                        month: "short",
                        timeZone: "Africa/Johannesburg",
                      })}{" "}
                      {new Date(g.date_time).toLocaleTimeString("en-ZA", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                        timeZone: "Africa/Johannesburg",
                      })}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-bold text-charcoal">
                    <span className="inline-flex items-center gap-1">
                      <UsersIcon
                        className="size-3.5 text-text-muted"
                        aria-hidden
                      />
                      {g.current_players}/{g.max_players}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <ApprovalBadge value={g.approval_status} />
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge value={g.status} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <GameRowActions
                        gameId={g.id}
                        title={g.title}
                        status={g.status}
                      />
                      <Link
                        href={`/app/game/${g.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs font-extrabold text-primary hover:underline"
                      >
                        Open
                        <ExternalLink className="size-3" aria-hidden />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete selected modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !pending) closeModal();
          }}
        >
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-black">
              {done ? "Done." : `Delete ${selectedCount} games?`}
            </h3>

            {done ? (
              <>
                <p className="mt-3 rounded-xl bg-success/10 px-4 py-3 text-sm font-semibold text-success">
                  {done}
                </p>
                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-full bg-charcoal px-5 py-2 text-sm font-extrabold text-white"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm text-text-secondary">
                  Permanently deletes the {selectedCount} selected game
                  {selectedCount === 1 ? "" : "s"} plus every chat message
                  and participant.{" "}
                  <strong className="text-charcoal">No undo.</strong>
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
                    placeholder="e.g., Test data cleanup."
                    className="mt-1 w-full resize-none rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="mt-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Type{" "}
                    <code className="rounded bg-off-white px-1.5 py-0.5 font-mono text-charcoal">
                      DELETE
                    </code>{" "}
                    to confirm
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
                    onClick={closeModal}
                    disabled={pending}
                    className="rounded-full px-4 py-2 text-sm font-bold text-text-secondary hover:bg-off-white disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitDelete}
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
                      : `Delete ${selectedCount} game${selectedCount === 1 ? "" : "s"}`}
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

/* ── Badges (duplicated from page to keep the client bundle self-contained) ── */

function ApprovalBadge({ value }: { value: Approval }) {
  if (value === "pending")
    return (
      <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-extrabold text-warning">
        Pending
      </span>
    );
  if (value === "approved")
    return (
      <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-extrabold text-success">
        Approved
      </span>
    );
  if (value === "rejected")
    return (
      <span className="rounded-full bg-error/10 px-2 py-0.5 text-xs font-extrabold text-error">
        Rejected
      </span>
    );
  return <span className="text-text-muted">—</span>;
}

function StatusBadge({ value }: { value: Status }) {
  const map: Record<Status, { cls: string; label: string }> = {
    "": { cls: "", label: "—" },
    open: { cls: "bg-info/10 text-info", label: "Open" },
    full: { cls: "bg-primary/10 text-primary", label: "Full" },
    in_progress: { cls: "bg-primary/10 text-primary", label: "In progress" },
    completed: { cls: "bg-off-white text-text-muted", label: "Completed" },
    cancelled: { cls: "bg-error/10 text-error", label: "Cancelled" },
  };
  const v = map[value] ?? map[""];
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${v.cls}`}
    >
      {v.label}
    </span>
  );
}
