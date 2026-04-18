import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

/**
 * Server-side auth callback.
 *
 * Supabase sends users here after they click a confirmation / magic
 * link / password-reset email. With `@supabase/ssr` the PKCE code
 * verifier is stored in an HTTP-only cookie by the *server* client at
 * the time the user initiated the flow, so we must redeem the `code`
 * here — a client-side exchange would fail with
 *   "PKCE code verifier not found in storage".
 *
 * Supported URL shapes:
 *   1. `/auth/callback?code=<pkce>&type=<kind>`  — modern PKCE
 *   2. `/auth/callback?token_hash=<hash>&type=<kind>` — OTP / magic link
 *   3. `/auth/callback?error=…` — failure surface from Supabase
 *
 * Route by `type`:
 *   - recovery  → /auth/update-password
 *   - anything else → /app
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OTP_TYPES: EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
];

function errorRedirect(origin: string, message: string): NextResponse {
  const url = new URL("/auth/sign-in", origin);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const errorDescription =
    searchParams.get("error_description") ?? searchParams.get("error");
  if (errorDescription) {
    return errorRedirect(origin, errorDescription);
  }

  const type = searchParams.get("type");
  const nextPath = type === "recovery" ? "/auth/update-password" : "/app";

  const supabase = await createClient();

  // ── 1. PKCE flow ──────────────────────────────────────────
  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return errorRedirect(origin, error.message);
    return NextResponse.redirect(new URL(nextPath, origin));
  }

  // ── 2. token_hash (OTP / magic link) ──────────────────────
  const tokenHash = searchParams.get("token_hash");
  if (tokenHash) {
    const otpType: EmailOtpType = OTP_TYPES.includes(
      type as EmailOtpType,
    )
      ? (type as EmailOtpType)
      : "email";
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType,
    });
    if (error) return errorRedirect(origin, error.message);
    return NextResponse.redirect(new URL(nextPath, origin));
  }

  // ── 3. Nothing we can handle server-side ──────────────────
  return errorRedirect(
    origin,
    "Missing or expired auth link. Please request a new one.",
  );
}
