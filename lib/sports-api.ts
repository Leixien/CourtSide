/**
 * Sports API Integration
 * Fetches live scores and match data from API-Sports Basketball
 *
 * API Documentation: https://api-sports.io/documentation/basketball/v1
 */

export interface MatchData {
  externalId: string;
  sport: string;
  league: string;
  homeTeam: {
    id: string;
    name: string;
    logo?: string;
    score?: number;
  };
  awayTeam: {
    id: string;
    name: string;
    logo?: string;
    score?: number;
  };
  status: string;
  startTime: Date;
  venue?: string;
  currentMinute?: number;
  currentPeriod?: string;
}

/**
 * Map API-Sports status to our internal status
 */
function mapStatus(apiStatus: string, statusShort: string): string {
  // Basketball game status mapping
  const statusMap: Record<string, string> = {
    'NS': 'scheduled',    // Not Started
    'Q1': 'live',         // 1st Quarter
    'Q2': 'live',         // 2nd Quarter
    'HT': 'halftime',     // Halftime
    'Q3': 'live',         // 3rd Quarter
    'Q4': 'live',         // 4th Quarter
    'OT': 'live',         // Overtime
    'BT': 'live',         // Break Time
    'FT': 'finished',     // Finished
    'AOT': 'finished',    // After Overtime
    'CANC': 'cancelled',  // Cancelled
    'PST': 'postponed',   // Postponed
    'INT': 'live',        // Interrupted
    'ABD': 'cancelled',   // Abandoned
    'AWD': 'finished',    // Awarded
    'WO': 'finished',     // WalkOver
  };

  return statusMap[statusShort] || 'scheduled';
}

/**
 * Get current period description
 */
function getCurrentPeriod(statusShort: string): string {
  const periodMap: Record<string, string> = {
    'Q1': '1st Quarter',
    'Q2': '2nd Quarter',
    'HT': 'Halftime',
    'Q3': '3rd Quarter',
    'Q4': '4th Quarter',
    'OT': 'Overtime',
    'BT': 'Break',
  };

  return periodMap[statusShort] || '';
}

/**
 * Fetch live NBA matches from API-Sports Basketball
 * Note: API Basketball doesn't support "live=all" parameter
 * We fetch today's games and filter for live ones
 */
export async function fetchLiveMatches(sport: string = 'basketball'): Promise<MatchData[]> {
  if (!process.env.SPORTS_API_KEY || !process.env.SPORTS_API_URL) {
    console.warn('⚠️  SPORTS_API_KEY or SPORTS_API_URL not set, using mock data');
    return getMockLiveMatches();
  }

  try {
    console.log('🔄 Fetching live matches from API-Sports Basketball...');

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    const response = await fetch(`${process.env.SPORTS_API_URL}games?date=${today}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.SPORTS_API_KEY,
        'x-rapidapi-host': 'v1.basketball.api-sports.io'
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    console.log(`📊 API Response: ${data.results} total games today`);

    if (!data.response || data.response.length === 0) {
      console.log('ℹ️  No games found today');
      return [];
    }

    // Filter only NBA live games
    const liveStatuses = ['Q1', 'Q2', 'HT', 'Q3', 'Q4', 'OT', 'BT'];
    const liveGames = data.response.filter((game: any) =>
      liveStatuses.includes(game.status.short) && game.league.name === 'NBA'
    );

    console.log(`🔴 Found ${liveGames.length} NBA LIVE matches`);

    // Transform API data to our format
    const matches: MatchData[] = liveGames.map((game: any) => ({
      externalId: game.id.toString(),
      sport: 'basketball',
      league: game.league.name || 'Basketball',
      homeTeam: {
        id: game.teams.home.id.toString(),
        name: game.teams.home.name,
        logo: game.teams.home.logo,
        score: game.scores.home.total || 0,
      },
      awayTeam: {
        id: game.teams.away.id.toString(),
        name: game.teams.away.name,
        logo: game.teams.away.logo,
        score: game.scores.away.total || 0,
      },
      status: mapStatus(game.status.long, game.status.short),
      startTime: new Date(game.date),
      venue: game.arena?.name,
      currentPeriod: getCurrentPeriod(game.status.short),
    }));

    if (matches.length > 0) {
      console.log('🏀 Live matches:');
      matches.forEach(m => {
        console.log(`   ${m.homeTeam.name} ${m.homeTeam.score} - ${m.awayTeam.score} ${m.awayTeam.name} (${m.currentPeriod})`);
      });
    }

    return matches;

  } catch (error: any) {
    console.error('❌ Error fetching live matches:', error.message);
    // Fallback to mock data on error
    return getMockLiveMatches();
  }
}

/**
 * Mock data fallback
 */
function getMockLiveMatches(): MatchData[] {
  console.log('📝 Using mock data');
  return [
    {
      externalId: 'mock-1',
      sport: 'basketball',
      league: 'NBA',
      homeTeam: {
        id: 'team-1',
        name: 'Los Angeles Lakers',
        score: 98,
      },
      awayTeam: {
        id: 'team-2',
        name: 'Boston Celtics',
        score: 95,
      },
      status: 'live',
      startTime: new Date(),
      currentPeriod: '3rd Quarter',
    },
  ];
}

/**
 * Fetch upcoming matches (today's scheduled games)
 */
export async function fetchUpcomingMatches(sport: string = 'basketball'): Promise<MatchData[]> {
  if (!process.env.SPORTS_API_KEY || !process.env.SPORTS_API_URL) {
    console.warn('⚠️  SPORTS_API_KEY not set, using mock data');
    return getMockUpcomingMatches();
  }

  try {
    console.log('🔄 Fetching upcoming matches...');

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    const response = await fetch(
      `${process.env.SPORTS_API_URL}games?date=${today}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-key': process.env.SPORTS_API_KEY,
          'x-rapidapi-host': 'v1.basketball.api-sports.io'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.response || data.response.length === 0) {
      console.log('ℹ️  No games found today');
      return [];
    }

    // Filter only NBA scheduled matches
    const scheduledGames = data.response.filter((game: any) =>
      game.status.short === 'NS' && game.league.name === 'NBA'
    );

    console.log(`📅 Found ${scheduledGames.length} NBA scheduled matches`);

    const matches: MatchData[] = scheduledGames.map((game: any) => ({
      externalId: game.id.toString(),
      sport: 'basketball',
      league: game.league.name || 'Basketball',
      homeTeam: {
        id: game.teams.home.id.toString(),
        name: game.teams.home.name,
        logo: game.teams.home.logo,
      },
      awayTeam: {
        id: game.teams.away.id.toString(),
        name: game.teams.away.name,
        logo: game.teams.away.logo,
      },
      status: 'scheduled',
      startTime: new Date(game.date),
      venue: game.arena?.name,
    }));

    return matches;

  } catch (error: any) {
    console.error('❌ Error fetching upcoming matches:', error.message);
    return getMockUpcomingMatches();
  }
}

function getMockUpcomingMatches(): MatchData[] {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return [
    {
      externalId: 'mock-2',
      sport: 'basketball',
      league: 'NBA',
      homeTeam: {
        id: 'team-3',
        name: 'Golden State Warriors',
      },
      awayTeam: {
        id: 'team-4',
        name: 'Miami Heat',
      },
      status: 'scheduled',
      startTime: tomorrow,
      venue: 'Chase Center',
    },
  ];
}

/**
 * Fetch single match details
 */
export async function fetchMatchDetails(matchId: string): Promise<MatchData | null> {
  if (!process.env.SPORTS_API_KEY || !process.env.SPORTS_API_URL) {
    return null;
  }

  try {
    const response = await fetch(
      `${process.env.SPORTS_API_URL}games?id=${matchId}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-key': process.env.SPORTS_API_KEY,
          'x-rapidapi-host': 'v1.basketball.api-sports.io'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.response || data.response.length === 0) {
      return null;
    }

    const game = data.response[0];

    return {
      externalId: game.id.toString(),
      sport: 'basketball',
      league: game.league.name || 'NBA',
      homeTeam: {
        id: game.teams.home.id.toString(),
        name: game.teams.home.name,
        logo: game.teams.home.logo,
        score: game.scores.home.total || 0,
      },
      awayTeam: {
        id: game.teams.away.id.toString(),
        name: game.teams.away.name,
        logo: game.teams.away.logo,
        score: game.scores.away.total || 0,
      },
      status: mapStatus(game.status.long, game.status.short),
      startTime: new Date(game.date),
      venue: game.arena?.name,
      currentPeriod: getCurrentPeriod(game.status.short),
    };

  } catch (error: any) {
    console.error('Error fetching match details:', error.message);
    return null;
  }
}

/**
 * Fetch player statistics for a match
 */
export async function fetchPlayerStats(gameId: string): Promise<any[]> {
  if (!process.env.SPORTS_API_KEY || !process.env.SPORTS_API_URL) {
    return [];
  }

  try {
    const response = await fetch(
      `${process.env.SPORTS_API_URL}games/statistics?id=${gameId}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-key': process.env.SPORTS_API_KEY,
          'x-rapidapi-host': 'v1.basketball.api-sports.io'
        }
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (!data.response || data.response.length === 0) {
      return [];
    }

    // Transform player stats
    const allStats: any[] = [];

    data.response.forEach((teamData: any) => {
      const teamId = teamData.team.id.toString();
      const teamName = teamData.team.name;

      teamData.players.forEach((player: any) => {
        allStats.push({
          playerId: player.player.id?.toString() || player.player.name,
          playerName: player.player.name,
          teamId,
          teamName,
          points: parseInt(player.points) || 0,
          rebounds: parseInt(player.totReb) || 0,
          assists: parseInt(player.assists) || 0,
          steals: parseInt(player.steals) || 0,
          blocks: parseInt(player.blocks) || 0,
          turnovers: parseInt(player.turnovers) || 0,
          fouls: parseInt(player.pFouls) || 0,
          fieldGoalsMade: parseInt(player.fgm) || 0,
          fieldGoalsAttempted: parseInt(player.fga) || 0,
          threePointersMade: parseInt(player.tpm) || 0,
          threePointersAttempted: parseInt(player.tpa) || 0,
          freeThrowsMade: parseInt(player.ftm) || 0,
          freeThrowsAttempted: parseInt(player.fta) || 0,
          minutes: player.min || '0',
          position: player.pos || '',
          isStarter: player.pos !== '' && player.pos !== 'DNP',
        });
      });
    });

    return allStats;

  } catch (error: any) {
    console.error('Error fetching player stats:', error.message);
    return [];
  }
}

/**
 * Legacy function name for compatibility
 */
export async function fetchPlayerEvents(matchId: string): Promise<any[]> {
  return fetchPlayerStats(matchId);
}
