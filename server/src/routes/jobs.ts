import { Router, Request, Response } from 'express';
import { createAndRunBackendJob, fetchJobById } from '../services/backendOrchestrator.js';

export const jobsRouter = Router();

// POST /api/jobs/create
jobsRouter.post('/create', async (req: Request, res: Response): Promise<void> => {
  try {
    const { latitude, longitude, locationName, radius } = req.body;
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      res.status(400).json({ error: 'Valid latitude and longitude numbers are required.' });
      return;
    }

    const job = await createAndRunBackendJob({
      latitude,
      longitude,
      locationName: locationName || `Location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`,
      radius: radius || 5000,
    });

    res.status(201).json({ success: true, job });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// GET /api/jobs/:id
jobsRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const jobId = req.params.id;
    const job = await fetchJobById(jobId);
    if (!job) {
      res.status(404).json({ error: `Analysis job ${jobId} not found` });
      return;
    }
    res.json({ success: true, job });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
