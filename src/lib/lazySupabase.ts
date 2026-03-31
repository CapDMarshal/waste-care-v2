import { createClient } from '@/utils/supabase/client';

export const getSupabase = async () => {
  return createClient();
};
