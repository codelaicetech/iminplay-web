import { createClient } from "@/lib/supabase/server";
import type { Game, Profile } from "@/lib/types";
import { PendingQueue } from "./PendingQueue";

export const metadata = { title: "Pending games" };

type RawPendingGame = Game & {
  creator:
    | Pick<Profile, "display_name" | "avatar_url" | "rating_avg">
    | Pick<Profile, "display_name" | "avatar_url" | "rating_avg">[]
    | null;
};

export default async function PendingGamesPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("games")
    .select(
      "*, creator:profiles!games_creator_id_fkey(display_name, avatar_url, rating_avg)",
    )
    .eq("approval_status", "pending")
    .order("created_at", { ascending: true })
    .limit(100);

  const games = ((data ?? []) as RawPendingGame[]).map((g) => ({
    ...g,
    creator: Array.isArray(g.creator) ? (g.creator[0] ?? null) : g.creator,
  }));

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-3xl font-black">Pending games</h1>
        <div className="text-sm text-text-muted">
          {games.length} waiting
        </div>
      </div>
      <p className="mt-2 text-text-secondary">
        Oldest first. Use <Kbd>A</Kbd> to approve, <Kbd>R</Kbd> to reject,{" "}
        <Kbd>J</Kbd>/<Kbd>K</Kbd> to navigate.
      </p>

      {games.length === 0 ? (
        <div className="mt-10 rounded-3xl bg-white p-14 text-center ring-1 ring-border/60">
          <div className="text-4xl">🎉</div>
          <div className="mt-4 text-xl font-extrabold">All caught up</div>
          <p className="mt-2 text-text-secondary">
            No games waiting for review.
          </p>
        </div>
      ) : (
        <PendingQueue games={games} />
      )}
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="mx-0.5 rounded-md border border-border bg-off-white px-1.5 py-0.5 font-mono text-xs font-bold text-charcoal">
      {children}
    </kbd>
  );
}
