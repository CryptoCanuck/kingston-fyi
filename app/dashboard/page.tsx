import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Star, Clock, ArrowRight, AlertCircle } from 'lucide-react'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase/server'
import { formatRating } from '@/lib/utils'
import type { Place } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in?redirect=/dashboard')
  }

  const serviceClient = createServiceClient()

  const { data: places } = await serviceClient
    .from('places')
    .select('*')
    .eq('claimed_by', user.id)
    .order('name')

  const claimedPlaces = (places ?? []) as Place[]

  const { data: pendingClaims } = await serviceClient
    .from('business_claims')
    .select('*, places(name, city_id)')
    .eq('user_id', user.id)
    .eq('status', 'pending')

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--city-surface)]">
          <LayoutDashboard className="h-5 w-5 text-[var(--city-primary)]" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Business Dashboard</h1>
          <p className="text-gray-500">Manage your claimed businesses</p>
        </div>
      </div>

      {/* Pending Claims */}
      {pendingClaims && pendingClaims.length > 0 && (
        <div className="mb-8 card border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <h2 className="font-bold text-amber-800">Pending Claims</h2>
          </div>
          <div className="space-y-2">
            {pendingClaims.map((claim) => (
              <div key={claim.id} className="flex items-center justify-between text-sm">
                <span className="font-medium text-amber-900">{(claim.places as { name: string })?.name}</span>
                <span className="badge badge-warning">
                  {claim.verification_method} — pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Claimed Businesses */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">Your Businesses</h2>
      {claimedPlaces.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
            <LayoutDashboard className="h-7 w-7 text-gray-300" />
          </div>
          <p className="mt-4 text-gray-500">
            You haven&apos;t claimed any businesses yet.
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Find your business in the directory and click &quot;Claim This Business&quot;.
          </p>
          <Link href="/places" className="btn btn-primary mt-6">
            Browse Directory
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {claimedPlaces.map((place) => (
            <Link
              key={place.id}
              href={`/dashboard/${place.id}`}
              className="card group flex items-center justify-between p-5"
            >
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-[var(--city-primary)] transition-colors">
                  {place.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500 capitalize">
                  {place.city_id} — {place.category_id}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-gray-900">{formatRating(place.rating)}</span>
                  </div>
                  <p className="text-xs text-gray-400">{place.review_count} reviews</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-[var(--city-primary)] transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
