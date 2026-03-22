'use client'

import { useState, useEffect } from 'react'

interface Claim {
  id: string
  verification_method: string
  evidence_url: string | null
  status: string
  notes: string | null
  created_at: string
  profiles: { display_name: string | null } | null
  places: { name: string; city_id: string } | null
}

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/claims')
      .then(r => r.json())
      .then(d => setClaims(d.claims))
      .finally(() => setLoading(false))
  }, [])

  async function handleAction(claimId: string, action: 'approve' | 'reject') {
    await fetch('/api/admin/claims', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claimId, action }),
    })
    setClaims(claims.filter(c => c.id !== claimId))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Claims Review Queue</h1>
      {loading ? (
        <p className="mt-6 text-gray-500">Loading...</p>
      ) : claims.length === 0 ? (
        <p className="mt-6 text-gray-500">No pending claims.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {claims.map(claim => (
            <div key={claim.id} className="rounded-lg border bg-white p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{claim.places?.name}</p>
                  <p className="text-sm text-gray-500">
                    City: {claim.places?.city_id} | By: {claim.profiles?.display_name || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Method: {claim.verification_method} | Submitted: {new Date(claim.created_at).toLocaleDateString()}
                  </p>
                  {claim.evidence_url && (
                    <a href={claim.evidence_url} target="_blank" rel="noopener noreferrer" className="mt-1 text-xs text-blue-600 hover:underline">
                      View Evidence
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(claim.id, 'approve')}
                    className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(claim.id, 'reject')}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
