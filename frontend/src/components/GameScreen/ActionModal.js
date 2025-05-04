import React, { useState, useEffect } from 'react';

// Aksiyon kategorileri
const actionCategories = [
  { id: 'media', name: 'Medya', icon: '📺' },
  { id: 'party', name: 'Parti', icon: '👥' },
  { id: 'field', name: 'Saha', icon: '🗣️' },
  { id: 'parliament', name: 'Meclis', icon: '📜' },
  { id: 'economy', name: 'Ekonomi', icon: '📊' },
  { id: 'diplomacy', name: 'Diplomasi', icon: '🌐' }
];

// Aksiyonlar
const actionsByCategory = {
  media: [
    { id: 'tvShow', name: 'TV Programına Katıl', icon: '📺', cost: 1, description: 'Ulusal bir TV kanalında programa katılarak görüşlerinizi paylaşın.' },
    { id: 'pressStatement', name: 'Basın Açıklaması', icon: '🎤', cost: 1, description: 'Güncel bir konuda basın açıklaması yapın.' },
    { id: 'interview', name: 'Gazete Röportajı', icon: '📰', cost: 1, description: 'Bir gazeteye kapsamlı röportaj verin.' },
    { id: 'socialMedia', name: 'Sosyal Medya Kampanyası', icon: '📱', cost: 2, description: 'Belirli bir konuda sosyal medya kampanyası başlatın.' }
  ],
  party: [
    { id: 'partyMeeting', name: 'Parti Toplantısı', icon: '👥', cost: 1, description: 'Parti üyeleriyle toplantı düzenleyin.' },
    { id: 'fundraiser', name: 'Bağış Toplantısı', icon: '💰', cost: 2, description: 'Parti için bağış toplantısı düzenleyin.' },
    { id: 'recruitment', name: 'Üye Kazandırma', icon: '📈', cost: 2, description: 'Yeni parti üyeleri kazanmak için kampanya düzenleyin.' },
    { id: 'strategicPlanning', name: 'Stratejik Planlama', icon: '📊', cost: 3, description: 'Parti stratejisi için detaylı bir planlama yapın.' }
  ],
  field: [
    { id: 'publicRally', name: 'Miting Düzenle', icon: '🏟️', cost: 3, description: 'Büyük bir şehirde miting düzenleyin.' },
    { id: 'townHall', name: 'Halk Buluşması', icon: '🏠', cost: 2, description: 'Bir ilçede halk buluşması düzenleyin.' },
    { id: 'doorToDoor', name: 'Kapı Kapı Ziyaret', icon: '🚶', cost: 2, description: 'Bir mahallede kapı kapı dolaşarak seçmenlerle konuşun.' },
    { id: 'regionalVisit', name: 'Bölge Ziyareti', icon: '🚌', cost: 2, description: 'Belirli bir bölgeyi ziyaret edin ve sorunları dinleyin.' }
  ],
  parliament: [
    { id: 'proposeLaw', name: 'Kanun Teklifi', icon: '📜', cost: 3, description: 'Yeni bir kanun teklifi sunun.' },
    { id: 'debate', name: 'Meclis Konuşması', icon: '🗣️', cost: 1, description: 'Genel kurulda gündem hakkında konuşma yapın.' },
    { id: 'committee', name: 'Komisyon Çalışması', icon: '👨‍⚖️', cost: 2, description: 'Bir meclis komisyonunda aktif çalışın.' },
    { id: 'lobbying', name: 'Lobi Faaliyeti', icon: '🤝', cost: 2, description: 'Belirli bir konu için diğer partilerle görüşmeler yapın.' }
  ],
  economy: [
    { id: 'meetBusiness', name: 'İş Dünyası Toplantısı', icon: '🏢', cost: 2, description: 'İş dünyası temsilcileriyle toplantı yapın.' },
    { id: 'economicPlan', name: 'Ekonomik Plan', icon: '📈', cost: 3, description: 'Kapsamlı bir ekonomik plan hazırlayın.' },
    { id: 'projectVisit', name: 'Proje Ziyareti', icon: '🏗️', cost: 2, description: 'Önemli bir ekonomik projeyi ziyaret edin.' },
    { id: 'investorMeeting', name: 'Yatırımcı Görüşmesi', icon: '💼', cost: 2, description: 'Potansiyel yatırımcılarla görüşün.' }
  ],
  diplomacy: [
    { id: 'foreignVisit', name: 'Yurtdışı Ziyaret', icon: '✈️', cost: 3, description: 'Yabancı bir ülkeye resmi ziyaret gerçekleştirin.' },
    { id: 'delegation', name: 'Heyeti Ağırla', icon: '🌐', cost: 2, description: 'Yabancı bir heyeti ağırlayın.' },
    { id: 'internationalConference', name: 'Uluslararası Konferans', icon: '🎪', cost: 3, description: 'Uluslararası bir konferansa katılın.' },
    { id: 'diplomaticForum', name: 'Diplomatik Forum', icon: '🗂️', cost: 2, description: 'Diplomatik bir forumda ülkenizi temsil edin.' }
  ]
};

// Ay ismini getir
const getMonthName = (month) => {
  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  return months[month - 1];
};

// Hafta görünümünü formatla
const formatWeekDisplay = (month, week, year) => {
  return `${getMonthName(month)} ${week}. Hafta, ${year}`;
};

const ActionModal = ({ selectedWeek, actionPoints, initialCategory, onSchedule, onClose }) => {
  const [currentActionCategory, setCurrentActionCategory] = useState(initialCategory);
  
  // initialCategory değiştiğinde state'i güncelle
  useEffect(() => {
    setCurrentActionCategory(initialCategory);
  }, [initialCategory]);
  
  // Aksiyon kategorisi seç
  const selectActionCategory = (categoryId) => {
    setCurrentActionCategory(categoryId);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-blue-900 border border-blue-700 rounded-lg p-6 w-11/12 max-w-3xl text-white">
        <h3 className="text-xl font-bold mb-4 text-blue-300">
          {selectedWeek && formatWeekDisplay(selectedWeek.month, selectedWeek.week, selectedWeek.year)} için aksiyon seç
        </h3>
        
        {currentActionCategory ? (
          <>
            <h4 className="text-lg font-bold mb-3">{actionCategories.find(cat => cat.id === currentActionCategory)?.name} Aksiyonları</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {actionsByCategory[currentActionCategory].map((action) => (
                <button
                  key={action.id}
                  className={`flex items-center p-3 border border-blue-700 rounded hover:bg-blue-800 bg-blue-950/70 transition-all ${
                    action.cost > actionPoints ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => onSchedule(action)}
                  disabled={action.cost > actionPoints}
                >
                  <span className="text-2xl mr-3">{action.icon}</span>
                  <div className="flex-1">
                    <span className="font-semibold block">{action.name}</span>
                    <p className="text-xs text-gray-400">{action.description}</p>
                  </div>
                  <span className="bg-blue-800 text-xs px-2 py-1 rounded ml-2" title="Aksiyon puanı">
                    {action.cost}AP
                  </span>
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <button 
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
                onClick={() => setCurrentActionCategory(null)}
              >
                Geri
              </button>
              <button 
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
                onClick={onClose}
              >
                İptal
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 p-3 border border-blue-800 rounded bg-blue-950/70">
              <h4 className="font-bold mb-2 text-blue-300">Aksiyon Kategorisi Seçin:</h4>
              <p className="text-xs text-gray-400">
                Her aksiyon 1-3 arası aksiyon puanı harcar. Bu hafta için {actionPoints}/3 puanınız kaldı.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {actionCategories.map((category) => (
                <button
                  key={category.id}
                  className="flex flex-col items-center justify-center p-4 border border-blue-700 rounded hover:bg-blue-800 bg-blue-950/70 transition-all"
                  onClick={() => selectActionCategory(category.id)}
                >
                  <div className="text-3xl mb-2">{category.icon}</div>
                  <div className="font-semibold">{category.name}</div>
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button 
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
                onClick={onClose}
              >
                İptal
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ActionModal;
