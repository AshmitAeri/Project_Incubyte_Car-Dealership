import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Heart, ShoppingCart, Share2, Fuel, Settings,
  Gauge, Calendar, Palette, Zap, Package, Tag, Edit, Trash2,
  CheckCircle, XCircle, Car, Bell, BellOff,
} from 'lucide-react';
import { carService } from '../services/carService';
import { preBookingService } from '../services/preBookingService';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import ConfirmDialog from '../components/ConfirmDialog';
import TestDriveModal from '../components/TestDriveModal';
import EMIModal from '../components/EMIModal';
import ServiceCentersSection from '../components/ServiceCentersSection';
import ReviewsSection from '../components/ReviewsSection';
import CompareButton from '../components/CompareButton';
import { toast } from 'react-toastify';

const StatusBadge = ({ status }) => {
  const config = {
    available: { label: 'In Stock', cls: 'badge-green', Icon: CheckCircle },
    out_of_stock: { label: 'Out of Stock', cls: 'badge-red', Icon: XCircle },
    discontinued: { label: 'Discontinued', cls: 'badge-amber', Icon: XCircle },
  };
  const { label, cls, Icon } = config[status] || config.available;
  return (
    <span className={`${cls} flex items-center gap-1.5`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </span>
  );
};

const SpecItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
      <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
    </div>
    <div>
      <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
      <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const StarDisplay = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={`text-sm ${s <= Math.round(rating) ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}>★</span>
    ))}
    {rating > 0 && <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>}
  </div>
);

const CarDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [emiDialog, setEmiDialog] = useState(false);
  const [testDriveModal, setTestDriveModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  // Pre-booking state
  const [hasPreBooking, setHasPreBooking] = useState(false);
  const [preBookingLoading, setPreBookingLoading] = useState(false);

  const fetchCar = () =>
    carService.getCarById(id)
      .then((res) => setCar(res.data.data))
      .catch(() => toast.error('Car not found'))
      .finally(() => setLoading(false));

  useEffect(() => { fetchCar(); }, [id]);

  useEffect(() => {
    if (car && isAuthenticated() && car.stockQuantity === 0) {
      preBookingService.check(id)
        .then((res) => setHasPreBooking(res.data.hasPreBooking))
        .catch(() => {});
    }
  }, [car, id]);

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      await carService.deleteCar(id);
      toast.success('Car deleted successfully');
      navigate('/cars');
    } catch {
      toast.error('Delete failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePreBooking = async () => {
    if (!isAuthenticated()) { toast.info('Please login to join the waitlist'); return; }
    setPreBookingLoading(true);
    try {
      if (hasPreBooking) {
        await preBookingService.cancel(id);
        setHasPreBooking(false);
        toast.success('Removed from waitlist');
      } else {
        await preBookingService.create(id);
        setHasPreBooking(true);
        toast.success("You're on the waitlist! We'll notify you when it's available 🔔");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setPreBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center gap-4">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">Car not found</p>
        <Link to="/cars" className="btn-primary">Back to Cars</Link>
      </div>
    );
  }

  const imageUrl = car.image
    ? `/uploads/${car.image}`
    : `https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80`;

  const inWishlist = isInWishlist(car._id);
  const isOutOfStock = car.stockQuantity === 0;

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 py-6 text-sm text-gray-500 dark:text-gray-400">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 hover:text-primary-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span>/</span>
          <Link to="/cars" className="hover:text-primary-600 transition-colors">Cars</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">{car.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Left — Image */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="relative h-80 lg:h-[420px] rounded-3xl overflow-hidden bg-gray-100 dark:bg-dark-300 shadow-xl">
              <img
                src={imageUrl}
                alt={car.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <div className="absolute top-4 left-4">
                <StatusBadge status={car.status} />
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                {/* Wishlist */}
                <button
                  onClick={() => { toggleWishlist(car); toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist! ❤️'); }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${inWishlist ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'}`}
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                </button>
                {/* Share */}
                <button
                  onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                  className="w-10 h-10 rounded-xl bg-white/90 text-gray-700 flex items-center justify-center hover:bg-gray-100"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right — Details */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">{car.brand}</p>
              <h1 className="text-4xl font-display font-black text-gray-900 dark:text-white mb-1">{car.name}</h1>
              <p className="text-gray-500 dark:text-gray-400">{car.model} · {car.year} · {car.color}</p>
              {/* Rating */}
              {car.reviewCount > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <StarDisplay rating={car.averageRating} />
                  <span className="text-xs text-gray-400">({car.reviewCount} {car.reviewCount === 1 ? 'review' : 'reviews'})</span>
                </div>
              )}
            </div>

            <div className="flex items-end gap-4">
              <div>
                <p className="text-sm text-gray-400">Starting Price</p>
                <p className="text-5xl font-black text-gray-900 dark:text-white">${car.price.toLocaleString()}</p>
              </div>
              <div className="pb-1">
                <span className={`${isOutOfStock ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'} font-medium`}>
                  {isOutOfStock ? 'Out of stock' : `${car.stockQuantity} units available`}
                </span>
              </div>
            </div>

            {car.description && (
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed border-l-4 border-primary-500 pl-4">
                {car.description}
              </p>
            )}

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-3">
              <SpecItem icon={Fuel} label="Fuel Type" value={car.fuelType} />
              <SpecItem icon={Settings} label="Transmission" value={car.transmission} />
              <SpecItem icon={Gauge} label="Mileage" value={`${car.mileage} km/l`} />
              <SpecItem icon={Zap} label="Horsepower" value={`${car.horsepower} HP`} />
              <SpecItem icon={Calendar} label="Year" value={car.year} />
              <SpecItem icon={Palette} label="Color" value={car.color} />
              <SpecItem icon={Tag} label="Category" value={car.category} />
              <SpecItem icon={Package} label="Engine" value={car.engine} />
            </div>

            {/* ── Action Buttons ── */}
            <div className="space-y-3 pt-2">
              {/* Row 1: Test Drive + Compare */}
              <div className="flex gap-3">
                <button
                  onClick={() => { if (!isAuthenticated()) { toast.info('Please login to book a test drive'); return; } setTestDriveModal(true); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-primary-500 text-primary-600 dark:text-primary-400 font-semibold text-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
                >
                  <Car className="w-4 h-4" /> Book Test Drive
                </button>
                <CompareButton car={car} />
              </div>

              {/* Row 2: Buy / Pre-book */}
              {!isOutOfStock ? (
                isAdmin() ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-100 dark:bg-white/5 border border-dashed border-gray-300 dark:border-white/10">
                    <ShoppingCart className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-400">Admins cannot purchase cars — only customers can buy.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center font-bold hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                      >−</button>
                      <span className="w-10 text-center font-bold text-gray-900 dark:text-white">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(car.stockQuantity, quantity + 1))}
                        className="w-10 h-10 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center font-bold hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                      >+</button>
                    </div>
                    <button
                      onClick={() => { if (!isAuthenticated()) { toast.info('Please login to purchase'); return; } setEmiDialog(true); }}
                      className="btn-primary flex items-center gap-2 justify-center flex-1 py-3"
                    >
                      <ShoppingCart className="w-5 h-5" /> Buy Now
                    </button>
                  </div>
                )
              ) : (
                /* Out of stock — pre-booking */
                <button
                  onClick={handlePreBooking}
                  disabled={preBookingLoading}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                    hasPreBooking
                      ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-2 border-orange-300'
                      : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100'
                  }`}
                >
                  {preBookingLoading ? (
                    <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  ) : hasPreBooking ? (
                    <><BellOff className="w-5 h-5" /> Remove from Waitlist</>
                  ) : (
                    <><Bell className="w-5 h-5" /> Notify When Available</>
                  )}
                </button>
              )}
            </div>

            {/* Admin actions */}
            {isAdmin() && (
              <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-white/10">
                <Link to={`/cars/${id}/edit`} className="btn-secondary flex items-center gap-2 flex-1 justify-center">
                  <Edit className="w-4 h-4" /> Edit Car
                </Link>
                <button onClick={() => setDeleteDialog(true)} className="btn-danger flex items-center gap-2 flex-1 justify-center">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Service Centers ── */}
        <ServiceCentersSection brand={car.brand} />

        {/* ── Reviews ── */}
        <ReviewsSection carId={car._id} averageRating={car.averageRating} reviewCount={car.reviewCount} />
      </div>

      {/* ── Modals ── */}
      <TestDriveModal isOpen={testDriveModal} onClose={() => setTestDriveModal(false)} car={car} />

      <EMIModal
        isOpen={emiDialog}
        onClose={() => setEmiDialog(false)}
        car={car}
        quantity={quantity}
        onSuccess={fetchCar}
      />

      <ConfirmDialog
        isOpen={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        loading={actionLoading}
        title="Delete Car"
        message={`Are you sure you want to permanently delete "${car.name}"? This action cannot be undone.`}
        confirmLabel="Delete Car"
        variant="danger"
      />
    </div>
  );
};

export default CarDetailPage;
