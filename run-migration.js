const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Get database connection string from environment
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL not found in environment variables');
  console.error('\nTo run this migration automatically, you need to add your database connection string to .env.local');
  console.error('\nYou can get your DATABASE_URL from:');
  console.error('  1. Go to your Supabase dashboard');
  console.error('  2. Navigate to Project Settings > Database');
  console.error('  3. Copy the "Connection string" (URI format)');
  console.error('  4. Add it to your .env.local file as: DATABASE_URL=your_connection_string');
  console.error('\nAlternatively, run the SQL manually in Supabase SQL Editor:');
  console.error('  File: supabase_add_new_columns.sql');
  process.exit(1);
}

async function runMigration() {
  const client = new Client({
    connectionString: DATABASE_URL,
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    console.log('Reading migration file...');
    const sqlPath = path.join(__dirname, 'supabase_add_new_columns.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing migration...');
    await client.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('The following columns have been added to match_profiles table:');
    console.log('  - work');
    console.log('  - case');
    console.log('  - region');
    console.log('  - district');
    console.log('  - salary');
    console.log('  - other_country');
    console.log('  - dowry');
    console.log('  - business');
    console.log('  - photo');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
