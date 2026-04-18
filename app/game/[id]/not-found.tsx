import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";

export default function GameNotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <Wordmark size="md" asLink />
      <h1 className="mt-10 text-3xl font-black sm:text-4xl">Game not found</h1>
      <p className="mt-3 max-w-md text-text-secondary">
        This game may have been cancelled, rejected, or the link is wrong.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-primary px-5 py-2 font-bold text-white hover:bg-primary-dark"
      >
        Back to home
      </Link>
    </main>
  );
}
