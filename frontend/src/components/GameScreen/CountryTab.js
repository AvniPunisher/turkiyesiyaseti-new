import React from 'react';

const CountryTab = ({ parameters }) => {
  return (
    <div className="p-4 bg-blue-900/40 border border-blue-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Ülke Yönetimi</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-800/40 p-4 rounded-lg border border-blue-700">
          <h3 className="text-lg font-bold mb-3 text-blue-300">Ekonomik Göstergeler</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span>Enflasyon:</span>
                <span className="text-red-400">%{parameters.economy.inflation}</span>
              </div>
              <div className="w-full bg-blue-950 h-3 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-600" 
                  style={{ width: `${Math.min(100, parameters.economy.inflation)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">Tüketici fiyatlarındaki yıllık artış oranı</p>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>İşsizlik:</span>
                <span className="text-yellow-400">%{parameters.economy.unemployment}</span>
              </div>
              <div className="w-full bg-blue-950 h-3 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-600" 
                  style={{ width: `${Math.min(100, parameters.economy.unemployment * 5)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">Çalışabilir nüfusun işsizlik oranı</p>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>Büyüme:</span>
                <span className="text-green-400">%{parameters.economy.growth}</span>
              </div>
              <div className="w-full bg-blue-950 h-3 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-600" 
                  style={{ width: `${Math.min(100, Math.max(0, (parameters.economy.growth + 5) * 10))}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">GSYH'deki yıllık reel artış</p>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>Bütçe Dengesi:</span>
                <span className="text-red-400">{parameters.economy.budget} Milyar ₺</span>
              </div>
              <div className="w-full bg-blue-950 h-3 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-600" 
                  style={{ width: `${Math.min(100, Math.abs(parameters.economy.budget) * 2)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">Merkezi yönetim bütçe açığı</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-800/40 p-4 rounded-lg border border-blue-700">
          <h3 className="text-lg font-bold mb-3 text-blue-300">Sosyal Göstergeler</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span>Eğitim:</span>
                <span>{parameters.social.education}/100</span>
              </div>
              <div className="w-full bg-blue-950 h-3 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600" 
                  style={{ width: `${parameters.social.education}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">Eğitim sisteminin kalitesi ve erişilebilirliği</p>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>Sağlık:</span>
                <span>{parameters.social.healthcare}/100</span>
              </div>
              <div className="w-full bg-blue-950 h-3 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-600" 
                  style={{ width: `${parameters.social.healthcare}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">Sağlık sisteminin kalitesi ve erişilebilirliği</p>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>Güvenlik:</span>
                <span>{parameters.social.security}/100</span>
              </div>
              <div className="w-full bg-blue-950 h-3 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-600" 
                  style={{ width: `${parameters.social.security}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">Kamu düzeni ve asayiş durumu</p>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>Toplumsal Mutluluk:</span>
                <span>{parameters.social.happiness}/100</span>
              </div>
              <div className="w-full bg-blue-950 h-3 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-600" 
                  style={{ width: `${parameters.social.happiness}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">Halkın genel memnuniyet düzeyi</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-blue-800/40 p-4 rounded-lg border border-blue-700">
        <h3 className="text-lg font-bold mb-3 text-blue-300">Uluslararası İlişkiler</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-blue-900/60 p-3 rounded-lg border border-blue-600">
            <div className="text-center">
              <div className="text-sm font-bold mb-1">ABD</div>
              <div className="text-xl mb-1">🇺🇸</div>
              <div className="text-xs">{parameters.international.relations.us}/100</div>
              <div className="w-full bg-blue-950 h-2 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-blue-600" 
                  style={{ width: `${parameters.international.relations.us}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-900/60 p-3 rounded-lg border border-blue-600">
            <div className="text-center">
              <div className="text-sm font-bold mb-1">AB</div>
              <div className="text-xl mb-1">🇪🇺</div>
              <div className="text-xs">{parameters.international.relations.eu}/100</div>
              <div className="w-full bg-blue-950 h-2 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-blue-600" 
                  style={{ width: `${parameters.international.relations.eu}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-900/60 p-3 rounded-lg border border-blue-600">
            <div className="text-center">
              <div className="text-sm font-bold mb-1">Rusya</div>
              <div className="text-xl mb-1">🇷🇺</div>
              <div className="text-xs">{parameters.international.relations.russia}/100</div>
              <div className="w-full bg-blue-950 h-2 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-blue-600" 
                  style={{ width: `${parameters.international.relations.russia}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-900/60 p-3 rounded-lg border border-blue-600">
            <div className="text-center">
              <div className="text-sm font-bold mb-1">Çin</div>
              <div className="text-xl mb-1">🇨🇳</div>
              <div className="text-xs">{parameters.international.relations.china}/100</div>
              <div className="w-full bg-blue-950 h-2 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-blue-600" 
                  style={{ width: `${parameters.international.relations.china}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-900/60 p-3 rounded-lg border border-blue-600">
            <div className="text-center">
              <div className="text-sm font-bold mb-1">Orta Doğu</div>
              <div className="text-xl mb-1">🌍</div>
              <div className="text-xs">{parameters.international.relations.middleEast}/100</div>
              <div className="w-full bg-blue-950 h-2 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-blue-600" 
                  style={{ width: `${parameters.international.relations.middleEast}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryTab;
