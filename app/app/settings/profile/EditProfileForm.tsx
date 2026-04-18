"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import { CITIES, SPORTS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { setAvatarUrlAction, updateProfileAction } from "../../actions";

type SkillLevel = "any" | "beginner" | "intermediate" | "advanced";

const SKILLS: Array<{ id: SkillLevel; label: string }> = [
  { id: "any", label: "All levels" },
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

type Props = {
  userId: string;
  initial: {
    displayName: string;
    city: string | null;
    favouriteSports: string[];
    skillLevel: SkillLevel;
    avatarUrl: string | null;
  };
};

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function EditProfileForm({ userId, initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState(initial.displayName);
  const [city, setCity] = useState<string | null>(initial.city);
  const [sports, setSports] = useState<string[]>(initial.favouriteSports);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(initial.skillLevel);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initial.avatarUrl);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset so selecting the same file re-fires
    if (!file) return;
    setAvatarError(null);

    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError("Use a JPG, PNG, WebP or GIF.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("Image must be under 5 MB.");
      return;
    }

    setAvatarBusy(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      // Timestamped filename busts the CDN cache after overwriting.
      const path = `${userId}/avatar-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });
      if (upErr) {
        setAvatarError(upErr.message);
        return;
      }

      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = pub.publicUrl;

      const res = await setAvatarUrlAction(publicUrl);
      if (!res.ok) {
        setAvatarError(res.error);
        return;
      }
      setAvatarUrl(publicUrl);
      router.refresh();
    } catch (err) {
      setAvatarError(
        err instanceof Error ? err.message : "Failed to upload image.",
      );
    } finally {
      setAvatarBusy(false);
    }
  }

  async function onRemoveAvatar() {
    if (!avatarUrl) return;
    setAvatarBusy(true);
    setAvatarError(null);
    try {
      const supabase = createClient();
      // Best-effort delete of the underlying object. If this fails
      // (e.g. the URL is stale) we still clear the profile field.
      const m = avatarUrl.match(/\/avatars\/(.+)$/);
      if (m?.[1]) {
        await supabase.storage.from("avatars").remove([decodeURIComponent(m[1])]);
      }
      const res = await setAvatarUrlAction(null);
      if (!res.ok) {
        setAvatarError(res.error);
        return;
      }
      setAvatarUrl(null);
      router.refresh();
    } finally {
      setAvatarBusy(false);
    }
  }

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

      <Field label="Photo">
        <div className="flex items-center gap-5">
          <div className="flex size-20 items-center justify-center overflow-hidden rounded-full bg-primary text-2xl font-black text-white ring-1 ring-border/60">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              (displayName || "?")[0].toUpperCase()
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInput}
              type="file"
              accept={ACCEPTED_AVATAR_TYPES.join(",")}
              onChange={onPickAvatar}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={avatarBusy}
              className="inline-flex items-center gap-1.5 rounded-full bg-charcoal px-4 py-2 text-sm font-extrabold text-white hover:bg-charcoal/90 disabled:opacity-50"
            >
              {avatarBusy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Upload className="size-4" aria-hidden />
              )}
              {avatarUrl ? "Change photo" : "Upload photo"}
            </button>
            {avatarUrl && (
              <button
                type="button"
                onClick={onRemoveAvatar}
                disabled={avatarBusy}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-bold text-text-secondary hover:bg-off-white hover:text-error disabled:opacity-50"
              >
                <X className="size-4" aria-hidden />
                Remove
              </button>
            )}
          </div>
        </div>
        {avatarError && (
          <p className="mt-2 text-sm font-semibold text-error">{avatarError}</p>
        )}
        <p className="mt-2 text-xs text-text-muted">
          JPG, PNG, WebP or GIF · up to 5 MB.
        </p>
      </Field>

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
