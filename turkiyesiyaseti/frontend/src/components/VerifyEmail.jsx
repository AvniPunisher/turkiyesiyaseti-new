// src/components/VerifyEmail.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const VerifyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(to bottom, #1a2a3a, #0a1a2a);
  color: white;
  font-family: 'Orbitron', sans-serif;
`;

const VerifyCard = styled.div`
  width: 400px;
  padding: 2rem;
  background: rgba(0, 30, 60, 0.7);
  border-radius: 10px;
  border: 1px solid rgba(0, 200, 255, 0.3);
  box-shadow: 0 0 20px rgba(0, 200, 255, 0.3);
  text-align: center;
`;

const StatusMessage = styled.p`
  margin: 1.5rem 0;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
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

const BackLink = styled(Link)`
  color: rgba(0, 200, 255, 0.8);
  text-decoration: none;
  margin-top: 1rem;
  display: inline-block;
  
  &:hover {
    text-decoration: underline;
  }
`;

const SpinnerContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid rgba(0, 200, 255, 0.3);
  border-top-color: rgba(0, 200, 255, 0.8);
  animation: spin 1s linear infinite;
  margin: 0 auto;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('E-posta doğrulanıyor...');
  
  useEffect(() => {
    const verifyEmail = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Geçersiz doğrulama bağlantısı');
        return;
      }
      
      try {
        const response = await axios.get(`https://api.turkiyesiyaseti.net/api/auth/verify-email/${token}`);
        
        if (response.data.success) {
          setStatus('success');
          setMessage('E-posta adresiniz başarıyla doğrulandı! Şimdi giriş yapabilirsiniz.');
        } else {
          setStatus('error');
          setMessage(response.data.message || 'Doğrulama başarısız oldu.');
        }
      } catch (error) {
        setStatus('error');
        setMessage(
          error.response?.data?.message || 
          'Doğrulama sırasında bir hata oluştu. Bağlantı geçersiz veya süresi dolmuş olabilir.'
        );
      }
    };
    
    verifyEmail();
  }, [location]);
  
  return (
    <VerifyContainer>
      <VerifyCard>
        <h2 style={{ color: 'rgba(0, 200, 255, 0.8)' }}>E-posta Doğrulama</h2>
        
        <StatusMessage>
          {message}
        </StatusMessage>
        
        {status === 'loading' && <SpinnerContainer />}
        
        {status === 'success' && (
          <Button onClick={() => navigate('/login')}>
            Giriş Yap
          </Button>
        )}
        
        {status === 'error' && (
          <BackLink to="/login">
            Giriş Sayfasına Dön
          </BackLink>
        )}
      </VerifyCard>
    </VerifyContainer>
  );
};

export default VerifyEmail;