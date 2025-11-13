import { Database } from '@/types/database';
import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and Anon Key from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️  Supabase URL or Anon Key is missing.\n' +
    '📝 Please create a .env file in the project root with:\n' +
    '   EXPO_PUBLIC_SUPABASE_URL=your-supabase-url\n' +
    '   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n' +
    '📖 See SETUP_INSTRUCTIONS.md for detailed steps.'
  );
}

// Create a single Supabase client for interacting with your database
// Note: If credentials are missing, this will throw an error
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      // Enable auto refresh token
      autoRefreshToken: true,
      // Persist session in async storage
      persistSession: true,
      // Detect session from URL
      detectSessionInUrl: false,
    },
  }
);
