import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, Phone, User, Car, Mail,
  CheckCircle, XCircle, AlertCircle, Loader2,
  CalendarDays, ChevronDown, Search, RefreshCw, Check, X
} from 'lucide-react';
import { testDriveService } from '../services/testDriveService';
import { toast } from 'react-toastify';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',       icon: AlertCircle },
  confirmed: { label: 'Confirmed', cls: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',           icon: CheckCircle },
  completed: { label: 'Completed', cls: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300', icon: CheckCircle },
  cancelled: { label: 'Cancelled', cls: 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400',               icon: XCircle },
};

const StatusBadge = ({ status }) => {
  const { label, cls, icon: Icon } = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </span>
  );
};

const ActionButton = ({ onClick, disabled, icon: Icon, label, variant }) => {
  const variants = {
    confirm: 'bg-blue-600 hover:bg-blue-700 text-white',
    complete: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    cancel: 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-600 border border-red-200 dark:border-red-800',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 ${variants[variant]}`}
    >
      {disabled ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
      {label}
    </button>
  );
};

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await testDriveService.getAll();
      setBookings(res.data.data);
    } catch {
      toast.error('Could not load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleStatusUpdate = async (id, status) => {
    setUpdatingId(id);
    try {
      await testDriveService.updateStatus(id, status);
      toast.success(`Booking marked as ${status}`);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  // Stats
  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  const filtered = bookings.filter((b) => {
    const matchFilter = filter === 'all' || b.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      b.car?.name?.toLowerCase().includes(q) ||
      b.car?.brand?.toLowerCase().includes(q) ||
      b.user?.name?.toLowerCase().includes(q) ||
      b.user?.email?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gray-50 dark:bg-dark-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between py-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white">Test Drive Bookings</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{bookings.length} total bookings</p>
            </div>
          </div>
          <button
            onClick={fetchBookings}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-dark-200 border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { key: 'pending',   label: 'Pending',   color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
            { key: 'confirmed', label: 'Confirmed', color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { key: 'completed', label: 'Completed', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { key: 'cancelled', label: 'Cancelled', color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-900/20' },
          ].map(({ key, label, color, bg }) => (
            <button
              key={key}
              onClick={() => setFilter(filter === key ? 'all' : key)}
              className={`card p-4 text-left transition-all hover:shadow-md ${filter === key ? 'ring-2 ring-primary-500' : ''}`}
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
              <p className={`text-3xl font-black mt-1 ${color}`}>{counts[key] || 0}</p>
              <div className={`mt-2 h-1 rounded-full ${bg}`} />
            </button>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by car name, brand, customer name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 w-full"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                  filter === f
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-dark-200 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10'
                }`}
              >
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Table / Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <CalendarDays className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No bookings found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {search ? 'Try a different search query.' : 'No bookings in this category yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filtered.map((booking, idx) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="card overflow-hidden"
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Car image */}
                    <div className="lg:w-36 h-28 lg:h-auto bg-gray-100 dark:bg-dark-300 flex-shrink-0 overflow-hidden">
                      <img
                        src={
                          booking.car?.image
                            ? `/uploads/${booking.car.image}`
                            : `https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&q=80`
                        }
                        alt={booking.car?.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&q=80'; }}
                      />
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <Car className="w-4 h-4 text-primary-500" />
                            <span className="font-bold text-gray-900 dark:text-white">
                              {booking.car?.name || 'Unknown Car'}
                            </span>
                            <span className="text-xs text-gray-400">#{booking._id.slice(-6).toUpperCase()}</span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {booking.car?.brand} · {booking.car?.model}
                          </p>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>

                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                        {/* Customer */}
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-primary-500 flex-shrink-0" />
                          <span className="font-medium">{booking.user?.name || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-primary-500 flex-shrink-0" />
                          <span className="truncate">{booking.user?.email || '—'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-primary-500 flex-shrink-0" />
                          <span>{booking.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary-500 flex-shrink-0" />
                          <span>
                            {new Date(booking.preferredDate).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary-500 flex-shrink-0" />
                          <span>{booking.preferredTime}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          Booked: {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                        </div>
                      </div>

                      {booking.notes && (
                        <p className="text-xs text-gray-400 italic mb-3 pl-3 border-l-2 border-gray-200 dark:border-white/10">
                          "{booking.notes}"
                        </p>
                      )}

                      {/* Action Buttons — based on current status */}
                      <div className="flex flex-wrap gap-2">
                        {booking.status === 'pending' && (
                          <>
                            <ActionButton
                              onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                              disabled={updatingId === booking._id}
                              icon={Check}
                              label="Confirm"
                              variant="confirm"
                            />
                            <ActionButton
                              onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                              disabled={updatingId === booking._id}
                              icon={X}
                              label="Cancel"
                              variant="cancel"
                            />
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <>
                            <ActionButton
                              onClick={() => handleStatusUpdate(booking._id, 'completed')}
                              disabled={updatingId === booking._id}
                              icon={CheckCircle}
                              label="Mark Complete (Release)"
                              variant="complete"
                            />
                            <ActionButton
                              onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                              disabled={updatingId === booking._id}
                              icon={X}
                              label="Cancel"
                              variant="cancel"
                            />
                          </>
                        )}
                        {(booking.status === 'completed' || booking.status === 'cancelled') && (
                          <span className="text-xs text-gray-400 italic py-1.5">
                            {booking.status === 'completed'
                              ? '✅ Test drive completed & slot released'
                              : '❌ Booking was cancelled'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookingsPage;
