import { getCityFromHeaders } from '@/lib/city'
import { createServiceClient } from '@/lib/supabase/server'
import { success, error } from '@/lib/api/response'

export async function GET() {
  try {
    const city = await getCityFromHeaders()

    const supabase = createServiceClient()
    await supabase.rpc('set_city_context', { p_city_id: city })

    // Get place categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .eq('type', 'place')
      .order('sort_order', { ascending: true })

    if (catError) {
      return error('DB_ERROR', catError.message, 500)
    }

    // Get place counts per category for this city
    const { data: counts, error: countError } = await supabase
      .from('places')
      .select('category_id')
      .eq('city_id', city)
      .eq('is_active', true)

    if (countError) {
      return error('DB_ERROR', countError.message, 500)
    }

    // Aggregate counts
    const countMap: Record<string, number> = {}
    for (const row of counts ?? []) {
      countMap[row.category_id] = (countMap[row.category_id] || 0) + 1
    }

    const result = (categories ?? []).map((cat) => ({
      ...cat,
      place_count: countMap[cat.id] || 0,
    }))

    return success(result)
  } catch {
    return error('INTERNAL_ERROR', 'An unexpected error occurred', 500)
  }
}
