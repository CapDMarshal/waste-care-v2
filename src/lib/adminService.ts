'use server'

import { createClient } from '../utils/supabase/server'
import { Database } from '../types/database.types'

type ReportStatus = Database['public']['Enums']['report_status_enum']

export async function getAdminStatistics() {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_admin_statistics').single()

  if (error) {
    console.error('Error fetching admin statistics:', error)
    return null
  }

  return data
}

export async function getPendingReports() {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_pending_reports')

  if (error) {
    console.error('Error fetching pending reports:', error)
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
      profiles:user_id (
        id,
        exp,
        role
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
