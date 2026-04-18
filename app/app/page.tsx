import { createClient } from "@/lib/supabase/server";
import { GameCard } from "@/components/GameCard";
import { FeedFilters } from "@/components/FeedFilters";
import type { Game } from "@/lib/types";

type PageProps = {
  searchParams: Promise<{
    city?: string;
    sport?: string;
    date?: string;
  }>;
};

export const metadata = {
  title: "Explore",
};

export default async function ExplorePage({ searchParams }: PageProps) {
  const { city, sport, date } = await searchParams;

  const supabase = await createClient();

  let query = supabase
    .from("games")
    .select(
      "id, creator_id, sport, title, description, location_name, city, date_time, duration_minutes, max_players, current_players, skill_level, status, approval_status, is_recurring, created_at",
    )
    .eq("approval_status", "approved")
    .in("status", ["open", "full"])
    .gte("date_time", new Date().toISOString())
    .order("date_time", { ascending: true })
    .limit(50);

  if (city) query = query.eq("city", city);
  if (sport) query = query.eq("sport", sport);
  if (date) {
    const start = `${date}T00:00:00`;
    const end = `${date}T23:59:59`;
    query = query.gte("date_time", start).lte("date_time", end);
  }

  const { data } = await query;
  const games = (data ?? []) as Game[];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-black">Explore games</h1>
        <div className="text-sm text-text-muted">
          {games.length} {games.length === 1 ? "game" : "games"} found
        </div>
      </div>

      <FeedFilters action="/app" city={city} sport={sport} date={date} />

      {games.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-12 rounded-3xl bg-white p-14 text-center ring-1 ring-border/60">
      <div className="text-4xl">🏟️</div>
      <div className="mt-4 text-xl font-extrabold">No games match</div>
      <p className="mt-2 text-text-secondary">
        Try widening your filters — or create your own game on the mobile app.
      </p>
    </div>
  );
}
