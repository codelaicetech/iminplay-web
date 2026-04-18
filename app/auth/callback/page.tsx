"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Supabase sends users here after email confirmation and password reset.
 * The tokens come in the URL hash (not query), so we parse them client-side,
 * call setSession, and then route accordingly:
 *   - recovery flow → /auth/update-password
 *   - normal confirmation → /app
 */
export default function AuthCallback() {
  return (
    <Suspense fallback={<Card message="Signing you in…" />}>
      <CallbackInner />
    </Suspense>
  );
}

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"working" | "error">("working");
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type") ?? searchParams.get("type");

    (async () => {
      const supabase = createClient();

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
      }

      if (type === "recovery") {
        router.replace("/auth/update-password");
      } else {
        router.replace("/app");
      }
    })();
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
