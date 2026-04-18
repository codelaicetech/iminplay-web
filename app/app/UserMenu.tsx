"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { signOutAction } from "../auth/actions";

type Props = {
  displayName: string;
  email: string;
  avatarUrl: string | null;
};

export function UserMenu({ displayName, email, avatarUrl }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const initial = (displayName || email || "?")[0].toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full bg-off-white px-2 py-1.5 pl-1.5 hover:bg-border/60"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-white">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="size-8 rounded-full object-cover"
            />
          ) : (
            initial
          )}
        </span>
        <span className="hidden text-sm font-bold text-charcoal sm:inline">
          {displayName}
        </span>
        <ChevronDown className="size-4 text-text-muted" aria-hidden />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-border bg-white p-2 shadow-lg">
          <div className="border-b border-border px-3 py-2">
            <div className="text-sm font-extrabold text-charcoal">
              {displayName}
            </div>
            <div className="truncate text-xs text-text-muted">{email}</div>
          </div>
          <MenuLink href="/app/profile" icon={User}>
            My profile
          </MenuLink>
          <MenuLink href="/app/settings" icon={Settings}>
            Settings
          </MenuLink>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold text-error hover:bg-error/10"
            >
              <LogOut className="size-4" aria-hidden />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-charcoal hover:bg-off-white"
    >
      <Icon className="size-4 text-text-muted" aria-hidden />
      {children}
    </Link>
  );
}
