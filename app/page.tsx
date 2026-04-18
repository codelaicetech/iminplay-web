import Link from "next/link";
import { Compass, MessageCircle, MapPin, Users } from "lucide-react";
import { Wordmark } from "@/components/Wordmark";
import { AppStoreButtons } from "@/components/AppStoreButtons";

export default function HomePage() {
  return (
    <main className="flex-1">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Wordmark size="md" asLink />
        <Link
          href="/install"
          className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-white transition-transform active:scale-95 hover:bg-primary-dark"
        >
          Get the app
        </Link>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-20 pt-10 sm:px-10 sm:pt-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <span className="inline-block rounded-full bg-primary-light px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              Coming Q2 2026 · Cape Town
            </span>
            <h1 className="font-black leading-tight text-5xl sm:text-6xl lg:text-7xl">
              <span className="block text-charcoal">Find your game.</span>
              <span className="block text-primary">Meet your people.</span>
            </h1>
            <p className="max-w-xl text-lg text-text-secondary leading-relaxed">
              The community-first app for pickup sport in South Africa.
              Discover local games, join with one tap, and chat with your team
              across football, padel, tennis, basketball and more.
            </p>
            <AppStoreButtons />
          </div>

          {/* Decorative card stack */}
          <div aria-hidden className="relative hidden h-96 lg:block">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary to-primary-dark opacity-90" />
            <div className="absolute inset-x-10 inset-y-8 rounded-3xl bg-white shadow-2xl">
              <div className="flex items-start gap-3 p-6">
                <div className="flex size-12 items-center justify-center rounded-xl bg-off-white text-2xl">
                  ⚽
                </div>
                <div>
                  <div className="font-extrabold">Morning Road Ride</div>
                  <div className="mt-1 text-sm text-text-muted">
                    Sea Point · Tomorrow 06:30
                  </div>
                </div>
              </div>
              <div className="mx-6 h-px bg-border" />
              <div className="flex items-start gap-3 p-6">
                <div className="flex size-12 items-center justify-center rounded-xl bg-off-white text-2xl">
                  🏀
                </div>
                <div>
                  <div className="font-extrabold">Lunchtime Hoops</div>
                  <div className="mt-1 text-sm text-text-muted">
                    Green Point · Today 12:00
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-off-white px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-black sm:text-4xl">
            From discovery to kick-off in under 30 seconds
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {[
              {
                icon: Compass,
                title: "Discover",
                body: "Filter games by city, sport and date. See what's happening near you today.",
              },
              {
                icon: Users,
                title: "Join",
                body: "Tap I'm In. Your seat is reserved. Get a reminder 1h before kick-off.",
              },
              {
                icon: MessageCircle,
                title: "Chat",
                body: "Real-time group chat per game. Share logistics, trash-talk, car-pool.",
              },
              {
                icon: MapPin,
                title: "Play",
                body: "Show up. Rate your teammates. Book the next one.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-border/60"
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary-light text-primary">
                  <Icon className="size-6" aria-hidden />
                </div>
                <div className="text-lg font-extrabold">{title}</div>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-4xl rounded-3xl bg-charcoal px-8 py-14 text-center text-white sm:px-14">
          <h2 className="text-3xl font-black sm:text-4xl">
            For the love of the game.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
            Every sport. Every level. Built in Cape Town, made for Africa.
          </p>
          <div className="mt-8 flex justify-center">
            <AppStoreButtons />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border px-6 py-10 text-sm text-text-muted sm:px-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <Wordmark size="sm" />
          <nav className="flex flex-wrap gap-6">
            <Link href="/privacy" className="hover:text-charcoal">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-charcoal">
              Terms
            </Link>
            <a href="mailto:hello@iminplay.com" className="hover:text-charcoal">
              hello@iminplay.com
            </a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
