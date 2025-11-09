'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getFlightRoute, getPriceHistory, createPriceHistory, type FlightRoute, type PriceHistory } from '@/lib/api';
import { formatDate, formatPrice, getAirportName } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function RouteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const routeId = Number(params.id);

  const [route, setRoute] = useState<FlightRoute | null>(null);
  const [prices, setPrices] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddPrice, setShowAddPrice] = useState(false);
  
  const [newPrice, setNewPrice] = useState({
    record_date: new Date().toISOString().split('T')[0],
    price: '',
    source_site: '',
  });

  useEffect(() => {
    loadData();
  }, [routeId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [routeData, pricesData] = await Promise.all([
        getFlightRoute(routeId),
        getPriceHistory(routeId),
      ]);
      setRoute(routeData);
      setPrices(pricesData || []);
      setError(null);
    } catch (err) {
      setError('データの読み込みに失敗しました');
      console.error(err);
      setPrices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPriceHistory({
        route_id: routeId,
        record_date: newPrice.record_date,
        price: Number(newPrice.price),
        source_site: newPrice.source_site,
      });
      setNewPrice({
        record_date: new Date().toISOString().split('T')[0],
        price: '',
        source_site: '',
      });
      setShowAddPrice(false);
      await loadData();
    } catch (err) {
      alert('価格の登録に失敗しました');
      console.error(err);
    }
  };

  const chartData = (prices || []).map((p) => ({
    date: formatDate(p.record_date),
    price: p.price,
  }));

  const minPrice = (prices || []).length > 0 ? Math.min(...(prices || []).map((p) => p.price)) : 0;
  const maxPrice = (prices || []).length > 0 ? Math.max(...(prices || []).map((p) => p.price)) : 0;
  const avgPrice = (prices || []).length > 0 ? Math.round((prices || []).reduce((sum, p) => sum + p.price, 0) / (prices || []).length) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !route) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || '路線が見つかりません'}</p>
          <Link href="/" className="text-blue-600 hover:underline">
            ← トップに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              ← 戻る
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {getAirportName(route.departure)} → {getAirportName(route.arrival)}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {route.departure} → {route.arrival} | 出発日: {formatDate(route.departure_date)}
              </p>
              {route.airline && (
                <span className="inline-block mt-2 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  {route.airline} {route.flight_code}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-2">最安値</p>
            <p className="text-2xl font-bold text-green-600">
              {minPrice > 0 ? formatPrice(minPrice) : '-'}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-2">平均価格</p>
            <p className="text-2xl font-bold text-blue-600">
              {avgPrice > 0 ? formatPrice(avgPrice) : '-'}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-2">最高値</p>
            <p className="text-2xl font-bold text-red-600">
              {maxPrice > 0 ? formatPrice(maxPrice) : '-'}
            </p>
          </div>
        </div>

        {/* Add Price Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowAddPrice(!showAddPrice)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ➕ 価格を記録
          </button>
        </div>

        {/* Add Price Form */}
        {showAddPrice && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-bold mb-4">価格を記録</h3>
            <form onSubmit={handleAddPrice} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    記録日 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newPrice.record_date}
                    onChange={(e) => setNewPrice({ ...newPrice, record_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    価格 (円) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="15000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newPrice.price}
                    onChange={(e) => setNewPrice({ ...newPrice, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    取得元サイト
                  </label>
                  <input
                    type="text"
                    placeholder="Skyscanner"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newPrice.source_site}
                    onChange={(e) => setNewPrice({ ...newPrice, source_site: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddPrice(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  登録
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Price Chart */}
        {prices.length > 0 ? (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-bold mb-4">価格推移グラフ</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `¥${Number(value).toLocaleString()}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#2563eb"
                  strokeWidth={2}
                  name="価格"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center mb-8">
            <p className="text-gray-500">まだ価格データがありません</p>
            <p className="text-sm text-gray-400 mt-2">上の「価格を記録」ボタンから登録してください</p>
          </div>
        )}

        {/* Price History Table */}
        {prices.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4">価格履歴</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">記録日</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">価格</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">取得元</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {prices.map((price) => (
                    <tr key={price.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{formatDate(price.record_date)}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">{formatPrice(price.price)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{price.source_site || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
