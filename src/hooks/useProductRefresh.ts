import { useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useProductRefresh = (refreshFunction?: () => void) => {
  const { profileUpdated } = useAuth();

  const refresh = useCallback(() => {
    if (refreshFunction) {
      console.log('🔄 Product refresh triggered by profile update');
      refreshFunction();
    }
  }, [refreshFunction]);

  useEffect(() => {
    if (profileUpdated > 0 && refreshFunction) {
      console.log('🔄 Profile updated, refreshing products...');
      refresh();
    }
  }, [profileUpdated, refresh, refreshFunction]);

  return refresh;
};
