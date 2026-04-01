import { useState, useCallback } from 'react';

export function useMarkerSelection() {
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleMarkerClick = useCallback((markerId: string) => {
    setSelectedMarkerId(markerId);
    setShowDetails(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setShowDetails(false);
    setSelectedMarkerId(null);
  }, []);

  return {
    selectedMarkerId,
    showDetails,
    handleMarkerClick,
    handleCloseDetails,
  };
}
