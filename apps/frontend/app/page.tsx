'use client';
import { useEffect, useState } from 'react';
import { initSocketConnection } from '../lib/SocketAdapter';
import { ExchangeRate } from '../models';

export default function Index() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);

  useEffect(() => {
    initSocketConnection({
      onCurrencyExchangeRates: (data) => {
        setRates(data.rates);
      },
      onCurrencyExchangeRatesUpdate: (data) => {
        setRates((prevRates) => {
          return prevRates.map((prevRate) => {
            const updatedRate = data[prevRate.code];
            if (updatedRate) {
              return {
                ...prevRate,
                ...updatedRate,
              };
            }
            return prevRate;
          });
        });
      },
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4 shadow-md sticky top-0">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-lg font-semibold">Realtime Exchange</h1>
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        </div>
      </nav>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Currency Exchange Rates
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
              {rates.map(({ name, code, rate, change }) => (
                <tr key={code} className="border border-gray-300">
                  <td className="border border-gray-300 px-4 py-2">{name}</td>
                  <td className="border border-gray-300 px-4 py-2">{code}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {rate.toFixed(2)}
                  </td>
                  <td
                    className={`border border-gray-300 px-4 py-2 text-right font-semibold ${
                      change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {change !== 0 ? (
                      <>
                        {change > 0 ? '+' : ''}
                        {change.toFixed(2)}
                      </>
                    ) : (
                      <>&nbsp;</>
                    )}
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
