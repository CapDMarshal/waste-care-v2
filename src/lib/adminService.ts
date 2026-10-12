'use server'

import { createClient } from '../utils/supabase/server'
import { Database } from '../types/database.types'

type ReportStatus = Database['public']['Enums']['report_status_enum']

function getErrorInfo(error: unknown) {
  const err = error as {
    message?: string
    details?: string
    hint?: string
    code?: string
  }

  return {
    message: err?.message,
    details: err?.details,
    hint: err?.hint,
    code: err?.code,
  }
}

async function callAdminEdge<T>(path: 'get-admin-statistics' | 'get-pending-reports') {
  const supabase = await createClient()
  const { data: sessionData } = await supabase.auth.getSession()
  const accessToken = sessionData.session?.access_token

  if (!accessToken) return null

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) return null

  const response = await fetch(`${supabaseUrl}/functions/v1/${path}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: anonKey,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok || !payload?.success) return null

  return payload.data as T
}

interface AdminStats {
  pending_count: number
  approved_count: number
  rejected_count: number
  hazardous_count: number
  total_count: number
}

export async function getAdminStatistics(): Promise<AdminStats> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_admin_statistics').single()

  if (error) {
    console.error('Error fetching admin statistics (rpc):', getErrorInfo(error))

    const fallback = await callAdminEdge<{
      pending_count: number
      approved_count: number
      rejected_count: number
      hazardous_count: number
      total_count: number
    }>('get-admin-statistics')

    if (fallback) {
      return fallback
    }

    return {
      pending_count: 0,
      approved_count: 0,
      rejected_count: 0,
      hazardous_count: 0,
      total_count: 0,
    }
  }

  return data as AdminStats
}

export async function getPendingReports() {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_pending_reports')

  if (error) {
    console.error('Error fetching pending reports (rpc):', getErrorInfo(error))

    const fallback = await callAdminEdge<any[]>('get-pending-reports')
    if (fallback) {
      return fallback
    }

    return []
  }

  return data
}

export async function getAllReportsAdmin(statusFilter?: ReportStatus) {
  const supabase = await createClient()

  let query = supabase
    .from('reports')
    .select(`
      id,
      created_at,
      waste_type,
      hazard_risk,
      location_category,
      status,
      image_urls,
      location,
      notes,
      reviewed_at
    `)
    .order('created_at', { ascending: false })

  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching all reports for admin:', error)
    return []
  }

  return data
}

export async function getReportDetailAdmin(reportId: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      campaigns (
        id,
        title,
        status
      )
    `)
    .eq('id', reportId)
    .single()

  if (error || !data) {
    console.error('Error fetching report detail:', error)
    return null
  }

  return data
}

export async function updateReportStatus(
  reportId: number,
  status: ReportStatus,
  adminNotes: string | null = null
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Fetch report to get user_id
  const { data: report, error: reportError } = await supabase
    .from('reports')
    .select('user_id')
    .eq('id', reportId)
    .single()
    
  if (reportError || !report) throw new Error('Report not found')

  const updateData: any = {
    status,
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString()
  }

  if (adminNotes !== null) {
    updateData.admin_notes = adminNotes
  }

  const { error } = await supabase
    .from('reports')
    .update(updateData)
    .eq('id', reportId)

  if (error) {
    console.error(`Error updating report status to ${status}:`, error)
    throw new Error(error.message)
  }

  // Handle XP award & Notifications
  if (status === 'approved') {
    let xpAwardedSuccessfully = false
    try {
      const { data: awardData, error: awardError } = await supabase.rpc('award_report_approved_exp', {
        p_report_id: reportId,
        p_admin_id: user.id
      })
      if (!awardError && awardData) {
        xpAwardedSuccessfully = true
      } else if (awardError) {
        console.warn('RPC award_report_approved_exp error:', getErrorInfo(awardError))
      }
    } catch (err) {
      console.warn('RPC award_report_approved_exp failed to execute:', err)
    }

    // Fallback notification jika RPC belum terpasang atau tidak membuat notifikasi
    if (!xpAwardedSuccessfully) {
      await supabase.from('notifications').insert({
        user_id: report.user_id,
        title: 'Laporan Disetujui',
        message: 'Laporan Anda telah disetujui oleh admin dan akan segera ditindaklanjuti.',
        type: 'report_status',
        related_id: reportId
      })
    }
  } else {
    let title = 'Status Laporan Diperbarui'
    let message = `Laporan Anda telah diperbarui menjadi ${status}.`
    
    if (status === 'rejected') {
      title = 'Laporan Ditolak'
      message = `Laporan Anda ditolak. Alasan: ${adminNotes || 'Tidak ada catatan khusus.'}`
    } else if (status === 'hazardous') {
      title = 'Laporan Diteruskan'
      message = 'Laporan Anda dikategorikan berbahaya dan telah diteruskan ke pihak berwenang.'
    }

    await supabase.from('notifications').insert({
      user_id: report.user_id,
      title,
      message,
      type: 'report_status',
      related_id: reportId
    })
  }

  return true
}

export async function approveReport(reportId: number) {
  return updateReportStatus(reportId, 'approved')
}

export async function rejectReport(reportId: number, adminNotes: string) {
  return updateReportStatus(reportId, 'rejected', adminNotes)
}

export async function forwardHazardousReport(reportId: number) {
  return updateReportStatus(reportId, 'hazardous')
}

export async function finishReport(reportId: number) {
  return updateReportStatus(reportId, 'finished')
}

export async function updateReportVolume(reportId: number, wasteVolume: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('reports')
    .update({ waste_volume: wasteVolume })
    .eq('id', reportId)

  if (error) {
    console.error(`Error updating report volume to ${wasteVolume}:`, error)
    throw new Error(error.message)
  }

  return true
}
