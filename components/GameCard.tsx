import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";
import { sportLabel, type Game } from "@/lib/types";

type Props = {
  game: Game;
  href?: string;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(Date.now() + 86_400_000);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return d.toLocaleDateString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Compact game card used in feeds. Mirrors the mobile GameCard but
 * optimised for desktop hover + pointer. The full details live on
 * the dedicated page — the card is deliberately read-only.
 */
export function GameCard({ game, href }: Props) {
  const sport = sportLabel(game.sport);
  const spots = Math.max(0, game.max_players - game.current_players);
  const url = href ?? `/app/game/${game.id}`;

  const statusColor =
    game.status === "open"
      ? "text-success"
      : game.status === "full"
        ? "text-error"
        : "text-text-muted";
  const statusLabel =
    game.status === "open"
      ? `${spots} spot${spots === 1 ? "" : "s"} left`
      : game.status === "full"
        ? "Full"
        : game.status.replaceAll("_", " ");

  return (
    <Link
      href={url}
      className="group block rounded-2xl bg-white p-5 ring-1 ring-border/60 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex size-10 items-center justify-center rounded-xl bg-off-white text-xl">
          {sport.emoji}
        </div>
        <span className={`text-xs font-bold ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      <div className="text-lg font-extrabold leading-tight text-charcoal group-hover:text-primary">
        {game.title}
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-sm text-text-secondary">
        <MapPin className="size-4 text-text-muted" aria-hidden />
        {game.location_name ?? game.city ?? "TBD"}
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 text-sm text-text-secondary">
        <Calendar className="size-4 text-text-muted" aria-hidden />
        {formatDate(game.date_time)} at {formatTime(game.date_time)}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-1.5 text-sm font-extrabold text-primary">
          <Users className="size-4" aria-hidden />
          {game.current_players}/{game.max_players}
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
          {sport.name}
        </span>
      </div>
    </Link>
  );
}
