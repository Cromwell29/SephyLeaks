// supabaseClient.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

export const supabase = createClient(
  'https://vdtirpnfinntbnevfrsl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkdGlycG5maW5udGJuZXZmcnNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MTQ5NTUsImV4cCI6MjA2MTQ5MDk1NX0.sCuAzhEs1IipJ9PZKJXhpBDGowAdYp5NoFI4Nsxjs7o'
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
);