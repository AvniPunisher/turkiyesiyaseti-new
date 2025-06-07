import React, { useState, useEffect } from "react";
import cities from "../data/cities.json";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const ideologies = [
  {
    key: "statism",
    name: "Devletçilik",
    description:
      "Ekonomide devletin rolüne dair görüşünüz (0: Liberteryen, 100: Komünist)",
  },
  {
    key: "nationalism",
    name: "Milliyetçilik",
    description:
      "Etnik ve ulusal kimliğe yaklaşım (0: Kozmopolit, 100: Irkçı)",
  },
  {
    key: "religion",
    name: "Laiklik / Dindarlık",
    description:
      "Devletin dinle ilişkisi (0: Katı laik, 100: Teokratik rejim)",
  },
  {
    key: "culture",
    name: "Kültürel",
    description:
      "Toplumsal değerlere yaklaşım (0: İlerici, 100: Gelenekselci)",
  },
  {
    key: "identity",
    name: "Kimlik",
    description:
      "Kimlik politikalarına yaklaşım (0: Çoğulcu, 100: Milliyetçi)",
  },
  {
    key: "economy",
    name: "Sosyal Ekonomi",
    description:
      "Piyasa ve devlet dengesi (0: Serbest piyasa, 100: Devlet kontrolü)",
  },
  {
    key: "foreign",
    name: "Dış Politika",
    description:
      "Uluslararası yönelim (0: Batıcı, 100: Doğu/Güney)",
  },
  {
    key: "security",
    name: "Güvenlik Devleti",
    description:
      "Devletin güvenlikteki rolü (0: Sivil özgürlükçü, 100: Polis devleti)",
  },
];

const CharacterCreator = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    birthCity: "",
    ideologies: {},
  });
  const navigate = useNavigate();
  const { slotId } = useParams();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSliderChange = (key, value) => {
    setForm({
      ...form,
      ideologies: {
        ...form.ideologies,
        [key]: value,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `https://api.turkiyesiyaseti.net/api/slots/${slotId}/character`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate("/dashboard");
    } catch (err) {
      alert("Karakter oluşturulamadı: " + err.response?.data?.message);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Karakter Oluştur</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">İsim:</label>
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            className="w-full border p-2"
            required
          />
        </div>
        <div>
          <label className="block">Soyisim:</label>
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            className="w-full border p-2"
            required
          />
        </div>
        <div>
          <label className="block">Doğduğu Şehir:</label>
          <select
            name="birthCity"
            value={form.birthCity}
            onChange={handleChange}
            className="w-full border p-2"
            required
          >
            <option value="">Şehir Seç</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <h3 className="text-xl font-semibold mt-6">İdeolojik Yönelimler</h3>
        {ideologies.map((ideo) => (
          <div key={ideo.key} className="mb-4">
            <label className="block font-medium">{ideo.name}</label>
            <small className="block mb-1 text-gray-500">{ideo.description}</small>
            <input
              type="range"
              min="0"
              max="100"
              value={form.ideologies[ideo.key] || 50}
              onChange={(e) => handleSliderChange(ideo.key, Number(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-blue-600">{form.ideologies[ideo.key] || 50}</span>
          </div>
        ))}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Kaydet ve Devam Et
        </button>
      </form>
    </div>
  );
};

export default CharacterCreator;
