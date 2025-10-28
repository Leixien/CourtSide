/**
 * PlayerStats Model
 * Statistiche live dei giocatori durante i match
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlayerStats extends Document {
  matchId: mongoose.Types.ObjectId;
  externalGameId: string;
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;

  // Statistiche
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;

  // Tiri
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  threePointersMade: number;
  threePointersAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;

  // Minutaggio
  minutes: string;

  // Metadata
  position: string;
  isStarter: boolean;
  lastUpdate: Date;

  createdAt: Date;
  updatedAt: Date;
}

const PlayerStatsSchema: Schema<IPlayerStats> = new Schema(
  {
    matchId: {
      type: Schema.Types.ObjectId,
      ref: 'Match',
      required: true,
      index: true,
    },
    externalGameId: {
      type: String,
      required: true,
      index: true,
    },
    playerId: {
      type: String,
      required: true,
      index: true,
    },
    playerName: {
      type: String,
      required: true,
    },
    teamId: {
      type: String,
      required: true,
    },
    teamName: {
      type: String,
      required: true,
    },
    points: { type: Number, default: 0 },
    rebounds: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    steals: { type: Number, default: 0 },
    blocks: { type: Number, default: 0 },
    turnovers: { type: Number, default: 0 },
    fouls: { type: Number, default: 0 },
    fieldGoalsMade: { type: Number, default: 0 },
    fieldGoalsAttempted: { type: Number, default: 0 },
    threePointersMade: { type: Number, default: 0 },
    threePointersAttempted: { type: Number, default: 0 },
    freeThrowsMade: { type: Number, default: 0 },
    freeThrowsAttempted: { type: Number, default: 0 },
    minutes: { type: String, default: '0:00' },
    position: String,
    isStarter: { type: Boolean, default: false },
    lastUpdate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
PlayerStatsSchema.index({ matchId: 1, playerId: 1 });
PlayerStatsSchema.index({ externalGameId: 1, playerId: 1 }, { unique: true });

// TTL index - auto delete dopo 7 giorni
PlayerStatsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

const PlayerStats: Model<IPlayerStats> =
  mongoose.models.PlayerStats || mongoose.model<IPlayerStats>('PlayerStats', PlayerStatsSchema);

export default PlayerStats;
