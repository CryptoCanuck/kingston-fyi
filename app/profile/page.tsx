import Link from 'next/link'
import { User, Mail, Shield, Clock, FileText, LayoutDashboard } from 'lucide-react'
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
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
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

  const isBusinessOwner = profile?.role === 'business_owner' || profile?.role === 'admin'

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Your Profile</h1>
        {isBusinessOwner && (
          <Link href="/dashboard" className="btn btn-primary">
            <LayoutDashboard className="h-4 w-4" />
            Business Dashboard
          </Link>
        )}
      </div>

      {/* Profile Info Card */}
      <section className="mt-8 card p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--city-surface)] text-[var(--city-primary)]">
            <User size={28} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">
                {profile?.display_name || user.email?.split('@')[0] || 'Anonymous'}
              </h2>
              <span className={`badge ${roleInfo.color}`}>
                <Shield size={12} />
                {roleInfo.label}
              </span>
            </div>
            <div className="mt-2 space-y-1 text-sm text-gray-500">
              <p className="flex items-center gap-1.5">
                <Mail size={14} className="text-gray-400" />
                {user.email}
              </p>
              <p className="flex items-center gap-1.5">
                <Clock size={14} className="text-gray-400" />
                Member since {memberSince}
              </p>
            </div>
            {profile?.bio && (
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
            )}
          </div>
        </div>
      </section>

      {/* Edit Profile Form */}
      <section className="mt-8">
        <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
        <div className="mt-4 card p-6">
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
        <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <FileText size={20} className="text-[var(--city-primary)]" />
          Your Submissions
        </h2>

        {userSubmissions.length === 0 ? (
          <div className="mt-4 card p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
              <FileText size={24} className="text-gray-300" />
            </div>
            <p className="mt-3 text-sm text-gray-500">
              You haven&apos;t submitted anything yet.
            </p>
            <Link href="/submit" className="btn btn-primary mt-4">
              Submit a place or event
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {userSubmissions.map((sub) => (
              <div key={sub.id} className="card flex items-center justify-between px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-900">
                    {(sub.data?.name as string) || (sub.data?.title as string) || 'Untitled'}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {sub.type === 'place' ? 'Place' : 'Event'} &middot;{' '}
                    {new Date(sub.created_at).toLocaleDateString('en-CA', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <span className={`badge capitalize ${STATUS_STYLES[sub.status] ?? 'bg-gray-100 text-gray-700'}`}>
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
