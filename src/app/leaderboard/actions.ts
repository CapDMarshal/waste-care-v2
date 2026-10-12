'use server';

import { createClient } from '@/utils/supabase/server';

export interface CitizenLeaderboardItem {
  rank: number;
  user_id: string;
  full_name: string;
  email: string;
  exp: number;
  role: string;
  reports_count: number;
  campaigns_attended_count: number;
}

export interface UserRankResult {
  isAuthenticated: boolean;
  userId?: string;
  fullName?: string;
  email?: string;
  rank: number | null;
  exp: number;
  totalUsers: number;
}

export async function getLeaderboardData(limit: number = 50): Promise<{
  success: boolean;
  data: CitizenLeaderboardItem[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_citizen_leaderboard', {
      p_limit: limit,
    });

    if (error) {
      console.warn('RPC get_citizen_leaderboard error:', error);
      // Fallback: Query profiles directly if RPC is not yet registered
      const { data: fallbackProfiles, error: profileErr } = await supabase
        .from('profiles')
        .select('id, exp, role')
        .order('exp', { ascending: false })
        .limit(limit);

      if (profileErr || !fallbackProfiles) {
        return {
          success: false,
          data: [],
          error: error.message || 'Gagal memuat data papan peringkat',
        };
      }

      const fallbackData: CitizenLeaderboardItem[] = fallbackProfiles.map((p, idx) => ({
        rank: idx + 1,
        user_id: p.id,
        full_name: `Warga Sleman #${idx + 1}`,
        email: '',
        exp: p.exp || 0,
        role: p.role,
        reports_count: 0,
        campaigns_attended_count: 0,
      }));

      return {
        success: true,
        data: fallbackData,
      };
    }

    return {
      success: true,
      data: (data as CitizenLeaderboardItem[]) || [],
    };
  } catch (err) {
    console.error('Unexpected error in getLeaderboardData:', err);
    return {
      success: false,
      data: [],
      error: 'Terjadi kesalahan sistem saat memuat peringkat.',
    };
  }
}

export async function getCurrentUserRank(): Promise<UserRankResult> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return {
        isAuthenticated: false,
        rank: null,
        exp: 0,
        totalUsers: 0,
      };
    }

    const displayName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      (user.email ? user.email.split('@')[0] : 'Warga Sleman');

    const { data, error } = await supabase.rpc('get_user_leaderboard_rank', {
      p_user_id: user.id,
    });

    if (error || !data) {
      // Fallback query to profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('exp')
        .eq('id', user.id)
        .maybeSingle();

      const { count } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });

      return {
        isAuthenticated: true,
        userId: user.id,
        fullName: displayName,
        email: user.email || '',
        rank: null,
        exp: profile?.exp || 0,
        totalUsers: count || 1,
      };
    }

    const res = data as {
      rank: number | null;
      exp: number;
      total_users: number;
    };

    return {
      isAuthenticated: true,
      userId: user.id,
      fullName: displayName,
      email: user.email || '',
      rank: res.rank,
      exp: res.exp || 0,
      totalUsers: res.total_users || 1,
    };
  } catch (err) {
    console.error('Unexpected error in getCurrentUserRank:', err);
    return {
      isAuthenticated: false,
      rank: null,
      exp: 0,
      totalUsers: 0,
    };
  }
}
