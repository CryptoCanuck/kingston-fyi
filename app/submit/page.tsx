import { Send } from 'lucide-react'
import { requireAuth } from '@/lib/supabase/auth'
import { SubmitForm } from '@/components/submit/submit-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Submit a Listing',
}

export default async function SubmitPage() {
  const { profile } = await requireAuth()

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--city-surface)]">
          <Send size={20} className="text-[var(--city-primary)]" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Submit a Listing</h1>
          <p className="mt-1 text-sm text-gray-500">
            Help grow your community directory by submitting a place or event.
          </p>
        </div>
      </div>

      <div className="mt-8 card p-6">
        <SubmitForm
          userName={profile?.display_name ?? null}
        />
      </div>
    </>
  )
}
