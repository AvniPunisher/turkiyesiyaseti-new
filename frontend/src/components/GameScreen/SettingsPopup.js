import React from 'react';
import { Save, HelpCircle, Home, LogOut } from 'lucide-react';

const SettingsPopup = ({ onClose }) => {
  return (
    <div className="absolute right-4 top-16 w-64 bg-blue-900/95 border border-blue-700 rounded-lg shadow-lg p-3 z-10">
      <h3 className="font-bold border-b border-blue-700 pb-2 mb-2">Ayarlar</h3>
      <ul className="space-y-2">
        <li>
          <button className="w-full text-left p-2 rounded hover:bg-blue-800/60 flex items-center">
            <span className="mr-3 text-blue-300"><Save size={18} /></span>
            <span>Oyunu Kaydet</span>
          </button>
        </li>
        <li>
          <button className="w-full text-left p-2 rounded hover:bg-blue-800/60 flex items-center">
            <span className="mr-3 text-blue-300"><HelpCircle size={18} /></span>
            <span>Yardım</span>
          </button>
        </li>
        <li className="border-t border-blue-700 my-2 pt-2">
          <button className="w-full text-left p-2 rounded hover:bg-blue-800/60 flex items-center">
            <span className="mr-3 text-blue-300"><Home size={18} /></span>
            <span>Ana Menüye Dön</span>
          </button>
        </li>
        <li>
          <button className="w-full text-left p-2 rounded hover:bg-blue-800/60 flex items-center">
            <span className="mr-3 text-blue-300"><LogOut size={18} /></span>
            <span>Oyundan Çık</span>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default SettingsPopup;
