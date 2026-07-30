import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart, Fuel, Settings, Gauge,
  Tag, Star, MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import CompareButton from './CompareButton';
import { toast } from 'react-toastify';

const statusColors = {
  available: 'badge-green',
  out_of_stock: 'badge-red',
  discontinued: 'badge-amber',
};

const statusLabels = {
  available: 'In Stock',
  out_of_stock: 'Out of Stock',
  discontinued: 'Discontinued',
};

const CarCard = ({ car, onPurchase, index = 0 }) => {
  const { isAuthenticated, user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(car._id);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated()) {
      toast.info('Please login to add to wishlist');
      return;
    }
    toggleWishlist(car);
    toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist! ❤️');
  };



  const imageUrl = car.image
    ? `/uploads/${car.image}`
    : `https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/cars/${car._id}`} className="block group">
        <div className="card overflow-hidden h-full">
          {/* Image */}
          <div className="relative h-52 overflow-hidden bg-gray-100 dark:bg-dark-300">
            <img
              src={imageUrl}
              alt={car.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.target.src = `https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=80`;
              }}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Status badge */}
            <div className="absolute top-3 left-3">
              <span className={statusColors[car.status]}>
                {statusLabels[car.status]}
              </span>
            </div>

            {/* Wishlist button */}
            <motion.button
              onClick={handleWishlist}
              whileTap={{ scale: 0.8 }}
              className={`absolute top-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                inWishlist
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'bg-white/90 dark:bg-dark-100/90 text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
            </motion.button>

            {/* Year badge */}
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
              {car.year}
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Brand + Name */}
            <div className="mb-3">
              <p className="text-xs font-semibold text-primary-500 uppercase tracking-wider mb-1">
                {car.brand}
              </p>
              <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                {car.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{car.model}</p>
            </div>

            {/* Specs row */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { Icon: Fuel, label: car.fuelType },
                { Icon: Settings, label: car.transmission.slice(0, 4) },
                { Icon: Gauge, label: `${car.horsepower} hp` },
              ].map(({ Icon, label }, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1 p-2 bg-gray-50 dark:bg-white/5 rounded-lg"
                >
                  <Icon className="w-3.5 h-3.5 text-primary-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400 text-center">{label}</span>
                </div>
              ))}
            </div>

            {/* Category + Stock */}
            <div className="flex items-center justify-between mb-4">
              <span className="badge-blue text-xs">{car.category}</span>
              <span className={`text-xs font-medium ${car.stockQuantity > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                {car.stockQuantity > 0 ? `${car.stockQuantity} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Price + Action */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Starting at</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${car.price.toLocaleString()}
                </p>
              </div>
              <div
                className="flex items-center gap-2"
                onClick={(e) => e.preventDefault()}
              >
                <CompareButton car={car} />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CarCard;
