'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function ClaimPage() {
  const params = useParams()
  const router = useRouter()
  const placeId = params.placeId as string

  const [step, setStep] = useState<'method' | 'verify' | 'document' | 'done'>('method')
  const [method, setMethod] = useState<'email' | 'phone' | 'document'>('email')
  const [claimId, setClaimId] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function startClaim() {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId, verificationMethod: method }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to start claim')
        return
      }

      setClaimId(data.claim.id)

      if (method === 'document') {
        setStep('document')
      } else {
        setStep('verify')
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function verifyCode() {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/claims', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId, code }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Verification failed')
        return
      }

      setStep('done')
      setTimeout(() => router.push('/dashboard'), 2000)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900">Claim This Business</h1>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {step === 'method' && (
        <div className="mt-6 space-y-4">
          <p className="text-gray-600">Select a verification method to prove you own this business.</p>

          <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:border-city-primary">
              <input
                type="radio"
                name="method"
                value="email"
                checked={method === 'email'}
                onChange={() => setMethod('email')}
                className="h-4 w-4"
              />
              <div>
                <p className="font-medium">Email Verification</p>
                <p className="text-sm text-gray-500">We&apos;ll send a code to an email on your business domain</p>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:border-city-primary">
              <input
                type="radio"
                name="method"
                value="phone"
                checked={method === 'phone'}
                onChange={() => setMethod('phone')}
                className="h-4 w-4"
              />
              <div>
                <p className="font-medium">Phone Verification</p>
                <p className="text-sm text-gray-500">We&apos;ll send a code to the phone number on the listing</p>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 hover:border-city-primary">
              <input
                type="radio"
                name="method"
                value="document"
                checked={method === 'document'}
                onChange={() => setMethod('document')}
                className="h-4 w-4"
              />
              <div>
                <p className="font-medium">Document Upload</p>
                <p className="text-sm text-gray-500">Upload a business license or official document for admin review</p>
              </div>
            </label>
          </div>

          <button
            onClick={startClaim}
            disabled={submitting}
            className="w-full rounded-md bg-city-primary py-3 font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Start Verification'}
          </button>
        </div>
      )}

      {step === 'verify' && (
        <div className="mt-6 space-y-4">
          <p className="text-gray-600">
            A verification code has been sent via {method}. Enter it below.
          </p>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
            className="w-full rounded-md border px-4 py-3 text-center text-2xl tracking-widest"
          />
          <button
            onClick={verifyCode}
            disabled={submitting || code.length !== 6}
            className="w-full rounded-md bg-city-primary py-3 font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? 'Verifying...' : 'Verify Code'}
          </button>
        </div>
      )}

      {step === 'document' && (
        <div className="mt-6 space-y-4">
          <p className="text-gray-600">
            Your claim has been submitted for admin review. Upload supporting documents to speed up the process.
          </p>
          <p className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
            Document upload functionality will be connected to Supabase Storage. For now, your claim is in the admin review queue.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full rounded-md bg-gray-100 py-3 font-medium text-gray-700 hover:bg-gray-200"
          >
            Go to Dashboard
          </button>
        </div>
      )}

      {step === 'done' && (
        <div className="mt-6 text-center">
          <div className="text-4xl">✓</div>
          <h2 className="mt-2 text-xl font-bold text-green-700">Verified!</h2>
          <p className="mt-1 text-gray-600">Redirecting to your dashboard...</p>
        </div>
      )}
    </div>
  )
}
