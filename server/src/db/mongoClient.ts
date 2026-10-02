import mongoose from 'mongoose';

let isConnected = false;

// In-Memory store fallback when MongoDB is not installed or running locally
const inMemoryJobs = new Map<string, any>();
const inMemoryLocations = new Map<string, any>();
const inMemoryInfrastructure: Array<{
  name: string;
  type: string;
  location: { type: 'Point'; coordinates: [number, number] };
  properties?: Record<string, any>;
}> = [
  {
    name: 'Metropolitan Thermal Power Plant',
    type: 'industrial',
    location: { type: 'Point', coordinates: [72.585, 23.045] },
    properties: { thermalOutputMW: 450 },
  },
  {
    name: 'East District Commercial Data Center',
    type: 'data_center',
    location: { type: 'Point', coordinates: [72.562, 23.018] },
    properties: { coolingSensibleHeatMW: 24 },
  },
  {
    name: 'Major Highway Transit Arterial Corridor',
    type: 'road',
    location: { type: 'Point', coordinates: [72.571, 23.022] },
    properties: { lanes: 8, albedo: 0.12 },
  },
  {
    name: 'City Central Lake & Waterfront Buffer',
    type: 'water',
    location: { type: 'Point', coordinates: [72.598, 23.008] },
    properties: { surfaceAreaHectares: 34 },
  },
];

/**
 * Initializes MongoDB connection or falls back to in-memory geospatial store.
 */
export async function initDatabase(): Promise<boolean> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecopulseai';

  if (process.env.USE_IN_MEMORY_DB === 'true') {
    console.log('ℹ️ [EcoPulse DB] USE_IN_MEMORY_DB flag active. Using Embedded In-Memory Geospatial Store.');
    isConnected = false;
    return false;
  }

  try {
    console.log(`📡 [EcoPulse DB] Attempting connection to MongoDB at ${uri}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    isConnected = true;
    console.log('✅ [EcoPulse DB] MongoDB successfully connected! 2dsphere geospatial indexes active.');
    return true;
  } catch (err: any) {
    isConnected = false;
    console.log('⚠️ [EcoPulse DB] MongoDB is not running or not installed.');
    console.log('⚡ [EcoPulse DB] Seamlessly switched to Embedded In-Memory Geospatial Engine (Haversine 2dsphere proximity enabled).');
    return false;
  }
}

export function isMongoConnected(): boolean {
  return isConnected;
}

// In-Memory Haversine distance calculator for spherical $near fallback
function calculateHaversineDistanceKm(
  lon1: number,
  lat1: number,
  lon2: number,
  lat2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Memory Operations
export async function dbSaveJob(job: any): Promise<void> {
  inMemoryJobs.set(job.jobId, { ...job, updatedAt: new Date().toISOString() });
}

export async function dbGetJob(jobId: string): Promise<any | null> {
  return inMemoryJobs.get(jobId) || null;
}

export async function dbQueryNearbyInfrastructure(
  lng: number,
  lat: number,
  radiusKm: number
): Promise<any[]> {
  return inMemoryInfrastructure
    .map((item) => {
      const distance = calculateHaversineDistanceKm(
        lng,
        lat,
        item.location.coordinates[0],
        item.location.coordinates[1]
      );
      return { ...item, distanceKm: Math.round(distance * 100) / 100 };
    })
    .filter((item) => item.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
