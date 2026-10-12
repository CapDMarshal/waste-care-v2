'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { generatePresenceToken } from '@/lib/qrPresence'
import QRCode from 'qrcode'

export async function toggleAttendance(campaignId: number, profileId: string, isAttended: boolean) {
  // Use direct supabase-js client to guarantee service_role bypass of RLS
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Debug query
  const { data: checkData, error: checkError } = await supabase
    .from('campaign_participants')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('profile_id', profileId)

  console.log('Check before update:', { checkData, checkError })

  const { data, error } = await supabase
    .from('campaign_participants')
    .update({ 
      is_attended: isAttended,
      attended_at: isAttended ? new Date().toISOString() : null,
    })
    .eq('campaign_id', campaignId)
    .eq('profile_id', profileId)
    .select()

  console.log('Update result:', { campaignId, profileId, isAttended, data, error })

  if (error) {
    console.error('Error toggling attendance:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/campaign')
  return { success: true }
}

/**
 * Generates a signed dynamic QR presence token and QR Data URL for a campaign
 */
export async function generateCampaignPresenceToken(campaignId: number) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: 'Silakan login terlebih dahulu.' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return { success: false, error: 'Akses ditolak: Hanya admin yang dapat membuka sesi presensi QR.' }
    }

    const { data: campaign, error: campError } = await supabase
      .from('campaigns')
      .select('id, title, status')
      .eq('id', campaignId)
      .single()

    if (campError || !campaign) {
      return { success: false, error: 'Data kampanye tidak ditemukan.' }
    }

    const { token, expiresAt } = generatePresenceToken(campaignId, 60)

    const qrDataUrl = await QRCode.toDataURL(token, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })

    return {
      success: true,
      token,
      qrDataUrl,
      expiresAt,
      campaignTitle: campaign.title,
    }
  } catch (err) {
    console.error('[generateCampaignPresenceToken] Error:', err)
    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat membuat token QR: ' + (err instanceof Error ? err.message : String(err)),
    }
  }
}

/**
 * Fetches real-time attendance statistics for a campaign
 */
export async function fetchCampaignAttendance(campaignId: number) {
  try {
    const adminSupabase = await createAdminClient()
    const { data: participants, error } = await adminSupabase
      .from('campaign_participants')
      .select('profile_id, joined_at, is_attended, attended_at, check_in_distance')
      .eq('campaign_id', campaignId)

    if (error) {
      return { success: false, error: error.message }
    }

    const total = participants?.length || 0
    const attended = participants?.filter((p) => p.is_attended === true).length || 0

    return {
      success: true,
      total,
      attended,
      participants: participants || [],
    }
  } catch (err) {
    return {
      success: false,
      error: 'Gagal mengambil data presensi: ' + (err instanceof Error ? err.message : String(err)),
    }
  }
}

