import { redirect } from "next/navigation";

export const metadata = {
  title: "Install",
  robots: { index: false, follow: false },
};

/**
 * Placeholder until the mobile apps ship. For now /install just
 * bounces people back to the home page — we don't want visitors
 * landing on dead App Store / Play Store links.
 *
 * When Android/iOS apps are live again, restore the original
 * User-Agent sniffing redirect + store buttons from git history.
 */
export default function InstallPage() {
  redirect("/");
}
