import mongoose, { Schema, Document } from 'mongoose';

export interface IBusiness extends Document {
  userId: string;
  companyName: string;
  industry: string;
  foundedYear: number;
  employees: string;
  stage: 'startup' | 'growth' | 'mature';
  monthlyRevenue: number;
  monthlyExpenses: number;
  revenueGrowth: number;
  topRevenueSource: string;
  cashRunway: number;
  targetCustomer: 'B2B' | 'B2C' | 'Both';
  avgDealSize: number;
  monthlyLeads: number;
  conversionRate: number;
  churnRate: number;
  topSalesChannel: string;
  marketingBudget: number;
  activeChannels: string[];
  cac: number;
  campaignRunning: boolean;
  goals: string[];
  biggestChallenge: string;
  topCompetitors: string[];
  workingWell: string;
  notWorking: string;
  growthDNA: {
    innovation: number;
    marketing: number;
    sales: number;
    finance: number;
    operations: number;
    label: string;
    narrative: string;
  };
  analysis?: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
    keyInsight: string;
    immediatePriority: string;
  };
  morningBrief?: any;
  morningBriefUpdatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BusinessSchema = new Schema<IBusiness>(
  {
    userId: { type: String, required: true },
    companyName: { type: String, required: true },
    industry: { type: String, required: true },
    foundedYear: { type: Number },
    employees: { type: String },
    stage: { type: String, enum: ['startup', 'growth', 'mature'] },
    monthlyRevenue: { type: Number, default: 0 },
    monthlyExpenses: { type: Number, default: 0 },
    revenueGrowth: { type: Number, default: 0 },
    topRevenueSource: { type: String },
    cashRunway: { type: Number, default: 0 },
    targetCustomer: { type: String, enum: ['B2B', 'B2C', 'Both'] },
    avgDealSize: { type: Number, default: 0 },
    monthlyLeads: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    churnRate: { type: Number, default: 0 },
    topSalesChannel: { type: String },
    marketingBudget: { type: Number, default: 0 },
    activeChannels: [{ type: String }],
    cac: { type: Number, default: 0 },
    campaignRunning: { type: Boolean, default: false },
    goals: [{ type: String }],
    biggestChallenge: { type: String },
    topCompetitors: [{ type: String }],
    workingWell: { type: String },
    notWorking: { type: String },
    growthDNA: {
      innovation: { type: Number, default: 0 },
      marketing: { type: Number, default: 0 },
      sales: { type: Number, default: 0 },
      finance: { type: Number, default: 0 },
      operations: { type: Number, default: 0 },
      label: { type: String, default: '' },
      narrative: { type: String, default: '' },
    },
    analysis: {
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      opportunities: [{ type: String }],
      threats: [{ type: String }],
      keyInsight: { type: String },
      immediatePriority: { type: String }
    },
    morningBrief: { type: Schema.Types.Mixed },
    morningBriefUpdatedAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model<IBusiness>('Business', BusinessSchema);
