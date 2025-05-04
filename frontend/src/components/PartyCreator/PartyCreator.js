// src/components/PartyCreator/PartyCreator.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PartyCreator.css';

// Import the enhanced API service
import APIService from '../../services/APIService';

// JSON verileri
import ideologyAxes from '../../data/ideologies.json';
import partyColors from '../../data/partyColors.json';

// Yardımcı renk kontrastı hesaplama fonksiyonu
const getContrastColor = (hexColor) => {
  // Varsayılan değer
  if (!hexColor) return "#ffffff";
  
  // HEX'i RGB'ye dönüştür
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Rengin parlaklığını hesapla (basit formül: 0.299R + 0.587G + 0.114B)
  const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
  
  // Parlaklık 128'den düşükse (0-255 aralığında) beyaz döndür, değilse siyah
  return brightness < 128 ? "#ffffff" : "#000000";
};

const PartyCreator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const slotId = location.state?.slotId || 1;
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [party, setParty] = useState({
    name: '',
    shortName: '',
    colorId: '#d32f2f',
    slotId: slotId, // Slot ID'yi başlangıçta ekle
    // İdeoloji değerleri (0-100 arası)
    ideology: {
      economic: 50,
      cultural: 50,
      diplomatic: 50,
      social: 50,
      government: 50,
      overallPosition: 50
    },
    // Parti lideri (şimdilik karakter adını kullanacağız)
    founderId: null,
    founderName: ''
  });
  
  // Karakter verisini de tutalım
  const [character, setCharacter] = useState(null);

  // Sayfa yüklendiğinde API durumunu kontrol et
  useEffect(() => {
    const checkApiStatus = async () => {
      const isAvailable = await APIService.checkConnection();
      setApiAvailable(isAvailable);
      
      if (!isAvailable) {
        console.log("API is not available. Using offline mode.");
      }
    };
    
    checkApiStatus();
  }, []);

  // Karakter bilgisini getir
  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Parti oluşturmak için önce karakter oluşturmanız gerekmektedir.');
          navigate('/character-creator');
          return;
        }

        // Karakter bilgilerini API'den al (slot id ile)
        const response = await APIService.get(`/api/game/get-character/${slotId}`);
        
        if (response.success && response.data?.character) {
          const characterData = response.data.character;
          setCharacter(characterData);
          setParty(prev => ({
            ...prev,
            founderId: characterData.id,
            founderName: characterData.fullName,
            slotId: slotId,
            ideology: { ...characterData.ideology }
          }));
        } else {
          // LocalStorage'dan veri almayı dene
          const storedCharacter = localStorage.getItem('character');
          if (storedCharacter) {
            const characterData = JSON.parse(storedCharacter);
            setCharacter(characterData);
            setParty(prev => ({
              ...prev,
              founderId: characterData.id || 1,
              founderName: characterData.fullName || 'Karakter Adı',
              ideology: characterData.ideology || prev.ideology
            }));
          } else {
            console.log('Karakter bilgisi alınamadı.');
            alert('Karakter bilgisi alınamadı. Lütfen önce karakter oluşturun.');
            navigate('/character-creator');
          }
        }
      } catch (error) {
        console.error("Karakter bilgisi getirme hatası:", error);
        // LocalStorage'dan veri almayı dene
        const storedCharacter = localStorage.getItem('character');
        if (storedCharacter) {
          const characterData = JSON.parse(storedCharacter);
          setCharacter(characterData);
          setParty(prev => ({
            ...prev,
            founderId: characterData.id || 1,
            founderName: characterData.fullName || 'Karakter Adı',
            ideology: characterData.ideology || prev.ideology
          }));
        } else {
          alert('Karakter bilgilerine erişilemedi. Lütfen önce karakter oluşturun.');
          navigate('/character-creator');
        }
      }
    };

    fetchCharacter();
  }, [navigate, slotId]);

  // İdeolojik etiketler
  const getIdeologicalLabel = (position) => {
    if (position < 20) return "Sol";
    if (position < 40) return "Merkez Sol";
    if (position < 60) return "Merkez";
    if (position < 80) return "Merkez Sağ";
    return "Sağ";
  };

  // İdeoloji pozisyon adı
  const getPositionName = (axis, value) => {
    const positions = ideologyAxes[axis]?.positions || ["Pozisyon 1", "Pozisyon 2", "Pozisyon 3", "Pozisyon 4", "Pozisyon 5"];
    const index = Math.floor(value / (100 / (positions.length - 1)));
    return positions[Math.min(index, positions.length - 1)];
  };

  // Genel ideolojik pozisyon hesaplayıcı
  const calculateOverallPosition = (values) => {
    // Karakter oluşturma ekranındaki ile aynı hesaplama mantığını kullan
    let totalWeight = 0;
    let weightedSum = 0;
    
    for (const axis in ideologyAxes) {
      if (values[axis] !== undefined) {
        const weight = ideologyAxes[axis]?.weight || 1;
        weightedSum += values[axis] * weight;
        totalWeight += weight;
      }
    }
    
    return totalWeight > 0 ? weightedSum / totalWeight : 50;
  };

  // İdeoloji değerini güncelleyen fonksiyon
  const handleIdeologyChange = (axis, value) => {
    // Slider'ı sabit 5 pozisyona ayarla (0, 25, 50, 75, 100)
    const positions = [0, 25, 50, 75, 100];
    const closestPosition = positions.reduce((prev, curr) => 
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
    
    const newIdeology = { ...party.ideology, [axis]: closestPosition };
    const overallPosition = calculateOverallPosition(newIdeology);
    
    setParty({
      ...party,
      ideology: {
        ...newIdeology,
        overallPosition
      }
    });
  };

  // Form input değişikliklerini izleyen fonksiyon
  const handleInputChange = (field, value) => {
    setParty({
      ...party,
      [field]: value
    });
  };

  // Renk seçimi 
  const handleColorSelect = (color) => {
    setParty({
      ...party, 
      colorId: color
    });
  };

  // Tab değiştirme fonksiyonu
  const changeTab = (tabIndex) => {
    // Tab değiştirme kontrolü
    if (tabIndex === 1 && (!party.name || !party.shortName)) {
      return; // Gerekli alanlar dolmadıysa tab değiştirme
    }
    setCurrentTab(tabIndex);
  };

  // İlerle butonu ile tab 2'ye geçiş
  const proceedToNextTab = () => {
    if (party.name && party.shortName) {
      setCurrentTab(1);
    }
  };

  // Seçilen renk bilgisini al
  const getTextColorForBadge = (hexColor) => {
    return getContrastColor(hexColor);
  };

 const createParty = async () => {
  try {
    setLoading(true);
    console.log("Parti oluşturuluyor:", party, "Slot ID:", slotId);
    
    // Token kontrolü
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Parti oluşturmak için giriş yapmanız gerekmektedir.');
      navigate('/login', { state: { returnUrl: '/party-creator' } });
      return;
    }
    
    // Formda eksik alan kontrolü
    if (!party.name || !party.shortName || !party.colorId || !party.founderId) {
      alert('Lütfen tüm gerekli alanları doldurun.');
      setLoading(false);
      return;
    }
    
    // Parti verilerini localStorage'a kaydet (API başarısız olursa yedek olarak)
    try {
      localStorage.setItem('partyData', JSON.stringify(party));
    } catch (storageError) {
      console.warn("Parti verileri localStorage'a kaydedilemedi:", storageError);
    }
    
    // Parti verisini API'ye gönder
    try {
      const response = await apiHelper.post('/api/game/create-party', { 
        party: party,
        slotId: slotId
      });
      
      console.log("API yanıtı:", response);

      if (response.success) {
        alert('Parti başarıyla oluşturuldu!');
        
        // Doğrudan Game Dashboard'a yönlendir
        navigate('/game-dashboard', { 
          state: { 
            party: response.data.party || party,
            character: character,
            slotId: slotId,
            newGame: true
          } 
        });
      } else {
        // API yanıt hatası
        if (response.authError) {
          alert("Oturum süreniz dolmuş. Lütfen yeniden giriş yapın.");
          navigate('/login', { state: { returnUrl: '/party-creator' } });
        } else {
          console.error("API yanıt hatası:", response.error);
          alert(`Parti oluşturulurken bir hata oluştu: ${response.message}. Ancak offline modda devam edebilirsiniz.`);
          
          // API hatası olsa bile oyun ekranına yönlendir
          navigate('/game-dashboard', { 
            state: { 
              party: party,
              character: character,
              slotId: slotId,
              offlineMode: true,
              newGame: true
            } 
          });
        }
      }
    } catch (apiError) {
      console.error("API hatası:", apiError);
      alert('Sunucuya bağlanılamadı, ancak offline modda devam edebilirsiniz.');
      
      // API hatası olsa bile oyun ekranına yönlendir
      navigate('/game-dashboard', { 
        state: { 
          party: party,
          character: character,
          slotId: slotId,
          offlineMode: true,
          newGame: true
        } 
      });
    }
  } catch (error) {
    console.error("Beklenmeyen hata:", error);
    alert(`Beklenmeyen bir hata oluştu: ${error.message}. Offline modda devam edebilirsiniz.`);
    
    // Hata olsa bile oyun ekranına yönlendir
    navigate('/game-dashboard', { 
      state: { 
        party: party,
        character: character,
        slotId: slotId,
        offlineMode: true,
        newGame: true
      } 
    });
  } finally {
    setLoading(false);
  }
};

  // Önceki sayfaya dönme fonksiyonu
  const handleGoBack = () => {
    navigate('/single-player', { state: { slotId: slotId } });
  };

  // İdeoloji etiketlerini oluştur
  const getIdeologyTags = () => {
    const tags = [];
    
    for (const axis in ideologyAxes) {
      if (party.ideology[axis] !== undefined) {
        const position = getPositionName(axis, party.ideology[axis]);
        tags.push({
          axis: ideologyAxes[axis]?.name || axis,
          position
        });
      }
    }
    
    return tags;
  };

  return (
    <div className="party-container">
      <div className="party-header">
        <h1 className="party-title">Parti Oluşturma</h1>
      </div>
      
      <div className="party-content">
        {/* Tab Menüsü */}
        <div className="tab-menu">
          <button 
            className={`tab-button ${currentTab === 0 ? 'active' : ''}`}
            onClick={() => changeTab(0)}
          >
            Parti Bilgileri
          </button>
          <button 
            className={`tab-button ${currentTab === 1 ? 'active' : ''}`}
            onClick={() => changeTab(1)}
          >
            İdeoloji ve Önizleme
          </button>
        </div>
        
        {/* Tab İçeriği */}
        <div className="tab-content">
          {/* Tab 1: Parti Bilgileri */}
          {currentTab === 0 && (
            <div>
              <h3 className="section-title">Temel Bilgiler</h3>
              <div className="party-info-grid">
                <div className="form-group">
                  <label className="form-label">Parti Adı</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={party.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Partinin tam adını girin"
                  />
                  <div className="form-description">Örn: Cumhuriyetçi Milli Parti</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Kısa Ad</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={party.shortName}
                    onChange={(e) => handleInputChange('shortName', e.target.value.toUpperCase())}
                    placeholder="Kısa ad veya kısaltma girin"
                    maxLength={5}
                    style={{textTransform: 'uppercase'}}
                  />
                  <div className="form-description">En fazla 5 karakter (Örn: CMP)</div>
                </div>
              </div>
              
              <h3 className="section-title">Parti Rengi</h3>
              <div className="form-group">
                <label className="form-label">Özel Renk Seçimi</label>
                <div className="color-picker-wrapper">
                  <input 
                    type="color" 
                    value={party.colorId || "#d32f2f"}
                    onChange={(e) => handleColorSelect(e.target.value)}
                    className="color-picker"
                  />
                  <div className="color-preview" style={{ backgroundColor: party.colorId || "#d32f2f" }}>
                    <span style={{ color: getContrastColor(party.colorId || "#d32f2f") }}>
                      Önizleme
                    </span>
                  </div>
                </div>
                <div className="color-info">
                  <span>Renk Kodu: {party.colorId || "#d32f2f"}</span>
                </div>
                
                <div className="color-presets-title">Hazır Renk Seçenekleri</div>
                <div className="color-picker-container">
                  {partyColors.map((color) => (
                    <div
                      key={color.value}
                      className={`color-option ${party.colorId === color.value ? 'selected' : ''}`}
                      style={{ 
                        backgroundColor: color.value,
                        color: color.textColor
                      }}
                      onClick={() => handleColorSelect(color.value)}
                      title={color.name}
                    >
                    </div>
                  ))}
                </div>
                <div className="form-description">Partinizi temsil eden bir renk seçin veya hazır renk örneklerinden birini kullanın</div>
              </div>
              
              {/* Kurucuyu göster */}
              <div className="info-box">
                <h4 style={{fontSize: '1rem', margin: '0 0 0.75rem 0', color: 'rgba(0, 200, 255, 0.8)'}}>Parti Kurucusu</h4>
                <p style={{fontSize: '0.9rem', margin: '0 0 0.5rem 0'}}>{party.founderName || 'Kurucunun adı bilgisi alınamadı'}</p>
                <p style={{fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', margin: 0}}>
                  Parti kurucu karakterinizin ideolojisi, partinin başlangıç ideolojisi olarak kullanılacaktır.
                  İlerleyen adımda bu değerleri düzenleyebilirsiniz.
                </p>
              </div>
              
              {/* API durum bilgisi */}
              {!apiAvailable && (
                <div className="info-box" style={{marginTop: '1rem', backgroundColor: 'rgba(255, 60, 60, 0.2)'}}>
                  <h4 style={{fontSize: '1rem', margin: '0 0 0.75rem 0', color: 'rgba(255, 160, 160, 0.9)'}}>Çevrimdışı Mod</h4>
                  <p style={{fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)', margin: 0}}>
                    API bağlantısı kurulamadı. Parti bilgileri yerel olarak kaydedilecek ve oyun çevrimdışı modda çalışacak.
                  </p>
                </div>
              )}
              
              {/* Slot bilgisi göster */}
              <div className="info-box" style={{marginTop: '1rem'}}>
                <h4 style={{fontSize: '1rem', margin: '0 0 0.75rem 0', color: 'rgba(0, 200, 255, 0.8)'}}>Oyun Slotu</h4>
                <p style={{fontSize: '0.9rem', margin: '0 0 0.5rem 0'}}>
                  Parti <strong>Slot {slotId}</strong> için oluşturuluyor.
                </p>
              </div>
            </div>
          )}
          
          {/* Tab 2: İdeoloji ve Önizleme */}
          {currentTab === 1 && (
            <div>
              <h3 className="section-title">Parti İdeolojisi</h3>
              
              {/* Ana İdeolojik Pozisyon */}
              <div className="ideology-container">
                <h4>Genel İdeolojik Konum</h4>
                <div className="ideology-labels">
                  <span>Sol</span>
                  <span>Merkez Sol</span>
                  <span>Merkez</span>
                  <span>Merkez Sağ</span>
                  <span>Sağ</span>
                </div>
                <div style={{position: 'relative', marginBottom: '1rem'}}>
                  <div 
                    style={{
                      width: '100%', 
                      height: '10px', 
                      borderRadius: '5px',
                      background: "linear-gradient(to right, #d32f2f 0%, #7b1fa2 25%, #1976d2 50%, #ff9100 75%, #388e3c 100%)"
                    }}
                  ></div>
                  <div 
                    style={{
                      position: 'absolute', 
                      top: '0', 
                      width: '5px', 
                      height: '10px', 
                      backgroundColor: 'white', 
                      borderRadius: '2px', 
                      border: '1px solid black',
                      left: `${party.ideology.overallPosition}%`, 
                      transform: 'translateX(-50%)'
                    }}
                  ></div>
                </div>
                <div className="overall-ideology">
                  {getIdeologicalLabel(party.ideology.overallPosition)}
                </div>
              </div>
              
              {/* İdeoloji Eksenleri */}
              <div>
                {Object.entries(ideologyAxes).map(([axis, data]) => (
                  <div key={axis} className="ideology-axis">
                    <div className="ideology-header">
                      <label>{data?.name || axis}</label>
                      <span className="ideology-position">{getPositionName(axis, party.ideology[axis] || 50)}</span>
                    </div>
                    <div className="ideology-labels">
                      {(data?.positions || ["Pozisyon 1", "Pozisyon 2", "Pozisyon 3", "Pozisyon 4", "Pozisyon 5"]).map((position, idx) => (
                        <span key={idx}>{position}</span>
                      ))}
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      step="25"
                      className="ideology-slider" 
                      value={party.ideology[axis] || 50}
                      onChange={(e) => handleIdeologyChange(axis, parseInt(e.target.value))}
                    />
                  </div>
                ))}
              </div>
              
              {/* Parti Önizleme */}
              <div className="party-preview">
                <h4 className="party-preview-title">Parti Önizlemesi</h4>
                
                <div className="party-name-container">
                  <div 
                    className="party-badge" 
                    style={{
                      backgroundColor: party.colorId || "#d32f2f", 
                      color: getTextColorForBadge(party.colorId)
                    }}
                  >
                    {party.shortName}
                  </div>
                  <h3 className="party-full-name">{party.name}</h3>
                </div>
                
                <div className="party-ideology-tags">
                  {getIdeologyTags().map((tag, index) => (
                    <span key={index} className="party-ideology-tag">
                      {tag.axis}: {tag.position}
                    </span>
                  ))}
                </div>
                
                <div className="party-founder">
                  Kurucu: {party.founderName}
                </div>
                
                <div className="mt-2 text-sm text-gray-300">
                  Slot ID: {slotId}
                </div>
              </div>
              
              <div className="info-box">
                <h4 style={{fontSize: '1rem', margin: '0 0 0.75rem 0', color: 'rgba(0, 200, 255, 0.8)'}}>Parti Oluşturma Süreci</h4>
                <p style={{fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', margin: '0 0 0.5rem 0'}}>
                  Parti oluşturduğunuzda:
                </p>
                <ul style={{fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)', paddingLeft: '1.5rem', margin: 0}}>
                  <li style={{marginBottom: '0.3rem'}}>Bölgesel destek havuzları oluşturulur</li>
                  <li style={{marginBottom: '0.3rem'}}>Parti ideolojisine göre otomatik olarak başlangıç tabanı oluşturulur</li>
                  <li style={{marginBottom: '0.3rem'}}>Medya kuruluşları partiniz hakkında ilk görüşlerini oluşturur</li>
                  <li>Diğer partilerin parti liderleri sizin hakkınızda görüşler belirtir</li>
                </ul>
              </div>
              
              {/* API durum bilgisi (tekrar gösteriyoruz) */}
              {!apiAvailable && (
                <div className="info-box" style={{marginTop: '1rem', backgroundColor: 'rgba(255, 60, 60, 0.2)'}}>
                  <h4 style={{fontSize: '1rem', margin: '0 0 0.75rem 0', color: 'rgba(255, 160, 160, 0.9)'}}>Çevrimdışı Mod</h4>
                  <p style={{fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)', margin: 0}}>
                    API bağlantısı kurulamadı. Parti bilgileri yerel olarak kaydedilecek ve oyun çevrimdışı modda çalışacak.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="party-footer">
        <button className="btn btn-secondary" onClick={handleGoBack}>
          Geri
        </button>
        
        {currentTab === 0 ? (
          <button 
            className={`btn btn-primary ${party.name && party.shortName ? 'btn-pulse' : ''}`}
            onClick={proceedToNextTab}
            disabled={!party.name || !party.shortName}
          >
            İlerle
          </button>
        ) : (
          <button 
            className="btn btn-primary"
            onClick={createParty}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                <span>İşleniyor...</span>
              </>
            ) : (
              "Partiyi Kur"
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default PartyCreator;
