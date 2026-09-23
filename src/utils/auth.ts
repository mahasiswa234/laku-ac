/**
 * Authentication and JWT Session Validation Utilities
 */

export interface AuthVerifyResult {
  valid: boolean;
  user?: any;
  message?: string;
  statusCode?: number;
}

export function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

export function getStoredUser(): any | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function clearAuthSession(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

/**
 * Validasi token JWT ke server backend secara asynchronous.
 * Mencegah manipulasi localStorage oleh user di browser.
 */
export async function verifyServerSession(expectedRole?: 'admin' | 'technician' | 'customer'): Promise<AuthVerifyResult> {
  const token = getAuthToken();

  if (!token) {
    clearAuthSession();
    return {
      valid: false,
      message: 'Token otentikasi tidak ditemukan. Silakan login terlebih dahulu.',
      statusCode: 401
    };
  }

  try {
    const url = expectedRole 
      ? `/api/auth/verify?role=${encodeURIComponent(expectedRole)}` 
      : '/api/auth/verify';

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.valid) {
      // Token tidak valid, expired, atau role mismatch
      clearAuthSession();
      return {
        valid: false,
        message: data.message || 'Sesi otentikasi tidak valid atau telah kedaluwarsa.',
        statusCode: response.status
      };
    }

    // Token valid, sinkronisasi data user terbaru
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return {
      valid: true,
      user: data.user,
      message: 'Sesi valid'
    };
  } catch (error: any) {
    console.error('Session verification error:', error);
    // Jika ada offline network glitch, cek apakah ada token & validasi dasar
    return {
      valid: false,
      message: 'Gagal menghubungkan ke server untuk memvalidasi sesi keamanan.',
      statusCode: 500
    };
  }
}

/**
 * Helper fetch yang otomatis menyertakan Authorization Bearer JWT token
 */
export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(init?.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const newInit: RequestInit = {
    ...init,
    headers
  };

  const response = await fetch(input, newInit);

  // Jika token ditolak di level API (401 / 403 token invalid)
  if (response.status === 401) {
    const cloned = response.clone();
    try {
      const errorData = await cloned.json();
      if (errorData.message && (errorData.message.includes('Token') || errorData.message.includes('token') || errorData.message.includes('Akses ditolak'))) {
        clearAuthSession();
        window.location.href = '/login?expired=1';
      }
    } catch (_) {
      // ignore
    }
  }

  return response;
}

let interceptorInitialized = false;

/**
 * Global HTTP Interceptor untuk browser.
 * Menyuntikkan JWT Bearer token secara otomatis ke setiap panggilan fetch('/api/*')
 * dan menangani masa berlaku sesi kedaluwarsa secara otomatis.
 */
export function setupAuthInterceptor(): void {
  if (interceptorInitialized || typeof window === 'undefined' || typeof window.fetch !== 'function') return;
  interceptorInitialized = true;

  try {
    const originalFetch = window.fetch.bind(window);

    const interceptedFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' 
        ? input 
        : input instanceof URL 
          ? input.href 
          : (input as Request).url;

      const token = getAuthToken();

      // Otomatis sertakan header Authorization untuk endpoint internal /api/ kecuali login/register publik
      if (
        token &&
        (url.startsWith('/api/') || url.includes('/api/')) &&
        !url.includes('/api/auth/login') &&
        !url.includes('/api/auth/register')
      ) {
        init = init || {};
        const headers = new Headers(init.headers || {});
        if (!headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${token}`);
        }
        init.headers = headers;
      }

      const response = await originalFetch(input, init);

      // Tangani token kedaluwarsa atau manipulasi token tidak sah dari backend
      if (response.status === 401 && (url.startsWith('/api/') || url.includes('/api/')) && !url.includes('/api/auth/login')) {
        const currentPath = window.location.pathname;
        const isDashboardRoute = currentPath.startsWith('/admin') || 
                                 currentPath.startsWith('/teknisi') || 
                                 currentPath.startsWith('/pelanggan');

        if (isDashboardRoute) {
          clearAuthSession();
          if (!currentPath.includes('/login')) {
            window.location.replace('/login?expired=1');
          }
        }
      }

      return response;
    };

    // Gunakan Object.defineProperty untuk mendefinisikan property 'fetch' langsung pada window
    // Ini mencegah 'TypeError: setting getter-only property "fetch"' di browser (seperti Firefox atau iframe environment)
    try {
      Object.defineProperty(window, 'fetch', {
        value: interceptedFetch,
        writable: true,
        configurable: true,
        enumerable: true
      });
    } catch (defineErr) {
      try {
        // Fallback jika defineProperty ditolak
        window.fetch = interceptedFetch;
      } catch (assignErr) {
        console.warn('Gagal menimpa window.fetch:', assignErr);
      }
    }
  } catch (err) {
    console.warn('Auth interceptor tidak dapat diinisialisasi:', err);
  }
}
