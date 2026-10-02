import mongoose, { Schema, Document } from 'mongoose';

export interface IInfrastructure extends Document {
  name: string;
  type: 'road' | 'building' | 'industrial' | 'data_center' | 'water' | 'park';
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: Record<string, any>;
  createdAt: Date;
}

const InfrastructureSchema = new Schema<IInfrastructure>({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['road', 'building', 'industrial', 'data_center', 'water', 'park'],
    required: true,
  },
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
  properties: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
});

// 2dsphere index for proximity queries: $near, $geoWithin
InfrastructureSchema.index({ location: '2dsphere' });

export const InfrastructureModel = mongoose.model<IInfrastructure>(
  'Infrastructure',
  InfrastructureSchema
);
