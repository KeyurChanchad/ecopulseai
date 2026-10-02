import { GLOBAL_CITIES } from '../data/mockData';
import { LANDMARK_DICTIONARY } from './locationService';

export interface GeocodingResult {
  id: string;
  name: string;
  displayName: string;
  type: 'City' | 'Town' | 'Village' | 'Suburb' | 'Landmark' | 'Street' | 'Coordinate';
  lat: number;
  lng: number;
  country: string;
  state?: string;
  isLive: boolean;
}

/**
 * Searches global places across OpenStreetMap Nominatim and Photon geocoding APIs.
 * Supports any city, town, village, neighborhood, street, or landmark worldwide,
 * just like Google Maps search.
 */
export async function searchGlobalPlaces(
  query: string,
  signal?: AbortSignal
): Promise<GeocodingResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // 1. Direct coordinate parsing (e.g. "23.0225, 72.5714" or "23.0225 72.5714")
  const coordsMatch = trimmed.match(/^([-+]?\d{1,2}(?:\.\d+)?)[,\s]+([-+]?\d{1,3}(?:\.\d+)?)$/);
  if (coordsMatch) {
    const lat = parseFloat(coordsMatch[1]);
    const lng = parseFloat(coordsMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return [
        {
          id: `coord-${lat.toFixed(4)}-${lng.toFixed(4)}`,
          name: `Coordinates (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`,
          displayName: `Custom Point: Latitude ${lat.toFixed(5)}, Longitude ${lng.toFixed(5)}`,
          type: 'Coordinate',
          lat,
          lng,
          country: 'Global Coordinate Selection',
          isLive: true,
        },
      ];
    }
  }

  const results: GeocodingResult[] = [];
  const qLower = trimmed.toLowerCase();

  // 2. Instant local search from preloaded cities and landmarks
  for (const city of GLOBAL_CITIES) {
    if (
      city.name.toLowerCase().includes(qLower) ||
      city.country.toLowerCase().includes(qLower) ||
      (city.state && city.state.toLowerCase().includes(qLower))
    ) {
      results.push({
        id: city.id,
        name: city.name,
        displayName: `${city.name}, ${city.state ? city.state + ', ' : ''}${city.country}`,
        type: 'City',
        lat: city.lat,
        lng: city.lng,
        country: city.country,
        state: city.state,
        isLive: false,
      });
    }
  }

  for (const [key, val] of Object.entries(LANDMARK_DICTIONARY)) {
    if (key.includes(qLower) || val.name.toLowerCase().includes(qLower)) {
      results.push({
        id: `landmark-${key.replace(/\s+/g, '-')}`,
        name: val.name,
        displayName: `${val.name}, ${val.city}, ${val.country}`,
        type: 'Landmark',
        lat: val.lat,
        lng: val.lng,
        country: val.country,
        state: val.city,
        isLive: false,
      });
    }
  }

  // 3. Live Global Geocoding via OpenStreetMap Nominatim
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      trimmed
    )}&format=jsonv2&addressdetails=1&limit=8`;

    const res = await fetch(nominatimUrl, {
      headers: {
        'Accept-Language': 'en',
      },
      signal,
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        for (const item of data) {
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          const addr = item.address || {};

          let type: GeocodingResult['type'] = 'City';
          if (item.type === 'village' || item.type === 'hamlet') type = 'Village';
          else if (item.type === 'town') type = 'Town';
          else if (item.type === 'suburb' || item.type === 'neighbourhood') type = 'Suburb';
          else if (item.class === 'highway' || item.type === 'road') type = 'Street';
          else if (item.class === 'tourism' || item.class === 'historic' || item.class === 'amenity') type = 'Landmark';

          const primaryName =
            addr.village ||
            addr.hamlet ||
            addr.town ||
            addr.city ||
            addr.suburb ||
            addr.road ||
            item.name ||
            item.display_name.split(',')[0];

          // Check if already in results by close proximity
          const alreadyExists = results.some(
            (r) => Math.abs(r.lat - lat) < 0.01 && Math.abs(r.lng - lng) < 0.01
          );

          if (!alreadyExists) {
            results.push({
              id: `osm-${item.place_id}`,
              name: primaryName,
              displayName: item.display_name,
              type,
              lat,
              lng,
              country: addr.country || 'Global Location',
              state: addr.state || addr.county || addr.state_district,
              isLive: true,
            });
          }
        }
      }
    }
  } catch (err) {
    // If Nominatim times out, try Photon geocoder (Komoot OSM worldwide index)
    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=8`;
      const pRes = await fetch(photonUrl, { signal });
      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData && Array.isArray(pData.features)) {
          for (const feat of pData.features) {
            const coords = feat.geometry?.coordinates;
            const props = feat.properties || {};
            if (coords && coords.length >= 2) {
              const lng = coords[0];
              const lat = coords[1];

              let type: GeocodingResult['type'] = 'City';
              if (props.type === 'village') type = 'Village';
              else if (props.type === 'town') type = 'Town';
              else if (props.type === 'street') type = 'Street';

              const alreadyExists = results.some(
                (r) => Math.abs(r.lat - lat) < 0.01 && Math.abs(r.lng - lng) < 0.01
              );

              if (!alreadyExists) {
                const name = props.name || trimmed;
                const parts = [name, props.city, props.state, props.country].filter(Boolean);
                results.push({
                  id: `photon-${lat.toFixed(4)}-${lng.toFixed(4)}`,
                  name,
                  displayName: parts.join(', '),
                  type,
                  lat,
                  lng,
                  country: props.country || 'Global',
                  state: props.state,
                  isLive: true,
                });
              }
            }
          }
        }
      }
    } catch {
      // Fallback to local matches
    }
  }

  return results.slice(0, 10);
}
