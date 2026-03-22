import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase/server'
import type { Place } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in?redirect=/dashboard')
  }

  const serviceClient = createServiceClient()

  // Get places claimed by this user
  const { data: places } = await serviceClient
    .from('places')
    .select('*')
    .eq('claimed_by', user.id)
    .order('name')

  const claimedPlaces = (places ?? []) as Place[]

  // Get pending claims
  const { data: pendingClaims } = await serviceClient
    .from('business_claims')
    .select('*, places(name, city_id)')
    .eq('user_id', user.id)
    .eq('status', 'pending')

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Business Dashboard</h1>

      {/* Pending Claims */}
      {pendingClaims && pendingClaims.length > 0 && (
        <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <h2 className="font-semibold text-yellow-800">Pending Claims</h2>
          <div className="mt-2 space-y-2">
            {pendingClaims.map((claim) => (
              <div key={claim.id} className="flex items-center justify-between text-sm">
                <span>{(claim.places as { name: string })?.name}</span>
                <span className="rounded bg-yellow-200 px-2 py-0.5 text-xs text-yellow-800">
                  {claim.verification_method} — pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Claimed Businesses */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-800">Your Businesses</h2>
        {claimedPlaces.length === 0 ? (
          <p className="mt-4 text-gray-500">
            You haven&apos;t claimed any businesses yet. Find your business in the directory and click &quot;Claim This Business&quot;.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {claimedPlaces.map((place) => (
              <Link
                key={place.id}
                href={`/dashboard/${place.id}`}
                className="block rounded-lg border bg-white p-4 shadow-sm hover:border-city-primary hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{place.name}</h3>
                    <p className="text-sm text-gray-500">
                      {place.city_id} — {place.category_id}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">{place.rating}/5</p>
                    <p className="text-gray-500">{place.review_count} reviews</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
