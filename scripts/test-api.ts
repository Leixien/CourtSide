/**
 * Test API Basketball
 * Testa direttamente l'API per vedere i match disponibili
 */

import 'dotenv/config';

async function testAPI() {
  const API_KEY = process.env.SPORTS_API_KEY;
  const API_URL = process.env.SPORTS_API_URL;

  console.log('🔍 Testing API Basketball...\n');
  console.log('API URL:', API_URL);
  console.log('API Key:', API_KEY ? '✅ Set' : '❌ Missing');
  console.log('\n---\n');

  // Test 1: Live games
  console.log('📊 Test 1: Live games (live=all)');
  try {
    const response = await fetch(`${API_URL}games?live=all`, {
      headers: {
        'x-rapidapi-key': API_KEY!,
        'x-rapidapi-host': 'v1.basketball.api-sports.io'
      }
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Results:', data.results);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error: any) {
    console.error('Error:', error.message);
  }

  console.log('\n---\n');

  // Test 2: Today's games (any league)
  console.log('📊 Test 2: Today\'s games (all leagues)');
  const today = new Date().toISOString().split('T')[0];
  try {
    const response = await fetch(`${API_URL}games?date=${today}`, {
      headers: {
        'x-rapidapi-key': API_KEY!,
        'x-rapidapi-host': 'v1.basketball.api-sports.io'
      }
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Date:', today);
    console.log('Results:', data.results);

    if (data.response && data.response.length > 0) {
      console.log('\n📋 Games found:');
      data.response.slice(0, 5).forEach((game: any) => {
        console.log(`  - ${game.teams.home.name} vs ${game.teams.away.name}`);
        console.log(`    League: ${game.league.name}`);
        console.log(`    Status: ${game.status.long} (${game.status.short})`);
        console.log(`    Score: ${game.scores.home.total || 0} - ${game.scores.away.total || 0}`);
        console.log('');
      });
    }
  } catch (error: any) {
    console.error('Error:', error.message);
  }

  console.log('\n---\n');

  // Test 3: NBA games specifically
  console.log('📊 Test 3: NBA games (league=12)');
  try {
    const response = await fetch(`${API_URL}games?date=${today}&league=12`, {
      headers: {
        'x-rapidapi-key': API_KEY!,
        'x-rapidapi-host': 'v1.basketball.api-sports.io'
      }
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Results:', data.results);

    if (data.response && data.response.length > 0) {
      console.log('\n🏀 NBA Games:');
      data.response.forEach((game: any) => {
        console.log(`  - ${game.teams.home.name} vs ${game.teams.away.name}`);
        console.log(`    Status: ${game.status.long} (${game.status.short})`);
        console.log(`    Time: ${new Date(game.date).toLocaleString()}`);
        console.log(`    Score: ${game.scores.home.total || 0} - ${game.scores.away.total || 0}`);
        console.log('');
      });
    }
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

testAPI();
