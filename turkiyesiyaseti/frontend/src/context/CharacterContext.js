import React, { createContext, useContext, useState } from 'react';

// Context oluştur
const CharacterContext = createContext();

// Provider bileşeni
export const CharacterProvider = ({ children }) => {
  // Karakter bilgilerini tut
  const [character, setCharacter] = useState({
    name: "Mehmet Yılmaz",
    party: "Cumhuriyet Halk Partisi",
    partyShort: "CHP",
    partyColor: "#E81B23",
    role: "Milletvekili",
    popularity: 42,
    experience: 0,
    skills: {
      charisma: 6,
      intelligence: 7,
      determination: 5,
      communication: 8,
      leadership: 6
    }
  });
  
  // Context değerlerini dışa aktar
  const value = {
    character,
    setCharacter
  };

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
};

// Context hook
export const useCharacterContext = () => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacterContext must be used within a CharacterProvider');
  }
  return context;
};