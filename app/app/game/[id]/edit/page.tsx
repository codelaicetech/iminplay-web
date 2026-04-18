import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Game } from "@/lib/types";
import { EditGameForm } from "./EditGameForm";

export const metadata = { title: "Edit game" };

type PageProps = { params: Promise<{ id: string }> };

export default async function EditGamePage({ params }: PageProps) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/auth/sign-in?redirect=/app/game/${id}/edit`);

  const { data: gameRow } = await supabase
    .from("games")
    .select("*")
    .eq("id", id)
    .single();
  if (!gameRow) notFound();

  const game = gameRow as Game;
  if (game.creator_id !== user.id) redirect(`/app/game/${id}`);

  // date_time is stored UTC; format for <input type="datetime-local">
  // in SAST so the default shown to the host matches what they picked.
  const initialDateTime = toSastDatetimeLocal(game.date_time);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 sm:px-10">
      <h1 className="text-3xl font-black">Edit game</h1>
      <p className="mt-2 text-text-secondary">
        Changes are visible immediately to everyone who has joined or saved
        this game.
      </p>

      <div className="mt-8">
        <EditGameForm
          gameId={game.id}
          initial={{
            title: game.title,
            description: game.description ?? "",
            locationName: game.location_name ?? "",
            city: game.city ?? "Cape Town",
            dateTime: initialDateTime,
            durationMinutes: game.duration_minutes,
            maxPlayers: game.max_players,
            skillLevel: game.skill_level,
            currentPlayers: game.current_players,
            status: game.status,
          }}
        />
      </div>
    </div>
  );
}

/** Convert a UTC ISO timestamp to the string shape <input
 * type="datetime-local"> expects ("YYYY-MM-DDTHH:mm"), in SAST. */
function toSastDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  // Format parts using the Johannesburg timezone explicitly.
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) =>
    parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
