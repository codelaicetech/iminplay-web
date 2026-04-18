# IminPlay Web — Backlog

Captured Saturday, 18 April 2026, at the end of the deploy + admin
expansion push. Updated the same evening with post-deploy work
(SMTP + timezone + host edit + footer + multi-select delete + bulk
delete) and the demo-readiness tier framework.

"Blockers" = things that really should land before the first 50 users
arrive. The three tiers below are the roadmap from today's 97%
friends-demo state → higher audiences.

---

## 🎯 Demo-readiness tiers (18 Apr 2026, 97% friends-demo)

Three versions of "100%" depending on the audience. Tier A is what
to ship next; B and C are deliberately deferred until real users give
feedback.

### Tier A — "100% for friends demo" · ~3 hours

Target: 10–20 testers in Cape Town in the coming week. Everything
below is high-leverage per minute of effort.

- [ ] **Feed variado** (~10 min) — rewrite `supabase/migrations/20260418_demo_seed.sql`
      as pure SQL (the DO block errored on Supabase's SQL editor).
      12 mixed games on top of the 6 morning runs = ~18 total.
- [ ] **PostHog** (~1 h) — init the Next.js SDK, capture
      `signup_started / signup_completed / game_viewed / game_joined /
       message_sent`. Without this we're demo-blind on where the
      first users drop.
- [ ] **Notify participants on edit / cancel** (~45 min) — wire
      Resend-sent emails whenever `updateGameAction` changes
      `date_time` or `location_name`, and when `cancelOwnGameAction`
      or `adminCancelGameAction` runs. "Your game moved: Sat 10:00 →
      Sat 11:00" / "Your game was cancelled".
- [ ] **Empty states** (~30 min) — when a filter returns zero games,
      suggest clearing or switching city/sport instead of a bare
      "no games found".

### Tier B — "100% for investor demo / paid launch" · ~1–2 weeks

After the first cohort gives honest feedback. Don't chase this before
having real users touching the product.

- [ ] **Google OAuth** (1–2 h) — biggest signup-conversion lever in
      SA. Supabase provider + button on sign-in / sign-up.
- [ ] **Apple Sign In** (1–2 h) — iOS user courtesy, low effort once
      Google is wired.
- [ ] **Sentry on the web** (~30 min) — the mobile project already
      has a Sentry org; just add the Next.js SDK +
      `instrumentation.ts`.
- [ ] **GitHub Actions CI** (~1 h) — OIDC role + secrets (workflow
      file already at `.github/workflows/deploy.yml`). After this,
      `git push main` ships.
- [ ] **Cloudflare Turnstile on auth forms** (~1 h) — Supabase Auth
      supports it natively via `captchaToken`.
- [ ] **Cloudflare proxy flip** (DNS-only → orange · ~30 min) —
      DDoS + edge cache + WAF. Needs SSL mode = "Full (strict)".
- [ ] **Suspended account screen** (~1 h) — middleware detects
      `profiles.banned_at`, shows a fullscreen "account suspended ·
      reason: …" page instead of silently getting RLS errors.
- [ ] **Dynamic OG image per game** (~2 h) — `/api/og/[id]` rendered
      via `@vercel/og` or ImageResponse. Rich WhatsApp / X previews.
- [ ] **Post-signup onboarding** (~3 h) — pick sports → pick city →
      show 3 games. Beats dropping the user in a cold feed.
- [ ] **Performance pass** — Lighthouse ≥ 90 mobile, LCP < 2 s. Image
      optimisation, bundle trim, Turbopack prod build verified.
- [ ] **Cookie banner** (~30 min) — not strictly required in SA but
      polish when touching EU traffic.

### Tier C — "100% real company" · 3–6 months

Series-A-ready. Mostly things that need calendar time, not code
hours.

- [ ] **Mobile apps shipped** — EAS build + Play Console (needs DUNS)
      + TestFlight + unblock FCM (GCP org policy still blocks service
      account key creation).
- [ ] **Monetisation** — IminPlay Pro subscription via Stripe or
      RevenueCat; mobile paywall + web paywall.
- [ ] **Push notifications** — Expo Push on mobile, Web Push on web.
- [ ] **Referral mechanic** with attributable tracking.
- [ ] **Ratings v2** — public host reputation, badges, "reliable"
      marker after N games completed.
- [ ] **Teams** — persistent teams (not just one-off games), team
      chat, team-level stats.
- [ ] **Venue partners dashboard** — court owners can publish their
      availability + revenue share.
- [ ] **Analytics v2** — retention cohorts, D1/D7/D30, feature
      adoption, MRR.
- [ ] **Formal POPIA registration** with the Information Regulator
      (beyond just mentioning it in `/privacy`).
- [ ] **Security audit** — external pentest + OWASP review.
- [ ] **WCAG AA accessibility audit + fixes**.
- [ ] **Monitoring + on-call** — Datadog or Grafana Cloud, PagerDuty
      alerts, runbooks.
- [ ] **Backup + disaster recovery** — tested restores, RPO/RTO
      documented.
- [ ] **Support ops** — Intercom / Crisp / Front, SLA of first
      response.
- [ ] **i18n** — Portuguese (Mozambique + Angola) when the African
      expansion starts.
- [ ] **Admin team onboarding** — documented moderator playbook,
      keyboard cheatsheet, escalation matrix.

### Key framing (don't lose this)

The real risk right now is **chasing Tier B items before having any
Tier A users**. 3 hours to Tier A completion → share the link with
10 people → 1 week of real feedback → decide Tier B with data instead
of intuition.

The pre-launch perfectionism trap is the single most common founder
mistake in the 0→1 stage.

---

## 🚨 Blockers for first validation cohort

- [x] ~~Apply SQL migration `20260418_user_bans.sql`~~ — done 18 Apr.
- [x] ~~Apply SQL migration `20260418_avatars_bucket.sql`~~ — done 18 Apr.
- [x] ~~Apply SQL migration `20260418_admin_delete_games.sql`~~ — done 18 Apr.
- [x] ~~Fix the landing-vs-Terms contradiction~~ — Section 7 rewritten
      as "Pricing · free during beta". Hero microcopy now says
      "Free during beta."
- [x] ~~Replace fake testimonials on `/`~~ — replaced with
      "Be one of the first 50 players in Cape Town" early-access card.
- [x] ~~Hide or redirect `/install`~~ — now 307 redirects to `/` and
      marked `robots: noindex, nofollow`.
- [ ] **Rotate leaked keys** (Resend `re_K9zyTDHV_…`, Sentry
      `sntryu_1aa16bbb…`). Resend key was reused for SMTP; rotate
      after the first user cohort has tested signup flow.

## 🔐 Auth UX (pre-launch polish)

- [x] ~~Resend SMTP~~ — done 18 Apr. Supabase Auth sends from
      `IminPlay <auth@iminplay.com>` with branded HTML templates for
      confirm-signup, reset-password, magic-link. Site URL + redirect
      allowlist updated.
- [x] ~~/auth/callback PKCE flow~~ — rewritten as server Route Handler
      so HTTP-only code-verifier cookies are readable. Recovery email
      click now lands in `/auth/update-password` with a live session.
- [ ] **Cloudflare Turnstile** on sign-in / sign-up / reset-password
      forms. Supabase Auth supports it natively via `captchaToken`.
      ~1 h (site-key + secret-key, widget mount, pass token through
      server actions).
- [ ] **Google OAuth** (web). Configure provider in Supabase →
      "Sign in with Google" button on `/auth/sign-in` and
      `/auth/sign-up`. Single biggest signup-conversion lever.
- [ ] **Apple OAuth** (web). Nice-to-have; usually follows Google.
- [ ] **Suspended-account screen** — users with `profiles.banned_at`
      set can still browse. Add a middleware check + full-screen
      "Your account is suspended · Reason: …" page so they can't
      silently get RLS errors everywhere.
- [ ] **Password strength meter** on `/auth/sign-up`. Low-effort,
      material UX win.

## 📊 Observability & growth tooling

- [ ] **PostHog** (or Plausible) on the web for funnels + retention.
      Must be in place before the first 50 signups — post-hoc
      analytics are useless.
- [ ] **Sentry** on the web. Already have a Sentry project from the
      mobile side; just need the Next.js SDK + `instrumentation.ts`.
- [ ] **Analytics v2** on `/admin/analytics`:
      - Retention curves (D1 / D7 / D30)
      - Funnel signup → first-game-joined → second-game-joined
      - Top hosts leaderboard
      - MRR when subscriptions go live
- [ ] **Scheduled CSV export** of users + games emailed weekly to
      `hello@iminplay.com` via a Supabase cron + Resend.

## 🛠 Admin surface — nice-to-haves

- [x] ~~Hard-delete games in admin~~ — done 18 Apr (per-row, bulk
      filter-based, multi-select with checkboxes, all audited).
- [ ] **Email the banned user** when `banUserAction` runs — Resend
      template referencing the reason.
- [ ] **Notify participants** when `updateGameAction` changes
      `date_time` / `location_name`, or when `cancelOwnGameAction` /
      `adminCancelGameAction` runs. (Also in Tier A above.)
- [ ] **Admin grant/revoke**: email notification to the new/revoked
      admin.
- [ ] **Report on chat messages** — `ReportButton` currently only
      exists on game detail + public profile. Add to messages in
      `/app/game/<id>/chat`.
- [ ] **Bulk moderation** — approve/reject selected games at once in
      `/admin/pending-games` (same multi-select pattern as delete).
- [ ] **Admin can reset a user's avatar** (e.g. if someone uploads
      something inappropriate before we build moderation there).

## 🚀 CI/CD + infra

- [ ] **GitHub Actions OIDC role** (deploy-checklist Fase B.7).
      Workflow file already lives at `.github/workflows/deploy.yml`;
      still need to create the IAM role + OIDC provider + 4 repo
      secrets. After that, `git push main` becomes the deploy.
- [ ] **Cloudflare Turnstile invisible mode** on `/api/health`
      indirectly via WAF — rate-limit abusive bots.
- [ ] **Supabase CLI workflow** for migrations: migrate locally →
      PR → CI runs `supabase db push --linked`. Prevents the ad-hoc
      SQL-editor pattern that caused previous RLS incidents.
- [ ] **`iminplay.co.za` → `iminplay.com` 301** via a Cloudflare
      Redirect Rule (need to move the `.co.za` nameservers to
      Cloudflare first — currently still at Domains.co.za).
- [ ] **Flip Cloudflare from DNS-only to Proxy (orange cloud)** once
      the stack is stable. Needs SSL mode = "Full (strict)". Gains:
      DDoS protection, edge caching for static assets, analytics.
- [ ] **Custom /api/ready** (deep readiness probe) that actually hits
      Supabase so we know when DB is degraded.

## 🎨 Product polish

- [x] ~~Honest stat bar on landing~~ — done 18 Apr ("1 city ·
      starting in Cape Town" + "Free during beta").
- [x] ~~Footer on signed-in surfaces~~ — done 18 Apr (Privacy · Terms ·
      Support links on /app, /admin, /auth).
- [x] ~~Host edit + cancel own game~~ — done 18 Apr. Self-service
      corrections without admin round-trips.
- [x] ~~Force SAST timezone for game times~~ — done 18 Apr. London
      viewer sees "06:30" when it's a 06:30-Cape-Town game.
- [ ] **Avatar crop tool** — users currently upload raw images.
- [ ] **Empty-state on `/app`** when the feed is empty: prompt to
      create a game with a host-reward nudge ("First 20 hosts get a
      badge"). (Also called out in Tier A above for filter-returns-
      zero case.)
- [ ] **Dynamic OG image generator** per game (`/api/og/[id]`) —
      better WhatsApp / Twitter previews.
- [ ] **Favourite sports on sign-up** — currently they must go to
      Settings after signing up.
- [ ] **Home for signed-in users** — currently `/app` is the feed.
      Consider a lightweight "Your week" at top.
- [ ] **City picker on first load** — auto-detect via IP geolocation
      or ask once.

## 📱 Mobile (deferred until web validates)

- [ ] **FCM push** — blocked by GCP organisation policy
      `iam.disableServiceAccountKeyCreation`. Requires
      `elton@iminplay.com` to be granted the Organization Policy
      Administrator role.
- [ ] **Android EAS build + closed testing** with 20 Cape Town testers.
- [ ] **Play Console** organisation setup (needs DUNS number).
- [ ] **iOS build + TestFlight** (deferred per user request).
- [ ] **Copy the ReportButton UX** to mobile (currently only web has
      the polished modal).
- [ ] **Copy admin cancel + ban flows** to mobile.

## ⚖️ Legal / compliance

- [ ] **DUNS registration** for Codelaice Technology (Pty) Ltd —
      required for Play Console.
- [ ] **Register Information Officer with the Information Regulator
      of SA** (POPIA formal requirement, not just mentioning it in
      `/privacy`).
- [ ] **Audit that `hello@iminplay.com` DKIM/SPF/DMARC** are set up
      properly for outbound email.

---

## Notes

- Admin surface is live at `https://iminplay.com/admin`. All row
  actions (approve / reject / cancel / ban / unban / grant / revoke)
  write to `admin_actions` for the audit log visible at
  `/admin/activity`.
- Web is behind Cloudflare DNS → AWS ALB (ACM cert) → ECS Fargate
  (Copilot-managed) in `eu-west-1`.
- First-launch narrative: web, not mobile. All landing CTAs
  (`PrimaryCta` component) point to `/auth/sign-up` or
  `/app/game/new`, not the stores.

## Open questions for Elton

- Should IminPlay Pro subscriptions still be mentioned in Terms for
  the web-only launch, or strip section 7 until mobile ships?
- Is the Google Maps API key currently used in the mobile app
  restricted by HTTP referrer, and does the list already include
  `iminplay.com` / `*.iminplay.com`? If not, restrict it in GCP
  console to avoid billing surprises.
