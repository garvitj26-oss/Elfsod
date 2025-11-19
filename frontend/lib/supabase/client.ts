import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase environment variables not configured!');
    throw new Error('Supabase environment variables are missing. Please check .env.local file.');
  }

  try {
    return createBrowserClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error);
    throw error;
  }
}

