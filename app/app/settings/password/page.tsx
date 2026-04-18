"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { changePasswordAction } from "../../actions";

export default function ChangePasswordPage() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await changePasswordAction({ password, confirm });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess(res.message ?? "Updated.");
      setPassword("");
      setConfirm("");
    });
  }

  return (
    <div className="mx-auto max-w-md px-6 py-10 sm:px-10">
      <Link
        href="/app/settings"
        className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-text-muted hover:text-charcoal"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to Settings
      </Link>
      <h1 className="text-3xl font-black">Change password</h1>
      <p className="mt-2 text-text-secondary">
        Pick something you&apos;ll remember.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <Input
          label="New password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          placeholder="At least 8 characters"
        />
        <Input
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
          placeholder="Repeat password"
        />

        {error && (
          <div className="rounded-xl bg-error/10 px-4 py-3 text-sm font-semibold text-error">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl bg-success/10 px-4 py-3 text-sm font-semibold text-success">
            {success}
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

function Input({
  label,
  type,
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-charcoal">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required
        className="w-full rounded-xl border border-border bg-white px-4 py-3 outline-none focus:border-primary"
      />
    </div>
  );
}
