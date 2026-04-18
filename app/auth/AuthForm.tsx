"use client";

import { useState, useTransition } from "react";
import type { ActionResult } from "./actions";

type Field = {
  name: string;
  label: string;
  type?: "email" | "password" | "text";
  autoComplete?: string;
  placeholder?: string;
  hint?: string;
};

type Props = {
  fields: Field[];
  submitLabel: string;
  pendingLabel?: string;
  /** Hidden fields (e.g., redirect) — appended as input type=hidden. */
  hidden?: Record<string, string>;
  /** Server Action that processes the FormData. */
  action: (formData: FormData) => Promise<ActionResult>;
  /** Optional content below the submit button (links, alternates). */
  footer?: React.ReactNode;
};

/**
 * Generic client form that dispatches to a Server Action, shows
 * validation + server errors inline, and keeps the UX snappy with
 * useTransition.
 */
export function AuthForm({
  fields,
  submitLabel,
  pendingLabel = "Loading…",
  hidden,
  action,
  footer,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await action(formData);
      if (!result) return; // server action redirected, nothing to do
      if (result.ok) {
        setSuccess(result.message ?? "Done.");
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {hidden &&
        Object.entries(hidden).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
      {fields.map((f) => (
        <div key={f.name}>
          <label
            htmlFor={f.name}
            className="mb-1.5 block text-sm font-bold text-charcoal"
          >
            {f.label}
          </label>
          <input
            id={f.name}
            name={f.name}
            type={f.type ?? "text"}
            autoComplete={f.autoComplete}
            placeholder={f.placeholder}
            disabled={pending}
            required
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-base outline-none transition-colors focus:border-primary disabled:opacity-60"
          />
          {f.hint && (
            <p className="mt-1 text-xs text-text-muted">{f.hint}</p>
          )}
        </div>
      ))}

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
        {pending ? pendingLabel : submitLabel}
      </button>

      {footer}
    </form>
  );
}
