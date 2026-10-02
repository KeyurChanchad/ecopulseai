import { InterventionSimulationResult, EnvironmentalFeatureVector } from '../../types';

export interface SimulationParams {
  treesToPlant?: number;
  coolRoofsPercent?: number;
  coolPavementPercent?: number;
  trafficReductionPercent?: number;
}

/**
 * Multi-Intervention Simulation Engine (Sections 30–33)
 * Evaluates non-linear interaction effects between thermal mitigations.
 * STRICT PRINCIPLE: Decouples surface skin temperature reduction from 2m air temp reduction.
 * Never calculates linear sums (e.g. 3 + 2 + 2 = 7°C).
 */
export function executeInterventionSimulation(
  featureVector: EnvironmentalFeatureVector,
  params: SimulationParams
): InterventionSimulationResult {
  const currentSurfaceTemp = featureVector.surfaceTemperature;
  const currentAirTemp = featureVector.airTemperature;

  const trees = params.treesToPlant ?? 0;
  const coolRoofs = params.coolRoofsPercent ?? 0;
  const coolPavement = params.coolPavementPercent ?? 0;
  const trafficRed = params.trafficReductionPercent ?? 0;

  const activeInterventions: string[] = [];
  if (trees > 0) activeInterventions.push(`Urban Tree Canopy (+${(trees / 1000).toFixed(0)}k trees)`);
  if (coolRoofs > 0) activeInterventions.push(`Cool Roof High-Albedo Retrofit (${coolRoofs}%)`);
  if (coolPavement > 0) activeInterventions.push(`Cool Reflective Pavement (${coolPavement}%)`);
  if (trafficRed > 0) activeInterventions.push(`Traffic Congestion Mitigation (-${trafficRed}%)`);

  if (activeInterventions.length === 0) {
    activeInterventions.push('Baseline (No Active Interventions)');
  }

  // Component potential surface cooling (raw)
  const rawTreeSurface = (trees / 30000) * 3.8;
  const rawRoofSurface = (coolRoofs / 100) * 4.2;
  const rawPaveSurface = (coolPavement / 100) * 3.6;
  const rawTraffSurface = (trafficRed / 100) * 0.8;

  // Component potential air cooling (raw)
  const rawTreeAir = (trees / 30000) * 1.4;
  const rawRoofAir = (coolRoofs / 100) * 0.8;
  const rawPaveAir = (coolPavement / 100) * 0.7;
  const rawTraffAir = (trafficRed / 100) * 0.4;

  // Non-linear interaction dampening: diminishing thermal returns
  const totalRawSurface = rawTreeSurface + rawRoofSurface + rawPaveSurface + rawTraffSurface;
  const totalRawAir = rawTreeAir + rawRoofAir + rawPaveAir + rawTraffAir;

  // Diminishing returns scaling: S_eff = S_max * (1 - e^(-total / S_max))
  const maxSurfaceDrop = 7.5;
  const effectiveSurfaceDrop = maxSurfaceDrop * (1 - Math.exp(-totalRawSurface / maxSurfaceDrop));

  const maxAirDrop = 2.8;
  const effectiveAirDrop = maxAirDrop * (1 - Math.exp(-totalRawAir / maxAirDrop));

  // Modeled ranges with realistic environmental uncertainty
  const surfMin = Math.round((currentSurfaceTemp - effectiveSurfaceDrop * 1.15) * 10) / 10;
  const surfMax = Math.round((currentSurfaceTemp - effectiveSurfaceDrop * 0.85) * 10) / 10;
  const surfDropMin = Math.round(effectiveSurfaceDrop * 0.85 * 10) / 10;
  const surfDropMax = Math.round(effectiveSurfaceDrop * 1.15 * 10) / 10;

  const airMin = Math.round((currentAirTemp - effectiveAirDrop * 1.2) * 10) / 10;
  const airMax = Math.round((currentAirTemp - effectiveAirDrop * 0.8) * 10) / 10;
  const airDropMin = Math.round(effectiveAirDrop * 0.8 * 10) / 10;
  const airDropMax = Math.round(effectiveAirDrop * 1.2 * 10) / 10;

  let interactionNotes = 'Single intervention profile active.';
  if (activeInterventions.length > 1) {
    const rawTotal = Math.round(totalRawSurface * 10) / 10;
    const modeledTotal = Math.round(effectiveSurfaceDrop * 10) / 10;
    interactionNotes = `Non-linear boundary layer coupling applied: raw independent sum was ${rawTotal}°C, dampened to ${modeledTotal}°C to account for diminishing radiative returns and advective boundary mixing.`;
  }

  return {
    scenarioName: activeInterventions.join(' + '),
    selectedInterventions: activeInterventions,
    currentSurfaceTemp,
    modeledSurfaceTempRange: [surfMin, surfMax],
    potentialSurfaceChange: [-surfDropMax, -surfDropMin],
    currentAirTemp,
    modeledAirTempRange: [airMin, airMax],
    potentialAirChange: [-airDropMax, -airDropMin],
    confidence: activeInterventions.length > 2 ? 'Medium' : 'High',
    modelName: 'EcoPulse Coupled Surface-Atmosphere Heat Interaction Model v2.4',
    assumptions: [
      'Adequate tree irrigation & minimum 80% sapling survival',
      'Reflective roofing albedo maintained at >= 0.65 via annual maintenance',
      'Cool pavement coating durability over 3-year commercial vehicle wear cycle',
      'Atmospheric regional advection baseline remains consistent',
    ],
    interactionNotes,
  };
}
