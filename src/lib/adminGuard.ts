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

  // Check app_metadata first (no extra DB call needed if role is in JWT)
  const metaRole = (user.app_metadata as any)?.role;
  if (metaRole === 'admin') {
    return { user, supabase }
  }

  // Fallback: check DB with minimal select (role only)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  return { user, supabase }
}
