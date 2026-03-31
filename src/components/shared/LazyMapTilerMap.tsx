'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Lazy load MapTilerMap with no SSR
const MapTilerMap = dynamic(() => import('./MapTilerMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Memuat peta...</p>
      </div>
    </div>
  ),
});

export default MapTilerMap;
