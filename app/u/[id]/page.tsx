import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sportLabel } from "@/lib/types";
import { Wordmark } from "@/components/Wordmark";
import { GameCard } from "@/components/GameCard";
import { PrimaryCta } from "@/components/PrimaryCta";
import { ReportButton } from "@/components/ReportButton";

type PageProps = { params: Promise<{ id: string }> };

function isUuid(s: string): boolean {
  return /^[0-9a-f-]{36}$/i.test(s);
}

async function loadProfile(id: string) {
  if (!isUuid(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select(
      "id, display_name, avatar_url, city, favourite_sports, skill_level, rating_avg, games_played, is_pro",
    )
    .eq("id", id)
    .single();
  return data;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const p = await loadProfile(id);
  if (!p) return { title: "Player not found" };

  const name = p.display_name ?? "Player";
  const sports = (p.favourite_sports ?? [])
    .slice(0, 3)
    .map((s: string) => sportLabel(s).name)
    .join(", ");
  return {
    title: name,
    description: `${name} plays ${sports || "pickup sport"} on IminPlay${p.city ? ` in ${p.city}` : ""}.`,
    openGraph: {
      title: `${name} · IminPlay`,
      description: `${sports || "Pickup sport"}${p.city ? " · " + p.city : ""}`,
      url: `https://iminplay.com/u/${id}`,
    },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { id } = await params;
  const profile = await loadProfile(id);
  if (!profile) notFound();

  const supabase = await createClient();
  const {
    data: { user: viewer },
  } = await supabase.auth.getUser();
  const canReport = !!viewer && viewer.id !== id;

  // Upcoming approved games this user is hosting
  const { data: hostedData } = await supabase
    .from("games")
    .select(
      "id, creator_id, sport, title, description, location_name, city, date_time, duration_minutes, max_players, current_players, skill_level, status, approval_status, is_recurring, created_at",
    )
    .eq("creator_id", id)
    .eq("approval_status", "approved")
    .gte("date_time", new Date().toISOString())
    .order("date_time", { ascending: true })
    .limit(6);
  const hosted = hostedData ?? [];

  const initial = (profile.display_name ?? "?")[0].toUpperCase();
  const rating = profile.rating_avg ?? 0;

  return (
    <div className="flex min-h-screen flex-col bg-off-white">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4 sm:px-10">
          <Wordmark size="sm" asLink />
          <Link
            href="/"
            className="text-sm font-bold text-text-muted hover:text-charcoal"
          >
            ← Home
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10 sm:px-10">
        {/* Hero */}
        <div className="flex flex-col items-start gap-6 rounded-3xl bg-white p-8 ring-1 ring-border/60 sm:flex-row sm:items-center">
          <div className="flex size-24 items-center justify-center rounded-full bg-primary text-4xl font-black text-white">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt=""
                className="size-24 rounded-full object-cover"
              />
            ) : (
              initial
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-black">
              {profile.display_name ?? "Player"}
              {profile.is_pro && (
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 align-middle text-xs font-extrabold text-primary">
                  PRO
                </span>
              )}
            </h1>
            <p className="mt-1 text-text-secondary">
              {profile.city ?? "South Africa"}
              {profile.skill_level !== "any" && (
                <>
                  {" · "}
                  <span className="capitalize">{profile.skill_level}</span>
                </>
              )}
            </p>

            <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold">
              <Stat label="Games played" value={profile.games_played ?? 0} />
              <Stat
                label="Rating"
                value={rating > 0 ? `⭐ ${rating.toFixed(1)}` : "—"}
              />
            </div>
          </div>
        </div>

        {/* Favourite sports */}
        {(profile.favourite_sports ?? []).length > 0 && (
          <section className="mt-8">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Plays
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {(profile.favourite_sports ?? []).map((s: string) => {
                const lbl = sportLabel(s);
                return (
                  <span
                    key={s}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-bold ring-1 ring-border/60"
                  >
                    <span>{lbl.emoji}</span> {lbl.name}
                  </span>
                );
              })}
            </div>
          </section>
        )}

        {/* Upcoming hosted games */}
        <section className="mt-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Upcoming games hosted
          </h2>
          {hosted.length === 0 ? (
            <p className="mt-3 rounded-2xl bg-white p-8 text-center text-text-muted ring-1 ring-border/60">
              No upcoming games hosted.
            </p>
          ) : (
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {hosted.map((g: any) => (
                <GameCard key={g.id} game={g} href={`/game/${g.id}`} />
              ))}
            </div>
          )}
        </section>

        {canReport && (
          <div className="mt-8 flex justify-end">
            <ReportButton
              targetType="user"
              targetId={id}
              targetLabel={profile.display_name ?? "this player"}
              variant="chip"
            />
          </div>
        )}

        {/* Play CTA */}
        <section className="mt-12 rounded-3xl bg-charcoal p-8 text-white">
          <h2 className="text-2xl font-black">Play with {profile.display_name?.split(" ")[0] ?? "them"}</h2>
          <p className="mt-2 text-white/70">
            Sign up free to join their games.
          </p>
          <div className="mt-4">
            <PrimaryCta size="sm" variant="onDark" />
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-lg font-black text-charcoal">{value}</div>
      <div className="text-xs font-bold uppercase tracking-wider text-text-muted">
        {label}
      </div>
    </div>
  );
}
