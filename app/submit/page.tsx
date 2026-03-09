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
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-city-primary/10 text-city-primary">
          <Send size={20} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Submit a Listing</h1>
          <p className="mt-1 text-sm text-gray-500">
            Help grow your community directory by submitting a place or event.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <SubmitForm
          userName={profile?.display_name ?? null}
        />
      </div>
    </>
  )
}
