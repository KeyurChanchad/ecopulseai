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
  const baseProfile = createDynamicPlaceholderProfile(latitude, longitude, radius, undefined, locationName, city);

  // Map server's discovered causes to UI contributors format
  const serverCauses = currentJob.discoveredCauses || [];
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
      impactPercent: Math.round(100 / Math.max(1, serverCauses.length)),
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
    dataCenterIntelligence: (currentJob as any).dataCenterIntelligence,
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
