import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from './server'
import type { Profile } from '@/lib/types'

export async function getSession() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  return { user, profile }
}

export async function requireAuth() {
  const result = await getCurrentUser()

  if (!result) {
    redirect('/auth/sign-in')
  }

  return result
}

export async function requireRole(roles: string[]) {
  const { user, profile } = await requireAuth()

  if (!profile || !roles.includes(profile.role)) {
    redirect('/')
  }

  return { user, profile }
}
