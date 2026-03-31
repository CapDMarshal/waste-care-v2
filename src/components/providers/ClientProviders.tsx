'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Lazy load heavy providers in client component
const ReportProvider = dynamic(
  () => import('@/contexts/ReportContext').then(mod => ({ default: mod.ReportProvider })),
  { ssr: false }
);

const RevalidationProvider = dynamic(
  () => import('@/contexts/RevalidationContext').then(mod => ({ default: mod.RevalidationProvider })),
  { ssr: false }
);

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
