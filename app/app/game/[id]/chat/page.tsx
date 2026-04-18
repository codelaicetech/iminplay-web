import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { sportLabel } from "@/lib/types";
import { ChatRoom, type InitialMessage } from "./ChatRoom";

type PageProps = { params: Promise<{ id: string }> };

export default async function GameChatPage({ params }: PageProps) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  // Game metadata + access check happens via RLS; if we get null the
  // user either isn't a participant or the game doesn't exist.
  const { data: game } = await supabase
    .from("games")
    .select("id, title, sport")
    .eq("id", id)
    .single();
  if (!game) notFound();

  // Is the viewer a confirmed participant (or the creator)?
  const { data: part } = await supabase
    .from("game_participants")
    .select("user_id, status")
    .eq("game_id", id)
    .eq("user_id", user.id)
    .eq("status", "confirmed")
    .maybeSingle();

  const { data: gameCreator } = await supabase
    .from("games")
    .select("creator_id")
    .eq("id", id)
    .single();

  const canChat = !!part || gameCreator?.creator_id === user.id;

  if (!canChat) {
    return (
      <div className="mx-auto max-w-xl px-6 py-14 text-center">
        <h1 className="text-2xl font-black">Join to chat</h1>
        <p className="mt-3 text-text-secondary">
          Only confirmed players can read or write in this game's chat.
        </p>
        <Link
          href={`/app/game/${id}`}
          className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 font-extrabold text-white hover:bg-primary-dark"
        >
          Back to game
        </Link>
      </div>
    );
  }

  // Initial message window — newest 50, rendered oldest→newest below.
  const { data: rawMessages } = await supabase
    .from("messages")
    .select(
      "id, user_id, content, created_at, profile:profiles!messages_user_id_fkey(display_name, avatar_url)",
    )
    .eq("game_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  type RawRow = {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    profile:
      | { display_name: string | null; avatar_url: string | null }
      | { display_name: string | null; avatar_url: string | null }[]
      | null;
  };

  const initial: InitialMessage[] = ((rawMessages ?? []) as RawRow[])
    .map((m) => ({
      id: m.id,
      user_id: m.user_id,
      content: m.content,
      created_at: m.created_at,
      profile: Array.isArray(m.profile)
        ? (m.profile[0] ?? null)
        : m.profile,
    }))
    .reverse();

  const sport = sportLabel(game.sport);

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col px-6 sm:px-10">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between pb-3 pt-2">
        <Link
          href={`/app/game/${id}`}
          className="inline-flex items-center gap-1 text-sm font-bold text-text-muted hover:text-charcoal"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Game details
        </Link>
        <Link
          href={`/app/game/${id}`}
          className="inline-flex items-center gap-1 text-sm font-bold text-text-muted hover:text-charcoal"
        >
          <Info className="size-4" aria-hidden /> Details
        </Link>
      </div>

      {/* Heading */}
      <header className="flex items-center gap-3 rounded-t-3xl border border-b-0 border-border bg-white p-4">
        <div className="flex size-10 items-center justify-center rounded-xl bg-off-white text-xl">
          {sport.emoji}
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Game chat
          </div>
          <div className="text-base font-extrabold">{game.title}</div>
        </div>
      </header>

      {/* Realtime room */}
      <ChatRoom
        gameId={id}
        currentUserId={user.id}
        initial={initial}
      />
    </div>
  );
}
