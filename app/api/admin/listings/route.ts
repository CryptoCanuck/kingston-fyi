import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', status: 401 }
  const serviceClient = createServiceClient()
  const { data: profile } = await serviceClient.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'moderator'].includes(profile.role)) return { error: 'Forbidden', status: 403 }
  return { user }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const serviceClient = createServiceClient()
  const { searchParams } = request.nextUrl
  const cityId = searchParams.get('city_id')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = 50

  let query = serviceClient
    .from('places')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (cityId) query = query.eq('city_id', cityId)
  if (search) query = query.ilike('name', `%${search}%`)

  const { data: places, count } = await query

  return NextResponse.json({
    places: places ?? [],
    total: count ?? 0,
    page,
    pageSize,
  })
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json()
  const { action, ids } = body

  if (!action || !ids || !Array.isArray(ids)) {
    return NextResponse.json({ error: 'action and ids required' }, { status: 400 })
  }

  const serviceClient = createServiceClient()

  switch (action) {
    case 'activate':
      await serviceClient.from('places').update({ is_active: true }).in('id', ids)
      break
    case 'deactivate':
      await serviceClient.from('places').update({ is_active: false }).in('id', ids)
      break
    case 'feature':
      await serviceClient.from('places').update({ is_featured: true }).in('id', ids)
      break
    case 'unfeature':
      await serviceClient.from('places').update({ is_featured: false }).in('id', ids)
      break
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }

  return NextResponse.json({ updated: ids.length })
}
