import { NextRequest, NextResponse } from 'next/server'
import { getCityFromHeaders } from '@/lib/city'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const city = await getCityFromHeaders()
    const body = await request.json()
    const { event_type, place_id, search_query, metadata, session_id } = body

    const validTypes = ['page_view', 'search', 'click', 'listing_view', 'review_submit']
    if (!event_type || !validTypes.includes(event_type)) {
      return NextResponse.json({ error: 'Invalid event_type' }, { status: 400 })
    }

    const serviceClient = createServiceClient()
    await serviceClient.from('analytics_events').insert({
      city_id: city,
      event_type,
      place_id: place_id || null,
      search_query: search_query || null,
      metadata: metadata || {},
      session_id: session_id || null,
    })

    return NextResponse.json({ tracked: true })
  } catch {
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
  }
}
