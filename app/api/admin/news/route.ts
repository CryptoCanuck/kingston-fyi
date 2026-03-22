import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase/server'
import { Queue } from 'bullmq'

const connection = {
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
}

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

  if (!profile || profile.role !== 'admin') return { error: 'Forbidden', status: 403 }
  return { user }
}

export async function GET() {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const serviceClient = createServiceClient()
  const { data: sources } = await serviceClient
    .from('news_sources')
    .select('*')
    .order('city_id')
    .order('name')

  return NextResponse.json({ sources: sources ?? [] })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const body = await request.json()
  const { action } = body

  if (action === 'create') {
    const { city_id, name, url, type, scrape_config } = body
    if (!city_id || !name || !url || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const serviceClient = createServiceClient()
    const { data, error } = await serviceClient
      .from('news_sources')
      .insert({ city_id, name, url, type, scrape_config: scrape_config || {} })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ source: data })
  }

  if (action === 'update') {
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const serviceClient = createServiceClient()
    const { data, error } = await serviceClient
      .from('news_sources')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ source: data })
  }

  if (action === 'delete') {
    const { id } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const serviceClient = createServiceClient()
    const { error } = await serviceClient.from('news_sources').delete().eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ deleted: true })
  }

  if (action === 'fetch') {
    const { sourceId } = body
    const newsQueue = new Queue('news-ingest', { connection })
    await newsQueue.add('manual-fetch', {
      mode: sourceId ? 'single' : 'all',
      sourceId,
    })
    return NextResponse.json({ message: 'Fetch job queued' })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
