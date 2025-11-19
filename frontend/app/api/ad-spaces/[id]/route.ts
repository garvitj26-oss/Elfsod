import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

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

/**
 * Update an ad space by ID
 * PUT /api/ad-spaces/:id
 * Body: Same as POST /api/ad-spaces
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check environment variables first
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase environment variables');
      return NextResponse.json({
        success: false,
        error: 'Database configuration error',
        message: 'Supabase environment variables are not configured.',
      }, { status: 500 });
    }

    let supabase;
    try {
      supabase = await createClient();
    } catch (clientError) {
      console.error('❌ Failed to create Supabase client:', clientError);
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to database',
        message: 'Please check your Supabase configuration.',
      }, { status: 500 });
    }

    // Check if ad space exists
    const { data: existingSpace, error: checkError } = await supabase
      .from('ad_spaces')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError || !existingSpace) {
      return NextResponse.json({
        success: false,
        error: 'Ad space not found',
        details: checkError?.message
      }, { status: 404 });
    }

    const body = await request.json();
    console.log('📝 Received ad space update request:', {
      id,
      title: body.title,
      categoryId: body.categoryId,
      locationId: body.locationId || 'not provided',
    });

    const {
      title,
      description,
      categoryId,
      locationId,
      publisherId,
      displayType,
      pricePerDay,
      pricePerMonth,
      dailyImpressions = 0,
      monthlyFootfall = 0,
      latitude,
      longitude,
      images = [],
      dimensions = {},
      availabilityStatus = 'available',
      targetAudience
    } = body;

    // Validation
    if (!title || !description) {
      return NextResponse.json({
        success: false,
        error: 'Title and description are required'
      }, { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json({
        success: false,
        error: 'Category ID is required'
      }, { status: 400 });
    }

    if (!displayType) {
      return NextResponse.json({
        success: false,
        error: 'Display type is required'
      }, { status: 400 });
    }

    if (pricePerDay === undefined || pricePerDay === null) {
      return NextResponse.json({
        success: false,
        error: 'Price per day is required'
      }, { status: 400 });
    }

    if (pricePerMonth === undefined || pricePerMonth === null) {
      return NextResponse.json({
        success: false,
        error: 'Price per month is required'
      }, { status: 400 });
    }

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Latitude and longitude are required'
      }, { status: 400 });
    }

    // Verify category exists
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('id', categoryId)
      .single();

    if (categoryError || !category) {
      console.error('❌ Category validation failed:', {
        categoryId,
        error: categoryError?.message,
      });
      return NextResponse.json({
        success: false,
        error: 'Invalid category ID',
        details: categoryError?.message || 'Category not found',
      }, { status: 400 });
    }

    // Prepare data for update
    const adSpaceData: any = {
      title: title.trim(),
      description: description.trim(),
      category_id: categoryId,
      display_type: displayType,
      price_per_day: parseFloat(pricePerDay),
      price_per_month: parseFloat(pricePerMonth),
      daily_impressions: parseInt(dailyImpressions) || 0,
      monthly_footfall: parseInt(monthlyFootfall) || 0,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      availability_status: availabilityStatus,
      images: Array.isArray(images) ? images : [],
      dimensions: typeof dimensions === 'object' ? dimensions : {},
      updated_at: new Date().toISOString(),
    };

    // Optional fields
    if (locationId) {
      adSpaceData.location_id = locationId;
      console.log('✅ Setting location_id:', locationId);
    } else {
      // If locationId is explicitly null/empty, set it to null
      adSpaceData.location_id = null;
      console.warn('⚠️ No locationId provided - setting location_id to null');
    }

    if (publisherId) {
      adSpaceData.publisher_id = publisherId;
      console.log('✅ Setting publisher_id:', publisherId);
    } else {
      // If publisherId is explicitly null/empty, set it to null
      adSpaceData.publisher_id = null;
    }

    if (targetAudience) {
      adSpaceData.target_audience = targetAudience;
    }

    // Update ad space
    const { data: updatedAdSpace, error: updateError } = await supabase
      .from('ad_spaces')
      .update(adSpaceData)
      .eq('id', id)
      .select(`
        *,
        category:categories(id, name, icon_url, description),
        location:locations(id, city, state, country, address, latitude, longitude),
        publisher:publishers(id, name, description, verification_status)
      `)
      .single();

    if (updateError) {
      console.error('❌ Error updating ad space:', {
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code,
      });
      return NextResponse.json({
        success: false,
        error: 'Failed to update ad space',
        details: updateError.message,
        hint: updateError.hint,
        code: updateError.code
      }, { status: 500 });
    }
    
    console.log('✅ Ad space updated successfully:', id);

    // Parse JSON fields
    let parsedImages = updatedAdSpace.images;
    if (typeof parsedImages === 'string') {
      try {
        parsedImages = JSON.parse(parsedImages);
      } catch {
        parsedImages = [];
      }
    }
    if (!Array.isArray(parsedImages)) {
      parsedImages = [];
    }

    let parsedDimensions = updatedAdSpace.dimensions;
    if (typeof parsedDimensions === 'string') {
      try {
        parsedDimensions = JSON.parse(parsedDimensions);
      } catch {
        parsedDimensions = {};
      }
    }
    if (!parsedDimensions || typeof parsedDimensions !== 'object') {
      parsedDimensions = {};
    }

    return NextResponse.json({
      success: true,
      data: {
        ...updatedAdSpace,
        images: parsedImages,
        dimensions: parsedDimensions
      },
      message: 'Ad space updated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

/**
 * Delete an ad space by ID
 * DELETE /api/ad-spaces/:id
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Use admin client for deletion to bypass RLS if service role key is available
    // Otherwise fall back to regular client (will work if RLS policies allow deletion)
    let supabase;
    try {
      supabase = await createAdminClient();
      console.log('✅ Using admin client for deletion (bypasses RLS)');
    } catch (clientError) {
      console.warn('⚠️ Admin client failed, trying regular client:', clientError);
      try {
        supabase = await createClient();
        console.log('✅ Using regular client for deletion (RLS policies will apply)');
      } catch (regularClientError) {
        console.error('❌ Failed to create Supabase client:', regularClientError);
        return NextResponse.json({
          success: false,
          error: 'Failed to connect to database',
          message: 'Please check your Supabase configuration.',
        }, { status: 500 });
      }
    }

    // Check if ad space exists first
    const { data: existingSpace, error: checkError } = await supabase
      .from('ad_spaces')
      .select('id, title')
      .eq('id', id)
      .single();

    if (checkError || !existingSpace) {
      return NextResponse.json({
        success: false,
        error: 'Ad space not found',
        details: checkError?.message
      }, { status: 404 });
    }

    // Check for related records that might prevent deletion
    // Note: cart_items and bookings have ON DELETE CASCADE, so they should auto-delete
    // But let's check if there are any active bookings first
    const { data: activeBookings, error: bookingCheckError } = await supabase
      .from('bookings')
      .select('id')
      .eq('ad_space_id', id)
      .in('status', ['pending', 'confirmed', 'active'])
      .limit(1);

    if (bookingCheckError) {
      console.warn('⚠️ Could not check bookings:', bookingCheckError.message);
    }

    if (activeBookings && activeBookings.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete ad space',
        details: 'This ad space has active or pending bookings. Please cancel or complete the bookings first.',
        code: 'HAS_ACTIVE_BOOKINGS'
      }, { status: 400 });
    }

    // Delete the ad space
    const { data: deletedData, error: deleteError } = await supabase
      .from('ad_spaces')
      .delete()
      .eq('id', id)
      .select('id');

    if (deleteError) {
      console.error('❌ Error deleting ad space:', {
        message: deleteError.message,
        details: deleteError.details,
        hint: deleteError.hint,
        code: deleteError.code
      });
      
      // Check if it's an RLS policy issue
      if (deleteError.code === '42501' || deleteError.message?.includes('permission denied') || deleteError.message?.includes('policy')) {
        return NextResponse.json({
          success: false,
          error: 'Permission denied',
          details: 'Row Level Security (RLS) policy is preventing deletion. Please check your Supabase RLS policies for the ad_spaces table.',
          code: 'RLS_POLICY_ERROR',
          hint: deleteError.hint
        }, { status: 403 });
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to delete ad space',
        details: deleteError.message,
        hint: deleteError.hint,
        code: deleteError.code
      }, { status: 500 });
    }

    // Verify deletion
    if (!deletedData || deletedData.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Ad space not found or already deleted',
        details: 'No rows were deleted. The ad space may not exist or may have already been deleted.'
      }, { status: 404 });
    }

    console.log('✅ Ad space deleted successfully:', id);
    return NextResponse.json({
      success: true,
      message: 'Ad space deleted successfully',
      deletedId: id
    }, { status: 200 });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

