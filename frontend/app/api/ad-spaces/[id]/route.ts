import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Next.js API route to fetch a single ad space by ID
 * GET /api/ad-spaces/:id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    let supabase;
    try {
      supabase = await createClient();
    } catch (clientError) {
      console.error('❌ Failed to create Supabase client:', clientError);
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to database',
        message: 'Please check your Supabase configuration.',
        fallback: true
      }, { status: 500 });
    }

    let data, error;
    try {
      const result = await supabase
        .from('ad_spaces')
        .select(`
          *,
          category:categories(id, name, icon_url, description),
          location:locations(id, city, state, country, address, latitude, longitude),
          publisher:publishers(id, name, description, verification_status)
        `)
        .eq('id', id)
        .single();
      data = result.data;
      error = result.error;
    } catch (fetchError) {
      console.error('❌ Supabase fetch error:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch ad space',
        message: fetchError instanceof Error ? fetchError.message : String(fetchError),
        fallback: true
      }, { status: 500 });
    }

    if (error) {
      console.error('❌ Supabase query error:', error);
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        details: error.message
      }, { status: 404 });
    }

    if (!data) {
      return NextResponse.json({
        success: false,
        error: 'Ad space not found'
      }, { status: 404 });
    }

    // Parse JSON fields
    let images = data.images;
    if (typeof images === 'string') {
      try {
        images = JSON.parse(images);
      } catch {
        images = [];
      }
    }
    if (!Array.isArray(images)) {
      images = [];
    }

    let dimensions = data.dimensions;
    if (typeof dimensions === 'string') {
      try {
        dimensions = JSON.parse(dimensions);
      } catch {
        dimensions = {};
      }
    }
    if (!dimensions || typeof dimensions !== 'object') {
      dimensions = {};
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        images,
        dimensions,
        route: data.route || null,
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

