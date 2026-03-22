'use client'

import { useState, useEffect } from 'react'
import type { NewsSource } from '@/lib/types'

const CITIES = ['kingston', 'ottawa', 'montreal', 'toronto', 'vancouver']

export default function NewsSourcesPage() {
  const [sources, setSources] = useState<NewsSource[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    city_id: CITIES[0],
    name: '',
    url: '',
    type: 'rss' as 'rss' | 'scrape',
  })

  async function fetchSources() {
    try {
      const res = await fetch('/api/admin/news')
      if (res.ok) {
        const data = await res.json()
        setSources(data.sources)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSources() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/admin/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...form }),
    })
    setShowForm(false)
    setForm({ city_id: CITIES[0], name: '', url: '', type: 'rss' })
    fetchSources()
  }

  async function toggleActive(source: NewsSource) {
    await fetch('/api/admin/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', id: source.id, is_active: !source.is_active }),
    })
    fetchSources()
  }

  async function deleteSource(id: string) {
    await fetch('/api/admin/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    })
    fetchSources()
  }

  async function triggerFetch(sourceId?: string) {
    await fetch('/api/admin/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'fetch', sourceId }),
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">News Sources</h1>
        <div className="flex gap-2">
          <button
            onClick={() => triggerFetch()}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200"
          >
            Fetch All
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-md bg-city-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Add Source
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mt-4 rounded-lg border bg-white p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <select
                value={form.city_id}
                onChange={(e) => setForm({ ...form, city_id: e.target.value })}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              >
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as 'rss' | 'scrape' })}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="rss">RSS Feed</option>
                <option value="scrape">Web Scrape</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">URL</label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-city-primary px-4 py-2 text-sm font-medium text-white"
          >
            Create
          </button>
        </form>
      )}

      {loading ? (
        <p className="mt-6 text-gray-500">Loading...</p>
      ) : (
        <div className="mt-6 rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Fetched</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sources.map((source) => (
                <tr key={source.id}>
                  <td className="px-4 py-3">{source.city_id}</td>
                  <td className="px-4 py-3 font-medium">{source.name}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs ${source.type === 'rss' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {source.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs ${source.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {source.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {source.error_count > 0 && (
                      <span className="ml-1 rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">
                        {source.error_count} errors
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {source.last_fetched_at
                      ? new Date(source.last_fetched_at).toLocaleString()
                      : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => triggerFetch(source.id)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Fetch
                      </button>
                      <button
                        onClick={() => toggleActive(source)}
                        className="text-xs text-gray-600 hover:underline"
                      >
                        {source.is_active ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => deleteSource(source.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sources.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    No news sources configured yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
