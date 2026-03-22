import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase/server'
import { Queue } from 'bullmq'

const connection = {
  host: process.env.REDIS_HOST || 'redis',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
}

async function requireAdmin(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized', status: 401 }
  }

  const serviceClient = createServiceClient()
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Forbidden', status: 403 }
  }

  return { user, profile }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const body = await request.json()
  const { cityId, category } = body

  if (!cityId || !category) {
    return NextResponse.json(
      { error: 'cityId and category are required' },
      { status: 400 }
    )
  }

  const scrapingQueue = new Queue('scraping', { connection })
  await scrapingQueue.add(`manual-${cityId}-${category}`, {
    cityId,
    category,
    mode: 'full',
  })

  return NextResponse.json({
    message: `Scraping job queued for ${cityId}/${category}`,
  })
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  // Get recent job history from BullMQ
  const scrapingQueue = new Queue('scraping', { connection })
  const enrichmentQueue = new Queue('enrichment', { connection })

  const [completed, failed, active, waiting] = await Promise.all([
    scrapingQueue.getCompleted(0, 20),
    scrapingQueue.getFailed(0, 10),
    scrapingQueue.getActive(),
    scrapingQueue.getWaiting(),
  ])

  const [enrichCompleted, enrichFailed] = await Promise.all([
    enrichmentQueue.getCompleted(0, 20),
    enrichmentQueue.getFailed(0, 10),
  ])

  return NextResponse.json({
    scraping: {
      completed: completed.map((j) => ({
        id: j.id,
        name: j.name,
        data: j.data,
        result: j.returnvalue,
        finishedAt: j.finishedOn,
      })),
      failed: failed.map((j) => ({
        id: j.id,
        name: j.name,
        data: j.data,
        error: j.failedReason,
        failedAt: j.finishedOn,
      })),
      active: active.length,
      waiting: waiting.length,
    },
    enrichment: {
      completed: enrichCompleted.map((j) => ({
        id: j.id,
        data: j.data,
        result: j.returnvalue,
        finishedAt: j.finishedOn,
      })),
      failed: enrichFailed.map((j) => ({
        id: j.id,
        data: j.data,
        error: j.failedReason,
      })),
    },
  })
}
