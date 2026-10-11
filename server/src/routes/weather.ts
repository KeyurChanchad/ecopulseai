/**
 * EcoPulseAI Weather Data Routes
 * Direct weather and air quality endpoint with Open-Meteo and AccuWeather verification.
 */
import { Router, Request, Response } from 'express';
import {
  fetchLiveWeather,
  fetchAirQuality,
  fetchAccuWeatherSurat,
  aqiToStatus,
  interpretWeatherCode,
} from '../services/weatherService.js';

export const weatherRouter = Router();

/**
 * GET /api/weather?lat=21.17&lng=72.83
 * Returns real-time weather data with High/Low temperatures,
 * Open-Meteo telemetry, and AccuWeather cross-verification for Surat.
 */
weatherRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const lat = parseFloat(req.query.lat as string);
  const lng = parseFloat(req.query.lng as string);

  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    res.status(400).json({
      success: false,
      error: 'Valid lat and lng query parameters required (lat: -90 to 90, lng: -180 to 180)',
    });
    return;
  }

  const isSurat = Math.abs(lat - 21.1702) < 0.35 && Math.abs(lng - 72.8311) < 0.35;
  const wantAccuWeather = isSurat || req.query.source === 'accuweather';

  const [weatherResult, aqResult, accuResult] = await Promise.allSettled([
    fetchLiveWeather(lat, lng, 10000),
    fetchAirQuality(lat, lng, 8000),
    wantAccuWeather ? fetchAccuWeatherSurat(7000) : Promise.resolve({ result: null }),
  ]);

  const weather = weatherResult.status === 'fulfilled' ? weatherResult.value : { result: null, error: 'Weather fetch threw' };
  const aq = aqResult.status === 'fulfilled' ? aqResult.value : { result: null, error: 'AQ fetch threw' };
  const accu = accuResult.status === 'fulfilled' ? accuResult.value : { result: null, error: 'AccuWeather fetch threw' };

  const aqiValue = aq.result?.aqi?.value ?? null;
  const tempHigh = weather.result?.temperatureMax?.value ?? accu.result?.tempHigh ?? null;
  const tempLow = weather.result?.temperatureMin?.value ?? accu.result?.tempLow ?? null;

  res.json({
    success: true,
    coordinates: { lat, lng },
    retrievedAt: new Date().toISOString(),
    tempHigh,
    tempLow,
    accuWeather: accu.result
      ? {
          isAvailable: true,
          currentTemp: accu.result.currentTemp,
          tempHigh: accu.result.tempHigh,
          tempLow: accu.result.tempLow,
          realFeel: accu.result.realFeel,
          phrase: accu.result.phrase,
          humidity: accu.result.humidity,
          wind: accu.result.wind,
          uvIndex: accu.result.uvIndex,
          sourceUrl: accu.result.sourceUrl,
          provider: accu.result.provider,
        }
      : null,
    weather: {
      data: weather.result,
      error: weather.error ?? null,
      rawApiUrl: `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,shortwave_radiation,direct_normal_irradiance&daily=temperature_2m_max,temperature_2m_min&hourly=dew_point_2m&timezone=auto&models=gfs_seamless`,
    },
    airQuality: {
      data: aq.result,
      error: aq.error ?? null,
      aqiStatus: aqiValue !== null ? aqiToStatus(aqiValue) : 'DATA_UNAVAILABLE',
      rawApiUrl: `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi,european_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone,uv_index&timezone=auto`,
    },
    dataProvenanceNote: {
      weatherSource: 'Open-Meteo (NOAA GFS Seamless + ECMWF IFS model, updated hourly)',
      accuWeatherSource: isSurat ? 'AccuWeather Live Surveillance (Surat 202441)' : 'Not queried for this coordinate',
      airQualitySource: 'Open-Meteo Air Quality API (Copernicus CAMS Global/European model)',
      surfaceTemperature: 'MODELLED ESTIMATE — derived from shortwave radiation + urban albedo model. NOT satellite LST.',
      temperatureRange: 'Daily Max/Min retrieved from meteorological high-resolution models',
    },
  });
});
