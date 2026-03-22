import { redirect } from 'next/navigation'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/sign-in?redirect=/admin')
  }

  const serviceClient = createServiceClient()
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/scraping', label: 'Scraping' },
    { href: '/admin/news', label: 'News Sources' },
    { href: '/admin/listings', label: 'Listings' },
    { href: '/admin/claims', label: 'Claims' },
    { href: '/admin/moderation', label: 'Moderation' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/cities', label: 'Cities' },
    { href: '/admin/analytics', label: 'Analytics' },
  ]

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="w-56 border-r border-gray-200 bg-gray-50 p-4">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Admin
        </h2>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
