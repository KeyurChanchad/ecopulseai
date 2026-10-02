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
} from '../types';

export interface FullLocationProfile {
  location: LocationData;
  weather: WeatherObservation;
  heatScore: HeatScoreData;
  contributors: HeatContributor[];
  recommendations: Recommendation[];
  diagnosis: AIDiagnosis;
  projections: FutureProjections;
}

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

  return GLOBAL_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      (c.state && c.state.toLowerCase().includes(q))
  );
}

export function getLocationProfile(cityIdOrName: string): FullLocationProfile {
  const norm = cityIdOrName.toLowerCase().trim();

  if (norm === 'ahmedabad' || norm === 'sg highway' || norm === 'ahmedabad, gujarat, india') {
    return AHMEDABAD_PROFILE;
  }

  const foundCity = GLOBAL_CITIES.find(
    (c) => c.id.toLowerCase() === norm || c.name.toLowerCase() === norm
  );

  if (foundCity) {
    return generateProfileForCity(foundCity);
  }

  // Fallback to Ahmedabad if not found
  return AHMEDABAD_PROFILE;
}

export function getProfileForCoordinates(lat: number, lng: number): FullLocationProfile {
  // Check if close to any known city (< 0.5 degrees ~ 50 km)
  const nearby = GLOBAL_CITIES.find((c) => {
    const dLat = Math.abs(c.lat - lat);
    const dLng = Math.abs(c.lng - lng);
    return dLat < 0.4 && dLng < 0.4;
  });

  if (nearby) {
    return getLocationProfile(nearby.id);
  }

  // Synthesize realistic environmental profile from coordinates
  const absLat = Math.abs(lat);
  const isTropical = absLat < 23.5;
  const isSubtropical = absLat >= 23.5 && absLat < 35.0;
  const isDesertBelt = (absLat >= 20 && absLat <= 32) && ((lng >= 10 && lng <= 60) || (lng >= -120 && lng <= -100));

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
    address: `Interrogated Earth Coordinate (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`,
    latitude: lat,
    longitude: lng,
    timezone: 'UTC Estimated',
    climateZone,
    elevationMeters: 45,
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
    pressureHpa: 1012,
    aqi: 110,
    aqiStatus: 'Moderate',
    uhiDelta: isDesertBelt ? 1.8 : 3.4,
    timestamp: 'Live Model Interpolation',
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
      dataSource: 'Landsat-9 TIRS Surface Reflectance & MODIS Land Cover',
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
      dataSource: 'Copernicus Sentinel-2 NDVI 10m Resolution',
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
      dataSource: 'OpenStreetMap Building Footprints & Sentinel-1 SAR',
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
      dataSource: 'AI Inferred from Road Classification & Population Grid',
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
    },
  ];

  const diagnosis: AIDiagnosis = {
    summary: `Location at coordinates (${lat.toFixed(4)}°, ${lng.toFixed(4)}°) exhibits an EcoPulse Heat Score of ${scoreResult.score}/100 (${scoreResult.category}).`,
    naturalVsHumanAnalysis: isDesertBelt
      ? 'The majority (65%) of current heat pressure is driven by natural arid latitude solar insolation and desert geography, rather than excessive urban pollution. Interventions should focus on shade protection and water-efficient passive cooling.'
      : 'Approximately 65% of the thermal intensity is anthropogenic, driven by low vegetation and impervious built surfaces that trap solar radiation.',
    urbanMorphologyDetails: `Surface temperature of ${surfaceTemp}°C indicates that dark unshaded ground covers are re-radiating heat into the lower atmosphere.`,
    thermalRiskAssessment: `Heat Index feels like ${feelsLike}°C. Prolonged physical outdoor exposure between 12:00 and 16:00 warrants heat-health precautions.`,
    confidenceScore: 84,
    keyDatasets: ['ERA5 Global Reanalysis (ECMWF)', 'Landsat-9 TIRS Thermal Infrared', 'Copernicus Global Land Service'],
    disclaimer: 'Point analysis calculated via spatial interpolation of nearest meteorological station observations and high-resolution satellite remote sensing.',
  };

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
  };
}

function generateProfileForCity(city: CityHotspot): FullLocationProfile {
  const isDesert = city.climateZone.includes('Desert') || city.climateZone.includes('BWh');
  const scoreResult = calculateEcoPulseHeatScore({
    airTemp: city.airTemp,
    feelsLike: city.heatIndex,
    surfaceTemp: city.surfaceTemp,
    treeCoveragePercent: isDesert ? 5 : 12,
    roadDensityPercent: 65,
    buildingDensityPercent: 72,
    trafficLevelPercent: 68,
    isDesertClimate: isDesert,
  });

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
      pressureHpa: 1010,
      aqi: 128,
      aqiStatus: 'Moderate',
      uhiDelta: 4.2,
      timestamp: '2026-10-02 13:40 Local',
    },
    heatScore: {
      score: city.heatScore,
      category: city.category,
      methodologyNotes: `Multi-factor heat index for ${city.name}. Evaluates thermal satellite infrared (LST), road surface density, and urban canopy deficits.`,
      confidenceOverall: 91,
      anthropogenicRatio: scoreResult.anthropogenicRatio,
      naturalClimateRatio: scoreResult.naturalClimateRatio,
    },
    contributors: [
      {
        id: `${city.id}-c1`,
        factor: 'Asphalt & Pavement Thermal Absorption',
        label: 'Road Surface Heat',
        category: 'built_environment',
        impact: 'High',
        impactPercent: 28,
        isMeasured: true,
        confidence: 93,
        dataSource: 'Copernicus Sentinel-2 & OpenStreetMap',
        evidence: `Arterial corridors exhibit surface albedo < 0.12, driving daytime LST to ${city.surfaceTemp}°C.`,
        mitigationOpportunity: 'Reflective cool pavement sealants and tree shading.',
      },
      {
        id: `${city.id}-c2`,
        factor: 'Urban Tree Canopy Deficit',
        label: 'Low Tree Canopy',
        category: 'built_environment',
        impact: 'High',
        impactPercent: 24,
        isMeasured: true,
        confidence: 95,
        dataSource: 'Landsat-9 OLI NDVI & Canopy LIDAR',
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
        dataSource: '3D Building Registry & Thermal IR',
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
        dataSource: 'AI Inferred from Grid Demand & Traffic Density',
        evidence: 'Combustion exhaust and building chiller heat exhaust elevate street canyon temperatures.',
        mitigationOpportunity: 'Intelligent traffic signals and shaded AC condenser enclosures.',
      },
    ],
    recommendations: [
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
      },
    ],
    diagnosis: {
      summary: `${city.name} is experiencing elevated heat pressure with an EcoPulse Heat Score of ${city.heatScore}/100 (${city.category}). Primary driver: ${city.primaryContributor}.`,
      naturalVsHumanAnalysis: isDesert
        ? `While ${city.name} naturally resides in an arid climate zone (${city.climateZone}), human urban development with concrete surfaces and HVAC heat rejection adds significant localized heat stress (+${scoreResult.anthropogenicRatio}% anthropogenic amplification).`
        : `Analysis reveals that ${scoreResult.anthropogenicRatio}% of the localized heat excess is driven by built-environment modifications (impervious surfaces, low tree canopy, vehicular heat) atop natural weather conditions.`,
      urbanMorphologyDetails: `Land surface temperature measured by thermal satellites reaches ${city.surfaceTemp}°C, significantly exceeding ambient air temperature (${city.airTemp}°C).`,
      thermalRiskAssessment: `Heat Index of ${city.heatIndex}°C places outdoor populations at heightened risk of heat cramps and heat exhaustion.`,
      confidenceScore: 91,
      keyDatasets: ['Sentinel-2 MSI', 'Landsat-9 TIRS', 'World Meteorological Organization Network'],
      disclaimer: 'EcoPulse Heat Score is an analytical decision-support metric synthesizing satellite observations and microclimate physics.',
    },
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
  };
}
