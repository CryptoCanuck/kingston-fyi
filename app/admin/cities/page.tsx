'use client'

import { useState, useEffect } from 'react'
import type { City } from '@/lib/types'

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/cities')
      .then(r => r.json())
      .then(d => setCities(d.cities))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">City Management</h1>
      {loading ? (
        <p className="mt-6 text-gray-500">Loading...</p>
      ) : (
        <div className="mt-6 rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Province</th>
                <th className="px-4 py-3">Timezone</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {cities.map(city => (
                <tr key={city.id}>
                  <td className="px-4 py-3 font-mono text-xs">{city.id}</td>
                  <td className="px-4 py-3 font-medium">{city.name}</td>
                  <td className="px-4 py-3">{city.province}</td>
                  <td className="px-4 py-3 text-gray-500">{city.timezone}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs ${city.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {city.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
