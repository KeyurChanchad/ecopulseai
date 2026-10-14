/**
 * EcoPulseAI Global Geocoding Route
 * Primary Provider: Open-Meteo Geocoding API (https://geocoding-api.open-meteo.com/v1/search)
 * Secondary / Landmark Fallback: OpenStreetMap Nominatim / Photon
 * Supports:
 * - City, town, village, administrative region, country search
 * - Coordinate search (e.g. "23.0225, 72.5714")
 * - Disambiguation of duplicate city names by displaying region, country, and coordinates
 */

import { Router, Request, Response } from 'express';

export const geocodingRouter = Router();

export interface GeocodingItem {
  id: string;
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  country: string;
  countryCode?: string;
  region?: string;
  timezone?: string;
  population?: number;
  elevation?: number;
  type: 'City' | 'Town' | 'Village' | 'Region' | 'Landmark' | 'Coordinate';
}

const geoCache = new Map<string, { timestamp: number; results: GeocodingItem[] }>();
const GEO_CACHE_TTL = 60 * 60 * 1000; // 1 hour

geocodingRouter.get('/search', async (req: Request, res: Response): Promise<void> => {
  const query = ((req.query.q ?? req.query.query) as string)?.trim();
  if (!query) {
    res.json({ success: true, count: 0, results: [] });
    return;
  }

  // 1. Direct coordinate parsing
  const coordsMatch = query.match(/^([-+]?\d{1,2}(?:\.\d+)?)[,\s]+([-+]?\d{1,3}(?:\.\d+)?)$/);
  if (coordsMatch) {
    const lat = parseFloat(coordsMatch[1]);
    const lon = parseFloat(coordsMatch[2]);
    if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      const coordItem: GeocodingItem = {
        id: `coord-${lat.toFixed(4)}-${lon.toFixed(4)}`,
        name: `Coordinates (${lat.toFixed(4)}°, ${lon.toFixed(4)}°)`,
        displayName: `Custom Point: Latitude ${lat.toFixed(5)}, Longitude ${lon.toFixed(5)}`,
        latitude: lat,
        longitude: lon,
        country: 'Global Coordinate Point',
        type: 'Coordinate',
      };
      res.json({ success: true, count: 1, results: [coordItem] });
      return;
    }
  }

  // Cache lookup
  const cacheKey = query.toLowerCase();
  const cached = geoCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < GEO_CACHE_TTL) {
    res.json({ success: true, count: cached.results.length, results: cached.results, cached: true });
    return;
  }

  const results: GeocodingItem[] = [];

  // 2. Primary: Open-Meteo Geocoding API
  try {
    const openMeteoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query
    )}&count=10&language=en&format=json`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    const omRes = await fetch(openMeteoUrl, { signal: controller.signal });
    clearTimeout(timer);

    if (omRes.ok) {
      const data = await omRes.json();
      if (Array.isArray(data.results)) {
        for (const item of data.results) {
          const parts = [item.name];
          if (item.admin1 && item.admin1 !== item.name) parts.push(item.admin1);
          if (item.country) parts.push(item.country);

          results.push({
            id: `om-${item.id}`,
            name: item.name,
            displayName: parts.join(', '),
            latitude: Number(item.latitude),
            longitude: Number(item.longitude),
            country: item.country || 'Unknown',
            countryCode: item.country_code,
            region: item.admin1 || item.admin2,
            timezone: item.timezone,
            population: item.population,
            elevation: item.elevation,
            type: item.feature_code === 'PPLA' || item.feature_code === 'PPLC' ? 'City' : 'Town',
          });
        }
      }
    }
  } catch (err: any) {
    console.warn('[Geocoding] Open-Meteo geocoding notice:', err.message);
  }

  // 3. Fallback to Nominatim if 0 results
  if (results.length === 0) {
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
      )}&format=jsonv2&addressdetails=1&limit=8`;

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);

      const nomRes = await fetch(nominatimUrl, {
        headers: { 'Accept-Language': 'en' },
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (nomRes.ok) {
        const nomData = await nomRes.json();
        if (Array.isArray(nomData)) {
          for (const item of nomData) {
            const lat = parseFloat(item.lat);
            const lon = parseFloat(item.lon);
            const addr = item.address || {};
            const primaryName =
              addr.city || addr.town || addr.village || addr.suburb || item.name || item.display_name.split(',')[0];

            results.push({
              id: `osm-${item.place_id}`,
              name: primaryName,
              displayName: item.display_name,
              latitude: lat,
              longitude: lon,
              country: addr.country || 'Unknown',
              countryCode: addr.country_code?.toUpperCase(),
              region: addr.state || addr.county,
              type: 'City',
            });
          }
        }
      }
    } catch (err: any) {
      console.warn('[Geocoding] Nominatim geocoding notice:', err.message);
    }
  }

  // Deduplicate by close proximity (within ~5km)
  const deduped: GeocodingItem[] = [];
  for (const item of results) {
    const exists = deduped.some(
      (d) => Math.abs(d.latitude - item.latitude) < 0.05 && Math.abs(d.longitude - item.longitude) < 0.05
    );
    if (!exists) {
      deduped.push(item);
    }
  }

  if (deduped.length > 0) {
    geoCache.set(cacheKey, { timestamp: Date.now(), results: deduped });
  }

  res.json({
    success: true,
    count: deduped.length,
    results: deduped,
    cached: false,
  });
});
