import React from 'react';

const CurrentEvents = () => {
  // Dummy data for current events
  const events = [
    {
      id: 1,
      title: 'Ekonomik Dalgalanma',
      description: 'Küresel piyasalardaki dalgalanmalar TL üzerinde baskı oluşturuyor.',
      status: 'urgent',
      icon: '💹',
      time: '1 gün önce'
    },
    {
      id: 2,
      title: 'Eğitim Reformu Tartışmaları',
      description: 'Eğitim sistemindeki sorunlar kamuoyunda tartışılıyor ve reform talebi var.',
      status: 'pending',
      icon: '📚',
      time: '3 gün önce'
    }
  ];

  return (
    <div className="events-panel">
      <h3>Güncel Olaylar</h3>
      <div className="events-list">
        {events.map(event => (
          <div className="event-card" key={event.id}>
            <div className="event-icon">{event.icon}</div>
            <div className="event-content">
              <div className="event-title">{event.title}</div>
              <div className="event-description">{event.description}</div>
              <div className="event-footer">
                <span className={`event-status status-${event.status}`}>
                  {event.status === 'urgent' ? 'Acil' : 
                   event.status === 'pending' ? 'Beklemede' : 'Çözüldü'}
                </span>
                <span className="event-time">{event.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="upcoming-events">
        <h4>Yaklaşan Olaylar</h4>
        <div className="upcoming-list">
          <div className="upcoming-event">
            <div className="upcoming-date">2 Şubat</div>
            <div className="upcoming-content">
              <div className="upcoming-title">Ekonomik Program Açıklanacak</div>
            </div>
          </div>
          
          <div className="upcoming-event">
            <div className="upcoming-date">10 Şubat</div>
            <div className="upcoming-content">
              <div className="upcoming-title">AB Heyet Görüşmesi</div>
            </div>
          </div>
          
          <div className="upcoming-event">
            <div className="upcoming-date">15 Şubat</div>
            <div className="upcoming-content">
              <div className="upcoming-title">Bütçe Görüşmeleri Başlayacak</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentEvents;