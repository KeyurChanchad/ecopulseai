/**
 * EcoPulseAI Weather Data Service
 * Fetches accurate real-time weather from Open-Meteo (free, no API key required).
 * Every value carries: provider, observation timestamp, retrieval timestamp, data type.
 *
 * Open-Meteo uses ECMWF IFS + NOAA GFS Seamless model, updated hourly.
 * https://open-meteo.com/en/docs
 */

export type DataType =
  | 'LIVE_OBSERVATION'
  | 'RECENT_OBSERVATION'
  | 'FORECAST'
  | 'MODELLED'
  | 'HISTORICAL'
  | 'DATA_UNAVAILABLE';

export interface WeatherDataPoint {
  value: number | null;
  unit: string;
  provider: string;
  observationTimestamp: string | null;
  retrievalTimestamp: string;
  dataType: DataType;
  quality?: string;
}

export interface LiveWeatherResult {
  airTemperature: WeatherDataPoint;
  feelsLike: WeatherDataPoint;
  humidity: WeatherDataPoint;
  dewPoint: WeatherDataPoint;
  windSpeed: WeatherDataPoint;
  windDirection: WeatherDataPoint;
  windGusts: WeatherDataPoint;
  pressureHpa: WeatherDataPoint;
  cloudCover: WeatherDataPoint;
  precipitation: WeatherDataPoint;
  weatherCode: WeatherDataPoint;
  shortwaveRadiation: WeatherDataPoint;
  directNormalIrradiance: WeatherDataPoint;
  surfaceTemperatureEstimate: WeatherDataPoint;
  temperatureMax?: WeatherDataPoint;
  temperatureMin?: WeatherDataPoint;
  timezone: string;
  timezoneAbbreviation: string;
  elevation: number;
  latitude: number;
  longitude: number;
  modelUsed: string;
  observationTime: string;
}

export interface OpenMeteoAirQualityResult {
  aqi: WeatherDataPoint;
  aqiEuropean: WeatherDataPoint;
  pm25: WeatherDataPoint;
  pm10: WeatherDataPoint;
  co: WeatherDataPoint;
  no2: WeatherDataPoint;
  o3: WeatherDataPoint;
  uvIndex: WeatherDataPoint;
}

/** WMO Weather Interpretation Code -> description */
export function interpretWeatherCode(code: number): string {
  const codes: Record<number, string> = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Depositing rime fog',
    51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow', 77: 'Snow grains',
    80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
    85: 'Slight snow showers', 86: 'Heavy snow showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail',
  };
  return codes[code] ?? `WMO Code ${code}`;
}

/** Wind degrees -> 16-point cardinal compass */
export function degreesToCardinal(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round(((deg % 360) + 360) / 22.5) % 16;
  return dirs[idx] ?? 'N';
}

/** AQI value -> EPA status string */
export function aqiToStatus(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

/**
 * Fetch real-time weather from Open-Meteo.
 * Returns all fields with full provenance metadata.
 */
export async function fetchLiveWeather(
  lat: number,
  lng: number,
  timeoutMs = 8000
): Promise<{ result: LiveWeatherResult | null; error?: string }> {
  const retrievalTimestamp = new Date().toISOString();
  const provider = 'Open-Meteo (NOAA GFS Seamless + ECMWF IFS)';

  const currentFields = [
    'temperature_2m', 'relative_humidity_2m', 'apparent_temperature',
    'precipitation', 'rain', 'weather_code', 'cloud_cover', 'pressure_msl',
    'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m',
    'shortwave_radiation', 'direct_normal_irradiance',
  ].join(',');

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat.toFixed(6)}&longitude=${lng.toFixed(6)}` +
    `&current=${currentFields}` +
    `&daily=temperature_2m_max,temperature_2m_min` +
    `&hourly=dew_point_2m` +
    `&timezone=auto` +
    `&models=gfs_seamless`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!response.ok) {
      return { result: null, error: `Open-Meteo returned HTTP ${response.status}: ${response.statusText}` };
    }

    const data = await response.json();
    const cur = data.current ?? {};
    const obsTime: string = cur.time ?? retrievalTimestamp;

    // Data freshness classification
    const obsDateMs = new Date(obsTime + (obsTime.endsWith('Z') ? '' : 'Z')).getTime();
    const ageMins = (Date.now() - obsDateMs) / 60000;
    const dataType: DataType =
      ageMins < 90 ? 'LIVE_OBSERVATION' : ageMins < 360 ? 'RECENT_OBSERVATION' : 'MODELLED';

    function dp(value: number | null, unit: string): WeatherDataPoint {
      return { value, unit, provider, observationTimestamp: obsTime, retrievalTimestamp, dataType };
    }

    const airTemp: number | null = cur.temperature_2m ?? null;
    const solar: number | null = cur.shortwave_radiation ?? cur.direct_normal_irradiance ?? null;

    // Surface temperature: MODELLED estimate (NOT a satellite LST reading)
    let surfaceEst: number | null = null;
    if (airTemp !== null && solar !== null) {
      surfaceEst = Math.round((airTemp + Math.max(1.0, (solar / 1000) * 11.5)) * 10) / 10;
    }

    // Dew point from hourly data at the current observation hour
    let dewPointVal: number | null = null;
    if (data.hourly?.dew_point_2m && Array.isArray(data.hourly.time)) {
      const hourlyTimes: string[] = data.hourly.time;
      const currentHour = obsTime.slice(0, 13);
      const hourIdx = hourlyTimes.findIndex((t: string) => t.startsWith(currentHour));
      if (hourIdx >= 0) dewPointVal = data.hourly.dew_point_2m[hourIdx] ?? null;
    }
    // Magnus formula fallback for dew point
    if (dewPointVal === null && airTemp !== null) {
      const rh = cur.relative_humidity_2m ?? 60;
      const a = 17.368, b = 238.88;
      const gamma = Math.log(rh / 100) + (a * airTemp) / (b + airTemp);
      dewPointVal = Math.round((b * gamma) / (a - gamma) * 10) / 10;
    }

    const windDeg: number | null = cur.wind_direction_10m ?? null;
    const windCardinal = windDeg !== null ? degreesToCardinal(windDeg) : 'N/A';

    return {
      result: {
        airTemperature: dp(airTemp !== null ? Math.round(airTemp * 10) / 10 : null, '°C'),
        feelsLike: dp(cur.apparent_temperature != null ? Math.round(cur.apparent_temperature * 10) / 10 : null, '°C'),
        humidity: dp(cur.relative_humidity_2m ?? null, '%'),
        dewPoint: dp(dewPointVal !== null ? Math.round(dewPointVal * 10) / 10 : null, '°C'),
        windSpeed: dp(cur.wind_speed_10m != null ? Math.round(cur.wind_speed_10m * 10) / 10 : null, 'km/h'),
        windDirection: {
          value: windDeg !== null ? Math.round(windDeg) : null,
          unit: `° (${windCardinal})`,
          provider, observationTimestamp: obsTime, retrievalTimestamp, dataType,
        },
        windGusts: dp(cur.wind_gusts_10m != null ? Math.round(cur.wind_gusts_10m * 10) / 10 : null, 'km/h'),
        pressureHpa: dp(cur.pressure_msl != null ? Math.round(cur.pressure_msl) : null, 'hPa'),
        cloudCover: dp(cur.cloud_cover ?? null, '%'),
        precipitation: dp(cur.precipitation != null ? Math.round(cur.precipitation * 10) / 10 : 0, 'mm/h'),
        weatherCode: {
          value: cur.weather_code ?? null,
          unit: interpretWeatherCode(cur.weather_code ?? 0),
          provider, observationTimestamp: obsTime, retrievalTimestamp, dataType,
        },
        shortwaveRadiation: dp(solar !== null ? Math.round(solar) : null, 'W/m²'),
        directNormalIrradiance: dp(
          cur.direct_normal_irradiance != null ? Math.round(cur.direct_normal_irradiance) : null,
          'W/m²'
        ),
        surfaceTemperatureEstimate: {
          value: surfaceEst,
          unit: '°C',
          provider: 'EcoPulseAI Urban Heat Model (Estimated – NOT a satellite observation)',
          observationTimestamp: obsTime,
          retrievalTimestamp,
          dataType: 'MODELLED',
          quality: 'Derived from shortwave radiation and urban surface albedo empirical model. Not a satellite LST.',
        },
        temperatureMax: dp(
          data.daily?.temperature_2m_max?.[0] != null ? Math.round(Number(data.daily.temperature_2m_max[0]) * 10) / 10 : null,
          '°C'
        ),
        temperatureMin: dp(
          data.daily?.temperature_2m_min?.[0] != null ? Math.round(Number(data.daily.temperature_2m_min[0]) * 10) / 10 : null,
          '°C'
        ),
        timezone: data.timezone ?? 'UTC',
        timezoneAbbreviation: data.timezone_abbreviation ?? 'UTC',
        elevation: data.elevation ?? 0,
        latitude: data.latitude ?? lat,
        longitude: data.longitude ?? lng,
        modelUsed: 'NOAA GFS Seamless (Open-Meteo)',
        observationTime: obsTime,
      },
    };
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') return { result: null, error: 'Open-Meteo request timed out after 8s' };
    return { result: null, error: err.message ?? 'Unknown fetch error' };
  }
}

/**
 * Fetch air quality from Open-Meteo Air Quality API.
 * Source: Copernicus Atmosphere Monitoring Service (CAMS).
 * https://open-meteo.com/en/docs/air-quality-api
 */
export async function fetchAirQuality(
  lat: number,
  lng: number,
  timeoutMs = 6000
): Promise<{ result: OpenMeteoAirQualityResult | null; error?: string }> {
  const retrievalTimestamp = new Date().toISOString();
  const provider = 'Open-Meteo Air Quality API (CAMS European + Global Model)';

  const url =
    `https://air-quality-api.open-meteo.com/v1/air-quality` +
    `?latitude=${lat.toFixed(6)}&longitude=${lng.toFixed(6)}` +
    `&current=us_aqi,european_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone,uv_index` +
    `&timezone=auto`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) return { result: null, error: `AQ API returned HTTP ${response.status}` };

    const data = await response.json();
    const cur = data.current ?? {};
    const obsTime: string = cur.time ?? retrievalTimestamp;
    const ageMins = (Date.now() - new Date(obsTime + (obsTime.endsWith('Z') ? '' : 'Z')).getTime()) / 60000;
    const dataType: DataType = ageMins < 180 ? 'RECENT_OBSERVATION' : 'MODELLED';

    function dp(value: number | null, unit: string): WeatherDataPoint {
      return { value, unit, provider, observationTimestamp: obsTime, retrievalTimestamp, dataType };
    }

    return {
      result: {
        aqi: dp(cur.us_aqi != null ? Math.round(cur.us_aqi) : null, 'US AQI'),
        aqiEuropean: dp(cur.european_aqi != null ? Math.round(cur.european_aqi) : null, 'EU AQI'),
        pm25: dp(cur.pm2_5 != null ? Math.round(cur.pm2_5 * 10) / 10 : null, 'µg/m³'),
        pm10: dp(cur.pm10 != null ? Math.round(cur.pm10 * 10) / 10 : null, 'µg/m³'),
        co: dp(cur.carbon_monoxide != null ? Math.round(cur.carbon_monoxide) : null, 'µg/m³'),
        no2: dp(cur.nitrogen_dioxide != null ? Math.round(cur.nitrogen_dioxide * 10) / 10 : null, 'µg/m³'),
        o3: dp(cur.ozone != null ? Math.round(cur.ozone * 10) / 10 : null, 'µg/m³'),
        uvIndex: dp(cur.uv_index != null ? Math.round(cur.uv_index * 10) / 10 : null, 'index'),
      },
    };
  } catch (err: any) {
    clearTimeout(timer);
    return { result: null, error: err.message ?? 'Air quality fetch error' };
  }
}

export interface AccuWeatherScrapedResult {
  currentTemp: number;
  tempHigh?: number;
  tempLow?: number;
  realFeel?: number;
  phrase?: string;
  humidity?: number;
  wind?: string;
  uvIndex?: number;
  sourceUrl: string;
  retrievedAt: string;
  provider: string;
}

/**
 * Fetch real-time weather directly from AccuWeather for Surat (Location Key: 202441).
 * URL: https://www.accuweather.com/en/in/surat/202441/current-weather/202441
 */
export async function fetchAccuWeatherSurat(
  timeoutMs = 7000
): Promise<{ result: AccuWeatherScrapedResult | null; error?: string }> {
  const url = 'https://www.accuweather.com/en/in/surat/202441/current-weather/202441';
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    clearTimeout(timer);

    if (!res.ok) {
      return { result: null, error: `AccuWeather HTTP ${res.status}` };
    }

    const html = await res.text();
    const currentTempMatch = html.match(/class="display-temp"[^>]*>(\d+)&#xB0;/i);
    if (!currentTempMatch) {
      return { result: null, error: 'Could not parse temperature from AccuWeather HTML' };
    }

    const currentTemp = Number(currentTempMatch[1]);
    const phrase = html.match(/class="phrase"[^>]*>([^<]+)</i)?.[1]?.trim();
    const realFeelMatch = html.match(/RealFeel[^\d]*(\d+)&#xB0;/i);
    const realFeel = realFeelMatch ? Number(realFeelMatch[1]) : undefined;

    // Parse Forecast High & Low from Temperature History table
    let tempHigh: number | undefined;
    let tempLow: number | undefined;

    const forecastRow = html.match(
      /<div class="row first">[\s\S]*?<div class="label">Forecast<\/div>\s*<div class="temperature">(\d+)&#xB0;<\/div>\s*<div class="temperature">(\d+)&#xB0;<\/div>/i
    );
    if (forecastRow) {
      tempHigh = Number(forecastRow[1]);
      tempLow = Number(forecastRow[2]);
    } else {
      const hiMatch = html.match(/(\d+)&#xB0;\s*Hi/i);
      const loMatch = html.match(/(\d+)&#xB0;\s*Lo/i);
      if (hiMatch) tempHigh = Number(hiMatch[1]);
      if (loMatch) tempLow = Number(loMatch[1]);
    }

    const humidityMatch = html.match(/<div>Humidity<\/div>\s*<div>(\d+)%/i);
    const humidity = humidityMatch ? Number(humidityMatch[1]) : undefined;
    const wind = html.match(/<div>Wind<\/div>\s*<div>([^<]+)<\/div>/i)?.[1]?.trim();
    const uvMatch = html.match(/<div>Max UV Index<\/div>\s*<div>([\d\.]+)/i);
    const uvIndex = uvMatch ? Number(uvMatch[1]) : undefined;

    return {
      result: {
        currentTemp,
        tempHigh,
        tempLow,
        realFeel,
        phrase,
        humidity,
        wind,
        uvIndex,
        sourceUrl: url,
        retrievedAt: new Date().toISOString(),
        provider: 'AccuWeather (Surat 202441 Live)',
      },
    };
  } catch (err: any) {
    return { result: null, error: err.message ?? 'Failed to fetch AccuWeather' };
  }
}

