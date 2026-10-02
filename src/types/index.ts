export type HeatLevel = 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';

export type DataFreshness = 'LIVE' | 'RECENT' | 'HISTORICAL' | 'MODEL' | 'ESTIMATED';

export type SourceClassification =
  | 'OFFICIAL'
  | 'SCIENTIFIC'
  | 'COMMERCIAL API'
  | 'OPEN DATA'
  | 'WEB REPORT'
  | 'AI INFERENCE';

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export type AnalysisRadius = '500m' | '1km' | '5km' | '10km' | '25km';

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
  placeId?: string;
  analysisRadius?: AnalysisRadius;
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
  precipitationMm?: number;
  condition?: string;
  pressureHpa: number;
  aqi: number;            // 0-500
  aqiStatus: string;
  uhiDelta: number;       // Urban Heat Island delta (+°C above rural background)
  timestamp: string;
  lstObservationDate?: string;
  lstSensor?: string;
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
  confidenceLevel: ConfidenceLevel;
  freshness: DataFreshness;
  sourceType: SourceClassification;
  dataSource: string;
  measurementValue: string;
  timestampDescription: string;
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
  confidence: ConfidenceLevel;
  coBenefits: string[];
  feasibility: 'Immediate' | 'Short-Term' | 'Strategic Long-Term';
  costCategory?: 'Low' | 'Medium' | 'High' | 'Capital Intensive';
}

export interface WebResearchCitation {
  id: string;
  title: string;
  organization: string;
  type: 'Government' | 'Scientific' | 'Copernicus/NASA' | 'University' | 'Reputable Report';
  url: string;
  publicationDate: string;
  summary: string;
}

export interface AIDiagnosis {
  summary: string;
  naturalVsHumanAnalysis: string;
  urbanMorphologyDetails: string;
  thermalRiskAssessment: string;
  confidenceScore: number;
  confidenceLevel: ConfidenceLevel;
  keyDatasets: string[];
  citations: WebResearchCitation[];
  disclaimer: string;
}

export interface VegetationMetrics {
  vegetationCoveragePercent: number; // e.g. 12%
  treeCanopyPercent: number;         // e.g. 8%
  ndviIndex: number;                 // e.g. 0.22
  greenSpacePercent: number;         // e.g. 15%
  assessment: 'Very Low' | 'Low' | 'Low-to-moderate' | 'Moderate' | 'Optimal';
  freshness: DataFreshness;
  source: string;
}

export interface RoadMetrics {
  roadDensityPercent: number;        // e.g. 68%
  majorRoadsCount: number;           // e.g. 7 arterial corridors
  highwayProximityKm: number;        // e.g. 0.8 km
  pavedAreaPercent: number;          // e.g. 74%
  parkingSurfacesHigh: boolean;      // true
  intersectionDensity: 'High' | 'Medium' | 'Low';
  surfaceType: string;               // Bitumen / Asphalt albedo 0.10
  freshness: DataFreshness;
  source: string;
}

export interface BuildingMetrics {
  buildingDensityPercent: number;    // e.g. 82%
  builtUpAreaPercent: number;        // e.g. 84%
  roofCoveragePercent: number;       // e.g. 48%
  openSpacePercent: number;          // e.g. 16%
  avgBuildingHeightMeters: number;   // e.g. 18m
  commercialDensity: 'High' | 'Medium' | 'Low';
  heatContribution: 'Significant' | 'Moderate' | 'Low';
  freshness: DataFreshness;
  source: string;
}

export interface TrafficMetrics {
  trafficLevel: 'Severe' | 'Heavy' | 'Moderate' | 'Light';
  congestionIndexPercent: number;    // e.g. 78%
  majorCongestionZonesCount: number; // e.g. 3
  idlingHeatFluxWPerM2: number;      // e.g. 32 W/m²
  peakHours: string;
  freshness: DataFreshness;
  source: string;
}

export interface IndustrialMetrics {
  facilitiesWithinRadius: number;    // e.g. 12
  primaryTypes: string[];            // e.g. Chemical, Machinery, Logistics
  thermalRelevance: 'High' | 'Medium' | 'Low' | 'None';
  freshness: DataFreshness;
  source: string;
}

export interface DataCenterMetrics {
  facilitiesDetected: number;        // e.g. 2
  nearestDistanceKm: number;         // e.g. 3.4 km
  potentialRelevance: 'Low / Medium' | 'Low' | 'Negligible';
  cautiousNote: string;
  freshness: DataFreshness;
  source: string;
}

export interface WaterMetrics {
  waterCoveragePercent: number;      // e.g. 6%
  nearestWaterBodyName: string;      // e.g. Sabarmati River
  nearestDistanceKm: number;         // e.g. 1.8 km
  coolingBenefitC: number;           // e.g. -2.1°C
  freshness: DataFreshness;
  source: string;
}

export interface EnvironmentalDomainAnalysis {
  vegetation: VegetationMetrics;
  roads: RoadMetrics;
  buildings: BuildingMetrics;
  traffic: TrafficMetrics;
  industrial: IndustrialMetrics;
  dataCenters: DataCenterMetrics;
  water: WaterMetrics;
}

export interface ScenarioZone {
  id: string;
  type: 'tree' | 'cool_roof' | 'cool_pavement' | 'traffic';
  label: string;
  colorHex: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  recommendedAction: string;
  reason: string;
  estimatedSurfaceDropC: number;
  estimatedAmbientDropC: number;
  confidence: ConfidenceLevel;
  costCategory: 'Low' | 'Medium' | 'High' | 'Capital Intensive';
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
  selectedInterventions?: {
    trees: boolean;
    coolRoofs: boolean;
    coolPavement: boolean;
    traffic: boolean;
  };
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
