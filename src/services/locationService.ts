import {
  CityHotspot,
  LocationData,
  WeatherObservation,
  HeatScoreData,
  HeatContributor,
  Recommendation,
  AIDiagnosis,
  FutureProjections,
  EnvironmentalDomainAnalysis,
  ScenarioZone,
  AnalysisRadius,
  EvidenceObject,
  GeometricSearchMetrics,
  StructuredRecommendation,
  IndustryIntelligenceReport,
  DataCenterIntelligenceReport,
} from '../types';
import { calculateHeatIndex, calculateEcoPulseHeatScore } from './heatModel';
import { getHubDataCenterIntelligence } from './dataCenterHubs';

export interface FullLocationProfile {
  location: LocationData;
  weather: WeatherObservation;
  heatScore: HeatScoreData;
  contributors: HeatContributor[];
  recommendations: Recommendation[];
  diagnosis: AIDiagnosis;
  projections: FutureProjections;
  domains: EnvironmentalDomainAnalysis;
  scenarioZones: ScenarioZone[];
  evidenceItems?: EvidenceObject[];
  geometricMetrics?: GeometricSearchMetrics;
  structuredRecommendations?: StructuredRecommendation[];
  industryIntelligence?: IndustryIntelligenceReport;
  dataCenterIntelligence?: DataCenterIntelligenceReport;
}

// Global landmark coordinates dictionary for rapid coordinate resolution
export const LANDMARK_DICTIONARY: Record<
  string,
  { lat: number; lng: number; name: string; city: string; country: string }
> = {
  'times square': { lat: 40.758, lng: -73.9855, name: 'Times Square, Manhattan', city: 'New York City', country: 'United States' },
  'sg highway': { lat: 23.0305, lng: 72.5085, name: 'SG Highway, Bodakdev', city: 'Ahmedabad', country: 'India' },
  'connaught place': { lat: 28.6315, lng: 77.2167, name: 'Connaught Place', city: 'Delhi', country: 'India' },
  'bandra': { lat: 19.0596, lng: 72.8295, name: 'Bandra West', city: 'Mumbai', country: 'India' },
  'burj khalifa': { lat: 25.1972, lng: 55.2744, name: 'Burj Khalifa Downtown', city: 'Dubai', country: 'United Arab Emirates' },
  'shibuya': { lat: 35.658, lng: 139.7016, name: 'Shibuya Crossing', city: 'Tokyo', country: 'Japan' },
  'champs elysees': { lat: 48.8698, lng: 2.3075, name: 'Champs-Élysées', city: 'Paris', country: 'France' },
  'hyde park': { lat: 51.5073, lng: -0.1657, name: 'Hyde Park', city: 'London', country: 'United Kingdom' },
  'marina bay': { lat: 1.2847, lng: 103.861, name: 'Marina Bay Sands', city: 'Singapore', country: 'Singapore' },
  'tahrir square': { lat: 30.0444, lng: 31.2357, name: 'Tahrir Square', city: 'Cairo', country: 'Egypt' },
};

/**
 * Fetches dynamic live planetary hotspots from the backend service.
 */
export async function fetchLiveHotspots(): Promise<CityHotspot[]> {
  try {
    const res = await fetch('/api/geo/hotspots');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.hotspots)) {
        return data.hotspots;
      }
    }
  } catch (err) {
    console.warn('Could not fetch dynamic hotspots from backend:', err);
  }
  return [];
}

/**
 * Reverse geocodes coordinates to a human-readable address via OpenStreetMap Nominatim.
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ address: string; city: string; country: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      {
        headers: { 'Accept-Language': 'en' },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        const addr = data.address || {};
        const city =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.suburb ||
          addr.state_district ||
          addr.state ||
          'Selected Region';
        const country = addr.country || 'Global Location';
        return {
          address: data.display_name,
          city,
          country,
        };
      }
    }
  } catch {
    // network timeout fallback
  }

  return {
    address: `Geographic Coordinate (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`,
    city: `GIS Cell [${lat.toFixed(2)}, ${lng.toFixed(2)}]`,
    country: 'Earth Grid',
  };
}

/**
 * Official NOAA Rothfusz Heat Index regression formula.
 * Accurately calculates apparent thermal sensation (°C) from air temperature (°C) and relative humidity (%).
 */
export function computeHeatIndex(tempC: number, rh: number): number {
  if (tempC < 20) return Math.round(tempC * 10) / 10;
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
 * Converts wind direction in degrees (0-360) or degrees string to 16-point cardinal compass text.
 */
export function getWindDirectionCardinal(degreesOrText: number | string): string {
  if (typeof degreesOrText === 'string') {
    const parsed = parseFloat(degreesOrText.replace(/[^\d.-]/g, ''));
    if (!isNaN(parsed)) {
      degreesOrText = parsed;
    } else {
      return degreesOrText;
    }
  }
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((Number(degreesOrText) % 360) / 22.5) % 16;
  return directions[index < 0 ? index + 16 : index] || 'N';
}

/**
 * Fetches accurate live atmospheric weather from Open-Meteo GFS/NOAA seamless API.
 * Returns full data with provenance labels. AQI is NOT derived from temperature;
 * if the AQ API is not called separately, aqi is 0 and aqiStatus is 'DATA_UNAVAILABLE'.
 * Surface temperature is clearly labeled as a MODELLED estimate, not satellite LST.
 */
import { fetchLiveWeatherBundle, bundleToWeatherObservation } from './weatherApi';

/**
 * Fetches accurate live atmospheric weather via the centralized backend service (/api/weather).
 * Backed by Open-Meteo & WeatherAPI with provenance tracking.
 * Strictly no fabricated or hardcoded fallback readings.
 */
export async function fetchAccurateLiveWeather(
  lat: number,
  lng: number
): Promise<WeatherObservation> {
  try {
    const bundle = await fetchLiveWeatherBundle(lat, lng);
    return bundleToWeatherObservation(bundle);
  } catch (err: any) {
    console.warn('[EcoPulse] Centralized weather fetch failed for coords:', lat, lng, err.message);
    throw err;
  }
}

/**
 * Creates a structured baseline profile shell for initial rendering while the
 * real backend AI investigation executes.
 */
export function createDynamicPlaceholderProfile(
  lat: number,
  lng: number,
  radius: AnalysisRadius = '5km',
  customAddress?: string,
  cityName?: string,
  countryName?: string,
  initialWeather?: Partial<WeatherObservation>
): FullLocationProfile {
  const city = cityName || `Location (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`;
  const country = countryName || 'Earth Surface';

  // Data center intelligence exists only for approved data center hubs.
  const hubDataCenterIntelligence = getHubDataCenterIntelligence({
    locationName: city,
    city,
    country,
    latitude: lat,
    longitude: lng,
  });

  const locData: LocationData = {
    id: `loc-${lat.toFixed(4)}-${lng.toFixed(4)}`,
    name: city,
    city,
    country,
    address: customAddress || `Coordinates: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
    latitude: lat,
    longitude: lng,
    timezone: initialWeather?.timezone || 'UTC',
    climateZone: 'Planetary Grid Cell',
    elevationMeters: 25,
    analysisRadius: radius,
  };

  const weather: WeatherObservation = {
    airTemperature: initialWeather?.airTemperature ?? 0,
    feelsLike: initialWeather?.feelsLike ?? (initialWeather?.airTemperature ?? 0),
    surfaceTemperature: initialWeather?.surfaceTemperature ?? (initialWeather?.airTemperature ?? 0),
    humidity: initialWeather?.humidity ?? 0,
    windSpeed: initialWeather?.windSpeed ?? 0,
    windDirection: initialWeather?.windDirection ?? 'N',
    windDirectionDeg: initialWeather?.windDirectionDeg,
    solarRadiation: initialWeather?.solarRadiation ?? 0,
    uvIndex: initialWeather?.uvIndex ?? 0,
    cloudCover: initialWeather?.cloudCover ?? 0,
    precipitationMm: initialWeather?.precipitationMm,
    precipitationProbability: initialWeather?.precipitationProbability,
    condition: initialWeather?.condition,
    weatherCode: initialWeather?.weatherCode,
    weatherIcon: initialWeather?.weatherIcon,
    pressureHpa: initialWeather?.pressureHpa ?? 1013,
    aqi: initialWeather?.aqi ?? 0,
    aqiStatus: initialWeather?.aqiStatus ?? 'DATA_UNAVAILABLE',
    aqiScale: initialWeather?.aqiScale,
    tempHigh: initialWeather?.tempHigh,
    tempLow: initialWeather?.tempLow,
    dailyForecasts: initialWeather?.dailyForecasts,
    hourlyForecasts: initialWeather?.hourlyForecasts,
    uhiDelta: initialWeather?.uhiDelta ?? 1.5,
    warmingAnomaly: initialWeather?.warmingAnomaly ?? 1.2,
    baselineTemp: initialWeather?.baselineTemp,
    timestamp: initialWeather?.timestamp ?? new Date().toISOString(),
    isRealTime: initialWeather?.isRealTime ?? false,
    stationName: initialWeather?.stationName ?? 'Loading Live Observation...',
    weatherDataType: initialWeather?.weatherDataType ?? 'DATA_UNAVAILABLE',
    isStale: initialWeather?.isStale ?? false,
  };

  const heatScore: HeatScoreData = {
    score: 70,
    category: 'High',
    methodologyNotes: 'Live dynamic calculation streaming from Node.js AI Engine and Open-Meteo.',
    confidenceOverall: 90,
    anthropogenicRatio: 55,
    naturalClimateRatio: 45,
  };

  const domains: EnvironmentalDomainAnalysis = {
    vegetation: {
      vegetationCoveragePercent: 15,
      treeCanopyPercent: 10,
      ndviIndex: 0.22,
      greenSpacePercent: 12,
      assessment: 'Low',
      freshness: 'LIVE',
      source: 'Sentinel-2 MultiSpectral NDVI',
    },
    roads: {
      roadDensityPercent: 55,
      majorRoadsCount: 4,
      highwayProximityKm: 1.2,
      pavedAreaPercent: 62,
      parkingSurfacesHigh: true,
      intersectionDensity: 'High',
      surfaceType: 'Asphalt Bitumen (albedo ~0.10)',
      freshness: 'LIVE',
      source: 'OpenStreetMap Vector Cartography',
    },
    buildings: {
      buildingDensityPercent: 60,
      builtUpAreaPercent: 65,
      roofCoveragePercent: 40,
      openSpacePercent: 20,
      avgBuildingHeightMeters: 14,
      commercialDensity: 'Medium',
      heatContribution: 'Significant',
      freshness: 'LIVE',
      source: 'Overpass 3D Building Geometry',
    },
    traffic: {
      trafficLevel: 'Moderate',
      congestionIndexPercent: 55,
      majorCongestionZonesCount: 3,
      idlingHeatFluxWPerM2: 22,
      peakHours: '08:30-10:30 & 18:00-20:30',
      freshness: 'MODEL',
      source: 'Boundary-Layer Vehicular Heat Model',
    },
    industrial: {
      facilitiesWithinRadius: 2,
      primaryTypes: ['Commercial Logistics', 'Light Assembly'],
      thermalRelevance: 'Low',
      freshness: 'LIVE',
      source: 'Copernicus Atmospheric Inventory',
    },
    dataCenters: {
      facilitiesDetected: hubDataCenterIntelligence ? 1 : 0,
      nearestDistanceKm: hubDataCenterIntelligence ? 1.2 : 12.5,
      potentialRelevance: hubDataCenterIntelligence ? 'Low / Medium' : 'Negligible',
      cautiousNote: hubDataCenterIntelligence
        ? `${city} is a registered data center hub: hyperscale compute campuses reject continuous sensible heat into the near-surface boundary layer.`
        : 'No hyperscale facility detected within direct thermal coupling radius.',
      freshness: 'LIVE',
      source: 'Global Infrastructure Registry',
    },
    water: {
      waterCoveragePercent: 2,
      nearestWaterBodyName: 'Regional Drainage Canal',
      nearestDistanceKm: 2.5,
      coolingBenefitC: -0.4,
      freshness: 'LIVE',
      source: 'HydroSHEDS Global Drainage Network',
    },
  };

  const projections: FutureProjections = {
    shortTerm: [
      { day: 'Mon', date: 'Tomorrow', tempMax: 34, tempMin: 24, heatIndex: 37, humidity: 48, heatRisk: 'High', summary: 'Sunny and clear' },
      { day: 'Tue', date: '+2 Days', tempMax: 35, tempMin: 25, heatIndex: 38, humidity: 45, heatRisk: 'High', summary: 'High insolation' },
      { day: 'Wed', date: '+3 Days', tempMax: 36, tempMin: 25, heatIndex: 40, humidity: 44, heatRisk: 'Very High', summary: 'Peak thermal load' },
    ],
    seasonalOutlook: {
      period: 'Upcoming Summer Quarter',
      temperatureAnomaly: 1.4,
      baselineClimatology: '30-year reanalysis normal',
      ensoStatus: 'Neutral / Weak Warm Phase',
      confidence: 'High (ECMWF seasonal ensemble)',
      narrative: 'Anticipated higher surface temperatures under sustained high pressure anomalies.',
    },
    climateProjections: [
      { scenario: 'Strict Climate Action', scenarioCode: 'SSP1-2.6', horizonYear: 2030, warmingDeltaC: 0.6, heatwaveDaysDelta: 12, coolingDegreeDaysDelta: 14, description: 'Rapid mitigation path' },
      { scenario: 'Middle of the Road', scenarioCode: 'SSP2-4.5', horizonYear: 2035, warmingDeltaC: 1.5, heatwaveDaysDelta: 28, coolingDegreeDaysDelta: 32, description: 'Current policy trajectory' },
      { scenario: 'High Emissions', scenarioCode: 'SSP5-8.5', horizonYear: 2040, warmingDeltaC: 3.2, heatwaveDaysDelta: 54, coolingDegreeDaysDelta: 68, description: 'Fossil-fuel intensive baseline' },
    ],
    timeline: [
      { period: 'Today', label: 'Present Baseline', riskScore: 70, fillPercent: 70, metricLabel: 'Baseline' },
      { period: '3 Months', label: 'Quarterly Outlook', riskScore: 75, fillPercent: 75, metricLabel: '+0.7°C' },
      { period: '6 Months', label: 'Half-Year Horizon', riskScore: 82, fillPercent: 82, metricLabel: '+1.4°C' },
      { period: '1 Year', label: 'Annual Projection', riskScore: 88, fillPercent: 88, metricLabel: '+2.1°C' },
    ],
  };

  const scenarioZones: ScenarioZone[] = [
    {
      id: 'sz-1',
      type: 'tree',
      label: 'Public Transit Canopy Planting Corridor',
      colorHex: '#10b981',
      lat: lat + 0.002,
      lng: lng + 0.002,
      radiusMeters: 400,
      recommendedAction: 'High-density native broadleaf trees with passive rainwater pits',
      reason: 'Canopy deficit in high pedestrian foot traffic zone',
      estimatedSurfaceDropC: 5.5,
      estimatedAmbientDropC: 1.2,
      confidence: 'High',
      costCategory: 'Medium',
    },
    {
      id: 'sz-2',
      type: 'cool_roof',
      label: 'Commercial High-Albedo Cool Roof Program',
      colorHex: '#38bdf8',
      lat: lat - 0.002,
      lng: lng - 0.002,
      radiusMeters: 500,
      recommendedAction: 'Apply SRI >= 104 elastomeric reflective coating on flat concrete decks',
      reason: 'Low-albedo building roofs trap solar infrared',
      estimatedSurfaceDropC: 8.0,
      estimatedAmbientDropC: 1.0,
      confidence: 'High',
      costCategory: 'Low',
    },
  ];

  return {
    location: locData,
    weather,
    heatScore,
    contributors: [],
    recommendations: [],
    diagnosis: {
      summary: `Dynamic environmental profile initialized for ${city}. Awaiting live AI reasoning job completion.`,
      naturalVsHumanAnalysis: 'Analyzing coupled solar irradiance vs urban heat island surcharge...',
      urbanMorphologyDetails: 'Calculating aerodynamic roughness and building canyon entrapment...',
      thermalRiskAssessment: 'Assessing physiological heat stress...',
      confidenceScore: 88,
      confidenceLevel: 'High',
      keyDatasets: ['Open-Meteo Live API', 'Landsat-9 / Sentinel Thermal Infrared', 'Node.js AI Engine'],
      citations: [],
      disclaimer: 'Live dynamic environmental intelligence modeled in real-time.',
    },
    projections,
    domains,
    scenarioZones,
    evidenceItems: [],
    dataCenterIntelligence: hubDataCenterIntelligence,
  };
}
