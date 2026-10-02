export type HeatLevel = 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface LocationData {
  id: string;
  name: string;
  city: string;
  state?: string;
  country: string;
  address: string;
  latitude: number;
  longitude: number;
  timezone: string;
  climateZone: string;
  elevationMeters: number;
  population?: number;
}

export interface WeatherObservation {
  airTemperature: number; // Celsius
  feelsLike: number;      // Heat Index Celsius
  surfaceTemperature: number; // Land Surface Temperature (LST) Celsius
  humidity: number;       // %
  windSpeed: number;      // km/h
  windDirection: string;
  solarRadiation: number; // W/m²
  uvIndex: number;
  cloudCover: number;     // %
  pressureHpa: number;
  aqi: number;            // 0-500
  aqiStatus: string;
  uhiDelta: number;       // Urban Heat Island delta (+°C above rural background)
  timestamp: string;
}

export interface HeatScoreData {
  score: number; // 0 - 100
  category: HeatLevel;
  methodologyNotes: string;
  confidenceOverall: number; // %
  anthropogenicRatio: number; // % of heat from human/built sources
  naturalClimateRatio: number; // % of heat from natural baseline
}

export interface HeatContributor {
  id: string;
  factor: string;
  label: string;
  category: 'built_environment' | 'anthropogenic' | 'natural_climate' | 'cooling_sink';
  impact: 'Low' | 'Medium' | 'High' | 'Very High' | 'Reducing';
  impactPercent: number; // contribution %
  isMeasured: boolean;    // true = directly observed from satellite/sensor; false = AI estimated/inferred
  confidence: number;    // 0 - 100%
  dataSource: string;
  evidence: string;
  mitigationOpportunity: string;
}

export interface Recommendation {
  id: string;
  priority: number;
  factor: string;
  title: string;
  why: string;
  where: string;
  what: string;
  expectedEffect: string;
  tempDropSurfaceRange: [number, number]; // e.g. [2.0, 4.5] °C
  tempDropAmbientRange: [number, number]; // e.g. [0.6, 1.3] °C
  confidence: 'High' | 'Medium' | 'Low';
  coBenefits: string[];
  feasibility: 'Immediate' | 'Short-Term' | 'Strategic Long-Term';
}

export interface AIDiagnosis {
  summary: string;
  naturalVsHumanAnalysis: string;
  urbanMorphologyDetails: string;
  thermalRiskAssessment: string;
  confidenceScore: number;
  keyDatasets: string[];
  disclaimer: string;
}

export interface ShortTermForecastItem {
  day: string;
  date: string;
  tempMax: number;
  tempMin: number;
  heatIndex: number;
  humidity: number;
  heatRisk: HeatLevel;
  summary: string;
}

export interface SeasonalOutlook {
  period: string;
  temperatureAnomaly: number; // +°C departure from 30-year climatological normal
  baselineClimatology: string;
  ensoStatus: string;
  confidence: string;
  narrative: string;
}

export interface ClimateProjectionScenario {
  scenario: string;
  scenarioCode: 'SSP1-2.6' | 'SSP2-4.5' | 'SSP5-8.5';
  horizonYear: number;
  warmingDeltaC: number;
  heatwaveDaysDelta: number;
  coolingDegreeDaysDelta: number;
  description: string;
}

export interface HeatTimelinePoint {
  period: string;
  label: string;
  riskScore: number;
  fillPercent: number;
  metricLabel: string;
}

export interface FutureProjections {
  shortTerm: ShortTermForecastItem[];
  seasonalOutlook: SeasonalOutlook;
  climateProjections: ClimateProjectionScenario[];
  timeline: HeatTimelinePoint[];
}

export interface ScenarioSimulationParams {
  treesToPlant: number;           // 0 to 50,000
  coolRoofsPercent: number;       // 0% to 100%
  trafficReductionPercent: number;// 0% to 50%
  coolPavementPercent: number;    // 0% to 100%
  shadedCorridorsKm: number;      // 0 to 25 km
}

export interface ScenarioSimulationResult {
  baseHeatScore: number;
  simulatedHeatScore: number;
  heatScoreDelta: number;
  surfaceTempReductionC: number;
  ambientTempReductionC: number;
  heatRiskCategoryBefore: HeatLevel;
  heatRiskCategoryAfter: HeatLevel;
  coolingEnergySavedMWhPerYear: number;
  heatStressReductionDaysPerYear: number;
  co2AbsorbedTonsPerYear: number;
  modelConfidence: string;
}

export type MapLayerId =
  | 'temperature'
  | 'heatIndex'
  | 'lst'
  | 'vegetation'
  | 'treeCanopy'
  | 'roads'
  | 'buildings'
  | 'traffic'
  | 'industrial'
  | 'dataCenters'
  | 'population'
  | 'aqi'
  | 'uhi'
  | 'interventionZones';

export interface MapLayerConfig {
  id: MapLayerId;
  label: string;
  category: 'Thermal & Weather' | 'Surface & Land-Use' | 'Anthropogenic' | 'Planning & Action';
  description: string;
  active: boolean;
  opacity: number;
  legendUnits: string;
  legendColors: string[];
}

export interface CityHotspot {
  id: string;
  name: string;
  country: string;
  state?: string;
  lat: number;
  lng: number;
  airTemp: number;
  heatIndex: number;
  surfaceTemp: number;
  heatScore: number;
  category: HeatLevel;
  primaryContributor: string;
  population: string;
  climateZone: string;
  recentTrend: 'rising' | 'stable' | 'cooling';
}

export interface DataCenterLocation {
  id: string;
  name: string;
  operator: string;
  lat: number;
  lng: number;
  city: string;
  coolingMethod: string;
  estimatedWasteHeatMW: number;
  confidence: number;
  note: string;
}
