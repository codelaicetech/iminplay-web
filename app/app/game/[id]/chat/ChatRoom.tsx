"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sendMessageAction } from "./actions";

export type InitialMessage = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile: { display_name: string | null; avatar_url: string | null } | null;
};

type Props = {
  gameId: string;
  currentUserId: string;
  initial: InitialMessage[];
};

export function ChatRoom({ gameId, currentUserId, initial }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<InitialMessage[]>(initial);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const listRef = useRef<HTMLDivElement>(null);
  // Profile cache so realtime inserts can show sender name without a roundtrip
  const profileCache = useRef<
    Map<string, InitialMessage["profile"]>
  >(new Map());

  // Seed the cache from initial messages.
  useEffect(() => {
    initial.forEach((m) => {
      if (m.profile) profileCache.current.set(m.user_id, m.profile);
    });
  }, [initial]);

  // Scroll to bottom on mount + whenever messages grow (but only if the
  // user was already near the bottom — avoids yanking them out of history).
  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom =
      el.scrollHeight - el.clientHeight - el.scrollTop < 120;
    if (nearBottom) scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // Realtime subscription for new inserts.
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `game_id=eq.${gameId}`,
        },
        async (payload) => {
          const row = payload.new as {
            id: string;
            user_id: string;
            content: string;
            created_at: string;
          };
          // Hydrate sender profile from cache or fetch once.
          let profile = profileCache.current.get(row.user_id) ?? null;
          if (!profile) {
            const { data } = await supabase
              .from("profiles")
              .select("display_name, avatar_url")
              .eq("id", row.user_id)
              .single();
            profile = data ?? null;
            if (profile) profileCache.current.set(row.user_id, profile);
          }

          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [...prev, { ...row, profile }];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, supabase]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || pending) return;
    const draft = text.trim();
    setText("");
    setError(null);

    startTransition(async () => {
      const res = await sendMessageAction(gameId, draft);
      if (!res.ok) {
        setError(res.error);
        // Restore draft so the user doesn't lose it
        setText(draft);
        return;
      }
      // Optimistic row: if the realtime payload beats us we'll dedup by id
      const optimistic: InitialMessage = {
        id: res.id,
        user_id: currentUserId,
        content: draft,
        created_at: new Date().toISOString(),
        profile: profileCache.current.get(currentUserId) ?? null,
      };
      setMessages((prev) =>
        prev.some((m) => m.id === optimistic.id) ? prev : [...prev, optimistic],
      );
    });
  }

  return (
    <>
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto border-x border-border bg-white px-4 py-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <div className="text-3xl">💬</div>
              <div className="mt-3 text-lg font-extrabold">No messages yet</div>
              <p className="mt-1 text-sm text-text-muted">
                Say hi to your teammates.
              </p>
            </div>
          </div>
        ) : (
          <MessageList messages={messages} currentUserId={currentUserId} />
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="flex items-end gap-2 rounded-b-3xl border border-t border-border bg-white p-3"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit(e);
            }
          }}
          placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
          rows={1}
          maxLength={2000}
          className="max-h-40 min-h-[2.75rem] flex-1 resize-none rounded-2xl border border-border bg-off-white px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={pending || !text.trim()}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-transform active:scale-95 hover:bg-primary-dark disabled:opacity-40"
          aria-label="Send message"
        >
          <Send className="size-5" aria-hidden />
        </button>
      </form>

      {error && (
        <div className="mt-2 rounded-xl bg-error/10 px-4 py-2 text-sm font-semibold text-error">
          {error}
        </div>
      )}
    </>
  );
}

// ── Message list ─────────────────────────────────────────────────────────
function MessageList({
  messages,
  currentUserId,
}: {
  messages: InitialMessage[];
  currentUserId: string;
}) {
  return (
    <ul className="space-y-3">
      {messages.map((m, i) => {
        const mine = m.user_id === currentUserId;
        const prev = messages[i - 1];
        // Group bubbles: hide avatar+name if same sender as previous message
        // within 5 minutes.
        const grouped =
          prev &&
          prev.user_id === m.user_id &&
          new Date(m.created_at).getTime() -
            new Date(prev.created_at).getTime() <
            5 * 60_000;

        return (
          <li key={m.id} className={mine ? "flex justify-end" : ""}>
            <div className={`flex max-w-[80%] gap-2 ${mine ? "flex-row-reverse" : ""}`}>
              {!mine && (
                <div className="w-8 shrink-0">
                  {!grouped && (
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary/20 text-xs font-extrabold text-primary">
                      {(m.profile?.display_name ?? "?")[0].toUpperCase()}
                    </div>
                  )}
                </div>
              )}
              <div>
                {!grouped && !mine && (
                  <div className="mb-1 text-xs font-extrabold text-charcoal">
                    {m.profile?.display_name ?? "Player"}
                  </div>
                )}
                <div
                  className={`whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-snug ${
                    mine
                      ? "bg-primary text-white"
                      : "bg-off-white text-charcoal"
                  }`}
                >
                  {m.content}
                </div>
                <div
                  className={`mt-1 text-[10px] ${
                    mine ? "text-right text-text-muted" : "text-text-muted"
                  }`}
                >
                  {new Date(m.created_at).toLocaleTimeString("en-ZA", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
