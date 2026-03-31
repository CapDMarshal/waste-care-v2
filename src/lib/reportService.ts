import { createClient } from '@/utils/supabase/client';

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
  const supabase = createClient();
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const imageSizeInBytes = (params.imageBase64.length * 3) / 4;
      const imageSizeInMB = imageSizeInBytes / (1024 * 1024);
      
      if (imageSizeInMB > 10) {
        throw new Error(`Ukuran gambar terlalu besar (${imageSizeInMB.toFixed(1)} MB). Maksimal 10 MB.`);
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Sesi anda telah berakhir. Silakan login kembali.');
      }

      const { data, error } = await supabase.functions.invoke('submit-report', {
        body: params,
      });

      if (error) {
        throw new Error(error.message || 'Gagal mengirim laporan');
      }

      if (!data.success) {
        throw new Error(data.error || data.message || 'Gagal memvalidasi laporan');
      }

      return data;
    } catch (error) {
      lastError = error as Error;
      if (
        lastError.message.includes('Session expired') ||
        lastError.message.includes('Ukuran gambar terlalu besar') ||
        lastError.message.includes('tidak terdeteksi sebagai sampah') ||
        lastError.message.includes('login')
      ) {
        throw lastError;
      }
      if (attempt === 1) await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  throw lastError || new Error('Upload failed after 2 attempts');
}
