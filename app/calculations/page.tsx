'use client';

import { useEffect, useState } from 'react';

interface TaxYear {
  id: string;
  year: number;
}

interface Calculation {
  id: string;
  transaction: {
    transactionDate: string;
    source: string;
    type: string;
    btcAmount: string;
    fiatAmount: string;
    price: string;
  };
  runningBalance: string;
  runningCost: string;
  wacPrice: string;
  costBasis: string;
  capitalGain: string | null;
}

export default function CalculationsPage() {
  const [taxYears, setTaxYears] = useState<TaxYear[]>([]);
  const [selectedTaxYear, setSelectedTaxYear] = useState<string>('');
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    loadTaxYears();
  }, []);

  const loadTaxYears = async () => {
    try {
      const response = await fetch('/api/tax-year');
      const data = await response.json();
      setTaxYears(data);
      if (data.length > 0) {
        setSelectedTaxYear(data[0].id);
      }
    } catch (error) {
      console.error('Error loading tax years:', error);
    }
  };

  const loadCalculations = async (taxYearId: string) => {
    if (!taxYearId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/calculations?taxYearId=${taxYearId}`);
      const data = await response.json();
      setCalculations(data);
    } catch (error) {
      console.error('Error loading calculations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async () => {
    if (!selectedTaxYear) {
      alert('Please select a tax year');
      return;
    }

    setCalculating(true);
    try {
      const response = await fetch('/api/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taxYearId: selectedTaxYear }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Successfully calculated WAC for ${data.calculationsCreated} transactions!`);
        loadCalculations(selectedTaxYear);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Calculation error:', error);
      alert('Failed to calculate WAC');
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    if (selectedTaxYear) {
      loadCalculations(selectedTaxYear);
    }
  }, [selectedTaxYear]);

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-100 mb-6">WAC Calculations</h1>

        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Tax Year
            </label>
            <select
              value={selectedTaxYear}
              onChange={(e) => setSelectedTaxYear(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-md px-3 py-2"
            >
              <option value="">Select Tax Year</option>
              {taxYears.map((ty) => (
                <option key={ty.id} value={ty.id}>
                  {ty.year}/{ty.year + 1}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleCalculate}
              disabled={calculating || !selectedTaxYear}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-md"
            >
              {calculating ? 'Calculating...' : 'Calculate WAC'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading...</div>
        ) : calculations.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No calculations yet. Click &quot;Calculate WAC&quot; to generate calculations.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Date
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Source
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                    Type
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-300 uppercase">
                    BTC Amount
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-300 uppercase">
                    WAC Price
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-300 uppercase">
                    Cost Basis
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-300 uppercase">
                    Capital Gain
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-300 uppercase">
                    Running Balance
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-300 uppercase">
                    Running Cost
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {calculations.map((calc) => (
                  <tr key={calc.id} className="hover:bg-gray-700">
                    <td className="px-3 py-3 text-sm text-gray-200">
                      {new Date(calc.transaction.transactionDate).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-3 text-sm">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                        {calc.transaction.source.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          calc.transaction.type === 'BUY'
                            ? 'bg-green-900 text-green-300'
                            : calc.transaction.type === 'SELL'
                            ? 'bg-red-900 text-red-300'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        {calc.transaction.type}
                      </span>
                    </td>
                    <td
                      className={`px-3 py-3 text-sm text-right font-mono ${
                        parseFloat(calc.transaction.btcAmount) >= 0
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {parseFloat(calc.transaction.btcAmount).toFixed(8)}
                    </td>
                    <td className="px-3 py-3 text-sm text-right font-mono text-gray-200">
                      ${parseFloat(calc.wacPrice).toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-sm text-right font-mono text-gray-200">
                      ${parseFloat(calc.costBasis).toFixed(2)}
                    </td>
                    <td
                      className={`px-3 py-3 text-sm text-right font-mono ${
                        calc.capitalGain
                          ? parseFloat(calc.capitalGain) >= 0
                            ? 'text-green-400'
                            : 'text-red-400'
                          : 'text-gray-500'
                      }`}
                    >
                      {calc.capitalGain
                        ? `$${parseFloat(calc.capitalGain).toFixed(2)}`
                        : '-'}
                    </td>
                    <td className="px-3 py-3 text-sm text-right font-mono text-blue-400">
                      {parseFloat(calc.runningBalance).toFixed(8)}
                    </td>
                    <td className="px-3 py-3 text-sm text-right font-mono text-blue-400">
                      ${parseFloat(calc.runningCost).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
