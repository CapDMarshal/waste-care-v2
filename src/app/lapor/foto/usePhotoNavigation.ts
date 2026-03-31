import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function usePhotoNavigation() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAddPhoto = () => {
    setLoading(true);
    // Navigate to confirmation using Next.js router
    setTimeout(() => {
      router.push('/lapor/konfirmasi-foto');
    }, 500);
  };

  const handleBack = () => {
    router.back();
  };

  return {
    loading,
    handleAddPhoto,
    handleBack,
  };
}
