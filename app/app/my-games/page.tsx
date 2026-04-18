import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Game } from "@/lib/types";
import { GameCard } from "@/components/GameCard";

export const metadata = { title: "My games" };

export default async function MyGamesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Games I'm a confirmed participant in
  const { data: partRes } = await supabase
    .from("game_participants")
    .select("game_id")
    .eq("user_id", user.id)
    .eq("status", "confirmed");
  const participantGameIds = (partRes ?? []).map((r: any) => r.game_id);

  const { data: gamesRes } = participantGameIds.length
    ? await supabase
        .from("games")
        .select(
          "id, creator_id, sport, title, description, location_name, city, date_time, duration_minutes, max_players, current_players, skill_level, status, approval_status, is_recurring, created_at",
        )
        .in("id", participantGameIds)
        .gte("date_time", new Date().toISOString())
        .order("date_time", { ascending: true })
    : { data: [] };
  const upcoming = (gamesRes ?? []) as Game[];

  // Games I've created (including pending/rejected so I can see review state)
  const { data: mineRes } = await supabase
    .from("games")
    .select(
      "id, creator_id, sport, title, description, location_name, city, date_time, duration_minutes, max_players, current_players, skill_level, status, approval_status, is_recurring, created_at",
    )
    .eq("creator_id", user.id)
    .order("date_time", { ascending: true });
  const mine = (mineRes ?? []) as Game[];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10">
      <h1 className="text-3xl font-black">My games</h1>

      <Section title="Upcoming — you're in">
        {upcoming.length === 0 ? (
          <EmptyHint>
            You haven't joined any games yet.{" "}
            <Link href="/app" className="font-bold text-primary underline">
              Explore games
            </Link>
            .
          </EmptyHint>
        ) : (
          <Grid games={upcoming} />
        )}
      </Section>

      <Section title="Games you host">
        {mine.length === 0 ? (
          <EmptyHint>
            You haven't created any games yet. Use the mobile app to host one.
          </EmptyHint>
        ) : (
          <Grid games={mine} />
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-text-muted">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Grid({ games }: { games: Game[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {games.map((g) => (
        <GameCard key={g.id} game={g} />
      ))}
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-8 text-center text-text-secondary ring-1 ring-border/60">
      {children}
    </div>
  );
}
