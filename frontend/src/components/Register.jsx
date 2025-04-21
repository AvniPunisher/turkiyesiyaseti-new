// src/components/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import ReCAPTCHA from "react-google-recaptcha";

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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

const PasswordStrengthContainer = styled.div`
  margin-bottom: 1rem;
`;

const PasswordCriteriaContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 0.3rem;
  font-size: 0.8rem;
`;

const PasswordCriteriaItem = styled.span`
  color: ${props => props.met ? 'rgba(0, 255, 0, 0.8)' : 'rgba(255, 0, 0, 0.8)'};
  margin-bottom: 0.2rem;
`;

const RecaptchaContainer = styled.div`
  margin: 1rem 0;
  display: flex;
  justify-content: center;
`;

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    recaptchaValue: null
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    valid: false,
    message: '',
    criteria: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    }
  });
  
  const checkPasswordStrength = (password) => {
    const criteria = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const valid = Object.values(criteria).every(c => c);
    
    let message = '';
    if (!valid) {
      message = 'Şifre şunları içermelidir:';
      if (!criteria.length) message += ' en az 8 karakter,';
      if (!criteria.uppercase) message += ' büyük harf,';
      if (!criteria.lowercase) message += ' küçük harf,';
      if (!criteria.number) message += ' sayı,';
      if (!criteria.special) message += ' özel karakter,';
      message = message.slice(0, -1); // Son virgülü kaldır
    }
    
    setPasswordStrength({
      valid,
      message,
      criteria
    });
  };
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    
    // Şifre değiştiğinde karmaşıklığını kontrol et
    if (e.target.name === 'password') {
      checkPasswordStrength(e.target.value);
    }
  };
  
  const handleRecaptchaChange = (value) => {
    setFormData({
      ...formData,
      recaptchaValue: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }
    
    if (!passwordStrength.valid) {
      setError(passwordStrength.message);
      return;
    }

    if (!formData.recaptchaValue) {
      setError('Lütfen robot olmadığınızı doğrulayın');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Kayıt isteği gönderiliyor:", {
        username: formData.username,
        email: formData.email,
        // Güvenlik için şifreyi loglamıyoruz
      });
      
      // API çağrısı
      const response = await axios.post('https://api.turkiyesiyaseti.net/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        recaptchaValue: formData.recaptchaValue
      });
      
      console.log("Kayıt başarılı:", response.data);
      
      // Başarılı kayıt sonrası giriş sayfasına yönlendir
      navigate('/login', { state: { message: 'Kayıt işlemi başarılı. Lütfen e-posta adresinizi doğrulayıp giriş yapın.' } });
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
    } finally {
      setIsSubmitting(false);
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
        
        <PasswordStrengthContainer>
          <PasswordCriteriaContainer>
            <PasswordCriteriaItem met={passwordStrength.criteria.length}>8+ Karakter</PasswordCriteriaItem>
            <PasswordCriteriaItem met={passwordStrength.criteria.uppercase}>Büyük Harf</PasswordCriteriaItem>
            <PasswordCriteriaItem met={passwordStrength.criteria.lowercase}>Küçük Harf</PasswordCriteriaItem>
            <PasswordCriteriaItem met={passwordStrength.criteria.number}>Sayı</PasswordCriteriaItem>
            <PasswordCriteriaItem met={passwordStrength.criteria.special}>Özel Karakter</PasswordCriteriaItem>
          </PasswordCriteriaContainer>
        </PasswordStrengthContainer>
        
        <FormInput
          type="password"
          name="confirmPassword"
          placeholder="Şifreyi Tekrarla"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        
        <RecaptchaContainer>
          <ReCAPTCHA
            sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Test site key, gerçek uygulamada kendi anahtarınızı kullanın
            onChange={handleRecaptchaChange}
          />
        </RecaptchaContainer>
        
        <FormButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Kaydediliyor...' : 'Kayıt Ol'}
        </FormButton>
      </RegisterForm>
      
      <BackLink to="/login">Zaten hesabınız var mı? Giriş yapın</BackLink>
      <BackLink to="/">Ana Menüye Dön</BackLink>
    </RegisterContainer>
  );
};

export default Register;
