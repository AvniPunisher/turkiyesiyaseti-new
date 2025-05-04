import React from 'react';
import styled from 'styled-components';
import { 
  ChevronLeft, BarChart2, User, Globe, 
  Building, AlignLeft 
} from 'lucide-react';

const SideMenu = styled.div`
  width: 280px;
  background: rgba(0, 20, 40, 0.8);
  border-right: 1px solid rgba(0, 200, 255, 0.3);
  padding: 1rem 0;
  overflow-y: auto;
`;

const SidebarComponent = ({ activeTab, setActiveTab, setSidebarOpen, parameters }) => {
  return (
    <SideMenu>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Menü</h2>
          <button 
            className="p-1 rounded hover:bg-blue-800/50"
            onClick={() => setSidebarOpen(false)}
          >
            <ChevronLeft size={20} />
          </button>
        </div>
        
        {/* Menü öğeleri */}
        <div className="space-y-2">
          <div 
            className={`p-3 rounded-lg cursor-pointer hover:bg-blue-800/60 ${activeTab === 'dashboard' ? 'bg-blue-800/80' : 'bg-blue-900/40'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="flex items-center">
              <BarChart2 size={18} className="mr-2" />
              <span>Genel Durum</span>
            </div>
          </div>
          <div 
            className={`p-3 rounded-lg cursor-pointer hover:bg-blue-800/60 ${activeTab === 'character' ? 'bg-blue-800/80' : 'bg-blue-900/40'}`}
            onClick={() => setActiveTab('character')}
          >
            <div className="flex items-center">
              <User size={18} className="mr-2" />
              <span>Karakter</span>
            </div>
          </div>
          <div 
            className={`p-3 rounded-lg cursor-pointer hover:bg-blue-800/60 ${activeTab === 'economy' ? 'bg-blue-800/80' : 'bg-blue-900/40'}`}
            onClick={() => setActiveTab('economy')}
          >
            <div className="flex items-center">
              <BarChart2 size={18} className="mr-2" />
              <span>Ekonomi</span>
            </div>
          </div>
          <div 
            className={`p-3 rounded-lg cursor-pointer hover:bg-blue-800/60 ${activeTab === 'foreign' ? 'bg-blue-800/80' : 'bg-blue-900/40'}`}
            onClick={() => setActiveTab('foreign')}
          >
            <div className="flex items-center">
              <Globe size={18} className="mr-2" />
              <span>Dış İlişkiler</span>
            </div>
          </div>
          <div 
            className={`p-3 rounded-lg cursor-pointer hover:bg-blue-800/60 ${activeTab === 'parliament' ? 'bg-blue-800/80' : 'bg-blue-900/40'}`}
            onClick={() => setActiveTab('parliament')}
          >
            <div className="flex items-center">
              <Building size={18} className="mr-2" />
              <span>Meclis</span>
            </div>
          </div>
          <div 
            className={`p-3 rounded-lg cursor-pointer hover:bg-blue-800/60 ${activeTab === 'polls' ? 'bg-blue-800/80' : 'bg-blue-900/40'}`}
            onClick={() => setActiveTab('polls')}
          >
            <div className="flex items-center">
              <AlignLeft size={18} className="mr-2" />
              <span>Anketler</span>
            </div>
          </div>
        </div>
        
        {/* Ekonomik Durum */}
        <div className="mt-6">
          <h3 className="font-bold mb-2 text-blue-300">Ekonomik Durum</h3>
          <div className="bg-blue-900/40 p-3 rounded-lg">
            <div className="flex justify-between text-sm mb-1">
              <span>Enflasyon:</span>
              <span className="text-red-400">%{parameters.economy.inflation}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span>İşsizlik:</span>
              <span className="text-yellow-400">%{parameters.economy.unemployment}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span>Büyüme:</span>
              <span className="text-green-400">%{parameters.economy.growth}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>BIST-100:</span>
              <span>{parameters.economy.stockMarket}</span>
            </div>
          </div>
        </div>
        
        {/* Parti Desteği */}
        <div className="mt-4">
          <h3 className="font-bold mb-2 text-blue-300">Parti Desteği</h3>
          <div className="bg-blue-900/40 p-3 rounded-lg">
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>CHP:</span>
                <span>{parameters.politics.partySupport}%</span>
              </div>
              <div className="w-full bg-blue-950 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-600" 
                  style={{ width: `${parameters.politics.partySupport}%` }}
                ></div>
              </div>
            </div>
            
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>AK Parti:</span>
                <span>34.2%</span>
              </div>
              <div className="w-full bg-blue-950 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-600" 
                  style={{ width: '34.2%' }}
                ></div>
              </div>
            </div>
            
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>MHP:</span>
                <span>9.3%</span>
              </div>
              <div className="w-full bg-blue-950 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-800" 
                  style={{ width: '9.3%' }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>İYİ Parti:</span>
                <span>10.8%</span>
              </div>
              <div className="w-full bg-blue-950 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600" 
                  style={{ width: '10.8%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SideMenu>
  );
};

export default SidebarComponent;
