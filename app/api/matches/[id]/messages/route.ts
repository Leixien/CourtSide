/**
 * Match Chat Messages API
 * GET /api/matches/[id]/messages - Fetch chat messages for a match
 * POST /api/matches/[id]/messages - Send a new chat message
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChatMessage from '@/models/ChatMessage';
import Match from '@/models/Match';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before'); // Timestamp for pagination
    const parentId = searchParams.get('parentId'); // For threaded replies

    await connectDB();

    // Build query
    const query: any = { matchId: id, deleted: false };
    if (before) query.timestamp = { $lt: new Date(before) };
    if (parentId) query.parentMessageId = parentId;

    // Fetch messages
    const messages = await ChatMessage.find(query)
      .sort({ timestamp: -1 })
      .limit(Math.min(limit, 100))
      .lean();

    return NextResponse.json({ messages: messages.reverse() });
  } catch (error: any) {
    console.error('Fetch messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

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

    const { message, parentMessageId } = await request.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Message too long (max 500 characters)' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify match exists
    const match = await Match.findById(id);
    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    // Create message
    const chatMessage = await ChatMessage.create({
      matchId: id,
      userId: user.userId,
      userName: 'User', // This should be fetched from User model in production
      message: message.trim(),
      parentMessageId: parentMessageId || undefined,
    });

    // Update match message count
    await Match.findByIdAndUpdate(id, { $inc: { totalMessages: 1 } });

    // If reply, update parent message reply count
    if (parentMessageId) {
      await ChatMessage.findByIdAndUpdate(parentMessageId, {
        $inc: { replyCount: 1 },
      });
    }

    return NextResponse.json({ message: chatMessage }, { status: 201 });
  } catch (error: any) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
