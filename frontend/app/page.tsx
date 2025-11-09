'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getFlightRoutes, type FlightRoute } from '@/lib/api';
import { formatDate, formatPrice, getAirportName, getDaysUntilDeparture } from '@/lib/utils';

export default function Home() {
  const [routes, setRoutes] = useState<FlightRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const data = await getFlightRoutes();
      setRoutes(data || []);
      setError(null);
    } catch (err) {
      setError('路線データの取得に失敗しました');
      console.error(err);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRoutes = (routes || []).filter((route) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      route.departure.toLowerCase().includes(searchLower) ||
      route.arrival.toLowerCase().includes(searchLower) ||
      route.airline?.toLowerCase().includes(searchLower) ||
      false
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            ✈️ Flight Price Tracker
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            航空券の価格変動を観察・記録・可視化
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:max-w-md">
            <input
              type="text"
              placeholder="出発地・到着地・航空会社で検索..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link
            href="/register"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ➕ 路線を追加
          </Link>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">読み込み中...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
            <button
              onClick={loadRoutes}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              再試行
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {filteredRoutes.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 mb-4">
                  {searchTerm ? '検索結果が見つかりませんでした' : '登録されている路線がありません'}
                </p>
                {!searchTerm && (
                  <Link
                    href="/register"
                    className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    最初の路線を登録
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRoutes.map((route) => {
                  const daysUntil = getDaysUntilDeparture(route.departure_date);
                  return (
                    <Link
                      key={route.id}
                      href={`/routes/${route.id}`}
                      className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
                            <span>{getAirportName(route.departure)}</span>
                            <span className="text-gray-400">→</span>
                            <span>{getAirportName(route.arrival)}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {route.departure} → {route.arrival}
                          </div>
                        </div>
                        {route.airline && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {route.airline}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">出発日:</span>
                          <span className="font-medium">{formatDate(route.departure_date)}</span>
                        </div>
                        
                        {daysUntil > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">まで:</span>
                            <span className="font-medium text-blue-600">{daysUntil}日</span>
                          </div>
                        )}
                        
                        {route.latest_price && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">最新価格:</span>
                              <span className="font-bold text-lg text-green-600">
                                {formatPrice(route.latest_price)}
                              </span>
                            </div>
                            {route.latest_record_date && (
                              <div className="text-xs text-gray-500 text-right">
                                {formatDate(route.latest_record_date)} 記録
                              </div>
                            )}
                          </>
                        )}
                        
                        {!route.latest_price && (
                          <div className="text-sm text-gray-500 text-center py-2">
                            価格未登録
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
