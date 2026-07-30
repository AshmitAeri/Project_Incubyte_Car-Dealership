import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Star, ExternalLink, ThumbsUp, ThumbsDown,
  CheckCircle, PlusCircle, Loader2, X, Calendar, DollarSign,
  Package, AlertCircle,
} from 'lucide-react';
import api from '../services/api';
import { reviewService } from '../services/reviewService';
import { toast } from 'react-toastify';

// ─── Star Selector ─────────────────────────────────────────────────────────
const StarSelector = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button
        key={s}
        type="button"
        onClick={() => onChange(s)}
        className={`text-2xl transition-all hover:scale-125 ${
          s <= value ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'
        }`}
      >
        ★
      </button>
    ))}
  </div>
);

// ─── Star Display ───────────────────────────────────────────────────────────
const StarDisplay = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={`text-sm ${s <= rating ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}>
        ★
      </span>
    ))}
  </div>
);

// ─── Inline Review Form Modal ───────────────────────────────────────────────
const ReviewModal = ({ isOpen, onClose, car, onSubmitted }) => {
  const [form, setForm] = useState({ rating: 0, title: '', body: '', pros: '', cons: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) { toast.error('Please select a rating'); return; }
    if (!form.title.trim() || !form.body.trim()) { toast.error('Title and review are required'); return; }

    setSubmitting(true);
    try {
      await reviewService.create(car._id, {
        rating: form.rating,
        title: form.title,
        body: form.body,
        pros: form.pros ? form.pros.split(',').map((s) => s.trim()).filter(Boolean) : [],
        cons: form.cons ? form.cons.split(',').map((s) => s.trim()).filter(Boolean) : [],
      });
      toast.success('Review submitted! ⭐ Thank you!');
      setForm({ rating: 0, title: '', body: '', pros: '', cons: '' });
      onSubmitted();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white dark:bg-dark-200 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span className="font-bold text-lg">Write a Review</span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-white/80 text-sm font-medium">{car?.name}</p>
            <div className="mt-1 inline-flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-0.5 text-xs">
              <CheckCircle className="w-3 h-3" /> Verified Purchase
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Overall Rating *
              </label>
              <StarSelector value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
              {form.rating > 0 && (
                <p className="text-xs text-amber-500 mt-1">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][form.rating]}
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Review Title *
              </label>
              <input
                type="text"
                placeholder="Summarize your experience in a few words"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-field"
                maxLength={100}
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Your Review *
              </label>
              <textarea
                placeholder="Share your detailed experience with this car..."
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={3}
                className="input-field resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-gray-400 mt-1">{form.body.length}/1000</p>
            </div>

            {/* Pros & Cons */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1.5">
                  <ThumbsUp className="w-3.5 h-3.5 inline mr-1" />Pros
                </label>
                <input
                  type="text"
                  placeholder="Smooth ride, Great mileage"
                  value={form.pros}
                  onChange={(e) => setForm({ ...form, pros: e.target.value })}
                  className="input-field text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">Comma separated</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-red-500 mb-1.5">
                  <ThumbsDown className="w-3.5 h-3.5 inline mr-1" />Cons
                </label>
                <input
                  type="text"
                  placeholder="Expensive, Loud engine"
                  value={form.cons}
                  onChange={(e) => setForm({ ...form, cons: e.target.value })}
                  className="input-field text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">Comma separated</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-all disabled:opacity-60"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                ) : (
                  <><Star className="w-4 h-4" /> Submit Review</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ─── Purchase Card ──────────────────────────────────────────────────────────
const PurchaseCard = ({ purchase, onReviewSubmitted }) => {
  const [reviewModal, setReviewModal] = useState(false);
  const [myReview, setMyReview] = useState(null);
  const [loadingReview, setLoadingReview] = useState(true);

  const car = purchase.car;

  // Check if user has already reviewed this car
  const checkReview = async () => {
    if (!car?._id) return;
    setLoadingReview(true);
    try {
      const res = await reviewService.checkCanReview(car._id);
      if (!res.data.canReview && res.data.reason?.includes('already reviewed')) {
        // Fetch the actual reviews to find theirs
        const reviewsRes = await reviewService.getByCarId(car._id);
        setMyReview(reviewsRes.data.data[0] || null);
      } else {
        setMyReview(null);
      }
    } catch {
      setMyReview(null);
    } finally {
      setLoadingReview(false);
    }
  };

  useEffect(() => { checkReview(); }, [car?._id]);

  const handleReviewSubmitted = () => {
    checkReview();
    onReviewSubmitted?.();
  };

  const imageUrl = car?.image
    ? `/uploads/${car.image}`
    : `https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden flex flex-col sm:flex-row group hover:shadow-lg transition-shadow"
    >
      {/* Car Image */}
      <div className="sm:w-48 h-36 sm:h-auto flex-shrink-0 bg-gray-100 dark:bg-dark-300 overflow-hidden relative">
        <img
          src={imageUrl}
          alt={car?.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=80'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {/* Verified badge */}
        <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 bg-emerald-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
          <CheckCircle className="w-3 h-3" /> Purchased
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          {/* Car info */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-xs font-semibold text-primary-500 uppercase tracking-wider mb-0.5">
                {car?.brand}
              </p>
              <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white leading-tight">
                {car?.name || 'Unknown Car'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{car?.model}</p>
            </div>
            <Link
              to={`/cars/${car?._id}`}
              className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline flex-shrink-0"
            >
              View <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Purchase stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 text-center">
              <DollarSign className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
              <p className="text-xs text-gray-400">Paid</p>
              <p className="font-bold text-sm text-gray-900 dark:text-white">
                ${purchase.totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 text-center">
              <Package className="w-4 h-4 text-blue-500 mx-auto mb-1" />
              <p className="text-xs text-gray-400">Units</p>
              <p className="font-bold text-sm text-gray-900 dark:text-white">{purchase.quantity}</p>
            </div>
            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 text-center">
              <Calendar className="w-4 h-4 text-purple-500 mx-auto mb-1" />
              <p className="text-xs text-gray-400">Purchased</p>
              <p className="font-bold text-sm text-gray-900 dark:text-white">
                {new Date(purchase.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mb-4 flex items-center justify-between bg-gray-50 dark:bg-white/5 rounded-xl p-3">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Payment Method</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {purchase.paymentMethod === 'emi' ? 'EMI / Finance' : 'Full Payment'}
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  purchase.paymentStatus === 'active_emi' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                }`}>
                  {purchase.paymentStatus === 'active_emi' ? 'ACTIVE EMI' : 'COMPLETED'}
                </span>
              </p>
            </div>
            {purchase.paymentMethod === 'emi' && purchase.emiDetails && (
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-0.5">EMI Details</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  ${purchase.emiDetails.monthlyEMI?.toLocaleString()}/mo <span className="text-xs font-normal text-gray-500">for {purchase.emiDetails.tenure} mos</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Review Section */}
        <div className="border-t border-gray-100 dark:border-white/10 pt-4">
          {loadingReview ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" /> Checking review status...
            </div>
          ) : myReview ? (
            /* Already reviewed */
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <StarDisplay rating={myReview.rating} />
                <span className="text-xs text-gray-400">Your review</span>
                <span className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full font-medium">
                  ✓ Submitted
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">"{myReview.title}"</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{myReview.body}</p>
              <Link
                to={`/cars/${car?._id}#reviews`}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
              >
                View on car page →
              </Link>
            </div>
          ) : (
            /* Can write review */
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Share your experience with this car
              </p>
              <button
                onClick={() => setReviewModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm hover:shadow-md flex-shrink-0"
              >
                <PlusCircle className="w-4 h-4" /> Write Review
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModal}
        onClose={() => setReviewModal(false)}
        car={car}
        onSubmitted={handleReviewSubmitted}
      />
    </motion.div>
  );
};

// ─── Main Page ──────────────────────────────────────────────────────────────
const MyPurchasesPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory/purchases');
      // Deduplicate: one entry per car (show latest purchase)
      const seen = new Set();
      const unique = res.data.data.filter((p) => {
        if (!p.car?._id || seen.has(p.car._id.toString())) return false;
        seen.add(p.car._id.toString());
        return true;
      });
      setPurchases(unique);
    } catch {
      toast.error('Could not load your purchases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPurchases(); }, []);

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gray-50 dark:bg-dark-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-11 h-11 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white">My Purchases</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Cars you've purchased — leave a review for each one
              </p>
            </div>
          </div>
        </div>

        {/* Summary Banner */}
        {!loading && purchases.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-emerald-800 dark:text-emerald-300">
                {purchases.length} car{purchases.length !== 1 ? 's' : ''} purchased
              </p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                You can write a verified review for each car you've bought
              </p>
            </div>
          </motion.div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No purchases yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Once you purchase a car, it will appear here and you can leave a review.
            </p>
            <Link to="/cars" className="btn-primary inline-flex items-center gap-2">
              Browse Cars
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {purchases.map((purchase, idx) => (
              <PurchaseCard
                key={purchase._id}
                purchase={purchase}
                onReviewSubmitted={fetchPurchases}
              />
            ))}

            {/* Info note */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm">
              <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-blue-700 dark:text-blue-300">
                Reviews are <strong>verified purchase only</strong>. Your review will be visible on the car's detail page and helps other buyers make informed decisions.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPurchasesPage;
