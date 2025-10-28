/**
 * Match Model
 * Stores live and upcoming matches with real-time score updates
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMatch extends Document {
  externalId: string; // ID from sports API
  sport: string;
  league: string;
  homeTeam: {
    id: string;
    name: string;
    logo?: string;
    score?: number;
  };
  awayTeam: {
    id: string;
    name: string;
    logo?: string;
    score?: number;
  };
  status: 'scheduled' | 'live' | 'halftime' | 'finished' | 'cancelled' | 'postponed';
  startTime: Date;
  venue?: string;

  // Live match data
  currentMinute?: number;
  currentPeriod?: string; // Q1, Q2, 1st Half, etc.
  lastUpdate: Date;

  // Stats
  homeStats?: Record<string, any>;
  awayStats?: Record<string, any>;

  // Activity tracking
  activeViewers: number; // Real-time viewer count
  totalMessages: number; // Chat message count

  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema: Schema<IMatch> = new Schema(
  {
    externalId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    sport: {
      type: String,
      required: true,
      enum: ['football', 'basketball', 'baseball', 'hockey', 'tennis'],
    },
    league: {
      type: String,
      required: true,
    },
    homeTeam: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      logo: String,
      score: { type: Number, default: 0 },
    },
    awayTeam: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      logo: String,
      score: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'halftime', 'finished', 'cancelled', 'postponed'],
      default: 'scheduled',
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    venue: String,
    currentMinute: Number,
    currentPeriod: String,
    lastUpdate: {
      type: Date,
      default: Date.now,
    },
    homeStats: Schema.Types.Mixed,
    awayStats: Schema.Types.Mixed,
    activeViewers: {
      type: Number,
      default: 0,
    },
    totalMessages: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
MatchSchema.index({ status: 1, startTime: -1 });
MatchSchema.index({ sport: 1, status: 1, startTime: -1 });
MatchSchema.index({ 'homeTeam.id': 1, status: 1 });
MatchSchema.index({ 'awayTeam.id': 1, status: 1 });

const Match: Model<IMatch> = mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema);

export default Match;
