// PartyCreator.js içindeki createParty fonksiyonunu güncelliyoruz
// Parti başarıyla oluşturulduğunda, SinglePlayer sayfasına yönlendirme yapacak şekilde düzeltiyoruz

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
    try {
      const response = await apiHelper.post('/api/game/create-party', { party });
      
      if (response.success) {
        // Başarılı olduğunda parti verilerini localStorage'a kaydet
        try {
          localStorage.setItem('partyData', JSON.stringify(party));
        } catch (e) {
          console.error("Parti verileri localStorage'a kaydedilemedi:", e);
        }
        
        alert('Parti başarıyla oluşturuldu!');
        // Oyun ekranına yönlendir - ANA MENÜ DEĞİL, SINGLE PLAYER'A YÖNLENDİR
        navigate('/single-player', { 
          state: { 
            partyCreated: true, 
            partyData: party 
          } 
        });
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
    } catch (apiError) {
      // API hatası olsa bile devam et
      console.error("API hatası, ancak localStorage'a kaydettik:", apiError);
      alert('Sunucu bağlantısında sorun var, ancak yerel olarak kaydedildi. Oyuna devam edebilirsiniz.');
      
      // Parti verilerini localStorage'a kaydet ve devam et
      try {
        localStorage.setItem('partyData', JSON.stringify(party));
      } catch (e) {
        console.error("Parti verileri localStorage'a kaydedilemedi:", e);
      }
      
      // SinglePlayer'a yönlendir
      navigate('/single-player', { 
        state: { 
          partyCreated: true, 
          partyData: party 
        } 
      });
    }
  } catch (error) {
    console.error("Beklenmeyen hata:", error);
    alert(`Beklenmeyen bir hata oluştu: ${error.message}`);
  } finally {
    setLoading(false);
  }
};
