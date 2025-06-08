// frontend/src/services/apiHelper.js
import axios from 'axios';

// API temel URL'si
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.turkiyesiyaseti.net';

// API bağlantı durumunu test eden fonksiyon
export const testApiConnection = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/health-check`, { timeout: 5000 });
    return {
      success: true,
      status: response.status,
      message: 'API bağlantısı başarılı'
    };
  } catch (error) {
    console.error('API bağlantı hatası:', error);
    
    // Sunucuya ulaşılamadı
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      return {
        success: false,
        status: 0,
        message: 'Backend sunucusuna bağlantı kurulamadı. Sunucunun çalıştığından emin olun.',
        error
      };
    }
    
    // İstek zaman aşımına uğradı
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        status: 0,
        message: 'İstek zaman aşımına uğradı. Sunucu yanıt vermiyor olabilir.',
        error
      };
    }
    
    // Diğer API hatası
    return {
      success: false,
      status: error.response?.status || 0,
      message: error.response?.data?.message || error.message,
      error
    };
  }
};

// API istek fonksiyonu
export const apiRequest = async (method, endpoint, data = null, extraHeaders = {}) => {
  try {
    // Token kontrolü
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...extraHeaders
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    // Tam URL oluştur
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log(`API isteği yapılıyor: ${method.toUpperCase()} ${url}`, data);
    
    // CORS ayarlarını ekle
    const config = {
      method,
      url,
      headers,
      withCredentials: false, // CORS sorunları varsa bunu açın
      ...(data && { data })
    };
    
    const response = await axios(config);
    
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    console.error(`API isteği hatası (${method.toUpperCase()} ${endpoint}):`, error);
    
    // Daha detaylı hata bilgisi
    if (error.response) {
      // Sunucudan dönen hata yanıtı
      console.error('Sunucu yanıtı:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Token süresi dolmuş
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        
        return {
          success: false,
          status: 401,
          message: 'Oturum süreniz dolmuş. Lütfen yeniden giriş yapın.',
          error,
          authError: true
        };
      }
      
      // Endpoint bulunamadı
      if (error.response.status === 404) {
        return {
          success: false,
          status: 404,
          message: 'İstek yapılan endpoint bulunamadı.',
          error,
          notFoundError: true
        };
      }
      
      // Sunucu hatası
      return {
        success: false,
        status: error.response.status,
        message: error.response.data?.message || 'Sunucu hatası',
        data: error.response.data,
        error
      };
    }
    
    // Ağ hatası
    if (error.request) {
      console.error('Ağ hatası:', error.request);
      return {
        success: false,
        status: 0,
        message: 'Backend sunucusuna bağlantı kurulamadı.',
        error,
        networkError: true
      };
    }
    
    // Diğer hatalar
    return {
      success: false,
      status: 0,
      message: error.message,
      error
    };
  }
};

// Basitleştirilmiş API işlemleri
const api = {
  get: (endpoint, extraHeaders = {}) => apiRequest('get', endpoint, null, extraHeaders),
  post: (endpoint, data, extraHeaders = {}) => apiRequest('post', endpoint, data, extraHeaders),
  put: (endpoint, data, extraHeaders = {}) => apiRequest('put', endpoint, data, extraHeaders),
  delete: (endpoint, extraHeaders = {}) => apiRequest('delete', endpoint, null, extraHeaders),
  testConnection: testApiConnection
};

export default api;
