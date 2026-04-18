import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Wordmark } from "@/components/Wordmark";
import { UserMenu } from "./UserMenu";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware guarantees user is signed in on /app/*, but double-check.
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .single();

  const { data: adminRow } = await supabase
    .from("admins")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const isAdmin = !!adminRow;
  const displayName = profile?.display_name ?? user.email ?? "Player";

  return (
    <div className="flex min-h-screen flex-col bg-off-white">
      <header className="sticky top-0 z-20 border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 sm:px-10">
          <div className="flex items-center gap-8">
            <Wordmark size="sm" asLink />
            <nav className="hidden items-center gap-6 sm:flex">
              <Link
                href="/app"
                className="text-sm font-bold text-charcoal hover:text-primary"
              >
                Explore
              </Link>
              <Link
                href="/app/my-games"
                className="text-sm font-bold text-charcoal hover:text-primary"
              >
                My games
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary hover:bg-primary/15"
                >
                  🛡️ Admin
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/app/game/new"
              className="hidden rounded-full bg-primary px-4 py-2 text-sm font-extrabold text-white transition-transform active:scale-95 hover:bg-primary-dark sm:inline-flex"
            >
              + New game
            </Link>
            <UserMenu
              displayName={displayName}
              email={user.email ?? ""}
              avatarUrl={profile?.avatar_url ?? null}
            />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-xs text-text-muted sm:px-10">
          <span>
            © {new Date().getFullYear()} CODELAICE TECHNOLOGY (Pty) Ltd ·
            IminPlay
          </span>
          <nav className="flex flex-wrap items-center gap-4">
            <Link href="/privacy" className="hover:text-charcoal">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-charcoal">
              Terms
            </Link>
            <a
              href="mailto:hello@iminplay.com"
              className="hover:text-charcoal"
            >
              Support
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
