import {
  AnalysisJob,
  JobStatus,
  JobStepKey,
  JobStepProgress,
  AnalysisRadius,
  Recommendation,
  HeatContributor,
} from '../../types';
import { createDynamicPlaceholderProfile, FullLocationProfile } from '../locationService';
import { getHubDataCenterIntelligence } from '../dataCenterHubs';

export interface OrchestratorRunOptions {
  latitude: number;
  longitude: number;
  locationName: string;
  city: string;
  country: string;
  radius: AnalysisRadius;
  onProgress?: (job: AnalysisJob) => void;
}

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
 * Computes dynamic, non-static, proportional heat share percentages (%)
 * derived from quantified temperature surcharge (°C) and thermal energy flux (MW).
 * Ensures fair apportionment summing to exactly 100%.
 */
function computeDynamicHeatShares(causes: any[]): number[] {
  if (!causes || causes.length === 0) return [];
  if (causes.length === 1) return [100];

  const rawWeights = causes.map((c) => {
    // 1. If backend already computed a valid non-equal impactPercent, respect it
    if (typeof c.impactPercent === 'number' && c.impactPercent > 0 && c.impactPercent !== Math.round(100 / causes.length)) {
      return c.impactPercent;
    }

    // 2. Extract numeric thermal impact from quantifiedContribution (e.g. "+3.9°C", "+2.9°C")
    if (typeof c.quantifiedContribution === 'string') {
      const match = c.quantifiedContribution.match(/([0-9]+(?:\.[0-9]+)?)\s*°C/i);
      if (match) {
        const val = parseFloat(match[1]);
        if (!isNaN(val) && val > 0) return val;
      }
    }

    // 3. Fallback to energyImpactMW if present
    const mw = c.geometricContribution?.energyImpactMW;
    if (typeof mw === 'number' && !isNaN(mw) && mw > 0) {
      return Math.sqrt(mw);
    }

    // 4. Default proportional weight based on calibrated confidence
    return Math.max(1, (c.confidence || 80) / 25);
  });

  const total = rawWeights.reduce((sum, w) => sum + w, 0);
  if (total <= 0) return causes.map(() => Math.round(100 / causes.length));

  // Largest remainder apportionment to guarantee integers summing to exactly 100%
  const unrounded = rawWeights.map((w) => (w / total) * 100);
  const floors = unrounded.map((u) => Math.max(1, Math.floor(u)));
  let currentSum = floors.reduce((a, b) => a + b, 0);
  const remainders = unrounded.map((u, i) => ({ i, rem: u - floors[i] }));
  remainders.sort((a, b) => b.rem - a.rem);

  let idx = 0;
  while (currentSum < 100 && idx < remainders.length) {
    floors[remainders[idx].i] += 1;
    currentSum += 1;
    idx++;
  }
  idx = remainders.length - 1;
  while (currentSum > 100 && idx >= 0) {
    if (floors[remainders[idx].i] > 1) {
      floors[remainders[idx].i] -= 1;
      currentSum -= 1;
    }
    idx--;
  }

  return floors;
}

/**
 * End-to-End Frontend-Backend Flow Orchestrator
 * Communicates directly with the Node.js Express Backend Service on port 5001.
 * Strict Offline & Disconnection Guards:
 * - If offline: immediately throws an error alerting the user.
 * - If backend unreachable: informs the user to run `npm run dev`.
 */
export async function runLocationAnalysisOrchestrator(
  options: OrchestratorRunOptions
): Promise<{ job: AnalysisJob; profile: FullLocationProfile }> {
  const { latitude, longitude, locationName, city, country, radius, onProgress } = options;
  const radiusMeters = radiusToMeters(radius);

  // 1. Strict Offline Guard
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error(
      'OFFLINE_ERROR: No internet connection detected. EcoPulseAI requires active internet to stream satellite observations and atmospheric weather feeds.'
    );
  }

  // 2. Dispatch Job Creation to Node.js Backend Service (POST /api/jobs/create)
  let initialJobResponse: any;
  try {
    const response = await fetch('/api/jobs/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude,
        longitude,
        locationName,
        radius: radiusMeters,
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `Backend responded with HTTP ${response.status}`);
    }

    initialJobResponse = await response.json();
  } catch (err: any) {
    console.error('Backend connection error:', err);
    throw new Error(
      `BACKEND_OFFLINE_ERROR: Could not connect to EcoPulseAI Node.js Backend Service (port 5001). Please ensure you have run "npm run dev" in your terminal. Details: ${err.message}`
    );
  }

  let currentJob: AnalysisJob = initialJobResponse.job;
  onProgress?.(currentJob);

  // 3. Poll Backend Service for Progress and Result (GET /api/jobs/:id)
  const maxAttempts = 40;
  let attempts = 0;
  const pollIntervalMs = 280;

  while (currentJob.status !== 'COMPLETED' && currentJob.status !== 'FAILED' && attempts < maxAttempts) {
    attempts++;
    await new Promise((res) => setTimeout(res, pollIntervalMs));

    try {
      const pollResp = await fetch(`/api/jobs/${currentJob.jobId}`);
      if (pollResp.ok) {
        const pollData = await pollResp.json();
        currentJob = pollData.job;
        onProgress?.({ ...currentJob });
      }
    } catch (pollErr) {
      console.warn('Job polling retry notice:', pollErr);
    }
  }

  if (currentJob.status === 'FAILED') {
    throw new Error(
      `ANALYSIS_FAILED: The Node.js AI Engine encountered an error during analysis: ${(currentJob as any).error || 'Unknown error'}`
    );
  }

  // 4. Construct Location Profile from Real Backend Telemetry & AI Model Results
  const baseProfile = createDynamicPlaceholderProfile(latitude, longitude, radius, undefined, locationName, city, currentJob.weather);

  // Map server's discovered causes to UI contributors format
  const serverCauses = currentJob.discoveredCauses || [];

  // Data center intelligence is hub-driven: the backend job result wins only when
  // it actually detected a facility, otherwise the hub registry supplies the report.
  const hubDataCenterIntelligence = getHubDataCenterIntelligence({
    locationName,
    city,
    country,
    latitude,
    longitude,
  });
  const jobDataCenterIntelligence = (currentJob as any).dataCenterIntelligence;
  const resolvedDataCenterIntelligence = hubDataCenterIntelligence
    ? hubDataCenterIntelligence
    : jobDataCenterIntelligence?.detected
      ? jobDataCenterIntelligence
      : undefined;
  const dynamicHeatShares = computeDynamicHeatShares(serverCauses);

  const mappedContributors: HeatContributor[] = serverCauses.map((cause: any, idx: number) => {
    let cat: HeatContributor['category'] = 'built_environment';
    if (['EMISSIONS', 'TRAFFIC', 'INDUSTRY', 'AC_EXHAUST', 'ENERGY_USE'].includes(cause.category)) {
      cat = 'anthropogenic';
    } else if (['CLIMATE', 'WEATHER', 'SOLAR', 'HUMIDITY', 'WIND', 'HEAT_WAVE', 'TOPOGRAPHY', 'REGIONAL_CLIMATE'].includes(cause.category)) {
      cat = 'natural_climate';
    } else if (['CANOPY', 'WATER_BODIES'].includes(cause.category)) {
      cat = 'cooling_sink';
    }

    const confLevel = cause.confidenceLevel || (cause.confidence > 85 ? 'High' : cause.confidence > 75 ? 'Medium' : 'Low');

    return {
      id: cause.id || `cause-${idx}`,
      factor: cause.name,
      label: cause.name,
      category: cat,
      categoryEmoji: cause.categoryEmoji || '🌡️',
      possibleReason: cause.possibleReason,
      whatChecked: cause.whatChecked,
      evidenceType: cause.evidenceType || 'LIVE',
      geometricContribution: cause.geometricContribution,
      engineeringConstraints: cause.engineeringConstraints,
      pairedSolution: cause.pairedSolution,
      impact: (cause.confidence > 90 ? 'Very High' : cause.confidence > 80 ? 'High' : 'Medium') as any,
      impactPercent: dynamicHeatShares[idx] ?? Math.round(100 / Math.max(1, serverCauses.length)),
      isMeasured: cause.evidenceType === 'LIVE' || cause.evidenceType === 'Satellite' || cause.evidenceType === 'GIS',
      confidence: cause.confidence || 85,
      confidenceLevel: confLevel as any,
      freshness: cause.evidenceType === 'LIVE' || cause.evidenceType === 'Satellite + LIVE' ? 'LIVE' : 'RECENT',
      sourceType: 'AI INFERENCE',
      dataSource: (currentJob as any).aiDiagnosis?.modelUsed || 'Node.js AI Heat Reasoning Engine',
      measurementValue: cause.quantifiedContribution || `${cause.confidence}% calibrated impact`,
      timestampDescription: `${cause.evidenceType || 'Telemetric'} Observation`,
      evidence: cause.evidenceSummary,
      mitigationOpportunity: cause.pairedSolution?.title
        ? `Paired Solution: ${cause.pairedSolution.title}`
        : `Targeted intervention recommended in mitigation portfolio`,
    };
  });

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
    geometricMetrics: (currentJob as any).geometricMetrics,
    structuredRecommendations: (currentJob as any).structuredRecommendations,
    industryIntelligence: (currentJob as any).industryIntelligence,
    dataCenterIntelligence: resolvedDataCenterIntelligence,
    weather: {
      ...baseProfile.weather,
      airTemperature: currentJob.weather?.airTemperature ?? currentJob.featureVector?.airTemperature ?? baseProfile.weather.airTemperature,
      feelsLike: currentJob.weather?.feelsLike ?? baseProfile.weather.feelsLike,
      surfaceTemperature: currentJob.weather?.surfaceTemperature ?? currentJob.featureVector?.surfaceTemperature ?? baseProfile.weather.surfaceTemperature,
      solarRadiation: currentJob.weather?.solarRadiation ?? currentJob.featureVector?.solarRadiation ?? baseProfile.weather.solarRadiation,
      humidity: currentJob.weather?.humidity ?? baseProfile.weather.humidity,
      windSpeed: currentJob.weather?.windSpeed ?? baseProfile.weather.windSpeed,
      windDirection: currentJob.weather?.windDirection ?? baseProfile.weather.windDirection,
      uvIndex: currentJob.weather?.uvIndex ?? baseProfile.weather.uvIndex,
      cloudCover: currentJob.weather?.cloudCover ?? baseProfile.weather.cloudCover,
      uhiDelta: currentJob.featureVector?.uhiDelta ?? baseProfile.weather.uhiDelta,
    },
    heatScore: {
      ...baseProfile.heatScore,
      score: Math.min(
        99,
        Math.max(
          15,
          Math.round(
            (currentJob.featureVector?.airTemperature ?? 30) * 1.3 +
              ((currentJob.featureVector?.surfaceTemperature ?? 35) -
                (currentJob.featureVector?.airTemperature ?? 30)) *
                2.5
          )
        )
      ),
    },
    contributors: mappedContributors.length > 0 ? mappedContributors : baseProfile.contributors,
    recommendations: (currentJob as any).recommendations || baseProfile.recommendations,
  };

  return { job: currentJob, profile: fullProfile };
}
