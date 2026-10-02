# EcoPulseAI Node.js + TypeScript Backend Service

Dynamic Environmental Intelligence & Heat Analysis Backend API.

## Features
- **Job Orchestrator API**: Asynchronous pipeline management (`EP-YYYYMMDD-XXXXX`).
- **MongoDB 2dsphere Architecture**: GeoJSON `Point` and `$near` proximity spatial queries across infrastructure layers.
- **Resilient Zero-Config Fallback**: If MongoDB is not installed or running, the server automatically boots with an **Embedded In-Memory Geospatial Engine** using the Haversine formula, ensuring 100% operational uptime out of the box.

## Directory Structure
```text
server/
├── package.json
├── tsconfig.json
├── .env.example
├── src/
│   ├── db/
│   │   └── mongoClient.ts          # MongoDB connection & in-memory fallback
│   ├── models/
│   │   ├── Location.ts             # 2dsphere indexed locations
│   │   ├── Infrastructure.ts       # 2dsphere indexed roads/buildings/industrial
│   │   ├── AnalysisJob.ts          # Job status, step tracking, feature vector
│   │   └── Evidence.ts             # Level 1-6 source hierarchy evidence records
│   ├── routes/
│   │   ├── jobs.ts                 # /api/jobs/create and /api/jobs/:id
│   │   └── geo.ts                  # /api/geo/near ($near 2dsphere queries)
│   ├── services/
│   │   └── backendOrchestrator.ts  # Background job execution engine
│   └── server.ts                   # Express server entry point
```

## Running the Server

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configuration variables:
- `PORT`: Server port (default: `5001`)
- `MONGODB_URI`: MongoDB connection string (e.g. `mongodb://localhost:27017/ecopulseai` or MongoDB Atlas URI)
- `USE_IN_MEMORY_DB`: (Optional) Set to `true` to force in-memory geospatial mode.

### 3. Start Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
`GET http://localhost:5001/health`
Returns connection state and storage mode (MongoDB vs Embedded In-Memory).

### Create Location Analysis Job
`POST http://localhost:5001/api/jobs/create`
Request body:
```json
{
  "latitude": 23.0225,
  "longitude": 72.5714,
  "locationName": "Ahmedabad",
  "radius": 5000
}
```

### Get Analysis Job Status
`GET http://localhost:5001/api/jobs/:jobId`

### Query Nearby Geographic Infrastructure (2dsphere $near)
`GET http://localhost:5001/api/geo/near?lng=72.5714&lat=23.0225&radiusKm=5`
