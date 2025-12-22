import { useState, useEffect } from 'react';
import { ENV } from '../config/env';
import { getApiStatus } from '../utils/apiTest';

const ApiStatus = () => {
  const [status, setStatus] = useState<{
    connected: boolean;
    message: string;
    url: string;
  } | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    setIsChecking(true);
    const result = await getApiStatus(ENV.API_BASE_URL);
    setStatus(result);
    setIsChecking(false);
  };

  // Always show API status (can be useful in production too)
  // if (!ENV.isDevelopment) {
  //   return null;
  // }

  return (
    <div
      className={`fixed bottom-20 right-4 md:bottom-24 md:right-6 z-50 ${
        status?.connected ? 'hidden' : 'block'
      }`}
    >
      <div
        className={`bg-white rounded-xl shadow-lg border-2 p-4 max-w-sm ${
          status?.connected
            ? 'border-green-500 bg-green-50'
            : 'border-red-500 bg-red-50'
        }`}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">
            {isChecking ? '🔄' : status?.connected ? '✅' : '❌'}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 mb-1">
              {isChecking ? 'Bağlantı kontrol ediliyor...' : status?.message}
            </p>
            <p className="text-xs text-gray-600 break-all">{status?.url}</p>
          </div>
          {!isChecking && !status?.connected && (
            <button
              onClick={checkApiStatus}
              className="ml-2 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-dark transition-colors flex-shrink-0"
            >
              Tekrar Dene
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiStatus;
