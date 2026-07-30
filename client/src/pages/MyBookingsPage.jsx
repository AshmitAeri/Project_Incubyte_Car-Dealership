import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Calendar, Clock, Phone, Car, FileText, XCircle,
  CheckCircle, AlertCircle, Loader2, CalendarDays, Info
} from 'lucide-react';
import { testDriveService } from '../services/testDriveService';
import { toast } from 'react-toastify';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',   icon: AlertCircle },
  confirmed: { label: 'Confirmed', cls: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',       icon: CheckCircle },
  completed: { label: 'Completed', cls: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300', icon: CheckCircle },
  cancelled: { label: 'Cancelled', cls: 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400',           icon: XCircle },
};

const StatusBadge = ({ status }) => {
  const { label, cls, icon: Icon } = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </span>
  );
};

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchBookings = async () => {
    try {
      const res = await testDriveService.getMine();
      setBookings(res.data.data);
    } catch {
      toast.error('Could not load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this test drive booking?')) return;
    setCancellingId(id);
    try {
      await testDriveService.cancel(id);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gray-50 dark:bg-dark-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-11 h-11 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white">My Bookings</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">All your test drive bookings</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-all ${
                filter === f
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white dark:bg-dark-200 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:border-primary-400'
              }`}
            >
              {f === 'all' ? `All (${bookings.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${bookings.filter(b => b.status === f).length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <CalendarDays className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {filter === 'all' && 'Head to any car page and book a test drive!'}
            </p>
            {filter === 'all' && (
              <Link to="/cars" className="btn-primary inline-flex items-center gap-2">
                <Car className="w-4 h-4" /> Browse Cars
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filtered.map((booking, idx) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="card overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Car image / thumbnail */}
                    <div className="sm:w-40 h-32 sm:h-auto bg-gray-100 dark:bg-dark-300 flex-shrink-0 relative overflow-hidden">
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <Link
                            to={`/cars/${booking.car?._id}`}
                            className="font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          >
                            {booking.car?.name || 'Unknown Car'}
                          </Link>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {booking.car?.brand} · {booking.car?.model}
                          </p>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary-500 flex-shrink-0" />
                          {new Date(booking.preferredDate).toLocaleDateString('en-IN', {
                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary-500 flex-shrink-0" />
                          {booking.preferredTime}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-primary-500 flex-shrink-0" />
                          {booking.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary-500 flex-shrink-0" />
                          Booked on {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 rounded-xl p-3 mb-3">
                          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{booking.notes}</span>
                        </div>
                      )}

                      {/* Actions */}
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <button
                          onClick={() => handleCancel(booking._id)}
                          disabled={cancellingId === booking._id}
                          className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium disabled:opacity-50 transition-colors"
                        >
                          {cancellingId === booking._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          Cancel Booking
                        </button>
                      )}
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

export default MyBookingsPage;
