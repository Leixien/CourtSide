/**
 * PlayerEvent Model
 * Tracks significant player events during matches for notifications
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlayerEvent extends Document {
  matchId: mongoose.Types.ObjectId;
  playerId: string; // External API player ID
  playerName: string;
  teamId: string;

  eventType: 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'substitution' |
             'injury' | 'penalty' | 'shot' | 'save' | 'foul' | 'other';

  eventDescription: string;
  minute?: number;
  period?: string;

  // Notification tracking
  notificationSent: boolean;
  notifiedUsers: mongoose.Types.ObjectId[];

  timestamp: Date;
  createdAt: Date;
}

const PlayerEventSchema: Schema<IPlayerEvent> = new Schema(
  {
    matchId: {
      type: Schema.Types.ObjectId,
      ref: 'Match',
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
    eventType: {
      type: String,
      required: true,
      enum: [
        'goal', 'assist', 'yellow_card', 'red_card', 'substitution',
        'injury', 'penalty', 'shot', 'save', 'foul', 'other'
      ],
    },
    eventDescription: {
      type: String,
      required: true,
    },
    minute: Number,
    period: String,
    notificationSent: {
      type: Boolean,
      default: false,
    },
    notifiedUsers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for queries
PlayerEventSchema.index({ matchId: 1, timestamp: -1 });
PlayerEventSchema.index({ playerId: 1, timestamp: -1 });
PlayerEventSchema.index({ notificationSent: 1, timestamp: -1 });

// TTL index to auto-delete old events after 30 days
PlayerEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

const PlayerEvent: Model<IPlayerEvent> =
  mongoose.models.PlayerEvent || mongoose.model<IPlayerEvent>('PlayerEvent', PlayerEventSchema);

export default PlayerEvent;
