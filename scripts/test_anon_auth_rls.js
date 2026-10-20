const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yohzbxywumczegtifvfl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvaHpieHl3dW1jemVndGlmdmZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNzQ0NjAsImV4cCI6MjEwNjc1MDQ2MH0.RvX2c8C0iTolD9-QZ5QHjm8RP9--Z1zBxWFpYg1dkZ8';

async function testAnonymousAuth() {
  const clientA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const clientB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const resA = await clientA.auth.signInAnonymously();
  const resB = await clientB.auth.signInAnonymously();

  console.log('Anon Auth A:', resA.error ? resA.error.message : resA.data.user.id);
  console.log('Anon Auth B:', resB.error ? resB.error.message : resB.data.user.id);

  if (resA.data?.user && resB.data?.user) {
    const userA = resA.data.user;
    const userB = resB.data.user;
    console.log('User A ID:', userA.id);
    console.log('User B ID:', userB.id);

    // User A inserts transaction
    const { data: txA, error: errInsertA } = await clientA.from('transactions').insert([
      {
        user_id: userA.id,
        amount: 25000,
        category: 'an_uong',
        type: 'EXPENSE',
        source: 'MANUAL',
        description: 'User A Secret Lunch'
      }
    ]).select();

    console.log('User A insert result:', txA, errInsertA ? errInsertA.message : 'SUCCESS');

    // User B reads transactions
    const { data: txBRead, error: errBRead } = await clientB.from('transactions').select('*');
    console.log('User B visible transactions:', txBRead);
    const leaked = txBRead?.some(tx => tx.user_id === userA.id);
    console.log(`RLS Isolation: Did User B see User A tx? ${leaked ? 'YES (LEAK)' : 'NO (ISOLATED ✅)'}`);

    // User B tries to update User A tx
    if (txA && txA[0]) {
      const { data: updateRes, error: errUpdate } = await clientB.from('transactions')
        .update({ amount: 999999 })
        .eq('id', txA[0].id)
        .select();
      console.log('User B update attempt result (should affect 0 rows):', updateRes, errUpdate ? errUpdate.message : '');

      // User A cleans up
      await clientA.from('transactions').delete().eq('id', txA[0].id);
    }
  }
}

testAnonymousAuth().catch(console.error);
