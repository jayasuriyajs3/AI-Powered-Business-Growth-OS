import mongoose, { Schema, Document } from 'mongoose';

export interface IKpi extends Document {
  businessId: string;
  month: string;
  revenue: number;
  profit: number;
  leads: number;
  conversion: number;
  marketingROI: number;
  cac: number;
  retention: number;
  nps: number;
  growthRate: number;
  anomalyScore: number;
  anomalyDetected: boolean;
  recordedAt: Date;
}

const KpiSchema = new Schema<IKpi>({
  businessId: { type: String, required: true },
  month: { type: String, required: true },
  revenue: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
  leads: { type: Number, default: 0 },
  conversion: { type: Number, default: 0 },
  marketingROI: { type: Number, default: 0 },
  cac: { type: Number, default: 0 },
  retention: { type: Number, default: 0 },
  nps: { type: Number, default: 0 },
  growthRate: { type: Number, default: 0 },
  anomalyScore: { type: Number, default: 0 },
  anomalyDetected: { type: Boolean, default: false },
  recordedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IKpi>('Kpi', KpiSchema);
