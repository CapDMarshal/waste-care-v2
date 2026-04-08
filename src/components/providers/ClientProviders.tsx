'use client';

import { ReactNode } from 'react';
import { ReportProvider } from '@/contexts/ReportContext';
import { RevalidationProvider } from '@/contexts/RevalidationContext';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ReportProvider>
      <RevalidationProvider>
        {children}
      </RevalidationProvider>
    </ReportProvider>
  );
}
