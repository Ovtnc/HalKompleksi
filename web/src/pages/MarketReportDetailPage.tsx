import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marketReportsAPI } from '../services/api';
import { MarketReport } from '../types';

const MarketReportDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<MarketReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadReport();
    }
  }, [id]);

  const loadReport = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const reportData = await marketReportsAPI.getReport(id);
      setReport(reportData.report || reportData);
    } catch (err: any) {
      setError(err.message || 'Rapor yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Rapor bulunamadı'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <span className="mr-2">←</span>
          Geri
        </button>

        {/* Report Header */}
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 text-white mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {report.city} Piyasa Raporu
          </h1>
          <p className="text-white/90">
            {new Date(report.date).toLocaleDateString('tr-TR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Report Image */}
        {report.image && (
          <div className="bg-white rounded-xl overflow-hidden mb-6 shadow-sm">
            <img
              src={report.image}
              alt={`${report.city} Piyasa Raporu`}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Report Items */}
        {report.items && report.items.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Ürün Fiyatları</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ürün</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Birim</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Min</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Max</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Ortalama</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {report.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.unit}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{item.minPrice} TL</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-right">{item.maxPrice} TL</td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary text-right">{item.averagePrice} TL</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketReportDetailPage;
