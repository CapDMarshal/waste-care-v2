'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { verifyPresenceToken } from '@/lib/qrPresence'

export interface AttendanceCheckInPayload {
  token: string
  userLat: number
  userLng: number
  gpsAccuracy?: number
}

export interface AttendanceCheckInResult {
  success: boolean
  code: string
  message: string
  campaignId?: number
  campaignTitle?: string
  distance?: number
  maxDistance?: number
  newExp?: number
  attendedAt?: string
}

export async function submitAttendanceCheckIn({
  token,
  userLat,
  userLng,
  gpsAccuracy,
}: AttendanceCheckInPayload): Promise<AttendanceCheckInResult> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Silakan masuk (login) ke akun WasteCare Anda terlebih dahulu untuk melakukan presensi.',
      }
    }

    // 1. Validasi koordinat GPS
    if (
      typeof userLat !== 'number' ||
      typeof userLng !== 'number' ||
      isNaN(userLat) ||
      isNaN(userLng) ||
      userLat < -90 ||
      userLat > 90 ||
      userLng < -180 ||
      userLng > 180
    ) {
      return {
        success: false,
        code: 'INVALID_COORDINATES',
        message: 'Koordinat GPS perangkat Anda tidak valid. Pastikan GPS aktif dengan akurasi tinggi.',
      }
    }

    // 2. Verifikasi Kriptografi Token QR Dinamis (HMAC-SHA256 & TTL)
    const tokenResult = verifyPresenceToken(token)

    if (!tokenResult.valid || !tokenResult.campaignId) {
      return {
        success: false,
        code: tokenResult.error || 'INVALID_TOKEN',
        message:
          tokenResult.message ||
          'Kode QR presensi tidak valid atau telah kedaluwarsa. Minta admin menampilkan QR terbaru.',
      }
    }

    const campaignId = tokenResult.campaignId

    // 3. Panggil PostGIS Stored Procedure (RPC) untuk validasi geofencing atomik
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      'record_campaign_attendance',
      {
        p_campaign_id: campaignId,
        p_user_id: user.id,
        p_user_lat: userLat,
        p_user_lng: userLng,
        p_max_distance_meters: 50.0,
      }
    )

    if (rpcError) {
      console.error('[submitAttendanceCheckIn] RPC Error:', rpcError)
      return {
        success: false,
        code: 'RPC_ERROR',
        message: 'Terjadi kesalahan sistem saat memproses presensi: ' + rpcError.message,
      }
    }

    const parsedResult = rpcResult as {
      success: boolean
      code: string
      message: string
      distance?: number
      max_distance?: number
      campaign_id?: number
      campaign_title?: string
      new_exp?: number
      attended_at?: string
    }

    if (parsedResult.success) {
      revalidatePath('/campaign')
      revalidatePath('/profile')
      revalidatePath('/admin/campaign')
      revalidatePath('/scan-qr')

      return {
        success: true,
        code: parsedResult.code,
        message: parsedResult.message,
        campaignId: parsedResult.campaign_id || campaignId,
        campaignTitle: parsedResult.campaign_title,
        distance: parsedResult.distance,
        newExp: parsedResult.new_exp,
        attendedAt: parsedResult.attended_at,
      }
    }

    return {
      success: false,
      code: parsedResult.code,
      message: parsedResult.message,
      distance: parsedResult.distance,
      maxDistance: parsedResult.max_distance,
    }
  } catch (err) {
    console.error('[submitAttendanceCheckIn] Catch Error:', err)
    return {
      success: false,
      code: 'UNEXPECTED_ERROR',
      message:
        'Terjadi kendala tak terduga: ' +
        (err instanceof Error ? err.message : String(err)),
    }
  }
}
