// src/components/GameScreen/GameScreen.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import CountryManagementPanel from '../CountryManagementPanel/CountryManagementPanel';

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(to bottom, #1a2a3a, #0a1a2a);
  color: white;
  font-family: 'Orbitron', sans-serif;
  overflow: hidden;
`;

const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(0, 30, 60, 0.7);
  border-bottom: 1px solid rgba(0, 200, 255, 0.3);
  height: 64px;
  z-index: 10;
`;

const GameTitle = styled.h2`
  margin: 0;
  color: rgba(0, 200, 255, 0.8);
`;

const HeaderControls = styled.div`
  display: flex;
  gap: 1rem;
`;

const InfoText = styled.div`
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
`;

const GameCanvas = styled.div`
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
`;

const SideMenu = styled.div`
  width: 200px;
  background: rgba(0, 20, 40, 0.8);
  border-right: 1px solid rgba(0, 200, 255, 0.3);
  padding: 1rem 0;
  overflow-y: auto;
`;

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: ${(props) => (props.active ? 'rgba(0, 100, 200, 0.5)' : 'transparent')};
  border: none;
  color: white;
  text-align: left;
  font-family: 'Orbitron', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 100, 200, 0.3);
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
`;

const TabContent = styled.div`
  padding: 20px;
  background: rgba(0, 30, 60, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(0, 200, 255, 0.3);
  height: 100%;
`;

const GameControls = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: rgba(0, 30, 60, 0.7);
  border-top: 1px solid rgba(0, 200, 255, 0.3);
`;

const Button = styled.button`
  padding: 0.6rem 1.2rem;
  background: rgba(0, 100, 200, 0.5);
  border: none;
  border-radius: 5px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Orbitron', sans-serif;
  
  &:hover {
    background: rgba(0, 150, 255, 0.7);
  }
`;

const GameScreen = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [gamePaused, setGamePaused] = useState(false);
  const [showCountryPanel, setShowCountryPanel] = useState(false);
  
  // Simüle edilmiş oyun verileri
  const [gameData, setGameData] = useState({
    date: "15 Haziran 2025",
    month: 6,
    year: 2025,
    popularity: 42,
    partyFunds: 7500000,
    seatCount: 120,
    totalSeats: 600
  });
  
  // Tab içeriklerini hazırla
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <TabContent>
            <h2>Ana Gösterge Paneli</h2>
            <p>Hoş geldiniz! Bu ekrandan partinizin ve ülkenin genel durumunu takip edebilirsiniz.</p>
            
            <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div style={{ 
                background: 'rgba(0, 40, 80, 0.5)', 
                padding: '15px', 
                borderRadius: '8px',
                border: '1px solid rgba(0, 200, 255, 0.3)'
              }}>
                <h3 style={{ color: 'rgba(0, 200, 255, 0.8)', marginTop: 0 }}>Parti Durumu</h3>
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span>Popülerlik:</span>
                    <span>{gameData.popularity}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span>Parti Fonu:</span>
                    <span>{gameData.partyFunds.toLocaleString()} ₺</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Meclis Koltukları:</span>
                    <span>{gameData.seatCount}/{gameData.totalSeats}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ 
                background: 'rgba(0, 40, 80, 0.5)', 
                padding: '15px', 
                borderRadius: '8px',
                border: '1px solid rgba(0, 200, 255, 0.3)'
              }}>
                <h3 style={{ color: 'rgba(0, 200, 255, 0.8)', marginTop: 0 }}>Ülke Durumu</h3>
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span>Ekonomik Durum:</span>
                    <span style={{ color: 'rgb(255, 180, 100)' }}>Orta</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span>İstihdam:</span>
                    <span>%63.8</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Gelecek Seçim:</span>
                    <span>14 ay</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowCountryPanel(true)}
                  style={{ 
                    marginTop: '15px',
                    background: 'rgba(0, 100, 200, 0.5)',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Ülke Detaylarını Görüntüle
                </button>
              </div>
            </div>
            
            <div style={{ 
              marginTop: '20px', 
              background: 'rgba(0, 40, 80, 0.5)', 
              padding: '15px', 
              borderRadius: '8px',
              border: '1px solid rgba(0, 200, 255, 0.3)'
            }}>
              <h3 style={{ color: 'rgba(0, 200, 255, 0.8)', marginTop: 0 }}>Son Olaylar</h3>
              <div style={{ marginTop: '10px' }}>
                <div style={{ padding: '10px', borderBottom: '1px solid rgba(0, 200, 255, 0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 'bold' }}>Bütçe Görüşmeleri Başladı</span>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>2 gün önce</span>
                  </div>
                  <p style={{ margin: '5px 0 0', fontSize: '0.9rem' }}>
                    Meclis'te yeni bütçe görüşmeleri başladı. Tartışmalar devam ediyor.
                  </p>
                </div>
                
                <div style={{ padding: '10px', borderBottom: '1px solid rgba(0, 200, 255, 0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 'bold' }}>Merkez Bankası Faiz Kararı</span>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>5 gün önce</span>
                  </div>
                  <p style={{ margin: '5px 0 0', fontSize: '0.9rem' }}>
                    Merkez Bankası politika faizini %35'te sabit tuttu.
                  </p>
                </div>
                
                <div style={{ padding: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 'bold' }}>Kamuoyu Yoklaması Sonuçları</span>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>1 hafta önce</span>
                  </div>
                  <p style={{ margin: '5px 0 0', fontSize: '0.9rem' }}>
                    Yeni yapılan kamuoyu yoklamasında partiniz %2 oy oranı kaybetti.
                  </p>
                </div>
              </div>
            </div>
          </TabContent>
        );
        
      case 'party':
        return (
          <TabContent>
            <h2>Parti Yönetimi</h2>
            <p>Partinizin yapısını, üyelerini ve politikalarını bu ekrandan yönetebilirsiniz.</p>
            {/* Parti yönetimi içeriği buraya gelecek */}
          </TabContent>
        );
        
      case 'campaign':
        return (
          <TabContent>
            <h2>Seçim Kampanyası</h2>
            <p>Seçim kampanyalarını yönetmek ve stratejiler belirlemek için bu ekranı kullanabilirsiniz.</p>
            {/* Kampanya içeriği buraya gelecek */}
          </TabContent>
        );
        
      case 'legislation':
        return (
          <TabContent>
            <h2>Yasama Faaliyetleri</h2>
            <p>Mecliste sunulan ve oylanan yasa teklifleri burada listelenir.</p>
            {/* Yasama içeriği buraya gelecek */}
          </TabContent>
        );
        
      case 'media':
        return (
          <TabContent>
            <h2>Medya ve Halkla İlişkiler</h2>
            <p>Medya etkinlikleri, demeçler ve halkla ilişkiler stratejileri burada yönetilir.</p>
            {/* Medya içeriği buraya gelecek */}
          </TabContent>
        );
        
      case 'relations':
        return (
          <TabContent>
            <h2>Siyasi İlişkiler</h2>
            <p>Diğer partiler, kanaat önderleri ve sivil toplum kuruluşlarıyla ilişkilerinizi buradan yönetebilirsiniz.</p>
            {/* İlişkiler içeriği buraya gelecek */}
          </TabContent>
        );
        
      case 'elections':
        return (
          <TabContent>
            <h2>Seçim Sonuçları ve Analizler</h2>
            <p>Geçmiş seçim sonuçları ve analizler burada gösterilir.</p>
            {/* Seçim içeriği buraya gelecek */}
          </TabContent>
        );
        
      default:
        return <div>İçerik bulunamadı</div>;
    }
  };
  
  const togglePause = () => {
    setGamePaused(!gamePaused);
  };
  
  const saveGame = () => {
    alert('Oyun kaydedildi!');
  };
  
  const returnToMenu = () => {
    navigate('/');
  };

  return (
    <GameContainer>
      <GameHeader>
        <GameTitle>Türkiye Siyaset Simülasyonu</GameTitle>
        <HeaderControls>
          <InfoText>Tarih: {gameData.date}</InfoText>
          <InfoText style={{ marginLeft: '20px' }}>Popülerlik: {gameData.popularity}%</InfoText>
          <InfoText style={{ marginLeft: '20px' }}>Parti Fonu: {gameData.partyFunds.toLocaleString()} ₺</InfoText>
        </HeaderControls>
      </GameHeader>
      
      <GameCanvas>
        <SideMenu>
          <MenuButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')}
          >
            Ana Sayfa
          </MenuButton>
          <MenuButton 
            active={activeTab === 'party'} 
            onClick={() => setActiveTab('party')}
          >
            Parti Yönetimi
          </MenuButton>
          <MenuButton 
            active={activeTab === 'campaign'} 
            onClick={() => setActiveTab('campaign')}
          >
            Kampanya
          </MenuButton>
          <MenuButton 
            active={activeTab === 'legislation'} 
            onClick={() => setActiveTab('legislation')}
          >
            Yasama
          </MenuButton>
          <MenuButton 
            active={activeTab === 'media'} 
            onClick={() => setActiveTab('media')}
          >
            Medya
          </MenuButton>
          <MenuButton 
            active={activeTab === 'relations'} 
            onClick={() => setActiveTab('relations')}
          >
            İlişkiler
          </MenuButton>
          <MenuButton 
            active={activeTab === 'elections'} 
            onClick={() => setActiveTab('elections')}
          >
            Seçimler
          </MenuButton>
        </SideMenu>
        
        <MainContent>
          {renderTabContent()}
        </MainContent>
        
        {/* Ülke Yönetim Paneli */}
        <CountryManagementPanel 
          isOpen={showCountryPanel}
          onClose={() => setShowCountryPanel(false)}
          populationData={{
            total: 85250000,
            urban: 76725000,
            rural: 8525000,
            regions: {
              "Marmara": 25575000,
              "İç Anadolu": 14492500,
              "Ege": 11085000,
              "Akdeniz": 10997500,
              "Karadeniz": 8100000,
              "Güneydoğu Anadolu": 9377500,
              "Doğu Anadolu": 5622500
            }
          }}
        />
      </GameCanvas>
      
      <GameControls>
        <Button onClick={returnToMenu}>Ana Menü</Button>
        <div>
          <Button onClick={togglePause} style={{ marginRight: '10px' }}>
            {gamePaused ? 'Devam Et' : 'Duraklat'}
          </Button>
          <Button onClick={() => setGameData(prev => ({...prev, month: prev.month + 1}))}>
            İlerle (1 Ay)
          </Button>
        </div>
        <Button onClick={saveGame}>Kaydet</Button>
      </GameControls>
    </GameContainer>
  );
};

export default GameScreen;