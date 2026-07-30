import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, RefreshCw, Filter } from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import { carService } from '../services/carService';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';
import { TableSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import ConfirmDialog from '../components/ConfirmDialog';
import { toast } from 'react-toastify';

const InventoryPage = () => {
  const { isAdmin } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [restockDialog, setRestockDialog] = useState(null);
  const [restockQty, setRestockQty] = useState(1);
  const [restockLoading, setRestockLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 15 };
      if (actionFilter) params.action = actionFilter;

      const res = isAdmin()
        ? await inventoryService.getInventoryHistory(params)
        : await inventoryService.getPurchaseHistory(params);

      setHistory(res.data.data || []);
      setTotalPages(res.data.pages || 1);
    } catch {
      setError('Failed to load inventory history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, [page, actionFilter]);

  const handleRestock = async () => {
    setRestockLoading(true);
    try {
      await carService.restockCar(restockDialog.car._id, restockQty);
      toast.success(`Restocked ${restockQty} units of ${restockDialog.car.name}!`);
      setRestockDialog(null);
      setRestockQty(1);
      fetchHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Restock failed');
    } finally {
      setRestockLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-8">
          <div>
            <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white">
              Inventory <span className="text-gradient">History</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {isAdmin() ? 'All purchase and restock events' : 'Your purchase history'}
            </p>
          </div>
          <div className="flex gap-3">
            {isAdmin() && (
              <select
                value={actionFilter}
                onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                className="input-field w-auto"
              >
                <option value="">All Actions</option>
                <option value="purchase">Purchases</option>
                <option value="restock">Restocks</option>
              </select>
            )}
            <button onClick={fetchHistory} className="btn-secondary flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <TableSkeleton rows={8} cols={5} />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchHistory} />
        ) : history.length === 0 ? (
          <EmptyState
            title="No history yet"
            description="Purchase or restock events will appear here."
            icon="shopping"
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-white/5">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Car</th>
                    {isAdmin() && <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>}
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qty</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock Before→After</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    {isAdmin() && <th className="px-6 py-4" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {history.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-dark-300 flex-shrink-0">
                            <img
                              src={item.car?.image ? `/uploads/${item.car.image}` : 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=80&q=80'}
                              alt={item.car?.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.car?.name || 'N/A'}</p>
                            <p className="text-xs text-gray-400">{item.car?.brand}</p>
                          </div>
                        </div>
                      </td>
                      {isAdmin() && (
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {item.user?.name || 'N/A'}
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <span className={item.action === 'purchase' ? 'badge-blue' : 'badge-green'}>
                          {item.action === 'purchase' ? (
                            <><ShoppingBag className="w-3 h-3 inline mr-1" />Purchase</>
                          ) : (
                            <><Package className="w-3 h-3 inline mr-1" />Restock</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">{item.quantity}</td>
                      <td className="px-6 py-4 text-right text-sm text-gray-500 dark:text-gray-400">
                        {item.stockBefore} → {item.stockAfter}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                        {item.totalAmount > 0 ? `$${item.totalAmount.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      {isAdmin() && (
                        <td className="px-6 py-4 text-right">
                          {item.car && (
                            <button
                              onClick={() => setRestockDialog({ car: item.car })}
                              className="text-xs btn-secondary py-1.5 px-3"
                            >
                              Restock
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Restock Dialog */}
      {restockDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRestockDialog(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-sm bg-white dark:bg-dark-100 rounded-2xl shadow-2xl p-6 z-10"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Restock Car</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Adding stock to: <strong>{restockDialog.car.name}</strong>
            </p>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Quantity to Add</label>
            <input
              type="number"
              min="1"
              value={restockQty}
              onChange={(e) => setRestockQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="input-field mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setRestockDialog(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleRestock} disabled={restockLoading} className="btn-primary flex-1">
                {restockLoading ? 'Restocking...' : 'Confirm Restock'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
