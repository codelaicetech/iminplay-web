# IminPlay Web — Backlog

Captured Saturday, 18 April 2026, at the end of the deploy + admin
expansion push. Sorted by priority. "Blockers" = things that really
should land before the first 50 users arrive.

---

## 🚨 Blockers for first validation cohort

- [ ] **Apply SQL migration `supabase/migrations/20260418_user_bans.sql`** in
      Supabase SQL Editor. Without it the `Ban` button on `/admin/users`
      will return an RPC-not-found error. The rest of the admin surface
      works either way.
- [ ] **Apply SQL migration `supabase/migrations/20260418_avatars_bucket.sql`**
      so the avatar upload flow on `/app/settings/profile` succeeds
      against a real bucket with the right RLS.
- [ ] **Fix the landing-vs-Terms contradiction**: the hero shows
      "Free. No subscription. Ever." and Terms section 7 describes an
      "IminPlay Pro" paid subscription. Pick one narrative and update
      the other.
- [ ] **Replace fake testimonials on `/`** with an honest placeholder
      ("First reviews coming soon") or remove the section entirely.
      With zero users, named quotes are a credibility risk.
- [ ] **Hide or redirect `/install`** while the mobile apps don't
      exist — the App Store button currently links to `id0000000000`.
- [ ] **Rotate leaked keys** (Resend `re_K9zyTDHV_…`, Sentry
      `sntryu_1aa16bbb…`). Both were shared in chat earlier and should
      be considered compromised.

## 🔐 Auth UX (pre-launch polish)

- [ ] **Resend SMTP** — configure custom SMTP in Supabase Auth so
      confirmation / reset-password / magic-link emails come from
      `auth@iminplay.com` instead of the generic Supabase sender.
      Requires domain verification in Resend and 4 DNS records in
      Cloudflare. ~20 min.
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

- [ ] **Email the banned user** when `banUserAction` runs — Resend
      template referencing the reason.
- [ ] **Email cancelled-game participants** when
      `adminCancelGameAction` runs.
- [ ] **Admin grant/revoke**: email notification to the new/revoked
      admin.
- [ ] **Report on chat messages** — `ReportButton` currently only
      exists on game detail + public profile. Add to messages in
      `/app/game/<id>/chat`.
- [ ] **Bulk moderation** — approve/reject selected games at once in
      `/admin/pending-games`.
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

- [ ] **Avatar crop tool** — users currently upload raw images.
- [ ] **Honest stat bar** on landing: "Starting in Cape Town ·
      Expanding to 6 more cities" instead of "7 cities".
- [ ] **Empty-state on `/app`** when the feed is empty: prompt to
      create a game with a host-reward nudge ("First 20 hosts get a
      badge").
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
