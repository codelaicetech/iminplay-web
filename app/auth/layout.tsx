import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-off-white">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Wordmark size="md" asLink />
        <Link
          href="/"
          className="text-sm font-bold text-text-muted hover:text-charcoal"
        >
          ← Home
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="px-6 py-6 text-xs text-text-muted sm:px-10">
        <div className="mx-auto flex max-w-md flex-wrap items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} IminPlay</span>
          <nav className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-charcoal">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-charcoal">
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
