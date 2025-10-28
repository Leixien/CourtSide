/**
 * Schedule Page
 * Displays upcoming matches calendar
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Calendar, Clock } from 'lucide-react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

interface Match {
  _id: string;
  sport: string;
  league: string;
  homeTeam: {
    name: string;
  };
  awayTeam: {
    name: string;
  };
  status: string;
  startTime: string;
  venue?: string;
}

export default function SchedulePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/matches?status=scheduled&limit=50');
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMatchDate = (dateString: string) => {
    const date = parseISO(dateString);

    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy - h:mm a');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Upcoming Matches
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Schedule of upcoming sports events
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading schedule...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No upcoming matches
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Check back later for scheduled matches
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <Link
                key={match._id}
                href={`/matches/${match._id}`}
                className="block bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl transition p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {match.league}
                    </span>
                    {match.venue && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {match.venue}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-primary-500">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">
                      {formatMatchDate(match.startTime)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  {/* Home Team */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl font-bold">
                        {match.homeTeam.name.charAt(0)}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {match.homeTeam.name}
                    </p>
                  </div>

                  {/* VS */}
                  <div className="text-center">
                    <span className="text-2xl font-bold text-gray-400">VS</span>
                  </div>

                  {/* Away Team */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl font-bold">
                        {match.awayTeam.name.charAt(0)}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {match.awayTeam.name}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
