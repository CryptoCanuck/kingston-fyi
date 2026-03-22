import { createServiceClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = createServiceClient()

  const [
    { count: placesCount },
    { count: reviewsCount },
    { count: claimsCount },
    { count: newsCount },
  ] = await Promise.all([
    supabase.from('places').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
    supabase.from('business_claims').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('news_articles').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Total Listings', value: placesCount ?? 0 },
    { label: 'Total Reviews', value: reviewsCount ?? 0 },
    { label: 'Pending Claims', value: claimsCount ?? 0 },
    { label: 'News Articles', value: newsCount ?? 0 },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
