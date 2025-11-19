import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Latitude and longitude are required' },
      { status: 400 }
    );
  }

  const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!GOOGLE_API_KEY) {
    return NextResponse.json(
      { error: 'Google Maps API key not configured' },
      { status: 500 }
    );
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}&result_type=locality|administrative_area_level_1`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Geocoding API request failed');
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in Geocoding API route:', error);
    return NextResponse.json(
      { error: 'Failed to geocode coordinates', status: 'ERROR' },
      { status: 500 }
    );
  }
}

