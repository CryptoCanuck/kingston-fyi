import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase/server'
import { enqueueNotification } from '@/lib/queues'

interface Props {
  params: Promise<{ reviewId: string }>
}

export async function POST(request: NextRequest, { params }: Props) {
  const { reviewId } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { content } = body

  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: 'Response content required' }, { status: 400 })
  }

  const serviceClient = createServiceClient()

  // Verify user owns the business this review is for
  const { data: review } = await serviceClient
    .from('reviews')
    .select('*, places!inner(claimed_by)')
    .eq('id', reviewId)
    .single()

  if (!review) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 })
  }

  const place = review.places as { claimed_by: string | null }
  if (place.claimed_by !== user.id) {
    return NextResponse.json({ error: 'Not authorized to respond to this review' }, { status: 403 })
  }

  // Insert response
  const { data: response, error } = await serviceClient
    .from('review_responses')
    .insert({
      review_id: reviewId,
      user_id: user.id,
      content: content.trim(),
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'You already responded to this review' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Notify reviewer
  await enqueueNotification(
    review.user_id,
    'system',
    'Business owner responded to your review',
    content.substring(0, 100),
    { reviewId, placeId: review.place_id }
  )

  return NextResponse.json({ response })
}
