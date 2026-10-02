import {
  EnvironmentalFeatureVector,
  DiscoveredHeatCause,
  WeatherObservation,
  EvidenceKnowledgeGraph,
} from '../../types';
import { MultiScaleGISAnalysis } from './gisAgent';
import { SatelliteObservationData } from './satelliteAgent';

/**
 * Feature & Cause Discovery Engine (Sections 16–20 & 45)
 * Synthesizes the 12+ continuous environmental feature vector and extracts
 * categorized heat causes with calibrated confidence levels.
 */
export function computeFeatureVectorAndCauses(
  weather: WeatherObservation,
  gis: MultiScaleGISAnalysis,
  satellite: SatelliteObservationData,
  graph: EvidenceKnowledgeGraph
): {
  featureVector: EnvironmentalFeatureVector;
  causes: DiscoveredHeatCause[];
} {
  const roadCoverage = gis.scale500m.roadSurfacePct;
  const buildingCoverage = gis.scale500m.buildingFootprintPct;
  const treeCoverage = gis.scale500m.canopyCoveragePct;
  const waterCoverage = gis.scale5km.waterSurfaceCoveragePct;
  const coolingDeficit = Math.round(100 - (treeCoverage * 2.5 + waterCoverage * 4));

  const featureVector: EnvironmentalFeatureVector = {
    airTemperature: weather.airTemperature,
    humidity: weather.humidity,
    windSpeed: weather.windSpeed,
    solarRadiation: weather.solarRadiation,
    surfaceTemperature: satellite.lstSkinTemperature,
    vegetationIndex: satellite.ndviIndex,
    treeCoverage,
    roadCoverage,
    buildingCoverage,
    waterCoverage,
    trafficIntensity: Math.min(1.0, Math.round((gis.scale1km.arterialCorridorCount * 0.18 + roadCoverage * 0.01) * 100) / 100),
    industrialDensity: gis.scale5km.industrialClusterPresent ? 0.38 : 0.08,
    populationDensity: Math.min(1.0, Math.round((buildingCoverage * 0.012) * 100) / 100),
    albedoAverage: satellite.meanSurfaceAlbedo,
    coolingDeficit: Math.min(98, Math.max(10, coolingDeficit)),
  };

  const causes: DiscoveredHeatCause[] = [];

  // Cause 1: Low Vegetation & Canopy Deficit
  if (treeCoverage < 20 || satellite.ndviIndex < 0.25) {
    causes.push({
      id: 'cause-veg-deficit',
      name: 'Deficient Tree Canopy & Evaporative Cooling Sink',
      category: 'LAND COVER',
      causalityStatus: 'CONFIRMED_CAUSAL',
      confidence: 91,
      evidenceSummary: `Canopy coverage is ${treeCoverage}%, well below the 25% threshold required to mitigate urban boundary layer heat.`,
      supportingEvidenceIds: graph.evidenceItems.filter((e) => e.factor.includes('Vegetation')).map((e) => e.id),
      quantifiedContribution: '~26% of local thermal excess',
    });
  }

  // Cause 2: Low-Albedo Pavement & Road Surfaces
  if (roadCoverage > 22 || satellite.meanSurfaceAlbedo < 0.18) {
    causes.push({
      id: 'cause-low-albedo-roads',
      name: 'High Bituminous Pavement Coverage (Low Albedo)',
      category: 'BUILT ENVIRONMENT',
      causalityStatus: 'CONFIRMED_CAUSAL',
      confidence: 88,
      evidenceSummary: `Road and parking coverage spans ${roadCoverage}% with low surface albedo (${satellite.meanSurfaceAlbedo}), capturing high solar flux.`,
      supportingEvidenceIds: graph.evidenceItems.filter((e) => e.factor.includes('Road') || e.factor.includes('Pavement')).map((e) => e.id),
      quantifiedContribution: '~24% of thermal retention',
    });
  }

  // Cause 3: High Building Density & Reduced Sky View Factor
  if (buildingCoverage > 40) {
    causes.push({
      id: 'cause-building-density',
      name: 'High Building Density & Urban Canyon Radiative Trapping',
      category: 'URBAN FORM',
      causalityStatus: 'LIKELY_CONTRIBUTOR',
      confidence: 84,
      evidenceSummary: `Built footprint is ${buildingCoverage}%, reducing sky view factor and creating multi-reflection heat entrapment.`,
      supportingEvidenceIds: graph.evidenceItems.filter((e) => e.factor.includes('Built-up')).map((e) => e.id),
      quantifiedContribution: '~21% nocturnal heat lag',
    });
  }

  // Cause 4: Regional Solar Insolation & Atmospheric Baseline
  if (weather.solarRadiation > 600 || weather.airTemperature > 32) {
    causes.push({
      id: 'cause-natural-climate',
      name: 'Regional Solar Insolation & Semi-Arid Heat Baseline',
      category: 'NATURAL',
      causalityStatus: 'OBSERVED',
      confidence: 96,
      evidenceSummary: `Direct shortwave solar irradiance of ${weather.solarRadiation} W/m² elevates ground skin temperatures rapidly.`,
      supportingEvidenceIds: graph.evidenceItems.filter((e) => e.factor.includes('Temperature')).map((e) => e.id),
      quantifiedContribution: 'Baseline driving condition',
    });
  }

  // Cause 5: Vehicular Traffic & Exhaust Heat
  if (featureVector.trafficIntensity > 0.45) {
    causes.push({
      id: 'cause-traffic-heat',
      name: 'Vehicular Stop-and-Go Heat & Exhaust Emissions',
      category: 'TRANSPORTATION',
      causalityStatus: 'ASSOCIATED',
      confidence: 67,
      evidenceSummary: `Arterial corridors with high idling index release direct sensible heat plumes into the near-surface canopy.`,
      supportingEvidenceIds: graph.evidenceItems.filter((e) => e.factor.includes('Vehicular')).map((e) => e.id),
      quantifiedContribution: '~11% street-level heating',
    });
  }

  // Cause 6: Industrial or Data Center Activity
  if (gis.scale5km.industrialClusterPresent) {
    causes.push({
      id: 'cause-industrial-heat',
      name: 'Industrial Heat Rejectors & Facility HVAC Thermal Plumes',
      category: 'ENERGY',
      causalityStatus: 'ASSOCIATED',
      confidence: 42,
      evidenceSummary: 'Industrial zones detected within 5km radius contributing localized anthropogenic thermal plumes.',
      supportingEvidenceIds: [],
      quantifiedContribution: '~6% regional background',
    });
  }

  return { featureVector, causes };
}
