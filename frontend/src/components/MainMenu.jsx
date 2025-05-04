// src/components/EnhancedMainMenu.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, LogOut, User, Users, ChevronRight, 
  LogIn, UserPlus, FileText, Settings, 
  Trash2, Play, RotateCcw, Calendar, Shield
} from 'lucide-react';
import apiHelper from '../services/apiHelper';


const EnhancedMainMenu = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [savedGames, setSavedGames] = useState([]);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showLoadGame, setShowLoadGame] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(1);
  const [deletingGame, setDeletingGame] = useState(null);
  const [gameSlots, setGameSlots] = useState([
    { id: 1, name: "Slot 1", hasCharacter: false, hasParty: false, lastPlayed: null, autoSave: null },
    { id: 2, name: "Slot 2", hasCharacter: false, hasParty: false, lastPlayed: null, autoSave: null },
    { id: 3, name: "Slot 3", hasCharacter: false, hasParty: false, lastPlayed: null, autoSave: null }
  ]);
  
  // Check login status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  // Get saved games when logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchSavedGames();
    }
  }, [isLoggedIn]);
  
  // Check token and user data
  const checkAuthStatus = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const response = await apiHelper.get('/api/auth/me');
        
        if (response.success) {
          setIsLoggedIn(true);
          setUserData(response.data.user);
          // Get saved games for this user
          fetchSavedGames();
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error('Failed to get user data:', error);
        handleLogout();
      }
    }
    
    setLoading(false);
  };
  
  // Fetch saved games and organize by slots
  const fetchSavedGames = async () => {
    try {
      const response = await apiHelper.get('/api/game/saved-games');
      
      if (response.success && response.data.savedGames) {
        setSavedGames(response.data.savedGames);
        
        // Update game slots with saved game info
        const updatedSlots = [...gameSlots];
        
        response.data.savedGames.forEach(save => {
          const slotId = save.slotId || 1;
          const slotIndex = updatedSlots.findIndex(slot => slot.id === slotId);
          
          if (slotIndex !== -1) {
            // Check if this is an auto save
            if (save.isAutoSave) {
              updatedSlots[slotIndex].autoSave = save;
              updatedSlots[slotIndex].hasCharacter = true;
              if (save.partyName) {
                updatedSlots[slotIndex].hasParty = true;
              }
            }
            
            // Update last played time if more recent
            if (!updatedSlots[slotIndex].lastPlayed || 
                new Date(save.updatedAt) > new Date(updatedSlots[slotIndex].lastPlayed)) {
              updatedSlots[slotIndex].lastPlayed = save.updatedAt;
            }
          }
        });
        
        setGameSlots(updatedSlots);
      }
    } catch (error) {
      console.error('Failed to fetch saved games:', error);
    }
  };
  
  // Login form handlers
  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };
  
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);
    
    try {
      const response = await apiHelper.post('/api/auth/login', loginForm);
      
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        setIsLoggedIn(true);
        setUserData(response.data.user);
        setShowLoginForm(false);
        setSuccessMessage('Başarıyla giriş yapıldı!');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(response.message || 'Giriş yapılamadı.');
      }
    } catch (error) {
      setErrorMessage('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Register form handlers
  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };
  
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (registerForm.password !== registerForm.confirmPassword) {
      setErrorMessage('Şifreler eşleşmiyor.');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await apiHelper.post('/api/auth/register', {
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password
      });
      
      if (response.success) {
        setSuccessMessage('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
        setShowRegisterForm(false);
        setShowLoginForm(true);
        
        // Clear register form
        setRegisterForm({ username: '', email: '', password: '', confirmPassword: '' });
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(response.message || 'Kayıt yapılamadı.');
      }
    } catch (error) {
      setErrorMessage('Kayıt yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Register error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserData(null);
    setSavedGames([]);
  };
  
  // Game navigation handlers
  const startSinglePlayer = (slotId) => {
    setSelectedSlot(slotId);
    navigate('/single-player', { state: { slotId } });
  };
  
  const startMultiPlayer = () => {
    navigate('/multi-player');
  };
  
  const goToLoadGame = () => {
    if (isLoggedIn) {
      setShowLoadGame(true);
    } else {
      setShowLoginForm(true);
    }
  };
  
  // Delete saved game
  const handleDeleteSave = async (saveId, e) => {
    e.stopPropagation(); // Prevent triggering parent click events
    
    if (window.confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
      setDeletingGame(saveId);
      
      try {
        const response = await apiHelper.delete(`/api/game/delete-save/${saveId}`);
        
        if (response.success) {
          // Remove from saved games list
          setSavedGames(prev => prev.filter(save => save.id !== saveId));
          setSuccessMessage('Kayıt başarıyla silindi.');
          
          // Clear success message after 3 seconds
          setTimeout(() => setSuccessMessage(''), 3000);
          
          // Refresh saved games
          fetchSavedGames();
        } else {
          setErrorMessage(response.message || 'Kayıt silinemedi.');
        }
      } catch (error) {
        setErrorMessage('Kayıt silinirken bir hata oluştu.');
        console.error('Delete save error:', error);
      } finally {
        setDeletingGame(null);
      }
    }
  };
  
  // Load a saved game
  const handleLoadGame = (save) => {
    navigate(`/game-dashboard?slot=${save.slotId || 1}&saveId=${save.id}`);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Hiç oynanmadı';
    
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-950 to-indigo-950">
      {/* Header with login status */}
      <header className="bg-blue-900/40 border-b border-blue-800 p-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-300 tracking-wider">TÜRKİYE SİYASETİ</h1>
        
        {isLoggedIn ? (
          <div className="flex items-center space-x-4">
            <div className="bg-blue-900/60 p-2 px-4 rounded-full border border-blue-700">
              <span className="text-blue-200">{userData?.username}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-blue-800/50 p-2 rounded-full hover:bg-blue-700/60 transition-all"
              title="Çıkış Yap"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div className="flex space-x-3">
            <button 
              onClick={() => {
                setShowLoginForm(true);
                setShowRegisterForm(false);
              }}
              className="flex items-center bg-blue-800/60 hover:bg-blue-700/70 transition-all py-2 px-4 rounded text-sm"
            >
              <LogIn size={16} className="mr-2" />
              Giriş Yap
            </button>
            <button 
              onClick={() => {
                setShowRegisterForm(true);
                setShowLoginForm(false);
              }}
              className="flex items-center bg-blue-700/60 hover:bg-blue-600/70 transition-all py-2 px-4 rounded text-sm"
            >
              <UserPlus size={16} className="mr-2" />
              Kayıt Ol
            </button>
          </div>
        )}
      </header>
      
      {/* Main content area */}
      <main className="flex-1 flex items-center justify-center p-6 relative">
        {/* Success or error messages */}
        {(successMessage || errorMessage) && (
          <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 p-3 rounded-md ${
            successMessage ? 'bg-green-800/80 border border-green-700' : 'bg-red-800/80 border border-red-700'
          }`}>
            <p className="text-white text-center">
              {successMessage || errorMessage}
            </p>
          </div>
        )}
        
        {/* Loading indicator */}
        {loading && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-30">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Login form overlay */}
        {showLoginForm && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
            <div className="bg-blue-900/90 border border-blue-700 rounded-lg p-6 w-96 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl text-blue-300 font-bold">Giriş Yap</h2>
                <button 
                  onClick={() => setShowLoginForm(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              {errorMessage && (
                <div className="bg-red-900/50 border border-red-800 p-3 rounded mb-4">
                  <p className="text-white text-sm">{errorMessage}</p>
                </div>
              )}
              
              <form onSubmit={handleLoginSubmit}>
                <div className="mb-4">
                  <label className="block text-blue-300 mb-2 text-sm">E-posta</label>
                  <input 
                    type="email"
                    name="email"
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    className="w-full bg-blue-950/70 border border-blue-700 rounded p-3 text-white"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-blue-300 mb-2 text-sm">Şifre</label>
                  <input 
                    type="password"
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    className="w-full bg-blue-950/70 border border-blue-700 rounded p-3 text-white"
                    required
                  />
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-md transition-all"
                  disabled={loading}
                >
                  {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                </button>
              </form>
              
              <div className="mt-4 text-center">
                <p className="text-gray-300 text-sm">
                  Hesabınız yok mu?{' '}
                  <button 
                    onClick={() => {
                      setShowLoginForm(false);
                      setShowRegisterForm(true);
                    }}
                    className="text-blue-300 hover:underline"
                  >
                    Kayıt Ol
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Register form overlay */}
        {showRegisterForm && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
            <div className="bg-blue-900/90 border border-blue-700 rounded-lg p-6 w-96 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl text-blue-300 font-bold">Kayıt Ol</h2>
                <button 
                  onClick={() => setShowRegisterForm(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              {errorMessage && (
                <div className="bg-red-900/50 border border-red-800 p-3 rounded mb-4">
                  <p className="text-white text-sm">{errorMessage}</p>
                </div>
              )}
              
              <form onSubmit={handleRegisterSubmit}>
                <div className="mb-4">
                  <label className="block text-blue-300 mb-2 text-sm">Kullanıcı Adı</label>
                  <input 
                    type="text"
                    name="username"
                    value={registerForm.username}
                    onChange={handleRegisterChange}
                    className="w-full bg-blue-950/70 border border-blue-700 rounded p-3 text-white"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-blue-300 mb-2 text-sm">E-posta</label>
                  <input 
                    type="email"
                    name="email"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                    className="w-full bg-blue-950/70 border border-blue-700 rounded p-3 text-white"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-blue-300 mb-2 text-sm">Şifre</label>
                  <input 
                    type="password"
                    name="password"
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                    className="w-full bg-blue-950/70 border border-blue-700 rounded p-3 text-white"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">Şifre en az 8 karakter, büyük/küçük harf, sayı ve özel karakter içermelidir.</p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-blue-300 mb-2 text-sm">Şifreyi Tekrarla</label>
                  <input 
                    type="password"
                    name="confirmPassword"
                    value={registerForm.confirmPassword}
                    onChange={handleRegisterChange}
                    className="w-full bg-blue-950/70 border border-blue-700 rounded p-3 text-white"
                    required
                  />
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-md transition-all"
                  disabled={loading}
                >
                  {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
                </button>
              </form>
              
              <div className="mt-4 text-center">
                <p className="text-gray-300 text-sm">
                  Zaten hesabınız var mı?{' '}
                  <button 
                    onClick={() => {
                      setShowRegisterForm(false);
                      setShowLoginForm(true);
                    }}
                    className="text-blue-300 hover:underline"
                  >
                    Giriş Yap
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Load Game overlay */}
        {showLoadGame && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
            <div className="bg-blue-900/90 border border-blue-700 rounded-lg p-6 w-3/4 max-w-4xl shadow-xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl text-blue-300 font-bold">Kayıtlı Oyunlar</h2>
                <button 
                  onClick={() => setShowLoadGame(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              {savedGames.length === 0 ? (
                <div className="text-center py-12">
                  <FileText size={48} className="text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-300">Henüz kayıtlı oyununuz bulunmuyor.</p>
                  <button 
                    onClick={() => {
                      setShowLoadGame(false);
                    }}
                    className="mt-4 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white"
                  >
                    Yeni Oyun Başlat
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedGames.map((save) => (
                    <div 
                      key={save.id}
                      onClick={() => handleLoadGame(save)}
                      className="bg-blue-950/70 border border-blue-800 rounded-lg p-4 cursor-pointer hover:border-blue-600 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-blue-300">
                          {save.saveName}
                          {save.isAutoSave && (
                            <span className="ml-2 bg-blue-700 text-xs px-2 py-1 rounded-full">
                              Otomatik
                            </span>
                          )}
                        </h3>
                        {!save.isAutoSave && (
                          <button
                            onClick={(e) => handleDeleteSave(save.id, e)}
                            className="text-red-400 hover:text-red-500"
                            disabled={deletingGame === save.id}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      
                      <div className="mt-3 text-sm">
                        <div className="flex items-center mb-1">
                          <User size={14} className="mr-2 text-gray-400" />
                          <span>{save.characterName || 'İsimsiz Karakter'}</span>
                        </div>
                        
                        {save.partyName && (
                          <div className="flex items-center mb-1">
                            <Shield size={14} className="mr-2 text-gray-400" />
                            <div 
                              className="w-3 h-3 rounded-full mr-1" 
                              style={{ backgroundColor: save.partyColor || '#555555' }}
                            ></div>
                            <span>{save.partyName} ({save.partyShortName})</span>
                          </div>
                        )}
                        
                        <div className="flex items-center mb-1">
                          <Calendar size={14} className="mr-2 text-gray-400" />
                          <span>{formatDate(save.updatedAt)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex justify-end">
                        <button className="flex items-center text-xs bg-blue-700/60 hover:bg-blue-600 px-3 py-1 rounded">
                          Yükle
                          <ChevronRight size={14} className="ml-1" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Main menu content */}
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-cyan-300 mb-2">
              TÜRKİYE SİYASET SİMÜLASYONU
            </h1>
            <p className="text-blue-300 text-lg">Türkiye'nin politik arenasında kendi yolunuzu çizin</p>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gameplay options */}
            <div className="bg-blue-900/30 border border-blue-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-blue-300 mb-4">Oyun Seçenekleri</h2>
              
              <button
                onClick={startMultiPlayer}
                className="w-full bg-blue-800/60 hover:bg-blue-700/80 text-white p-4 rounded-lg mb-4 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Users size={24} className="mr-3 text-blue-300" />
                  <span className="text-lg">Çok Oyunculu Mod</span>
                </div>
                <ChevronRight size={20} />
              </button>
              
              <button
                onClick={goToLoadGame}
                className="w-full bg-blue-800/60 hover:bg-blue-700/80 text-white p-4 rounded-lg mb-4 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Save size={24} className="mr-3 text-blue-300" />
                  <span className="text-lg">Kayıtlı Oyun Yükle</span>
                </div>
                <ChevronRight size={20} />
              </button>
              
              <button
                onClick={() => setShowLoadGame(true)}
                className="w-full bg-blue-800/60 hover:bg-blue-700/80 text-white p-4 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Settings size={24} className="mr-3 text-blue-300" />
                  <span className="text-lg">Oyun Ayarları</span>
                </div>
                <ChevronRight size={20} />
              </button>
            </div>
            
            {/* Game slots */}
            <div className="bg-blue-900/30 border border-blue-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-blue-300 mb-4">Oyun Slotları</h2>
              
              {gameSlots.map((slot) => (
                <div 
                  key={slot.id}
                  className={`
                    bg-blue-800/40 border border-blue-700 rounded-lg p-4 mb-3
                    ${slot.hasCharacter ? 'cursor-pointer hover:bg-blue-700/50' : 'opacity-80'}
                  `}
                  onClick={() => slot.hasCharacter ? startSinglePlayer(slot.id) : null}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-300">
                        {slot.name}
                        {slot.autoSave && (
                          <span className="ml-2 bg-blue-700 text-xs px-2 py-1 rounded-full">
                            Kayıtlı
                          </span>
                        )}
                      </h3>
                      
                      {slot.lastPlayed ? (
                        <div className="text-xs text-gray-300 mt-1">
                          Son oynama: {formatDate(slot.lastPlayed)}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 mt-1">
                          Bu slot hiç kullanılmamış
                        </div>
                      )}
                    </div>
                    
                    <div className="flex">
                      {slot.hasCharacter ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startSinglePlayer(slot.id);
                          }}
                          className="flex items-center text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded mr-2"
                        >
                          <Play size={14} className="mr-1" />
                          Oyna
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startSinglePlayer(slot.id);
                          }}
                          className="flex items-center text-xs bg-green-600 hover:bg-green-500 px-3 py-1 rounded mr-2"
                        >
                          <Play size={14} className="mr-1" />
                          Yeni Oyun
                        </button>
                      )}
                      
                      {slot.autoSave && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            slot.autoSave && handleLoadGame(slot.autoSave);
                          }}
                          className="flex items-center text-xs bg-amber-600 hover:bg-amber-500 px-3 py-1 rounded"
                          title="Son kaydedilen oyunu yükle"
                        >
                          <RotateCcw size={14} className="mr-1" />
                          Son Kayıt
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {slot.autoSave && slot.autoSave.characterName && (
                    <div className="mt-3 bg-blue-900/50 p-2 rounded text-sm">
                      <div className="flex items-center mb-1">
                        <User size={14} className="mr-2 text-gray-400" />
                        <span>{slot.autoSave.characterName}</span>
                      </div>
                      
                      {slot.autoSave.partyName && (
                        <div className="flex items-center">
                          <Shield size={14} className="mr-2 text-gray-400" />
                          <div 
                            className="w-3 h-3 rounded-full mr-1" 
                            style={{ backgroundColor: slot.autoSave.partyColor || '#555555' }}
                          ></div>
                          <span>{slot.autoSave.partyName} ({slot.autoSave.partyShortName})</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-blue-900/40 border-t border-blue-800 p-3 text-center">
        <p className="text-gray-400 text-sm">
          &copy; 2025 Türkiye Siyaset Simülasyonu
        </p>
      </footer>
    </div>
  );
};

export default EnhancedMainMenu;
