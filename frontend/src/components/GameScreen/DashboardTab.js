import React from 'react';
import { ChevronRight } from 'lucide-react';

const DashboardTab = ({ sidebarOpen, setSidebarOpen, character, parameters, currentEvents }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <h2 className="text-2xl font-bold">Genel Durum Paneli</h2>
        {!sidebarOpen && (
          <button 
            className="ml-4 p-1 rounded hover:bg-blue-800/50"
            onClick={() => setSidebarOpen(true)}
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Politik Durum */}
        <div className="bg-blue-900/40 border border-blue-800 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3 text-blue-300">Politik Durum</h3>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between mb-1">
                <span>Parti Desteği:</span>
                <span>{parameters.politics.partySupport}%</span>
              </div>
              <div className="w-full bg-blue-950 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600" 
                  style={{ width: `${parameters.politics.partySupport}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>Koalisyon Gücü:</span>
                <span>{parameters.politics.coalitionStrength}%</span>
              </div>
              <div className="w-full bg-blue-950 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-600" 
                  style={{ width: `${parameters.politics.coalitionStrength}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>Hükümet Onayı:</span>
                <span>{parameters.politics.publicApproval}%</span>
              </div>
              <div className="w-full bg-blue-950 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-600" 
                  style={{ width: `${parameters.politics.publicApproval}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Ekonomik Durum */}
        <div className="bg-blue-900/40 border border-blue-800 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3 text-blue-300">Ekonomik Durum</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Enflasyon:</span>
              <span className="text-red-400">%{parameters.economy.inflation}</span>
            </div>
            <div className="flex justify-between">
              <span>İşsizlik:</span>
              <span className="text-yellow-400">%{parameters.economy.unemployment}</span>
            </div>
            <div className="flex justify-between">
              <span>Büyüme:</span>
              <span className="text-green-400">%{parameters.economy.growth}</span>
            </div>
            <div className="flex justify-between">
              <span>Bütçe Açığı:</span>
              <span className="text-red-400">{parameters.economy.budget} Milyar TL</span>
            </div>
            <div className="flex justify-between">
              <span>BIST-100:</span>
              <span>{parameters.economy.stockMarket}</span>
            </div>
          </div>
        </div>
        
        {/* Sosyal Durum */}
        <div className="bg-blue-900/40 border border-blue-800 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3 text-blue-300">Sosyal Durum</h3>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between mb-1">
                <span>Eğitim:</span>
                <span>{parameters.social.education}/100</span>
              </div>
              <div className="w-full bg-blue-950 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600" 
                  style={{ width: `${parameters.social.education}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>Sağlık:</span>
                <span>{parameters.social.healthcare}/100</span>
              </div>
              <div className="w-full bg-blue-950 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-600" 
                  style={{ width: `${parameters.social.healthcare}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>Güvenlik:</span>
                <span>{parameters.social.security}/100</span>
              </div>
              <div className="w-full bg-blue-950 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-600" 
                  style={{ width: `${parameters.social.security}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span>Toplumsal Mutluluk:</span>
                <span>{parameters.social.happiness}/100</span>
              </div>
              <div className="w-full bg-blue-950 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-600" 
                  style={{ width: `${parameters.social.happiness}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Güncel Olaylar */}
      <div className="bg-blue-900/40 border border-blue-800 rounded-lg p-4">
        <h3 className="text-lg font-bold mb-3 text-blue-300">Güncel Olaylar</h3>
        <div className="space-y-3">
          <div className="bg-blue-800/40 p-3 rounded-lg border border-blue-700">
            <div className="flex justify-between mb-1">
              <h4 className="font-bold">Yeni Ekonomik Program Açıklandı</h4>
              <span className="text-sm text-blue-300">2 gün önce</span>
            </div>
            <p className="text-sm">Ekonomi Bakanlığı, enflasyonla mücadele için yeni bir ekonomik program açıkladı. Program, faiz politikası ve mali disiplin önlemleri içeriyor.</p>
          </div>
          
          <div className="bg-blue-800/40 p-3 rounded-lg border border-blue-700">
            <div className="flex justify-between mb-1">
              <h4 className="font-bold">TBMM'de Bütçe Görüşmeleri</h4>
              <span className="text-sm text-blue-300">4 gün önce</span>
            </div>
            <p className="text-sm">Meclis'te yeni yıl bütçe görüşmeleri başladı. Muhalefet ve iktidar arasında sert tartışmalar yaşanıyor.</p>
          </div>
          
          <div className="bg-blue-800/40 p-3 rounded-lg border border-blue-700">
            <div className="flex justify-between mb-1">
              <h4 className="font-bold">Dış Politikada Yeni Gelişmeler</h4>
              <span className="text-sm text-blue-300">6 gün önce</span>
            </div>
            <p className="text-sm">Türkiye, komşu ülkelerle olan ilişkilerini güçlendirmek için yeni diplomatik girişimlerde bulunuyor.</p>
          </div>
        </div>
      </div>
      
      {/* Kariyeriniz */}
      <div className="bg-blue-900/40 border border-blue-800 rounded-lg p-4">
        <h3 className="text-lg font-bold mb-3 text-blue-300">Siyasi Kariyeriniz</h3>
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 rounded-full bg-blue-700 flex items-center justify-center text-2xl font-bold">
            {character.name.charAt(0)}
          </div>
          <div className="ml-4">
            <h4 className="font-bold text-lg">{character.name}</h4>
            <p className="text-blue-300">{character.role || "Milletvekili"}</p>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span>Tecrübe:</span>
            <span>{character.experience}/100</span>
          </div>
          <div className="w-full bg-blue-950 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600" 
              style={{ width: `${character.experience}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span>Popülerlik:</span>
            <span>{character.popularity}%</span>
          </div>
          <div className="w-full bg-blue-950 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-600" 
              style={{ width: `${character.popularity}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <h4 className="font-bold mb-2">Karakter Yeteneği Geliştirme</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-800/40 p-2 rounded-lg border border-blue-700 cursor-pointer hover:bg-blue-800/60">
              <div className="text-center">
                <div className="text-xl mb-1">🎤</div>
                <div className="text-sm font-bold">Hitabet</div>
              </div>
            </div>
            
            <div className="bg-blue-800/40 p-2 rounded-lg border border-blue-700 cursor-pointer hover:bg-blue-800/60">
              <div className="text-center">
                <div className="text-xl mb-1">🧠</div>
                <div className="text-sm font-bold">Strateji</div>
              </div>
            </div>
            
            <div className="bg-blue-800/40 p-2 rounded-lg border border-blue-700 cursor-pointer hover:bg-blue-800/60">
              <div className="text-center">
                <div className="text-xl mb-1">👥</div>
                <div className="text-sm font-bold">Diplomasi</div>
              </div>
            </div>
            
            <div className="bg-blue-800/40 p-2 rounded-lg border border-blue-700 cursor-pointer hover:bg-blue-800/60">
              <div className="text-center">
                <div className="text-xl mb-1">📊</div>
                <div className="text-sm font-bold">Ekonomi</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;