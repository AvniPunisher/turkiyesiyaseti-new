// src/components/CountryManagementPanel/CountryManagementPanel.js
import React, { useState, useEffect } from 'react';
import { X, User, BarChart2, BookOpen, FileText, Globe, Map, Activity } from 'lucide-react';
import './CountryManagementPanel.css';

// Bu bileşeni kullanmak için lucide-react kütüphanesini yüklemelisiniz:
// npm install lucide-react

const CountryManagementPanel = ({ 
  populationData, 
  parameters, 
  laws, 
  isOpen, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState('population');

  // Panel açılıp kapandığında scroll'u engelle/serbest bırak
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  return (
    <>
      {/* Ülke Yönetimi Paneli - Animasyonlu soldan kayma */}
      <div 
        className={`country-panel fixed top-0 left-0 h-full bg-white shadow-lg transition-transform duration-300 transform z-30 flex ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`} 
        style={{ width: '85%', maxWidth: '1000px', marginTop: '64px' }}
      >
        {/* Tab navigasyonu */}
        <div className="w-16 bg-gray-800 flex flex-col items-center pt-4">
          <button 
            onClick={() => setActiveTab('population')}
            className={`p-3 mb-3 rounded-lg ${activeTab === 'population' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Nüfus"
          >
            <User size={22} />
          </button>
          <button 
            onClick={() => setActiveTab('parameters')}
            className={`p-3 mb-3 rounded-lg ${activeTab === 'parameters' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Parametreler"
          >
            <BarChart2 size={22} />
          </button>
          <button 
            onClick={() => setActiveTab('laws')}
            className={`p-3 mb-3 rounded-lg ${activeTab === 'laws' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Yasalar"
          >
            <BookOpen size={22} />
          </button>
          <button 
            onClick={() => setActiveTab('economy')}
            className={`p-3 mb-3 rounded-lg ${activeTab === 'economy' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Ekonomi"
          >
            <Activity size={22} />
          </button>
          <button 
            onClick={() => setActiveTab('foreign')}
            className={`p-3 mb-3 rounded-lg ${activeTab === 'foreign' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Dış İlişkiler"
          >
            <Globe size={22} />
          </button>
          <button 
            onClick={() => setActiveTab('regions')}
            className={`p-3 mb-3 rounded-lg ${activeTab === 'regions' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            title="Bölgeler"
          >
            <Map size={22} />
          </button>
        </div>

        {/* Tab içeriği ve kapatma düğmesi */}
        <div className="flex-grow flex flex-col relative overflow-hidden">
          <div className="absolute top-2 right-2 z-10">
            <button 
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 rounded-full p-2"
            >
              <X size={20} className="text-gray-700" />
            </button>
          </div>
          
          {/* İçerik başlığı */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center">
            <h2 className="text-xl font-bold text-gray-800">
              {activeTab === 'population' && 'Nüfus Bilgileri'}
              {activeTab === 'parameters' && 'Ülke Parametreleri'}
              {activeTab === 'laws' && 'Yürürlükteki Yasalar'}
              {activeTab === 'economy' && 'Ekonomik Göstergeler'}
              {activeTab === 'foreign' && 'Dış İlişkiler'}
              {activeTab === 'regions' && 'Bölgeler'}
            </h2>
          </div>
          
          {/* İçerik alanı */}
          <div className="flex-grow overflow-y-auto px-6 py-4">
            {activeTab === 'population' && (
              <div>
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold mb-2">Genel Nüfus: {populationData?.total?.toLocaleString() || "85,250,000"}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded shadow-sm">
                      <p className="text-gray-500">Şehir Nüfusu</p>
                      <p className="text-lg font-bold">{populationData?.urban?.toLocaleString() || "76,725,000"} (%{Math.round((populationData?.urban || 76725000)/(populationData?.total || 85250000)*100)})</p>
                    </div>
                    <div className="bg-white p-3 rounded shadow-sm">
                      <p className="text-gray-500">Kırsal Nüfus</p>
                      <p className="text-lg font-bold">{populationData?.rural?.toLocaleString() || "8,525,000"} (%{Math.round((populationData?.rural || 8525000)/(populationData?.total || 85250000)*100)})</p>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-3">Yaş Grupları</h3>
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                  <div className="grid grid-cols-3 gap-4">
                    {(populationData?.ageGroups ? Object.entries(populationData.ageGroups) : [["0-14", 22350000], ["15-64", 54560000], ["65+", 8340000]]).map(([ageGroup, population]) => (
                      <div key={ageGroup} className="text-center">
                        <p className="text-gray-500">{ageGroup} yaş</p>
                        <p className="text-lg font-bold">{population.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">%{Math.round(population/(populationData?.total || 85250000)*100)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-3">Bölgesel Dağılım</h3>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  {(populationData?.regions ? Object.entries(populationData.regions) : [
                    ["Marmara", 25575000],
                    ["İç Anadolu", 14492500],
                    ["Ege", 11085000],
                    ["Akdeniz", 10997500],
                    ["Karadeniz", 8100000],
                    ["Güneydoğu Anadolu", 9377500],
                    ["Doğu Anadolu", 5622500]
                  ]).map(([region, population]) => (
                    <div key={region} className="mb-2">
                      <div className="flex justify-between mb-1">
                        <span>{region}</span>
                        <span className="text-gray-600">{population.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.round(population/(populationData?.total || 85250000)*100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'parameters' && (
              <div>
                {(parameters ? Object.entries(parameters) : [
                  ["Ekonomi", {
                    "Enflasyon": 63,
                    "İstihdam": 59,
                    "Büyüme": 62,
                    "Bütçe": 55,
                    "Dış Ticaret": 70
                  }],
                  ["Eğitim", {
                    "Okul Altyapısı": 68,
                    "Öğretmen Kalitesi": 72,
                    "Müfredat": 65,
                    "Yükseköğretim": 70
                  }],
                  ["Sağlık", {
                    "Sağlık Altyapısı": 76,
                    "Sağlık Personeli": 73,
                    "Halk Sağlığı": 69
                  }],
                  ["Altyapı", {
                    "Ulaşım": 80,
                    "Enerji": 75,
                    "İletişim": 83,
                    "Su ve Kanalizasyon": 79
                  }]
                ]).map(([category, params]) => (
                  <div key={category} className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">{category}</h3>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      {Object.entries(params).map(([param, value]) => (
                        <div key={param} className="mb-3">
                          <div className="flex justify-between mb-1">
                            <span>{param}</span>
                            <span className="font-semibold">{value}/100</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full ${
                                value >= 80 ? 'bg-green-500' : 
                                value >= 65 ? 'bg-blue-500' : 
                                value >= 50 ? 'bg-yellow-500' : 
                                'bg-red-500'
                              }`}
                              style={{ width: `${value}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                  Detaylı Görünüm
                </button>
              </div>
            )}

            {activeTab === 'laws' && (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <input 
                    type="text" 
                    placeholder="Yasa ara..." 
                    className="px-4 py-2 border border-gray-300 rounded-md w-64"
                  />
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                    Yeni Yasa Tasarısı
                  </button>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm divide-y">
                  {(laws || [
                    {
                      id: 1,
                      name: "Dijital Dönüşüm Teşvik Yasası",
                      year: 2024,
                      category: "Teknoloji",
                      effect: "İnternet altyapısı +10, E-devlet hizmetleri +15",
                      status: "Yürürlükte"
                    },
                    {
                      id: 2,
                      name: "Öğretmen Atama ve Yerleştirme Kanunu",
                      year: 2023,
                      category: "Eğitim",
                      effect: "Öğretmen kalitesi +8, Fırsat eşitliği +5",
                      status: "Yürürlükte"
                    },
                    {
                      id: 3,
                      name: "Sağlıkta Dönüşüm Programı 2.0",
                      year: 2022,
                      category: "Sağlık",
                      effect: "Sağlık altyapısı +12, Sağlık personeli -3",
                      status: "Yürürlükte"
                    }
                  ]).map(law => (
                    <div key={law.id} className="p-4 hover:bg-gray-50 cursor-pointer">
                      <div className="flex justify-between">
                        <h3 className="font-semibold text-lg">{law.name}</h3>
                        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {law.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>{law.category}</span>
                        <span>{law.year}</span>
                      </div>
                      <p className="mt-2 text-gray-600">{law.effect}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'economy' && (
              <div>
                <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold mb-2">Ekonomik Durum</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded shadow-sm">
                      <p className="text-gray-500">GSYH</p>
                      <p className="text-lg font-bold">1.2 Trilyon TL</p>
                      <p className="text-sm text-green-600">+3.2% (Yıllık Büyüme)</p>
                    </div>
                    <div className="bg-white p-3 rounded shadow-sm">
                      <p className="text-gray-500">Enflasyon</p>
                      <p className="text-lg font-bold">%42.8</p>
                      <p className="text-sm text-red-600">+2.3% (Aylık)</p>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-3">Diğer Göstergeler</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-gray-500">İşsizlik Oranı</p>
                    <p className="text-xl font-bold">%12.3</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-gray-500">Bütçe Açığı</p>
                    <p className="text-xl font-bold">-52 Milyar TL</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-gray-500">Döviz Kuru (USD/TL)</p>
                    <p className="text-xl font-bold">32.75 TL</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-gray-500">Faiz Oranı</p>
                    <p className="text-xl font-bold">%35.0</p>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-3">Dış Ticaret</h3>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500">İhracat (Aylık)</p>
                      <p className="text-lg font-bold">18.5 Milyar USD</p>
                    </div>
                    <div>
                      <p className="text-gray-500">İthalat (Aylık)</p>
                      <p className="text-lg font-bold">21.7 Milyar USD</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-gray-500">Dış Ticaret Açığı</p>
                    <div className="w-full bg-gray-200 rounded-full h-3 mt-1">
                      <div className="bg-red-500 h-3 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">-3.2 Milyar USD (Aylık)</p>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'foreign' && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Dış İlişkiler Durumu</h3>
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500">Diplomatik İlişki Seviyesi</p>
                      <div className="mt-1">
                        <div className="flex items-center mb-2">
                          <span className="w-24">ABD</span>
                          <div className="flex-grow h-3 bg-gray-200 rounded-full mx-2">
                            <div className="h-3 bg-blue-500 rounded-full" style={{ width: '55%' }}></div>
                          </div>
                          <span className="w-8 text-sm font-medium">55/100</span>
                        </div>
                        <div className="flex items-center mb-2">
                          <span className="w-24">Avrupa Birliği</span>
                          <div className="flex-grow h-3 bg-gray-200 rounded-full mx-2">
                            <div className="h-3 bg-yellow-500 rounded-full" style={{ width: '48%' }}></div>
                          </div>
                          <span className="w-8 text-sm font-medium">48/100</span>
                        </div>
                        <div className="flex items-center mb-2">
                          <span className="w-24">Rusya</span>
                          <div className="flex-grow h-3 bg-gray-200 rounded-full mx-2">
                            <div className="h-3 bg-blue-500 rounded-full" style={{ width: '70%' }}></div>
                          </div>
                          <span className="w-8 text-sm font-medium">70/100</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-24">Çin</span>
                          <div className="flex-grow h-3 bg-gray-200 rounded-full mx-2">
                            <div className="h-3 bg-green-500 rounded-full" style={{ width: '80%' }}></div>
                          </div>
                          <span className="w-8 text-sm font-medium">80/100</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500">Uluslararası Örgütler</p>
                      <div className="mt-2">
                        <div className="flex justify-between items-center mb-1">
                          <span>NATO</span>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Üye</span>
                        </div>
                        <div className="flex justify-between items-center mb-1">
                          <span>Avrupa Birliği</span>
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Aday Ülke</span>
                        </div>
                        <div className="flex justify-between items-center mb-1">
                          <span>BM</span>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Üye</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>G20</span>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Üye</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-3">Aktif Diplomatik Krizler</h3>
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                  <div className="divide-y">
                    <div className="py-3">
                      <div className="flex justify-between">
                        <h4 className="font-medium">Doğu Akdeniz Gerilimi</h4>
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Yüksek Gerilim</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Deniz yetki alanları ve enerji kaynakları konusunda Yunanistan ile devam eden anlaşmazlık.</p>
                    </div>
                    <div className="py-3">
                      <div className="flex justify-between">
                        <h4 className="font-medium">Suriye Sınır Güvenliği</h4>
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Orta Gerilim</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Suriye sınırındaki güvenlik sorunları ve terör tehditleri devam ediyor.</p>
                    </div>
                  </div>
                </div>
                
                <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                  Diplomatik Girişim Başlat
                </button>
              </div>
            )}
            
            {activeTab === 'regions' && (
              <div>
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                  <h3 className="text-lg font-semibold mb-3">Bölge Performansları</h3>
                  <div className="space-y-3">
                    {(populationData?.regions ? Object.keys(populationData.regions) : [
                      "Marmara", "İç Anadolu", "Ege", "Akdeniz", "Karadeniz", "Güneydoğu Anadolu", "Doğu Anadolu"
                    ]).map((region) => (
                      <div key={region} className="border-b pb-3">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{region}</span>
                          <span className="text-sm text-gray-500">Ekonomik Gelişmişlik</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${
                              region === "Marmara" || region === "Ege" ? 'bg-green-500' : 
                              region === "İç Anadolu" || region === "Akdeniz" ? 'bg-blue-500' : 
                              'bg-yellow-500'
                            }`}
                            style={{ width: `${
                              region === "Marmara" ? '85' : 
                              region === "Ege" ? '80' : 
                              region === "İç Anadolu" ? '75' : 
                              region === "Akdeniz" ? '70' : 
                              region === "Karadeniz" ? '65' : 
                              region === "Güneydoğu Anadolu" ? '55' : '50'
                            }%` }}
                          ></div>
                        </div>
                        
                        <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">İşsizlik:</span> 
                            <span className={`ml-1 ${
                              region === "Marmara" || region === "Ege" ? 'text-green-600' : 
                              region === "Güneydoğu Anadolu" || region === "Doğu Anadolu" ? 'text-red-600' : 
                              'text-yellow-600'
                            }`}>
                              %{
                                region === "Marmara" ? '9.2' : 
                                region === "Ege" ? '10.1' : 
                                region === "İç Anadolu" ? '11.5' : 
                                region === "Akdeniz" ? '12.3' : 
                                region === "Karadeniz" ? '10.8' : 
                                region === "Güneydoğu Anadolu" ? '18.7' : '20.2'
                              }
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Eğitim:</span> 
                            <span className={`ml-1 ${
                              region === "Marmara" || region === "Ege" || region === "İç Anadolu" ? 'text-green-600' : 
                              region === "Güneydoğu Anadolu" || region === "Doğu Anadolu" ? 'text-red-600' : 
                              'text-yellow-600'
                            }`}>
                              {
                                region === "Marmara" ? 'Yüksek' : 
                                region === "Ege" ? 'Yüksek' : 
                                region === "İç Anadolu" ? 'Yüksek' : 
                                region === "Akdeniz" ? 'Orta' : 
                                region === "Karadeniz" ? 'Orta' : 
                                region === "Güneydoğu Anadolu" ? 'Düşük' : 'Düşük'
                              }
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Altyapı:</span> 
                            <span className={`ml-1 ${
                              region === "Marmara" || region === "Ege" ? 'text-green-600' : 
                              region === "Güneydoğu Anadolu" || region === "Doğu Anadolu" ? 'text-red-600' : 
                              'text-yellow-600'
                            }`}>
                              {
                                region === "Marmara" ? 'Çok İyi' : 
                                region === "Ege" ? 'İyi' : 
                                region === "İç Anadolu" ? 'İyi' : 
                                region === "Akdeniz" ? 'Orta' : 
                                region === "Karadeniz" ? 'Orta' : 
                                region === "Güneydoğu Anadolu" ? 'Zayıf' : 'Zayıf'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                  Bölgesel Yatırım Planı
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Arkaplan overlay - Panel açıkken arkayı karartır ve tıklayınca paneli kapatır */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20" 
          style={{ marginTop: '64px' }}
          onClick={onClose}
        ></div>
      )}
    </>
  );
};

export default CountryManagementPanel;