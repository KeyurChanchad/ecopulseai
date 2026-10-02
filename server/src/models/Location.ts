import mongoose, { Schema, Document } from 'mongoose';

export interface ILocation extends Document {
  name: string;
  city: string;
  country: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  climateZone: string;
  elevationMeters: number;
  createdAt: Date;
}

const LocationSchema = new Schema<ILocation>({
  name: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  climateZone: { type: String, default: 'Subtropical Semi-Arid' },
  elevationMeters: { type: Number, default: 55 },
  createdAt: { type: Date, default: Date.now },
});

// Section 10: 2dsphere index for spherical geospatial queries
LocationSchema.index({ location: '2dsphere' });

export const LocationModel = mongoose.model<ILocation>('Location', LocationSchema);
