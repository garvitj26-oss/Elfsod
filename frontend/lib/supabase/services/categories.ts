import { createClient } from '../client';

export interface Category {
  id: string;
  name: string;
  icon_url?: string;
  parent_category_id?: string;
  description?: string;
  created_at: string;
}

/**
 * Fetch all categories
 */
export async function getCategories(): Promise<Category[]> {
  const supabase = createClient();
  
  // Check if Supabase is configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ Supabase environment variables not configured!');
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ Supabase query error:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    return (data || []) as Category[];
  } catch (error) {
    console.error('❌ Error in getCategories:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    // Check if it's a network error
    if (error && typeof error === 'object' && 'message' in error && String(error.message).includes('Failed to fetch')) {
      console.error('🔴 Network Error: Cannot connect to Supabase');
      console.error('Please check your .env.local file has:');
      console.error('NEXT_PUBLIC_SUPABASE_URL=your-url');
      console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key');
    }
    return [];
  }
}

/**
 * Fetch a single category by ID
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching category:', error.message || String(error));
      return null;
    }

    return data as Category;
  } catch (error) {
    console.error('Error in getCategoryById:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

