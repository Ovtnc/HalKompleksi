import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketReportsAPI } from '../services/api';
import { MarketReport } from '../types';

const MarketReportsPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<MarketReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await marketReportsAPI.getReports({ limit: 50 });
      if (response?.reports) {
        setReports(response.reports);
      } else if (Array.isArray(response)) {
        setReports(response);
      }
    } catch (err: any) {
      setError(err.message || 'Piyasa raporları yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleReportClick = (report: MarketReport) => {
    navigate(`/market-report/${report._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Piyasa Raporları</h1>
          <p className="text-xl text-gray-600">Güncel fiyat bilgileri ve piyasa analizleri</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-500">Yükleniyor...</div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && reports.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">Henüz piyasa raporu bulunmuyor</p>
          </div>
        )}

        {/* Reports Grid */}
        {!loading && !error && reports.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <div
                key={report._id}
                onClick={() => handleReportClick(report)}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg hover:border-primary transition-all group"
              >
                {report.image && (
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    <img
                      src={report.image}
                      alt={report.city}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{report.city}</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(report.date).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span>📊</span>
                    <span className="ml-2">{report.items?.length || 0} ürün</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketReportsPage;
