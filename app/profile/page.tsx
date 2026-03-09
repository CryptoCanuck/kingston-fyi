import { User, Mail, Shield, Clock, FileText } from 'lucide-react'
import { requireAuth } from '@/lib/supabase/auth'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/profile/profile-form'
import type { Submission } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your Profile',
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  user: { label: 'Member', color: 'bg-gray-100 text-gray-700' },
  business_owner: { label: 'Business Owner', color: 'bg-blue-100 text-blue-700' },
  moderator: { label: 'Moderator', color: 'bg-purple-100 text-purple-700' },
  admin: { label: 'Admin', color: 'bg-red-100 text-red-700' },
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

export default async function ProfilePage() {
  const { user, profile } = await requireAuth()

  const supabase = await createServerSupabaseClient()
  const { data: submissions } = await supabase
    .from('submissions')
    .select('*')
    .eq('submitter_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const userSubmissions = (submissions ?? []) as Submission[]
  const roleInfo = ROLE_LABELS[profile?.role ?? 'user'] ?? ROLE_LABELS.user
  const memberSince = new Date(profile?.created_at ?? user.created_at ?? '').toLocaleDateString(
    'en-CA',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>

      {/* Profile Info Card */}
      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-city-primary/10 text-city-primary">
            <User size={28} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-900">
                {profile?.display_name || user.email?.split('@')[0] || 'Anonymous'}
              </h2>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${roleInfo.color}`}>
                <Shield size={12} />
                {roleInfo.label}
              </span>
            </div>
            <div className="mt-2 space-y-1 text-sm text-gray-500">
              <p className="flex items-center gap-1.5">
                <Mail size={14} />
                {user.email}
              </p>
              <p className="flex items-center gap-1.5">
                <Clock size={14} />
                Member since {memberSince}
              </p>
            </div>
            {profile?.bio && (
              <p className="mt-3 text-sm text-gray-600">{profile.bio}</p>
            )}
          </div>
        </div>
      </section>

      {/* Edit Profile Form */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {profile ? (
            <ProfileForm profile={profile} />
          ) : (
            <p className="text-sm text-gray-500">
              Your profile is still being set up. Please try refreshing the page.
            </p>
          )}
        </div>
      </section>

      {/* Submissions Section */}
      <section className="mt-8">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
          <FileText size={20} />
          Your Submissions
        </h2>

        {userSubmissions.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <FileText size={32} className="mx-auto text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              You haven&apos;t submitted anything yet.
            </p>
            <a
              href="/submit"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-city-primary hover:underline"
            >
              Submit a place or event
            </a>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {userSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900">
                    {(sub.data?.name as string) || (sub.data?.title as string) || 'Untitled'}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {sub.type === 'place' ? 'Place' : 'Event'} &middot;{' '}
                    {new Date(sub.created_at).toLocaleDateString('en-CA', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                    STATUS_STYLES[sub.status] ?? 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {sub.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
