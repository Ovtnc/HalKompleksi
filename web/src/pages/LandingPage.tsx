import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Eğer kullanıcı giriş yapmışsa, direkt HomePage'e yönlendir
  useEffect(() => {
    if (user) {
      navigate('/app', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-600">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌿</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
              Hal Kompleksi
            </span>
          </div>
          <ul className="hidden md:flex gap-10 list-none">
            <li>
              <a href="#features" className="text-gray-700 font-semibold hover:text-green-600 transition-colors">
                Özellikler
              </a>
            </li>
            <li>
              <a href="#how-it-works" className="text-gray-700 font-semibold hover:text-green-600 transition-colors">
                Nasıl Çalışır
              </a>
            </li>
            <li>
              <button
                onClick={() => navigate('/login')}
                className="text-gray-700 font-semibold hover:text-green-600 transition-colors"
              >
                Giriş Yap
              </button>
            </li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 to-green-500/15 animate-pulse"></div>
        <div className="max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-2 rounded-full mb-8 border border-white/30">
            <span>✨</span>
            <span className="text-white font-semibold">Halden Anlayan Kompleks</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
            Tarladan Sofraya
            <br />
            Tek Tıkla
          </h1>
          <p className="text-xl md:text-2xl text-white/95 mb-12 leading-relaxed">
            Türkiye'nin dijital hali. Taze ürünler, direkt üreticiden, uygun fiyatlarla.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white text-green-600 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all transform hover:-translate-y-1 shadow-xl"
            >
              🌐 Web App'i Aç
            </button>
            <a
              href="https://play.google.com/store/apps/details?id=com.halkompleksi.app&utm_source=emea_Med"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold text-lg border-2 border-white/30 hover:bg-white/20 transition-all transform hover:-translate-y-1"
            >
              📱 Google Play'den İndir
            </a>
            <a
              href="https://apps.apple.com/tr/app/hal-kompleksi/id6753897440?l=tr"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold text-lg border-2 border-white/30 hover:bg-white/20 transition-all transform hover:-translate-y-1"
            >
              🍎 App Store'dan İndir
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block bg-green-50 text-green-600 px-4 py-2 rounded-full text-sm font-bold uppercase mb-4">
              Özellikler
            </span>
            <h2 className="text-5xl font-black text-gray-900 mb-4">Neden Hal Kompleksi?</h2>
            <p className="text-xl text-gray-600">
              Tarım ürünleri alım-satımını dijitalleştiriyor, çiftçi ve alıcıları buluşturuyoruz
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '🌿', title: 'Geniş Ürün Yelpazesi', desc: 'Meyve, sebze, gıda, nakliye, kasa ve daha fazlası. İhtiyacınız olan her şey bir arada.' },
              { icon: '💰', title: 'Şeffaf Fiyatlar', desc: 'Aracısız direkt alışveriş. En uygun fiyatları karşılaştırın, tasarruf edin.' },
              { icon: '📱', title: 'Kolay İletişim', desc: 'Satıcılarla WhatsApp üzerinden hızlıca iletişime geçin, anlaşın.' },
              { icon: '📍', title: 'Konum Bazlı Arama', desc: 'Size en yakın satıcıları bulun, nakliye maliyetlerini azaltın.' },
              { icon: '⭐', title: 'Favoriler', desc: 'Beğendiğiniz ürünleri kaydedin, satıcıları takip edin.' },
              { icon: '📊', title: 'Piyasa Raporları', desc: 'Güncel hal fiyatlarını takip edin, doğru zamanda alışveriş yapın.' },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-3xl mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-500 to-green-600">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { number: '0+', label: 'Aktif Kullanıcı' },
            { number: '0+', label: 'Aktif İlan' },
            { number: '81', label: 'İl Genelinde' },
            { number: '10+', label: 'Kategori' },
          ].map((stat, idx) => (
            <div key={idx}>
              <h3 className="text-5xl font-black text-white mb-2">{stat.number}</h3>
              <p className="text-xl text-white/90 font-semibold">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block bg-green-50 text-green-600 px-4 py-2 rounded-full text-sm font-bold uppercase mb-4">
              Nasıl Çalışır
            </span>
            <h2 className="text-5xl font-black text-gray-900 mb-4">3 Basit Adımda Başlayın</h2>
            <p className="text-xl text-gray-600">Al-sat işlemlerinizi kolayca tamamlayın</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '1', title: 'Uygulamayı İndirin', desc: 'App Store, Google Play\'den ücretsiz indirin veya Web App\'i kullanın. Hesap oluşturun ve başlayın.' },
              { num: '2', title: 'Ürün Arayın', desc: 'Kategorilere göz atın veya arama yaparak ihtiyacınız olan ürünü bulun.' },
              { num: '3', title: 'İletişime Geçin', desc: 'Satıcıyla WhatsApp üzerinden konuşun, anlaşın ve alışverişi tamamlayın.' },
            ].map((step, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl text-center border border-gray-100 hover:shadow-lg transition-all">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-lg">
                  {step.num}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-500 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-black text-white mb-6">Hemen Başlayın!</h2>
          <p className="text-2xl text-white/95 mb-12">Türkiye'nin en büyük tarım pazaryerine katılın</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all transform hover:-translate-y-1 shadow-xl"
            >
              🌐 Web App'i Aç
            </button>
            <a
              href="https://play.google.com/store/apps/details?id=com.halkompleksi.app&utm_source=emea_Med"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold text-lg border-2 border-white/30 hover:bg-white/20 transition-all transform hover:-translate-y-1"
            >
              📱 Google Play'den İndir
            </a>
            <a
              href="https://apps.apple.com/tr/app/hal-kompleksi/id6753897440?l=tr"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold text-lg border-2 border-white/30 hover:bg-white/20 transition-all transform hover:-translate-y-1"
            >
              🍎 App Store'dan İndir
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold text-lg mb-4">Hal Kompleksi</h4>
              <p className="text-gray-400 leading-relaxed">
                Türkiye'nin tarım ürünleri pazaryeri. Çiftçiler ve alıcıları buluşturuyoruz.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold text-lg mb-4">Hızlı Linkler</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-green-400 transition-colors">Özellikler</a></li>
                <li><a href="#how-it-works" className="hover:text-green-400 transition-colors">Nasıl Çalışır</a></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-green-400 transition-colors">Giriş Yap</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-lg mb-4">Yasal</h4>
              <ul className="space-y-2">
                <li><a href="/privacy-policy.html" className="hover:text-green-400 transition-colors">Gizlilik Politikası</a></li>
                <li><a href="/terms-of-service.html" className="hover:text-green-400 transition-colors">Kullanım Şartları</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-lg mb-4">İletişim</h4>
              <ul className="space-y-2">
                <li><a href="mailto:halkompleksitr@gmail.com" className="hover:text-green-400 transition-colors">halkompleksitr@gmail.com</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Hal Kompleksi. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

