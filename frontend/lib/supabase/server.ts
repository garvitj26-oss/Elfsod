import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import https from 'https'

export async function createClient() {
  // Check environment variables first
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables not configured. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  }

  try {
    const cookieStore = await cookies();

    // Create a custom fetch that handles SSL properly
    // The Supabase client will use this for all requests
    const customFetch = (url: string, options: RequestInit = {}) => {
      // For Node.js environments, we need to ensure SSL certificates are verified
      // The @supabase/ssr client should handle this, but we can add extra configuration
      return fetch(url, {
        ...options,
        // Node.js fetch (18+) should handle SSL automatically
        // If issues persist, we can add agent configuration here
      });
    };

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
        // Note: @supabase/ssr handles fetch internally, but we can configure it
        // if needed. The SSL issue is typically resolved by ensuring Node.js
        // has access to system certificates.
      }
    );
  } catch (error) {
    console.error('Error creating Supabase server client:', error);
    throw error;
  }
}

/**
 * Create a Supabase client with service role key (bypasses RLS)
 * Use this for admin operations that need to bypass Row Level Security
 * 
 * IMPORTANT: Only use this in server-side API routes, never expose the service role key to the client
 */
export async function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured');
  }

  if (!serviceRoleKey) {
    console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY not found. Falling back to anon key. Admin operations may fail if RLS policies are restrictive.');
    // Fall back to regular client if service role key is not available
    return createClient();
  }

  // Create a client with service role key (bypasses RLS)
  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

