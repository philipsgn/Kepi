const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yohzbxywumczegtifvfl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvaHpieHl3dW1jemVndGlmdmZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNzQ0NjAsImV4cCI6MjEwNjc1MDQ2MH0.RvX2c8C0iTolD9-QZ5QHjm8RP9--Z1zBxWFpYg1dkZ8';

async function testUserRLS() {
  console.log('=== TEST USER A VS USER B RLS ISOLATION ===');
  const clientA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const clientB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const timestamp = Date.now();
  const emailA = `test_a_${timestamp}@example.com`;
  const emailB = `test_b_${timestamp}@example.com`;
  const password = `TestPassword!${timestamp}123`;

  try {
    const { data: authA, error: errA } = await clientA.auth.signUp({
      email: emailA,
      password: password,
    });

    const { data: authB, error: errB } = await clientB.auth.signUp({
      email: emailB,
      password: password,
    });

    console.log('SignUp A result:', { hasUser: !!authA?.user, hasSession: !!authA?.session, error: errA?.message });
    console.log('SignUp B result:', { hasUser: !!authB?.user, hasSession: !!authB?.session, error: errB?.message });

    if (authA?.session && authB?.session) {
      console.log('Both sessions established! User A id:', authA.user.id, 'User B id:', authB.user.id);
      
      // User A creates profile and transaction
      await clientA.from('profiles').insert([{ id: authA.user.id, full_name: 'User A', email: emailA }]);
      const { data: txA, error: txAErr } = await clientA.from('transactions').insert([
        {
          user_id: authA.user.id,
          amount: 50000,
          category: 'an_uong',
          type: 'EXPENSE',
          source: 'MANUAL',
          description: 'Secret Transaction User A'
        }
      ]).select().single();
      console.log('User A inserted tx:', txA ? txA.id : null, txAErr?.message);

      // User B tries to SELECT User A's transaction
      const { data: bTxs, error: bErr } = await clientB.from('transactions').select('*');
      console.log('User B visible transactions count:', bTxs?.length);
      const canBSeeA = bTxs?.some(t => t.user_id === authA.user.id);
      console.log(`RLS Isolation Result: User B can see User A's data? ${canBSeeA ? 'LEAKED! ❌' : 'NO (ISOLATED) ✅'}`);

      // User B tries to UPDATE User A's transaction
      if (txA) {
        const { data: updateData, error: updateErr } = await clientB.from('transactions')
          .update({ amount: 999999 })
          .eq('id', txA.id)
          .select();
        console.log(`User B update attempt on User A tx: affected ${updateData?.length || 0} rows. ${updateErr ? updateErr.message : '0 rows modified (RLS Blocked)'}`);
      }

      // Cleanup
      if (txA) {
        await clientA.from('transactions').delete().eq('id', txA.id);
      }
    } else {
      console.log('Notice: Email confirmation might be required on this project or signUp did not return an immediate session.');
    }
  } catch (err) {
    console.log('Exception in user RLS test:', err.message);
  }
}

testUserRLS().catch(console.error);
