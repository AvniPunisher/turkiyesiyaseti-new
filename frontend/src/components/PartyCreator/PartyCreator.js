// src/components/PartyCreator/PartyCreator.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PartyCreator.css';

import apiHelper from '../../services/apiHelper';
import ideologyAxes from '../../data/ideologies.json';
import partyColors from '../../data/partyColors.json';

const getContrastColor = (hexColor) => {
  if (!hexColor) return "#ffffff";
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
  return brightness < 128 ? "#ffffff" : "#000000";
};

const PartyCreator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const slotId = location.state?.slotId || 1;
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [character, setCharacter] = useState(null);
  const [party, setParty] = useState({
    name: '',
    shortName: '',
    colorId: '#d32f2f',
    slotId: slotId,
    ideology: {
      economic: 50,
      cultural: 50,
      diplomatic: 50,
      social: 50,
      government: 50,
      overallPosition: 50
    },
    founderId: null,
    founderName: ''
  });

  useEffect(() => {
    const fromState = location.state?.character;
    if (fromState) {
      setCharacter(fromState);
      setParty(prev => ({
        ...prev,
        founderId: fromState.id || 1,
        founderName: fromState.fullName || 'Karakter Adı',
        ideology: fromState.ideology || prev.ideology
      }));
      return;
    }

    const fetchCharacter = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Parti oluşturmak için önce karakter oluşturmanız gerekmektedir.');
          navigate('/character-creator');
          return;
        }

        const response = await apiHelper.get(`/api/game/get-character/${slotId}`);
        if (response.success && response.data.character) {
          const characterData = response.data.character;
          setCharacter(characterData);
          setParty(prev => ({
            ...prev,
            founderId: characterData.id,
            founderName: characterData.fullName,
            slotId: slotId,
            ideology: { ...characterData.ideology }
          }));
        } else {
          const storedCharacter = localStorage.getItem(`characterData_slot_${slotId}`);
          if (storedCharacter) {
            const characterData = JSON.parse(storedCharacter);
            setCharacter(characterData);
            setParty(prev => ({
              ...prev,
              founderId: characterData.id || 1,
              founderName: characterData.fullName || 'Karakter Adı',
              ideology: characterData.ideology || prev.ideology
            }));
          } else {
            alert('Karakter bilgisi alınamadı. Lütfen önce karakter oluşturun.');
            navigate('/character-creator');
          }
        }
      } catch (error) {
        console.error("Karakter bilgisi hatası:", error);
        alert('Karakter bilgilerine erişilemedi. Lütfen önce karakter oluşturun.');
        navigate('/character-creator');
      }
    };

    fetchCharacter();
  }, [navigate, slotId, location.state]);

  // geri kalan kodun değişmesine gerek yok, üstteki değişiklik problemi çözer
  // ... (devamı aynı kalacak)
};

export default PartyCreator;
