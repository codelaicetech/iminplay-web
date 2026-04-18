"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CITIES, SPORTS } from "@/lib/constants";
import type { ResolvedPlace } from "@/lib/places";
import { PlaceAutocomplete } from "@/components/PlaceAutocomplete";
import { createGameAction } from "../../actions";

const SKILL_LEVELS: Array<{
  id: "any" | "beginner" | "intermediate" | "advanced";
  label: string;
}> = [
  { id: "any", label: "All levels" },
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

export default function NewGamePage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [sport, setSport] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [placeCoords, setPlaceCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [city, setCity] = useState<string>("Cape Town");
  const [dateTime, setDateTime] = useState<string>(defaultDateTime());
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [maxPlayers, setMaxPlayers] = useState<number>(10);
  const [skillLevel, setSkillLevel] =
    useState<(typeof SKILL_LEVELS)[number]["id"]>("any");

  function handlePlace(place: ResolvedPlace) {
    setLocationName(place.name);
    setPlaceCoords({ lat: place.lat, lng: place.lng });
    if (place.city && (CITIES as readonly string[]).includes(place.city)) {
      setCity(place.city);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const res = await createGameAction({
        sport,
        title,
        description,
        locationName,
        city,
        lat: placeCoords?.lat,
        lng: placeCoords?.lng,
        dateTime: new Date(dateTime).toISOString(),
        durationMinutes,
        maxPlayers,
        skillLevel,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess(res.message ?? "Created.");
      // Give the user a beat to see the confirmation, then navigate.
      setTimeout(() => {
        if (res.data?.id) router.replace(`/app/game/${res.data.id}`);
      }, 900);
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8 sm:px-10">
      <Link
        href="/app"
        className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-text-muted hover:text-charcoal"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to Explore
      </Link>

      <h1 className="text-3xl font-black">Create a game</h1>
      <p className="mt-2 text-text-secondary">
        Your game will be reviewed by our team before appearing in the feed.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-6">
        {/* Sport */}
        <Field label="Sport">
          <div className="flex flex-wrap gap-2">
            {SPORTS.map((s) => (
              <Chip
                key={s.id}
                active={sport === s.id}
                onClick={() => setSport(s.id)}
              >
                <span>{s.emoji}</span> {s.name}
              </Chip>
            ))}
          </div>
        </Field>

        {/* Title */}
        <Field
          label="Title"
          hint={`${title.length}/60`}
          hintAlign="right"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={60}
            placeholder="e.g. 5-a-side at Green Point"
            required
            className="w-full rounded-xl border border-border bg-white px-4 py-3 outline-none focus:border-primary"
          />
        </Field>

        {/* Description */}
        <Field
          label="Description"
          optional
          hint={`${description.length}/500`}
          hintAlign="right"
        >
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Any details players should know…"
            className="w-full rounded-xl border border-border bg-white px-4 py-3 outline-none focus:border-primary"
          />
        </Field>

        {/* Location */}
        <Field label="Location">
          <PlaceAutocomplete
            value={locationName}
            onChangeText={(v) => {
              setLocationName(v);
              if (placeCoords) setPlaceCoords(null);
            }}
            onSelect={handlePlace}
          />
          {placeCoords && (
            <p className="mt-1.5 text-sm font-semibold text-primary">
              ✓ Location pinned · will show in &quot;Near me&quot;
            </p>
          )}
        </Field>

        {/* City */}
        <Field label="City">
          <div className="flex flex-wrap gap-2">
            {CITIES.map((c) => (
              <Chip key={c} active={city === c} onClick={() => setCity(c)}>
                {c}
              </Chip>
            ))}
          </div>
        </Field>

        {/* Date + Time */}
        <Field label="Date & time">
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            required
            className="w-full rounded-xl border border-border bg-white px-4 py-3 outline-none focus:border-primary"
          />
        </Field>

        {/* Duration + Max players */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Duration (min)">
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) =>
                setDurationMinutes(parseInt(e.target.value) || 60)
              }
              min={15}
              max={480}
              step={15}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 outline-none focus:border-primary"
            />
          </Field>
          <Field label="Max players">
            <input
              type="number"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(parseInt(e.target.value) || 10)}
              min={2}
              max={40}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 outline-none focus:border-primary"
            />
          </Field>
        </div>

        {/* Skill level */}
        <Field label="Skill level">
          <div className="flex flex-wrap gap-2">
            {SKILL_LEVELS.map((s) => (
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
          className="w-full rounded-full bg-primary px-5 py-3.5 text-base font-extrabold text-white transition-transform active:scale-95 hover:bg-primary-dark disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create game"}
        </button>
      </form>
    </div>
  );
}

// ── Tiny UI primitives, local to this page ─────────────────────────────
function Field({
  label,
  hint,
  hintAlign = "left",
  optional,
  children,
}: {
  label: string;
  hint?: string;
  hintAlign?: "left" | "right";
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-end justify-between gap-2">
        <label className="text-sm font-bold text-charcoal">
          {label}
          {optional && (
            <span className="ml-1 font-normal text-text-muted">
              (optional)
            </span>
          )}
        </label>
        {hint && (
          <span
            className={`text-xs text-text-muted ${hintAlign === "right" ? "" : "mr-auto"}`}
          >
            {hint}
          </span>
        )}
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

/** Default to tomorrow at 18:00 (local) — a sensible pickup time. */
function defaultDateTime(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(18, 0, 0, 0);
  // YYYY-MM-DDTHH:mm for <input type="datetime-local">
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
