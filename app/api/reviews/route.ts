import { NextRequest } from 'next/server'
import { z } from 'zod'
import { getCityFromHeaders } from '@/lib/city'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { success, error } from '@/lib/api/response'
import {
  validateBody,
  validateParams,
  ValidationError,
} from '@/lib/api/validate'

const querySchema = z.object({
  place_id: z.string().uuid(),
  limit: z
    .string()
    .default('20')
    .transform(Number)
    .pipe(z.number().int().min(1).max(100)),
})

const createReviewSchema = z.object({
  place_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  content: z.string().optional(),
  visit_date: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const city = await getCityFromHeaders()
    const params = validateParams(request.nextUrl.searchParams, querySchema)
    const supabase = await createServerSupabaseClient(city)

    const { data, error: dbError } = await supabase
      .from('reviews')
      .select('*, profiles(display_name, avatar_url)')
      .eq('place_id', params.place_id)
      .eq('city_id', city)
      .order('created_at', { ascending: false })
      .limit(params.limit)

    if (dbError) {
      return error('DB_ERROR', dbError.message, 500)
    }

    return success(data ?? [])
  } catch (e) {
    if (e instanceof ValidationError) {
      return error(e.body.error.code, e.body.error.message, e.status)
    }
    return error('INTERNAL_ERROR', 'An unexpected error occurred', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const city = await getCityFromHeaders()
    const supabase = await createServerSupabaseClient(city)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return error('UNAUTHORIZED', 'Authentication required', 401)
    }

    const body = await validateBody(request, createReviewSchema)

    const { data, error: dbError } = await supabase
      .from('reviews')
      .insert({
        place_id: body.place_id,
        rating: body.rating,
        title: body.title,
        content: body.content,
        visit_date: body.visit_date,
        user_id: user.id,
        city_id: city,
      })
      .select()
      .single()

    if (dbError) {
      if (dbError.code === '23505') {
        return error(
          'DUPLICATE_REVIEW',
          'You have already reviewed this place',
          409
        )
      }
      return error('DB_ERROR', dbError.message, 500)
    }

    return success(data)
  } catch (e) {
    if (e instanceof ValidationError) {
      return error(e.body.error.code, e.body.error.message, e.status)
    }
    return error('INTERNAL_ERROR', 'An unexpected error occurred', 500)
  }
}
