import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { success, error } from '@/lib/api/response'
import { validateBody, ValidationError } from '@/lib/api/validate'

const updateProfileSchema = z.object({
  display_name: z.string().optional(),
  bio: z.string().optional(),
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
      .from('profiles')
      .select('*')
      .eq('id', user.id)
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

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return error('UNAUTHORIZED', 'Authentication required', 401)
    }

    const body = await validateBody(request, updateProfileSchema)

    const { data, error: dbError } = await supabase
      .from('profiles')
      .update(body)
      .eq('id', user.id)
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
