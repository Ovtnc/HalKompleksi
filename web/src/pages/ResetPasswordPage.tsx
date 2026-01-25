import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IoLockClosed, IoEye, IoEyeOff, IoCheckmarkCircle, IoMail } from 'react-icons/io5';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get('code');

  const [step, setStep] = useState<'code' | 'password'>('code');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(codeFromUrl || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://halkompleksi.com/api';

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !code) {
      setError('Lütfen e-posta adresinizi ve kodu girin');
      return;
    }

    if (code.length !== 4 || !/^\d{4}$/.test(code)) {
      setError('Kod 4 haneli rakam olmalıdır');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Kod doğrulama başarısız' }));
        throw new Error(errorData.message || 'Kod doğrulama başarısız');
      }

      const data = await response.json();
      if (data.token) {
        setToken(data.token);
        setStep('password');
      } else {
        throw new Error('Token alınamadı');
      }
    } catch (err: any) {
      setError(err.message || 'Kod doğrulama başarısız. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password || !confirmPassword) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      setError('Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir');
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (!token) {
      setError('Token bulunamadı. Lütfen baştan başlayın.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Şifre sıfırlama başarısız' }));
        throw new Error(errorData.message || 'Şifre sıfırlama başarısız');
      }

      alert('Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz.');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Şifre sıfırlama başarısız. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {step === 'code' ? (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <IoMail className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Kod Doğrulama</h1>
              <p className="text-gray-600">
                E-posta adresinize gönderilen 4 haneli kodu girin
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta Adresi
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-posta adresiniz"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  4 Haneli Kod
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-center text-2xl font-mono tracking-widest"
                  value={code}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                    setCode(value);
                  }}
                  placeholder="0000"
                  maxLength={4}
                  required
                />
                {codeFromUrl && (
                  <p className="mt-2 text-sm text-gray-500">
                    URL'den kod otomatik olarak yüklendi
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 4 || !email}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? 'Doğrulanıyor...' : 'Kodu Doğrula'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <IoCheckmarkCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Yeni Şifre Belirle</h1>
              <p className="text-gray-600">
                Kod doğrulandı. Yeni şifrenizi belirleyin
              </p>
            </div>

            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Güvenlik:</strong> Şifre en az 8 karakter, büyük/küçük harf ve rakam içermelidir.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yeni Şifre
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all pr-12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Yeni şifrenizi girin"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <IoEyeOff className="w-5 h-5" /> : <IoEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre Tekrar
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all pr-12"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Şifrenizi tekrar girin"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <IoEyeOff className="w-5 h-5" /> : <IoEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  'Şifre Sıfırlanıyor...'
                ) : (
                  <>
                    <IoLockClosed className="w-5 h-5" />
                    Şifreyi Sıfırla
                  </>
                )}
              </button>
            </form>
          </>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Giriş sayfasına dön
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
