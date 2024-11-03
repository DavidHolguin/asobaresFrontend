import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';

const CardView = () => {
  const { id } = useParams();
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/cards/verify/${id}/`);
        setCardData(response.data);
      } catch (error) {
        setError('Error al cargar el carnet');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCardData();
    }
  }, [id]);

  useEffect(() => {
    let html5QrcodeScanner;

    if (showScanner) {
      html5QrcodeScanner = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        }
      );
      
      const onScanSuccess = (decodedText, decodedResult) => {
        console.log(`Código escaneado: ${decodedText}`, decodedResult);
        if (decodedText.includes('/card/')) {
          window.location.href = decodedText;
        }
        html5QrcodeScanner.clear();
        setShowScanner(false);
      };

      const onScanError = (err) => {
        console.warn(`Error de escaneo: ${err}`);
      };

      html5QrcodeScanner.render(onScanSuccess, onScanError);
    }

    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner", error);
        });
      }
    };
  }, [showScanner]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;
  if (!cardData) return <div>Carnet no encontrado</div>;

  const cardUrl = `${window.location.origin}/card/${cardData.card_id}`;

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="flex flex-col items-center space-y-4">
                  {cardData.user_profile.profile_picture ? (
                    <img
                      src={cardData.user_profile.profile_picture}
                      alt="Profile"
                      className="h-32 w-32 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-4xl text-primary-600">
                        {cardData.user_profile.full_name[0]}
                      </span>
                    </div>
                  )}

                  <h2 className="text-2xl font-bold text-gray-900">
                    {cardData.user_profile.full_name}
                  </h2>

                  <div className="text-center">
                    <p className="text-gray-600">{cardData.user_profile.email}</p>
                    <p className="text-gray-600">{cardData.user_profile.phone_number}</p>
                  </div>

                  <div className={`rounded-full px-4 py-1 text-sm font-semibold ${
                    cardData.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {cardData.is_active ? 'Activo' : 'Inactivo'}
                  </div>

                  <div className="mt-4">
                    <QRCodeSVG
                      value={cardUrl}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </div>

                  <button
                    onClick={() => setShowScanner(!showScanner)}
                    className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    {showScanner ? 'Ocultar Scanner' : 'Escanear QR'}
                  </button>

                  {showScanner && (
                    <div id="reader" className="w-full"></div>
                  )}

                  <p className="text-sm text-gray-500 break-all">
                    ID: {cardData.card_id}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardView;
