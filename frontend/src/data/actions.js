// Aksiyon kategorileri
export const actionCategories = [
  { id: 'media', name: 'Medya', icon: <MessageCircle size={22} /> },
  { id: 'party', name: 'Parti', icon: <User size={22} /> },
  { id: 'field', name: 'Saha', icon: <MapPin size={22} /> },
  { id: 'parliament', name: 'Meclis', icon: <Building size={22} /> },
  { id: 'economy', name: 'Ekonomi', icon: <BarChart2 size={22} /> },
  { id: 'diplomacy', name: 'Diplomasi', icon: <Globe size={22} /> }
];

// Aksiyonlar
export const actionsByCategory = {
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