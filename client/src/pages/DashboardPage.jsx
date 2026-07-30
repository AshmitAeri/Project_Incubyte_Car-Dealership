import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Car, Package, DollarSign, TrendingUp, AlertTriangle,
  Plus, RefreshCw, ShoppingBag
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { StatCardSkeleton } from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';

const COLORS = ['#5b72f7', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

const StatCard = ({ icon: Icon, label, value, color, subtitle, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="stat-card"
  >
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
      <p className="text-3xl font-black text-gray-900 dark:text-white">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  </motion.div>
);

const ChartCard = ({ title, children }) => (
  <div className="card p-6">
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">{title}</h3>
    {children}
  </div>
);

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.getDashboard();
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-10 skeleton w-48 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
            {[...Array(5)].map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-6 h-72 skeleton" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <ErrorState message={error} onRetry={fetchDashboard} />
      </div>
    );
  }

  const { stats, charts, recentCars, recentPurchases } = data;

  const statCards = [
    { icon: Car, label: 'Total Cars', value: stats.totalCars, color: 'bg-primary-600', subtitle: 'In inventory' },
    { icon: Package, label: 'Total Stock', value: stats.totalStock.toLocaleString(), color: 'bg-emerald-600', subtitle: 'Units available' },
    { icon: DollarSign, label: 'Inventory Value', value: `$${(stats.totalInventoryValue / 1000000).toFixed(1)}M`, color: 'bg-violet-600', subtitle: 'Current value' },
    { icon: ShoppingBag, label: 'Cars Sold', value: stats.totalSold, color: 'bg-amber-500', subtitle: 'Total sold' },
    { icon: AlertTriangle, label: 'Out of Stock', value: stats.outOfStock, color: 'bg-red-500', subtitle: 'Need restock' },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-8">
          <div>
            <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white">
              Dashboard <span className="text-gradient">Overview</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time inventory analytics and insights</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchDashboard} className="btn-secondary flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <Link to="/cars/add" className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Car
            </Link>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
          {statCards.map((card, i) => (
            <StatCard key={card.label} {...card} delay={i * 0.05} />
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Bar Chart — Stock by Category */}
          <ChartCard title="📦 Stock by Category">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={charts.stockByCategory} margin={{ top: 5, right: 20, bottom: 60, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="category" angle={-35} textAnchor="end" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
                />
                <Bar dataKey="stock" fill="#5b72f7" radius={[6, 6, 0, 0]} name="Stock" />
                <Bar dataKey="cars" fill="#a855f7" radius={[6, 6, 0, 0]} name="Models" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Pie Chart — Cars by Category */}
          <ChartCard title="🎯 Cars by Category">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={charts.carsByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {charts.carsByCategory.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
                />
                <Legend
                  formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Monthly Revenue Line Chart */}
          <ChartCard title="📈 Monthly Revenue">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={charts.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
                  formatter={(val) => [`$${val.toLocaleString()}`, 'Revenue']}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#5b72f7"
                  strokeWidth={3}
                  dot={{ fill: '#5b72f7', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Pie Chart — Fuel Types */}
          <ChartCard title="⛽ Cars by Fuel Type">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={charts.carsByFuelType}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {charts.carsByFuelType.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Bottom Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recently Added Cars */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white">Recently Added Cars</h3>
              <Link to="/cars" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-white/5">
              {recentCars.map((car) => (
                <Link key={car._id} to={`/cars/${car._id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-dark-300 flex-shrink-0">
                    <img
                      src={car.image ? `/uploads/${car.image}` : 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=100&q=80'}
                      alt={car.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{car.name}</p>
                    <p className="text-xs text-gray-400">{car.brand}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">${car.price?.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{car.stockQuantity} in stock</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Purchases */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white">Recent Purchases</h3>
              <Link to="/inventory" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-white/5">
              {recentPurchases.length === 0 ? (
                <p className="p-6 text-center text-gray-400 text-sm">No purchases yet</p>
              ) : recentPurchases.slice(0, 5).map((purchase) => (
                <div key={purchase._id} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {purchase.car?.name || 'Unknown Car'}
                    </p>
                    <p className="text-xs text-gray-400">{purchase.user?.name} · {purchase.quantity} unit(s)</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      ${purchase.totalAmount?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(purchase.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
