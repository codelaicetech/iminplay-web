import Link from "next/link";
import { redirect } from "next/navigation";
import { Flag, Gauge, Users, LogOut, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Wordmark } from "@/components/Wordmark";
import { signOutAction } from "../auth/actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?redirect=/admin");

  const { data: admin } = await supabase
    .from("admins")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) redirect("/app"); // Not an admin → send them home
  const isSuperadmin = admin.role === "superadmin";

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen flex-col bg-off-white">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3 sm:px-10">
          <div className="flex items-center gap-6">
            <Wordmark size="sm" asLink />
            <span className="hidden items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-primary sm:inline-flex">
              <Shield className="size-3" aria-hidden />
              {admin.role}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/app"
              className="font-bold text-text-muted hover:text-charcoal"
            >
              ← Back to app
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-bold text-text-secondary hover:bg-off-white hover:text-error"
              >
                <LogOut className="size-4" aria-hidden />
                Sign out
              </button>
            </form>
          </div>
        </div>

        {/* Sub-nav */}
        <nav className="mx-auto flex max-w-6xl gap-1 px-6 pb-1 sm:px-10">
          <NavTab href="/admin" icon={Gauge}>
            Dashboard
          </NavTab>
          <NavTab href="/admin/pending-games" icon={Users}>
            Pending games
          </NavTab>
          <NavTab href="/admin/reports" icon={Flag}>
            Reports
          </NavTab>
          {isSuperadmin && (
            <NavTab href="/admin/admins" icon={Shield}>
              Admins
            </NavTab>
          )}
        </nav>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10">
          <p className="mb-4 text-xs text-text-muted">
            Signed in as{" "}
            <span className="font-extrabold text-charcoal">
              {profile?.display_name ?? user.email}
            </span>
          </p>
          {children}
        </div>
      </main>
    </div>
  );
}

function NavTab({
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
      className="group inline-flex items-center gap-1.5 border-b-2 border-transparent px-3 py-2 text-sm font-bold text-text-secondary transition hover:border-primary/40 hover:text-charcoal"
    >
      <Icon className="size-4" aria-hidden />
      {children}
    </Link>
  );
}
