"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import {
  autocompletePlaces,
  newSessionToken,
  resolvePlace,
  type PlaceSuggestion,
  type ResolvedPlace,
} from "@/lib/places";

type Props = {
  value: string;
  onChangeText: (v: string) => void;
  onSelect: (place: ResolvedPlace) => void;
  placeholder?: string;
  id?: string;
};

/**
 * Debounced client-side Places autocomplete. Uses a single billing
 * session for the user's typing → details bundle so we pay the
 * cheaper rate. The dropdown closes on blur or after a pick.
 */
export function PlaceAutocomplete({
  value,
  onChangeText,
  onSelect,
  placeholder = "e.g. Green Point Stadium",
  id,
}: Props) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [selected, setSelected] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionToken = useMemo(() => newSessionToken(), []);

  useEffect(() => {
    if (selected) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const results = await autocompletePlaces(value, { sessionToken });
      setSuggestions(results);
      setLoading(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, selected, sessionToken]);

  async function pick(s: PlaceSuggestion) {
    setSelected(true);
    setSuggestions([]);
    onChangeText(s.primaryText);
    const place = await resolvePlace(s.placeId, sessionToken);
    if (place) onSelect(place);
  }

  const show = focused && !selected && (loading || suggestions.length > 0);

  return (
    <div className="relative">
      <div className="flex items-center rounded-xl border border-border bg-white focus-within:border-primary">
        <MapPin className="ml-3 size-4 text-text-muted" aria-hidden />
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => {
            setSelected(false);
            onChangeText(e.target.value);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full px-3 py-3 text-base outline-none"
        />
        {loading && (
          <Loader2
            className="mr-3 size-4 animate-spin text-text-muted"
            aria-hidden
          />
        )}
      </div>

      {show && (
        <div className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-xl border border-border bg-white shadow-lg">
          {loading && suggestions.length === 0 ? (
            <div className="px-4 py-3 text-sm text-text-muted">Searching…</div>
          ) : (
            suggestions.map((s) => (
              <button
                key={s.placeId}
                type="button"
                onClick={() => pick(s)}
                className="flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left last:border-b-0 hover:bg-off-white"
              >
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden
                />
                <div className="flex-1">
                  <div className="truncate font-bold text-charcoal">
                    {s.primaryText}
                  </div>
                  {s.secondaryText && (
                    <div className="truncate text-sm text-text-muted">
                      {s.secondaryText}
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
