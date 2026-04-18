"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
        return;
      }
      router.replace("/app");
    });
  }

  return (
    <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-border/60 sm:p-10">
      <h1 className="text-3xl font-black">Set a new password</h1>
      <p className="mt-2 text-text-secondary">
        Pick something you&apos;ll remember.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-bold text-charcoal">
            New password
          </label>
          <input
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full rounded-xl border border-border bg-white px-4 py-3 outline-none focus:border-primary disabled:opacity-60"
            disabled={pending}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-bold text-charcoal">
            Confirm password
          </label>
          <input
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat password"
            className="w-full rounded-xl border border-border bg-white px-4 py-3 outline-none focus:border-primary disabled:opacity-60"
            disabled={pending}
          />
        </div>

        {error && (
          <div className="rounded-xl bg-error/10 px-4 py-3 text-sm font-semibold text-error">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-primary px-5 py-3 font-extrabold text-white transition-transform active:scale-95 hover:bg-primary-dark disabled:opacity-60"
        >
          {pending ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
