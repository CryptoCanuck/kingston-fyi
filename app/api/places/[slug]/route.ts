import { NextRequest } from 'next/server'
import { getCityFromHeaders } from '@/lib/city'
import { createServiceClient } from '@/lib/supabase/server'
import { success, error } from '@/lib/api/response'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const city = await getCityFromHeaders()
    const { slug } = await params

    const supabase = createServiceClient()
    await supabase.rpc('set_city_context', { p_city_id: city })

    const { data, error: dbError } = await supabase
      .from('places')
      .select('*')
      .eq('city_id', city)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (dbError || !data) {
      return error('NOT_FOUND', 'Place not found', 404)
    }

    return success(data)
  } catch {
    return error('INTERNAL_ERROR', 'An unexpected error occurred', 500)
  }
}
