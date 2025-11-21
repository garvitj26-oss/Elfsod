import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import https from 'https'

export async function createClient() {
  // Check environment variables first
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const missing = [];
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    throw new Error(`Supabase environment variables not configured. Missing: ${missing.join(', ')}. Please check your Netlify environment variables.`);
  }

  try {
    let cookieStore;
    try {
      cookieStore = await cookies();
    } catch (cookieError) {
      // In some serverless environments, cookies() might fail
      // We'll create a client without cookie support for read-only operations
      console.warn('⚠️ Could not access cookies, creating read-only Supabase client:', cookieError);
      
      // Create a minimal client for read operations
      return createServerClient(
        supabaseUrl,
        supabaseKey,
        {
          cookies: {
            getAll() {
              return [];
            },
            setAll() {
              // No-op for read-only operations
            },
          },
        }
      );
    }

    return createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );
  } catch (error) {
    console.error('Error creating Supabase server client:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to create Supabase client: ${errorMessage}`);
  }
}

