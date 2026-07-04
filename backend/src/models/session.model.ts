import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  businessId: string;
  sessionType: 'regular' | 'crisis' | 'whatif';
  trigger: 'manual' | 'anomaly' | 'scheduled';
  topic: string;
  messages: {
    agent: string;
    emoji: string;
    role: string;
    message: string;
    timestamp: Date;
  }[];
  votes: {
    agent: string;
    vote: 'YES' | 'NO';
    confidence: number;
    reason: string;
  }[];
  finalDecision: string;
  strategyGenerated: boolean;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    businessId: { type: String, required: true },
    sessionType: { type: String, enum: ['regular', 'crisis', 'whatif'], default: 'regular' },
    trigger: { type: String, enum: ['manual', 'anomaly', 'scheduled'], default: 'manual' },
    topic: { type: String, default: 'Business Strategy Review' },
    messages: [
      {
        agent: String,
        emoji: String,
        role: String,
        message: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    votes: [
      {
        agent: String,
        vote: { type: String, enum: ['YES', 'NO'] },
        confidence: Number,
        reason: String,
      },
    ],
    finalDecision: { type: String, default: '' },
    strategyGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<ISession>('Session', SessionSchema);
