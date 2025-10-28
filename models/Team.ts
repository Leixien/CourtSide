/**
 * Team Model
 * Stores team information cached from external API
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITeam extends Document {
  externalId: string;
  name: string;
  sport: string;
  league: string;
  logo?: string;
  country?: string;
  founded?: number;
  venue?: string;

  // Cache management
  lastUpdated: Date;

  createdAt: Date;
}

const TeamSchema: Schema<ITeam> = new Schema(
  {
    externalId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    sport: {
      type: String,
      required: true,
    },
    league: {
      type: String,
      required: true,
    },
    logo: String,
    country: String,
    founded: Number,
    venue: String,
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

TeamSchema.index({ sport: 1, league: 1 });

const Team: Model<ITeam> = mongoose.models.Team || mongoose.model<ITeam>('Team', TeamSchema);

export default Team;
