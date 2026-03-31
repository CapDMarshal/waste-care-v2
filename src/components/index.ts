// UI Components - Tree-shakeable exports
export { default as Button } from './ui/Button';
export { default as Input } from './ui/Input';
export { default as Checkbox } from './ui/Checkbox';
export { default as Toast } from './ui/Toast';
export { default as GoogleButton } from './ui/GoogleButton';

// Shared Components - Tree-shakeable exports
export { default as BottomNavigation } from './shared/BottomNavigation';
export { default as BottomSheet } from './shared/BottomSheet';
// MapTilerMap: Import directly from './shared/LazyMapTilerMap' to avoid bundling
export { default as DetailItem } from './shared/DetailItem';
export { default as PWAInstallPrompt } from './shared/PWAInstallPrompt';
export { PermissionGuard } from './shared/PermissionGuard';
export { PhotoCapture } from './shared/PhotoCapture';

// Providers - Tree-shakeable exports
export { AuthProvider, useAuthContext } from './providers/AuthProvider';
export { ProtectedRoute } from './providers/ProtectedRoute';

// Campaign components: Import directly to enable code splitting
// - CampaignCard: Import from '../app/campaign/CampaignCard' where needed
// - CampaignDetailModal: Import from '../app/campaign/CampaignDetailModal' where needed
