'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Location, AiValidation } from './ReportContext';

export interface RevalidationData {
  reportId: number; // ID of the report being revalidated
  location: Location | null;
  photos: string[]; // Base64 encoded images showing clean location
  notes?: string;
  status: 'clean' | 'still_dirty'; // Status after revalidation
  aiValidation?: AiValidation;
}

interface RevalidationContextType {
  revalidationData: RevalidationData;
  setReportId: (id: number) => void;
  setLocation: (location: Location) => void;
  addPhoto: (photo: string) => void;
  removePhoto: (index: number) => void;
  setNotes: (notes: string) => void;
  setStatus: (status: RevalidationData['status']) => void;
  setAiValidation: (validation: RevalidationData['aiValidation']) => void;
  resetRevalidation: () => void;
}

const RevalidationContext = createContext<RevalidationContextType | undefined>(undefined);

const initialRevalidationData: RevalidationData = {
  reportId: 0,
  location: null,
  photos: [],
  notes: '',
  status: 'clean',
};

export function RevalidationProvider({ children }: { children: ReactNode }) {
  const [revalidationData, setRevalidationData] = useState<RevalidationData>(initialRevalidationData);

  const setReportId = useCallback((reportId: number) => {
    setRevalidationData(prev => ({ ...prev, reportId }));
  }, []);

  const setLocation = useCallback((location: Location) => {
    setRevalidationData(prev => ({ ...prev, location }));
  }, []);

  const addPhoto = useCallback((photo: string) => {
    setRevalidationData(prev => ({ ...prev, photos: [...prev.photos, photo] }));
  }, []);

  const removePhoto = useCallback((index: number) => {
    setRevalidationData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  }, []);

  const setNotes = useCallback((notes: string) => {
    setRevalidationData(prev => ({ ...prev, notes }));
  }, []);

  const setStatus = useCallback((status: RevalidationData['status']) => {
    setRevalidationData(prev => ({ ...prev, status }));
  }, []);

  const setAiValidation = useCallback((validation: AiValidation | undefined) => {
    setRevalidationData(prev => ({ ...prev, aiValidation: validation }));
  }, []);

  const resetRevalidation = useCallback(() => {
    setRevalidationData(initialRevalidationData);
  }, []);

  return (
    <RevalidationContext.Provider
      value={{
        revalidationData,
        setReportId,
        setLocation,
        addPhoto,
        removePhoto,
        setNotes,
        setStatus,
        setAiValidation,
        resetRevalidation,
      }}
    >
      {children}
    </RevalidationContext.Provider>
  );
}

export function useRevalidation() {
  const context = useContext(RevalidationContext);
  if (context === undefined) {
    throw new Error('useRevalidation must be used within a RevalidationProvider');
  }
  return context;
}
