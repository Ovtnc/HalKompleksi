import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ApiStatus from './components/ApiStatus';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import MarketReportsPage from './pages/MarketReportsPage';
import MarketReportDetailPage from './pages/MarketReportDetailPage';
import FavoritesPage from './pages/FavoritesPage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import MyProductsPage from './pages/MyProductsPage';
import AddProductPage from './pages/AddProductPage';
import EditProductPage from './pages/EditProductPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminPendingProductsPage from './pages/AdminPendingProductsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminAllProductsPage from './pages/AdminAllProductsPage';
import AdminFeaturedProductsPage from './pages/AdminFeaturedProductsPage';
import AdminUserProductsPage from './pages/AdminUserProductsPage';

// Redirect component for product detail page
const ProductRedirect = () => {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/app/product/${id}`} replace />;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="product/:id" element={<ProductDetailPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="market-reports" element={<MarketReportsPage />} />
              <Route path="market-report/:id" element={<MarketReportDetailPage />} />
              <Route path="favorites" element={<FavoritesPage />} />
              <Route path="seller/dashboard" element={<SellerDashboardPage />} />
              <Route path="seller/products" element={<MyProductsPage />} />
              <Route path="seller/products/add" element={<AddProductPage />} />
              <Route path="seller/products/edit/:id" element={<EditProductPage />} />
              <Route path="admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="admin/products/pending" element={<AdminPendingProductsPage />} />
              <Route path="admin/users" element={<AdminUsersPage />} />
              <Route path="admin/products" element={<AdminAllProductsPage />} />
              <Route path="admin/products/featured" element={<AdminFeaturedProductsPage />} />
              <Route path="admin/users/:userId" element={<AdminUserProductsPage />} />
            </Route>
            {/* Redirect old routes to new structure */}
            <Route path="/products" element={<Navigate to="/app/products" replace />} />
            <Route path="/product/:id" element={<ProductRedirect />} />
            <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <ApiStatus />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

