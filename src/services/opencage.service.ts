import { OPENCAGE_API_KEY, NEARBY_RESULTS } from '../config';
import type { NearbyPlace } from '../types/tracking.types';

const BASE = 'https://api.opencagedata.com/geocode/v1/json';

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  if (OPENCAGE_API_KEY === 'YOUR_OPENCAGE_API_KEY_HERE') return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  try {
    const res = await fetch(`${BASE}?q=${lat}+${lng}&key=${OPENCAGE_API_KEY}&language=es&limit=1&no_annotations=1`);
    const data = await res.json();
    return data.results?.[0]?.formatted ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

export async function getNearbyPlaces(lat: number, lng: number): Promise<NearbyPlace[]> {
  if (OPENCAGE_API_KEY === 'YOUR_OPENCAGE_API_KEY_HERE') return getFallbackPlaces(lat, lng);
  try {
    const res = await fetch(
      `${BASE}?q=${lat}+${lng}&key=${OPENCAGE_API_KEY}&language=es&limit=${NEARBY_RESULTS}&no_annotations=1&proximity=${lat},${lng}`
    );
    const data = await res.json();
    return (data.results ?? [])
      .filter((r: any) => r.geometry.lat !== lat || r.geometry.lng !== lng)
      .slice(0, NEARBY_RESULTS)
      .map((r: any) => ({
        name: r.components?.road ?? r.components?.neighbourhood ?? r.formatted.split(',')[0],
        lat: r.geometry.lat,
        lng: r.geometry.lng,
        type: r.components?._type ?? 'place',
        formatted: r.formatted,
      }));
  } catch {
    return getFallbackPlaces(lat, lng);
  }
}

// Fallback: use Nominatim (OSM) when no API key is configured
async function getFallbackPlaces(lat: number, lng: number): Promise<NearbyPlace[]> {
  try {
    const delta = 0.008;
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=${NEARBY_RESULTS}&viewbox=${lng - delta},${lat + delta},${lng + delta},${lat - delta}&bounded=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'es' } });
    const data = await res.json();
    return data.map((p: any) => ({
      name: p.display_name.split(',')[0],
      lat: parseFloat(p.lat),
      lng: parseFloat(p.lon),
      type: p.type,
      formatted: p.display_name,
    }));
  } catch {
    return [];
  }
}
