import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', status: 401 }

  const serviceClient = createServiceClient()
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'moderator'].includes(profile.role)) {
    return { error: 'Forbidden', status: 403 }
  }
  return { user }
}

export async function GET() {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const serviceClient = createServiceClient()

  const { data: flagged } = await serviceClient
    .from('reviews')
    .select('*, profiles(display_name), places(name, city_id)')
    .in('moderation_status', ['pending', 'flagged'])
    .order('created_at', { ascending: false })
    .limit(50)

  const { count: totalReviews } = await serviceClient
    .from('reviews')
    .select('*', { count: 'exact', head: true })

  const { count: approvedCount } = await serviceClient
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('moderation_status', 'approved')

  const { count: flaggedCount } = await serviceClient
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .in('moderation_status', ['pending', 'flagged'])

  return NextResponse.json({
    reviews: flagged ?? [],
    stats: {
      total: totalReviews ?? 0,
      approved: approvedCount ?? 0,
      pending: flaggedCount ?? 0,
    },
  })
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const body = await request.json()
  const { reviewId, action } = body

  if (!reviewId || !action) {
    return NextResponse.json({ error: 'reviewId and action required' }, { status: 400 })
  }

  const serviceClient = createServiceClient()

  const statusMap: Record<string, string> = {
    approve: 'approved',
    reject: 'rejected',
    flag: 'flagged',
  }

  const newStatus = statusMap[action]
  if (!newStatus) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const { error } = await serviceClient
    .from('reviews')
    .update({ moderation_status: newStatus })
    .eq('id', reviewId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ updated: true, status: newStatus })
}
