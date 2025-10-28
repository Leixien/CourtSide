/**
 * Match Sync Service
 * Sincronizza match live dall'API Basketball al database
 * Run: npm run sync-matches
 */

import 'dotenv/config';
import connectDB from '../lib/mongodb';
import Match from '../models/Match';
import PlayerStats from '../models/PlayerStats';
import { fetchLiveMatches, fetchUpcomingMatches, fetchPlayerStats } from '../lib/sports-api';

/**
 * Sincronizza match live e le loro statistiche giocatori
 */
async function syncLiveMatches() {
  try {
    console.log('\n🔄 Syncing live NBA matches...');

    const liveMatches = await fetchLiveMatches('basketball');

    if (liveMatches.length === 0) {
      console.log('ℹ️  No live NBA matches to sync');
      return 0;
    }

    let updated = 0;
    let created = 0;
    let statsUpdated = 0;

    for (const matchData of liveMatches) {
      const result = await Match.findOneAndUpdate(
        { externalId: matchData.externalId },
        {
          ...matchData,
          lastUpdate: new Date(),
        },
        { upsert: true, new: true }
      );

      if (result) {
        const isNew = result.createdAt.getTime() === result.updatedAt.getTime();
        if (isNew) {
          created++;
          console.log(`  ✨ Created: ${matchData.homeTeam.name} vs ${matchData.awayTeam.name}`);
        } else {
          updated++;
          console.log(`  🔄 Updated: ${matchData.homeTeam.name} ${matchData.homeTeam.score} - ${matchData.awayTeam.score} ${matchData.awayTeam.name} (${matchData.currentPeriod})`);
        }

        // Sync player stats for live match
        try {
          const playerStats = await fetchPlayerStats(matchData.externalId);

          if (playerStats.length > 0) {
            for (const stat of playerStats) {
              await PlayerStats.findOneAndUpdate(
                {
                  externalGameId: matchData.externalId,
                  playerId: stat.playerId,
                },
                {
                  ...stat,
                  matchId: result._id,
                  externalGameId: matchData.externalId,
                  lastUpdate: new Date(),
                },
                { upsert: true }
              );
            }
            statsUpdated++;
            console.log(`    📊 Updated stats for ${playerStats.length} players`);
          }
        } catch (statsError: any) {
          console.log(`    ⚠️  Stats not available yet`);
        }
      }
    }

    console.log(`✅ Live matches synced: ${created} created, ${updated} updated`);
    if (statsUpdated > 0) {
      console.log(`📊 Player stats synced for ${statsUpdated} matches`);
    }

    return created + updated;

  } catch (error: any) {
    console.error('❌ Error syncing live matches:', error.message);
    return 0;
  }
}

/**
 * Sincronizza match programmati
 */
async function syncUpcomingMatches() {
  try {
    console.log('\n📅 Syncing upcoming matches...');

    const upcomingMatches = await fetchUpcomingMatches('basketball');

    if (upcomingMatches.length === 0) {
      console.log('ℹ️  No upcoming matches to sync');
      return 0;
    }

    let synced = 0;

    for (const matchData of upcomingMatches) {
      await Match.findOneAndUpdate(
        { externalId: matchData.externalId },
        {
          ...matchData,
          lastUpdate: new Date(),
        },
        { upsert: true }
      );
      synced++;
    }

    console.log(`✅ Upcoming matches synced: ${synced}`);
    return synced;

  } catch (error: any) {
    console.error('❌ Error syncing upcoming matches:', error.message);
    return 0;
  }
}

/**
 * Main sync function
 */
async function sync() {
  try {
    await connectDB();

    const liveCount = await syncLiveMatches();
    const upcomingCount = await syncUpcomingMatches();

    const total = liveCount + upcomingCount;

    if (total > 0) {
      console.log(`\n✅ Total synced: ${total} matches\n`);
    }

  } catch (error: any) {
    console.error('\n❌ Sync failed:', error.message);
  }
}

/**
 * Avvia sync continuo
 */
async function startContinuousSync() {
  console.log('🚀 Starting NBA Match Sync Service...\n');
  console.log('📡 API URL:', process.env.SPORTS_API_URL);
  console.log('🔑 API Key:', process.env.SPORTS_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('⏱️  Sync interval: 60 seconds\n');

  // Prima sync immediata
  await sync();

  // Poi ogni 60 secondi
  setInterval(async () => {
    const now = new Date().toLocaleTimeString('it-IT');
    console.log(`\n⏰ [${now}] Running scheduled sync...`);
    await sync();
  }, 60000); // 60 secondi

  console.log('✅ Sync service running. Press Ctrl+C to stop.\n');
}

// Avvia il servizio
startContinuousSync().catch(console.error);

// Gestisci chiusura graceful
process.on('SIGINT', () => {
  console.log('\n\n👋 Stopping sync service...');
  process.exit(0);
});
