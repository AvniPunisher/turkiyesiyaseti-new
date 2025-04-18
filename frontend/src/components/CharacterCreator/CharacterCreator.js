// src/components/CharacterCreator/CharacterCreator.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CharacterCreator.css';

// API yardımcı servisi
import apiHelper from '../../services/apiHelper';

// JSON verileri
import ideologyAxes from '../../data/ideologies.json';
import cities from '../../data/cities.json';
import professions from '../../data/professions.json';

const CharacterCreator = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [character, setCharacter] = useState({
    gameName: '',
    fullName: '',
    age: 40,
    gender: 'Erkek',
    birthPlace: '',
    profession: '',
    
    // İdeoloji değerleri (0-100 arası)
    ideology: {
      economic: 50,
      governance: 50,
      cultural: 50,
      identity: 50,
      religion: 50,
      foreign: 50,
      change: 50,
      overallPosition: 50
    },
    
    // Karakter özellikleri (1-10 arası)
    stats: {
      hitabet: 5,
      karizma: 5,
      zeka: 5,
      liderlik: 5,
      direnc: 5,
      ideolojikTutarlilik: 5,
      taktikZeka: 5
    },
    
    // Arka planda hesaplanacak değerler
    dynamicValues: {
      sadakat: 50,
      tecrube: 0,
      populerlik: 10,
      prestij: 30,
      imaj: 'Nötr'
    },
    
    // Uzmanlik alanlari boş başlar, oyun içinde edinilir
    expertise: []
  });
  
  // Toplam stat puanı kontrolü
  const [remainingStatPoints, setRemainingStatPoints] = useState(0);
  const totalStatPoints = 35;
  
  // Stat puanlarını hesapla
  useEffect(() => {
    const usedPoints = Object.values(character.stats).reduce((total, stat) => total + stat, 0);
    setRemainingStatPoints(totalStatPoints - usedPoints);
  }, [character.stats]);
  
  // Sayfa yüklendiğinde API bağlantısını test et
  useEffect(() => {
    const testApiConnection = async () => {
      try {
        // API bağlantısını test et
        const result = await apiHelper.testConnection();
        
        if (!result.success) {
          console.error("API bağlantı testi başarısız:", result.message);
        } else {
          console.log("API bağlantı testi başarılı:", result.message);
          
          // Endpoint'leri test et
          await testApiEndpoints();
        }
      } catch (error) {
        console.error("API bağlantı testi hatası:", error);
      }
    };
    
    // Farklı API endpoint'lerini test et
    const testApiEndpoints = async () => {
      const endpoints = [
        '/api/game/create-character',
        '/api/character/create',
        '/api/create-character',
        '/game/create-character'
      ];
      
      console.log("API endpoint'lerini test ediyorum...");
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`https://api.turkiyesiyaseti.net${endpoint}`, {
            method: 'OPTIONS',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          console.log(`Endpoint test: ${endpoint} - Status: ${response.status}`);
          
          // 404 olmayan bir endpoint bulduysan, bu doğru endpoint olabilir
          if (response.status !== 404) {
            console.log(`Olası çalışan endpoint bulundu: ${endpoint}`);
          }
        } catch (error) {
          console.error(`Endpoint test hatası (${endpoint}):`, error);
        }
      }
    };
    
    testApiConnection();
  }, []);

  // İdeolojik etiketler
  const getIdeologicalLabel = (position) => {
    if (position < 35) return "Sol";
    if (position < 48) return "Merkez Sol";
    if (position < 52) return "Merkez";
    if (position < 65) return "Merkez Sağ";
    return "Sağ";
  };

  // Genel ideolojik pozisyon hesaplayıcı
  const calculateOverallPosition = (values) => {
    let totalWeight = 0;
    let weightedSum = 0;
    
    // İdeoloji eksenleri için değerleri ve ağırlıkları belirle
    const axisWeightMap = {
      economic: { left: 0, right: 100, weight: 1.5 },
      governance: { left: 0, right: 100, weight: 0.7 },
      cultural: { left: 0, right: 100, weight: 1.3 },
      identity: { left: 0, right: 100, weight: 1.2 },
      religion: { left: 0, right: 100, weight: 1.4 },
      foreign: { left: 0, right: 100, weight: 0.6 },
      change: { left: 0, right: 100, weight: 1.0 }
    };
    
    for (const axis in ideologyAxes) {
      if (values[axis] !== undefined) {
        // Eksen değerinin sağ-sol spektrumuna göre katkısını hesapla
        let axisContribution = values[axis];
        
        // Bazı eksenlerde değer ters olabilir
        // Örneğin: Ekonomik eksende "Devletçi" (0) sola, "Piyasacı" (100) sağa karşılık gelir
        if (axis === "economic") {
          // Ekonomik değer sol ağırlıklı olmalı
          axisContribution = values[axis];
        } else if (axis === "governance") {
          // Yönetim ekseni için adem-i merkezi (0) sol, merkezi (100) sağ olarak değerlendir
          axisContribution = values[axis];
        } else if (axis === "cultural") {
          // Kültürel eksende ilerici (0) sol, gelenekçi (100) sağ olarak değerlendir
          axisContribution = values[axis];
        } else if (axis === "identity") {
          // Kimlik ekseninde çoğulcu (0) sol, milliyetçi (100) sağ olarak değerlendir
          axisContribution = values[axis];
        } else if (axis === "religion") {
          // İnanç-devlet ilişkisi ekseninde laik (0) sol, dinsel (100) sağ olarak değerlendir
          axisContribution = values[axis];
        } else if (axis === "foreign") {
          // Dış politikada batı yanlısı (0-50) merkez sol, doğu yönelimli (50-100) sağ
          // Dengeli (50) merkez olarak değerlendir
          axisContribution = values[axis];
        } else if (axis === "change") {
          // Toplumsal değişimde devrimci (0) sol, gelenekçi (100) sağ olarak değerlendir
          axisContribution = values[axis];
        }
        
        weightedSum += axisContribution * (ideologyAxes[axis].weight || 1);
        totalWeight += (ideologyAxes[axis].weight || 1);
      }
    }
    
    return totalWeight > 0 ? weightedSum / totalWeight : 50;
  };

  // İdeoloji değerini pozisyon adına çeviren yardımcı fonksiyon
  const getPositionName = (axis, value) => {
    const positions = ideologyAxes[axis].positions;
    const index = Math.floor(value / (100 / (positions.length - 1)));
    return positions[Math.min(index, positions.length - 1)];
  };

  // İdeoloji değerini güncelleyen fonksiyon
  const handleIdeologyChange = (axis, value) => {
    // Slider'ı sabit 5 pozisyona ayarla (0, 25, 50, 75, 100)
    // Gelen değere en yakın sabit pozisyonu hesapla
    const positions = [0, 25, 50, 75, 100];
    const closestPosition = positions.reduce((prev, curr) => 
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
    
    const newIdeology = { ...character.ideology, [axis]: closestPosition };
    const overallPosition = calculateOverallPosition(newIdeology);
    
    setCharacter({
      ...character,
      ideology: {
        ...newIdeology,
        overallPosition
      }
    });
  };

  // Karakter stat'larını güncelleyen fonksiyon
  const handleStatChange = (stat, value) => {
    // Toplam puan kontrolü
    const otherStatsTotal = Object.entries(character.stats)
      .filter(([key]) => key !== stat)
      .reduce((sum, [_, val]) => sum + val, 0);
    
    // Yeni değer toplam puanı aşarsa, maksimum değeri hesapla
    const maxAllowed = Math.min(10, totalStatPoints - otherStatsTotal);
    const newValue = Math.max(1, Math.min(value, maxAllowed));
    
    setCharacter({
      ...character,
      stats: {
        ...character.stats,
        [stat]: newValue
      }
    });
  };

  // Form input değişikliklerini izleyen fonksiyon
  const handleInputChange = (field, value) => {
    setCharacter({
      ...character,
      [field]: value
    });
  };
  
  // Tab değiştirme fonksiyonu
  const changeTab = (tabIndex) => {
    // Tab 1'den Tab 2'ye geçişi kontrol et
    if (tabIndex === 1 && (!character.fullName || !character.birthPlace || !character.profession)) {
      return; // Gerekli alanlar dolmadıysa tab değiştirme
    }
    setCurrentTab(tabIndex);
  };
  
  // İlerle butonu ile tab 2'ye geçiş
  const proceedToNextTab = () => {
    if (character.fullName && character.birthPlace && character.profession) {
      setCurrentTab(1);
    }
  };
  
  // Karakter oluşturma işlemi
  const createCharacter = async () => {
    try {
      setLoading(true);
      console.log("Karakter oluşturuluyor:", character);
      
      // Token kontrolü
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Karakter oluşturmak için giriş yapmanız gerekmektedir.');
        navigate('/login', { state: { returnUrl: '/character-creator' } });
        return;
      }
      
      // Formda eksik alan kontrolü
      if (!character.fullName || !character.birthPlace || !character.profession) {
        alert('Lütfen tüm gerekli alanları doldurun.');
        setLoading(false);
        return;
      }
      
      // Karakter verilerini localStorage'a da kaydet
      // böylece API hatası olsa bile parti oluşturmada kullanabiliriz
      try {
        localStorage.setItem('characterData', JSON.stringify(character));
      } catch (e) {
        console.error("Karakter verileri localStorage'a kaydedilemedi:", e);
      }
      
      // Karakter verisini API'ye gönder
      try {
        const response = await apiHelper.post('/api/game/create-character', { character });
      
        if (response.success) {
          alert('Karakter başarıyla oluşturuldu!');
          // Doğrudan parti oluşturma sayfasına yönlendir
          navigate('/party-creator');
        } else {
          // API başarısız olsa bile devam et
          console.error("API başarısız oldu, ancak devam ediyoruz:", response.message);
          alert('Karakter bilgileri kaydedildi, parti oluşturmaya devam edebilirsiniz.');
          navigate('/party-creator');
        }
      } catch (error) {
        // API hatası olsa bile devam et
        console.error("API hatası, ancak localStorage'a kaydettik:", error);
        alert('Sunucu bağlantısında sorun var, ancak yerel olarak kaydedildi. Parti oluşturmaya devam edebilirsiniz.');
        navigate('/party-creator');
      }
    } catch (error) {
      console.error("Karakter oluşturma hatası:", error);
      
      // API bağlantı hatası
      if (error.code === 'ERR_NETWORK') {
        alert("Sunucuya bağlantı kurulamadı, ancak yerel olarak kaydedildi. Parti oluşturmaya devam edebilirsiniz.");
        navigate('/party-creator');
      } 
      // Token hatası
      else if (error.response && error.response.status === 401) {
        alert("Oturum süreniz dolmuş. Lütfen yeniden giriş yapın.");
        localStorage.removeItem('token');
        navigate('/login', { state: { returnUrl: '/character-creator' } });
      }
      // Sunucu hatası (500)
      else if (error.response && error.response.status === 500) {
        console.error("Sunucu hatası detayları:", error.response.data);
        alert("Sunucu hatası, ancak yerel olarak kaydedildi. Parti oluşturmaya devam edebilirsiniz.");
        navigate('/party-creator');
      }
      // Diğer hatalar
      else {
        console.error("Hata detayları:", error.response?.data || error);
        alert("Karakter oluşturulurken bir hata oluştu, ancak yerel olarak kaydedildi. Parti oluşturmaya devam edebilirsiniz.");
        navigate('/party-creator');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Mesleğe göre maaş getiren yardımcı fonksiyon
  const getProfessionSalary = (professionName) => {
    const profession = professions.find(p => p.name === professionName);
    return profession ? profession.salary : 15000; // Varsayılan maaş
  };

  // Önceki sayfaya dönme fonksiyonu
  const handleGoBack = () => {
    navigate('/single-player');
  };

  return (
    <div className="character-container">
      <div className="character-header">
        <h1 className="character-title">Karakter Oluşturma</h1>
      </div>
      
      <div className="character-content">
        {/* Tab Menüsü */}
        <div className="tab-menu">
          <button 
            className={`tab-button ${currentTab === 0 ? 'active' : ''}`}
            onClick={() => changeTab(0)}
          >
            Temel Bilgiler ve İdeoloji
          </button>
          <button 
            className={`tab-button ${currentTab === 1 ? 'active' : ''}`}
            onClick={() => changeTab(1)}
          >
            Karakter Özellikleri
          </button>
        </div>
        
        {/* Tab İçeriği */}
        <div className="tab-content">
          {/* Tab 1: Temel Bilgiler ve İdeoloji */}
          {currentTab === 0 && (
            <div>
              <h3 className="section-title">Temel Bilgiler</h3>
              <div className="character-info-grid">
                <div className="form-group">
                  <label className="form-label">Oyun Adı</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={character.gameName}
                    onChange={(e) => handleInputChange('gameName', e.target.value)}
                    placeholder="Oyunun kayıt olacağı adını girin"
                  />
                  <div className="form-description">Boş bırakırsanız otomatik oluşturulacaktır</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Ad ve Soyad</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={character.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Diyaloglar ve medyada gözükecek"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Yaş</label>
                  <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                    <input 
                      type="range" 
                      min="25" 
                      max="75" 
                      style={{flex: 1}} 
                      value={character.age}
                      onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                    />
                    <span style={{fontSize: '1.1rem', fontWeight: '500', minWidth: '2rem'}}>{character.age}</span>
                  </div>
                  <div className="form-description">Seçmen üzerinde etki sağlar</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Cinsiyet</label>
                  <select 
                    className="form-select"
                    value={character.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                  >
                    <option value="Erkek">Erkek</option>
                    <option value="Kadın">Kadın</option>
                  </select>
                  <div className="form-description">Toplum algısı ve etkisi farklılık gösterebilir</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Doğduğu İl</label>
                  <select 
                    className="form-select"
                    value={character.birthPlace}
                    onChange={(e) => handleInputChange('birthPlace', e.target.value)}
                  >
                    <option value="">Seçiniz</option>
                    {cities.map(city => (
                      <option key={city.code} value={city.code}>{city.name}</option>
                    ))}
                  </select>
                  <div className="form-description">Bölgesel bağlantıları etkiler</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Meslek</label>
                  <select 
                    className="form-select"
                    value={character.profession}
                    onChange={(e) => handleInputChange('profession', e.target.value)}
                  >
                    <option value="">Seçiniz</option>
                    {professions.map(prof => (
                      <option key={prof.name} value={prof.name}>{prof.name} (₺{prof.salary.toLocaleString()})</option>
                    ))}
                  </select>
                  <div className="form-description">Bir mevkiye gelene kadar bu işten para kazanmaya devam edebilirsiniz</div>
                </div>
              </div>
              
              <h3 className="section-title">İdeoloji</h3>
              
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
                      left: `${character.ideology.overallPosition}%`, 
                      transform: 'translateX(-50%)'
                    }}
                  ></div>
                </div>
                <div className="overall-ideology">
                  {getIdeologicalLabel(character.ideology.overallPosition)}
                </div>
              </div>
              
              {/* İdeoloji Eksenleri */}
              <div>
                {Object.entries(ideologyAxes).map(([axis, data]) => (
                  <div key={axis} className="ideology-axis">
                    <div className="ideology-header">
                      <label>{data.name} Ekseni</label>
                      <span className="ideology-position">{getPositionName(axis, character.ideology[axis])}</span>
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
                      value={character.ideology[axis]}
                      onChange={(e) => handleIdeologyChange(axis, parseInt(e.target.value))}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Tab 2: Karakter Özellikleri */}
          {currentTab === 1 && (
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                <h3 className="section-title" style={{margin: 0}}>Karakter Özellikleri</h3>
                <div className={`points-display ${remainingStatPoints >= 0 ? 'points-positive' : 'points-negative'}`}>
                  Kalan Puan: {remainingStatPoints}
                </div>
              </div>
              <p style={{fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1rem'}}>
                Başlangıçta toplam 35 puanlık bir dağıtım yapabilirsiniz. Her özellik 1-10 arası değer alır.
              </p>
              
              <div>
                {/* Hitabet */}
                <div className="stat-container">
                  <div className="stat-header">
                    <label>Hitabet</label>
                    <div className="stat-controls">
                      <button 
                        className="stat-btn stat-decrease"
                        onClick={() => handleStatChange('hitabet', character.stats.hitabet - 1)}
                        disabled={character.stats.hitabet <= 1}
                      >-</button>
                      <span className="stat-value">{character.stats.hitabet}</span>
                      <button 
                        className="stat-btn stat-increase"
                        onClick={() => handleStatChange('hitabet', character.stats.hitabet + 1)}
                        disabled={character.stats.hitabet >= 10 || remainingStatPoints <= 0}
                      >+</button>
                    </div>
                  </div>
                  <p style={{fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', margin: '0.5rem 0 0 0'}}>
                    Hitabet ve tartışma becerisi (Konuşmalar, beyanlar, mitingler, tv programları)
                  </p>
                </div>
                
                {/* Karizma */}
                <div className="stat-container">
                  <div className="stat-header">
                    <label>Karizma</label>
                    <div className="stat-controls">
                      <button 
                        className="stat-btn stat-decrease"
                        onClick={() => handleStatChange('karizma', character.stats.karizma - 1)}
                        disabled={character.stats.karizma <= 1}
                      >-</button>
                      <span className="stat-value">{character.stats.karizma}</span>
                      <button 
                        className="stat-btn stat-increase"
                        onClick={() => handleStatChange('karizma', character.stats.karizma + 1)}
                        disabled={character.stats.karizma >= 10 || remainingStatPoints <= 0}
                      >+</button>
                    </div>
                  </div>
                  <p style={{fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', margin: '0.5rem 0 0 0'}}>
                    Halkla ilişkiler, sevilebilirlik (Oy oranı artışı, medya ilgisi)
                  </p>
                </div>
                
                {/* Zeka */}
                <div className="stat-container">
                  <div className="stat-header">
                    <label>Zeka</label>
                    <div className="stat-controls">
                      <button 
                        className="stat-btn stat-decrease"
                        onClick={() => handleStatChange('zeka', character.stats.zeka - 1)}
                        disabled={character.stats.zeka <= 1}
                      >-</button>
                      <span className="stat-value">{character.stats.zeka}</span>
                      <button 
                        className="stat-btn stat-increase"
                        onClick={() => handleStatChange('zeka', character.stats.zeka + 1)}
                        disabled={character.stats.zeka >= 10 || remainingStatPoints <= 0}
                      >+</button>
                    </div>
                  </div>
                  <p style={{fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', margin: '0.5rem 0 0 0'}}>
                    Analiz yeteneği (Yasa yazımı, ekonomi yönetimi)
                  </p>
                </div>
                
                {/* Liderlik */}
                <div className="stat-container">
                  <div className="stat-header">
                    <label>Liderlik</label>
                    <div className="stat-controls">
                      <button 
                        className="stat-btn stat-decrease"
                        onClick={() => handleStatChange('liderlik', character.stats.liderlik - 1)}
                        disabled={character.stats.liderlik <= 1}
                      >-</button>
                      <span className="stat-value">{character.stats.liderlik}</span>
                      <button 
                        className="stat-btn stat-increase"
                        onClick={() => handleStatChange('liderlik', character.stats.liderlik + 1)}
                        disabled={character.stats.liderlik >= 10 || remainingStatPoints <= 0}
                      >+</button>
                    </div>
                  </div>
                  <p style={{fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', margin: '0.5rem 0 0 0'}}>
                    Parti içi etki gücü (parti disiplini, grup kararı)
                  </p>
                </div>
                
                {/* Direnç */}
                <div className="stat-container">
                  <div className="stat-header">
                    <label>Direnç</label>
                    <div className="stat-controls">
                      <button 
                        className="stat-btn stat-decrease"
                        onClick={() => handleStatChange('direnc', character.stats.direnc - 1)}
                        disabled={character.stats.direnc <= 1}
                      >-</button>
                      <span className="stat-value">{character.stats.direnc}</span>
                      <button 
                        className="stat-btn stat-increase"
                        onClick={() => handleStatChange('direnc', character.stats.direnc + 1)}
                        disabled={character.stats.direnc >= 10 || remainingStatPoints <= 0}
                      >+</button>
                    </div>
                  </div>
                  <p style={{fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', margin: '0.5rem 0 0 0'}}>
                    Krizlere karşı dayanıklılık (Skandal/saldırı savunması)
                  </p>
                </div>
                
                {/* İdeolojik Tutarlılık */}
                <div className="stat-container">
                  <div className="stat-header">
                    <label>İdeolojik Tutarlılık</label>
                    <div className="stat-controls">
                      <button 
                        className="stat-btn stat-decrease"
                        onClick={() => handleStatChange('ideolojikTutarlilik', character.stats.ideolojikTutarlilik - 1)}
                        disabled={character.stats.ideolojikTutarlilik <= 1}
                      >-</button>
                      <span className="stat-value">{character.stats.ideolojikTutarlilik}</span>
                      <button 
                        className="stat-btn stat-increase"
                        onClick={() => handleStatChange('ideolojikTutarlilik', character.stats.ideolojikTutarlilik + 1)}
                        disabled={character.stats.ideolojikTutarlilik >= 10 || remainingStatPoints <= 0}
                      >+</button>
                    </div>
                  </div>
                  <p style={{fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', margin: '0.5rem 0 0 0'}}>
                    Seçmenle bağ (Seçmen sadakati, parti çizgisi)
                  </p>
                </div>
                
                {/* Taktik Zekâ */}
                <div className="stat-container">
                  <div className="stat-header">
                    <label>Taktik Zekâ</label>
                    <div className="stat-controls">
                      <button 
                        className="stat-btn stat-decrease"
                        onClick={() => handleStatChange('taktikZeka', character.stats.taktikZeka - 1)}
                        disabled={character.stats.taktikZeka <= 1}
                      >-</button>
                      <span className="stat-value">{character.stats.taktikZeka}</span>
                      <button 
                        className="stat-btn stat-increase"
                        onClick={() => handleStatChange('taktikZeka', character.stats.taktikZeka + 1)}
                        disabled={character.stats.taktikZeka >= 10 || remainingStatPoints <= 0}
                      >+</button>
                    </div>
                  </div>
                  <p style={{fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', margin: '0.5rem 0 0 0'}}>
                    Politika yapma becerisi (Koalisyon, kulis, ihale ayarları)
                  </p>
                </div>
              </div>
              
              <div className="info-box">
                <h4 style={{fontSize: '1rem', margin: '0 0 0.75rem 0', color: 'rgba(0, 200, 255, 0.8)'}}>Dinamik Değerler</h4>
                <p style={{fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.75rem'}}>
                  Bu değerler oyun içindeki eylemlerinize bağlı olarak değişecektir. Karakter inceleme menüsünde görüntülenecektir.
                </p>
                <ul style={{fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)', paddingLeft: '1.5rem', margin: 0}}>
                  <li style={{marginBottom: '0.3rem'}}><strong>Sadakat:</strong> Parti liderine veya ideolojiye olan bağlılık</li>
                  <li style={{marginBottom: '0.3rem'}}><strong>Tecrübe:</strong> Zamanla görev yaparak kazanılır</li>
                  <li style={{marginBottom: '0.3rem'}}><strong>Popülerlik:</strong> Kamuoyunda tanınırlık</li>
                  <li style={{marginBottom: '0.3rem'}}><strong>Prestij:</strong> Başarılı görevler, skandallardan kaçınma ile kazanılır</li>
                  <li><strong>İmaj:</strong> Medyada nasıl sunulduğuna göre şekillenir</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="character-footer">
        <button className="btn btn-secondary" onClick={handleGoBack}>
          Geri
        </button>
        
        {currentTab === 0 ? (
          <button 
            className={`btn btn-primary ${character.fullName && character.birthPlace && character.profession ? 'btn-pulse' : ''}`}
            onClick={proceedToNextTab}
            disabled={!character.fullName || !character.birthPlace || !character.profession}
          >
            İlerle
          </button>
        ) : (
          <button 
            className="btn btn-primary"
            onClick={createCharacter}
            disabled={remainingStatPoints < 0 || loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                <span>İşleniyor...</span>
              </>
            ) : (
              "Karakteri Oluştur"
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default CharacterCreator;