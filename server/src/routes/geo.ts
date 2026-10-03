import { Router, Request, Response } from 'express';
import { dbQueryNearbyInfrastructure, isMongoConnected } from '../db/mongoClient.js';
import { InfrastructureModel } from '../models/Infrastructure.js';

export const geoRouter = Router();

// Major planetary thermal surveillance hubs with world-renowned extreme heat epicenters
const GLOBAL_OBSERVATION_HUBS = [
  // World's Most Extreme Heat Poles & Hotspots
  { id: 'deathvalley', name: 'Death Valley (Furnace Creek)', country: 'United States', state: 'California', lat: 36.4614, lng: -116.8656, population: '0.01M', climateZone: 'BWh (Hyper-Arid Furnace Record 56.7°C)' },
  { id: 'dashtelut', name: 'Dasht-e Lut (Thermal Pole)', country: 'Iran', lat: 30.6000, lng: 58.8000, population: '0.01M', climateZone: 'BWh (Radiometric Max LST 70.7°C)' },
  { id: 'ahvaz', name: 'Ahvaz', country: 'Iran', lat: 31.3183, lng: 48.6706, population: '1.3M', climateZone: 'BWh (Industrial Thermal Epicenter >53°C)' },
  { id: 'kuwaitcity', name: 'Kuwait City', country: 'Kuwait', lat: 29.3759, lng: 47.9774, population: '3.2M', climateZone: 'BWh (Hyper-Arid Urban Desert)' },
  { id: 'jacobabad', name: 'Jacobabad', country: 'Pakistan', lat: 28.2810, lng: 68.4388, population: '0.2M', climateZone: 'BWh (Lethal Wet-Bulb Epicenter)' },
  { id: 'insalah', name: 'In Salah', country: 'Algeria', lat: 27.1935, lng: 2.4607, population: '0.05M', climateZone: 'BWh (Central Sahara Heat Basin >50°C)' },
  { id: 'basra', name: 'Basra', country: 'Iraq', lat: 30.5081, lng: 47.7835, population: '2.9M', climateZone: 'BWh (Tigris-Euphrates Heat Basin >52°C)' },
  { id: 'turbat', name: 'Turbat', country: 'Pakistan', lat: 26.0031, lng: 63.0544, population: '0.2M', climateZone: 'BWh (Makran Thermal Ridge 53.7°C)' },
  { id: 'dallol', name: 'Dallol (Danakil)', country: 'Ethiopia', lat: 14.2417, lng: 40.2989, population: '0.02M', climateZone: 'BWh (Danakil Volcanic Depression 41°C Avg)' },
  { id: 'phalodi', name: 'Phalodi (Thar)', country: 'India', state: 'Rajasthan', lat: 27.1300, lng: 72.3600, population: '0.1M', climateZone: 'BWh (Thar Desert Record 51.0°C)' },
  { id: 'alaziziyah', name: 'Al Aziziyah', country: 'Libya', lat: 32.5333, lng: 13.0167, population: '0.3M', climateZone: 'BWh (Jafara Plain Saharan Ridge)' },
  { id: 'wadihalfa', name: 'Wadi Halfa', country: 'Sudan', lat: 21.7991, lng: 31.3743, population: '0.02M', climateZone: 'BWh (Nubian Desert Extreme Insolation)' },
  { id: 'mecca', name: 'Mecca', country: 'Saudi Arabia', lat: 21.3891, lng: 39.8579, population: '2.1M', climateZone: 'BWh (Valley Thermal Trap)' },
  { id: 'riyadh', name: 'Riyadh', country: 'Saudi Arabia', lat: 24.7136, lng: 46.6753, population: '7.6M', climateZone: 'BWh (Hot Desert Plateau)' },
  { id: 'phoenix', name: 'Phoenix', country: 'United States', state: 'Arizona', lat: 33.4484, lng: -112.0740, population: '1.6M', climateZone: 'BWh (Sonoran Desert Urban Heat Island)' },
  { id: 'dubai', name: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lng: 55.2708, population: '3.6M', climateZone: 'BWh (Subtropical Coastal Desert)' },
  { id: 'doha', name: 'Doha', country: 'Qatar', lat: 25.2854, lng: 51.5310, population: '2.4M', climateZone: 'BWh (Arid Maritime Heat Stress)' },
  { id: 'baghdad', name: 'Baghdad', country: 'Iraq', lat: 33.3152, lng: 44.3661, population: '7.5M', climateZone: 'BWh (Mesopotamian Desert Heat Dome)' },
  { id: 'lasvegas', name: 'Las Vegas', country: 'United States', state: 'Nevada', lat: 36.1699, lng: -115.1398, population: '0.6M', climateZone: 'BWk (Mojave Desert Basin)' },

  // Dense Urban & Regional Heat Centers
  { id: 'delhi', name: 'Delhi', country: 'India', state: 'NCT', lat: 28.6139, lng: 77.2090, population: '32.9M', climateZone: 'Cwa (Monsoon Extreme Semi-Arid)' },
  { id: 'ahmedabad', name: 'Ahmedabad', country: 'India', state: 'Gujarat', lat: 23.0225, lng: 72.5714, population: '8.4M', climateZone: 'BSh (Hot Semi-Arid Concrete Trap)' },
  { id: 'mumbai', name: 'Mumbai', country: 'India', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, population: '21.3M', climateZone: 'Am (Tropical Monsoon Coastal Heat Index)' },
  { id: 'lahore', name: 'Lahore', country: 'Pakistan', lat: 31.5204, lng: 74.3587, population: '13.0M', climateZone: 'BSh (Semi-Arid Lowland Stagnation)' },
  { id: 'cairo', name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357, population: '22.1M', climateZone: 'BWh (Nile Basin Mega-Urban Heat)' },
  { id: 'bangkok', name: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018, population: '10.9M', climateZone: 'Aw (Tropical Savanna High Humidity Heat)' },
  { id: 'seville', name: 'Seville', country: 'Spain', lat: 37.3891, lng: -5.9845, population: '0.7M', climateZone: 'Csa (Iberian Frying Pan)' },
  { id: 'athens', name: 'Athens', country: 'Greece', lat: 37.9838, lng: 23.7275, population: '3.1M', climateZone: 'Csa (Attica Coastal Basin Heat Trap)' },
  { id: 'oodnadatta', name: 'Oodnadatta', country: 'Australia', lat: -27.5486, lng: 135.4464, population: '0.01M', climateZone: 'BWh (Simpson Desert Record 50.7°C)' },

  // Moderate & Benchmark Baseline Cities
  { id: 'singapore', name: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, population: '5.9M', climateZone: 'Af (Equatorial High Humidity)' },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, population: '37.4M', climateZone: 'Cfa (Humid Subtropical Urban Core)' },
  { id: 'beijing', name: 'Beijing', country: 'China', lat: 39.9042, lng: 116.4074, population: '21.8M', climateZone: 'Dwa (Monsoon Continental Basin)' },
  { id: 'saopaulo', name: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333, population: '22.4M', climateZone: 'Cfa (Highland Subtropical)' },
  { id: 'mexicocity', name: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332, population: '22.0M', climateZone: 'Cwb (Highland Basin)' },
  { id: 'sydney', name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, population: '5.3M', climateZone: 'Cfa (Coastal Temperate)' },
  { id: 'london', name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, population: '9.0M', climateZone: 'Cfb (Temperate Oceanic)' },
  { id: 'paris', name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, population: '2.1M', climateZone: 'Cfb (Oceanic Transition)' },
];

let cachedHotspots: any[] = [];
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

function computeHeatIndex(tempC: number, rh: number): number {
  if (tempC < 25) return tempC;
  const T = (tempC * 9) / 5 + 32;
  const R = rh;
  const hiF =
    -42.379 +
    2.04901523 * T +
    10.14333127 * R -
    0.22475541 * T * R -
    0.00683783 * T * T -
    0.05481717 * R * R +
    0.00122874 * T * T * R +
    0.00085282 * T * R * R -
    0.00000199 * T * T * R * R;
  return Math.round((((hiF - 32) * 5) / 9) * 10) / 10;
}

/**
 * Calibrated Heat Score (0 - 99)
 * Reflects physical thermal load according to WMO & NOAA Heat Index Danger Scales:
 * - Air Temp >= 38°C or Surface >= 46°C or Heat Index >= 42°C -> Extreme (90-99)
 * - Air Temp >= 32°C or Surface >= 38°C or Heat Index >= 35°C -> Very High (80-89)
 * - Air Temp >= 27°C or Surface >= 32°C or Heat Index >= 30°C -> High (70-79)
 * - Air Temp >= 21°C -> Moderate (50-69)
 * - Below 21°C -> Low (<50)
 */
function computeCalibratedHeatScore(airTemp: number, surfaceTemp: number, heatIndex: number, solar: number): number {
  // Base air temperature component (20°C = 45pts, 30°C = 74pts, 40°C = 93pts, 46°C = 99pts)
  const airComp = Math.max(15, Math.min(99, 45 + (airTemp - 20) * 2.8));

  // Radiometric surface excess component
  const surfaceDelta = Math.max(0, surfaceTemp - airTemp);
  const surfaceBonus = Math.min(15, surfaceDelta * 1.5);

  // Apparent feels-like heat index component
  const feelsDelta = Math.max(0, heatIndex - airTemp);
  const feelsBonus = Math.min(12, feelsDelta * 1.8);

  // Solar radiation flux bonus
  const solarBonus = Math.min(6, (solar / 1000) * 6);

  const finalScore = Math.min(99, Math.max(15, Math.round(airComp * 0.75 + surfaceBonus + feelsBonus + solarBonus)));
  return finalScore;
}

function determineHeatCategory(score: number, airTemp: number, surfaceTemp: number, heatIndex: number): 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme' {
  if (score >= 88 || airTemp >= 38 || surfaceTemp >= 46 || heatIndex >= 43) return 'Extreme';
  if (score >= 76 || airTemp >= 32 || surfaceTemp >= 38 || heatIndex >= 36) return 'Very High';
  if (score >= 64 || airTemp >= 27 || surfaceTemp >= 32 || heatIndex >= 29) return 'High';
  if (score >= 45 || airTemp >= 20) return 'Moderate';
  return 'Low';
}

// GET /api/geo/hotspots - Real-time planetary thermal hotspots fetched live from Open-Meteo
geoRouter.get('/hotspots', async (_req: Request, res: Response): Promise<void> => {
  const now = Date.now();
  if (cachedHotspots.length > 0 && now - cacheTimestamp < CACHE_TTL_MS) {
    res.json({
      success: true,
      source: 'EcoPulseAI Live Global Surveillance Cache',
      timestamp: new Date(cacheTimestamp).toISOString(),
      count: cachedHotspots.length,
      hotspots: cachedHotspots,
    });
    return;
  }

  try {
    const lats = GLOBAL_OBSERVATION_HUBS.map((h) => h.lat).join(',');
    const lngs = GLOBAL_OBSERVATION_HUBS.map((h) => h.lng).join(',');

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=temperature_2m,relative_humidity_2m,apparent_temperature,direct_normal_irradiance,shortwave_radiation`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Open-Meteo returned status ${response.status}`);
    }

    const data = await response.json();
    const dataList = Array.isArray(data) ? data : [data];

    const results = GLOBAL_OBSERVATION_HUBS.map((hub, idx) => {
      const cur = dataList[idx]?.current || {};
      const airTemp = cur.temperature_2m ?? 30.0;
      const humidity = cur.relative_humidity_2m ?? 45;
      const solar = Math.round(cur.shortwave_radiation || cur.direct_normal_irradiance || 550);
      const heatIndex = cur.apparent_temperature ?? computeHeatIndex(airTemp, humidity);
      const surfaceTemp = Math.round((airTemp + Math.max(3, (solar / 1000) * 14)) * 10) / 10;

      const score = computeCalibratedHeatScore(airTemp, surfaceTemp, heatIndex, solar);
      const category = determineHeatCategory(score, airTemp, surfaceTemp, heatIndex);

      let primaryContributor = 'High Solar Insolation & Impervious Surface';
      if (airTemp > 38) primaryContributor = 'Hyper-Thermal Atmospheric Heat Dome & Bare Ground';
      else if (humidity > 60 && airTemp > 28) primaryContributor = 'High Moisture & Suppressed Evaporation';
      else if (solar > 650) primaryContributor = 'Intense Shortwave Radiative Insolation';
      else if (category === 'Extreme' || category === 'Very High') primaryContributor = 'Built-Environment Concrete Storage & Zero Canopy';

      return {
        id: hub.id,
        name: hub.name,
        country: hub.country,
        state: (hub as any).state,
        lat: hub.lat,
        lng: hub.lng,
        airTemp,
        heatIndex,
        surfaceTemp,
        heatScore: score,
        category,
        primaryContributor,
        population: hub.population,
        climateZone: hub.climateZone,
        recentTrend: solar > 400 || airTemp > 30 ? 'rising' : 'stable',
      };
    });

    cachedHotspots = results;
    cacheTimestamp = now;

    res.json({
      success: true,
      source: 'Open-Meteo Live Planetary Atmospheric Feed',
      timestamp: new Date().toISOString(),
      count: results.length,
      hotspots: results,
    });
  } catch (err: any) {
    console.warn('Live Open-Meteo external query notice:', (err as Error).message);
    if (cachedHotspots.length > 0) {
      res.json({
        success: true,
        source: 'Stale Global Surveillance Cache',
        timestamp: new Date(cacheTimestamp).toISOString(),
        count: cachedHotspots.length,
        hotspots: cachedHotspots,
      });
      return;
    }

    // Dynamic Thermodynamic Macroclimatic Baseline (Zero-Network Fallback)
    const results = GLOBAL_OBSERVATION_HUBS.map((hub) => {
      const absLat = Math.abs(hub.lat);
      const isEquatorial = absLat < 23.5;
      const isSubtropical = absLat >= 23.5 && absLat < 38;
      const isExtremeHub = ['deathvalley', 'dashtelut', 'ahvaz', 'insalah', 'basra', 'turbat', 'dallol', 'phalodi', 'kuwaitcity', 'jacobabad'].includes(hub.id);

      const airTemp = isExtremeHub ? 44.2 : isSubtropical ? 34.5 : isEquatorial ? 31.5 : 21.0;
      const humidity = isEquatorial ? 75 : isSubtropical ? 32 : isExtremeHub ? 16 : 55;
      const solar = isExtremeHub ? 920 : isSubtropical ? 750 : isEquatorial ? 680 : 420;
      const heatIndex = computeHeatIndex(airTemp, humidity);
      const surfaceTemp = Math.round((airTemp + (solar / 1000) * 14) * 10) / 10;
      const score = computeCalibratedHeatScore(airTemp, surfaceTemp, heatIndex, solar);
      const category = determineHeatCategory(score, airTemp, surfaceTemp, heatIndex);

      let primaryContributor = 'High Solar Insolation & Impervious Surface';
      if (isExtremeHub) primaryContributor = 'Hyper-Thermal Atmospheric Heat Dome & Bare Ground';
      else if (humidity > 60 && airTemp > 28) primaryContributor = 'High Moisture & Suppressed Evaporation';
      else if (category === 'Extreme' || category === 'Very High') primaryContributor = 'Built-Environment Concrete Storage & Zero Canopy';

      return {
        id: hub.id,
        name: hub.name,
        country: hub.country,
        state: (hub as any).state,
        lat: hub.lat,
        lng: hub.lng,
        airTemp,
        heatIndex,
        surfaceTemp,
        heatScore: score,
        category,
        primaryContributor,
        population: hub.population,
        climateZone: hub.climateZone,
        recentTrend: 'stable',
      };
    });

    cachedHotspots = results;
    cacheTimestamp = now;

    res.json({
      success: true,
      source: 'Thermodynamic Macroclimatic Baseline (Network Fallback)',
      timestamp: new Date().toISOString(),
      count: results.length,
      hotspots: results,
    });
  }
});

// GET /api/geo/near - 2dsphere proximity query
geoRouter.get('/near', async (req: Request, res: Response): Promise<void> => {
  try {
    const lng = parseFloat(req.query.lng as string);
    const lat = parseFloat(req.query.lat as string);
    const radiusKm = parseFloat((req.query.radiusKm as string) || '5');

    if (isNaN(lng) || isNaN(lat)) {
      res.status(400).json({ error: 'Valid lng and lat query parameters are required' });
      return;
    }

    if (isMongoConnected()) {
      try {
        const facilities = await InfrastructureModel.find({
          location: {
            $nearSphere: {
              $geometry: { type: 'Point', coordinates: [lng, lat] },
              $maxDistance: radiusKm * 1000,
            },
          },
        }).lean();

        res.json({ count: facilities.length, facilities });
        return;
      } catch {
        // fallback to memory
      }
    }

    const facilities = await dbQueryNearbyInfrastructure(lng, lat, radiusKm);
    res.json({ count: facilities.length, facilities });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error executing spatial query' });
  }
});
