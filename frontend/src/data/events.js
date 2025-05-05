// Olaylar
export const events = [
  {
    id: 'economicCrisis',
    title: 'Ekonomik Dalgalanma',
    description: 'Küresel piyasalardaki dalgalanmalar TL üzerinde baskı oluşturuyor. Ekonomik istikrar için bir önlem almanız gerekiyor.',
    options: [
      { 
        id: 'increaseInterest', 
        text: 'Faiz artışı', 
        description: 'Merkez Bankası\'nın faizleri artırmasını destekleyin.',
        effects: {
          economy: { inflation: -3, stockMarket: -500 },
          politics: { publicApproval: -5 },
          description: 'Faiz artışı enflasyonu düşürdü ancak borsa düştü ve halkın tepkisini çekti.'
        }
      },
      { 
        id: 'fiscalSupport', 
        text: 'Mali destek paketi', 
        description: 'Ekonomiye mali destek paketi açıklayın.',
        effects: {
          economy: { inflation: 2, budget: -10, growth: 1 },
          politics: { publicApproval: 8 },
          description: 'Mali destek paketi büyümeyi artırdı ve halkın desteğini kazandı, ancak bütçe açığı arttı ve enflasyon yükseldi.'
        }
      },
      { 
        id: 'doNothing', 
        text: 'Piyasalara güven verin', 
        description: 'Radikal adımlar atmadan piyasaları sakinleştirin.',
        effects: {
          economy: { stockMarket: 200 },
          politics: { publicApproval: -2 },
          description: 'Piyasalar kısa vadede sakinleşti ancak halkın güveni azaldı.'
        }
      }
    ],
    image: '💹',
    category: 'economy',
    urgency: 'high'
  },
  
  {
    id: 'educationReform',
    title: 'Eğitim Reformu Tartışmaları',
    description: 'Eğitim sistemindeki sorunlar kamuoyunda tartışılıyor ve bir reform talebi var. Partinizin pozisyonu ne olacak?',
    options: [
      { 
        id: 'comprehensiveReform', 
        text: 'Kapsamlı reform', 
        description: 'Eğitim sisteminde köklü değişiklikler içeren reform paketi.',
        effects: {
          social: { education: 8 },
          politics: { publicApproval: 5, partySupport: 3 },
          description: 'Kapsamlı eğitim reformu halkın desteğini kazandı ve eğitim kalitesini artırdı.'
        }
      },
      { 
        id: 'gradualChanges', 
        text: 'Aşamalı değişiklikler', 
        description: 'Sistemde aşamalı iyileştirmeler yapın.',
        effects: {
          social: { education: 3 },
          politics: { publicApproval: 2, coalitionStrength: 3 },
          description: 'Aşamalı değişiklikler koalisyon ortaklarınız tarafından desteklendi, ancak radikal bir iyileşme sağlanamadı.'
        }
      },
      { 
        id: 'focusOnTeachers', 
        text: 'Öğretmenlere odaklanın', 
        description: 'Öğretmen maaşları ve eğitimlerine öncelik verin.',
        effects: {
          social: { education: 5 },
          economy: { budget: -5 },
          politics: { publicApproval: 6 },
          description: 'Öğretmenlerin durumunu iyileştirme politikanız halk tarafından takdir edildi, ancak bütçeye yük getirdi.'
        }
      }
    ],
    image: '📚',
    category: 'social',
    urgency: 'medium'
  },
  
  {
    id: 'foreignPolicy',
    title: 'Dış Politika Krizi',
    description: 'Komşu ülkelerden biriyle yaşanan diplomatik kriz tırmanıyor. Nasıl bir yaklaşım sergilersiniz?',
    options: [
      { 
        id: 'hardline', 
        text: 'Sert duruş', 
        description: 'Kararlı ve sert bir duruş sergileyin.',
        effects: {
          international: { reputation: 5 },
          politics: { publicApproval: 7, partySupport: 4 },
          description: 'Sert duruşunuz milliyetçi kesimden destek gördü, ancak uluslararası ilişkilerde gerginlik yarattı.'
        }
      },
      { 
        id: 'diplomatic', 
        text: 'Diplomatik çözüm', 
        description: 'Müzakere ve diplomasiyi önceleyin.',
        effects: {
          international: { reputation: 8 },
          politics: { publicApproval: 2, coalitionStrength: 2 },
          description: 'Diplomatik çözüm uluslararası itibarınızı artırdı ancak bazı kesimler tarafından zayıflık olarak algılandı.'
        }
      },
      { 
        id: 'economic', 
        text: 'Ekonomik yaptırımlar', 
        description: 'Ekonomik yaptırımlar uygulayın.',
        effects: {
          economy: { growth: -0.5 },
          international: { reputation: 3 },
          politics: { publicApproval: 4 },
          description: 'Ekonomik yaptırımlar karşı tarafı etkiledi ancak ticari ilişkiler zarar gördü.'
        }
      }
    ],
    image: '🌍',
    category: 'foreign',
    urgency: 'high'
  }
];