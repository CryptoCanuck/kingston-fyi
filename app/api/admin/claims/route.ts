import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase/server'
import { enqueueNotification } from '@/lib/queues'

async function requireAdmin() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', status: 401 }
  const serviceClient = createServiceClient()
  const { data: profile } = await serviceClient.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') return { error: 'Forbidden', status: 403 }
  return { user }
}

export async function GET() {
  const auth = await requireAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const serviceClient = createServiceClient()
  const { data: claims } = await serviceClient
    .from('business_claims')
    .select('*, profiles(display_name, role), places(name, city_id)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  return NextResponse.json({ claims: claims ?? [] })
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json()
  const { claimId, action, notes } = body

  if (!claimId || !action) return NextResponse.json({ error: 'claimId and action required' }, { status: 400 })

  const serviceClient = createServiceClient()

  if (action === 'approve') {
    await serviceClient.rpc('approve_business_claim', {
      p_claim_id: claimId,
      p_admin_id: auth.user.id,
    })

    // Get claim to notify user
    const { data: claim } = await serviceClient.from('business_claims').select('user_id').eq('id', claimId).single()
    if (claim) {
      await enqueueNotification(claim.user_id, 'claim_status', 'Your business claim has been approved!', notes)
    }

    return NextResponse.json({ approved: true })
  }

  if (action === 'reject') {
    await serviceClient
      .from('business_claims')
      .update({
        status: 'rejected',
        reviewed_by: auth.user.id,
        reviewed_at: new Date().toISOString(),
        notes,
      })
      .eq('id', claimId)

    const { data: claim } = await serviceClient.from('business_claims').select('user_id, place_id').eq('id', claimId).single()
    if (claim) {
      await serviceClient.from('places').update({ claim_status: 'unclaimed' }).eq('id', claim.place_id)
      await enqueueNotification(claim.user_id, 'claim_status', 'Your business claim was not approved', notes)
    }

    return NextResponse.json({ rejected: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
