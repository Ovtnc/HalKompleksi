import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../services/api';
import {
  IoArrowBack,
  IoSearchOutline,
  IoPersonOutline,
  IoBanOutline,
  IoCheckmarkCircleOutline,
  IoTrashOutline,
  IoEyeOutline,
  IoMailOutline,
  IoCallOutline,
  IoShieldCheckmarkOutline,
  IoStorefrontOutline,
  IoBagOutline
} from 'react-icons/io5';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  userType: string;
  userRoles?: string[];
  isActive: boolean;
  createdAt: string;
}

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!user || user.activeRole !== 'admin') {
      navigate('/profile');
      return;
    }
    loadUsers();
  }, [user, navigate, filter]);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const timeoutId = setTimeout(() => {
        handleSearch(searchQuery);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filter !== 'all') {
        if (filter === 'active') params.isActive = 'true';
        if (filter === 'blocked') params.isActive = 'false';
        if (filter === 'sellers') params.userType = 'seller';
        if (filter === 'buyers') params.userType = 'buyer';
        if (filter === 'admins') params.userType = 'admin';
      }

      const response = await adminAPI.getUsers(params);
      setUsers(response.users || []);
    } catch (error: any) {
      console.error('Error loading users:', error);
      alert(`Kullanıcılar yüklenirken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const response = await adminAPI.searchUsers(query);
      setSearchResults(response.users || []);
    } catch (error: any) {
      console.error('Search error:', error);
      alert(`Kullanıcı arama sırasında hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBlockUser = async (userId: string, isActive: boolean) => {
    if (!window.confirm(`Bu kullanıcıyı ${isActive ? 'aktifleştirmek' : 'engellemek'} istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      setActionLoading(userId);
      await adminAPI.blockUser(userId, isActive);
      alert(`Kullanıcı başarıyla ${isActive ? 'aktifleştirildi' : 'engellendi'}!`);
      loadUsers();
      if (searchQuery.trim().length >= 2) {
        handleSearch(searchQuery);
      }
    } catch (error: any) {
      console.error('Error blocking user:', error);
      alert(`Kullanıcı durumu değiştirilirken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    if (!window.confirm(`"${selectedUser.name}" kullanıcısını kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`)) {
      return;
    }

    try {
      setActionLoading(selectedUser._id);
      await adminAPI.deleteUser(selectedUser._id);
      alert('Kullanıcı başarıyla silindi!');
      setShowDeleteModal(false);
      setSelectedUser(null);
      loadUsers();
      if (searchQuery.trim().length >= 2) {
        handleSearch(searchQuery);
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert(`Kullanıcı silinirken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'admin':
        return <IoShieldCheckmarkOutline className="w-5 h-5 text-purple-600" />;
      case 'seller':
        return <IoStorefrontOutline className="w-5 h-5 text-green-600" />;
      case 'buyer':
        return <IoBagOutline className="w-5 h-5 text-blue-600" />;
      default:
        return <IoPersonOutline className="w-5 h-5 text-gray-600" />;
    }
  };

  const getUserTypeText = (userType: string) => {
    switch (userType) {
      case 'admin':
        return 'Yönetici';
      case 'seller':
        return 'Satıcı';
      case 'buyer':
        return 'Alıcı';
      default:
        return userType;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const displayUsers = searchQuery.trim().length >= 2 ? searchResults : users;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-gray-500">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <IoArrowBack className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Kullanıcı Yönetimi</h1>
              <p className="text-white/90 mt-1">{displayUsers.length} kullanıcı</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Kullanıcı ara (isim, email)..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'active', label: 'Aktif' },
              { id: 'blocked', label: 'Engelli' },
              { id: 'sellers', label: 'Satıcılar' },
              { id: 'buyers', label: 'Alıcılar' },
              { id: 'admins', label: 'Yöneticiler' },
            ].map((filterOption) => (
              <button
                key={filterOption.id}
                onClick={() => {
                  setFilter(filterOption.id);
                  setSearchQuery('');
                }}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  filter === filterOption.id
                    ? 'bg-purple-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* Users List */}
        {displayUsers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <IoPersonOutline className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Kullanıcı bulunamadı</h3>
            <p className="text-gray-600">
              {searchQuery.trim().length >= 2
                ? 'Arama kriterlerinize uygun kullanıcı bulunamadı.'
                : 'Bu filtreye uygun kullanıcı bulunamadı.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {displayUsers.map((userItem) => (
              <div
                key={userItem._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                      {getUserTypeIcon(userItem.userType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{userItem.name}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            userItem.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {userItem.isActive ? 'Aktif' : 'Engelli'}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {getUserTypeText(userItem.userType)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-600">
                          <IoMailOutline className="w-4 h-4" />
                          <span className="text-sm">{userItem.email}</span>
                        </div>
                        {userItem.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <IoCallOutline className="w-4 h-4" />
                            <span className="text-sm">{userItem.phone}</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-2">
                          Kayıt: {formatDate(userItem.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/admin/users/${userItem._id}`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      title="Detayları Gör"
                    >
                      <IoEyeOutline className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleBlockUser(userItem._id, !userItem.isActive)}
                      disabled={actionLoading === userItem._id}
                      className={`p-2 rounded-xl transition-colors disabled:opacity-50 ${
                        userItem.isActive
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={userItem.isActive ? 'Engelle' : 'Aktifleştir'}
                    >
                      {userItem.isActive ? (
                        <IoBanOutline className="w-5 h-5" />
                      ) : (
                        <IoCheckmarkCircleOutline className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(userItem);
                        setShowDeleteModal(true);
                      }}
                      disabled={actionLoading === userItem._id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                      title="Sil"
                    >
                      <IoTrashOutline className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold text-red-600 mb-4">Kullanıcıyı Sil</h3>
            <p className="text-gray-600 mb-6">
              <strong>{selectedUser.name}</strong> kullanıcısını kalıcı olarak silmek istediğinizden emin misiniz?
              Bu işlem geri alınamaz ve kullanıcının tüm verileri silinecektir.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                İptal
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading === selectedUser._id}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === selectedUser._id ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;


