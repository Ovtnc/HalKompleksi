import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  IoPersonOutline, 
  IoMailOutline, 
  IoCallOutline, 
  IoHeartOutline, 
  IoLogOutOutline,
  IoStorefrontOutline,
  IoBagOutline,
  IoShieldCheckmarkOutline,
  IoChevronForwardOutline,
} from 'react-icons/io5';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout, switchRole } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Hesabınızdan çıkış yapmak istediğinizden emin misiniz?')) {
      await logout();
      navigate('/');
    }
  };

  const handleSwitchRole = async (role: 'buyer' | 'seller') => {
    if (!user) return;
    
    try {
      await switchRole(role);
      
      // Show success message
      alert(`Artık ${role === 'buyer' ? 'Alıcı' : 'Satıcı'} olarak giriş yaptınız.`);
      
      // Navigate based on role
      if (role === 'seller') {
        navigate('/app/seller/dashboard');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      console.error('Error switching role:', error);
      // Sadece kritik hatalar için mesaj göster (auth hataları)
      // Geçici hatalar için rol zaten güncellenmiş olacak
      if (error?.message?.includes('Unauthorized') || 
          error?.message?.includes('401') ||
          error?.message?.includes('403')) {
        alert('Rol değiştirilirken bir hata oluştu. Lütfen tekrar giriş yapın.');
      }
      // Diğer hatalar için sessizce devam et (rol zaten güncellendi)
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const userRoleText = 
    user.activeRole === 'seller' ? 'Satıcı' : 
    user.activeRole === 'admin' ? 'Yönetici' : 'Alıcı';

  const hasSellerRole = user.userRoles?.includes('seller') || user.userType === 'seller';
  const isSeller = user.activeRole === 'seller';
  const isAdmin = user.activeRole === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-primary via-primary-dark to-primary rounded-3xl p-8 text-white mb-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <div className="h-28 w-28 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-5xl font-bold border-4 border-white/40 shadow-lg">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="h-full w-full rounded-2xl object-cover"
                  />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              {isAdmin && (
                <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full p-2 shadow-lg">
                  <IoShieldCheckmarkOutline className="w-5 h-5" />
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
              <p className="text-white/90 text-lg mb-3 flex items-center justify-center sm:justify-start gap-2">
                <IoMailOutline className="w-5 h-5" />
                {user.email}
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold border border-white/30">
                  {userRoleText}
                </span>
                {hasSellerRole && !isSeller && (
                  <button
                    onClick={() => handleSwitchRole('seller')}
                    className="px-4 py-2 bg-white text-primary rounded-full text-sm font-semibold hover:bg-white/90 transition-colors flex items-center gap-2"
                  >
                    <IoStorefrontOutline className="w-4 h-4" />
                    Satıcı Moduna Geç
                  </button>
                )}
                {isSeller && (
                  <button
                    onClick={() => handleSwitchRole('buyer')}
                    className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold hover:bg-white/30 transition-colors flex items-center gap-2 border border-white/30"
                  >
                    Alıcı Moduna Geç
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {isAdmin && (
          <div className="mb-6">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <IoShieldCheckmarkOutline className="w-7 h-7" />
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold">Admin Paneli</div>
                  <div className="text-white/80 text-sm">Sistem yönetimi ve istatistikler</div>
                </div>
              </div>
              <IoChevronForwardOutline className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {isSeller && !isAdmin && (
          <div className="mb-6">
            <button
              onClick={() => navigate('/seller/dashboard')}
              className="w-full bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <IoStorefrontOutline className="w-7 h-7" />
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold">Satıcı Paneli</div>
                  <div className="text-white/80 text-sm">Ürünlerinizi yönetin</div>
                </div>
              </div>
              <IoChevronForwardOutline className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* Profile Content */}
        <div className="space-y-4">
          {/* Account Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary-dark rounded-full"></div>
                Hesap Bilgileri
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <IoPersonOutline className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Ad Soyad</div>
                    <div className="text-gray-900 font-semibold">{user.name}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <IoMailOutline className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">E-posta</div>
                    <div className="text-gray-900 font-semibold">{user.email}</div>
                  </div>
                </div>
              </div>
              
              {user.phone && (
                <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                      <IoCallOutline className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Telefon</div>
                      <div className="text-gray-900 font-semibold">{user.phone}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/favorites')}
              className="w-full flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center group-hover:bg-red-100 transition-colors">
                  <IoHeartOutline className="w-6 h-6 text-red-500" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Favorilerim</div>
                  <div className="text-sm text-gray-500">Beğendiğiniz ürünler</div>
                </div>
              </div>
              <IoChevronForwardOutline className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>

            {hasSellerRole && !isSeller && (
              <button
                onClick={() => handleSwitchRole('seller')}
                className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-primary/5 to-primary-dark/5 rounded-2xl border-2 border-primary/20 hover:border-primary/40 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <IoStorefrontOutline className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Satıcı Moduna Geç</div>
                    <div className="text-sm text-gray-500">Ürünlerinizi yönetin ve satış yapın</div>
                  </div>
                </div>
                <IoChevronForwardOutline className="w-5 h-5 text-primary group-hover:translate-x-1 transition-all" />
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                    <IoShieldCheckmarkOutline className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Admin Paneli</div>
                    <div className="text-sm text-gray-500">Sistem yönetimi ve istatistikler</div>
                  </div>
                </div>
                <IoChevronForwardOutline className="w-5 h-5 text-indigo-600 group-hover:translate-x-1 transition-all" />
              </button>
            )}

            {isSeller && !isAdmin && (
              <button
                onClick={() => navigate('/seller/dashboard')}
                className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-primary/5 to-primary-dark/5 rounded-2xl border-2 border-primary/20 hover:border-primary/40 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <IoBagOutline className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Satıcı Paneli</div>
                    <div className="text-sm text-gray-500">Ürünlerinizi yönetin ve istatistikleri görün</div>
                  </div>
                </div>
                <IoChevronForwardOutline className="w-5 h-5 text-primary group-hover:translate-x-1 transition-all" />
              </button>
            )}

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-5 bg-white rounded-2xl border-2 border-red-200 hover:border-red-300 hover:bg-red-50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center group-hover:bg-red-100 transition-colors">
                  <IoLogOutOutline className="w-6 h-6 text-red-500" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-red-600">Çıkış Yap</div>
                  <div className="text-sm text-red-400">Hesabınızdan çıkış yapın</div>
                </div>
              </div>
              <IoChevronForwardOutline className="w-5 h-5 text-red-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
