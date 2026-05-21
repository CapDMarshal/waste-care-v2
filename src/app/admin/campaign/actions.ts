'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function toggleAttendance(campaignId: number, profileId: string, isAttended: boolean) {
  // Use direct supabase-js client to guarantee service_role bypass of RLS
  const supabase = createClient(
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
    .update({ is_attended: isAttended })
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
