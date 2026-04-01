import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Ensures the current user is authenticated and has the 'admin' role.
 * Redirects to the homepage if not.
 * Use this at the top of any admin page route (app/admin/...).
 */
export async function requireAdmin() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  // Check the role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  return { user, supabase }
}
