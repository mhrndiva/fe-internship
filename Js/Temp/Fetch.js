import { API_URLS } from '../config/url.js';

/**
 * Kelas untuk mengelola permintaan HTTP ke API
 */
class FetchService {
  /**
   * Melakukan request ke API dengan konfigurasi default
   * @param {string} url - URL endpoint
   * @param {object} options - Opsi fetch tambahan
   * @returns {Promise} Promise hasil fetch
   */
  async fetchWithConfig(url, options = {}) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token')
          ? { Authorization: `Bearer ${localStorage.getItem('token')}` }
          : {}),
      },
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });

      // Coba parse JSON, atau tangani jika tidak bisa
      let data;
      try {
        data = await response.json();
      } catch {
        data = { message: 'Response tidak valid' };
      }

      if (!response.ok) {
        throw new Error(data.message || 'Terjadi kesalahan pada server');
      }

      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      throw new Error(error.message || 'Koneksi ke server gagal');
    }
  }

  /**
   * Register user baru
   * @param {object} userData - Data registrasi (username, password, phone_number)
   * @returns {Promise} Promise dengan data user baru
   */
  async register(userData) {
    try {
      const data = await this.fetchWithConfig(API_URLS.register, {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      // Jika backend mengembalikan token, simpan otomatis
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      return data;
    } catch (error) {
      throw new Error(error.message || 'Registrasi gagal');
    }
  }

  /**
   * Login user dan simpan token jika berhasil
   * @param {{username:string,password:string}} credentials
   */
  async login(credentials) {
    try {
      const data = await this.fetchWithConfig(API_URLS.login, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      throw new Error(error.message || 'Login gagal');
    }
  }

  /**
   * Cek apakah user sudah login (token tersimpan)
   * @returns {boolean}
   */
  isLoggedIn() {
    return !!localStorage.getItem('token');
  }

  /**
   * Logout pengguna dan bersihkan penyimpanan
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

// Export instance tunggal
export const fetchService = new FetchService();
export default fetchService;
