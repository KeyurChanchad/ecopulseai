import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalysisJob extends Document {
  jobId: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  locationName: string;
  radius: number;
  status: 'QUEUED' | 'COLLECTING_DATA' | 'RESEARCHING' | 'ANALYZING' | 'SIMULATING' | 'COMPLETED' | 'FAILED';
  startedAt: Date;
  completedAt?: Date;
  steps: Record<string, string>;
  stepList: Array<{
    key: string;
    label: string;
    status: string;
    detail?: string;
    timestamp?: string;
  }>;
  featureVector?: Record<string, any>;
  discoveredCauses?: Array<Record<string, any>>;
  simulationOutcome?: Record<string, any>;
  error?: string;
}

const AnalysisJobSchema = new Schema<IAnalysisJob>({
  jobId: { type: String, required: true, unique: true },
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
  locationName: { type: String, required: true },
  radius: { type: Number, default: 5000 },
  status: {
    type: String,
    enum: ['QUEUED', 'COLLECTING_DATA', 'RESEARCHING', 'ANALYZING', 'SIMULATING', 'COMPLETED', 'FAILED'],
    default: 'QUEUED',
  },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  steps: { type: Schema.Types.Mixed, default: {} },
  stepList: { type: [Schema.Types.Mixed] as any, default: [] },
  featureVector: { type: Schema.Types.Mixed },
  discoveredCauses: { type: [Schema.Types.Mixed] as any, default: [] },
  simulationOutcome: { type: Schema.Types.Mixed },
  error: { type: String },
}, { strict: false });

AnalysisJobSchema.index({ jobId: 1 });
AnalysisJobSchema.index({ location: '2dsphere' });

export const AnalysisJobModel = mongoose.model<IAnalysisJob>(
  'AnalysisJob',
  AnalysisJobSchema
);
