'use server'

import { approveReport, rejectReport, forwardHazardousReport, updateReportVolume, finishReport } from '@/lib/adminService'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function approveAction(reportId: number) {
  await approveReport(reportId)
  revalidatePath('/admin')
  revalidatePath('/admin/laporan')
  revalidatePath(`/admin/laporan/${reportId}`)
}

export async function rejectAction(reportId: number, adminNotes: string) {
  await rejectReport(reportId, adminNotes)
  revalidatePath('/admin')
  revalidatePath('/admin/laporan')
  revalidatePath(`/admin/laporan/${reportId}`)
}

export async function forwardHazardousAction(reportId: number) {
  await forwardHazardousReport(reportId)
  revalidatePath('/admin')
  revalidatePath('/admin/laporan')
  revalidatePath(`/admin/laporan/${reportId}`)
}

export async function finishAction(reportId: number) {
  await finishReport(reportId)
  revalidatePath('/admin')
  revalidatePath('/admin/laporan')
  revalidatePath(`/admin/laporan/${reportId}`)
}

export async function updateVolumeAction(reportId: number, wasteVolume: string) {
  await updateReportVolume(reportId, wasteVolume)
  revalidatePath(`/admin/laporan/${reportId}`)
  revalidatePath('/admin/laporan')
}

export async function redirectToCampaign(reportId: number) {
  // Can be called to push admin logically to the next phase after approval
  redirect(`/admin/campaign/buat?reportId=${reportId}`)
}
