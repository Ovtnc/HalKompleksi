import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BottomNavigation from './BottomNavigation';
import Header from './Header';

const Layout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = user?.activeRole || user?.userType;
  const isAdmin = userRole === 'admin';
  const isGuest = !user;

  // Redirect to login if trying to access protected routes
  if ((location.pathname === '/app/profile' || location.pathname === '/app/favorites') && isGuest) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 pt-16 pb-20 md:pb-0">
        <Outlet />
      </main>
      {!isAdmin && <BottomNavigation />}
    </div>
  );
};

export default Layout;
