import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { resizeImage } from '@/lib/reportService';

interface UsePhotoManagementProps {
  existingPhotos: string[];
  onAddPhoto: (photo: string) => void;
  onRemovePhoto: (index: number) => void;
}

export function usePhotoManagement({ 
  existingPhotos, 
  onAddPhoto, 
  onRemovePhoto 
}: UsePhotoManagementProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load existing photos from context
    if (existingPhotos.length > 0) {
      setPhotos(existingPhotos.map(p => `data:image/jpeg;base64,${p}`));
    }
  }, [existingPhotos]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Resize and compress image
        const base64 = await resizeImage(file);
        onAddPhoto(base64);
        setPhotos(prev => [...prev, `data:image/jpeg;base64,${base64}`]);
      }
    } catch (error) {
      throw new Error('Gagal memproses gambar. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMorePhotos = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = (index: number) => {
    onRemovePhoto(index);
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadPhoto = () => {
    if (photos.length === 0) {
      throw new Error('Tambahkan minimal 1 foto untuk melanjutkan');
    }
    setLoading(true);
    // Navigate to uploading page using Next.js router
    setTimeout(() => {
      router.push('/lapor/mengunggah');
    }, 500);
  };

  return {
    loading,
    photos,
    fileInputRef,
    handleFileSelect,
    handleAddMorePhotos,
    handleRemovePhoto,
    handleUploadPhoto,
  };
}
