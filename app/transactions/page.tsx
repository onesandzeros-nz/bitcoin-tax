'use client';

import { useEffect, useState, useMemo } from 'react';

interface Transaction {
  id: string;
  source: string;
  transactionDate: string;
  type: string;
  btcAmount: string;
  fiatAmount: string;
  price: string;
  sourceReference: string | null;
}

type SortKey = 'transactionDate' | 'source' | 'type' | 'btcAmount' | 'fiatAmount' | 'price' | 'sourceReference';
type SortDir = 'asc' | 'desc';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('transactionDate');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedTransactions = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'transactionDate':
          cmp = new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime();
          break;
        case 'source':
        case 'type':
          cmp = a[sortKey].localeCompare(b[sortKey]);
          break;
        case 'btcAmount':
        case 'fiatAmount':
        case 'price':
          cmp = parseFloat(a[sortKey]) - parseFloat(b[sortKey]);
          break;
        case 'sourceReference':
          cmp = (a.sourceReference || '').localeCompare(b.sourceReference || '');
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [transactions, sortKey, sortDir]);

  const SortIndicator = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <span className="text-gray-600 ml-1">{'\u2195'}</span>;
    return <span className="text-gray-300 ml-1">{sortDir === 'asc' ? '\u25B2' : '\u25BC'}</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-100 mb-6">Transactions</h1>

        <div className="mb-4 text-sm text-gray-300">
          Total Transactions: {transactions.length}
        </div>

        {transactions.length === 0 ? (
          <p className="text-gray-400">
            No transactions yet. Import CSV data to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th
                    onClick={() => handleSort('transactionDate')}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase cursor-pointer hover:text-gray-100 select-none"
                  >
                    Date<SortIndicator column="transactionDate" />
                  </th>
                  <th
                    onClick={() => handleSort('source')}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase cursor-pointer hover:text-gray-100 select-none"
                  >
                    Source<SortIndicator column="source" />
                  </th>
                  <th
                    onClick={() => handleSort('type')}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase cursor-pointer hover:text-gray-100 select-none"
                  >
                    Type<SortIndicator column="type" />
                  </th>
                  <th
                    onClick={() => handleSort('btcAmount')}
                    className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase cursor-pointer hover:text-gray-100 select-none"
                  >
                    BTC Amount<SortIndicator column="btcAmount" />
                  </th>
                  <th
                    onClick={() => handleSort('fiatAmount')}
                    className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase cursor-pointer hover:text-gray-100 select-none"
                  >
                    Fiat Amount (NZD)<SortIndicator column="fiatAmount" />
                  </th>
                  <th
                    onClick={() => handleSort('price')}
                    className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase cursor-pointer hover:text-gray-100 select-none"
                  >
                    Price (NZD/BTC)<SortIndicator column="price" />
                  </th>
                  <th
                    onClick={() => handleSort('sourceReference')}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase cursor-pointer hover:text-gray-100 select-none"
                  >
                    Reference<SortIndicator column="sourceReference" />
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {sortedTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm text-gray-200">
                      {new Date(tx.transactionDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                        {tx.source.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          tx.type === 'BUY'
                            ? 'bg-green-900 text-green-300'
                            : tx.type === 'SELL'
                            ? 'bg-red-900 text-red-300'
                            : tx.type === 'CASHBACK'
                            ? 'bg-blue-900 text-blue-300'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-right font-mono ${
                        parseFloat(tx.btcAmount) >= 0
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {parseFloat(tx.btcAmount).toFixed(8)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-gray-200">
                      ${parseFloat(tx.fiatAmount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-gray-200">
                      ${parseFloat(tx.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {tx.sourceReference || '-'}
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
