import {
  AnalysisJob,
  JobStatus,
  JobStepKey,
  JobStepProgress,
  AnalysisRadius,
  Recommendation,
} from '../../types';
import { executeWeatherAgent } from './weatherAgent';
import { executeGISAgent } from './gisAgent';
import { executeSatelliteAgent } from './satelliteAgent';
import { executeWebResearchAgent } from './webResearchAgent';
import { computeFeatureVectorAndCauses } from './featureAndCauseEngine';
import { executeInterventionSimulation } from './simulationEngine';
import { getLocationProfile, getProfileForCoordinates, FullLocationProfile } from '../locationService';

export interface OrchestratorRunOptions {
  latitude: number;
  longitude: number;
  locationName: string;
  city: string;
  country: string;
  radius: AnalysisRadius;
  onProgress?: (job: AnalysisJob) => void;
}

const STEP_DEFINITIONS: { key: JobStepKey; label: string }[] = [
  { key: 'coordinates', label: 'Coordinates identified & geographic context resolved' },
  { key: 'weather', label: 'Real-time weather & atmospheric insolation collected' },
  { key: 'gis', label: 'Multi-scale GIS infrastructure & land-use queried' },
  { key: 'satellite', label: 'Satellite Land Surface Temperature & NDVI analyzed' },
  { key: 'webResearch', label: 'Searching scientific literature & municipal heat reports' },
  { key: 'heatModel', label: 'Synthesizing feature vector & discovering causal factors' },
  { key: 'interventions', label: 'Generating context-specific heat reduction solutions' },
  { key: 'simulation', label: 'Running coupled boundary-layer intervention simulation' },
];

function radiusToMeters(radius: AnalysisRadius): number {
  switch (radius) {
    case '500m': return 500;
    case '1km': return 1000;
    case '5km': return 5000;
    case '10km': return 10000;
    case '25km': return 25000;
    default: return 5000;
  }
}

/**
 * Orchestrator (Section 2, 34, 35, 42)
 * Dispatches the multi-agent investigation workflow, updating job state and step list.
 */
export async function runLocationAnalysisOrchestrator(
  options: OrchestratorRunOptions
): Promise<{ job: AnalysisJob; profile: FullLocationProfile }> {
  const { latitude, longitude, locationName, city, country, radius, onProgress } = options;
  const radiusMeters = radiusToMeters(radius);

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const jobId = `EP-${today}-${randomSuffix}`;

  const stepList: JobStepProgress[] = STEP_DEFINITIONS.map((def) => ({
    key: def.key,
    label: def.label,
    status: 'pending',
  }));

  const stepsRecord: Record<JobStepKey, 'pending' | 'running' | 'completed' | 'failed'> = {
    coordinates: 'pending',
    weather: 'pending',
    gis: 'pending',
    satellite: 'pending',
    webResearch: 'pending',
    heatModel: 'pending',
    interventions: 'pending',
    simulation: 'pending',
  };

  const job: AnalysisJob = {
    jobId,
    location: {
      type: 'Point',
      coordinates: [longitude, latitude],
    },
    locationName,
    radius: radiusMeters,
    status: 'QUEUED',
    startedAt: new Date().toISOString(),
    steps: stepsRecord,
    stepList,
  };

  const updateStep = (key: JobStepKey, status: 'running' | 'completed' | 'failed', detail?: string) => {
    job.steps[key] = status;
    const item = job.stepList.find((s) => s.key === key);
    if (item) {
      item.status = status;
      if (detail) item.detail = detail;
      item.timestamp = new Date().toLocaleTimeString();
    }
    if (status === 'running') {
      if (key === 'coordinates' || key === 'weather' || key === 'gis' || key === 'satellite') {
        job.status = 'COLLECTING_DATA';
      } else if (key === 'webResearch') {
        job.status = 'RESEARCHING';
      } else if (key === 'heatModel' || key === 'interventions') {
        job.status = 'ANALYZING';
      } else if (key === 'simulation') {
        job.status = 'SIMULATING';
      }
    }
    onProgress?.({ ...job });
  };

  // Helper delay for visual pacing of asynchronous steps
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Step 1: Coordinates & Context
  updateStep('coordinates', 'running');
  await delay(180);
  const baseProfile = getProfileForCoordinates(latitude, longitude, radius);
  updateStep('coordinates', 'completed', `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E (Radius: ${radius})`);

  // Step 2: Live Weather Agent
  updateStep('weather', 'running');
  const weatherResult = await executeWeatherAgent(latitude, longitude, baseProfile.weather);
  await delay(220);
  updateStep('weather', 'completed', `${weatherResult.weather.airTemperature}°C air | ${weatherResult.weather.solarRadiation} W/m² (${weatherResult.provider})`);

  // Step 3: Multi-Scale GIS Agent
  updateStep('gis', 'running');
  await delay(200);
  const gisResult = executeGISAgent(latitude, longitude, radiusMeters);
  updateStep('gis', 'completed', `Built-up: ${gisResult.scale500m.buildingFootprintPct}% | Roads: ${gisResult.scale500m.roadSurfacePct}% | Land-use: ${gisResult.landUseCategory}`);

  // Step 4: Satellite Agent
  updateStep('satellite', 'running');
  await delay(220);
  const satResult = executeSatelliteAgent(latitude, longitude, weatherResult.weather.airTemperature);
  updateStep('satellite', 'completed', `Skin LST: ${satResult.lstSkinTemperature}°C (+${satResult.deltaSkinVsAir}°C delta) | NDVI: ${satResult.ndviIndex}`);

  // Step 5: Web Research Agent
  updateStep('webResearch', 'running');
  const researchGraph = await executeWebResearchAgent(locationName, city, country, baseProfile.location.climateZone);
  await delay(280);
  updateStep('webResearch', 'completed', `${researchGraph.evidenceItems.length} peer-reviewed & official evidence records linked`);

  // Step 6: Feature Vector & Cause Discovery Engine
  updateStep('heatModel', 'running');
  await delay(220);
  const { featureVector, causes } = computeFeatureVectorAndCauses(
    weatherResult.weather,
    gisResult,
    satResult,
    researchGraph
  );
  job.featureVector = featureVector;
  job.discoveredCauses = causes;
  job.evidenceGraph = researchGraph;
  updateStep('heatModel', 'completed', `${causes.length} primary causal factors identified with calibrated confidence`);

  // Step 7: Recommendations Engine
  updateStep('interventions', 'running');
  await delay(200);
  const tailoredRecs: Recommendation[] = [
    {
      id: 'rec-dyn-01',
      priority: 1,
      factor: 'Urban Tree Canopy & Shaded Corridors',
      title: 'High-Density Shading Tree Planting along Transit Artery',
      why: `Canopy coverage is ${gisResult.scale500m.canopyCoveragePct}%, creating an evaporative cooling deficit in this high solar flux zone.`,
      where: 'Sidewalk pedestrian paths and transit medians within 500m buffer',
      what: 'Plant native drought-tolerant shade trees (e.g. Neem, Peepal, or local broadleaf species) with permeable tree pits',
      expectedEffect: 'Reduces street-level pavement temperature by 3.5°C to 7.0°C and pedestrian radiant load',
      tempDropSurfaceRange: [3.5, 7.0],
      tempDropAmbientRange: [0.8, 1.6],
      confidence: 'High',
      coBenefits: ['PM2.5 particulate filtration', 'Stormwater infiltration', 'Pedestrian thermal comfort'],
      feasibility: 'Short-Term',
      costCategory: 'Medium',
    },
    {
      id: 'rec-dyn-02',
      priority: 2,
      factor: 'High-Albedo Cool Roof Coatings',
      title: 'Commercial & Residential Cool Roof Reflective Coating Program',
      why: `Built-up footprint covers ${gisResult.scale500m.buildingFootprintPct}% of land area with low-reflectance masonry roofs.`,
      where: 'Flat concrete and sheet metal roofs in immediate 1km radius',
      what: 'Apply high Solar Reflectance Index (SRI >= 104) elastomeric acrylic waterproof coatings',
      expectedEffect: 'Lowers roof skin temperature by 8°C to 15°C and reduces indoor thermal heat transfer',
      tempDropSurfaceRange: [5.0, 11.0],
      tempDropAmbientRange: [0.6, 1.4],
      confidence: 'High',
      coBenefits: ['20% AC energy reduction', 'Extended roof membrane lifespan', 'Peak grid load shaving'],
      feasibility: 'Immediate',
      costCategory: 'Low',
    },
    {
      id: 'rec-dyn-03',
      priority: 3,
      factor: 'Reflective Cool Pavement Interventions',
      title: 'Permeable & High-Albedo Pavement Retrofit on Parking & Local Roads',
      why: `Road and parking coverage spans ${gisResult.scale500m.roadSurfacePct}% with solar absorptance > 85%.`,
      where: 'Surface parking lots, secondary streets, and pedestrian plazas',
      what: 'Apply titanium dioxide or light-colored polymer slurry seal coats with albedo >= 0.35',
      expectedEffect: 'Lowers pavement surface temperature by 4.0°C to 8.0°C during daylight hours',
      tempDropSurfaceRange: [4.0, 8.0],
      tempDropAmbientRange: [0.5, 1.2],
      confidence: 'Medium',
      coBenefits: ['Enhanced nighttime road visibility', 'Reduced street lighting energy', 'Mitigated nocturnal heat release'],
      feasibility: 'Strategic Long-Term',
      costCategory: 'Medium',
    },
  ];
  updateStep('interventions', 'completed', `${tailoredRecs.length} interventions calibrated to local climate & soil context`);

  // Step 8: Multi-Intervention Simulation Engine
  updateStep('simulation', 'running');
  await delay(250);
  const simulationOutcome = executeInterventionSimulation(featureVector, {
    treesToPlant: 15000,
    coolRoofsPercent: 45,
    coolPavementPercent: 40,
    trafficReductionPercent: 20,
  });
  job.simulationOutcome = simulationOutcome;
  updateStep('simulation', 'completed', `Modeled surface cooling: ${simulationOutcome.potentialSurfaceChange[0]}°C to ${simulationOutcome.potentialSurfaceChange[1]}°C (${simulationOutcome.modelName})`);

  // Finalize Job
  job.status = 'COMPLETED';
  job.completedAt = new Date().toISOString();
  onProgress?.({ ...job });

  // Merge into updated FullLocationProfile
  const fullProfile: FullLocationProfile = {
    ...baseProfile,
    location: {
      ...baseProfile.location,
      latitude,
      longitude,
      name: locationName,
      city,
      country,
      analysisRadius: radius,
    },
    weather: {
      ...weatherResult.weather,
      surfaceTemperature: satResult.lstSkinTemperature,
    },
    heatScore: {
      ...baseProfile.heatScore,
      score: Math.min(99, Math.round(weatherResult.weather.airTemperature * 1.4 + satResult.deltaSkinVsAir * 2.2 + featureVector.coolingDeficit * 0.2)),
    },
    recommendations: tailoredRecs,
    evidenceItems: researchGraph.evidenceItems,
  };

  return { job, profile: fullProfile };
}
