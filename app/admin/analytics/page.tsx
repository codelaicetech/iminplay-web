import { BarChart3, TrendingUp, Users as UsersIcon, Gamepad2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { sportLabel } from "@/lib/types";

export const metadata = { title: "Analytics" };

const DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const now = new Date();
  const since = new Date(now.getTime() - DAYS * DAY_MS);
  const sinceIso = since.toISOString();

  const [
    profilesRes,
    gamesCreatedRes,
    gamesByCityRes,
    gamesBySportRes,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", sinceIso),
    supabase
      .from("games")
      .select("created_at, city, sport")
      .gte("created_at", sinceIso),
    supabase
      .from("games")
      .select("city")
      .eq("approval_status", "approved"),
    supabase
      .from("games")
      .select("sport")
      .eq("approval_status", "approved"),
  ]);

  const signupsSeries = seriesByDay(
    (profilesRes.data ?? []).map((r) => r.created_at as string),
    DAYS,
  );
  const gamesSeries = seriesByDay(
    (gamesCreatedRes.data ?? []).map((r) => r.created_at as string),
    DAYS,
  );

  const cityCounts = countBy(
    (gamesByCityRes.data ?? []).map((r) => (r.city ?? "Unknown") as string),
  );
  const sportCounts = countBy(
    (gamesBySportRes.data ?? []).map((r) => (r.sport ?? "unknown") as string),
  );

  const totalSignups30 = signupsSeries.reduce((a, b) => a + b.v, 0);
  const totalGames30 = gamesSeries.reduce((a, b) => a + b.v, 0);

  return (
    <div>
      <h1 className="text-3xl font-black">Analytics</h1>
      <p className="mt-2 text-text-secondary">
        Last {DAYS} days of activity. Charts render server-side as SVG — no
        client JS required.
      </p>

      {/* Top counters */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <HeaderStat
          icon={UsersIcon}
          label={`Signups · last ${DAYS}d`}
          value={totalSignups30}
          accent
        />
        <HeaderStat
          icon={Gamepad2}
          label={`Games created · last ${DAYS}d`}
          value={totalGames30}
          accent
        />
      </div>

      {/* Line charts */}
      <section className="mt-8 rounded-3xl bg-white p-6 ring-1 ring-border/60">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" aria-hidden />
          <h2 className="text-sm font-extrabold uppercase tracking-wider">
            Signups per day
          </h2>
        </div>
        <div className="mt-4">
          <LineChart data={signupsSeries} color="primary" />
        </div>
      </section>

      <section className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-border/60">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" aria-hidden />
          <h2 className="text-sm font-extrabold uppercase tracking-wider">
            Games created per day
          </h2>
        </div>
        <div className="mt-4">
          <LineChart data={gamesSeries} color="primary" />
        </div>
      </section>

      {/* Distributions */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl bg-white p-6 ring-1 ring-border/60">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-primary" aria-hidden />
            <h2 className="text-sm font-extrabold uppercase tracking-wider">
              Approved games by city
            </h2>
          </div>
          <BarList entries={cityCounts} />
        </section>

        <section className="rounded-3xl bg-white p-6 ring-1 ring-border/60">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-primary" aria-hidden />
            <h2 className="text-sm font-extrabold uppercase tracking-wider">
              Approved games by sport
            </h2>
          </div>
          <BarList
            entries={sportCounts.map(([id, v]) => [
              `${sportLabel(id).emoji} ${sportLabel(id).name}`,
              v,
            ])}
          />
        </section>
      </div>
    </div>
  );
}

/* ── Data helpers ─────────────────────────────────────────────────────── */

type Point = { k: string; v: number };

function seriesByDay(isoDates: string[], days: number): Point[] {
  const buckets = new Map<string, number>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Pre-fill zeros so the x-axis is continuous even on empty days
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * DAY_MS);
    buckets.set(isoDate(d), 0);
  }

  for (const iso of isoDates) {
    const key = isoDate(new Date(iso));
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return Array.from(buckets.entries()).map(([k, v]) => ({ k, v }));
}

function isoDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function countBy(items: string[]): Array<[string, number]> {
  const m = new Map<string, number>();
  for (const it of items) m.set(it, (m.get(it) ?? 0) + 1);
  return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
}

/* ── UI primitives ────────────────────────────────────────────────────── */

function HeaderStat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-3xl bg-white p-6 ring-1 ring-border/60">
      <div
        className={`flex size-10 items-center justify-center rounded-xl ${
          accent
            ? "bg-primary/10 text-primary"
            : "bg-off-white text-text-muted"
        }`}
      >
        <Icon className="size-5" aria-hidden />
      </div>
      <div className="mt-4 text-xs font-bold uppercase tracking-wider text-text-muted">
        {label}
      </div>
      <div className="mt-1 text-4xl font-black">{value.toLocaleString("en-ZA")}</div>
    </div>
  );
}

function LineChart({ data, color }: { data: Point[]; color: "primary" }) {
  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-text-muted">
        No data yet.
      </div>
    );
  }

  const W = 900;
  const H = 220;
  const PAD_X = 32;
  const PAD_Y = 24;
  const max = Math.max(1, ...data.map((d) => d.v));
  const n = data.length;
  const xStep = (W - PAD_X * 2) / Math.max(1, n - 1);

  const points = data.map((d, i) => {
    const x = PAD_X + i * xStep;
    const y = H - PAD_Y - (d.v / max) * (H - PAD_Y * 2);
    return { x, y, v: d.v, k: d.k };
  });

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  const fillPath = `${path} L${points[points.length - 1].x.toFixed(1)},${H - PAD_Y} L${points[0].x.toFixed(1)},${H - PAD_Y} Z`;

  const stroke = color === "primary" ? "#ff6b35" : "#2d3436";
  const fill = "url(#line-fill)";

  // Pick a small set of x-axis labels
  const labelIdx = [
    0,
    Math.floor(n / 4),
    Math.floor(n / 2),
    Math.floor((3 * n) / 4),
    n - 1,
  ];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label="Time-series chart"
    >
      <defs>
        <linearGradient id="line-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.20" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* horizontal gridlines */}
      {[0.25, 0.5, 0.75, 1].map((f, i) => {
        const y = H - PAD_Y - f * (H - PAD_Y * 2);
        return (
          <line
            key={i}
            x1={PAD_X}
            y1={y}
            x2={W - PAD_X}
            y2={y}
            stroke="#e8e8e8"
            strokeDasharray="2 4"
          />
        );
      })}

      {/* y-axis labels */}
      {[0, Math.round(max / 2), max].map((v, i) => {
        const y = H - PAD_Y - (v / max) * (H - PAD_Y * 2);
        return (
          <text
            key={i}
            x={PAD_X - 6}
            y={y}
            textAnchor="end"
            dy="0.32em"
            fontSize="10"
            fill="#b2bec3"
            fontFamily="var(--font-nunito), sans-serif"
            fontWeight="700"
          >
            {v}
          </text>
        );
      })}

      {/* fill */}
      <path d={fillPath} fill={fill} />
      {/* line */}
      <path d={path} fill="none" stroke={stroke} strokeWidth="2" />
      {/* dots — only draw where v > 0 to keep it clean */}
      {points.map((p, i) =>
        p.v > 0 ? (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill={stroke}
          >
            <title>{`${p.k}: ${p.v}`}</title>
          </circle>
        ) : null,
      )}

      {/* x-axis labels */}
      {labelIdx.map((i) => {
        const p = points[i];
        if (!p) return null;
        return (
          <text
            key={i}
            x={p.x}
            y={H - 4}
            textAnchor="middle"
            fontSize="10"
            fill="#b2bec3"
            fontFamily="var(--font-nunito), sans-serif"
            fontWeight="700"
          >
            {shortDate(p.k)}
          </text>
        );
      })}
    </svg>
  );
}

function shortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
  });
}

function BarList({ entries }: { entries: Array<[string, number]> }) {
  if (entries.length === 0) {
    return (
      <div className="mt-4 py-8 text-center text-sm text-text-muted">
        No data yet.
      </div>
    );
  }
  const max = Math.max(1, ...entries.map(([, v]) => v));
  return (
    <ul className="mt-4 space-y-2.5">
      {entries.slice(0, 10).map(([label, v]) => {
        const w = (v / max) * 100;
        return (
          <li key={label}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-charcoal">{label}</span>
              <span className="font-extrabold tabular-nums text-charcoal">
                {v}
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-off-white">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${w}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
