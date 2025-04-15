// src/components/MainMenu.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

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

const MainMenu = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const handleSinglePlayer = () => {
    navigate('/single-player');
  };
  
  const handleMultiPlayer = () => {
    navigate('/multi-player');
  };
  
  const handleLoadGame = () => {
    navigate('/load-game');
  };
  
  const handleLogin = () => {
    navigate('/login');
  };
  
  const handleRegister = () => {
    navigate('/register');
  };
  
  return (
    <MenuContainer>
      <GameTitle>OYUN İSMİ</GameTitle>
      
      {!isLoggedIn ? (
        <AuthButtons>
          <AuthButton onClick={handleLogin}>Giriş Yap</AuthButton>
          <AuthButton onClick={handleRegister}>Kayıt Ol</AuthButton>
        </AuthButtons>
      ) : (
        <AuthButton onClick={() => setIsLoggedIn(false)}>Çıkış Yap</AuthButton>
      )}
      
      <MenuButton onClick={handleSinglePlayer}>Tek Oyunculu</MenuButton>
      <MenuButton onClick={handleMultiPlayer}>Çok Oyunculu</MenuButton>
      <MenuButton onClick={handleLoadGame}>Kayıtlı Oyun Yükle</MenuButton>
    </MenuContainer>
  );
};

export default MainMenu;