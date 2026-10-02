import { Router, Request, Response } from 'express';
import { dbQueryNearbyInfrastructure, isMongoConnected } from '../db/mongoClient.js';
import { InfrastructureModel } from '../models/Infrastructure.js';

export const geoRouter = Router();

// GET /api/geo/near?lng=72.5714&lat=23.0225&radiusKm=5
// Section 10: 2dsphere proximity query
geoRouter.get('/near', async (req: Request, res: Response): Promise<void> => {
  try {
    const lng = parseFloat(req.query.lng as string);
    const lat = parseFloat(req.query.lat as string);
    const radiusKm = parseFloat((req.query.radiusKm as string) || '5');

    if (isNaN(lng) || isNaN(lat)) {
      res.status(400).json({ error: 'Valid lng and lat query parameters are required.' });
      return;
    }

    if (isMongoConnected()) {
      try {
        const radiusMeters = radiusKm * 1000;
        const features = await InfrastructureModel.find({
          location: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [lng, lat],
              },
              $maxDistance: radiusMeters,
            },
          },
        }).lean();

        res.json({
          source: 'MongoDB 2dsphere $near query',
          center: [lng, lat],
          radiusKm,
          count: features.length,
          features,
        });
        return;
      } catch (e) {
        // fallback to memory
      }
    }

    const fallbackFeatures = await dbQueryNearbyInfrastructure(lng, lat, radiusKm);
    res.json({
      source: 'Embedded Geospatial Engine (Haversine 2dsphere proximity)',
      center: [lng, lat],
      radiusKm,
      count: fallbackFeatures.length,
      features: fallbackFeatures,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
