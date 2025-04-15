// src/components/MainMenu.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(to bottom, #1a2a3a, #0a1a2a);
  color: white;
  font-family: 'Orbitron', sans-serif;
`;

const GameTitle = styled.h1`
  font-size: 3.5rem;
  margin-bottom: 2rem;
  text-shadow: 0 0 10px rgba(0, 200, 255, 0.7);
  letter-spacing: 3px;
`;

const MenuButton = styled.button`
  width: 280px;
  padding: 1rem;
  margin: 0.7rem 0;
  font-size: 1.2rem;
  background: rgba(0, 100, 200, 0.3);
  border: 2px solid rgba(0, 200, 255, 0.5);
  border-radius: 5px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Orbitron', sans-serif;
  
  &:hover {
    background: rgba(0, 150, 255, 0.5);
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(0, 200, 255, 0.7);
  }
`;

const AuthButtons = styled.div`
  display: flex;
  justify-content: center;
  width: 280px;
  margin-bottom: 1.5rem;
`;

const AuthButton = styled.button`
  flex: 1;
  padding: 0.8rem;
  margin: 0 0.5rem;
  font-size: 1rem;
  background: rgba(0, 100, 200, 0.3);
  border: 2px solid rgba(0, 200, 255, 0.5);
  border-radius: 5px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Orbitron', sans-serif;
  
  &:hover {
    background: rgba(0, 150, 255, 0.5);
  }
`;

const UserInfo = styled.div`
  background: rgba(0, 30, 60, 0.7);
  padding: 10px 20px;
  border-radius: 20px;
  border: 1px solid rgba(0, 200, 255, 0.3);
  margin-bottom: 1.5rem;
  font-size: 1rem;
`;

const Loading = styled.div`
  color: rgba(0, 200, 255, 0.8);
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
`;

const MainMenu = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    // Token kontrolü
    const token = localStorage.getItem('token');
    if (token) {
      checkAuthStatus(token);
    } else {
      setLoading(false);
    }
  }, []);
  
  const checkAuthStatus = async (token) => {
    try {
      // Kullanıcı bilgilerini kontrol et
      const response = await axios.get('http://localhost:5001/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setIsLoggedIn(true);
        setUserData(response.data.user);
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Kullanıcı bilgileri alınamadı:', error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };
  
  const handleSinglePlayer = () => {
    // Tek oyunculu moda yönlendir
    // Giriş yapmadıysa login ekranı, karakteri yoksa karakter oluşturmaya SinglePlayer bileşeni içinde yönlendirilecek
    navigate('/single-player');
  };
  
  const handleMultiPlayer = () => {
    // Çok oyunculu moda yönlendir
    // Giriş yapmadıysa login ekranına MultiPlayer bileşeni içinde yönlendirilecek
    navigate('/multi-player');
  };
  
  const handleLoadGame = () => {
    // Kayıtlı oyun yükleme ekranına yönlendir
    // Giriş yapmadıysa login ekranına LoadGame bileşeni içinde yönlendirilecek
    navigate('/load-game');
  };
  
  const handleLogin = () => {
    navigate('/login', { state: { returnUrl: '/' } });
  };
  
  const handleRegister = () => {
    navigate('/register');
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserData(null);
  };
  
  if (loading) {
    return (
      <MenuContainer>
        <GameTitle>TÜRKİYE SİYASET SİMÜLASYONU</GameTitle>
        <Loading>Yükleniyor...</Loading>
      </MenuContainer>
    );
  }
  
  return (
    <MenuContainer>
      <GameTitle>TÜRKİYE SİYASET SİMÜLASYONU</GameTitle>
      
      {isLoggedIn && userData ? (
        <UserInfo>
          Hoş geldiniz, {userData.username} 
          <button 
            onClick={handleLogout} 
            style={{ 
              marginLeft: '15px', 
              background: 'none', 
              border: 'none', 
              color: 'rgba(0, 200, 255, 0.8)', 
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Çıkış Yap
          </button>
        </UserInfo>
      ) : (
        <AuthButtons>
          <AuthButton onClick={handleLogin}>Giriş Yap</AuthButton>
          <AuthButton onClick={handleRegister}>Kayıt Ol</AuthButton>
        </AuthButtons>
      )}
      
      <MenuButton onClick={handleSinglePlayer}>Tek Oyunculu</MenuButton>
      <MenuButton onClick={handleMultiPlayer}>Çok Oyunculu</MenuButton>
      <MenuButton onClick={handleLoadGame}>Kayıtlı Oyun Yükle</MenuButton>
    </MenuContainer>
  );
};

export default MainMenu;
