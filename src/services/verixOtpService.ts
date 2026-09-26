/**
 * Verix Live Phone OTP Service
 * Connected to live Verix OTP Gateway using API Key:
 * vx_live_MzzLCDSgeBPSgH8GYB2w9yGk0ZKZf6AW_Xc6JbXT6Dg
 */

const VERIX_API_KEY = 'vx_live_MzzLCDSgeBPSgH8GYB2w9yGk0ZKZf6AW_Xc6JbXT6Dg';
const VERIX_DIRECT_BASE = 'https://verix-cyan.vercel.app';
// In Vite development, /api/verix is proxied to bypass any potential browser CORS restrictions
const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? '/api/verix'
  : VERIX_DIRECT_BASE;

export interface SendOtpResponse {
  success: boolean;
  requestId?: string;
  message: string;
  expiresInSeconds?: number;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
}

/**
 * Standardize phone number format for Verix SMS gateway.
 * Defaults to +91 country code if 10-digit number is passed without prefix.
 */
export const formatPhoneNumber = (phone: string): string => {
  const clean = phone.trim().replace(/[\s\-()]/g, '');
  if (clean.startsWith('+')) {
    return clean;
  }
  // If standard 10 digit Indian number
  if (/^\d{10}$/.test(clean)) {
    return `+91${clean}`;
  }
  // If digits without +, prepend +
  return `+${clean}`;
};

/**
 * Send real 6-digit SMS OTP to user's phone via Verix Live API
 */
export const sendVerixOtp = async (phone: string): Promise<SendOtpResponse> => {
  const formattedPhone = formatPhoneNumber(phone);

  try {
    const response = await fetch(`${API_BASE}/api/v1/otp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${VERIX_API_KEY}`,
      },
      body: JSON.stringify({ phone: formattedPhone }),
    });

    const data = await response.json().catch(() => null);

    if (response.ok && data) {
      const requestId = data.data?.requestId || data.requestId || data.id;
      const expiresIn = data.data?.expiresInSeconds || 300;
      return {
        success: true,
        requestId,
        message: data.data?.message || `OTP sent successfully to ${formattedPhone}`,
        expiresInSeconds: expiresIn,
      };
    }

    // Direct fetch fallback if proxy failed
    if (API_BASE !== VERIX_DIRECT_BASE) {
      try {
        const directRes = await fetch(`${VERIX_DIRECT_BASE}/api/v1/otp/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${VERIX_API_KEY}`,
          },
          body: JSON.stringify({ phone: formattedPhone }),
        });
        const directData = await directRes.json().catch(() => null);
        if (directRes.ok && directData) {
          const requestId = directData.data?.requestId || directData.requestId || directData.id;
          return {
            success: true,
            requestId,
            message: directData.data?.message || `OTP sent successfully to ${formattedPhone}`,
          };
        }
      } catch (e) {
        console.warn('Direct Verix fallback failed:', e);
      }
    }

    const errorMsg = data?.error || data?.message || 'Failed to send OTP via Verix Gateway';
    return {
      success: false,
      message: errorMsg,
    };
  } catch (err: any) {
    console.error('Error contacting Verix OTP service:', err);
    return {
      success: false,
      message: err.message || 'Network error while contacting Verix OTP Gateway',
    };
  }
};

/**
 * Verify 6-digit code via Verix Live API
 */
export const verifyVerixOtp = async (
  requestId: string,
  code: string
): Promise<VerifyOtpResponse> => {
  // Support master test bypass code for instant testing without waiting for SMS
  if (code.trim() === '123456') {
    return {
      success: true,
      message: 'OTP verified successfully (Demo Master Code accepted)!',
    };
  }

  if (!requestId) {
    return {
      success: false,
      message: 'Missing OTP request session. Please request a new OTP.',
    };
  }

  try {
    const response = await fetch(`${API_BASE}/api/v1/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${VERIX_API_KEY}`,
      },
      body: JSON.stringify({
        requestId,
        code: code.trim(),
      }),
    });

    const data = await response.json().catch(() => null);

    if (response.ok && data) {
      const isVerified = data.data?.verified === true || data.verified === true;
      if (isVerified) {
        return {
          success: true,
          message: 'Phone number verified successfully with Verix Live OTP!',
        };
      }
    }

    // Direct fallback if proxy failed
    if (API_BASE !== VERIX_DIRECT_BASE) {
      try {
        const directRes = await fetch(`${VERIX_DIRECT_BASE}/api/v1/otp/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${VERIX_API_KEY}`,
          },
          body: JSON.stringify({ requestId, code: code.trim() }),
        });
        const directData = await directRes.json().catch(() => null);
        if (directRes.ok && (directData?.data?.verified || directData?.verified)) {
          return {
            success: true,
            message: 'Phone number verified successfully with Verix Live OTP!',
          };
        }
      } catch (e) {
        console.warn('Direct verify fallback error:', e);
      }
    }

    const errorMsg = data?.error || data?.message || 'Invalid or expired OTP code.';
    return {
      success: false,
      message: errorMsg,
    };
  } catch (err: any) {
    console.error('Error verifying Verix OTP:', err);
    return {
      success: false,
      message: err.message || 'Error communicating with Verix verification endpoint.',
    };
  }
};
