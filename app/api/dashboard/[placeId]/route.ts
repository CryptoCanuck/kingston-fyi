import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase/server'
import { enqueueMeiliSync } from '@/lib/queues'

interface Props {
  params: Promise<{ placeId: string }>
}

async function getAuthUser() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET(request: NextRequest, { params }: Props) {
  const { placeId } = await params
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const serviceClient = createServiceClient()

  const section = request.nextUrl.searchParams.get('section')

  if (section === 'reviews') {
    const { data: reviews } = await serviceClient
      .from('reviews')
      .select('*')
      .eq('place_id', placeId)
      .order('created_at', { ascending: false })

    return NextResponse.json({ reviews: reviews ?? [] })
  }

  const { data: place } = await serviceClient
    .from('places')
    .select('*')
    .eq('id', placeId)
    .eq('claimed_by', user.id)
    .single()

  if (!place) {
    return NextResponse.json({ error: 'Not found or not authorized' }, { status: 404 })
  }

  return NextResponse.json({ place })
}

export async function PATCH(request: NextRequest, { params }: Props) {
  const { placeId } = await params
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const serviceClient = createServiceClient()

  // Verify ownership
  const { data: existing } = await serviceClient
    .from('places')
    .select('*')
    .eq('id', placeId)
    .eq('claimed_by', user.id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Not found or not authorized' }, { status: 404 })
  }

  const body = await request.json()
  const allowedFields = [
    'name', 'description', 'phone', 'email', 'website',
    'street_address', 'hours', 'price_range',
  ]

  const updates: Record<string, unknown> = {}
  const auditEntries: { field_changed: string; old_value: string | null; new_value: string | null }[] = []

  for (const field of allowedFields) {
    if (field in body && body[field] !== existing[field as keyof typeof existing]) {
      updates[field] = body[field]
      auditEntries.push({
        field_changed: field,
        old_value: String(existing[field as keyof typeof existing] ?? ''),
        new_value: String(body[field] ?? ''),
      })
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ place: existing })
  }

  // Update place
  const { data: place, error } = await serviceClient
    .from('places')
    .update(updates)
    .eq('id', placeId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Record audit trail
  for (const entry of auditEntries) {
    await serviceClient.from('business_updates').insert({
      place_id: placeId,
      user_id: user.id,
      ...entry,
    })
  }

  // Sync to Meilisearch
  await enqueueMeiliSync('upsert', 'places', {
    id: place.id,
    city_id: place.city_id,
    category_id: place.category_id,
    slug: place.slug,
    name: place.name,
    description: place.description,
    street_address: place.street_address,
    phone: place.phone,
    website: place.website,
    rating: place.rating,
    review_count: place.review_count,
    is_featured: place.is_featured,
    is_active: place.is_active,
  })

  return NextResponse.json({ place })
}
