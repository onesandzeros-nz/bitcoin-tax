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

export default function TaxYearPage() {
  const [taxYears, setTaxYears] = useState<TaxYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    openingBtcBalance: '',
    openingCostBasis: '',
  });
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    startDate: '',
    endDate: '',
    openingBtcBalance: '0',
    openingCostBasis: '0',
  });

  useEffect(() => {
    loadTaxYears();
  }, []);

  const loadTaxYears = async () => {
    try {
      const response = await fetch('/api/tax-year');
      const data = await response.json();
      setTaxYears(data);
    } catch (error) {
      console.error('Error loading tax years:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/tax-year', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Tax year created successfully!');
        setShowForm(false);
        loadTaxYears();
        setFormData({
          year: new Date().getFullYear(),
          startDate: '',
          endDate: '',
          openingBtcBalance: '0',
          openingCostBasis: '0',
        });
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating tax year:', error);
      alert('Failed to create tax year');
    }
  };

  const handleEdit = (ty: TaxYear) => {
    setEditingId(ty.id);
    setEditData({
      openingBtcBalance: parseFloat(ty.openingBtcBalance).toString(),
      openingCostBasis: parseFloat(ty.openingCostBasis).toString(),
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/tax-year', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          openingBtcBalance: editData.openingBtcBalance,
          openingCostBasis: editData.openingCostBasis,
        }),
      });

      if (response.ok) {
        setEditingId(null);
        loadTaxYears();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating tax year:', error);
      alert('Failed to update tax year');
    }
  };

  const setDefaultDates = () => {
    const year = formData.year;
    setFormData({
      ...formData,
      startDate: `${year}-04-01`,
      endDate: `${year + 1}-03-31`,
    });
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-100">Tax Years</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            {showForm ? 'Cancel' : 'Create Tax Year'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-700 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Create New Tax Year</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Tax Year
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: parseInt(e.target.value) })
                  }
                  className="w-full bg-gray-600 border border-gray-500 text-gray-100 rounded-md px-3 py-2"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  e.g., 2025 for 2025/2026 tax year
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Start Date
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="flex-1 bg-gray-600 border border-gray-500 text-gray-100 rounded-md px-3 py-2"
                    required
                  />
                  <button
                    type="button"
                    onClick={setDefaultDates}
                    className="text-sm bg-gray-600 hover:bg-gray-500 text-gray-200 px-3 py-2 rounded-md"
                  >
                    Use NZ Dates
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full bg-gray-600 border border-gray-500 text-gray-100 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Opening BTC Balance
                </label>
                <input
                  type="number"
                  step="0.00000001"
                  value={formData.openingBtcBalance}
                  onChange={(e) =>
                    setFormData({ ...formData, openingBtcBalance: e.target.value })
                  }
                  className="w-full bg-gray-600 border border-gray-500 text-gray-100 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Opening Cost Basis (NZD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.openingCostBasis}
                  onChange={(e) =>
                    setFormData({ ...formData, openingCostBasis: e.target.value })
                  }
                  className="w-full bg-gray-600 border border-gray-500 text-gray-100 rounded-md px-3 py-2"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md"
              >
                Create Tax Year
              </button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {taxYears.length === 0 ? (
            <p className="text-gray-400">No tax years configured yet.</p>
          ) : (
            taxYears.map((ty) => {
              const calculatedWac =
                parseFloat(ty.openingBtcBalance) > 0
                  ? (parseFloat(ty.openingCostBasis) / parseFloat(ty.openingBtcBalance)).toFixed(2)
                  : '0.00';
              const isEditing = editingId === ty.id;

              return (
                <div key={ty.id} className="border border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-100">
                      Tax Year {ty.year}/{ty.year + 1}
                    </h3>
                    {!isEditing && (
                      <button
                        onClick={() => handleEdit(ty)}
                        className="text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1 rounded-md"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleEditSubmit} className="mt-3 p-4 bg-gray-700 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-1">
                            Opening BTC Balance
                          </label>
                          <input
                            type="number"
                            step="0.00000001"
                            value={editData.openingBtcBalance}
                            onChange={(e) =>
                              setEditData({ ...editData, openingBtcBalance: e.target.value })
                            }
                            className="w-full bg-gray-600 border border-gray-500 text-gray-100 rounded-md px-3 py-2"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-1">
                            Opening Cost Basis (NZD)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={editData.openingCostBasis}
                            onChange={(e) =>
                              setEditData({ ...editData, openingCostBasis: e.target.value })
                            }
                            className="w-full bg-gray-600 border border-gray-500 text-gray-100 rounded-md px-3 py-2"
                            required
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex gap-3">
                        <button
                          type="submit"
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="bg-gray-600 hover:bg-gray-500 text-gray-200 px-4 py-2 rounded-md"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Period:</span>{' '}
                        <span className="text-gray-200">
                          {new Date(ty.startDate).toLocaleDateString()} -{' '}
                          {new Date(ty.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Opening Balance:</span>{' '}
                        <span className="text-gray-200">
                          {parseFloat(ty.openingBtcBalance).toFixed(8)} BTC
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Opening Cost Basis:</span>{' '}
                        <span className="text-gray-200">
                          ${parseFloat(ty.openingCostBasis).toFixed(2)} NZD
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Opening WAC:</span>{' '}
                        <span className="text-gray-200">
                          ${calculatedWac} NZD/BTC
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
