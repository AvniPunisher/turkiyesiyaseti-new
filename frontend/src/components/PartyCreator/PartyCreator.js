// src/components/PartyCreator/PartyCreator.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PartyCreator.css';

// API yardımcı servisi
import apiHelper from '../../services/apiHelper';

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
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [party, setParty] = useState({
    name: '',
    shortName: '',
    colorId: '#d32f2f',
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
      
      // Parti verisini localStorage'a kaydet
      // Böylece API hatası olsa bile Dashboard'da kullanabiliriz
      try {
        localStorage.setItem('partyData', JSON.stringify(party));
        console.log("Parti verileri localStorage'a kaydedildi");
      } catch (e) {
        console.error("Parti verileri localStorage'a kaydedilemedi:", e);
      }
      
      // Parti verisini API'ye gönder
      try {
        const response = await apiHelper.post('/api/game/create-party', { party });
        
        if (response.success) {
          console.log('Parti başarıyla oluşturuldu!');
          // Oyun ekranına yönlendir
          navigate('/game-dashboard', { 
            state: { 
              party,
              message: 'Parti başarıyla oluşturuldu!'
            } 
          });
        } else {
          // API yanıt hatası
          console.error("API başarısız oldu, ancak localStorage'a kaydettiğimiz için devam ediyoruz:", response.message);
          // Oyun ekranına yönlendir
          navigate('/game-dashboard', { 
            state: { 
              party,
              message: 'Parti başarıyla oluşturuldu (yerel olarak kaydedildi)!'
            } 
          });
        }
      } catch (error) {
        // API hatası olsa bile devam et
        console.error("API hatası, ancak localStorage'a kaydettik:", error);
        // Oyun ekranına yönlendir
        navigate('/game-dashboard', { 
          state: { 
            party,
            message: 'Sunucu bağlantısında sorun var, ancak yerel olarak kaydedildi.'
          } 
        });
      }
    } catch (error) {
      console.error("Parti oluşturma hatası:", error);
      
      // API bağlantı hatası
      if (error.code === 'ERR_NETWORK') {
        alert("Sunucuya bağlantı kurulamadı, ancak yerel olarak kaydedildi. Oyuna devam ediyoruz.");
        navigate('/game-dashboard', { state: { party } });
      } 
      // Token hatası
      else if (error.response && error.response.status === 401) {
        alert("Oturum süreniz dolmuş. Lütfen yeniden giriş yapın.");
        localStorage.removeItem('token');
        navigate('/login', { state: { returnUrl: '/party-creator' } });
      }
      // Sunucu hatası (500)
      else if (error.response && error.response.status === 500) {
        console.error("Sunucu hatası detayları:", error.response.data);
        alert("Sunucu hatası, ancak yerel olarak kaydedildi. Oyuna devam ediyoruz.");
        navigate('/game-dashboard', { state: { party } });
      }
      // Diğer hatalar
      else {
        console.error("Hata detayları:", error.response?.data || error);
        alert("Beklenmeyen bir hata oluştu, ancak yerel olarak kaydedildi. Oyuna devam ediyoruz.");
        navigate('/game-dashboard', { state: { party } });
      }
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
  };oji değerleri (0-100 arası)
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

        // Karakter verisini location state'inden kontrol et
        if (location.state?.character) {
          const character = location.state.character;
          setParty(prev => ({
            ...prev,
            founderId: character.id || 1,
            founderName: character.fullName || 'Karakter Adı',
            ideology: { ...character.ideology } // Karakter ideolojisini başlangıç değeri olarak al
          }));
          return;
        }

        // API'den karakter bilgisini çek
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
  }, [navigate, location]);

  // İdeolojik etiketler
  const getIdeologicalLabel = (position) => {
    if (position < 20) return "Sol";
    if (position < 40) return "Merkez Sol";
    if (position < 60) return "Merkez";
    if (position < 80) return "Merkez Sağ";
    return "Sağ";
  };

  // İdeol
