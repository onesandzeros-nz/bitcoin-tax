'use client';

import { useEffect, useState } from 'react';

interface TaxYear {
  id: string;
  year: number;
  startDate: string;
  endDate: string;
  openingBtcBalance: string;
  openingCostBasis: string;
  openingWac: string;
}

interface Report {
  taxYear: TaxYear;
  summary: {
    totalProceeds: string;
    totalCostBasis: string;
    netCapitalGain: string;
    numberOfDisposals: number;
    closingBalance: string;
    closingCostBasis: string;
    closingWac: string;
  };
  calculations: any[];
}

export default function ReportPage() {
  const [taxYears, setTaxYears] = useState<TaxYear[]>([]);
  const [selectedTaxYear, setSelectedTaxYear] = useState<string>('');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);

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

  const loadReport = async (taxYearId: string) => {
    if (!taxYearId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tax-report?taxYearId=${taxYearId}`);
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error('Error loading report:', error);
      alert('Failed to load report. Make sure WAC calculations have been run.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTaxYear) {
      loadReport(selectedTaxYear);
    }
  }, [selectedTaxYear]);

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-100 mb-6">Tax Report</h1>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Tax Year
          </label>
          <select
            value={selectedTaxYear}
            onChange={(e) => setSelectedTaxYear(e.target.value)}
            className="w-full max-w-md bg-gray-700 border border-gray-600 text-gray-100 rounded-md px-3 py-2"
          >
            <option value="">Select Tax Year</option>
            {taxYears.map((ty) => (
              <option key={ty.id} value={ty.id}>
                {ty.year}/{ty.year + 1}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading...</div>
        ) : !report ? (
          <div className="text-center text-gray-400 py-8">
            Select a tax year to view the report.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-950 p-4 rounded-lg">
                  <div className="text-sm text-gray-300">Opening Balance</div>
                  <div className="text-xl font-bold text-blue-400">
                    {parseFloat(report.taxYear.openingBtcBalance).toFixed(8)} BTC
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    Cost: ${parseFloat(report.taxYear.openingCostBasis).toFixed(2)}
                  </div>
                </div>
                <div className="bg-green-950 p-4 rounded-lg">
                  <div className="text-sm text-gray-300">Closing Balance</div>
                  <div className="text-xl font-bold text-green-400">
                    {parseFloat(report.summary.closingBalance).toFixed(8)} BTC
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    Cost: ${parseFloat(report.summary.closingCostBasis).toFixed(2)}
                  </div>
                </div>
                <div className="bg-purple-950 p-4 rounded-lg">
                  <div className="text-sm text-gray-300">Closing WAC</div>
                  <div className="text-xl font-bold text-purple-400">
                    ${parseFloat(report.summary.closingWac).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">NZD per BTC</div>
                </div>
                <div className="bg-orange-950 p-4 rounded-lg">
                  <div className="text-sm text-gray-300">Total Disposals</div>
                  <div className="text-xl font-bold text-orange-400">
                    {report.summary.numberOfDisposals}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">Transactions</div>
                </div>
              </div>
            </div>

            {/* Capital Gains Summary */}
            <div className="bg-gray-700 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Capital Gains Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-300">Total Proceeds</div>
                  <div className="text-2xl font-bold text-gray-100">
                    ${parseFloat(report.summary.totalProceeds).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-300">Total Cost Basis</div>
                  <div className="text-2xl font-bold text-gray-100">
                    ${parseFloat(report.summary.totalCostBasis).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-300">Net Capital Gain</div>
                  <div
                    className={`text-2xl font-bold ${
                      parseFloat(report.summary.netCapitalGain) >= 0
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    ${parseFloat(report.summary.netCapitalGain).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Disposal Transactions */}
            <div>
              <h2 className="text-xl font-semibold text-gray-100 mb-4">
                Disposal Transactions (Capital Gains Events)
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                        Type
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">
                        BTC Disposed
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">
                        Sale Price (NZD/BTC)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">
                        WAC Price (NZD/BTC)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">
                        Proceeds
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">
                        Cost Basis
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase">
                        Capital Gain
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {report.calculations
                      .filter((calc) => calc.capitalGain !== null)
                      .map((calc, idx) => {
                        const btcDisposed = Math.abs(parseFloat(calc.btcAmount));
                        const proceeds = parseFloat(calc.costBasis) + parseFloat(calc.capitalGain);

                        return (
                          <tr key={idx} className="hover:bg-gray-700">
                            <td className="px-4 py-3 text-sm text-gray-200">
                              {new Date(calc.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900 text-red-300">
                                {calc.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-mono text-gray-200">
                              {btcDisposed.toFixed(8)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-mono text-gray-200">
                              ${parseFloat(calc.price).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-mono text-gray-200">
                              ${parseFloat(calc.wacPrice).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-mono text-gray-200">
                              ${proceeds.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-mono text-gray-200">
                              ${parseFloat(calc.costBasis).toFixed(2)}
                            </td>
                            <td
                              className={`px-4 py-3 text-sm text-right font-mono font-semibold ${
                                parseFloat(calc.capitalGain) >= 0
                                  ? 'text-green-400'
                                  : 'text-red-400'
                              }`}
                            >
                              ${parseFloat(calc.capitalGain).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
