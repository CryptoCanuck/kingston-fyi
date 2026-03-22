import { createServiceClient } from '@/lib/supabase/server'

export default async function AnalyticsPage() {
  const serviceClient = createServiceClient()

  // Get basic stats
  const [
    { count: totalViews },
    { count: totalSearches },
    { count: totalClicks },
  ] = await Promise.all([
    serviceClient.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'page_view'),
    serviceClient.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'search'),
    serviceClient.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'click'),
  ])

  // City breakdown
  const { data: cityStats } = await serviceClient
    .from('places')
    .select('city_id')

  const cityCounts: Record<string, number> = {}
  for (const row of cityStats ?? []) {
    cityCounts[row.city_id] = (cityCounts[row.city_id] || 0) + 1
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      {/* Event Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm font-medium text-gray-500">Page Views</p>
          <p className="mt-2 text-3xl font-bold">{totalViews ?? 0}</p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm font-medium text-gray-500">Searches</p>
          <p className="mt-2 text-3xl font-bold">{totalSearches ?? 0}</p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm font-medium text-gray-500">Clicks</p>
          <p className="mt-2 text-3xl font-bold">{totalClicks ?? 0}</p>
        </div>
      </div>

      {/* Listings by City */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800">Listings by City</h2>
        <div className="mt-4 rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Listings</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {Object.entries(cityCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([city, count]) => (
                  <tr key={city}>
                    <td className="px-4 py-3 font-medium capitalize">{city}</td>
                    <td className="px-4 py-3">{count}</td>
                  </tr>
                ))}
              {Object.keys(cityCounts).length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-center text-gray-500">No data yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
