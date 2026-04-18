import Link from "next/link";
import { ChevronRight, Lock, Trash2, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Settings" };

export default async function SettingsHubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, city")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 sm:px-10">
      <h1 className="text-3xl font-black">Settings</h1>

      {/* User card */}
      <div className="mt-6 flex items-center gap-4 rounded-3xl bg-white p-5 ring-1 ring-border/60">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary text-xl font-black text-white">
          {(profile?.display_name ?? user.email ?? "?")[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="text-lg font-extrabold">
            {profile?.display_name ?? "Player"}
          </div>
          <div className="truncate text-sm text-text-muted">{user.email}</div>
          {profile?.city && (
            <div className="text-sm text-text-secondary">📍 {profile.city}</div>
          )}
        </div>
      </div>

      {/* Account */}
      <Section title="Account">
        <Row
          href="/app/settings/profile"
          icon={User}
          label="Edit profile"
          subtitle="Name, sports, city, skill level"
        />
        <Row
          href="/app/settings/password"
          icon={Lock}
          label="Change password"
          subtitle="Update your password"
        />
      </Section>

      {/* Danger zone */}
      <Section title="Danger zone">
        <Row
          href="/app/settings/delete"
          icon={Trash2}
          label="Delete account"
          subtitle="Permanently delete your account and data"
          danger
        />
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-text-muted">
        {title}
      </h2>
      <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-border/60">
        {children}
      </div>
    </section>
  );
}

function Row({
  href,
  icon: Icon,
  label,
  subtitle,
  danger,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  subtitle?: string;
  danger?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-b-0 hover:bg-off-white"
    >
      <div
        className={`flex size-10 items-center justify-center rounded-xl ${
          danger ? "bg-error/10 text-error" : "bg-off-white text-charcoal"
        }`}
      >
        <Icon className="size-5" aria-hidden />
      </div>
      <div className="flex-1">
        <div
          className={`font-extrabold ${danger ? "text-error" : "text-charcoal"}`}
        >
          {label}
        </div>
        {subtitle && (
          <div className="text-sm text-text-muted">{subtitle}</div>
        )}
      </div>
      <ChevronRight className="size-5 text-text-muted" aria-hidden />
    </Link>
  );
}
