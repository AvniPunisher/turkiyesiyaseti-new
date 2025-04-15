// src/components/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(to bottom, #1a2a3a, #0a1a2a);
  color: white;
  font-family: 'Orbitron', sans-serif;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 320px;
  padding: 2rem;
  background: rgba(0, 30, 60, 0.7);
  border-radius: 10px;
  border: 1px solid rgba(0, 200, 255, 0.3);
  box-shadow: 0 0 20px rgba(0, 200, 255, 0.3);
`;

const FormTitle = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
  color: rgba(0, 200, 255, 0.8);
`;

const FormInput = styled.input`
  padding: 0.8rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(0, 200, 255, 0.5);
  border-radius: 5px;
  background: rgba(0, 20, 40, 0.8);
  color: white;
  font-family: 'Orbitron', sans-serif;
  
  &:focus {
    outline: none;
    border-color: rgba(0, 200, 255, 0.8);
    box-shadow: 0 0 10px rgba(0, 200, 255, 0.5);
  }
`;

const FormButton = styled.button`
  padding: 0.8rem;
  margin-top: 0.5rem;
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
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &:hover {
    color: rgba(0, 200, 255, 1);
    text-shadow: 0 0 5px rgba(0, 200, 255, 0.5);
  }
`;

const ErrorMessage = styled.p`
  color: #ff5555;
  margin-bottom: 1rem;
  text-align: center;
`;

const SuccessMessage = styled.p`
  color: #55ff7f;
  margin-bottom: 1rem;
  text-align: center;
  background: rgba(0, 50, 20, 0.3);
  padding: 8px;
  border-radius: 4px;
  border: 1px solid rgba(0, 200, 100, 0.5);
`;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // URL'den returnUrl'i al (eğer varsa)
  const returnUrl = location.state?.returnUrl || '/';
  
  // Kayıt başarılı mesajını kontrol et
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location.state]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      console.log("Login isteği gönderiliyor...", formData);
      
      // API çağrısı
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      console.log("Login yanıtı:", response.data);
      
      // JWT tokenı localStorage'a kaydet
      localStorage.setItem('token', response.data.token);
      
      // Kullanıcı bilgilerini localStorage'a kaydet
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      console.log("Giriş başarılı, yönlendiriliyor:", returnUrl);
      
      // Belirtilen yere veya varsayılan olarak ana sayfaya yönlendir
      if (returnUrl === '/character-creator') {
        navigate('/character-creator');
      } else {
        navigate(returnUrl);
      }
    } catch (err) {
      console.error("Giriş hatası:", err);
      
      // Network hatası
      if (err.code === 'ERR_NETWORK') {
        setError('Sunucuya bağlanılamadı. Backend sunucunun çalıştığından emin olun.');
      }
      // Server'dan dönen spesifik hata
      else if (err.response && err.response.data) {
        setError(err.response.data.message || 'Sunucu hatası: ' + err.response.status);
        console.log("Sunucu yanıtı:", err.response.data);
      }
      // Diğer hatalar
      else {
        setError('Giriş yapılırken bir hata oluştu: ' + err.message);
      }
    }
  };
  
  return (
    <LoginContainer>
      <LoginForm onSubmit={handleSubmit}>
        <FormTitle>Giriş Yap</FormTitle>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
        
        <FormInput
          type="email"
          name="email"
          placeholder="E-posta"
          value={formData.email}
          onChange={handleChange}
          required
        />
        
        <FormInput
          type="password"
          name="password"
          placeholder="Şifre"
          value={formData.password}
          onChange={handleChange}
          required
        />
        
        <FormButton type="submit">Giriş Yap</FormButton>
      </LoginForm>
      
      <BackLink to="/register">Hesabınız yok mu? Kayıt olun</BackLink>
      <BackLink to="/">Ana Menüye Dön</BackLink>
    </LoginContainer>
  );
};

export default Login;