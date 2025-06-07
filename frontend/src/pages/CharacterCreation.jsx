import React, { useState } from "react";
import { Slider } from "@mui/material";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import cities from "../data/cities.json";

const ideologyDimensions = [
  {
    name: "Ekonomi",
    description:
      "Devlet müdahalesi ve piyasa özgürlüğü arasındaki ekonomik yaklaşım",
    positions: [
      "Tam serbest piyasa",
      "Ağırlıklı piyasa",
      "Karma ekonomi",
      "Devletçi",
      "Komünal"
    ]
  },
  {
    name: "Laiklik-Din",
    description: "Devletin dinle ilişkisi",
    positions: [
      "Katı laik",
      "Yumuşak laik",
      "Dini vurgulu",
      "Dindar devlet",
      "Teokratik"
    ]
  },
  {
    name: "Kimlik Yaklaşımı",
    description:
      "Etnik, dini ve kültürel kimliklere yönelik yaklaşım (çoğulculuk vs. milliyetçilik)",
    positions: [
      "Çoğulcu",
      "Kapsayıcı",
      "Vatandaşlık odaklı",
      "Milli",
      "Milliyetçi"
    ]
  },
  {
    name: "Dış Politika",
    description: "Uluslararası ilişkilerdeki yönelim",
    positions: [
      "Batı Bloku",
      "Batı Yanlısı",
      "Dengeli",
      "Bağımsız",
      "Doğu/Güney Yönelimli"
    ]
  },
  {
    name: "Kültürel",
    description:
      "Toplumsal değerlere, geleneklere ve modernleşmeye ilişkin görüşler",
    positions: [
      "İlerici",
      "Modern",
      "Denge",
      "Muhafazakar",
      "Gelenekselci"
    ]
  }
];

const getPositionLabel = (value, positions) => {
  const index = Math.min(Math.floor(value / 25), 4);
  return `${value} - ${positions[index]}`;
};

export default function CharacterCreator() {
  const [character, setCharacter] = useState({
    firstName: "",
    lastName: "",
    birthCity: "",
    ideologies: ideologyDimensions.map(() => 50)
  });

  const handleChange = (index, value) => {
    const newIdeologies = [...character.ideologies];
    newIdeologies[index] = value;
    setCharacter({ ...character, ideologies: newIdeologies });
  };

  const handleSubmit = () => {
    console.log("Karakter verileri:", character);
    // İleride backend'e POST edilecek
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-xl font-semibold">Karakter Bilgileri</h2>
          <div className="flex gap-4">
            <div className="w-1/2">
              <Label>İsim</Label>
              <Input
                value={character.firstName}
                onChange={(e) =>
                  setCharacter({ ...character, firstName: e.target.value })
                }
              />
            </div>
            <div className="w-1/2">
              <Label>Soyisim</Label>
              <Input
                value={character.lastName}
                onChange={(e) =>
                  setCharacter({ ...character, lastName: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <Label>Doğduğu Şehir</Label>
            <select
              className="w-full p-2 rounded border"
              value={character.birthCity}
              onChange={(e) =>
                setCharacter({ ...character, birthCity: e.target.value })
              }
            >
              <option value="">Şehir Seçin</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-6">
          <h2 className="text-xl font-semibold">İdeolojik Profili Belirle</h2>
          {ideologyDimensions.map((dimension, index) => (
            <div key={index}>
              <Label title={dimension.description}>{dimension.name}</Label>
              <Slider
                value={character.ideologies[index]}
                onChange={(_, val) => handleChange(index, val)}
                step={1}
                min={0}
                max={100}
              />
              <div className="text-sm text-muted-foreground">
                {getPositionLabel(character.ideologies[index], dimension.positions)}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="text-center">
        <Button onClick={handleSubmit}>Kaydet</Button>
      </div>
    </div>
  );
}
