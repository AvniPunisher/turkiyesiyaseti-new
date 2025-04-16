// frontend/src/services/apiService.js
import axios from 'axios';

// Yapılandırma
const API_CONFIG = {
  BASE_URL: 'https://api.turkiyesiyaseti.net',
  TIMEOUT: 10000, // 10 saniye
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Axios instance oluştur
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS
});

// Request interceptor
apiClient.interceptors.request.use(
  config => {
    // Her istekte token ekle
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Global hata yönetimi
    if (error.response) {
      // Sunucu yanıtı ile dönen hatalar (4xx, 5xx)
      const { status, data } = error.response;
      
      // 401 Unauthorized - Token süresi dolmuş veya geçersiz
      if (status === 401) {
        // Token'ı temizle ve login sayfasına yönlendir
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      // 403 Forbidden - Yetkisiz erişim
      if (status === 403) {
        console.error('Bu işlem için yetkiniz yok');
      }
      
      // 500 Server Error - Sunucu hatası
      if (status >= 500) {
        console.error('Sunucu hatası, lütfen daha sonra tekrar deneyin');
      }
    } else if (error.request) {
      // İstek yapıldı ama yanıt alınamadı
      console.error('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin');
    } else {
      // İstek oluşturulurken bir şeyler yanlış gitti
      console.error('İstek gönderilirken bir hata oluştu:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  login: credentials => apiClient.post('/api/auth/login', credentials),
  register: userData => apiClient.post('/api/auth/register', userData),
  getProfile: () => apiClient.get('/api/auth/me')
};

// Game API endpoints
export const gameAPI = {
  // Karakter işlemleri
  createCharacter: characterData => apiClient.post('/api/game/create-character', { character: characterData }),
  getCharacter: () => apiClient.get('/api/game/get-character'),
  updateCharacter: characterData => apiClient.put('/api/game/update-character', { character: characterData }),
  deleteCharacter: () => apiClient.delete('/api/game/delete-character'),
  
  // Oyun kayıt işlemleri
  saveGame: (gameData, saveName, saveSlot = 1) => 
    apiClient.post('/api/game/save-game', { gameData, saveName, saveSlot }),
  getSavedGames: () => apiClient.get('/api/game/saved-games'),
  loadGame: saveId => apiClient.get(`/api/game/load-game/${saveId}`),
  deleteGame: saveId => apiClient.delete(`/api/game/delete-save/${saveId}`)
};

// Multiplayer API endpoints
export const multiplayerAPI = {
  createSession: sessionData => apiClient.post('/api/game/create-session', sessionData),
  joinSession: (sessionCode, playerData) => apiClient.post(`/api/game/join-session/${sessionCode}`, { playerData }),
  leaveSession: sessionId => apiClient.post(`/api/game/leave-session/${sessionId}`),
  getSessionData: sessionId => apiClient.get(`/api/game/session/${sessionId}`)
};

export default {
  authAPI,
  gameAPI,
  multiplayerAPI,
  // Özel istekler için client'ı dışa aktar
  client: apiClient
};
