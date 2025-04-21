// GameDashboard.jsx içine eklenecek kod parçası
// Bu kodu doğru pozisyona eklemek için - DashboardCard içerisindeki MainContent bileşenine ekleyin

// Kayıt butonu ve işlevi için eklemeler:

// -- Import bölümüne eklenecek - dosyanın en üstüne --
import apiHelper from '../../services/apiHelper';

// -- state tanımlarına eklenecek --
const [savingGame, setSavingGame] = useState(false);
const [saveSuccess, setSaveSuccess] = useState(null);
const [saveError, setSaveError] = useState(null);

// -- DashboardContent içindeki bir DashboardCard'a eklenecek --
<DashboardCard>
  <CardTitle>Oyun Kayıt</CardTitle>
  <div style={{ marginTop: '1rem' }}>
    <p>Oyun ilerlemenizi kaydedebilir veya dışa aktarabilirsiniz.</p>
    
    {saveSuccess && (
      <div style={{ 
        padding: '0.75rem',
        margin: '1rem 0',
        backgroundColor: 'rgba(40, 167, 69, 0.2)',
        borderRadius: '4px',
        borderLeft: '4px solid rgba(40, 167, 69, 0.8)'
      }}>
        {saveSuccess}
      </div>
    )}
    
    {saveError && (
      <div style={{ 
        padding: '0.75rem',
        margin: '1rem 0',
        backgroundColor: 'rgba(220, 53, 69, 0.2)',
        borderRadius: '4px',
        borderLeft: '4px solid rgba(220, 53, 69, 0.8)'
      }}>
        {saveError}
      </div>
    )}
    
    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
      <ActionButton 
        onClick={handleSaveGame}
        disabled={savingGame}
      >
        {savingGame ? (
          <>
            <div style={{ 
              display: 'inline-block',
              width: '16px',
              height: '16px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginRight: '0.5rem'
            }} />
            Kaydediliyor...
          </>
        ) : (
          'Oyunu Kaydet'
        )}
      </ActionButton>
      
      <ActionButton
        onClick={handleExportGame}
        disabled={savingGame}
      >
        Oyunu Dışa Aktar
      </ActionButton>
    </div>
  </div>
</DashboardCard>

// -- Component içine eklenecek fonksiyonlar --

// Oyunu kaydetme işlevi
const handleSaveGame = async () => {
  try {
    setSavingGame(true);
    setSaveSuccess(null);
    setSaveError(null);
    
    // Oyun verilerini hazırla
    const gameDataToSave = {
      character: character,
      party: party,
      gameState: 'saved',
      gameDate: new Date().toISOString(),
      gameVersion: '1.0.0',
      // Diğer oyun ilerleme bilgileri burada eklenebilir
      lastUpdated: new Date().toISOString()
    };
    
    // Kayıt adı oluştur
    const saveName = party ? 
      `${character?.fullName || 'Karakter'} - ${party.name}` :
      `${character?.fullName || 'Karakter'} - ${new Date().toLocaleDateString('tr-TR')}`;
    
    // Oyunu kaydet
    const response = await apiHelper.post('/api/game/save-game', {
      gameData: gameDataToSave,
      saveName: saveName,
      saveSlot: 2 // Manuel kayıtlar için 2 ve üstü slotları kullanıyoruz
    });
    
    if (response.success) {
      setSaveSuccess('Oyun başarıyla kaydedildi!');
      
      // 3 saniye sonra mesajı kaldır
      setTimeout(() => {
        setSaveSuccess(null);
      }, 3000);
    } else {
      setSaveError(`Kayıt hatası: ${response.message || 'Bilinmeyen hata'}`);
    }
  } catch (error) {
    console.error('Oyun kaydetme hatası:', error);
    setSaveError('Sunucu bağlantı hatası: ' + (error.message || 'Bilinmeyen hata'));
    
    // Çevrimdışı kayıt, localStorage'a yedekle
    try {
      const offlineSaveData = {
        character: character,
        party: party,
        gameState: 'saved',
        gameDate: new Date().toISOString(),
        savedOffline: true
      };
      
      localStorage.setItem('offlineSaveData', JSON.stringify(offlineSaveData));
      setSaveSuccess('Oyun çevrimdışı olarak kaydedildi. İnternet bağlantısı tekrar kurulduğunda senkronize edilecek.');
      
      // 3 saniye sonra mesajı kaldır
      setTimeout(() => {
        setSaveSuccess(null);
      }, 3000);
    } catch (localStorageError) {
      console.error('Çevrimdışı kayıt hatası:', localStorageError);
      setSaveError('Çevrimdışı kayıt yapılamadı: ' + (localStorageError.message || 'Bilinmeyen hata'));
    }
  } finally {
    setSavingGame(false);
  }
};

// Oyunu dışa aktarma işlevi
const handleExportGame = async () => {
  try {
    setSavingGame(true);
    setSaveSuccess(null);
    setSaveError(null);
    
    // Oyun verilerini hazırla
    const gameDataToExport = {
      saveInfo: {
        saveName: party ? 
          `${character?.fullName || 'Karakter'} - ${party.name}` :
          `${character?.fullName || 'Karakter'} - ${new Date().toLocaleDateString('tr-TR')}`,
        gameDate: new Date().toISOString(),
        gameVersion: '1.0.0',
        exportDate: new Date().toISOString(),
        exportVersion: '1.0'
      },
      character: character,
      party: party,
      gameData: {
        // Oyun ilerleme bilgileri
        gameState: 'exported',
        lastUpdated: new Date().toISOString()
      }
    };
    
    // Dosya adı oluştur
    const fileName = party ? 
      `${character?.fullName || 'Karakter'}-${party.shortName}`.toLowerCase().replace(/\s+/g, '-') :
      `${character?.fullName || 'Karakter'}-save`.toLowerCase().replace(/\s+/g, '-');
    
    // JSON'ı dosyaya dönüştür
    const blob = new Blob([JSON.stringify(gameDataToExport, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    
    // Dosyayı indirme
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Temizlik
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    
    setSaveSuccess('Oyun başarıyla dışa aktarıldı!');
    
    // 3 saniye sonra mesajı kaldır
    setTimeout(() => {
      setSaveSuccess(null);
    }, 3000);
  } catch (error) {
    console.error('Oyun dışa aktarma hatası:', error);
    setSaveError('Dışa aktarma hatası: ' + (error.message || 'Bilinmeyen hata'));
  } finally {
    setSavingGame(false);
  }
};
