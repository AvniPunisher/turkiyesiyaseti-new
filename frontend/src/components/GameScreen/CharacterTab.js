import React from 'react';

const CharacterTab = ({ character }) => {
  return (
    <div className="p-4 bg-blue-900/40 border border-blue-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Karakter Bilgileri</h2>
      
      <div className="flex mb-6">
        <div className="w-24 h-24 rounded-full bg-blue-700 flex items-center justify-center text-3xl font-bold">
          {character.name.charAt(0)}
        </div>
        <div className="ml-6">
          <h3 className="text-xl font-bold">{character.name}</h3>
          <p className="text-lg text-blue-300">{character.role || "Milletvekili"}</p>
          <p className="text-md text-gray-400">{character.party}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-800/40 p-4 rounded-lg border border-blue-700">
          <h3 className="text-lg font-bold mb-3 text-blue-300">Yetenekler</h3>
          
          {character.skills && Object.entries(character.skills).map(([skill, value]) => (
            <div key={skill} className="mb-3">
              <div className="flex justify-between mb-1">
                <span className="capitalize">{skill}:</span>
                <span>{value}/10</span>
              </div>
              <div className="w-full bg-blue-950 h-3 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600" 
                  style={{ width: `${value * 10}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-blue-800/40 p-4 rounded-lg border border-blue-700">
          <h3 className="text-lg font-bold mb-3 text-blue-300">Karakter Özellikleri</h3>
          
          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <span>Popülerlik:</span>
              <span>{character.popularity}%</span>
            </div>
            <div className="w-full bg-blue-950 h-3 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-600" 
                style={{ width: `${character.popularity}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <span>Tecrübe:</span>
              <span>{character.experience}/100</span>
            </div>
            <div className="w-full bg-blue-950 h-3 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-600" 
                style={{ width: `${character.experience}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <span>Güvenilirlik:</span>
              <span>{character.reliability || 50}/100</span>
            </div>
            <div className="w-full bg-blue-950 h-3 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-600" 
                style={{ width: `${character.reliability || 50}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-blue-800/40 p-4 rounded-lg border border-blue-700">
        <h3 className="text-lg font-bold mb-3 text-blue-300">Yetenek Geliştirme</h3>
        <p className="mb-4">Karakter yeteneklerinizi geliştirerek siyasi etkinliğinizi artırabilirsiniz.</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-blue-900/60 p-3 rounded-lg border border-blue-600 cursor-pointer hover:bg-blue-800/80">
            <div className="text-center">
              <div className="text-3xl mb-2">🎤</div>
              <div className="text-sm font-bold">Hitabet Geliştir</div>
              <div className="text-xs text-gray-400">Maliyet: 3 Yetenek Puanı</div>
            </div>
          </div>
          
          <div className="bg-blue-900/60 p-3 rounded-lg border border-blue-600 cursor-pointer hover:bg-blue-800/80">
            <div className="text-center">
              <div className="text-3xl mb-2">🧠</div>
              <div className="text-sm font-bold">Strateji Geliştir</div>
              <div className="text-xs text-gray-400">Maliyet: 3 Yetenek Puanı</div>
            </div>
          </div>
          
          <div className="bg-blue-900/60 p-3 rounded-lg border border-blue-600 cursor-pointer hover:bg-blue-800/80">
            <div className="text-center">
              <div className="text-3xl mb-2">👥</div>
              <div className="text-sm font-bold">İletişim Geliştir</div>
              <div className="text-xs text-gray-400">Maliyet: 3 Yetenek Puanı</div>
            </div>
          </div>
          
          <div className="bg-blue-900/60 p-3 rounded-lg border border-blue-600 cursor-pointer hover:bg-blue-800/80">
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-sm font-bold">Liderlik Geliştir</div>
              <div className="text-xs text-gray-400">Maliyet: 3 Yetenek Puanı</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterTab;