import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function test() {
  const campaignId = 2
  const profileId = "4092437e-443d-4912-ad5d-a593ec273b8d"

  const { data, error } = await supabase
    .from('campaign_participants')
    .update({ is_attended: true })
    .eq('campaign_id', campaignId)
    .eq('profile_id', profileId)
    .select()

  console.log("Error:", error)
  console.log("Data:", data)
}

test()
