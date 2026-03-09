import { NextRequest } from 'next/server'
import { z } from 'zod'
import { getCityFromHeaders } from '@/lib/city'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { success, error } from '@/lib/api/response'
import { validateBody, ValidationError } from '@/lib/api/validate'

const createSubmissionSchema = z.object({
  type: z.enum(['place', 'event']),
  data: z.record(z.string(), z.unknown()),
  submitter_name: z.string().optional(),
})

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return error('UNAUTHORIZED', 'Authentication required', 401)
    }

    const { data, error: dbError } = await supabase
      .from('submissions')
      .select('*')
      .eq('submitter_id', user.id)
      .order('created_at', { ascending: false })

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

    const body = await validateBody(request, createSubmissionSchema)

    const { data, error: dbError } = await supabase
      .from('submissions')
      .insert({
        type: body.type,
        data: body.data,
        submitter_name: body.submitter_name,
        submitter_id: user.id,
        city_id: city,
        status: 'pending',
      })
      .select()
      .single()

    if (dbError) {
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
