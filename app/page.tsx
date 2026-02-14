'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface TaxYear {
  id: string;
  year: number;
  startDate: string;
  endDate: string;
  openingBtcBalance: string;
  openingCostBasis: string;
  openingWac: string;
}

interface ImportBatch {
  id: string;
  source: string;
  fileName: string;
  recordsImported: number;
  status: string;
  importedAt: string;
}

export default function Dashboard() {
  const [taxYears, setTaxYears] = useState<TaxYear[]>([]);
  const [imports, setImports] = useState<ImportBatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/tax-year').then((r) => r.json()),
      fetch('/api/imports').then((r) => r.json()),
    ])
      .then(([taxYearsData, importsData]) => {
        setTaxYears(taxYearsData);
        setImports(importsData);
      })
      .catch((error) => console.error('Error loading dashboard:', error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  const currentTaxYear = taxYears[0];
  const recentImports = imports.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">
          Bitcoin Tax Calculator
        </h1>
        <p className="text-gray-300">
          Weighted Average Cost (WAC) method for NZ IRD tax reporting
        </p>
      </div>

      {!currentTaxYear && (
        <div className="bg-yellow-950 border border-yellow-700 rounded-lg p-4">
          <h3 className="text-yellow-300 font-semibold mb-2">
            No Tax Year Configured
          </h3>
          <p className="text-yellow-400 mb-4">
            You need to set up a tax year before importing transactions.
          </p>
          <Link
            href="/tax-year"
            className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md"
          >
            Set Up Tax Year
          </Link>
        </div>
      )}

      {currentTaxYear && (
        <div className="bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            Current Tax Year: {currentTaxYear.year}/
            {currentTaxYear.year + 1}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-950 p-4 rounded-lg">
              <div className="text-sm text-gray-300">Opening BTC Balance</div>
              <div className="text-2xl font-bold text-blue-400">
                {parseFloat(currentTaxYear.openingBtcBalance).toFixed(8)} BTC
              </div>
            </div>
            <div className="bg-green-950 p-4 rounded-lg">
              <div className="text-sm text-gray-300">Opening Cost Basis</div>
              <div className="text-2xl font-bold text-green-400">
                ${parseFloat(currentTaxYear.openingCostBasis).toFixed(2)} NZD
              </div>
            </div>
            <div className="bg-purple-950 p-4 rounded-lg">
              <div className="text-sm text-gray-300">Opening WAC</div>
              <div className="text-2xl font-bold text-purple-400">
                ${parseFloat(currentTaxYear.openingWac).toFixed(2)} NZD/BTC
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/import"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-3 rounded-md font-medium"
            >
              Import CSV Data
            </Link>
            <Link
              href="/transactions"
              className="block w-full bg-gray-600 hover:bg-gray-500 text-white text-center px-4 py-3 rounded-md font-medium"
            >
              View Transactions
            </Link>
            <Link
              href="/calculations"
              className="block w-full bg-green-600 hover:bg-green-700 text-white text-center px-4 py-3 rounded-md font-medium"
            >
              Calculate WAC
            </Link>
            <Link
              href="/report"
              className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center px-4 py-3 rounded-md font-medium"
            >
              Generate Report
            </Link>
          </div>
        </div>

        <div className="bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Recent Imports</h2>
          {recentImports.length === 0 ? (
            <p className="text-gray-400">No imports yet</p>
          ) : (
            <div className="space-y-3">
              {recentImports.map((imp) => (
                <div
                  key={imp.id}
                  className="border border-gray-700 rounded p-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-100">{imp.fileName}</div>
                      <div className="text-sm text-gray-400">
                        {imp.source} - {imp.recordsImported} records
                      </div>
                    </div>
                    <div
                      className={`text-xs px-2 py-1 rounded ${
                        imp.status === 'SUCCESS'
                          ? 'bg-green-900 text-green-300'
                          : imp.status === 'ERROR'
                          ? 'bg-red-900 text-red-300'
                          : 'bg-yellow-900 text-yellow-300'
                      }`}
                    >
                      {imp.status}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(imp.importedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
