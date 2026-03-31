import { createClient } from '../utils/supabase/client';

// Client components can safely use a singleton browser client!
export const supabase = createClient();
