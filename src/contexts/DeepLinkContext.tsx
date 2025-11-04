import React, { createContext, useContext, useState, useEffect } from 'react';
import { Linking } from 'react-native';

interface DeepLinkContextType {
  pendingNavigation: { screen: string; params: any } | null;
  clearPendingNavigation: () => void;
}

const DeepLinkContext = createContext<DeepLinkContextType>({
  pendingNavigation: null,
  clearPendingNavigation: () => {},
});

export const useDeepLink = () => useContext(DeepLinkContext);

export const DeepLinkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pendingNavigation, setPendingNavigation] = useState<{ screen: string; params: any } | null>(null);

  const clearPendingNavigation = () => {
    setPendingNavigation(null);
  };

  useEffect(() => {
    // Handle deep links
    const handleDeepLink = (event: { url: string }) => {
      console.log('🔗 Deep link received:', event.url);
      
      const url = event.url;
      const productMatch = url.match(/\/product\/([^/?]+)/);
      
      if (productMatch && productMatch[1]) {
        const productId = productMatch[1];
        console.log('🔗 Setting pending navigation to product:', productId);
        setPendingNavigation({
          screen: 'ProductDetail',
          params: { productId }
        });
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a deep link
    Linking.getInitialURL().then(url => {
      if (url) {
        console.log('🔗 App opened with URL:', url);
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <DeepLinkContext.Provider value={{ pendingNavigation, clearPendingNavigation }}>
      {children}
    </DeepLinkContext.Provider>
  );
};

