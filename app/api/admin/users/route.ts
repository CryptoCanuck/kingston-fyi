import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', status: 401 }
  const serviceClient = createServiceClient()
  const { data: profile } = await serviceClient.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') return { error: 'Forbidden', status: 403 }
  return { user }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const serviceClient = createServiceClient()
  const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10)
  const pageSize = 50

  const { data: users, count } = await serviceClient
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  return NextResponse.json({ users: users ?? [], total: count ?? 0 })
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json()
  const { userId, role } = body

  if (!userId || !role) return NextResponse.json({ error: 'userId and role required' }, { status: 400 })

  const validRoles = ['user', 'business_owner', 'moderator', 'admin']
  if (!validRoles.includes(role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 })

  const serviceClient = createServiceClient()
  const { error } = await serviceClient.from('profiles').update({ role }).eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ updated: true })
}
