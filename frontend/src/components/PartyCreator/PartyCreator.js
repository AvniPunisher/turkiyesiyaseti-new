// src/components/PartyCreator/PartyCreator.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PartyCreator.css';

// API yardımcı servisi
import apiHelper from '../../services/apiHelper';

// JSON verileri
import ideologyAxes from '../../data/ideologies.json';
import partyColors from '../../data/partyColors.json';

const PartyCreator = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [party, setParty] = useState({
    name: '',
    shortName: '',
    colorId: '',
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

        // Buraya bir try/catch ekleyelim ve geçici bir çözüm olarak ilerleyelim
        try {
          const response = await apiHelper.get('/api/game/get-character');
          
          if (response.success && response.data.character) {
            const character = response.data.character;
            setParty(prev => ({
              ...prev,
              founderId: character.id,
              founderName: character.fullName,
              ideology: { ...character.ideology } // Karakter ideolojisini başlangıç değeri olarak al
            }));
          } else {
            // API başarısızsa tarayıcı depolamasından verileri almayı deneyelim
            const characterData = localStorage.getItem('characterData');
            if (characterData) {
              const character = JSON.parse(characterData);
              setParty(prev => ({
                ...prev,
                founderId: character.id || 1,
                founderName: character.fullName || 'Karakter Adı',
                ideology: character.ideology || prev.ideology
              }));
            } else {
              // Çok önemli değil, devam et
              console.log('Karakter bilgisi alınamadı ama işleme devam ediliyor');
            }
          }
        } catch (apiError) {
          console.error("API'den karakter bilgisi alınamadı:", apiError);
          // Oyuna devam edebilmek için basitleştirilmiş veriyle ilerle
          const storedUser = localStorage.getItem('user');
          let userName = 'Karakter Adı';
          
          if (storedUser) {
            try {
              const user = JSON.parse(storedUser);
              userName = user.username || 'Karakter Adı';
            } catch (e) {
              console.error("Kullanıcı bilgisi ayrıştırılamadı");
            }
          }
          
          setParty(prev => ({
            ...prev,
            founderId: 1,
            founderName: userName
          }));
        }
      } catch (error) {
        console.error("Karakter bilgisi getirme hatası:", error);
        alert('Karakter bilgilerine erişilemedi, ancak parti oluşturmaya devam edebilirsiniz.');
      }
    };

    fetchCharacter();
  }, [navigate]);

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
    const positions = ideologyAxes[axis].positions;
    const index = Math.floor(value / (100 / (positions.length - 1)));
    return positions[Math.min(index, positions.length - 1)];
  };

  // Genel ideolojik pozisyon hesaplayıcı
  const calculateOverallPosition = (values) => {
    let totalWeight = 0;
    let weightedSum = 0;
    
    for (const axis in ideologyAxes) {
      if (values[axis] !== undefined) {
        weightedSum += values[axis] * ideologyAxes[axis].weight;
        totalWeight += ideologyAxes[axis].weight;
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
  const handleColorSelect = (colorId) => {
    setParty({
      ...party, 
      colorId
    });
  };

  // Tab değiştirme fonksiyonu
  const changeTab = (tabIndex) => {
    // Tab değiştirme kontrolü
    if (tabIndex === 1 && (!party.name || !party.shortName || !party.colorId)) {
      return; // Gerekli alanlar dolmadıysa tab değiştirme
    }
    setCurrentTab(tabIndex);
  };

  // İlerle butonu ile tab 2'ye geçiş
  const proceedToNextTab = () => {
    if (party.name && party.shortName && party.colorId) {
      setCurrentTab(1);
    }
  };

  // Seçilen renk bilgisini al
  const getSelectedColor = () => {
    return partyColors.find(color => color.value === party.colorId) || {};
  };

  // Parti oluşturma işlemi
  const createParty = async () => {
    try {
      setLoading(true);
      console.log("Parti oluşturuluyor:", party);
      
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
      
      // Parti verisini API'ye gönder
      const response = await apiHelper.post('/api/game/create-party', { party });
      
      if (response.success) {
        alert('Parti başarıyla oluşturuldu!');
        // Oyun ekranına yönlendir
        navigate('/single-player', { state: { party: response.data.party } });
      } else {
        // API yanıt hatası
        if (response.authError) {
          alert("Oturum süreniz dolmuş. Lütfen yeniden giriş yapın.");
          navigate('/login', { state: { returnUrl: '/party-creator' } });
        } else if (response.networkError) {
          alert("Sunucuya bağlantı kurulamadı. Lütfen internet bağlantınızı kontrol edin.");
        } else if (response.notFoundError) {
          alert(`API endpoint bulunamadı (404 hatası).\n\nÖNERİLEN ÇÖZÜMLER:\n1. Backend sunucunuzun çalıştığından emin olun\n2. API URL'sinin doğru olduğunu kontrol edin\n3. Backend geliştiricileriyle iletişime geçip "/api/game/create-party" endpoint'inin mevcut olduğundan emin olun`);
        } else if (response.status === 500) {
          console.error("Sunucu hatası detayları:", response.data);
          alert("Sunucu hatası: API'de bir problem oluştu. Lütfen daha sonra tekrar deneyin.");
        } else {
          alert(`Parti oluşturulurken bir hata oluştu: ${response.message}`);
        }
        console.error("API yanıt hatası:", response.error);
      }
    } catch (error) {
      console.error("Beklenmeyen hata:", error);
      alert(`Beklenmeyen bir hata oluştu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Önceki sayfaya dönme fonksiyonu
  const handleGoBack = () => {
    navigate('/single-player');
  };

  // İdeoloji etiketlerini oluştur
  const getIdeologyTags = () => {
    const tags = [];
    
    for (const axis in ideologyAxes) {
      const position = getPositionName(axis, party.ideology[axis]);
      tags.push({
        axis: ideologyAxes[axis].name,
        position
      });
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
                  <div className="form-description">Örn: Halkın Demokrasi Partisi</div>
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
                  <div className="form-description">En fazla 5 karakter (Örn: HDP)</div>
                </div>
              </div>
              
              <h3 className="section-title">Parti Rengi</h3>
              <div className="form-group">
                <label className="form-label">Seçim ve Tanıtımlarda Kullanılacak Renk</label>
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
                <div className="form-description">Partinizi temsil eden bir renk seçin</div>
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
                      <label>{data.name} Ekseni</label>
                      <span className="ideology-position">{getPositionName(axis, party.ideology[axis])}</span>
                    </div>
                    <div className="ideology-labels">
                      {data.positions.map((position, idx) => (
                        <span key={idx}>{position}</span>
                      ))}
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      step="25"
                      className="ideology-slider" 
                      value={party.ideology[axis]}
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
                      backgroundColor: party.colorId, 
                      color: getSelectedColor().textColor
                    }}
                  >
                    {party.shortName}
                  </div>
                  <h3 className="party-full-name">{party.name}</h3>
                </div>
                
                <div>
                  {getIdeologyTags().map((tag, index) => (
                    <span key={index} className="party-ideology-tag">
                      {tag.axis}: {tag.position}
                    </span>
                  ))}
                </div>
                
                <div className="party-founder">
                  Kurucu: {party.founderName}
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
            className={`btn btn-primary ${party.name && party.shortName && party.colorId ? 'btn-pulse' : ''}`}
            onClick={proceedToNextTab}
            disabled={!party.name || !party.shortName || !party.colorId}
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
