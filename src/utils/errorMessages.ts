/**
 * Utility untuk mengkonversi error message dari Supabase ke bahasa Indonesia
 */

export const getErrorMessage = (error: unknown): string => {
  const message = (error as { message?: string })?.message || '';

  // Login errors
  if (message.includes('Invalid login credentials')) {
    return 'Email atau password salah';
  }
  
  if (message.includes('Email not confirmed')) {
    return 'Email belum diverifikasi. Silakan cek email Anda.';
  }

  // Registration errors
  if (message.includes('User already registered')) {
    return 'Email sudah terdaftar. Silakan gunakan email lain atau login.';
  }

  if (message.includes('Password should be at least')) {
    return 'Password terlalu lemah. Gunakan minimal 6 karakter.';
  }

  if (message.includes('Invalid email')) {
    return 'Format email tidak valid.';
  }

  // OAuth errors
  if (message.includes('OAuth')) {
    return 'Gagal login dengan Google. Silakan coba lagi.';
  }

  // Password update errors
  if (message.includes('New password should be different')) {
    return 'Password baru harus berbeda dengan password lama';
  }

  if (message.includes('password')) {
    return 'Gagal mengubah password. Silakan coba lagi.';
  }

  // Generic error
  return 'Terjadi kesalahan. Silakan coba lagi.';
};

export const isEmailAlreadyRegistered = (data: { user?: { identities?: unknown[] } }): boolean => {
  return !!(data?.user && data.user.identities && data.user.identities.length === 0);
};

/**
 * Get user-friendly error message for geolocation errors
 */
export const getGeolocationErrorMessage = (error: GeolocationPositionError): string => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Izin lokasi ditolak. Mohon izinkan akses lokasi di pengaturan browser untuk melanjutkan.';
    case error.POSITION_UNAVAILABLE:
      return 'Informasi lokasi tidak tersedia. Pastikan GPS device Anda aktif.';
    case error.TIMEOUT:
      return 'Permintaan lokasi timeout. Silakan coba lagi atau periksa koneksi GPS Anda.';
    default:
      return 'Terjadi kesalahan saat mendapatkan lokasi. Silakan coba lagi.';
  }
};

/**
 * Get user-friendly error message for media device errors
 */
export const getMediaDeviceErrorMessage = (error: DOMException | Error): string => {
  if (error instanceof DOMException) {
    switch (error.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return 'Izin kamera ditolak. Mohon izinkan akses kamera di pengaturan browser untuk melanjutkan.';
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return 'Kamera tidak ditemukan. Pastikan device Anda memiliki kamera.';
      case 'NotReadableError':
      case 'TrackStartError':
        return 'Kamera sedang digunakan oleh aplikasi lain. Silakan tutup aplikasi tersebut dan coba lagi.';
      case 'OverconstrainedError':
      case 'ConstraintNotSatisfiedError':
        return 'Kamera tidak mendukung pengaturan yang diminta.';
      case 'NotSupportedError':
        return 'Browser Anda tidak mendukung akses kamera.';
      case 'AbortError':
        return 'Akses kamera dibatalkan.';
      default:
        return `Terjadi kesalahan dengan kamera: ${error.name}`;
    }
  }
  return 'Terjadi kesalahan saat mengakses kamera. Silakan coba lagi.';
};
