'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createFlightRoute } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    departure: '',
    arrival: '',
    airline: '',
    flight_code: '',
    departure_date: '',
    transit: '',
    memo: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createFlightRoute(formData);
      router.push('/');
    } catch (err) {
      setError('路線の登録に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              ← 戻る
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">路線登録</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Departure */}
            <div>
              <label htmlFor="departure" className="block text-sm font-medium text-gray-700 mb-2">
                出発地 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="departure"
                name="departure"
                required
                placeholder="HND"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.departure}
                onChange={handleChange}
                maxLength={10}
              />
              <p className="mt-1 text-xs text-gray-500">空港コード（例: HND, NRT）</p>
            </div>

            {/* Arrival */}
            <div>
              <label htmlFor="arrival" className="block text-sm font-medium text-gray-700 mb-2">
                到着地 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="arrival"
                name="arrival"
                required
                placeholder="CTS"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.arrival}
                onChange={handleChange}
                maxLength={10}
              />
              <p className="mt-1 text-xs text-gray-500">空港コード（例: CTS, OKA）</p>
            </div>

            {/* Airline */}
            <div>
              <label htmlFor="airline" className="block text-sm font-medium text-gray-700 mb-2">
                航空会社
              </label>
              <input
                type="text"
                id="airline"
                name="airline"
                placeholder="ANA"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.airline}
                onChange={handleChange}
                maxLength={50}
              />
            </div>

            {/* Flight Code */}
            <div>
              <label htmlFor="flight_code" className="block text-sm font-medium text-gray-700 mb-2">
                便名
              </label>
              <input
                type="text"
                id="flight_code"
                name="flight_code"
                placeholder="NH51"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.flight_code}
                onChange={handleChange}
                maxLength={20}
              />
            </div>

            {/* Departure Date */}
            <div>
              <label htmlFor="departure_date" className="block text-sm font-medium text-gray-700 mb-2">
                出発日 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="departure_date"
                name="departure_date"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.departure_date}
                onChange={handleChange}
              />
            </div>

            {/* Transit */}
            <div>
              <label htmlFor="transit" className="block text-sm font-medium text-gray-700 mb-2">
                経由地
              </label>
              <input
                type="text"
                id="transit"
                name="transit"
                placeholder="KIX"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.transit}
                onChange={handleChange}
                maxLength={100}
              />
            </div>

            {/* Memo */}
            <div>
              <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-2">
                メモ
              </label>
              <textarea
                id="memo"
                name="memo"
                rows={3}
                placeholder="冬旅行、LCC利用など"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                value={formData.memo}
                onChange={handleChange}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Link
                href="/"
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-center font-medium"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? '登録中...' : '登録'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
