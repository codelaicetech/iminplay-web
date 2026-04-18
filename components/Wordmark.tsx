import Link from "next/link";

type Props = {
  size?: "sm" | "md" | "lg" | "xl";
  asLink?: boolean;
};

const SIZE_CLASS: Record<NonNullable<Props["size"]>, string> = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-4xl",
  xl: "text-6xl sm:text-7xl",
};

/**
 * "iminplay" wordmark — "imin" in charcoal + "play" in brand orange.
 * Matches the mobile logo rendered in _layout / login screens.
 */
export function Wordmark({ size = "md", asLink = false }: Props) {
  const className = `${SIZE_CLASS[size]} font-black tracking-tight`;
  const content = (
    <span className={className}>
      <span className="text-charcoal">imin</span>
      <span className="text-primary">play</span>
    </span>
  );
  if (asLink) {
    return (
      <Link href="/" aria-label="IminPlay home" className="inline-block">
        {content}
      </Link>
    );
  }
  return content;
}
