import React from "react";
import { useParams, Link } from "react-router-dom";

const SlotDetail = () => {
  const { slotId } = useParams();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Slot Detayı - ID: {slotId}</h2>

      {/* Gelecekte oyun özeti, karakter bilgisi, parti bilgisi gibi veriler buraya gelebilir */}

      <Link to={`/slots/${slotId}/character`}>
        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Karakterini Oluştur
        </button>
      </Link>
    </div>
  );
};



export default SlotDetail;
