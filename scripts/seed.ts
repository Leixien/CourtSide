/**
 * Database Seeding Script
 * Populates database with sample data for development
 * Run with: npx tsx scripts/seed.ts
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../lib/mongodb';
import Match from '../models/Match';
import Team from '../models/Team';
import User from '../models/User';
import { hashPassword } from '../lib/auth';

async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Match.deleteMany({});
    await Team.deleteMany({});
    await User.deleteMany({});

    // Create sample teams
    console.log('🏆 Creating sample teams...');
    const teams = await Team.create([
      {
        externalId: 'team-1',
        name: 'Manchester United',
        sport: 'football',
        league: 'Premier League',
        country: 'England',
        venue: 'Old Trafford',
      },
      {
        externalId: 'team-2',
        name: 'Liverpool',
        sport: 'football',
        league: 'Premier League',
        country: 'England',
        venue: 'Anfield',
      },
      {
        externalId: 'team-3',
        name: 'Barcelona',
        sport: 'football',
        league: 'La Liga',
        country: 'Spain',
        venue: 'Camp Nou',
      },
      {
        externalId: 'team-4',
        name: 'Real Madrid',
        sport: 'football',
        league: 'La Liga',
        country: 'Spain',
        venue: 'Santiago Bernabéu',
      },
      {
        externalId: 'team-5',
        name: 'Los Angeles Lakers',
        sport: 'basketball',
        league: 'NBA',
        country: 'USA',
        venue: 'Crypto.com Arena',
      },
      {
        externalId: 'team-6',
        name: 'Boston Celtics',
        sport: 'basketball',
        league: 'NBA',
        country: 'USA',
        venue: 'TD Garden',
      },
    ]);

    // Create sample matches
    console.log('⚽ Creating sample matches...');
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    await Match.create([
      // Live match
      {
        externalId: 'match-live-1',
        sport: 'football',
        league: 'Premier League',
        homeTeam: {
          id: 'team-1',
          name: 'Manchester United',
          score: 2,
        },
        awayTeam: {
          id: 'team-2',
          name: 'Liverpool',
          score: 1,
        },
        status: 'live',
        startTime: new Date(now.getTime() - 45 * 60 * 1000), // Started 45 mins ago
        currentMinute: 67,
        currentPeriod: '2nd Half',
        venue: 'Old Trafford',
        activeViewers: 1523,
        totalMessages: 342,
      },
      // Upcoming match - tomorrow
      {
        externalId: 'match-scheduled-1',
        sport: 'football',
        league: 'La Liga',
        homeTeam: {
          id: 'team-3',
          name: 'Barcelona',
        },
        awayTeam: {
          id: 'team-4',
          name: 'Real Madrid',
        },
        status: 'scheduled',
        startTime: tomorrow,
        venue: 'Camp Nou',
        activeViewers: 0,
        totalMessages: 0,
      },
      // Upcoming match - next week
      {
        externalId: 'match-scheduled-2',
        sport: 'basketball',
        league: 'NBA',
        homeTeam: {
          id: 'team-5',
          name: 'Los Angeles Lakers',
        },
        awayTeam: {
          id: 'team-6',
          name: 'Boston Celtics',
        },
        status: 'scheduled',
        startTime: nextWeek,
        venue: 'Crypto.com Arena',
        activeViewers: 0,
        totalMessages: 0,
      },
      // Finished match
      {
        externalId: 'match-finished-1',
        sport: 'football',
        league: 'Premier League',
        homeTeam: {
          id: 'team-2',
          name: 'Liverpool',
          score: 3,
        },
        awayTeam: {
          id: 'team-1',
          name: 'Manchester United',
          score: 2,
        },
        status: 'finished',
        startTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        venue: 'Anfield',
        activeViewers: 0,
        totalMessages: 567,
      },
    ]);

    // Create sample user
    console.log('👤 Creating sample user...');
    const hashedPassword = await hashPassword('password123');
    await User.create({
      name: 'Demo User',
      email: 'demo@courtside.app',
      password: hashedPassword,
      provider: 'credentials',
      favoriteTeams: [teams[0]._id, teams[2]._id],
      favoritePlayers: ['player-1', 'player-2'],
      notificationsEnabled: true,
    });

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Sample data created:');
    console.log(`   - ${teams.length} teams`);
    console.log(`   - 4 matches (1 live, 2 scheduled, 1 finished)`);
    console.log(`   - 1 user (email: demo@courtside.app, password: password123)`);
    console.log('\n🚀 You can now start the dev server with: npm run dev\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
