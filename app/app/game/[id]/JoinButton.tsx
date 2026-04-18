"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, LogOut, UserPlus } from "lucide-react";
import { joinGameAction, leaveGameAction } from "./actions";

type Props = {
  gameId: string;
  isParticipant: boolean;
  isFull: boolean;
  isCreator: boolean;
};

export function JoinButton({ gameId, isParticipant, isFull, isCreator }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (isCreator) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-off-white px-4 py-2 text-sm font-bold text-text-secondary">
        <Check className="size-4" aria-hidden /> You're the host
      </div>
    );
  }

  function run(act: "join" | "leave") {
    setError(null);
    startTransition(async () => {
      const fn = act === "join" ? joinGameAction : leaveGameAction;
      const res = await fn(gameId);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  if (isParticipant) {
    return (
      <div className="space-y-2">
        <button
          onClick={() => run("leave")}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-error/10 px-5 py-2.5 text-sm font-extrabold text-error hover:bg-error/15 disabled:opacity-60"
        >
          <LogOut className="size-4" aria-hidden />
          {pending ? "Leaving…" : "Leave game"}
        </button>
        {error && <p className="text-sm font-semibold text-error">{error}</p>}
      </div>
    );
  }

  if (isFull) {
    return (
      <div className="rounded-full bg-off-white px-4 py-2 text-sm font-bold text-text-muted">
        Game is full
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => run("join")}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-extrabold text-white transition-transform active:scale-95 hover:bg-primary-dark disabled:opacity-60"
      >
        <UserPlus className="size-5" aria-hidden />
        {pending ? "Joining…" : "I'm in"}
      </button>
      {error && <p className="text-sm font-semibold text-error">{error}</p>}
    </div>
  );
}
