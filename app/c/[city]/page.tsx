import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugToCity, SPORTS } from "@/lib/constants";
import type { Game } from "@/lib/types";
import { Wordmark } from "@/components/Wordmark";
import { GameCard } from "@/components/GameCard";
import { AppStoreButtons } from "@/components/AppStoreButtons";

type PageProps = {
  params: Promise<{ city: string }>;
  searchParams: Promise<{ sport?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { city: slug } = await params;
  const city = slugToCity(slug);
  if (!city) return { title: "City not found" };
  return {
    title: `Pickup sport in ${city}`,
    description: `Find football, padel, tennis and more pickup games happening in ${city} this week on IminPlay.`,
    openGraph: {
      title: `Pickup sport in ${city}`,
      description: `Local games happening this week`,
      url: `https://iminplay.com/c/${slug}`,
    },
  };
}

export default async function CityPage({ params, searchParams }: PageProps) {
  const { city: slug } = await params;
  const { sport } = await searchParams;
  const city = slugToCity(slug);
  if (!city) notFound();

  const supabase = await createClient();

  let q = supabase
    .from("games")
    .select(
      "id, creator_id, sport, title, description, location_name, city, date_time, duration_minutes, max_players, current_players, skill_level, status, approval_status, is_recurring, created_at",
    )
    .eq("approval_status", "approved")
    .in("status", ["open", "full"])
    .eq("city", city)
    .gte("date_time", new Date().toISOString())
    .order("date_time", { ascending: true })
    .limit(60);

  if (sport) q = q.eq("sport", sport);

  const { data } = await q;
  const games = (data ?? []) as Game[];

  return (
    <div className="flex min-h-screen flex-col bg-off-white">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
          <Wordmark size="sm" asLink />
          <Link
            href="/"
            className="text-sm font-bold text-text-muted hover:text-charcoal"
          >
            ← Home
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 sm:px-10">
        <div className="mb-1 text-sm font-bold uppercase tracking-wider text-primary">
          Pickup sport
        </div>
        <h1 className="text-4xl font-black sm:text-5xl">{city}</h1>
        <p className="mt-3 max-w-2xl text-text-secondary">
          {games.length} upcoming {games.length === 1 ? "game" : "games"} in{" "}
          {city}. Tap one to see details, or download the app to join.
        </p>

        {/* Sport chip filter (URL-driven) */}
        <div className="mt-6 flex flex-wrap gap-2">
          <FilterChip href={`/c/${slug}`} active={!sport}>
            All sports
          </FilterChip>
          {SPORTS.map((s) => (
            <FilterChip
              key={s.id}
              href={`/c/${slug}?sport=${s.id}`}
              active={sport === s.id}
            >
              <span>{s.emoji}</span> {s.name}
            </FilterChip>
          ))}
        </div>

        {games.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-white p-14 text-center ring-1 ring-border/60">
            <div className="text-4xl">🏟️</div>
            <div className="mt-4 text-xl font-extrabold">
              No games yet in {city}
            </div>
            <p className="mt-2 text-text-secondary">
              Be the first to host one — download the app and create a game.
            </p>
            <div className="mt-6 flex justify-center">
              <AppStoreButtons size="sm" />
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((g) => (
              <GameCard key={g.id} game={g} href={`/game/${g.id}`} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ring-1 transition ${
        active
          ? "bg-charcoal text-white ring-charcoal"
          : "bg-white text-charcoal ring-border hover:ring-charcoal"
      }`}
    >
      {children}
    </Link>
  );
}
