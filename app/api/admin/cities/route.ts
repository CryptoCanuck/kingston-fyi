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

export async function GET() {
  const auth = await requireAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const serviceClient = createServiceClient()
  const { data: cities } = await serviceClient.from('cities').select('*').order('name')

  return NextResponse.json({ cities: cities ?? [] })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json()
  const { action } = body

  const serviceClient = createServiceClient()

  if (action === 'create') {
    const { id, name, province, timezone, config: cityConfig } = body
    const { data, error } = await serviceClient
      .from('cities')
      .insert({ id, name, province, country: 'CA', timezone, config: cityConfig || {} })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ city: data })
  }

  if (action === 'update') {
    const { id, ...updates } = body
    delete updates.action
    const { data, error } = await serviceClient
      .from('cities')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ city: data })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
