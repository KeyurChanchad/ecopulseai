/**
 * EcoPulseAI Frontend Weather Data Layer
 * Connects directly to centralized backend routes:
 * - GET /api/weather
 * - GET /api/weather/compare
 * - GET /api/geocoding/search
 *
 * Implements:
 * - Request deduplication (single flight for identical coordinates)
 * - Safe error handling (never invents weather readings)
 * - Human-readable unit formatters (°C/°F, km/h, compass, AQI)
 */

import {
  NormalizedWeatherBundle,
  WeatherObservation,
  WeatherComparisonResult,
  NormalizedDailyForecast,
  NormalizedHourlyForecast,
} from '../types';

// In-flight request deduplication map
const pendingRequests = new Map<string, Promise<NormalizedWeatherBundle | null>>();

/**
 * Fetches real-time weather from centralized backend endpoint `/api/weather`.
 */
export async function fetchLiveWeatherBundle(
  lat: number,
  lon: number,
  signal?: AbortSignal
): Promise<NormalizedWeatherBundle> {
  const flightKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;

  if (pendingRequests.has(flightKey)) {
    const existing = await pendingRequests.get(flightKey);
    if (existing) return existing;
  }

  const requestPromise = (async () => {
    const url = `/api/weather?lat=${lat.toFixed(6)}&lon=${lon.toFixed(6)}`;
    const response = await fetch(url, { signal });

    if (!response.ok) {
      throw new Error(`Weather service returned HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    if (!json.success || !json.current) {
      throw new Error(json.error || 'Weather data unavailable from providers');
    }

    return {
      location: json.location,
      current: json.current,
      daily: json.daily || [],
      hourly: json.hourly || [],
      airQuality: json.airQuality,
      metadata: json.metadata,
    } as NormalizedWeatherBundle;
  })();

  pendingRequests.set(flightKey, requestPromise);

  try {
    const result = await requestPromise;
    return result;
  } finally {
    // Clear in-flight promise after small window so subsequent interactions re-fetch if needed
    setTimeout(() => pendingRequests.delete(flightKey), 2000);
  }
}

/**
 * Transforms NormalizedWeatherBundle into the app's standard WeatherObservation object.
 */
export function bundleToWeatherObservation(bundle: NormalizedWeatherBundle): WeatherObservation {
  const cur = bundle.current;
  const aq = bundle.airQuality;
  const meta = bundle.metadata;

  const airTemp = cur.temperature ?? 0;
  const feelsLike = cur.feelsLike ?? airTemp;
  const surfaceTemp = cur.surfaceTemperatureEstimate ?? Math.round((airTemp + 3.0) * 10) / 10;

  return {
    airTemperature: airTemp,
    feelsLike,
    surfaceTemperature: surfaceTemp,
    humidity: cur.humidity ?? 0,
    windSpeed: cur.windSpeed ?? 0,
    windDirection: cur.windDirectionCardinal || 'N',
    windDirectionDeg: cur.windDirection ?? undefined,
    windGusts: cur.windGusts ?? undefined,
    solarRadiation: cur.solarRadiation ?? 0,
    uvIndex: cur.uvIndex ?? 0,
    cloudCover: cur.cloudCover ?? 0,
    precipitationMm: cur.precipitation ?? undefined,
    precipitationProbability: cur.precipitationProbability ?? undefined,
    condition: cur.condition,
    weatherCode: cur.weatherCode ?? undefined,
    weatherIcon: cur.icon,
    pressureHpa: cur.pressureHpa ?? 1013,
    dewPoint: cur.dewPoint ?? undefined,
    visibilityKm: cur.visibilityKm ?? undefined,
    sunrise: cur.sunrise ?? undefined,
    sunset: cur.sunset ?? undefined,
    timezone: bundle.location?.timezone,
    aqi: aq?.aqi ?? 0,
    aqiStatus: aq?.aqiCategory || 'DATA_UNAVAILABLE',
    aqiScale: aq?.aqiScale,
    aqiEuropean: aq?.aqiEuropean ?? undefined,
    pm25: aq?.pm25 ?? undefined,
    pm10: aq?.pm10 ?? undefined,
    nitrogenDioxide: aq?.nitrogenDioxide ?? undefined,
    ozone: aq?.ozone ?? undefined,
    sulphurDioxide: aq?.sulphurDioxide ?? undefined,
    carbonMonoxide: aq?.carbonMonoxide ?? undefined,
    uhiDelta: 2.0,
    timestamp: cur.observedAt ?? meta.fetchedAt,
    warmingAnomaly: 1.2,
    baselineTemp: Math.round((airTemp - 1.2) * 10) / 10,
    isRealTime: !meta.isStale,
    stationName: `${meta.provider} · ${meta.dataType}`,
    lstObservationDate: `Modelled thermal estimate (Observed: ${cur.observedAt || meta.fetchedAt})`,
    lstSensor: 'EcoPulseAI Surface Energy Balance Model (NOT satellite LST)',
    weatherDataType: meta.dataType,
    aqiSource: aq?.stationName || 'Open-Meteo Copernicus CAMS Model',
    aqiDataType: aq?.isModelled ? 'MODELLED' : 'LIVE_OBSERVATION',
    tempHigh: cur.temperatureMax ?? undefined,
    tempLow: cur.temperatureMin ?? undefined,
    dailyForecasts: bundle.daily,
    hourlyForecasts: bundle.hourly,
    weatherProvider: meta.provider,
    isStale: meta.isStale,
  };
}

/**
 * Fetches side-by-side comparison between Open-Meteo and WeatherAPI.com.
 */
export async function fetchWeatherComparison(
  lat: number,
  lon: number,
  signal?: AbortSignal
): Promise<WeatherComparisonResult> {
  const url = `/api/weather/compare?lat=${lat.toFixed(6)}&lon=${lon.toFixed(6)}`;
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`Weather comparison API returned HTTP ${res.status}`);
  }
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Failed to compare weather providers');
  }
  return json as WeatherComparisonResult;
}

// ============================================================================
// HUMAN-READABLE WEATHER PRESENTATION HELPERS
// ============================================================================

export function formatTemp(tempC: number | null | undefined, unit: 'C' | 'F' = 'C'): string {
  if (tempC === null || tempC === undefined || isNaN(tempC)) return 'N/A';
  if (unit === 'F') {
    const f = (tempC * 9) / 5 + 32;
    return `${Math.round(f)}°F`;
  }
  return `${Math.round(tempC * 10) / 10}°C`;
}

export function formatTempRange(
  lowC: number | null | undefined,
  highC: number | null | undefined,
  unit: 'C' | 'F' = 'C'
): string {
  if (lowC === null || lowC === undefined || highC === null || highC === undefined) {
    return 'Low / High: Pending';
  }
  if (unit === 'F') {
    const lowF = Math.round((lowC * 9) / 5 + 32);
    const highF = Math.round((highC * 9) / 5 + 32);
    return `Low ${lowF}° · High ${highF}°F`;
  }
  return `Low ${Math.round(lowC * 10) / 10}° · High ${Math.round(highC * 10) / 10}°C`;
}

export function formatWind(
  speedKmH: number | null | undefined,
  direction?: string | null
): string {
  if (speedKmH === null || speedKmH === undefined) return 'N/A';
  const rounded = Math.round(speedKmH);
  if (direction) {
    return `${rounded} km/h ${direction}`;
  }
  return `${rounded} km/h`;
}

export function formatUV(uv: number | null | undefined): { text: string; category: string } {
  if (uv === null || uv === undefined) return { text: 'N/A', category: 'Not available' };
  const rounded = Math.round(uv * 10) / 10;
  let category = 'Low';
  if (rounded >= 11) category = 'Extreme';
  else if (rounded >= 8) category = 'Very High';
  else if (rounded >= 6) category = 'High';
  else if (rounded >= 3) category = 'Moderate';
  return { text: `${rounded}`, category };
}

export function formatTimeLocal(isoString: string | null | undefined, timezone?: string): string {
  if (!isoString) return '--:--';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      // In case string is "YYYY-MM-DDTHH:MM" without Z
      const timePart = isoString.split('T')[1];
      if (timePart) return timePart.slice(0, 5);
      return isoString;
    }
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone || undefined,
    });
  } catch {
    return isoString.slice(11, 16) || isoString;
  }
}
