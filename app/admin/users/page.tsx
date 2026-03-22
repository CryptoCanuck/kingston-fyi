'use client'

import { useState, useEffect } from 'react'
import type { Profile } from '@/lib/types'

const ROLES = ['user', 'business_owner', 'moderator', 'admin']

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(d => setUsers(d.users))
      .finally(() => setLoading(false))
  }, [])

  async function changeRole(userId: string, role: string) {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    })
    setUsers(users.map(u => u.id === userId ? { ...u, role: role as Profile['role'] } : u))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
      {loading ? (
        <p className="mt-6 text-gray-500">Loading...</p>
      ) : (
        <div className="mt-6 rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-4 py-3 font-medium">{user.display_name || 'Anonymous'}</td>
                  <td className="px-4 py-3 text-gray-500">{user.city_id || '-'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => changeRole(user.id, e.target.value)}
                      className="rounded border px-2 py-1 text-xs"
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
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
