import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitReport } from '@/lib/reportService';
import { ReportData, AiValidation } from '@/contexts/ReportContext';

interface UseUploadProps {
  reportData: ReportData;
  setAiValidation: (validation: AiValidation) => void;
}

export function useUpload({ reportData, setAiValidation }: UseUploadProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    let progressInterval: NodeJS.Timeout | null = null;
    let completeProgress: NodeJS.Timeout | null = null;
    
    try {
      // Reset state
      setError(null);
      setProgress(0);
      setUploading(true);
      
      // Validate only required data (location and photos)
      if (!reportData.location || reportData.photos.length === 0) {
        throw new Error('Data tidak lengkap');
      }

      // Simulate progress for first photo (0-30%)
      let currentProgress = 0;
      progressInterval = setInterval(() => {
        currentProgress += 3;
        if (currentProgress <= 30) {
          setProgress(currentProgress);
        } else {
          if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
          }
        }
      }, 200);

      // Upload first photo - let AI generate waste type, volume, and location category
      const submitParams = {
        imageBase64: reportData.photos[0],
        latitude: Number(reportData.location.latitude),
        longitude: Number(reportData.location.longitude),
        notes: reportData.notes || '',
      };

      // Add timeout for submit report (120 seconds for AI processing)
      const submitPromise = submitReport(submitParams);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout setelah 120 detik. Server mungkin sedang sibuk, coba lagi nanti.')), 120000)
      );
      
      const result = await Promise.race([submitPromise, timeoutPromise]);

      // Clear progress interval after successful response
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      
      // Ensure we're at least at 30% before proceeding
      if (progress < 30) {
        setProgress(30);
      }

      // Check if upload was successful
      if (!result.success) {
        // Handle AI timeout or response too long
        if (result.error?.includes('AI_RESPONSE_TOO_LONG') || result.error?.includes('response too long')) {
          throw new Error(
            'Server sedang memproses terlalu lama. Ini biasanya terjadi saat server sibuk.\n\nSilakan coba lagi dalam beberapa saat.'
          );
        }
        
        // Handle validation failure (not waste)
        if (result.validation && !result.validation.isWaste) {
          const reason = result.validation.reason || 'Gambar tidak terdeteksi sebagai sampah';
          throw new Error(
            `${result.message || 'Validasi gambar gagal'}\n\nAlasan: ${reason}`
          );
        }
        
        // Handle parsing errors with more specific messages
        const errorMsg = result.error || result.message || 'Gagal mengunggah laporan';
        
        if (errorMsg.includes('AI validation failed - empty response')) {
          throw new Error(
            'Validasi AI gagal. Mohon coba lagi dengan foto yang lebih jelas dan terang.'
          );
        }
        
        if (errorMsg.includes('Failed to parse Gemini AI response')) {
          throw new Error(
            'Terjadi kesalahan saat validasi gambar oleh AI. Mohon coba lagi dengan foto yang lebih jelas.'
          );
        }
        
        if (errorMsg.includes('Gemini AI validation failed')) {
          throw new Error(
            'Layanan validasi AI sedang bermasalah. Mohon coba lagi nanti.'
          );
        }
        
        if (errorMsg.includes('Bucket not found')) {
          throw new Error(
            'Kesalahan konfigurasi storage. Mohon hubungi administrator.'
          );
        }
        
        throw new Error(errorMsg);
      }

      // Save AI validation result to context
      if (result.data?.validation) {
        setAiValidation(result.data.validation);
      }

      // Simulate remaining progress (30-100%)
      completeProgress = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            if (completeProgress) clearInterval(completeProgress);
            setUploading(false);
            // Navigate to success page using Next.js router
            setTimeout(() => {
              router.push('/lapor/konfirmasi-data');
            }, 500);
            return 100;
          }
          return prev + 10;
        });
      }, 100);

    } catch (err) {
      // Clean up all intervals on error
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      if (completeProgress) {
        clearInterval(completeProgress);
        completeProgress = null;
      }
      
      // Provide more user-friendly error messages
      let errorMessage = 'Terjadi kesalahan saat mengunggah';
      
      if (err instanceof Error) {
        if (err.message.includes('timeout')) {
          errorMessage = 'Koneksi terlalu lambat atau server sedang sibuk.\n\nSaran:\n• Periksa koneksi internet Anda\n• Coba gunakan foto dengan ukuran lebih kecil\n• Coba lagi beberapa saat';
        } else if (err.message.includes('Network request failed') || err.message.includes('Failed to fetch') || err.message.includes('Network error')) {
          errorMessage = 'Tidak ada koneksi internet.\n\nMohon periksa koneksi internet Anda dan coba lagi.';
        } else if (err.message.includes('Session expired') || err.message.includes('Session refresh failed')) {
          errorMessage = 'Sesi login Anda telah berakhir.\n\nMohon login kembali untuk melanjutkan.';
        } else if (err.message.includes('Ukuran gambar terlalu besar')) {
          errorMessage = err.message + '\n\nMohon gunakan foto dengan resolusi lebih rendah.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRetry = () => {
    setError(null);
    setProgress(0);
    setUploading(true);
    handleUpload();
  };

  return {
    progress,
    uploading,
    error,
    handleUpload,
    handleRetry,
  };
}
