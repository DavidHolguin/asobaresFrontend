import React, { useState } from 'react';
import Webcam from 'react-webcam';
import { QrReader } from 'react-qr-reader';
import axios from 'axios';

const CardVerification = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [cardId, setCardId] = useState('');
  const [cardData, setCardData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const verifyCard = async (id) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/cards/verify/${id}/`);
      setCardData(response.data);
    } catch (error) {
      setError('Carnet no válido o inactivo');
      setCardData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = (data) => {
    if (data) {
      const cardId = data.split('/').pop();
      verifyCard(cardId);
    }
  };

  const handleManualVerify = (e) => {
    e.preventDefault();
    if (cardId) {
      verifyCard(cardId);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Verificación de Carnet</h1>
      
      <div className="space-y-4">
        <button
          onClick={() => setShowScanner(!showScanner)}
          className="btn-primary w-full"
        >
          {showScanner ? 'Ocultar Scanner' : 'Mostrar Scanner QR'}
        </button>

        {showScanner && (
          <div className="aspect-square">
            <QrReader
              onResult={handleScan}
              style={{ width: '100%' }}
            />
          </div>
        )}

        <form onSubmit={handleManualVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Código de Carnet
            </label>
            <input
              type="text"
              value={cardId}
              onChange={(e) => setCardId(e.target.value)}
              className="input-primary"
              placeholder="Ingrese el código del carnet"
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            Verificar
          </button>
        </form>

        {loading && <p>Verificando...</p>}
        {error && <p className="text-red-600">{error}</p>}
        
        {cardData && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold">{cardData.user_profile.full_name}</h2>
            <p>Estado: {cardData.is_active ? 'Activo' : 'Inactivo'}</p>
            <p>Email: {cardData.user_profile.email}</p>
            <p>Teléfono: {cardData.user_profile.phone_number}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardVerification;