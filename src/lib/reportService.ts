import { supabase } from '@/lib/supabase';
import { FunctionsHttpError } from '@supabase/functions-js';

export interface SubmitReportParams {
  imageBase64: string;
  latitude: number;
  longitude: number;
  notes?: string;
}

export interface SubmitReportResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
  validation?: any;
}

export async function submitReport(params: SubmitReportParams): Promise<SubmitReportResponse> {
  const imageSizeInBytes = (params.imageBase64.length * 3) / 4;
  const imageSizeInMB = imageSizeInBytes / (1024 * 1024);

  if (imageSizeInMB > 10) {
    throw new Error(`Ukuran gambar terlalu besar (${imageSizeInMB.toFixed(1)} MB). Maksimal 10 MB.`);
  }

  // getUser() validates + refreshes the session before invoking
  const { error: userError } = await supabase.auth.getUser();
  if (userError) {
    throw new Error('Sesi anda telah berakhir. Silakan login kembali.');
  }

  // refreshSession() always hits the network and returns a guaranteed-fresh access_token
  const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
  const session = refreshData?.session;

  if (refreshError || !session?.access_token) {
    throw new Error('Sesi anda telah berakhir. Silakan login kembali.');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const response = await fetch(`${supabaseUrl}/functions/v1/submit-report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': anonKey,
    },
    body: JSON.stringify({
      image_base64: params.imageBase64,
      latitude: params.latitude,
      longitude: params.longitude,
      notes: params.notes || '',
    }),
  });
  const responseText = await response.text();
  let data: any;
  try { data = JSON.parse(responseText); } catch { data = null; }

  if (!response.ok) {
    throw new Error(data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  if (!data?.success) {
    throw new Error(data?.error || data?.message || 'Gagal memvalidasi laporan');
  }

  return data;
}

/**
 * Convert a File object to a base64 string (without the data URL prefix).
 * The output is ready to be sent directly to the submit-report Edge Function.
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
}

export function resizeImage(file: File, maxWidth: number = 800, maxHeight: number = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('File harus berupa gambar'));
      return;
    }

    // Validate file size (max 50MB original)
    if (file.size > 50 * 1024 * 1024) {
      reject(new Error('Ukuran file terlalu besar. Maksimal 50 MB'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Gagal memproses gambar'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with higher compression (0.7 instead of 0.8)
        const base64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
        const sizeInMB = (base64.length * 3 / 4) / (1024 * 1024);

        resolve(base64);
      };
      img.onerror = () => reject(new Error('Gagal memuat gambar'));
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
  });
}