// Düzeltilmiş startNewGame fonksiyonu - SinglePlayer.jsx
const startNewGame = () => {
  setAutoSave(null); // Otomatik kayıt göstergesini kaldır
  
  // Karakterimiz var mı kontrol et
  if (character) {
    // Varolan karakterle devam et
    setGameStarted(true);
  } else {
    // Karakter yoksa önce karakter oluşturmaya yönlendir
    navigate('/character-creator');
  }
};

// Hascharacter ve autoSave olmayan durum için düzeltme
// Aşağıdaki bölümü SinglePlayer.jsx'te componentta
{/* Karakteri olan ama henüz oyuna başlamamış kullanıcılar için */}
{hasCharacter && !autoSave && !gameStarted && (
  <GameOverlay>
    <OverlayText>Oyunu Başlatmak İçin Hazır mısın?</OverlayText>
    
    <CharacterInfoCard>
      <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'rgba(0, 200, 255, 0.8)' }}>
        Karakter Bilgileri
      </h3>
      
      {character ? (
        <>
          <CharacterDetail>
            <CharacterLabel>İsim:</CharacterLabel>
            <span>{character.fullName}</span>
          </CharacterDetail>
          
          <CharacterDetail>
            <CharacterLabel>Yaş:</CharacterLabel>
            <span>{character.age}</span>
          </CharacterDetail>
          
          <CharacterDetail>
            <CharacterLabel>Meslek:</CharacterLabel>
            <span>{character.profession}</span>
          </CharacterDetail>
          
          <CharacterDetail>
            <CharacterLabel>İdeoloji:</CharacterLabel>
            <span>{character.ideology ? 
              (character.ideology.overallPosition < 20 ? "Sol" :
                character.ideology.overallPosition < 40 ? "Merkez Sol" :
                character.ideology.overallPosition < 60 ? "Merkez" :
                character.ideology.overallPosition < 80 ? "Merkez Sağ" : "Sağ") 
              : "Bilinmiyor"}</span>
          </CharacterDetail>
          
          {party && (
            <CharacterDetail>
              <CharacterLabel>Parti:</CharacterLabel>
              <span>
                <PartyBadge color={party.colorId}>
                  {party.shortName}
                </PartyBadge>
                {party.name}
              </span>
            </CharacterDetail>
          )}
        </>
      ) : (
        <div>Karakter bilgileri yüklenemedi. Lütfen karakter oluşturun.</div>
      )}
    </CharacterInfoCard>
    
    {/* Parti kurma veya oyunu başlatma seçenekleri */}
    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
      {!party ? (
        <Button onClick={() => navigate('/party-creator')}>Parti Kur</Button>
      ) : null}
      <Button onClick={character ? startGame : () => navigate('/character-creator')}>
        {character ? 'Oyunu Başlat' : 'Karakter Oluştur'}
      </Button>
    </div>
  </GameOverlay>
)}

// checkExistingCharacter fonksiyonunda hata yönetimi iyileştirmesi
const checkExistingCharacter = async (token) => {
  try {
    console.log("Karakter kontrol ediliyor...");
    
    // Karakter bilgilerini getir
    const charResponse = await apiHelper.get('/api/game/get-character');
    
    if (charResponse.success && charResponse.data.character) {
      console.log("Karakter bulundu:", charResponse.data.character);
      setCharacter(charResponse.data.character);
      setHasCharacter(true);
      
      // Karakter varsa parti kontrolü yap
      checkExistingParty(token, charResponse.data.character.id);
    } else {
      console.log("Karakter bulunamadı");
      setCharacter(null);
      setHasCharacter(false);
    }
  } catch (error) {
    console.error('Karakter kontrolü hatası:', error);
    
    // Token geçersizse giriş sayfasına yönlendir
    if (error.response?.status === 401) {
      console.log("Token geçersiz, giriş sayfasına yönlendiriliyor");
      localStorage.removeItem('token');
      navigate('/login', { state: { returnUrl: '/character-creator' } });
      return;
    }
    
    // Hata olsa bile karakter oluşturma seçeneği sunmak için hasCharacter false yapılıyor
    setCharacter(null);
    setHasCharacter(false);
  }
};
