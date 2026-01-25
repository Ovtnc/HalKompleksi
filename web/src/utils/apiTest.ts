// API connection test utility
export const testApiConnection = async (apiUrl: string): Promise<boolean> => {
  try {
    // Health endpoint /api/health olmalı
    const healthUrl = apiUrl.endsWith('/api') ? `${apiUrl}/health` : `${apiUrl}/health`;
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    return response.ok;
  } catch (error) {
    console.error('API connection test failed:', error);
    return false;
  }
};

export const getApiStatus = async (apiUrl: string): Promise<{
  connected: boolean;
  message: string;
  url: string;
}> => {
  // Health endpoint /api/health olmalı
  const url = apiUrl.endsWith('/api') ? `${apiUrl}/health` : `${apiUrl}/health`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      return {
        connected: true,
        message: data.message || 'Backend sunucusuna başarıyla bağlanıldı',
        url,
      };
    } else {
      return {
        connected: false,
        message: `Backend sunucusu yanıt verdi ancak hata kodu: ${response.status}`,
        url,
      };
    }
  } catch (error: any) {
    let message = 'Backend sunucusuna bağlanılamıyor';
    
    if (error.name === 'AbortError') {
      message = 'Backend sunucusu yanıt vermiyor (zaman aşımı - 10 saniye)';
    } else if (error.message?.includes('Failed to fetch')) {
      message = 'Backend sunucusuna erişilemiyor. Lütfen backend\'in çalıştığından emin olun.';
    } else if (error.message) {
      message = `Bağlantı hatası: ${error.message}`;
    }
    
    console.error('API Status Error:', {
      url,
      error: error.message,
      name: error.name,
    });
    
    return {
      connected: false,
      message,
      url,
    };
  }
};

