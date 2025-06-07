// src/pages/GamePage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';

const GamePage = () => {
  const { id } = useParams();
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Oyun Sayfası</h1>
      <p>Şu an slot ID: <strong>{id}</strong> üzerindesin.</p>
    </div>
  );
};

export default GamePage;
