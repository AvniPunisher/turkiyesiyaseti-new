// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [slots, setSlots] = useState([null, null, null]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/slots`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setSlots(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Slot verileri alınamadı:', err);
        setLoading(false);
      });
  }, [token]);

  const startNewGame = (slotNumber) => {
    const gameName = prompt("Yeni oyun adı giriniz:");
    if (!gameName) return;

    axios
      .post(
        `${process.env.REACT_APP_API_URL}/api/slots`,
        { slotNumber, gameName },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        alert('Oyun oluşturuldu!');
        navigate(`/slot/${res.data.id}`);
      })
      .catch((err) => {
        console.error('Oyun başlatılamadı:', err);
        alert('Bir hata oluştu.');
      });
  };

  if (loading) return <div className="text-center p-10">Yükleniyor...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Oyun Slotları</h1>
      <div className="grid grid-cols-1 gap-4">
        {slots.map((slot, index) => (
          <div
            key={index}
            className="border p-4 rounded-lg shadow-md bg-white flex justify-between items-center"
          >
            {slot ? (
              <>
                <div>
                  <p className="font-semibold">Slot {index + 1}</p>
                  <p className="text-gray-600">Oyun: {slot.gameName}</p>
                </div>
                <button
                  onClick={() => navigate(`/slots/${slot.id}`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Devam Et
                </button>
              </>
            ) : (
              <>
                <p className="font-semibold">Slot {index + 1} - Boş</p>
                <button
                  onClick={() => startNewGame(index)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Yeni Oyun Başlat
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
