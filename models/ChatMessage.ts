/**
 * ChatMessage Model
 * Stores real-time chat messages for each match
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReaction {
  emoji: string;
  users: mongoose.Types.ObjectId[];
  count: number;
}

export interface IChatMessage extends Document {
  matchId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userImage?: string;
  message: string;

  // Threading support
  parentMessageId?: mongoose.Types.ObjectId;
  replyCount: number;

  // Reactions
  reactions: IReaction[];

  // Metadata
  timestamp: Date;
  edited: boolean;
  editedAt?: Date;
  deleted: boolean;

  createdAt: Date;
}

const ReactionSchema = new Schema({
  emoji: { type: String, required: true },
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  count: { type: Number, default: 0 },
}, { _id: false });

const ChatMessageSchema: Schema<IChatMessage> = new Schema(
  {
    matchId: {
      type: Schema.Types.ObjectId,
      ref: 'Match',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userImage: String,
    message: {
      type: String,
      required: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    parentMessageId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatMessage',
      index: true,
    },
    replyCount: {
      type: Number,
      default: 0,
    },
    reactions: [ReactionSchema],
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
ChatMessageSchema.index({ matchId: 1, timestamp: -1 });
ChatMessageSchema.index({ matchId: 1, parentMessageId: 1, timestamp: -1 });

// TTL index to auto-delete messages after 7 days (save storage on free tier)
ChatMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

const ChatMessage: Model<IChatMessage> =
  mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);

export default ChatMessage;
