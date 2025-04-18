// SinglePlayer.jsx bileşeninde güncellenecek useEffect kodu
// Parti oluşturulduktan sonra gelen state'i doğru şekilde işleyecek

// useEffect kodu
useEffect(() => {
  // İlk olarak URL'den gelen tüm state bilgilerini kontrol et
  if (location.state) {
    // Karakter bilgisi geldi mi?
    if (location.state.character) {
      setCharacter(location.state.character);
      setHasCharacter(true);
      setIsLoading(false);
      setAuthChecked(true);
      return;
    }
    
    // Parti oluşturularak mı gelindi?
    if (location.state.partyCreated && location.state.partyData) {
      console.log("Parti oluşturularak gelindi:", location.state.partyData);
      
      // localStorage'dan karakter bilgisini almayı dene
      const characterData = localStorage.getItem('characterData');
      if (characterData) {
        try {
          const parsedCharacter = JSON.parse(characterData);
          setCharacter(parsedCharacter);
          setHasCharacter(true);
          setIsLoading(false);
          setAuthChecked(true);
          
          // Oluşturulan parti verisi ile oyun başlat
          setGameData(prevData => ({
            ...prevData,
            party: location.state.partyData,
            hasParty: true,
            // Diğer oyun verileri...
          }));
          
          // Oyunu otomatik başlat
          setGameStarted(true);
          return;
        } catch (e) {
          console.error("Karakter verisi ayrıştırılamadı:", e);
        }
      }
    }
    
    // Kaydedilmiş oyun yükleme durumu mu?
    if (location.state.loadedGame) {
      // Kayıtlı oyun yükleme işlemleri...
      console.log("Kayıtlı oyun yüklendi:", location.state.loadedGame);
      // Burada kayıtlı oyun verilerini işleyebilirsiniz
    }
  }

  // Kullanıcının giriş yapıp yapmadığını kontrol et
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log("Token bulunamadı, giriş sayfasına yönlendiriliyor");
    // Kullanıcı giriş yapmamış, login sayfasına yönlendir
    navigate('/login', { state: { returnUrl: '/character-creator' } });
    return;
  }
  
  // Kullanıcı giriş yapmış, karakteri var mı kontrol et
  checkExistingCharacter(token);
}, [location.state]); // location.state değiştiğinde çalış

// Karakter kontrolü fonksiyonuna aşağıdaki eklemeyi yap
const checkExistingCharacter = async (token) => {
  try {
    setIsLoading(true);
    console.log("Karakter kontrol ediliyor...");
    
    // Veritabanından karakter bilgilerini çek
    const response = await axios.get('http://localhost:5001/api/game/get-character', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (response.data.success && response.data.character) {
      console.log("Karakter bulundu:", response.data.character);
      setCharacter(response.data.character);
      setHasCharacter(true);
      
      // Karakter bulunduğunda, parti de var mı kontrol et
      const partyData = localStorage.getItem('partyData');
      if (partyData) {
        try {
          const parsedParty = JSON.parse(partyData);
          console.log("Parti verisi bulundu:", parsedParty);
          
          // Oyun verilerine parti bilgisini ekle
          setGameData(prevData => ({
            ...prevData,
            party: parsedParty,
            hasParty: true
          }));
        } catch (e) {
          console.error("Parti verisi ayrıştırılamadı:", e);
        }
      }
    } else {
      console.log("Karakter bulunamadı");
      setHasCharacter(false);
    }
  } catch (error) {
    console.error('Karakter kontrolü hatası:', error);
    
    // Token geçersizse veya süresi dolmuşsa
    if (error.response && error.response.status === 401) {
      console.log("Token geçersiz, giriş sayfasına yönlendiriliyor");
      localStorage.removeItem('token');
      navigate('/login', { state: { returnUrl: '/character-creator' } });
      return;
    }
    
    setHasCharacter(false);
  } finally {
    setIsLoading(false);
    setAuthChecked(true);
  }
};

// Ayrıca GameCanvas bölümüne parti oluşturulduktan sonra otomatik oyun başlatma için ek kod
// Aşağıdaki kod bloğunu hasCharacter && !gameStarted koşulu içindeki GameOverlay bileşenine ekle

/* 
// Parti bilgisi varsa göster
{gameData.hasParty && (
  <div className="party-info">
    <h4 style={{ fontSize: '1.1rem', marginTop: '1rem', color: 'rgba(0, 200, 255, 0.8)' }}>
      Parti Bilgisi
    </h4>
    <div className="party-badge" 
      style={{
        backgroundColor: gameData.party.colorId || "#d32f2f", 
        color: getTextColorForBadge(gameData.party.colorId),
        display: 'inline-block',
        padding: '0.3rem 0.6rem',
        borderRadius: '4px',
        fontWeight: 'bold',
        margin: '0.5rem 0'
      }}
    >
      {gameData.party.shortName}
    </div>
    <p>{gameData.party.name}</p>
  </div>
)}
*/
