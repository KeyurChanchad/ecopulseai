/**
 * EcoPulseAI Frontend Weather Data Layer
 * Connects directly to centralized backend routes:
 * - GET /api/weather
 * - GET /api/weather/compare
 * - GET /api/geocoding/search
 *
 * Implements:
 * - Direct Client-Side Open-Meteo Egress Fallback (handles cloud platform / Render shared IP rate limits gracefully)
 * - Request deduplication (single flight for identical coordinates)
 * - Safe in-memory caching with 5-minute TTL
 * - Human-readable unit formatters (°C/°F, km/h, compass, AQI)
 */

import {
  NormalizedWeatherBundle,
  WeatherObservation,
  WeatherComparisonResult,
  NormalizedDailyForecast,
  NormalizedHourlyForecast,
  NormalizedAirQuality,
} from '../types';

// In-flight request deduplication map
const pendingRequests = new Map<string, Promise<NormalizedWeatherBundle>>();

// In-memory client cache to protect against rapid redundant network requests
const clientWeatherCache = new Map<string, { data: NormalizedWeatherBundle; timestamp: number }>();
const CLIENT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// WMO WEATHER CODES & NORMALIZATION HELPERS
// ============================================================================

export function interpretWeatherCode(code: number | null | undefined): string {
  if (code === null || code === undefined) return 'Unknown conditions';
  const codes: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snowfall',
    73: 'Moderate snowfall',
    75: 'Heavy snowfall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return codes[code] ?? `WMO Code ${code}`;
}

export function getWeatherIcon(code: number | null | undefined, isDay = true): string {
  if (code === null || code === undefined) return isDay ? 'Sun' : 'Moon';
  if (code === 0) return isDay ? 'Sun' : 'Moon';
  if (code === 1 || code === 2) return isDay ? 'CloudSun' : 'CloudMoon';
  if (code === 3) return 'Cloud';
  if (code === 45 || code === 48) return 'CloudFog';
  if (code >= 51 && code <= 57) return 'CloudDrizzle';
  if (code >= 61 && code <= 67) return 'CloudRain';
  if (code >= 71 && code <= 77) return 'CloudSnow';
  if (code >= 80 && code <= 82) return 'CloudRainWind';
  if (code >= 85 && code <= 86) return 'CloudSnow';
  if (code >= 95) return 'CloudLightning';
  return 'Cloud';
}

export function degreesToCardinal(deg: number | null | undefined): string {
  if (deg === null || deg === undefined || isNaN(deg)) return 'N';
  const dirs = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW',
  ];
  const idx = Math.round(((deg % 360) + 360) / 22.5) % 16;
  return dirs[idx] ?? 'N';
}

export function aqiToStatus(aqi: number | null | undefined): string {
  if (aqi === null || aqi === undefined || isNaN(aqi)) return 'DATA_UNAVAILABLE';
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

export function getAqiHealthRecommendation(aqi: number | null | undefined): string {
  if (aqi === null || aqi === undefined) return 'Air quality data is currently not reported for this grid.';
  if (aqi <= 50) return 'Air quality is considered satisfactory, and air pollution poses little or no risk.';
  if (aqi <= 100) return 'Air quality is acceptable; however, unusually sensitive individuals should consider limiting prolonged outdoor exertion.';
  if (aqi <= 150) return 'Members of sensitive groups may experience health effects. General public is less likely to be affected.';
  if (aqi <= 200) return 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious effects.';
  if (aqi <= 300) return 'Health alert: The risk of health effects is increased for everyone. Avoid prolonged outdoor exertion.';
  return 'Health warning of emergency conditions: The entire population is likely to be affected. Stay indoors.';
}

/**
 * Direct client-side Open-Meteo fetch implementation.
 * Queries Open-Meteo directly from the user's browser (residential/mobile IP),
 * bypassing shared cloud datacenter IP throttling on platforms like Render.
 */
async function fetchOpenMeteoDirectClient(
  lat: number,
  lon: number,
  signal?: AbortSignal
): Promise<NormalizedWeatherBundle> {
  const currentFields = [
    'temperature_2m',
    'relative_humidity_2m',
    'apparent_temperature',
    'is_day',
    'precipitation',
    'weather_code',
    'cloud_cover',
    'pressure_msl',
    'surface_pressure',
    'wind_speed_10m',
    'wind_direction_10m',
    'wind_gusts_10m',
    'shortwave_radiation',
    'direct_normal_irradiance',
  ].join(',');

  const dailyFields = [
    'weather_code',
    'temperature_2m_max',
    'temperature_2m_min',
    'apparent_temperature_max',
    'apparent_temperature_min',
    'sunrise',
    'sunset',
    'uv_index_max',
    'precipitation_sum',
    'precipitation_probability_max',
    'wind_speed_10m_max',
    'wind_gusts_10m_max',
    'wind_direction_10m_dominant',
  ].join(',');

  const hourlyFields = [
    'temperature_2m',
    'relative_humidity_2m',
    'dew_point_2m',
    'apparent_temperature',
    'precipitation_probability',
    'precipitation',
    'weather_code',
    'pressure_msl',
    'cloud_cover',
    'visibility',
    'wind_speed_10m',
    'wind_direction_10m',
    'wind_gusts_10m',
    'uv_index',
  ].join(',');

  const forecastUrl =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat.toFixed(6)}&longitude=${lon.toFixed(6)}` +
    `&current=${currentFields}` +
    `&daily=${dailyFields}` +
    `&hourly=${hourlyFields}` +
    `&timezone=auto` +
    `&forecast_days=7` +
    `&forecast_hours=48`;

  const aqUrl =
    `https://air-quality-api.open-meteo.com/v1/air-quality` +
    `?latitude=${lat.toFixed(6)}&longitude=${lon.toFixed(6)}` +
    `&current=us_aqi,european_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,uv_index` +
    `&timezone=auto`;

  const [forecastRes, aqRes] = await Promise.allSettled([
    fetch(forecastUrl, { signal }),
    fetch(aqUrl, { signal }),
  ]);

  if (forecastRes.status !== 'fulfilled' || !forecastRes.value.ok) {
    throw new Error('Direct Open-Meteo client query failed');
  }

  const forecastData = await forecastRes.value.json();
  let aqData: any = {};
  if (aqRes.status === 'fulfilled' && aqRes.value.ok) {
    try {
      aqData = await aqRes.value.json();
    } catch {
      aqData = {};
    }
  }

  const retrievalTimestamp = new Date().toISOString();
  const cur = forecastData.current ?? {};
  const obsTime: string = cur.time ?? retrievalTimestamp;
  const timezone: string = forecastData.timezone ?? 'UTC';

  const airTemp: number | null = cur.temperature_2m != null ? Math.round(Number(cur.temperature_2m) * 10) / 10 : null;
  const feelsLike: number | null = cur.apparent_temperature != null ? Math.round(Number(cur.apparent_temperature) * 10) / 10 : null;
  const humidity: number | null = cur.relative_humidity_2m != null ? Math.round(Number(cur.relative_humidity_2m)) : null;
  const windSpeed: number | null = cur.wind_speed_10m != null ? Math.round(Number(cur.wind_speed_10m) * 10) / 10 : null;
  const windDeg: number | null = cur.wind_direction_10m != null ? Math.round(Number(cur.wind_direction_10m)) : null;
  const windCardinal = degreesToCardinal(windDeg);
  const windGusts: number | null = cur.wind_gusts_10m != null ? Math.round(Number(cur.wind_gusts_10m) * 10) / 10 : null;
  const precip: number | null = cur.precipitation != null ? Math.round(Number(cur.precipitation) * 10) / 10 : null;
  const weatherCode: number | null = cur.weather_code != null ? Number(cur.weather_code) : null;
  const isDay: boolean | null = cur.is_day != null ? Boolean(cur.is_day) : true;
  const solar: number | null = cur.shortwave_radiation != null
    ? Math.round(Number(cur.shortwave_radiation))
    : cur.direct_normal_irradiance != null
    ? Math.round(Number(cur.direct_normal_irradiance))
    : null;

  const dailyLow: number | null = forecastData.daily?.temperature_2m_min?.[0] != null
    ? Math.round(Number(forecastData.daily.temperature_2m_min[0]) * 10) / 10
    : null;
  const dailyHigh: number | null = forecastData.daily?.temperature_2m_max?.[0] != null
    ? Math.round(Number(forecastData.daily.temperature_2m_max[0]) * 10) / 10
    : null;

  let surfaceTemp: number | null = null;
  if (airTemp !== null) {
    if (solar !== null && solar > 0) {
      surfaceTemp = Math.round((airTemp + Math.max(1.0, (solar / 1000) * 11.5)) * 10) / 10;
    } else {
      surfaceTemp = Math.round((airTemp + 2.5) * 10) / 10;
    }
  }

  let dewPoint: number | null = null;
  if (forecastData.hourly?.dew_point_2m && Array.isArray(forecastData.hourly.time)) {
    const currentHour = obsTime.slice(0, 13);
    const idx = (forecastData.hourly.time as string[]).findIndex((t) => t.startsWith(currentHour));
    if (idx >= 0 && forecastData.hourly.dew_point_2m[idx] != null) {
      dewPoint = Math.round(Number(forecastData.hourly.dew_point_2m[idx]) * 10) / 10;
    }
  }
  if (dewPoint === null && airTemp !== null && humidity !== null) {
    const a = 17.368, b = 238.88;
    const gamma = Math.log(humidity / 100) + (a * airTemp) / (b + airTemp);
    dewPoint = Math.round(((b * gamma) / (a - gamma)) * 10) / 10;
  }

  // Daily forecasts (7 days)
  const dailyForecasts: NormalizedDailyForecast[] = [];
  if (forecastData.daily?.time && Array.isArray(forecastData.daily.time)) {
    const count = Math.min(forecastData.daily.time.length, 7);
    for (let i = 0; i < count; i++) {
      const dCode = forecastData.daily.weather_code?.[i] != null ? Number(forecastData.daily.weather_code[i]) : null;
      dailyForecasts.push({
        date: forecastData.daily.time[i],
        temperatureMin: forecastData.daily.temperature_2m_min?.[i] != null ? Math.round(Number(forecastData.daily.temperature_2m_min[i]) * 10) / 10 : null,
        temperatureMax: forecastData.daily.temperature_2m_max?.[i] != null ? Math.round(Number(forecastData.daily.temperature_2m_max[i]) * 10) / 10 : null,
        apparentTemperatureMin: forecastData.daily.apparent_temperature_min?.[i] != null ? Math.round(Number(forecastData.daily.apparent_temperature_min[i]) * 10) / 10 : null,
        apparentTemperatureMax: forecastData.daily.apparent_temperature_max?.[i] != null ? Math.round(Number(forecastData.daily.apparent_temperature_max[i]) * 10) / 10 : null,
        precipitationProbability: forecastData.daily.precipitation_probability_max?.[i] != null ? Number(forecastData.daily.precipitation_probability_max[i]) : null,
        precipitationSum: forecastData.daily.precipitation_sum?.[i] != null ? Math.round(Number(forecastData.daily.precipitation_sum[i]) * 10) / 10 : null,
        weatherCode: dCode,
        condition: interpretWeatherCode(dCode),
        icon: getWeatherIcon(dCode, true),
        sunrise: forecastData.daily.sunrise?.[i] ?? null,
        sunset: forecastData.daily.sunset?.[i] ?? null,
        uvIndexMax: forecastData.daily.uv_index_max?.[i] != null ? Math.round(Number(forecastData.daily.uv_index_max[i]) * 10) / 10 : null,
        windSpeedMax: forecastData.daily.wind_speed_10m_max?.[i] != null ? Math.round(Number(forecastData.daily.wind_speed_10m_max[i]) * 10) / 10 : null,
        windGustsMax: forecastData.daily.wind_gusts_10m_max?.[i] != null ? Math.round(Number(forecastData.daily.wind_gusts_10m_max[i]) * 10) / 10 : null,
        windDirectionDominant: degreesToCardinal(forecastData.daily.wind_direction_10m_dominant?.[i]),
      });
    }
  }

  // Hourly forecasts (24-48 hours)
  const hourlyForecasts: NormalizedHourlyForecast[] = [];
  if (forecastData.hourly?.time && Array.isArray(forecastData.hourly.time)) {
    const currentHourPrefix = obsTime.slice(0, 13);
    let startIdx = (forecastData.hourly.time as string[]).findIndex((t) => t.startsWith(currentHourPrefix));
    if (startIdx < 0) startIdx = 0;
    const endIdx = Math.min(forecastData.hourly.time.length, startIdx + 24);

    for (let i = startIdx; i < endIdx; i++) {
      const hCode = forecastData.hourly.weather_code?.[i] != null ? Number(forecastData.hourly.weather_code[i]) : null;
      const hDeg = forecastData.hourly.wind_direction_10m?.[i] != null ? Number(forecastData.hourly.wind_direction_10m[i]) : null;
      hourlyForecasts.push({
        timestamp: forecastData.hourly.time[i],
        temperature: forecastData.hourly.temperature_2m?.[i] != null ? Math.round(Number(forecastData.hourly.temperature_2m[i]) * 10) / 10 : null,
        feelsLike: forecastData.hourly.apparent_temperature?.[i] != null ? Math.round(Number(forecastData.hourly.apparent_temperature[i]) * 10) / 10 : null,
        humidity: forecastData.hourly.relative_humidity_2m?.[i] != null ? Math.round(Number(forecastData.hourly.relative_humidity_2m[i])) : null,
        dewPoint: forecastData.hourly.dew_point_2m?.[i] != null ? Math.round(Number(forecastData.hourly.dew_point_2m[i]) * 10) / 10 : null,
        precipitationProbability: forecastData.hourly.precipitation_probability?.[i] != null ? Number(forecastData.hourly.precipitation_probability[i]) : null,
        precipitation: forecastData.hourly.precipitation?.[i] != null ? Math.round(Number(forecastData.hourly.precipitation[i]) * 10) / 10 : null,
        weatherCode: hCode,
        condition: interpretWeatherCode(hCode),
        icon: getWeatherIcon(hCode, true),
        windSpeed: forecastData.hourly.wind_speed_10m?.[i] != null ? Math.round(Number(forecastData.hourly.wind_speed_10m[i]) * 10) / 10 : null,
        windDirection: hDeg,
        windDirectionCardinal: degreesToCardinal(hDeg),
        windGusts: forecastData.hourly.wind_gusts_10m?.[i] != null ? Math.round(Number(forecastData.hourly.wind_gusts_10m[i]) * 10) / 10 : null,
        pressureHpa: forecastData.hourly.pressure_msl?.[i] != null ? Math.round(Number(forecastData.hourly.pressure_msl[i])) : null,
        cloudCover: forecastData.hourly.cloud_cover?.[i] != null ? Math.round(Number(forecastData.hourly.cloud_cover[i])) : null,
        visibilityKm: forecastData.hourly.visibility?.[i] != null ? Math.round((Number(forecastData.hourly.visibility[i]) / 1000) * 10) / 10 : null,
        uvIndex: forecastData.hourly.uv_index?.[i] != null ? Math.round(Number(forecastData.hourly.uv_index[i]) * 10) / 10 : null,
      });
    }
  }

  const aqCur = aqData.current ?? {};
  const usAqi: number | null = aqCur.us_aqi != null ? Math.round(Number(aqCur.us_aqi)) : null;
  const euAqi: number | null = aqCur.european_aqi != null ? Math.round(Number(aqCur.european_aqi)) : null;

  const airQuality: NormalizedAirQuality = {
    aqi: usAqi,
    aqiScale: usAqi !== null ? 'US AQI (0-500)' : 'Unknown',
    aqiCategory: aqiToStatus(usAqi),
    aqiEuropean: euAqi,
    pm25: aqCur.pm2_5 != null ? Math.round(Number(aqCur.pm2_5) * 10) / 10 : null,
    pm10: aqCur.pm10 != null ? Math.round(Number(aqCur.pm10) * 10) / 10 : null,
    nitrogenDioxide: aqCur.nitrogen_dioxide != null ? Math.round(Number(aqCur.nitrogen_dioxide) * 10) / 10 : null,
    ozone: aqCur.ozone != null ? Math.round(Number(aqCur.ozone) * 10) / 10 : null,
    sulphurDioxide: aqCur.sulphur_dioxide != null ? Math.round(Number(aqCur.sulphur_dioxide) * 10) / 10 : null,
    carbonMonoxide: aqCur.carbon_monoxide != null ? Math.round(Number(aqCur.carbon_monoxide)) : null,
    uvIndex: aqCur.uv_index != null ? Math.round(Number(aqCur.uv_index) * 10) / 10 : null,
    observedAt: aqCur.time ?? obsTime,
    isModelled: true,
    stationName: 'Copernicus CAMS Model (Open-Meteo Direct)',
    healthRecommendation: getAqiHealthRecommendation(usAqi),
  };

  return {
    location: {
      id: `coord-${lat.toFixed(4)}-${lon.toFixed(4)}`,
      latitude: Number(forecastData.latitude ?? lat),
      longitude: Number(forecastData.longitude ?? lon),
      name: `Coordinates (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
      city: `GIS Point`,
      country: 'Global Grid',
      address: `Latitude: ${lat.toFixed(4)}, Longitude: ${lon.toFixed(4)}`,
      timezone,
      elevationMeters: forecastData.elevation != null ? Math.round(Number(forecastData.elevation)) : 25,
      climateZone: 'Planetary Grid Cell',
      analysisRadius: '5km',
    },
    current: {
      temperature: airTemp,
      feelsLike,
      temperatureMin: dailyLow,
      temperatureMax: dailyHigh,
      humidity,
      dewPoint,
      windSpeed,
      windDirection: windDeg,
      windDirectionCardinal: windCardinal,
      windGusts,
      precipitation: precip,
      precipitationProbability: forecastData.daily?.precipitation_probability_max?.[0] != null ? Number(forecastData.daily.precipitation_probability_max[0]) : null,
      weatherCode,
      condition: interpretWeatherCode(weatherCode),
      icon: getWeatherIcon(weatherCode, isDay ?? true),
      cloudCover: cur.cloud_cover != null ? Math.round(Number(cur.cloud_cover)) : null,
      pressureHpa: cur.pressure_msl != null ? Math.round(Number(cur.pressure_msl)) : null,
      visibilityKm: forecastData.hourly?.visibility?.[0] != null ? Math.round((Number(forecastData.hourly.visibility[0]) / 1000) * 10) / 10 : null,
      uvIndex: forecastData.daily?.uv_index_max?.[0] != null ? Math.round(Number(forecastData.daily.uv_index_max[0]) * 10) / 10 : null,
      isDay,
      sunrise: forecastData.daily?.sunrise?.[0] ?? null,
      sunset: forecastData.daily?.sunset?.[0] ?? null,
      observedAt: obsTime,
      solarRadiation: solar,
      surfaceTemperatureEstimate: surfaceTemp,
    },
    daily: dailyForecasts,
    hourly: hourlyForecasts,
    airQuality,
    metadata: {
      provider: 'Open-Meteo (Client Direct · Resilient Egress)',
      fetchedAt: retrievalTimestamp,
      dataTimestamp: obsTime,
      dataType: 'LIVE_OBSERVATION',
      units: {
        temperature: '°C',
        windSpeed: 'km/h',
        precipitation: 'mm',
        pressure: 'hPa',
        pollutants: 'µg/m³',
        distance: 'km',
      },
      isStale: false,
      attribution: 'Weather data by Open-Meteo.com (CC BY 4.0). Air quality by Copernicus Atmosphere Monitoring Service.',
      licensingUrl: 'https://open-meteo.com/en/terms',
    },
  };
}

/**
 * Fetches real-time weather from centralized backend endpoint `/api/weather`.
 * If the backend is unavailable or rate-limited (e.g. Render shared IP getting 429/503),
 * transparently falls back to direct browser query to Open-Meteo.
 */
export async function fetchLiveWeatherBundle(
  lat: number,
  lon: number,
  signal?: AbortSignal
): Promise<NormalizedWeatherBundle> {
  const flightKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;

  // 1. Check client-side memory cache
  const cached = clientWeatherCache.get(flightKey);
  if (cached && Date.now() - cached.timestamp < CLIENT_CACHE_TTL_MS) {
    return cached.data;
  }

  // 2. Deduplicate in-flight requests
  if (pendingRequests.has(flightKey)) {
    const existing = await pendingRequests.get(flightKey);
    if (existing) return existing;
  }

  const requestPromise = (async (): Promise<NormalizedWeatherBundle> => {
    // Attempt backend first
    try {
      const url = `/api/weather?lat=${lat.toFixed(6)}&lon=${lon.toFixed(6)}`;
      const response = await fetch(url, { signal });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.current) {
          const bundle: NormalizedWeatherBundle = {
            location: json.location,
            current: json.current,
            daily: json.daily || [],
            hourly: json.hourly || [],
            airQuality: json.airQuality,
            metadata: json.metadata,
          };
          clientWeatherCache.set(flightKey, { data: bundle, timestamp: Date.now() });
          return bundle;
        }
      } else {
        console.warn(`[WeatherApi] Backend /api/weather returned HTTP ${response.status}. Initiating direct client-side fallback.`);
      }
    } catch (backendErr: any) {
      if (backendErr.name === 'AbortError') throw backendErr;
      console.warn('[WeatherApi] Backend /api/weather unreachable. Initiating direct client-side fallback:', backendErr.message);
    }

    // Direct browser query to Open-Meteo (bypasses Render datacenter IP 429 throttling)
    const directBundle = await fetchOpenMeteoDirectClient(lat, lon, signal);
    clientWeatherCache.set(flightKey, { data: directBundle, timestamp: Date.now() });
    return directBundle;
  })();

  pendingRequests.set(flightKey, requestPromise);

  try {
    const result = await requestPromise;
    return result;
  } finally {
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
  try {
    const url = `/api/weather/compare?lat=${lat.toFixed(6)}&lon=${lon.toFixed(6)}`;
    const res = await fetch(url, { signal });
    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        return json as WeatherComparisonResult;
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
    console.warn('[WeatherApi] Comparison route failed, building fallback comparison:', err.message);
  }

  // Graceful comparison fallback using the primary bundle
  const bundle = await fetchLiveWeatherBundle(lat, lon, signal);
  return {
    coordinates: { lat, lon },
    retrievedAt: new Date().toISOString(),
    primary: {
      name: 'Open-Meteo (NOAA GFS & ECMWF IFS)',
      configured: true,
      data: bundle,
      error: null,
      isStale: false,
    },
    secondary: {
      name: 'WeatherAPI.com',
      configured: false,
      data: null,
      error: 'Secondary provider is in standby or WEATHERAPI_KEY is not configured in backend environment.',
      isStale: false,
    },
    fields: [
      {
        label: 'Air Temperature',
        unit: '°C',
        primaryValue: bundle.current.temperature != null ? bundle.current.temperature : 'N/A',
        secondaryValue: 'Pending Key',
        delta: '--',
        interpretation: 'Primary provider reading active.',
      },
      {
        label: 'Feels-Like (Apparent)',
        unit: '°C',
        primaryValue: bundle.current.feelsLike != null ? bundle.current.feelsLike : 'N/A',
        secondaryValue: 'Pending Key',
        delta: '--',
        interpretation: 'Apparent heat index.',
      },
      {
        label: 'Relative Humidity',
        unit: '%',
        primaryValue: bundle.current.humidity != null ? bundle.current.humidity : 'N/A',
        secondaryValue: 'Pending Key',
        delta: '--',
        interpretation: 'Moisture saturation level.',
      },
      {
        label: 'Wind Speed',
        unit: 'km/h',
        primaryValue: bundle.current.windSpeed != null ? bundle.current.windSpeed : 'N/A',
        secondaryValue: 'Pending Key',
        delta: '--',
        interpretation: '10m anemometer speed.',
      },
      {
        label: 'Air Quality (US AQI)',
        unit: 'AQI',
        primaryValue: bundle.airQuality.aqi != null ? `${bundle.airQuality.aqi} (${bundle.airQuality.aqiCategory})` : 'N/A',
        secondaryValue: 'Pending Key',
        delta: '--',
        interpretation: 'Copernicus CAMS atmospheric analysis.',
      },
    ],
    evaluationSummary: 'Primary weather observations are actively verified via Open-Meteo GFS/ECMWF feeds.',
    attribution: {
      primary: 'Weather data by Open-Meteo.com (CC BY 4.0)',
      secondary: 'Weather data provided by WeatherAPI.com',
    },
  };
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
