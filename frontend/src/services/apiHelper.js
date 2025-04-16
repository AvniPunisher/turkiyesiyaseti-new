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

// API isteği yapan yardımcı fonksiyon
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
    
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers,
      ...(data && { data })
    };
    
    console.log(`API isteği yapılıyor: ${method.toUpperCase()} ${endpoint}`);
    const response = await axios(config);
    
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    console.error(`API isteği hatası (${method.toUpperCase()} ${endpoint}):`, error);
    
    // Token süresi dolmuş
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      
      return {
        success: false,
        status: 401,
        message: 'Oturum süreniz dolmuş. Lütfen yeniden giriş yapın.',
        error,
        authError: true
      };
    }
    
    // Ağ hatası
    if (error.code === 'ERR_NETWORK') {
      return {
        success: false,
        status: 0,
        message: 'Backend sunucusuna bağlantı kurulamadı.',
        error,
        networkError: true
      };
    }
    
    // Sunucu hatası
    return {
      success: false,
      status: error.response?.status || 0,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
      error
    };
  }
};

export default {
  get: (endpoint, extraHeaders = {}) => apiRequest('get', endpoint, null, extraHeaders),
  post: (endpoint, data, extraHeaders = {}) => apiRequest('post', endpoint, data, extraHeaders),
  put: (endpoint, data, extraHeaders = {}) => apiRequest('put', endpoint, data, extraHeaders),
  delete: (endpoint, extraHeaders = {}) => apiRequest('delete', endpoint, null, extraHeaders),
  testConnection: testApiConnection
};