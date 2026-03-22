'use client'

import { useState, useEffect } from 'react'

const CITIES = ['kingston', 'ottawa', 'montreal', 'toronto', 'vancouver']
const CATEGORIES = [
  'restaurant', 'bar', 'nightclub', 'cafe', 'bakery',
  'shopping', 'attraction', 'activity', 'service',
]

interface JobInfo {
  id: string
  name: string
  data: { cityId: string; category: string }
  result?: { found?: number; errors?: number; inserted?: number; duplicates?: number }
  error?: string
  finishedAt?: number
  failedAt?: number
}

interface ScrapingStatus {
  scraping: {
    completed: JobInfo[]
    failed: JobInfo[]
    active: number
    waiting: number
  }
  enrichment: {
    completed: JobInfo[]
    failed: JobInfo[]
  }
}

export default function ScrapingPage() {
  const [status, setStatus] = useState<ScrapingStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [triggerCity, setTriggerCity] = useState(CITIES[0])
  const [triggerCategory, setTriggerCategory] = useState(CATEGORIES[0])
  const [triggering, setTriggering] = useState(false)

  async function fetchStatus() {
    try {
      const res = await fetch('/api/admin/scraping')
      if (res.ok) {
        setStatus(await res.json())
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 10000)
    return () => clearInterval(interval)
  }, [])

  async function triggerScrape() {
    setTriggering(true)
    try {
      await fetch('/api/admin/scraping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cityId: triggerCity, category: triggerCategory }),
      })
      setTimeout(fetchStatus, 2000)
    } finally {
      setTriggering(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Scraping Pipeline</h1>

      {/* Trigger Section */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-800">Manual Trigger</h2>
        <div className="mt-4 flex items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <select
              value={triggerCity}
              onChange={(e) => setTriggerCity(e.target.value)}
              className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={triggerCategory}
              onChange={(e) => setTriggerCategory(e.target.value)}
              className="mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <button
            onClick={triggerScrape}
            disabled={triggering}
            className="rounded-md bg-city-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {triggering ? 'Triggering...' : 'Start Scrape'}
          </button>
        </div>
      </div>

      {/* Status Section */}
      {loading ? (
        <p className="mt-6 text-gray-500">Loading status...</p>
      ) : status ? (
        <div className="mt-6 space-y-6">
          {/* Queue Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border bg-white p-4">
              <p className="text-sm text-gray-500">Active Jobs</p>
              <p className="text-2xl font-bold">{status.scraping.active}</p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <p className="text-sm text-gray-500">Waiting</p>
              <p className="text-2xl font-bold">{status.scraping.waiting}</p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold">{status.scraping.completed.length}</p>
            </div>
            <div className="rounded-lg border bg-white p-4">
              <p className="text-sm text-gray-500">Failed</p>
              <p className="text-2xl font-bold text-red-600">{status.scraping.failed.length}</p>
            </div>
          </div>

          {/* Recent Completed Jobs */}
          <div className="rounded-lg border bg-white">
            <div className="border-b px-4 py-3">
              <h3 className="font-semibold text-gray-800">Recent Completed Scrapes</h3>
            </div>
            <div className="divide-y">
              {status.scraping.completed.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-500">No completed jobs yet</p>
              ) : (
                status.scraping.completed.map((job) => (
                  <div key={job.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <div>
                      <span className="font-medium">{job.data?.cityId}/{job.data?.category}</span>
                    </div>
                    <div className="text-gray-500">
                      Found: {job.result?.found ?? 'N/A'} | Errors: {job.result?.errors ?? 0}
                    </div>
                    <div className="text-xs text-gray-400">
                      {job.finishedAt ? new Date(job.finishedAt).toLocaleString() : ''}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Enrichment Results */}
          <div className="rounded-lg border bg-white">
            <div className="border-b px-4 py-3">
              <h3 className="font-semibold text-gray-800">Recent Enrichment Results</h3>
            </div>
            <div className="divide-y">
              {status.enrichment.completed.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-500">No enrichment jobs yet</p>
              ) : (
                status.enrichment.completed.map((job) => (
                  <div key={job.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="font-medium">{job.data?.cityId}/{job.data?.category}</span>
                    <span className="text-gray-500">
                      Inserted: {job.result?.inserted ?? 0} | Dupes: {job.result?.duplicates ?? 0}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Errors */}
          {status.scraping.failed.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50">
              <div className="border-b border-red-200 px-4 py-3">
                <h3 className="font-semibold text-red-800">Failed Jobs</h3>
              </div>
              <div className="divide-y divide-red-200">
                {status.scraping.failed.map((job) => (
                  <div key={job.id} className="px-4 py-3 text-sm">
                    <span className="font-medium">{job.data?.cityId}/{job.data?.category}</span>
                    <p className="mt-1 text-red-700">{job.error}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
