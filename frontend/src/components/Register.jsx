// src/components/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const RegisterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(to bottom, #1a2a3a, #0a1a2a);
  color: white;
  font-family: 'Orbitron', sans-serif;
`;

const RegisterForm = styled.form`
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

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }
    
    try {
      console.log("Kayıt isteği gönderiliyor:", {
        username: formData.username,
        email: formData.email,
        // Güvenlik için şifreyi loglamıyoruz
      });
      
      // API çağrısı
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      console.log("Kayıt başarılı:", response.data);
      
      // Başarılı kayıt sonrası giriş sayfasına yönlendir
      navigate('/login', { state: { message: 'Kayıt işlemi başarılı. Lütfen giriş yapın.' } });
    } catch (err) {
      console.error("Kayıt hatası:", err);
      
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
        setError('Kayıt olurken bir hata oluştu: ' + err.message);
      }
    }
  };
  
  return (
    <RegisterContainer>
      <RegisterForm onSubmit={handleSubmit}>
        <FormTitle>Kayıt Ol</FormTitle>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <FormInput
          type="text"
          name="username"
          placeholder="Kullanıcı Adı"
          value={formData.username}
          onChange={handleChange}
          required
        />
        
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
        
        <FormInput
          type="password"
          name="confirmPassword"
          placeholder="Şifreyi Tekrarla"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        
        <FormButton type="submit">Kayıt Ol</FormButton>
      </RegisterForm>
      
      <BackLink to="/login">Zaten hesabınız var mı? Giriş yapın</BackLink>
      <BackLink to="/">Ana Menüye Dön</BackLink>
    </RegisterContainer>
  );
};

export default Register;