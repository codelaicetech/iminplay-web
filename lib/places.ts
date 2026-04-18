/**
 * Google Places API (New) — browser-side helpers.
 *
 * Mirrors iminplay-app/lib/places.ts but tuned for Next.js:
 * the API key lives in NEXT_PUBLIC_GOOGLE_MAPS_API_KEY so it's
 * accessible from client components. The key should be restricted to
 * HTTP referrers + the 4 required Places APIs via Google Cloud Console
 * before we ship to production.
 */

const API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ??
  "AIzaSyBoKQL1F_7HeTc6KzTuNB6jeteHScUe9IM";
const BASE = "https://places.googleapis.com/v1";

/** Cape Town CBD — default autocomplete bias + map centre. */
export const CAPE_TOWN = { lat: -33.9249, lng: 18.4241 };

export type PlaceSuggestion = {
  placeId: string;
  primaryText: string;
  secondaryText: string;
};

export type ResolvedPlace = {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  city: string | null;
};

export async function autocompletePlaces(
  query: string,
  opts: {
    bias?: { lat: number; lng: number };
    radiusMeters?: number;
    regionCodes?: string[];
    sessionToken?: string;
  } = {},
): Promise<PlaceSuggestion[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const {
    bias = CAPE_TOWN,
    radiusMeters = 30000,
    regionCodes = ["ZA"],
    sessionToken,
  } = opts;

  try {
    const res = await fetch(`${BASE}/places:autocomplete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
      },
      body: JSON.stringify({
        input: q,
        locationBias: {
          circle: {
            center: { latitude: bias.lat, longitude: bias.lng },
            radius: radiusMeters,
          },
        },
        includedRegionCodes: regionCodes,
        ...(sessionToken ? { sessionToken } : {}),
      }),
    });

    if (!res.ok) {
      console.warn("places:autocomplete failed", res.status);
      return [];
    }

    const data = (await res.json()) as {
      suggestions?: Array<{
        placePrediction?: {
          placeId: string;
          text: { text: string };
          structuredFormat?: {
            mainText?: { text: string };
            secondaryText?: { text: string };
          };
        };
      }>;
    };

    return (data.suggestions ?? [])
      .filter((s) => !!s.placePrediction)
      .map((s) => ({
        placeId: s.placePrediction!.placeId,
        primaryText:
          s.placePrediction!.structuredFormat?.mainText?.text ??
          s.placePrediction!.text.text,
        secondaryText:
          s.placePrediction!.structuredFormat?.secondaryText?.text ?? "",
      }));
  } catch (err) {
    console.warn("places:autocomplete error", err);
    return [];
  }
}

export async function resolvePlace(
  placeId: string,
  sessionToken?: string,
): Promise<ResolvedPlace | null> {
  try {
    const url = new URL(`${BASE}/places/${placeId}`);
    if (sessionToken) url.searchParams.set("sessionToken", sessionToken);

    const res = await fetch(url.toString(), {
      headers: {
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask":
          "id,displayName,formattedAddress,location,addressComponents",
      },
    });

    if (!res.ok) return null;

    type PlaceDetails = {
      id: string;
      displayName?: { text: string };
      formattedAddress?: string;
      location?: { latitude: number; longitude: number };
      addressComponents?: Array<{ longText: string; types: string[] }>;
    };
    const data = (await res.json()) as PlaceDetails;

    const city =
      data.addressComponents?.find((c) => c.types?.includes("locality"))
        ?.longText ??
      data.addressComponents?.find((c) => c.types?.includes("postal_town"))
        ?.longText ??
      null;

    return {
      placeId: data.id,
      name: data.displayName?.text ?? "",
      address: data.formattedAddress ?? "",
      lat: data.location?.latitude ?? 0,
      lng: data.location?.longitude ?? 0,
      city,
    };
  } catch {
    return null;
  }
}

export function newSessionToken(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
