// Başlangıç parametreleri
export const initialParameters = {
  economy: {
    inflation: 63,
    unemployment: 12.3,
    growth: 3.2,
    budget: -40, // milyar TL cinsinden bütçe açığı
    stockMarket: 8650 // borsa endeksi
  },
  politics: {
    partySupport: 28.5, // yüzde olarak parti desteği
    coalitionStrength: 52, // yüzde olarak koalisyon gücü
    oppositionStrength: 47, // yüzde olarak muhalefet gücü
    publicApproval: 35 // hükümetin onay oranı
  },
  social: {
    education: 62,
    healthcare: 68,
    security: 70,
    happiness: 45
  },
  international: {
    relations: {
      us: 65,
      eu: 58,
      russia: 42,
      china: 70,
      middleEast: 75
    },
    reputation: 65
  }
};