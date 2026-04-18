import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  Compass,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { Wordmark } from "@/components/Wordmark";
import { PrimaryCta } from "@/components/PrimaryCta";
import { CITIES, SPORTS, cityToSlug } from "@/lib/constants";

export default function HomePage() {
  return (
    <main className="flex-1">
      {/* ──────────────────────────────────────────────────────────
       * STICKY NAV
       * ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3 sm:px-10">
          <div className="flex items-center gap-8">
            <Wordmark size="md" asLink />
            <nav className="hidden items-center gap-6 text-sm font-bold text-text-secondary lg:flex">
              <a href="#games" className="hover:text-charcoal">
                Games
              </a>
              <a href="#sports" className="hover:text-charcoal">
                Sports
              </a>
              <a href="#cities" className="hover:text-charcoal">
                Cities
              </a>
              <a href="#how" className="hover:text-charcoal">
                How it works
              </a>
              <a href="#community" className="hover:text-charcoal">
                Community
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/auth/sign-in"
              className="hidden rounded-full px-4 py-2 text-sm font-bold text-charcoal hover:bg-off-white sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-extrabold text-white transition-transform active:scale-95 hover:bg-primary-dark sm:px-5"
            >
              Play now
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────
       * HERO
       * ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pb-24 pt-12 sm:px-10 sm:pt-20">
        {/* Decorative gradient blob */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-24 size-[30rem] rounded-full bg-gradient-to-br from-primary/30 via-primary/10 to-transparent blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-40 size-[24rem] rounded-full bg-gradient-to-br from-primary-light to-transparent blur-3xl"
        />

        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div className="space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-primary">
              <Sparkles className="size-3.5" aria-hidden />
              Early access · Cape Town
            </span>

            <h1 className="font-black leading-[1.02] text-5xl tracking-tight sm:text-6xl lg:text-7xl">
              <span className="block text-charcoal">Play. Connect.</span>
              <span className="block">
                <span className="text-primary">Thrive.</span>
              </span>
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-text-secondary">
              The community-first app for pickup sport in South Africa.
              Discover local games, join with one tap, and chat with your team
              across football, padel, tennis, basketball and more.
            </p>

            {/* Search bar — city + sport chips that link to feed */}
            <div className="rounded-2xl bg-white p-2 shadow-lg ring-1 ring-border/60 sm:rounded-full">
              <form
                action="/app"
                method="get"
                className="flex flex-col gap-2 sm:flex-row sm:items-center"
              >
                <div className="flex flex-1 items-center gap-3 rounded-full px-4 py-3">
                  <MapPin className="size-5 text-primary" aria-hidden />
                  <select
                    name="city"
                    defaultValue=""
                    className="w-full bg-transparent text-sm font-bold text-charcoal outline-none"
                    aria-label="City"
                  >
                    <option value="">All cities</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="hidden h-8 w-px bg-border sm:block" />
                <div className="flex flex-1 items-center gap-3 rounded-full px-4 py-3">
                  <Zap className="size-5 text-primary" aria-hidden />
                  <select
                    name="sport"
                    defaultValue=""
                    className="w-full bg-transparent text-sm font-bold text-charcoal outline-none"
                    aria-label="Sport"
                  >
                    <option value="">Any sport</option>
                    {SPORTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.emoji} {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-extrabold text-white transition-transform active:scale-95 hover:bg-primary-dark"
                >
                  <Search className="size-4" aria-hidden />
                  Find games
                </button>
              </form>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <PrimaryCta />
              <p className="text-xs text-text-muted">
                Free during beta.
              </p>
            </div>
          </div>

          {/* Hero visual: stacked game cards */}
          <div className="relative hidden h-[32rem] lg:block">
            <div
              aria-hidden
              className="absolute inset-6 rounded-[2.5rem] bg-gradient-to-br from-primary to-primary-dark shadow-2xl"
            />
            <HeroCard
              emoji="⚽"
              title="Sunday 5-a-side"
              meta="Sea Point · Sun 09:00 · 3 spots"
              rating="⭐ 4.8"
              className="absolute left-0 top-6 w-[82%] rotate-[-3deg]"
            />
            <HeroCard
              emoji="🎾"
              title="Padel @ Virgin Active"
              meta="V&A Waterfront · Sat 18:00 · Full"
              rating="⭐ 4.9"
              badge="HOT"
              className="absolute right-0 top-40 w-[80%] rotate-[4deg]"
            />
            <HeroCard
              emoji="🏀"
              title="Lunchtime Hoops"
              meta="Green Point · Today 12:00 · 2 spots"
              rating="⭐ 4.7"
              className="absolute bottom-4 left-8 w-[76%] rotate-[-2deg]"
            />
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
       * STATS BAND
       * ──────────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-charcoal text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:grid-cols-3 sm:px-10">
          <Stat value="10" unit="sports" label="from football to padel" />
          <Stat value="1" unit="city" label="starting in Cape Town" />
          <Stat value="Free" unit="" label="during beta" />
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
       * SPORTS GRID
       * ──────────────────────────────────────────────────────── */}
      <section id="sports" className="px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Pick your game
              </span>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                10 sports. One app.
              </h2>
              <p className="mt-2 max-w-xl text-text-secondary">
                Whether it&apos;s a casual kickabout or a competitive padel
                match, there&apos;s always someone to play with.
              </p>
            </div>
            <Link
              href="/app"
              className="inline-flex items-center gap-1 text-sm font-extrabold text-primary hover:underline"
            >
              See all games
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {SPORTS.map((s) => (
              <Link
                key={s.id}
                href={`/app?sport=${s.id}`}
                className="group relative overflow-hidden rounded-3xl bg-off-white p-5 ring-1 ring-border/60 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:ring-primary/40"
              >
                <div
                  aria-hidden
                  className="absolute -right-6 -top-6 size-24 rounded-full bg-primary/5 transition-all group-hover:scale-125 group-hover:bg-primary/10"
                />
                <div className="relative">
                  <div className="text-4xl">{s.emoji}</div>
                  <div className="mt-6 text-base font-black text-charcoal">
                    {s.name}
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1 text-xs font-extrabold text-primary opacity-0 transition group-hover:opacity-100">
                    Find games
                    <ArrowRight className="size-3.5" aria-hidden />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
       * FEATURED GAMES (styled as cards, linking to demo feed)
       * ──────────────────────────────────────────────────────── */}
      <section id="games" className="bg-off-white px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Today on IminPlay
              </span>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                Happening near you
              </h2>
            </div>
            <Link
              href="/app"
              className="inline-flex items-center gap-1 text-sm font-extrabold text-primary hover:underline"
            >
              Browse the feed
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <FeatureGameCard
              emoji="⚽"
              sport="Football"
              title="Sunset 7-a-side at Mouille"
              location="Mouille Point, Cape Town"
              when="Today · 17:30"
              spots="3 of 14 spots left"
              level="Intermediate"
            />
            <FeatureGameCard
              emoji="🎾"
              sport="Padel"
              title="Padel Royale Doubles"
              location="V&A Waterfront, Cape Town"
              when="Sat · 10:00"
              spots="Full · join waitlist"
              level="All levels"
              hot
            />
            <FeatureGameCard
              emoji="🏃"
              sport="Running"
              title="Sea Point Promenade 5K"
              location="Sea Point, Cape Town"
              when="Sun · 06:30"
              spots="12 going"
              level="All levels"
            />
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
       * HOW IT WORKS
       * ──────────────────────────────────────────────────────── */}
      <section id="how" className="px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              How it works
            </span>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              From discovery to kick-off in 30 seconds
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {[
              {
                n: "01",
                icon: Compass,
                title: "Discover",
                body: "Filter games by city, sport and date. See what's happening near you today.",
              },
              {
                n: "02",
                icon: Users,
                title: "Join",
                body: "Tap I'm In. Your seat is reserved. Get a reminder 1h before kick-off.",
              },
              {
                n: "03",
                icon: MessageCircle,
                title: "Chat",
                body: "Real-time group chat per game. Share logistics, trash-talk, carpool.",
              },
              {
                n: "04",
                icon: CalendarCheck,
                title: "Play",
                body: "Show up. Rate your teammates. Book the next one.",
              },
            ].map(({ n, icon: Icon, title, body }) => (
              <div
                key={title}
                className="group relative rounded-3xl bg-white p-6 ring-1 ring-border/60 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <span className="absolute right-5 top-5 text-sm font-black text-text-muted/60">
                  {n}
                </span>
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary-light text-primary transition group-hover:bg-primary group-hover:text-white">
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

      {/* ──────────────────────────────────────────────────────────
       * CITIES
       * ──────────────────────────────────────────────────────── */}
      <section id="cities" className="bg-off-white px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Play everywhere
              </span>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                Explore by city
              </h2>
              <p className="mt-2 max-w-xl text-text-secondary">
                Launching city by city across South Africa. Cape Town is live —
                the rest follow through 2026.
              </p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {CITIES.map((c, i) => (
              <Link
                key={c}
                href={`/c/${cityToSlug(c)}`}
                className="group relative flex items-center justify-between overflow-hidden rounded-2xl bg-white p-5 ring-1 ring-border/60 transition hover:-translate-y-1 hover:shadow-lg hover:ring-primary/40"
              >
                <div>
                  <div className="text-base font-black text-charcoal">{c}</div>
                  <div className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-text-muted">
                    <MapPin className="size-3" aria-hidden />
                    {i === 0 ? "Live" : "Coming soon"}
                  </div>
                </div>
                <ArrowRight className="size-5 text-text-muted transition group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
       * COMMUNITY / WHY IMINPLAY
       * ──────────────────────────────────────────────────────── */}
      <section id="community" className="px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-7xl grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              More than an app
            </span>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              A community that shows up.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-text-secondary">
              Pickup sport works when people actually show up. We keep it real
              with verified profiles, host reputations, and clear host rules —
              so every game you join is worth the trip.
            </p>
            <ul className="mt-8 space-y-4">
              <Bullet
                icon={ShieldCheck}
                title="Verified hosts"
                body="Games are reviewed before going live. Repeat no-shows get flagged."
              />
              <Bullet
                icon={Star}
                title="Ratings you can trust"
                body="Rate teammates after every match. Hosts build a public reputation."
              />
              <Bullet
                icon={MessageCircle}
                title="Real-time group chat"
                body="One chat per game. Coordinate carpools, kit, and last-minute swaps."
              />
            </ul>
          </div>

          {/* Early access card — honest (no fake testimonials) */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-8 text-white">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 size-44 rounded-full bg-white/10 blur-2xl"
            />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold uppercase tracking-wider">
                <Sparkles className="size-3.5" aria-hidden />
                Early access
              </span>
              <h3 className="mt-5 text-3xl font-black leading-tight">
                Be one of the first 50 players in Cape Town.
              </h3>
              <p className="mt-3 text-white/80">
                IminPlay is brand new — we&apos;re launching with friends,
                family and early supporters in the Mother City. Sign up free,
                host or join a game this week, and shape what the community
                feels like.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/auth/sign-up"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-primary hover:bg-off-white"
                >
                  Claim your spot
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <a
                  href="mailto:hello@iminplay.com?subject=IminPlay%20early%20access"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-transparent px-5 py-2.5 text-sm font-extrabold text-white hover:bg-white/10"
                >
                  Say hi
                </a>
              </div>
              <p className="mt-6 text-xs text-white/60">
                Built in Cape Town by Elton Laice · Founder, CODELAICE
                TECHNOLOGY (Pty) Ltd
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
       * BIG CTA
       * ──────────────────────────────────────────────────────── */}
      <section className="px-6 pb-24 sm:px-10">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-charcoal px-8 py-16 text-white sm:px-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-primary/40 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-primary/30 blur-3xl"
          />
          <div className="relative grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <h2 className="text-4xl font-black sm:text-5xl">
                For the love of the game.
              </h2>
              <p className="mt-4 max-w-xl text-lg text-white/70">
                Every sport. Every level. Built in Cape Town, made for Africa.
              </p>
              <div className="mt-8">
                <PrimaryCta variant="onDark" />
              </div>
            </div>
            <div className="relative hidden justify-end lg:flex">
              <div className="relative w-72">
                <div className="absolute inset-0 -rotate-3 rounded-[2.25rem] bg-white/10" />
                <div className="relative rotate-1 rounded-[2.25rem] bg-white p-5 text-charcoal shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-off-white text-2xl">
                      🎾
                    </div>
                    <div>
                      <div className="text-sm font-black">Padel · Doubles</div>
                      <div className="text-xs text-text-muted">
                        V&A · Sat 10:00
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 h-px bg-border" />
                  <div className="mt-4 flex items-center justify-between text-xs font-bold">
                    <span className="text-text-muted">Players</span>
                    <span>
                      <span className="text-charcoal">3</span>
                      <span className="text-text-muted">/4</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    className="mt-4 w-full rounded-full bg-primary py-2.5 text-sm font-extrabold text-white"
                  >
                    I&apos;m in
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
       * FOOTER
       * ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-white px-6 py-14 sm:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Wordmark size="md" />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-text-secondary">
              The community-first pickup sport platform for South Africa.
              Built in Cape Town by CODELAICE TECHNOLOGY (Pty) Ltd.
            </p>
            <div className="mt-6">
              <PrimaryCta size="sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <FooterCol title="Product">
              <FooterLink href="/app">Browse games</FooterLink>
              <FooterLink href="/app/game/new">Host a game</FooterLink>
              <FooterLink href="/auth/sign-up">Sign up free</FooterLink>
              <FooterLink href="/auth/sign-in">Sign in</FooterLink>
            </FooterCol>
            <FooterCol title="Sports">
              {SPORTS.slice(0, 6).map((s) => (
                <FooterLink key={s.id} href={`/app?sport=${s.id}`}>
                  {s.name}
                </FooterLink>
              ))}
            </FooterCol>
            <FooterCol title="Cities">
              {CITIES.slice(0, 6).map((c) => (
                <FooterLink key={c} href={`/c/${cityToSlug(c)}`}>
                  {c}
                </FooterLink>
              ))}
            </FooterCol>
            <FooterCol title="Company">
              <FooterLink href="mailto:hello@iminplay.com">Contact</FooterLink>
              <FooterLink href="/privacy">Privacy</FooterLink>
              <FooterLink href="/terms">Terms</FooterLink>
            </FooterCol>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-border/60 pt-6 text-xs text-text-muted">
          © {new Date().getFullYear()} CODELAICE TECHNOLOGY (Pty) Ltd ·
          Trading as IminPlay · Cape Town, South Africa
        </div>
      </footer>
    </main>
  );
}

/* ──────────────────────────────────────────────────────────────
 * Local building blocks
 * ──────────────────────────────────────────────────────────── */

function HeroCard({
  emoji,
  title,
  meta,
  rating,
  badge,
  className,
}: {
  emoji: string;
  title: string;
  meta: string;
  rating: string;
  badge?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl bg-white p-5 shadow-2xl ring-1 ring-border/60 ${className ?? ""}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-12 items-center justify-center rounded-xl bg-off-white text-2xl">
          {emoji}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-charcoal">
              {title}
            </span>
            {badge && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                {badge}
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-text-muted">{meta}</div>
          <div className="mt-2 text-xs font-bold text-charcoal">{rating}</div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  value,
  unit,
  label,
}: {
  value: string;
  unit: string;
  label: string;
}) {
  return (
    <div>
      <div className="text-4xl font-black leading-none sm:text-5xl">
        {value}
        {unit && <span className="ml-1 text-2xl text-primary">{unit}</span>}
      </div>
      <div className="mt-2 text-sm font-bold text-white/70">{label}</div>
    </div>
  );
}

function FeatureGameCard({
  emoji,
  sport,
  title,
  location,
  when,
  spots,
  level,
  hot,
}: {
  emoji: string;
  sport: string;
  title: string;
  location: string;
  when: string;
  spots: string;
  level: string;
  hot?: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white ring-1 ring-border/60 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-primary-light to-primary/20">
        <span className="text-7xl">{emoji}</span>
        {hot && (
          <span className="absolute right-4 top-4 rounded-full bg-primary px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white">
            🔥 Hot
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="text-xs font-bold uppercase tracking-wider text-primary">
          {sport} · {level}
        </div>
        <h3 className="mt-2 text-lg font-black leading-tight text-charcoal">
          {title}
        </h3>
        <div className="mt-3 flex items-center gap-1.5 text-sm text-text-secondary">
          <MapPin className="size-4 text-text-muted" aria-hidden />
          {location}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
          <CalendarCheck className="size-4 text-text-muted" aria-hidden />
          {when}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-extrabold text-text-muted">
            {spots}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-primary opacity-0 transition group-hover:opacity-100">
            Join
            <ArrowRight className="size-3.5" aria-hidden />
          </span>
        </div>
      </div>
    </div>
  );
}

function Bullet({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  body: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
        <Icon className="size-5" aria-hidden />
      </div>
      <div>
        <div className="font-extrabold text-charcoal">{title}</div>
        <p className="mt-0.5 text-sm text-text-secondary">{body}</p>
      </div>
    </li>
  );
}

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs font-extrabold uppercase tracking-wider text-charcoal">
        {title}
      </div>
      <ul className="mt-3 space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-text-secondary hover:text-primary"
      >
        {children}
      </Link>
    </li>
  );
}
