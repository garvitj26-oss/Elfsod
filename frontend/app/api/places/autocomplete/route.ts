import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');

  if (!query || query.length < 2) {
    return NextResponse.json(
      { error: 'Query must be at least 2 characters' },
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
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      query
    )}&types=(cities)&key=${GOOGLE_API_KEY}&components=country:in`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Places Autocomplete API request failed');
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in Places Autocomplete API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions', status: 'ERROR' },
      { status: 500 }
    );
  }
}

