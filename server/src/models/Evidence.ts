import mongoose, { Schema, Document } from 'mongoose';

export interface IEvidence extends Document {
  claim: string;
  factor: string;
  sourceType: string;
  source: string;
  url?: string;
  observation: string;
  retrievedAt: Date;
  publishedAt?: string;
  confidence: number;
  measurement?: {
    value: number | string;
    unit: string;
  };
  locationName: string;
  createdAt: Date;
}

const EvidenceSchema = new Schema<IEvidence>({
  claim: { type: String, required: true },
  factor: { type: String, required: true },
  sourceType: {
    type: String,
    enum: [
      'LEVEL_1_OFFICIAL_GOV',
      'LEVEL_2_SCIENTIFIC_RESEARCH',
      'LEVEL_3_STRUCTURED_DATASETS',
      'LEVEL_4_COMMERCIAL_API',
      'LEVEL_5_REPUTABLE_REPORTING',
      'LEVEL_6_GENERAL_WEB',
    ],
    required: true,
  },
  source: { type: String, required: true },
  url: { type: String },
  observation: { type: String, required: true },
  retrievedAt: { type: Date, default: Date.now },
  publishedAt: { type: String },
  confidence: { type: Number, required: true, min: 0, max: 1 },
  measurement: {
    value: { type: Schema.Types.Mixed },
    unit: { type: String },
  },
  locationName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

EvidenceSchema.index({ locationName: 1 });
EvidenceSchema.index({ factor: 1 });

export const EvidenceModel = mongoose.model<IEvidence>('Evidence', EvidenceSchema);
