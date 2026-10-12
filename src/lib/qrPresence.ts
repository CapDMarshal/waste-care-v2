import crypto from 'crypto';

const TOKEN_TTL_SECONDS = 60;
const GRACE_PERIOD_MS = 15000; // 15 seconds grace period for network latency / clock skew

function getSecretKey(): string {
  const secret = process.env.QR_PRESENCE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error(
      '[qrPresence] Kunci rahasia presensi (QR_PRESENCE_SECRET atau SUPABASE_SERVICE_ROLE_KEY) belum dikonfigurasi di environment variables server.'
    );
  }
  return secret;
}

export interface GeneratedToken {
  token: string;
  campaignId: number;
  expiresAt: number; // Unix timestamp in ms
}

export interface VerificationResult {
  valid: boolean;
  campaignId?: number;
  error?: 'INVALID_FORMAT' | 'INVALID_SIGNATURE' | 'TOKEN_EXPIRED';
  message?: string;
}

/**
 * Generates a cryptographically signed dynamic QR token for campaign check-in.
 * Payload: campaignId:expiresAt:salt
 * Signature: HMAC-SHA256
 */
export function generatePresenceToken(campaignId: number, ttlSeconds = TOKEN_TTL_SECONDS): GeneratedToken {
  const secret = getSecretKey();
  const now = Date.now();
  const expiresAt = now + ttlSeconds * 1000;
  const salt = crypto.randomBytes(8).toString('hex');

  const payload = `${campaignId}:${expiresAt}:${salt}`;
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  const rawToken = `${payload}:${hmac}`;
  const encodedToken = Buffer.from(rawToken, 'utf8').toString('base64url');

  return {
    token: encodedToken,
    campaignId,
    expiresAt,
  };
}

/**
 * Verifies a dynamic QR token's cryptographic integrity and expiration time.
 */
export function verifyPresenceToken(token: string): VerificationResult {
  try {
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'INVALID_FORMAT', message: 'Token presensi tidak valid atau kosong.' };
    }

    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split(':');

    if (parts.length !== 4) {
      return { valid: false, error: 'INVALID_FORMAT', message: 'Format token presensi tidak dikenali.' };
    }

    const [campaignIdStr, expiresAtStr, salt, providedSignature] = parts;
    const campaignId = parseInt(campaignIdStr, 10);
    const expiresAt = parseInt(expiresAtStr, 10);

    if (isNaN(campaignId) || isNaN(expiresAt)) {
      return { valid: false, error: 'INVALID_FORMAT', message: 'Data dalam token presensi rusak.' };
    }

    // Verify HMAC
    const secret = getSecretKey();
    const payload = `${campaignIdStr}:${expiresAtStr}:${salt}`;
    const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const providedBuffer = Buffer.from(providedSignature, 'hex');

    if (expectedBuffer.length !== providedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, providedBuffer)) {
      return {
        valid: false,
        error: 'INVALID_SIGNATURE',
        message: 'Tanda tangan kriptografis token tidak valid (kemungkinan telah dipalsukan).',
      };
    }

    // Verify Expiration (with grace period)
    const now = Date.now();
    if (now > expiresAt + GRACE_PERIOD_MS) {
      return {
        valid: false,
        error: 'TOKEN_EXPIRED',
        message: 'Kode QR presensi telah kedaluwarsa. Silakan minta admin menampilkan kode QR terbaru.',
      };
    }

    return {
      valid: true,
      campaignId,
    };
  } catch (err) {
    return {
      valid: false,
      error: 'INVALID_FORMAT',
      message: 'Gagal memverifikasi token presensi: ' + (err instanceof Error ? err.message : String(err)),
    };
  }
}
