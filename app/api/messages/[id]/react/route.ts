/**
 * Message Reaction API
 * POST /api/messages/[id]/react - Add or remove emoji reaction to a message
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChatMessage from '@/models/ChatMessage';
import { getUserFromRequest } from '@/lib/auth';
import mongoose from 'mongoose';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const user = await getUserFromRequest(request.headers);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { emoji } = await request.json();

    if (!emoji) {
      return NextResponse.json(
        { error: 'Emoji is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const message = await ChatMessage.findById(id);
    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    const userId = new mongoose.Types.ObjectId(user.userId);

    // Find existing reaction for this emoji
    const reactionIndex = message.reactions.findIndex((r) => r.emoji === emoji);

    if (reactionIndex >= 0) {
      // Reaction exists - toggle user's reaction
      const reaction = message.reactions[reactionIndex];
      const userIndex = reaction.users.findIndex((u) => u.equals(userId));

      if (userIndex >= 0) {
        // User already reacted - remove reaction
        reaction.users.splice(userIndex, 1);
        reaction.count = reaction.users.length;

        // Remove reaction entirely if no users left
        if (reaction.count === 0) {
          message.reactions.splice(reactionIndex, 1);
        }
      } else {
        // User hasn't reacted - add reaction
        reaction.users.push(userId);
        reaction.count = reaction.users.length;
      }
    } else {
      // New reaction - create it
      message.reactions.push({
        emoji,
        users: [userId],
        count: 1,
      });
    }

    await message.save();

    return NextResponse.json({ reactions: message.reactions });
  } catch (error: any) {
    console.error('React to message error:', error);
    return NextResponse.json(
      { error: 'Failed to react to message' },
      { status: 500 }
    );
  }
}
