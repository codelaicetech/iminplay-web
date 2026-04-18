import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Trophy,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { sportLabel, type Game } from "@/lib/types";
import { Wordmark } from "@/components/Wordmark";
import { PrimaryCta } from "@/components/PrimaryCta";

type PageProps = {
  params: Promise<{ id: string }>;
};

// ── Data loader — used by both the page AND generateMetadata ──────────
async function loadGame(id: string): Promise<Game | null> {
  if (!isUuid(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("games")
    .select(
      "*, creator:profiles!games_creator_id_fkey(display_name, avatar_url, rating_avg)",
    )
    .eq("id", id)
    .eq("approval_status", "approved")
    .single();
  return (data as Game | null) ?? null;
}

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    s,
  );
}

// ── Dynamic Open Graph metadata (per-game preview in WhatsApp etc.) ───
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const game = await loadGame(id);
  if (!game) {
    return { title: "Game not found" };
  }

  const sport = sportLabel(game.sport);
  const spots = game.max_players - game.current_players;
  const when = formatDateTime(game.date_time);
  const subject = `${sport.emoji} ${game.title}`;
  const description = `${when} · ${game.location_name ?? game.city ?? "TBD"} · ${spots} spot${spots === 1 ? "" : "s"} left · ${sport.name}${game.skill_level !== "any" ? " · " + game.skill_level : ""}`;

  return {
    title: subject,
    description,
    openGraph: {
      title: subject,
      description,
      url: `https://iminplay.com/game/${id}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: subject,
      description,
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────
export default async function GamePage({ params }: PageProps) {
  const { id } = await params;
  const game = await loadGame(id);
  if (!game) notFound();

  const sport = sportLabel(game.sport);
  const spots = Math.max(0, game.max_players - game.current_players);
  const date = new Date(game.date_time);
  const dateLabel = date.toLocaleDateString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
  const timeLabel = date.toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <main className="flex-1 bg-off-white">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4 sm:px-10">
          <Wordmark size="sm" asLink />
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-bold text-text-muted hover:text-charcoal"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        {/* Sport tag */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-sm font-bold text-primary">
          <span>{sport.emoji}</span>
          {sport.name}
        </div>

        {/* Title */}
        <h1 className="text-4xl font-black leading-tight sm:text-5xl">
          {game.title}
        </h1>

        {/* Host */}
        {game.creator?.display_name && (
          <p className="mt-3 text-text-secondary">
            Hosted by{" "}
            <span className="font-bold text-charcoal">
              {game.creator.display_name}
            </span>
            {typeof game.creator.rating_avg === "number" &&
              game.creator.rating_avg > 0 && (
                <>
                  {" "}
                  · ⭐ {game.creator.rating_avg.toFixed(1)}
                </>
              )}
          </p>
        )}

        {/* Details card */}
        <div className="mt-8 grid gap-3 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-border/60 sm:grid-cols-2">
          <Detail icon={MapPin} label="Location">
            {game.location_name ?? game.city ?? "TBD"}
          </Detail>
          <Detail icon={Calendar} label="Date">
            {dateLabel}
          </Detail>
          <Detail icon={Clock} label="Time">
            {timeLabel} · {game.duration_minutes} min
          </Detail>
          <Detail icon={Users} label="Players">
            {game.current_players}/{game.max_players}{" "}
            <span className="text-text-muted">({spots} left)</span>
          </Detail>
          {game.skill_level !== "any" && (
            <Detail icon={Trophy} label="Skill level">
              <span className="capitalize">{game.skill_level}</span>
            </Detail>
          )}
        </div>

        {/* Description */}
        {game.description && (
          <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-border/60">
            <div className="text-sm font-bold uppercase tracking-wider text-text-muted">
              About this game
            </div>
            <p className="mt-3 whitespace-pre-wrap leading-relaxed text-text-secondary">
              {game.description}
            </p>
          </div>
        )}

        {/* Join CTA */}
        <div className="mt-10 rounded-3xl bg-charcoal px-6 py-10 text-center text-white">
          <div className="text-2xl font-black sm:text-3xl">
            {spots > 0 ? "Want in?" : "This one's full"}
          </div>
          <p className="mx-auto mt-3 max-w-md text-white/70">
            {spots > 0
              ? "Sign up free to join this game, chat with the team, and find more pickup sport near you."
              : "Sign up free to find other games in your area."}
          </p>
          <div className="mt-6 flex justify-center">
            <PrimaryCta variant="onDark" />
          </div>
        </div>
      </section>
    </main>
  );
}

// Inline cell ─ decoupled from Tailwind context so the JSX stays compact
function Detail({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-xl bg-off-white text-primary">
        <Icon className="size-5" aria-hidden />
      </div>
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-text-muted">
          {label}
        </div>
        <div className="mt-0.5 font-bold text-charcoal">{children}</div>
      </div>
    </div>
  );
}

// Helper: keep formatting in sync with mobile
function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
