/**
 * Matches Page
 * Displays list of live and upcoming matches
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Play, Calendar, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Match {
  _id: string;
  sport: string;
  league: string;
  homeTeam: {
    name: string;
    logo?: string;
    score?: number;
  };
  awayTeam: {
    name: string;
    logo?: string;
    score?: number;
  };
  status: string;
  startTime: string;
  currentMinute?: number;
  activeViewers: number;
  totalMessages: number;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [filter, setFilter] = useState<'all' | 'live' | 'scheduled'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, [filter]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const queryParams = filter !== 'all' ? `?status=${filter}` : '';
      const response = await fetch(`/api/matches${queryParams}`);
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
            Matches
          </h1>

          {/* Filter Tabs */}
          <div className="flex space-x-2 bg-white dark:bg-slate-800 rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md transition ${
                filter === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('live')}
              className={`px-4 py-2 rounded-md transition flex items-center space-x-1 ${
                filter === 'live'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>Live</span>
            </button>
            <button
              onClick={() => setFilter('scheduled')}
              className={`px-4 py-2 rounded-md transition flex items-center space-x-1 ${
                filter === 'scheduled'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Upcoming</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading matches...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No matches found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Check back soon for upcoming matches
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {matches.map((match) => (
              <MatchCard key={match._id} match={match} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MatchCard({ match }: { match: Match }) {
  const isLive = match.status === 'live';
  const startTime = new Date(match.startTime);

  return (
    <Link href={`/matches/${match._id}`}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl transition p-6 cursor-pointer">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {match.league}
          </span>
          {isLive && (
            <span className="flex items-center space-x-1 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full"></span>
              <span>LIVE</span>
            </span>
          )}
          {match.status === 'scheduled' && (
            <span className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>{format(startTime, 'MMM d, h:mm a')}</span>
            </span>
          )}
        </div>

        {/* Teams */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold">
                  {match.homeTeam.name.charAt(0)}
                </span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {match.homeTeam.name}
              </span>
            </div>
            {typeof match.homeTeam.score === 'number' && (
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {match.homeTeam.score}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold">
                  {match.awayTeam.name.charAt(0)}
                </span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {match.awayTeam.name}
              </span>
            </div>
            {typeof match.awayTeam.score === 'number' && (
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {match.awayTeam.score}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{match.activeViewers || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>{match.totalMessages || 0}</span>
            </div>
          </div>
          {isLive && match.currentMinute && (
            <span className="text-sm font-medium text-primary-500">
              {match.currentMinute}'
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
