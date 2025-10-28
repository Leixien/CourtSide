/**
 * Clean Database
 * Rimuove tutti i match finti e mantiene solo quelli dall'API
 */

import 'dotenv/config';
import connectDB from '../lib/mongodb';
import Match from '../models/Match';

async function cleanDatabase() {
  try {
    await connectDB();
    
    console.log('🧹 Cleaning database...\n');

    // Rimuovi match mock (quelli con externalId che inizia con 'mock-' o 'match-')
    const result = await Match.deleteMany({
      externalId: { $regex: /^(mock-|match-)/ }
    });

    console.log(`✅ Removed ${result.deletedCount} mock matches`);

    // Conta match rimanenti
    const remaining = await Match.countDocuments();
    console.log(`📊 Remaining matches: ${remaining}`);

    const nbaMatches = await Match.countDocuments({ league: 'NBA' });
    console.log(`🏀 NBA matches: ${nbaMatches}`);

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanDatabase();
