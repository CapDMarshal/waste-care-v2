import { useState, useEffect } from 'react';

export type PermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

interface UsePermissionOptions {
  onPermissionChange?: (state: PermissionState) => void;
}

export function usePermission(
  permissionName: PermissionName,
  options: UsePermissionOptions = {}
) {
  const [permissionState, setPermissionState] = useState<PermissionState>('prompt');
  const [isChecking, setIsChecking] = useState(true);

  const checkPermission = async () => {
    setIsChecking(true);
    
    // Check if Permissions API is supported
    if (!navigator.permissions) {
      setPermissionState('unsupported');
      setIsChecking(false);
      return;
    }

    try {
      const result = await navigator.permissions.query({ name: permissionName });
      setPermissionState(result.state as PermissionState);
      
      // Listen for permission changes
      result.onchange = () => {
        const newState = result.state as PermissionState;
        setPermissionState(newState);
        options.onPermissionChange?.(newState);
      };
    } catch (error) {
      setPermissionState('unsupported');
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionName]);

  return {
    permissionState,
    isChecking,
    recheckPermission: checkPermission,
  };
}

export function useGeolocationPermission(options: UsePermissionOptions = {}) {
  return usePermission('geolocation' as PermissionName, options);
}
