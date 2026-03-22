import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase/server'
import { randomInt } from 'crypto'

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { placeId, verificationMethod } = body

  if (!placeId || !verificationMethod) {
    return NextResponse.json({ error: 'placeId and verificationMethod required' }, { status: 400 })
  }

  const serviceClient = createServiceClient()

  // Check place exists and isn't already claimed
  const { data: place } = await serviceClient
    .from('places')
    .select('id, name, claim_status, phone, email, website')
    .eq('id', placeId)
    .single()

  if (!place) {
    return NextResponse.json({ error: 'Place not found' }, { status: 404 })
  }

  if (place.claim_status === 'claimed') {
    return NextResponse.json({ error: 'This business is already claimed' }, { status: 409 })
  }

  // Check for existing pending claim by this user
  const { data: existingClaim } = await serviceClient
    .from('business_claims')
    .select('id, status')
    .eq('place_id', placeId)
    .eq('user_id', user.id)
    .single()

  if (existingClaim && existingClaim.status === 'pending') {
    return NextResponse.json({ error: 'You already have a pending claim' }, { status: 409 })
  }

  // Create claim
  const claimData: Record<string, unknown> = {
    place_id: placeId,
    user_id: user.id,
    verification_method: verificationMethod,
    status: 'pending',
  }

  if (verificationMethod === 'phone' || verificationMethod === 'email') {
    const code = randomInt(100000, 999999).toString()
    claimData.verification_code = code
    claimData.verification_expires_at = new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 min

    // TODO: Send code via SMS/email (Twilio/SMTP integration)
    // For now, the code is stored and admin can see it
    console.log(`[Claim] Verification code for ${place.name}: ${code}`)
  }

  const { data: claim, error } = await serviceClient
    .from('business_claims')
    .insert(claimData)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update place status to pending
  await serviceClient
    .from('places')
    .update({ claim_status: 'pending' })
    .eq('id', placeId)

  return NextResponse.json({ claim })
}

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serviceClient = createServiceClient()
  const { data: claims } = await serviceClient
    .from('business_claims')
    .select('*, places(name, slug, city_id, category_id)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ claims: claims ?? [] })
}

// Verify a claim code
export async function PATCH(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { claimId, code } = body

  if (!claimId || !code) {
    return NextResponse.json({ error: 'claimId and code required' }, { status: 400 })
  }

  const serviceClient = createServiceClient()

  const { data: claim } = await serviceClient
    .from('business_claims')
    .select('*')
    .eq('id', claimId)
    .eq('user_id', user.id)
    .single()

  if (!claim) {
    return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
  }

  if (claim.status !== 'pending') {
    return NextResponse.json({ error: 'Claim is not pending' }, { status: 400 })
  }

  if (claim.verification_expires_at && new Date(claim.verification_expires_at) < new Date()) {
    await serviceClient
      .from('business_claims')
      .update({ status: 'expired' })
      .eq('id', claimId)
    return NextResponse.json({ error: 'Verification code expired' }, { status: 410 })
  }

  if (claim.verification_code !== code) {
    return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
  }

  // Auto-approve phone/email claims
  await serviceClient.rpc('approve_business_claim', {
    p_claim_id: claimId,
    p_admin_id: user.id,
  })

  return NextResponse.json({ verified: true })
}
