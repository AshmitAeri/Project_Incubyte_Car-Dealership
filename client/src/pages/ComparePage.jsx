import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, GitCompare, CheckCircle, XCircle,
  Fuel, Settings, Gauge, Calendar, Zap, Tag, Package, DollarSign, Box
} from 'lucide-react';
import { carService } from '../services/carService';

const FieldRow = ({ label, icon: Icon, val1, val2, numeric = false }) => {
  const isBetter = (a, b) => {
    if (!numeric) return false;
    const na = parseFloat(String(a).replace(/[^0-9.]/g, ''));
    const nb = parseFloat(String(b).replace(/[^0-9.]/g, ''));
    return !isNaN(na) && !isNaN(nb) && na > nb;
  };

  const color1 = numeric && isBetter(val1, val2)
    ? 'text-emerald-600 dark:text-emerald-400 font-bold'
    : 'text-gray-900 dark:text-white';
  const color2 = numeric && isBetter(val2, val1)
    ? 'text-emerald-600 dark:text-emerald-400 font-bold'
    : 'text-gray-900 dark:text-white';

  return (
    <tr className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/2 transition-colors">
      <td className="py-3 px-4 text-left">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
          {Icon && <Icon className="w-4 h-4 text-primary-500 flex-shrink-0" />}
          {label}
        </div>
      </td>
      <td className={`py-3 px-4 text-center text-sm ${color1}`}>{val1 ?? '—'}</td>
      <td className={`py-3 px-4 text-center text-sm ${color2}`}>{val2 ?? '—'}</td>
    </tr>
  );
};

const ComparePage = () => {
  const [searchParams] = useSearchParams();
  const car1Id = searchParams.get('car1');
  const car2Id = searchParams.get('car2');

  const [car1, setCar1] = useState(null);
  const [car2, setCar2] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!car1Id || !car2Id) {
      setError('Two car IDs are required to compare.');
      setLoading(false);
      return;
    }
    Promise.all([carService.getCarById(car1Id), carService.getCarById(car2Id)])
      .then(([r1, r2]) => {
        setCar1(r1.data.data);
        setCar2(r2.data.data);
      })
      .catch(() => setError('Could not load one or both cars.'))
      .finally(() => setLoading(false));
  }, [car1Id, car2Id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !car1 || !car2) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <GitCompare className="w-16 h-16 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{error || 'Cars not found'}</h2>
        <p className="text-gray-500">Go to any car page and click "Compare" to select two cars.</p>
        <Link to="/cars" className="btn-primary">Browse Cars</Link>
      </div>
    );
  }

  const getImg = (car) =>
    car.image
      ? `/uploads/${car.image}`
      : `https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80`;

  const winner = (field, higherIsBetter = true) => {
    const v1 = car1[field];
    const v2 = car2[field];
    if (v1 == null || v2 == null) return null;
    if (v1 === v2) return 'tie';
    if (higherIsBetter) return v1 > v2 ? 'car1' : 'car2';
    return v1 < v2 ? 'car1' : 'car2'; // lower is better (e.g. price)
  };

  const priceWinner = winner('price', false); // cheaper is better
  const hpWinner = winner('horsepower');
  const mileageWinner = winner('mileage');
  const stockWinner = winner('stockQuantity');

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gray-50 dark:bg-dark-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 py-6">
          <Link to="/cars" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Cars
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
              <GitCompare className="w-4 h-4" /> Car Comparison
            </div>
            <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white">
              {car1.name} <span className="text-gray-300 dark:text-gray-600 font-light">vs</span> {car2.name}
            </h1>
          </div>

          {/* Car Image Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[{ car: car1, label: 'Car A', winner: 'car1' }, { car: car2, label: 'Car B', winner: 'car2' }].map(({ car, label, winner: w }) => (
              <div key={car._id} className="card overflow-hidden">
                <div className="relative h-44 bg-gray-100 dark:bg-dark-300">
                  <img
                    src={getImg(car)}
                    alt={car.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=80'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <p className="text-white font-black text-lg leading-tight">{car.name}</p>
                    <p className="text-white/70 text-xs">{car.brand} · {car.year}</p>
                  </div>
                </div>
                <div className="p-4 text-center">
                  <p className="text-2xl font-black text-gray-900 dark:text-white">${car.price.toLocaleString()}</p>
                  <p className={`text-xs font-semibold mt-1 ${car.stockQuantity > 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                    {car.stockQuantity > 0 ? `${car.stockQuantity} in stock` : 'Out of stock'}
                  </p>
                  <Link to={`/cars/${car._id}`} className="mt-3 inline-block btn-primary text-xs py-1.5 px-4">View Details</Link>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-primary-600 px-6 py-4">
              <div className="grid grid-cols-3">
                <p className="text-white/70 text-sm font-semibold">Specification</p>
                <p className="text-white text-sm font-bold text-center">{car1.name}</p>
                <p className="text-white text-sm font-bold text-center">{car2.name}</p>
              </div>
            </div>

            <table className="w-full">
              <tbody>
                <FieldRow label="Price" icon={DollarSign} val1={`$${car1.price.toLocaleString()}`} val2={`$${car2.price.toLocaleString()}`} />
                <FieldRow label="Brand" icon={Tag} val1={car1.brand} val2={car2.brand} />
                <FieldRow label="Category" icon={Tag} val1={car1.category} val2={car2.category} />
                <FieldRow label="Year" icon={Calendar} val1={car1.year} val2={car2.year} />
                <FieldRow label="Fuel Type" icon={Fuel} val1={car1.fuelType} val2={car2.fuelType} />
                <FieldRow label="Transmission" icon={Settings} val1={car1.transmission} val2={car2.transmission} />
                <FieldRow label="Engine" icon={Package} val1={car1.engine} val2={car2.engine} />
                <FieldRow label="Horsepower" icon={Zap} val1={`${car1.horsepower} HP`} val2={`${car2.horsepower} HP`} numeric />
                <FieldRow label="Mileage" icon={Gauge} val1={`${car1.mileage} km/l`} val2={`${car2.mileage} km/l`} numeric />
                <FieldRow label="Color" icon={Palette} val1={car1.color} val2={car2.color} />
                <FieldRow label="Stock" icon={Box} val1={`${car1.stockQuantity} units`} val2={`${car2.stockQuantity} units`} numeric />
                <FieldRow label="Rating" icon={Star} val1={car1.averageRating > 0 ? `${car1.averageRating} ★` : 'No ratings'} val2={car2.averageRating > 0 ? `${car2.averageRating} ★` : 'No ratings'} numeric />
              </tbody>
            </table>
          </div>

          {/* Verdict */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {[
              { label: 'Better Value', winner: priceWinner, reason: 'Lower price', icon: DollarSign },
              { label: 'More Power', winner: hpWinner, reason: 'Higher horsepower', icon: Zap },
              { label: 'Better Mileage', winner: mileageWinner, reason: 'Higher fuel efficiency', icon: Gauge },
              { label: 'Availability', winner: stockWinner, reason: 'More units in stock', icon: Box },
            ].map(({ label, winner: w, reason, icon: Icon }) => {
              const winnerCar = w === 'car1' ? car1 : w === 'car2' ? car2 : null;
              return (
                <div key={label} className="card p-4 flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{label}</p>
                    {winnerCar ? (
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{winnerCar.name}</p>
                    ) : (
                      <p className="font-bold text-gray-400 text-sm">Tie</p>
                    )}
                    <p className="text-xs text-emerald-500">{winnerCar ? reason : '—'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Add missing icon imports inline
const Palette = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
  </svg>
);

const Star = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default ComparePage;
