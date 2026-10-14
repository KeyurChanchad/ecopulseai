import { WeatherObservation } from '../../types';
import { fetchLiveWeatherBundle, bundleToWeatherObservation } from '../weatherApi';

export interface WeatherAgentResult {
  weather: WeatherObservation;
  provider: string;
  isLive: boolean;
  retrievedAt: string;
}

/**
 * Autonomous Weather Intelligence Agent
 * Queries the centralized weather service for real-time meteorological telemetry and air quality.
 *
 * PROVENANCE TRANSPARENCY:
 * - Weather: LIVE_OBSERVATION from Open-Meteo GFS/ECMWF IFS (or WeatherAPI.com when enabled).
 * - AQI: CAMS Atmospheric model with identified US AQI / European AQI scales.
 * - Surface Temperature: Modelled surface energy balance estimate (NOT satellite LST).
 */
export async function fetchLiveWeatherAgentData(
  latitude: number,
  longitude: number,
  fallbackBase?: Partial<WeatherObservation>
): Promise<WeatherAgentResult> {
  const timestamp = new Date().toISOString();

  try {
    const bundle = await fetchLiveWeatherBundle(latitude, longitude);
    const weather = bundleToWeatherObservation(bundle);

    return {
      weather,
      provider: bundle.metadata.provider,
      isLive: !bundle.metadata.isStale,
      retrievedAt: bundle.metadata.fetchedAt || timestamp,
    };
  } catch (err: any) {
    console.warn('[WeatherAgent] Live weather fetch notice:', err.message);
    if (fallbackBase && typeof fallbackBase.airTemperature === 'number') {
      return {
        weather: fallbackBase as WeatherObservation,
        provider: fallbackBase.weatherProvider || 'Cached Telemetry',
        isLive: false,
        retrievedAt: timestamp,
      };
    }
    throw err;
  }
}
