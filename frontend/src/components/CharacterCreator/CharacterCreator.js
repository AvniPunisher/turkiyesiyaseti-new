const createCharacter = async () => {
    try {
      setLoading(true);
      console.log("Karakter oluşturuluyor:", character);
      
      // Token kontrolü
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Karakter oluşturmak için giriş yapmanız gerekmektedir.');
        navigate('/login', { state: { returnUrl: '/character-creator' } });
        return;
      }
      
      // Formda eksik alan kontrolü
      if (!character.fullName || !character.birthPlace || !character.profession) {
        alert('Lütfen tüm gerekli alanları doldurun.');
        setLoading(false);
        return;
      }
      
      // Karakter verisini MySQL'e kaydet
      const response = await axios.post('http://localhost:5000/api/game/create-character', 
        { character },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        alert('Karakter başarıyla oluşturuldu!');
        // Oyun ekranına yönlendir
        navigate('/single-player', { state: { character: response.data.character } });
      } else {
        throw new Error(response.data.message || 'Karakter oluşturulurken bir hata oluştu');
      }
    } catch (error) {
      console.error("Karakter oluşturma hatası:", error);
      
      // API bağlantı hatası
      if (error.code === 'ERR_NETWORK') {
        alert("Sunucuya bağlantı kurulamadı. Lütfen sunucunun çalıştığından emin olun.");
      } 
      // Token hatası
      else if (error.response && error.response.status === 401) {
        alert("Oturum süreniz dolmuş. Lütfen yeniden giriş yapın.");
        localStorage.removeItem('token');
        navigate('/login', { state: { returnUrl: '/character-creator' } });
      }
      // Diğer hatalar
      else {
        alert("Karakter oluşturulurken bir hata oluştu: " + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };