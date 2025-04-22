// src/services/gameStateManager.js

// Oyun state'i formatı
const initialGameState = {
  // Oyun zamanı
  date: new Date(2025, 0, 1), // 1 Ocak 2025
  day: 1,
  month: 1,
  year: 2025,
  
  // Temel oyun değerleri
  popularity: 10,
  partyFunds: 1000000,
  seatCount: 0,
  totalSeats: 600,
  
  // Olaylar ve tarih
  events: [],
  completedEvents: [],
  
  // Takvim ve planlanmış eylemler
  scheduledActions: {},
  
  // Diğer oyun değerleri...
  economicStatus: "poor", // economy, social, etc.
  socialStatus: "stable",
  diplomacyStatus: "neutral",
  
  // Ülke parametreleri
  countryParameters: {
    // İlerleyen zamanlarda API'den gelebilir
    economy: 50,
    education: 50,
    health: 50,
    security: 50
  }
};

const gameStateManager = {
  // Aktif slot ID
  activeSlotId: null,
  
  // Slot bazlı oyun durumları
  gameStates: {},
  
  // Karakterler ve partiler (slot bazlı)
  characters: {},
  parties: {},
  
  // Slot aktifleştirme
  activateSlot(slotId) {
    this.activeSlotId = slotId;
    
    // Eğer bu slot için henüz state yoksa oluştur
    if (!this.gameStates[slotId]) {
      this.gameStates[slotId] = {...initialGameState};
    }
    
    console.log(`Slot ${slotId} aktifleştirildi`);
    return this.getActiveGameState();
  },
  
  // Aktif game state'i getir
  getActiveGameState() {
    if (!this.activeSlotId || !this.gameStates[this.activeSlotId]) {
      console.warn("Aktif slot bulunamadı");
      return null;
    }
    
    return this.gameStates[this.activeSlotId];
  },
  
  // Aktif slotun karakter bilgisini ayarla
  setCharacter(character) {
    if (!this.activeSlotId) {
      console.warn("Aktif slot bulunamadı, karakter kaydedilemedi");
      return;
    }
    
    this.characters[this.activeSlotId] = character;
    console.log(`Slot ${this.activeSlotId} için karakter kaydedildi:`, character.fullName);
    
    // Local Storage'a kaydet
    this.saveToLocalStorage();
  },
  
  // Aktif slotun parti bilgisini ayarla
  setParty(party) {
    if (!this.activeSlotId) {
      console.warn("Aktif slot bulunamadı, parti kaydedilemedi");
      return;
    }
    
    this.parties[this.activeSlotId] = party;
    console.log(`Slot ${this.activeSlotId} için parti kaydedildi:`, party.name);
    
    // Local Storage'a kaydet
    this.saveToLocalStorage();
  },
  
  // Aktif slotun karakter bilgisini getir
  getCharacter() {
    if (!this.activeSlotId) return null;
    return this.characters[this.activeSlotId];
  },
  
  // Aktif slotun parti bilgisini getir
  getParty() {
    if (!this.activeSlotId) return null;
    return this.parties[this.activeSlotId];
  },
  
  // Game state güncelleme
  updateGameState(updates) {
    if (!this.activeSlotId) {
      console.warn("Aktif slot bulunamadı, game state güncellenemedi");
      return;
    }
    
    this.gameStates[this.activeSlotId] = {
      ...this.gameStates[this.activeSlotId],
      ...updates
    };
    
    // Local Storage'a kaydet
    this.saveToLocalStorage();
    
    return this.gameStates[this.activeSlotId];
  },
  
  // Zaman ilerletme (gün, ay veya yıl)
  advanceTime(days = 1) {
    if (!this.activeSlotId) {
      console.warn("Aktif slot bulunamadı, zaman ilerletilemedi");
      return;
    }
    
    const currentState = this.getActiveGameState();
    const currentDate = new Date(currentState.date);
    
    // Tarihi ilerlet
    currentDate.setDate(currentDate.getDate() + days);
    
    // Game state'i güncelle
    this.updateGameState({
      date: currentDate,
      day: currentDate.getDate(),
      month: currentDate.getMonth() + 1, // JS'de aylar 0'dan başlar
      year: currentDate.getFullYear()
    });
    
    console.log(`Slot ${this.activeSlotId} için zaman ${days} gün ilerledi:`, 
                `${currentDate.getDate()}/${currentDate.getMonth()+1}/${currentDate.getFullYear()}`);
    
    return this.getActiveGameState();
  },
  
  // LocalStorage'a kaydet
  saveToLocalStorage() {
    try {
      const dataToSave = {
        gameStates: this.gameStates,
        characters: this.characters,
        parties: this.parties
      };
      
      localStorage.setItem('gameStateData', JSON.stringify(dataToSave));
      console.log("Oyun durumu local storage'a kaydedildi");
    } catch (error) {
      console.error("Local storage'a kaydetme hatası:", error);
    }
  },
  
  // LocalStorage'dan yükle
  loadFromLocalStorage() {
    try {
      const savedData = localStorage.getItem('gameStateData');
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        this.gameStates = parsedData.gameStates || {};
        this.characters = parsedData.characters || {};
        this.parties = parsedData.parties || {};
        
        console.log("Oyun durumu local storage'dan yüklendi");
        return true;
      }
    } catch (error) {
      console.error("Local storage'dan yükleme hatası:", error);
    }
    
    return false;
  },
  
  // API entegrasyonu için kaydedici (ileride eklenebilir)
  saveToAPI() {
    // API'ye kaydetme mantığı
  },
  
  // API'den yükleme (ileride eklenebilir)
  loadFromAPI() {
    // API'den yükleme mantığı
  }
};

// İlk yükleme
gameStateManager.loadFromLocalStorage();

export default gameStateManager;