'use client'

import { useState, useEffect } from 'react'
import type { Place } from '@/lib/types'

const CITIES = ['', 'kingston', 'ottawa', 'montreal', 'toronto', 'vancouver']

export default function ListingsPage() {
  const [places, setPlaces] = useState<Place[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  async function fetchListings() {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (cityFilter) params.set('city_id', cityFilter)
    if (search) params.set('search', search)

    const res = await fetch(`/api/admin/listings?${params}`)
    if (res.ok) {
      const data = await res.json()
      setPlaces(data.places)
      setTotal(data.total)
    }
    setLoading(false)
  }

  useEffect(() => { fetchListings() }, [page, cityFilter])

  async function bulkAction(action: string) {
    if (selected.size === 0) return
    await fetch('/api/admin/listings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ids: Array.from(selected) }),
    })
    setSelected(new Set())
    fetchListings()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Listing Management</h1>
      <p className="mt-1 text-sm text-gray-500">{total} total listings</p>

      {/* Filters */}
      <div className="mt-4 flex gap-3">
        <select
          value={cityFilter}
          onChange={(e) => { setCityFilter(e.target.value); setPage(1) }}
          className="rounded-md border px-3 py-2 text-sm"
        >
          <option value="">All Cities</option>
          {CITIES.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchListings()}
          placeholder="Search by name..."
          className="flex-1 rounded-md border px-3 py-2 text-sm"
        />
        <button onClick={fetchListings} className="rounded-md bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200">
          Search
        </button>
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="text-gray-600">{selected.size} selected</span>
          <button onClick={() => bulkAction('activate')} className="rounded bg-green-100 px-3 py-1 text-green-700 hover:bg-green-200">Activate</button>
          <button onClick={() => bulkAction('deactivate')} className="rounded bg-red-100 px-3 py-1 text-red-700 hover:bg-red-200">Deactivate</button>
          <button onClick={() => bulkAction('feature')} className="rounded bg-blue-100 px-3 py-1 text-blue-700 hover:bg-blue-200">Feature</button>
        </div>
      )}

      {/* Table */}
      <div className="mt-4 rounded-lg border bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="px-3 py-3 w-8">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) setSelected(new Set(places.map(p => p.id)))
                    else setSelected(new Set())
                  }}
                />
              </th>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">City</th>
              <th className="px-3 py-3">Category</th>
              <th className="px-3 py-3">Rating</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Claimed</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={7} className="px-3 py-6 text-center text-gray-500">Loading...</td></tr>
            ) : places.map(place => (
              <tr key={place.id}>
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(place.id)}
                    onChange={(e) => {
                      const next = new Set(selected)
                      if (e.target.checked) next.add(place.id); else next.delete(place.id)
                      setSelected(next)
                    }}
                  />
                </td>
                <td className="px-3 py-3 font-medium">{place.name}</td>
                <td className="px-3 py-3">{place.city_id}</td>
                <td className="px-3 py-3">{place.category_id}</td>
                <td className="px-3 py-3">{place.rating}/5 ({place.review_count})</td>
                <td className="px-3 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs ${place.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {place.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-3 py-3 text-xs text-gray-500">{place.claim_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-center gap-2">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="rounded border px-3 py-1 text-sm disabled:opacity-50">Prev</button>
        <span className="px-3 py-1 text-sm text-gray-600">Page {page}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={places.length < 50} className="rounded border px-3 py-1 text-sm disabled:opacity-50">Next</button>
      </div>
    </div>
  )
}
