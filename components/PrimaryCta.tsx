import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

type Props = {
  size?: "sm" | "md";
  /** Show the secondary "Host a game" button next to the main CTA. */
  secondary?: boolean;
  /** Force the charcoal variant for use on light backgrounds. */
  variant?: "primary" | "onDark";
  className?: string;
};

/**
 * The web-first call-to-action pair shown across marketing pages.
 * The first launch is the web app, not mobile — so every CTA that
 * used to push App Store / Play Store installs now points people
 * straight into the product.
 */
export function PrimaryCta({
  size = "md",
  secondary = true,
  variant = "primary",
  className,
}: Props) {
  const base =
    "inline-flex items-center gap-2 rounded-full font-extrabold transition-transform active:scale-95";
  const sizeClass =
    size === "sm" ? "px-4 py-2 text-sm" : "px-6 py-3 text-base";

  const primaryClass =
    variant === "onDark"
      ? "bg-white text-charcoal hover:bg-off-white"
      : "bg-primary text-white hover:bg-primary-dark";

  const secondaryClass =
    variant === "onDark"
      ? "border border-white/20 bg-transparent text-white hover:bg-white/10"
      : "border border-charcoal/15 bg-white text-charcoal hover:bg-off-white";

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className ?? ""}`}>
      <Link href="/auth/sign-up" className={`${base} ${sizeClass} ${primaryClass}`}>
        Play now
        <ArrowRight className="size-4" aria-hidden />
      </Link>
      {secondary && (
        <Link
          href="/app/game/new"
          className={`${base} ${sizeClass} ${secondaryClass}`}
        >
          <Plus className="size-4" aria-hidden />
          Host a game
        </Link>
      )}
    </div>
  );
}
