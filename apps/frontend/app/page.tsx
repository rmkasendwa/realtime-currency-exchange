'use client';
import { useEffect } from 'react';
import { initSocketConnection } from '../lib/SocketAdapter';

const forexData = [
  { name: 'US Dollar', code: 'USD', rate: 1.0, change: 0.02 },
  { name: 'Euro', code: 'EUR', rate: 0.92, change: -0.01 },
  { name: 'British Pound', code: 'GBP', rate: 0.78, change: 0.03 },
  { name: 'Japanese Yen', code: 'JPY', rate: 113.45, change: -0.05 },
  { name: 'Australian Dollar', code: 'AUD', rate: 1.45, change: 0.01 },
];

export default function Index() {
  useEffect(() => {
    initSocketConnection();
  }, []);
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-semibold">Realtime Forex</h1>
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        </div>
      </nav>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Foreign Exchange Rates
          </h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Currency
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left">
                  Code
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right">
                  Rate
                </th>
                <th className="border border-gray-300 px-4 py-2 text-right">
                  Change
                </th>
              </tr>
            </thead>
            <tbody>
              {forexData.map((currency, index) => (
                <tr key={index} className="border border-gray-300">
                  <td className="border border-gray-300 px-4 py-2">
                    {currency.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {currency.code}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {currency.rate.toFixed(2)}
                  </td>
                  <td
                    className={`border border-gray-300 px-4 py-2 text-right font-semibold ${
                      currency.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {currency.change > 0 ? '+' : ''}
                    {currency.change.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
