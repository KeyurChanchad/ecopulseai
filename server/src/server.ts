import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase, isMongoConnected } from './db/mongoClient.js';
import { jobsRouter } from './routes/jobs.js';
import { geoRouter } from './routes/geo.js';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '5001', 10);

app.use(cors());
app.use(express.json());

// Service Health & Architecture Telemetry (Section 36 & 37)
const healthHandler = (_req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    service: 'EcoPulseAI Environmental Intelligence Backend Engine',
    version: '2.0.0',
    mongoConnected: isMongoConnected(),
    storageMode: isMongoConnected() ? 'MongoDB 2dsphere Cluster' : 'Embedded In-Memory Geospatial Store (Zero-Config Fallback)',
    aiEngine: process.env.GEMINI_API_KEY ? 'Google Gemini 2.5 Flash' : 'Thermodynamic Surface Energy Balance Model (Zero-Key Mode)',
    timestamp: new Date().toISOString(),
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Mount API routes
app.use('/api/jobs', jobsRouter);
app.use('/api/geo', geoRouter);

async function startServer() {
  await initDatabase();

  app.listen(port, () => {
    console.log(`\n======================================================`);
    console.log(`🌍 EcoPulseAI Backend Service running on port ${port}`);
    console.log(`   Health Check: http://localhost:${port}/health`);
    console.log(`   Job Creation: POST http://localhost:${port}/api/jobs/create`);
    console.log(`   GIS 2dsphere: GET  http://localhost:${port}/api/geo/near?lng=72.57&lat=23.02`);
    console.log(`======================================================\n`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
