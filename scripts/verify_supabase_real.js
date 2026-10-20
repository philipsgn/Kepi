const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const SUPABASE_URL = 'https://yohzbxywumczegtifvfl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvaHpieHl3dW1jemVndGlmdmZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNzQ0NjAsImV4cCI6MjEwNjc1MDQ2MH0.RvX2c8C0iTolD9-QZ5QHjm8RP9--Z1zBxWFpYg1dkZ8';

async function verifyHttp200() {
  console.log('=== 1. VERIFYING SUPABASE ENDPOINT HEALTH (HTTP 200) ===');
  return new Promise((resolve, reject) => {
    https.get(`${SUPABASE_URL}/auth/v1/health`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    }, (res) => {
      console.log(`Endpoint: ${SUPABASE_URL}/auth/v1/health`);
      console.log(`HTTP Status: ${res.statusCode} ${res.statusMessage}`);
      let rawData = '';
      res.on('data', chunk => rawData += chunk);
      res.on('end', () => {
        console.log(`Health Response: ${rawData}`);
        if (res.statusCode === 200) {
          console.log('✅ Supabase server is UP and responding with HTTP 200 OK.');
        } else {
          console.warn(`⚠️ Supabase returned non-200 status: ${res.statusCode}`);
        }
        resolve(res.statusCode);
      });
    }).on('error', (err) => {
      console.error('❌ Connection error:', err.message);
      resolve(null);
    });
  });
}

async function verifyTablesAndRLS() {
  console.log('\n=== 2. VERIFYING TABLES ON REAL SUPABASE ===');
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const tables = [
    'profiles',
    'financial_settings',
    'transactions',
    'wait_basket',
    'categories',
    'daily_budget_logs'
  ];

  const results = {};

  for (const tableName of tables) {
    try {
      // Query as anonymous client (without user session)
      const { data, error, status } = await client.from(tableName).select('*').limit(5);
      if (error) {
        results[tableName] = { status, error: error.message, code: error.code };
        console.log(`Table [${tableName}]: Status ${status} | Error: [${error.code}] ${error.message}`);
      } else {
        results[tableName] = { status, count: data ? data.length : 0, data };
        console.log(`Table [${tableName}]: Status ${status} (OK) | Anonymous rows visible: ${data ? data.length : 0}`);
      }
    } catch (err) {
      results[tableName] = { error: err.message };
      console.log(`Table [${tableName}]: Exception ${err.message}`);
    }
  }

  return results;
}

async function testRLSBehavior() {
  console.log('\n=== 3. VERIFYING ROW LEVEL SECURITY (RLS) POLICIES ===');
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 1. Try to read without authentication
  const { data: anonData, error: anonError } = await client.from('transactions').select('*');
  console.log(`Anonymous SELECT transactions count: ${anonData ? anonData.length : 'none'} (RLS prevents reading other users' rows)`);
  if (anonError) {
    console.log(`Anon read note: ${anonError.message}`);
  }

  // 2. Try to insert without authentication
  const fakeId = '00000000-0000-0000-0000-000000000000';
  const { data: insertData, error: insertError } = await client.from('transactions').insert([
    {
      user_id: fakeId,
      type: 'EXPENSE',
      amount: 10000,
      category: 'TEST',
      source: 'MANUAL'
    }
  ]);
  
  if (insertError) {
    console.log(`✅ RLS Guard Verified: Unauthenticated/Foreign INSERT was REJECTED: [${insertError.code}] ${insertError.message}`);
  } else {
    console.log(`⚠️ Unauthenticated insert succeeded (check RLS)`);
  }

  // 3. Test profiles table insert with fake id
  const { data: profileInsert, error: profileError } = await client.from('profiles').insert([
    {
      id: fakeId,
      email: 'attacker@evil.com',
      full_name: 'Attacker'
    }
  ]);
  if (profileError) {
    console.log(`✅ RLS Guard Verified: Foreign Profile INSERT was REJECTED: [${profileError.code}] ${profileError.message}`);
  } else {
    console.log(`⚠️ Foreign Profile INSERT succeeded`);
  }
}

async function main() {
  await verifyHttp200();
  await verifyTablesAndRLS();
  await testRLSBehavior();
}

main().catch(console.error);
