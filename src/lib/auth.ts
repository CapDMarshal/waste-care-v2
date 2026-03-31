import { createClient } from '../utils/supabase/client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

export const loginWithEmail = async (credentials: LoginCredentials) => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });
  return { data, error };
};

export const registerWithEmail = async (registerData: RegisterData) => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: registerData.email,
    password: registerData.password,
    options: {
      data: {
        full_name: registerData.fullName,
      },
      emailRedirectTo: `${window.location.origin}/dashboard`,
    },
  });
  return { data, error };
};

export const loginWithGoogle = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  return { data, error };
};

export const logout = async () => {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

export const getSession = async () => {
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};
