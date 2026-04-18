"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Ban, Loader2 } from "lucide-react";
import { CITIES } from "@/lib/constants";
import type { ResolvedPlace } from "@/lib/places";
import { PlaceAutocomplete } from "@/components/PlaceAutocomplete";
import { updateGameAction, cancelOwnGameAction } from "../actions";

type SkillLevel = "any" | "beginner" | "intermediate" | "advanced";

const SKILLS: Array<{ id: SkillLevel; label: string }> = [
  { id: "any", label: "All levels" },
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

type Props = {
  gameId: string;
  initial: {
    title: string;
    description: string;
    locationName: string;
    city: string;
    dateTime: string; // YYYY-MM-DDTHH:mm in SAST
    durationMinutes: number;
    maxPlayers: number;
    skillLevel: SkillLevel;
    currentPlayers: number;
    status: string;
  };
};

export function EditGameForm({ gameId, initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [cancelling, startCancelTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [locationName, setLocationName] = useState(initial.locationName);
  const [city, setCity] = useState(initial.city);
  const [dateTime, setDateTime] = useState(initial.dateTime);
  const [durationMinutes, setDurationMinutes] = useState(initial.durationMinutes);
  const [maxPlayers, setMaxPlayers] = useState(initial.maxPlayers);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(initial.skillLevel);

  const alreadyCancelled = initial.status === "cancelled";
  const alreadyCompleted = initial.status === "completed";
  const readOnly = alreadyCancelled || alreadyCompleted;

  function handlePlace(place: ResolvedPlace) {
    setLocationName(place.name);
    if (place.city && (CITIES as readonly string[]).includes(place.city)) {
      setCity(place.city);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending || readOnly) return;
    setError(null);
    setSuccess(null);

    // Interpret the datetime-local string as SAST wall-clock, convert
    // to UTC ISO for the server.
    const localIso = sastLocalToUtcIso(dateTime);

    startTransition(async () => {
      const res = await updateGameAction(gameId, {
        title,
        description,
        locationName,
        city,
        dateTime: localIso,
        durationMinutes,
        maxPlayers,
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

  function onCancelGame() {
    if (cancelling || readOnly) return;
    if (
      !confirm(
        "Cancel this game? Confirmed players will see it as cancelled. This can't be undone from here.",
      )
    )
      return;
    setError(null);
    setSuccess(null);
    startCancelTransition(async () => {
      const res = await cancelOwnGameAction(gameId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.replace(`/app/game/${gameId}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Link
        href={`/app/game/${gameId}`}
        className="inline-flex items-center gap-1 text-sm font-bold text-text-muted hover:text-charcoal"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to game
      </Link>

      {readOnly && (
        <div className="rounded-xl bg-warning/10 px-4 py-3 text-sm font-semibold text-warning">
          This game is {initial.status}. Editing is disabled.
        </div>
      )}

      <Field label="Title" hint={`${title.length}/60`}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={60}
          required
          disabled={readOnly}
          className="w-full rounded-xl border border-border bg-white px-4 py-3 outline-none focus:border-primary disabled:opacity-60"
        />
      </Field>

      <Field label="Description" hint={`${description.length}/500`}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={3}
          disabled={readOnly}
          placeholder="Tell players what to expect…"
          className="w-full resize-none rounded-xl border border-border bg-white px-4 py-3 outline-none focus:border-primary disabled:opacity-60"
        />
      </Field>

      <Field label="Location">
        <PlaceAutocomplete
          value={locationName}
          onChangeText={setLocationName}
          onSelect={handlePlace}
          placeholder="Start typing a venue…"
        />
      </Field>

      <Field label="City">
        <div className="flex flex-wrap gap-2">
          {CITIES.map((c) => (
            <Chip
              key={c}
              active={city === c}
              disabled={readOnly}
              onClick={() => setCity(c)}
            >
              {c}
            </Chip>
          ))}
        </div>
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Date & time (Cape Town)">
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            required
            disabled={readOnly}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 outline-none focus:border-primary disabled:opacity-60"
          />
        </Field>

        <Field label="Duration (minutes)">
          <input
            type="number"
            value={durationMinutes}
            onChange={(e) =>
              setDurationMinutes(parseInt(e.target.value, 10) || 60)
            }
            min={15}
            max={480}
            step={15}
            required
            disabled={readOnly}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 outline-none focus:border-primary disabled:opacity-60"
          />
        </Field>

        <Field
          label="Max players"
          hint={`${initial.currentPlayers} confirmed`}
        >
          <input
            type="number"
            value={maxPlayers}
            onChange={(e) =>
              setMaxPlayers(parseInt(e.target.value, 10) || 10)
            }
            min={Math.max(2, initial.currentPlayers)}
            max={40}
            required
            disabled={readOnly}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 outline-none focus:border-primary disabled:opacity-60"
          />
        </Field>

        <Field label="Skill level">
          <div className="flex flex-wrap gap-2">
            {SKILLS.map((s) => (
              <Chip
                key={s.id}
                active={skillLevel === s.id}
                disabled={readOnly}
                onClick={() => setSkillLevel(s.id)}
              >
                {s.label}
              </Chip>
            ))}
          </div>
        </Field>
      </div>

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

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <button
          type="submit"
          disabled={pending || readOnly}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-extrabold text-white transition-transform active:scale-95 hover:bg-primary-dark disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : null}
          {pending ? "Saving…" : "Save changes"}
        </button>

        {!readOnly && (
          <button
            type="button"
            onClick={onCancelGame}
            disabled={cancelling}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-error ring-1 ring-error/30 transition hover:bg-error/5 hover:ring-error/60 disabled:opacity-50"
          >
            {cancelling ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Ban className="size-4" aria-hidden />
            )}
            {cancelling ? "Cancelling…" : "Cancel this game"}
          </button>
        )}
      </div>
    </form>
  );
}

/** Reinterpret "2026-04-19T06:30" as SAST wall-clock, return UTC ISO. */
function sastLocalToUtcIso(localStr: string): string {
  // Build an ISO with explicit +02:00 offset so the Date constructor
  // treats the time as SAST regardless of the browser's timezone.
  if (!localStr) return new Date().toISOString();
  const safe = localStr.length === 16 ? localStr + ":00" : localStr;
  return new Date(`${safe}+02:00`).toISOString();
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
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold ring-1 transition disabled:opacity-50 ${
        active
          ? "bg-charcoal text-white ring-charcoal"
          : "bg-white text-charcoal ring-border hover:ring-charcoal"
      }`}
    >
      {children}
    </button>
  );
}
