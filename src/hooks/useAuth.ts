'use client';

import { useAuthContext } from '@/components';

/**
 * Hook untuk mengakses auth context
 * Gunakan ini di component untuk mendapatkan user dan loading state
 */
export const useAuth = () => {
  return useAuthContext();
};
