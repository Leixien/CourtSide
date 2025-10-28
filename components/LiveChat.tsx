/**
 * Live Chat Component
 * Real-time chat with emoji reactions and threading
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getSocket } from '@/lib/socket';
import { format } from 'date-fns';
import { Send, Smile } from 'lucide-react';

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

interface ChatMessage {
  _id: string;
  userId: string;
  userName: string;
  userImage?: string;
  message: string;
  timestamp: string;
  reactions: Reaction[];
  replyCount: number;
}

const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '🔥', '⚽', '🏀'];

export default function LiveChat({ matchId }: { matchId: string }) {
  const { isAuthenticated, user, getAuthHeaders } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();

    // Listen for real-time messages
    const socket = getSocket();
    if (socket) {
      socket.on('chat:message', handleNewMessage);
      socket.on('chat:reaction', handleReaction);
    }

    return () => {
      if (socket) {
        socket.off('chat:message', handleNewMessage);
        socket.off('chat:reaction', handleReaction);
      }
    };
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/matches/${matchId}/messages?limit=50`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleNewMessage = (data: any) => {
    if (data.matchId === matchId || data.message?.matchId === matchId) {
      const message = data.message || data;
      setMessages((prev) => [...prev, message]);
    }
  };

  const handleReaction = (data: any) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === data.messageId ? { ...msg, reactions: data.reactions } : msg
      )
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      alert('Please login to send messages');
      return;
    }

    if (!newMessage.trim()) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/matches/${matchId}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message: newMessage }),
      });

      if (response.ok) {
        setNewMessage('');
        const data = await response.json();
        // Emit via socket for real-time update
        const socket = getSocket();
        if (socket) {
          socket.emit('chat:send', { matchId, message: data.message });
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!isAuthenticated) {
      alert('Please login to react');
      return;
    }

    try {
      const response = await fetch(`/api/messages/${messageId}/react`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ emoji }),
      });

      if (response.ok) {
        const data = await response.json();
        // Emit via socket for real-time update
        const socket = getSocket();
        if (socket) {
          socket.emit('chat:react', { matchId, messageId, reactions: data.reactions });
        }
        setShowEmojiPicker(null);
      }
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            No messages yet. Be the first to comment!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className="animation-fade-in bg-gray-50 dark:bg-slate-700 rounded-lg p-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {msg.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {msg.userName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      {format(new Date(msg.timestamp), 'HH:mm')}
                    </span>
                  </div>
                </div>

                {/* Emoji picker button */}
                <button
                  onClick={() =>
                    setShowEmojiPicker(showEmojiPicker === msg._id ? null : msg._id)
                  }
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Smile className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-800 dark:text-gray-200 ml-10">
                {msg.message}
              </p>

              {/* Reactions */}
              {msg.reactions && msg.reactions.length > 0 && (
                <div className="flex flex-wrap gap-2 ml-10 mt-2">
                  {msg.reactions.map((reaction, idx) => (
                    <button
                      key={idx}
                      onClick={() => addReaction(msg._id, reaction.emoji)}
                      className="flex items-center space-x-1 bg-white dark:bg-slate-600 rounded-full px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-slate-500 transition"
                    >
                      <span>{reaction.emoji}</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {reaction.count}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Emoji picker */}
              {showEmojiPicker === msg._id && (
                <div className="flex flex-wrap gap-2 ml-10 mt-2 p-2 bg-white dark:bg-slate-600 rounded-lg shadow-lg">
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => addReaction(msg._id, emoji)}
                      className="text-2xl hover:scale-125 transition"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {isAuthenticated ? (
        <form
          onSubmit={sendMessage}
          className="border-t border-gray-200 dark:border-slate-700 p-4"
        >
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              maxLength={500}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {newMessage.length}/500 characters
          </p>
        </form>
      ) : (
        <div className="border-t border-gray-200 dark:border-slate-700 p-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Please{' '}
            <a href="/login" className="text-primary-500 font-semibold hover:underline">
              login
            </a>{' '}
            to join the conversation
          </p>
        </div>
      )}
    </div>
  );
}
