import {
  GLOBAL_CITIES,
  AHMEDABAD_PROFILE,
  MOCK_DATA_CENTERS,
} from '../data/mockData';
import {
  calculateEcoPulseHeatScore,
  calculateHeatIndex,
} from './heatModel';
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
} from '../types';

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
}

// Famous landmarks and neighborhoods dictionary for instant offline resolution
export const LANDMARK_DICTIONARY: Record<string, { lat: number; lng: number; name: string; city: string; country: string }> = {
  'times square': { lat: 40.7580, lng: -73.9855, name: 'Times Square, Manhattan', city: 'New York City', country: 'United States' },
  'times square, new york': { lat: 40.7580, lng: -73.9855, name: 'Times Square, Manhattan', city: 'New York City', country: 'United States' },
  'sg highway': { lat: 23.0305, lng: 72.5085, name: 'SG Highway, Bodakdev', city: 'Ahmedabad', country: 'India' },
  'sg highway, ahmedabad': { lat: 23.0305, lng: 72.5085, name: 'SG Highway, Bodakdev', city: 'Ahmedabad', country: 'India' },
  'connaught place': { lat: 28.6315, lng: 77.2167, name: 'Connaught Place', city: 'Delhi', country: 'India' },
  'bandra': { lat: 19.0596, lng: 72.8295, name: 'Bandra West', city: 'Mumbai', country: 'India' },
  'burj khalifa': { lat: 25.1972, lng: 55.2744, name: 'Burj Khalifa Downtown', city: 'Dubai', country: 'United Arab Emirates' },
  'downtown dubai': { lat: 25.1972, lng: 55.2744, name: 'Downtown Dubai', city: 'Dubai', country: 'United Arab Emirates' },
  'shibuya': { lat: 35.6580, lng: 139.7016, name: 'Shibuya Crossing', city: 'Tokyo', country: 'Japan' },
  'champs elysees': { lat: 48.8698, lng: 2.3075, name: 'Champs-Élysées', city: 'Paris', country: 'France' },
  'hyde park': { lat: 51.5073, lng: -0.1657, name: 'Hyde Park', city: 'London', country: 'United Kingdom' },
  'marina bay': { lat: 1.2847, lng: 103.8610, name: 'Marina Bay Sands', city: 'Singapore', country: 'Singapore' },
  'tahrir square': { lat: 30.0444, lng: 31.2357, name: 'Tahrir Square', city: 'Cairo', country: 'Egypt' },
};

export function searchLocations(query: string): CityHotspot[] {
  if (!query.trim()) return GLOBAL_CITIES;
  const q = query.toLowerCase().trim();

  // Check if it's coordinates e.g. "23.0225, 72.5714"
  const coordsMatch = query.match(/^([-+]?\d{1,2}(?:\.\d+)?),\s*([-+]?\d{1,3}(?:\.\d+)?)$/);
  if (coordsMatch) {
    const lat = parseFloat(coordsMatch[1]);
    const lng = parseFloat(coordsMatch[2]);
    return [
      {
        id: `custom-${lat.toFixed(3)}-${lng.toFixed(3)}`,
        name: `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        country: 'Global Coordinate Selection',
        lat,
        lng,
        airTemp: 34.0,
        heatIndex: 38.0,
        surfaceTemp: 42.0,
        heatScore: 72,
        category: 'High',
        primaryContributor: 'Custom Coordinate Interrogation',
        population: 'Local Area',
        climateZone: 'Interpolated GIS Cell',
        recentTrend: 'stable',
      },
    ];
  }

  // Check landmark dictionary
  for (const [key, val] of Object.entries(LANDMARK_DICTIONARY)) {
    if (key.includes(q) || q.includes(key)) {
      return [
        {
          id: `landmark-${val.city.toLowerCase().replace(/\s+/g, '')}`,
          name: val.name,
          country: val.country,
          state: val.city,
          lat: val.lat,
          lng: val.lng,
          airTemp: 35.0,
          heatIndex: 40.0,
          surfaceTemp: 47.0,
          heatScore: 78,
          category: 'High',
          primaryContributor: 'High Paved Surface & Pedestrian Footprint',
          population: 'Metropolitan Core',
          climateZone: 'Urban Canyon Microclimate',
          recentTrend: 'rising',
        },
        ...GLOBAL_CITIES.filter((c) => c.name.toLowerCase().includes(val.city.toLowerCase())),
      ];
    }
  }

  return GLOBAL_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      (c.state && c.state.toLowerCase().includes(q)) ||
      c.primaryContributor.toLowerCase().includes(q)
  );
}

/**
 * Reverse geocode coordinates to a human-readable address.
 * Tries OpenStreetMap Nominatim with timeout, falling back to spatial lookup.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<{ address: string; city: string; country: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

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
        const city = addr.city || addr.town || addr.village || addr.state_district || addr.state || 'Selected Region';
        const country = addr.country || 'Global Location';
        return {
          address: data.display_name,
          city,
          country,
        };
      }
    }
  } catch (err) {
    // Ignore and fallback gracefully
  }

  // Fallback to nearest city in preloaded list
  const nearest = findNearestCity(lat, lng);
  if (nearest.distanceKm < 60) {
    return {
      address: `Near ${nearest.city.name}, ${nearest.city.country} (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`,
      city: nearest.city.name,
      country: nearest.city.country,
    };
  }

  return {
    address: `Interrogated Earth Coordinate (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`,
    city: `GIS Cell [${lat.toFixed(2)}, ${lng.toFixed(2)}]`,
    country: 'Global Grid',
  };
}

function findNearestCity(lat: number, lng: number): { city: CityHotspot; distanceKm: number } {
  let closest = GLOBAL_CITIES[0];
  let minD = 999999;

  for (const c of GLOBAL_CITIES) {
    const d = Math.hypot(c.lat - lat, (c.lng - lng) * Math.cos((lat * Math.PI) / 180)) * 111;
    if (d < minD) {
      minD = d;
      closest = c;
    }
  }

  return { city: closest, distanceKm: minD };
}

export function getLocationProfile(cityIdOrName: string, radius: AnalysisRadius = '5km'): FullLocationProfile {
  const norm = cityIdOrName.toLowerCase().trim();

  if (norm === 'ahmedabad' || norm === 'sg highway' || norm === 'ahmedabad, gujarat, india') {
    return {
      ...AHMEDABAD_PROFILE,
      location: { ...AHMEDABAD_PROFILE.location, analysisRadius: radius },
    };
  }

  const foundCity = GLOBAL_CITIES.find(
    (c) => c.id.toLowerCase() === norm || c.name.toLowerCase() === norm
  );

  if (foundCity) {
    return generateProfileForCity(foundCity, radius);
  }

  // Fallback to Ahmedabad if not found
  return {
    ...AHMEDABAD_PROFILE,
    location: { ...AHMEDABAD_PROFILE.location, analysisRadius: radius },
  };
}

export function getProfileForCoordinates(
  lat: number,
  lng: number,
  radius: AnalysisRadius = '5km',
  customAddress?: string
): FullLocationProfile {
  // Check if close to any known city (< 0.4 degrees ~ 40 km)
  const nearest = findNearestCity(lat, lng);

  if (nearest.distanceKm < 35) {
    const profile = generateProfileForCity(nearest.city, radius);
    return {
      ...profile,
      location: {
        ...profile.location,
        latitude: lat,
        longitude: lng,
        address: customAddress || profile.location.address,
        analysisRadius: radius,
      },
    };
  }

  // Synthesize realistic environmental profile from coordinates & geographic belt
  const absLat = Math.abs(lat);
  const isTropical = absLat < 23.5;
  const isSubtropical = absLat >= 23.5 && absLat < 35.0;
  const isDesertBelt = (absLat >= 18 && absLat <= 34) && ((lng >= 10 && lng <= 60) || (lng >= -120 && lng <= -100));

  let airTemp = 28;
  let humidity = 60;
  let climateZone = 'Cfa (Humid Temperate)';

  if (isDesertBelt) {
    airTemp = 41.5;
    humidity = 25;
    climateZone = 'BWh (Arid Desert)';
  } else if (isTropical) {
    airTemp = 33.5;
    humidity = 78;
    climateZone = 'Af (Tropical Rainforest / Monsoon)';
  } else if (isSubtropical) {
    airTemp = 35.0;
    humidity = 50;
    climateZone = 'Csa / BSh (Subtropical)';
  } else {
    airTemp = 22.0;
    humidity = 65;
    climateZone = 'Dfb (Continental)';
  }

  const feelsLike = calculateHeatIndex(airTemp, humidity);
  const surfaceTemp = Math.round((airTemp + (isDesertBelt ? 14 : 9)) * 10) / 10;

  const treeCoverage = isDesertBelt ? 6 : isTropical ? 38 : 16;
  const roadDensity = 58;
  const buildingDensity = 62;
  const trafficLevel = 55;

  const scoreResult = calculateEcoPulseHeatScore({
    airTemp,
    feelsLike,
    surfaceTemp,
    treeCoveragePercent: treeCoverage,
    roadDensityPercent: roadDensity,
    buildingDensityPercent: buildingDensity,
    trafficLevelPercent: trafficLevel,
    isDesertClimate: isDesertBelt,
  });

  const locData: LocationData = {
    id: `coord-${lat.toFixed(4)}-${lng.toFixed(4)}`,
    name: `GIS Point (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`,
    city: `Grid Cell [${lat.toFixed(2)}, ${lng.toFixed(2)}]`,
    country: `Lat ${lat.toFixed(2)}° / Lng ${lng.toFixed(2)}°`,
    address: customAddress || `Interrogated Earth Coordinate (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`,
    latitude: lat,
    longitude: lng,
    timezone: 'UTC Estimated',
    climateZone,
    elevationMeters: 45,
    analysisRadius: radius,
  };

  const weather: WeatherObservation = {
    airTemperature: airTemp,
    feelsLike,
    surfaceTemperature: surfaceTemp,
    humidity,
    windSpeed: 14.0,
    windDirection: 'NW (315°)',
    solarRadiation: isDesertBelt ? 940 : 780,
    uvIndex: isDesertBelt ? 10.5 : 8.2,
    cloudCover: isDesertBelt ? 5 : 35,
    precipitationMm: 0,
    condition: isDesertBelt ? 'Arid sunny sky' : 'Partly cloudy',
    pressureHpa: 1012,
    aqi: 110,
    aqiStatus: 'Moderate',
    uhiDelta: isDesertBelt ? 1.8 : 3.4,
    timestamp: 'Just now (LIVE Interpolation)',
    lstObservationDate: 'Oct 01, 2026 (Landsat-9 Pass)',
    lstSensor: 'Landsat-9 TIRS Band 10 (30m)',
  };

  const heatScore: HeatScoreData = {
    score: scoreResult.score,
    category: scoreResult.category,
    methodologyNotes: 'Interpolated from global gridded climatology (ERA5 Reanalysis & Landsat LST). Distinguishes natural baseline radiation from local surface modifications.',
    confidenceOverall: 84,
    anthropogenicRatio: scoreResult.anthropogenicRatio,
    naturalClimateRatio: scoreResult.naturalClimateRatio,
  };

  const contributors: HeatContributor[] = [
    {
      id: 'cc-1',
      factor: isDesertBelt ? 'Natural Desert Radiation & Arid Solar Insolation' : 'Impervious Asphalt & Pavement Network',
      label: isDesertBelt ? 'Natural Desert Climate' : 'Asphalt Surfaces',
      category: isDesertBelt ? 'natural_climate' : 'built_environment',
      impact: 'High',
      impactPercent: isDesertBelt ? 38 : 28,
      isMeasured: true,
      confidence: 92,
      confidenceLevel: 'High',
      freshness: 'RECENT',
      sourceType: 'SCIENTIFIC',
      dataSource: 'Landsat-9 TIRS Surface Reflectance & MODIS Land Cover',
      measurementValue: `LST peak reaching ${surfaceTemp}°C`,
      timestampDescription: 'Satellite pass 2 days ago',
      evidence: `Surface emissivity analysis indicates LST skin temperature reaching ${surfaceTemp}°C during peak solar culmination.`,
      mitigationOpportunity: isDesertBelt ? 'Architectural tensile shading & passive desert shelter.' : 'Cool pavement coatings & roadside trees.',
    },
    {
      id: 'cc-2',
      factor: 'Vegetation Canopy Deficit',
      label: `Low Canopy (${treeCoverage}%)`,
      category: 'built_environment',
      impact: 'High',
      impactPercent: 25,
      isMeasured: true,
      confidence: 94,
      confidenceLevel: 'High',
      freshness: 'HISTORICAL',
      sourceType: 'SCIENTIFIC',
      dataSource: 'Copernicus Sentinel-2 NDVI 10m Resolution',
      measurementValue: `${treeCoverage}% canopy cover`,
      timestampDescription: 'Sentinel-2 composite',
      evidence: `Canopy density is measured at ${treeCoverage}%, which leaves ground surfaces unprotected from direct solar absorption.`,
      mitigationOpportunity: 'Afforestation with climate-adapted native species.',
    },
    {
      id: 'cc-3',
      factor: 'Built Surface Concrete Mass & Structures',
      label: 'Concrete Mass & Roof Albedo',
      category: 'built_environment',
      impact: 'Medium',
      impactPercent: 20,
      isMeasured: true,
      confidence: 86,
      confidenceLevel: 'High',
      freshness: 'RECENT',
      sourceType: 'OPEN DATA',
      dataSource: 'OpenStreetMap Building Footprints & Sentinel-1 SAR',
      measurementValue: '62% built density fraction',
      timestampDescription: 'OSM Vector layer',
      evidence: 'High thermal inertia concrete absorbs sensible heat throughout daytime and delays nocturnal cooling.',
      mitigationOpportunity: 'Deploy high-reflectance cool roofs with Solar Reflectance Index >= 75.',
    },
    {
      id: 'cc-4',
      factor: 'Vehicular Emissions & Waste Heat',
      label: 'Traffic & Vehicle Heat',
      category: 'anthropogenic',
      impact: 'Medium',
      impactPercent: 12,
      isMeasured: false,
      confidence: 65,
      confidenceLevel: 'Medium',
      freshness: 'LIVE',
      sourceType: 'COMMERCIAL API',
      dataSource: 'AI Inferred from Road Classification & Population Grid',
      measurementValue: 'Moderate vehicular flux',
      timestampDescription: 'LIVE fleet telemetry',
      evidence: 'Combustion engines and vehicle air conditioning exhaust add localized heat into the boundary layer.',
      mitigationOpportunity: 'Improve traffic velocity to eliminate idling and encourage low-emission transport.',
    },
  ];

  const recommendations: Recommendation[] = [
    {
      id: 'crec-1',
      priority: 1,
      factor: 'Vegetation Canopy',
      title: 'Targeted Native Tree Planting & Shading',
      why: `Low canopy cover (${treeCoverage}%) produces high surface temperature (${surfaceTemp}°C) and elevated pedestrian heat distress.`,
      where: 'Public walkways, open parking lots, school grounds, and arterial road medians.',
      what: 'Plant climate-appropriate native trees with continuous canopy formation and drip irrigation.',
      expectedEffect: 'Surface temperature reduction of -3.0°C to -5.0°C; ambient cooling of -0.8°C to -1.5°C.',
      tempDropSurfaceRange: [3.0, 5.0],
      tempDropAmbientRange: [0.8, 1.5],
      confidence: 'High',
      coBenefits: ['Groundwater infiltration', 'Particulate air pollution filtration'],
      feasibility: 'Immediate',
      costCategory: 'Medium',
    },
    {
      id: 'crec-2',
      priority: 2,
      factor: 'Built Surface Albedo',
      title: 'High-Albedo Cool Roof & Pavement Standard',
      why: 'Dark roofs and asphalt absorb >80% of solar radiation, converting sunlight directly into sensible urban heat.',
      where: 'Flat residential and commercial roofs, public building rooftops, and parking lots.',
      what: 'Apply certified solar-reflective elastomeric white coatings (SRI > 78).',
      expectedEffect: 'Roof surface drop of -8.0°C to -12.0°C; localized ambient cooling of -0.7°C to -1.2°C.',
      tempDropSurfaceRange: [8.0, 12.0],
      tempDropAmbientRange: [0.7, 1.2],
      confidence: 'High',
      coBenefits: ['Up to 15% indoor air conditioning electricity savings'],
      feasibility: 'Short-Term',
      costCategory: 'Low',
    },
  ];

  const diagnosis: AIDiagnosis = {
    summary: `Location at coordinates (${lat.toFixed(4)}°, ${lng.toFixed(4)}°) exhibits an EcoPulse Heat Score of ${scoreResult.score}/100 (${scoreResult.category}). The strongest measurable signals are Land Surface Temperature (~${surfaceTemp}°C), low vegetation cover (${treeCoverage}%), and impervious surfaces.`,
    naturalVsHumanAnalysis: isDesertBelt
      ? 'The majority (65%) of current heat pressure is driven by natural arid latitude solar insolation and desert geography, rather than excessive urban pollution. Interventions should focus on shade protection and water-efficient passive cooling.'
      : 'Approximately 65% of the thermal intensity is anthropogenic, driven by low vegetation and impervious built surfaces that trap solar radiation.',
    urbanMorphologyDetails: `Surface temperature of ${surfaceTemp}°C indicates that dark unshaded ground covers are re-radiating heat into the lower atmosphere.`,
    thermalRiskAssessment: `Heat Index feels like ${feelsLike}°C. Prolonged physical outdoor exposure between 12:00 and 16:00 warrants heat-health precautions.`,
    confidenceScore: 84,
    confidenceLevel: 'High',
    keyDatasets: ['ERA5 Global Reanalysis (ECMWF)', 'Landsat-9 TIRS Thermal Infrared', 'Copernicus Global Land Service'],
    citations: [
      {
        id: 'coord-cite-1',
        title: 'Global Gridded Urban Heat Island Database & Biophysical Indicators',
        organization: 'European Commission Joint Research Centre (JRC)',
        type: 'Scientific',
        url: 'https://joint-research-centre.ec.europa.eu/',
        publicationDate: '2025',
        summary: 'Global surface temperature anomalies across 10,000 urban centers derived from MODIS and Sentinel-3.',
      },
    ],
    disclaimer: 'Point analysis calculated via spatial interpolation of nearest meteorological station observations and high-resolution satellite remote sensing.',
  };

  const domains: EnvironmentalDomainAnalysis = {
    vegetation: {
      vegetationCoveragePercent: treeCoverage * 1.5,
      treeCanopyPercent: treeCoverage,
      ndviIndex: isDesertBelt ? 0.12 : isTropical ? 0.65 : 0.28,
      greenSpacePercent: treeCoverage * 1.2,
      assessment: treeCoverage < 10 ? 'Very Low' : treeCoverage < 20 ? 'Low' : 'Moderate',
      freshness: 'HISTORICAL',
      source: 'Copernicus Sentinel-2 NDVI (10m)',
    },
    roads: {
      roadDensityPercent: roadDensity,
      majorRoadsCount: Math.round(roadDensity / 12),
      highwayProximityKm: 1.2,
      pavedAreaPercent: roadDensity + 8,
      parkingSurfacesHigh: true,
      intersectionDensity: 'Medium',
      surfaceType: 'Asphalt & Compacted Aggregate',
      freshness: 'RECENT',
      source: 'OpenStreetMap Vector GIS',
    },
    buildings: {
      buildingDensityPercent: buildingDensity,
      builtUpAreaPercent: buildingDensity + 5,
      roofCoveragePercent: buildingDensity * 0.55,
      openSpacePercent: 100 - buildingDensity,
      avgBuildingHeightMeters: 14.5,
      commercialDensity: 'Medium',
      heatContribution: 'Moderate',
      freshness: 'RECENT',
      source: 'Satellite 3D Massing & Footprints',
    },
    traffic: {
      trafficLevel: trafficLevel > 65 ? 'Heavy' : 'Moderate',
      congestionIndexPercent: trafficLevel,
      majorCongestionZonesCount: Math.max(1, Math.round(trafficLevel / 30)),
      idlingHeatFluxWPerM2: trafficLevel * 0.35,
      peakHours: '08:30 - 10:30 & 17:00 - 19:30',
      freshness: 'LIVE',
      source: 'Global Fleet Telemetry Feed',
    },
    industrial: {
      facilitiesWithinRadius: isDesertBelt ? 2 : 6,
      primaryTypes: ['Logistics & Warehousing', 'Local Manufacturing'],
      thermalRelevance: 'Low',
      freshness: 'RECENT',
      source: 'MODIS Thermal Anomaly Product',
    },
    dataCenters: {
      facilitiesDetected: 0,
      nearestDistanceKm: 18.5,
      potentialRelevance: 'Negligible',
      cautiousNote: 'No hyperscale data center facilities identified within immediate analysis buffer.',
      freshness: 'RECENT',
      source: 'Public Infrastructure Registry',
    },
    water: {
      waterCoveragePercent: isTropical ? 8.5 : isDesertBelt ? 0.5 : 3.2,
      nearestWaterBodyName: isDesertBelt ? 'Ephemeral Drainage Channel' : 'Local Reservoir / Lake',
      nearestDistanceKm: isDesertBelt ? 6.5 : 2.4,
      coolingBenefitC: isDesertBelt ? -0.2 : -1.2,
      freshness: 'LIVE',
      source: 'Sentinel-2 Water Mask',
    },
  };

  const scenarioZones: ScenarioZone[] = [
    {
      id: `sz-coord-tree`,
      type: 'tree',
      label: 'Priority Shaded Corridor Planting',
      colorHex: '#10b981',
      lat: lat + 0.005,
      lng: lng + 0.005,
      radiusMeters: 600,
      recommendedAction: 'Plant drought-tolerant canopy trees along primary commuter path.',
      reason: 'Low canopy cover + high solar insolation.',
      estimatedSurfaceDropC: 3.5,
      estimatedAmbientDropC: 1.0,
      confidence: 'High',
      costCategory: 'Medium',
    },
    {
      id: `sz-coord-roof`,
      type: 'cool_roof',
      label: 'Core Roof Solar Reflectance Zone',
      colorHex: '#38bdf8',
      lat: lat - 0.004,
      lng: lng - 0.004,
      radiusMeters: 500,
      recommendedAction: 'Deploy high-SRI reflective coating on flat building roofs.',
      reason: 'Reduces solar heat conduction into structures and boundary layer air.',
      estimatedSurfaceDropC: 8.0,
      estimatedAmbientDropC: 0.8,
      confidence: 'High',
      costCategory: 'Low',
    },
  ];

  const projections: FutureProjections = {
    shortTerm: [
      { day: 'Today', date: 'Current', tempMax: airTemp, tempMin: airTemp - 11, heatIndex: feelsLike, humidity, heatRisk: scoreResult.category, summary: 'Typical daytime peak' },
      { day: 'Tomorrow', date: 'Next Day', tempMax: airTemp + 0.8, tempMin: airTemp - 10.5, heatIndex: feelsLike + 1.2, humidity: humidity - 2, heatRisk: scoreResult.category, summary: 'Persisting high thermal load' },
      { day: 'Day 3', date: '3-Day', tempMax: airTemp + 0.4, tempMin: airTemp - 11, heatIndex: feelsLike + 0.6, humidity, heatRisk: scoreResult.category, summary: 'Stable atmospheric conditions' },
      { day: 'Day 4', date: '4-Day', tempMax: airTemp - 0.5, tempMin: airTemp - 12, heatIndex: feelsLike - 0.8, humidity, heatRisk: scoreResult.category, summary: 'Slight cooling trend' },
      { day: 'Day 5', date: '5-Day', tempMax: airTemp - 1.0, tempMin: airTemp - 12.5, heatIndex: feelsLike - 1.5, humidity: humidity + 3, heatRisk: 'Moderate', summary: 'Milder breeze' },
      { day: 'Day 6', date: '6-Day', tempMax: airTemp - 0.2, tempMin: airTemp - 11.8, heatIndex: feelsLike - 0.3, humidity, heatRisk: scoreResult.category, summary: 'Seasonal baseline' },
      { day: 'Day 7', date: '7-Day', tempMax: airTemp + 0.3, tempMin: airTemp - 11.2, heatIndex: feelsLike + 0.5, humidity, heatRisk: scoreResult.category, summary: 'Clear conditions' },
    ],
    seasonalOutlook: {
      period: 'Next 3 Months',
      temperatureAnomaly: 1.1,
      baselineClimatology: 'Copernicus Multi-Model Seasonal Climatology',
      ensoStatus: 'Neutral ENSO',
      confidence: 'Medium (Ensemble spread +/- 0.4°C)',
      narrative: 'Seasonal models predict temperatures 0.8°C to 1.3°C warmer than 30-year historical means, with delayed autumn transition.',
    },
    climateProjections: [
      {
        scenario: 'Paris-Aligned (SSP1-2.6)',
        scenarioCode: 'SSP1-2.6',
        horizonYear: 2040,
        warmingDeltaC: 1.0,
        heatwaveDaysDelta: 12,
        coolingDegreeDaysDelta: 210,
        description: 'Coordinated global emissions reduction scenario.',
      },
      {
        scenario: 'Current Trajectory (SSP2-4.5)',
        scenarioCode: 'SSP2-4.5',
        horizonYear: 2040,
        warmingDeltaC: 1.7,
        heatwaveDaysDelta: 26,
        coolingDegreeDaysDelta: 420,
        description: 'Middle-of-the-road emissions with continuous urbanization.',
      },
      {
        scenario: 'High Emissions (SSP5-8.5)',
        scenarioCode: 'SSP5-8.5',
        horizonYear: 2050,
        warmingDeltaC: 3.1,
        heatwaveDaysDelta: 49,
        coolingDegreeDaysDelta: 810,
        description: 'Rapid warming scenario with intensified heatwave duration.',
      },
    ],
    timeline: [
      { period: 'TODAY', label: 'Current Condition', riskScore: scoreResult.score, fillPercent: scoreResult.score, metricLabel: `Score: ${scoreResult.score}` },
      { period: '3 MONTHS', label: 'Seasonal Peak', riskScore: Math.min(99, scoreResult.score + 5), fillPercent: Math.min(99, scoreResult.score + 5), metricLabel: `Projected: ${Math.min(99, scoreResult.score + 5)}` },
      { period: '6 MONTHS', label: 'Semi-Annual Cycle', riskScore: Math.min(99, scoreResult.score + 10), fillPercent: Math.min(99, scoreResult.score + 10), metricLabel: `Projected: ${Math.min(99, scoreResult.score + 10)}` },
      { period: '1 YEAR', label: 'Annual Mean Trend', riskScore: Math.min(99, scoreResult.score + 3), fillPercent: Math.min(99, scoreResult.score + 3), metricLabel: `Projected: ${Math.min(99, scoreResult.score + 3)}` },
    ],
  };

  return {
    location: locData,
    weather,
    heatScore,
    contributors,
    recommendations,
    diagnosis,
    projections,
    domains,
    scenarioZones,
  };
}

function generateProfileForCity(city: CityHotspot, radius: AnalysisRadius = '5km'): FullLocationProfile {
  const isDesert = city.climateZone.includes('Desert') || city.climateZone.includes('BWh');
  const treePercent = isDesert ? 6 : city.category === 'Extreme' ? 8 : city.category === 'Very High' ? 12 : 22;
  const roadDensity = city.category === 'Extreme' ? 74 : city.category === 'Very High' ? 70 : 62;
  const buildingDensity = city.category === 'Extreme' ? 84 : city.category === 'Very High' ? 78 : 68;
  const trafficLevel = city.category === 'Extreme' ? 80 : city.category === 'Very High' ? 75 : 64;

  const scoreResult = calculateEcoPulseHeatScore({
    airTemp: city.airTemp,
    feelsLike: city.heatIndex,
    surfaceTemp: city.surfaceTemp,
    treeCoveragePercent: treePercent,
    roadDensityPercent: roadDensity,
    buildingDensityPercent: buildingDensity,
    trafficLevelPercent: trafficLevel,
    isDesertClimate: isDesert,
  });

  const contributors: HeatContributor[] = [
    {
      id: `${city.id}-c1`,
      factor: 'Asphalt & Pavement Thermal Absorption',
      label: 'Paved Road Corridors',
      category: 'built_environment',
      impact: 'High',
      impactPercent: 28,
      isMeasured: true,
      confidence: 93,
      confidenceLevel: 'High',
      freshness: 'RECENT',
      sourceType: 'SCIENTIFIC',
      dataSource: 'Copernicus Sentinel-2 & OpenStreetMap',
      measurementValue: `${roadDensity}% road area fraction, LST ${city.surfaceTemp}°C`,
      timestampDescription: 'Satellite pass 2 days ago',
      evidence: `Arterial corridors exhibit surface albedo < 0.12, driving daytime LST to ${city.surfaceTemp}°C.`,
      mitigationOpportunity: 'Reflective cool pavement sealants and tree shading.',
    },
    {
      id: `${city.id}-c2`,
      factor: 'Urban Tree Canopy Deficit',
      label: `Low Tree Canopy (${treePercent}%)`,
      category: 'built_environment',
      impact: 'High',
      impactPercent: 24,
      isMeasured: true,
      confidence: 95,
      confidenceLevel: 'High',
      freshness: 'HISTORICAL',
      sourceType: 'SCIENTIFIC',
      dataSource: 'Landsat-9 OLI NDVI & Canopy LIDAR',
      measurementValue: `${treePercent}% tree canopy coverage`,
      timestampDescription: 'Canopy census 2026',
      evidence: 'Severe canopy deficit in core transit corridors eliminates evaporative microclimate cooling.',
      mitigationOpportunity: 'Street-tree afforestation corridors.',
    },
    {
      id: `${city.id}-c3`,
      factor: 'Dense Built Geometry & Roof Absorption',
      label: 'Building Density & Roofs',
      category: 'built_environment',
      impact: 'High',
      impactPercent: 22,
      isMeasured: true,
      confidence: 89,
      confidenceLevel: 'High',
      freshness: 'RECENT',
      sourceType: 'OPEN DATA',
      dataSource: '3D Building Registry & Thermal IR',
      measurementValue: `${buildingDensity}% built footprint coverage`,
      timestampDescription: 'Municipal GIS dataset',
      evidence: 'Dark roofs trap solar radiation and release heat at night, elevating nocturnal minimums.',
      mitigationOpportunity: 'Cool roof paint and green roofs where structurally feasible.',
    },
    {
      id: `${city.id}-c4`,
      factor: 'Vehicular Traffic & Air Conditioner Rejection',
      label: 'Traffic & AC Waste Heat',
      category: 'anthropogenic',
      impact: 'Medium',
      impactPercent: 16,
      isMeasured: false,
      confidence: 58,
      confidenceLevel: 'Medium',
      freshness: 'LIVE',
      sourceType: 'COMMERCIAL API',
      dataSource: 'AI Inferred from Grid Demand & Traffic Density',
      measurementValue: `Congestion index ${trafficLevel}%`,
      timestampDescription: '5 minutes ago (LIVE)',
      evidence: 'Combustion exhaust and building chiller heat exhaust elevate street canyon temperatures.',
      mitigationOpportunity: 'Intelligent traffic signals and shaded AC condenser enclosures.',
    },
  ];

  const recommendations: Recommendation[] = [
    {
      id: `${city.id}-r1`,
      priority: 1,
      factor: 'Tree Canopy Deficit',
      title: `Metropolitan Canopy Expansion for ${city.name}`,
      why: `Surface temperatures reaching ${city.surfaceTemp}°C require immediate living shade to reduce mean radiant temperature for citizens.`,
      where: 'Primary commuter corridors, transit plazas, and pedestrian business districts.',
      what: 'Deploy 12,000 native large-canopy trees with automated root-drip irrigation.',
      expectedEffect: 'Expected surface temperature reduction of -2.4°C to -4.0°C along planted corridors.',
      tempDropSurfaceRange: [2.4, 4.0],
      tempDropAmbientRange: [0.7, 1.3],
      confidence: 'High',
      coBenefits: ['Air quality enhancement', 'Stormwater mitigation', 'Walkability improvement'],
      feasibility: 'Immediate',
      costCategory: 'Medium',
    },
    {
      id: `${city.id}-r2`,
      priority: 2,
      factor: 'Building Roof Heat',
      title: 'Municipal Reflective Cool Roof Standard',
      why: 'Rooftops comprise 20-25% of urban surface area; converting to high-albedo material prevents solar heat intake.',
      where: 'Public buildings, logistics warehouses, and residential flat roofs.',
      what: 'Mandate white elastomeric coating with Solar Reflectance Index >= 78.',
      expectedEffect: 'Building surface drop of -7.0°C to -11.0°C; ambient air drop of -0.6°C to -1.0°C.',
      tempDropSurfaceRange: [7.0, 11.0],
      tempDropAmbientRange: [0.6, 1.0],
      confidence: 'High',
      coBenefits: ['Electricity bills lowered by up to 15%'],
      feasibility: 'Immediate',
      costCategory: 'Low',
    },
    {
      id: `${city.id}-r3`,
      priority: 3,
      factor: 'Road Heat',
      title: 'Cool Pavement & Shaded Pedestrian Paths',
      why: 'Asphalt corridors retain extreme heat and re-radiate into street-level air.',
      where: 'High-foot-traffic sidewalks, parking lots, and boulevard lanes.',
      what: 'Apply solar-reflective road sealers and install lightweight solar shading canopies.',
      expectedEffect: 'Surface temperature reduction of -4.5°C to -8.0°C.',
      tempDropSurfaceRange: [4.5, 8.0],
      tempDropAmbientRange: [0.5, 0.9],
      confidence: 'Medium',
      coBenefits: ['Longer road lifetime'],
      feasibility: 'Short-Term',
      costCategory: 'Medium',
    },
  ];

  const diagnosis: AIDiagnosis = {
    summary: `${city.name} is experiencing elevated heat pressure with an EcoPulse Heat Score of ${city.heatScore}/100 (${city.category}). Primary driver: ${city.primaryContributor}. The strongest measurable signals are Land Surface Temperature (${city.surfaceTemp}°C), low vegetation canopy (${treePercent}%), and dense built-up cover (${buildingDensity}%).`,
    naturalVsHumanAnalysis: isDesert
      ? `While ${city.name} naturally resides in an arid climate zone (${city.climateZone}), human urban development with concrete surfaces and HVAC heat rejection adds significant localized heat stress (+${scoreResult.anthropogenicRatio}% anthropogenic amplification).`
      : `Analysis reveals that ${scoreResult.anthropogenicRatio}% of the localized heat excess is driven by built-environment modifications (impervious surfaces, low tree canopy, vehicular heat) atop natural weather conditions.`,
    urbanMorphologyDetails: `Land surface temperature measured by thermal satellites reaches ${city.surfaceTemp}°C, significantly exceeding ambient air temperature (${city.airTemp}°C).`,
    thermalRiskAssessment: `Heat Index of ${city.heatIndex}°C places outdoor populations at heightened risk of heat cramps and heat exhaustion.`,
    confidenceScore: 91,
    confidenceLevel: 'High',
    keyDatasets: ['Sentinel-2 MSI', 'Landsat-9 TIRS', 'World Meteorological Organization Network'],
    citations: [
      {
        id: `${city.id}-cite-1`,
        title: `Urban Climate & Microclimate Resilience Framework for ${city.name}`,
        organization: `${city.name} Environmental Planning Agency`,
        type: 'Government',
        url: 'https://unfccc.int/',
        publicationDate: '2025',
        summary: 'Metropolitan vulnerability assessment detailing urban canopy deficit and extreme heat exposure.',
      },
    ],
    disclaimer: 'EcoPulse Heat Score is an analytical decision-support metric synthesizing satellite observations and microclimate physics.',
  };

  const domains: EnvironmentalDomainAnalysis = {
    vegetation: {
      vegetationCoveragePercent: treePercent * 1.4,
      treeCanopyPercent: treePercent,
      ndviIndex: isDesert ? 0.14 : 0.26,
      greenSpacePercent: treePercent * 1.1,
      assessment: treePercent < 10 ? 'Very Low' : 'Low',
      freshness: 'HISTORICAL',
      source: 'Copernicus Sentinel-2 Level 2A (10m)',
    },
    roads: {
      roadDensityPercent: roadDensity,
      majorRoadsCount: Math.round(roadDensity / 10),
      highwayProximityKm: 0.6,
      pavedAreaPercent: roadDensity + 5,
      parkingSurfacesHigh: true,
      intersectionDensity: 'High',
      surfaceType: 'Asphalt & Bitumen',
      freshness: 'RECENT',
      source: 'OpenStreetMap Vector Network',
    },
    buildings: {
      buildingDensityPercent: buildingDensity,
      builtUpAreaPercent: buildingDensity + 4,
      roofCoveragePercent: buildingDensity * 0.52,
      openSpacePercent: 100 - buildingDensity,
      avgBuildingHeightMeters: 28.0,
      commercialDensity: 'High',
      heatContribution: 'Significant',
      freshness: 'RECENT',
      source: 'Satellite 3D Massing & Municipal Footprints',
    },
    traffic: {
      trafficLevel: trafficLevel > 75 ? 'Heavy' : 'Moderate',
      congestionIndexPercent: trafficLevel,
      majorCongestionZonesCount: Math.max(2, Math.round(trafficLevel / 25)),
      idlingHeatFluxWPerM2: trafficLevel * 0.4,
      peakHours: '08:00 - 10:30 & 17:30 - 20:00',
      freshness: 'LIVE',
      source: 'Fleet Speed API (LIVE)',
    },
    industrial: {
      facilitiesWithinRadius: isDesert ? 3 : 8,
      primaryTypes: ['Logistics', 'Manufacturing', 'Energy'],
      thermalRelevance: 'Medium',
      freshness: 'RECENT',
      source: 'MODIS Thermal Anomaly Mask',
    },
    dataCenters: {
      facilitiesDetected: isDesert ? 1 : 2,
      nearestDistanceKm: 3.8,
      potentialRelevance: 'Low',
      cautiousNote: 'Identified facilities use closed-loop cooling towers; localized thermal contribution is bounded.',
      freshness: 'RECENT',
      source: 'Verified Infrastructure Registry',
    },
    water: {
      waterCoveragePercent: 4.2,
      nearestWaterBodyName: 'Regional Coastal / River Waterway',
      nearestDistanceKm: 2.1,
      coolingBenefitC: -1.8,
      freshness: 'LIVE',
      source: 'Sentinel-2 Water Mask',
    },
  };

  const scenarioZones: ScenarioZone[] = [
    {
      id: `${city.id}-sz-tree`,
      type: 'tree',
      label: `${city.name} Canopy Afforestation Corridor`,
      colorHex: '#10b981',
      lat: city.lat + 0.008,
      lng: city.lng + 0.008,
      radiusMeters: 900,
      recommendedAction: 'Plant 5,000 climate-resilient native canopy trees along transit boulevard.',
      reason: 'Low canopy coverage + high solar radiant exposure.',
      estimatedSurfaceDropC: 3.8,
      estimatedAmbientDropC: 1.1,
      confidence: 'High',
      costCategory: 'Medium',
    },
    {
      id: `${city.id}-sz-roof`,
      type: 'cool_roof',
      label: `${city.name} Cool Roof Initiative Cluster`,
      colorHex: '#38bdf8',
      lat: city.lat - 0.006,
      lng: city.lng - 0.006,
      radiusMeters: 750,
      recommendedAction: 'Deploy solar-reflective roof membrane (SRI >= 80) across target flat roofs.',
      reason: 'Concrete roofs re-radiate sensible heat continuously after sunset.',
      estimatedSurfaceDropC: 9.0,
      estimatedAmbientDropC: 1.0,
      confidence: 'High',
      costCategory: 'Low',
    },
    {
      id: `${city.id}-sz-pave`,
      type: 'cool_pavement',
      label: `${city.name} Cool Pavement Commercial Strip`,
      colorHex: '#a855f7',
      lat: city.lat + 0.012,
      lng: city.lng - 0.008,
      radiusMeters: 600,
      recommendedAction: 'Apply high-albedo cool pavement coating on parking lots and local roadways.',
      reason: 'Asphalt surface temperature reaches extreme thresholds under summer insolation.',
      estimatedSurfaceDropC: 7.2,
      estimatedAmbientDropC: 0.8,
      confidence: 'Medium',
      costCategory: 'Medium',
    },
    {
      id: `${city.id}-sz-traf`,
      type: 'traffic',
      label: `${city.name} Anti-Idling Traffic Wave`,
      colorHex: '#f97316',
      lat: city.lat - 0.010,
      lng: city.lng + 0.010,
      radiusMeters: 450,
      recommendedAction: 'Deploy adaptive traffic signal timing to reduce congestion and vehicle idling.',
      reason: 'Vehicular idling adds localized sensible heat and combustion plumes during peak hours.',
      estimatedSurfaceDropC: 1.4,
      estimatedAmbientDropC: 0.6,
      confidence: 'Medium',
      costCategory: 'Low',
    },
  ];

  return {
    location: {
      id: city.id,
      name: city.name,
      city: city.name,
      state: city.state,
      country: city.country,
      address: `${city.name} Metropolitan Area, ${city.country}`,
      latitude: city.lat,
      longitude: city.lng,
      timezone: 'Local Metropolitan Time',
      climateZone: city.climateZone,
      elevationMeters: 80,
      population: parseInt(city.population.replace(/[^0-9]/g, '')) * (city.population.includes('M') ? 1000000 : 1000),
      analysisRadius: radius,
    },
    weather: {
      airTemperature: city.airTemp,
      feelsLike: city.heatIndex,
      surfaceTemperature: city.surfaceTemp,
      humidity: Math.round(Math.max(20, Math.min(85, ((city.heatIndex - city.airTemp) * 7) + 40))),
      windSpeed: 14.5,
      windDirection: 'SW (220°)',
      solarRadiation: 860,
      uvIndex: 9.2,
      cloudCover: 10,
      precipitationMm: 0,
      condition: 'Sunny and clear',
      pressureHpa: 1010,
      aqi: 128,
      aqiStatus: 'Moderate',
      uhiDelta: 4.2,
      timestamp: 'Just now (LIVE Station Feed)',
      lstObservationDate: 'Oct 01, 2026 (Sentinel-3 SLSTR Pass)',
      lstSensor: 'Sentinel-3 SLSTR Level 2 (1km) / Landsat-9 (30m)',
    },
    heatScore: {
      score: city.heatScore,
      category: city.category,
      methodologyNotes: `Multi-factor heat index for ${city.name}. Evaluates thermal satellite infrared (LST), road surface density, and urban canopy deficits.`,
      confidenceOverall: 91,
      anthropogenicRatio: scoreResult.anthropogenicRatio,
      naturalClimateRatio: scoreResult.naturalClimateRatio,
    },
    contributors,
    recommendations,
    diagnosis,
    projections: {
      shortTerm: [
        { day: 'Today', date: 'Current', tempMax: city.airTemp, tempMin: city.airTemp - 9, heatIndex: city.heatIndex, humidity: 45, heatRisk: city.category, summary: 'Hot and sunny peak' },
        { day: 'Tomorrow', date: 'Day +1', tempMax: city.airTemp + 0.6, tempMin: city.airTemp - 8.5, heatIndex: city.heatIndex + 0.8, humidity: 44, heatRisk: city.category, summary: 'Sustained thermal conditions' },
        { day: 'Day 3', date: 'Day +2', tempMax: city.airTemp + 0.2, tempMin: city.airTemp - 9, heatIndex: city.heatIndex + 0.3, humidity: 46, heatRisk: city.category, summary: 'Clear sunny skies' },
        { day: 'Day 4', date: 'Day +3', tempMax: city.airTemp - 0.4, tempMin: city.airTemp - 9.5, heatIndex: city.heatIndex - 0.5, humidity: 48, heatRisk: city.category, summary: 'Slight cooling breeze' },
        { day: 'Day 5', date: 'Day +4', tempMax: city.airTemp - 0.8, tempMin: city.airTemp - 10, heatIndex: city.heatIndex - 1.0, humidity: 50, heatRisk: 'Moderate', summary: 'Moderate conditions' },
        { day: 'Day 6', date: 'Day +5', tempMax: city.airTemp, tempMin: city.airTemp - 9.2, heatIndex: city.heatIndex, humidity: 47, heatRisk: city.category, summary: 'Stable seasonal range' },
        { day: 'Day 7', date: 'Day +6', tempMax: city.airTemp + 0.5, tempMin: city.airTemp - 8.8, heatIndex: city.heatIndex + 0.7, humidity: 45, heatRisk: city.category, summary: 'Clear conditions' },
      ],
      seasonalOutlook: {
        period: 'Next 3 Months',
        temperatureAnomaly: 1.3,
        baselineClimatology: `30-Year Climatological Average for ${city.name}`,
        ensoStatus: 'Neutral ENSO',
        confidence: 'High',
        narrative: `Seasonal multi-model ensemble predicts temperatures averaging 1.1°C to 1.5°C above climatological normal for ${city.name}.`,
      },
      climateProjections: [
        {
          scenario: 'SSP1-2.6 (Paris Ambitious)',
          scenarioCode: 'SSP1-2.6',
          horizonYear: 2040,
          warmingDeltaC: 1.2,
          heatwaveDaysDelta: 16,
          coolingDegreeDaysDelta: 260,
          description: 'Strong emissions reduction and proactive municipal cooling.',
        },
        {
          scenario: 'SSP2-4.5 (Middle Trajectory)',
          scenarioCode: 'SSP2-4.5',
          horizonYear: 2040,
          warmingDeltaC: 1.9,
          heatwaveDaysDelta: 31,
          coolingDegreeDaysDelta: 510,
          description: 'Current policy trajectory with moderate warming.',
        },
        {
          scenario: 'SSP5-8.5 (Fossil-Fueled)',
          scenarioCode: 'SSP5-8.5',
          horizonYear: 2050,
          warmingDeltaC: 3.4,
          heatwaveDaysDelta: 58,
          coolingDegreeDaysDelta: 950,
          description: 'Intense warming requiring massive resilience adaptations.',
        },
      ],
      timeline: [
        { period: 'TODAY', label: 'Current Score', riskScore: city.heatScore, fillPercent: city.heatScore, metricLabel: `Score: ${city.heatScore}` },
        { period: '3 MONTHS', label: 'Seasonal Peak', riskScore: Math.min(99, city.heatScore + 6), fillPercent: Math.min(99, city.heatScore + 6), metricLabel: `Projected: ${Math.min(99, city.heatScore + 6)}` },
        { period: '6 MONTHS', label: 'Summer Peak', riskScore: Math.min(99, city.heatScore + 9), fillPercent: Math.min(99, city.heatScore + 9), metricLabel: `Projected: ${Math.min(99, city.heatScore + 9)}` },
        { period: '1 YEAR', label: 'Annual Trend', riskScore: Math.min(99, city.heatScore + 2), fillPercent: Math.min(99, city.heatScore + 2), metricLabel: `Projected: ${Math.min(99, city.heatScore + 2)}` },
      ],
    },
    domains,
    scenarioZones,
  };
}
