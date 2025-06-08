// Ay ismini getir
export const getMonthName = (month) => {
  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  return months[month - 1];
};

// Tarih formatları
export const formatWeekKey = (year, month, week) => {
  return `${year}-${month.toString().padStart(2, '0')}-${week.toString().padStart(2, '0')}`;
};

export const formatWeekDisplay = (month, week, year) => {
  return `${getMonthName(month)} ${week}. Hafta, ${year}`;
};

// Hafta geçmiş mi kontrolü
export const isPastWeek = (week, month, year, currentWeek, currentMonth, currentYear) => {
  if (year < currentYear) return true;
  if (year === currentYear && month < currentMonth) return true;
  if (year === currentYear && month === currentMonth && week < currentWeek) return true;
  return false;
};

// Şu anki hafta mı kontrolü
export const isCurrentWeek = (week, month, year, currentWeek, currentMonth, currentYear) => {
  return week === currentWeek && month === currentMonth && year === currentYear;
};

// Bir sonraki haftayı hesapla
export const getNextWeek = (weekData) => {
  let nextWeek = weekData.week + 1;
  let nextMonth = weekData.month;
  let nextYear = weekData.year;
  
  // Ay sonu kontrolü (her ay 4 hafta varsayıyoruz)
  if (nextWeek > 4) {
    nextWeek = 1;
    nextMonth += 1;
  }
  
  // Yıl sonu kontrolü
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }
  
  return { week: nextWeek, month: nextMonth, year: nextYear };
};

// Özel bir hafta mı kontrolü (seçim, önemli gün, vb.)
export const isSpecialWeek = (week, month, year) => {
  // Seçim haftaları
  if (month === 6 && week === 2 && (year % 5 === 0)) return { type: 'election', name: 'Genel Seçim', icon: '🗳️' };
  if (month === 3 && week === 3 && (year % 5 === 1)) return { type: 'election', name: 'Yerel Seçim', icon: '🏛️' };
  
  // Özel günler
  if (month === 10 && week === 4) return { type: 'national', name: 'Cumhuriyet Bayramı', icon: '🇹🇷' };
  if (month === 4 && week === 4) return { type: 'national', name: 'Ulusal Egemenlik', icon: '🇹🇷' };
  if (month === 5 && week === 3) return { type: 'national', name: '19 Mayıs', icon: '🇹🇷' };
  if (month === 8 && week === 4) return { type: 'national', name: '30 Ağustos', icon: '🇹🇷' };
  
  // Önemli ekonomik olaylar
  if (month === 2 && week === 1) return { type: 'economic', name: 'Bütçe Görüşmeleri', icon: '💰' };
  if (month === 7 && week === 2) return { type: 'economic', name: 'Ekonomik Program', icon: '📊' };
  
  return null;
};

// Görünen haftaları güncelleme
export const updateVisibleWeeks = (viewOffset, currentWeek, currentMonth, currentYear) => {
  const weeks = [];
  let weekToShow = currentWeek + viewOffset;
  let monthToShow = currentMonth;
  let yearToShow = currentYear;
  
  // Ay değişikliklerini hesapla
  while (weekToShow > 4) {
    weekToShow -= 4;
    monthToShow += 1;
    
    // Yıl değişikliklerini hesapla
    if (monthToShow > 12) {
      monthToShow = 1;
      yearToShow += 1;
    }
  }
  
  while (weekToShow < 1) {
    weekToShow += 4;
    monthToShow -= 1;
    
    // Yıl değişikliklerini hesapla
    if (monthToShow < 1) {
      monthToShow = 12;
      yearToShow -= 1;
    }
  }
  
  // 7 hafta göster
  for (let i = 0; i < 7; i++) {
    let week = weekToShow + i;
    let month = monthToShow;
    let year = yearToShow;
    
    // Ay değişikliklerini kontrol et
    while (week > 4) {
      week -= 4;
      month += 1;
      
      // Yıl değişikliklerini kontrol et
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }
    
    weeks.push({ week, month, year });
  }
  
  return weeks;
};