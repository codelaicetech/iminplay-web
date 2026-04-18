import Link from "next/link";
import { Apple, Smartphone } from "lucide-react";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.iminplay.app";
const APP_STORE_URL = "https://apps.apple.com/app/iminplay/id0000000000"; // TODO: update after launch

type Props = {
  size?: "sm" | "md";
};

/**
 * Pair of Get-It-On buttons. Both links are intentionally hardcoded;
 * when the app goes live on the stores we update the URLs here and
 * everywhere else these buttons render.
 */
export function AppStoreButtons({ size = "md" }: Props) {
  const base =
    "inline-flex items-center gap-2 rounded-full font-bold transition-transform active:scale-95";
  const sizeClass =
    size === "sm" ? "px-4 py-2 text-sm" : "px-6 py-3 text-base";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href={PLAY_STORE_URL}
        className={`${base} ${sizeClass} bg-charcoal text-white hover:bg-charcoal/90`}
      >
        <Smartphone className="size-5" aria-hidden />
        <span>Get it on Play</span>
      </Link>
      <Link
        href={APP_STORE_URL}
        className={`${base} ${sizeClass} border border-charcoal/15 bg-white text-charcoal hover:bg-off-white`}
      >
        <Apple className="size-5" aria-hidden />
        <span>Coming to iOS</span>
      </Link>
    </div>
  );
}
