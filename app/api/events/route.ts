import { NextRequest } from 'next/server'
import { z } from 'zod'
import { getCityFromHeaders } from '@/lib/city'
import { createServiceClient } from '@/lib/supabase/server'
import { error, paginated } from '@/lib/api/response'
import { validateParams, ValidationError } from '@/lib/api/validate'

const querySchema = z.object({
  category: z.string().optional(),
  upcoming: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  featured: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  page: z
    .string()
    .default('1')
    .transform(Number)
    .pipe(z.number().int().positive()),
  pageSize: z
    .string()
    .default('20')
    .transform(Number)
    .pipe(z.number().int().min(1).max(100)),
})

export async function GET(request: NextRequest) {
  try {
    const city = await getCityFromHeaders()
    const params = validateParams(request.nextUrl.searchParams, querySchema)

    const supabase = createServiceClient()
    await supabase.rpc('set_city_context', { p_city_id: city })

    let query = supabase
      .from('events')
      .select('*', { count: 'exact' })
      .eq('city_id', city)
      .eq('is_active', true)
      .eq('status', 'published')

    if (params.category) {
      query = query.eq('category_id', params.category)
    }

    if (params.featured !== undefined) {
      query = query.eq('is_featured', params.featured)
    }

    if (params.upcoming) {
      query = query.gte('start_date', new Date().toISOString().split('T')[0])
    }

    query = query.order('start_date', { ascending: true })

    const from = (params.page - 1) * params.pageSize
    const to = from + params.pageSize - 1
    query = query.range(from, to)

    const { data, count, error: dbError } = await query

    if (dbError) {
      return error('DB_ERROR', dbError.message, 500)
    }

    return paginated(data ?? [], params.page, params.pageSize, count ?? 0)
  } catch (e) {
    if (e instanceof ValidationError) {
      return error(e.body.error.code, e.body.error.message, e.status)
    }
    return error('INTERNAL_ERROR', 'An unexpected error occurred', 500)
  }
}
