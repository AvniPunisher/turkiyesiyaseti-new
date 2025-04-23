// frontend/src/services/gameService.js
import apiHelper from './apiHelper';

// Oyun verileri yükleme ve yönetimi için yardımcı servis
const gameService = {
  /**
   * Oyun verilerini belirli bir slot için yükle
   * @param {number} slot - Yüklenecek oyun slotu
   * @param {number|null} saveId - Belirli bir kaydın ID'si (varsa)
   * @returns {Promise<Object>} - Oyun verileri
   */
  loadGame: async (slot, saveId = null) => {
    try {
      if (saveId) {
        // Belirli bir kaydı yükle
        const response = await apiHelper.get(`/api/game/load-game/${saveId}`);
        
        if (response.success) {
          return {
            success: true,
            data: response.data.saveData,
            message: "Oyun başarıyla yüklendi"
          };
        } else {
          throw new Error(response.message || "Oyun yüklenemedi");
        }
      } else {
        // Belirli bir slot için en son otomatik kaydı bul
        const response = await apiHelper.get('/api/game/saved-games');
        
        if (response.success && response.data.savedGames?.length > 0) {
          // Slota ait otomatik kayıtları filtrele
          const autoSaves = response.data.savedGames.filter(
            save => save.isAutoSave && save.saveSlot === slot
          );
          
          if (autoSaves.length > 0) {
            // En son otomatik kaydı al
            const latestAutoSave = autoSaves[0];
            
            // Kaydı yükle
            return await gameService.loadGame(slot, latestAutoSave.id);
          }
        }
        
        // Otomatik kayıt yoksa yeni oyun verileri döndür
        return {
          success: true,
          data: gameService.createNewGameData(slot),
          message: "Yeni oyun başlatıldı"
        };
      }
    } catch (error) {
      console.error("Oyun yükleme hatası:", error);
      return {
        success: false,
        data: null,
        message: error.message || "Oyun yüklenirken bir hata oluştu"
      };
    }
  },
  
  /**
   * Oyunu kaydet
   * @param {Object} gameData - Kaydedilecek oyun verileri
   * @param {string} saveName - Kayıt adı
   * @param {number} saveSlot - Kayıt slotu
   * @param {boolean} isAutoSave - Otomatik kayıt mı?
   * @returns {Promise<Object>} - Kayıt sonucu
   */
  saveGame: async (gameData, saveName, saveSlot, isAutoSave = false) => {
    try {
      // Oyun verilerini güncelle
      const updatedGameData = {
        ...gameData,
        lastSave: new Date().toISOString()
      };
      
      if (isAutoSave) {
        // Otomatik kayıt
        const response = await apiHelper.post('/api/game/update-auto-save', {
          gameData: updatedGameData
        });
        
        if (response.success) {
          return {
            success: true,
            data: {
              gameData: updatedGameData,
              saveId: response.data.saveId
            },
            message: "Otomatik kayıt başarılı"
          };
        } else {
          throw new Error(response.message || "Otomatik kayıt başarısız");
        }
      } else {
        // Manuel kayıt
        const response = await apiHelper.post('/api/game/save-game', {
          gameData: updatedGameData,
          saveName,
          saveSlot
        });
        
        if (response.success) {
          return {
            success: true,
            data: {
              gameData: updatedGameData,
              saveId: response.data.saveId
            },
            message: "Oyun başarıyla kaydedildi"
          };
        } else {
          throw new Error(response.message || "Oyun kaydedilemedi");
        }
      }
    } catch (error) {
      console.error("Oyun kaydetme hatası:", error);
      return {
        success: false,
        data: null,
        message: error.message || "Oyun kaydedilirken bir hata oluştu"
      };
    }
  },
  
  /**
   * Otomatik kaydı güncelle
   * @param {Object} gameData - Güncellenecek oyun verileri
   * @returns {Promise<Object>} - Güncelleme sonucu
   */
  updateAutoSave: async (gameData) => {
    return await gameService.saveGame(gameData, "Otomatik Kayıt", gameData.saveSlot || 1, true);
  },
  
  /**
   * Yeni oyun verileri oluştur
   * @param {number} slot - Oyun slotu
   * @returns {Object} - Yeni oyun verileri
   */
  createNewGameData: (slot) => {
    return {
      currentDate: "1 Ocak 2025",
      currentWeek: 1,
      currentMonth: 1,
      currentYear: 2025,
      saveSlot: slot,
      nextElection: {
        type: "Genel Seçim",
        weeksLeft: 52
      },
      economy: {
        gdp: 1200000000000,
        growth: 3.2,
        inflation: 42.8,
        unemployment: 12.3,
        exchangeRate: 32.5,
        interestRate: 35,
        budgetDeficit: -52
      },
      partyPopularity: 30,
      partyFunds: 1500000,
      seats: 0,
      totalSeats: 600,
      gameState: 'new',
      lastSave: new Date().toISOString()
    };
  },
  
  /**
   * Haftayı ilerlet
   * @param {Object} gameData - Mevcut oyun verileri
   * @returns {Object} - Güncellenmiş oyun verileri
   */
  advanceWeek: (gameData) => {
    // Bir sonraki haftayı hesapla
    let nextWeek = gameData.currentWeek + 1;
    let nextYear = gameData.currentYear;
    
    if (nextWeek > 52) {
      nextWeek = 1;
      nextYear += 1;
    }
    
    // Tarih formatı
    const months = [
      "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
      "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];
    
    // Kabaca hangi ay olduğunu hesapla
    const monthIndex = Math.floor((nextWeek - 1) / 4.33);
    const month = monthIndex % 12;
    const day = Math.floor(((nextWeek - 1) % 4.33) * 7) + 1;
    
    // Yeni tarih
    const newDate = `${day} ${months[month]} ${nextYear}`;
    
    // Oyun verilerini güncelle
    const updatedData = {
      ...gameData,
      currentWeek: nextWeek,
      currentYear: nextYear,
      currentMonth: monthIndex + 1,
      currentDate: newDate,
      nextElection: {
        ...gameData.nextElection,
        weeksLeft: Math.max(0, gameData.nextElection.weeksLeft - 1)
      }
    };
    
    // Rastgele ekonomik güncellemeler (demo amaçlı)
    if (gameData.economy) {
      // Enflasyon değişimi: -0.3 ile +0.2 arasında
      const inflationChange = (Math.random() * 0.5) - 0.3;
      // GSYH değişimi: 0 ile 0.1 arasında
      const gdpChange = Math.random() * 0.1;
      // İşsizlik değişimi: -0.1 ile +0.1 arasında
      const unemploymentChange = (Math.random() * 0.2) - 0.1;
      
      updatedData.economy = {
        ...gameData.economy,
        inflation: Math.max(0, gameData.economy.inflation + inflationChange).toFixed(1) * 1,
        gdp: gameData.economy.gdp * (1 + gdpChange / 100),
        unemployment: Math.max(0, Math.min(30, gameData.economy.unemployment + unemploymentChange)).toFixed(1) * 1,
      };
    }
    
    // Rastgele parti popülaritesi değişimi (-0.5 ile +0.7 arasında)
    const popularityChange = (Math.random() * 1.2) - 0.5;
    updatedData.partyPopularity = Math.max(0, Math.min(100, (gameData.partyPopularity || 30) + popularityChange));
    
    // Parti fonları
    // Her hafta belirli miktarda sabit gelir
    const baseIncome = 50000;
    updatedData.partyFunds = (gameData.partyFunds || 1500000) + baseIncome;
    
    return updatedData;
  },
  
  /**
   * Oyun aksiyonlarını uygula
   * @param {string} actionId - Aksiyon ID'si
   * @param {Object} gameData - Mevcut oyun verileri
   * @returns {Object} - Aksiyon sonuçları
   */
  applyAction: (actionId, gameData) => {
    let results = [];
    let updatedData = { ...gameData };
    
    // Aksiyon tipine göre sonuçlar
    switch(actionId) {
      case 'speech':
        // Konuşma yapmak popülariteyi arttırır
        const popularityIncrease = Math.random() * 3 + 1; // 1-4 arası
        updatedData.partyPopularity = Math.min(100, (gameData.partyPopularity || 30) + popularityIncrease);
        results.push(`Konuşmanız başarılı geçti, parti popüleritesi %${popularityIncrease.toFixed(1)} arttı.`);
        break;
        
      case 'campaign':
        // Kampanya yapmak popülariteyi arttırır ama para harcar
        const campaignCost = 100000;
        const campaignIncrease = Math.random() * 5 + 2; // 2-7 arası
        
        updatedData.partyFunds = Math.max(0, (gameData.partyFunds || 1500000) - campaignCost);
        updatedData.partyPopularity = Math.min(100, (gameData.partyPopularity || 30) + campaignIncrease);
        
        results.push(`Kampanya düzenlediniz. ${campaignCost.toLocaleString()} ₺ harcadınız.`);
        results.push(`Parti popüleritesi %${campaignIncrease.toFixed(1)} arttı.`);
        break;
        
      case 'tvProgram':
        // TV programı medya etkisini arttırır
        results.push("TV programına katıldınız, medya etkisi %5 arttı.");
        results.push("Sosyal medyada trending topic oldunuz.");
        break;
        
      case 'meeting':
        // Parti toplantısı iç dinamikleri güçlendirir
        results.push("Parti toplantısı verimli geçti, iç dinamikler güçlendi.");
        results.push("Parti üyelerinin morali arttı.");
        break;
        
      case 'survey':
        // Anket sonuçları
        const yourParty = gameData.partyPopularity || 30;
        
        // Diğer partiler için rastgele değerler (toplamı %100 olacak şekilde)
        const akp = Math.round(Math.random() * 10 + 30); // 30-40 arası
        const chp = Math.round(Math.random() * 10 + 20); // 20-30 arası
        const iyi = Math.round(Math.random() * 7 + 8);   // 8-15 arası
        const mhp = Math.round(Math.random() * 4 + 5);   // 5-9 arası
        
        // Toplanacak diğer partilerin oyları
        const otherVotes = Math.max(0, 100 - yourParty - akp - chp - iyi - mhp);
        
        results.push("Anket sonuçları:");
        results.push(`Partiniz: %${yourParty.toFixed(1)}`);
        results.push(`AK Parti: %${akp}`);
        results.push(`CHP: %${chp}`);
        results.push(`İYİ Parti: %${iyi}`);
        results.push(`MHP: %${mhp}`);
        results.push(`Diğer: %${otherVotes.toFixed(1)}`);
        
        // Anket maliyeti
        const surveyCost = 50000;
        updatedData.partyFunds = Math.max(0, (gameData.partyFunds || 1500000) - surveyCost);
        results.push(`Anket için ${surveyCost.toLocaleString()} ₺ ödediniz.`);
        break;
        
      case 'draftLaw':
        // Yasa tasarısı hazırla
        results.push("Yasa tasarısı hazırlandı, mecliste oylanmayı bekliyor.");
        results.push("Tasarı hazırlanırken partiniz bazı çevrelerden olumlu tepkiler aldı.");
        break;
        
      default:
        results.push("Aksiyon tamamlandı.");
    }
    
    return {
      gameData: updatedData,
      results: results
    };
  }
};

export default gameService;
