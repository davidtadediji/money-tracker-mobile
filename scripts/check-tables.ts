/**
 * Script to check if Supabase tables exist
 * Run with: npx ts-node scripts/check-tables.ts
 */

import { supabase } from '../lib/supabase';

async function checkTables() {
  console.log('🔍 Checking Supabase tables...\n');

  const tables = [
    'budgets',
    'transactions', 
    'assets',
    'liabilities',
    'balance_snapshots'
  ];

  for (const table of tables) {
    try {
      // Try to query the table
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table}: DOES NOT EXIST`);
        console.log(`   Error: ${error.message}\n`);
      } else {
        console.log(`✅ ${table}: EXISTS (${count || 0} rows)\n`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ERROR`);
      console.log(`   ${err}\n`);
    }
  }

  console.log('✨ Check complete!');
  process.exit(0);
}

checkTables();

