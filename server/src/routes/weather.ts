/**
 * EcoPulseAI Centralized Weather API Routes
 * Endpoints:
 * - GET /api/weather              (Full normalized weather bundle: current, daily, hourly, airQuality, metadata)
 * - GET /api/weather/current      (Real-time / latest current conditions & today's low/high)
 * - GET /api/weather/hourly       (24-48h hourly forecast with precipitation & wind)
 * - GET /api/weather/daily        (7-day daily forecast with low/high, sunrise, sunset, UV)
 * - GET /api/weather/air-quality  (Air quality index, CAMS pollutants: PM2.5, PM10, NO2, O3, SO2, CO)
 * - GET /api/weather/compare      (Side-by-side comparison between Open-Meteo and WeatherAPI.com)
 */

import { Router, Request, Response } from 'express';
import {
  fetchOpenMeteoBundle,
  fetchWeatherApiBundle,
  compareWeatherProviders,
  aqiToStatus,
} from '../services/weatherService.js';

export const weatherRouter = Router();

function parseCoordinates(req: Request): { lat: number; lon: number } | null {
  const latStr = (req.query.lat ?? req.query.latitude) as string;
  const lonStr = (req.query.lon ?? req.query.lng ?? req.query.longitude) as string;

  if (!latStr || !lonStr) return null;
  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);

  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return null;
  }
  return { lat, lon };
}

/**
 * GET /api/weather
 * Returns full unified normalized bundle (current, daily, hourly, air quality, metadata)
 * Supports query: ?lat=...&lon=... (or ?lng=...) and optional provider: ?provider=open-meteo | weatherapi
 */
weatherRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const coords = parseCoordinates(req);
  if (!coords) {
    res.status(400).json({
      success: false,
      error: 'Valid lat (-90 to 90) and lon/lng (-180 to 180) query parameters required.',
    });
    return;
  }

  const requestedProvider = (req.query.provider as string)?.toLowerCase();

  // Primary: Open-Meteo unless WeatherAPI specifically requested
  let fetchResult = requestedProvider === 'weatherapi'
    ? await fetchWeatherApiBundle(coords.lat, coords.lon)
    : await fetchOpenMeteoBundle(coords.lat, coords.lon);

  // If requested primary failed and secondary is available, try fallback
  if (!fetchResult.result && requestedProvider !== 'weatherapi') {
    const secondary = await fetchWeatherApiBundle(coords.lat, coords.lon);
    if (secondary.result) {
      fetchResult = secondary;
    }
  }

  if (!fetchResult.result) {
    res.status(503).json({
      success: false,
      error: fetchResult.error || 'Failed to retrieve live weather data from providers.',
      coordinates: coords,
      retrievedAt: new Date().toISOString(),
    });
    return;
  }

  // Preserve backwards-compatible root keys alongside normalized schema
  const bundle = fetchResult.result;
  res.json({
    success: true,
    coordinates: coords,
    retrievedAt: new Date().toISOString(),
    // Backward-compatible properties
    tempHigh: bundle.current.temperatureMax,
    tempLow: bundle.current.temperatureMin,
    // Full normalized schema
    location: bundle.location,
    current: bundle.current,
    daily: bundle.daily,
    hourly: bundle.hourly,
    airQuality: bundle.airQuality,
    metadata: bundle.metadata,
  });
});

/**
 * GET /api/weather/current
 */
weatherRouter.get('/current', async (req: Request, res: Response): Promise<void> => {
  const coords = parseCoordinates(req);
  if (!coords) {
    res.status(400).json({
      success: false,
      error: 'Valid lat and lon/lng query parameters required.',
    });
    return;
  }

  const { result, error, isStale } = await fetchOpenMeteoBundle(coords.lat, coords.lon);
  if (!result) {
    res.status(503).json({ success: false, error: error || 'Failed to fetch current weather.' });
    return;
  }

  res.json({
    success: true,
    coordinates: coords,
    location: result.location,
    current: result.current,
    isStale: isStale ?? false,
    metadata: result.metadata,
  });
});

/**
 * GET /api/weather/hourly
 */
weatherRouter.get('/hourly', async (req: Request, res: Response): Promise<void> => {
  const coords = parseCoordinates(req);
  if (!coords) {
    res.status(400).json({
      success: false,
      error: 'Valid lat and lon/lng query parameters required.',
    });
    return;
  }

  const { result, error, isStale } = await fetchOpenMeteoBundle(coords.lat, coords.lon);
  if (!result) {
    res.status(503).json({ success: false, error: error || 'Failed to fetch hourly forecast.' });
    return;
  }

  res.json({
    success: true,
    coordinates: coords,
    location: result.location,
    hourly: result.hourly,
    count: result.hourly.length,
    isStale: isStale ?? false,
    metadata: result.metadata,
  });
});

/**
 * GET /api/weather/daily
 */
weatherRouter.get('/daily', async (req: Request, res: Response): Promise<void> => {
  const coords = parseCoordinates(req);
  if (!coords) {
    res.status(400).json({
      success: false,
      error: 'Valid lat and lon/lng query parameters required.',
    });
    return;
  }

  const { result, error, isStale } = await fetchOpenMeteoBundle(coords.lat, coords.lon);
  if (!result) {
    res.status(503).json({ success: false, error: error || 'Failed to fetch daily forecast.' });
    return;
  }

  res.json({
    success: true,
    coordinates: coords,
    location: result.location,
    daily: result.daily,
    count: result.daily.length,
    isStale: isStale ?? false,
    metadata: result.metadata,
  });
});

/**
 * GET /api/weather/air-quality
 */
weatherRouter.get('/air-quality', async (req: Request, res: Response): Promise<void> => {
  const coords = parseCoordinates(req);
  if (!coords) {
    res.status(400).json({
      success: false,
      error: 'Valid lat and lon/lng query parameters required.',
    });
    return;
  }

  const { result, error, isStale } = await fetchOpenMeteoBundle(coords.lat, coords.lon);
  if (!result) {
    res.status(503).json({ success: false, error: error || 'Failed to fetch air quality data.' });
    return;
  }

  res.json({
    success: true,
    coordinates: coords,
    location: result.location,
    airQuality: result.airQuality,
    isStale: isStale ?? false,
    metadata: result.metadata,
  });
});

/**
 * GET /api/weather/compare
 * Multi-provider cross-verification side-by-side comparison
 */
weatherRouter.get('/compare', async (req: Request, res: Response): Promise<void> => {
  const coords = parseCoordinates(req);
  if (!coords) {
    res.status(400).json({
      success: false,
      error: 'Valid lat and lon/lng query parameters required.',
    });
    return;
  }

  try {
    const comparison = await compareWeatherProviders(coords.lat, coords.lon);
    res.json({
      success: true,
      ...comparison,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message || 'Comparison failed.',
    });
  }
});
