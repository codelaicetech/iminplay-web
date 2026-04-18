import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  MessageCircle,
  Trophy,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { sportLabel, type Game, type Profile } from "@/lib/types";
import { ReportButton } from "@/components/ReportButton";
import { JoinButton } from "./JoinButton";

type PageProps = { params: Promise<{ id: string }> };

export default async function AppGamePage({ params }: PageProps) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound(); // middleware normally catches this

  // Game — admins/creators can see non-approved games; others see only approved
  const { data: gameRow } = await supabase
    .from("games")
    .select("*")
    .eq("id", id)
    .single();
  if (!gameRow) notFound();

  const game = gameRow as Game;

  // Creator profile (optional — just for nice display)
  const { data: creatorRow } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, rating_avg")
    .eq("id", game.creator_id)
    .single();
  const creator = creatorRow as Pick<
    Profile,
    "id" | "display_name" | "avatar_url" | "rating_avg"
  > | null;

  // Participants. Supabase returns the joined profile as an array; we
  // normalise to a single object below.
  const { data: participantsRes } = await supabase
    .from("game_participants")
    .select(
      "user_id, status, profile:profiles(display_name, avatar_url)",
    )
    .eq("game_id", id)
    .eq("status", "confirmed");

  type RawParticipant = {
    user_id: string;
    status: string;
    profile:
      | { display_name: string | null; avatar_url: string | null }
      | Array<{ display_name: string | null; avatar_url: string | null }>
      | null;
  };

  const participants = ((participantsRes ?? []) as RawParticipant[]).map(
    (p) => ({
      user_id: p.user_id,
      status: p.status,
      profile: Array.isArray(p.profile) ? (p.profile[0] ?? null) : p.profile,
    }),
  );

  const isParticipant = participants.some((p) => p.user_id === user.id);
  const isCreator = game.creator_id === user.id;
  const spots = Math.max(0, game.max_players - game.current_players);
  const isFull = spots === 0;

  const sport = sportLabel(game.sport);
  const date = new Date(game.date_time);
  const dateLabel = date.toLocaleDateString("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "Africa/Johannesburg",
  });
  const timeLabel = date.toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Johannesburg",
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 sm:px-10">
      <Link
        href="/app"
        className="mb-6 inline-flex items-center gap-1 text-sm font-bold text-text-muted hover:text-charcoal"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to explore
      </Link>

      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-sm font-bold text-primary">
        <span>{sport.emoji}</span>
        {sport.name}
        {game.skill_level !== "any" && (
          <span className="ml-1 text-primary/60">· {game.skill_level}</span>
        )}
      </div>

      <h1 className="text-4xl font-black leading-tight sm:text-5xl">
        {game.title}
      </h1>

      {creator && (
        <p className="mt-3 text-text-secondary">
          Hosted by{" "}
          <Link
            href={`/u/${creator.id}`}
            className="font-bold text-charcoal hover:text-primary"
          >
            {creator.display_name ?? "Host"}
          </Link>
          {typeof creator.rating_avg === "number" &&
            creator.rating_avg > 0 && (
              <> · ⭐ {creator.rating_avg.toFixed(1)}</>
            )}
        </p>
      )}

      {game.approval_status !== "approved" && (
        <div className="mt-4 rounded-xl bg-warning/10 px-4 py-3 text-sm font-semibold text-warning">
          This game is <span className="font-extrabold">{game.approval_status}</span>.{" "}
          {game.approval_status === "pending"
            ? "It will appear publicly once an admin approves it."
            : "Rejected games are only visible to you."}
        </div>
      )}

      {/* Details */}
      <div className="mt-8 grid gap-3 rounded-3xl bg-white p-6 ring-1 ring-border/60 sm:grid-cols-2">
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
        <div className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-border/60">
          <div className="text-xs font-bold uppercase tracking-wider text-text-muted">
            About this game
          </div>
          <p className="mt-3 whitespace-pre-wrap leading-relaxed text-text-secondary">
            {game.description}
          </p>
        </div>
      )}

      {/* Join CTA */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-6 ring-1 ring-border/60">
        <div>
          <div className="text-sm font-bold uppercase tracking-wider text-text-muted">
            Ready to play?
          </div>
          <div className="text-lg font-extrabold">
            {isParticipant
              ? "You're confirmed"
              : isFull
                ? "This one's full"
                : `${spots} spot${spots === 1 ? "" : "s"} available`}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {(isParticipant || isCreator) && (
            <Link
              href={`/app/game/${game.id}/chat`}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-charcoal ring-1 ring-border hover:ring-charcoal"
            >
              <MessageCircle className="size-4" aria-hidden />
              Open chat
            </Link>
          )}
          <JoinButton
            gameId={game.id}
            isParticipant={isParticipant}
            isFull={isFull}
            isCreator={isCreator}
          />
        </div>
      </div>

      {/* Report */}
      {!isCreator && (
        <div className="mt-6 flex justify-end">
          <ReportButton
            targetType="game"
            targetId={game.id}
            targetLabel="this game"
          />
        </div>
      )}

      {/* Participants */}
      {participants.length > 0 && (
        <div className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-border/60">
          <div className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Confirmed players
          </div>
          <ul className="mt-3 flex flex-wrap gap-2">
            {participants.map((p) => (
              <li
                key={p.user_id}
                className="inline-flex items-center gap-2 rounded-full bg-off-white px-3 py-1.5 text-sm"
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/20 text-xs font-extrabold text-primary">
                  {(p.profile?.display_name ?? "?")[0].toUpperCase()}
                </span>
                <Link
                  href={`/u/${p.user_id}`}
                  className="font-bold text-charcoal hover:text-primary"
                >
                  {p.profile?.display_name ?? "Player"}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

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
