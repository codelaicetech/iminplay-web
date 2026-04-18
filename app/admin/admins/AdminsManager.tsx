"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Shield, Trash2, UserPlus } from "lucide-react";
import { grantAdminAction, revokeAdminAction } from "../actions";

export type AdminListRow = {
  user_id: string;
  role: "superadmin" | "moderator";
  granted_at: string;
  notes: string | null;
  display_name: string | null;
};

type Props = {
  admins: AdminListRow[];
  currentUserId: string;
};

export function AdminsManager({ admins, currentUserId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<"moderator" | "superadmin">("moderator");
  const [notes, setNotes] = useState("");

  function onGrant(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await grantAdminAction({
        userId: userId.trim(),
        role,
        notes,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess(res.message ?? "Granted.");
      setUserId("");
      setNotes("");
      setRole("moderator");
      router.refresh();
    });
  }

  function onRevoke(targetId: string, label: string) {
    if (pending) return;
    if (!confirm(`Revoke admin access for ${label}?`)) return;
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await revokeAdminAction(targetId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess(res.message ?? "Revoked.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Grant form */}
      <form
        onSubmit={onGrant}
        className="rounded-3xl bg-white p-6 ring-1 ring-border/60"
      >
        <div className="flex items-center gap-2">
          <UserPlus className="size-5 text-primary" aria-hidden />
          <h2 className="text-lg font-black">Grant admin access</h2>
        </div>
        <p className="mt-1 text-sm text-text-secondary">
          Paste the player&apos;s user ID (UUID) — you can find it at the end
          of any <code>/u/&lt;id&gt;</code> URL.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_180px]">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">
              Player ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="00000000-0000-0000-0000-000000000000"
              spellCheck={false}
              className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-2.5 font-mono text-sm outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">
              Role
            </label>
            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "moderator" | "superadmin")
              }
              className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-bold outline-none focus:border-primary"
            >
              <option value="moderator">Moderator</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">
            Notes (optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Why this grant — for the audit trail"
            className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-error/10 px-4 py-3 text-sm font-semibold text-error">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 rounded-xl bg-success/10 px-4 py-3 text-sm font-semibold text-success">
            {success}
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={pending || !userId.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Shield className="size-4" aria-hidden />
            )}
            Grant access
          </button>
        </div>
      </form>

      {/* Current list */}
      <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-border/60">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-off-white">
            <tr>
              <th className="px-5 py-3 font-bold text-text-muted">Name</th>
              <th className="px-5 py-3 font-bold text-text-muted">Role</th>
              <th className="px-5 py-3 font-bold text-text-muted">Granted</th>
              <th className="px-5 py-3 font-bold text-text-muted">Notes</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => {
              const label = a.display_name ?? a.user_id.slice(0, 8) + "…";
              const isSelf = a.user_id === currentUserId;
              return (
                <tr
                  key={a.user_id}
                  className="border-b border-border last:border-b-0"
                >
                  <td className="px-5 py-3 font-bold text-charcoal">
                    {label}
                    {isSelf && (
                      <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-extrabold text-primary">
                        you
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                        a.role === "superadmin"
                          ? "bg-primary/10 text-primary"
                          : "bg-info/10 text-info"
                      }`}
                    >
                      {a.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-text-secondary">
                    {new Date(a.granted_at).toLocaleDateString("en-ZA")}
                  </td>
                  <td className="px-5 py-3 text-text-muted">
                    {a.notes ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onRevoke(a.user_id, label)}
                      disabled={pending || isSelf}
                      title={
                        isSelf
                          ? "You can't revoke your own access"
                          : "Revoke admin access"
                      }
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-text-muted hover:bg-error/10 hover:text-error disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                      Revoke
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
