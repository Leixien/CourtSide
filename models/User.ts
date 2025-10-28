/**
 * User Model
 * Stores user accounts with authentication and preferences
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Optional for OAuth users
  image?: string;
  provider?: 'credentials' | 'google' | 'github';
  providerId?: string;

  // User preferences
  favoriteTeams: mongoose.Types.ObjectId[];
  favoritePlayers: string[];
  notificationsEnabled: boolean;
  pushSubscription?: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      select: false, // Don't include by default in queries
    },
    image: String,
    provider: {
      type: String,
      enum: ['credentials', 'google', 'github'],
      default: 'credentials',
    },
    providerId: String,
    favoriteTeams: [{
      type: Schema.Types.ObjectId,
      ref: 'Team',
    }],
    favoritePlayers: [String], // Store player IDs from external API
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    pushSubscription: {
      endpoint: String,
      keys: {
        p256dh: String,
        auth: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance optimization on free tier
UserSchema.index({ email: 1 });
UserSchema.index({ createdAt: -1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
