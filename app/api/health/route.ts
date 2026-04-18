import { NextResponse } from "next/server";

/**
 * Lightweight liveness probe used by the ALB target group and the
 * Docker HEALTHCHECK. Returns fast (no DB roundtrip) — Fargate will
 * cycle the task if this 5xx's for the configured threshold.
 *
 * Keep this cheap: no Supabase calls, no auth checks. A deeper
 * readiness probe can live at /api/ready later if we ever need one.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "iminplay-web",
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}
