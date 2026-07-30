import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, Trash2, PlusCircle, ChevronDown, ChevronUp, ShoppingBag, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { reviewService } from '../services/reviewService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const StarSelector = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button
        key={s}
        type="button"
        onClick={() => onChange(s)}
        className={`text-2xl transition-transform hover:scale-125 ${s <= value ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
      >
        ★
      </button>
    ))}
  </div>
);

const StarDisplay = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={`text-base ${s <= Math.round(rating) ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}>★</span>
    ))}
  </div>
);

const ReviewsSection = ({ carId, averageRating = 0, reviewCount = 0 }) => {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ rating: 0, title: '', body: '', pros: '', cons: '' });

  // Eligibility state
  const [canReview, setCanReview] = useState(false);
  const [canReviewReason, setCanReviewReason] = useState('');
  const [eligibilityChecked, setEligibilityChecked] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await reviewService.getByCarId(carId);
      setReviews(res.data.data);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async () => {
    if (!isAuthenticated()) return;
    try {
      const res = await reviewService.checkCanReview(carId);
      setCanReview(res.data.canReview);
      setCanReviewReason(res.data.reason || '');
    } catch {
      setCanReview(false);
    } finally {
      setEligibilityChecked(true);
    }
  };

  useEffect(() => {
    if (carId) {
      fetchReviews();
      checkEligibility();
    }
  }, [carId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) { toast.error('Please select a rating'); return; }
    if (!form.title.trim() || !form.body.trim()) { toast.error('Title and review are required'); return; }
    setSubmitting(true);
    try {
      await reviewService.create(carId, {
        rating: form.rating,
        title: form.title,
        body: form.body,
        pros: form.pros ? form.pros.split(',').map((s) => s.trim()).filter(Boolean) : [],
        cons: form.cons ? form.cons.split(',').map((s) => s.trim()).filter(Boolean) : [],
      });
      toast.success('Review submitted! ⭐');
      setForm({ rating: 0, title: '', body: '', pros: '', cons: '' });
      setShowForm(false);
      setCanReview(false);
      setCanReviewReason('You have already reviewed this car.');
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      await reviewService.delete(carId, reviewId);
      toast.success('Review deleted');
      fetchReviews();
      // Re-check eligibility after deletion (user may be able to re-review)
      checkEligibility();
    } catch {
      toast.error('Could not delete review');
    }
  };

  // Determine what to show for the write-review section
  const renderWriteReviewSection = () => {
    if (!isAuthenticated()) {
      return (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 text-sm text-gray-500 dark:text-gray-400">
          <Lock className="w-4 h-4 flex-shrink-0" />
          <span>Please <strong>log in</strong> and purchase this car to write a review.</span>
        </div>
      );
    }

    if (eligibilityChecked && !canReview) {
      const isPurchaseRequired = canReviewReason.includes('purchase');
      const alreadyReviewed = canReviewReason.includes('already reviewed');
      const isAdminBlock = canReviewReason.includes('Admin');

      if (isAdminBlock) return null; // Admins see no message at all

      return (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border text-sm ${
          alreadyReviewed
            ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
            : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
        }`}>
          {alreadyReviewed ? (
            <><Star className="w-4 h-4 flex-shrink-0" /> You've already reviewed this car. Thank you! ⭐</>
          ) : (
            <><ShoppingBag className="w-4 h-4 flex-shrink-0" /> Only verified buyers can review. Purchase this car to share your experience.</>
          )}
        </div>
      );
    }

    if (canReview) {
      return (
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 font-semibold hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          Write a Review
        </button>
      );
    }

    return null;
  };

  return (
    <div className="mt-8">
      {/* Section Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 bg-gray-50 dark:bg-white/5 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/8 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
            <Star className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-left">
            <p className="font-bold text-gray-900 dark:text-white">Customer Reviews</p>
            <div className="flex items-center gap-2">
              <StarDisplay rating={averageRating} />
              <span className="text-sm text-gray-500">
                {averageRating > 0 ? `${averageRating} · ` : ''}
                {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                <span className="ml-2 text-xs text-amber-600 dark:text-amber-400 font-medium">· Verified Buyers Only</span>
              </span>
            </div>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-4">
              {/* Write Review Section */}
              {renderWriteReviewSection()}

              {/* Review Form */}
              <AnimatePresence>
                {showForm && canReview && (
                  <motion.form
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleSubmit}
                    className="card p-5 space-y-4 border border-amber-200 dark:border-amber-800"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <ShoppingBag className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Verified Purchase ✓</span>
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Your Review</h4>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Rating *</label>
                      <StarSelector value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Title *</label>
                      <input
                        type="text"
                        placeholder="Summarize your experience"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="input-field"
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Review *</label>
                      <textarea
                        placeholder="Share the details of your experience..."
                        value={form.body}
                        onChange={(e) => setForm({ ...form, body: e.target.value })}
                        rows={3}
                        className="input-field resize-none"
                        maxLength={1000}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          <ThumbsUp className="w-3.5 h-3.5 inline text-emerald-500 mr-1" />Pros (comma separated)
                        </label>
                        <input
                          type="text"
                          placeholder="Great engine, Smooth ride"
                          value={form.pros}
                          onChange={(e) => setForm({ ...form, pros: e.target.value })}
                          className="input-field text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          <ThumbsDown className="w-3.5 h-3.5 inline text-red-400 mr-1" />Cons (comma separated)
                        </label>
                        <input
                          type="text"
                          placeholder="High price, Poor mileage"
                          value={form.cons}
                          onChange={(e) => setForm({ ...form, cons: e.target.value })}
                          className="input-field text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                      <button type="submit" disabled={submitting} className="btn-primary flex-1 bg-amber-500 hover:bg-amber-600">
                        {submitting ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Reviews List */}
              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => <div key={i} className="h-24 bg-gray-100 dark:bg-white/5 rounded-2xl animate-pulse" />)}
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Star className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="font-medium">No reviews yet</p>
                  <p className="text-sm mt-1">Verified buyers can share their experience here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <motion.div
                      key={review._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={review.user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user?.name || 'U')}&background=6366f1&color=fff`}
                            alt={review.user?.name}
                            className="w-9 h-9 rounded-full object-cover"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-gray-900 dark:text-white text-sm">{review.user?.name}</p>
                              {/* Verified buyer badge */}
                              <span className="text-xs px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full font-medium">
                                ✓ Verified
                              </span>
                            </div>
                            <StarDisplay rating={review.rating} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          {user && (review.user?._id === user._id || review.user?.id === user._id || user.role === 'admin') && (
                            <button
                              onClick={() => handleDelete(review._id)}
                              className="w-7 h-7 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{review.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">{review.body}</p>
                      </div>

                      {(review.pros?.length > 0 || review.cons?.length > 0) && (
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          {review.pros?.length > 0 && (
                            <div>
                              <p className="text-xs text-emerald-600 font-semibold mb-1">👍 Pros</p>
                              <div className="flex flex-wrap gap-1">
                                {review.pros.map((p) => (
                                  <span key={p} className="text-xs px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-full">{p}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {review.cons?.length > 0 && (
                            <div>
                              <p className="text-xs text-red-500 font-semibold mb-1">👎 Cons</p>
                              <div className="flex flex-wrap gap-1">
                                {review.cons.map((c) => (
                                  <span key={c} className="text-xs px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full">{c}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReviewsSection;
