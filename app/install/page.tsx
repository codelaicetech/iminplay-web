import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { AppStoreButtons } from "@/components/AppStoreButtons";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.iminplay.app";
const APP_STORE_URL = "https://apps.apple.com/app/iminplay/id0000000000";

/**
 * /install is a one-stop smart redirect: on Android we send the user
 * straight to Play Store, on iOS to App Store. Desktop and everything
 * else lands on a page with both buttons.
 */
export default async function InstallPage() {
  const headersList = await headers();
  const ua = (headersList.get("user-agent") ?? "").toLowerCase();

  if (/android/.test(ua)) redirect(PLAY_STORE_URL);
  if (/iphone|ipad|ipod/.test(ua)) redirect(APP_STORE_URL);

  return (
    <main className="flex-1">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Wordmark size="md" asLink />
        <Link
          href="/"
          className="text-sm font-bold text-text-muted hover:text-charcoal"
        >
          ← Home
        </Link>
      </header>
      <section className="mx-auto max-w-xl px-6 py-24 text-center sm:px-10">
        <h1 className="text-4xl font-black sm:text-5xl">Get IminPlay</h1>
        <p className="mt-4 text-lg text-text-secondary">
          Open this page on your phone, or tap the button for your device.
        </p>
        <div className="mt-10 flex justify-center">
          <AppStoreButtons />
        </div>
      </section>
    </main>
  );
}
