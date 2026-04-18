import { CITIES, SPORTS } from "@/lib/constants";

type Props = {
  /** Base path the filter form submits to (e.g., "/app"). */
  action: string;
  /** Currently selected filter values. */
  city?: string;
  sport?: string;
  date?: string;
};

/**
 * SSR-friendly filter bar. Uses a plain GET form so filter state lives
 * in the URL — shareable, bookmarkable, refreshable. No JS required.
 */
export function FeedFilters({ action, city, sport, date }: Props) {
  return (
    <form
      method="GET"
      action={action}
      className="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 ring-1 ring-border/60"
    >
      <Field label="City">
        <select
          name="city"
          defaultValue={city ?? ""}
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
        >
          <option value="">All cities</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Sport">
        <select
          name="sport"
          defaultValue={sport ?? ""}
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
        >
          <option value="">All sports</option>
          {SPORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.emoji} {s.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Date">
        <input
          type="date"
          name="date"
          defaultValue={date ?? ""}
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
      </Field>

      <button
        type="submit"
        className="rounded-full bg-primary px-5 py-2 text-sm font-extrabold text-white hover:bg-primary-dark"
      >
        Apply
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-[140px] flex-1">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
