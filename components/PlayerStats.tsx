/**
 * Player Statistics Component
 * Mostra statistiche live dei giocatori
 */

'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Target, Users } from 'lucide-react';

interface PlayerStat {
  playerId: string;
  playerName: string;
  teamName: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  threePointersMade: number;
  threePointersAttempted: number;
  minutes: string;
  position: string;
}

interface PlayerStatsProps {
  matchId: string;
}

export default function PlayerStats({ matchId }: PlayerStatsProps) {
  const [stats, setStats] = useState<{ home: PlayerStat[]; away: PlayerStat[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'away'>('home');

  useEffect(() => {
    fetchStats();

    // Aggiorna stats ogni 30 secondi
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [matchId]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/matches/${matchId}/stats`);
      const data = await response.json();

      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats || (stats.home.length === 0 && stats.away.length === 0)) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Player statistics will appear when available</p>
        </div>
      </div>
    );
  }

  const activeStats = activeTab === 'home' ? stats.home : stats.away;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-slate-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5" />
          <span>Player Statistics</span>
        </h3>

        {/* Team Tabs */}
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'home'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Home ({stats.home.length})
          </button>
          <button
            onClick={() => setActiveTab('away')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'away'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Away ({stats.away.length})
          </button>
        </div>
      </div>

      {/* Stats Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Player
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                MIN
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                PTS
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                REB
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                AST
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                FG
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                3PT
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {activeStats.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No player statistics available yet
                </td>
              </tr>
            ) : (
              activeStats.map((player) => {
                const fgPct = player.fieldGoalsAttempted > 0
                  ? ((player.fieldGoalsMade / player.fieldGoalsAttempted) * 100).toFixed(0)
                  : '0';
                const threePct = player.threePointersAttempted > 0
                  ? ((player.threePointersMade / player.threePointersAttempted) * 100).toFixed(0)
                  : '0';

                return (
                  <tr
                    key={player.playerId}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {player.playerName}
                        </div>
                        {player.position && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {player.position}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">
                      {player.minutes}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-lg text-primary-500">
                        {player.points}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">
                      {player.rebounds}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">
                      {player.assists}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-600 dark:text-gray-400">
                      <div>{player.fieldGoalsMade}/{player.fieldGoalsAttempted}</div>
                      <div className="text-gray-500">({fgPct}%)</div>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-600 dark:text-gray-400">
                      <div>{player.threePointersMade}/{player.threePointersAttempted}</div>
                      <div className="text-gray-500">({threePct}%)</div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="border-t border-gray-200 dark:border-slate-700 p-4 bg-gray-50 dark:bg-slate-900">
        <div className="text-xs text-gray-600 dark:text-gray-400 flex flex-wrap gap-x-4">
          <span><strong>MIN</strong> = Minutes</span>
          <span><strong>PTS</strong> = Points</span>
          <span><strong>REB</strong> = Rebounds</span>
          <span><strong>AST</strong> = Assists</span>
          <span><strong>FG</strong> = Field Goals</span>
          <span><strong>3PT</strong> = 3-Pointers</span>
        </div>
      </div>
    </div>
  );
}
