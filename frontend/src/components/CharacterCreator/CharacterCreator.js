// src/components/CharacterCreator/CharacterCreator.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CharacterCreator.css';

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
      cultural: 50,
      diplomatic: 50,
      social: 50,
      government: 50,
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
  
  useEffect(() => {
    const usedPoints = Object.values(character.stats).reduce((total, stat) => total + stat, 0);
    setRemainingStatPoints(totalStatPoints - usedPoints);
  }, [character.stats]);
  
  // İdeoloji eksenlerini tanımlama
  const ideologyAxes = {
    economic: {
      name: "Ekonomik",
      positions: ["Devletçi", "Karma Ekonomi", "Merkez", "Liberal Ekonomi", "Serbest Piyasa"],
      weight: 1.2
    },
    cultural: {
      name: "Kültürel",
      positions: ["İlerici/Batıcı", "Laik/Seküler", "Merkez", "Muhafazakar", "Dini Muhafazakar"],
      weight: 1.2
    },
    diplomatic: {
      name: "Diplomatik",
      positions: ["Batı Yanlısı", "Denge Politikası", "Bağımsız Dış Politika", "Bölgesel Liderlik", "Yeni-Osmanlıcılık"],
      weight: 0.8
    },
    social: {
      name: "Toplumsal",
      positions: ["Çoğulcu", "Cumhuriyetçi", "Merkez", "Türk Milliyetçisi", "Muhafazakar Milliyetçi"],
      weight: 1.0
    },
    government: {
      name: "Hükümet",
      positions: ["Parlamenter", "Güçlendirilmiş Parlamentarizm", "Yarı Başkanlık", "Başkanlık", "Merkezi Otorite"],
      weight: 0.8
    }
  };
  
  // Türkiye illeri
  const cities = [
    { code: 'TR01', name: 'Adana' }, { code: 'TR02', name: 'Adıyaman' }, 
    { code: 'TR03', name: 'Afyonkarahisar' }, { code: 'TR04', name: 'Ağrı' }, 
    { code: 'TR05', name: 'Amasya' }, { code: 'TR06', name: 'Ankara' }, 
    { code: 'TR07', name: 'Antalya' }, { code: 'TR08', name: 'Artvin' }, 
    { code: 'TR09', name: 'Aydın' }, { code: 'TR10', name: 'Balıkesir' },
    { code: 'TR11', name: 'Bilecik' }, { code: 'TR12', name: 'Bingöl' },
    { code: 'TR13', name: 'Bitlis' }, { code: 'TR14', name: 'Bolu' },
    { code: 'TR15', name: 'Burdur' }, { code: 'TR16', name: 'Bursa' },
    { code: 'TR17', name: 'Çanakkale' }, { code: 'TR18', name: 'Çankırı' },
    { code: 'TR19', name: 'Çorum' }, { code: 'TR20', name: 'Denizli' },
    { code: 'TR21', name: 'Diyarbakır' }, { code: 'TR22', name: 'Edirne' },
    { code: 'TR23', name: 'Elazığ' }, { code: 'TR24', name: 'Erzincan' },
    { code: 'TR25', name: 'Erzurum' }, { code: 'TR26', name: 'Eskişehir' },
    { code: 'TR27', name: 'Gaziantep' }, { code: 'TR28', name: 'Giresun' },
    { code: 'TR29', name: 'Gümüşhane' }, { code: 'TR30', name: 'Hakkari' },
    { code: 'TR31', name: 'Hatay' }, { code: 'TR32', name: 'Isparta' },
    { code: 'TR33', name: 'Mersin' }, { code: 'TR34', name: 'İstanbul' },
    { code: 'TR35', name: 'İzmir' }, { code: 'TR36', name: 'Kars' },
    { code: 'TR37', name: 'Kastamonu' }, { code: 'TR38', name: 'Kayseri' },
    { code: 'TR39', name: 'Kırklareli' }, { code: 'TR40', name: 'Kırşehir' },
    { code: 'TR41', name: 'Kocaeli' }, { code: 'TR42', name: 'Konya' },
    { code: 'TR43', name: 'Kütahya' }, { code: 'TR44', name: 'Malatya' },
    { code: 'TR45', name: 'Manisa' }, { code: 'TR46', name: 'Kahramanmaraş' },
    { code: 'TR47', name: 'Mardin' }, { code: 'TR48', name: 'Muğla' },
    { code: 'TR49', name: 'Muş' }, { code: 'TR50', name: 'Nevşehir' },
    { code: 'TR51', name: 'Niğde' }, { code: 'TR52', name: 'Ordu' },
    { code: 'TR53', name: 'Rize' }, { code: 'TR54', name: 'Sakarya' },
    { code: 'TR55', name: 'Samsun' }, { code: 'TR56', name: 'Siirt' },
    { code: 'TR57', name: 'Sinop' }, { code: 'TR58', name: 'Sivas' },
    { code: 'TR59', name: 'Tekirdağ' }, { code: 'TR60', name: 'Tokat' },
    { code: 'TR61', name: 'Trabzon' }, { code: 'TR62', name: 'Tunceli' },
    { code: 'TR63', name: 'Şanlıurfa' }, { code: 'TR64', name: 'Uşak' },
    { code: 'TR65', name: 'Van' }, { code: 'TR66', name: 'Yozgat' },
    { code: 'TR67', name: 'Zonguldak' }, { code: 'TR68', name: 'Aksaray' },
    { code: 'TR69', name: 'Bayburt' }, { code: 'TR70', name: 'Karaman' },
    { code: 'TR71', name: 'Kırıkkale' }, { code: 'TR72', name: 'Batman' },
    { code: 'TR73', name: 'Şırnak' }, { code: 'TR74', name: 'Bartın' },
    { code: 'TR75', name: 'Ardahan' }, { code: 'TR76', name: 'Iğdır' },
    { code: 'TR77', name: 'Yalova' }, { code: 'TR78', name: 'Karabük' },
    { code: 'TR79', name: 'Kilis' }, { code: 'TR80', name: 'Osmaniye' },
    { code: 'TR81', name: 'Düzce' }
  ];

  // Meslekler ve maaşları
  const professions = [
    { name: 'Avukat', salary: 25000 },
    { name: 'Doktor', salary: 30000 },
    { name: 'Öğretmen', salary: 15000 },
    { name: 'Mühendis', salary: 22000 },
    { name: 'İşletmeci', salary: 18000 },
    { name: 'Ekonomist', salary: 20000 },
    { name: 'Gazeteci', salary: 17000 },
    { name: 'İş İnsanı', salary: 40000 },
    { name: 'Akademisyen', salary: 18000 },
    { name: 'Bürokrat', salary: 23000 },
    { name: 'Askeri Personel', salary: 19000 },
    { name: 'STK Yöneticisi', salary: 16000 },
    { name: 'Sendikacı', salary: 17000 },
    { name: 'Din Görevlisi', salary: 14000 },
    { name: 'Serbest Meslek', salary: 15000 }
  ];

  // İdeolojik etiketler
  const getIdeologicalLabel = (position) => {
    if (position < 20) return "Sol";
    if (position < 40) return "Merkez Sol";
    if (position < 60) return "Merkez";
    if (position < 80) return "Merkez Sağ";
    return "Sağ";
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
    if (tabIndex === 1) {
      // Sadece "İlerle" butonu ile geçiş yapılabilsin
      return;
    }
    setCurrentTab(tabIndex);
  };
  
  // İlerle butonu ile tab 2'ye geçiş
  const proceedToNextTab = () => {
    setCurrentTab(1);
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
      
      // Karakter verisini MySQL'e kaydet
      const response = await axios.post('http://localhost:5001/api/game/create-character', 
        { character },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        alert('Karakter başarıyla oluşturuldu!');
        // Oyun ekranına yönlendir
        navigate('/single-player', { state: { character: response.data.character } });
      } else {
        throw new Error(response.data.message || 'Karakter oluşturulurken bir hata oluştu');
      }
    } catch (error) {
      console.error("Karakter oluşturma hatası:", error);
      
      // API bağlantı hatası
      if (error.code === 'ERR_NETWORK') {
        alert("Sunucuya bağlantı kurulamadı. Lütfen sunucunun çalıştığından emin olun.");
      } 
      // Token hatası
      else if (error.response && error.response.status === 401) {
        alert("Oturum süreniz dolmuş. Lütfen yeniden giriş yapın.");
        localStorage.removeItem('token');
        navigate('/login', { state: { returnUrl: '/character-creator' } });
      }
      // Diğer hatalar
      else {
        alert("Karakter oluşturulurken bir hata oluştu: " + (error.response?.data?.message || error.message));
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

  return (
    <div className="character-container">
      <h1 className="character-title">Türkiye Siyaset Simülasyonu</h1>
      <h2 className="character-subtitle">Karakter Oluşturma</h2>
      
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
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <input 
                    type="range" 
                    min="25" 
                    max="75" 
                    style={{width: '75%', marginRight: '16px'}} 
                    value={character.age}
                    onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                  />
                  <span style={{fontSize: '18px', fontWeight: '500'}}>{character.age}</span>
                </div>
                <span style={{fontSize: '12px', color: '#666'}}>Seçmen üzerinde etki</span>
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
                <span style={{fontSize: '12px', color: '#666'}}>Toplum algısı ve etkisi</span>
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
                <span style={{fontSize: '12px', color: '#666'}}>Bir mevkiye gelene kadar bu işten para kazanmaya devam edebilir</span>
              </div>
            </div>
            
            <h3 className="section-title" style={{marginTop: '20px'}}>İdeoloji</h3>
            
            {/* Ana İdeolojik Pozisyon */}
            <div className="ideology-container" style={{marginBottom: '20px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px'}}>
              <h4 style={{fontSize: '18px', fontWeight: '500', marginBottom: '12px'}}>Genel İdeolojik Konum</h4>
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px'}}>
                <span>Sol</span>
                <span>Merkez Sol</span>
                <span>Merkez</span>
                <span>Merkez Sağ</span>
                <span>Sağ</span>
              </div>
              <div style={{position: 'relative', marginBottom: '8px'}}>
                <div 
                  style={{
                    width: '100%', 
                    height: '16px', 
                    borderRadius: '8px',
                    background: "linear-gradient(to right, #d32f2f 0%, #7b1fa2 50%, #1976d2 100%)"
                  }}
                ></div>
                <div 
                  style={{
                    position: 'absolute', 
                    top: '0', 
                    width: '4px', 
                    height: '16px', 
                    backgroundColor: 'white', 
                    borderRadius: '2px', 
                    border: '1px solid black',
                    left: `${character.ideology.overallPosition}%`, 
                    transform: 'translateX(-50%)'
                  }}
                ></div>
              </div>
              <div style={{textAlign: 'center', fontWeight: '600', marginTop: '8px'}}>
                {getIdeologicalLabel(character.ideology.overallPosition)}
              </div>
            </div>
            
            {/* İdeoloji Eksenleri */}
            <div>
              {Object.entries(ideologyAxes).map(([axis, data]) => (
                <div key={axis} style={{marginBottom: '16px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                    <label style={{fontWeight: '500'}}>{data.name} Ekseni</label>
                    <span style={{fontWeight: '500'}}>{getPositionName(axis, character.ideology[axis])}</span>
                  </div>
                  <div style={{width: '92%', margin: '0 auto'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px'}}>
                      {data.positions.map((position, index) => (
                        <span key={index} style={{width: `${100/data.positions.length}%`, textAlign: 'center'}}>{position}</span>
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
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Tab 2: Karakter Özellikleri */}
        {currentTab === 1 && (
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
              <h3 className="section-title">Karakter Özellikleri</h3>
              <div className={`points-display ${remainingStatPoints >= 0 ? 'points-positive' : 'points-negative'}`}>
                Kalan Puan: {remainingStatPoints}
              </div>
            </div>
            <p style={{fontSize: '14px', color: '#666', marginBottom: '16px'}}>Başlangıçta toplam 35 puanlık bir dağıtım yapabilirsiniz. Her özellik 1-10 arası değer alır.</p>
            
            <div>
              {/* Hitabet */}
              <div className="stat-container">
                <div className="stat-header">
                  <label style={{fontWeight: '500'}}>Hitabet</label>
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
                <p style={{fontSize: '14px', color: '#666'}}>Hitabet ve tartışma becerisi (Konuşmalar, beyanlar, mitingler, tv programları)</p>
              </div>
              
              {/* Karizma */}
              <div className="stat-container">
                <div className="stat-header">
                  <label style={{fontWeight: '500'}}>Karizma</label>
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
                <p style={{fontSize: '14px', color: '#666'}}>Halkla ilişkiler, sevilebilirlik (Oy oranı artışı, medya ilgisi)</p>
              </div>
              
              {/* Zeka */}
              <div className="stat-container">
                <div className="stat-header">
                  <label style={{fontWeight: '500'}}>Zeka</label>
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
                <p style={{fontSize: '14px', color: '#666'}}>Analiz yeteneği (Yasa yazımı, ekonomi yönetimi)</p>
              </div>
              
              {/* Liderlik */}
              <div className="stat-container">
                <div className="stat-header">
                  <label style={{fontWeight: '500'}}>Liderlik</label>
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
                <p style={{fontSize: '14px', color: '#666'}}>Parti içi etki gücü (parti disiplini, grup kararı)</p>
              </div>
              
              {/* Direnç */}
              <div className="stat-container">
                <div className="stat-header">
                  <label style={{fontWeight: '500'}}>Direnç</label>
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
                <p style={{fontSize: '14px', color: '#666'}}>Krizlere karşı dayanıklılık (Skandal/saldırı savunması)</p>
              </div>
              
              {/* İdeolojik Tutarlılık */}
              <div className="stat-container">
                <div className="stat-header">
                  <label style={{fontWeight: '500'}}>İdeolojik Tutarlılık</label>
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
                <p style={{fontSize: '14px', color: '#666'}}>Seçmenle bağ (Seçmen sadakati, parti çizgisi)</p>
              </div>
              
              {/* Taktik Zekâ */}
              <div className="stat-container">
                <div className="stat-header">
                  <label style={{fontWeight: '500'}}>Taktik Zekâ</label>
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
                <p style={{fontSize: '14px', color: '#666'}}>Politika yapma becerisi (Koalisyon, kulis, ihale ayarları)</p>
              </div>
            </div>
            
            <div className="info-box">
              <h4 style={{fontSize: '16px', fontWeight: '500', marginBottom: '8px'}}>Dinamik Değerler</h4>
              <p style={{fontSize: '14px', color: '#666', marginBottom: '12px'}}>Bu değerler oyun içindeki eylemlerinize bağlı olarak değişecektir. Karakter inceleme menüsünde görüntülenecektir.</p>
              <ul style={{fontSize: '14px', color: '#444'}}>
                <li style={{marginBottom: '4px'}}>• <strong>Sadakat:</strong> Parti liderine veya ideolojiye olan bağlılık</li>
                <li style={{marginBottom: '4px'}}>• <strong>Tecrübe:</strong> Zamanla görev yaparak kazanılır</li>
                <li style={{marginBottom: '4px'}}>• <strong>Popülerlik:</strong> Kamuoyunda tanınırlık</li>
                <li style={{marginBottom: '4px'}}>• <strong>Prestij:</strong> Başarılı görevler, skandallardan kaçınma ile kazanılır</li>
                <li>• <strong>İmaj:</strong> Medyada nasıl sunulduğuna göre şekillenir</li>
              </ul>
            </div>
          </div>
        )}
        
        {/* İlerle veya Karakter Oluşturma Düğmesi */}
        <div className="btn-container">
          {currentTab === 0 ? (
            <button 
              className="btn"
              onClick={proceedToNextTab}
              disabled={!character.fullName || !character.birthPlace || !character.profession}
            >
              İlerle
            </button>
          ) : (
            <button 
              className="btn"
              onClick={createCharacter}
              disabled={remainingStatPoints < 0 || loading}
            >
              {loading ? "İşleniyor..." : "Karakteri Oluştur"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterCreator;
