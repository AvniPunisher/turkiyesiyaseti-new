// src/components/CharacterCreator/CharacterCreator.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CharacterCreator.css';

import apiHelper from '../../services/apiHelper';
import ideologyAxes from '../../data/ideologies.json';
import cities from '../../data/cities.json';
import professions from '../../data/professions.json';

const CharacterCreator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const slotId = location.state?.slotId || 1;

  const [character, setCharacter] = useState({
    gameName: '',
    fullName: '',
    age: 40,
    gender: 'Erkek',
    birthPlace: '',
    profession: '',
    ideology: {
      economic: 50,
      governance: 50,
      cultural: 50,
      identity: 50,
      religion: 50,
      foreign: 50,
      change: 50,
      overallPosition: 50
    },
    stats: {
      hitabet: 5,
      karizma: 5,
      zeka: 5,
      liderlik: 5,
      direnc: 5,
      ideolojikTutarlilik: 5,
      taktikZeka: 5
    },
    dynamicValues: {
      sadakat: 50,
      tecrube: 0,
      populerlik: 10,
      prestij: 30,
      imaj: 'Nötr'
    },
    expertise: []
  });

  const [remainingStatPoints, setRemainingStatPoints] = useState(0);
  const totalStatPoints = 35;

  useEffect(() => {
    const usedPoints = Object.values(character.stats).reduce((t, s) => t + s, 0);
    setRemainingStatPoints(totalStatPoints - usedPoints);
  }, [character.stats]);

  const calculateOverallPosition = (values) => {
    let totalWeight = 0;
    let weightedSum = 0;
    for (const axis in ideologyAxes) {
      if (values[axis] !== undefined) {
        weightedSum += values[axis] * (ideologyAxes[axis].weight || 1);
        totalWeight += (ideologyAxes[axis].weight || 1);
      }
    }
    return totalWeight > 0 ? weightedSum / totalWeight : 50;
  };

  const handleIdeologyChange = (axis, value) => {
    const positions = [0, 25, 50, 75, 100];
    const closest = positions.reduce((a, b) => Math.abs(b - value) < Math.abs(a - value) ? b : a);
    const newIdeology = { ...character.ideology, [axis]: closest };
    newIdeology.overallPosition = calculateOverallPosition(newIdeology);
    setCharacter({ ...character, ideology: newIdeology });
  };

  const handleStatChange = (stat, value) => {
    const otherTotal = Object.entries(character.stats).filter(([k]) => k !== stat).reduce((s, [_, v]) => s + v, 0);
    const maxAllowed = Math.min(10, totalStatPoints - otherTotal);
    const newValue = Math.max(1, Math.min(value, maxAllowed));
    setCharacter({ ...character, stats: { ...character.stats, [stat]: newValue } });
  };

  const handleInputChange = (field, value) => {
    setCharacter({ ...character, [field]: value });
  };

  const changeTab = (tabIndex) => {
    if (tabIndex === 1 && (!character.fullName || !character.birthPlace || !character.profession)) return;
    setCurrentTab(tabIndex);
  };

  const proceedToNextTab = () => {
    if (character.fullName && character.birthPlace && character.profession) {
      setCurrentTab(1);
    }
  };

  const createCharacter = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Giriş yapmanız gerekli.');
        navigate('/login', { state: { returnUrl: '/character-creator' } });
        return;
      }
      if (!character.fullName || !character.birthPlace || !character.profession) {
        alert('Lütfen tüm alanları doldurun.');
        setLoading(false);
        return;
      }
      const characterData = { ...character, slotId };
      localStorage.setItem(`characterData_slot_${slotId}`, JSON.stringify(characterData));
      const response = await apiHelper.post('/api/game/create-character', { character: characterData, slotId });
      if (response.success) {
        alert('Karakter oluşturuldu!');
        navigate('/party-creator', { state: { character: response.data.character, slotId } });
      } else {
        console.warn('API başarısız, yerel verilerle devam ediliyor.');
        navigate('/party-creator', { state: { character: characterData, slotId } });
      }
    } catch (error) {
      console.error('Karakter oluşturma hatası:', error);
      navigate('/party-creator', { state: { character, slotId } });
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => navigate('/single-player');

  return (
    <div className="character-container">
      {/* tasarım ve form bileşenleri (değişmedi) */}
    </div>
  );
};

export default CharacterCreator;
