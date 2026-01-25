import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const userRole = user?.activeRole || user?.userType;
  const isSeller = userRole === 'seller';
  const isGuest = !user;

  const tabs = [
    { id: 'home', path: '/app', label: 'Anasayfa', icon: '🏠' },
    ...(isSeller ? [] : [
      { id: 'products', path: '/app/products', label: 'Arama', icon: '🔍' },
      { id: 'market', path: '/app/market-reports', label: 'Piyasa', icon: '📊' },
      { id: 'favorites', path: '/app/favorites', label: 'Favoriler', icon: '❤️', requiresAuth: true },
    ]),
    { id: 'profile', path: '/app/profile', label: 'Profil', icon: '👤', requiresAuth: true },
  ];

  const isActive = (path: string) => {
    if (path === '/app' || path === '/app/') {
      return location.pathname === '/app' || location.pathname === '/app/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50 shadow-lg">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const disabled = tab.requiresAuth && isGuest;

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (!disabled) {
                  navigate(tab.path);
                } else {
                  navigate('/login');
                }
              }}
              disabled={disabled}
              className={`
                flex flex-col items-center justify-center flex-1 h-full
                transition-colors relative
                ${active 
                  ? 'text-primary' 
                  : disabled 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-500 hover:text-primary'
                }
              `}
            >
              <span className="text-2xl mb-1">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
              {active && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
