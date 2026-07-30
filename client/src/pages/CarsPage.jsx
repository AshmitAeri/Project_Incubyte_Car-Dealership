import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, Grid3x3, List } from 'lucide-react';
import { carService } from '../services/carService';
import CarCard from '../components/CarCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import useDebounce from '../hooks/useDebounce';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const CATEGORIES = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Pickup Truck', 'Van', 'Wagon', 'Sports', 'Luxury', 'Electric'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'LPG'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
];

const CarsPage = () => {
  const { isAuthenticated } = useAuth();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [purchaseCar, setPurchaseCar] = useState(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    fuelType: '',
    sort: 'newest',
    minPrice: '',
    maxPrice: '',
    available: '',
  });

  const debouncedKeyword = useDebounce(filters.keyword, 400);

  const fetchCars = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        ...filters,
        keyword: debouncedKeyword,
        page,
        limit: 9,
      };
      // Remove empty params
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);

      const res = await carService.getCars(params);
      setCars(res.data.data || []);
      setTotalPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch {
      setError('Failed to load cars. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [debouncedKeyword, filters.category, filters.fuelType, filters.sort, filters.minPrice, filters.maxPrice, filters.available, page]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword, filters.category, filters.fuelType, filters.sort, filters.available]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ keyword: '', category: '', fuelType: '', sort: 'newest', minPrice: '', maxPrice: '', available: '' });
  };

  const handlePurchaseConfirm = async () => {
    setPurchaseLoading(true);
    try {
      await carService.purchaseCar(purchaseCar._id, 1);
      toast.success(`🚗 Successfully purchased ${purchaseCar.name}!`);
      setPurchaseCar(null);
      fetchCars();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Purchase failed');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const activeFilterCount = [filters.category, filters.fuelType, filters.minPrice, filters.maxPrice, filters.available].filter(Boolean).length;

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-8"
        >
          <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white mb-2">
            Car <span className="text-gradient">Inventory</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {total > 0 ? `${total} vehicles available` : 'Browse our collection'}
          </p>
        </motion.div>

        {/* Search + Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
              placeholder="Search by name, brand, model..."
              className="input-field pl-10"
            />
          </div>

          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="input-field w-full sm:w-52"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 relative whitespace-nowrap ${showFilters ? 'ring-2 ring-primary-500' : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="hidden sm:flex items-center gap-1 bg-gray-100 dark:bg-white/10 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-white/20 shadow-sm' : ''}`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-white/20 shadow-sm' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-sm text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline">
                  <X className="w-3.5 h-3.5" /> Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Category</label>
                <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)} className="input-field">
                  <option value="">All Categories</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Fuel Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Fuel Type</label>
                <select value={filters.fuelType} onChange={(e) => handleFilterChange('fuelType', e.target.value)} className="input-field">
                  <option value="">All Fuel Types</option>
                  {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Min Price ($)</label>
                <input type="number" value={filters.minPrice} onChange={(e) => handleFilterChange('minPrice', e.target.value)} placeholder="0" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Max Price ($)</label>
                <input type="number" value={filters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} placeholder="Any" className="input-field" />
              </div>

              {/* Availability */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="available"
                  checked={filters.available === 'true'}
                  onChange={(e) => handleFilterChange('available', e.target.checked ? 'true' : '')}
                  className="w-4 h-4 rounded text-primary-600"
                />
                <label htmlFor="available" className="text-sm text-gray-700 dark:text-gray-300">In Stock Only</label>
              </div>
            </div>
          </motion.div>
        )}

        {/* Cars Grid */}
        {loading ? (
          <LoadingSkeleton count={9} />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchCars} />
        ) : cars.length === 0 ? (
          <EmptyState
            title="No cars found"
            description="Try adjusting your search or filters to find what you're looking for."
            icon="search"
            action={clearFilters}
            actionLabel="Clear Filters"
          />
        ) : (
          <>
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'flex flex-col gap-4'
            }>
              {cars.map((car, i) => (
                <CarCard key={car._id} car={car} index={i} onPurchase={setPurchaseCar} />
              ))}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* Purchase Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!purchaseCar}
        onClose={() => setPurchaseCar(null)}
        onConfirm={handlePurchaseConfirm}
        loading={purchaseLoading}
        title={`Purchase ${purchaseCar?.name}?`}
        message={`You are about to purchase 1 unit of ${purchaseCar?.name} for $${purchaseCar?.price?.toLocaleString()}. This will decrease the stock by 1.`}
        confirmLabel="Confirm Purchase"
        variant="info"
      />
    </div>
  );
};

export default CarsPage;
