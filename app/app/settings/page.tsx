import Link from "next/link";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10 sm:px-10">
      <h1 className="text-3xl font-black">Settings</h1>
      <p className="mt-2 text-text-secondary">
        Account settings on the web are limited for now — use the mobile app
        for profile, notifications and account deletion.
      </p>

      <div className="mt-8 rounded-3xl bg-white p-6 ring-1 ring-border/60">
        <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted">
          Coming soon on web
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-text-secondary">
          <li>• Edit profile (display name, city, favourite sports)</li>
          <li>• Change password (currently available via password reset)</li>
          <li>• Notification preferences</li>
          <li>• Download my data (POPIA)</li>
          <li>• Delete account</li>
        </ul>
      </div>

      <Link
        href="/app"
        className="mt-6 inline-block text-sm font-bold text-primary hover:text-primary-dark"
      >
        ← Back to Explore
      </Link>
    </div>
  );
}
