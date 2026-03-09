import { NextRequest } from 'next/server'
import { z } from 'zod'
import { getCityFromHeaders } from '@/lib/city'
import { createServiceClient } from '@/lib/supabase/server'
import { success, error } from '@/lib/api/response'
import { validateParams, ValidationError } from '@/lib/api/validate'

const querySchema = z.object({
  q: z.string().min(2, 'Search query must be at least 2 characters'),
  type: z.enum(['all', 'places', 'events']).default('all'),
  limit: z
    .string()
    .default('10')
    .transform(Number)
    .pipe(z.number().int().min(1).max(50)),
})

export async function GET(request: NextRequest) {
  try {
    const city = await getCityFromHeaders()
    const params = validateParams(request.nextUrl.searchParams, querySchema)

    const supabase = createServiceClient()
    await supabase.rpc('set_city_context', { p_city_id: city })

    const results: { type: string; items: unknown[] }[] = []

    // Search places using the search_places RPC function
    if (params.type === 'all' || params.type === 'places') {
      const { data: places, error: placesError } = await supabase.rpc(
        'search_places',
        {
          p_city_id: city,
          p_query: params.q,
          p_limit: params.limit,
          p_offset: 0,
        }
      )

      if (placesError) {
        return error('DB_ERROR', placesError.message, 500)
      }

      results.push({ type: 'places', items: places ?? [] })
    }

    // Search events using ilike (parameterized by Supabase client)
    if (params.type === 'all' || params.type === 'events') {
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('city_id', city)
        .eq('is_active', true)
        .eq('status', 'published')
        .or(`title.ilike.%${params.q.replace(/[%_,.()"']/g, '')}%,description.ilike.%${params.q.replace(/[%_,.()"']/g, '')}%`)
        .order('start_date', { ascending: true })
        .limit(params.limit)

      if (eventsError) {
        return error('DB_ERROR', eventsError.message, 500)
      }

      results.push({ type: 'events', items: events ?? [] })
    }

    return success(results)
  } catch (e) {
    if (e instanceof ValidationError) {
      return error(e.body.error.code, e.body.error.message, e.status)
    }
    return error('INTERNAL_ERROR', 'An unexpected error occurred', 500)
  }
}
