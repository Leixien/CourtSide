/**
 * Match Detail Page
 * Live match view with real-time chat and reactions
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import LiveChat from '@/components/LiveChat';
import PlayerStats from '@/components/PlayerStats';
import { Users, Clock, MessageCircle } from 'lucide-react';
import { initSocket, joinMatchRoom, leaveMatchRoom, getSocket } from '@/lib/socket';

interface Match {
  _id: string;
  sport: string;
  league: string;
  homeTeam: {
    name: string;
    score?: number;
  };
  awayTeam: {
    name: string;
    score?: number;
  };
  status: string;
  startTime: string;
  currentMinute?: number;
  currentPeriod?: string;
  venue?: string;
  activeViewers: number;
}

export default function MatchDetailPage() {
  const params = useParams();
  const matchId = params.id as string;
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    fetchMatch();

    // Initialize WebSocket connection
    const socket = initSocket();

    // Join match room
    joinMatchRoom(matchId);

    // Listen for real-time updates
    socket.on('match:update', handleMatchUpdate);
    socket.on('match:score', handleScoreUpdate);
    socket.on('viewers:update', handleViewersUpdate);

    return () => {
      // Clean up
      leaveMatchRoom(matchId);
      socket.off('match:update', handleMatchUpdate);
      socket.off('match:score', handleScoreUpdate);
      socket.off('viewers:update', handleViewersUpdate);
    };
  }, [matchId]);

  const fetchMatch = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/matches/${matchId}`);
      const data = await response.json();
      setMatch(data.match);
      setViewerCount(data.match.activeViewers || 0);
    } catch (error) {
      console.error('Failed to fetch match:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchUpdate = (data: any) => {
    if (data.matchId === matchId) {
      setMatch((prev) => (prev ? { ...prev, ...data.update } : null));
    }
  };

  const handleScoreUpdate = (data: any) => {
    if (data.matchId === matchId) {
      setMatch((prev) =>
        prev
          ? {
              ...prev,
              homeTeam: { ...prev.homeTeam, score: data.homeScore },
              awayTeam: { ...prev.awayTeam, score: data.awayScore },
            }
          : null
      );
    }
  };

  const handleViewersUpdate = (data: { matchId: string; count: number }) => {
    if (data.matchId === matchId) {
      setViewerCount(data.count);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Navbar />
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Match not found
          </h2>
        </div>
      </div>
    );
  }

  const isLive = match.status === 'live';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Match Header */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
          {/* League and Status */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {match.league}
              </h2>
              {match.venue && (
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {match.venue}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Users className="w-5 h-5" />
                <span className="font-medium">{viewerCount}</span>
              </div>
              {isLive && (
                <span className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-full font-semibold animate-pulse">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  <span>LIVE</span>
                </span>
              )}
            </div>
          </div>

          {/* Score Display */}
          <div className="grid grid-cols-3 gap-4 items-center">
            {/* Home Team */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl font-bold">
                  {match.homeTeam.name.charAt(0)}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {match.homeTeam.name}
              </h3>
            </div>

            {/* Score */}
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                {match.homeTeam.score ?? '-'} : {match.awayTeam.score ?? '-'}
              </div>
              {isLive && match.currentMinute && (
                <div className="text-primary-500 font-semibold text-lg">
                  {match.currentMinute}' {match.currentPeriod}
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl font-bold">
                  {match.awayTeam.name.charAt(0)}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {match.awayTeam.name}
              </h3>
            </div>
          </div>
        </div>

        {/* Player Statistics - Solo per match NBA live */}
        {match.league === 'NBA' && (match.status === 'live' || match.status === 'halftime') && (
          <div className="mb-6">
            <PlayerStats matchId={matchId} />
          </div>
        )}

        {/* Live Chat */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg">
          <div className="border-b border-gray-200 dark:border-slate-700 p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Live Discussion</span>
            </h3>
          </div>
          <LiveChat matchId={matchId} />
        </div>
      </div>
    </div>
  );
}
