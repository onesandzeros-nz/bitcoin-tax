'use client';

import { useState } from 'react';

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState<string>('EASY_CRYPTO');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert('Please select a file');
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('source', source);

      const response = await fetch('/api/imports', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: `Successfully imported ${data.recordsImported} transactions!`,
        });
        setFile(null);
      } else {
        setResult({
          success: false,
          message: `Error: ${data.error}`,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setResult({
        success: false,
        message: 'Failed to upload file',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-100 mb-6">Import CSV Data</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Exchange Source
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-md px-3 py-2"
            >
              <option value="EASY_CRYPTO">Easy Crypto</option>
              <option value="LIGHTNING">Lightning Pay</option>
              <option value="XAPO">Xapo</option>
              <option value="KRAKEN">Kraken</option>
              <option value="COINCORNER">CoinCorner</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full bg-gray-700 border border-gray-600 text-gray-100 rounded-md px-3 py-2 file:bg-gray-600 file:text-gray-200 file:border-0 file:rounded file:px-3 file:py-1 file:mr-3"
              required
            />
            {file && (
              <p className="text-sm text-gray-400 mt-1">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={uploading || !file}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-md font-medium"
            >
              {uploading ? 'Uploading...' : 'Import CSV'}
            </button>
          </div>
        </form>

        {result && (
          <div
            className={`mt-6 p-4 rounded-lg ${
              result.success
                ? 'bg-green-950 text-green-300 border border-green-700'
                : 'bg-red-950 text-red-300 border border-red-700'
            }`}
          >
            {result.message}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-950 rounded-lg">
          <h2 className="font-semibold text-blue-300 mb-2">CSV Format Guide</h2>
          <div className="text-sm text-blue-200 space-y-2">
            <p>
              <strong>Easy Crypto:</strong> Date, Order ID, Type, From symbol, To
              symbol, From amount, To amount, ...
            </p>
            <p>
              <strong>Lightning Pay:</strong> Date, Sent Amount, Sent Currency,
              Received Amount, Received Currency, Fee Amount, Fee Currency, ...
            </p>
            <p>
              <strong>Xapo:</strong> Processing Date/Time, Transaction Date/Time,
              Action Taken, Currency, Amount, BTC Spot/FX, USD Amount, ...
            </p>
            <p>
              <strong>Kraken:</strong> txid, time, type, price, cost, fee, vol, pair,
              ...
            </p>
            <p>
              <strong>CoinCorner:</strong> Date &amp; Time, Store/Website, Detail, Type,
              Tx ID, Price, Price Currency, Gross, Gross Currency, Fee, ...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
