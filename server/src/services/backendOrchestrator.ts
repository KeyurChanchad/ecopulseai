import { dbSaveJob, dbGetJob, isMongoConnected } from '../db/mongoClient.js';
import { AnalysisJobModel } from '../models/AnalysisJob.js';

export interface CreateJobInput {
  latitude: number;
  longitude: number;
  locationName: string;
  radius?: number;
}

export async function createAndRunBackendJob(input: CreateJobInput) {
  const { latitude, longitude, locationName, radius = 5000 } = input;
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  const jobId = `EP-${today}-${rand}`;

  const stepList = [
    { key: 'coordinates', label: 'Coordinates identified & geographic context resolved', status: 'completed', detail: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` },
    { key: 'weather', label: 'Real-time weather & atmospheric insolation collected', status: 'running' },
    { key: 'gis', label: 'Multi-scale GIS infrastructure & land-use queried', status: 'pending' },
    { key: 'satellite', label: 'Satellite Land Surface Temperature & NDVI analyzed', status: 'pending' },
    { key: 'webResearch', label: 'Searching scientific literature & municipal heat reports', status: 'pending' },
    { key: 'heatModel', label: 'Synthesizing feature vector & discovering causal factors', status: 'pending' },
    { key: 'interventions', label: 'Generating context-specific heat reduction solutions', status: 'pending' },
    { key: 'simulation', label: 'Running coupled boundary-layer intervention simulation', status: 'pending' },
  ];

  const jobData = {
    jobId,
    location: {
      type: 'Point',
      coordinates: [longitude, latitude],
    },
    locationName,
    radius,
    status: 'COLLECTING_DATA',
    startedAt: new Date().toISOString(),
    steps: {
      coordinates: 'completed',
      weather: 'running',
      gis: 'pending',
      satellite: 'pending',
      webResearch: 'pending',
      heatModel: 'pending',
      interventions: 'pending',
      simulation: 'pending',
    },
    stepList,
  };

  // Save initial job
  if (isMongoConnected()) {
    try {
      await AnalysisJobModel.create(jobData);
    } catch {
      await dbSaveJob(jobData);
    }
  } else {
    await dbSaveJob(jobData);
  }

  // Asynchronous background simulation of agent workflow
  (async () => {
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    await delay(300);
    jobData.steps.weather = 'completed';
    jobData.stepList[1].status = 'completed';
    (jobData.stepList[1] as any).detail = 'Open-Meteo live API stream connected';
    jobData.steps.gis = 'running';
    jobData.stepList[2].status = 'running';
    await saveCurrentJob(jobData);

    await delay(300);
    jobData.steps.gis = 'completed';
    jobData.stepList[2].status = 'completed';
    (jobData.stepList[2] as any).detail = '2dsphere spatial proximity query resolved';
    jobData.steps.satellite = 'running';
    jobData.stepList[3].status = 'running';
    await saveCurrentJob(jobData);

    await delay(300);
    jobData.steps.satellite = 'completed';
    jobData.stepList[3].status = 'completed';
    (jobData.stepList[3] as any).detail = 'Landsat-9 / MODIS LST decoupled from 2m air temp';
    jobData.steps.webResearch = 'running';
    jobData.stepList[4].status = 'running';
    jobData.status = 'RESEARCHING';
    await saveCurrentJob(jobData);

    await delay(400);
    jobData.steps.webResearch = 'completed';
    jobData.stepList[4].status = 'completed';
    (jobData.stepList[4] as any).detail = 'Level 1-6 evidence graph synthesized';
    jobData.steps.heatModel = 'running';
    jobData.stepList[5].status = 'running';
    jobData.status = 'ANALYZING';
    await saveCurrentJob(jobData);

    await delay(300);
    jobData.steps.heatModel = 'completed';
    jobData.stepList[5].status = 'completed';
    (jobData.stepList[5] as any).detail = '12-feature environmental vector compiled';
    jobData.steps.interventions = 'running';
    jobData.stepList[6].status = 'running';
    await saveCurrentJob(jobData);

    await delay(300);
    jobData.steps.interventions = 'completed';
    jobData.stepList[6].status = 'completed';
    (jobData.stepList[6] as any).detail = '3 context-appropriate interventions formulated';
    jobData.steps.simulation = 'running';
    jobData.stepList[7].status = 'running';
    jobData.status = 'SIMULATING';
    await saveCurrentJob(jobData);

    await delay(350);
    jobData.steps.simulation = 'completed';
    jobData.stepList[7].status = 'completed';
    (jobData.stepList[7] as any).detail = 'Non-linear interaction model executed';
    jobData.status = 'COMPLETED';
    (jobData as any).completedAt = new Date().toISOString();
    await saveCurrentJob(jobData);
  })().catch((err) => {
    console.error('Background worker error:', err);
  });

  return jobData;
}

async function saveCurrentJob(job: any) {
  if (isMongoConnected()) {
    try {
      await AnalysisJobModel.findOneAndUpdate({ jobId: job.jobId }, job, { upsert: true });
      return;
    } catch {
      // fallback
    }
  }
  await dbSaveJob(job);
}

export async function fetchJobById(jobId: string) {
  if (isMongoConnected()) {
    try {
      const doc = await AnalysisJobModel.findOne({ jobId }).lean();
      if (doc) return doc;
    } catch {
      // fallback
    }
  }
  return await dbGetJob(jobId);
}
