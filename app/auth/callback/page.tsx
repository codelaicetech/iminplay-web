"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { EmailOtpType } from "@supabase/supabase-js";

/**
 * Supabase sends users here after email confirmation, password reset,
 * magic link, etc. Supabase has emitted three different link shapes
 * over the years — this handler covers all of them so upgrading the
 * Supabase project settings doesn't silently break recovery flows.
 *
 *   1. PKCE flow (default for new projects):
 *        /auth/callback?code=<jwt>&type=<kind>
 *      → exchange code for session via exchangeCodeForSession.
 *
 *   2. OTP / token_hash flow:
 *        /auth/callback?token_hash=<hash>&type=<kind>
 *      → verifyOtp({ token_hash, type }).
 *
 *   3. Legacy hash flow (pre-2024 projects):
 *        /auth/callback#access_token=…&refresh_token=…&type=<kind>
 *      → setSession with the two tokens from the hash.
 *
 * After a successful session we route by `type`: recovery → set a
 * new password; everything else → /app.
 */
export default function AuthCallback() {
  return (
    <Suspense fallback={<Card message="Signing you in…" />}>
      <CallbackInner />
    </Suspense>
  );
}

const OTP_TYPES: EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
];

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"working" | "error">("working");
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    const hash =
      typeof window !== "undefined" ? window.location.hash : "";
    const hashParams = new URLSearchParams(
      hash.startsWith("#") ? hash.slice(1) : hash,
    );

    (async () => {
      const supabase = createClient();

      const queryType = searchParams.get("type");
      const hashType = hashParams.get("type");
      const type = queryType ?? hashType ?? null;

      const errorDescription =
        searchParams.get("error_description") ??
        hashParams.get("error_description") ??
        searchParams.get("error") ??
        hashParams.get("error");
      if (errorDescription) {
        setStatus("error");
        setMessage(errorDescription);
        return;
      }

      // ── 1. PKCE flow ────────────────────────────────────────
      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setStatus("error");
          setMessage(error.message);
          return;
        }
        routeByType(type);
        return;
      }

      // ── 2. token_hash OTP flow ──────────────────────────────
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
        if (error) {
          setStatus("error");
          setMessage(error.message);
          return;
        }
        routeByType(type);
        return;
      }

      // ── 3. Legacy hash flow ─────────────────────────────────
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) {
          setStatus("error");
          setMessage(error.message);
          return;
        }
        routeByType(type);
        return;
      }

      // ── 4. Nothing recognised ───────────────────────────────
      setStatus("error");
      setMessage(
        "We couldn't complete sign-in. Please request a new link.",
      );
    })();

    function routeByType(t: string | null) {
      if (t === "recovery") {
        router.replace("/auth/update-password");
      } else {
        router.replace("/app");
      }
    }
  }, [router, searchParams]);

  return (
    <Card
      title={status === "error" ? "Something went wrong" : "Just a moment"}
      message={message}
    />
  );
}

function Card({ title, message }: { title?: string; message: string }) {
  return (
    <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-border/60">
      <h1 className="text-2xl font-black">{title ?? "Just a moment"}</h1>
      <p className="mt-3 text-text-secondary">{message}</p>
    </div>
  );
}
