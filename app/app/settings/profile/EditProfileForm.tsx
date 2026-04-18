"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CITIES, SPORTS } from "@/lib/constants";
import { updateProfileAction } from "../../actions";

type SkillLevel = "any" | "beginner" | "intermediate" | "advanced";

const SKILLS: Array<{ id: SkillLevel; label: string }> = [
  { id: "any", label: "All levels" },
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

type Props = {
  initial: {
    displayName: string;
    city: string | null;
    favouriteSports: string[];
    skillLevel: SkillLevel;
  };
};

export function EditProfileForm({ initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState(initial.displayName);
  const [city, setCity] = useState<string | null>(initial.city);
  const [sports, setSports] = useState<string[]>(initial.favouriteSports);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(initial.skillLevel);

  function toggleSport(id: string) {
    setSports((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await updateProfileAction({
        displayName,
        city,
        favouriteSports: sports,
        skillLevel,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess(res.message ?? "Saved.");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Link
        href="/app/settings"
        className="inline-flex items-center gap-1 text-sm font-bold text-text-muted hover:text-charcoal"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to Settings
      </Link>

      <Field label="Display name" hint={`${displayName.length}/40`}>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={40}
          required
          className="w-full rounded-xl border border-border bg-white px-4 py-3 outline-none focus:border-primary"
        />
      </Field>

      <Field label="Favourite sports">
        <div className="flex flex-wrap gap-2">
          {SPORTS.map((s) => (
            <Chip
              key={s.id}
              active={sports.includes(s.id)}
              onClick={() => toggleSport(s.id)}
            >
              <span>{s.emoji}</span> {s.name}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="City">
        <div className="flex flex-wrap gap-2">
          <Chip active={city === null} onClick={() => setCity(null)}>
            Not set
          </Chip>
          {CITIES.map((c) => (
            <Chip key={c} active={city === c} onClick={() => setCity(c)}>
              {c}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="Skill level">
        <div className="flex flex-wrap gap-2">
          {SKILLS.map((s) => (
            <Chip
              key={s.id}
              active={skillLevel === s.id}
              onClick={() => setSkillLevel(s.id)}
            >
              {s.label}
            </Chip>
          ))}
        </div>
      </Field>

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
        className="rounded-full bg-primary px-6 py-3 font-extrabold text-white transition-transform active:scale-95 hover:bg-primary-dark disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-end justify-between">
        <label className="text-sm font-bold text-charcoal">{label}</label>
        {hint && <span className="text-xs text-text-muted">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold ring-1 transition ${
        active
          ? "bg-charcoal text-white ring-charcoal"
          : "bg-white text-charcoal ring-border hover:ring-charcoal"
      }`}
    >
      {children}
    </button>
  );
}
